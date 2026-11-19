/* PACE · E2E · CON LA COMIDA POR DELANTE, SU HORA Y SU DURACIÓN SE PUEDEN CAMBIAR (caza del 19 nov. 2026)
 * ===================================================================================================
 * Ez: «si intentas modificar la hora, hay bugs raros». Acabado el bloque de antes de comer, la parada
 * abierta es la comida. Cambiar su hora o lo que dura no hacía nada: antes de guardar, «lo hecho» se
 * congelaba hasta la parada abierta, y la comida —que aún no había empezado— pasaba a la historia
 * como comida hecha de 14:00 a 15:00. La frase decía la hora nueva y la línea, la vieja.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { capturarErrores } = require('./helpers');
const { plan, pasado, hasta, enLaComida, cambiarHora } = require('./comida.helpers');

test('con la comida a las 14:00 por delante, pasarla a las 14:30 la mueve', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await enLaComida(page, context);
  await cambiarHora(page, 'comida', 1);
  expect(await page.evaluate(() => getState().ritmo.horario.comida), 'GUARD: la hora guardada').toBe(870);
  expect(await plan(page), 'la comida seguía a las 14:00 en la línea').toMatch(/^f13:15\+45 ([lf]14:00\+30 )?c14:30\+60 /);
  expect(await pasado(page), 'la comida que no ha empezado no es historia').not.toMatch(/c/);
  expect(errores).toEqual([]);
});

test('en plena comida, a las 14:20, acortarla a media hora la acaba a las 14:30', async ({ page, context }) => {
  await enLaComida(page, context, 'Ir a comer');
  await hasta(page, '14:20');
  await cambiarHora(page, 'comidaDur', -2);
  expect(await page.evaluate(() => getState().ritmo.horario.comidaDur), 'GUARD: la duración guardada').toBe(30);
  expect(await plan(page), 'la comida seguía hasta las 15:00').toMatch(/^f13:15\+45 c14:00\+30 f14:30\+/);
});

test('CONTROL · en plena comida, cambiar la salida no mueve la comida', async ({ page, context }) => {
  await enLaComida(page, context, 'Ir a comer');
  await hasta(page, '14:20');
  await cambiarHora(page, 'salida', 1);
  expect(await plan(page)).toMatch(/^f13:15\+45 c14:00\+60 f15:00\+/);
});
