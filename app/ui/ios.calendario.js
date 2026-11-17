/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ios.calendario.js — EL CALENDARIO DEL IPHONE
   ============================================================
   «A tu ritmo» lleva el día al calendario del iPhone con el mismo complemento que en
   Android (CapacitorCalendar, de @ebarooni/capacitor-calendar), que aquí habla con
   EventKit: Calendario ya junta las cuentas de iCloud, Google y Outlook de la persona.
   Ez eligió el permiso completo, como en Android (4A del 16 nov. 2026): con el de solo
   añadir de iOS 17, PACE no puede leer, cambiar ni borrar ni lo que él mismo puso, así
   que ni esquivaría reuniones ni mantendría el día. Se pide la primera vez que se pulsa
   «Conectar», nunca al arrancar; en iOS 16 el complemento pide el permiso de antes.

   Las llamadas son las de android.calendario.js, reducidas a lo que PACE usa, con las
   mismas reglas: lo que hay que saber si salió va por `paceIosPedir`, que rechaza, y de
   una reunión solo salen las horas. Dos diferencias:

   - PRIVADO: EventKit no tiene cómo marcar un evento como privado. La pieza propia
     (ios/App/App/PaceCalendario.swift) contesta que no, y privacy.html lo dice.
   - LA MARCA DE ESTE IPHONE (`instalado`): la da la pieza propia desde el llavero, «solo
     este dispositivo»; un iPhone restaurado desde una copia no la trae y la lista de
     eventos de PACE se olvida (la regla D-8 de Android).

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

function paceIosCalendario() {
  return !!paceIosPlugin('CapacitorCalendar');
}

/* true si PACE puede leer y escribir en el calendario. Pregunta si hace falta (una vez: si se
   dice que no, solo se cambia en los Ajustes del iPhone). */
function paceIosCalendarioPermiso() {
  return paceIosLlamar('CapacitorCalendar', 'requestFullCalendarAccess').then(function (r) {
    return !!(r && r.result === 'granted');
  });
}

/* Lo mismo, sin preguntar. Con el permiso de solo añadir, leer sale 'prompt': no basta. */
function paceIosCalendarioTienePermiso() {
  return paceIosLlamar('CapacitorCalendar', 'checkAllPermissions').then(function (r) {
    var p = (r && r.result) || {};
    return p.readCalendar === 'granted' && p.writeCalendar === 'granted';
  });
}

/* Los calendarios donde se puede escribir, el predeterminado primero. EventKit no da la
   cuenta: solo el nombre. */
function paceIosCalendarios() {
  return Promise.all([
    paceIosLlamar('CapacitorCalendar', 'listCalendars'),
    paceIosLlamar('CapacitorCalendar', 'getDefaultCalendar'),
  ]).then(function (rs) {
    var lista = (rs[0] && rs[0].result) || [];
    var pre = rs[1] && rs[1].result ? String(rs[1].result.id) : null;
    return lista.filter(function (c) { return c && c.allowsContentModifications !== false && !c.isSubscribed; })
      .map(function (c) { return { id: String(c.id), titulo: c.title || '', cuenta: '' }; })
      .sort(function (a, b) { return (b.id === pre) - (a.id === pre); });
  });
}

/* Los eventos entre dos instantes (ms), como paceAndroidCalendarioEventos: de una reunión,
   solo las horas y lo que decide si ocupa; el título, el texto y el aviso, solo de lo que
   `propio(e)` reconoce como de PACE. Un calendario que no se pudo leer no es uno vacío. */
function paceIosCalendarioEventos(desde, hasta, propio) {
  return paceIosPedir('CapacitorCalendar', 'listEventsInRange', { from: desde, to: hasta }).then(function (r) {
    if (!r || !Array.isArray(r.result)) throw new Error('red');
    return r.result.map(function (e) {
      var ev = { id: String(e.id), calendario: e.calendarId != null ? String(e.calendarId) : null, inicio: e.startDate, fin: e.endDate,
                 todoElDia: !!e.isAllDay, libre: e.availability === 1, cancelado: e.status === 'canceled' };
      if (typeof propio === 'function' && propio(ev)) {
        ev.titulo = e.title || ''; ev.texto = e.description || ''; ev.aviso = (e.alerts || []).length > 0;
      }
      return ev;
    });
  });
}

/* LIBRE (`EKEventAvailability.free`, 1, el mismo número que en Android) y el aviso al empezar
   (`alerts: [0]`, minutos desde el inicio), al crear y al cambiar. */
var PACE_IOS_LIBRE = 1;

function paceIosCalendarioCrear(calendario, ev) {
  var o = { title: ev.titulo, description: ev.texto, startDate: ev.inicio, endDate: ev.fin, availability: PACE_IOS_LIBRE, alerts: ev.aviso ? [0] : [] };
  if (calendario) o.calendarId = String(calendario);
  return paceIosPedir('CapacitorCalendar', 'createEvent', o).then(function (r) {
    if (!r || r.id == null) throw new Error('red');
    return String(r.id);
  });
}

function paceIosCalendarioCambiar(id, ev) {
  return paceIosPedir('CapacitorCalendar', 'modifyEvent', { id: String(id), title: ev.titulo, description: ev.texto,
    startDate: ev.inicio, endDate: ev.fin, availability: PACE_IOS_LIBRE, alerts: ev.aviso ? [0] : [] });
}

function paceIosCalendarioBorrar(id) {
  return paceIosPedir('CapacitorCalendar', 'deleteEvent', { id: String(id) });
}

/* EventKit no sabe de privado: la pieza propia contesta que no y no se toca nada. */
function paceIosCalendarioPrivado(id) {
  return paceIosPedir('PaceCalendario', 'privado', { id: String(id) });
}

/* La marca de este iPhone (ms), o null si no la hay. Cambia en un iPhone restaurado desde una
   copia; no al actualizar. Con ella se sabe si la lista de eventos de PACE es de aquí. */
function paceIosInstalado() {
  return paceIosPedir('PaceCalendario', 'instalado').then(function (r) {
    return r && typeof r.instalado === 'number' && isFinite(r.instalado) && r.instalado > 0 ? r.instalado : null;
  }, function () { return null; });
}

Object.assign(window, {
  paceIosCalendario, paceIosCalendarioPermiso, paceIosCalendarioTienePermiso, paceIosCalendarios, paceIosCalendarioEventos,
  paceIosCalendarioCrear, paceIosCalendarioCambiar, paceIosCalendarioBorrar, paceIosCalendarioPrivado, paceIosInstalado,
});
