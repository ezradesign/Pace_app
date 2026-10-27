'use strict';
/* PACE · verify.pruebas.js — NINGUNA ESPERA DE LAS PRUEBAS QUE NO ESPERE
   ============================================================
   `page.waitForFunction(async …)` no espera en Playwright: toma la promesa por un valor
   verdadero y vuelve en el primer sondeo, a los ~20 ms, aunque la condición sea falsa (medido
   con 1.62.1 el 27 oct. 2026). Había once en tests/ y ninguna esperaba: la prueba solo pasaba
   si la app ganaba la carrera, y en el CI de 3bde26f `eventos-backup` la perdió. Una condición
   asíncrona se espera con `esperarEnPagina` (tests/helpers.js). Esto falla si vuelve una en
   tests/. Los comentarios no cuentan. */

var fs = require('fs');
var path = require('path');

var ESPERA_ASINCRONA = /waitForFunction\(\s*async\b/;

function recorrer(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    var p = path.join(dir, d.name);
    if (d.isDirectory()) recorrer(p, out);
    else if (/\.js$/.test(d.name)) out.push(p);
  });
  return out;
}

function sinComentarios(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"])\/\/.*$/gm, '$1');
}

function tandaPruebas(ctx) {
  console.log('\n[pruebas] Las esperas de las pruebas esperan de verdad');
  var malos = [];
  recorrer(path.join(ctx.ROOT, 'tests'), []).forEach(function (p) {
    if (ESPERA_ASINCRONA.test(sinComentarios(fs.readFileSync(p, 'utf8')))) {
      malos.push(path.relative(ctx.ROOT, p).replace(/\\/g, '/'));
    }
  });
  if (malos.length) ctx.falla('waitForFunction con una condición asíncrona, que no espera: ' + malos.join(', ') + '. Usa esperarEnPagina (tests/helpers.js).');
  else ctx.ok('Ningún waitForFunction(async …) en tests/');
}

module.exports = { tandaPruebas: tandaPruebas };
