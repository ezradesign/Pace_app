/* PACE · E2E · ESTADÍSTICAS › HOY ENSEÑA LO HECHO POR TU CUENTA (Ez, 6A del 11 nov. 2026)
 * =====================================================================================
 * Revisión de ChatGPT, punto 6. Con el día elegido, «Hoy» solo enseñaba las paradas del plan: una
 * sesión hecha fuera de una pausa sumaba en los totales de arriba y no salía en ningún sitio. Ahora,
 * tras las paradas, un título pequeño, «Además, por tu cuenta», y esas sesiones con las mismas
 * tarjetas, por hora. Cada sesión se casa con su pausa por quién es (`runId` en `dia.sesiones`), no
 * por el nombre: un Box hecho en la pausa sale en su parada, y otro Box suelto sale abajo, una vez.
 * Séptima pasada de Fable (n.º 1): el día en que llega la actualización, las pausas hechas antes no traen
 * su sesión apuntada y la suya salía dos veces, en su parada y abajo. Con alguna pausa hecha sin sesión,
 * no hay «Además, por tu cuenta». Por eso las hechas de la semilla llevan la suya, como desde la 0.198.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarModalAsentado } = require('./helpers');
const { esperarInit } = require('./eventos.helpers');

const JUEVES = new Date('2026-10-15T13:16:00+02:00');
const SEMILLA = {
  cycle: 5, lastActiveDay: 'Thu Oct 15 2026', soundOn: false,
  _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
  achievements: { 'first.step': { unlockedAt: 1 } },
  ritmo: { dia: { fecha: '2026-10-15', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pausa: 5,
    estados: { 1: 'hecha', 2: 'hecha', 3: 'hecha', 4: 'saltada' }, sesiones: { 1: ['r-1'], 2: ['r-2'], 3: ['r-3'] } } },
};
const BOX = { elapsedSeconds: 130, activeSeconds: 120, plannedSeconds: 120, plannedSecondsSource: 'declared', creditedMinutes: 2 };
const CUELLO = { elapsedSeconds: 250, activeSeconds: 240, plannedSeconds: 240, plannedSecondsSource: 'declared', creditedMinutes: 4 };

async function preparar(page, context, lang) {
  await sembrar(context, Object.assign({}, SEMILLA, { lang: lang || 'es' }));
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await esperarInit(page);
  await page.evaluate(async ({ BOX, CUELLO }) => {
    const pausa = () => new Promise((r) => setTimeout(r, 250));
    /* Un Box en la pausa de las 13:15, que está abierta: es de esa parada. */
    window.emitSessionCompleted('breathe', 'breathe.box.4', BOX); await pausa();
    /* Empieza el bloque siguiente: lo que venga ya no es de ninguna pausa. */
    ritmoBloqueEmpezado(getState().focusMinutes); await pausa();
    window.emitSessionCompleted('breathe', 'breathe.box.4', BOX); await pausa();
    window.emitSessionCompleted('stretch', 'move.neck.3', CUELLO); await pausa();
  }, { BOX, CUELLO });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.getByRole('button', { name: lang === 'en' ? 'View stats' : 'Ver estadísticas' }).click();
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await esperarModalAsentado(page);
}

const leer = (page) => page.evaluate(() => {
  const bloque = document.querySelector('[data-pace-hoy-sueltas]');
  return {
    titulo: bloque ? bloque.querySelector('.pace-sh-cab').textContent.trim() : null,
    sueltas: bloque ? [...bloque.querySelectorAll('[data-pace-hoy-parada]')].map((c) => c.querySelector('.pace-sh-n').textContent.trim() + ' | ' + c.querySelector('.pace-sh-m').textContent.trim()) : [],
    /* El plan va antes, en su propia rejilla, y sigue siendo solo el plan. */
    plan: [...document.querySelector('[data-pace-hoy-view="menu"] [data-pace-hoy-rejilla]').querySelectorAll('[data-pace-hoy-parada]')].length,
    despues: bloque ? !!(document.querySelector('[data-pace-hoy-view="menu"] [data-pace-hoy-rejilla]').compareDocumentPosition(bloque) & Node.DOCUMENT_POSITION_FOLLOWING) : false,
  };
});

test('con el día elegido, lo hecho fuera de las pausas sale debajo, aparte: «Además, por tu cuenta», una vez cada sesión', async ({ page, context }) => {
  await preparar(page, context);
  const r = await leer(page);
  expect(r.titulo, 'el título pequeño').toBe('Además, por tu cuenta');
  expect(r.despues, 'debajo de las paradas del plan').toBe(true);
  expect(r.sueltas, 'el Box suelto y el Cuello, por hora; el Box de la pausa no').toEqual(['Box 4·4·4·4 | 13:16 · 2 min', 'Cuello suave | 13:16 · 4 min']);
  expect(await page.evaluate(() => (getState().ritmo.dia.sesiones || {})[5] || []), 'GUARD: el Box de la pausa quedó apuntado en ella').toHaveLength(1);
});

test('en inglés: «Also, on your own»', async ({ page, context }) => {
  await preparar(page, context, 'en');
  const r = await leer(page);
  expect(r.titulo).toBe('Also, on your own');
  expect(r.sueltas.length).toBe(2);
});

test('sin nada por tu cuenta, no hay título ni lista de más', async ({ page, context }) => {
  await sembrar(context, SEMILLA);
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  expect(await page.locator('[data-pace-hoy-sueltas]').count()).toBe(0);
});

test('el día en que llega la actualización (pausas hechas sin su sesión apuntada), no hay «Además, por tu cuenta»: la de la pausa saldría dos veces', async ({ page, context }) => {
  const dia = Object.assign({}, SEMILLA.ritmo.dia, { pausa: null });
  delete dia.sesiones;
  await sembrar(context, Object.assign({}, SEMILLA, { ritmo: { dia } }));
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await esperarInit(page);
  /* El Box de la pausa de las 9:50, hecho con la versión de antes: está en el registro y en ningún `dia.sesiones`. */
  await page.evaluate(async (BOX) => {
    const f = new Date(); f.setHours(9, 52, 0, 0);
    window.emitSessionCompleted('breathe', 'breathe.box.4', Object.assign({ fin: f.getTime() }, BOX));
    await new Promise((r) => setTimeout(r, 300));
  }, BOX);
  expect(await page.evaluate(() => getState().ritmo.dia.sesiones), 'GUARD: no hay pausa abierta que la apunte').toBeFalsy();
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await esperarModalAsentado(page);
  expect(await page.locator('[data-pace-hoy-parada="hecha"]').count(), 'GUARD: las tres hechas, en su parada').toBe(3);
  expect(await page.locator('[data-pace-hoy-sueltas]').count()).toBe(0);
});
