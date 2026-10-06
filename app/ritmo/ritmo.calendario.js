/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ritmo.calendario.js — EL DÍA, EN FORMA DE CALENDARIO
   ============================================================
   Lo puro de llevar «A tu ritmo» a un calendario: qué eventos salen del día,
   el archivo .ics que los lleva y, de vuelta, las reuniones que se leen del
   calendario convertidas en tramos de minutos. Lo que habla con Android, con
   Google o con Microsoft vive en ritmo.calendario.destinos.js y
   ritmo.calendario.web.js; aquí nada toca la red ni el estado.

   UN EVENTO POR BLOQUE DE FOCO, CON SU PAUSA DENTRO (decisión de Ez, opción 2
   de la maqueta): el evento va del inicio del bloque al final de la pausa que
   lo sigue, y el título dice qué pausa toca. Con una pausa de 5 min por evento
   el calendario se llenaba de rayitas sin texto (17 eventos al día); así son 9
   y el hueco queda bloqueado igual. La comida y las reuniones no se llevan: ya
   son tuyas.

   SOLO LO QUE QUEDA: un evento que ya acabó a la hora `ahora` no se lleva. Al
   volver a pulsar, los destinos borran los eventos de PACE de hoy que aún no
   han acabado y ponen estos: nunca se duplica y nunca se toca uno tuyo. La
   MARCA en la descripción es cómo se reconocen en el calendario del móvil, que
   no guarda campos propios.

   SIN ALARMAS: avisa PACE, como siempre, para que no suenen dos cosas.

   `var`/`function` a propósito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var CALENDARIO_MARCA = 'paceweb.pages.dev';
var CALENDARIO_PIE = 'PACE · A tu ritmo · paceweb.pages.dev';

/* La medianoche local de `iso` más `min` minutos. Con el constructor de partes
   y no con `new Date('YYYY-MM-DD')`, que es medianoche UTC; y así un día con
   cambio de hora sigue cayendo en su hora de reloj. */
function calendarioInstante(iso, min) {
  var p = String(iso || '').split('-').map(Number);
  if (p.length !== 3 || p.some(function (x) { return !isFinite(x); })) return null;
  return new Date(p[0], p[1] - 1, p[2], 0, Math.round(min || 0), 0, 0);
}

/* El nombre corto de lo que hay en la pausa, para el título. */
function calendarioPausaCorta(it, t, lang) {
  if (!it) return '';
  if (it.tipo === 'cierre') return t('cal.luego.cierre');
  if (it.larga) return t('cal.luego.larga');
  var p = (it.platos || [])[0];
  if (!p) return '';
  var nombre = typeof ritmoNombre === 'function' ? ritmoNombre(p.rutina || p, t, lang) : (p.name || p.id || '');
  return t('cal.modulo.' + p.modulo) + ': ' + nombre;
}

/* ritmo -> [{ clave, n, total, desde, hasta, titulo, texto }] en minutos del día.
   `m` es el día de ritmoMenu/ritmoPlan (`plan.m`). */
function calendarioEventos(m, ahora, t, tn, lang) {
  if (!m || !m.items) return [];
  var focos = m.items.filter(function (it) { return it.tipo === 'foco'; });
  var total = focos.length;
  var fuera = [];
  m.items.forEach(function (it, i) {
    if (it.tipo !== 'foco') return;
    var tras = m.items[i + 1];
    var conPausa = tras && (tras.tipo === 'pausa' || tras.tipo === 'cierre') && tras.desde === it.desde + it.dur ? tras : null;
    var hasta = conPausa ? conPausa.desde + conPausa.dur : it.desde + it.dur;
    if (ahora != null && hasta <= ahora) return;
    var n = focos.indexOf(it) + 1;
    var corta = calendarioPausaCorta(conPausa, t, lang);
    var titulo = tn('cal.titulo', { n: n, total: total }) + (corta ? ' · ' + tn('cal.luego', { pausa: corta }) : '');
    var lineas = [tn('cal.texto.foco', { min: it.dur })];
    if (conPausa) {
      (conPausa.platos || []).forEach(function (p) {
        var nombre = typeof ritmoNombre === 'function' ? ritmoNombre(p.rutina || p, t, lang) : (p.name || p.id || '');
        lineas.push(tn('cal.texto.pausa', { modulo: t('cal.modulo.' + p.modulo), nombre: nombre, min: p.min || conPausa.dur }));
      });
      if (conPausa.agua) lineas.push(t('cal.texto.agua'));
    }
    lineas.push('', CALENDARIO_PIE);
    fuera.push({ clave: 'foco-' + n, n: n, total: total, desde: it.desde, hasta: hasta, titulo: titulo, texto: lineas.join('\n') });
  });
  return fuera;
}

