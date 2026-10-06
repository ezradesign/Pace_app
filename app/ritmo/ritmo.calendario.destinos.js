/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ritmo.calendario.destinos.js — LLEVAR EL DÍA Y TRAER LAS REUNIONES
   ============================================================
   Cuatro destinos, el mismo orden de pasos:

     1. ACCESO. En Android, el permiso del calendario del móvil; en la web, el
        pase de Google o de Microsoft (ritmo.calendario.web.js). Va PRIMERO y sin
        esperar a nada, porque la ventana del permiso tiene que abrirse dentro
        del clic.
     2. LAS REUNIONES DE HOY, si la persona lo deja marcado: se leen, se guardan
        como tramos (`ritmo.ocupado`, solo horas) y la regla recompone el día a
        su alrededor.
     3. EL DÍA, ya recompuesto: se borran los eventos de PACE de hoy que aún no
        han acabado y se crean los de ahora (calendarioEventos). Nunca se toca un
        evento que no sea de PACE.

   «Otro calendario» (`archivo`) es el .ics: se descarga en la web y sale por
   el menú de compartir en Android. No lee reuniones.

   AL VOLVER A LA APP, si el último destino fue uno conectado y el acceso sigue
   vivo (el permiso de Android, o el pase de la web dentro de su hora), las
   reuniones se vuelven a leer sin preguntar nada, como mucho cada 5 minutos.
   Solo se lee: los eventos se reescriben cuando la persona pulsa otra vez.

   `var`/`function` a propósito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var CALENDARIO_DESTINOS = ['android', 'google', 'microsoft', 'archivo'];
var _calendarioRefresco = { ultimo: 0, enCurso: false };

function calendarioDestinos() {
  var android = typeof paceAndroidCalendario === 'function' && paceAndroidCalendario();
  return CALENDARIO_DESTINOS.filter(function (d) {
    if (d === 'android') return android;
    if (d === 'archivo') return true;
    return !android && typeof calendarioWebDisponible === 'function' && calendarioWebDisponible(d);
  });
}

function calendarioConectado(d) { return d === 'android' || d === 'google' || d === 'microsoft'; }

/* Los dos extremos de HOY en ms (medianoche local a medianoche local). */
function calendarioDiaMs(iso) {
  return [calendarioInstante(iso, 0).getTime(), calendarioInstante(iso, 24 * 60).getTime()];
}

function calendarioGuardarAjustes(cambio) {
  if (typeof ritmoGuardar !== 'function') return;
  ritmoGuardar(function (r) { return { calendario: Object.assign({}, r.calendario || {}, cambio) }; });
}

/* Guarda las reuniones de hoy. Si no han cambiado no escribe: cada escritura
   repinta la app. Devuelve si cambiaron. */
function calendarioGuardarOcupado(tramos, fuente) {
  var hoy = ritmoHoy();
  var antes = ritmoDe(getState());
  if (JSON.stringify(antes.ocupado) === JSON.stringify(tramos) && (getState().ritmo || {}).ocupado) return false;
  ritmoGuardar(function () { return { ocupado: { fecha: hoy, tramos: tramos, fuente: fuente } }; });
  return true;
}

/* Paso 1. Síncrono hasta pedir el permiso. Resuelve con el pase (web) o null. */
function calendarioAcceso(destino) {
  if (destino === 'android') {
    return paceAndroidCalendarioPermiso().then(function (ok) { if (!ok) throw new Error('permiso'); return null; });
  }
  var pase = calendarioPaseGuardado(destino);
  return pase ? Promise.resolve(pase) : calendarioPedirPase(destino);
}

/* Las reuniones de hoy, ya filtradas: [{ inicio, fin }] en ms. */
function calendarioLeer(destino, pase, iso) {
  var d = calendarioDiaMs(iso);
  if (destino === 'android') {
    return paceAndroidCalendarioEventos(d[0], d[1]).then(function (lista) {
      return lista.filter(function (e) { return !e.todoElDia && !e.libre && !e.cancelado && !calendarioEsDePace(e.texto); });
    });
  }
  return calendarioWebReuniones(destino, pase, d[0], d[1]);
}

/* Paso 3 en Android: borra lo de PACE que queda de hoy y crea lo nuevo. */
function calendarioEscribirAndroid(eventos, iso, ahoraMs, calendarioId) {
  var d = calendarioDiaMs(iso);
  return paceAndroidCalendarioEventos(Math.max(d[0], ahoraMs), d[1]).then(function (lista) {
    var viejos = lista.filter(function (e) { return calendarioEsDePace(e.texto) && e.fin > ahoraMs; });
    return viejos.reduce(function (p, e) { return p.then(function () { return paceAndroidCalendarioBorrar(e.id); }); }, Promise.resolve());
  }).then(function () {
    return eventos.reduce(function (p, ev) {
      return p.then(function () { return paceAndroidCalendarioCrear(calendarioId, ev); });
    }, Promise.resolve());
  });
}

function calendarioEscribirWeb(destino, pase, eventos, iso, ahoraMs) {
  return calendarioWebBorrar(destino, pase, iso, ahoraMs).then(function () {
    return eventos.reduce(function (p, ev) {
      return p.then(function () { return calendarioWebCrear(destino, pase, iso, ev); });
    }, Promise.resolve());
  });
}

/* Los eventos del plan de AHORA (después de guardar las reuniones), con sus
   instantes en ms. */
