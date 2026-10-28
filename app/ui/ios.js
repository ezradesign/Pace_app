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
   cuenta la propia app y sonarian los dos. Es la regla de Android
   (android.avisos.js) sin las «alarmas exactas», que iOS no tiene: entrega el
   aviso a su hora sin pedir mas. Y con sus mismas cuatro piezas:

   - EN FILA. Programar y quitar tardan, y la respuesta de programar puede llegar
     despues de que se pida quitarlo. Todo va en fila (`_paceIos.cola`) y cada
     paso compara lo que deberia haber con lo que iOS CONFIRMO (`puesto`, el
     final del bloque cuyo aviso tiene); uno que no se pudo quitar se vuelve a
     quitar al pausar o al reiniciar.
   - PUESTO SOLO CUANDO iOS CONTESTA. Si `schedule` falla no hay aviso: `fallo`
     lo dice (Ajustes lo cuenta) y la campana la pone PACE. `puesto` se guarda en
     `pace.ios.aviso`, porque iOS puede cerrar PACE en el fondo con el aviso
     puesto y el proceso siguiente tiene que saberlo.
   - UNA SOLA CAMPANA. Si iOS tenia el aviso de un bloque, la campana de ese
     bloque es suya y PACE no toca la suya (`paceIosCampana`): ni al volver, ni al
     abrir PACE despues de que iOS la cerrara. Un aviso cuya hora ya paso no se
     quita: ya sono. Si no lo tenia (sin permiso o fallido), suena PACE.
   - EL PERMISO. Solo se programa con el permiso dado: sin el, iOS guarda el
     aviso sin enseñarlo y la campana de PACE callaria por el. Al volver se mira
     otra vez (puede venir de los Ajustes del iPhone) y `pace:avisos-nativo`
     repinta Ajustes. La pregunta de iOS deja la app inactiva, y PACE se cree en
     el fondo mientras se contesta: el si que llega entonces pone el aviso.

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
var PACE_IOS_AVISO_CLAVE = 'pace.ios.aviso';

/* Lo que dejo el proceso anterior. Sin la clave (una version de antes de guardarla) no se sabe
   si dejo un aviso puesto: `quizas`, y lo primero que se recoloca con la app delante lo quita. */
function paceIosAvisoLeer() {
  try {
    var crudo = localStorage.getItem(PACE_IOS_AVISO_CLAVE);
    if (crudo === null) return { puesto: null, quizas: true };
    var v = JSON.parse(crudo);
    return { puesto: v && typeof v.puesto === 'number' ? v.puesto : null, quizas: false };
  } catch (e) { return { puesto: null, quizas: true }; }
}

function paceIosAvisoGuardar() {
  try { localStorage.setItem(PACE_IOS_AVISO_CLAVE, JSON.stringify({ puesto: _paceIos.puesto })); } catch (e) {}
}

var _paceIosLeido = paceIosAvisoLeer();
var _paceIos = { fondo: false, permiso: 'default', foco: null,
  puesto: _paceIosLeido.puesto, quizas: _paceIosLeido.quizas, fallo: null, cola: Promise.resolve(),
  audio: false, despertares: 0 };

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

/* Una llamada nativa que nunca rompe: sin complemento, o si falla, da null. Para lo que da
   igual si salio (los permisos que se miran). */
function paceIosLlamar(nombre, metodo, opciones) {
  return paceIosPedir(nombre, metodo, opciones).catch(function () { return null; });
}

/* La misma llamada, pero el error llega a quien pregunta: sin complemento da null, y si iOS
   falla, la promesa se rechaza. Para lo que hay que saber si salio: un aviso puesto o quitado. */
function paceIosPedir(nombre, metodo, opciones) {
  try {
    var p = paceIosPlugin(nombre);
    if (!p || typeof p[metodo] !== 'function') return Promise.resolve(null);
    return Promise.resolve(p[metodo](opciones));
  } catch (e) { return Promise.reject(e); }
}

/* --- Aviso de fin de Foco ------------------------------------------------- */

function paceIosAvisos() {
  return !!paceIosPlugin('LocalNotifications');
}

/* Ajustes escucha `pace:avisos-nativo` para pintarse con el permiso nuevo o con un aviso que
   iOS no dejo poner. */
function paceIosAvisoContar() {
  try { window.dispatchEvent(new CustomEvent('pace:avisos-nativo')); } catch (e) {}
}

/* 'granted' | 'denied' | 'default', lo mismo que Notification.permission. */
function paceIosAvisoPermiso() {
  return _paceIos.permiso;
}

function paceIosGuardarPermiso(r) {
  var d = r && r.display;
  var antes = _paceIos.permiso;
  if (d === 'granted' || d === 'denied') _paceIos.permiso = d;
  else if (d) _paceIos.permiso = 'default';
  /* Con el permiso nuevo cambia lo que deberia haber: el si que llega con la app inactiva por
     la pregunta de iOS tambien pone el aviso. */
  if (_paceIos.permiso !== antes) { paceIosAvisoContar(); paceIosAvisoRecolocar(); }
  return _paceIos.permiso;
}

/* Muestra la pregunta de iOS (solo la primera vez) y devuelve como ha quedado. */
function paceIosAvisoPedir() {
  return paceIosLlamar('LocalNotifications', 'requestPermissions').then(paceIosGuardarPermiso);
}

function paceIosAvisoPermisoMirar() {
  return paceIosLlamar('LocalNotifications', 'checkPermissions').then(paceIosGuardarPermiso);
}

