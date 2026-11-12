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

/* EL RELOJ DE LA PÁGINA, SIEMPRE A UNA HORA FIJA (la octava, nº 1, 11 nov. 2026). La regla de arriba
   solo ve un caso de los que fallan de noche: una prueba que instala el reloj a la hora de verdad y
   adelanta minutos cruza la medianoche si corre a las 23:56, lea o no «hoy» en Node (la de la
   landing cayó así sin que esta tanda la viera). Ahora falla cualquier `clock.install()` sin hora
   (`{ time: MEDIODIA }`, tests/helpers.js) fuera de esta lista, que solo puede encoger: un archivo
   que ya no lo usa tiene que salir de ella. Los 26 de hoy son de antes de la regla. */
var RELOJ_SIN_HORA = /clock\.install\(\s*\)/;
var RELOJ_SIN_HORA_ANTIGUOS = [
  'aro-de-golpe.spec.js',
  'aro-paso.spec.js',
  'aro-recorrido.spec.js',
  'barras-transform.spec.js',
  'caza-respira.spec.js',
  'cierre-dibujo.spec.js',
  'cierre-italica.spec.js',
  'cierre-sin-pisar.spec.js',
  'cuerpo-tiempo-activo.spec.js',
  'espacio-mantenido.spec.js',
  'eventos-emisor.spec.js',
  'glifos-por-lado.spec.js',
  'home-geometria.spec.js',
  'home-luz-curva.spec.js',
  'home-luz.spec.js',
  'movimiento-reducido.spec.js',
  'mueve-reloj.spec.js',
  'respira-cierre.spec.js',
  'respira-entrada-salida.spec.js',
  'respira-espacio.spec.js',
  'respira-progreso.spec.js',
  'respira-reanudar.spec.js',
  'runner-cabe.spec.js',
  'runner-circulo.spec.js',
  'runner-mando.spec.js',
  'sello-espera.spec.js',
];

function recorrer(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    var p = path.join(dir, d.name);
    if (d.isDirectory()) recorrer(p, out);
    else if (/\.js$/.test(d.name)) out.push(p);
  });
  return out;
}

/* SALTOS EN SILENCIO (la octava, nº 12): un `.skip(`, `.fixme(` u `.only(` deja pruebas sin correr
   y el CI sigue en verde. Solo valen los de esta lista, que solo encoge: el de ios-nativo salta en
   WebKit porque su motor de la suite no trae Web Audio (lo corre Chromium). */
var SALTO = /\b(test|describe)\s*(\.\s*describe\s*)?\.\s*(skip|fixme|only)\s*\(/;
var SALTOS_PERMITIDOS = ['ios-nativo.safari.spec.js'];

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
  var sinHora = [];
  var yaNo = RELOJ_SIN_HORA_ANTIGUOS.slice();
  recorrer(path.join(ctx.ROOT, 'tests'), []).forEach(function (p) {
    var rel = path.relative(path.join(ctx.ROOT, 'tests'), p).split(path.sep).join('/');
    if (!RELOJ_SIN_HORA.test(sinComentarios(fs.readFileSync(p, 'utf8')))) return;
    var i = yaNo.indexOf(rel);
    if (i === -1) sinHora.push(rel); else yaNo.splice(i, 1);
  });
  if (sinHora.length) ctx.falla('clock.install() sin hora, que de noche cruza la medianoche: ' + sinHora.join(', ') + '. Instálalo a una hora fija ({ time: MEDIODIA }, tests/helpers.js).');
  else ctx.ok('Ninguna prueba nueva instala el reloj sin hora (' + RELOJ_SIN_HORA_ANTIGUOS.length + ' antiguas en la lista)');
  if (yaNo.length) ctx.falla('Ya no instalan el reloj sin hora y siguen en RELOJ_SIN_HORA_ANTIGUOS (scripts/verify.pruebas.js): quítalas de la lista, que solo encoge: ' + yaNo.join(', '));

  var saltos = [];
  var saltosYaNo = SALTOS_PERMITIDOS.slice();
  recorrer(path.join(ctx.ROOT, 'tests'), []).forEach(function (p) {
    var rel = path.relative(path.join(ctx.ROOT, 'tests'), p).split(path.sep).join('/');
    if (!SALTO.test(sinComentarios(fs.readFileSync(p, 'utf8')))) return;
    var i = saltosYaNo.indexOf(rel);
    if (i === -1) saltos.push(rel); else saltosYaNo.splice(i, 1);
  });
  if (saltos.length) ctx.falla('.skip / .fixme / .only en tests/, que dejan pruebas sin correr con el CI en verde: ' + saltos.join(', '));
  else ctx.ok('Ningún .skip, .fixme ni .only fuera de SALTOS_PERMITIDOS (' + SALTOS_PERMITIDOS.length + ')');
  if (saltosYaNo.length) ctx.falla('Ya no saltan y siguen en SALTOS_PERMITIDOS (scripts/verify.pruebas.js): quítalas, que la lista solo encoge: ' + saltosYaNo.join(', '));
}

module.exports = { tandaPruebas: tandaPruebas, SALTO: SALTO };
