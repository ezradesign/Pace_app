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

/* 1.2A · Con el permiso bloqueado, la nota de Ajustes dice cómo quitarlo en tu navegador y que la
   pestaña y la campana siguen avisando. Antes solo decía que estaba bloqueado. */
const notaBloqueo = async (page) => {
  await page.getByRole('button', { name: /^(Abrir ajustes|Open settings)$/ }).click();
  const nota = page.locator('.pace-aj-nota').first();
  await nota.waitFor({ state: 'visible' });
  return (await nota.innerText()).replace(/\s+/g, ' ');
};
const NAVEGADORES = [
  ['Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '«Notificaciones», «Permitir»'],
  ['Edge', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '«Permisos para este sitio»'],
  ['Firefox', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0', '«Enviar notificaciones»'],
  ['Safari', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15', 'Ajustes › Sitios web › Notificaciones'],
];
for (const [nombre, ua, pasos] of NAVEGADORES) {
  test(`aviso-pc · 1.2A · ${nombre} · con el permiso bloqueado, la nota dice cómo quitarlo y que la pestaña y la campana siguen`, async ({ browser }) => {
    const context = await browser.newContext({ userAgent: ua, viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    await sembrar(context, { notifyFocusEnd: true });
    await navegadorConAvisos(context, { permiso: 'denied' });
    await irAlArtefacto(page);
    const texto = await notaBloqueo(page);
    expect(texto, 'la nota no dice cómo desbloquearlo en ' + nombre).toContain(pasos);
    expect(texto).toMatch(/la pestaña y la campana siguen avisando/i);
    await context.close();
  });
}

test('aviso-pc · 1.2A · en inglés, la nota dice lo mismo en inglés', async ({ page, context }) => {
  await sembrar(context, { notifyFocusEnd: true, lang: 'en' });
  await navegadorConAvisos(context, { permiso: 'denied' });
  await irAlArtefacto(page);
  const texto = await notaBloqueo(page);
  expect(texto).toContain('“Allow”');
  expect(texto).toMatch(/the tab and the bell still tell you/i);
});

/* 2B · La miniventana en tira (Document Picture-in-Picture). La de verdad no se abre sin una persona
   que toque, así que `requestWindow` devuelve aquí la ventana de un iframe: la app pinta dentro lo
   mismo que pintaría en la miniventana. */
async function miniventanaFalsa(context) {
  await context.addInitScript(() => {
    if (window.top !== window) return;
    /* Chromium trae la de verdad y no deja pisarla con una asignación. */
    Object.defineProperty(window, 'documentPictureInPicture', { configurable: true, value: {
      requestWindow: (op) => new Promise((ok) => {
        window.__pipPedido = op;
        const f = document.createElement('iframe');
        f.setAttribute('data-pip-falso', '');
        f.style.cssText = 'position:fixed;left:0;bottom:0;width:300px;height:84px;border:0;z-index:2147483647';
        document.body.appendChild(f);
        ok(f.contentWindow);
      }),
    } });
  });
}
const tira = (page) => page.frameLocator('[data-pip-falso]').locator('[data-pace-mini]');

test('aviso-pc · 2B · la tira cuenta el Foco, «Pausar» y «Continuar» mandan sobre el aro y al acabar se pone en terracota', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, focusMinutes: 5 });
  await miniventanaFalsa(context);
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await empezarFoco(page);
  await page.evaluate(() => paceMiniAbrir());
  expect(await page.evaluate(() => window.__pipPedido), 'la tira mide 300 × 84').toEqual({ width: 300, height: 84 });
  await expect(tira(page)).toContainText(/0[45]:\d\d/);
  await expect(tira(page)).toContainText('Foco · Ciclo 1 / 4');
  await tira(page).getByRole('button', { name: 'Pausar' }).click();
  await expect(cta(page), '«Pausar» de la tira no pausó el Foco').toHaveText('Continuar');
  await tira(page).getByRole('button', { name: 'Continuar' }).click();
  await expect(cta(page)).toHaveText('Pausar');
  await context.clock.fastForward(CINCO + 2000);
  await context.clock.runFor(1500);
  await expect(cta(page)).toHaveText('Empezar otro ciclo');
  await expect(tira(page)).toHaveAttribute('data-fin', '');
  await expect(tira(page)).toContainText('Foco terminado');
});

/* 2.2A · El botón «Miniventana», discreto, en la fila de «Pausar»: solo mientras corre un Foco, solo
   donde hay miniventana y no cuando ya está abierta. */
const botonMini = (page) => page.getByRole('button', { name: 'Abrir la miniventana, encima de todas las ventanas' });

test('aviso-pc · 2.2A · el botón sale junto a «Pausar» solo mientras corre un Foco y abre la tira', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, focusMinutes: 5 });
  await miniventanaFalsa(context);
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await expect(botonMini(page), 'con el aro parado no hay botón').toHaveCount(0);
  await empezarFoco(page);
  await expect(botonMini(page)).toBeVisible();
  const fila = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === 'Abrir la miniventana, encima de todas las ventanas');
    return b.parentElement.contains(document.querySelector('[data-pace-cta]'));
  });
  expect(fila, 'el botón no va en la fila de «Pausar»').toBe(true);
  await botonMini(page).click();
  await expect(tira(page)).toContainText(/0[45]:\d\d/);
  await expect(botonMini(page), 'con la tira abierta el botón sobra').toHaveCount(0);
  await cta(page).click();
  await expect(cta(page)).toHaveText('Continuar');
});

test('aviso-pc · 2.2A · sin miniventana en el navegador, no hay botón', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, focusMinutes: 5 });
  await context.addInitScript(() => { try { delete Window.prototype.documentPictureInPicture; delete window.documentPictureInPicture; } catch (e) {} });
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  expect(await page.evaluate(() => 'documentPictureInPicture' in window)).toBe(false);
  await empezarFoco(page);
  await expect(botonMini(page)).toHaveCount(0);
});

test('aviso-pc · 2.2A · en la pausa no hay botón', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false });
  await miniventanaFalsa(context);
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await page.locator('[data-pace-tabs] button').filter({ hasText: 'Pausa' }).first().click();
  await cta(page).click();
  await expect(cta(page)).toHaveText('Pausar');
  await expect(botonMini(page)).toHaveCount(0);
});
