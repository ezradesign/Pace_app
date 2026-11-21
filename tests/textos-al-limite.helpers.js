/* PACE · tests/textos-al-limite.helpers.js — CÓMO SE ABRE CADA PANTALLA PARA MEDIR SUS TEXTOS
   ==========================================================================================
   Lo comparten la medida (textos-al-limite.mide.js, que recorre todo y apunta) y la prueba
   (textos-al-limite.spec.js, que vigila los textos acortados con la 7A de Ez). Cada `abre*` deja la
   pantalla quieta y devuelve `{ context, page, opts }`, con `opts` listo para `sondaTextos`.
   La letra al 115 % se emula como en home-sin-scroll.spec.js: ×1,15 el tamaño calculado de cada
   elemento, que es lo que hace el WebView de Android con la letra grande del sistema. */
'use strict';

const { expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const FECHA = '2026-10-08';
const hora = (hhmm) => new Date(FECHA + 'T' + hhmm + ':00+02:00');
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
/* Los momentos de la home, los de home-sin-scroll.spec.js. `lastActiveDay` en el formato del relevo de
   día (toDateString) para que no ponga `cycle` a cero. */
const MOMENTOS = [
  { nombre: 'la tarjeta corta', semilla: { ritmo: { libre: true } }, hora: '10:00' },
  { nombre: 'la pregunta', semilla: { ritmo: { libre: true } }, hora: '10:00', comienza: true },
  { nombre: 'el día servido llegando a las 10:00', semilla: { ritmo: { libre: true } }, hora: '10:00', comienza: true, elige: 'jornada' },
  { nombre: 'el día servido al empezar', semilla: { ritmo: { dia: JORNADA } }, hora: '09:00' },
  { nombre: 'el día ya contestado', semilla: { ritmo: { semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'] } }, hora: '08:30' },
  { nombre: 'la pausa abierta', semilla: { ritmo: { dia: Object.assign({}, JORNADA, { pausa: 1 }) }, cycle: 1,
    lastActiveDay: 'Thu Oct 08 2026', _historyMigrated: true }, hora: '09:50' },
  { nombre: 'el bloque terminado al volver', semilla: { ritmo: { libre: true } }, hora: '10:40', terminoA: '10:35' },
];

async function contexto(browser, baseURL, { w, h, lang, semilla }) {
  const movil = w < 768;
  const context = await browser.newContext({ baseURL, viewport: { width: w, height: h }, isMobile: movil, hasTouch: movil,
    locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
  await sembrar(context, Object.assign({ lang, soundOn: false }, movil ? { sidebarCollapsed: true } : {}, semilla || {}));
  return context;
}

async function agrandar(page, f) {
  if (f === 1) return;
  await page.evaluate((k) => {
    const els = Array.from(document.querySelectorAll('body *'));
    const tam = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
    els.forEach((e, i) => e.style.setProperty('font-size', (tam[i] * k) + 'px', 'important'));
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('pace:home-relayout'));
  }, f);
}

async function asentar(page, home) {
  await page.evaluate(() => document.fonts.ready);
  if (home) await asentarGeometria(page);
  else await page.waitForTimeout(600);
}

/* Un bloque de 25 que terminó con PACE cerrado: al abrir, la pausa (foco-3). */
async function bloqueTerminado(context, hhmm) {
  await context.addInitScript((fin) => {
    if (!localStorage.getItem('pace.timer.v1')) localStorage.setItem('pace.timer.v1', JSON.stringify({ endsAt: fin, mode: 'foco', minutes: 25, id: 'vuelta' }));
  }, hora(hhmm).getTime());
}

/* La home del móvil en un momento de home-sin-scroll.spec.js (`m`: semilla, hora, comienza, elige, terminoA). */
async function abreHome(browser, baseURL, { lang, w, h, letra, m }) {
  const context = await contexto(browser, baseURL, { w, h, lang, semilla: m.semilla });
  if (m.terminoA) await bloqueTerminado(context, m.terminoA);
  const page = await context.newPage();
  await page.clock.install({ time: hora(m.hora) });
  await irAlArtefacto(page);
  if (m.comienza) await vis(page, '[data-pace-ritmo-comienza]').click();
  if (m.elige) await vis(page, 'button[data-pace-ritmo-opcion="' + m.elige + '"]').click();
  if (m.terminoA) {
    await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(1);
    await expect(async () => {
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(0, { timeout: 1000 });
    }).toPass();
  }
  await page.mouse.move(1, 1);
  await agrandar(page, letra);
  await asentar(page, true);
  return { context, page, opts: { raices: ['body'], soloPantalla: true }, home: true };
}

const ABRIR = { es: 'Abrir ajustes', en: 'Open settings' };
/* Ajustes; `caso`: 'web', 'android', 'avisos sin decidir' o 'avisos bloqueados' (lo que dice Chromium headless). */
async function abreAjustes(browser, baseURL, { lang, w, h, letra, caso }) {
  const context = await contexto(browser, baseURL, { w, h, lang, semilla: { notifyFocusEnd: true } });
  if (caso === 'avisos sin decidir') await context.addInitScript(() => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {}
  });
  const page = await context.newPage();
  await page.clock.install({ time: hora('12:00') });
  await irAlArtefacto(page);
  if (caso === 'android') await page.evaluate(() => {
    window.paceNativoAvisos = () => true; window.pacePlataformaNativa = () => 'android';
    window.paceNativoAvisoPermiso = () => 'granted'; window.paceEsNativo = () => true;
    window.paceAndroidAvisoExacto = () => 'denied'; window.paceAndroidAvisoExactoMirar = () => Promise.resolve('denied');
  });
  await vis(page, 'button[aria-label="' + ABRIR[lang] + '"]').first().click();
  await page.locator('[data-pace-tweaks-panel]').waitFor({ state: 'visible' });
  await page.waitForTimeout(450);
  await agrandar(page, letra);
  await asentar(page, false);
  return { context, page, opts: { raices: ['[data-pace-tweaks-panel]'] } };
}

/* La pausa por libre, que sale como modal (en un día servido se queda en la tarjeta de la home). */
async function abrePausa(browser, baseURL, { lang, letra }) {
  const context = await contexto(browser, baseURL, { w: 360, h: 640, lang, semilla: { ritmo: { libre: true } } });
  await bloqueTerminado(context, '10:35');
  const page = await context.newPage();
  await page.clock.install({ time: hora('10:40') });
  await irAlArtefacto(page);
  await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(1);
  await page.waitForTimeout(700);
  await agrandar(page, letra);
  await asentar(page, false);
  return { context, page, opts: { subeDesde: '[data-pace-break-shortcut]', raices: [] } };
}

/* El runner de una rutina, al colocarse. Un contexto limpio por rutina: con el de otra, la sesión a
   medias que guarda el runner (MoveSessionV1.reanudar.jsx) no deja abrir la siguiente. La pila del
   runner lleva, invisibles, todos los textos de la rutina, así que una vez por rutina basta. */
async function abreRunner(browser, baseURL, { lang, letra, id }) {
  const context = await contexto(browser, baseURL, { w: 360, h: 640, lang });
  const page = await context.newPage();
  await page.clock.install({ time: new Date('2026-11-18T10:00:00+01:00') });
  await irAlArtefacto(page);
  await page.evaluate((x) => {
    const r = window.resolveBodyRoutine(x);
    window.dispatchEvent(new CustomEvent('pace:hacerla', { detail: { routine: r.routine, kind: r.source } }));
  }, id);
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(ahora + 1000);
  await agrandar(page, letra);
  await asentar(page, false);
  return { context, page, opts: { raices: ['[data-pace-session-root]'], efectoReservas: true } };
}

/* Lo que le sobra a un texto: en una línea, el hueco; en varias, la separación de letra que aguanta
   por las letras de una línea (es como se parece más la letra de otro sistema). */
const sobra = (t) => (t.lineas === 1 ? t.margen : t.porLetra * t.letras / t.lineas);

module.exports = { FECHA, JORNADA, MOMENTOS, hora, vis, contexto, agrandar, asentar, abreHome, abreAjustes, abrePausa, abreRunner, sobra };
