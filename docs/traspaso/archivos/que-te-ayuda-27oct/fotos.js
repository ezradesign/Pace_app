// Fotos de «Qué te ayuda»: el index.html de hoy con la propuesta metida antes de montar la app.
// Uso: node fotos.js <carpeta-de-fotos> [solo-esta-escena], con la app servida en el 8806
// (PORT=8806 node .claude/static-server.js, desde la raíz del repo). Las fotos no se suben.
// Cada escena sale a 360 y a 1280 px, en claro y en oscuro, en español y en inglés, y deja al
// lado un .json con lo que mide la vista: si pide scroll y cuánto.
'use strict';
const path = require('path');
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const { chromium } = require(R + '/node_modules/playwright');
const aplicar = require('./propuesta.js');
const OUT = path.resolve(process.argv[2] || __dirname + '/fotos');
const SOLO = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
const PUERTO = process.env.PACE_E2E_PORT || '8806';
const HORA = '2026-10-27T10:00:00+01:00';

/* El martes de la foto son las 10:00: un Foco hecho y aún ninguna pausa ni vaso, como dice «Hoy».
   Seis semanas de uso de ejemplo en el historial, para que la semana y el mes no salgan a cero
   al lado de las ideas. Por calendario y en local, nunca con new Date('YYYY-MM-DD'). */
function historial() {
  const dias = {};
  const d0 = new Date(2026, 8, 14);
  for (let i = 0; i <= 42; i++) {
    const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + i);
    const dow = (d.getDay() + 6) % 7;
    const finde = dow >= 5;
    const s = (i * 37 + 11) % 13;
    if (finde && s % 3) continue;
    if (!finde && s === 4) continue;
    const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    dias[iso] = finde
      ? { focusMinutes: 0, breathMinutes: 4 + (s % 4), moveMinutes: 6 + s, waterGlasses: 3 + (s % 3), holdSeconds: 0 }
      : { focusMinutes: 50 + (s * 9) % 100, breathMinutes: 3 + (s % 6), moveMinutes: 4 + (s * 3) % 10, waterGlasses: 4 + (s % 4), holdSeconds: 0 };
  }
  const months = {}, years = {};
  for (const [iso, v] of Object.entries(dias)) {
    for (const [k, mapa] of [[iso.slice(0, 7), months], [iso.slice(0, 4), years]]) {
      const a = mapa[k] || (mapa[k] = { focusMinutes: 0, breathMinutes: 0, moveMinutes: 0, waterGlasses: 0, holdSeconds: 0 });
      for (const c of Object.keys(a)) a[c] += v[c] || 0;
    }
  }
  return { days: dias, months, years };
}
const H = historial();
const lunes = H.days['2026-10-26'] || { focusMinutes: 0, breathMinutes: 0, moveMinutes: 0, waterGlasses: 0 };
const SEMILLA = {
  firstSeen: 1, langAuto: false, paletteAuto: false, ritmo: { libre: true },
  lastActiveDay: 'Tue Oct 27 2026', _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true,
  history: H,
  weeklyStats: {
    focusMinutes: [lunes.focusMinutes, 50, 0, 0, 0, 0, 0], breathMinutes: [lunes.breathMinutes, 0, 0, 0, 0, 0, 0],
    moveMinutes: [lunes.moveMinutes, 0, 0, 0, 0, 0, 0], waterGlasses: [lunes.waterGlasses, 0, 0, 0, 0, 0, 0], holdSeconds: [0, 0, 0, 0, 0, 0, 0],
  },
};

const VARIANTES = [];
for (const w of [360, 1280]) for (const pal of ['crema', 'oscuro']) for (const lang of ['es', 'en']) VARIANTES.push({ w, pal, lang });
const tag = (v) => v.w + '-' + v.pal + '-' + v.lang;

async function abrir(browser, v, cfg) {
  const movil = v.w < 700;
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: movil ? 740 : 720 }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: v.lang === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: v.pal === 'oscuro' ? 'dark' : 'light',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    Object.assign({}, SEMILLA, { lang: v.lang, palette: v.pal, sidebarCollapsed: movil }));
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(HORA) });
  /* La propuesta entra en el index antes de montar la app: el panel de Estadísticas que se pinta
     ya es el de la propuesta. */
  await page.route('**/index.html', async (route) => {
    const res = await route.fetch();
    const html = await res.text();
    const ancla = "if (typeof document !== 'undefined' && document.getElementById('pace-root')) {";
    if (html.indexOf(ancla) === -1) throw new Error('sin ancla en index.html');
    const c = Object.assign({ lang: v.lang }, cfg);
    await route.fulfill({ response: res, body: html.replace(ancla, () => 'window.__qtaTab = ' + JSON.stringify(cfg.tab || 'today') + ';\nwindow.__propuesta = ('
      + aplicar.toString() + ')(' + JSON.stringify(c) + ');\n' + ancla) });
  });
  await page.goto('http://localhost:' + PUERTO + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
  await page.waitForTimeout(400);
  return { ctx, page };
}

