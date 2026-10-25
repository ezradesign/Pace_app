/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   android.js — LO QUE EL WEBVIEW DE ANDROID NO TRAE
   ============================================================
   En Android la app es esta misma web dentro del WebView de Capacitor. Ese
   WebView no tiene Wake Lock ni la API de avisos, no descarga archivos y el
   boton atras del movil no es suyo. Capacitor lo da con complementos nativos
   que el lado nativo inyecta en `window.Capacitor.Plugins` (sin bundler: aqui
   no se importa nada). Este archivo es el UNICO que les habla: quien necesita
   uno pide `paceAndroidPlugin('Nombre')`, y si recibe null sigue por el
   camino web. En la web, en el standalone y en las pruebas sin Capacitor nada
   de esto existe.

   EL BOTON ATRAS hace lo mismo que Escape, que casi todo PACE ya escucha:
   cierra lo que este encima (un dialogo, Ajustes, el menu de pausa, una
   sesion). Se manda esa misma tecla en vez de enseñar a cada capa un evento
   nuevo; todas las capas llevan `role="dialog"`. Si no hay ninguna abierta, la
   app se va al fondo como cualquier otra de Android, sin cerrarse: el
   Pomodoro sigue contando por reloj real.

   EL AVISO DE FIN DE FOCO: con la app en el fondo Android congela su JS, asi
   que el aviso no puede salir de la web cuando acaba el bloque, como en el
   navegador. Lo programa el sistema para la hora del final, y SOLO mientras la
   app esta en el fondo: al volver se cancela, porque delante ya lo cuenta la
   propia app y sonarian los dos.

   A SU HORA: desde Android 12 una alarma exacta pide el permiso «Alarmas y
   recordatorios», y desde Android 14 viene apagado. Sin el, Android puede
   retrasar el aviso unos minutos. El complemento, si no lo tiene, abre esa
   pantalla de ajustes en cada `schedule()`, y aqui eso pasaria al salir de la
   app con un Foco en marcha: por eso solo se pide exacta si ya esta concedido,
   y el permiso se ofrece desde Ajustes, con un toque de la persona.

   LA COPIA DE «TUS DATOS» se escribe en la cache de la app y se abre el menu de
   compartir de Android, desde el que se guarda en Drive o en Archivos, o se
   manda por correo.

   EL CALENDARIO DEL MOVIL (complemento CapacitorCalendar): «A tu ritmo» lleva
   el dia al calendario del telefono, que ya esta sincronizado con la cuenta de
   Google o de Microsoft que tenga la persona, y lee sus reuniones. Aqui solo
   van las llamadas, cada una reducida a lo que PACE usa; que eventos se crean,
   se cambian y se borran lo deciden ritmo.calendario.destinos.js y el motor del
   calendario que se mantiene solo. Pide los dos permisos (leer y escribir) la
   primera vez que se pulsa, nunca al arrancar.

   LAS FRANJAS DE ARRIBA Y DE ABAJO (la hora y la bateria, y Atras) son de
   Android: las pinta el tema, que sigue el modo del movil. El complemento
   PaceBarras (MainActivity) las pinta con el papel de la paleta que se le
   diga, y aqui se le dice la que se ve cada vez que cambia: en Ajustes, con
   «Auto» al cambiar el movil, y al acabar el bloque que tenia ese cambio en
   espera.

   LOS ENLACES LEGALES son rutas del servidor en la web (/privacy, /safety). En
   el APK no hay servidor y abrirlas recargaba la app: van a la web publicada,
   que Android abre en el navegador.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var PACE_WEB_PUBLICA = 'https://pacegrass.app';
var PACE_AVISO_FOCO_ID = 1; // un solo aviso de fin de Foco a la vez

/* `programado` nace en true: al arrancar no se sabe si el proceso anterior, que Android pudo cerrar
   con la app en el fondo, dejó un aviso de fin de Foco puesto. Si se diera por apagado, pausar o
   reiniciar el bloque recuperado no lo quitaría y llegaría «Foco completado» a la hora vieja (o
   sonaría dos veces con la app delante). Así lo primero que se recoloca con la app delante lo
   cancela (caza del 10 oct., foco-4). */
