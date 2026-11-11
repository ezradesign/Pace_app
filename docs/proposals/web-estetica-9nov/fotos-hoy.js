/* Fotos y medidas de la web de hoy (rama claude/landing-c-9nov): /, /premium/ y /beta/. */
'use strict';
const path = require('path');
const fs = require('fs');
const http = require('http');
const REPO = process.argv[2];
const OUT = process.argv[3];
const { chromium } = require(path.join(REPO, 'node_modules', '@playwright/test'));
const sharp = require(path.join(REPO, 'node_modules', 'sharp'));
const { montarWeb } = require(path.join(REPO, 'scripts', 'web-dist.js'));

const DIST = path.join(OUT, 'dist');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
function servidor(puerto) {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      let url = decodeURIComponent(req.url.split('?')[0]);
      if (url === '/') url = '/index.html';
      if (url === '/privacy' || url === '/safety') url += '.html';
      if (/\/$/.test(url)) url += 'index.html';
      const f = path.join(DIST, url);
      if (f.indexOf(DIST) !== 0 || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end('no'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    }).listen(puerto, () => ok(s));
  });
}

const PAGINAS = { landing: '/', premium: '/premium/', beta: '/beta/' };
const ANCHOS = { 360: { width: 360, height: 740 }, 1280: { width: 1280, height: 720 } };

function medir() {
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  const raiz = document.querySelector('#pace-landing') && getComputedStyle(document.querySelector('#pace-landing')).display !== 'none' ? document.querySelector('#pace-landing') : document.body;
  const q = (s) => Array.from(raiz.querySelectorAll(s)).filter(vis);
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top + scrollY), w: Math.round(b.width), h: Math.round(b.height) }; };
  const cs = (el, p) => getComputedStyle(el)[p];
  const logo = q('header img')[0];
  const h1 = q('h1')[0];
  const botones = q('.boton, .pl-boton');
  const out = {
    alto: document.documentElement.scrollHeight, vh: innerHeight,
    logo: logo ? r(logo) : null,
    cabecera: q('header')[0] ? { ...r(q('header')[0]), texto: q('header')[0].innerText.replace(/\s+/g, ' ').trim() } : null,
    h1: h1 ? { ...r(h1), fs: cs(h1, 'fontSize'), lineas: Math.round(h1.getBoundingClientRect().height / parseFloat(cs(h1, 'lineHeight'))) } : null,
    h2: q('h2').map((e) => ({ t: e.innerText.trim().slice(0, 40), fs: cs(e, 'fontSize'), y: r(e).y })),
    boton1: botones[0] ? { ...r(botones[0]), t: botones[0].innerText.trim(), fs: cs(botones[0], 'fontSize'), bg: cs(botones[0], 'backgroundColor') } : null,
    botones: botones.map((b) => ({ t: b.innerText.trim(), w: r(b).w, h: r(b).h, y: r(b).y, bg: cs(b, 'backgroundColor') })),
    imgs: q('img').filter((i) => !i.closest('header') && !i.closest('footer')).map((i) => ({ src: (i.currentSrc || i.src).split('/').pop(), ...r(i), nat: i.naturalWidth })),
    secciones: q('section').map((s) => ({ ...r(s), bg: cs(s, 'backgroundColor'), h2: (s.querySelector('h2') || {}).innerText })),
    parrafos: q('p').map((p) => ({ w: r(p).w, fs: parseFloat(cs(p, 'fontSize')), n: p.innerText.length })).filter((p) => p.n > 90).map((p) => ({ w: p.w, cpl: Math.round(p.w / (p.fs * 0.47)), n: p.n })),
    pie: q('footer')[0] ? { ...r(q('footer')[0]), texto: q('footer')[0].innerText.replace(/\s+/g, ' ').trim() } : null,
    desborde: document.documentElement.scrollWidth - innerWidth,
  };
  return out;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const r = montarWeb(DIST);
  console.log('dist', r.archivos, 'archivos');
  const srv = await servidor(8901);
  const nav = await chromium.launch();
  const medidas = {};
  for (const [pag, ruta] of Object.entries(PAGINAS)) for (const ancho of Object.keys(ANCHOS)) for (const idioma of ['es', 'en']) for (const tema of ['claro', 'oscuro']) {
    const ctx = await nav.newContext({ viewport: ANCHOS[ancho], colorScheme: tema === 'oscuro' ? 'dark' : 'light', locale: idioma === 'en' ? 'en-US' : 'es-ES', deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto('http://localhost:8901' + ruta + '?lang=' + idioma, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => { for (const i of document.images) { i.loading = 'eager'; } await Promise.all(Array.from(document.images).filter((i) => i.getBoundingClientRect().width > 0).map((i) => i.decode().catch(() => {}))); });
    await page.waitForTimeout(250);
    const clave = [pag, ancho, idioma, tema].join('-');
    medidas[clave] = await page.evaluate(medir);
    const png = await page.screenshot({ fullPage: true });
    await sharp(png).webp({ quality: 70 }).toFile(path.join(OUT, 'hoy-' + clave + '.webp'));
    const arriba = await page.screenshot({ fullPage: false });
    await sharp(arriba).webp({ quality: 72 }).toFile(path.join(OUT, 'hoy-' + clave + '-arriba.webp'));
    await ctx.close();
    console.log(clave, medidas[clave].alto);
  }
  fs.writeFileSync(path.join(OUT, 'hoy-medidas.json'), JSON.stringify(medidas, null, 1));
  await nav.close();
  srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
