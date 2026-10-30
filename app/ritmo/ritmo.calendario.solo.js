/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ritmo.calendario.solo.js — EL CALENDARIO QUE SE MANTIENE SOLO, EN PURO
   ============================================================
   Lo que tiene que haber en el calendario y qué hay que tocar para que lo haya.
   Nada de aquí habla con un calendario: eso es ritmo.calendario.motor.js.

   LA PAUSA ABRE EL EVENTO (Ez, 2A de la propuesta del 14 oct. 2026). Los
   calendarios solo avisan al empezar un evento, así que para que el aviso suene
   al parar el evento empieza en la pausa y lleva detrás el bloque que la sigue:
   «Estira: Cuello · luego foco 2 de 9». Un bloque sin pausa delante (el primero,
   el de después de comer) va solo y sin aviso; el cierre del día va solo y con
   aviso. «Añadir» de una vez y el archivo siguen con la forma de antes, la del
   bloque con su pausa dentro y sin avisos (ritmo.calendario.js).

   CON EL FOCO EN MARCHA AVISA SOLO PACE (Ez, 3A): la pausa que va detrás del
   bloque que corre se escribe sin aviso (`callar`) y lo recupera si el bloque se
   para antes de acabar.

   CADA EVENTO TIENE SU CLAVE: `b<k>` es el que contiene el bloque k, `p<k>` una
   pausa sola detrás del bloque k (una reunión justo después) y `cierre` el
   cierre. Por la clave se cambia el evento que ya está en vez de borrarlo y
   crear otro.

   LO QUE YA PASÓ NO SE REESCRIBE: un evento se toca solo si él o lo que debería
   ser acaba después de ahora. Así un bloque que acabó antes de tiempo corrige su
   final, y lo de esta mañana se queda como fue. Y un evento que ya empezó no
   cambia de aviso: uno nuevo sonaría tarde.

   `var`/`function` a propósito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

function calendarioNombrePlato(p, t, lang) {
  return typeof ritmoNombre === 'function' ? ritmoNombre(p.rutina || p, t, lang) : (p.name || p.id || '');
}

/* El nombre de la pausa al principio del título. */
function calendarioPausaNombre(it, t, lang) {
  if (it.tipo === 'cierre') return t('cal.p.cierre');
  if (it.larga) return t('cal.p.larga');
  var p = (it.platos || [])[0];
  return p ? t('cal.modulo.' + p.modulo) + ': ' + calendarioNombrePlato(p, t, lang) : t('cal.p.pausa');
}

/* El día de `m` (ritmoMenu/ritmoPlan) en la forma «la pausa abre el evento»:
   [{ clave, desde, hasta, titulo, texto, aviso }] en minutos del día, todo el
   día. `callar` es el minuto en el que empieza la pausa que no avisa, o null. */
function calendarioEventosConAviso(m, t, tn, lang, callar) {
  if (!m || !m.items) return [];
  var focos = m.items.filter(function (it) { return it.tipo === 'foco'; });
  var total = focos.length;
  var fuera = [];
  var dentro = {};
  m.items.forEach(function (it, i) {
    if (it.tipo === 'pausa' || it.tipo === 'cierre') {
      var sig = m.items[i + 1];
      var foco = it.tipo === 'pausa' && sig && sig.tipo === 'foco' && sig.desde === it.desde + it.dur ? sig : null;
      var n = foco ? focos.indexOf(foco) + 1 : 0;
      var nombre = calendarioPausaNombre(it, t, lang);
      var lineas = (it.platos || []).map(function (p) {
        return tn('cal.p.texto.plato', { modulo: t('cal.modulo.' + p.modulo), nombre: calendarioNombrePlato(p, t, lang), min: p.min || it.dur });
      });
      if (it.agua) lineas.push(t('cal.texto.agua'));
      if (foco) { dentro[n] = true; lineas.push(tn('cal.p.texto.foco', { min: foco.dur })); }
      /* Lo que se mueva aquí vuelve a su sitio en la vuelta siguiente: manda el plan de PACE, y
         la pausa lo dice donde la persona la mueve (Ez, 12A del 30 oct.). */
      lineas.push(t('cal.p.texto.cambiar'));
      lineas.push('', CALENDARIO_PIE);
      var antes = focos.filter(function (f) { return f.desde < it.desde; }).length;
      fuera.push({
        clave: foco ? 'b' + n : it.tipo === 'cierre' ? 'cierre' : 'p' + antes,
        desde: it.desde, hasta: foco ? foco.desde + foco.dur : it.desde + it.dur,
        titulo: foco ? tn('cal.p.titulo', { pausa: nombre, n: n, total: total }) : nombre,
        texto: lineas.join('\n'), aviso: callar == null || it.desde !== callar,
      });
      return;
    }
    if (it.tipo !== 'foco') return;
    var k = focos.indexOf(it) + 1;
    if (dentro[k]) return;
    fuera.push({ clave: 'b' + k, desde: it.desde, hasta: it.desde + it.dur, titulo: tn('cal.titulo', { n: k, total: total }),
                 texto: [tn('cal.texto.foco', { min: it.dur }), '', CALENDARIO_PIE].join('\n'), aviso: false });
  });
  return fuera;
}

/* LO QUE TIENE QUE HABER HOY: { fecha, eventos } con `inicio`/`fin` en ms, o null
   cuando no hay nada que decir. Por libre, el día está vacío (se quita lo que
   quedaba). Sin día elegido (eligiéndolo, tras «Cambiar»), null: no se borra nada
   mientras se elige. `textos` = { t, tn, lang }. */
