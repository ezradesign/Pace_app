/* PACE · E2E · LA CAZA DE LAS SESIONES GUIADAS (14 oct. 2026)
 * ==========================================================
 * Lo que cuenta una sesión de Respira, Mueve o Estira cuando la vida se mete
 * por medio. Cada prueba es un hallazgo de `docs/traspaso/CAZA_SESIONES_14OCT.md`
 * y se vio en rojo contra v0.162.0.
 *
 * «DORMIDO» es el equipo en reposo o la app congelada: el reloj de la pared
 * sigue y la página no corre ni se entera de que se ha ocultado. Se hace con
 * `page.clock.setSystemTime`, que mueve la hora sin disparar ningún
 * temporizador; después, `runFor` deja correr la página otra vez.
 *
 * TRAMPAS: `clock.install()` va antes de `goto`, y a `MEDIODIA` (tests/helpers.js) para que
 * dormir una hora no cruce la medianoche · `fastForward` dispara cada
 * temporizador una sola vez, así que se avanza con `runFor` de segundo en
 * segundo · la semilla lleva las marcas de las migraciones de s69: sin ellas,
 * el primer guardado escribe la marca en falso y la siguiente lectura corre la
 * semana un día (lo que nunca pasa en una instalación real).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { MEDIODIA, sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

const MARCAS = { _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true };

test.beforeEach(async ({ context }) => { await sembrar(context, MARCAS); });

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.runFor(1000); await page.waitForTimeout(8); }
}
async function dormir(page, ms) {
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.setSystemTime(ahora + ms);
}
function visibilidad(page, estado) {
  return page.evaluate((v) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => v === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, estado);
}
const sesion = (page) => page.locator('[data-pace-session-root]');
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
/* Hasta el cierre con «siguiente», como quien acaba la rutina a su ritmo. */
async function hastaElCierre(page) {
  const done = sesion(page).locator('[data-pace-session-done]');
  for (let i = 0; i < 40 && !(await done.count()); i++) {
    await sesion(page).locator('[data-pace-v1-btn="next"]').click();
    await page.waitForTimeout(20);
  }
  await expect(done, 'GUARD: la rutina no llegó al cierre').toHaveCount(1);
}
const tiempoDelCierre = async (page) => {
  const [mm, ss] = (await sesion(page).getByText(/^\d+:\d\d$/).first().innerText()).split(':').map(Number);
  return mm * 60 + ss;
};

/* ---------------------------------------------------------------- sesiones-1 */
test('Respira no cuenta como practicado el rato con el equipo dormido', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirRespira(page, 'Box 4·4·4·4');
  await segundos(page, 3 + 30);

  await dormir(page, 30 * 60 * 1000);
  await segundos(page, 20);
  await expect(sesion(page).locator('[data-pace-session-done]'),
    'al despertar, la sesión dio por respirados los 30 minutos dormida').toHaveCount(0);

  await sesion(page).getByRole('button', { name: /Terminar/ }).click();
  const [ev] = await sesiones(page);
  expect(ev.activeSeconds, 'el rato dormido entró como práctica').toBeLessThan(90);
  expect(hoy((await leerEstado(page)).weeklyStats.breathMinutes)).toBe(1);
  expect(errores).toEqual([]);
});

test('Respira: la retención tampoco cuenta el rato dormido', async ({ page }) => {
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirRespira(page, 'Rondas express');
  const hold = page.locator('[data-pace-breathe-round-label]');
  for (let s = 0; s < 200 && !(await hold.count()); s++) await segundos(page, 1);
  await expect(hold, 'GUARD: no se llegó a la retención').toHaveCount(1);
  await segundos(page, 10);
  await dormir(page, 10 * 60 * 1000);
  await segundos(page, 5);
  await sesion(page).getByRole('button', { name: /Respirar de nuevo/ }).click();
  await sesion(page).getByRole('button', { name: /Terminar/ }).click();
  const hold2 = (await leerEstado(page)).weeklyStats.holdSeconds;
  expect(hoy(hold2), 'la retención contó los diez minutos dormida').toBeLessThan(30);
});

