/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   android.avisos.js — EL AVISO DE FIN DE FOCO EN ANDROID
   ============================================================
   Con la app en el fondo Android congela su JS, asi que el aviso no puede salir
   de la web cuando acaba el bloque, como en el navegador. Lo programa el sistema
   para la hora del final, y SOLO mientras la app esta en el fondo: delante ya lo
   cuenta la propia app. Habla con el complemento por `paceAndroidLlamar` y
   `paceAndroidPedir` (android.js).

   EN FILA. Programar y quitar son llamadas que tardan, y la respuesta de
   programar puede llegar despues de que se pida quitarlo. Todo lo que se le pide
   al complemento va en fila (`_paceAvisoAndroid.cola`), y cada paso compara lo
   que deberia haber con lo que Android CONFIRMO (`puesto`, el final del bloque
   cuyo aviso tiene). Asi, un aviso pedido al salir y quitado al volver no se
   queda puesto por contestar tarde, y uno que no se pudo quitar se vuelve a
   quitar al pausar o al reiniciar.

   PUESTO SOLO CUANDO ANDROID CONTESTA. Si `schedule` falla, no hay aviso:
   `fallo` lo dice (Ajustes lo cuenta) y la campana del final la pone PACE.
   `puesto` se guarda en `pace.android.aviso`, porque Android puede cerrar PACE
   en el fondo con el aviso puesto y el proceso siguiente tiene que saberlo.

   UNA SOLA CAMPANA. Un aviso cuya hora ya paso no se quita: esta sonando, o
   sonara en cuanto Android lo entregue (sin «Alarmas y recordatorios» llega unos
   minutos tarde). Por eso, si Android tenia el aviso de un bloque, la campana de
   ese bloque es suya y PACE no toca la suya (`paceAndroidCampana`): ni con el
   bloque acabando en el fondo, ni al volver, ni al abrir PACE despues de que
   Android la cerrara. Si no lo tenia (sin permiso, apagado o fallido), suena PACE.

   EL PERMISO. Solo se programa con el permiso dado: sin el, el complemento lo
   pediria en el acto, con la app ya en el fondo. Al volver a la app se mira otra
   vez (puede venir de los ajustes de Android) y se avisa con el evento
   `pace:avisos-android` para que Ajustes se pinte con lo nuevo.

   EL AVISO FIJO CON EL MOVIL BLOQUEADO (Ez, N4 A del 27 oct. 2026): mientras un Foco corre con
   la app en el fondo, Android enseña lo que queda, que cuenta solo, con el bloque y lo que viene
   detras (`ritmoAvisoFijo`). Lo pinta una pieza propia, PaceAvisoFijo, porque el complemento no
   sabe poner una cuenta atras. Va con «Aviso al terminar» y el mismo permiso, en la misma fila:
   sale al irse al fondo, se va al volver, al pausar o al reiniciar, y al acabar lo quita Android
   solo. No suena nunca: el que suena es el de fin. Sin botones; la pieza esta lista para ellos.

   A SU HORA: desde Android 12 una alarma exacta pide el permiso «Alarmas y
   recordatorios», y desde Android 14 viene apagado. Sin el, Android puede
   retrasar el aviso unos minutos. El complemento, si no lo tiene, abre esa
   pantalla de ajustes en cada `schedule()`, y aqui eso pasaria al salir de la
   app con un Foco en marcha: por eso solo se pide exacta si ya esta concedido,
   y el permiso se ofrece desde Ajustes, con un toque de la persona.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var PACE_AVISO_FOCO_ID = 1; // un solo aviso de fin de Foco a la vez
var PACE_AVISO_CLAVE = 'pace.android.aviso';

/* Lo que dejo el proceso anterior. Sin la clave (una version de antes de guardarla) no se sabe
   si dejo un aviso puesto: `quizas`, y lo primero que se recoloca con la app delante lo quita
   (caza del 10 oct., foco-4). */
function paceAndroidAvisoLeer() {
  try {
    var crudo = localStorage.getItem(PACE_AVISO_CLAVE);
    if (crudo === null) return { puesto: null, quizas: true };
    var v = JSON.parse(crudo);
    return { puesto: v && typeof v.puesto === 'number' ? v.puesto : null, quizas: false };
  } catch (e) { return { puesto: null, quizas: true }; }
}

function paceAndroidAvisoGuardar() {
  try { localStorage.setItem(PACE_AVISO_CLAVE, JSON.stringify({ puesto: _paceAvisoAndroid.puesto })); } catch (e) {}
}

var _paceAvisoAndroidLeido = paceAndroidAvisoLeer();
var _paceAvisoAndroid = {
  fondo: false, permiso: 'default', exacta: 'default', foco: null,
  puesto: _paceAvisoAndroidLeido.puesto, quizas: _paceAvisoAndroidLeido.quizas,
  /* el aviso fijo que Android enseña (el final de su bloque), o null; al arrancar no se sabe si
     el proceso anterior dejó uno, y lo primero que se recoloca con la app delante lo quita */
  fijo: null, fijoQuizas: true,
  fallo: null, cola: Promise.resolve(),
};