/* El ultimo `schedule` que iOS no acepto, o null. Lo enseña Ajustes. */
function paceIosAvisoFallo() {
  return _paceIos.fallo;
}

/* FocusTimer cuenta, por nativo.js, cuando acaba el bloque en marcha (ms) y con
   que textos avisar, o null si no hay bloque o el aviso esta apagado. `fin` da
   los de «A tu ritmo» y se lee al programarlo (`paceNativoTextosFin`). */
function paceIosFoco(endsAt, textos) {
  _paceIos.foco = endsAt
    ? { endsAt: endsAt, title: (textos && textos.title) || 'PACE', body: (textos && textos.body) || '',
        fin: textos && typeof textos.fin === 'function' ? textos.fin : null }
    : null;
  paceIosAvisoRecolocar();
}

function paceIosFondo(fondo) {
  if (_paceIos.fondo === !!fondo) return;
  _paceIos.fondo = !!fondo;
  /* Al volver puede venir de los Ajustes del iPhone con los avisos cambiados. */
  if (!fondo) paceIosAvisoPermisoMirar();
  paceIosAvisoRecolocar();
}

/* Un paso detras de otro; uno que falla no para la fila. */
function paceIosAvisoEnFila(paso) {
  _paceIos.cola = _paceIos.cola.then(paso).catch(function () {});
  return _paceIos.cola;
}

function paceIosAvisoRecolocar() {
  return paceIosAvisoEnFila(paceIosAvisoAjustar);
}

/* Lo que deberia haber, frente a lo que iOS confirmo. */
function paceIosAvisoAjustar() {
  var a = _paceIos, f = a.foco, ahora = Date.now();
  var quiere = a.fondo && f && f.endsAt > ahora && a.permiso === 'granted' && paceIosAvisos() ? f : null;
  if (quiere) {
    if (a.puesto === quiere.endsAt) return null;
    var textos = paceNativoTextosFin(quiere);
    return paceIosPedir('LocalNotifications', 'schedule', { notifications: [{
      id: PACE_IOS_AVISO_FOCO_ID, title: textos.title, body: textos.body,
      schedule: { at: new Date(quiere.endsAt) },
    }] }).then(function () {
      a.puesto = quiere.endsAt;
      a.quizas = false;
      a.fallo = null;
      paceIosAvisoGuardar();
      paceIosAvisoContar();
    }, function (e) {
      a.fallo = String((e && e.message) || e || 'error');
      paceIosAvisoContar();
    });
  }
  /* Sin bloque que avisar en el fondo: se quita lo que aun no ha llegado. Lo que ya llego a su
     hora no se toca (ya sono), y su campana es de iOS. */
  if (!a.quizas && (a.puesto === null || a.puesto <= ahora)) return null;
  return paceIosPedir('LocalNotifications', 'cancel', { notifications: [{ id: PACE_IOS_AVISO_FOCO_ID }] }).then(function () {
    a.puesto = null;
    a.quizas = false;
    paceIosAvisoGuardar();
  });
}

/* FocusTimer pregunta aqui, por nativo.js, antes de tocar la campana de un bloque que acababa
   en `fin`: `sonar` se llama si la campana es de PACE, y no si es de iOS, que tenia el aviso de
   ese bloque. Va en la fila, detras de lo que se recoloco al volver. */
function paceIosCampana(fin, sonar) {
  return paceIosAvisoEnFila(function () {
    if (fin && _paceIos.puesto === fin) return;
    try { sonar(); } catch (e) {}
  });
}

/* --- La copia de «Tus datos» ---------------------------------------------- */

/* false si no es el iPhone. Si lo es, una promesa con lo que pasó, como en Android
   (`paceAndroidGuardarArchivo`): 'compartida', 'cancelada' o 'fallo'; `alAbrir`, al abrirse la
   hoja con el archivo ya escrito. `paceIosLlamar` se traga el rechazo, y con él la cancelación. */
function paceIosGuardarArchivo(nombre, texto, alAbrir) {
  var fs = paceIosPlugin('Filesystem'), hoja = paceIosPlugin('Share');
  if (!fs || !hoja || typeof fs.writeFile !== 'function' || typeof hoja.share !== 'function') return false;
  return Promise.resolve()
    .then(function () { return fs.writeFile({ path: nombre, data: texto, directory: 'CACHE', encoding: 'utf8' }); })
    .then(function (r) {
      if (!r || !r.uri) return 'fallo';
      try { if (typeof alAbrir === 'function') alAbrir(); } catch (e) {}
      return Promise.resolve(hoja.share({ title: nombre, files: [r.uri] })).then(
        function () { return 'compartida'; },
        function (e) { return /cancel/i.test(String((e && e.message) || e)) ? 'cancelada' : 'fallo'; });
    })
    .catch(function () { return 'fallo'; });
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
  var a = _paceIos;
  return { fondo: a.fondo, permiso: a.permiso, programado: a.puesto !== null, puesto: a.puesto, fallo: a.fallo,
           foco: a.foco ? a.foco.endsAt : null, audio: a.audio, despertares: a.despertares };
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
  paceIosAvisoPermisoMirar();
}

try { paceIosArrancar(); } catch (e) {}

Object.assign(window, {
  paceEsIos, paceIosPlugin, paceIosAvisos, paceIosAvisoPermiso, paceIosAvisoPedir, paceIosAvisoFallo, paceIosFoco,
  paceIosCampana, paceIosGuardarArchivo, paceIosEstado,
});
