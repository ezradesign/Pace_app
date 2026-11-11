/* PACE · E2E · UNA PAUSA HECHA DICE LOS MINUTOS QUE HICISTE (Ez, 7A del 11 nov. 2026)
 * ==================================================================================
 * Revisión de ChatGPT, punto 7. La pausa de las 13:15 tiene 5 min en el plan y haces una rutina que
 * suma 2: la tarjeta de Estadísticas › Hoy decía «hecha · 5 min» (el hueco), y como seguía siendo la
 * pausa de ahora, ni eso: «ahora». Ahora dice «hecha · 2 min», los minutos que se sumaron al total de
 * arriba, y conserva su marco de la de ahora. Las hechas sin sesión apuntada (de antes de apuntarlas)
 * dicen «hecha» a secas: nunca los minutos del hueco. La línea de la home dice lo mismo.
 * La sesión se apunta en la pausa por su `runId` (`dia.sesiones`, state-ritmo.pausa.jsx).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarModalAsentado } = require('./helpers');
const { esperarInit } = require('./eventos.helpers');

/* Jueves 15 oct. a las 13:16: cinco bloques hechos y la pausa de las 13:15 abierta; las cuatro
   anteriores, hecha, hecha, hecha y saltada (como tests/stats-hoy.spec.js). */
const JUEVES = new Date('2026-10-15T13:16:00+02:00');
const SEMILLA = {
  cycle: 5, lastActiveDay: 'Thu Oct 15 2026', soundOn: false,
  _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
  achievements: { 'first.step': { unlockedAt: 1 } },
  ritmo: { dia: { fecha: '2026-10-15', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pausa: 5,
    estados: { 1: 'hecha', 2: 'hecha', 3: 'hecha', 4: 'saltada' } } },
};

async function hacerLaPausa(page, context, lang) {
  await sembrar(context, Object.assign({}, SEMILLA, { lang: lang || 'es' }));
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await esperarInit(page);
  /* Una rutina de 2 min con la pausa abierta, por donde la cuentan los cuatro runners. */
  await page.evaluate(async () => {
    window.emitSessionCompleted('move', 'extra.empuje-sencillo',
      { elapsedSeconds: 130, activeSeconds: 120, plannedSeconds: 120, plannedSecondsSource: 'declared', creditedMinutes: 2 });
    await new Promise((r) => setTimeout(r, 300));
  });
}

async function abrirHoy(page, lang) {
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.getByRole('button', { name: lang === 'en' ? 'View stats' : 'Ver estadísticas' }).click();
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await esperarModalAsentado(page);
}

const tarjetas = (page) => page.evaluate(() => [...document.querySelectorAll('[data-pace-hoy-parada]')]
  .map((c) => ({ estado: c.dataset.paceHoyParada, meta: c.querySelector('.pace-sh-m').textContent.trim() })));

test('la pausa de ahora, hecha con una rutina de 2: «hecha · 2 min», con su marco de ahora; las hechas sin sesión, «hecha»', async ({ page, context }) => {
  await hacerLaPausa(page, context);
  expect(await page.evaluate(() => getState().ritmo.dia.estados[5]), 'GUARD: la sesión deja hecha la pausa abierta').toBe('hecha');
  await abrirHoy(page);
  const t = await tarjetas(page);
  const ahora = t.find((c) => c.estado === 'ahora');
  expect(ahora, 'GUARD: la de las 13:15 sigue siendo la de ahora').toBeTruthy();
  expect(ahora.meta, 'dice lo que hiciste, no «ahora» ni el hueco').toBe('13:15 · hecha · 2 min');
  const hechas = t.filter((c) => c.estado === 'hecha');
  expect(hechas.length, 'GUARD: tres hechas de antes').toBe(3);
  for (const c of hechas) expect(c.meta, 'sin sesión apuntada, sin minutos: nunca los del hueco').toMatch(/^\d{1,2}:\d{2} · hecha$/);
});

test('en inglés: «done · 2 min»', async ({ page, context }) => {
  await hacerLaPausa(page, context, 'en');
  await abrirHoy(page, 'en');
  const ahora = (await tarjetas(page)).find((c) => c.estado === 'ahora');
  expect(ahora.meta).toBe('13:15 · done · 2 min');
});

test('ya pasada, la línea de la home y Estadísticas dicen «hecha · 2 min»', async ({ page, context }) => {
  await hacerLaPausa(page, context);
  /* Empieza el bloque siguiente: la de las 13:15 queda atrás, hecha. */
  await page.evaluate(() => ritmoBloqueEmpezado(getState().focusMinutes));
  await page.waitForTimeout(300);
  const linea = await page.evaluate(() => [...document.querySelectorAll('[data-pace-ritmo-estado-parada="hecha"] [data-pace-ritmo-etiq]')]
    .map((e) => e.textContent.trim()));
  expect(linea.some((x) => x.includes('hecha · 2 min')), 'la línea: ' + linea.join(' | ')).toBe(true);
  expect(linea.some((x) => /hecha · [1-9]\d? min/.test(x) && !x.includes('hecha · 2 min')), 'ninguna con los minutos del hueco').toBe(false);
  await abrirHoy(page);
  const metas = (await tarjetas(page)).filter((c) => c.estado === 'hecha').map((c) => c.meta);
  expect(metas, 'cuatro hechas: la de las 13:15 con sus 2 min').toContain('13:15 · hecha · 2 min');
});
