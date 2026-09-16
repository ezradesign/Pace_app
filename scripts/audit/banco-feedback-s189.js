/* PACE · BANCO DEL FEEDBACK QUE NADIE LEE (s189)
 * ==============================================
 * `routineFeedback` se captura desde s116 y no lo lee ningun recomendador. Antes de
 * escribir la regla que lo lea hay que saber si el dato DA PARA ESO, porque la
 * frecuencia es de una respuesta por rutina y DIA LOCAL: un sistema de puntuacion
 * sobre cuatro respuestas no seria una preferencia, seria ruido con decimales.
 *
 * LO QUE MIDE, evaluando el recomendador DE VERDAD (`libraryParaAhora`) sobre los
 * catalogos DE VERDAD, no una maqueta de ellos:
 *   A · el POZO de cada rama de la propuesta, gratis y con premium;
 *   B · cuantas rutinas distintas propone en 30 y 90 dias -- el techo de senal;
 *   C · si DOS pausas del mismo dia proponen lo mismo (la rotacion es por dia);
 *   D · si excluir lo rechazado puede DEJAR MUDA una rama, y en cuantos dias;
 *   E · a que se cae la rama 1 cuando enmudece, que es la consecuencia real.
 *
 * POR QUE IMPORTA C: `libraryParaAhora` rota por ordinal del dia, asi que dos dias
 * seguidos nunca coinciden -- pero dos pausas del MISMO dia comparten el ISO. Si la
 * rama 1 no mira el plan, la segunda pausa propone la rutina que acabas de hacer.
 *
 * NO MIDE si la gente responde. Eso no esta en el repo y no me lo voy a inventar:
 * lo que hay aqui es el TECHO de lo que el sistema puede saber, no lo que sabra.
 *
 * Uso: node scripts/audit/banco-feedback-s189.js
 */
'use strict';

const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const sandbox = require(path.join(ROOT, 'scripts', 'verify.sandbox.js'));

/* ---------- carga: catalogos + reglas de biblioteca + la propuesta ---------- */
function mundo(premium) {
  const ctx = { ROOT, babel: require(path.join(ROOT, 'node_modules', '@babel', 'core')) };
  const sb = sandbox.nuevoSandbox();
  const errs = [
    sandbox.cargar(ctx, sb, 'app/move/move.data.js', { MOVE_ROUTINES: 'MOVE_ROUTINES' }),
    sandbox.cargar(ctx, sb, 'app/extra/extra.data.js', { EXTRA_ROUTINES: 'EXTRA_ROUTINES' }),
    sandbox.cargar(ctx, sb, 'app/breathe/BreatheLibrary.jsx', { BREATHE_ROUTINES: 'BREATHE_ROUTINES' }),
    sandbox.cargar(ctx, sb, 'app/ui/library-rules.js'),
    sandbox.cargar(ctx, sb, 'app/breakmenu/BreakMenu.support.jsx'),
  ].filter(Boolean);
  if (errs.length) { console.error('GUARD: ' + errs.join(' · ')); process.exit(2); }
  /* `extra.data.piernas.js` amplia el objeto del anterior y lleva guard: va DESPUES
     y en el MISMO sandbox. */
  const e2 = sandbox.cargar(ctx, sb, 'app/extra/extra.data.piernas.js');
  if (e2) { console.error('GUARD piernas: ' + e2); process.exit(2); }

  /* El acceso se resuelve como en la app (`state-entitlement.jsx`): desconocido ->
     true, no-premium -> true, premium -> `premiumUnlocked`. */
  const acceso = {};
  [sb.MOVE_ROUTINES, sb.EXTRA_ROUTINES, sb.BREATHE_ROUTINES].forEach(function (cat) {
    Object.keys(cat || {}).forEach(function (g) {
      ((cat[g] || {}).items || []).forEach(function (r) { acceso[r.id] = r.access; });
    });
  });
  sb.canAccessRoutine = function (id) { return acceso[id] !== 'premium' ? true : !!premium; };
  sb.todayISO = function () { return '2026-09-16'; };
  return sb;
}