function paceAndroidAvisos() {
  return !!paceAndroidPlugin('LocalNotifications');
}

/* Ajustes escucha `pace:avisos-android` para pintarse con el permiso nuevo. */
function paceAndroidAvisoContar() {
  try { window.dispatchEvent(new CustomEvent('pace:avisos-android')); } catch (e) {}
}

/* 'granted' | 'denied' | 'default', lo mismo que Notification.permission. */
function paceAndroidAvisoPermiso() {
  return _paceAvisoAndroid.permiso;
}

function paceAndroidGuardarPermiso(r) {
  var d = r && r.display;
  var antes = _paceAvisoAndroid.permiso;
  if (d === 'granted' || d === 'denied') _paceAvisoAndroid.permiso = d;
  else if (d) _paceAvisoAndroid.permiso = 'default';
  /* Con el permiso nuevo cambia lo que debería haber: el que llega con la app ya en el fondo
     (la primera respuesta al arrancar) también pone el aviso. */
  if (_paceAvisoAndroid.permiso !== antes) { paceAndroidAvisoContar(); paceAndroidAvisoRecolocar(); }
  return _paceAvisoAndroid.permiso;
}

/* Muestra el dialogo de Android (13 o mas); antes de 13 contesta sin mostrar
   nada. Devuelve el permiso resultante. */
function paceAndroidAvisoPedir() {
  return paceAndroidLlamar('LocalNotifications', 'requestPermissions').then(paceAndroidGuardarPermiso);
}

function paceAndroidAvisoPermisoMirar() {
  return paceAndroidLlamar('LocalNotifications', 'checkPermissions').then(paceAndroidGuardarPermiso);
}

/* 'granted' | 'denied' | 'default' (aun sin mirar) para «Alarmas y recordatorios». */
function paceAndroidAvisoExacto() {
  return _paceAvisoAndroid.exacta;
}

function paceAndroidGuardarExacta(r) {
  var e = r && r.exact_alarm;
  var antes = _paceAvisoAndroid.exacta;
  if (e === 'granted' || e === 'denied') _paceAvisoAndroid.exacta = e;
  if (_paceAvisoAndroid.exacta !== antes) paceAndroidAvisoContar();
  return _paceAvisoAndroid.exacta;
}

function paceAndroidAvisoExactoMirar() {
  return paceAndroidLlamar('LocalNotifications', 'checkExactNotificationSetting').then(paceAndroidGuardarExacta);
}

/* Abre la pantalla de Android y, al volver, devuelve como ha quedado. */
function paceAndroidAvisoExactoPedir() {
  return paceAndroidLlamar('LocalNotifications', 'changeExactNotificationSetting').then(paceAndroidGuardarExacta);
}

/* El ultimo `schedule` que Android no acepto, o null. Lo enseña Ajustes. */
function paceAndroidAvisoFallo() {
  return _paceAvisoAndroid.fallo;
}

/* FocusTimer cuenta aqui cuando acaba el bloque en marcha (ms) y con que
   textos avisar, o null si no hay bloque o el aviso esta apagado. */
function paceAndroidFoco(endsAt, textos) {
  _paceAvisoAndroid.foco = endsAt
    ? { endsAt: endsAt, title: (textos && textos.title) || 'PACE', body: (textos && textos.body) || '',
        fijo: textos && typeof textos.fijo === 'function' ? textos.fijo : null }
    : null;
  paceAndroidAvisoRecolocar();
}

function paceAndroidFondo(fondo) {
  if (_paceAvisoAndroid.fondo === !!fondo) return;
  _paceAvisoAndroid.fondo = !!fondo;
  /* Al volver puede venir de los ajustes de Android con los permisos cambiados. */
  if (!fondo) { paceAndroidAvisoPermisoMirar(); paceAndroidAvisoExactoMirar(); }
  paceAndroidAvisoRecolocar();
}

/* Un paso detras de otro; uno que falla no para la fila. */
function paceAndroidAvisoEnFila(paso) {
  var a = _paceAvisoAndroid;
  a.cola = a.cola.then(paso).catch(function () {});
  return a.cola;
}

function paceAndroidAvisoRecolocar() {
  return paceAndroidAvisoEnFila(paceAndroidAvisoAjustar);
}

/* Lo que deberia haber, frente a lo que Android confirmo: el aviso de fin y el fijo. Que falle
   uno no quita el otro. */
function paceAndroidAvisoAjustar() {
  var a = _paceAvisoAndroid, f = a.foco;
  var quiere = a.fondo && f && f.endsAt > Date.now() && a.permiso === 'granted' ? f : null;
  return Promise.resolve().then(function () { return paceAndroidAvisoAjustarFin(quiere); }).catch(function () {})
    .then(function () { return paceAndroidAvisoAjustarFijo(quiere); });
}

