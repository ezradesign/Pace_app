/* PACE · E2E · LA CAMPANITA DEL SELLO NO SE METE EN LA CAMPANA DEL FOCO (caza de la 0.212.0, 20 nov. 2026)
 * ========================================================================================================
 * Dos ramas del 19 nov., juntas: el fin del Foco suena con tres toques de campana, uno cada 0,9 s (aviso del
 * Foco en el PC, Ez), y los sellos que llegan a la vez salen en un aviso con su campanita (arreglos del
 * tester, 1A de Ez). El primer Foco gana «Primer paso», y su aviso salía a los 0,4 s del final: la campanita
 * sonaba entre el primer toque y el segundo, y se oían cuatro golpes mezclados donde Ez pidió tres.
 * Ahora el aviso sale a su hora y su sonido espera a que acabe el último toque.
 * Contra la 0.212.0 cae: «achievement.unlock» sonaba unos 400 ms después de «pomodoro.end».
 * NO CUBRE: cómo suena de verdad (headless no tiene altavoz; se mira a qué hora se pide cada sonido).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');

/* Cada sonido que se pide, con la hora (del reloj falso) a la que se pide. */
async function oirSonidos(context) {
  await context.addInitScript(() => {
    window.__sonidos = [];
    Object.defineProperty(window, 'playSound', {
      configurable: true,
      set(v) { this.__playSound = function (n) { window.__sonidos.push({ n, t: Date.now() }); return v.apply(this, arguments); }; },
      get() { return this.__playSound; },
    });
  });
}

test('el primer Foco acaba: el aviso del sello sale a su hora y su campanita suena tras el tercer toque', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { soundOn: true, notifyFocusEnd: false, focusMinutes: 5 });
  await oirSonidos(context);
  await page.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
  const fin = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
  /* El reloj, parado un segundo antes del final: desde ahí solo avanza lo que la prueba le pide, también con la
     máquina cargada. */
  await page.clock.pauseAt(fin - 1000);
  await page.clock.runFor(1200);
  /* El aviso del sello, visible antes de que acabe la campana. */
  let visto = null;
  for (let i = 0; i < 40; i++) {
    await page.clock.runFor(100);
    if (visto === null && await page.getByText(/Primer paso/).filter({ visible: true }).count()) visto = await page.evaluate(() => Date.now());
  }
  const s = await page.evaluate(() => window.__sonidos);
  const campana = s.find((x) => x.n === 'pomodoro.end');
  const sello = s.find((x) => x.n === 'achievement.unlock' || x.n === 'achievement.secret');
  expect(campana, 'GUARD: la campana del final').toBeTruthy();
  expect(sello, 'GUARD: el primer Foco gana un sello con su campanita').toBeTruthy();
  expect(visto, 'GUARD: el aviso del sello se ve').not.toBeNull();
  expect(visto - campana.t, 'el aviso del sello tiene que salir a su hora, no esperar a la campana').toBeLessThan(1500);
  /* Tres toques: a 0, 0,9 y 1,8 s; el último dura medio segundo. */
  expect(sello.t - campana.t, 'la campanita del sello suena dentro de los tres toques').toBeGreaterThanOrEqual(2300);
  expect(errores).toEqual([]);
});
