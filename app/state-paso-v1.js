/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-paso-v1.js — EL DÍA DE v1, NADIE PIERDE LO QUE YA USABA
   ============================================================
   Ez, 15 oct. 2026 («Cómo se vende PACE completo», punto 1): quien usaba PACE antes de v1
   recibe su semana de prueba con un aviso y, además, las rutinas de pago que ya hizo alguna
   vez se le quedan abiertas para siempre; las demás se cierran al acabar la prueba. La lista
   sale de lo guardado en su equipo y se fija una sola vez, al pasar a v1. Lo que más castigan
   las reseñas es que se quite lo que ya se tenía.

   «PASAR A v1» ES EL PRIMER ARRANQUE CON `PREMIUM_ABIERTO_HASTA_V1` EN FALSE. Ese arranque
   apunta `pasoV1` en el estado, una sola vez y para siempre (va en la copia de «Tus datos»):
     · quien aún no tenía nada (instala ya en v1): { at, previo: false };
     · quien ya usaba PACE: { at, previo: true, hasta: at + 7 días, rutinas: [...], avisado }.
   Con `pasoV1` puesto no se vuelve a calcular. Antes de v1 no se apunta nada.

   ¿USABA PACE? Si al arrancar el estado ya guarda la bienvenida acabada (`firstSeen`) o algo
   hecho. En el primer arranque de quien instala ya en v1 no hay nada de eso: la bienvenida
   todavía no ha salido.

   LA LISTA: las rutinas de pago de Respira, Mueve y Estira con alguna sesión en el registro
   de eventos (terminada o no), con alguna vez entera en los contadores del estado
   (`rutina.<id>`) o con una respuesta a «¿Te ayudó?», que solo sale al acabar una. En el
   iPhone el registro no escribe, y la lista sale de lo demás. Las propias del constructor no
   entran: el constructor es una superficie de pago, y quedan guardadas y cerradas.

   LO QUE ABRE: durante la semana, lo mismo que abría `PREMIUM_ABIERTO_HASTA_V1`
   (`paceAbiertoAhora`, state-entitlement.jsx); después, solo las rutinas de la lista
   (`pacePasoV1Conserva`). Quien tiene un código o una compra ya lo tiene todo y no recibe
   aviso. Mientras se lee el registro, que es asíncrono, todo sigue abierto: el primer
   arranque de v1 no enseña candados que un momento después no estarían.

   RIESGO ACEPTADO: lo guardado en el equipo se puede tocar, y sin servidor no se puede
   firmar. Es el mismo que Ez aceptó el 15 oct. con la prueba de la web («se acepta, como se
   acepta que quien toca el navegador abra cualquier web»).

   `var`/`function` a propósito (un `const` no cruza la IIFE del artefacto). Carga después
   del registro de eventos y del guard, y arranca al evaluarse.
   ============================================================ */

var PACE_PASO_V1_DIAS = 7;
/* `promesa`: la del cálculo en marcha, para quien llegue mientras se hace (la hoja del aviso). */
var _pacePasoV1 = { calculando: false, promesa: null };

/* El registro de `pasoV1`, o null si no hay (o no tiene forma). */
function pacePasoV1Leer() {
  var s = typeof getState === 'function' ? getState() : null;
  var r = s && s.pasoV1;
  return r && typeof r === 'object' && !Array.isArray(r) && typeof r.at === 'number' ? r : null;
}

function pacePasoV1UsabaPace(s) {
  if (!s) return false;
  var lleno = function (o) { return !!(o && typeof o === 'object' && Object.keys(o).length); };
  return s.firstSeen != null || (s.profile && s.profile.completedAt != null) || (Number(s.totalFocusMin) || 0) > 0
    || (Number(s.breatheSessionsTotal) || 0) > 0 || (Number(s.moveSessionsTotal) || 0) > 0
    || lleno(s.achievements) || lleno(s.routineCounts) || lleno(s.history && s.history.days);
}

function pacePasoV1EsDePago(id) {
  if (!id || String(id).indexOf('custom.') === 0) return false;
  var r = (window.getBreatheRoutine && window.getBreatheRoutine(id)) || null;
  if (!r) { var b = window.resolveBodyRoutine && window.resolveBodyRoutine(id); r = b ? b.routine : null; }
  return !!(r && r.access === 'premium');
}

/* Las de pago que esta persona hizo alguna vez: del registro (`sesiones`, rutina -> veces), de
   los contadores del estado y de sus respuestas a «¿Te ayudó?». */
function pacePasoV1Rutinas(s, sesiones) {
  var ids = {};
  Object.keys(sesiones || {}).forEach(function (id) { if (sesiones[id] > 0) ids[id] = true; });
  Object.keys((s && s.routineCounts) || {}).forEach(function (k) {
    if (k.indexOf('rutina.') === 0 && s.routineCounts[k] > 0) ids[k.slice(7)] = true;
  });
  Object.keys((s && s.routineFeedback) || {}).forEach(function (id) { ids[id] = true; });
  return Object.keys(ids).filter(pacePasoV1EsDePago).sort();
}

