/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ritmo.calendario.motor.js — EL CALENDARIO QUE SE MANTIENE SOLO
   ============================================================
   Con «Mantenerlo al día solo» marcado al pulsar «Añadir» (`ritmo.calendario.
   mantener`), cada vez que el día cambia en PACE (otro día elegido, un bloque
   que empieza tarde, una reunión nueva, «Hoy voy por libre») el calendario se
   corrige solo, mientras PACE esté abierto (Ez, 1A de la propuesta del 14 oct.
   2026). Con PACE cerrado no hay nada despierto que pueda escribir: lo escrito y
   sus avisos siguen ahí, y al volver se pone al día.

   CUÁNDO: se mira en cada cambio del estado, cada minuto y al volver a la app;
   si el calendario va por detrás, se escribe UN MINUTO DESPUÉS del primer cambio,
   para juntar varios seguidos en uno. Un fallo de red espera 5 minutos.

   CON QUÉ PERMISO, sin preguntar: el del calendario del móvil en Android (no
   caduca); en la web, el pase de Google (una hora) o el de Microsoft (renovable
   durante un día, ritmo.calendario.web.js). Sin él, la hoja y el enlace dicen
   «Poner al día», y ese clic sí puede abrir la ventana del permiso.

   QUÉ: se leen los eventos de PACE de hoy que hay en el calendario y se aplica
   `calendarioCambios` (ritmo.calendario.solo.js): se cambia el que ya está, se
   crea lo que falta y se quita lo que sobra, nunca un evento que no sea de PACE.

   LO ÚLTIMO QUE SE ESCRIBIÓ vive en `pace.calendario.escrito` y no en
   `pace.state.v2`: es de este dispositivo (en Android lleva los ids de su
   calendario), no va en la copia de «Tus datos» y sirve para saber, sin
   preguntar al calendario, si va por detrás.

   Dos pestañas no escriben a la vez (`navigator.locks`, si lo hay).

   `var`/`function` a propósito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var CALENDARIO_ESCRITO_CLAVE = 'pace.calendario.escrito';
var CALENDARIO_SOLO_ESPERA = 60 * 1000;
var CALENDARIO_SOLO_REINTENTO = 5 * 60 * 1000;
var _calSolo = { espera: null, cola: Promise.resolve(), trabajando: false, fallo: false, sinAcceso: false, junta: false, huella: '', gen: 0, reintento: 0 };

/* LA GENERACIÓN de la conexión: «Desconectar» la cambia al momento, y una escritura
   pedida antes la mira antes de cada paso en el calendario y antes de guardar lo
   escrito. Si no, una escritura que esperaba respuesta seguía al llegar: volvía a poner
   lo que «Quitarlo» acababa de quitar y guardaba `pace.calendario.escrito` después de
   que la desconexión lo vaciara. */
function calendarioSoloSigue(gen) {
  if (gen !== _calSolo.gen || !calendarioSoloActivo()) throw new Error('cortado');
}

/* Los textos sin el hook, en el idioma de la app (como useT). */
function calendarioTextos() {
  var lang = (typeof getState === 'function' && getState().lang) || 'en';
  var S = window.PACE_STRINGS || {};
  var t = function (k) {
    if (S[lang] && S[lang][k] !== undefined) return S[lang][k];
    return S.en && S.en[k] !== undefined ? S.en[k] : k;
  };
  var tn = function (k, v) {
    var s = t(k);
    Object.keys(v || {}).forEach(function (x) { s = s.split('{' + x + '}').join(String(v[x])); });
    return s;
  };
  return { t: t, tn: tn, lang: lang };
}

function calendarioEscritoLeer() {
  try {
    var v = JSON.parse(localStorage.getItem(CALENDARIO_ESCRITO_CLAVE) || 'null');
    return v && typeof v === 'object' && v.eventos && typeof v.eventos === 'object' ? v : null;
  } catch (e) { return null; }
}

function calendarioEscritoGuardar(v) {
  try {
    if (v) localStorage.setItem(CALENDARIO_ESCRITO_CLAVE, JSON.stringify(v));
    else localStorage.removeItem(CALENDARIO_ESCRITO_CLAVE);
  } catch (e) {}
}

/* Lo escrito hoy en `destino`, por clave ({} si es de otro día o de otro sitio). */
function calendarioEscritoDeHoy(destino) {
  var v = calendarioEscritoLeer();
  return v && v.fecha === ritmoHoy() && v.destino === destino ? v.eventos : {};
}

