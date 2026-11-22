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
  /* Con `miniSolaNo` la tira no se abre sola al empezar (la cerró a mano otra vez): queda el botón. */
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, focusMinutes: 5, miniSolaNo: true });
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

/* LA MINIVENTANA SE ABRE SOLA AL PULSAR «EMPEZAR» (Ez, «A: recuerda el cierre», 20 nov. 2026). Dentro del
   mismo toque, porque el navegador solo la abre con un gesto. Si la persona la cierra con el Foco en
   marcha, PACE lo recuerda (`miniSolaNo`) y deja de abrirla sola; abrirla a mano lo deshace. */
const estadoGuardado = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2') || '{}'));

test('mini-sola · al pulsar «Empezar foco» la tira se abre sola; cerrada a mano, ya no, y abrirla a mano lo deshace', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, focusMinutes: 5 });
  await miniventanaFalsa(context);
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await empezarFoco(page);
  await expect(tira(page), 'al pulsar «Empezar foco» la miniventana no se abrió').toContainText(/0[45]:\d\d/);
  /* La cierra a mano, con el Foco en marcha. */
  await page.evaluate(() => document.querySelector('[data-pip-falso]').remove());
  await esperarEnPagina(page, () => JSON.parse(localStorage.getItem('pace.state.v2')).miniSolaNo === true);
  await expect(botonMini(page), 'el botón sigue para abrirla a mano').toBeVisible();
  await cta(page).click();
  await page.getByRole('button', { name: 'Reiniciar bloque' }).click();
  await empezarFoco(page);
  await expect(page.locator('[data-pip-falso]'), 'la cerró a mano y se volvió a abrir sola').toHaveCount(0);
  await botonMini(page).click();
  await expect(tira(page)).toContainText(/0[45]:\d\d/);
  expect((await estadoGuardado(page)).miniSolaNo, 'abrirla a mano no lo deshizo').toBe(false);
});

test('mini-sola · sin toque no se abre sola: ni el Foco que vuelve al recargar ni un toque que el navegador no da por bueno', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, focusMinutes: 5 });
  await miniventanaFalsa(context);
  await context.clock.install({ time: ARRANQUE });
  await context.addInitScript(() => {
    if (window.top !== window || sessionStorage.getItem('sembrado')) return;
    sessionStorage.setItem('sembrado', '1');
    const ahora = Date.now();
    localStorage.setItem('pace.timer.v1', JSON.stringify({ endsAt: ahora + 4 * 60 * 1000, inicio: ahora - 60 * 1000, mode: 'foco', minutes: 5, id: 'vuelve' }));
  });
  await irAlArtefacto(page);
  await expect(cta(page)).toHaveText('Pausar');
  expect(await page.evaluate(() => window.__pipPedido), 'el Foco que vuelve al recargar abrió la miniventana').toBeUndefined();
  /* `page.evaluate` cuenta como toque para el navegador: el «sin toque» se finge en `userActivation`. */
  await page.evaluate(() => Object.defineProperty(navigator, 'userActivation', { configurable: true, get: () => ({ isActive: false, hasBeenActive: true }) }));
  await cta(page).click();
  await page.getByRole('button', { name: 'Reiniciar bloque' }).click();
  await empezarFoco(page);
  expect(await page.evaluate(() => window.__pipPedido), 'sin un toque de verdad se abrió la miniventana').toBeUndefined();
  await expect(page.locator('[data-pip-falso]')).toHaveCount(0);
});

/* LA TIRA EN LA JORNADA DE «A TU RITMO» (Ez, 2A del 21 nov. 2026; auditoría de la 0.212.0, hallazgo 3).
   Habla como el aro («Foco · Bloque 1 de 8»); al acabar el bloque sin mirar PACE se pone en terracota con
   «Foco terminado» y «Volver» hasta que vuelves, aunque el aro ya cuente la pausa; y en la pausa de la
   jornada enseña la cuenta sin botón, porque el aro la vuelve a poner en marcha. */