function paceAndroidAvisoAjustarFin(quiere) {
  var a = _paceAvisoAndroid, ahora = Date.now();
  if (quiere) {
    if (a.puesto === quiere.endsAt) return null;
    return paceAndroidPedir('LocalNotifications', 'schedule', { notifications: [{
      id: PACE_AVISO_FOCO_ID, title: quiere.title, body: quiere.body,
      /* el formato exacto que lee el complemento: ISO en UTC con milisegundos */
      schedule: { at: new Date(quiere.endsAt).toISOString(), allowWhileIdle: true },
      isExactNotification: a.exacta === 'granted',
    }] }).then(function () {
      a.puesto = quiere.endsAt;
      a.quizas = false;
      a.fallo = null;
      paceAndroidAvisoGuardar();
      paceAndroidAvisoContar();
    }, function (e) {
      a.fallo = String((e && e.message) || e || 'error');
      paceAndroidAvisoContar();
      /* Android dice que los avisos estan apagados: que Ajustes lo sepa ya. */
      if (/not enabled|disabled/i.test(a.fallo)) paceAndroidGuardarPermiso({ display: 'denied' });
    });
  }
  /* Sin bloque que avisar en el fondo: se quita lo que aun no ha llegado. Lo que ya llego a su
     hora no se toca (esta sonando o va a sonar), y su campana es de Android. */
  if (!a.quizas && (a.puesto === null || a.puesto <= ahora)) return null;
  return paceAndroidPedir('LocalNotifications', 'cancel', { notifications: [{ id: PACE_AVISO_FOCO_ID }] }).then(function () {
    a.puesto = null;
    a.quizas = false;
    paceAndroidAvisoGuardar();
  });
}

/* El aviso fijo. Sin la pieza (la web, las pruebas viejas) no hay nada que hacer. */
function paceAndroidAvisoAjustarFijo(quiere) {
  var a = _paceAvisoAndroid;
  if (!paceAndroidPlugin('PaceAvisoFijo')) return null;
  var textos = null;
  try { textos = quiere && quiere.fijo ? quiere.fijo() : null; } catch (e) {}
  if (quiere && textos) {
    if (a.fijo === quiere.endsAt) return null;
    return paceAndroidPedir('PaceAvisoFijo', 'poner', { titulo: textos.titulo, texto: textos.texto, hasta: quiere.endsAt }).then(function () {
      a.fijo = quiere.endsAt;
      a.fijoQuizas = false;
    });
  }
  if (a.fijo === null && !a.fijoQuizas) return null;
  return paceAndroidPedir('PaceAvisoFijo', 'quitar').then(function () {
    a.fijo = null;
    a.fijoQuizas = false;
  });
}

/* FocusTimer pregunta aqui antes de tocar la campana de un bloque que acababa en `fin`:
   `sonar` se llama si la campana es de PACE, y no si es de Android, que tenia el aviso de ese
   bloque. Va en la fila, detras de lo que se recoloco al volver. */
function paceAndroidCampana(fin, sonar) {
  return paceAndroidAvisoEnFila(function () {
    var a = _paceAvisoAndroid;
    if (fin && a.puesto === fin) return;
    try { sonar(); } catch (e) {}
  });
}

/* Para las pruebas y para depurar. */
function paceAndroidEstado() {
  var a = _paceAvisoAndroid;
  return { fondo: a.fondo, permiso: a.permiso, exacta: a.exacta, programado: a.puesto !== null, puesto: a.puesto,
           fallo: a.fallo, fijo: a.fijo, foco: a.foco ? a.foco.endsAt : null, atras: typeof _paceAndroid === 'object' ? _paceAndroid.atras : 0 };
}

function paceAndroidAvisosArrancar() {
  if (!paceEsAndroid()) return;
  var app = paceAndroidPlugin('App');
  if (app && typeof app.addListener === 'function') {
    try { app.addListener('appStateChange', function (s) { paceAndroidFondo(!(s && s.isActive)); }); } catch (e) {}
  }
  /* El WebView tambien se oculta al irse al fondo; lo que llegue antes manda. */
  try {
    document.addEventListener('visibilitychange', function () {
      paceAndroidFondo(document.visibilityState === 'hidden');
    });
  } catch (e) {}
  paceAndroidAvisoPermisoMirar();
  paceAndroidAvisoExactoMirar();
}

try { paceAndroidAvisosArrancar(); } catch (e) {}

Object.assign(window, {
  paceAndroidAvisos, paceAndroidAvisoPermiso, paceAndroidAvisoPedir, paceAndroidAvisoExacto,
  paceAndroidAvisoExactoMirar, paceAndroidAvisoExactoPedir, paceAndroidAvisoFallo, paceAndroidFoco,
  paceAndroidCampana, paceAndroidEstado,
});