function calendarioSoloAjustes(s) {
  return (typeof ritmoDe === 'function' ? ritmoDe(s || getState()).calendario : null) || {};
}

function calendarioSoloActivo(s) {
  var c = calendarioSoloAjustes(s);
  if (!c.mantener || !calendarioConectado(c.destino)) return false;
  if (typeof puedeMantenerCalendario === 'function' && !puedeMantenerCalendario()) return false;
  return calendarioDestinos().indexOf(c.destino) !== -1;
}

/* Resuelve con el pase (web), null (Android) o false si no hay permiso vivo. */
function calendarioAccesoSinGesto(destino) {
  if (destino === 'android') {
    return paceAndroidCalendarioTienePermiso().then(function (ok) { return ok ? null : false; }, function () { return false; });
  }
  return calendarioPaseSinGesto(destino).then(function (p) { return p || false; });
}

function calendarioSoloConAcceso(destino) {
  if (destino === 'android') return !_calSolo.sinAcceso;
  return calendarioPaseHasta(destino) > Date.now() + 60000 && !_calSolo.sinAcceso;
}

/* Los eventos de PACE de hoy en el calendario, con su clave. En Android la clave
   sale de lo escrito (id -> clave): el calendario del móvil no guarda campos
   propios, y uno sin clave se quita y se vuelve a crear. */
function calendarioListarDePace(destino, pase, iso, escritos) {
  if (destino !== 'android') return calendarioWebListar(destino, pase, iso);
  var claveDe = {};
  Object.keys(escritos || {}).forEach(function (k) { if (escritos[k] && escritos[k].id) claveDe[escritos[k].id] = k; });
  var d = calendarioDiaMs(iso);
  return paceAndroidCalendarioEventos(d[0], d[1], calendarioAndroidEsDePace).then(function (lista) {
    return lista.filter(calendarioAndroidEsDePace).map(function (e) {
      return { id: e.id, clave: claveDe[e.id] || null, inicio: e.inicio, fin: e.fin, titulo: e.titulo, texto: e.texto, aviso: e.aviso };
    });
  });
}

/* Quitar, cambiar y crear, uno detrás de otro. Resuelve con { clave: id } de lo creado.
   `sigue` (opcional) se mira antes de cada paso y corta lo que queda. */
function calendarioAplicar(destino, pase, iso, cambios, calendarioId, sigue) {
  var android = destino === 'android';
  var creados = {};
  var pasos = [];
  cambios.borrar.forEach(function (id) {
    pasos.push(function () { return android ? calendarioAndroidBorrar(id) : calendarioWebQuitar(destino, pase, id); });
  });
  cambios.cambiar.forEach(function (c) {
    pasos.push(function () {
      if (!android) return calendarioWebCambiar(destino, pase, c.id, c.ev);
      return paceAndroidCalendarioCambiar(c.id, c.ev).then(function (r) { calendarioAndroidApuntar(c.id, c.ev); return r; });
    });
  });
  cambios.crear.forEach(function (ev) {
    pasos.push(function () {
      var p = android ? calendarioAndroidCrear(calendarioId, ev) : calendarioWebCrear(destino, pase, iso, ev, true);
      return p.then(function (id) { if (id) creados[ev.clave] = id; });
    });
  });
  return pasos.reduce(function (p, paso) {
    return p.then(function () { if (sigue) sigue(); return paso(); });
  }, Promise.resolve()).then(function () { return creados; });
}

/* Pone el calendario al día con un acceso ya dado. Resuelve con los cambios, o
   null si no hay día que llevar (eligiéndolo). `gen`: la generación con que se pidió. */
function calendarioSoloSincronizar(destino, pase, calendarioId, gen) {
  var sigue = function () { calendarioSoloSigue(gen); };
  var hoy = ritmoHoy();
  var deseados = calendarioDeseados(getState(), calendarioTextos());
  if (!deseados) return Promise.resolve(null);
  var antes = calendarioEscritoLeer();
  var escritos = calendarioEscritoDeHoy(destino);
  sigue();
  return calendarioListarDePace(destino, pase, hoy, escritos).then(function (existentes) {
    var ahora = Date.now();
    var cambios = calendarioCambios(deseados.eventos, existentes, ahora);
    return calendarioAplicar(destino, pase, hoy, cambios, calendarioId, sigue).then(function (creados) {
      sigue();
      var mismo = antes && antes.fecha === hoy && antes.destino === destino;
      calendarioEscritoGuardar({ fecha: hoy, destino: destino, alDia: !calendarioSinCambios(cambios) || !mismo ? ahora : antes.alDia,
                                 eventos: calendarioTrasCambios(existentes, cambios, creados) });
      return cambios;
    });
  });
}

