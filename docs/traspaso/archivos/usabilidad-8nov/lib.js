/* Recorrido del 6 nov. · lo que comparten los scripts.
 * El servidor de la suite en el 8886 (el puerto de esta sesión), un navegador por script, un
 * contexto por tamaño, idioma y tema, y las medidas que se repiten en cada pantalla: errores de
 * la consola, scroll que no debería haber, textos que se salen de su caja y, en inglés, textos
 * que se quedaron en español. Lo que mide es una pista: cada fallo se reproduce dos veces y se
 * mira en la foto antes de apuntarlo. */
'use strict';

const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');
const { chromium } = require('@playwright/test');

const RAIZ = path.resolve(__dirname, '../../../..');
const PUERTO = Number(process.env.PACE_E2E_PORT || 8886);
const BASE = 'http://localhost:' + PUERTO;
const FOTOS = process.env.RECORRIDO_FOTOS || path.join(require('os').tmpdir(), 'recorrido-6nov-fotos');
fs.mkdirSync(FOTOS, { recursive: true });

const TAMANOS = { movil: [360, 800], escritorio: [1280, 800], ez: [1536, 710], pequeno: [320, 568] };

function sirveEsta() {
  return new Promise((res) => {
    const req = http.get(BASE + '/index.html', (r) => {
      r.resume();
      res(decodeURIComponent(r.headers['x-pace-raiz'] || '') === RAIZ);
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

/* Un contexto nuevo: sin service worker de antes, con el tamaño, idioma y tema pedidos. `estado`
   null = la primera vez (sin nada en localStorage). */
async function abrir(o) {
  const [w, h] = TAMANOS[o.tam] || o.tam;
  const en = o.lang === 'en';
  const ctx = await navegador.newContext({
    viewport: { width: w, height: h },
    locale: en ? 'en-US' : 'es-ES',
    timezoneId: 'Europe/Madrid',
    colorScheme: o.oscuro ? 'dark' : 'light',
    hasTouch: w < 768,
    isMobile: false,
    serviceWorkers: o.sw ? 'allow' : 'block',
  });
  if (o.estado !== null) {
    const est = Object.assign({}, SEMILLA, { lang: en ? 'en' : 'es', palette: o.oscuro ? 'oscuro' : 'crema' }, o.estado || {});
    await ctx.addInitScript(([e]) => {
      if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
    }, [est]);
  }
  if (o.extraInit) await ctx.addInitScript(o.extraInit);
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errores.push(m.type() + ': ' + m.text()); });
  if (o.reloj) await page.clock.install({ time: o.reloj });
  if (o.ir !== false) {
    await page.goto(BASE + (o.ruta || '/index.html'));
    if (!o.ruta) await page.waitForSelector('[data-pace-app-root], [data-pace-onb-comenzar], [data-pace-dial-number]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(o.espera || 700);
  }
  return { ctx, page, errores };
}

async function foto(page, nombre, completa) {
  const f = path.join(FOTOS, nombre + '.png');
  await page.screenshot({ path: f, fullPage: !!completa });
  return f;
}

/* Scroll del documento y de los paneles que lo tienen sin que se pida. */
function scroll(page) {
  return page.evaluate(() => {
    const d = document.scrollingElement;
    const out = { doc: { v: d.scrollHeight - d.clientHeight, h: d.scrollWidth - d.clientWidth }, cajas: [] };
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (!/(auto|scroll)/.test(cs.overflowY + cs.overflowX)) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const v = el.scrollHeight - el.clientHeight, h = el.scrollWidth - el.clientWidth;
      if (v > 1 || h > 1) {
        const id = [...el.attributes].filter((a) => a.name.startsWith('data-pace')).map((a) => a.name).join(' ') || el.className || el.tagName;
        out.cajas.push({ el: String(id).slice(0, 80), v, h });
      }
    }
    return out;
  });
}

/* Textos que se salen: de la ventana, o de un antepasado que recorta (overflow hidden/clip), o
   con puntos suspensivos que de verdad recortan. Solo hojas con texto propio y visibles. */
function cortados(page) {
  return page.evaluate(() => {
    const W = innerWidth, H = innerHeight, out = [];
    const visible = (el) => {
      const cs = getComputedStyle(el);
      return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05;
    };
    for (const el of document.querySelectorAll('body *')) {
      const propio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!propio || !visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const txt = el.textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
      const cs = getComputedStyle(el);
      if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) out.push({ por: 'puntos', txt, w: el.scrollWidth - el.clientWidth });
      if (r.right > W + 1 || r.left < -1) out.push({ por: 'ventana-x', txt, l: Math.round(r.left), r: Math.round(r.right) });
      let p = el.parentElement;
      while (p && p !== document.body) {
        const pc = getComputedStyle(p);
        if (/(hidden|clip)/.test(pc.overflowX + pc.overflowY) && !/(auto|scroll)/.test(pc.overflowX + pc.overflowY)) {
          const q = p.getBoundingClientRect();
          if (q.width > 0 && q.height > 0 && (r.right > q.right + 2 || r.left < q.left - 2 || r.bottom > q.bottom + 2 || r.top < q.top - 2)) {
            /* fuera de vista a propósito (lo que se desliza o está escondido) no cuenta */
            if (r.bottom > q.top && r.top < q.bottom && r.right > q.left && r.left < q.right) {
              out.push({ por: 'recorte', txt, dx: Math.round(Math.max(r.right - q.right, q.left - r.left)), dy: Math.round(Math.max(r.bottom - q.bottom, q.top - r.top)) });
            }
          }
          break;
        }
        p = p.parentElement;
      }
    }
    return out;
  });
}

/* Hojas de texto que se pisan entre sí (más de 4 px en los dos ejes), sin contar padre e hijo. */
function solapes(page) {
  return page.evaluate(() => {
    const hojas = [];
    /* Con un diálogo abierto, solo lo de dentro: lo de detrás está tapado a propósito. */
    const dialogos = [...document.querySelectorAll('[role=dialog],[data-pace-modal-backdrop],[data-pace-session-root]')]
      .filter((d) => d.getBoundingClientRect().width > 0);
    const capa = dialogos.length ? dialogos[dialogos.length - 1] : document.body;
    for (const el of capa.querySelectorAll('*')) {
      const propio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!propio) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.05) continue;
      /* El rectángulo del texto, no de la caja: un bloque ancho no «pisa» si su texto es corto. */
      const rg = document.createRange();
      rg.selectNodeContents(el);
      const r = rg.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) continue;
      hojas.push({ el, r, txt: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) });
    }
    const out = [];
    for (let i = 0; i < hojas.length; i++) for (let j = i + 1; j < hojas.length; j++) {
      const a = hojas[i], b = hojas[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      /* Las cajas de línea de una letra grande se tocan sin que se pise la tinta: cuenta si se
         pisan más de un tercio de la más baja. */
      if (x > 4 && y > Math.min(a.r.height, b.r.height) / 3) {
        out.push({ a: a.txt, b: b.txt, x: Math.round(x), y: Math.round(y) });
      }
    }
    return out.slice(0, 20);
  });
}