var _paceAndroid = { fondo: false, permiso: 'default', exacta: 'default', foco: null, programado: true, atras: 0 };

function paceEsAndroid() {
  try {
    var cap = window.Capacitor;
    return !!(cap && typeof cap.getPlatform === 'function' && cap.getPlatform() === 'android');
  } catch (e) { return false; }
}

function paceAndroidPlugin(nombre) {
  try {
    if (!paceEsAndroid()) return null;
    var lista = window.Capacitor.Plugins;
    return (lista && lista[nombre]) || null;
  } catch (e) { return null; }
}

/* Una llamada nativa que nunca rompe: sin complemento, o si falla, da null. */
function paceAndroidLlamar(nombre, metodo, opciones) {
  try {
    var p = paceAndroidPlugin(nombre);
    if (!p || typeof p[metodo] !== 'function') return Promise.resolve(null);
    return Promise.resolve(p[metodo](opciones)).catch(function () { return null; });
  } catch (e) { return Promise.resolve(null); }
}

/* --- Boton atras ---------------------------------------------------------- */

function paceAndroidAtras() {
  try {
    _paceAndroid.atras++;
    if (document.querySelector('[role="dialog"]')) {
      /* Desde el elemento con el foco, como una tecla de verdad: asi pasa por
         los manejadores de React del dialogo y luego por los de document. */
      var activo = document.activeElement;
      var destino = (activo && activo !== document.body && document.documentElement.contains(activo)) ? activo : document;
      destino.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
      return 'escape';
    }
    paceAndroidLlamar('App', 'minimizeApp');
    return 'fondo';
  } catch (e) { return null; }
}

/* --- Aviso de fin de Foco ------------------------------------------------- */

function paceAndroidAvisos() {
  return !!paceAndroidPlugin('LocalNotifications');
}

/* 'granted' | 'denied' | 'default', lo mismo que Notification.permission. */
function paceAndroidAvisoPermiso() {
  return _paceAndroid.permiso;
}

function paceAndroidGuardarPermiso(r) {
  var d = r && r.display;
  if (d === 'granted' || d === 'denied') _paceAndroid.permiso = d;
  else if (d) _paceAndroid.permiso = 'default';
  return _paceAndroid.permiso;
}

/* Muestra el dialogo de Android (13 o mas); antes de 13 contesta sin mostrar
   nada. Devuelve el permiso resultante. */
function paceAndroidAvisoPedir() {
  return paceAndroidLlamar('LocalNotifications', 'requestPermissions').then(paceAndroidGuardarPermiso);
}

/* 'granted' | 'denied' | 'default' (aun sin mirar) para «Alarmas y recordatorios». */
function paceAndroidAvisoExacto() {
  return _paceAndroid.exacta;
}

function paceAndroidGuardarExacta(r) {
  var e = r && r.exact_alarm;
  if (e === 'granted' || e === 'denied') _paceAndroid.exacta = e;
  return _paceAndroid.exacta;
}

function paceAndroidAvisoExactoMirar() {
  return paceAndroidLlamar('LocalNotifications', 'checkExactNotificationSetting').then(paceAndroidGuardarExacta);
}

/* Abre la pantalla de Android y, al volver, devuelve como ha quedado. */
function paceAndroidAvisoExactoPedir() {
  return paceAndroidLlamar('LocalNotifications', 'changeExactNotificationSetting').then(paceAndroidGuardarExacta);
}

/* FocusTimer cuenta aqui cuando acaba el bloque en marcha (ms) y con que
   textos avisar, o null si no hay bloque o el aviso esta apagado. */
function paceAndroidFoco(endsAt, textos) {
  _paceAndroid.foco = endsAt
    ? { endsAt: endsAt, title: (textos && textos.title) || 'PACE', body: (textos && textos.body) || '' }
    : null;
  paceAndroidAvisoRecolocar();
}

function paceAndroidFondo(fondo) {
  if (_paceAndroid.fondo === !!fondo) return;
  _paceAndroid.fondo = !!fondo;
  paceAndroidAvisoRecolocar();
}

