/**
 * verify.web.js - PACE · red de seguridad LOCAL · LO QUE PUBLICA LA WEB
 *
 * No es un script suelto: lo invoca `scripts/verify.js` como una tanda más.
 *
 * QUÉ VIGILA. pacegrass.app publica `dist/` (`scripts/web-dist.js`), no la raíz del
 * repo (Ez, 18 oct. 2026). Esta tanda monta esa carpeta en una temporal, igual que
 * Cloudflare, y mira lo que ha quedado dentro:
 *   · todo lo que precarga `sw.js`: `cache.addAll` es atómico y con una sola 404 el
 *     service worker no se instala, y la app deja de abrir sin red;
 *   · lo que la web necesita: la app, el service worker, las cabeceras, la vuelta del
 *     permiso del calendario, /premium, /beta, la privacidad y la seguridad;
 *   · que no se cuela nada que no sea la app (documentos, pruebas, scripts, funciones,
 *     PACE.html o el export);
 *   · que cada página de la raíz (un .html o una carpeta con index.html) se publica o
 *     está en NO_SE_PUBLICA: una página nueva tiene que decidir;
 *   · que lo que piden por ruta las páginas pequeñas (todas menos la app) está dentro.
 */

'use strict';

var cp = require('child_process');
var fs = require('fs');
var os = require('os');
var path = require('path');

var NECESARIOS = ['index.html', 'sw.js', '_headers', 'calendario.html', 'premium/index.html', 'beta/index.html',
                  'privacy.html', 'safety.html', 'manifest.webmanifest'];
/* Lo que está en la raíz y no se publica a propósito: el de desarrollo y el export. */
var NO_SE_PUBLICA = ['PACE.html', 'PACE_standalone.html'];
/* Carpetas que se generan (fuera de git) y no son páginas de la web. */
var GENERADAS = /^(dist|www|node_modules|test-results|playwright-report|blob-report|backups|[._].*)$/;
var AJENO = /(^|\/)(docs|tests|scripts|functions|android|ios|design|design-system|mockups|vendor|node_modules|\.claude|\.github)\/|\.(md|jsx|map)$|^(package(-lock)?\.json|capacitor\.config\.json|build-standalone\.js|playwright\.config\.js|LICENSE)$/;

function filasPrecache(ROOT) {
  var sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  var m = sw.match(/const PRECACHE = \[([\s\S]*?)\n\];/);
  if (!m) return null;
  var limpio = m[1].replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  var filas = [], re = /'([^']+)'/g, x;
  while ((x = re.exec(limpio))) filas.push(x[1]);
  return filas;
}

/* Lo que git ignora no llega a Cloudflare, que monta la web desde el repo: las maquetas sueltas
   de la raíz (`_maqueta-*.html`, `_revision-*.html`) solo viven en una copia de trabajo, y
   contarlas hacía fallar el verify en el PC de Ez y no en la CI. Sin git a mano, no se aparta nada. */
function ignoradasPorGit(ROOT, rutas) {
  if (!rutas.length) return new Set();
  var r = cp.spawnSync('git', ['check-ignore', '--stdin'], { cwd: ROOT, input: rutas.join('\n'), encoding: 'utf8' });
  if (r.error || (r.status !== 0 && r.status !== 1)) return new Set();
  return new Set(r.stdout.split(/\r?\n/).filter(Boolean));
}

/* Una ruta de la web al archivo que la sirve, como en Cloudflare: '/' es index.html,
   '/privacy' es privacy.html y '/premium/' es premium/index.html. */
