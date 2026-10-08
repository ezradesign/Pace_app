/**
 * verify.lienzo.js - PACE · red de seguridad LOCAL · EL LIENZO QUE CRECE
 *
 * No es un script suelto: lo invoca `scripts/verify.js` como una tanda más.
 *
 * QUÉ VIGILA. Con el lienzo puesto (app/main/_lienzo.js) la raíz lleva `zoom`, y bajo
 * `zoom` tres cosas siguen midiendo la ventana REAL: `getBoundingClientRect` (px de
 * pantalla, mientras `offsetHeight` y los estilos van en px CSS), `innerHeight` /
 * `innerWidth` y las unidades `vh` / `dvh`. Una sola medida nueva escrita a la manera de
 * siempre descuadra la app con el zoom alejado o en un monitor grande, y en las pruebas
 * normales (a 1280x720, sin lienzo) no se ve: por eso va aquí y no solo en la suite.
 *   · `getBoundingClientRect()` e `innerHeight` / `innerWidth` en código de app/ fuera
 *     del propio lienzo → falla. Se usa `paceCaja(el)` y `paceLienzoAlto()` /
 *     `paceLienzoAncho()`.
 *   · `vh` / `dvh` en código de app/ → solo los registrados abajo, que son de móvil (donde
 *     el lienzo no se pone nunca) o están pisados por la hoja del lienzo. Lo nuevo va como
 *     `calc(N * var(--pace-vh, 1vh))`. La lista es un TRINQUETE: solo puede bajar.
 *
 * NO CUBRE: los `vw` (con el lienzo puesto el ancho efectivo nunca baja de 1536 y todos
 * los `vw` de hoy topan con su máximo en px; uno sin tope sí se descuadraría), y si una
 * media query nueva corta por encima de 704 de alto o de 1536 de ancho (miraría la
 * ventana real). Las dos cosas las mide `tests/lienzo.spec.js` en la home y el runner.
 */

'use strict';

var fs = require('fs');
var path = require('path');

/* Los `vh` / `dvh` que pueden quedarse, por archivo. */
var VH_REGISTRADOS = {
  'app/main/_responsive.js': 7,          // la raíz y el aro de la home (los pisa la hoja del lienzo) y su @supports (height: 1dvh)
  'app/ui/Primitives.jsx': 2,            // el modal como hoja de móvil (max-width: 640px)
  'app/tweaks/TweaksPanel.support.jsx': 2, // Ajustes como hoja de móvil (max-width: 640px)
  'app/shell/Sidebar.hoja.jsx': 2,       // el cajón de la barra lateral en el móvil
  'app/move/MoveSessionV1.css.jsx': 2,   // las medidas del runner en el móvil (max-width: 640px)
};
var SIN_LIENZO = ['app/main/_lienzo.js'];

/* Quita los comentarios conservando los saltos de línea, para que los números de línea
   sigan valiendo. Los `//` de una URL (`https://`) no son comentario. */
function sinComentarios(src) {
  var bloques = src.replace(/\/\*[\s\S]*?\*\//g, function (m) { return m.replace(/[^\n]/g, ' '); });
  return bloques.split('\n').map(function (l) {
    var i = l.search(/(^|[^:\\'"])\/\//);
    return i >= 0 ? l.slice(0, i + (l[i] === '/' ? 0 : 1)) : l;
  }).join('\n');
}

function tandaLienzo(ctx) {
  console.log('\n[+] El lienzo que crece (medidas de la ventana) ...');
  var archivos = [];
  ctx.listar(path.join(ctx.ROOT, 'app'), /\.(jsx?|css)$/, archivos);
  var malas = [];
  var vh = {};
  archivos.forEach(function (f) {
    var r = ctx.rel(f);
    if (SIN_LIENZO.indexOf(r) >= 0) return;
    var lineas = sinComentarios(fs.readFileSync(f, 'utf8')).split('\n');
    lineas.forEach(function (l, i) {
      if (/\.getBoundingClientRect\s*\(/.test(l)) malas.push(r + ':' + (i + 1) + ' getBoundingClientRect → paceCaja(el)');
      if (/\binner(Height|Width)\b/.test(l)) malas.push(r + ':' + (i + 1) + ' innerHeight/innerWidth → paceLienzoAlto()/paceLienzoAncho()');
      var limpia = l.replace(/var\(--pace-d?vh,\s*1d?vh\)/g, '');
      var n = (limpia.match(/\b\d+(\.\d+)?d?vh\b/g) || []).length;
      if (n) vh[r] = (vh[r] || 0) + n;
    });
  });
  if (malas.length) {
    ctx.falla(malas.length + ' medida(s) de la ventana sin pasar por el lienzo (app/main/_lienzo.js):\n' +
      malas.map(function (m) { return '          ' + m; }).join('\n'));
  } else {
    ctx.ok('ninguna caja ni alto de ventana se lee fuera del lienzo (paceCaja, paceLienzoAlto)');
  }
  var nuevos = [];
  Object.keys(vh).forEach(function (r) {
    var max = VH_REGISTRADOS[r] || 0;
    if (vh[r] > max) nuevos.push(r + ': ' + vh[r] + ' vh/dvh (registrados ' + max + ')');
  });
  var sobran = Object.keys(VH_REGISTRADOS).filter(function (r) { return (vh[r] || 0) < VH_REGISTRADOS[r]; });
  if (nuevos.length) {
    ctx.falla('vh/dvh nuevos que el lienzo no corrige -- usa calc(N * var(--pace-vh, 1vh)), o regístralo en VH_REGISTRADOS si es solo de móvil:\n' +
      nuevos.map(function (m) { return '          ' + m; }).join('\n'));
  } else {
    ctx.ok('los vh/dvh que quedan son los registrados (móvil o pisados por la hoja del lienzo)');
  }
  if (sobran.length) {
    ctx.falla('VH_REGISTRADOS (scripts/verify.lienzo.js) es un trinquete: baja el número de ' + sobran.join(', '));
  }
}

var NO_CUBRE = [
  'lienzo: se vigila que las medidas de la ventana pasen por el lienzo, NO los vw sin tope ni las media queries nuevas que corten por encima de 1536 x 704 -- eso lo mide tests/lienzo.spec.js',
];

module.exports = { tandaLienzo: tandaLienzo, NO_CUBRE: NO_CUBRE };