/* Escribe en cola (nunca dos a la vez). `acceso`, la promesa del permiso pedido
   en un clic; sin ella, solo con el permiso que ya hay. Un clic recibe el error. */
function calendarioSoloEscribir(acceso) {
  /* La generación del momento en que se pide: si se desconecta mientras espera su turno, no empieza. */
  var gen = _calSolo.gen;
  var trabajo = function () {
    if (gen !== _calSolo.gen || !calendarioSoloActivo()) return Promise.resolve(false);
    var c = calendarioSoloAjustes();
    _calSolo.trabajando = true;
    calendarioSoloAvisar();
    return (acceso || calendarioAccesoSinGesto(c.destino)).then(function (pase) {
      if (pase === false) { _calSolo.sinAcceso = true; return false; }
      _calSolo.sinAcceso = false;
      return calendarioSoloSincronizar(c.destino, pase, c.calendarioId || null, gen).then(function () { return true; });
    }).then(function (r) {
      _calSolo.fallo = false;
      return r;
    }, function (e) {
      /* cortada por «Desconectar»: ni es un fallo ni se le dice al clic */
      if (e && e.message === 'cortado') return false;
      if (e && (e.message === 'pase' || e.message === 'permiso')) _calSolo.sinAcceso = true;
      else _calSolo.fallo = true;
      if (acceso) throw e;
      return false;
    }).then(function (r) {
      _calSolo.trabajando = false;
      calendarioSoloRevisar();
      return r;
    }, function (e) {
      _calSolo.trabajando = false;
      calendarioSoloRevisar();
      throw e;
    });
  };
  return calendarioSoloEnCola(trabajo);
}

/* La cola del motor y el cerrojo entre pestañas: nunca dos trabajos a la vez en el
   calendario, tampoco una escritura y «Desconectar». */
function calendarioSoloEnCola(trabajo) {
  var cerrojo = function () {
    try {
      if (navigator.locks && typeof navigator.locks.request === 'function') return navigator.locks.request('pace.calendario.solo', trabajo);
    } catch (e) {}
    return trabajo();
  };
  var r = _calSolo.cola.then(cerrojo, cerrojo);
  _calSolo.cola = r.catch(function () {});
  return r;
}

function calendarioSoloParar() {
  if (_calSolo.espera) { clearTimeout(_calSolo.espera); _calSolo.espera = null; }
}

/* Lo que enseñan la hoja y el enlace, o null si no se mantiene solo. */
function calendarioSoloEstado() {
  try {
    var s = getState();
    if (!calendarioSoloActivo(s)) return null;
    var c = calendarioSoloAjustes(s);
    var ahora = Date.now();
    var deseados = calendarioDeseados(s, calendarioTextos());
    var escrito = calendarioEscritoLeer();
    var mio = escrito && escrito.destino === c.destino ? escrito : null;
    return {
      destino: c.destino, pendiente: calendarioPendiente(deseados, mio, c.destino, ahora), conAcceso: calendarioSoloConAcceso(c.destino),
      trabajando: _calSolo.trabajando, alDia: mio && mio.fecha === ritmoHoy() ? mio.alDia || null : null,
      /* la última escritura falló y no por el permiso (la red, el calendario): reintenta cada 5 min */
      fallo: !!_calSolo.fallo, reintento: _calSolo.fallo ? _calSolo.reintento || 0 : 0,
      hasta: c.destino === 'android' ? 0 : calendarioPaseHasta(c.destino),
      quedan: deseados ? deseados.eventos.filter(function (e) { return e.fin > ahora; }) : [],
    };
  } catch (e) { return null; }
}

/* Avisa a la hoja y al enlace, solo si lo que enseñan ha cambiado. */
function calendarioSoloAvisar() {
  var e = calendarioSoloEstado();
  var huella = e ? [e.destino, e.pendiente, e.conAcceso, e.trabajando, e.alDia, e.hasta, e.fallo, e.reintento].join('|') : '';
  if (huella === _calSolo.huella) return;
  _calSolo.huella = huella;
  try { window.dispatchEvent(new CustomEvent('pace:calendario-solo')); } catch (x) {}
}

