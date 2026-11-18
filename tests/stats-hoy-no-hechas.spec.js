/* PACE · E2E · ESTADÍSTICAS › HOY: LAS PAUSAS QUE NO HICISTE (Ez, 3 «B atenuadas y no hecha las dos», 18 nov. 2026)
 * ==============================================================================================================
 * En el recorrido de tester, a las 17:40 las pausas que no se hicieron salían con sus minutos («11:25 · 15 min»),
 * igual que las hechas. Ahora salen atenuadas y con «no hecha», sin minutos. La de ahora, la que viene y la comida,
 * como siempre.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarModalAsentado } = require('./helpers');

const MARTES = new Date('2026-11-24T17:40:00+01:00');
const SEMILLA = {
  cycle: 2, lastActiveDay: 'Tue Nov 24 2026', soundOn: false,
  ritmo: { dia: { fecha: '2026-11-24', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {},
    estados: { 1: 'cuenta', 2: 'hecha' }, platos: { 2: ['move.desk.quick'] } } },
};

async function tarjetas(page, context, lang) {
  await sembrar(context, Object.assign({}, SEMILLA, { lang }));
  await page.clock.install({ time: MARTES });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: lang === 'en' ? 'View stats' : 'Ver estadísticas' }).click();
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await esperarModalAsentado(page);
  return page.evaluate(() => [...document.querySelectorAll('[data-pace-hoy-parada]')].map((c) => ({
    estado: c.dataset.paceHoyParada, meta: c.querySelector('.pace-sh-m').textContent.trim(),
    opacidad: Number(getComputedStyle(c).opacity) })));
}

test('las pausas que no se hicieron: «no hecha», sin minutos, y atenuadas', async ({ page, context }) => {
  const t = await tarjetas(page, context, 'es');
  const pasadas = t.filter((c) => c.estado === 'pasada');
  expect(pasadas.length, 'GUARD: a las 17:40 quedan pausas sin hacer').toBeGreaterThan(3);
  for (const c of pasadas) {
    expect(c.meta, 'sin sus minutos, como si se hubiera hecho').toMatch(/^\d{1,2}:\d{2} · no hecha$/);
    expect(c.opacidad, 'atenuada').toBeLessThan(0.6);
  }
  const hecha = t.find((c) => c.estado === 'hecha');
  expect(hecha.opacidad, 'la hecha, entera').toBe(1);
  expect(t.find((c) => c.estado === 'comida').meta, 'la comida, como siempre').toBe('14:00 · 1 h');
});

test('en inglés, «not done»', async ({ page, context }) => {
  const t = await tarjetas(page, context, 'en');
  expect(t.find((c) => c.estado === 'pasada').meta).toMatch(/ · not done$/);
});