function archivoDeRuta(ruta, hay) {
  var r = ruta.replace(/[?#].*$/, '').replace(/^\//, '');
  var opciones = [r, r + '.html', (r ? r.replace(/\/$/, '') + '/' : '') + 'index.html'];
  for (var i = 0; i < opciones.length; i++) if (hay.has(opciones[i])) return opciones[i];
  return null;
}

function tandaWeb(ctx) {
  console.log('\n[web] Lo que publica pacegrass.app: dist/, montado como en Cloudflare');
  var web = require('./web-dist.js');
  var tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pace-dist-'));
  try {
    web.montarWeb(tmp);
    var hay = new Set(listarTodo(tmp, tmp, []));

    var filas = filasPrecache(ctx.ROOT);
    if (!filas) ctx.falla('web: no se reconoce el array PRECACHE en sw.js -- no se ha mirado el precache');
    else {
      var faltan = filas.filter(function (p) { return p === '/' ? !hay.has('index.html') : !archivoDeRuta(p, hay); });
      if (faltan.length) ctx.falla('web: ' + faltan.length + ' fila(s) de PRECACHE que no están en dist/ (' + faltan.slice(0, 5).join(', ') +
        ') -- con una sola 404 el service worker no se instala; añádelas en scripts/android-www.js o scripts/web-dist.js');
      else ctx.ok(filas.length + ' filas de PRECACHE, todas en dist/');
    }

    var sinNecesario = NECESARIOS.filter(function (r) { return !hay.has(r); });
    if (sinNecesario.length) ctx.falla('web: falta en dist/ ' + sinNecesario.join(', '));
    else ctx.ok('dist/ lleva la app, el service worker, las cabeceras, el calendario, /premium, /beta y lo legal');

    var ajeno = Array.from(hay).filter(function (r) { return AJENO.test(r) || NO_SE_PUBLICA.indexOf(r) >= 0; });
    if (ajeno.length) ctx.falla('web: dist/ publica lo que no es la app: ' + ajeno.slice(0, 5).join(', '));
    else ctx.ok('dist/ no lleva documentos, pruebas, scripts ni funciones (' + hay.size + ' archivos)');

    var paginas = fs.readdirSync(ctx.ROOT, { withFileTypes: true }).map(function (d) {
      if (d.isFile() && /\.html$/.test(d.name)) return d.name;
      if (d.isDirectory() && !GENERADAS.test(d.name) && fs.existsSync(path.join(ctx.ROOT, d.name, 'index.html'))) return d.name + '/index.html';
      return null;
    }).filter(Boolean);
    var ignoradas = ignoradasPorGit(ctx.ROOT, paginas);
    paginas = paginas.filter(function (p) { return !ignoradas.has(p); });
    var sinDecidir = paginas.filter(function (p) { return !hay.has(p) && NO_SE_PUBLICA.indexOf(p) < 0; });
    if (sinDecidir.length) ctx.falla('web: página(s) en la raíz que no se publican ni están en NO_SE_PUBLICA: ' + sinDecidir.join(', ') +
      ' -- si es de la web, a WEB_ARCHIVOS o WEB_CARPETAS de scripts/web-dist.js');
    else ctx.ok(paginas.length + ' páginas en la raíz: cada una se publica o está apartada a propósito');

    var rotas = [];
    Array.from(hay).filter(function (r) { return /\.html$/.test(r) && r !== 'index.html'; }).forEach(function (pag) {
      var src = fs.readFileSync(path.join(tmp, pag), 'utf8');
      var re = /(?:src|href)\s*=\s*["'](\/[^"'\/][^"']*|\/)["']|url\(\s*['"]?(\/[^'")]+)['"]?\s*\)/g, x;
      while ((x = re.exec(src))) {
        var ruta = x[1] || x[2];
        if (ruta.indexOf('/api/') === 0) continue;
        if (!archivoDeRuta(ruta, hay)) rotas.push(pag + ' → ' + ruta);
      }
    });
    if (rotas.length) ctx.falla('web: ' + rotas.length + ' ruta(s) que piden las páginas y no están en dist/: ' + rotas.slice(0, 5).join(', '));
    else ctx.ok('lo que piden por ruta las páginas publicadas está en dist/');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function listarTodo(dir, base, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    var p = path.join(dir, d.name);
    if (d.isDirectory()) listarTodo(p, base, out);
    else out.push(path.relative(base, p).replace(/\\/g, '/'));
  });
  return out;
}

var NO_CUBRE = [
  'web: se monta dist/ como Cloudflare, pero no lo que Cloudflare hace con ella (rutas bonitas, /api/, las cabeceras de verdad) ' +
    'ni que en Cloudflare Pages estén el comando y la salida -- eso se mira en pacegrass.app: /STATE.md ya no se sirve (por el tamaño)',
];

module.exports = { tandaWeb: tandaWeb, NO_CUBRE: NO_CUBRE };
