/**
 * npm run licencia:codigo -- 7          un código de por vida para el tester 7
 * npm run licencia:codigo -- 1-15       uno para cada tester del 1 al 15
 *
 * Imprime el ENLACE de cada tester (lo que se le manda) y lo apunta también en
 * `codigos-tester.csv`, dentro de la carpeta de la llave: fuera del repositorio,
 * porque un enlace abre PACE completo a quien lo tenga.
 *
 * Antes de imprimir, cada código se comprueba con la llave PÚBLICA que lleva la
 * app: si no casan, no sale nada (sería un enlace que no abre).
 *
 * Opciones: --carpeta <ruta>   la de la llave (como en crear-llaves.js)
 *           --caduca AAAA-MM-DD  un código con fecha de fin (por defecto, para siempre)
 *           --web <url>        la dirección del enlace (por defecto https://pacegrass.app/)
 */
'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var c = require('./comun.js');

function hoy() {
  var d = new Date();
  var p = function (n) { return (n < 10 ? '0' : '') + n; };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function testers(lista) {
  var out = [];
  lista.forEach(function (a) {
    String(a).split(',').forEach(function (t) {
      var m = t.match(/^(\d+)-(\d+)$/);
      if (m) for (var i = Number(m[1]); i <= Number(m[2]); i++) out.push(i);
      else if (/^\d+$/.test(t)) out.push(Number(t));
      else if (t) throw new Error('«' + t + '» no es un número de tester.');
    });
  });
  return out;
}

function main() {
  var o = c.argumentos(process.argv.slice(2));
  var nums = testers(o._);
  if (!nums.length) throw new Error('Falta el número de tester: npm run licencia:codigo -- 7');
  if (o.caduca && !/^\d{4}-\d{2}-\d{2}$/.test(o.caduca)) throw new Error('--caduca va como AAAA-MM-DD.');

  var carpeta = c.comprobarCarpeta(o.carpeta || c.carpetaPorDefecto());
  var llaves = c.leerLlavesApp();
  /* La llave más nueva que esté a la vez en la app y en la carpeta. */
  var keyId = Object.keys(llaves).sort(function (a, b) { return Number(b.slice(1)) - Number(a.slice(1)); })
    .filter(function (id) { return fs.existsSync(path.join(carpeta, id + '.privada.pem')); })[0];
  if (!keyId) throw new Error('No hay llave en ' + carpeta + ' que case con app/licencia.llaves.js. ¿Has hecho `npm run licencia:llaves`?');

  var privada = crypto.createPrivateKey(fs.readFileSync(path.join(carpeta, keyId + '.privada.pem')));
  var publica = crypto.createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: llaves[keyId].x, y: llaves[keyId].y }, format: 'jwk' });
  var web = String(o.web || 'https://pacegrass.app/');
  var filas = [];

  nums.forEach(function (n) {
    var datos = { type: 'lifetime', keyId: keyId, issuedAt: hoy(), tester: n };
    if (o.caduca) datos.expiresAt = o.caduca;
    var firmado = c.PREFIJO + '.' + c.b64url(JSON.stringify(datos));
    var firma = crypto.sign('sha256', Buffer.from(firmado), { key: privada, dsaEncoding: 'ieee-p1363' });
    if (!crypto.verify('sha256', Buffer.from(firmado), { key: publica, dsaEncoding: 'ieee-p1363' }, firma)) {
      throw new Error('La llave de la carpeta no casa con la de la app (' + keyId + ').');
    }
    var codigo = firmado + '.' + c.b64url(firma);
    var enlace = web.replace(/#.*$/, '') + '#codigo=' + codigo;
    filas.push([n, datos.issuedAt, enlace]);
    console.log('Tester ' + n + ':\n  ' + enlace + '\n');
  });

  var csv = path.join(carpeta, 'codigos-tester.csv');
  var nuevo = !fs.existsSync(csv);
  fs.appendFileSync(csv, (nuevo ? 'tester,fecha,enlace\n' : '') + filas.map(function (f) { return f.join(','); }).join('\n') + '\n');
  console.log('Apuntados en ' + csv + ' (fuera del repositorio).');
}

try { main(); } catch (e) { console.error('No se ha podido: ' + e.message); process.exit(1); }
