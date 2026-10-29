/**
 * verify.rutinas.js - PACE · lo que dice el registro de «Tus rutinas» es verdad
 *
 * No es un script suelto: lo invoca `verify.integridad.js` dentro de la tanda
 * [4/4] de `npm run verify`. Vive aparte por la regla de las 500 lineas.
 *
 * POR QUE EXISTE. La revision de ChatGPT del 28 oct. 2026 (C3) encontro cuatro
 * ejercicios del registro que callaban material: la banda de «Apertura con
 * banda», la silla de «Piernas elevadas sentado» (sin ruedas) y de «Extension
 * toracica», y la pared de «Elevacion de puntas», que declaraba mesa. Todos
 * tenian su fila en `EXERCISE_PIDE`, asi que «Antes de empezar» los daba por
 * buenos: la comprobacion de «toda fila existe» no podia verlo.
 *
 * QUE MIRA. Para cada ejercicio, su texto: el cue del registro y la colocacion,
 * la accion, el cuidado y el cue de cada paso del catalogo con ese nombre (o con
 * el de antes, `EJERCICIO_RENOMBRADO`). Una palabra de material en el texto pide
 * su clave en la fila, y una clave en la fila pide su palabra en el texto: una
 * comprobacion por SENTIDO, porque la omision no se ve leyendo.
 *
 * LO QUE NO SE PUEDE DECIDIR CON UNA PALABRA va en `EXCEPCIONES`, con su motivo
 * («mesa o pared»: una de las dos). Una excepcion que ya no hace falta es roja:
 * si no, la lista se queda vieja y tapa lo siguiente.
 */

'use strict';

var sandbox = require('./verify.sandbox.js');

/* Palabra del texto -> claves que la cubren. */
var REGLAS = [
  { que: 'banda',  re: /\bbandas?\b/i,                      claves: ['band'] },
  { que: 'pared',  re: /\bpared\b/i,                        claves: ['wall', 'wallOptional'] },
  { que: 'silla',  re: /\b(silla|respaldo|asiento)\b/i,     claves: ['stableChair', 'chair'] },
  { que: 'mesa',   re: /\b(mesa|escritorio)\b/i,            claves: ['stableDesk', 'deskOptional'] },
  { que: 'barra',  re: /\bbarra\b/i,                        claves: ['bar', 'barOptional'] },
  { que: 'cojín',  re: /cojín/i,                            claves: ['cushionOptional'] },
];

/* ejercicio -> { que: motivo }. Solo lo que una palabra no decide. */
var EXCEPCIONES = {
  'Flexiones inclinadas':     { pared: '«mesa fija o pared»: una de las dos; se pide la mesa, como el catálogo' },
  'Sentadilla búlgara':       { mesa: '«una mano en la mesa o la pared» para el equilibrio: la pared ya se pide' },
  'Elevación de talones':     { silla: '«una mano en la silla o en la mesa»: cualquiera de las dos; se pide la mesa, si la necesitas' },
  'Apertura de pecho sentado': { silla: '«sin agarrarte al respaldo»: lo nombra para no usarlo' },
  'Sentarse y levantarse del suelo': { silla: '«una silla al lado si la necesitas»: apoyo opcional sin clave propia' },
  'Círculos de tobillo':      { mesa: '«bajo la mesa» dice dónde, no lo pide' },
  'Sentadilla de cuádriceps': { mesa: '«Apoyado»: en la mesa, si la necesitas; no sale en el catálogo' },
  'Suspensión activa':        { barra: '«cuelga» sin nombrar la barra' },
  'Nordics':                  { 'cojín': 'de rodillas en el suelo, con el cojín bajo ellas; no sale en el catálogo' },
};

function cargarDatos(ctx) {
  var sb = sandbox.nuevoSandbox();
  var errores = [];
  [['app/custom/exercise-aliases.js'], ['app/custom/exercise-registry.js'],
   ['app/move/move.data.js', { __M: 'MOVE_ROUTINES' }], ['app/extra/extra.data.js'],
   ['app/extra/extra.data.piernas.js', { __E: 'window.EXTRA_ROUTINES' }]].forEach(function (p) {
    var e = sandbox.cargar(ctx, sb, p[0], p[1]);
    if (e) errores.push(e);
  });
  return { sb: sb, errores: errores };
}

