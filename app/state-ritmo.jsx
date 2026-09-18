/* PACE · A tu ritmo · ESTADO y consultas (s192)
   =============================================
   Lo que se guarda (en `pace.state.v2`, clave `ritmo`):

     horario  { inicio, comida, comidaDur, salida } en minutos, o null mientras
              la persona no lo haya tocado (entonces se propone uno por región).
     libre    'YYYY-MM-DD' = «hoy voy por libre» · true = la carta SIEMPRE, sin
              fecha. `true` no tiene botón todavía: es el hueco de un ajuste
              futuro, y hoy lo usa la suite para las pruebas que no son de este
              módulo (tests/helpers.js), porque su reloj va falseado y una fecha
              no casaría.
     dia      { fecha, opcion, desde, cicloBase, cambios, pausa } — el menú
              elegido HOY. Con otra fecha no existe (se lee como null).
              `pausa` (s193) = el número de bloques hechos cuando terminó el
              último, mientras su pausa siga ABIERTA; null si no hay pausa
              abierta. La abre terminar un bloque (ritmoBloqueTerminado, desde
              main.jsx) y la cierra EMPEZAR el siguiente (ritmoBloqueEmpezado,
              desde FocusTimer): hagas la rutina o la saltes, la pausa dura
              hasta que vuelves al foco. Decisión del usuario en s193 (2A):
              simple, sin estado que pueda quedarse colgado, y no castiga
              saltarla. Con «Ahora» sobre la parada, la línea deja de saltar
              por encima de la pausa que toca.

   EL PROGRESO NO SE GUARDA APARTE: sale de `state.cycle`, que ya cuenta los
   bloques de foco de HOY (completePomodoro lo sube y el relevo de día lo pone a
   cero). `cicloBase` es su valor al elegir, así que bloques hechos = cycle −
   base. Un contador propio habría sido un segundo número del mismo hecho.
   `pausa` no es un contador: es un interruptor que se guarda con el número
   al que pertenece, para que un bloque hecho por otra vía (volver de «por
   libre») no reabra una pausa vieja.

   Y NO SE RECOLOCA A MITAD DEL DÍA (todavía): las horas son las del plan. Es lo
   primero de la lista «luego vamos ajustando». */

var RITMO_TIMER_KEY = 'pace.timer.v1';   /* la de FocusTimer.support: el bloque que corre */

/* La hora de comer propuesta por REGIÓN del navegador. Orientativa: la persona
   la confirma en la misma frase. Lo pidió el usuario en s192 («en cada país se
   come a una hora distinta»). */
var RITMO_COMIDA_REGION = {
  'es-ES': 840, 'es-MX': 840, 'es-AR': 780, 'es-CO': 750, 'es-CL': 810, 'es': 840,
  'en-US': 720, 'en-GB': 750, 'en': 750, 'fr': 750, 'de': 720, 'it': 780, 'pt-BR': 720, 'pt': 780,
};

function ritmoHorarioInicial() {
  var idioma = 'es-ES';
  try { idioma = navigator.language || idioma; } catch (e) {}
  var comida = RITMO_COMIDA_REGION[idioma] || RITMO_COMIDA_REGION[idioma.split('-')[0]] || 780;
  return { inicio: 540, comida: comida, comidaDur: 60, salida: 1020 };
}

function ritmoHoy() {
  return typeof todayISO === 'function' ? todayISO() : '';
}

/* La hora de ahora en minutos, a la baja de 5 en 5. */
function ritmoAhora() {
  var d = new Date();
  return Math.floor((d.getHours() * 60 + d.getMinutes()) / 5) * 5;
}

/* El estado de A tu ritmo, normalizado: nunca devuelve huecos. */
function ritmoDe(s) {
  var r = (s && s.ritmo) || {};
  var hoy = ritmoHoy();
  return {
    horario: Object.assign(ritmoHorarioInicial(), r.horario || {}),
    libre: r.libre === true || (!!hoy && r.libre === hoy),
    dia: r.dia && r.dia.fecha === hoy ? r.dia : null,
  };
}

/* LOS POZOS salen del CATÁLOGO VIVO: lo gratuito (o lo que tengas abierto) que
   cabe junto a la mesa — sin suelo, sin material obligatorio, sin aviso de
   seguridad ni retención. La maqueta los tenía escritos a mano (6 · 4 · 12).
   Rotan por día para que cada jornada empiece por otra rutina, y respetan el
   VETO de la pausa (s189) con su amnistía: si el veto vaciara un pozo, se ignora. */