/* Las veces de cada rutina en el registro, o {} si no se puede leer. */
function pacePasoV1Sesiones() {
  var leer = function () {
    var agg = window.paceEventsAggregates ? window.paceEventsAggregates() : null;
    return (agg && agg.sessionsByRoutine) || {};
  };
  var abre = window.paceEventsInitialize ? window.paceEventsInitialize() : null;
  if (!abre || typeof abre.then !== 'function') return Promise.resolve(leer());
  /* La apertura nunca lanza, pero se le da un tope: el día de v1 no puede quedarse esperando. */
  var tope = new Promise(function (ok) { setTimeout(ok, 4000); });
  return Promise.race([abre, tope]).then(leer, function () { return {}; });
}

/* Los catálogos de Respira y del cuerpo cargan DESPUÉS que este archivo. Sin ellos ninguna rutina
   sería de pago y la lista se fijaría vacía para siempre: se esperan, y si no llegan no se apunta
   nada y el arranque siguiente lo vuelve a intentar. */
function pacePasoV1Catalogo() {
  var hay = function () { return typeof window.getBreatheRoutine === 'function' && typeof window.resolveBodyRoutine === 'function'; };
  return new Promise(function (ok) {
    var vueltas = 0;
    (function mirar() { if (hay() || ++vueltas > 100) ok(hay()); else setTimeout(mirar, 50); })();
  });
}

/* EL PASO, al arrancar. Devuelve una promesa (las pruebas la esperan) con el registro. */
function pacePasoV1() {
  try {
    if (_pacePasoV1.calculando && _pacePasoV1.promesa) return _pacePasoV1.promesa;
    if (window.PREMIUM_ABIERTO_HASTA_V1 === true || pacePasoV1Leer()) return Promise.resolve(pacePasoV1Leer());
    var at = Date.now();
    if (!pacePasoV1UsabaPace(getState())) {
      setState({ pasoV1: { at: at, previo: false } });
      return Promise.resolve(pacePasoV1Leer());
    }
    _pacePasoV1.calculando = true;
    _pacePasoV1.promesa = Promise.all([pacePasoV1Sesiones(), pacePasoV1Catalogo()]).then(function (x) {
      _pacePasoV1.calculando = false;
      if (x[1] && !pacePasoV1Leer()) {
        setState({ pasoV1: { at: at, previo: true, hasta: at + PACE_PASO_V1_DIAS * 86400000,
          rutinas: pacePasoV1Rutinas(getState(), x[0]), avisado: false } });
      }
      return pacePasoV1Leer();
    }, function () { _pacePasoV1.calculando = false; return null; });
    return _pacePasoV1.promesa;
  } catch (e) {
    _pacePasoV1.calculando = false;
    return Promise.resolve(null);
  }
}

/* ¿Dura la semana de prueba del paso a v1? */
function pacePruebaV1Vigente() {
  if (_pacePasoV1.calculando) return true;
  var r = pacePasoV1Leer();
  return !!(r && r.previo && typeof r.hasta === 'number' && Date.now() < r.hasta);
}

/* Cuándo acaba la semana de prueba (ms), solo mientras dura; si no, null. Lo cuenta Ajustes. */
function pacePruebaV1Hasta() {
  var r = pacePasoV1Leer();
  return r && r.previo && typeof r.hasta === 'number' && Date.now() < r.hasta ? r.hasta : null;
}

/* ¿Es esta una de las rutinas de pago que se le quedan? */
function pacePasoV1Conserva(routineId) {
  var r = pacePasoV1Leer();
  return !!(r && r.previo && Array.isArray(r.rutinas) && r.rutinas.indexOf(routineId) !== -1);
}

/* El registro, si toca contarle su semana: quien ya usaba PACE, sin código ni compra, dentro de
   la semana, sin aviso dado y sin una sesión delante. Lo pinta la hoja del aviso. */
function pacePasoV1PorAvisar() {
  var r = pacePasoV1Leer();
  if (!r || !r.previo || r.avisado || !pacePruebaV1Vigente()) return null;
  if (window.hasPremiumEntitlement && window.hasPremiumEntitlement()) return null;
  if (document.querySelector('[data-pace-session-root]')) return null;
  return r;
}

function pacePasoV1Avisado() {
  var r = pacePasoV1Leer();
  if (r && !r.avisado) setState({ pasoV1: Object.assign({}, r, { avisado: true }) });
}

try { pacePasoV1(); } catch (e) {}

Object.assign(window, {
  PACE_PASO_V1_DIAS, pacePasoV1, pacePasoV1Leer, pacePasoV1Rutinas, pacePruebaV1Vigente, pacePruebaV1Hasta, pacePasoV1Conserva,
  pacePasoV1PorAvisar, pacePasoV1Avisado,
});
