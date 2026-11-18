/* PACE · EL RECORRIDO DE UN TESTER NUEVO (17 nov. 2026): EL CONDUCTOR
 * ====================================================================
 * Uso:  node docs/proposals/recorrido-tester-17nov/conduce.js [puerto]      (después de `node build-standalone.js`)
 *
 * Sirve el `index.html` compilado en el puerto (8915 de fábrica) y deja un navegador abierto que se maneja
 * paso a paso con POST /__c, como lo haría una persona: tocar por el nombre de un botón, esperar, sacar una
 * foto, cerrar PACE y abrirlo horas después. El perfil es persistente (el móvil del tester): lo guardado y la
 * base de eventos siguen de un día a otro, y cada «abrir» pone el reloj a la hora que se le dice.
 * Es un Android con Chrome (táctil, con `navigator.vibrate`, así sale «Vibrar»). La marca `pace-cara` hace lo
 * que hace la app de las tiendas: enseñar la app y no la landing. No siembra nada más.
 * Apunta lo que suena: `playSound`, la voz (`speechSynthesis` y los audios), `navigator.vibrate` y los avisos
 * (`Notification`), con la hora del reloj falso. Cada orden se guarda en pasos.jsonl para poder repetirla.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('@playwright/test');

const AQUI = __dirname;
const ROOT = path.join(AQUI, '..', '..', '..');
const PUERTO = Number(process.argv[2] || 8915);
const BASE = 'http://localhost:' + PUERTO;
const FOTOS = path.join(AQUI, 'fotos');
const PERFILES = process.env.PERFILES || path.join(require('os').tmpdir(), 'pace-recorrido-tester');
const UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';
fs.mkdirSync(FOTOS, { recursive: true });

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.ico': 'image/x-icon' };

/* Lo que suena y avisa, con la hora del reloj falso. */
function ganchos() {
  window.__oido = [];
  const apunta = (k, p) => { try { window.__oido.push({ t: Date.now(), k, p: String(p).slice(0, 120) }); } catch (e) {} };
  try { localStorage.setItem('pace-cara', 'app'); } catch (e) {}
  try {
    if (navigator.vibrate) { const v = navigator.vibrate.bind(navigator); navigator.vibrate = (p) => { apunta('vibra', JSON.stringify(p)); return v(p); }; }
  } catch (e) {}
  try {
    if (window.speechSynthesis) { const s = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = (u) => { apunta('habla', u && u.text); return s(u); }; }
  } catch (e) {}
  try {
    const ap = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { apunta('audio', (this.currentSrc || this.src || '').split('/').pop()); return ap.apply(this, arguments); };
  } catch (e) {}
  try {
    if (window.Notification) {
      const N = window.Notification;
      const F = function (titulo, op) { apunta('aviso', titulo + ' | ' + ((op && op.body) || '')); return new N(titulo, op); };
      Object.defineProperty(F, 'permission', { get: () => N.permission });
      F.requestPermission = function () { apunta('pide permiso', 'Notification'); return N.requestPermission.apply(N, arguments); };
      F.prototype = N.prototype;
      window.Notification = F;
    }
  } catch (e) {}
  try {
    let ps;
    Object.defineProperty(window, 'playSound', { configurable: true, get() { return ps; },
      set(f) { ps = typeof f === 'function' ? function (nombre) { apunta('sonido', nombre); return f.apply(this, arguments); } : f; } });
  } catch (e) {}
}

let ctx = null, page = null, estado = { lang: 'es', w: 360, h: 740 };
const errores = [];

async function abrir({ t, w = 360, h = 740, lang = 'es', perfil = 'es', limpio = false }) {
  if (ctx) await ctx.close().catch(() => {});
  const dir = path.join(PERFILES, perfil);
  if (limpio) fs.rmSync(dir, { recursive: true, force: true });
  ctx = await chromium.launchPersistentContext(dir, {
    viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA,
    locale: lang === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', serviceWorkers: 'block', headless: true });
  estado = { lang, w, h, perfil };
  /* El reloj, parado: solo avanza cuando se le dice (si no, corre mientras se mira una foto). */
  await ctx.clock.install({ time: new Date(new Date(t).getTime() - 1000) });
  await ctx.clock.pauseAt(new Date(t));
  await ctx.addInitScript(ganchos);
  page = ctx.pages()[0] || await ctx.newPage();
  page.setDefaultTimeout(6000);
  page.on('pageerror', (e) => errores.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errores.push('console: ' + m.text().slice(0, 200)); });
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(300);
  await page.clock.runFor(1800);
  await page.waitForTimeout(300);
  return { ok: true, hora: await hora() };
}

async function hora() {
  return page.evaluate(() => new Date().toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }));
}

/* Lo de arriba: el diálogo o la ventana que está encima, si hay; si no, la página. */
function capa() {
  const d = page.locator('[role="dialog"], [data-pace-modal-card]').filter({ visible: true });
  return d;
}

async function localizar({ nombre, texto, sel, rol = 'button', exacto = false, n = 0, dentro }) {
  const raiz = dentro ? page.locator(dentro).filter({ visible: true }).last() : page;
  let l;
  if (sel) l = raiz.locator(sel);
  else if (texto) l = raiz.getByText(exacto ? texto : new RegExp(texto, 'i'), { exact: exacto });
  else l = raiz.getByRole(rol, { name: exacto ? nombre : new RegExp(nombre, 'i'), exact: exacto });
  l = l.filter({ visible: true });
  const c = await l.count();
  if (!c) throw new Error('no veo ' + JSON.stringify({ nombre, texto, sel, rol }));
  return n < 0 ? l.nth(c + n) : l.nth(n);
}

