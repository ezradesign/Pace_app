/**
 * verify.licencia.js - PACE · red de seguridad LOCAL · NINGUNA LLAVE PRIVADA EN EL REPO
 *
 * No es un script suelto: lo invoca `scripts/verify.js` como una tanda más.
 *
 * QUÉ VIGILA. Los códigos de PACE completo se firman con una llave privada que vive
 * en el PC de Ez, fuera del repositorio (scripts/licencias/). Si un día entrara aquí,
 * cualquiera que leyera el repo podría fabricar códigos. Por eso:
 *   · falla si algún archivo del árbol lleva una llave privada en PEM o se llama *.pem;
 *   · falla si `app/licencia.llaves.js` no tiene la forma que leen la app y los scripts
 *     (cada llave, `kN: { x: '…', y: '…' }` con 43 caracteres base64url por coordenada).
 *
 * NO CUBRE: secretos con otro formato (la llave de Play va en los secretos de GitHub y
 * su keystore de prueba, el de los APK de depuración, sí está en el repo a propósito).
 */

'use strict';

var fs = require('fs');
var path = require('path');

/* Partida en dos para que este archivo no se encuentre a sí mismo. */
var MARCA_PRIVADA = new RegExp('-----BEGIN (EC |RSA |ENCRYPTED )?' + 'PRIVATE KEY-----');
var SALTAR = /(^|[\\/])(node_modules|\.git|vendor|backups|www|test-results|playwright-report|build|\.gradle)([\\/]|$)/;
var TEXTO = /\.(js|jsx|json|html|md|txt|css|yml|yaml|pem|key|env|xml|properties|gradle|csv)$/i;

function recorrer(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    var p = path.join(dir, d.name);
    if (SALTAR.test(p)) return;
    if (d.isDirectory()) recorrer(p, out);
    else out.push(p);
  });
  return out;
}

function tandaLicencia(ctx) {
  console.log('\n[licencia] Ninguna llave privada en el repo y llaves públicas bien formadas');
  var malas = [];
  recorrer(ctx.ROOT, []).forEach(function (p) {
    var rel = ctx.rel(p);
    if (/\.pem$/i.test(p)) { malas.push(rel + ' (archivo .pem)'); return; }
    if (!TEXTO.test(p)) return;
    var st = fs.statSync(p);
    if (st.size > 2 * 1024 * 1024) return;
    if (MARCA_PRIVADA.test(fs.readFileSync(p, 'utf8'))) malas.push(rel);
  });
  if (malas.length) ctx.falla('Llave privada dentro del repo: ' + malas.join(', ') + '. Tiene que vivir fuera (scripts/licencias/).');
  else ctx.ok('Ninguna llave privada en el árbol');

  var archivo = path.join(ctx.ROOT, 'app', 'licencia.llaves.js');
  var src = fs.readFileSync(archivo, 'utf8');
  var bloque = src.match(/var PACE_LLAVES_LICENCIA = \{\r?\n([\s\S]*?)\};/);
  if (!bloque) { ctx.falla('app/licencia.llaves.js: no encuentro `var PACE_LLAVES_LICENCIA = { … };`'); return; }
  var lineas = bloque[1].split(/\r?\n/).filter(function (l) { return l.trim(); });
  var forma = /^\s*k\d+:\s*\{\s*x:\s*'[A-Za-z0-9_-]{43}',\s*y:\s*'[A-Za-z0-9_-]{43}'\s*\},?\s*$/;
  var rotas = lineas.filter(function (l) { return !forma.test(l); });
  if (rotas.length) ctx.falla('app/licencia.llaves.js: ' + rotas.length + ' línea(s) con otra forma: ' + rotas.join(' | '));
  else if (!lineas.length) ctx.info('app/licencia.llaves.js sin llaves todavía: ningún código abre nada hasta `npm run licencia:llaves`');
  else ctx.ok(lineas.length + ' llave(s) pública(s) bien formada(s)');
}

module.exports = { tandaLicencia: tandaLicencia };
