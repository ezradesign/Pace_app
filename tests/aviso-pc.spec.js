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

/* 1C · La pestaña. El icono es un aro que se llena (se ve también con la pestaña fijada) y, si el
   Foco acaba sin mirarla, dice «● Foco terminado · PACE» en terracota hasta que vuelves. */
const icono = (page) => page.evaluate(() => document.querySelector('link[rel~="icon"]').getAttribute('href'));

test('aviso-pc · 1C · el icono se llena mientras corre y, si acaba sin mirarla, la pestaña dice «terminado» hasta volver', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, focusMinutes: 5 });
  await navegadorConAvisos(context);
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  const antes = await icono(page);
  await empezarFoco(page);
  await context.clock.fastForward(CINCO / 2);
  await context.clock.runFor(1500);
  const medio = await icono(page);
  expect(medio, 'el icono no cambia mientras corre el Foco').not.toBe(antes);
  expect(medio).toMatch(/^data:image\/png/);
  await context.clock.fastForward(CINCO / 2 + 2000);
  await context.clock.runFor(1500);
  await expect(page, 'al acabar sin mirarla, la pestaña volvía al nombre sin decir nada').toHaveTitle('● Foco terminado · PACE');
  const fin = await icono(page);
  expect(fin).not.toBe(medio);
  expect(fin).not.toBe(antes);
  await page.evaluate(() => { window.__visible = true; document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page, 'al volver, la pestaña vuelve a su nombre').toHaveTitle('PACE · Foco · Cuerpo');
  expect(await icono(page), 'al volver, el icono de siempre').toBe(antes);
});

test('aviso-pc · 1C · si lo estabas mirando, la pestaña no dice «terminado»', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, focusMinutes: 5 });
  await navegadorConAvisos(context);
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await page.evaluate(() => { window.__visible = true; });
  await empezarFoco(page);
  await context.clock.fastForward(CINCO + 2000);
  await context.clock.runFor(1500);
  await expect(cta(page)).toHaveText('Empezar otro ciclo');
  await expect(page).toHaveTitle('PACE · Foco · Cuerpo');
});

/* Tres toques de campana (Ez, 19 nov.: «tres toques de campana»): al acabar el Foco, la campana suena
   tres veces seguidas (din, din, din) en vez de una. Se cuentan los golpes por cuándo empiezan. */
test('aviso-pc · campana · al acabar el Foco la campana da tres toques', async ({ page, context }) => {
  await sembrar(context, { soundOn: true, notifyFocusEnd: false, focusMinutes: 5 });
  await context.addInitScript(() => {
    window.__golpes = [];
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const crea = Ctx.prototype.createOscillator;
    Ctx.prototype.createOscillator = function () {
      const o = crea.call(this);
      const empieza = o.start.bind(o);
      o.start = (cuando) => { if (window.__contar) window.__golpes.push(cuando || 0); return empieza(cuando); };
      return o;
    };
  });
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await empezarFoco(page);
  await page.evaluate(() => { window.__contar = true; });
  await context.clock.fastForward(CINCO + 2000);
  await context.clock.runFor(1500);
  await expect(cta(page)).toHaveText('Empezar otro ciclo');
  const golpes = await page.evaluate(() => window.__golpes.slice().sort((a, b) => a - b));
  /* Un toque son tres tonos casi a la vez; los toques se separan más de medio segundo. */
  const toques = golpes.filter((g, i) => i === 0 || g - golpes[i - 1] > 0.5).length;
  expect(toques, 'la campana del final dio ' + toques + ' toque(s): ' + JSON.stringify(golpes)).toBe(3);
});
