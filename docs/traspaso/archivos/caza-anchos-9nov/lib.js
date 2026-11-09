/* Caza de los seis anchos (9 nov. 2026) · lo que comparten los scripts.
 * Parte del recorrido del 6 nov. (../recorrido-6nov/lib.js) y mide más cosas con el DOM, en la capa
 * de arriba (la ventana, la sesión o la hoja abierta; si no hay, la página):
 *   - scroll de la página y de lado dentro de una caja;
 *   - textos cortados: con puntos, recortados por un antepasado o fuera de la ventana;
 *   - textos que se pisan entre sí, y texto que pisa un botón que no es el suyo;
 *   - botones fuera de la ventana, tapados por otra cosa o con su texto saliéndose;
 *   - con el teclado: el foco que se escapa de la capa o queda tapado o fuera de la vista;
 *   - en inglés, frases con señales de castellano.
 * Lo que mide es una pista: cada fallo se reproduce y se mira en la foto antes de apuntarlo.
 * Contexto nuevo por combinación y `serviceWorkers: 'block'`: nunca mide un service worker viejo. */
'use strict';

const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');
const { chromium } = require('@playwright/test');

const RAIZ = path.resolve(__dirname, '../../../..');
const PUERTO = Number(process.env.PACE_E2E_PORT || 8895);
const BASE = 'http://localhost:' + PUERTO;
const FOTOS = process.env.CAZA_FOTOS || path.join(require('os').tmpdir(), 'caza-anchos-9nov-fotos');
fs.mkdirSync(FOTOS, { recursive: true });

/* Los seis anchos; a 360, los dos altos del móvil de Ez; en el ordenador, su ventana. */
const TAMANOS = {
  m320: [320, 568], m360: [360, 640], m360b: [360, 730], m390: [390, 844],
  t768: [768, 1024], e1280: [1280, 720], e1536: [1536, 710],
};

function sirveEsta() {
  return new Promise((res) => {
    const req = http.get(BASE + '/index.html', (r) => {
      r.resume();
      res(path.resolve(decodeURIComponent(r.headers['x-pace-raiz'] || '.')) === RAIZ);
    });
    req.on('error', () => res(null));
  });
}

