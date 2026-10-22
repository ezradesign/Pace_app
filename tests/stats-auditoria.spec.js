/* PACE · E2E · ESTADÍSTICAS (auditoría externa del 21-22 oct. 2026)
 * ================================================================
 * Casos que la coordinadora comprobó en el código y que se vieron en rojo contra v0.174.2:
 *   Y1 · el Año medía el foco en bloques de 25 min redondeados: un día con 1-12 min de foco
 *        salía vacío, y un año así decía «Aún no hay actividad» con minutos en los totales.
 *   E4 · las cifras con decimales salían con punto en castellano («1.4h» en el Mes, el «intensidad
 *        3.5» del Año) y las de las barras de la semana, sin formatear («1500» en inglés).
 *
 * El reloj va fijo (jueves 15 de octubre de 2026 a las 13:16 en Madrid) y lo de hoy se siembra
 * en `weeklyStats`, que el panel funde con el histórico (`getHistoryWithToday`).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarModalAsentado } = require('./helpers');

const JUEVES = new Date('2026-10-15T13:16:00+02:00');
const cero = [0, 0, 0, 0, 0, 0, 0];
const jueves = (n) => [0, 0, 0, n, 0, 0, 0];
function semilla(hoy, extra) {
  return Object.assign({
    cycle: 1, lastActiveDay: 'Thu Oct 15 2026', firstSeen: new Date('2026-01-01T09:00:00+01:00').getTime(),
    _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
    water: { goal: 8, today: hoy.water || 0, lastReset: null },
    weeklyStats: { focusMinutes: jueves(hoy.focus || 0), breathMinutes: jueves(hoy.breath || 0),
      moveMinutes: jueves(hoy.move || 0), waterGlasses: jueves(hoy.water || 0), holdSeconds: cero },
  }, extra || {});
}
async function abrir(page, context, hoy, extra) {
  await sembrar(context, semilla(hoy, extra));
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^(Ver estadísticas|View stats)$/ }).first().click();
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await esperarModalAsentado(page);
}
const pestana = async (page, k) => { await page.locator(`[data-pace-stats-tab="${k}"]`).click(); await page.waitForTimeout(250); };
/* Las celdas del año con color: llevan dentro la capa de su nivel. */
const celdasConColor = (page) => page.locator('[data-pace-year-cell] > div');

/* ------------------------------------------------------------------- Y1 · el año con poco foco */
test('Y1 · un día con 10 min de foco se ve en el Año, y el año no dice que no hubo actividad', async ({ page, context }) => {
  await abrir(page, context, { focus: 10 });
  await pestana(page, 'year');
  await expect(page.locator('[data-pace-year-view]')).not.toContainText('Aún no hay actividad');
  await expect(celdasConColor(page), 'el día con 10 min de foco sale vacío').toHaveCount(1);
  await expect(page.locator('[data-pace-year-view]')).toContainText('1 día con ritmo');
});

/* ------------------------------------------------------------------- E4 · decimales y miles */
test('E4 · en castellano, las horas del Mes llevan coma', async ({ page, context }) => {
  await abrir(page, context, { focus: 84 });
  await pestana(page, 'month');
  const linea = page.locator('.pace-heatmap-totals');
  await expect(linea).toBeVisible();
  await expect(linea, '84 min salen con punto').toContainText('1,4');
  await expect(linea).not.toContainText('1.4');
});

test('E4 · en castellano, la intensidad del Año lleva coma', async ({ page, context }) => {
  /* 50 min de foco (2) + Respira (1) + 4 de 8 vasos (0,5) = 3,5. */
  await abrir(page, context, { focus: 50, breath: 5, water: 4 });
  await pestana(page, 'year');
  await celdasConColor(page).first().locator('..').hover();
  await expect(page.getByText(/intensidad/), 'el tooltip del año no sale').toBeVisible();
  await expect(page.getByText(/intensidad/)).toContainText('intensidad 3,5');
});

test('E4 · en inglés, las cifras de las barras de la semana llevan su separador de miles', async ({ page, context }) => {
  await abrir(page, context, { focus: 1500 }, { lang: 'en' });
  await pestana(page, 'week');
  await expect(page.locator('[data-pace-bar="1500"]').first(), 'la cifra de la barra sale sin formatear').toHaveText('1,500');
});
