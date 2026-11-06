/* PACE · E2E · ESCAPE Y ATRÁS SOLO LOS ATIENDE LA CAPA DE ARRIBA (revisión de ChatGPT del 5 nov. 2026)
 * ====================================================================================================
 * `usePaceDialogo` (ui/Dialogo.jsx) ya hacía que, con dos diálogos, un Escape cerrara solo el de
 * arriba. Pero las sesiones de Respira y de Mueve/Estira escuchan Escape en `window` por su cuenta
 * y no miraban esa marca: con un aviso encima de la sesión, UN Escape cerraba el aviso y sacaba de
 * la sesión. El Atrás de Android es un Escape que sube por los mismos oyentes (ui/android.js).
 *
 * La regla: con algo encima de la sesión, el primer Escape (o Atrás) cierra solo eso; el segundo
 * aplica la salida de la sesión. Y mantener la tecla pulsada es UNA pulsación: sus repeticiones no
 * cuentan como un segundo Escape.
 *
 * El aviso que se pone encima es el de Logros, abierto por el evento de la shell
 * (`pace:open-achievements`): un `Modal` de la pila, como cualquier otro.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

const sesion = (page) => page.locator('[data-pace-session-root]');
const aviso = (page) => page.locator('[data-pace-modal-card]');

async function abrirRespira(page) {
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Box 4·4·4·4', exact: true }).click();
  const modal = overlaySuperior(page);
  if (await modal.getByRole('button', { name: 'Empezar sesión' }).count()) {
    await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  await expect(sesion(page).getByRole('button', { name: 'Empezar ahora' })).toBeVisible();
}

async function abrirMueve(page) {
  await page.getByRole('button', { name: /^Mueve/ }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate(() => [...document.querySelectorAll('[data-pace-lib-card="extra.desk.pushups"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click());
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar/i.test(x.textContent || '')).click();
  });
  await expect(sesion(page)).toBeVisible({ timeout: 20000 });
}

const SESIONES = { Respira: abrirRespira, Mueve: abrirMueve };

/* Las dos maneras de pedir «sal»: la tecla y el Atrás del móvil, que llega como un Escape. */
const SALIDAS = {
  Escape: (page) => page.keyboard.press('Escape'),
  'Atrás de Android': (page) => page.evaluate(() => window.paceAndroidAtras()),
};

test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

async function sesionConAviso(page, abrir) {
  await irAlArtefacto(page);
  await abrir(page);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-achievements')));
  await expect(aviso(page)).toBeVisible();
  await expect(sesion(page)).toHaveCount(1);
}

for (const [nombreSesion, abrir] of Object.entries(SESIONES)) {
  for (const [nombreSalida, salir] of Object.entries(SALIDAS)) {
    test(`${nombreSesion} · con un aviso encima, el primer «${nombreSalida}» cierra solo el aviso y el segundo sale`, async ({ page }) => {
      await sesionConAviso(page, abrir);

      await salir(page);
      await expect(aviso(page), 'el aviso no se cerró').toHaveCount(0);
      await page.waitForTimeout(300);
      await expect(sesion(page), 'un solo ' + nombreSalida + ' cerró el aviso Y sacó de la sesión').toHaveCount(1);

      await salir(page);
      await expect(sesion(page), 'el segundo ' + nombreSalida + ' no sale de la sesión').toHaveCount(0);
    });
  }

  test(`${nombreSesion} · mantener Escape con un aviso encima no cuenta como un segundo Escape`, async ({ page }) => {
    await sesionConAviso(page, abrir);

    await page.keyboard.down('Escape');
    await expect(aviso(page)).toHaveCount(0);
    for (let i = 0; i < 4; i++) await page.keyboard.down('Escape');   // repeticiones del teclado (e.repeat)
    await page.keyboard.up('Escape');
    await page.waitForTimeout(300);
    await expect(sesion(page), 'las repeticiones de una tecla mantenida sacaron de la sesión').toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(sesion(page)).toHaveCount(0);
  });

  test(`${nombreSesion} · sin nada encima, un Escape sigue saliendo de la sesión`, async ({ page }) => {
    await irAlArtefacto(page);
    await abrir(page);
    await page.keyboard.press('Escape');
    await expect(sesion(page)).toHaveCount(0);
  });
}
