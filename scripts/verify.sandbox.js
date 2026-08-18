/* PACE · scripts/verify.sandbox.js (sesion 168)
   ==============================================
   El `window` de mentira y el cargador por IIFE que usan las tandas del
   verify. Sale de `verify.integridad.js` en s168 por la regla §1 de
   CLAUDE.md: aquel archivo llego a 503 lineas al ganar dos comprobaciones,
   y la regla dice TROCEAR, no recortar comentarios hasta caber.

   Se eligio esta costura y no la de los logros porque aqui no hay ninguna
   comprobacion: es infraestructura pura, no aserta nada y no conoce el
   dominio. Mover una tanda entera habria arrastrado `censo`, `CENSO` y
   `listaCorta` detras. */
'use strict';

var fs   = require('fs');
var path = require('path');
var vm   = require('vm');
/* ==========================================================================
   Sandbox: `window` de mentira + una IIFE por archivo (como el artefacto)
   ========================================================================== */
function nuevoSandbox() {
  /* React de mentira: solo hace falta para que los modulos con JSX evaluen. De
     ellos se quieren los DATOS, no el arbol de componentes. */
  var React = new Proxy({
    createElement: function (t, p) { return { __el: t, props: p }; },
    Fragment: 'Fragment', memo: function (f) { return f; },
    useState: function (v) { return [v, function () {}]; },
    useEffect: function () {}, useRef: function () { return { current: null }; },
    useMemo: function (f) { return f(); }, useCallback: function (f) { return f; },
  }, { get: function (t, k) { return (k in t) ? t[k] : function () {}; } });

  var sb = {
    React: React, console: console, JSON: JSON, Math: Math, Date: Date,
    Object: Object, Array: Array, String: String, Number: Number,
    Boolean: Boolean, RegExp: RegExp, Set: Set, Map: Map, Error: Error,
    parseInt: parseInt, parseFloat: parseFloat, isNaN: isNaN,
    setTimeout: setTimeout, clearTimeout: clearTimeout,
  };
  sb.window = sb;
  sb.globalThis = sb;
  sb.document = {
    createElement: function () { return { style: {}, setAttribute: function () {}, appendChild: function () {} }; },
    head: { appendChild: function () {} },
    getElementById: function () { return null; },
    querySelector: function () { return null; },
  };
  sb.localStorage = { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} };
  sb.navigator = { language: 'es' };
  vm.createContext(sb);
  return sb;
}

/* Carga un archivo en el sandbox dentro de su IIFE. `exporta` saca a proposito
   valores LEXICOS que el archivo no publica (`const EXTRA_ROUTINES`, etc.):
   dentro de la IIFE no cruzarian, exactamente igual que en el artefacto. */
function cargar(ctx, sb, f, exporta) {
  var abs = path.join(ctx.ROOT, f);
  if (!fs.existsSync(abs)) return f + ': no existe';
  var code;
  try {
    code = ctx.babel.transformSync(fs.readFileSync(abs, 'utf8'), {
      presets: [[path.join(ctx.ROOT, 'node_modules', '@babel', 'preset-react'), {}]],
      filename: abs, configFile: false, babelrc: false, sourceType: 'script',
    }).code;
  } catch (e) { return f + ' (compilando): ' + e.message.split('\n')[0]; }

  var extra = '';
  if (exporta) {
    Object.keys(exporta).forEach(function (k) {
      extra += ';try{window[' + JSON.stringify(k) + ']=' + exporta[k] + ';}catch(e){}';
    });
  }
  try {
    vm.runInContext(';(function () {\n' + code + '\n' + extra + '\n})();', sb, { filename: abs });
    return null;
  } catch (e) { return f + ': ' + e.message.split('\n')[0]; }
}

module.exports = { nuevoSandbox: nuevoSandbox, cargar: cargar };
