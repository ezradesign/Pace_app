/* PACE · E2E · con dos pestañas, la pausa sale en la que miras (Ez, 13 oct. 2026)
 * ================================================================================
 * Con el mismo bloque abierto en dos pestañas solo una lo cuenta (el candado de
 * FocusTimer.pestanas.jsx), y esa abría la pausa aunque estuviera de fondo: la que tenías delante
 * se quedaba en «Empezar otro ciclo». Ez: «En la que estás mirando». La pausa se abre en la
 * pestaña visible y, si no lo está ninguna, en la primera que vuelva al frente; el bloque sigue
 * contando una sola vez.
 *
 * El navegador de la suite da todas las pestañas por visibles, así que aquí cada una lee su
 * visibilidad de `window.__oculta` y la cambia avisando como el navegador.
 *
 * Caen contra la rama anterior: la que cuenta es siempre la misma pestaña, mires la que mires, así
 * que en una de las dos primeras la pausa sale en la oculta; y en las otras dos sale sin que mires
 * ninguna.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { leerContenedor } = require('./eventos.helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const cta = (p) => p.locator('[data-pace-cta]');
const pausaAbierta = (p) => p.locator('[data-pace-modal-backdrop]').getByText('Pausa bien hecha', { exact: true });

async function focosContados(page) {
  const c = await leerContenedor(page);
  return ((c && c.events) || []).filter(e => e.type === 'session.completed' && e.payload && e.payload.module === 'focus').length;
}

async function oculta(page, si) {
  await page.evaluate((o) => {
    window.__oculta = o;
    document.dispatchEvent(new Event('visibilitychange'));
  }, si);
}

/* A empieza un bloque y B se abre después: B lo recoge en marcha. */
async function bloqueEnDos(context) {
  await context.addInitScript(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (window.__oculta ? 'hidden' : 'visible') });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => !!window.__oculta });
  });
  await sembrar(context, { soundOn: false });
  await context.clock.install({ time: ARRANQUE });
  const a = await context.newPage();
  await irAlArtefacto(a);
  await context.clock.pauseAt(new Date(ARRANQUE.getTime() + 3000));
  await a.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await context.clock.runFor(2000);
  const b = await context.newPage();
  await irAlArtefacto(b);
  await expect(cta(b)).toHaveText('Pausar');
  return { a, b };
}

async function terminar(context, p) {
  await context.clock.fastForward(25 * 60 * 1000);
  await context.clock.runFor(3000);
  await expect.poll(() => p.a.evaluate(() => getState().cycle)).toBe(1);
  await expect.poll(() => p.b.evaluate(() => getState().cycle)).toBe(1);
}

for (const mira of ['a', 'b']) {
  const otra = mira === 'a' ? 'b' : 'a';
  test(`la pausa sale en la pestaña que miras (${mira.toUpperCase()}), sea cual sea la que cuenta`, async ({ context }) => {
    const p = await bloqueEnDos(context);
    await oculta(p[otra], true);
    await terminar(context, p);

    await expect(pausaAbierta(p[mira])).toBeVisible();
    expect(await pausaAbierta(p[otra]).count(), 'la pausa salió en la pestaña de fondo').toBe(0);
    expect(await p.a.evaluate(() => getState().totalFocusMin), 'el bloque contó dos veces').toBe(25);
    await expect.poll(() => focosContados(p.a)).toBe(1);
  });
}

test('si no miras ninguna, la pausa espera y sale en la primera que vuelve al frente', async ({ context }) => {
  const p = await bloqueEnDos(context);
  await oculta(p.a, true);
  await oculta(p.b, true);
  await terminar(context, p);
  await context.clock.runFor(2000);
  const abiertas = (await pausaAbierta(p.a).count()) + (await pausaAbierta(p.b).count());
  expect(abiertas, 'la pausa salió sin que miraras ninguna pestaña').toBe(0);

  await oculta(p.b, false);
  await expect(pausaAbierta(p.b)).toBeVisible();
  await oculta(p.a, false);
  await context.clock.runFor(2000);
  expect(await pausaAbierta(p.a).count(), 'la pausa salió también en la segunda').toBe(0);
  await expect.poll(() => focosContados(p.a)).toBe(1);
});

test('la pausa que nadie vio no sale al día siguiente', async ({ context }) => {
  const p = await bloqueEnDos(context);
  await oculta(p.a, true);
  await oculta(p.b, true);
  await terminar(context, p);
  await context.clock.fastForward(16 * 60 * 60 * 1000);
  await context.clock.runFor(2000);
  expect((await pausaAbierta(p.a).count()) + (await pausaAbierta(p.b).count()),
    'la pausa salió sin que miraras ninguna pestaña').toBe(0);

  await oculta(p.a, false);
  await context.clock.runFor(2000);
  await expect(cta(p.a)).toBeVisible();
  expect(await pausaAbierta(p.a).count(), 'salió la pausa de ayer').toBe(0);
});
