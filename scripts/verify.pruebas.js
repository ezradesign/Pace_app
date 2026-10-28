'use strict';
/* PACE · verify.pruebas.js — NINGUNA ESPERA DE LAS PRUEBAS QUE NO ESPERE
   ============================================================
   `page.waitForFunction(async …)` no espera en Playwright: toma la promesa por un valor
   verdadero y vuelve en el primer sondeo, a los ~20 ms, aunque la condición sea falsa (medido
   con 1.62.1 el 27 oct. 2026). Había once en tests/ y ninguna esperaba: la prueba solo pasaba
   si la app ganaba la carrera, y en el CI de 3bde26f `eventos-backup` la perdió. Una condición
   asíncrona se espera con `esperarEnPagina` (tests/helpers.js). Esto falla si vuelve una en
   tests/. Los comentarios no cuentan.

   Tampoco vale instalar el reloj de la página a la hora de verdad (`clock.install()`) y leer «hoy»
   con el reloj de Node (`new Date().getDay()` o `toDateString()`): lo que la prueba adelanta (una hora oculta, media hora
   dormida) cruza la medianoche si corre de noche, la app apunta la sesión al día siguiente y la prueba
   mira el de antes. En el CI de las 23:00 a las 24:00 de Madrid caía `caza-sesiones`. El reloj se
   instala a `MEDIODIA` (tests/helpers.js). */

var fs = require('fs');
var path = require('path');

var ESPERA_ASINCRONA = /waitForFunction\(\s*async\b/;
var RELOJ_A_LA_HORA_DE_VERDAD = /clock\.install\(\s*\)/;
var HOY_DE_NODE = /new Date\(\)\.(getDay|getDate|toDateString)\(\)/;

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

  var deNoche = [];
  recorrer(path.join(ctx.ROOT, 'tests'), []).forEach(function (p) {
    var src = sinComentarios(fs.readFileSync(p, 'utf8'));
    if (RELOJ_A_LA_HORA_DE_VERDAD.test(src) && HOY_DE_NODE.test(src)) {
      deNoche.push(path.relative(ctx.ROOT, p).replace(/\\/g, '/'));
    }
  });
  if (deNoche.length) ctx.falla('reloj de la página a la hora de verdad y «hoy» con el de Node, que falla de noche: ' + deNoche.join(', ') + '. Instala el reloj a MEDIODIA (tests/helpers.js).');
  else ctx.ok('Ninguna prueba adelanta el reloj desde la hora de verdad y lee «hoy» en Node');
}

module.exports = { tandaPruebas: tandaPruebas };
