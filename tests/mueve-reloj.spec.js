/* PACE · E2E · EL RELOJ DE MUEVE Y ESTIRA (s200)
 * =============================================
 * Hasta v0.134.0 el runner contaba TICKS: cada disparo de `setInterval` sumaba
 * un segundo. Con la pestaña en segundo plano el navegador los espacia hasta uno
 * por minuto y la sesion se quedaba atras. Ahora la verdad es una marca de
 * tiempo (`useRelojSesion`, MoveSessionV1.support.jsx) y el intervalo solo
 * cuenta los segundos que el reloj real dice que han pasado.
 *
 * (a) `page.clock.fastForward(N)` dispara cada temporizador COMO MUCHO UNA VEZ:
 *     es exactamente un intervalo estrangulado. Con ticks, N segundos avanzaban
 *     1; con marcas, N.
 * (b) La politica al salir de la pantalla (`SESION_AL_OCULTAR = 'pausa'`): al
 *     pasar a `hidden` la sesion se pausa, y al volver SIGUE en pausa con su
 *     «Reanudar». Lo de fuera no cuenta.
 *
 * (c) Estira va por el MISMO runner (`MoveSession` con kind 'extra'), asi que se
 *     pausa igual: Ez lo eligio el 6 oct. 2026 («al volver sigues donde lo
 *     dejaste»). Se mira con una rutina escrita para el contrato v1 y otra que
 *     venia del runner antiguo (pasos `{ name, mode, dur, cue }`), para que
 *     ninguna de las dos formas del dato pueda olvidarse la politica.
 *
 * TRAMPAS: `clock.install()` va ANTES de `goto` · los nombres de boton llevan
 * glifos delante («❚❚ Pausar»), asi que se buscan por regex y dentro de la sesion.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); }
}

/* Abre «Flexiones de escritorio» y llega al TRABAJO de la primera serie (reps
   guiadas a 4 s por rep: el numero grande es la rep en curso). */
async function alTrabajo(page) {
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Mueve/ }).click();
  await page.getByRole('heading', { name: 'Flexiones de escritorio' }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toHaveCount(1);
  let trabajando = false;
  for (let s = 0; s < 40 && !trabajando; s++) {
    trabajando = await sesion.getByRole('button', { name: /Terminar antes/ }).count() > 0;
    if (!trabajando) await segundos(page, 1);
  }
  expect(trabajando, 'GUARD: la sesion nunca entro en el trabajo de la 1a serie').toBe(true);
  return sesion;
}

const rep = async (sesion) => Number(await sesion.locator('[data-pace-v1-timer]').innerText());

/* Simula el cambio de visibilidad como lo ve la pagina: la propiedad y su evento. */
function visibilidad(page, estado) {
  return page.evaluate((v) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => v === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, estado);
}

test('un intervalo estrangulado no retrasa el trabajo: 12 s de reloj son 3 reps', async ({ page }) => {
  const errores = capturarErrores(page);
  const sesion = await alTrabajo(page);
  const antes = await rep(sesion);

  /* UN solo salto de 12 s: el intervalo se dispara una vez, como con la pestaña
     en segundo plano. Con ticks avanzaba 1 s y la rep no cambiaba. */
  await page.clock.fastForward(12000);
  await page.waitForTimeout(50);
  expect(await rep(sesion), 'el trabajo avanzo un tick y no los 12 s del reloj').toBe(antes + 3);
  expect(errores).toEqual([]);
});

test('al ocultar la pagina la sesion se pausa, y al volver sigue en pausa', async ({ page }) => {
  const errores = capturarErrores(page);
  const sesion = await alTrabajo(page);
  await segundos(page, 4);
  const antes = await rep(sesion);
  await expect(sesion.getByRole('button', { name: /Pausar/ })).toHaveCount(1);

  await visibilidad(page, 'hidden');
  await page.waitForTimeout(50);
  await expect(sesion.getByRole('button', { name: /Reanudar/ }), 'ocultar la pagina no pauso la sesion').toHaveCount(1);
  await segundos(page, 20);

  await visibilidad(page, 'visible');
  await page.waitForTimeout(50);
  await segundos(page, 8);
  await expect(sesion.getByRole('button', { name: /Reanudar/ }), 'al volver la sesion se reanudo sola').toHaveCount(1);
  expect(await rep(sesion), 'el tiempo fuera de la pantalla conto como trabajo').toBe(antes);

  /* Y «Reanudar» la sigue desde donde estaba. */
  await sesion.getByRole('button', { name: /Reanudar/ }).click();
  await page.waitForTimeout(50);
  await segundos(page, 4);
  expect(await rep(sesion)).toBe(antes + 1);
  expect(errores).toEqual([]);
});

/* Abre una rutina de Estira por su id (los de Estira empiezan por `move.`) y
   espera a que corra su reloj de TRABAJO. «Pausar» ya no sirve de señal: el mando
   de tres lo lleva tambien al colocarse, y toda colocacion cuenta sola. */
async function estiraEnMarcha(page, id) {
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Estira/ }).click();
  await page.locator(`[data-pace-lib-card="${id}"]`).getByRole('button').first().click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toHaveCount(1);
  const reloj = sesion.locator('[data-pace-move-timer]');
  for (let s = 0; s < 40 && !(await reloj.count()); s++) await segundos(page, 1);
  expect(await reloj.count(), 'GUARD: el reloj de la rutina nunca arranco').toBe(1);
  await segundos(page, 2);
  return sesion;
}

for (const [forma, id] of [['contrato v1', 'move.shoulders.5'], ['venia del runner antiguo', 'move.desk.quick']]) {
  test(`Estira tambien se pausa al ocultar la pagina (${forma})`, async ({ page }) => {
    const errores = capturarErrores(page);
    const sesion = await estiraEnMarcha(page, id);
    const reloj = sesion.locator('[data-pace-move-timer]');
    const antes = await reloj.innerText();

    await visibilidad(page, 'hidden');
    await page.waitForTimeout(50);
    await expect(sesion.getByRole('button', { name: /Reanudar/ }), 'ocultar la pagina no pauso Estira').toHaveCount(1);
    await segundos(page, 20);
    await visibilidad(page, 'visible');
    await page.waitForTimeout(50);
    await segundos(page, 3);
    await expect(sesion.getByRole('button', { name: /Reanudar/ }), 'al volver Estira se reanudo sola').toHaveCount(1);
    expect(await reloj.innerText(), 'el tiempo fuera de la pantalla conto en Estira').toBe(antes);

    await sesion.getByRole('button', { name: /Reanudar/ }).click();
    await page.waitForTimeout(50);
    await segundos(page, 2);
    expect(Number(await reloj.innerText()), 'al reanudar sigue desde donde estaba').toBe(Number(antes) - 2);
    expect(errores).toEqual([]);
  });
}