/* --- El archivo .ics (RFC 5545) ---------------------------------------- */

function calendarioSelloUtc(d) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function calendarioEscapa(s) {
  return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/* Las líneas de más de 75 octetos se parten con CRLF + espacio, sin cortar un
   carácter de UTF-8 por la mitad. */
function calendarioPliega(linea) {
  var fuera = [], actual = '', bytes = 0;
  for (var i = 0; i < linea.length; i++) {
    var c = linea[i];
    var code = linea.charCodeAt(i);
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < linea.length) { c += linea[++i]; }
    var b = c.length > 1 ? 4 : code < 0x80 ? 1 : code < 0x800 ? 2 : 3;
    if (bytes + b > (fuera.length ? 74 : 75)) { fuera.push(actual); actual = ''; bytes = 0; }
    actual += c; bytes += b;
  }
  fuera.push(actual);
  return fuera.join('\r\n ');
}

function calendarioIcs(eventos, iso, ahoraMs) {
  var sello = calendarioSelloUtc(new Date(ahoraMs || Date.now()));
  var dia = String(iso || '').replace(/-/g, '');
  var l = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PACE//A tu ritmo//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  (eventos || []).forEach(function (e) {
    var a = calendarioInstante(iso, e.desde), b = calendarioInstante(iso, e.hasta);
    if (!a || !b) return;
    l.push('BEGIN:VEVENT', 'UID:pace-' + dia + '-' + e.clave + '@' + CALENDARIO_MARCA, 'DTSTAMP:' + sello,
      'DTSTART:' + calendarioSelloUtc(a), 'DTEND:' + calendarioSelloUtc(b),
      'SUMMARY:' + calendarioEscapa(e.titulo), 'DESCRIPTION:' + calendarioEscapa(e.texto),
      'TRANSP:OPAQUE', 'END:VEVENT');
  });
  l.push('END:VCALENDAR');
  return l.map(calendarioPliega).join('\r\n') + '\r\n';
}

/* --- De vuelta: las reuniones como tramos ------------------------------ */

/* [{ inicio, fin }] en ms (lo que dan los tres calendarios, ya filtrado) ->
   [[desde, dur]] en minutos del día `iso`, recortado a ese día. Sin títulos:
   PACE solo guarda a qué horas estás ocupado (decisión 3 de la maqueta). */
function calendarioTramos(lista, iso) {
  var cero = calendarioInstante(iso, 0);
  if (!cero) return [];
  var base = cero.getTime();
  var fuera = [];
  (lista || []).forEach(function (e) {
    if (!e || !isFinite(e.inicio) || !isFinite(e.fin) || e.fin <= e.inicio) return;
    /* En minutos de reloj, no de 60 000 ms: el día de un cambio de hora dura
       23 o 25 h y el tramo tiene que caer en la hora que marca la pantalla. */
    var a = new Date(Math.max(e.inicio, base)), b = new Date(e.fin);
    var mismoDia = function (d) { return d.getFullYear() === cero.getFullYear() && d.getMonth() === cero.getMonth() && d.getDate() === cero.getDate(); };
    if (!mismoDia(a)) return;
    var desde = a.getHours() * 60 + a.getMinutes();
    var hasta = mismoDia(b) ? b.getHours() * 60 + b.getMinutes() : 24 * 60;
    if (hasta > desde) fuera.push([desde, hasta - desde]);
  });
  fuera.sort(function (x, y) { return x[0] - y[0]; });
  return fuera;
}

/* ¿Este evento lo puso PACE? Por la marca de la descripción (Android) o por la
   propiedad privada que guardan Google y Microsoft (la miran sus destinos). */
function calendarioEsDePace(texto) {
  return String(texto || '').indexOf(CALENDARIO_MARCA) !== -1 && String(texto || '').indexOf('PACE') !== -1;
}

Object.assign(window, {
  CALENDARIO_MARCA, calendarioInstante, calendarioEventos, calendarioIcs, calendarioPliega, calendarioTramos, calendarioEsDePace,
});
