'use strict';
/* PACE · verify.pseudo.js — LOS TEXTOS LARGOS NO LLEGAN NUNCA A QUIEN USA PACE
   ============================================================
   La prueba de los textos largos (tests/textos-largos.spec.js, 17 nov. 2026) pinta cada texto
   de i18n un 30 % más largo y entre «⟦ ⟧» para ver qué se rompe antes de que lo vea un tester.
   Es un idioma de mentira y solo puede existir en las pruebas: vive en
   tests/textos-largos.pseudo.js y entra en la página como init script de Playwright.
   Esto falla si algo de lo que se publica, o el código de la app, lo nombra o lleva sus marcas:
   app/ entero, index.html, sw.js y lo que copian la web (`listaWeb`, scripts/web-dist.js) y las
   apps (`listaWww`, scripts/android-www.js). Y si la prueba deja de cargarlo, porque entonces
   mediría la app en castellano creyendo que mide los textos largos. */

var fs = require('fs');
var path = require('path');

/* Lo que delata el modo: su archivo, sus funciones y sus marcas. */
var SENAS = [/textos-largos\.pseudo/, /__paceTextosLargos/, /textosLargosEnLaPagina/, /instalarTextosLargos/, /[⟦⟧]/];
var TEXTO = /\.(js|jsx|html|css|json|webmanifest|txt|xml|md)$/i;

function recorrer(dir, out) {
  if (!fs.existsSync(dir)) return out;
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    var p = path.join(dir, d.name);
    if (d.isDirectory()) recorrer(p, out); else out.push(p);
  });
  return out;
}

function tandaPseudo(ctx) {
  console.log('\n[pseudo] Los textos largos de las pruebas no llegan a la app ni a lo que se publica');
  var rel = function (f) { return path.relative(ctx.ROOT, f).split(path.sep).join('/'); };
  var lista = recorrer(path.join(ctx.ROOT, 'app'), []).map(rel).concat(['index.html', 'sw.js']);
  try { lista = lista.concat(require('./web-dist.js').listaWeb()); } catch (e) { ctx.falla('pseudo: no se pudo leer lo que publica la web: ' + e.message); }
  try { lista = lista.concat(require('./android-www.js').listaWww()); } catch (e) { ctx.falla('pseudo: no se pudo leer lo que copian las apps: ' + e.message); }
  var vistos = {}, malos = [];
  lista.forEach(function (f) {
    f = String(f).split(path.sep).join('/');
    if (vistos[f] || !TEXTO.test(f)) return;
    vistos[f] = true;
    var abs = path.join(ctx.ROOT, f);
    if (!fs.existsSync(abs)) return;
    var src = fs.readFileSync(abs, 'utf8');
    SENAS.forEach(function (re) { if (re.test(src)) malos.push(f + ' (' + re.source + ')'); });
  });
  if (malos.length) ctx.falla('pseudo: el modo de los textos largos asoma en lo que llega a la gente: ' + malos.join(', ') +
    '. Es solo de las pruebas (tests/textos-largos.pseudo.js).');
  else ctx.ok('ni app/ ni lo que publican la web y las apps nombran los textos largos ni llevan sus marcas (' + Object.keys(vistos).length + ' archivos)');

  var spec = path.join(ctx.ROOT, 'tests', 'textos-largos.spec.js');
  var src = fs.existsSync(spec) ? fs.readFileSync(spec, 'utf8') : '';
  if (!/instalarTextosLargos\(/.test(src)) ctx.falla('pseudo: tests/textos-largos.spec.js ya no instala los textos largos: mediría la app en su idioma creyendo que mide los textos largos');
  else ctx.ok('tests/textos-largos.spec.js instala los textos largos');
}

module.exports = { tandaPseudo: tandaPseudo };