let hijo = null;
async function servidor() {
  const ya = await sirveEsta();
  if (ya === true) return;
  if (ya === false) throw new Error('El ' + PUERTO + ' sirve otra carpeta');
  hijo = spawn(process.execPath, [path.join(RAIZ, '.claude/static-server.js')], {
    cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore',
  });
  for (let i = 0; i < 50; i++) {
    if (await sirveEsta()) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('El servidor no arrancó');
}

const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', novedadesVistas: '*' };

let navegador = null;
async function lanzar() {
  await servidor();
  navegador = await chromium.launch();
  return navegador;
}
async function cerrar() {
  if (navegador) await navegador.close();
  if (hijo) hijo.kill();
}

/* Lo que se mide dentro de la página, puesto antes de que cargue la app. */
function instalar() {
  const vis = (el) => {
    if (!el || !el.getClientRects().length) return false;
    /* Lo de dentro de un <details> cerrado tiene caja en Chrome, pero no se ve. */
    const cerrado = el.closest('details:not([open])');
    if (cerrado && !el.closest('summary')) return false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.05) return false;
    }
    return true;
  };
  const zDe = (el) => { let z = 0; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const v = parseInt(getComputedStyle(e).zIndex, 10); if (!isNaN(v)) z = Math.max(z, v); } return z; };
  const CAPAS = '[data-pace-session-root], [data-pace-modal-backdrop], [role=dialog], [data-pace-tweaks-panel], [data-pace-visita]';
  const capa = () => {
    const c = [...document.querySelectorAll(CAPAS)].filter((e) => vis(e) && e.getBoundingClientRect().width > 0);
    if (!c.length) return document.body;
    /* La de z más alto; a igual z, la que va después en la página, salvo si está dentro de la elegida. */
    let best = null, bz = -1;
    for (const e of c) { const z = zDe(e); if (z > bz || (z === bz && !best.contains(e))) { best = e; bz = z; } }
    return best;
  };
  const etq = (el) => {
    if (!el) return '(nada)';
    const t = (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title')) || el.textContent || '').trim().replace(/\s+/g, ' ');
    const d = el.attributes ? [...el.attributes].filter((a) => a.name.startsWith('data-pace')).map((a) => a.name.slice(10) + (a.value && a.value.length < 24 ? '=' + a.value : '')).slice(0, 2).join(' ') : '';
    return (t.slice(0, 44) || '<' + el.tagName.toLowerCase() + '>') + (d ? ' [' + d + ']' : '');
  };
  const textoPropio = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
  const rectTexto = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect(); };
  /* La tinta, no la caja de línea: una cifra de 72 px lleva medio interlineado arriba y abajo que no se
     ve. Se quita (alto − tamaño) / 2 y un 12 % del tamaño por cada lado. */
  const tinta = (el, r) => {
    const fs = parseFloat(getComputedStyle(el).fontSize) || 14;
    const lineas = Math.max(1, Math.round(r.height / (parseFloat(getComputedStyle(el).lineHeight) || fs * 1.3)));
    const q = lineas > 1 ? fs * 0.12 : Math.max(0, (r.height - fs) / 2) + fs * 0.12;
    return { left: r.left, right: r.right, top: r.top + q, bottom: r.bottom - q, width: r.width, height: Math.max(1, r.height - 2 * q) };
  };
  /* La caja visible de `el`: su rectángulo recortado por los antepasados que recortan o hacen scroll. */
  const clip = (el) => {
    let x0 = 0, y0 = 0, x1 = innerWidth, y1 = innerHeight;
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/(hidden|clip|auto|scroll)/.test(cs.overflowX + cs.overflowY)) {
        const q = a.getBoundingClientRect();
        x0 = Math.max(x0, q.left); y0 = Math.max(y0, q.top); x1 = Math.min(x1, q.right); y1 = Math.min(y1, q.bottom);
      }
    }
    return { x0, y0, x1, y1 };
  };
  const enScroll = (el) => { for (let a = el.parentElement; a; a = a.parentElement) { const cs = getComputedStyle(a); if (/(auto|scroll)/.test(cs.overflowY) && a.scrollHeight > a.clientHeight + 1) return true; } return document.scrollingElement.scrollHeight > innerHeight + 1; };
  const INTER = 'button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=switch], [role=radio], [tabindex]:not([tabindex="-1"])';

  function medir(o) {
    const W = innerWidth, H = innerHeight, raiz = capa();
    const out = { capa: raiz === document.body ? 'página' : etq(raiz), scroll: null, cortados: [], solapes: [], pisaBoton: [], fuera: [], tapados: [], sale: [], sinTraducir: [] };
    /* 1. scroll */
    const d = document.scrollingElement;
    out.scroll = { doc: { v: d.scrollHeight - d.clientHeight, h: d.scrollWidth - d.clientWidth }, cajas: [] };
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (!/(auto|scroll)/.test(cs.overflowY + cs.overflowX) || !vis(el)) continue;
      const v = el.scrollHeight - el.clientHeight, h = el.scrollWidth - el.clientWidth;
      if ((v > 1 && /(auto|scroll)/.test(cs.overflowY)) || (h > 1 && /(auto|scroll)/.test(cs.overflowX))) out.scroll.cajas.push({ el: etq(el).slice(0, 70), v, h: /(auto|scroll)/.test(cs.overflowX) ? h : 0, alto: el.clientHeight });
    }
    /* 2. textos */
    const hojas = [];
    for (const el of raiz.querySelectorAll('*')) {
      if (!textoPropio(el) || !vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const txt = el.textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
      const cs = getComputedStyle(el);
      if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) out.cortados.push({ por: 'puntos', txt, px: el.scrollWidth - el.clientWidth });
      if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none' && el.scrollHeight > el.clientHeight + 2) out.cortados.push({ por: 'lineas', txt, px: el.scrollHeight - el.clientHeight });
      const rt = rectTexto(el);
      if (rt.right > W + 1 || rt.left < -1) out.cortados.push({ por: 'ventana-x', txt, l: Math.round(rt.left), r: Math.round(rt.right) });
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const pc = getComputedStyle(p);
        if (/(auto|scroll)/.test(pc.overflowX + pc.overflowY)) break;
        if (/(hidden|clip)/.test(pc.overflowX + pc.overflowY)) {
          const q = p.getBoundingClientRect();
          if (q.width > 0 && q.height > 0 && (rt.right > q.right + 2 || rt.left < q.left - 2 || rt.bottom > q.bottom + 2 || rt.top < q.top - 2)
              && rt.bottom > q.top && rt.top < q.bottom && rt.right > q.left && rt.left < q.right) {
            out.cortados.push({ por: 'recorte', txt, dx: Math.round(Math.max(rt.right - q.right, q.left - rt.left)), dy: Math.round(Math.max(rt.bottom - q.bottom, q.top - rt.top)), caja: etq(p).slice(0, 40) });
          }
          break;
        }
      }
      const k = clip(el), ti = tinta(el, rt);
      /* Lo que recorta el propio elemento (los puntos suspensivos) tampoco pisa nada. */
      if (/(hidden|clip)/.test(cs.overflowX + cs.overflowY)) { k.x0 = Math.max(k.x0, r.left); k.x1 = Math.min(k.x1, r.right); k.y0 = Math.max(k.y0, r.top); k.y1 = Math.min(k.y1, r.bottom); }
      const rc = { left: Math.max(ti.left, k.x0), right: Math.min(ti.right, k.x1), top: Math.max(ti.top, k.y0), bottom: Math.min(ti.bottom, k.y1) };
      rc.width = rc.right - rc.left; rc.height = rc.bottom - rc.top;
      if (rc.width >= 2 && rc.height >= 2) hojas.push({ el, r: rc, txt: txt.slice(0, 40) });
    }
    for (let i = 0; i < hojas.length; i++) for (let j = i + 1; j < hojas.length; j++) {
      const a = hojas[i], b = hojas[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (x > 4 && y > Math.min(a.r.height, b.r.height) / 3) out.solapes.push({ a: a.txt, b: b.txt, x: Math.round(x), y: Math.round(y) });
    }
    /* 3. botones */
    const inter = [...raiz.querySelectorAll(INTER)].filter((el) => vis(el));
    for (const el of inter) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      const nom = etq(el);
      const cb = clip(el);
      if (Math.min(r.right, cb.x1) - Math.max(r.left, cb.x0) < 2 || Math.min(r.bottom, cb.y1) - Math.max(r.top, cb.y0) < 2) { if (!(r.right > W + 1 || r.left < -1)) continue; }
      if (r.right > W + 1 || r.left < -1) out.fuera.push({ que: nom, por: 'x', l: Math.round(r.left), r: Math.round(r.right) });
      else if ((r.bottom > H + 1 || r.top < -1) && !enScroll(el)) out.fuera.push({ que: nom, por: 'y', t: Math.round(r.top), b: Math.round(r.bottom) });
      const c = clip(el);
      let tot = 0, ok = 0, tapa = null;
      for (let i = 1; i <= 3; i++) for (let j = 1; j <= 3; j++) {
        const x = r.left + r.width * i / 4, y = r.top + r.height * j / 4;
        if (x < c.x0 || y < c.y0 || x >= c.x1 || y >= c.y1) continue;
        tot++;
        const e = document.elementFromPoint(x, y);
        if (e && (e === el || el.contains(e) || (e.tagName === 'LABEL' && e.contains(el)) || (e.control === el))) ok++;
        else if (e && !tapa) tapa = e;
      }
      if (tot >= 5 && ok / tot < 0.6) out.tapados.push({ que: nom, visible: Math.round(ok / tot * 100) + ' %', encima: etq(tapa).slice(0, 50) });
      if (el.tagName !== 'INPUT' && el.tagName !== 'SELECT' && el.tagName !== 'TEXTAREA' && el.textContent.trim()) {
        const t = rectTexto(el);
        const dx = Math.max(t.right - r.right, r.left - t.left), dy = Math.max(t.bottom - r.bottom, r.top - t.top);
        if (t.width > 0 && (dx > 2 || dy > 2)) out.sale.push({ que: nom, dx: Math.round(dx), dy: Math.round(dy) });
      }
      /* texto ajeno encima del botón */
      for (const h of hojas) {
        if (el.contains(h.el) || h.el.contains(el)) continue;
        const x = Math.min(h.r.right, r.right) - Math.max(h.r.left, r.left);
        const y = Math.min(h.r.bottom, r.bottom) - Math.max(h.r.top, r.top);
        if (x > 4 && y > 4 && x * y > 60) { out.pisaBoton.push({ boton: nom, texto: h.txt, x: Math.round(x), y: Math.round(y) }); break; }
      }
    }
    /* 4. inglés */
    if (o && o.lang === 'en') {
      const rx = /[áéíóúñ¿¡]|\b(de|la|el|los|las|para|con|tu|tus|ahora|hoy|semana|pausa|minutos|día|días|empezar|volver|cerrar|sí|también|más|tiempo|jornada|bloque)\b/i;
      const set = new Set();
      for (const el of raiz.querySelectorAll('*')) {
        const propio = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
        if (propio.length < 2 || !vis(el)) continue;
        if (/^(Tu|Español|Castellano)$/.test(propio)) continue;
        if (rx.test(propio)) set.add(propio.slice(0, 80));
      }
      for (const el of raiz.querySelectorAll('[aria-label],[title],[placeholder]')) for (const a of ['aria-label', 'title', 'placeholder']) {
        const v = el.getAttribute(a);
        if (v && rx.test(v)) set.add('@' + a + ': ' + v.slice(0, 80));
      }
      out.sinTraducir = [...set];
    }
    for (const k of ['cortados', 'solapes', 'pisaBoton', 'fuera', 'tapados', 'sale']) out[k] = out[k].slice(0, 25);
    return out;
  }
  /* El foco del teclado: si está en la capa de arriba, si se ve y si algo lo tapa. */
  function foco(sel) {
    const a = document.activeElement;
    if (!a || a === document.body) return { d: '(body)', dentro: false };
    const arriba = capa();
    const dentro = arriba === document.body ? true : arriba.contains(a);
    const r = a.getBoundingClientRect(), c = clip(a);
    const x = Math.min(Math.max(r.left + r.width / 2, c.x0 + 1), c.x1 - 1), y = Math.min(Math.max(r.top + r.height / 2, c.y0 + 1), c.y1 - 1);
    const visto = r.width > 0 && r.right > c.x0 && r.left < c.x1 && r.bottom > c.y0 && r.top < c.y1;
    const e = visto ? document.elementFromPoint(x, y) : null;
    const tapado = visto && e && !(e === a || a.contains(e) || (e.tagName === 'LABEL' && e.contains(a)) || e.control === a) ? etq(e).slice(0, 40) : null;
    const fraccion = r.width * r.height > 0 ? Math.max(0, Math.min(r.right, c.x1) - Math.max(r.left, c.x0)) * Math.max(0, Math.min(r.bottom, c.y1) - Math.max(r.top, c.y0)) / (r.width * r.height) : 0;
    return { d: etq(a), dentro, visto, tapado, fraccion: Math.round(fraccion * 100) };
  }
  window.__caza = { medir, foco, capa: () => { const k = capa(); return k === document.body ? 'página' : etq(k); }, CAPAS };
}

