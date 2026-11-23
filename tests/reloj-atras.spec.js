/* PACE · E2E · EL RELOJ QUE VUELVE UN DÍA ATRÁS (caza de datos del 22 nov. 2026)
 * ==============================================================================
 * Cinco días de racha, el último el sábado 21 a las 00:30 en Madrid. Esa persona vuela a Nueva York,
 * donde aún es viernes 20 por la tarde, y hace una Respira: la racha volvía a 1 (el «último día» era
 * mañana, que no es ayer). También pasa al corregir la hora de un equipo que iba adelantada.
 * Ahora se queda en 5, y sigue sumando cuando el calendario alcanza al sábado y llega el domingo.
 * En main cae: 1, 2 y 3.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const Z = [0, 0, 0, 0, 0, 0, 0];
const BASE = {
  _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
  weeklyStats: { focusMinutes: [...Z], breathMinutes: [4, 4, 4, 4, 4, 4, 0], moveMinutes: [...Z], waterGlasses: [...Z], holdSeconds: [...Z] },
};
const respira = (page) => page.evaluate(() => { window.completeBreathSession('breathe.box.4', 4, 0, null, true); return window.getState().streak; });
async function diaSiguiente(page, cuando) {
  await page.clock.setSystemTime(cuando);
  await page.evaluate(() => window.paceDiaMirar());
}

test.describe('en Nueva York', () => {
  test.use({ timezoneId: 'America/New_York' });

  test('volar hacia el oeste pasada la medianoche no rompe la racha', async ({ page, context }) => {
    await sembrar(context, Object.assign({}, BASE, { lastActiveDay: 'Sat Nov 21 2026',
      streak: { current: 5, longest: 5, lastActiveDate: 'Sat Nov 21 2026' } }));
    await page.clock.install({ time: new Date('2026-11-20T19:00:00-05:00') });
    await irAlArtefacto(page);
    expect((await respira(page)).current, 'el viernes de Nueva York, tras el sábado de Madrid').toBe(5);
    await diaSiguiente(page, new Date('2026-11-21T10:00:00-05:00'));
    expect((await respira(page)).current, 'el sábado, que ya contaba').toBe(5);
    await diaSiguiente(page, new Date('2026-11-22T10:00:00-05:00'));
    const domingo = await respira(page);
    expect(domingo.current, 'el domingo suma uno').toBe(6);
    expect(domingo.longest).toBe(6);
  });

  test('CONTROL: un día sin nada sí la corta', async ({ page, context }) => {
    await sembrar(context, Object.assign({}, BASE, { lastActiveDay: 'Wed Nov 18 2026',
      streak: { current: 5, longest: 5, lastActiveDate: 'Wed Nov 18 2026' } }));
    await page.clock.install({ time: new Date('2026-11-20T10:00:00-05:00') });
    await irAlArtefacto(page);
    const s = await respira(page);
    expect([s.current, s.longest]).toEqual([1, 5]);
  });
});
