'use strict';
const path = require('path');
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/caza-19nov-c2077c';
const { chromium } = require(WT + '/node_modules/playwright');
const BASE = 'http://localhost:8945';
const OUT = path.join(__dirname, 'shots');
require('fs').mkdirSync(OUT, { recursive: true });

const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, novedadesVistas: '*', copiaAvisoVisto: '*' };

async function abrir(browser, o) {
  o = o || {};
  const ctx = await browser.newContext({
    viewport: o.vp || { width: 360, height: 640 },
    locale: o.locale || 'es-ES', timezoneId: 'Europe/Madrid',
    colorScheme: o.dark ? 'dark' : 'light',
    isMobile: !!o.mobile, hasTouch: !!o.mobile, deviceScaleFactor: o.dpr || 1,
    serviceWorkers: 'block', permissions: o.permisos || ['notifications'],
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] },
  });
  if (o.estado !== null) {
    const est = Object.assign({}, SEMILLA, o.estado || {});
    await ctx.addInitScript(([e, pisar]) => { if (pisar || !localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); }, [est, !!o.pisar]);
  }
  await ctx.addInitScript(() => { try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {} });
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errores.push(m.type() + ': ' + m.text().slice(0, 300)); });
  if (o.hora) await page.clock.install({ time: o.hora });
  return { ctx, page, errores };
}

async function medir(page) {
  return page.evaluate(() => {
    const vw = innerWidth, vh = innerHeight;
    const se = document.scrollingElement;
    const peq = [];
    document.querySelectorAll('button,a,[role=button],input,select,[tabindex="0"]').forEach(el => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (!r.width || !r.height || cs.visibility === 'hidden' || r.bottom < 0 || r.top > vh) return;
      if (r.width < 24 || r.height < 24) peq.push(((el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40)) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    });
    const sinNombre = [];
    document.querySelectorAll('button,[role=button],a').forEach(el => {
      const r = el.getBoundingClientRect(); if (!r.width) return;
      const n = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').trim();
      if (!n && !el.getAttribute('aria-labelledby')) sinNombre.push(el.outerHTML.slice(0, 120));
    });
    // contenedores con scroll vertical
    const scrollers = [];
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0) scrollers.push((el.className && String(el.className).slice(0, 40) || el.tagName) + ' ' + el.scrollHeight + '/' + el.clientHeight);
    });
    return { vw, vh, docH: se.scrollHeight, docW: se.scrollWidth, peq: peq.slice(0, 30), sinNombre: sinNombre.slice(0, 10), scrollers: scrollers.slice(0, 10) };
  });
}

async function foto(page, nombre) { await page.screenshot({ path: path.join(OUT, nombre + '.png') }); }

module.exports = { chromium, abrir, medir, foto, BASE, OUT, SEMILLA, WT };