function calendarioEventosDeHoy(iso, textos) {
  var plan = typeof ritmoPlan === 'function' ? ritmoPlan(getState()) : null;
  if (!plan) return null;
  var ahora = typeof ritmoAhoraExacto === 'function' ? ritmoAhoraExacto() : 0;
  return calendarioEventos(plan.m, ahora, textos.t, textos.tn, textos.lang).map(function (e) {
    return Object.assign({}, e, { inicio: calendarioInstante(iso, e.desde).getTime(), fin: calendarioInstante(iso, e.hasta).getTime() });
  });
}

/* LLEVAR EL DÍA. `opciones`: { reuniones, calendarioId, t, tn, lang }.
   Resuelve con { n, reuniones } (reuniones = cuántas se leyeron, o null) y
   falla con Error('permiso' | 'bloqueada' | 'cerrada' | 'denegado' | 'pase' |
   'red' | 'sin-dia'). Hay que llamarla DENTRO del clic. */
function calendarioLlevar(destino, opciones) {
  var o = opciones || {};
  var iso = ritmoHoy();
  var ahoraMs = Date.now();
  if (destino === 'archivo') {
    try {
      var evs = calendarioEventosDeHoy(iso, o);
      if (!evs) return Promise.reject(new Error('sin-dia'));
      calendarioBajarIcs(calendarioIcs(evs, iso, ahoraMs), 'pace-' + iso + '.ics');
      calendarioGuardarAjustes({ destino: destino });
      return Promise.resolve({ n: evs.length, reuniones: null });
    } catch (e) { return Promise.reject(e); }
  }
  var acceso;
  try { acceso = calendarioAcceso(destino); } catch (e) { return Promise.reject(e); }
  var leidas = null;
  return acceso.then(function (pase) {
    var lectura = o.reuniones
      ? calendarioLeer(destino, pase, iso).then(function (lista) {
          leidas = lista.length;
          calendarioGuardarOcupado(calendarioTramos(lista, iso), destino);
        })
      : Promise.resolve();
    return lectura.then(function () {
      var evs = calendarioEventosDeHoy(iso, o);
      if (!evs) throw new Error('sin-dia');
      var escribir = destino === 'android'
        ? calendarioEscribirAndroid(evs, iso, ahoraMs, o.calendarioId || null)
        : calendarioEscribirWeb(destino, pase, evs, iso, ahoraMs);
      return escribir.then(function () {
        calendarioGuardarAjustes({ destino: destino, reuniones: !!o.reuniones, calendarioId: o.calendarioId || null, fecha: iso });
        _calendarioRefresco.ultimo = Date.now();
        return { n: evs.length, reuniones: leidas };
      });
    });
  });
}

/* El archivo: descarga en la web; en Android, el menú de compartir. */
function calendarioBajarIcs(texto, nombre) {
  if (typeof paceAndroidGuardarArchivo === 'function' && paceAndroidGuardarArchivo(nombre, texto)) return;
  var blob = new Blob([texto], { type: 'text/calendar;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

/* Volver a leer las reuniones sin preguntar nada (ver arriba). */
function calendarioRefrescarReuniones(forzar) {
  try {
    if (_calendarioRefresco.enCurso) return Promise.resolve(false);
    if (!forzar && Date.now() - _calendarioRefresco.ultimo < 5 * 60 * 1000) return Promise.resolve(false);
    var R = ritmoDe(getState());
    var c = R.calendario || {};
    if (!calendarioConectado(c.destino) || !c.reuniones || R.libre || !R.dia) return Promise.resolve(false);
    if (calendarioDestinos().indexOf(c.destino) === -1) return Promise.resolve(false);
    var iso = ritmoHoy();
    var acceso;
    if (c.destino === 'android') {
      acceso = paceAndroidCalendarioTienePermiso().then(function (ok) { if (!ok) throw new Error('permiso'); return null; });
    } else {
      var pase = calendarioPaseGuardado(c.destino);
      if (!pase) return Promise.resolve(false);
      acceso = Promise.resolve(pase);
    }
    _calendarioRefresco.enCurso = true;
    _calendarioRefresco.ultimo = Date.now();
    return acceso.then(function (pase) { return calendarioLeer(c.destino, pase, iso); })
      .then(function (lista) { return calendarioGuardarOcupado(calendarioTramos(lista, iso), c.destino); })
      .catch(function () { return false; })
      .then(function (r) { _calendarioRefresco.enCurso = false; return r; });
  } catch (e) { _calendarioRefresco.enCurso = false; return Promise.resolve(false); }
}

function calendarioArrancar() {
  /* Una vuelta del permiso que nadie recogió (la pestaña se cerró antes) no se
     queda en el navegador. */
  try {
    var v = JSON.parse(localStorage.getItem('pace.calendario.vuelta') || 'null');
    if (v && !(v.t > Date.now() - 5 * 60 * 1000)) localStorage.removeItem('pace.calendario.vuelta');
  } catch (e) {}
  setTimeout(function () { calendarioRefrescarReuniones(true); }, 1500);
  try {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') calendarioRefrescarReuniones(false);
    });
  } catch (e) {}
}

try { calendarioArrancar(); } catch (e) {}

Object.assign(window, {
  CALENDARIO_DESTINOS, calendarioDestinos, calendarioConectado, calendarioLlevar, calendarioRefrescarReuniones,
  calendarioGuardarOcupado, calendarioBajarIcs,
});
