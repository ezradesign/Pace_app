/* PACE · verify · lo que Android pinta fuera de la web
 * =====================================================
 * Los recursos de Android llevan COPIAS de cosas de la web: el logo (la vaca
 * del icono y del arranque), el icono de iPhone (que es el de Android 7) y los
 * colores de la paleta (el fondo del icono, del arranque y de las barras). Si
 * la web cambia y la copia no, la app sigue con lo viejo y nada falla. Aqui se
 * comparan: los PNG byte a byte y los colores contra `app/tokens.css`.
 *
 * El icono de los avisos (`smallIcon` de `capacitor.config.json`) no es copia:
 * es la silueta de la vaca. Si falta en una densidad, Android pone una «i»
 * generica y nada falla; aqui se mira que este en las cinco y que su color sea
 * el oliva de Foco.
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
  chequeaIconoAviso(ctx, css);
  chequeaPlay(ctx);
}

/* Lo que separa la app de Google Play de la de prueba y guarda cada AAB. Si se
   pierde, el APK de prueba vuelve a chocar con la app de Play (instalar una
   obliga a desinstalar la otra, y eso borra los datos) o el archivo que se subio
   a Play deja de encontrarse, o queda a la vista en un repo publico. */
function chequeaPlay(ctx) {
  var gradle = (leer('android/app/build.gradle') || '').toString();
  var nombres = (leer('android/app/src/debug/res/values/strings.xml') || '').toString();
  var flujo = (leer('.github/workflows/android.yml') || '').toString();
  var malas = [];
  if (!/applicationId "com\.ezradesign\.pace"/.test(gradle)) malas.push('el applicationId de Play ya no es com.ezradesign.pace, y Play no deja cambiarlo');
  if (!/debug\s*\{[^}]*applicationIdSuffix "\.prueba"/.test(gradle)) malas.push('el APK de prueba ha perdido su applicationIdSuffix ".prueba" y choca con la app de Play');
  if (!/name="app_name">PACE prueba</.test(nombres)) malas.push('el APK de prueba ya no se llama «PACE prueba» (android/app/src/debug/res/values/strings.xml)');
  if (!/gh release create[^\n]*--draft/.test(flujo)) malas.push('el workflow Android ya no deja el AAB en un BORRADOR de release: en un repo publico quedaria a la vista');
  if (!/github\.ref == 'refs\/heads\/main'/.test(flujo)) malas.push('el borrador de release ya no se limita a main: una rama podria pisar el AAB de una version');
  if (malas.length) {
    malas.forEach(function (m) { ctx.falla('android: ' + m); });
  } else {
    ctx.ok('android: el APK de prueba es «PACE prueba» (com.ezradesign.pace.prueba) y cada AAB de Play queda en un borrador de release desde main');
  }
}

var DENSIDADES = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];

function chequeaIconoAviso(ctx, css) {
  var cfg = {};
  try { cfg = JSON.parse((leer('capacitor.config.json') || '{}').toString()); } catch (e) {}
  var ln = (cfg.plugins && cfg.plugins.LocalNotifications) || {};
  var faltan = DENSIDADES.filter(function (d) {
    return !ln.smallIcon || !leer(RES + 'drawable-' + d + '/' + ln.smallIcon + '.png');
  });
  var oliva = tokens(css, 'crema').focus;
  if (faltan.length) {
    ctx.falla('android: el icono de los avisos (smallIcon = ' + ln.smallIcon + ') falta en drawable-' + faltan.join(', drawable-') +
              ' -- sin el, Android pinta una «i» generica');
  } else if (!ln.iconColor || ln.iconColor.toUpperCase() !== oliva) {
    ctx.falla('android: iconColor de los avisos = ' + ln.iconColor + ', y --focus de la paleta crema es ' + oliva);
  } else {
    ctx.ok('android: el icono de los avisos esta en las ' + DENSIDADES.length + ' densidades y va en el oliva de Foco');
  }
}

var NO_CUBRE_ANDROID = [
  'android: se comparan las copias del logo y los colores, no como se VEN el icono, el arranque y ' +
    'las barras -- eso se mira en un movil, y si el XML compila lo dice el workflow Android',
];

module.exports = { chequeaAndroid: chequeaAndroid, NO_CUBRE_ANDROID: NO_CUBRE_ANDROID };
