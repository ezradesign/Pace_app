/**
 * verify.escrituras.js - PACE · red de seguridad LOCAL · CADA ESCRITURA EN EL ALMACENAMIENTO, CONTADA
 *
 * No es un script suelto: lo invoca `scripts/verify.js` como una tanda más.
 *
 * QUÉ VIGILA (la octava, nº 17, 12 nov. 2026). Dos reglas que vivían solo en el documento de
 * decisiones y en pruebas sueltas:
 *   · Un navegador lleno o bloqueado falla en CADA `setItem`: toda escritura de `app/` en
 *     `localStorage` o `sessionStorage` va dentro de un `try` (la prueba 2, estado-no-guarda «5c»,
 *     lo comprueba con la app abierta). Las que fallan a propósito, para que alguien se entere,
 *     van en SIN_TRY_A_PROPOSITO con su porqué.
 *   · Y si falla, lo dice: el catch de cada una llama a `paceAvisarNoGuarda` (state-core.support.jsx),
 *     que saca la barra de «no deja guardar» con la primera que falle (Ez, 2 B de la octava).
 *   · Con la landing delante no se guarda nada (landing-cara.spec.js), y toda escritura sin gesto
 *     tiene que mirar la cara (`window.PACE_CARA`). Qué escritura es «sin gesto» no lo sabe un
 *     analizador, así que se lleva el CENSO: cuántas hay en cada archivo. Una nueva, o una que se
 *     va, pone esto en rojo hasta que alguien la mira y cambia el número.
 * Se lee el código (con @babel/parser), no el texto: los comentarios no cuentan, y el `try` es
 * el de verdad, el que envuelve la llamada.
 */

'use strict';

var fs = require('fs');
var path = require('path');

/* Cuántas escrituras hay en cada archivo de app/ (12 nov. 2026). */
var CENSO = {
  'app/breathe/BreatheSession.support.jsx': 2,
  'app/focus/FocusTimer.support.jsx': 2,
  'app/main/home-geometry.horario.js': 1,
  'app/move/MoveSessionV1.reanudar.jsx': 1,
  'app/ritmo/ritmo.calendario.destinos.js': 3,
  'app/ritmo/ritmo.calendario.motor.js': 1,
  'app/ritmo/ritmo.calendario.web.js': 1,
  'app/state-core.jsx': 2,
  'app/state-core.sanea.js': 1,
  'app/tweaks/TweakSecretsWatcher.jsx': 1,
  'app/tweaks/TweaksData.importar.jsx': 1,
  'app/ui/SessionClock.jsx': 1,
  'app/ui/android.avisos.js': 1,
  'app/ui/ios.js': 1,
};

/* Las que NO van en un `try`, a propósito: si fallan, tiene que saberse. */
var SIN_TRY_A_PROPOSITO = {
  /* Escribir la copia importada: si el navegador no deja, la barrera de los eventos lo recoge y
     la app dice «no se pudo importar» en vez de anunciar una copia que no entró. */
  'app/tweaks/TweaksData.importar.jsx': 1,
};

function listarApp(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    var p = path.join(dir, d.name);
    if (d.isDirectory()) listarApp(p, out);
    else if (/\.(js|jsx)$/.test(d.name)) out.push(p);
  });
  return out;
}

function esAlmacen(obj) {
  if (!obj) return false;
  if (obj.type === 'Identifier') return obj.name === 'localStorage' || obj.name === 'sessionStorage';
  return obj.type === 'MemberExpression' && !obj.computed && obj.property.type === 'Identifier' &&
    (obj.property.name === 'localStorage' || obj.property.name === 'sessionStorage') &&
    obj.object.type === 'Identifier' && (obj.object.name === 'window' || obj.object.name === 'self');
}

/* ¿Llama este trozo del árbol a `nombre(...)`? */
function llamaA(nodo, nombre) {
  if (!nodo || typeof nodo.type !== 'string') return false;
  if (nodo.type === 'CallExpression' && nodo.callee.type === 'Identifier' && nodo.callee.name === nombre) return true;
  return Object.keys(nodo).some(function (k) {
    if (k === 'loc') return false;
    var h = nodo[k];
    return Array.isArray(h) ? h.some(function (x) { return llamaA(x, nombre); }) : (h && typeof h.type === 'string' && llamaA(h, nombre));
  });
}

/* Las llamadas `<almacén>.setItem(...)` del archivo, cada una con si va dentro del bloque de un `try` y
   si el catch de ese try avisa (`paceAvisarNoGuarda`). */
