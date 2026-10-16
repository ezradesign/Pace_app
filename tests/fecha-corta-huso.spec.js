/* PACE · la fecha corta no retrocede un día en América (16 oct. 2026)
 * ==================================================================
 * La auditoría del 16 oct. vio que `paceFechaCorta` hacía `new Date(fecha)`: con
 * una clave «AAAA-MM-DD» eso es la medianoche UTC, y en un huso negativo (la ficha
 * de Play va también en español de Latinoamérica) se pinta el día anterior.
 * Hoy sus llamadas le pasan un Date; esta prueba fija que una clave suelta
 * también se lee en hora local.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.use({ timezoneId: 'America/Mexico_City' });

test('en Ciudad de México, la clave 2026-10-16 se pinta como el 16', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const dia = await page.evaluate(() => window.paceFechaCorta('2026-10-16', 'es', { day: 'numeric' }));
  expect(dia).toBe('16');
  const conDate = await page.evaluate(() => window.paceFechaCorta(new Date(2026, 9, 16), 'es', { day: 'numeric' }));
  expect(conDate).toBe('16');
});