async function botones() {
  return page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight && s.visibility !== 'hidden' && +s.opacity > 0.05; };
    return Array.from(document.querySelectorAll('button, a[href], [role="button"], [role="tab"], [role="switch"], [role="radio"], input, select'))
      .filter(vis).map((el) => {
        const r = el.getBoundingClientRect();
        const nom = (el.getAttribute('aria-label') || el.innerText || el.value || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 70);
        const tapado = (() => { const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && !(e === el || el.contains(e)); })();
        return (tapado ? '(tapado) ' : '') + nom + ' @' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height);
      });
  });
}

async function texto() {
  return page.evaluate(() => {
    const d = Array.from(document.querySelectorAll('[role="dialog"], [data-pace-modal-card]')).filter((e) => e.getClientRects().length).pop();
    return (d || document.body).innerText.replace(/\n{3,}/g, '\n\n').slice(0, 3000);
  });
}

async function oido() {
  const o = await page.evaluate(() => { const x = window.__oido || []; window.__oido = []; return x; });
  return o.map((e) => new Date(e.t).toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid' }) + ' ' + e.k + ': ' + e.p);
}

async function foto({ n, completa = false }) {
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ fullPage: completa });
  const ruta = path.join(FOTOS, n + '.webp');
  await require('sharp')(png).webp({ quality: 80 }).toFile(ruta);
  /* Una copia pequeña para mirarla sin gastar: la mitad. */
  const peq = path.join(PERFILES, 'mirar', n + '.png');
  fs.mkdirSync(path.dirname(peq), { recursive: true });
  await require('sharp')(png).resize({ width: 360 }).png().toFile(peq);
  return { ok: true, ruta: path.relative(ROOT, ruta), mirar: peq };
}

const ORDENES = {
  abrir,
  cerrar: async () => { if (ctx) await ctx.close().catch(() => {}); ctx = null; page = null; return { ok: true }; },
  foto,
  /* Con el dedo (tap), como en un móvil; `raton: true` para lo que no responde al toque. */
  toca: async (a) => {
    const l = await localizar(a);
    await l.scrollIntoViewIfNeeded().catch(() => {});
    if (a.raton) await l.click({ timeout: 4000, force: !!a.force }); else await l.tap({ timeout: 4000, force: !!a.force });
    await page.clock.runFor(a.espera == null ? 700 : a.espera);
    await page.waitForTimeout(200);
    return { ok: true };
  },
  escribe: async (a) => { const l = await localizar(Object.assign({ rol: 'textbox' }, a)); await l.fill(a.valor); return { ok: true }; },
  tecla: async (a) => { await page.keyboard.press(a.k); await page.clock.runFor(400); await page.waitForTimeout(150); return { ok: true }; },
  /* Esperar de verdad: corre los temporizadores como pasaría con PACE abierto. */
  espera: async ({ ms }) => { await page.clock.runFor(ms); await page.waitForTimeout(250); return { ok: true, hora: await hora() }; },
  /* Saltar: el reloj avanza de golpe (cada temporizador vencido salta una vez), como con la pantalla apagada. */
  salta: async ({ ms }) => { await page.clock.fastForward(ms); await page.clock.runFor(800); await page.waitForTimeout(250); return { ok: true, hora: await hora() }; },
  /* La pestaña vuelve a verse (al encender la pantalla o volver a PACE). */
  vuelve: async () => { await page.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')); window.dispatchEvent(new Event('pageshow')); }); await page.clock.runFor(800); await page.waitForTimeout(200); return { ok: true }; },
  tamano: async ({ w, h }) => { await page.setViewportSize({ width: w, height: h }); estado.w = w; estado.h = h; await page.clock.runFor(600); await page.waitForTimeout(200); return { ok: true }; },
  js: async ({ code }) => ({ ok: true, r: await page.evaluate(code) }),
  texto: async () => ({ ok: true, r: await texto() }),
  botones: async () => ({ ok: true, r: await botones() }),
  oido: async () => ({ ok: true, r: await oido() }),
  errores: async () => ({ ok: true, r: errores.splice(0) }),
  hora: async () => ({ ok: true, r: await hora() }),
  permiso: async ({ si }) => { if (si) await ctx.grantPermissions(['notifications'], { origin: BASE }); else await ctx.clearPermissions(); return { ok: true }; },
};

http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/__c') {
    let cuerpo = '';
    req.on('data', (d) => { cuerpo += d; });
    req.on('end', async () => {
      let r;
      try {
        const a = JSON.parse(cuerpo || '{}');
        fs.appendFileSync(path.join(AQUI, 'pasos.jsonl'), JSON.stringify(a) + '\n');
        if (!ORDENES[a.cmd]) throw new Error('orden desconocida ' + a.cmd);
        if (a.cmd !== 'abrir' && !page) throw new Error('PACE no está abierto');
        r = await ORDENES[a.cmd](a);
      } catch (e) { r = { ok: false, error: String(e.message || e).slice(0, 400) }; }
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(r, null, 1));
    });
    return;
  }
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  const file = path.join(ROOT, url);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('no'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  });
}).listen(PUERTO, () => console.log('conductor en ' + BASE));
