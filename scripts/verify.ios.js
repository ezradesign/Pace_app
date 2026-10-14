/* PACE · verify · lo que el iPhone pinta fuera de la web, y las reglas de la App Store
 * ===================================================================================
 * Como en Android (verify.android.js), la app de iOS lleva COPIAS de la web: la
 * vaca del arranque, el icono y el papel de las franjas de arriba y de abajo. Si
 * la web cambia y la copia no, el iPhone sigue con lo viejo y nada falla. La
 * vaca de dia se compara byte a byte; el icono y la vaca de noche los genera
 * `npm run ios:recursos`, que apunta en `ios/recursos.json` de que salieron, y
 * aqui se comprueba que ese origen siga siendo el de hoy.
 *
 * Tambien se vigila lo que haria tropezar a la app con la App Store sin que nada
 * falle aqui: un icono con transparencia (Apple lo rechaza), el iPad (Ez eligio
 * solo iPhone el 14 oct., y Apple no deja quitarlo una vez publicado), la
 * declaracion de cifrado, el manifiesto de privacidad, la zona segura, y un
 * complemento con permisos sin su texto para la pregunta del sistema.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var ROOT = path.resolve(__dirname, '..');
var APP = 'ios/App/App/';
var ASSETS = APP + 'Assets.xcassets/';
var ID_APP = 'com.ezradesign.pace';

function leer(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel)); } catch (e) { return null; }
}
function texto(rel) { var b = leer(rel); return b ? b.toString() : ''; }
function huella(buf) { return buf ? crypto.createHash('sha256').update(buf).digest('hex') : null; }

/* La crema es `:root`; la oscura, `[data-palette="oscuro"]`. Lo mismo que lee verify.android.js. */
function tokens(css, paleta) {
  var cabeza = paleta === 'crema' ? ':root {' : '[data-palette="oscuro"] {';
  var i = css.indexOf(cabeza);
  if (i < 0) return {};
  var fuera = {};
  css.slice(i, css.indexOf('}', i)).replace(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g, function (_, nombre, valor) {
    fuera[nombre] = valor.toUpperCase();
  });
  return fuera;
}

/* El color de un colorset de Xcode, para la apariencia clara ('') o la oscura ('dark'). */
function colorXcode(contents, apariencia) {
  try {
    var c = JSON.parse(contents).colors.filter(function (x) {
      var a = (x.appearances || []).map(function (p) { return p.value; })[0] || '';
      return a === apariencia;
    })[0].color.components;
    var h = function (v) { return Number(v).toString(16).toUpperCase().padStart(2, '0'); };
    return '#' + h(c.red) + h(c.green) + h(c.blue);
  } catch (e) { return null; }
}

function chequeaIos(ctx) {
  var css = texto('app/tokens.css');
  var crema = tokens(css, 'crema'), oscura = tokens(css, 'oscuro');
  var malas = [];

  /* Las copias de la web. */
  var vaca = leer('icons/icon-512.png');
  var copia = leer(ASSETS + 'PaceArranque.imageset/pace-logo.png');
  if (!vaca || !copia || !vaca.equals(copia)) malas.push('la vaca del arranque no es una copia exacta de icons/icon-512.png');
  var reg = {};
  try { reg = JSON.parse(texto('ios/recursos.json')); } catch (e) {}
  var origen = reg.origen || {}, colores = reg.colores || {}, icono = reg.icono || {}, noche = reg.arranqueNoche || {};
  if (origen.sha256 !== huella(vaca)) malas.push('icons/icon-512.png ha cambiado desde que se hicieron el icono y el arranque de noche');
  if (colores.papel !== crema.paper || colores.papelNoche !== oscura.paper || colores.tintaNoche !== oscura.ink) {
    malas.push('los colores del icono y del arranque no son los de app/tokens.css de hoy');
  }
  if (!icono.archivo || icono.sha256 !== huella(leer(icono.archivo))) malas.push('el icono no es el que genero npm run ios:recursos');
  if (!noche.archivo || noche.sha256 !== huella(leer(noche.archivo))) malas.push('la vaca de noche no es la que genero npm run ios:recursos');
  var fondo = texto(ASSETS + 'PaceFondo.colorset/Contents.json');
  if (colorXcode(fondo, '') !== crema.paper || colorXcode(fondo, 'dark') !== oscura.paper) {
    malas.push('PaceFondo (el papel del arranque y de las franjas) = ' + colorXcode(fondo, '') + ' / ' + colorXcode(fondo, 'dark') +
               ', y --paper es ' + crema.paper + ' / ' + oscura.paper);
  }
  if (malas.length) {
    malas.forEach(function (m) { ctx.falla('ios: ' + m + ' -- vuelve a correr npm run ios:recursos'); });
  } else {
    ctx.ok('ios: el icono, la vaca del arranque y el papel salen de icons/icon-512.png y de app/tokens.css de hoy');
  }
  chequeaTienda(ctx, icono.archivo);
}

