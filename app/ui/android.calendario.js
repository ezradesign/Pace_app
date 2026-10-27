/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   android.calendario.js — EL CALENDARIO DEL MOVIL
   ============================================================
   «A tu ritmo» lleva el dia al calendario del telefono (complemento
   CapacitorCalendar), que ya esta sincronizado con la cuenta de Google o de
   Microsoft que tenga la persona, y lee sus reuniones. Aqui solo van las
   llamadas, cada una reducida a lo que PACE usa; que eventos se crean, se
   cambian y se borran lo deciden ritmo.calendario.destinos.js y el motor del
   calendario que se mantiene solo. Pide los dos permisos (leer y escribir) la
   primera vez que se pulsa, nunca al arrancar.

   LOS ERRORES LLEGAN. Leer, crear, cambiar, borrar y marcar privado van por
   `paceAndroidPedir`, que rechaza si Android falla. Con `paceAndroidLlamar`,
   que da null, una lista que fallaba se leia como un calendario vacio: PACE
   volvia a crear lo que ya estaba, y en el movil nunca salia «No se pudo». Ahora
   el motor lo cuenta como un fallo, lo dice y lo reintenta, como en la web. Los
   permisos y la lista de calendarios siguen sin romper: sin respuesta, no hay.

   PRIVADO. El complemento no sabe poner `ACCESS_LEVEL`, asi que lo pone una
   pieza propia, PaceCalendario (android/app/src/main/java/.../PaceCalendario.java),
   despues de crear y de cambiar, como Google (`visibility`), Outlook
   (`sensitivity`) y el archivo (`CLASS`). Quien solo puede ver tu calendario no
   lee que pausa es. `privacy.html` lo promete y verify.privacidad.js lo cruza.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

function paceAndroidCalendario() {
  return !!paceAndroidPlugin('CapacitorCalendar');
}

/* true si PACE puede leer y escribir en el calendario. Pregunta si hace falta. */
function paceAndroidCalendarioPermiso() {
  return paceAndroidLlamar('CapacitorCalendar', 'requestFullCalendarAccess').then(function (r) {
    return !!(r && r.result === 'granted');
  });
}

/* Lo mismo, sin preguntar: para volver a leer las reuniones al volver a la app. */
function paceAndroidCalendarioTienePermiso() {
  return paceAndroidLlamar('CapacitorCalendar', 'checkAllPermissions').then(function (r) {
    var p = (r && r.result) || {};
    return p.readCalendar === 'granted' && p.writeCalendar === 'granted';
  });
}

/* Los calendarios donde se puede escribir: [{ id, titulo, cuenta }], el
   predeterminado primero. */
function paceAndroidCalendarios() {
  return Promise.all([
    paceAndroidLlamar('CapacitorCalendar', 'listCalendars'),
    paceAndroidLlamar('CapacitorCalendar', 'getDefaultCalendar'),
  ]).then(function (rs) {
    var lista = (rs[0] && rs[0].result) || [];
    var pre = rs[1] && rs[1].result ? String(rs[1].result.id) : null;
    return lista.filter(function (c) { return c && c.allowsContentModifications !== false && c.visible !== false; })
      .map(function (c) { return { id: String(c.id), titulo: c.title || c.internalTitle || '', cuenta: c.accountName || c.ownerAccount || '' }; })
      .sort(function (a, b) { return (b.id === pre) - (a.id === pre); });
  });
}

/* Los eventos entre dos instantes (ms):
   [{ id, calendario, inicio, fin, todoElDia, libre, cancelado }]. El complemento los
   da enteros; de aquí solo salen las horas y lo que decide si ocupan. El título, el
   texto y el aviso, solo de los que `propio(e)` reconoce como de PACE, que el
   calendario que se mantiene solo compara con lo que escribiría: de una reunión,
   PACE no se queda ni con el título ni con quién va. Si Android no da la lista, la
   promesa se rechaza: un calendario que no se pudo leer no es un calendario vacío. */
function paceAndroidCalendarioEventos(desde, hasta, propio) {
  return paceAndroidPedir('CapacitorCalendar', 'listEventsInRange', { from: desde, to: hasta }).then(function (r) {
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

/* EL AVISO es una alarma al empezar (`alerts: [0]`): el complemento lee los
   minutos con signo (negativo = antes) y Google no acepta alarmas después de
   empezar al sincronizar, así que nunca un número positivo. Sin `ev.aviso`
   (los de «Añadir» de una vez), sin alarmas. */
function paceAndroidCalendarioAlarmas(ev) {
  return ev.aviso ? [0] : [];
}

/* LIBRE (`EventAvailability.FREE`, 1; 0 es ocupado), al crear y al cambiar:
   los compañeros solo te ven ocupado en tus reuniones (Ez, 18 oct. 2026). */
var PACE_ANDROID_LIBRE = 1;

/* Crea un evento libre. Devuelve su id; sin id, PACE no podría reconocerlo y lo volvería a
   crear, así que eso también es un fallo. */
function paceAndroidCalendarioCrear(calendario, ev) {
  var o = { title: ev.titulo, description: ev.texto, startDate: ev.inicio, endDate: ev.fin, availability: PACE_ANDROID_LIBRE, alerts: paceAndroidCalendarioAlarmas(ev) };
  if (calendario) o.calendarId = String(calendario);
  return paceAndroidPedir('CapacitorCalendar', 'createEvent', o).then(function (r) {
    if (!r || r.id == null) throw new Error('red');
    return String(r.id);
  });
}

/* Cambia un evento que ya está. Solo con un id que acaba de salir en la lista:
   sobre uno que no existe, el complemento no falla y deja alarmas sueltas. */
function paceAndroidCalendarioCambiar(id, ev) {
  return paceAndroidPedir('CapacitorCalendar', 'modifyEvent', { id: String(id), title: ev.titulo, description: ev.texto,
    startDate: ev.inicio, endDate: ev.fin, availability: PACE_ANDROID_LIBRE, alerts: paceAndroidCalendarioAlarmas(ev) });
}

function paceAndroidCalendarioBorrar(id) {
  return paceAndroidPedir('CapacitorCalendar', 'deleteEvent', { id: String(id) });
}

/* PRIVADO (`Events.ACCESS_PRIVATE`), al crear y al cambiar: quien solo puede ver tu
   calendario te ve libre y no lee qué pausa es (Ez, 1A del 26 oct. 2026). Va después de
   apuntar el evento como de PACE (ritmo.calendario.destinos.js), para que un fallo aquí no
   deje un evento suelto que PACE ya no reconozca. */
function paceAndroidCalendarioPrivado(id) {
  return paceAndroidPedir('PaceCalendario', 'privado', { id: String(id) });
}

Object.assign(window, {
  paceAndroidCalendario, paceAndroidCalendarioPermiso, paceAndroidCalendarioTienePermiso, paceAndroidCalendarios, paceAndroidCalendarioEventos,
  paceAndroidCalendarioCrear, paceAndroidCalendarioCambiar, paceAndroidCalendarioBorrar, paceAndroidCalendarioPrivado,
});