/* Los textos del catalogo de cada ejercicio, por su nombre de hoy. */
function textosDelCatalogo(sb) {
  var textos = {};
  [sb.__M, sb.__E].forEach(function (cat) {
    Object.keys(cat || {}).forEach(function (g) {
      (cat[g].items || []).forEach(function (r) {
        (r.steps || []).forEach(function (s) {
          var n = sb.ejercicioNombreDeHoy(s.name);
          var i = s.instruction || {};
          (textos[n] = textos[n] || []).push([i.setup, i.action, i.care, s.cue].filter(Boolean).join(' '));
        });
      });
    });
  });
  return textos;
}

function chequeaMaterial(ctx, sb, STR, listaCorta) {
  var textos = textosDelCatalogo(sb);
  var mal = [], usadas = {}, claves = {};
  Object.keys(sb.EXERCISE_REGISTRY).forEach(function (g) {
    sb.EXERCISE_REGISTRY[g].items.forEach(function (it) {
      var fila = sb.EXERCISE_PIDE[it.name];
      if (!fila) { mal.push(it.name + ': sin fila en EXERCISE_PIDE'); return; }
      var eq = fila.eq || [];
      eq.forEach(function (k) { claves[k] = true; });
      var texto = [it.cue].concat(textos[it.name] || []).join(' ');
      var exc = EXCEPCIONES[it.name] || {};
      REGLAS.forEach(function (r) {
        var dice = r.re.test(texto);
        var pide = r.claves.some(function (k) { return eq.indexOf(k) >= 0; });
        if (exc[r.que]) {
          usadas[it.name + '/' + r.que] = true;
          if (dice === pide) mal.push(it.name + ': la excepción de «' + r.que + '» ya no hace falta, quítala');
          return;
        }
        if (dice && !pide) mal.push(it.name + ': su texto dice «' + r.que + '» y no lo pide (' + r.claves.join(' o ') + ')');
        if (pide && !dice) mal.push(it.name + ': pide ' + r.claves.filter(function (k) { return eq.indexOf(k) >= 0; }).join(', ') + ' y su texto no lo dice');
      });
    });
  });
  Object.keys(EXCEPCIONES).forEach(function (n) {
    Object.keys(EXCEPCIONES[n]).forEach(function (q) {
      if (!usadas[n + '/' + q]) mal.push(n + ': excepción de «' + q + '» para un ejercicio que no está en el registro');
    });
  });
  /* Cada clave que se pide tiene su frase de «Qué necesitas» en los dos idiomas. */
  Object.keys(claves).forEach(function (k) {
    ['es', 'en'].forEach(function (l) {
      if (!STR || !STR[l] || !STR[l]['preview.eq.' + k]) mal.push('preview.eq.' + k + ': falta en ' + l.toUpperCase());
    });
  });
  if (mal.length) ctx.falla('tus rutinas: lo que pide cada ejercicio no casa con su texto (' + mal.length + '): ' + listaCorta(mal, 8));
  else ctx.ok('tus rutinas: lo que pide cada ejercicio casa con su texto y con el del catálogo');
}

function chequeaRutinas(ctx, STR, listaCorta) {
  var d = cargarDatos(ctx);
  d.errores.forEach(function (e) { ctx.falla('tus rutinas: no se pudo evaluar ' + e); });
  if (!d.sb.EXERCISE_REGISTRY || !d.sb.EXERCISE_PIDE) {
    ctx.falla('tus rutinas: el registro sale VACÍO -- el análisis no ha mirado nada');
    return;
  }
  chequeaMaterial(ctx, d.sb, STR, listaCorta);
}

var NO_CUBRE_RUTINAS = [
  'tus rutinas: el material se casa por palabras (banda, pared, silla, mesa, barra, cojín); ' +
    'un apoyo dicho de otra forma («apóyate en algo») no se ve',
];

module.exports = { chequeaRutinas: chequeaRutinas, NO_CUBRE_RUTINAS: NO_CUBRE_RUTINAS };