function calendarioDeseados(s, textos) {
  if (typeof ritmoDe !== 'function') return null;
  var R = ritmoDe(s);
  var hoy = ritmoHoy();
  if (!hoy) return null;
  if (R.libre) return { fecha: hoy, eventos: [] };
  if (!R.dia) return null;
  var plan = ritmoPlan(s);
  if (!plan) return null;
  var corre = plan.actual && typeof ritmoFocoCorriendo === 'function' && ritmoFocoCorriendo();
  var callar = corre ? plan.actual.desde + plan.actual.dur : null;
  var evs = calendarioEventosConAviso(plan.m, textos.t, textos.tn, textos.lang, callar).map(function (e) {
    return Object.assign({}, e, { inicio: calendarioInstante(hoy, e.desde).getTime(), fin: calendarioInstante(hoy, e.hasta).getTime() });
  });
  return { fecha: hoy, eventos: evs };
}

function calendarioTextoLimpio(s) {
  return String(s == null ? '' : s).replace(/\r\n/g, '\n').trim();
}

/* ¿Dicen lo mismo? El aviso solo cuenta mientras el evento no ha empezado. */
function calendarioIgual(a, b, ahoraMs) {
  if (a.inicio !== b.inicio || a.fin !== b.fin) return false;
  if (String(a.titulo || '') !== String(b.titulo || '')) return false;
  if (calendarioTextoLimpio(a.texto) !== calendarioTextoLimpio(b.texto)) return false;
  return a.inicio <= ahoraMs || !!a.aviso === !!b.aviso;
}

/* QUÉ TOCAR. `existentes` son los eventos de PACE de hoy que hay en el
   calendario: [{ id, clave, inicio, fin, titulo, texto, aviso }]; uno sin clave
   (los de «Añadir» de una vez, o de otro móvil) o repetido se quita si no ha
   acabado. Devuelve { crear: [ev], cambiar: [{ id, ev }], borrar: [id] }. */
function calendarioCambios(deseados, existentes, ahoraMs) {
  var fuera = { crear: [], cambiar: [], borrar: [] };
  var porClave = {};
  (existentes || []).forEach(function (e) {
    if (e.clave && !porClave[e.clave]) porClave[e.clave] = e;
    else if (e.fin > ahoraMs) fuera.borrar.push(e.id);
  });
  var vistos = {};
  (deseados || []).forEach(function (d) {
    vistos[d.clave] = true;
    var e = porClave[d.clave];
    if (!e) {
      if (d.fin > ahoraMs) fuera.crear.push(d.inicio > ahoraMs ? d : Object.assign({}, d, { aviso: false }));
      return;
    }
    if (calendarioIgual(d, e, ahoraMs)) return;
    if (d.fin > ahoraMs || e.fin > ahoraMs) {
      fuera.cambiar.push({ id: e.id, ev: d.inicio > ahoraMs ? d : Object.assign({}, d, { aviso: !!e.aviso }) });
    }
  });
  Object.keys(porClave).forEach(function (k) {
    if (!vistos[k] && porClave[k].fin > ahoraMs) fuera.borrar.push(porClave[k].id);
  });
  return fuera;
}

function calendarioSinCambios(c) {
  return !c.crear.length && !c.cambiar.length && !c.borrar.length;
}

/* ¿Va el calendario por detrás? Lo mismo de arriba contra LO ÚLTIMO QUE SE
   ESCRIBIÓ en este dispositivo ({ fecha, destino, eventos: { clave: ev } }), sin
   preguntar al calendario. Que pase el tiempo no lo pone pendiente. */
function calendarioPendiente(deseados, escrito, destino, ahoraMs) {
  if (!deseados) return false;
  var mio = escrito && escrito.fecha === deseados.fecha && escrito.destino === destino ? escrito.eventos || {} : {};
  var existentes = Object.keys(mio).map(function (k) { return Object.assign({ clave: k }, mio[k]); });
  return !calendarioSinCambios(calendarioCambios(deseados.eventos, existentes, ahoraMs));
}

/* Lo que queda en el calendario después de aplicar `cambios`, por clave: lo que
   había, lo cambiado y lo creado (`creados` = { clave: id }), sin lo borrado. */
function calendarioTrasCambios(existentes, cambios, creados) {
  var fuera = {};
  var fuerza = {};
  (cambios.borrar || []).forEach(function (id) { fuerza[id] = true; });
  (existentes || []).forEach(function (e) {
    if (!e.clave || fuerza[e.id] || fuera[e.clave]) return;
    fuera[e.clave] = { id: e.id, inicio: e.inicio, fin: e.fin, titulo: e.titulo, texto: e.texto, aviso: !!e.aviso };
  });
  (cambios.cambiar || []).forEach(function (c) {
    var ev = c.ev;
    fuera[ev.clave] = { id: c.id, inicio: ev.inicio, fin: ev.fin, titulo: ev.titulo, texto: ev.texto, aviso: !!ev.aviso };
  });
  (cambios.crear || []).forEach(function (ev) {
    var id = creados && creados[ev.clave];
    if (id) fuera[ev.clave] = { id: id, inicio: ev.inicio, fin: ev.fin, titulo: ev.titulo, texto: ev.texto, aviso: !!ev.aviso };
  });
  return fuera;
}

Object.assign(window, {
  calendarioEventosConAviso, calendarioDeseados, calendarioIgual, calendarioCambios, calendarioSinCambios, calendarioPendiente,
  calendarioTrasCambios,
});
