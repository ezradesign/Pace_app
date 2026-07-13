/* Mini servidor estatico para preview de PACE.html (sesion 80).
   Sirve archivos del cwd. Sin dependencias externas. */
'use strict';
var http = require('http');
var fs   = require('fs');
var path = require('path');

var PORT = parseInt(process.env.PORT || '8765', 10);
var ROOT = process.cwd();

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
};

http.createServer(function (req, res) {
  var url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/' || url === '') url = '/PACE.html';
  // Rutas bonitas de Cloudflare Pages (s102): /safety y /privacy sirven
  // sus .html para que el preview se comporte como producción.
  if (url === '/safety' || url === '/privacy') url += '.html';
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
    });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, function () {
  console.log('PACE preview server: http://localhost:' + PORT + '/');
});
