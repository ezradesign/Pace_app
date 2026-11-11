/* PACE · E2E · LA VERSIÓN NUEVA, SIN INTERRUMPIR (Ez, V1 B y V2 B, 11 nov. 2026)
 * ==============================================================================
 * V1: una pestaña abierta todo el día no se enteraba de que había versión nueva (el navegador
 * solo mira sw.js al navegar). Ahora PACE pregunta al volver a la pestaña y mientras se ve, como
 * mucho una vez por hora (`reg.update()`, PACE.html). El aviso sale solo fuera de una sesión, y
 * no sale si la página ya es la versión nueva.
 * V2: «Actualizar» en una pestaña recargaba la otra a mitad de Respira. Ahora la pestaña con una
 * sesión en marcha espera a que acabe.
 *
 * La versión nueva se simula como en sw-aviso.safari.spec.js: el MISMO sw.js con otra dirección
 * queda instalado y en espera. Ese worker contesta la versión de esta build, así que para que
 * sea «otra» la página se hace pasar por una versión vieja (`window.PACE_VERSION`).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina, MEDIODIA } = require('./helpers');

test.describe.configure({ mode: 'serial' });

async function controlada(page) {
  await esperarEnPagina(page, async () => {
    if (!navigator.serviceWorker.controller) return false;
    const reg = await navigator.serviceWorker.getRegistration();
    return !!(reg && reg.active && reg.active.state === 'activated' && !reg.installing);
  }, null, { timeout: 20_000 });
  for (let i = 0; i < 3 && !(await page.evaluate(() => !!navigator.serviceWorker.controller)); i++) await irAlArtefacto(page);
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller), 'GUARD: la página no quedó controlada').toBe(true);
}
const vieja = (page) => page.evaluate(() => { window.PACE_VERSION = 'v0.0.1'; window.__sigue = true; });
const nueva = (page, marca) => page.evaluate((m) => navigator.serviceWorker.register('sw.js?prueba=' + m), marca);
const sigue = (page) => page.evaluate(() => window.__sigue === true).catch(() => false);
function visibilidad(page, estado) {
  return page.evaluate((v) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => v === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, estado);
}
async function abrirRespira(page) {
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await page.getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).first().click();
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
}

test('V1: pregunta por la versión al volver a la pestaña y cada hora, nunca más de una vez por hora', async ({ page, context }) => {
  await sembrar(context);
  await context.addInitScript(() => {
    window.__miradas = 0;
    const update = ServiceWorkerRegistration.prototype.update;
    ServiceWorkerRegistration.prototype.update = function () { window.__miradas++; return update.call(this); };
  });
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await esperarEnPagina(page, async () => !!(await navigator.serviceWorker.getRegistration()), null, { timeout: 20_000 });
  const miradas = () => page.evaluate(() => window.__miradas);

  await visibilidad(page, 'hidden');
  await visibilidad(page, 'visible');
  expect(await miradas(), 'volver a los pocos segundos de abrir no pregunta').toBe(0);

  await visibilidad(page, 'hidden');
  await page.clock.setSystemTime(MEDIODIA.getTime() + 61 * 60 * 1000);
  await visibilidad(page, 'visible');
  expect(await miradas(), 'volver tras una hora fuera pregunta').toBe(1);
  await visibilidad(page, 'hidden');
  await visibilidad(page, 'visible');
  expect(await miradas(), 'volver otra vez enseguida no vuelve a preguntar').toBe(1);

  await page.clock.fastForward(61 * 60 * 1000);
  expect(await miradas(), 'una hora con la pestaña delante pregunta otra vez').toBe(2);
});

test('V1: con la página ya en la versión nueva, no hay aviso y el worker nuevo entra sin recargar', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await controlada(page);
  await page.evaluate(() => { window.__sigue = true; });
  await nueva(page, 'misma');
  await esperarEnPagina(page, () => /prueba=misma/.test((navigator.serviceWorker.controller || {}).scriptURL || ''), null, { timeout: 15_000 });
  await page.waitForTimeout(800);
  await expect(page.locator('[data-pace-update-prompt]')).toHaveCount(0);
  expect(await sigue(page), 'la página ya nueva se recargó').toBe(true);
});

test('V1: el aviso espera fuera de la sesión, y un Foco corriendo también cuenta', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await controlada(page);
  await abrirRespira(page);
  await vieja(page);
  await nueva(page, 'en-sesion');
  await esperarEnPagina(page, () => !!window.__paceSwWaitingReg, null, { timeout: 15_000 });
  await page.waitForTimeout(2500);
  await expect(page.locator('[data-pace-update-prompt]'), 'el aviso sale encima de Respira').toHaveCount(0);

  await page.locator('[data-pace-session-root]').getByRole('button', { name: /Salir/ }).click();
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);
  await expect(page.locator('[data-pace-update-prompt]'), 'al acabar la sesión el aviso no vuelve').toBeVisible({ timeout: 5000 });

  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  expect(await page.evaluate(() => paceEnSesion()), 'un Foco corriendo debe contar como sesión').toBe(true);
});

test('V2: «Actualizar» en una pestaña no recarga la otra a mitad de Respira; al salir, sí', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await controlada(page);
  const otra = await context.newPage();
  await irAlArtefacto(otra);
  await controlada(otra);
  await abrirRespira(otra);
  await vieja(page);
  await vieja(otra);

  await nueva(page, 'dos-pestanas');
  await page.locator('[data-pace-update-prompt]').getByRole('button', { name: 'Actualizar' }).click();
  await expect.poll(() => sigue(page), { message: 'GUARD: la pestaña que actualiza no recargó', timeout: 15_000 }).toBe(false);
  await otra.waitForTimeout(3000);
  expect(await sigue(otra), 'la pestaña en Respira se recargó a mitad de la sesión').toBe(true);
  await expect(otra.locator('[data-pace-session-root]')).toHaveCount(1);

  await otra.locator('[data-pace-session-root]').getByRole('button', { name: /Salir/ }).click();
  await expect.poll(() => sigue(otra), { message: 'al acabar la sesión no se actualizó', timeout: 10_000 }).toBe(false);
});
