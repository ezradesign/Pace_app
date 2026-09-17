/* PACE · BANCO DEL PANEL DE STATS (s191)
 * ======================================
 * `STATS_DESTINO_PROPUESTA.md` trae un presupuesto de alturas medido en s129 sobre
 * **v0.71.0**. Hoy la app va por v0.121.0: cincuenta versiones, y por el camino s176
 * rehizo el panel entero para que las cuatro pestañas compartan caja. Un plan que se
 * ejecuta contra numeros caducados decide mal, asi que antes de tocar nada se vuelve a
 * medir -- la leccion de s183, donde un plan sin re-medir acumulo tareas fantasma.
 *
 * QUE MIDE
 *   A · el CROMO del modal (cabecera + pestañas + paddings) y el alto de cada pestaña,
 *       en escritorio y en movil, con datos de PEOR CASO (un año completo);
 *   B · si alguna pestaña scrollea y cuanto salta el modal al cambiar de pestaña --
 *       que es justo lo que s176 arreglo y lo que la Fase 0 del documento pide;
 *   C · que puede dar `pace.events.v1` HOY para las vistas Hoy y Semana: el documento
 *       lo daba por «no derivable» porque lo escribio antes de que los eventos
 *       existieran, y desde s172/s190 existen.
 *
 * LO QUE NO MIDE: nada visual. Que el panel sea BONITO no lo dice este guion; eso se
 * decide mirando una maqueta, que es la regla del proyecto.
 *
 * Uso: node .claude/static-server.js   (aparte)
 *      node scripts/audit/banco-stats-s191.js
 */
'use strict';

const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const BASE = 'http://localhost:8765/index.html';

/* Un año completo de historia, dos Caminos repetidos y una semana con datos: el peor
   caso que el documento uso para su presupuesto. */
function estadoPeorCaso() {
  const days = {};
  const hoy = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i);
    const p = n => String(n).padStart(2, '0');
    const iso = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    /* Uno de cada cinco dias sin registro: un calendario lleno del todo no es peor
       caso, es un caso falso. */
    if (i % 5 === 0) continue;
    days[iso] = {
      focusMinutes: 25 + (i % 3) * 20,
      breathMinutes: (i % 4) * 5,
      moveMinutes: (i % 3) * 4,
      waterGlasses: i % 9,
    };
  }
  return {
    firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
    lastActiveDay: new Date().toDateString(),
    history: { days: days, months: {}, years: {} },
    weeklyStats: {
      focusMinutes: [25, 50, 0, 75, 25, 0, 45],
      breathMinutes: [5, 0, 10, 5, 0, 0, 15],
      moveMinutes: [4, 8, 0, 4, 0, 0, 8],
      waterGlasses: [6, 8, 3, 7, 5, 0, 4],
      holdSeconds: [0, 0, 120, 0, 0, 0, 240],
    },
    paths: {
      current: null, favorite: 'path.calma', lastViewed: 'path.calma',
      completed: { 'path.calma': { count: 3, lastDoneAt: Date.now() },
                   'path.cuerpo': { count: 1, lastDoneAt: Date.now() } },
      history: [],
    },
  };
}

async function abrirStats(page) {
  /* La sidebar lleva la entrada a Stats; en movil vive en el cajon. El boton se busca
     por SENTIDO y no por cadena fija, que es lo que aguanta un cambio de copy. */
  const abridor = page.getByRole('button', { name: /Estad|Stats|Ritmo/ }).first();
  if (await abridor.count()) { await abridor.click(); await page.waitForTimeout(500); return true; }
  const menu = page.getByRole('button', { name: /Men|Abrir|Panel/ }).first();
  if (await menu.count()) {
    await menu.click(); await page.waitForTimeout(400);
    const otra = page.getByRole('button', { name: /Estad|Stats|Ritmo/ }).first();
    if (await otra.count()) { await otra.click(); await page.waitForTimeout(500); return true; }
  }
  return false;
}

