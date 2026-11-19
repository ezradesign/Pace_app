'use strict';
/* PACE · verify.voz.js — LOS MÁRGENES DE LA TABLA DE LA VOZ DE MUEVE Y ESTIRA
   ==========================================================================
   La tabla (app/ui/Sound.voz.cuerpo.datos.js) la escribe scripts/voz-cuerpo-tomas.js al cortar las tomas, y
   la fila de app/ui/Sound.voz.cuerpo.js cuenta con ella. Ez oyó lo que pasa cuando no casan (16 nov. 2026):
   «Descansa» montado en el número, porque la fila se fiaba de `fin` y el trozo suena hasta `b`. Aquí se
   mira, en cada palabra de cada voz e idioma:

   1. el orden: 0 ≤ a < ini < fin < b;
   2. que el trozo empiece cerca de la palabra y acabe cerca de su cola: `ini - a` hasta 0,05 s (el guion deja
      0,03) y `b - fin` hasta 0,15 s (deja 0,12). Más, y la palabra trae silencio o lo de la vecina;
   3. que la cuenta atrás quepa en su segundo con el hueco de la fila: si no, sonaría siempre a madera;
   4. que cada número quepa, con su hueco, en la repetición más corta del catálogo (2 s): si no, esa serie
      iría entera a madera;
   5. que tras la palabra más larga, con el hueco de después de una serie, lo que espera en la fila no pase
      de lo que se deja esperar: si pasara, «Descansa» o «Último paso» sonarían a tono.

   Los huecos y la espera se leen de Sound.voz.cuerpo.js, para que la regla no se quede atrás. */

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var REP_MAS_CORTA = 2;   // tempo 1 + 0 + 1, la cadencia más rápida de Mueve y Estira

function constante(js, nombre) {
  var m = js.match(new RegExp('var ' + nombre + ' = ([0-9.]+);'));
  return m ? parseFloat(m[1]) : NaN;
}

function tandaVoz(ctx) {
  console.log('\n[voz] Los márgenes de la tabla de la voz de Mueve y Estira, con la fila que los usa');
  var js = fs.readFileSync(path.join(ctx.ROOT, 'app/ui/Sound.voz.cuerpo.js'), 'utf8');
  var HUECO = constante(js, 'PACE_VOZ_CUERPO_HUECO');
  var TRAS = constante(js, 'PACE_VOZ_CUERPO_TRAS_SERIE');
  var ESPERA = constante(js, 'PACE_VOZ_CUERPO_ESPERA');
  if (!(HUECO > 0 && TRAS > 0 && ESPERA > 0)) { ctx.falla('voz: no se leen el hueco, el de tras la serie o la espera de Sound.voz.cuerpo.js'); return; }
  var caja = { window: {} };
  vm.createContext(caja);
  try {
    vm.runInContext(fs.readFileSync(path.join(ctx.ROOT, 'app/ui/Sound.voz.cuerpo.datos.js'), 'utf8') + ';this.D = PACE_VOZ_CUERPO;', caja);
  } catch (e) { ctx.falla('voz: la tabla no se puede leer: ' + e.message); return; }
  var D = caja.D || {};
  var malas = [], palabras = 0, larga = { quien: '', ocupa: 0 };
  Object.keys(D).forEach(function (idioma) {
    Object.keys(D[idioma]).forEach(function (voz) {
      var juego = D[idioma][voz];
      Object.keys(juego).forEach(function (k) {
        var e = juego[k], quien = idioma + '/' + voz + ' «' + k + '»', ocupa = e.b - e.a;
        palabras++;
        if (!(e.a >= 0 && e.a < e.ini && e.ini < e.fin && e.fin < e.b)) malas.push(quien + ': fuera de orden');
        if (e.ini - e.a > 0.05) malas.push(quien + ': empieza ' + (e.ini - e.a).toFixed(3) + ' s antes de la palabra');
        if (e.b - e.fin > 0.15) malas.push(quien + ': sigue ' + (e.b - e.fin).toFixed(3) + ' s tras la palabra');
        if (/^c[123]$/.test(k) && ocupa + HUECO > 1) malas.push(quien + ': con su hueco ocupa ' + (ocupa + HUECO).toFixed(2) + ' s y la cuenta va de segundo en segundo');
        if (/^n\d+$/.test(k) && ocupa + HUECO > REP_MAS_CORTA) malas.push(quien + ': con su hueco ocupa ' + (ocupa + HUECO).toFixed(2) + ' s, más que la repetición más corta');
        if (ocupa > larga.ocupa) larga = { quien: quien, ocupa: ocupa };
      });
    });
  });
  if (larga.ocupa + TRAS > ESPERA) malas.push(larga.quien + ': tras ella, lo que sigue esperaría ' + (larga.ocupa + TRAS).toFixed(2) + ' s y la fila deja ' + ESPERA);
  if (!palabras) { ctx.falla('voz: la tabla no tiene ninguna palabra'); return; }
  if (malas.length) ctx.falla('voz: ' + malas.length + ' palabra(s) que la fila no puede decir bien: ' + malas.slice(0, 6).join('; ') + (malas.length > 6 ? '…' : '') +
    '. Se arreglan con el guion (scripts/voz-cuerpo-tomas.js) o con un «repite», nunca a mano en la tabla');
  else ctx.ok(palabras + ' palabras con su trozo ceñido, la cuenta en 1 s, los números en ' + REP_MAS_CORTA + ' s y la espera más larga en ' + (larga.ocupa + TRAS).toFixed(2) + ' de ' + ESPERA + ' s');
}

var NO_CUBRE = [
  'voz: que las palabras suenen bien, o se entiendan, solo se sabe oyéndolas; y la cadencia más corta (2 s) está escrita aquí, no se lee de las rutinas',
];

module.exports = { tandaVoz: tandaVoz, NO_CUBRE: NO_CUBRE };
