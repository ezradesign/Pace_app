/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ios.js — LO QUE EL WKWEBVIEW DEL IPHONE NO TRAE
   ============================================================
   En el iPhone la app es esta misma web dentro del WKWebView de Capacitor, que
   es el motor de Safari. Como en Android, ese WebView no avisa con la app en el
   fondo, no descarga archivos y no sabe mantener la pantalla encendida. Los
   complementos son los mismos que en Android y el lado nativo los inyecta igual
   en `window.Capacitor.Plugins`. Este archivo es el UNICO que les habla en iOS,
   como `android.js` en Android, y el resto de la app no llama a ninguno de los
   dos: pregunta a `nativo.js`. En la web, en el standalone, en Android y en las
   pruebas sin Capacitor nada de esto existe.

   EL AVISO DE FIN DE FOCO: iOS congela el JS de la app al poco de irse al
   fondo, asi que el aviso lo programa el sistema para la hora del final, y SOLO
   mientras la app esta en el fondo: al volver se cancela, porque delante ya lo
   cuenta la propia app y sonarian los dos. Es la regla de Android sin las
   «alarmas exactas», que iOS no tiene: entrega el aviso a su hora sin pedir mas.

   LA FECHA DEL AVISO VA COMO `Date`, NO COMO TEXTO: el puente de iOS pasa el
   objeto tal cual y el complemento solo entiende una fecha (`as? NSDate`). Con
   el texto ISO que necesita Android, iOS no encontraba la hora y el aviso salia
   EN EL ACTO, al irse la app al fondo. Lo vigila `tests/ios-nativo.safari.spec.js`.

   EL PERMISO de avisos lo pregunta iOS una sola vez: si se dice que no, solo se
   cambia en los Ajustes del iPhone. Hasta que se pregunta, el complemento
   contesta 'prompt'; aqui, 'default', lo mismo que Notification.permission.

   EL AUDIO: el AudioContext lo crea `Sound.jsx` y aqui solo se despierta. El
   primer toque lo crea y le da un silencio de una muestra (el desbloqueo de
   siempre en el iPhone), y al volver del fondo, o de una llamada, el siguiente
   toque lo reanuda si se quedo parado ('suspended', o 'interrupted', que es
   solo de WebKit). Con el sonido apagado en Ajustes no se crea nada. Que suene
   o no con el iPhone en silencio lo decide la app nativa (`AppDelegate.swift`,
   categoria «ambient»: como en Safari, decision de Ez del 14 oct.).

   LA COPIA DE «TUS DATOS» se escribe en la cache de la app y se abre la hoja de
   compartir del iPhone, desde la que se guarda en Archivos o se manda por correo.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var PACE_IOS_AVISO_FOCO_ID = 1; // un solo aviso de fin de Foco a la vez, como en Android

/* `programado` nace en true por lo mismo que en Android: iOS pudo cerrar la app
   en el fondo con un aviso puesto, y lo primero que se recoloca con la app
   delante lo cancela. */
var _paceIos = { fondo: false, permiso: 'default', foco: null, programado: true, audio: false, despertares: 0 };

function paceEsIos() {
  try {
    var cap = window.Capacitor;
    return !!(cap && typeof cap.getPlatform === 'function' && cap.getPlatform() === 'ios');
  } catch (e) { return false; }
}

function paceIosPlugin(nombre) {
  try {
    if (!paceEsIos()) return null;
    var lista = window.Capacitor.Plugins;
    return (lista && lista[nombre]) || null;
  } catch (e) { return null; }
}

/* Una llamada nativa que nunca rompe: sin complemento, o si falla, da null. */
function paceIosLlamar(nombre, metodo, opciones) {
  try {
    var p = paceIosPlugin(nombre);
    if (!p || typeof p[metodo] !== 'function') return Promise.resolve(null);
    return Promise.resolve(p[metodo](opciones)).catch(function () { return null; });
  } catch (e) { return Promise.resolve(null); }
}

/* --- Aviso de fin de Foco ------------------------------------------------- */

function paceIosAvisos() {
  return !!paceIosPlugin('LocalNotifications');
}

/* 'granted' | 'denied' | 'default', lo mismo que Notification.permission. */
function paceIosAvisoPermiso() {
  return _paceIos.permiso;
}

function paceIosGuardarPermiso(r) {
  var d = r && r.display;
  if (d === 'granted' || d === 'denied') _paceIos.permiso = d;
  else if (d) _paceIos.permiso = 'default';
  return _paceIos.permiso;
}