const ISO0 = new Date(2026, 8, 16);
function iso(n) {
  const d = new Date(ISO0.getFullYear(), ISO0.getMonth(), ISO0.getDate() + n);
  const p = function (x) { return String(x).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

const RAMAS = [
  { nombre: 'Estira (rama 1 · bloque >=35 min)', cat: 'EXTRA_ROUTINES',
    state: { focusMinutes: 45, cycle: 1, water: { today: 3 }, plan: {} } },
  { nombre: 'Respira (rama 3 · tercer bloque)', cat: 'BREATHE_ROUTINES',
    state: { focusMinutes: 25, cycle: 3, water: { today: 3 }, plan: {} } },
  { nombre: 'Mueve (rama 4 · pendiente del plan)', cat: 'MOVE_ROUTINES',
    state: { focusMinutes: 25, cycle: 1, water: { today: 3 }, plan: { extra: true, respira: true } } },
];

function linea(t) { console.log(t); }
function tit(t) { linea(''); linea(t); linea('='.repeat(t.length)); }

/* ---------- A · el pozo de cada rama ---------- */
tit('A · EL POZO: lo que cada rama puede proponer');
linea('rama                                  | gratis | premium | con aviso (fuera)');
RAMAS.forEach(function (r) {
  const nums = [false, true].map(function (prem) {
    const sb = mundo(prem);
    return sb.breakPozo(sb[r.cat]).filter(function (x) { return !x.safety; }).length;
  });
  const sb = mundo(true);
  const safety = sb.breakPozo(sb[r.cat]).filter(function (x) { return x.safety; }).length;
  linea(r.nombre.padEnd(37) + ' |   ' + String(nums[0]).padStart(4) + ' |    '
    + String(nums[1]).padStart(4) + ' |   ' + safety);
});

/* ---------- B · el techo de senal ---------- */
tit('B · TECHO DE SENAL: rutinas distintas propuestas en N dias (1 pausa/dia)');
RAMAS.forEach(function (r) {
  [false, true].forEach(function (prem) {
    const sb = mundo(prem);
    const v30 = new Set(), v90 = new Set();
    let seguidas = 0, prev = null;
    for (let d = 0; d < 90; d++) {
      const p = sb.breakPropuesta(Object.assign({}, r.state), { iso: iso(d), hora: 10 });
      const id = p && p.rutina ? p.rutina.id : null;
      if (id) { if (d < 30) v30.add(id); v90.add(id); }
      if (id && id === prev) seguidas++;
      prev = id;
    }
    linea(r.nombre.padEnd(37) + (prem ? ' premium' : ' gratis ') + ' -> 30 d: '
      + String(v30.size).padStart(2) + ' · 90 d: ' + String(v90.size).padStart(2)
      + ' distintas · dias seguidos con la MISMA: ' + seguidas);
  });
});

/* ---------- C · dos pausas el mismo dia ---------- */
tit('C · DOS PAUSAS EL MISMO DIA (la rotacion es por dia, no por pausa)');
(function () {
  const sb = mundo(false);
  /* Las dos pausas del mismo dia se distinguen por el BLOQUE, que es lo que la
     app le pasa: `completePomodoro` ya subio `cycle` cuando el menu se abre. */
  const p1 = sb.breakPropuesta({ focusMinutes: 45, cycle: 1, water: { today: 3 }, plan: {} }, { iso: iso(0), hora: 10 });
  const p2 = sb.breakPropuesta({ focusMinutes: 45, cycle: 2, water: { today: 3 }, plan: {} }, { iso: iso(0), hora: 11 });
  linea('1a pausa: ' + (p1 && p1.rutina ? p1.rutina.name : '(nada)'));
  linea('2a pausa: ' + (p2 && p2.rutina ? p2.rutina.name : '(nada)'));
  linea('MISMA rutina dos veces seguidas: '
    + (p1 && p2 && p1.rutina && p2.rutina && p1.rutina.id === p2.rutina.id ? 'SI' : 'no'));
  /* Y con el plan ya cumplido: la rama 1 no lo mira. */
  const p3 = sb.breakPropuesta({ focusMinutes: 45, cycle: 2, water: { today: 3 }, plan: { extra: true } },
    { iso: iso(0), hora: 11 });
  linea('con `plan.extra` YA hecho hoy, la 2a pausa propone: '
    + (p3 && p3.rutina ? p3.rutina.name + ' (' + p3.porque + ')' : '(nada)'));
})();

/* ---------- D · el veto, medido sobre la regla ---------- */
tit('D · EL VETO SOBRE LA REGLA REAL: «No» a todo, 400 dias');
linea('(la respuesta se escribe en `routineFeedback` y la propuesta la vuelve a leer)');
RAMAS.forEach(function (r) {
  [false, true].forEach(function (prem) {
    const sb = mundo(prem);
    const fb = {};
    let mudos = 0, repetidas = 0, primeraRepeticion = null;
    const rechazadas = new Set();
    for (let d = 0; d < 400; d++) {
      const st = Object.assign({}, r.state, { routineFeedback: fb, cycle: r.state.cycle });
      const p = sb.breakPropuesta(st, { iso: iso(d), hora: 10 });
      if (!p || !p.rutina) { mudos++; continue; }
      const id = p.rutina.id;
      if (rechazadas.has(id)) {
        repetidas++;
        if (primeraRepeticion === null) primeraRepeticion = d + 1;
      }
      rechazadas.add(id);
      /* La persona contesta «No»: un contador, igual que `nextRoutineFeedback`. */
      fb[id] = { yes: 0, some: 0, no: (fb[id] ? fb[id].no : 0) + 1, lastPromptDay: iso(d) };
    }
    linea(r.nombre.padEnd(37) + (prem ? ' premium' : ' gratis ') + ' -> dias sin propuesta: ' + mudos
      + ' · rechazadas distintas: ' + rechazadas.size
      + ' · vuelve a proponer una rechazada el dia ' + (primeraRepeticion === null ? '(nunca)' : primeraRepeticion));
  });
});

/* Y el «Si» protege: la misma rutina con un «Si» y un «No» NO se veta. */
tit('D2 · QUE VETA Y QUE NO (`breakVetadas`, la funcion de verdad)');
(function () {
  const sb = mundo(false);
  const casos = {
    'solo No':            { no: 2 },
    'No + Si':            { no: 2, yes: 1 },
    'No + Un poco':       { no: 2, some: 1 },
    'solo Si':            { yes: 3 },
    'nada (solo el dia)': { lastPromptDay: '2026-09-16' },
    'basura (cadenas)':   { no: '3', yes: null },
  };
  Object.keys(casos).forEach(function (k) {
    const v = sb.breakVetadas({ 'x.y': casos[k] });
    linea(k.padEnd(22) + ' -> ' + (v['x.y'] ? 'VETADA' : 'sigue en el pozo'));
  });
  linea('slice ausente / roto      -> ' + JSON.stringify(sb.breakVetadas(null)) + ' · ' + JSON.stringify(sb.breakVetadas('no')));
})();

/* ---------- E · la amnistia ---------- */
tit('E · LA AMNISTIA: con las 11 de Estira rechazadas, que propone la rama 1');
(function () {
  const sb = mundo(false);
  const pozo = sb.breakPozo(sb.EXTRA_ROUTINES);
  const fb = {};
  pozo.forEach(function (r) { fb[r.id] = { yes: 0, some: 0, no: 1, lastPromptDay: '2026-09-15' }; });
  const p = sb.breakPropuesta({ focusMinutes: 45, cycle: 1, water: { today: 0 }, plan: {}, routineFeedback: fb },
    { iso: iso(0), hora: 15 });
  linea('rechazadas ' + pozo.length + ' de ' + pozo.length + ' · bloque de 45 min, sin agua, 15:00');
  linea('la propuesta es: ' + (p ? p.modulo + ' / ' + p.porque + (p.rutina ? ' / ' + p.rutina.name : '') : '(nada)'));
  linea('(antes de la amnistia caia en `water`, que no es una respuesta a 45 minutos sentado)');
})();
linea('');
