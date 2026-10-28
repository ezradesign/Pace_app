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
  chequeaFranjas(ctx, crema, oscura);
  chequeaTienda(ctx, icono.archivo);
  chequeaComplementos(ctx);
}

/* La ventana de Apple para valorar PACE (Ez, 4A del 28 oct.), con las reglas de la de Android
   (verify.android.js). Lo que falla sin que nada falle: un .swift que no esta en el proyecto no
   se compila, y un complemento propio sin registrar es null para la web, que nunca lo pide. */
function chequeaComplementos(ctx) {
  var malas = [];
  var proyecto = texto('ios/App/App.xcodeproj/project.pbxproj');
  var vista = texto(APP + 'PaceViewController.swift');
  var pieza = texto(APP + 'PaceValoracion.swift');
  var web = texto('app/ui/valoracion.js');
  if (!/public let jsName = "PaceValoracion"/.test(pieza) || !/CAPBridgedPlugin/.test(pieza)) malas.push('PaceValoracion.swift ya no es el complemento «PaceValoracion»');
  if (!/requestReview\(in: /.test(pieza)) malas.push('PaceValoracion.swift ya no abre la ventana de Apple (requestReview)');
  if (!/var PACE_VALORACION_PLATAFORMAS = \[[^\]]*'ios'/.test(web)) malas.push('app/ui/valoracion.js ya no pide la ventana en el iPhone (PACE_VALORACION_PLATAFORMAS)');
  if (!/private let puente = PacePuente\(\)/.test(vista) || !/override open func capacitorDidLoad\(\)/.test(vista)) {
    malas.push('PaceViewController ya no lleva el puente que registra los complementos propios (PacePuente)');
  }
  fs.readdirSync(path.join(ROOT, APP)).filter(function (f) { return /\.swift$/.test(f); }).forEach(function (f) {
    var clase = f.replace(/\.swift$/, '');
    if (proyecto.indexOf(f + ' in Sources') === -1) malas.push(f + ' no esta en el proyecto de Xcode: no se compila');
    if (/CAPBridgedPlugin/.test(texto(APP + f)) && vista.indexOf('registerPluginInstance(' + clase + '())') === -1) {
      malas.push('PacePuente no registra ' + clase + ': para la web seria null');
    }
  });
  if (malas.length) malas.forEach(function (m) { ctx.falla('ios: ' + m); });
  else ctx.ok('ios: la valoracion de la App Store se pide una vez, tras la quinta pausa entera, y cada complemento propio esta en el proyecto y registrado');
}

/* Las franjas de arriba y de abajo siguen la paleta que se ve, no el modo del
   iPhone: PaceViewController lee el `theme-color` de la web, que pone
   `applyTheme`. Si se suelta un eslabon vuelven a salir de PaceFondo y nada
   falla. En Android pasa lo mismo por otro camino (verify.android.js). */
function chequeaFranjas(ctx, crema, oscura) {
  var malas = [];
  var html = texto('PACE.html');
  var metaOscura = /<meta name="theme-color" content="(#[0-9a-fA-F]{6})" media="\(prefers-color-scheme: dark\)">/.exec(html);
  var metaCrema = /<meta name="theme-color" content="(#[0-9a-fA-F]{6})">/.exec(html);
  if (!metaOscura || !metaCrema || metaOscura.index > metaCrema.index ||
      metaOscura[1].toUpperCase() !== oscura.paper || metaCrema[1].toUpperCase() !== crema.paper) {
    malas.push('PACE.html ya no lleva el theme-color oscuro (con su media, delante) y el crema con el --paper de cada paleta: ' +
               'el arranque destellaria en claro con el iPhone en oscuro');
  }
  var paleta = texto('app/state-core.palette.jsx');
  var papel = /const PACE_PAPEL = \{ crema: '(#[0-9a-fA-F]{6})', oscuro: '(#[0-9a-fA-F]{6})' \};/.exec(paleta);
  if (!papel || papel[1].toUpperCase() !== crema.paper || papel[2].toUpperCase() !== oscura.paper) {
    malas.push('PACE_PAPEL (app/state-core.palette.jsx) ya no es el --paper de app/tokens.css');
  }
  if (!/querySelectorAll\('meta\[name="theme-color"\]'\)/.test(paleta)) {
    malas.push('applyTheme ya no pone la paleta en TODAS las metas theme-color');
  }
  var vista = texto(APP + 'PaceViewController.swift');
  if (!/observe\(\\\.themeColor/.test(vista) || !/return estiloBarra/.test(vista)) {
    malas.push('PaceViewController ya no pinta las franjas y la hora con el theme-color de la web');
  }
  if (malas.length) {
    malas.forEach(function (m) { ctx.falla('ios: ' + m); });
  } else {
    ctx.ok('ios: las franjas y la hora siguen el theme-color de la web, que es el --paper de la paleta que se ve');
  }
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
  'ios: de la valoracion se mira que la pieza este en el proyecto y registrada, no que Apple ensene la ventana ' +
    '(tiene su tope y no lo dice) -- eso, en un iPhone con TestFlight',
];

module.exports = { chequeaIos: chequeaIos, NO_CUBRE_IOS: NO_CUBRE_IOS };