/* ---------------------------------------------------------------- sesiones-2 */
test('una pausa larga en Mueve no suma sus minutos a la semana', async ({ page }) => {
  /* Veinte minutos de reloj virtual con la sesión montada son ~50 s reales a solas: con la
     suite entera el minuto de serie se queda corto. */
  test.setTimeout(120_000);
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirCuerpo(page, 'Mueve', 'extra.calves');
  await segundos(page, 5 + 40);   // más de medio minuto, o no cuenta (sesiones-7)
  await sesion(page).locator('[data-pace-v1-btn="pausa"]').click();
  await page.clock.runFor(20 * 60 * 1000);
  await sesion(page).locator('[data-pace-v1-btn="pausa"]').click();
  await hastaElCierre(page);
  expect(hoy((await leerEstado(page)).weeklyStats.moveMinutes), 'la pausa de 20 minutos contó como Mueve').toBe(1);
});

/* Estira con «Postura reset»: cuatro pasos y el primero de repeticiones con colocación, la forma que
   tenía «Cuello» hasta v0.176.0 (ahora «Cuello suave», de tres pasos). */
test('con la página oculta una hora (la sesión en pausa), Estira no suma esa hora', async ({ page }) => {
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirCuerpo(page, 'Estira', 'extra.posture.set');
  await segundos(page, 5 + 40);
  await visibilidad(page, 'hidden');
  await dormir(page, 60 * 60 * 1000);
  await visibilidad(page, 'visible');
  await segundos(page, 2);
  await sesion(page).locator('[data-pace-v1-btn="pausa"]').click();
  await hastaElCierre(page);
  expect(hoy((await leerEstado(page)).weeklyStats.moveMinutes), 'la hora oculta contó como Estira').toBe(1);
});

/* ---------------------------------------------------------------- sesiones-3 */
test('si la página se oculta en «Prepárate», Estira no se hace sola: arranca en pausa', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirCuerpo(page, 'Estira', 'extra.posture.set');
  await segundos(page, 1);
  await visibilidad(page, 'hidden');
  await segundos(page, 10 * 60);
  await visibilidad(page, 'visible');
  await segundos(page, 1);

  await expect(sesion(page).locator('[data-pace-session-done]'), 'la sesión se hizo sola con la página oculta').toHaveCount(0);
  await expect(sesion(page).locator('[data-pace-v1-btn="pausa"]'), 'al volver no está en pausa')
    .toHaveAttribute('title', /Reanudar/);
  await expect(sesion(page)).toContainText('Paso 1 de 4');
  expect(await sesiones(page)).toEqual([]);
  expect(errores).toEqual([]);
});

/* ---------------------------------------------------------------- sesiones-4 */
test('con el equipo dormido, Estira se queda en pausa en el mismo paso y no lo cuenta', async ({ page }) => {
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirCuerpo(page, 'Estira', 'extra.posture.set');
  const reloj = sesion(page).locator('[data-pace-v1-timer]');
  for (let s = 0; s < 30 && !(await sesion(page).getByRole('button', { name: /Terminar serie/ }).count()); s++) await segundos(page, 1);
  await segundos(page, 3);
  const antes = await reloj.innerText();

  await dormir(page, 30 * 60 * 1000);
  await segundos(page, 2);
  await expect(sesion(page), 'el rato dormido pasó de paso').toContainText('Paso 1 de 4');
  expect(await reloj.innerText(), 'el rato dormido avanzó el ejercicio').toBe(antes);
  await expect(sesion(page).locator('[data-pace-v1-btn="pausa"]'), 'al despertar no está en pausa')
    .toHaveAttribute('title', /Reanudar/);

  await sesion(page).locator('[data-pace-v1-btn="pausa"]').click();
  await segundos(page, 30);
  await hastaElCierre(page);
  const [ev] = await sesiones(page);
  expect(ev.activeSeconds, 'el rato dormido entró como trabajo').toBeLessThan(60);
  expect(hoy((await leerEstado(page)).weeklyStats.moveMinutes)).toBe(1);
});

/* ---------------------------------------------------------------- sesiones-5 */
test('el tiempo del cierre de Mueve no sigue corriendo al contestar «¿te ayudó?»', async ({ page }) => {
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirCuerpo(page, 'Mueve', 'extra.calves');
  await segundos(page, 5 + 40);
  await hastaElCierre(page);
  const antes = await tiempoDelCierre(page);
  await segundos(page, 30);
  await sesion(page).getByRole('button', { name: 'Un poco' }).click();
  expect(await tiempoDelCierre(page), 'el cierre siguió contando mientras se miraba').toBe(antes);
});

