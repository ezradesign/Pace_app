/* PACE · los recortes de los defectos de hoy y el peso de cada dirección (para pagina.js).
   Uso: node docs/proposals/web-estetica-9nov/recortes.js --dist=<carpeta de dist ya montada>
   Deja fotos/defecto-*.webp y pesos.json (CSS de cada dirección comprimido y sin comprimir, y el
   primer pintado de la landing con ese CSS dentro de index.html, mediana de 7). Puerto 8902. */
'use strict';
const path = require('path'), fs = require('fs'), http = require('http'), zlib = require('zlib');
const AQUI = __dirname, REPO = path.join(AQUI, '..', '..', '..');
const { chromium } = require(path.join(REPO, 'node_modules', '@playwright/test'));
const sharp = require(path.join(REPO, 'node_modules', 'sharp'));
const DIST = path.resolve((process.argv.find((a) => a.startsWith('--dist=')) || '').slice(7));
const FOTOS = path.join(AQUI, 'fotos');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
let indexConCss = null;
const srv = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/' || url === '/index.html') { if (indexConCss) { res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' }); return res.end(indexConCss); } url = '/index.html'; }
  if (/\/$/.test(url)) url += 'index.html';
  if (url.startsWith('/api/')) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{"abierta":false}'); }
  const f = path.join(DIST, url);
  if (f.indexOf(DIST) !== 0 || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res);
});

async function trozo(nav, ruta, vista, opc, sel, n) {
  const ctx = await nav.newContext(Object.assign({ viewport: vista, deviceScaleFactor: 1, serviceWorkers: 'block' }, opc));
  const page = await ctx.newPage();
  await page.goto('http://localhost:8902' + ruta, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { for (const i of document.images) i.loading = 'eager'; await Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {}))); });
  const buf = await page.locator(sel).nth(n || 0).screenshot();
  await ctx.close();
  return buf;
}
async function juntar(bufs, salida, vertical, ancho) {
  const G = 14; const piezas = []; let x = 0, y = 0, W = 0, H = 0;
  for (const b of bufs) {
    const r = ancho ? await sharp(b).resize({ width: ancho }).png().toBuffer() : b; const m = await sharp(r).metadata();
    piezas.push({ input: r, left: x, top: y });
    if (vertical) { y += m.height + G; W = Math.max(W, m.width); H = y - G; } else { x += m.width + G; H = Math.max(H, m.height); W = x - G; }
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#C9C0A8' } }).composite(piezas).webp({ quality: 70 }).toFile(path.join(FOTOS, salida));
  console.log(salida);
}

(async () => {
  await new Promise((ok) => srv.listen(8902, ok));
  const nav = await chromium.launch();
  const ES = { locale: 'es-ES', colorScheme: 'light' };
  const G = { width: 1280, height: 720 }, M = { width: 360, height: 740 };
  await juntar([await trozo(nav, '/?lang=es', G, ES, '.pl-cab'), await trozo(nav, '/premium/?lang=es', G, ES, 'header'), await trozo(nav, '/beta/?lang=es', G, ES, 'header')], 'defecto-cabeceras.webp', true, 1000);
  await juntar([await trozo(nav, '/?lang=es', G, ES, '.pl-pie'), await trozo(nav, '/premium/?lang=es', G, ES, 'footer'), await trozo(nav, '/beta/?lang=es', G, ES, 'footer')], 'defecto-pies.webp', true, 1000);
  await juntar([await trozo(nav, '/?lang=es', G, ES, '#pace-landing main section')], 'defecto-capturas.webp', true, 1000);
  await juntar([await trozo(nav, '/?lang=es', M, ES, '.pl-mods'), await trozo(nav, '/premium/?lang=es', M, ES, '.lista'), await trozo(nav, '/beta/?lang=es', M, ES, '.modulos')], 'defecto-modulos.webp', true);
  await juntar([await trozo(nav, '/premium/?lang=es', G, { locale: 'es-ES', colorScheme: 'dark' }, '#capturas')], 'defecto-oscuro.webp', true, 640);
  await juntar([await trozo(nav, '/premium/?lang=en', G, { locale: 'en-US', colorScheme: 'light' }, '.portada')], 'defecto-ingles.webp', true, 1000);

  /* El peso: el CSS de cada dirección (con los dibujos de los módulos) y el primer pintado de la landing. */
  const original = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const glifos = require('./maqueta.glifos.js')();
  const pesos = {};
  for (const d of ['hoy', 'a', 'b', 'c']) {
    const f = path.join(AQUI, 'dir-' + d + '.css');
    if (d !== 'hoy' && !fs.existsSync(f)) continue;
    const css = d === 'hoy' ? '' : glifos + fs.readFileSync(f, 'utf8');
    indexConCss = css ? original.replace('  </style>\n  <!--/pace-landing-->', css + '\n  </style>\n  <!--/pace-landing-->') : original;
    if (css && indexConCss === original) throw new Error('no encuentro dónde meter el CSS en index.html');
    const t = [];
    for (let i = 0; i < 7; i++) {
      const ctx = await nav.newContext({ viewport: M, serviceWorkers: 'block' }); const page = await ctx.newPage();
      await page.goto('http://localhost:8902/?lang=es', { waitUntil: 'load' });
      t.push(await page.evaluate(() => Math.round((performance.getEntriesByName('first-contentful-paint')[0] || {}).startTime || -1)));
      await ctx.close();
    }
    t.sort((x, y) => x - y);
    pesos[d] = { bruto: Buffer.byteLength(css), gzip: css ? zlib.gzipSync(css).length : 0, fcp: t[3] };
    console.log(d, pesos[d], t.join(','));
  }
  fs.writeFileSync(path.join(AQUI, 'pesos.json'), JSON.stringify(pesos, null, 1));
  await nav.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
