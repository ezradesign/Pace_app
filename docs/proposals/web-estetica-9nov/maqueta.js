/* PACE · la maqueta de la estética de la web (landing, /premium y /beta)
 * =======================================================================
 * Sirve la web de la rama tal cual la publica `scripts/web-dist.js` y fotografía cada página con
 * el CSS de una dirección encima (dir-a.css, dir-b.css, dir-c.css), sin tocar los archivos que se
 * publican. «hoy» es la web sin nada encima.
 *
 * Uso (desde la raíz del repo, después de `node build-standalone.js`):
 *   node docs/proposals/web-estetica-9nov/maqueta.js [--dirs=hoy,a,b,c] [--paginas=landing,premium,beta]
 *        [--anchos=360,1280] [--idiomas=es,en] [--temas=claro,oscuro] [--dist=carpeta]
 * Deja las fotos en docs/proposals/web-estetica-9nov/fotos/<dir>-<página>-<ancho>-<idioma>-<tema>.webp
 * y sus medidas en fotos/medidas.json. Puerto 8901.
 */
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const AQUI = __dirname;
const REPO = path.join(AQUI, '..', '..', '..');
const { chromium } = require(path.join(REPO, 'node_modules', '@playwright/test'));
const sharp = require(path.join(REPO, 'node_modules', 'sharp'));
const { montarWeb } = require(path.join(REPO, 'scripts', 'web-dist.js'));

const arg = (n, def) => { const a = process.argv.find((x) => x.startsWith('--' + n + '=')); return a ? a.slice(n.length + 3).split(',') : def; };
const DIRS = arg('dirs', ['hoy', 'a']);
const PAGINAS = arg('paginas', ['landing', 'premium', 'beta']);
const ANCHOS = arg('anchos', ['360', '1280']);
const IDIOMAS = arg('idiomas', ['es']);
const TEMAS = arg('temas', ['claro']);
const DIST = path.resolve((arg('dist', [null])[0]) || path.join(os.tmpdir(), 'pace-maqueta-web-dist'));
const FOTOS = path.join(AQUI, 'fotos');
const RUTA = { landing: '/', premium: '/premium/', beta: '/beta/' };
const VISTA = { 360: { width: 360, height: 740 }, 1280: { width: 1280, height: 720 } };
/* Las fotos se guardan más estrechas que la ventana: bastan para leer y pesan la mitad. */
const GUARDAR = { 360: 360, 1280: 1000 };

const cssGlifos = require('./maqueta.glifos.js');
function cssDe(dir) {
  if (dir === 'hoy' || dir === 'montada') return '';
  return cssGlifos() + fs.readFileSync(path.join(AQUI, 'dir-' + dir + '.css'), 'utf8');
}

/* Lo que una dirección cambia en el marcado (en la maqueta; al montarla iría al HTML). */
function retocar({ dir, pagina, idioma, tema }) {
  if (dir === 'hoy' || dir === 'montada') return;
  /* /premium: la pantalla de la app de la portada, rehecha con la app de la rama en su idioma y tema. */
  if (pagina === 'premium') {
    const s = document.querySelector('.portada picture source'); const i = document.querySelector('.portada picture img');
    if (s) s.srcset = '/maq/app-movil-' + idioma + '-' + tema + '.webp';
    if (i) i.src = '/maq/app-escritorio-' + idioma + '-' + tema + '.webp';
  }
  /* /beta (A y B): el título y lo demás de la portada, en dos grupos, para la fila de capturas. */
  if (pagina === 'beta' && (dir === 'a' || dir === 'b')) {
    const portada = document.querySelector('.portada'); const texto = portada.firstElementChild;
    portada.classList.add('maq-beta'); texto.classList.add('maq-titulo');
    const a = document.createElement('div'); const b = document.createElement('div'); b.className = 'maq-resto';
    Array.from(texto.children).forEach((el) => ((el.matches('.kicker, h1') ? a : b).appendChild(el)));
    texto.append(a, b);
  }
  if (window.maqRetoque) window.maqRetoque({ dir, pagina, idioma, tema });
}

function medir() {
  const raiz = document.querySelector('#pace-landing') && getComputedStyle(document.querySelector('#pace-landing')).display !== 'none' ? document.querySelector('#pace-landing') : document.body;
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const imgs = Array.from(raiz.querySelectorAll('img')).filter(vis).filter((i) => !i.closest('header, footer, .pl-cab, .pl-pie'));
  return { alto: document.documentElement.scrollHeight, desborde: document.documentElement.scrollWidth - innerWidth,
    capturas: imgs.map((i) => Math.round(i.getBoundingClientRect().width)) };
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
function servir(puerto) {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      let url = decodeURIComponent(req.url.split('?')[0]);
      if (url === '/') url = '/index.html';
      if (url === '/privacy' || url === '/safety') url += '.html';
      if (/\/$/.test(url)) url += 'index.html';
      if (url === '/api/avisame' || url === '/api/desistir') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{"abierta":false}'); }
      const base = url.startsWith('/maq/') ? path.join(AQUI, 'capturas') : DIST;
      const f = path.join(base, url.replace(/^\/maq\//, '/'));
      if (f.indexOf(base) !== 0 || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end('no'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    }).listen(puerto, () => ok(s));
  });
}

(async () => {
  fs.mkdirSync(FOTOS, { recursive: true });
  if (!fs.existsSync(path.join(DIST, 'index.html')) || !process.argv.some((a) => a.startsWith('--dist='))) montarWeb(DIST);
  const srv = await servir(8901);
  const nav = await chromium.launch();
  const fMedidas = path.join(FOTOS, 'medidas.json');
  const medidas = fs.existsSync(fMedidas) ? JSON.parse(fs.readFileSync(fMedidas, 'utf8')) : {};
  for (const dir of DIRS) {
    const css = cssDe(dir);
    for (const pagina of PAGINAS) for (const ancho of ANCHOS) for (const idioma of IDIOMAS) for (const tema of TEMAS) {
      const ctx = await nav.newContext({ viewport: VISTA[ancho], colorScheme: tema === 'oscuro' ? 'dark' : 'light', locale: idioma === 'en' ? 'en-US' : 'es-ES', deviceScaleFactor: 1, serviceWorkers: 'block' });
      const page = await ctx.newPage();
      const errores = []; page.on('pageerror', (e) => errores.push(String(e).slice(0, 140)));
      await page.goto('http://localhost:8901' + RUTA[pagina] + '?lang=' + idioma, { waitUntil: 'load' });
      if (css) await page.addStyleTag({ content: css });
      await page.evaluate(retocar, { dir, pagina, idioma, tema });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => { for (const i of document.images) i.loading = 'eager'; await Promise.all(Array.from(document.images).filter((i) => i.getBoundingClientRect().width > 0).map((i) => i.decode().catch(() => {}))); });
      await page.waitForTimeout(200);
      const clave = [dir, pagina, ancho, idioma, tema].join('-');
      medidas[clave] = await page.evaluate(medir);
      const png = await page.screenshot({ fullPage: true });
      await sharp(png).resize({ width: GUARDAR[ancho] }).webp({ quality: 58 }).toFile(path.join(FOTOS, clave + '.webp'));
      console.log(clave, medidas[clave].alto + ' px', Math.round(fs.statSync(path.join(FOTOS, clave + '.webp')).size / 1024) + ' KB', medidas[clave].desborde ? 'DESBORDA ' + medidas[clave].desborde : '', errores.join(' | '));
      await ctx.close();
    }
  }
  fs.writeFileSync(fMedidas, JSON.stringify(medidas, null, 1));
  await nav.close();
  srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
