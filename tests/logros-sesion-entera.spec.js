/* PACE · E2E · LOS LOGROS, SOLO CON LA SESIÓN ENTERA (Ez, 22 oct. 2026)
 * ====================================================================
 * Ez lo vio en su Android: «Terminar» a mitad de una rutina daba logros, porque contaba toda
 * sesión con medio minuto o más (`PACE_MINIMO_CUENTA_S`). Ahora la que no llega entera a su
 * final suma sus minutos a la semana, hace el plan del día y cuenta en la racha, pero no gana
 * logros ni adelanta sus cuentas; la siguiente sesión entera, sí. Contra v0.174.4 caen las tres.
 *
 * TRAMPAS (las de `caza-sesiones.spec.js`): `clock.install()` va antes de `goto` y se avanza
 * con `runFor` de segundo en segundo; la semilla lleva las marcas de las migraciones de s69.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { MEDIODIA, sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

const MARCAS = { _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true };

test.beforeEach(async ({ context }) => { await sembrar(context, MARCAS); });

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.runFor(1000); await page.waitForTimeout(8); }
}
const sesion = (page) => page.locator('[data-pace-session-root]');
const cierre = (page) => sesion(page).locator('[data-pace-session-done]');
const leerEstado = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2') || '{}'));
const hoy = (lista) => (lista || [])[(MEDIODIA.getDay() + 6) % 7] || 0;
async function sesiones(page) {
  await page.waitForFunction(() => typeof window.eventsWebReadRaw === 'function');
  return page.evaluate(async () => {
    const raw = await window.eventsWebReadRaw();
    return (raw ? JSON.parse(raw).events : []).filter(e => e.type === 'session.completed').map(e => e.payload);
  });
}

async function abrirRespira(page, nombre) {
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: nombre, exact: true }).click();
  const modal = overlaySuperior(page);
  if (await modal.getByRole('button', { name: 'Empezar sesión' }).count()) {
    await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  await expect(sesion(page)).toHaveCount(1);
}
async function abrirCuerpo(page, modulo, id) {
  await page.getByRole('button', { name: new RegExp('^' + modulo) }).click();
  await page.locator(`[data-pace-lib-card="${id}"]`).getByRole('button').first().click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  await expect(sesion(page)).toHaveCount(1);
}
/* Deja correr la rutina hasta su cierre, sin tocar nada: así es entera. */
async function hastaQueAcabe(page, max) {
  for (let i = 0; i < max && !(await cierre(page).count()); i += 5) await segundos(page, 5);
  await expect(cierre(page), 'GUARD: la rutina no llegó a su final').toHaveCount(1);
}
/* Hasta el cierre con «siguiente», cortando cada paso. */
async function hastaElCierreACortes(page) {
  for (let i = 0; i < 40 && !(await cierre(page).count()); i++) {
    await sesion(page).locator('[data-pace-v1-btn="next"]').click();
    await page.waitForTimeout(20);
  }
  await expect(cierre(page), 'GUARD: la rutina no llegó al cierre').toHaveCount(1);
}
async function volverAlInicio(page) {
  await sesion(page).getByRole('button', { name: /Volver al inicio/ }).click();
  await expect(sesion(page)).toHaveCount(0);
}

test('Respira: «Terminar» a mitad suma los minutos pero no da logros; entera, sí', async ({ page }) => {
  test.setTimeout(120_000);
  const errores = capturarErrores(page);
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirRespira(page, '4·7·8');
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
  await segundos(page, 35);
  await sesion(page).getByRole('button', { name: /Terminar/ }).click();
  await expect(sesion(page)).toContainText('Sesión completada');
  let s = await leerEstado(page);
  expect(hoy(s.weeklyStats && s.weeklyStats.breathMinutes), 'terminada antes no sumó sus minutos').toBe(1);
  expect((s.plan || {}).respira, 'terminada antes no hizo el plan del día').toBe(true);
  expect((s.streak || {}).current, 'terminada antes no contó el día en la racha').toBe(1);
  expect(Object.keys(s.achievements || {}), 'terminada antes dio logros').toEqual([]);
  expect(s.breatheSessionsTotal || 0, 'terminada antes contó para las diez sesiones').toBe(0);
  expect(await sesiones(page), 'terminada antes no quedó en «Hoy»').toHaveLength(1);
  await expect(page.locator('[data-pace-toast]'), 'terminada antes avisó de un logro').toHaveCount(0);
  await volverAlInicio(page);

  await abrirRespira(page, '4·7·8');
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
  await hastaQueAcabe(page, 150);
  s = await leerEstado(page);
  expect(Object.keys(s.achievements || {}), 'entera no dio «Primer aliento»').toContain('first.breath');
  expect(s.breatheSessionsTotal).toBe(1);
  expect(errores).toEqual([]);
});

test('Estira: cortar los pasos suma los minutos pero no da logros; entera, sí', async ({ page }) => {
  test.setTimeout(150_000);
  const errores = capturarErrores(page);
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirCuerpo(page, 'Estira', 'move.neck.3');
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
  await segundos(page, 40);
  await hastaElCierreACortes(page);
  await expect(sesion(page).locator('[data-pace-sin-contar]'), 'GUARD: con 40 s y trabajo, cuenta').toHaveCount(0);
  let s = await leerEstado(page);
  expect(hoy(s.weeklyStats && s.weeklyStats.moveMinutes), 'cortada no sumó sus minutos').toBeGreaterThan(0);
  expect((s.plan || {}).extra, 'cortada no hizo el plan del día').toBe(true);
  expect(Object.keys(s.achievements || {}), 'cortada dio logros').toEqual([]);
  expect(Object.keys(s.routineCounts || {}), 'cortada adelantó las cuentas de los logros').toEqual([]);
  await volverAlInicio(page);

  await abrirCuerpo(page, 'Estira', 'move.neck.3');
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
  await hastaQueAcabe(page, 400);
  s = await leerEstado(page);
  expect(Object.keys(s.achievements || {}), 'entera no dio «Primer estirón»').toContain('first.stretch');
  expect(errores).toEqual([]);
});

test('Mueve: «Siguiente» a mitad de un paso suma los minutos pero no da logros', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirCuerpo(page, 'Mueve', 'extra.calves');
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
  await segundos(page, 40);
  await hastaElCierreACortes(page);
  const s = await leerEstado(page);
  expect(hoy(s.weeklyStats && s.weeklyStats.moveMinutes), 'cortada no sumó sus minutos').toBeGreaterThan(0);
  expect((s.plan || {}).muevete, 'cortada no hizo el plan del día').toBe(true);
  expect(Object.keys(s.achievements || {}), 'cortada dio logros').toEqual([]);
  expect(s.moveSessionsTotal || 0, 'cortada contó para las veinticinco sesiones').toBe(0);
  const [ev] = await sesiones(page);
  expect(ev && ev.completionReason, 'el evento no dice que se terminó antes').toBe('early');
  expect(errores).toEqual([]);
});