/* Lo que la App Store mira y aqui no fallaria nunca. */
function chequeaTienda(ctx, archivoIcono) {
  var malas = [];
  var png = archivoIcono ? leer(archivoIcono) : null;
  /* Cabecera IHDR del PNG: ancho y alto en 16 y 20, tipo de color en 25 (2 = RGB sin alfa). */
  if (!png || png.readUInt32BE(16) !== 1024 || png.readUInt32BE(20) !== 1024 || png[25] !== 2) {
    malas.push('el icono tiene que ser un PNG de 1024 x 1024 SIN transparencia: la App Store lo rechaza');
  }
  var proyecto = texto('ios/App/App.xcodeproj/project.pbxproj');
  var ids = proyecto.match(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g) || [];
  if (!ids.length || ids.some(function (l) { return l.indexOf(ID_APP + ';') === -1; })) {
    malas.push('el identificador de la app ya no es ' + ID_APP + ', y la App Store no deja cambiarlo');
  }
  var familias = proyecto.match(/TARGETED_DEVICE_FAMILY = ([^;]+);/g) || [];
  if (!familias.length || familias.some(function (l) { return !/= 1;$/.test(l); })) {
    malas.push('la app ya no es solo de iPhone (TARGETED_DEVICE_FAMILY): Ez eligio solo iPhone, y una vez publicada Apple no deja quitar el iPad');
  }
  if (!/PrivacyInfo\.xcprivacy in Resources/.test(proyecto)) malas.push('el manifiesto de privacidad (PrivacyInfo.xcprivacy) no va dentro de la app');
  var plist = texto(APP + 'Info.plist');
  if (!/<key>ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/.test(plist)) {
    malas.push('falta ITSAppUsesNonExemptEncryption = NO: cada subida preguntaria por el cifrado');
  }
  if (!/<key>CFBundleLocalizations<\/key>\s*<array>[\s\S]*?<string>es<\/string>[\s\S]*?<\/array>/.test(plist)) {
    malas.push('sin CFBundleLocalizations el WKWebView dice que el iPhone esta en ingles y PACE arranca en ingles');
  }
  if (!/rootViewController = PaceViewController\(\)/.test(texto(APP + 'SceneDelegate.swift'))) {
    malas.push('la ventana ya no arranca con PaceViewController: la web se meteria bajo la isla y la barra de inicio');
  }
  var cfg = {}, pkg = {};
  try { cfg = JSON.parse(texto('capacitor.config.json')); } catch (e) {}
  try { pkg = JSON.parse(texto('package.json')); } catch (e) {}
  var instalados = Object.assign({}, pkg.dependencies, pkg.devDependencies);
  var plugins = (cfg.ios && cfg.ios.includePlugins) || [];
  if (cfg.appId !== ID_APP) malas.push('capacitor.config.json ya no dice appId = ' + ID_APP);
  plugins.forEach(function (p) { if (!instalados[p]) malas.push('ios.includePlugins pide ' + p + ', que no esta en package.json'); });
  /* El del calendario usa EventKit: sin sus textos para la pregunta del sistema, Apple rechaza la subida. */
  if (plugins.indexOf('@ebarooni/capacitor-calendar') !== -1 && !/NSCalendarsFullAccessUsageDescription/.test(plist)) {
    malas.push('el complemento del calendario va en iOS sin NSCalendarsFullAccessUsageDescription en Info.plist: Apple rechaza la subida');
  }
  var flujo = texto('.github/workflows/ios.yml');
  if (!/CODE_SIGNING_ALLOWED=NO/.test(flujo) || !/branches: \[main/.test(flujo)) {
    malas.push('el workflow iOS ya no compila sin firmar en cada push a main');
  }
  if (malas.length) {
    malas.forEach(function (m) { ctx.falla('ios: ' + m); });
  } else {
    ctx.ok('ios: icono sin transparencia, ' + ID_APP + ' solo para iPhone, cifrado declarado, privacidad dentro, ' +
           'la web en la zona segura y ' + plugins.length + ' complementos instalados');
  }
}

var NO_CUBRE_IOS = [
  'ios: se comparan las copias y la configuracion, no como se VEN el icono, el arranque y las franjas ' +
    '-- eso se mira en un iPhone (TestFlight), y si el proyecto compila lo dice el workflow iOS',
];

module.exports = { chequeaIos: chequeaIos, NO_CUBRE_IOS: NO_CUBRE_IOS };
