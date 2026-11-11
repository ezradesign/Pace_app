/* PACE · E2E · UNA PAUSA HECHA DICE LOS MINUTOS QUE HICISTE (Ez, 7A del 11 nov. 2026)
 * ==================================================================================
 * Revisión de ChatGPT, punto 7. La pausa de las 13:15 tiene 5 min en el plan y haces una rutina que
 * suma 2: la tarjeta de Estadísticas › Hoy decía «hecha · 5 min» (el hueco), y como seguía siendo la
 * pausa de ahora, ni eso: «ahora». Ahora dice «hecha · 2 min», los minutos que se sumaron al total de
 * arriba, y conserva su marco de la de ahora. Las hechas sin sesión apuntada (de antes de apuntarlas)
 * dicen «hecha» a secas: nunca los minutos del hueco. La línea de la home dice lo mismo.
 * La sesión se apunta en la pausa por su `runId` (`dia.sesiones`, state-ritmo.pausa.jsx).
 * Séptima pasada de Fable (n.º 2, 3 y 5): los minutos van guardados con la sesión (`dia.sesionesMin`), así
 * que se dicen igual sin el registro de eventos (la otra pestaña no lo relee hasta volver a ella); lo
 * apuntado por la 0.198, sin ellos, se sigue leyendo del registro; y una sesión de 0 min dice «hecha».
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

const DOS_MIN = { elapsedSeconds: 130, activeSeconds: 120, plannedSeconds: 120, plannedSecondsSource: 'declared', creditedMinutes: 2 };

async function hacerLaPausa(page, context, lang, datos) {
  await sembrar(context, Object.assign({}, SEMILLA, { lang: lang || 'es' }));
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await esperarInit(page);
  /* Una rutina de 2 min con la pausa abierta, por donde la cuentan los cuatro runners. */
  await page.evaluate(async (d) => {
    window.emitSessionCompleted('move', 'extra.empuje-sencillo', d);
    await new Promise((r) => setTimeout(r, 300));
  }, datos || DOS_MIN);
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

test('sin el registro de eventos (la otra pestaña, una copia que no lo trae), la pausa sigue diciendo «hecha · 2 min»', async ({ page, context }) => {
  await hacerLaPausa(page, context);
  expect(await page.evaluate(() => Object.values(getState().ritmo.dia.sesionesMin || {})), 'los minutos, con la sesión').toEqual([2]);
  await page.evaluate(() => { window.paceEventsSnapshot = () => ({ events: [] }); });
  await abrirHoy(page);
  const ahora = (await tarjetas(page)).find((c) => c.estado === 'ahora');
  expect(ahora.meta, 'leídos del registro, decía «hecha» a secas').toBe('13:15 · hecha · 2 min');
});

test('lo que apuntó la 0.198 (solo el runId, sin minutos) se sigue leyendo del registro', async ({ page, context }) => {
  await hacerLaPausa(page, context);
  await page.evaluate(() => {
    const s = getState();
    const dia = Object.assign({}, s.ritmo.dia);
    delete dia.sesionesMin;
    setState({ ritmo: Object.assign({}, s.ritmo, { dia }) });
  });
  expect(await page.evaluate(() => Object.keys(getState().ritmo.dia.sesiones)), 'GUARD: la sesión sigue apuntada').toEqual(['5']);
  await abrirHoy(page);
  const ahora = (await tarjetas(page)).find((c) => c.estado === 'ahora');
  expect(ahora.meta).toBe('13:15 · hecha · 2 min');
});

test('una sesión que suma 0 min («Terminar antes» al momento) deja la pausa «hecha», nunca «hecha · 0 min»', async ({ page, context }) => {
  await hacerLaPausa(page, context, 'es', { elapsedSeconds: 3, activeSeconds: 3, plannedSeconds: 120, plannedSecondsSource: 'declared',
    completionReason: 'early', creditedMinutes: 0 });
  expect(await page.evaluate(() => getState().ritmo.dia.estados[5]), 'GUARD: la pausa quedó hecha').toBe('hecha');
  await abrirHoy(page);
  const ahora = (await tarjetas(page)).find((c) => c.estado === 'ahora');
  expect(ahora.meta).toBe('13:15 · hecha');
});