function ritmoPozos(s, iso) {
  var lista = function (cat, grupos) {
    var out = [];
    Object.keys(cat || {}).forEach(function (g) {
      if (grupos && grupos.indexOf(g) === -1) return;
      ((cat[g] || {}).items || []).forEach(function (r) { if (r) out.push(r); });
    });
    return out;
  };
  var cabe = function (r) {
    if (!r || r.safety || r.requiresFloor) return false;
    if ((r.equipment || []).some(function (e) { return !/Optional$/.test(e); })) return false;
    if (typeof libraryConRetencion === 'function' && libraryConRetencion(r)) return false;
    return !window.canAccessRoutine || window.canAccessRoutine(r.id);
  };
  var vetadas = typeof breakVetadas === 'function' ? breakVetadas((s || {}).routineFeedback) : {};
  var dia = typeof libraryDiaOrdinal === 'function' ? libraryDiaOrdinal(iso) : 0;
  var prepara = function (rutinas) {
    var pozo = rutinas.filter(cabe);
    var sinVeto = pozo.filter(function (r) { return !vetadas[r.id]; });
    if (sinVeto.length) pozo = sinVeto;
    if (!pozo.length) return pozo;
    var i = ((dia % pozo.length) + pozo.length) % pozo.length;
    return pozo.slice(i).concat(pozo.slice(0, i));
  };
  var respira = lista(window.BREATHE_ROUTINES, ['equilibrio', 'balance', 'relajacion']);
  return {
    estira: prepara(lista(window.EXTRA_ROUTINES)),
    mueve: prepara(lista(window.MOVE_ROUTINES)),
    respira: prepara(respira.filter(function (r) { return r.min >= 4 && r.min <= 10; })),
    cierre: prepara(respira.filter(function (r) { return r.min <= 3; })),
  };
}

/* El día de una opción con el horario guardado. `desde` es la hora a la que se
   eligió (llegar tarde = empezar ahí). */
function ritmoMenu(s, opcion, cambios, desde) {
  var R = ritmoDe(s);
  var h = Object.assign({}, R.horario, { ahora: desde != null ? desde : Math.max(R.horario.inicio, ritmoAhora()) });
  var agua = ((s || {}).water && s.water.goal) || 8;
  return ritmoComponer(opcion, h, ritmoPozos(s, ritmoHoy()), cambios, agua);
}

/* EL PLAN DE HOY con su progreso, o null (sin menú, o por libre).
   `pausa` (s193) es la parada ABIERTA —lo que va detrás del último bloque
   hecho— mientras no empiece el siguiente; null si no hay ninguna. Solo cuenta
   si el número guardado es el de bloques hechos: si `cycle` se movió por otra
   vía, la pausa guardada ya no es de este momento. */
function ritmoPlan(s) {
  var R = ritmoDe(s);
  if (R.libre || !R.dia) return null;
  var m = ritmoMenu(s, R.dia.opcion, R.dia.cambios, R.dia.desde);
  if (!m) return null;
  var hechos = Math.max(0, Math.min(m.focos.length, (Number((s || {}).cycle) || 0) - (R.dia.cicloBase || 0)));
  var actual = m.focos[hechos] || null;
  var pausa = hechos > 0 && R.dia.pausa === hechos ? ritmoDetras(m, m.focos[hechos - 1]) : null;
  return { m: m, hechos: hechos, actual: actual, total: m.focos.length, terminado: !actual, pausa: pausa };
}

/* Lo que viene detrás de un tramo, saltando el margen libre. */
function ritmoDetras(m, tramo) {
  var i = m.items.indexOf(tramo);
  while (i >= 0 && ++i < m.items.length) {
    if (m.items[i].tipo !== 'libre') return m.items[i];
  }
  return null;
}

/* --- lo que consultan los demás ------------------------------------------ */

/* El aro (FocusTimer): «Bloque 2 de 8» y su botón. null = el aro de siempre. */
function ritmoAro(s, t, tn) {
  var p = ritmoPlan(s);
  if (!p || !p.actual) return null;
  var k = p.hechos + 1;
  return {
    label: tn('ritmo.aro.bloque', { n: k, m: p.total }),
    empezar: k === 1 ? t('ritmo.aro.empezar') : tn('ritmo.aro.siguiente', { n: k }),
  };
}

/* La pausa (BreakMenu): lo que el menú sirve DETRÁS del bloque que acaba de
   terminar. Mismo contrato que `breakPropuesta`; `modulo` usa las claves del
   menú ('extra' es Estira y 'move' es Mueve, los ids cruzados de siempre). */
var RITMO_A_MENU = { estira: 'extra', mueve: 'move', respira: 'breathe', cierre: 'breathe' };
function ritmoPropuesta(s) {
  var p = ritmoPlan(s);
  if (!p || p.hechos < 1) return null;
  var it = ritmoDetras(p.m, p.m.focos[p.hechos - 1]);
  if (!it) return null;
  if (it.tipo === 'comida') return { modulo: 'water', porque: 'ritmo.comida', rutina: null, datos: {} };
  var plato = it.platos && it.platos[0];
  if (!plato) return null;
  return { modulo: RITMO_A_MENU[plato.modulo], porque: 'ritmo.' + it.motivo, rutina: plato.rutina, datos: {} };
}

