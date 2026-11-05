/* PACE · E2E · MANTENER ESPACIO CUENTA UNA SOLA VEZ (revisión de ChatGPT del 5 nov. 2026)
 * =======================================================================================
 * Los atajos de teclado de las sesiones (Respira, y Mueve y Estira) respondían a cada `keydown` sin
 * mirar `e.repeat`: con la barra mantenida un momento, el teclado repite la tecla y la pausa alternaba
 * una vez por repetición. En Mueve, además, al pausar empezaba el 3, 2, 1 de volver y la repetición
 * siguiente lo cancelaba. Una pulsación física, un cambio. Y, como el resto de atajos de la app
 * (BreakMenu), Espacio no responde con Ctrl, Cmd o Alt ni a mitad de una composición (IME).
 *
 * Playwright marca `repeat` en un `keyboard.down` de una tecla que ya está pulsada, como el teclado.
 * Cada prueba mantiene la barra con DOS eventos (uno inicial y uno repetido) y con TRES: el par
 * devuelve el estado de antes, y un número impar parecería bien por casualidad.
 *
 * El reloj va instalado antes de `goto` y se avanza a mano.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

const sesion = (page) => page.locator('[data-pace-session-root]');

async function mantener(page, eventos) {
  for (let i = 0; i < eventos; i++) await page.keyboard.down('Space');
  await page.keyboard.up('Space');
}

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(12); }
}

/* Respira en marcha (pasada su preparación): su pie ofrece «Pausar» o «Reanudar». */
async function respiraEnMarcha(page) {
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Box 4·4·4·4', exact: true }).click();
  const modal = overlaySuperior(page);
  if (await modal.getByRole('button', { name: 'Empezar sesión' }).count()) {
    await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
  await segundos(page, 1);
  await expect(sesion(page).getByRole('button', { name: /Pausar/ })).toBeVisible();
}

test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

for (const eventos of [2, 3]) {
  test(`Respira · mantener Espacio (${eventos} eventos) pausa una vez y, en pausa, reanuda una vez`, async ({ page }) => {
    await respiraEnMarcha(page);

    await mantener(page, eventos);
    await expect(sesion(page).getByRole('button', { name: /Reanudar/ }), 'mantener Espacio no dejó la sesión pausada').toBeVisible();

    await mantener(page, eventos);
    await expect(sesion(page).getByRole('button', { name: /Pausar/ }), 'mantener Espacio en pausa no reanudó').toBeVisible();
    await expect(sesion(page).getByRole('button', { name: /Reanudar/ })).toHaveCount(0);
  });

  test(`Mueve · mantener Espacio (${eventos} eventos) pausa una vez y, en pausa, empieza UNA cuenta de volver`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
    await irAlArtefacto(page);
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
    await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
    await page.clock.runFor(5000);
    /* Una lectura, nada más soltar la tecla: la cuenta de volver dura 3 s y, esperando con `expect`, una
       que empezó y se canceló (o una que ya acabó sola) pasaría por buena. */
    const estado = async () => {
      await page.waitForTimeout(60);
      return page.evaluate(() => {
        const v = document.querySelector('[data-pace-v1-vuelta]');
        return { velo: !!document.querySelector('[data-pace-v1-velo]'), cuenta: !!v && getComputedStyle(v).visibility !== 'hidden' };
      });
    };
    expect(await estado()).toEqual({ velo: false, cuenta: false });

    await mantener(page, eventos);
    expect(await estado(), 'mantener Espacio debía dejar la sesión en pausa, sin cuenta de volver').toEqual({ velo: true, cuenta: false });

    await mantener(page, eventos);
    expect(await estado(), 'mantener Espacio en pausa debía empezar UNA cuenta de volver (empezó y se canceló)').toEqual({ velo: true, cuenta: true });
    await page.clock.runFor(1200);
    expect((await estado()).cuenta, 'la cuenta de volver se canceló sola').toBe(true);
    await page.clock.runFor(3000);
    expect(await estado(), 'tras la cuenta, la sesión no siguió').toEqual({ velo: false, cuenta: false });
  });
}

test('Respira · Ctrl, Alt, Cmd y una composición (IME) no pausan con Espacio', async ({ page }) => {
  await respiraEnMarcha(page);
  /* Tras CADA tecla: con cuatro seguidas, un número par de pausas dejaría la sesión como estaba. */
  const sigueEnMarcha = (tecla) => expect(sesion(page).getByRole('button', { name: /Reanudar/ }),
    tecla + ' pausó la sesión').toHaveCount(0);
  for (const tecla of ['Control+Space', 'Alt+Space', 'Meta+Space']) {
    await page.keyboard.press(tecla);
    await page.waitForTimeout(60);
    await sigueEnMarcha(tecla);
  }
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', isComposing: true, bubbles: true, cancelable: true })));
  await page.waitForTimeout(60);
  await sigueEnMarcha('Espacio a mitad de una composición');

  await page.keyboard.press('Space');
  await expect(sesion(page).getByRole('button', { name: /Reanudar/ }), 'Espacio solo ya no pausa').toBeVisible();
});
