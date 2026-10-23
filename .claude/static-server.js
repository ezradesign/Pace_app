/* Mini servidor estatico para preview de PACE.html (sesion 80).
   Sirve archivos del cwd. Sin dependencias externas. */
'use strict';
var http = require('http');
var fs   = require('fs');
var path = require('path');

var PORT = parseInt(process.env.PORT || '8765', 10);
/* Con una carpeta (`node .claude/static-server.js dist`) sirve esa: lo que
   publica la web, para probarlo antes de que lo publique Cloudflare. */
var ROOT = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
/* En dist/ no hay PACE.html: «/» es la app compilada, como en pacegrass.app. */
var INICIO = fs.existsSync(path.join(ROOT, 'PACE.html')) ? '/PACE.html' : '/index.html';

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.jsx':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

http.createServer(function (req, res) {
  var url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/' || url === '') url = INICIO;
  // Rutas bonitas de Cloudflare Pages (s102): /safety y /privacy sirven
  // sus .html para que el preview se comporte como producción.
  if (url === '/safety' || url === '/privacy') url += '.html';
  // Las páginas sueltas son carpetas (/premium, /beta): Cloudflare sirve su index.html en /carpeta/.
  if (/\/$/.test(url)) url += 'index.html';
  else if (!path.extname(url) && fs.existsSync(path.join(ROOT, url, 'index.html'))) url += '/index.html';
  var file = path.join(ROOT, url);
  // Block traversal outside ROOT.
  if (file.indexOf(ROOT) !== 0) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(file, function (err, stat) {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found: ' + url);
    }
    var ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      // Sin validadores el navegador cachea heuristicamente los .jsx y la
      // verificacion ve codigo viejo (s93; segunda capa ademas del SW de
      // s91/s92). Preview siempre fresco: nada de cache.
      'Cache-Control': 'no-store',
      // Qué carpeta sirve: la suite lo compara con la suya antes de empezar,
      // porque reutiliza cualquier servidor que ya escuche en su puerto
      // (tests/servidor-propio.setup.js).
      'X-Pace-Raiz': encodeURIComponent(ROOT),
    });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, function () {
  console.log('PACE preview server: http://localhost:' + PORT + '/');
});
