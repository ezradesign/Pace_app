/* PACE · E2E · QUE EL FOCO AVISE EN EL PC
 * ======================================
 * Ez, 19 nov. 2026: «cuando acaban los pomodoros en el PC se debería de notificar de forma que el
 * usuario se entere sin tener que entrar en la pestaña». Eligió 1A + 1C, tres toques de campana,
 * 1.2A, 2B y 2.2A (docs/proposals/aviso-foco-pc-19nov/).
 *  · 1A: el aviso del sistema se queda hasta cerrarlo (`requireInteraction`), sigue `silent`.
 *  · A su hora: el final va en un `setTimeout` a la hora de `endsAt`. Con la pestaña detrás más de
 *    cinco minutos Chrome despierta el `setInterval` de un segundo una vez por minuto, y la campana y
 *    el aviso llegaban hasta un minuto tarde. Aquí se simula ese freno alargando el intervalo.
 * NO CUBRE: cómo lo enseña de verdad Windows (en un navegador con avisos).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina } = require('./helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const CINCO = 5 * 60 * 1000;
const cta = (p) => p.locator('[data-pace-cta]');

/* Un navegador con el permiso dado y la pestaña de PACE detrás (o delante: `__visible`). */
async function navegadorConAvisos(context, { permiso = 'granted' } = {}) {
  await context.addInitScript((p) => {
    const avisos = window.__avisos = [];
    window.__visible = false;
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (window.__visible ? 'visible' : 'hidden') });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => !window.__visible });
    try { Object.defineProperty(Notification, 'permission', { configurable: true, get: () => p }); } catch (e) {}
    const reg = {
      showNotification: (title, o) => { avisos.push({ title, tag: o.tag, silent: o.silent, requireInteraction: o.requireInteraction, cuando: Date.now() }); return Promise.resolve(); },
      getNotifications: () => Promise.resolve([]),
    };
    if (navigator.serviceWorker) navigator.serviceWorker.getRegistration = () => Promise.resolve(reg);
  }, permiso);
}

/* Lo que hace Chrome con una pestaña oculta más de cinco minutos: el tic de un segundo, una vez cada 90. */
async function relojFrenado(context) {
  await context.addInitScript(() => {
    const si = window.setInterval;
    window.setInterval = function (fn, ms) {
      const resto = Array.prototype.slice.call(arguments, 2);
      return si.apply(window, [fn, ms === 1000 ? 90000 : ms].concat(resto));
    };
  });
}

async function empezarFoco(page) {
  await cta(page).click();
  await expect(cta(page)).toHaveText('Pausar');
}

test('aviso-pc · 1A · el aviso del final se queda hasta cerrarlo y sigue sin sonar', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: true, focusMinutes: 5 });
  await navegadorConAvisos(context);
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await empezarFoco(page);
  await context.clock.fastForward(CINCO + 2000);
  await context.clock.runFor(1500);
  await esperarEnPagina(page, () => window.__avisos.length === 1);
  const [aviso] = await page.evaluate(() => window.__avisos);
  expect(aviso.requireInteraction, 'el aviso se iba solo a los pocos segundos').toBe(true);
  expect(aviso.silent, 'la campana es la de PACE: el aviso no suena').toBe(true);
});

test('aviso-pc · 1A · con el reloj frenado de una pestaña oculta, el final llega a su hora', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: true, focusMinutes: 5 });
  await navegadorConAvisos(context);
  await context.clock.install({ time: ARRANQUE });
  await relojFrenado(context);
  await irAlArtefacto(page);
  await empezarFoco(page);
  const fin = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
  await context.clock.fastForward(CINCO - 10000);
  await context.clock.runFor(12000);
  await expect(cta(page), 'el Foco no acabó a su hora: esperaba al siguiente tic frenado').toHaveText('Empezar otro ciclo', { timeout: 3000 });
  await esperarEnPagina(page, () => window.__avisos.length === 1);
  const [aviso] = await page.evaluate(() => window.__avisos);
  expect(aviso.cuando - fin, 'el aviso llegó tarde').toBeLessThan(3000);
});
