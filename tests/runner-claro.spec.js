/* PACE · el runner de Mueve y Estira, más claro (B3, P5, P6 y P8 de ChatGPT; Ez, 29 oct. 2026)
 * =============================================================================================
 * Lo que Ez eligió en la maqueta (docs/proposals/runner-claro-29oct.html):
 *   B3 A · en un paso con banda que se puede saltar, la flecha cuenta las repeticiones y «Saltar
 *          este paso» es la pastilla pequeña junto al número, como el «+15 s».
 *
 * Se mira lo que se VE y lo que queda apuntado (el cierre y el estado), no el código. El reloj
 * va instalado (`runFor`).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

async function abrirRutina(page, biblioteca, id) {
  await page.getByRole('button', { name: new RegExp('^' + biblioteca) }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click(), id);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar|^\s*Start/i.test(x.textContent || '')).click();
  });
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
}
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');
const nombre = async (page) => (await page.locator('[data-pace-v1-name]').textContent()).trim();
const flecha = (page) => page.locator('[data-pace-v1-btn="next"]');
const pasoActual = async (page) => {
  const m = (await page.getByText(/^(Paso|Step) \d+ (de|of) \d+$/).first().textContent()).match(/(?:Paso|Step) (\d+)/);
  return +m[1] - 1;
};
async function hasta(page, cond, maxSeg) {
  for (let i = 0; i < (maxSeg || 120); i++) { if (await cond()) return true; await page.clock.runFor(1000); }
  return cond();
}
const cierre = (page) => page.locator('[data-pace-session-done]');
/* Las cifras del cierre por su rótulo («Reps», «Series», «Pasos»). */
async function cifra(page, rotulo) {
  return cierre(page).evaluate((raiz, r) => {
    const caja = [...raiz.querySelectorAll('[data-pace-session-stat]')]
      .find((x) => (x.lastElementChild.textContent || '').trim() === r);
    return caja ? Number(caja.querySelector('[data-pace-session-stat-num]').textContent.trim()) : null;
  }, rotulo);
}
const estado = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2') || '{}'));
/* Abre la rutina y llega al trabajo del primer paso (sin Auto, la colocación espera a «›»). */
async function empezar(page, context, id, extra) {
  await sembrar(context, Object.assign({ cuerpoAuto: false }, extra || {}));
  await page.clock.install({ time: new Date('2026-10-29T10:00:00+01:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Mueve', id);
}

test.describe('B3 · el paso con banda', () => {
  test('b3-1 · sin Auto, la flecha cuenta las 8 aperturas y «Saltar este paso» va junto al número', async ({ page, context }) => {
    test.setTimeout(120000);
    const errores = capturarErrores(page);
    await empezar(page, context, 'extra.banda.espalda');
    if ((await fase(page)) === 'place') await flecha(page).click();
    expect(await fase(page)).toBe('work');
    expect(await nombre(page)).toBe('Apertura con banda');
    /* La pastilla vive en la fila del número, como el «+15 s», y no en el mando. */
    const saltar = page.locator('.pace-v1-numfila [data-pace-v1-saltar]');
    await expect(saltar, 'no hay «Saltar este paso» junto al número').toBeVisible();
    await expect(saltar).toHaveText('Saltar este paso');
    await expect(page.locator('[data-pace-v1-mando]')).not.toContainText('Saltar este paso');
    /* La flecha da las 8 por hechas. */
    await flecha(page).click();
    await page.clock.runFor(300);
    expect(await pasoActual(page)).toBe(1);
    /* El Remo con banda se salta con la pastilla: ni reps ni corte. */
    await flecha(page).click();   // salta el descanso
    await page.clock.runFor(300);
    expect(await nombre(page)).toBe('Remo con banda');
    if ((await fase(page)) === 'place') await flecha(page).click();
    await page.locator('[data-pace-v1-saltar]').click();
    await page.clock.runFor(300);
    expect(await pasoActual(page)).toBe(3);
    await flecha(page).click();   // salta el descanso
    await page.clock.runFor(300);
    /* El remo con tu mano, entero: se coloca, un lado, el otro. */
    expect(await nombre(page)).toBe('Remo con tu mano');
    if ((await fase(page)) === 'place') await flecha(page).click();
    for (let lado = 0; lado < 2; lado++) {
      expect(await hasta(page, async () => (await page.locator('[data-pace-v1-num]').textContent()).trim() === '00', 40)).toBe(true);
      await flecha(page).click();
      await page.clock.runFor(300);
    }
    await cierre(page).waitFor({ timeout: 10000 });
    expect(await cifra(page, 'Reps'), 'las 8 aperturas no cuentan en el cierre').toBe(8);
    expect(await cifra(page, 'Pasos'), 'el remo con banda saltado contó como paso').toBe(2);
    const s = await estado(page);
    expect(s.moveSessionsTotal || 0, 'con el remo con banda saltado, la rutina no contó entera').toBe(1);
    expect(errores).toEqual([]);
  });

  test('b3-2 · con Auto, terminar la serie de banda antes no corta la rutina: se podía saltar entera', async ({ page, context }) => {
    test.setTimeout(150000);
    const errores = capturarErrores(page);
    await empezar(page, context, 'extra.banda.espalda', { cuerpoAuto: true });
    if ((await fase(page)) === 'place') await flecha(page).click();
    expect(await nombre(page)).toBe('Apertura con banda');
    await expect(page.locator('.pace-v1-numfila [data-pace-v1-saltar]')).toBeVisible();
    /* Tres reps guiadas y la flecha: cuentan esas tres, y la rutina sigue entera. */
    await page.clock.runFor(12500);
    await flecha(page).click();
    await page.clock.runFor(300);
    expect(await pasoActual(page)).toBe(1);
    expect(await hasta(page, async () => !!(await cierre(page).count()), 200)).toBe(true);
    expect(await cifra(page, 'Reps')).toBe(3 + 8);
    expect((await estado(page)).moveSessionsTotal || 0, 'terminar antes un paso que se puede saltar cortó la rutina').toBe(1);
    expect(errores).toEqual([]);
  });
});
