/* PACE · monta la landing en index.html (lo llama build-standalone.js, paso 9) */
'use strict';
var fs = require('fs');
var path = require('path');

/* LA RAÍZ CON DOS CARAS (opción C, Ez, 9 nov. 2026). Solo en index.html, la web: ni el
   standalone ni PACE.html la llevan. La decisión y el CSS van en el <head>, tras el viewport,
   para decidir antes de pintar; el marcado, lo primero del <body>, para que se pinte antes de
   que el navegador evalúe la app (medido: 72 ms frente a 232). Todo entre las marcas
   `pace-landing`, que scripts/android-www.js quita al copiar a www/ (Android e iPhone). */
var LANDING_INICIO = '<!--pace-landing-->';
var LANDING_FIN = '<!--/pace-landing-->';
function montarLanding(html, h) {
  var dir = path.join(h.ROOT, 'landing');
  var readFileClean = h.readFileClean, validateSyntax = h.validateSyntax;
  var leer = function (n) { var f = path.join(dir, n); return fs.existsSync(f) ? readFileClean(f) : ''; };
  var cara = leer('cara.js');
  if (!cara || !validateSyntax(cara, 'landing/cara.js', false).ok) {
    console.error('  [ERROR] landing/cara.js falta o no compila. Abortando.');
    process.exit(1);
  }
  var css = leer('landing.css');
  var marcado = leer('landing.html');
  var cabeza = LANDING_INICIO + '\n  <script>\n' + cara + '\n  </script>\n' +
    (css ? '  <style>\n' + css + '\n  </style>\n' : '') + '  ' + LANDING_FIN;
  var ancla = /<meta name="viewport"[^>]*>/;
  if (!ancla.test(html) || !/<body>\n/.test(html)) {
    console.error('  [ERROR] index.html sin <meta name="viewport"> o sin <body>: no hay dónde poner la landing. Abortando.');
    process.exit(1);
  }
  /* Funciones y no cadenas: el CSS y el JS pueden llevar '$' (misma regla que 5c). */
  html = html.replace(ancla, function (m) { return m + '\n  ' + cabeza; });
  html = html.replace(/<body>\n/, function (m) {
    return m + '  ' + LANDING_INICIO + '\n' + marcado + '\n  ' + LANDING_FIN + '\n';
  });
  console.log('  [OK] landing montada en index.html (' + (marcado ? 'con' : 'sin') + ' marcado).');
  return html;
}

module.exports = { montarLanding: montarLanding, LANDING_INICIO: LANDING_INICIO, LANDING_FIN: LANDING_FIN };
