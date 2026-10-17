/* PACE · A tu ritmo · EL MOTOR DE LA SEMANA, EN EL ESTADO (Ez, 16 oct. 2026)
   =======================================================================
   El motor (ritmo.motor.js) es puro; aquí se le da la semana y se guarda lo que dice,
   dentro de `ritmo` en `pace.state.v2`:

     carta      { lunes, res, respuesta, hora, vista } — la carta de la semana que empieza
                ese `lunes`: `res` es lo que dijo el motor, `respuesta` la de los cambios
                ('vale' | 'dejar'), `hora` la de la pregunta de tus horas ('si' | 'no') y
                `vista` el día en que quedó todo contestado. Se guarda UNA vez por semana, la
                primera vez que PACE está abierto con el registro listo y hay carta (tres
                días o más); sin carta no se escribe nada.
     aprendido  { descansa, cortas, menos, ayuda, rechazado } — lo que aplicó «Vale» y lo
                rechazado, cada cosa con su `hasta` (cuatro semanas). Lo leen las series por
                `ritmoMemoria`, y solo con PACE completo (`puedeAprender`): sin él, el día
                es el de la capa 1, gratis, y no hay carta.

   DE DÓNDE SALE LA SEMANA, sin salir del dispositivo: los resúmenes de cada día
   (`ritmo.day.closed`) más los que aún esperan en la cola, los «¿Te ayudó?»
   (`feedback.answered`) y los bloques de foco terminados (`session.completed`), del
   registro (`pace.events.v1`). Nada viaja por la red.

   TUS HORAS DE UN DÍA DE LA SEMANA: «¿Pongo tu entrada de los lunes a las 9:40?» guarda
   `horario.dias[1].inicio`, que manda sobre la entrada de siempre solo al componer ese día
   de la semana (`ritmoHorarioDelDia`, desde ritmoMenu y el resumen): lo que se edita en la
   tarjeta y en «Tu semana» sigue siendo tu horario de siempre. Se olvida en «Tu semana». */

var RITMO_MOTOR_ESPERA = [2500, 6000, 16000];   /* tras el resumen del día (1,5 s, 5 s, 15 s) */

function ritmoPuedeAprender() {
  return typeof window.puedeAprender === 'function' && window.puedeAprender();
}

/* La entrada de un día de la semana que no es la de siempre (la pregunta de la carta). */
function ritmoHorarioDelDia(h, fecha) {
  var dias = h && h.dias && typeof h.dias === 'object' ? h.dias : null;
  if (!dias || !fecha || typeof semanaISO !== 'function') return h;
  var d = dias[semanaISO(fecha).diaSemana];
  if (!d) return h;
  var out = Object.assign({}, h);
  if (typeof d.inicio === 'number') out.inicio = d.inicio;
  if (typeof d.salida === 'number') out.salida = d.salida;
  return out;
}

/* Minutos desde medianoche de un instante, en la hora de aquí. */
function ritmoMotorMinuto(iso) {
  var d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.getHours() * 60 + d.getMinutes();
}

/* La semana para el motor: lo del registro y lo que aún espera en la cola. */
function ritmoMotorEntrada(s, hoy) {
  var r = (s && s.ritmo) || {};
  var ev = [];
  try {
    var snap = window.paceEventsSnapshot && window.paceEventsSnapshot();
    ev = snap && Array.isArray(snap.events) ? snap.events : [];
  } catch (e) { ev = []; }
  var dias = [], feedback = [], focos = [];
  ev.forEach(function (x) {
    if (!x || !x.payload) return;
    if (x.type === 'ritmo.day.closed') dias.push(x.payload);
    if (x.type === 'feedback.answered') feedback.push({ fecha: x.localDay, id: x.payload.routineId, r: x.payload.response });
    if (x.type === 'session.completed' && x.payload.module === 'focus') {
      var hasta = ritmoMotorMinuto(x.occurredAt);
      if (hasta == null) return;
      focos.push({ fecha: x.localDay, desde: Math.max(0, hasta - Math.round((x.payload.elapsedSeconds || 0) / 60)), hasta: hasta });
    }
  });
  /* El día que aún no se ha resumido, y la cola que no ha llegado al registro. */
  var cola = typeof ritmoResumenAntesDePisar === 'function' ? ritmoResumenAntesDePisar(s, r).resumenes : r.resumenes;
  (Array.isArray(cola) ? cola : []).forEach(function (x) { if (x) dias.push(x); });
  var horario = Object.assign(ritmoHorarioInicial(), r.horario || {});
  return { hoy: hoy, dias: dias, feedback: feedback, focos: focos, horario: horario, aprendido: r.aprendido };
}