const medirModal = (page) => page.evaluate(() => {
  const vistas = document.querySelector('[data-pace-stats-vistas]');
  if (!vistas) return null;
  let modal = vistas.parentElement;
  while (modal && modal.getBoundingClientRect().height < 200) modal = modal.parentElement;
  const r = m => Math.round(m * 10) / 10;
  const caja = modal.getBoundingClientRect();
  const v = vistas.getBoundingClientRect();
  return {
    modal: r(caja.height),
    vista: r(v.height),
    /* El cromo es lo que el contenido NO puede usar. */
    cromo: r(caja.height - v.height),
    scrollVista: vistas.scrollHeight > vistas.clientHeight + 1
      ? r(vistas.scrollHeight - vistas.clientHeight) : 0,
    scrollModal: modal.scrollHeight > modal.clientHeight + 1
      ? r(modal.scrollHeight - modal.clientHeight) : 0,
  };
});

async function tanda(browser, ancho, alto, etiqueta) {
  const ctx = await browser.newContext({
    viewport: { width: ancho, height: alto }, deviceScaleFactor: 1,
    isMobile: ancho < 768, hasTouch: ancho < 768,
  });
  await ctx.addInitScript((e) => {
    localStorage.setItem('pace.state.v2', JSON.stringify(e));
  }, estadoPeorCaso());
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  console.log('\n--- ' + etiqueta + ' (' + ancho + 'x' + alto + ') ---');
  if (!await abrirStats(page)) {
    console.log('  [GUARD] no se encontro la entrada a Stats');
    const botones = (await page.getByRole('button').allInnerTexts()).map(x => x.trim().split('\n')[0]).filter(Boolean);
    console.log('  botones visibles: ' + JSON.stringify(botones.slice(0, 24)));
    await ctx.close();
    return;
  }

  const pestanas = await page.evaluate(() => {
    const c = document.querySelector('[data-pace-stats-vistas]');
    if (!c) return [];
    const barra = c.previousElementSibling;
    return Array.from(barra ? barra.querySelectorAll('button') : [])
      .map(b => (b.textContent || '').trim());
  });
  console.log('  pestañas: ' + JSON.stringify(pestanas));

  const alturas = [];
  for (const nombre of pestanas) {
    await page.getByRole('button', { name: nombre, exact: true }).first().click();
    await page.waitForTimeout(350);
    const m = await medirModal(page);
    if (!m) { console.log('  ' + nombre + ': no se pudo medir'); continue; }
    alturas.push({ nombre, ...m });
    console.log('  ' + nombre.padEnd(9) + ' modal ' + String(m.modal).padStart(6)
      + ' · vista ' + String(m.vista).padStart(6) + ' · cromo ' + String(m.cromo).padStart(5)
      + ' · scroll vista ' + String(m.scrollVista).padStart(4) + ' · scroll modal ' + m.scrollModal);
  }
  if (alturas.length > 1) {
    const hs = alturas.map(a => a.modal);
    console.log('  SALTO entre pestañas: ' + (Math.round((Math.max(...hs) - Math.min(...hs)) * 10) / 10) + ' px'
      + '  (util para el contenido: ' + Math.min(...alturas.map(a => a.vista)) + '-' + Math.max(...alturas.map(a => a.vista)) + ')');
  }
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  console.log('BANCO DEL PANEL DE STATS · s191');
  console.log('================================');
  console.log('(peor caso: 365 dias de historia con 1 de cada 5 vacio, 2 Caminos, semana con datos)');
  await tanda(browser, 1280, 800, 'escritorio');
  await tanda(browser, 1536, 714, 'escritorio bajo (el de s176)');
  await tanda(browser, 390, 844, 'movil');

  /* --- C · que pueden dar los eventos hoy --- */
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript((e) => localStorage.setItem('pace.state.v2', JSON.stringify(e)), estadoPeorCaso());
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  const capacidades = await page.evaluate(async () => {
    await window.paceEventsInitialize();
    const hay = (f) => typeof window[f] === 'function';
    return {
      escribe: window.paceEventsCanWrite(),
      agregados: hay('paceEventsAggregates'),
      cuentaPorRutina: hay('paceEventsRoutineCount'),
      /* Lo que el documento daba por NO derivable, comprobado contra el payload real
         de `session.completed` y `feedback.answered`. */
      campos: window.PACE_EVENT_PAYLOAD_CAMPOS || null,
      tiposEvento: window.EVENT_TYPES,
      retencionDias: window.EVENTS_RETENTION_DAYS,
    };
  });
  console.log('\n--- C · lo que los eventos pueden dar HOY ---');
  console.log('  ' + JSON.stringify(capacidades));
  await browser.close();
})();