/* En inglés: frases visibles con señales de español. */
function sinTraducir(page) {
  return page.evaluate(() => {
    const out = new Set();
    const rx = /[áéíóúñ¿¡]|\b(de|la|el|los|las|para|con|tu|tus|ahora|hoy|semana|pausa|minutos|día|días|empezar|volver|cerrar|sí|también|más|tiempo)\b/i;
    for (const el of document.querySelectorAll('body *')) {
      const propio = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
      if (propio.length < 2) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (rx.test(propio)) out.add(propio.slice(0, 80));
    }
    for (const el of document.querySelectorAll('[aria-label],[title],[placeholder]')) {
      for (const a of ['aria-label', 'title', 'placeholder']) {
        const v = el.getAttribute(a);
        if (v && rx.test(v)) out.add('@' + a + ': ' + v.slice(0, 80));
      }
    }
    return [...out];
  });
}

/* El foco del teclado: qué elemento lo tiene y si está dentro de `sel`. */
function foco(page, sel) {
  return page.evaluate((s) => {
    const a = document.activeElement;
    const dentro = s ? !!(a && a.closest(s)) : null;
    const d = a ? (a.getAttribute('aria-label') || a.textContent || a.tagName).trim().replace(/\s+/g, ' ').slice(0, 50) : null;
    return { d, dentro, tag: a && a.tagName };
  }, sel || null);
}

/* Tab N veces y comprueba que el foco no sale del diálogo de arriba. */
async function tabEncerrado(page, sel, n) {
  const fuera = [];
  for (let i = 0; i < (n || 25); i++) {
    await page.keyboard.press('Tab');
    const f = await foco(page, sel);
    if (!f.dentro) fuera.push(i + ':' + f.d + '(' + f.tag + ')');
  }
  return fuera;
}

/* Una pantalla medida entera: scroll, textos cortados, solapes y, en inglés, sin traducir. */
async function medir(page, nombre, o) {
  const r = { nombre, scroll: await scroll(page), cortados: await cortados(page), solapes: await solapes(page) };
  if (o && o.lang === 'en') r.sinTraducir = await sinTraducir(page);
  r.foto = await foto(page, nombre);
  return r;
}

function semilla(extra) { return Object.assign({}, SEMILLA, extra || {}); }

module.exports = { RAIZ, BASE, PUERTO, FOTOS, TAMANOS, lanzar, cerrar, abrir, foto, scroll, cortados, solapes, sinTraducir, foco, tabEncerrado, medir, semilla };
