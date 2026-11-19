/* PACE · E2E · LA PAUSA DE ANTES DE COMER, SALTADA EN EL MISMO MINUTO, SE QUEDA EN SU SITIO (caza del 19 nov. 2026)
 * ==========================================================================================================
 * Acabado el bloque de las 13:00 a las 13:45, con la comida a las 14:00: «Ahora no» y «Empezar ya el
 * bloque 2» en el mismo minuto. La pausa de las 13:45 desaparecía de la línea (al empezar antes de
 * comer solo pasaba a la historia lo de ANTES de las 13:45) y su «saltada», que va por orden, caía en
 * la pausa siguiente, la de las 15:25: Estadísticas › Hoy la daba por saltada antes de llegar.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { capturarErrores, overlaySuperior, terminarBloque } = require('./helpers');
const { pasado, vis, dia } = require('./comida.helpers');

test('la pausa de las 13:45 queda saltada en su sitio y la de la tarde, sin tocar', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await dia(page, context, 780, '13:00');
  await vis(page, '[data-pace-cta]').first().click();
  await terminarBloque(page);
  await overlaySuperior(page).getByRole('button', { name: 'Ahora no', exact: true }).click();
  await vis(page, '[data-pace-aro-seguir]').click();
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => getState().ritmo.dia.estados), 'GUARD: la pausa abierta, saltada').toEqual({ 1: 'saltada' });
  expect(await pasado(page), 'la pausa de las 13:45 salía de la línea').toBe('f13:00+45 p13:45+5');
  const paradas = await page.evaluate(() => statsHoyParadas(ritmoPlan(getState())).filter((x) => !x.comida).map((x) => ritmoHora(x.it.desde) + (x.marca ? ' ' + x.marca : '')));
  expect(paradas[0], 'la saltada es la de las 13:45').toBe('13:45 saltada');
  expect(paradas.slice(1).filter((x) => /saltada/.test(x)), 'una pausa de la tarde salía saltada antes de llegar').toEqual([]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).minutes), 'el bloque sigue acabando a la hora de comer (S7)').toBe(15);
  expect(errores).toEqual([]);
});