/* ¿Va por detrás? Entonces se escribe al minuto. */
function calendarioSoloRevisar() {
  try {
    var s = getState();
    if (!calendarioSoloActivo(s)) { calendarioSoloParar(); calendarioSoloAvisar(); return; }
    var c = calendarioSoloAjustes(s);
    var pendiente = calendarioPendiente(calendarioDeseados(s, calendarioTextos()), calendarioEscritoLeer(), c.destino, Date.now());
    if (!pendiente) calendarioSoloParar();
    else if (!_calSolo.espera && !_calSolo.trabajando) {
      var espera = _calSolo.fallo ? CALENDARIO_SOLO_REINTENTO : CALENDARIO_SOLO_ESPERA;
      /* la hora del próximo intento, que la hoja enseña tras un fallo («lo intenta otra vez a las…») */
      _calSolo.reintento = Date.now() + espera;
      _calSolo.espera = setTimeout(function () { _calSolo.espera = null; calendarioSoloEscribir(); }, espera);
    }
    calendarioSoloAvisar();
  } catch (e) {}
}

/* «Poner al día»: DENTRO del clic, porque puede abrir la ventana del permiso. */
function calendarioSoloPonerAlDia() {
  var acceso;
  try { acceso = calendarioAcceso(calendarioSoloAjustes().destino); } catch (e) { return Promise.reject(e); }
  calendarioSoloParar();
  return calendarioSoloEscribir(acceso);
}

/* «Desconectar»: PACE deja de tocar el calendario y olvida el pase. Con
   `quitar`, antes quita lo de PACE de hoy que no ha acabado (el permiso, dentro del
   clic; el quitar, por la cola, detrás de la escritura que hubiera en marcha). Lo que
   ya estaba pedido se corta al momento (la generación), y PACE deja de leer las
   reuniones también en Android: sin destino, `calendarioRefrescarReuniones` no lee, y
   la lectura que esperaba respuesta no se guarda. Resuelve con { quitados } (null si
   se deja). */
function calendarioSoloDesconectar(quitar) {
  var destino = calendarioSoloAjustes().destino;
  calendarioSoloParar();
  _calSolo.gen++;
  if (typeof calendarioRefrescoCortar === 'function') calendarioRefrescoCortar();
  var fin = function (n) {
    calendarioGuardarAjustes({ mantener: false, destino: null });
    calendarioEscritoGuardar(null);
    if (destino === 'google' || destino === 'microsoft') calendarioPaseGuardar(destino, null);
    _calSolo.sinAcceso = false;
    _calSolo.fallo = false;
    calendarioSoloAvisar();
    return { quitados: n };
  };
  if (!quitar) return Promise.resolve(fin(null));
  var acceso;
  try { acceso = calendarioAcceso(destino); } catch (e) { return Promise.reject(e); }
  acceso.catch(function () {});   /* el error lo recibe el trabajo de la cola */
  return calendarioSoloEnCola(function () {
    return acceso.then(function (pase) {
      var hoy = ritmoHoy();
      return calendarioListarDePace(destino, pase, hoy, calendarioEscritoDeHoy(destino)).then(function (existentes) {
        var cambios = calendarioCambios([], existentes, Date.now());
        return calendarioAplicar(destino, pase, hoy, cambios, null).then(function () { return fin(cambios.borrar.length); });
      });
    });
  });
}

function calendarioSoloArrancar() {
  if (typeof subscribe === 'function') {
    subscribe(function () {
      if (_calSolo.junta) return;
      _calSolo.junta = true;
      setTimeout(function () { _calSolo.junta = false; calendarioSoloRevisar(); }, 0);
    });
  }
  setInterval(function () {
    calendarioSoloRevisar();
    try { if (calendarioSoloActivo() && calendarioSoloAjustes().reuniones) calendarioRefrescarReuniones(false); } catch (e) {}
  }, 60 * 1000);
  try {
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') calendarioSoloRevisar(); });
  } catch (e) {}
  setTimeout(calendarioSoloRevisar, 2000);
}

setTimeout(function () { try { calendarioSoloArrancar(); } catch (e) {} }, 0);

Object.assign(window, {
  CALENDARIO_ESCRITO_CLAVE, calendarioTextos, calendarioEscritoLeer, calendarioSoloActivo, calendarioSoloEstado, calendarioSoloRevisar,
  calendarioSoloEscribir, calendarioSoloSincronizar, calendarioSoloPonerAlDia, calendarioSoloDesconectar,
});
