/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   nativo.calendario.js — EL CALENDARIO DEL MÓVIL, EN LOS DOS MÓVILES
   ============================================================
   La capa común, como nativo.js, para el calendario del teléfono: en Android pregunta a
   android.calendario.js y en el iPhone a ios.calendario.js (Ez, 4A del 16 nov. 2026). Los
   dos hablan con el mismo complemento, CapacitorCalendar, y dan lo mismo, así que «A tu
   ritmo» (ritmo.calendario.destinos.js, el motor y la hoja) solo llama a `paceMovil*` y no
   sabe en qué teléfono está.

   EL DESTINO SIGUE LLAMÁNDOSE 'android' en los datos (`ritmo.calendario.destino`,
   `pace.calendario.android` y su marca de instalación): renombrarlo dejaría sin conexión a
   quien ya la tiene. Quiere decir «el calendario del móvil»; en el iPhone, la hoja lo llama
   «Calendario del iPhone» (`calendarioNombreDestino`).

   En la web, en el standalone y en las pruebas sin Capacitor no hay calendario del móvil:
   `paceMovilCalendario()` es false y lo demás contesta lo que contestaría Android sin él.

   `var`/`function` a propósito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

function paceMovilIos() {
  return typeof pacePlataformaNativa === 'function' && pacePlataformaNativa() === 'ios';
}

function paceMovilCalendario() {
  var p = typeof pacePlataformaNativa === 'function' ? pacePlataformaNativa() : null;
  if (p === 'android') return paceAndroidCalendario();
  if (p === 'ios') return paceIosCalendario();
  return false;
}

function paceMovilCalendarioPermiso() { return paceMovilIos() ? paceIosCalendarioPermiso() : paceAndroidCalendarioPermiso(); }
function paceMovilCalendarioTienePermiso() { return paceMovilIos() ? paceIosCalendarioTienePermiso() : paceAndroidCalendarioTienePermiso(); }
function paceMovilCalendarios() { return paceMovilIos() ? paceIosCalendarios() : paceAndroidCalendarios(); }

/* Solo la llama `calendarioAndroidEventos` (ritmo.calendario.destinos.js), que antes mira si la
   lista de eventos de PACE es de este móvil: lo cuenta verify.android.js. */
function paceMovilCalendarioEventos(desde, hasta, propio) {
  return paceMovilIos() ? paceIosCalendarioEventos(desde, hasta, propio) : paceAndroidCalendarioEventos(desde, hasta, propio);
}

function paceMovilCalendarioCrear(calendario, ev) { return paceMovilIos() ? paceIosCalendarioCrear(calendario, ev) : paceAndroidCalendarioCrear(calendario, ev); }
function paceMovilCalendarioCambiar(id, ev) { return paceMovilIos() ? paceIosCalendarioCambiar(id, ev) : paceAndroidCalendarioCambiar(id, ev); }
function paceMovilCalendarioBorrar(id) { return paceMovilIos() ? paceIosCalendarioBorrar(id) : paceAndroidCalendarioBorrar(id); }

/* Privado: en Android lo pone PaceCalendario.java; en el iPhone EventKit no sabe, y la pieza
   propia contesta que no (privacy.html lo dice). */
function paceMovilCalendarioPrivado(id) { return paceMovilIos() ? paceIosCalendarioPrivado(id) : paceAndroidCalendarioPrivado(id); }

/* La marca de este móvil (ms) o null: la hora de instalación en Android, la del llavero en el iPhone. */
function paceMovilInstalado() { return paceMovilIos() ? paceIosInstalado() : paceAndroidInstalado(); }

Object.assign(window, {
  paceMovilCalendario, paceMovilCalendarioPermiso, paceMovilCalendarioTienePermiso, paceMovilCalendarios, paceMovilCalendarioEventos,
  paceMovilCalendarioCrear, paceMovilCalendarioCambiar, paceMovilCalendarioBorrar, paceMovilCalendarioPrivado, paceMovilInstalado,
});
