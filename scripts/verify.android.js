/* PACE · verify · lo que Android pinta fuera de la web
 * =====================================================
 * Los recursos de Android llevan COPIAS de cosas de la web: el logo (la vaca
 * del icono y del arranque), el icono de iPhone (que es el de Android 7) y los
 * colores de la paleta (el fondo del icono, del arranque y de las barras). Si
 * la web cambia y la copia no, la app sigue con lo viejo y nada falla. Aqui se
 * comparan: los PNG byte a byte y los colores contra `app/tokens.css`.
 */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var RES = 'android/app/src/main/res/';

var COPIAS = [
  ['icons/icon-512.png', RES + 'drawable-nodpi/pace_logo.png'],
  ['icons/apple-touch-icon.png', RES + 'drawable-nodpi/pace_icono_android7.png'],
];

/* [archivo de valores, color de Android, paleta de tokens.css, token] */
var COLORES = [
  ['values/pace_colores.xml', 'pace_fondo', 'crema', 'paper'],
  ['values/pace_colores.xml', 'pace_icono_fondo', 'crema', 'paper'],
  ['values-night/pace_colores.xml', 'pace_fondo', 'oscuro', 'paper'],
  ['values/pace_colores.xml', 'pace_trazo_noche', 'oscuro', 'ink'],
];

function leer(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel)); } catch (e) { return null; }
}

/* La crema es `:root`; la oscura, `[data-palette="oscuro"]`. Solo el primer
   bloque de cada una, que es donde se definen. */
function tokens(css, paleta) {
  var cabeza = paleta === 'crema' ? ':root {' : '[data-palette="oscuro"] {';
  var i = css.indexOf(cabeza);
  if (i < 0) return {};
  var bloque = css.slice(i, css.indexOf('}', i));
  var fuera = {};
  bloque.replace(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g, function (_, nombre, valor) {
    fuera[nombre] = valor.toUpperCase();
  });
  return fuera;
}

function colorAndroid(xml, nombre) {
  var m = new RegExp('<color name="' + nombre + '">\\s*(#[0-9a-fA-F]{6})\\s*</color>').exec(xml);
  return m ? m[1].toUpperCase() : null;
}

function chequeaAndroid(ctx) {
  var malas = COPIAS.filter(function (par) {
    var web = leer(par[0]), android = leer(par[1]);
    return !web || !android || !web.equals(android);
  });
  if (malas.length) {
    malas.forEach(function (par) {
      ctx.falla('android: ' + par[1] + ' no es una copia exacta de ' + par[0] +
                ' -- si cambio el de la web, copialo otra vez');
    });
  } else {
    ctx.ok('android: el logo y el icono de Android 7 son copias exactas de los de icons/');
  }

  var css = (leer('app/tokens.css') || '').toString();
  var distintos = [];
  COLORES.forEach(function (c) {
    var xml = (leer(RES + c[0]) || '').toString();
    var esperado = tokens(css, c[2])[c[3]];
    var real = colorAndroid(xml, c[1]);
    if (!esperado || real !== esperado) {
      distintos.push(c[0] + ' ' + c[1] + ' = ' + real + ', y --' + c[3] + ' de la paleta ' + c[2] + ' es ' + esperado);
    }
  });
  if (distintos.length) {
    distintos.forEach(function (d) { ctx.falla('android: ' + d); });
  } else {
    ctx.ok('android: los ' + COLORES.length + ' colores del icono, el arranque y las barras son los de app/tokens.css');
  }
}

var NO_CUBRE_ANDROID = [
  'android: se comparan las copias del logo y los colores, no como se VEN el icono, el arranque y ' +
    'las barras -- eso se mira en un movil, y si el XML compila lo dice el workflow Android',
];

module.exports = { chequeaAndroid: chequeaAndroid, NO_CUBRE_ANDROID: NO_CUBRE_ANDROID };
