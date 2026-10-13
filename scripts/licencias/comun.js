/**
 * scripts/licencias/comun.js - lo que comparten `crear-llaves.js` y `firmar.js`.
 *
 * LA LLAVE PRIVADA NO ENTRA NUNCA EN EL REPOSITORIO. Vive en una carpeta fuera de
 * él (por defecto `PACE-llave-licencias` en la carpeta de usuario de Ez, al lado
 * de la de Play) y los dos scripts se niegan a usar una carpeta que esté dentro
 * del repo. `verify` falla además si aparece una llave privada en el árbol.
 *
 * El formato del código y su comprobación están en `app/state-licencia.js`.
 */
'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');

var ROOT = path.resolve(__dirname, '..', '..');
var LLAVES_APP = path.join(ROOT, 'app', 'licencia.llaves.js');
var PREFIJO = 'PACE1';

function carpetaPorDefecto() {
  return process.env.PACE_LLAVE_LICENCIAS || path.join(os.homedir(), 'PACE-llave-licencias');
}

/* La carpeta de la llave no puede estar dentro del repositorio. */
function comprobarCarpeta(carpeta) {
  var abs = path.resolve(carpeta);
  var rel = path.relative(ROOT, abs);
  if (!rel.startsWith('..') && !path.isAbsolute(rel)) {
    throw new Error('La carpeta de la llave (' + abs + ') está dentro del repositorio. Tiene que ir fuera.');
  }
  return abs;
}

/* Las llaves públicas que lleva la app: { k1: { x, y }, … } en su orden. */
function leerLlavesApp() {
  var src = fs.readFileSync(LLAVES_APP, 'utf8');
  var out = {};
  var re = /^\s*(k\d+):\s*\{\s*x:\s*'([A-Za-z0-9_-]+)',\s*y:\s*'([A-Za-z0-9_-]+)'\s*\},?\s*$/gm;
  var m;
  while ((m = re.exec(src))) out[m[1]] = { x: m[2], y: m[3] };
  return out;
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function argumentos(argv) {
  var opts = { _: [] };
  for (var i = 0; i < argv.length; i++) {
    var a = argv[i];
    if (a.indexOf('--') === 0) {
      var k = a.slice(2);
      var v = (argv[i + 1] && argv[i + 1].indexOf('--') !== 0) ? argv[++i] : true;
      opts[k] = v;
    } else opts._.push(a);
  }
  return opts;
}

module.exports = {
  ROOT: ROOT, LLAVES_APP: LLAVES_APP, PREFIJO: PREFIJO,
  carpetaPorDefecto: carpetaPorDefecto, comprobarCarpeta: comprobarCarpeta,
  leerLlavesApp: leerLlavesApp, b64url: b64url, argumentos: argumentos,
};
