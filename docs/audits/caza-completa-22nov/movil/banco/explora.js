'use strict';
const path = require('path');
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/caza-movil-22nov-a63749';
const { chromium } = require(path.join(WT, 'node_modules', '@playwright/test'));
const BASE = 'http://localhost:8951';
const OUT = path.join(__dirname, 'shots');
require('fs').mkdirSync(OUT, { recursive: true });

const SEMILLA = { firstSeen: 1, langAuto: false, ritmo: { libre: true }, novedadesVistas: '*', copiaAvisoVisto: '*', soundOn: false, sidebarCollapsed: true };

let browser;
async function nav() { if (!browser) browser = await chromium.launch({ args: ['--disable-blink-features=DocumentPictureInPictureAPI'] }); return browser; }

async function abrir({ w = 360, h = 640, lang = 'es', palette = 'crema', semilla = {}, hora = '2026-11-23T10:00:00+01:00', vacio = false, init } = {}) {
  const b = await nav();
  const context = await b.newContext({ baseURL: BASE, viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid', colorScheme: palette === 'crema' ? 'light' : 'dark',
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] } });
  if (!vacio) await context.addInitScript(([s]) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    [Object.assign({}, SEMILLA, { lang, palette }, semilla)]);
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errores.push(m.type() + ': ' + m.text().slice(0, 300)); });
  if (hora) await page.clock.install({ time: new Date(hora) });
  await page.goto('/index.html');
  if (!vacio) await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  return { context, page, errores };
}

async function agrandar(page, f = 1.15) {
  await page.evaluate((k) => {
    /* solo lo que aún no se agrandó: así se puede llamar en cada paso de un recorrido */
    const els = Array.from(document.querySelectorAll('body *')).filter((e) => !e.hasAttribute('data-agr'));
    const tam = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
    els.forEach((e, i) => { e.setAttribute('data-agr', ''); e.style.setProperty('font-size', (tam[i] * k) + 'px', 'important'); });
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('pace:home-relayout'));
  }, f);
  await page.waitForTimeout(600);
}

/* Sonda genérica: lo que se sale, se corta, se pisa, pide scroll o se toca mal. */
function sonda(page, raiz) {
  return page.evaluate((raizSel) => {
    const W = innerWidth, H = innerHeight;
    const root = raizSel ? document.querySelector(raizSel) : document.body;
    if (!root) return { error: 'sin raíz ' + raizSel };
    const desc = (e) => {
      const d = [...e.attributes].map(a => a.name).filter(n => n.startsWith('data-pace')).slice(0, 2).join(',');
      return e.tagName.toLowerCase() + (d ? '[' + d + ']' : '') + ' «' + (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40) + '»';
    };
    const visible = (e) => {
      const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
      for (let x = e; x && x !== document.documentElement; x = x.parentElement) {
        const cs = getComputedStyle(x); if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.05) return false;
      }
      return true;
    };
    const arriba = (e) => { const r = e.getBoundingClientRect(); const cx = Math.min(W - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(H - 1, Math.max(0, r.top + r.height / 2));
      const t = document.elementFromPoint(cx, cy); return t && (t === e || e.contains(t) || t.contains(e)); };
    const conTexto = (e) => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
    const out = { hscroll: document.documentElement.scrollWidth - W, vscrollDoc: document.documentElement.scrollHeight - H, fuera: [], cortados: [], scrollers: [], pequenos: [], pisados: [] };
    const textos = [];
    for (const e of root.querySelectorAll('*')) {
      if (!visible(e)) continue;
      const cs = getComputedStyle(e);
      if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && e.scrollHeight > e.clientHeight + 1 && e.clientHeight > 40)
        out.scrollers.push(desc(e) + ' +' + (e.scrollHeight - e.clientHeight));
      if (!conTexto(e)) continue;
      const r = e.getBoundingClientRect();
      if (r.right > W + 1 || r.left < -1) out.fuera.push(desc(e) + ' x' + Math.round(r.left) + '..' + Math.round(r.right));
      if ((cs.textOverflow === 'ellipsis' || cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.webkitLineClamp !== 'none') && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2))
        out.cortados.push(desc(e) + ' w' + e.clientWidth + '/' + e.scrollWidth + ' h' + e.clientHeight + '/' + e.scrollHeight);
      if (arriba(e) && r.top < H && r.bottom > 0) textos.push([e, r]);
    }
    /* textos que se pisan (los dos a la vista, sin ser uno parte del otro) */
    for (let i = 0; i < textos.length; i++) for (let j = i + 1; j < textos.length; j++) {
      const [a, ra] = textos[i], [b, rb] = textos[j];
      if (a.contains(b) || b.contains(a)) continue;
      const ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (ix > 3 && iy > 3) out.pisados.push(desc(a) + ' ⟂ ' + desc(b) + ' ' + Math.round(ix) + '×' + Math.round(iy));
    }
    /* toques: cuánto responde al botón en su cruz central */
    for (const e of root.querySelectorAll('button, [role="button"], a[href], input, select, [role="switch"], [role="tab"]')) {
      if (!visible(e)) continue;
      const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let alto = 0, ancho = 0;
      for (let y = Math.max(0, r.top - 30); y <= Math.min(H - 1, r.bottom + 30); y += 1) { const t = document.elementFromPoint(cx, y); if (t && (t === e || e.contains(t))) alto++; }
      for (let x = Math.max(0, r.left - 30); x <= Math.min(W - 1, r.right + 30); x += 1) { const t = document.elementFromPoint(x, cy); if (t && (t === e || e.contains(t))) ancho++; }
      if (alto === 0 && ancho === 0) continue;   // tapado (otra capa encima)
      if (alto < 40 || ancho < 40) out.pequenos.push(desc(e) + ' ' + ancho + '×' + alto + ' (caja ' + Math.round(r.width) + '×' + Math.round(r.height) + ')');
    }
    return out;
  }, raiz || null);
}

function resumen(nombre, s, errores) {
  const l = [];
  const add = (k, v) => { if (v && (Array.isArray(v) ? v.length : v > 1)) l.push('  ' + k + ': ' + (Array.isArray(v) ? '\n    ' + v.join('\n    ') : v)); };
  add('hscroll', s.hscroll); add('vscrollDoc', s.vscrollDoc); add('fuera', s.fuera); add('cortados', s.cortados);
  add('scrollers', s.scrollers); add('pisados', s.pisados); add('pequenos', s.pequenos);
  if (errores && errores.length) add('errores', [...new Set(errores)]);
  return '== ' + nombre + (l.length ? '\n' + l.join('\n') : ' · limpio');
}

async function foto(page, nombre) { await page.screenshot({ path: path.join(OUT, nombre + '.png') }); }

module.exports = { abrir, agrandar, sonda, resumen, foto, nav, cerrar: async () => browser && browser.close(), OUT };
