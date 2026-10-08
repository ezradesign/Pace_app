/* PACE · E2E · EL CIERRE DE UNA TÉCNICA DE RONDAS DICE LO HECHO
 * =============================================================
 * Caza del 7 de octubre (respira-2): al pulsar «Terminar» a mitad de
 * «Respiración en rondas», el cierre decía «3 RONDAS · 90 RESPIRACIONES»
 * después de seis respiraciones. Pintaba el PLAN de la rutina, no lo hecho.
 *
 * QUÉ CUENTA COMO HECHO, que es la decisión:
 *   · una RONDA está hecha cuando se suelta su retención; la que estaba en
 *     curso al terminar no cuenta;
 *   · una RESPIRACIÓN está hecha cuando termina su exhalación; la que estaba a
 *     medias («Respiración 7 de 25» = seis hechas) no cuenta;
 *   · lo que vale cero no se pinta: el cierre no le dice a nadie «0 rondas».
 *
 * Todo se deriva de lo que la sesión enseñaba antes de terminar (su contador
 * y su barra), no de números escritos aquí, salvo el registro sembrado de la
 * reanudación, que es la entrada del escenario.
 *
 * TRAMPAS HEREDADAS (respira-reanudar.spec.js): `clock.install()` antes de
 * `goto`; la sesión avanza de 1 s en 1 s; el modal de apnea nace con el botón
 * apagado hasta marcar la casilla.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

const CLAVE = 'pace.breathe.v1';

test.beforeEach(async ({ context }) => { await sembrar(context); });

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(12); }
}

async function aceptarAviso(page) {
  const modal = overlaySuperior(page);
  await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
  await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(page.locator('[data-pace-breathe-phase]')).toBeVisible();
}

/* Dónde iba la sesión, leído de su propia pantalla. */
const enCurso = (page) => page.evaluate(() => {
  const b = document.querySelector('[data-pace-breathe-breath]');
  const p = document.querySelector('[data-pace-breathe-progress]');
  const m = /(\d+)\D+(\d+)\s*$/.exec(b ? b.textContent : '');
  return {
    respiracion: b ? Number(b.getAttribute('data-pace-breathe-breath')) : 0,
    porRonda: m ? Number(m[2]) : 0,
    ronda: p ? Number(p.getAttribute('data-pace-breathe-round')) : 0,
    rondas: p ? Number(p.getAttribute('data-pace-breathe-rounds')) : 0,
  };
});

/* Las cifras del cierre como { etiqueta: valor }, sin el «Tiempo». */
const cifras = async (page) => {
  await page.locator('[data-pace-session-stats]').waitFor();
  const pares = await page.evaluate(() => [...document.querySelectorAll('[data-pace-session-stat]')].map(s => [
    (s.lastElementChild ? s.lastElementChild.textContent : '').trim(),
    (s.querySelector('[data-pace-session-stat-num]') || {}).textContent,
  ]));
  const out = {};
  pares.forEach(([k, v]) => { if (k !== 'Tiempo') out[k] = v; });
  return out;
};

const sembrarRegistro = (page, extra) => page.evaluate(({ k, extra }) => {
  const ahora = Date.now();
  localStorage.setItem(k, JSON.stringify(Object.assign({
    v: 1, routineId: 'breathe.rounds.express', round: 2, breaths: 7,
    activeMs: 120000, holdSec: 20, startedAt: ahora - 4 * 60000, savedAt: ahora - 60000,
  }, extra || {})));
}, { k: CLAVE, extra: extra });

async function reanudar(page, extra) {
  await page.clock.install();
  await irAlArtefacto(page);
  await sembrarRegistro(page, extra);
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.locator('[data-pace-sidebar-accion]').getByRole('button').click();
  await aceptarAviso(page);
}

/* ------------------------------------------------------------------ 1 */
test('«Terminar» en la ronda 1 dice las respiraciones hechas y ninguna ronda', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Rondas express', exact: true }).click();
  await aceptarAviso(page);
  await segundos(page, 24);

  const iba = await enCurso(page);
  /* GUARD: a mitad de la ronda 1 y con alguna respiración ya hecha; si no, el
     escenario no es el del fallo. */
  expect(iba.ronda).toBe(1);
  expect(iba.respiracion).toBeGreaterThan(1);
  expect(iba.respiracion).toBeLessThan(iba.porRonda);

  await page.getByRole('button', { name: /Terminar/ }).click();
  expect(await cifras(page), 'el cierre cuenta el plan y no lo hecho').toEqual({
    'Respiraciones': String(iba.respiracion - 1),
  });
  expect(errores).toEqual([]);
});

/* ------------------------------------------------------------------ 2 */
test('una sesión reanudada en la ronda 2 cuenta también lo hecho antes de irse', async ({ page }) => {
  const errores = capturarErrores(page);
  await reanudar(page);

  const iba = await enCurso(page);
  expect(iba.ronda, 'GUARD: no entró en la ronda guardada').toBe(2);
  expect(iba.respiracion).toBeGreaterThan(1);

  await page.getByRole('button', { name: /Terminar/ }).click();
  /* Una ronda hecha, en singular, y sus respiraciones más las de la segunda. */
  expect(await cifras(page)).toEqual({
    'Ronda': '1',
    'Respiraciones': String(iba.porRonda + iba.respiracion - 1),
  });
  expect(errores).toEqual([]);
});

/* ------------------------------------------------------------------ 3 */
/* CONTROL: al acabar de verdad el cierre sigue diciendo el total. Sale verde
   antes y después del arreglo; lo que vigila es que contar lo hecho no se
   quede corto en la última ronda, que termina desde la retención. */
test('al acabar la última ronda el cierre dice todas las rondas y respiraciones', async ({ page }) => {
  const errores = capturarErrores(page);
  await reanudar(page, { breaths: 24 });

  const iba = await enCurso(page);
  expect(iba.ronda).toBe(iba.rondas);
  for (let s = 0; s < 20; s++) {
    if (await page.getByRole('button', { name: 'Respirar de nuevo' }).count()) break;
    await segundos(page, 1);
  }
  await page.getByRole('button', { name: 'Respirar de nuevo' }).click();

  expect(await cifras(page)).toEqual({
    'Rondas': String(iba.rondas),
    'Respiraciones': String(iba.rondas * iba.porRonda),
  });
  expect(errores).toEqual([]);
});
