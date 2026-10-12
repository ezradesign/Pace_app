/* PACE · E2E · un bloque de Foco en dos pestañas (caza del 10 oct., foco-5 y foco-6)
 * ================================================================================
 * Una pestaña que se abre con un bloque en marcha lo recoge y lo enseña, pero luego cada una seguía
 * por su cuenta. Medido en v0.154.0: pausar en A no pausaba B, que terminaba el bloque y lo contaba
 * mientras A decía «Continuar»; y si las dos llegaban al final, el registro apuntaba dos sesiones
 * de Foco (con el estado compartido entre pestañas, también dos bloques y 50 minutos).
 *
 * Caen contra v0.154.0 todas menos la de la pestaña cerrada, que es el control: la que queda
 * cuenta el bloque aunque lo empezara la otra.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { leerContenedor } = require('./eventos.helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const numero = (p) => p.locator('[data-pace-dial-number]');
const cta = (p) => p.locator('[data-pace-cta]');
const pausaAbierta = (p) => p.locator('[data-pace-modal-backdrop]').getByText('Pausa bien hecha', { exact: true });

async function focosContados(page) {
  const c = await leerContenedor(page);
  return ((c && c.events) || []).filter(e => e.type === 'session.completed' && e.payload && e.payload.module === 'focus').length;
}

/* A empieza un bloque y B se abre después: B lo recoge en marcha. */
async function bloqueEnDos(context) {
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

test('foco-6 · si las dos pestañas llegan al final, el bloque cuenta una vez', async ({ context }) => {
  const { a, b } = await bloqueEnDos(context);
  await context.clock.fastForward(25 * 60 * 1000);
  await context.clock.runFor(3000);

  await expect.poll(() => a.evaluate(() => getState().cycle)).toBe(1);
  await expect.poll(() => b.evaluate(() => getState().cycle)).toBe(1);
  expect(await a.evaluate(() => getState().totalFocusMin), 'el bloque contó dos veces').toBe(25);
  await expect.poll(() => focosContados(a)).toBe(1);
  /* Solo la que lo cuenta abre la pausa; la otra se queda en «Empezar otro ciclo». */
  const abiertas = (await pausaAbierta(a).count()) + (await pausaAbierta(b).count());
  expect(abiertas, 'la pausa se abrió en las dos pestañas').toBe(1);
});

test('foco-5 · pausar, seguir y reiniciar en una pestaña lo hace también en la otra', async ({ context }) => {
  const { a, b } = await bloqueEnDos(context);
  await context.clock.runFor(60 * 1000);
  await a.bringToFront();
  await a.getByRole('button', { name: 'Pausar', exact: true }).click();
  await expect(cta(b)).toHaveText('Continuar');
  await expect(numero(b)).toHaveText(await numero(a).textContent());

  /* Pasa media hora en pausa: nadie termina ni cuenta nada. */
  await context.clock.fastForward(30 * 60 * 1000);
  await context.clock.runFor(2000);
  expect(await b.evaluate(() => getState().cycle || 0), 'la otra pestaña terminó el bloque en pausa').toBe(0);
  await expect(cta(b)).toHaveText('Continuar');

  /* Seguir en B sigue en A, con el mismo final. */
  await b.bringToFront();
  await b.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(cta(a)).toHaveText('Pausar');
  await context.clock.runFor(2000);
  await expect(numero(a)).toHaveText(await numero(b).textContent());

  /* Reiniciar en B vuelve A al principio. */
  await b.getByRole('button', { name: 'Pausar', exact: true }).click();
  await expect(cta(a)).toHaveText('Continuar');
  await b.getByRole('button', { name: 'Reiniciar bloque' }).click();
  await expect(cta(a)).toHaveText('Empezar foco');
  await expect(numero(a)).toHaveText('25:00');
});

test('foco-5 · empezar un bloque en una pestaña lo pone en marcha en la otra', async ({ context }) => {
  await sembrar(context, { soundOn: false });
  await context.clock.install({ time: ARRANQUE });
  const a = await context.newPage();
  await irAlArtefacto(a);
  const b = await context.newPage();
  await irAlArtefacto(b);
  await context.clock.pauseAt(new Date(ARRANQUE.getTime() + 60 * 1000));
  await expect(cta(b)).toHaveText('Empezar foco');
  await a.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await expect(cta(b)).toHaveText('Pausar');
  await context.clock.runFor(5000);
  await expect(numero(b)).toHaveText(await numero(a).textContent());
});

test('CONTROL · si la pestaña que lo empezó se cierra, la otra cuenta el bloque', async ({ context }) => {
  const { a, b } = await bloqueEnDos(context);
  await a.close();
  await context.clock.fastForward(25 * 60 * 1000);
  await context.clock.runFor(3000);
  await expect.poll(() => b.evaluate(() => getState().cycle)).toBe(1);
  await expect(pausaAbierta(b)).toBeVisible();
  await expect.poll(() => focosContados(b)).toBe(1);
});