function escrituras(ast) {
  var halladas = [];
  (function andar(nodo, envuelve) {
    if (!nodo || typeof nodo.type !== 'string') return;
    if (nodo.type === 'CallExpression' && nodo.callee.type === 'MemberExpression' && !nodo.callee.computed &&
        nodo.callee.property.type === 'Identifier' && nodo.callee.property.name === 'setItem' && esAlmacen(nodo.callee.object)) {
      halladas.push({ linea: nodo.loc.start.line, enTry: !!envuelve,
        avisa: !!(envuelve && envuelve.handler && llamaA(envuelve.handler.body, 'paceAvisarNoGuarda')) });
    }
    Object.keys(nodo).forEach(function (k) {
      if (k === 'loc' || k === 'leadingComments' || k === 'trailingComments' || k === 'innerComments') return;
      var hijo = nodo[k];
      /* Solo el bloque del `try` protege; lo que va en el `catch` o el `finally`, no. El más cercano manda. */
      var protege = (nodo.type === 'TryStatement' && k === 'block') ? nodo : envuelve;
      if (Array.isArray(hijo)) hijo.forEach(function (h) { andar(h, protege); });
      else if (hijo && typeof hijo.type === 'string') andar(hijo, protege);
    });
  })(ast.program, null);
  return halladas;
}

function tandaEscrituras(ctx) {
  console.log('\n[escrituras] Cada escritura de app/ en el almacenamiento, dentro de un try y en el censo');
  var parser = require(path.join(ctx.ROOT, 'node_modules', '@babel', 'parser'));
  var hay = {}, sinTry = [], callan = [], ilegibles = [];
  listarApp(path.join(ctx.ROOT, 'app'), []).forEach(function (abs) {
    var rel = path.relative(ctx.ROOT, abs).replace(/\\/g, '/');
    var src = fs.readFileSync(abs, 'utf8');
    if (src.indexOf('setItem') < 0) return;
    var ast;
    try { ast = parser.parse(src, { sourceType: 'script', plugins: ['jsx'], errorRecovery: true }); }
    catch (e) { ilegibles.push(rel + ' (' + e.message + ')'); return; }
    var lista = escrituras(ast);
    if (!lista.length) return;
    hay[rel] = lista.length;
    var fuera = lista.filter(function (w) { return !w.enTry; });
    if (fuera.length !== (SIN_TRY_A_PROPOSITO[rel] || 0)) {
      fuera.forEach(function (w) { sinTry.push(rel + ':' + w.linea); });
    }
    lista.filter(function (w) { return w.enTry && !w.avisa; }).forEach(function (w) { callan.push(rel + ':' + w.linea); });
  });
  if (ilegibles.length) ctx.falla('escrituras: no se pudo leer ' + ilegibles.join(', '));
  if (sinTry.length) {
    ctx.falla('escrituras: ' + sinTry.length + ' escritura(s) en el almacenamiento fuera de un try: ' + sinTry.join(', ') +
      ' -- con el navegador lleno, cada setItem lanza y rompe lo que venga detrás (la octava, prueba 2)');
  } else ctx.ok('cada escritura de app/ en el almacenamiento va dentro de un try (salvo la de importar, a propósito)');
  if (callan.length) {
    ctx.falla('escrituras: ' + callan.length + ' escritura(s) cuyo catch no llama a paceAvisarNoGuarda(e): ' + callan.join(', ') +
      ' -- si falla, la barra de «no deja guardar» tiene que salir con la primera (Ez, 2 B de la octava)');
  } else ctx.ok('el catch de cada una avisa: la barra sale con la primera que falle');

  var cambios = [];
  Object.keys(hay).concat(Object.keys(CENSO)).forEach(function (rel, i, todos) {
    if (todos.indexOf(rel) !== i) return;
    if ((hay[rel] || 0) !== (CENSO[rel] || 0)) cambios.push(rel + ': ' + (CENSO[rel] || 0) + ' → ' + (hay[rel] || 0));
  });
  if (cambios.length) {
    ctx.falla('escrituras: el censo cambió (' + cambios.join(', ') + '). Si una es nueva y se escribe sin un gesto, ' +
      'tiene que mirar window.PACE_CARA (con la landing delante no se guarda nada); después, el número en CENSO de scripts/verify.escrituras.js');
  } else {
    var total = Object.keys(hay).reduce(function (s, k) { return s + hay[k]; }, 0);
    ctx.ok(total + ' escrituras en ' + Object.keys(hay).length + ' archivos, las del censo');
  }
}

var NO_CUBRE = [
  'escrituras: se cuentan las llamadas a localStorage/sessionStorage.setItem de app/ y se mira su try; ' +
    'una escritura por otro nombre (un alias del almacén, IndexedDB) no se ve, y si la nueva mira la cara lo decide quien cambia el censo',
];

module.exports = { tandaEscrituras: tandaEscrituras, NO_CUBRE: NO_CUBRE };
