/* PACE · E2E · el total de vasos sigue al de hoy (auditoría del 21 oct. 2026, 10)
 * ===============================================================================
 * `addWaterGlass` sumaba al total de toda la vida (`routineCounts['agua.vasos']`, el del logro de
 * los 200 vasos) solo al AÑADIR: +1, −1, +1 dejaba un vaso hoy y dos en el total. Ahora el total
 * recibe el cambio que de verdad hubo, también al quitar, y nunca baja de cero. Los logros ya
 * ganados no se retiran (amnistía, s146). Cae contra v0.174.0.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test('10 · +1, −1, +1 desde cero deja un vaso hoy y uno en el total; quitar sin vasos no resta', async ({ context, page }) => {
  await sembrar(context, { lastActiveDay: new Date().toDateString() });
  await irAlArtefacto(page);
  const leer = () => page.evaluate(() => ({ hoy: getState().water.today, total: getCount('agua.vasos') }));

  await page.evaluate(() => { addWaterGlass(1); addWaterGlass(-1); addWaterGlass(1); });
  expect(await leer(), 'el total cuenta el vaso que se quitó').toEqual({ hoy: 1, total: 1 });

  /* Con cero vasos hoy, quitar no cambia nada: tampoco el total. */
  await page.evaluate(() => { addWaterGlass(-1); addWaterGlass(-1); });
  expect(await leer()).toEqual({ hoy: 0, total: 0 });
});
