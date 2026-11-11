/* Servidor de banco: imita a Cloudflare Pages (brotli, ETag, max-age=0 must-revalidate)
   y deja cambiar la carpeta servida en caliente: GET /__version?to=v194 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib'), crypto = require('crypto');
const SP = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8910);
let actual = process.argv[2] || 'v195';
const raiz = () => path.join(SP, actual, 'dist');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
const memo = new Map();
const log = [];
/* Red lenta en el SERVIDOR (asi vale tambien para lo que pide el service worker, que la
   emulacion por CDP de la pagina no frena): latencia por peticion y un tubo compartido. */
let red = { lat: 0, bps: 0 }; let libreEn = 0;
function enviar(res, cuerpo) {
  if (!red.bps) { res.end(cuerpo); return; }
  const trozo = 8192; let i = 0;
  const sigue = () => {
    if (i >= cuerpo.length) { res.end(); return; }
    const t = cuerpo.subarray(i, i + trozo); i += t.length;
    const ahora = Date.now(); const empieza = Math.max(ahora, libreEn);
    libreEn = empieza + (t.length / red.bps) * 1000;
    setTimeout(() => { res.write(t); sigue(); }, Math.max(0, libreEn - ahora));
  };
  sigue();
}
http.createServer((req, res) => { const u0 = new URL(req.url, 'http://x'); if (red.lat && !u0.pathname.startsWith('/__')) { setTimeout(() => atiende(req, res), red.lat); return; } atiende(req, res); }).listen(PORT, () => console.log('banco en ' + PORT + ' sirviendo ' + actual));
function atiende(req, res) {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/__version') { if (u.searchParams.get('to')) actual = u.searchParams.get('to'); res.end(actual); return; }
  if (u.pathname === '/__red') { red = { lat: Number(u.searchParams.get('lat') || 0), bps: Number(u.searchParams.get('bps') || 0) }; libreEn = 0; res.end(JSON.stringify(red)); return; }
  if (u.pathname === '/__log') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(log.splice(0))); return; }
  let p = decodeURIComponent(u.pathname);
  if (p === '/') p = '/index.html';
  if (p === '/privacy' || p === '/safety') p += '.html';
  if (/\/$/.test(p)) p += 'index.html';
  const file = path.join(raiz(), p);
  let st; try { st = fs.statSync(file); } catch (e) { st = null; }
  if (!st || !st.isFile()) { res.writeHead(404); res.end('no'); log.push([actual, p, 404]); return; }
  const key = file + ':' + st.mtimeMs;
  let m = memo.get(key);
  if (!m) {
    const buf = fs.readFileSync(file);
    const ext = path.extname(file);
    const texto = /html|javascript|json|css|svg|manifest/.test(MIME[ext] || '');
    m = { buf, ext, etag: '"' + crypto.createHash('md5').update(buf).digest('hex') + '"',
      br: texto ? zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }) : null };
    memo.set(key, m);
  }
  const h = { 'Content-Type': MIME[m.ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=0, must-revalidate', ETag: m.etag };
  if (req.headers['if-none-match'] === m.etag) { res.writeHead(304, h); res.end(); log.push([actual, p, 304]); return; }
  let cuerpo = m.buf;
  if (m.br && /\bbr\b/.test(req.headers['accept-encoding'] || '')) { h['Content-Encoding'] = 'br'; cuerpo = m.br; }
  h['Content-Length'] = cuerpo.length;
  res.writeHead(200, h); if (req.method === 'HEAD') res.end(); else enviar(res, cuerpo);
  log.push([actual, p, 200, cuerpo.length]);
}
