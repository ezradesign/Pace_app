'use strict';
/* PACE · verify.versiones.js — LO QUE PACE USA CABE EN LO QUE DICE SOPORTAR
   ============================================================
   Ez, O3 A de la octava (11 nov. 2026): la versión mínima de WebView (Android) y de Safari
   (iPhone y Mac) se escribe y verify la hace cumplir. Hasta hoy no estaba escrita: el build rebaja
   la SINTAXIS a Chrome 90 y Safari 14.1, pero el CSS de la app usa cosas más nuevas que eso, y el
   número de verdad lo ponía, sin decirlo, la función más moderna que alguien añadiera.

   EL MÍNIMO SALE DE LO QUE EL CÓDIGO USA (censo de `index.html`, 11 nov. 2026):
     · `color-mix()` en 15 archivos de app/ (los colores de cada módulo): Chrome 111, Safari 16.2;
     · `oklch()`: Chrome 111, Safari 15.4;
     · `dvh`/`svh`: Chrome 108, Safari 15.4; `:has()` y `@container`: Chrome 105, Safari 15.4/16;
     · `inert`: Chrome 102, Safari 15.5.
   Así que WebView/Chrome 111 (marzo de 2023) y Safari 16.4, que es además el `IPHONEOS_DEPLOYMENT_TARGET`
   del proyecto de iOS. En Android el WebView se actualiza por Play: con el mínimo en
   `capacitor.config.json` (`android.minWebViewVersion`), Capacitor enseña su aviso de «actualiza
   el WebView» en vez de una app rota.

   LO QUE FALLA: una función de la lista que pida más que el mínimo; el mínimo de Capacitor o el de
   iOS distinto del de aquí; el build rebajando a algo MÁS nuevo que el mínimo. `text-wrap` no
   cuenta: donde no existe se ignora y el texto sale igual, solo menos repartido. Una función nueva
   que no esté en la lista no la ve nadie: se añade aquí con sus versiones al usarla. */

var fs = require('fs');
var path = require('path');

var MINIMO = { chrome: 111, safari: 16.4 };

var FUNCIONES = [
  { nombre: 'color-mix()', re: /color-mix\(/, chrome: 111, safari: 16.2 },
  { nombre: 'oklch()', re: /oklch\(/, chrome: 111, safari: 15.4 },
  { nombre: 'dvh/svh', re: /\d(?:dvh|svh|lvh)\b/, chrome: 108, safari: 15.4 },
  { nombre: ':has()', re: /:has\(/, chrome: 105, safari: 15.4 },
  { nombre: '@container', re: /@container\b|container-type\s*:/, chrome: 105, safari: 16 },
  { nombre: 'inert', re: /\binert\b/, chrome: 102, safari: 15.5 },
  { nombre: 'Array.prototype.findLast', re: /\.findLast(?:Index)?\(/, chrome: 97, safari: 15.4 },
  { nombre: 'structuredClone', re: /\bstructuredClone\(/, chrome: 98, safari: 15.4 },
  { nombre: 'Array.prototype.toSorted', re: /\.to(?:Sorted|Reversed|Spliced)\(/, chrome: 110, safari: 16 },
  { nombre: '@scope', re: /@scope\b/, chrome: 118, safari: 17.4 },
  { nombre: 'Popover API', re: /\bpopover=|showPopover\(/, chrome: 114, safari: 17 },
  { nombre: 'Promise.withResolvers', re: /Promise\.withResolvers\(/, chrome: 119, safari: 17.4 },
];

function leer(ROOT, rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (e) { return ''; }
}

function tandaVersiones(ctx) {
  console.log('\n[versiones] Lo que PACE usa cabe en WebView ' + MINIMO.chrome + ' y Safari ' + MINIMO.safari);
  var html = leer(ctx.ROOT, 'index.html');
  var malas = [];
  FUNCIONES.forEach(function (f) {
    if (!f.re.test(html)) return;
    if (f.chrome > MINIMO.chrome || f.safari > MINIMO.safari) {
      malas.push(f.nombre + ' pide Chrome ' + f.chrome + ' y Safari ' + f.safari);
    }
  });
  if (malas.length) ctx.falla('index.html usa lo que el mínimo no tiene (' + malas.join('; ') + '): pon una alternativa o sube MINIMO aquí, en capacitor.config.json y en iOS');
  else ctx.ok('Ninguna función de la lista pide más que WebView ' + MINIMO.chrome + ' y Safari ' + MINIMO.safari);

  var cap = {};
  try { cap = JSON.parse(leer(ctx.ROOT, 'capacitor.config.json')); } catch (e) { /* abajo */ }
  var wv = cap.android && cap.android.minWebViewVersion;
  if (wv !== MINIMO.chrome) ctx.falla('capacitor.config.json: android.minWebViewVersion es ' + wv + ' y el mínimo es ' + MINIMO.chrome + ': con uno más viejo, la app se abriría rota en vez de pedir que se actualice el WebView');
  else ctx.ok('Android pide WebView ' + wv + ' o más (capacitor.config.json)');

  var ios = /IPHONEOS_DEPLOYMENT_TARGET = ([\d.]+);/.exec(leer(ctx.ROOT, 'ios/App/App.xcodeproj/project.pbxproj'));
  if (!ios) ctx.info('sin proyecto de iOS no se mira su versión mínima');
  else if (Number(ios[1]) < MINIMO.safari) ctx.falla('iOS se instala desde ' + ios[1] + ' y el mínimo de Safari es ' + MINIMO.safari + ': sube IPHONEOS_DEPLOYMENT_TARGET');
  else ctx.ok('iOS se instala desde ' + ios[1] + ' (Safari ' + MINIMO.safari + ' o más)');

  var build = leer(ctx.ROOT, 'build-standalone.js');
  var t = /targets:\s*\{[^}]*chrome:\s*'(\d+)'[^}]*safari:\s*'([\d.]+)'/.exec(build);
  if (!t) ctx.falla('build-standalone.js: no se encuentran los targets de preset-env');
  else if (Number(t[1]) > MINIMO.chrome || Number(t[2]) > MINIMO.safari) ctx.falla('build-standalone.js rebaja la sintaxis a Chrome ' + t[1] + ' y Safari ' + t[2] + ', más nuevos que el mínimo');
  else ctx.ok('El build rebaja la sintaxis a Chrome ' + t[1] + ' y Safari ' + t[2] + ' (por debajo del mínimo)');
}

module.exports = { tandaVersiones: tandaVersiones, MINIMO: MINIMO };