/* ---------------------------------------------------------------- sesiones-6 */
test('dos pestañas: la segunda no ofrece seguir una Respira que sigue viva en la primera', async ({ context }) => {
  const abrir = async () => { const p = await context.newPage(); await irAlArtefacto(p); return p; };
  const tarjeta = (p) => p.locator('[data-pace-sidebar-accion]');
  const a = await abrir();
  await abrirRespira(a, 'Box 4·4·4·4');
  await a.waitForTimeout(3500 + 2500);

  const b = await abrir();
  await expect(tarjeta(b), 'GUARD: la barra lateral no tiene tarjeta').toHaveCount(1);
  await b.waitForTimeout(500);
  expect(await tarjeta(b).getAttribute('data-kind'),
    'la segunda pestaña ofrece «Continúa» de la sesión viva en la primera').not.toBe('resume');

  /* Al salir en la primera, la sesión sí queda a medias, y entonces se ofrece. */
  await sesion(a).getByRole('button', { name: /Salir/ }).click();
  await expect(tarjeta(b), 'al salir en la primera, la segunda no ofrece seguir').toHaveAttribute('data-kind', 'resume');
});

/* ------------------------------------------------- sesiones-7 (Ez eligió A) */
test('«Terminar» a los pocos segundos no cuenta, y el cierre dice «Sesión sin contar»', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  /* Tres veces seguidas: antes daban tres logros (Primer aliento, explorar Box, Lluvia). */
  for (let i = 0; i < 3; i++) {
    await abrirRespira(page, 'Box 4·4·4·4');
    await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
    await segundos(page, 4);
    await sesion(page).getByRole('button', { name: /Terminar/ }).click();
    await expect(sesion(page).locator('[data-pace-sin-contar]'), 'el cierre no dice que no ha contado').toHaveCount(1);
    await expect(sesion(page)).toContainText('Sesión sin contar');
    await expect(sesion(page).locator('[data-pace-session-stats]')).toHaveCount(0);
    await expect(sesion(page).getByText('¿Te ayudó esta pausa?')).toHaveCount(0);
    await sesion(page).getByRole('button', { name: /Volver al inicio/ }).click();
    await expect(sesion(page)).toHaveCount(0);
  }
  const s = await leerEstado(page);
  expect(s.breatheSessionsTotal || 0, 'cuatro segundos contaron como sesión').toBe(0);
  expect(hoy(s.weeklyStats && s.weeklyStats.breathMinutes), 'cuatro segundos contaron un minuto').toBe(0);
  expect(Object.keys(s.achievements || {}), 'cuatro segundos dieron logros').toEqual([]);
  expect(await sesiones(page)).toEqual([]);

  /* Con medio minuto, sí. */
  await abrirRespira(page, 'Box 4·4·4·4');
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
  await segundos(page, 31);
  await sesion(page).getByRole('button', { name: /Terminar/ }).click();
  await expect(sesion(page)).toContainText('Sesión completada');
  expect((await sesiones(page)).length).toBe(1);
  expect(errores).toEqual([]);
});

test('saltar todos los pasos de Estira no cuenta ni hace el plan del día', async ({ page }) => {
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirCuerpo(page, 'Estira', 'extra.posture.set');
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
  await hastaElCierre(page);
  await expect(sesion(page).locator('[data-pace-sin-contar]'), 'saltarlo todo dice «completado»').toHaveCount(1);
  const s = await leerEstado(page);
  expect(hoy(s.weeklyStats && s.weeklyStats.moveMinutes)).toBe(0);
  expect((s.plan || {}).extra, 'saltarlo todo hizo el plan del día').toBeFalsy();
  expect(await sesiones(page)).toEqual([]);
});