const JORNADA = { fecha: '2026-09-17', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const HORA_JORNADA = new Date('2026-09-17T09:00:00+02:00');
async function hastaLaPausaDeLaJornada(page, context) {
  for (let i = 0; i < 30; i++) {
    if (await page.evaluate(() => !!(getState().ritmo.dia || {}).pausaHasta)) break;
    await context.clock.fastForward(5 * 60000);
    await context.clock.runFor(1500);
  }
  await esperarEnPagina(page, () => !!(getState().ritmo.dia || {}).pausaHasta);
  await context.clock.runFor(2000);
}

test('jornada · la tira habla como el aro: «Foco · Bloque 1 de N», no «Ciclo 1 / 4»', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, ritmo: { dia: JORNADA } });
  await miniventanaFalsa(context);
  await context.clock.install({ time: HORA_JORNADA });
  await irAlArtefacto(page);
  await cta(page).click();
  await expect(tira(page)).toContainText(/Foco · Bloque 1 de \d+/);
  await expect(tira(page)).not.toContainText('Ciclo');
});

test('jornada · al acabar el bloque sin mirar PACE, la tira dice «Foco terminado» hasta que vuelves; luego, la pausa sin botón', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, ritmo: { dia: JORNADA } });
  await miniventanaFalsa(context);
  await navegadorConAvisos(context);
  await context.clock.install({ time: HORA_JORNADA });
  await irAlArtefacto(page);
  await cta(page).click();
  await expect(tira(page)).toContainText('Foco');
  await hastaLaPausaDeLaJornada(page, context);
  await expect(tira(page), 'el bloque acabó y la tira pasó directa a contar la pausa').toHaveAttribute('data-fin', '');
  await expect(tira(page)).toContainText('Foco terminado');
  await expect(tira(page).getByRole('button', { name: 'Volver' })).toBeVisible();
  await page.evaluate(() => { window.__visible = true; document.dispatchEvent(new Event('visibilitychange')); });
  await context.clock.runFor(1500);
  await expect(tira(page)).not.toHaveAttribute('data-fin', '');
  await expect(tira(page)).toContainText('Pausa corta');
  await expect(tira(page).getByRole('button'), 'en la pausa de la jornada la tira no lleva botón').toHaveCount(0);
});

/* Hallazgo 3 de la auditoría de la 0.212.0 (docs/audits/auditoria-0212-20nov/caen-en-main.spec.js), tal cual. */
test('hallazgo 3 · con «A tu ritmo», el «Pausar» de la tira en la pausa pausa de verdad', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, ritmo: { dia: JORNADA } });
  await miniventanaFalsa(context);
  await context.clock.install({ time: HORA_JORNADA });
  await irAlArtefacto(page);
  await cta(page).click();
  await page.evaluate(() => paceMiniAbrir());
  await expect(tira(page)).toContainText('Foco');
  await hastaLaPausaDeLaJornada(page, context);
  await expect(tira(page)).toContainText('Pausa corta');
  const boton = tira(page).getByRole('button', { name: 'Pausar' });
  if (await boton.count()) {
    const antes = await tira(page).locator('span').first().innerText();
    await boton.click();
    await context.clock.runFor(3000);
    expect(await tira(page).locator('span').first().innerText(), 'la tira ofrece «Pausar» y la pausa sigue corriendo').toBe(antes);
  }
});

/* 3A DE EZ (caza web del 22 nov. 2026): acabada la pausa de la jornada, la tira se quedaba en «45:00 · Foco ·
   Bloque 2 de N», quieta y sin botón, como un Foco en pausa. Ahora dice «Pausa terminada · Vuelve a PACE para
   el bloque 2» con «Volver». Contra main cae: «45:00» y ningún botón. */
test('jornada · 3A · acabada la pausa, la tira dice «Pausa terminada» y lleva a PACE para el bloque 2', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, ritmo: { dia: JORNADA } });
  await miniventanaFalsa(context);
  await context.clock.install({ time: HORA_JORNADA });
  await irAlArtefacto(page);
  await cta(page).click();
  await expect(tira(page)).toContainText('Foco');
  await hastaLaPausaDeLaJornada(page, context);
  await expect(tira(page), 'GUARD: la pausa de la jornada').toContainText('Pausa corta');
  for (let i = 0; i < 12 && await page.evaluate(() => !!(getState().ritmo.dia || {}).pausaHasta); i++) {
    await context.clock.fastForward(60000);
    await context.clock.runFor(1500);
  }
  await expect(cta(page), 'GUARD: el aro espera el bloque 2').toHaveText('Empezar bloque 2');
  await expect(tira(page)).toContainText('Pausa terminada');
  await expect(tira(page)).toContainText('Vuelve a PACE para el bloque 2');
  await expect(tira(page).getByRole('button', { name: 'Volver' })).toBeVisible();
});
