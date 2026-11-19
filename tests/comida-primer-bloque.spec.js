/* PACE · E2E · CAMBIAR LA COMIDA CON EL PRIMER BLOQUE EN MARCHA NO LO RECORTA (caza del 19 nov. 2026)
 * =============================================================================================
 * Ez: «si la haces antes… hay bugs raros». Con el primer bloque del día en marcha (12:30, 45 min) y
 * nada hecho aún, adelantar la comida a las 13:00 recomponía el día entero: la línea cortaba el
 * bloque en marcha a las 13:00 y ponía «Comida · ahora» mientras el aro seguía hasta las 13:15; al
 * acabar, la comida encogía a 45 minutos. Con un bloque hecho eso ya no pasaba («lo hecho se
 * congela»); con el primero, no había nada que congelar y nadie guardaba el que corría.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { capturarErrores, terminarBloque } = require('./helpers');
const { plan, vis, dia, hasta, cambiarHora } = require('./comida.helpers');

test('el bloque de 12:30 sigue hasta las 13:15 y la comida va detrás, entera', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await dia(page, context, 750, '12:30');
  await vis(page, '[data-pace-cta]').first().click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).minutes), 'GUARD: un bloque de 45').toBe(45);
  await hasta(page, '12:50');
  await cambiarHora(page, 'comida', -2);
  expect(await page.evaluate(() => getState().ritmo.horario.comida), 'GUARD: la hora guardada').toBe(780);
  expect(await plan(page), 'la línea cortaba el bloque en marcha a las 13:00').toMatch(/^f12:30\+45 c13:15\+60 /);
  await terminarBloque(page);
  expect(await plan(page), 'al acabar, la comida encogía a 45 min').toMatch(/^f12:30\+45 c13:15\+60 /);
  expect(errores).toEqual([]);
});
