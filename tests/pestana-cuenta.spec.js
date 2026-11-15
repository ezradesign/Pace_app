/* PACE · E2E · LA PESTAÑA SE LLAMA PACE, SIN VERSIÓN, Y CUENTA EL BLOQUE QUE CORRE
 * ================================================================================
 * Dos cosas de la cola de las auditorías de Fable (fila 4): el título de lo que se publica era
 * «PACE · Foco · Cuerpo — v0.206.0» y los buscadores leían la versión (X2c); y con un Foco o una
 * pausa en marcha, quien trabaja en otra pestaña no veía el reloj (pasada 5, idea 4). Ahora el
 * <title> de index.html es el nombre limpio, con su descripción, y mientras corre un bloque dice
 * lo que queda: «24:13 · Foco · PACE». En pausa o parado, vuelve el nombre.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const DIEZ = new Date('2026-10-07T10:00:00+02:00');
const cta = (p) => p.locator('[data-pace-cta]');

test('pestana-1 · index.html se llama PACE sin la versión y lleva la descripción de la landing', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await expect(page).toHaveTitle('PACE · Foco · Cuerpo');
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc).toMatch(/^Pausas activas para quien trabaja sentado\./);
  /* El <title> tal como lo sirve la web, antes de que corra nada: lo que lee un buscador. Se pide
     /index.html y no «/»: el servidor de las pruebas da PACE.html en «/» (.claude/static-server.js). */
  const crudo = await page.evaluate(() => fetch('/index.html', { cache: 'no-store' }).then((r) => r.text()));
  expect(crudo.match(/<title>([^<]*)<\/title>/)[1]).toBe('PACE · Foco · Cuerpo');
});

test('pestana-2 · con un Foco en marcha la pestaña cuenta lo que queda; en pausa vuelve el nombre', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, focusMinutes: 25 });
  await context.clock.install({ time: DIEZ });
  await irAlArtefacto(page);
  await cta(page).click();
  await expect(cta(page)).toHaveText('Pausar');
  await expect(page).toHaveTitle(/^(25:00|24:5\d) · Foco · PACE$/);
  await context.clock.fastForward(60 * 1000 + 13 * 1000);
  await expect(page).toHaveTitle(/^23:4\d · Foco · PACE$/);
  await cta(page).click();
  await expect(cta(page)).toHaveText('Continuar');
  await expect(page).toHaveTitle('PACE · Foco · Cuerpo');
});

test('pestana-3 · la pausa corta también cuenta, y en inglés la pestaña habla inglés', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, lang: 'en', focusMode: 'pausa' });
  await context.clock.install({ time: DIEZ });
  await irAlArtefacto(page);
  await expect(page).toHaveTitle('PACE · Focus · Body');
  await cta(page).click();
  await expect(page).toHaveTitle(/^0[45]:\d\d · Short break · PACE$/);
});