/* Una vez por semana: lo que dice el motor, a `ritmo.carta`. Con la página oculta, sin
   PACE completo o con el registro aún cerrado, nada (como el resumen del día). */
function ritmoMotorRevisar() {
  try {
    if (document.visibilityState === 'hidden' || !ritmoPuedeAprender()) return;
    if (typeof paceEventsCanWrite !== 'function' || !paceEventsCanWrite()) return;
    var s = getState();
    var hoy = ritmoHoy();
    if (!hoy) return;
    var lunes = motorLunes(hoy);
    var r = (s && s.ritmo) || {};
    if (r.carta && r.carta.lunes === lunes) return;
    var res = ritmoMotor(ritmoMotorEntrada(s, hoy));
    /* Sin carta (menos de tres días) no se escribe nada: quien no usa «A tu ritmo» no ve
       cambiar su estado, y se vuelve a mirar en la próxima revisión. */
    if (!res.carta) return;
    ritmoGuardar(function () { return { carta: { lunes: lunes, res: res, vista: null, respuesta: null, hora: null } }; });
  } catch (e) {}
}

/* La carta que toca enseñar, o null: la de esta semana, sin contestar, con PACE completo. */
function ritmoCartaPendiente(s) {
  if (!ritmoPuedeAprender()) return null;
  var c = s && s.ritmo && s.ritmo.carta;
  var hoy = ritmoHoy();
  if (!c || !c.res || c.vista || !hoy || c.lunes !== motorLunes(hoy)) return null;
  return c;
}

/* Los cambios de la carta, sin la pregunta (esa se contesta aparte). */
function ritmoCartaCambios(c) {
  return ((c && c.res && c.res.cambios) || []).filter(function (x) { return !x.pregunta; });
}
function ritmoCartaPregunta(c) {
  return ((c && c.res && c.res.cambios) || []).filter(function (x) { return x.pregunta; })[0] || null;
}

/* La carta tiene dos respuestas: la de los cambios (`respuesta`: 'vale' | 'dejar'; también
   el «Vale» de la semana sin cambios) y la de la pregunta de tus horas (`hora`). Queda
   vista cuando está contestado lo que lleva. */
function ritmoCartaLleva(c) {
  var pregunta = !!ritmoCartaPregunta(c);
  return { respuesta: ritmoCartaCambios(c).length > 0 || !pregunta, hora: pregunta };
}
function ritmoCartaVistaSi(c, hoy) {
  var lleva = ritmoCartaLleva(c);
  return (!lleva.respuesta || c.respuesta) && (!lleva.hora || c.hora) ? hoy : null;
}

/* «Vale» aplica los cambios a lo aprendido; «Dejarla como estaba» los rechaza: la semana
   sigue igual y no se vuelven a proponer en cuatro semanas. */
function ritmoCartaResponder(vale) {
  ritmoGuardar(function (r) {
    var c = r.carta;
    if (!c || !c.res || c.vista || c.respuesta) return {};
    var hoy = ritmoHoy();
    var cambios = ritmoCartaCambios(c);
    var aprendido = vale
      ? ritmoMotorAplicar(r.aprendido, Object.assign({}, c.res, { cambios: cambios }), hoy)
      : ritmoMotorRechazar(r.aprendido, cambios, hoy);
    var nueva = Object.assign({}, c, { respuesta: vale ? 'vale' : 'dejar' });
    nueva.vista = ritmoCartaVistaSi(nueva, hoy);
    return { aprendido: aprendido, carta: nueva };
  });
}
function ritmoCartaVale() { ritmoCartaResponder(true); }
function ritmoCartaDejar() { ritmoCartaResponder(false); }

/* La pregunta de tus horas: «Sí» cambia la entrada o la salida (de ese día de la semana, o
   la de siempre); «No» no la vuelve a hacer en cuatro semanas. */
