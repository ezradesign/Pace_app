/* PACE · E2E · EL CAMBIO DE HORA NO SE COME UN DIA (s198 · v0.133.1)
 * ==================================================================
 * Tres sitios contaban los dias restando 24 h en milisegundos, y el dia del
 * cambio de hora de primavera dura 23:
 *  · la racha (`updateStreak`): el lunes siguiente, de 00:00 a 01:00, «ayer»
 *    caia en el SABADO y la racha se reiniciaba;
 *  · las etiquetas de mes de los dos mapas anuales: de marzo a octubre la
 *    resta salia un dia corta y la etiqueta caia una columna antes que su dia 1
 *    (medido: «jun» en 2026, «sep» en 2025). Las CELDAS ya iban bien.
 * El huso lo fija playwright.config.js (Europe/Madrid): el cambio de 2026 es el
 * domingo 29 de marzo. Calibrado en ROJO contra el `index.html` de v0.133.0.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

async function rachaTras(context, page, ahora, ayer, hoyStr) {
  await sembrar(context, { streak: { current: 3, longest: 3, lastActiveDate: ayer }, lastActiveDay: hoyStr, _historyMigrated: true });
  await page.clock.install({ time: new Date(ahora) });
  await irAlArtefacto(page);
  return page.evaluate(() => { updateStreak(); return getState().streak.current; });
}

test('la racha sigue el lunes siguiente al cambio de hora, a las 00:30', async ({ context, page }) => {
  const r = await rachaTras(context, page, '2026-03-30T00:30:00+02:00', 'Sun Mar 29 2026', 'Mon Mar 30 2026');
  expect(r, 'la racha se reinicio: «ayer» cayo en el sabado').toBe(4);
});

test('CONTROL: un lunes cualquiera a las 00:30, la racha sigue', async ({ context, page }) => {
  const r = await rachaTras(context, page, '2026-03-24T00:30:00+01:00', 'Mon Mar 23 2026', 'Tue Mar 24 2026');
  expect(r).toBe(4);
});

test('las doce etiquetas de mes del mapa anual caen en la columna de su dia 1', async ({ context, page }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date('2026-06-15T12:00:00+02:00') });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  await page.getByRole('button', { name: 'Año', exact: true }).click();
  const etiquetas = page.locator('[data-pace-year-month-lbl]');
  await expect(etiquetas.first()).toBeAttached();
  const textos = await etiquetas.allTextContents();
  const reales = textos.map((t, i) => (t.trim() ? i : -1)).filter((i) => i >= 0);
  /* Lo esperado, contado en UTC (sin cambio de hora): columna = (n + dia de la semana del 1 de enero) / 7. */
  const ano = 2026;
  const jan1Dow = (new Date(Date.UTC(ano, 0, 1)).getUTCDay() + 6) % 7;
  const esperadas = Array.from({ length: 12 }, (_, m) => Math.floor((Math.round((Date.UTC(ano, m, 1) - Date.UTC(ano, 0, 1)) / 86400000) + jan1Dow) / 7));
  expect(reales, 'alguna etiqueta de mes no cae en la columna de su dia 1').toEqual(esperadas);
});
