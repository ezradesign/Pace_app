/* PACE · E2E · ESTADÍSTICAS (auditoría externa del 21-22 oct. 2026)
 * ================================================================
 * Casos que la coordinadora comprobó en el código y que se vieron en rojo contra v0.174.2:
 *   Y1 · el Año medía el foco en bloques de 25 min redondeados: un día con 1-12 min de foco
 *        salía vacío, y un año así decía «Aún no hay actividad» con minutos en los totales.
 *   E1 · «Hoy» por libre: el total de Cuerpo suma los minutos de la sesión entera (colocarse y
 *        descansos dentro) y la tarjeta de la sesión, solo los de ejercicio: 3 arriba y 2 abajo.
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

/* ------------------------------------------------------------------- E1 · «Hoy» por libre */
/* Opción 2A de la maqueta del 22 oct.: la tarjeta de la sesión dice lo mismo que el total.
   Cuello, como en la foto de la maqueta: 125 s de ejercicio en una sesión que acredita 3 min con la
   colocación y los descansos. Se cierra por la misma puerta que el runner (`completeExtraSession`),
   y el evento que deja es el que lee la tarjeta. */
async function abrirHoy(page) {
  await page.getByRole('button', { name: /^(Ver estadísticas|View stats)$/ }).first().click();
  await page.locator('[data-pace-hoy-view="libre"]').waitFor({ state: 'visible' });
}
const sesionesDeHoy = (page) => page.evaluate(() => (window.paceEventsSnapshot().events || [])
  .filter((e) => e.type === 'session.completed').map((e) => ({ v: e.v, payload: e.payload })));

test('E1 · por libre, la tarjeta de la sesión dice los mismos minutos que el total de Cuerpo', async ({ page, context }) => {
  await sembrar(context, semilla({}));
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await page.waitForFunction(() => typeof window.completeExtraSession === 'function' && typeof window.paceEventsSnapshot === 'function');
  await page.evaluate(() => window.completeExtraSession('move.neck.3', 3, { elapsedSeconds: 200, activeSeconds: 125,
    plannedSeconds: 180, plannedSecondsSource: 'derived', variant: 'v1', completionReason: 'natural' }));
  await expect.poll(async () => (await sesionesDeHoy(page)).length, 'GUARD: la sesión no llegó al registro').toBe(1);

  await abrirHoy(page);
  await expect(page.locator('[data-pace-stats-tarjeta="move"]')).toContainText('3');
  const tarjeta = page.locator('[data-pace-hoy-view="libre"] [data-pace-hoy-parada]');
  await expect(tarjeta).toHaveCount(1);
  await expect(tarjeta, 'la tarjeta cuenta solo el ejercicio y no cuadra con el total').toContainText('· 3 min');

  const [ev] = await sesionesDeHoy(page);
  expect(ev.payload.creditedMinutes, 'el evento no apunta los minutos que cuentan').toBe(3);
  expect(ev.v, 'ampliar el payload sube su `v` (EVENTOS_SCHEMA §9)').toBe(2);
});

test('E1 · una sesión de antes (v1, sin los minutos que cuentan) sigue con su cifra de ejercicio', async ({ page, context }) => {
  await sembrar(context, semilla({ move: 3 }));
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await page.waitForFunction(() => typeof window.eventsWebAppend === 'function' && typeof window.makeEvent === 'function');
  await page.evaluate(async () => {
    const e = window.makeEvent({ type: 'session.completed', runId: 'run-antes', occurredAt: new Date('2026-10-15T10:40:00+02:00').toISOString(),
      payload: { module: 'stretch', routineId: 'move.neck.3', completionReason: 'natural', elapsedSeconds: 200, activeSeconds: 125,
        plannedSeconds: 180, plannedSecondsSource: 'derived', variant: 'v1' } });
    /* Tal como lo guardaba v0.174.2: `v: 1` y sin el campo. */
    const antes = Object.assign({}, e, { v: 1, payload: Object.assign({}, e.payload) });
    delete antes.payload.creditedMinutes;
    await window.eventsWebAppend(antes);
  });
  await abrirHoy(page);
  await expect(page.locator('[data-pace-hoy-view="libre"] [data-pace-hoy-parada]')).toContainText('10:40 · 2 min');
});

/* ------------------------------------------------------------------- E2 · un día solo con agua */
/* Opción 3A de la maqueta del 22 oct.: el color del agua, en el tono más suave. */
test('E2 · en el Mes, un día solo con agua lleva el color del agua', async ({ page, context }) => {
  await abrir(page, context, { water: 8 });
  await pestana(page, 'month');
  const dia = page.locator('.pace-heatmap-cell').filter({ hasText: /^15$/ });
  await expect(dia.locator('> div'), 'el día solo con agua sale sin relleno').toHaveCount(1);
  const capa = await dia.locator('> div').evaluate((d) => ({ fondo: getComputedStyle(d).backgroundColor, op: Number(getComputedStyle(d).opacity) }));
  const agua = await page.evaluate(() => { const p = document.createElement('i'); p.style.color = 'var(--hydrate)'; document.body.appendChild(p);
    const c = getComputedStyle(p).color; p.remove(); return c; });
  expect(capa.fondo, 'el relleno no es el del agua').toBe(agua);
  expect(capa.op).toBeGreaterThan(0);
});

/* ------------------------------------------------------------------- E3 · el año en el escritorio */
/* Opción 4A de la maqueta del 22 oct.: la línea de totales del Mes, debajo del año. */
test('E3 · en el escritorio, el Año enseña sus totales', async ({ page, context }) => {
  await abrir(page, context, { focus: 84, breath: 5, move: 3, water: 6 });
  await pestana(page, 'year');
  const linea = page.locator('[data-pace-year-view] .pace-heatmap-totals');
  await expect(linea, 'el año no enseña sus totales en el escritorio').toBeVisible();
  await expect(linea).toContainText('Foco 1,4h');
  await expect(linea).toContainText('6 vasos');
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