function ritmoCartaHora(si) {
  ritmoGuardar(function (r) {
    var c = r.carta;
    var p = ritmoCartaPregunta(c);
    if (!p || c.vista || c.hora) return {};
    var hoy = ritmoHoy();
    var nueva = Object.assign({}, c, { hora: si ? 'si' : 'no' });
    nueva.vista = ritmoCartaVistaSi(nueva, hoy);
    var cambio = { carta: nueva };
    var aprendido = r.aprendido;
    /* Una carta que solo pregunta no tiene «Vale»: lo que te ayudó entra al contestarla. */
    if (!ritmoCartaLleva(c).respuesta) aprendido = ritmoMotorAplicar(aprendido, { cambios: [], ayudo: c.res.ayudo }, hoy);
    cambio.aprendido = si ? aprendido : ritmoMotorRechazar(aprendido, [p], hoy);
    if (si) {
      var h = Object.assign(ritmoHorarioInicial(), r.horario || {});
      if (p.dia) {
        h.dias = Object.assign({}, h.dias || {});
        h.dias[p.dia] = Object.assign({}, h.dias[p.dia] || {});
        h.dias[p.dia][p.campo] = p.hora;
      } else h[p.campo] = p.hora;
      cambio.horario = h;
    }
    return cambio;
  });
  if (si && typeof ritmoSincronizar === 'function') ritmoSincronizar();
}

/* Lo aprendido que sigue valiendo, para «Tu semana» (con su clave para «Olvidar»). */
function ritmoAprendidoLista(s) {
  var r = (s && s.ritmo) || {};
  var hoy = ritmoHoy();
  var l = ritmoMotorLimpio(r.aprendido, hoy);
  var out = [];
  Object.keys(l.descansa).forEach(function (id) { out.push({ clave: 'descansa:' + id, tipo: 'descansa', id: id, hasta: l.descansa[id] }); });
  if (l.menos) out.push({ clave: 'menos:mueve', tipo: 'menos', modulo: 'mueve', hasta: l.menos.hasta });
  l.cortas.forEach(function (c) { out.push({ clave: 'corta:' + c.hora, tipo: 'corta', hora: c.hora, hasta: c.hasta }); });
  if (l.ayuda && l.ayuda.ids.length) out.push({ clave: 'ayuda', tipo: 'ayuda', ids: l.ayuda.ids, hasta: l.ayuda.hasta });
  var dias = r.horario && r.horario.dias && typeof r.horario.dias === 'object' ? r.horario.dias : {};
  Object.keys(dias).sort().forEach(function (d) {
    ['inicio', 'salida'].forEach(function (campo) {
      if (dias[d] && typeof dias[d][campo] === 'number') out.push({ clave: 'dia:' + d + ':' + campo, tipo: 'hora', dia: Number(d), campo: campo, hora: dias[d][campo] });
    });
  });
  return out;
}

/* «Olvidar»: lo aprendido con esa clave deja de valer; la hora de un día vuelve a la de siempre. */
function ritmoAprendidoOlvidar(clave) {
  ritmoGuardar(function (r) {
    var p = String(clave).split(':');
    if (p[0] !== 'dia') return { aprendido: ritmoMotorOlvidar(r.aprendido, clave, ritmoHoy()) };
    var h = Object.assign({}, r.horario || {});
    var dias = Object.assign({}, h.dias || {});
    if (dias[p[1]]) {
      dias[p[1]] = Object.assign({}, dias[p[1]]);
      delete dias[p[1]][p[2]];
      if (!Object.keys(dias[p[1]]).length) delete dias[p[1]];
    }
    h.dias = dias;
    return { horario: h };
  });
  if (typeof ritmoSincronizar === 'function') ritmoSincronizar();
}

RITMO_MOTOR_ESPERA.forEach(function (ms) { setTimeout(ritmoMotorRevisar, ms); });
document.addEventListener('visibilitychange', ritmoMotorRevisar);
setInterval(ritmoMotorRevisar, typeof PACE_DIA_CADA_MS === 'number' ? PACE_DIA_CADA_MS : 60 * 1000);

Object.assign(window, {
  ritmoPuedeAprender, ritmoHorarioDelDia, ritmoMotorEntrada, ritmoMotorRevisar, ritmoCartaPendiente,
  ritmoCartaCambios, ritmoCartaPregunta, ritmoCartaLleva, ritmoCartaVale, ritmoCartaDejar, ritmoCartaHora,
  ritmoAprendidoLista, ritmoAprendidoOlvidar,
});
