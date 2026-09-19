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

   RECOLOCAR A MITAD DE DÍA (s194 · v0.125.0): al empezar cada bloque, si la
   hora no es la del plan —tarde o temprano—, el resto del día se recompone
   DESDE AHORA (`ritmoComponer` con `previos`) y lo anterior se congela como
   historia en `dia.pasado` (los tramos hechos, sin la referencia viva a la
   rutina: se rehidrata del catálogo al leer). `dia.desde` pasa a ser la hora
   de la última recomposición y `dia.primerBloque` la duración con la que el
   aro arrancó ese bloque, que la regla respeta. Lo hecho no se recompone
   nunca; la comida sigue a su hora exacta; se sale a la hora de siempre con
   lo que quepa. Decisión del usuario (s194): la línea dice la verdad.

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

/* La hora de ahora en minutos, a la baja de 5 en 5 (para elegir). */
function ritmoAhora() {
  return Math.floor(ritmoAhoraExacto() / 5) * 5;
}
/* Y al minuto (para recolocar: la línea dice la hora a la que empezaste). */
function ritmoAhoraExacto() {
  var d = new Date();
  return d.getHours() * 60 + d.getMinutes();
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

/* LO QUE YA PASÓ, para recomponer el resto (ver ritmoComponer). La cadencia de
   la pausa larga cuenta desde la última comida, como en la regla. */
function ritmoPrevios(pasado, primerBloque, pausaPendiente, bloque) {
  var p = { bloques: 0, pausas: 0, foco: 0, comidaHecha: false, usados: [], vasos: 0, ultimoVaso: null, claves: 0, primerBloque: primerBloque || null, pausaPendiente: !!pausaPendiente, bloque: bloque || null };
  /* el agua cuenta desde el inicio del día, no desde la recomposición: sin vaso en lo
     hecho, el «último» es el arranque de lo hecho */
  if (pasado && pasado.length) p.ultimoVaso = pasado[0].desde;
  (pasado || []).forEach(function (it) {
    if (it.tipo === 'foco') { p.bloques++; p.foco += it.dur; }
    if (it.tipo === 'pausa') { p.pausas++; p.claves++; }
    if (it.tipo === 'comida') { p.comidaHecha = true; p.pausas = 0; }
    /* s195: el agua va por tiempo, y la cuenta sigue desde el último vaso hecho */
    if (it.agua) { p.vasos++; p.ultimoVaso = it.tipo === 'comida' ? it.desde + it.dur : it.desde; }
    (it.platos || []).forEach(function (pl) { p.usados.push(pl.id); });
  });
  return p;
}

/* Congelar tramos como historia: sin la rutina viva (se rehidrata al leer). */
function ritmoCongelar(items) {
  return (items || []).map(function (it) {
    var c = Object.assign({}, it);
    if (it.platos) c.platos = it.platos.map(function (p) { return { modulo: p.modulo, id: p.id, name: p.name, min: p.min, clave: p.clave }; });
    return c;
  });
}
function ritmoRutinaPorId(id) {
  var r = window.getBreatheRoutine && window.getBreatheRoutine(id);
  if (r) return r;
  var b = window.resolveBodyRoutine && window.resolveBodyRoutine(id);
  return b && b.routine ? b.routine : null;
}
function ritmoHidratar(pasado) {
  return (pasado || []).map(function (it) {
    if (!it.platos) return it;
    return Object.assign({}, it, { platos: it.platos.map(function (p) {
      return Object.assign({}, p, { rutina: ritmoRutinaPorId(p.id) || { id: p.id, name: p.name, min: p.min } });
    }) });
  });
}

/* El día de una opción con el horario guardado. `desde` es la hora a la que se
   eligió (llegar tarde = empezar ahí) o, recolocando, la de la última
   recomposición; `pasado` son los tramos congelados que van delante. */
function ritmoMenu(s, opcion, cambios, desde, pasado, primerBloque, pausaPendiente, bloque) {
  var R = ritmoDe(s);
  var h = Object.assign({}, R.horario, { ahora: desde != null ? desde : Math.max(R.horario.inicio, ritmoAhora()) });
  var agua = ((s || {}).water && s.water.goal) || 8;
  var previos = pasado ? ritmoPrevios(pasado, primerBloque, pausaPendiente, bloque) : null;
  var m = ritmoComponer(opcion, h, ritmoPozos(s, ritmoHoy()), cambios, agua, previos);
  if (!m || !pasado || !pasado.length) return m;
  /* Lo hecho delante, y los totales del día entero. Si empezaste tarde, el hueco
     entre lo último hecho y ahora se pinta como margen libre (punteado, como el de
     antes de la comida): la línea sigue siendo proporcional al tiempo. */
  var antes = ritmoHidratar(pasado);
  var ultimo = antes[antes.length - 1];
  var finPasado = ultimo.desde + ultimo.dur;
  var hueco = m.desde > finPasado ? [{ tipo: 'libre', desde: finPasado, dur: m.desde - finPasado }] : [];
  var items = antes.concat(hueco, m.items);
  var focos = items.filter(function (it) { return it.tipo === 'foco'; });
  return Object.assign({}, m, {
    items: items, focos: focos, desde: antes[0].desde, tarde: antes[0].desde > m.habitual,
    pausas: items.filter(function (it) { return it.tipo === 'pausa'; }).length,
    vasos: items.filter(function (it) { return it.agua; }).length,
    comida: m.comida != null ? m.comida : (items.some(function (it) { return it.tipo === 'comida'; }) ? R.horario.comida : null),
  });
}

/* EL PLAN DE HOY con su progreso, o null (sin menú, o por libre).
   `pausa` (s193) es la parada ABIERTA —lo que va detrás del último bloque
   hecho— mientras no empiece el siguiente; null si no hay ninguna. Solo cuenta
   si el número guardado es el de bloques hechos: si `cycle` se movió por otra
   vía, la pausa guardada ya no es de este momento. */
function ritmoPlan(s) {
  var R = ritmoDe(s);
  if (R.libre || !R.dia) return null;
  var m = ritmoMenu(s, R.dia.opcion, R.dia.cambios, R.dia.desde, R.dia.pasado || null, R.dia.primerBloque || null, !!R.dia.pausaPendiente, R.dia.bloque || null);
  if (!m) return null;
  var hechos = Math.max(0, Math.min(m.focos.length, (Number((s || {}).cycle) || 0) - (R.dia.cicloBase || 0)));
  var actual = m.focos[hechos] || null;
  var pausa = hechos > 0 && R.dia.pausa === hechos ? ritmoDetras(m, m.focos[hechos - 1]) : null;
  /* s195: `estados` = { n: 'hecha' | 'saltada' } por ordinal de parada (pausa o cierre) */
  return { m: m, hechos: hechos, actual: actual, total: m.focos.length, terminado: !actual, pausa: pausa, estados: R.dia.estados || {} };
}

/* El ordinal de una parada (pausa o cierre) entre las del día: es la clave de
   `dia.estados`. Las congeladas van delante, así que no cambia al recolocar. */
function ritmoOrdinal(m, it) {
  var n = 0;
  for (var i = 0; i < m.items.length; i++) {
    var x = m.items[i];
    if (x.tipo === 'pausa' || x.tipo === 'cierre') { n++; if (x === it) return n; }
  }
  return null;
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
  var cambios = { pausa: p.hechos };
  /* s195: RECOLOCAR TAMBIÉN AL TERMINAR (decisión del usuario: «la línea dice la
     verdad» vale también para la pausa abierta, que ya no puede estar en el
     futuro). Si el bloque acaba a una hora que no es la del plan —acortaste el
     pomodoro, lo pausaste—, lo hecho se congela hasta ese bloque, que dura lo que
     duró, y el resto se recompone desde ahora con la pausa la primera. */
  var ultimo = p.m.focos[p.hechos - 1];
  var t = ritmoAhoraExacto();
  if (ultimo && t !== ultimo.desde + ultimo.dur) {
    var pasado = ritmoCongelar(p.m.items.slice(0, p.m.items.indexOf(ultimo) + 1));
    var f = pasado[pasado.length - 1];
    if (t > f.desde) f.dur = t - f.desde;
    cambios.pasado = pasado; cambios.desde = t; cambios.primerBloque = null; cambios.pausaPendiente = true;
  }
  ritmoGuardar(function (r) { return r.dia ? { dia: Object.assign({}, r.dia, cambios) } : {}; });
}
/* s195: la pausa abierta se HIZO — termina una sesión (de lo que sea: Respira,
   Mueve, Estira) mientras está abierta. La marca vive en `dia.estados` por ordinal. */
function ritmoPausaHecha() {
  var p = ritmoPlan(getState());
  if (!p || !p.pausa) return;
  var n = ritmoOrdinal(p.m, p.pausa);
  if (n == null) return;
  ritmoGuardar(function (r) {
    if (!r.dia) return {};
    var estados = Object.assign({}, r.dia.estados || {}); estados[n] = 'hecha';
    return { dia: Object.assign({}, r.dia, { estados: estados }) };
  });
}
/* Empezar un bloque cierra la pausa y, si la hora no es la del plan, RECOLOCA:
   lo anterior al bloque se congela como historia y el resto se recompone desde
   ahora, con la duración con la que el aro arranca (`minutos`). Llegar antes es
   el mismo caso con la hora por delante. */
function ritmoBloqueEmpezado(minutos) {
  var s = getState();
  var R = ritmoDe(s);
  if (!R.dia) return;
  var cambios = {};
  var p = ritmoPlan(s);
  if (R.dia.pausa != null) {
    cambios.pausa = null;
    /* s195: empezar el bloque sin haber hecho la pausa abierta la deja SALTADA */
    if (p && p.pausa) {
      var n = ritmoOrdinal(p.m, p.pausa);
      if (n != null && (R.dia.estados || {})[n] !== 'hecha') {
        cambios.estados = Object.assign({}, R.dia.estados || {}); cambios.estados[n] = 'saltada';
      }
    }
  }
  if (R.dia.pausaPendiente) cambios.pausaPendiente = false;
  var t = ritmoAhoraExacto();
  var mins = Number(minutos) || 0;
  /* s195: si el aro no marca lo que el plan (pusiste 25 con un plan de 45), también
     se recoloca, y esa duración manda en los bloques que vienen (`dia.bloque`). */
  var otraDuracion = !!(p && p.actual && mins && mins !== p.actual.dur);
  if (p && p.actual && (t !== p.actual.desde || otraDuracion)) {
    cambios.pasado = ritmoCongelar(p.m.items.slice(0, p.m.items.indexOf(p.actual)));
    cambios.desde = t;
    cambios.primerBloque = mins || p.actual.dur;
    cambios.pausaPendiente = false;
    if (otraDuracion) cambios.bloque = mins;
  }
  if (!Object.keys(cambios).length) return;
  ritmoGuardar(function (r) { return r.dia ? { dia: Object.assign({}, r.dia, cambios) } : {}; });
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
  ritmoHorarioInicial, ritmoDe, ritmoPozos, ritmoMenu, ritmoPlan, ritmoDetras, ritmoAhoraExacto,
  ritmoPrevios, ritmoCongelar, ritmoHidratar, ritmoRutinaPorId,
  ritmoAro, ritmoPropuesta, ritmoSiguiente, ritmoSincronizar, ritmoFocoCorriendo,
  ritmoElegir, ritmoPreguntar, ritmoPorLibre, ritmoVolver, ritmoOtra, ritmoHorario,
  ritmoBloqueTerminado, ritmoBloqueEmpezado, ritmoPausaHecha, ritmoOrdinal,
});
