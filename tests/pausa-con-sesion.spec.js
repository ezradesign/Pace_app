/* PACE · E2E · LA PAUSA DEL FIN DE FOCO NO INTERRUMPE UNA SESIÓN (revisión de ChatGPT del 5 nov. 2026)
 * ======================================================================================================
 * Mientras alguien hace una pausa, esa práctica tiene prioridad. El Foco sigue corriendo detrás de una
 * sesión de Respira, Mueve o Estira, y al llegar a cero `usePausaALaVista` (FocusTimer.pestanas.jsx)
 * abría «Pausa bien hecha» encima: el menú es un `Modal` (capa 100) y la sesión va a 90, así que la
 * tapaba, y el ejercicio seguía corriendo debajo.
 *
 * Ahora la pausa pendiente espera: sigue en `state.focoPausa` mientras haya una sesión montada y se
 * abre, UNA vez, cuando se acaba o se sale de ella.
 *
 * El reloj va pausado y se avanza a mano: el Foco llega a cero con la sesión a medias.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const sesion = (page) => page.locator('[data-pace-session-root]');
const pausa = (page) => page.locator('[data-pace-break-shortcut]');
const pendiente = (page) => page.evaluate(() => { const p = getState().focoPausa; return p ? p.id : null; });

async function abrirRespira(page) {
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Box 4·4·4·4', exact: true }).click();
  const modal = overlaySuperior(page);
  if (await modal.getByRole('button', { name: 'Empezar sesión' }).count()) {
    await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
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

/* Un Foco en marcha al que le faltan 30 s; se abre la sesión y se deja que llegue a cero. */
async function focoAcabaConSesion(context, page, abrir) {
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await context.clock.pauseAt(new Date(ARRANQUE.getTime() + 3000));
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await context.clock.runFor(2000);
  await context.clock.fastForward(25 * 60 * 1000 - 30 * 1000);
  await context.clock.runFor(1000);
  await abrir(page);
  await expect(sesion(page)).toBeVisible();
  await context.clock.runFor(35 * 1000);
  await expect.poll(() => page.evaluate(() => getState().cycle), 'GUARD: el Foco no llegó a cero').toBe(1);
}

test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

for (const [nombre, abrir] of [['Respira', abrirRespira], ['Mueve', abrirMueve]]) {
  test(`${nombre} · al acabar el Foco con la sesión en marcha, la pausa espera y sale una sola vez al salir de ella`, async ({ context, page }) => {
    await focoAcabaConSesion(context, page, abrir);
    await context.clock.runFor(3000);

    /* Con la sesión delante: ni menú encima, ni la pausa perdida. */
    expect(await pausa(page).count(), 'la pausa del Foco se abrió encima de la sesión').toBe(0);
    await expect(sesion(page)).toBeVisible();
    expect(await pendiente(page), 'la pausa pendiente se perdió mientras la sesión seguía').not.toBeNull();

    /* Al salir de la sesión, sale. */
    await page.keyboard.press('Escape');
    await expect(sesion(page)).toHaveCount(0);
    await context.clock.runFor(1500);
    await expect(pausa(page), 'la pausa pendiente no salió al acabar la sesión').toHaveCount(1);
    expect(await pendiente(page), 'la pausa salió pero sigue pendiente (saldría dos veces)').toBeNull();

    /* Y no vuelve a salir: se cierra y pasa el tiempo. */
    await page.keyboard.press('Escape');
    await expect(pausa(page)).toHaveCount(0);
    await context.clock.runFor(5000);
    expect(await pausa(page).count(), 'la pausa salió dos veces').toBe(0);
  });
}

test('sin sesión delante, la pausa del Foco sale al acabar como siempre', async ({ context, page }) => {
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await context.clock.pauseAt(new Date(ARRANQUE.getTime() + 3000));
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await context.clock.runFor(2000);
  await context.clock.fastForward(25 * 60 * 1000);
  await context.clock.runFor(3000);
  await expect(pausa(page)).toHaveCount(1);
  expect(await pendiente(page)).toBeNull();
});