/* ------------------------------------------------- sesiones-8 (Ez eligió A) */
test('el «Tiempo» del cierre de Mueve deja fuera las pausas, como la semana', async ({ page }) => {
  test.setTimeout(120_000);   // la pausa de 20 minutos, como en sesiones-2
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirCuerpo(page, 'Mueve', 'extra.calves');
  await segundos(page, 5 + 40);
  await sesion(page).locator('[data-pace-v1-btn="pausa"]').click();
  await page.clock.runFor(20 * 60 * 1000);
  await sesion(page).locator('[data-pace-v1-btn="pausa"]').click();
  await segundos(page, 3 + 5);   // el 3, 2, 1 de reanudar (Ez, P8 B) aún es pausa
  await hastaElCierre(page);
  const tiempo = await tiempoDelCierre(page);
  expect(tiempo, 'el cierre lleva la pausa de 20 minutos dentro').toBeLessThan(60);
  expect(tiempo).toBeGreaterThanOrEqual(45);
  expect(hoy((await leerEstado(page)).weeklyStats.moveMinutes)).toBe(1);
});

/* ------------------------------------------------- sesiones-9 (Ez eligió A) */
const tarjeta = (p) => p.locator('[data-pace-sidebar-accion]');

test('recargar a mitad de Estira deja «Continúa · Paso 2 de 4», y se sigue por ese paso con lo hecho', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirCuerpo(page, 'Estira', 'extra.posture.set');
  await segundos(page, 5 + 60);
  await expect(sesion(page), 'GUARD: al minuto no se está en el paso 2').toContainText('Paso 2 de 4');

  await page.reload();
  await expect(tarjeta(page), 'tras recargar, la barra no ofrece seguir').toHaveAttribute('data-kind', 'resume');
  await expect(tarjeta(page)).toContainText('Postura reset');
  await expect(tarjeta(page)).toContainText('Paso 2 de 4');
  expect(hoy((await leerEstado(page)).weeklyStats && (await leerEstado(page)).weeklyStats.moveMinutes)).toBe(0);
  expect(await sesiones(page), 'a medias ya contaba').toEqual([]);

  await tarjeta(page).locator('[data-pace-sidebar-accion-boton]').click();
  await expect(sesion(page)).toHaveCount(1);
  await segundos(page, 6);
  await expect(sesion(page), 'no siguió por el paso donde se dejó').toContainText('Paso 2 de 4');
  await hastaElCierre(page);
  await expect(sesion(page)).toContainText('Estiramiento completado');
  expect(await tiempoDelCierre(page), 'el minuto de antes de recargar se perdió').toBeGreaterThanOrEqual(60);
  const [ev] = await sesiones(page);
  expect(ev && ev.module).toBe('stretch');
  expect(hoy((await leerEstado(page)).weeklyStats.moveMinutes)).toBe(1);

  await sesion(page).getByRole('button', { name: /Volver al inicio/ }).click();
  expect(await tarjeta(page).getAttribute('data-kind'), 'terminada, se sigue ofreciendo').not.toBe('resume');
  expect(errores).toEqual([]);
});

test('«Salir» a mitad de Mueve también la deja para seguir, con lo hecho', async ({ page }) => {
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirCuerpo(page, 'Mueve', 'extra.calves');
  await segundos(page, 5 + 40);
  await sesion(page).getByRole('button', { name: /Salir/ }).click();
  await expect(tarjeta(page)).toHaveAttribute('data-kind', 'resume');
  await expect(tarjeta(page)).toContainText('Gemelos subrepticios');
  await expect(tarjeta(page)).toContainText('Paso 1 de');

  await tarjeta(page).locator('[data-pace-sidebar-accion-boton]').click();
  await segundos(page, 6);
  await hastaElCierre(page);
  expect(await tiempoDelCierre(page), 'lo hecho antes de salir se perdió').toBeGreaterThanOrEqual(40);
});

test('dos pestañas: la segunda no ofrece seguir una Estira que sigue viva en la primera', async ({ context }) => {
  const abrir = async () => { const p = await context.newPage(); await irAlArtefacto(p); return p; };
  const a = await abrir();
  await abrirCuerpo(a, 'Estira', 'extra.posture.set');
  await a.waitForTimeout(5000 + 2500);

  const b = await abrir();
  await expect(tarjeta(b), 'GUARD: la barra lateral no tiene tarjeta').toHaveCount(1);
  await b.waitForTimeout(500);
  expect(await tarjeta(b).getAttribute('data-kind'),
    'la segunda pestaña ofrece «Continúa» de la sesión viva en la primera').not.toBe('resume');
  await sesion(a).getByRole('button', { name: /Salir/ }).click();
  await expect(tarjeta(b), 'al salir en la primera, la segunda no ofrece seguir').toHaveAttribute('data-kind', 'resume');
});
