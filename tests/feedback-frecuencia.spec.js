/* PACE · E2E · CADA CUÁNTO PREGUNTA «¿TE AYUDÓ?» (Ez, 3A del 15 nov. 2026)
 * ====================================================================
 * Una vez por rutina y día la preguntaba hasta nueve veces en una jornada entera de «A tu
 * ritmo». Ahora (`feedbackToca`, state-feedback.jsx): las tres primeras veces de cada rutina;
 * después, como mucho una vez a la semana por rutina; y nunca más de dos preguntas en un día,
 * con «Ahora no» contando como una. Maqueta elegida: docs/proposals/maquetas-uso-15nov/.
 *
 * Mutantes: sin el tope del día caen «la tercera del día no pregunta» (en puro y en el cierre);
 * sin la regla de la semana cae «con tres respuestas, una a la semana».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior, MEDIODIA } = require('./helpers');

const HOY = '2026-11-19';
const toca = (page, fb, id) => page.evaluate(([f, i, h]) => feedbackToca(f, i, h), [fb, id, HOY]);

test.describe('la regla, en puro', () => {
  test.beforeEach(async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
  });

  test('una rutina nueva pregunta; la misma, otra vez el mismo día, no', async ({ page }) => {
    expect(await toca(page, {}, 'move.desk.quick')).toBe(true);
    expect(await toca(page, { 'move.desk.quick': { yes: 1, some: 0, no: 0, lastPromptDay: HOY } }, 'move.desk.quick')).toBe(false);
  });

  test('la tercera del día no pregunta, y «Ahora no» cuenta como una', async ({ page }) => {
    const dos = { a: { yes: 1, some: 0, no: 0, lastPromptDay: HOY }, b: { yes: 0, some: 0, no: 0, lastPromptDay: HOY } };
    expect(await toca(page, dos, 'move.desk.quick'), 'tres preguntas en un día').toBe(false);
    const una = { a: { yes: 1, some: 0, no: 0, lastPromptDay: HOY } };
    expect(await toca(page, una, 'move.desk.quick'), 'CONTROL: con una hoy, la segunda sí').toBe(true);
  });

  test('con menos de tres respuestas pregunta cada día', async ({ page }) => {
    expect(await toca(page, { r: { yes: 1, some: 0, no: 1, lastPromptDay: '2026-11-18' } }, 'r')).toBe(true);
  });

  test('con tres respuestas, una a la semana', async ({ page }) => {
    expect(await toca(page, { r: { yes: 2, some: 1, no: 0, lastPromptDay: '2026-11-13' } }, 'r'), 'a los seis días').toBe(false);
    expect(await toca(page, { r: { yes: 2, some: 1, no: 0, lastPromptDay: '2026-11-12' } }, 'r'), 'a los siete días').toBe(true);
    expect(await toca(page, { r: { yes: '2', some: 1, no: 0, lastPromptDay: null } }, 'r'), 'sin fecha, pregunta').toBe(true);
  });
});

/* 5A (Ez, 21 nov. 2026; auditoría de la 0.212.0, nº 5): «Ahora no» no sumaba, y quien siempre la
   apartaba la oía cada día. Tres preguntas, contestadas o no, y luego una a la semana. */
test('5A · tres «Ahora no» en tres días cuentan como tres: al cuarto no pregunta, a la semana sí', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date('2026-11-16T12:00:00+01:00') });
  await irAlArtefacto(page);
  await page.evaluate(() => { window.__fb = nextRoutineFeedback({}, 'r', 'later'); });
  for (const d of ['2026-11-17', '2026-11-18']) {
    await page.clock.setSystemTime(new Date(d + 'T12:00:00+01:00'));
    await page.evaluate(() => { window.__fb = nextRoutineFeedback(window.__fb, 'r', 'later'); });
  }
  const fb = await page.evaluate(() => window.__fb);
  expect(fb.r.veces).toBe(3);
  expect([fb.r.yes, fb.r.some, fb.r.no], '«Ahora no» no es una respuesta para «Qué te ayuda»').toEqual([0, 0, 0]);
  expect(await toca(page, fb, 'r'), 'pregunta cada día a quien la aparta').toBe(false);
  expect(await page.evaluate(([f]) => feedbackToca(f, 'r', '2026-11-25'), [fb]), 'a los siete días, otra vez').toBe(true);
  expect(await toca(page, { r: { yes: 0, some: 0, no: 0, veces: 2, lastPromptDay: '2026-11-18' } }, 'r'), 'CONTROL: con dos, sí').toBe(true);
  expect(await page.evaluate(() => nextRoutineFeedback({ v: { yes: 2, some: 1, no: 0 } }, 'v', 'yes').v.veces), 'lo guardado de antes empieza en sus respuestas').toBe(4);
});

/* En el cierre de verdad: con dos rutinas ya preguntadas hoy, «Escritorio express» no pregunta. */
async function cierreDeEscritorio(page, context, routineFeedback) {
  const hoy = (() => { const d = new Date(MEDIODIA); const dd = (n) => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + dd(d.getMonth() + 1) + '-' + dd(d.getDate()); })();
  const fb = {};
  Object.keys(routineFeedback).forEach((k) => { fb[k] = Object.assign({}, routineFeedback[k], { lastPromptDay: hoy }); });
  await sembrar(context, { soundOn: false, routineFeedback: fb });
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Estira/ }).first().click();
  await overlaySuperior(page).getByRole('heading', { name: 'Escritorio express', exact: true }).filter({ visible: true }).first().click();
  const empezar = overlaySuperior(page).getByRole('button', { name: /^Empezar$/ });
  if (await empezar.count()) await empezar.first().click();
  const done = page.locator('[data-pace-session-done]');
  for (let s = 0; s < 500 && !(await done.count()); s++) { await page.clock.fastForward(1000); await page.waitForTimeout(8); }
  await expect(done, 'GUARD: la sesión no llegó al cierre').toHaveCount(1);
  await page.waitForTimeout(300);
}

test('en el cierre: con dos preguntas ya hoy, la tercera rutina no pregunta y sale «Volver al inicio»', async ({ page, context }) => {
  test.setTimeout(90_000);
  await cierreDeEscritorio(page, context, { 'breathe.box.4': { yes: 1, some: 0, no: 0 }, 'extra.calves': { yes: 0, some: 0, no: 0 } });
  await expect(page.locator('[data-pace-session-feedback]'), 'preguntó por tercera vez en el día').toHaveCount(0);
  await expect(page.locator('[data-pace-session-footer] button').first()).toBeVisible();
});

test('CONTROL en el cierre: con una pregunta hoy, la segunda sí sale', async ({ page, context }) => {
  test.setTimeout(90_000);
  await cierreDeEscritorio(page, context, { 'breathe.box.4': { yes: 1, some: 0, no: 0 } });
  await expect(page.locator('[data-pace-session-feedback] [data-pace-fb-chip]')).toHaveCount(3);
});
