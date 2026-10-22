/* PACE · E2E · UNA RESPIRA A MEDIAS, RETOMADA EN DOS PESTAÑAS (A9, auditoría del 22 oct. 2026)
 * ==========================================================================================
 * Con el aviso de seguridad abierto en dos pestañas, aceptar en las dos retomaba la misma sesión
 * dos veces: `onAccept` (main.jsx) usaba el registro leído al abrir el aviso, sin volver a
 * mirarlo, y las dos acreditaban los minutos ya practicados. Ahora, al aceptar, se vuelve a leer
 * y la pestaña se queda con el latido antes de montar la sesión; y una sesión retomada se
 * acredita una sola vez por su id, aunque una pestaña congelada deje de latir. Contra v0.174.4
 * caen las dos.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

const MARCAS = { _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true };

test.beforeEach(async ({ context }) => { await sembrar(context, MARCAS); });

const sesion = (page) => page.locator('[data-pace-session-root]');
const hoy = (lista) => (lista || [])[(new Date().getDay() + 6) % 7] || 0;
const leerEstado = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2') || '{}'));
async function sesiones(page) {
  await page.waitForFunction(() => typeof window.eventsWebReadRaw === 'function');
  return page.evaluate(async () => {
    const raw = await window.eventsWebReadRaw();
    return (raw ? JSON.parse(raw).events : []).filter(e => e.type === 'session.completed').map(e => e.payload);
  });
}

/* Una Rondas express a medias, como la deja el productor: ronda 2 y 95 s practicados. */
async function dosPestanasConElAviso(context) {
  const a = await context.newPage();
  await irAlArtefacto(a);
  await a.evaluate(() => {
    const ahora = Date.now();
    localStorage.setItem('pace.breathe.v1', JSON.stringify({ v: 1, routineId: 'breathe.rounds.express',
      round: 2, breaths: 7, activeMs: 95000, holdSec: 20, startedAt: ahora - 4 * 60000, savedAt: ahora - 60000 }));
  });
  await a.reload();
  const b = await context.newPage();
  await irAlArtefacto(b);
  for (const p of [a, b]) {
    await expect(p.locator('[data-pace-sidebar-accion]'), 'GUARD: no se ofrece seguir').toHaveAttribute('data-kind', 'resume');
    await p.locator('[data-pace-sidebar-accion]').getByRole('button').click();
    await overlaySuperior(p).getByText('Lo he leído y asumo mi responsabilidad').click();
  }
  return [a, b];
}
const aceptar = (p) => overlaySuperior(p).getByRole('button', { name: 'Empezar sesión' }).click();
async function respirar(p) {
  await sesion(p).getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(p.locator('[data-pace-breathe-phase]')).toBeVisible();
  return p.locator('[data-pace-breathe-round]').getAttribute('data-pace-breathe-round');
}
const terminar = (p) => sesion(p).getByRole('button', { name: /Terminar/ }).click();

test('con el aviso abierto en dos pestañas, solo una retoma la sesión y se acredita una vez', async ({ context }) => {
  const [a, b] = await dosPestanasConElAviso(context);
  const errores = capturarErrores(b);
  await aceptar(a);
  await expect(sesion(a)).toHaveCount(1);
  await expect.poll(() => a.evaluate(() => !!localStorage.getItem('pace.breathe.viva')), 'GUARD: A no late').toBe(true);
  await aceptar(b);
  await expect(sesion(b)).toHaveCount(1);

  expect(await respirar(a), 'la primera no retomó en su ronda').toBe('2');
  expect(await respirar(b), 'la segunda también retomó la sesión de la primera').toBe('1');

  await terminar(a);
  await terminar(b);
  await expect(sesion(b).locator('[data-pace-session-done]')).toHaveCount(1);
  expect(hoy((await leerEstado(b)).weeklyStats.breathMinutes), 'los minutos de antes se sumaron dos veces').toBe(2);
  expect(await sesiones(b), 'la sesión retomada quedó dos veces en «Hoy»').toHaveLength(1);
  expect(errores).toEqual([]);
});

test('si la primera deja de latir (congelada) y la segunda también la retoma, se acredita una vez', async ({ context }) => {
  const [a, b] = await dosPestanasConElAviso(context);
  await aceptar(a);
  await expect(sesion(a)).toHaveCount(1);
  /* La pestaña congelada en segundo plano no late: su latido se pierde justo antes de aceptar. */
  await b.evaluate(() => {
    localStorage.removeItem('pace.breathe.viva');
    [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Empezar sesión').click();
  });
  await expect(sesion(b)).toHaveCount(1);
  expect(await respirar(a)).toBe('2');
  expect(await respirar(b), 'GUARD: sin latido, la segunda la retoma').toBe('2');

  await terminar(a);
  await expect(sesion(a).locator('[data-pace-session-done]')).toHaveCount(1);
  await terminar(b);
  await expect(sesion(b).locator('[data-pace-session-done]')).toHaveCount(1);
  expect(hoy((await leerEstado(b)).weeklyStats.breathMinutes), 'la sesión retomada se acreditó dos veces').toBe(2);
  expect(await sesiones(b)).toHaveLength(1);
});
