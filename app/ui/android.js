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

   LA COPIA DE «TUS DATOS» se escribe en la cache de la app y se abre el menu de
   compartir de Android, desde el que se guarda en Drive o en Archivos, o se
   manda por correo.

   LOS ENLACES LEGALES son rutas del servidor en la web (/privacy, /safety). En
   el APK no hay servidor y abrirlas recargaba la app: van a la web publicada,
   que Android abre en el navegador.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var PACE_WEB_PUBLICA = 'https://paceweb.pages.dev';
var PACE_AVISO_FOCO_ID = 1; // un solo aviso de fin de Foco a la vez

var _paceAndroid = { fondo: false, permiso: 'default', foco: null, programado: false, atras: 0 };

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
    }] });
    return;
  }
  if (!_paceAndroid.programado) return;
  _paceAndroid.programado = false;
  paceAndroidLlamar('LocalNotifications', 'cancel', { notifications: [{ id: PACE_AVISO_FOCO_ID }] });
}

/* --- La copia de «Tus datos» y los enlaces -------------------------------- */

/* true si la ha mandado al menu de compartir de Android; false si no hay
   Android y toca la descarga de la web. */
function paceAndroidGuardarArchivo(nombre, texto) {
  if (!paceAndroidPlugin('Filesystem') || !paceAndroidPlugin('Share')) return false;
  paceAndroidLlamar('Filesystem', 'writeFile', { path: nombre, data: texto, directory: 'CACHE', encoding: 'utf8' })
    .then(function (r) {
      if (!r || !r.uri) return null;
      return paceAndroidLlamar('Share', 'share', { title: nombre, files: [r.uri] });
    });
  return true;
}

/* '/privacy' en la web; la pagina publicada en Android. */
function paceEnlaceWeb(ruta) {
  return paceEsAndroid() ? PACE_WEB_PUBLICA + ruta : ruta;
}

/* Para las pruebas y para depurar. */
function paceAndroidEstado() {
  return { fondo: _paceAndroid.fondo, permiso: _paceAndroid.permiso, programado: _paceAndroid.programado,
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
    document.addEventListener('visibilitychange', function () { paceAndroidFondo(document.visibilityState === 'hidden'); });
  } catch (e) {}
  paceAndroidLlamar('LocalNotifications', 'checkPermissions').then(paceAndroidGuardarPermiso);
}

try { paceAndroidArrancar(); } catch (e) {}

Object.assign(window, {
  paceEsAndroid, paceAndroidPlugin, paceAndroidAtras, paceAndroidAvisos, paceAndroidAvisoPermiso,
  paceAndroidAvisoPedir, paceAndroidFoco, paceAndroidGuardarArchivo, paceEnlaceWeb, paceAndroidEstado,
});