function paceAndroidAvisoRecolocar() {
  var f = _paceAndroid.foco;
  if (_paceAndroid.fondo && f && f.endsAt > Date.now()) {
    _paceAndroid.programado = true;
    paceAndroidLlamar('LocalNotifications', 'schedule', { notifications: [{
      id: PACE_AVISO_FOCO_ID, title: f.title, body: f.body,
      /* el formato exacto que lee el complemento: ISO en UTC con milisegundos */
      schedule: { at: new Date(f.endsAt).toISOString(), allowWhileIdle: true },
      isExactNotification: _paceAndroid.exacta === 'granted',
    }] });
    return;
  }
  if (!_paceAndroid.programado) return;
  _paceAndroid.programado = false;
  paceAndroidLlamar('LocalNotifications', 'cancel', { notifications: [{ id: PACE_AVISO_FOCO_ID }] });
}

/* --- La copia de «Tus datos» y los enlaces -------------------------------- */

/* false si no hay Android y toca la descarga de la web. Si lo hay, una promesa con lo que
   pasó: 'compartida' (se eligió dónde mandarla), 'cancelada' (se cerró el menú sin elegir) o
   'fallo' (no se escribió el archivo o no se abrió el menú). `alAbrir` se llama con el archivo
   ya escrito, al abrirse el menú. Antes devolvía true en cuanto había complementos y lo de
   después se perdía: Ajustes daba la copia por hecha, con su logro, aunque no hubiera archivo
   (auditoría del 21 oct.). `paceAndroidLlamar` no sirve aquí: se traga el rechazo. */
function paceAndroidGuardarArchivo(nombre, texto, alAbrir) {
  var fs = paceAndroidPlugin('Filesystem'), menu = paceAndroidPlugin('Share');
  if (!fs || !menu || typeof fs.writeFile !== 'function' || typeof menu.share !== 'function') return false;
  return Promise.resolve()
    .then(function () { return fs.writeFile({ path: nombre, data: texto, directory: 'CACHE', encoding: 'utf8' }); })
    .then(function (r) {
      if (!r || !r.uri) return 'fallo';
      try { if (typeof alAbrir === 'function') alAbrir(); } catch (e) {}
      return Promise.resolve(menu.share({ title: nombre, files: [r.uri] })).then(
        function () { return 'compartida'; },
        function (e) { return /cancel/i.test(String((e && e.message) || e)) ? 'cancelada' : 'fallo'; });
    })
    .catch(function () { return 'fallo'; });
}

/* --- El calendario del movil ---------------------------------------------- */

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
   [{ id, calendario, inicio, fin, todoElDia, libre, cancelado, titulo, texto, aviso }]. */