async function abrirStats(page) {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0)
      .find((x) => /stat|estad|ritmo|rhythm/i.test((x.getAttribute('aria-label') || '') + ' ' + (x.title || '')));
    if (!b) throw new Error('no encuentro el botón de estadísticas');
    b.click();
  });
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await page.waitForTimeout(900);
}

/* Lo que mide la vista: su alto, y si algo del panel pide scroll (y cuánto). */
async function medir(page) {
  return page.evaluate(() => {
    const card = document.querySelector('[data-pace-modal-card]');
    const vista = document.querySelector('[data-pace-stats-vistas]');
    const sobra = [...(card ? card.querySelectorAll('*') : [])].concat(card ? [card] : [])
      .filter((e) => /auto|scroll/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1)
      .map((e) => e.scrollHeight - e.clientHeight);
    const tabs = [...document.querySelectorAll('[data-pace-stats-tab]')].map((b) => ({
      k: b.getAttribute('data-pace-stats-tab'), w: Math.round(b.getBoundingClientRect().width), corta: b.scrollWidth > b.clientWidth + 1 }));
    const r = vista ? vista.getBoundingClientRect() : null;
    return { vista: r ? Math.round(r.height) : null, scroll: sobra.length ? Math.max.apply(null, sobra) : 0, tabs,
      ejemplo: document.querySelectorAll('[data-pace-qta-ejemplo]').length };
  });
}

const ESCENAS = {
  '1a': { dice: 'a', datos: 'lleno', sitio: 'pestana', tab: 'ayuda' },
  '1b': { dice: 'b', datos: 'lleno', sitio: 'pestana', tab: 'ayuda' },
  '1c': { dice: 'c', datos: 'lleno', sitio: 'pestana', tab: 'ayuda' },
  '2a': { datos: 'vacio', antes: 'a', sitio: 'pestana', tab: 'ayuda' },
  '2a-medio': { datos: 'medio', antes: 'a', sitio: 'pestana', tab: 'ayuda' },
  '2b': { datos: 'vacio', antes: 'b', sitio: 'pestana', tab: 'ayuda' },
  '2c': { datos: 'vacio', antes: 'c', sitio: 'pestana', tab: 'ayuda' },
  '3a-cerrada': { dice: 'a', datos: 'lleno', sitio: 'pestana', tab: 'today', cerrado: true, invitacion: true },
  '3b-semana': { dice: 'a', datos: 'lleno', sitio: 'dentro', tab: 'week' },
  '3b-mes': { dice: 'a', datos: 'lleno', sitio: 'dentro', tab: 'month' },
  '3b-cerrada': { dice: 'a', datos: 'lleno', sitio: 'dentro', tab: 'week', cerrado: true },
};

(async () => {
  const browser = await chromium.launch();
  const medidas = {};
  for (const [nombre, cfg] of Object.entries(ESCENAS)) {
    if (SOLO && SOLO !== nombre) continue;
    for (const v of VARIANTES) {
      const n = nombre + '_' + tag(v);
      try {
        const { ctx, page } = await abrir(browser, v, cfg);
        await abrirStats(page);
        medidas[n] = await medir(page);
        await page.screenshot({ path: OUT + '/' + n + '.png' });
        if (medidas[n].scroll > 0) {
          await page.evaluate(() => {
            const card = document.querySelector('[data-pace-modal-card]');
            [...card.querySelectorAll('*')].concat([card]).forEach((e) => { if (/auto|scroll/.test(getComputedStyle(e).overflowY)) e.scrollTop = e.scrollHeight; });
          });
          await page.waitForTimeout(300);
          await page.screenshot({ path: OUT + '/' + n + '_abajo.png' });
        }
        if (cfg.invitacion) {
          await page.locator('[data-pace-stats-tab="ayuda"]').click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: OUT + '/' + nombre + '-invitacion_' + tag(v) + '.png' });
        }
        console.log(n, JSON.stringify(medidas[n]));
        await ctx.close();
      } catch (e) { console.log('FALLO', n, e.message.split('\n')[0]); }
    }
  }
  const previo = fs.existsSync(OUT + '/medidas.json') ? JSON.parse(fs.readFileSync(OUT + '/medidas.json', 'utf8')) : {};
  fs.writeFileSync(OUT + '/medidas.json', JSON.stringify(Object.assign(previo, medidas), null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