/* Muestra la pregunta de iOS (solo la primera vez) y devuelve como ha quedado. */
function paceIosAvisoPedir() {
  return paceIosLlamar('LocalNotifications', 'requestPermissions').then(paceIosGuardarPermiso);
}

/* FocusTimer cuenta, por nativo.js, cuando acaba el bloque en marcha (ms) y con
   que textos avisar, o null si no hay bloque o el aviso esta apagado. */
function paceIosFoco(endsAt, textos) {
  _paceIos.foco = endsAt
    ? { endsAt: endsAt, title: (textos && textos.title) || 'PACE', body: (textos && textos.body) || '' }
    : null;
  paceIosAvisoRecolocar();
}

function paceIosFondo(fondo) {
  if (_paceIos.fondo === !!fondo) return;
  _paceIos.fondo = !!fondo;
  paceIosAvisoRecolocar();
}

function paceIosAvisoRecolocar() {
  var f = _paceIos.foco;
  if (_paceIos.fondo && f && f.endsAt > Date.now()) {
    _paceIos.programado = true;
    paceIosLlamar('LocalNotifications', 'schedule', { notifications: [{
      id: PACE_IOS_AVISO_FOCO_ID, title: f.title, body: f.body,
      schedule: { at: new Date(f.endsAt) },
    }] });
    return;
  }
  if (!_paceIos.programado) return;
  _paceIos.programado = false;
  paceIosLlamar('LocalNotifications', 'cancel', { notifications: [{ id: PACE_IOS_AVISO_FOCO_ID }] });
}

/* --- La copia de «Tus datos» ---------------------------------------------- */

/* true si la ha mandado a la hoja de compartir; false si no es el iPhone. */
function paceIosGuardarArchivo(nombre, texto) {
  if (!paceIosPlugin('Filesystem') || !paceIosPlugin('Share')) return false;
  paceIosLlamar('Filesystem', 'writeFile', { path: nombre, data: texto, directory: 'CACHE', encoding: 'utf8' })
    .then(function (r) {
      if (!r || !r.uri) return null;
      return paceIosLlamar('Share', 'share', { title: nombre, files: [r.uri] });
    });
  return true;
}

/* --- El audio ------------------------------------------------------------- */

function paceIosAudioDespertar() {
  try {
    var s = typeof getState === 'function' ? getState() : null;
    if (!s || !s.soundOn || typeof window.paceAudioCtx !== 'function') return;
    var ctx = window.paceAudioCtx();
    if (!ctx) return;
    if (ctx.state !== 'running' && ctx.state !== 'closed' && typeof ctx.resume === 'function') {
      _paceIos.despertares++;
      var p = ctx.resume();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }
    if (!_paceIos.audio) {
      _paceIos.audio = true;
      var fuente = ctx.createBufferSource();
      fuente.buffer = ctx.createBuffer(1, 1, ctx.sampleRate || 44100);
      fuente.connect(ctx.destination);
      fuente.start(0);
    }
  } catch (e) { /* el sonido nunca rompe la app */ }
}

/* --- Para las pruebas y para depurar -------------------------------------- */

function paceIosEstado() {
  return { fondo: _paceIos.fondo, permiso: _paceIos.permiso, programado: _paceIos.programado,
           foco: _paceIos.foco ? _paceIos.foco.endsAt : null, audio: _paceIos.audio, despertares: _paceIos.despertares };
}

function paceIosArrancar() {
  if (!paceEsIos()) return;
  var app = paceIosPlugin('App');
  if (app && typeof app.addListener === 'function') {
    try {
      app.addListener('appStateChange', function (s) { paceIosFondo(!(s && s.isActive)); });
    } catch (e) {}
  }
  /* El WebView tambien se oculta al irse al fondo; lo que llegue antes manda. */
  try {
    document.addEventListener('visibilitychange', function () {
      paceIosFondo(document.visibilityState === 'hidden');
    });
  } catch (e) {}
  /* En captura, para llegar antes que cualquier sonido que dispare el mismo toque. */
  try {
    ['touchend', 'click', 'keydown'].forEach(function (tipo) {
      document.addEventListener(tipo, paceIosAudioDespertar, { capture: true, passive: true });
    });
  } catch (e) {}
  paceIosLlamar('LocalNotifications', 'checkPermissions').then(paceIosGuardarPermiso);
}

try { paceIosArrancar(); } catch (e) {}

Object.assign(window, {
  paceEsIos, paceIosPlugin, paceIosAvisos, paceIosAvisoPermiso, paceIosAvisoPedir, paceIosFoco,
  paceIosGuardarArchivo, paceIosEstado,
});