function paceAndroidCalendarioEventos(desde, hasta) {
  return paceAndroidLlamar('CapacitorCalendar', 'listEventsInRange', { from: desde, to: hasta }).then(function (r) {
    return ((r && r.result) || []).map(function (e) {
      return { id: String(e.id), calendario: e.calendarId != null ? String(e.calendarId) : null, inicio: e.startDate, fin: e.endDate,
               todoElDia: !!e.isAllDay, libre: e.availability === 1, cancelado: e.status === 'canceled', titulo: e.title || '',
               texto: e.description || '', aviso: (e.alerts || []).length > 0 };
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

/* Crea un evento libre. Devuelve su id, o null. */
function paceAndroidCalendarioCrear(calendario, ev) {
  var o = { title: ev.titulo, description: ev.texto, startDate: ev.inicio, endDate: ev.fin, availability: PACE_ANDROID_LIBRE, alerts: paceAndroidCalendarioAlarmas(ev) };
  if (calendario) o.calendarId = String(calendario);
  return paceAndroidLlamar('CapacitorCalendar', 'createEvent', o).then(function (r) { return r && r.id != null ? String(r.id) : null; });
}

/* Cambia un evento que ya está. Solo con un id que acaba de salir en la lista:
   sobre uno que no existe, el complemento no falla y deja alarmas sueltas. */
function paceAndroidCalendarioCambiar(id, ev) {
  return paceAndroidLlamar('CapacitorCalendar', 'modifyEvent', { id: String(id), title: ev.titulo, description: ev.texto,
    startDate: ev.inicio, endDate: ev.fin, availability: PACE_ANDROID_LIBRE, alerts: paceAndroidCalendarioAlarmas(ev) });
}

function paceAndroidCalendarioBorrar(id) {
  return paceAndroidLlamar('CapacitorCalendar', 'deleteEvent', { id: String(id) });
}

/* '/privacy' en la web; la pagina publicada en Android. */
function paceEnlaceWeb(ruta) {
  return paceEsAndroid() ? PACE_WEB_PUBLICA + ruta : ruta;
}

/* --- Las franjas del sistema --------------------------------------------- */

/* `palette` es la que se ve: con un bloque vivo, Auto deja el cambio en espera
   sin tocarla. `auto` es para el arranque siguiente, que se pinta antes de que
   hable la web: en Auto manda el modo del movil, que es lo que Auto elegira. */
var _paceBarras = null;
function paceAndroidBarras(estado) {
  try {
    if (!estado || (estado.palette !== 'crema' && estado.palette !== 'oscuro')) return;
    var auto = !!estado.paletteAuto;
    if (_paceBarras && _paceBarras.paleta === estado.palette && _paceBarras.auto === auto) return;
    if (!paceAndroidPlugin('PaceBarras')) return;
    _paceBarras = { paleta: estado.palette, auto: auto };
    paceAndroidLlamar('PaceBarras', 'pintar', { paleta: estado.palette, auto: auto });
  } catch (e) {}
}

/* Para las pruebas y para depurar. */
function paceAndroidEstado() {
  return { fondo: _paceAndroid.fondo, permiso: _paceAndroid.permiso, exacta: _paceAndroid.exacta, programado: _paceAndroid.programado,
           foco: _paceAndroid.foco ? _paceAndroid.foco.endsAt : null, atras: _paceAndroid.atras };
}

function paceAndroidArrancar() {
  if (!paceEsAndroid()) return;
  var app = paceAndroidPlugin('App');
  if (app && typeof app.addListener === 'function') {
    try {
      app.addListener('backButton', function () { paceAndroidAtras(); });
      app.addListener('appStateChange', function (s) { paceAndroidFondo(!(s && s.isActive)); });
    } catch (e) {}
  }
  /* El WebView tambien se oculta al irse al fondo; lo que llegue antes manda. */
  try {
    document.addEventListener('visibilitychange', function () {
      var oculta = document.visibilityState === 'hidden';
      /* Al volver puede venir de los ajustes de Android con el permiso cambiado. */
      if (!oculta) paceAndroidAvisoExactoMirar();
      paceAndroidFondo(oculta);
    });
  } catch (e) {}
  paceAndroidLlamar('LocalNotifications', 'checkPermissions').then(paceAndroidGuardarPermiso);
  paceAndroidAvisoExactoMirar();
  /* El estado ya esta cargado (state.jsx va antes que ui/): la paleta del
     arranque se pinta ya, y las siguientes, al cambiar. */
  try {
    paceAndroidBarras(getState());
    subscribe(function () { paceAndroidBarras(getState()); });
  } catch (e) {}
}

try { paceAndroidArrancar(); } catch (e) {}

Object.assign(window, {
  paceEsAndroid, paceAndroidPlugin, paceAndroidAtras, paceAndroidAvisos, paceAndroidAvisoPermiso,
  paceAndroidAvisoPedir, paceAndroidAvisoExacto, paceAndroidAvisoExactoMirar, paceAndroidAvisoExactoPedir, paceAndroidFoco, paceAndroidGuardarArchivo, paceEnlaceWeb, paceAndroidEstado,
  paceAndroidCalendario, paceAndroidCalendarioPermiso, paceAndroidCalendarioTienePermiso, paceAndroidCalendarios, paceAndroidCalendarioEventos,
  paceAndroidCalendarioCrear, paceAndroidCalendarioCambiar, paceAndroidCalendarioBorrar, paceAndroidBarras,
});
