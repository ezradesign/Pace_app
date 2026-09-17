/* PACE · CALCO de la home real para la maqueta del «menú del día» (s192)
 * =======================================================================
 * Regla de s191: lo que ya existe se CALCA de la app, no se redibuja de memoria, y la
 * maqueta tiene que abrirse con doble clic. Así que este módulo abre `index.html` en un
 * viewport, espera a la home y se lleva:
 *
 *   · el CSS de TODAS las hojas (enlazadas e inyectadas), una sola vez;
 *   · el <body> tal cual lo dejó React, sin scripts;
 *   · los atributos y el `style` de <html> (la paleta vive ahí como variables);
 *
 * y cambia cada `url(...)` y cada `src` por un data: URI, porque las rutas `/fonts/…`
 * y `/app/…` no resuelven fuera del servidor.
 *
 * El reloj va fijo a un JUEVES a las 9:00: es el caso del menú (la jornada empieza) y
 * deja el sol de la home en su posición de mañana.
 */
'use strict';

const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));

const JUEVES_9 = new Date(2026, 8, 17, 9, 0, 0);
const esMovil = (w) => w <= 640;

const semilla = (movil) => ({
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
  sidebarCollapsed: movil,
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
});

async function abrir(browser, w, h, base) {
  const movil = esMovil(w);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla(movil));
  const page = await ctx.newPage();
  await page.clock.setFixedTime(JUEVES_9);
  await page.goto(base + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  /* La home entra con `pace-module-in` (opacidad 0 → 1): a los 500 ms el aro aún no
     se ve en la captura. El calco no lo necesita —la animación se repite en la
     maqueta—, pero la foto de «cómo es hoy» sí. */
  await page.waitForTimeout(1800);
  return { ctx, page, movil };
}

/* Corre DENTRO de la página. Devuelve el calco con los recursos ya incrustados. */
async function calcarEnPagina(conCss) {
  const cache = new Map();
  const aData = async (u) => {
    if (!u || /^data:/.test(u)) return u;
    if (cache.has(u)) return cache.get(u);
    const p = fetch(u).then((r) => (r.ok ? r.blob() : null)).then((b) => !b ? u : new Promise((ok) => {
      const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b);
    })).catch(() => u);
    cache.set(u, p);
    return p;
  };
  const conUrls = async (texto, baseHref) => {
    const re = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
    const hallados = [];
    texto.replace(re, (m, q, u) => { hallados.push(u); return m; });
    const mapa = {};
    for (const u of hallados) {
      if (/^(data:|#)/.test(u)) continue;
      mapa[u] = await aData(new URL(u, baseHref).href);
    }
    return texto.replace(re, (m, q, u) => (mapa[u] ? 'url("' + mapa[u] + '")' : m));
  };

  let css = '';
  if (conCss) {
    for (const hoja of Array.from(document.styleSheets)) {
      let reglas;
      try { reglas = Array.from(hoja.cssRules); } catch (e) { continue; }
      css += await conUrls(reglas.map((r) => r.cssText).join('\n'), hoja.href || location.href) + '\n';
    }
  }

  const cuerpo = document.body.cloneNode(true);
  cuerpo.querySelectorAll('script, noscript').forEach((n) => n.remove());
  for (const img of Array.from(cuerpo.querySelectorAll('img[src]'))) {
    img.setAttribute('src', await aData(new URL(img.getAttribute('src'), location.href).href));
    img.removeAttribute('srcset');
  }
  const html = await conUrls(cuerpo.innerHTML, location.href);

  const attrs = (el) => Array.from(el.attributes).map((a) => [a.name, a.value]);
  /* Dónde vive HOY cada recomendador, para marcarlo sobre la captura. */
  const caja = (sel) => {
    const e = Array.from(document.querySelectorAll(sel)).find((x) => x.getBoundingClientRect().width > 0);
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const rects = {
    paraAhora: caja('[data-pace-sidebar-accion]'),
    actividades: caja('[data-pace-activitybar-grid]'),
    camino: caja('[data-pace-spc-card]'),
  };
  return { css, html, rects, htmlAttrs: attrs(document.documentElement), bodyAttrs: attrs(document.body) };
}

async function calcar(browser, vp, base, conCss) {
  const { ctx, page, movil } = await abrir(browser, vp.w, vp.h, base);
  const calco = await page.evaluate(calcarEnPagina, !!conCss);
  const png = await page.screenshot();
  await ctx.close();
  return Object.assign({ movil, png }, calco);
}

module.exports = { chromium, ROOT, JUEVES_9, esMovil, abrir, calcar };