/* Un contexto nuevo con el tamaño, idioma y tema pedidos. `estado` null = la primera vez. */
async function abrir(o) {
  const [w, h] = TAMANOS[o.tam] || o.tam;
  const en = o.lang === 'en';
  const ctx = await navegador.newContext({
    viewport: { width: w, height: h }, locale: en ? 'en-US' : 'es-ES', timezoneId: 'Europe/Madrid',
    colorScheme: o.oscuro ? 'dark' : 'light', hasTouch: w < 768, isMobile: false, serviceWorkers: 'block',
  });
  await ctx.addInitScript(instalar);
  if (o.estado !== null) {
    const est = Object.assign({}, SEMILLA, { lang: en ? 'en' : 'es', palette: o.oscuro ? 'oscuro' : 'crema' }, o.estado || {});
    await ctx.addInitScript(([e]) => {
      if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
    }, [est]);
  }
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errores.push(m.type() + ': ' + m.text().slice(0, 200)); });
  if (o.reloj) await page.clock.install({ time: o.reloj });
  if (o.ir !== false) {
    await page.goto(BASE + (o.ruta || '/index.html'));
    if (!o.ruta) await page.waitForSelector('[data-pace-app-root], [data-pace-onb-comenzar], [data-pace-dial-number]', { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await page.waitForTimeout(o.espera || 700);
  }
  return { ctx, page, errores };
}

async function foto(page, nombre) {
  const f = path.join(FOTOS, nombre + '.jpg');
  await page.screenshot({ path: f, type: 'jpeg', quality: 55 }).catch(() => {});
  return f;
}

/* Tab N veces: el foco no sale de la capa de arriba, se ve y nada lo tapa. */
async function teclado(page, sel, n) {
  const fuera = [], tapado = [], oculto = [];
  const s = sel || await page.evaluate(() => window.__caza.CAPAS);
  for (let i = 0; i < (n || 20); i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate((x) => window.__caza.foco(x), s);
    if (!f.dentro) fuera.push(i + ':' + f.d);
    else if (f.tapado) tapado.push(i + ':' + f.d + ' bajo ' + f.tapado);
    else if (!f.visto || f.fraccion < 50) oculto.push(i + ':' + f.d + ' (' + f.fraccion + ' %)');
  }
  return { fuera, tapado, oculto };
}

async function medir(page, nombre, o) {
  const r = await page.evaluate((x) => window.__caza.medir(x), { lang: o && o.lang });
  r.nombre = nombre;
  r.foto = await foto(page, nombre);
  return r;
}

function semilla(extra) { return Object.assign({}, SEMILLA, extra || {}); }

module.exports = { RAIZ, BASE, PUERTO, FOTOS, TAMANOS, lanzar, cerrar, abrir, foto, teclado, medir, semilla };