/* La barra lateral: la pausa ABIERTA si la hay («Tu pausa · 9:45», s193) y, si
   no, la siguiente parada con plato (la comida no tiene rutina que abrir, así
   que se salta). */
function ritmoSiguiente(s) {
  var p = ritmoPlan(s);
  if (!p || !p.actual) return null;
  var it = p.pausa && p.pausa.platos && p.pausa.platos[0] ? p.pausa : p.actual;
  var ahora = it === p.pausa;
  do {
    if (it.platos && it.platos[0]) {
      var plato = it.platos[0];
      return { targetId: plato.id, hora: it.desde, min: plato.min, modulo: plato.modulo, larga: !!it.larga, dur: it.dur, ahora: ahora };
    }
  } while ((it = ritmoDetras(p.m, it)));
  return null;
}

/* ¿Hay un bloque de foco corriendo? Lo dice la clave que FocusTimer escribe
   SOLO mientras corre. Cambiar `focusMinutes` con un bloque en marcha lo
   reiniciaría, así que con él vivo no se toca nada. */
function ritmoFocoCorriendo() {
  try {
    var v = JSON.parse(localStorage.getItem(RITMO_TIMER_KEY) || 'null');
    return !!(v && v.endsAt && v.endsAt > Date.now());
  } catch (e) { return false; }
}

/* El aro tiene que medir lo que mide el bloque que toca. */
function ritmoSincronizar() {
  var s = getState();
  if (s.focusMode !== 'foco' || ritmoFocoCorriendo()) return;
  var p = ritmoPlan(s);
  if (p && p.actual && s.focusMinutes !== p.actual.dur) setState({ focusMinutes: p.actual.dur });
}

/* --- acciones -------------------------------------------------------------- */
function ritmoGuardar(cambio) {
  setState(function (prev) {
    var r = Object.assign({ horario: null, libre: null, dia: null }, prev.ritmo || {});
    return Object.assign({}, prev, { ritmo: Object.assign(r, cambio(r)) });
  });
}

function ritmoElegir(opcion) {
  var s = getState();
  var R = ritmoDe(s);
  var dia = { fecha: ritmoHoy(), opcion: opcion, desde: Math.max(R.horario.inicio, ritmoAhora()),
              cicloBase: Number(s.cycle) || 0, cambios: {}, pausa: null };
  ritmoGuardar(function () { return { libre: null, dia: dia }; });
  ritmoSincronizar();
}

function ritmoPreguntar() { ritmoGuardar(function () { return { dia: null }; }); }

/* LA PAUSA (s193). Terminar un bloque la abre con el número de bloques hechos
   —`completePomodoro` ya subió `cycle` cuando main.jsx llama a esto—; empezar
   el siguiente la cierra. Sin menú no hay nada que abrir. */
function ritmoBloqueTerminado() {
  var p = ritmoPlan(getState());
  if (!p || p.hechos < 1) return;
  ritmoGuardar(function (r) { return r.dia ? { dia: Object.assign({}, r.dia, { pausa: p.hechos }) } : {}; });
}
function ritmoBloqueEmpezado() {
  var R = ritmoDe(getState());
  if (!R.dia || R.dia.pausa == null) return;
  ritmoGuardar(function (r) { return r.dia ? { dia: Object.assign({}, r.dia, { pausa: null }) } : {}; });
}
function ritmoPorLibre() { ritmoGuardar(function () { return { libre: ritmoHoy(), dia: null }; }); }
function ritmoVolver() { ritmoGuardar(function () { return { libre: null }; }); }

function ritmoOtra(claves) {
  ritmoGuardar(function (r) {
    if (!r.dia) return {};
    var cambios = Object.assign({}, r.dia.cambios || {});
    (claves || []).forEach(function (k) { cambios[k] = (cambios[k] || 0) + 1; });
    return { dia: Object.assign({}, r.dia, { cambios: cambios }) };
  });
}

/* Cambiar una hora recompone el día: las pausas cambiadas ya no están donde
   estaban, así que sus cambios se olvidan. */
function ritmoHorario(campo, valor) {
  var R = ritmoDe(getState());
  var horario = Object.assign({}, R.horario);
  horario[campo] = Number(valor);
  ritmoGuardar(function (r) {
    return { horario: horario, dia: r.dia ? Object.assign({}, r.dia, { cambios: {} }) : r.dia };
  });
  ritmoSincronizar();
}

Object.assign(window, {
  ritmoHorarioInicial, ritmoDe, ritmoPozos, ritmoMenu, ritmoPlan, ritmoDetras,
  ritmoAro, ritmoPropuesta, ritmoSiguiente, ritmoSincronizar, ritmoFocoCorriendo,
  ritmoElegir, ritmoPreguntar, ritmoPorLibre, ritmoVolver, ritmoOtra, ritmoHorario,
  ritmoBloqueTerminado, ritmoBloqueEmpezado,
});
