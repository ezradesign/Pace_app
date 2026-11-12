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
   `pace:avisos-nativo`, el mismo del iPhone, para que Ajustes se pinte con lo nuevo.

   LO QUE DICE: con «A tu ritmo», la pausa que viene detras del bloque, como el aviso de la web
   al acabar (`paceNativoTextosFin`, nativo.js); se lee al programarlo, como el aviso fijo.

   EL AVISO FIJO CON EL MOVIL BLOQUEADO (Ez, N4 A del 27 oct. 2026): mientras un Foco corre con
   la app en el fondo, Android enseña lo que queda, que cuenta solo, con el bloque y lo que viene
   detras (`ritmoAvisoFijo`). Lo pinta una pieza propia, PaceAvisoFijo, porque el complemento no
   sabe poner una cuenta atras. Va con «Aviso al terminar» y el mismo permiso, en la misma fila:
   sale al irse al fondo, se va al volver, al pausar o al reiniciar, y al acabar lo quita Android
   solo. No suena nunca: el que suena es el de fin. Sin botones; la pieza esta lista para ellos.

   EL FIN DE LA PAUSA (auditoria externa 4.F2 y 4.F3, 12 nov. 2026): una pausa que corre con la
   app en el fondo avisa al acabar, como el bloque, y con su propio sonido, para saber sin mirar
   si toca parar o volver. Es otro aviso (id 3), con su `pausaPuesto` en la misma clave y en la
   misma fila, y la misma regla de una sola campana: si Android tenia el aviso de esa pausa, PACE
   no toca la suya. Con «A tu ritmo» se pide ya con el bloque en marcha, porque la pausa empieza
   sola cuando el bloque acaba, aunque nadie abra PACE. EL SONIDO VA EN EL CANAL, y en Android
   el sonido de un canal no se cambia una vez creado: `pace_pausa` suena `res/raw/pausa_aviso`
   (por su nombre, asi que cambiarlo es sustituir el archivo) y `pace_pausa_mudo`, de importancia
   baja, no suena, para quien apaga el sonido en Ajustes. El de fin de Foco va igual, por
   `pace_fin_foco` con la campana de PACE (`res/raw/campana_aviso`) o `pace_fin_foco_mudo`
   (Ez, P3 A del 12 nov.).

   A SU HORA: desde Android 12 una alarma exacta pide el permiso «Alarmas y
   recordatorios», y desde Android 14 viene apagado. Sin el, Android puede
   retrasar el aviso unos minutos. El complemento, si no lo tiene, abre esa
   pantalla de ajustes en cada `schedule()`, y aqui eso pasaria al salir de la
   app con un Foco en marcha: por eso solo se pide exacta si ya esta concedido,
   y el permiso se ofrece desde Ajustes, con un toque de la persona.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var PACE_AVISO_FOCO_ID = 1; // un solo aviso de fin de Foco a la vez
var PACE_AVISO_PAUSA_ID = 3; // y uno de fin de pausa (el 2 es el aviso fijo)
var PACE_AVISO_CLAVE = 'pace.android.aviso';
var PACE_AVISO_CANAL_PAUSA = 'pace_pausa';
var PACE_AVISO_CANAL_PAUSA_MUDO = 'pace_pausa_mudo';
var PACE_AVISO_SONIDO_PAUSA = 'pausa_aviso.wav';
/* El fin del Foco con la campana de PACE (Ez, P3 A del 12 nov. 2026), como en el iPhone desde la
   D-10 B. Canales nuevos y suyos: el «Default» del complemento, por el que iba, ya existe en los
   moviles con PACE y su sonido (el del movil) no se puede cambiar; y no es el del aviso fijo
   (`pace_foco_en_marcha`, PaceAvisoFijo.java), que no suena nunca. */
var PACE_AVISO_CANAL_FIN = 'pace_fin_foco';
var PACE_AVISO_CANAL_FIN_MUDO = 'pace_fin_foco_mudo';
var PACE_AVISO_SONIDO_FIN = 'campana_aviso.wav';

/* Lo que dejo el proceso anterior. Sin la clave (una version de antes de guardarla) no se sabe
   si dejo un aviso puesto: `quizas`, y lo primero que se recoloca con la app delante lo quita
   (caza del 10 oct., foco-4). */
function paceAndroidAvisoLeer() {
  try {
    var crudo = localStorage.getItem(PACE_AVISO_CLAVE);
    if (crudo === null) return { puesto: null, quizas: true, pausa: null };
    var v = JSON.parse(crudo);
    return { puesto: v && typeof v.puesto === 'number' ? v.puesto : null, quizas: false,
             pausa: v && typeof v.pausa === 'number' ? v.pausa : null };
  } catch (e) { return { puesto: null, quizas: true, pausa: null }; }
}

function paceAndroidAvisoGuardar() {
  var a = _paceAvisoAndroid;
  try { localStorage.setItem(PACE_AVISO_CLAVE, JSON.stringify({ puesto: a.puesto, pausa: a.pausaPuesto })); } catch (e) { paceAvisarNoGuarda(e); }
}

var _paceAvisoAndroidLeido = paceAndroidAvisoLeer();
var _paceAvisoAndroid = {
  fondo: false, permiso: 'default', exacta: 'default', foco: null,
  puesto: _paceAvisoAndroidLeido.puesto, quizas: _paceAvisoAndroidLeido.quizas,
  /* el aviso fijo que Android enseña (el final de su bloque), o null; al arrancar no se sabe si
     el proceso anterior dejó uno, y lo primero que se recoloca con la app delante lo quita */
  fijo: null, fijoQuizas: true,
  /* el fin de la pausa: la que se quiere avisar y la que Android confirmo (el final, en ms) */
  pausa: null, pausaPuesto: _paceAvisoAndroidLeido.pausa, pausaFallo: null,
  fallo: null, cola: Promise.resolve(),
};

function paceAndroidAvisos() {
  return !!paceAndroidPlugin('LocalNotifications');
}

/* Ajustes escucha `pace:avisos-nativo` para pintarse con el permiso nuevo. */
function paceAndroidAvisoContar() {
  try { window.dispatchEvent(new CustomEvent('pace:avisos-nativo')); } catch (e) {}
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
        fin: textos && typeof textos.fin === 'function' ? textos.fin : null,
        fijo: textos && typeof textos.fijo === 'function' ? textos.fijo : null }
    : null;
  paceAndroidAvisoRecolocar();
}

/* FocusTimer cuenta aqui cuando acaba la pausa que corre (o la que empezara sola al acabar el
   bloque, con «A tu ritmo») y con que textos avisar, o null. */
function paceAndroidPausa(endsAt, textos) {
  _paceAvisoAndroid.pausa = endsAt
    ? { endsAt: endsAt, title: (textos && textos.title) || 'PACE', body: (textos && textos.body) || '' }
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
    .then(function () { return paceAndroidAvisoAjustarFijo(quiere); }).catch(function () {})
    .then(paceAndroidAvisoAjustarPausa);
}

/* El fin de la pausa: lo mismo que el de fin de Foco, con su id y su canal. */
function paceAndroidAvisoAjustarPausa() {
  var a = _paceAvisoAndroid, p = a.pausa, ahora = Date.now();
  var quiere = a.fondo && p && p.endsAt > ahora && a.permiso === 'granted' ? p : null;
  if (quiere) {
    if (a.pausaPuesto === quiere.endsAt) return null;
    return paceAndroidPedir('LocalNotifications', 'schedule', { notifications: [{
      id: PACE_AVISO_PAUSA_ID, title: quiere.title, body: quiere.body,
      schedule: { at: new Date(quiere.endsAt).toISOString(), allowWhileIdle: true },
      isExactNotification: a.exacta === 'granted',
      channelId: paceAndroidSonidoOn() ? PACE_AVISO_CANAL_PAUSA : PACE_AVISO_CANAL_PAUSA_MUDO,
    }] }).then(function () {
      a.pausaPuesto = quiere.endsAt;
      a.pausaFallo = null;
      paceAndroidAvisoGuardar();
    }, function (e) { a.pausaFallo = String((e && e.message) || e || 'error'); });
  }
  /* Lo que ya llego a su hora no se toca: esta sonando, y su campana es de Android. Y EN EL FONDO
     NO SE QUITA: con PACE detras nadie puede parar la pausa, y entre el fin del bloque y el
     arranque de su pausa hay un momento en que no corre nada; si Android congelara PACE justo
     despues de quitarlo, la pausa se quedaria sin aviso. Se quita al volver, si ya no corre. */
  if (a.fondo || a.pausaPuesto === null || a.pausaPuesto <= ahora) return null;
  return paceAndroidPedir('LocalNotifications', 'cancel', { notifications: [{ id: PACE_AVISO_PAUSA_ID }] }).then(function () {
    a.pausaPuesto = null;
    paceAndroidAvisoGuardar();
  });
}

function paceAndroidSonidoOn() {
  try { var s = typeof getState === 'function' ? getState() : null; return !!(s && s.soundOn); } catch (e) { return false; }
}

/* Un texto en el idioma de la app, para lo que Android enseña fuera de ella (los canales). */
function paceAndroidTexto(clave) {
  try {
    var s = typeof getState === 'function' ? getState() : null, l = (s && s.lang) || 'en', t = window.PACE_STRINGS || {};
    return (t[l] && t[l][clave]) || (t.en && t.en[clave]) || clave;
  } catch (e) { return clave; }
}

/* Los canales del fin del Foco y del fin de la pausa, cada uno con sonido y mudo. Crear uno que ya
   existe solo cambia su nombre (el idioma), nunca su sonido: el sonido es el del archivo de res/raw
   que nombra. Un canal mudo de verdad va con importancia baja: sin `sound`, el complemento le deja
   el sonido de siempre del movil. */
function paceAndroidCanales() {
  var crear = function (op) { return paceAndroidPedir('LocalNotifications', 'createChannel', op).catch(function () {}); };
  var par = function (canal, mudo, clave, sonido) {
    var desc = paceAndroidTexto(clave + '.desc');
    return crear({ id: canal, name: paceAndroidTexto(clave), description: desc, importance: 3, sound: sonido })
      .then(function () { return crear({ id: mudo, name: paceAndroidTexto(clave + '.mudo'), description: desc, importance: 2 }); });
  };
  return par(PACE_AVISO_CANAL_FIN, PACE_AVISO_CANAL_FIN_MUDO, 'notify.canal.foco', PACE_AVISO_SONIDO_FIN)
    .then(function () { return par(PACE_AVISO_CANAL_PAUSA, PACE_AVISO_CANAL_PAUSA_MUDO, 'notify.canal.pausa', PACE_AVISO_SONIDO_PAUSA); });
}

function paceAndroidAvisoAjustarFin(quiere) {
  var a = _paceAvisoAndroid, ahora = Date.now();
  if (quiere) {
    if (a.puesto === quiere.endsAt) return null;
    var textos = paceNativoTextosFin(quiere);
    return paceAndroidPedir('LocalNotifications', 'schedule', { notifications: [{
      id: PACE_AVISO_FOCO_ID, title: textos.title, body: textos.body,
      /* el formato exacto que lee el complemento: ISO en UTC con milisegundos */
      schedule: { at: new Date(quiere.endsAt).toISOString(), allowWhileIdle: true },
      isExactNotification: a.exacta === 'granted',
      channelId: paceAndroidSonidoOn() ? PACE_AVISO_CANAL_FIN : PACE_AVISO_CANAL_FIN_MUDO,
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
    if (fin && (a.puesto === fin || a.pausaPuesto === fin)) return;
    try { sonar(); } catch (e) {}
  });
}

/* Para las pruebas y para depurar. */
function paceAndroidEstado() {
  var a = _paceAvisoAndroid;
  return { fondo: a.fondo, permiso: a.permiso, exacta: a.exacta, programado: a.puesto !== null, puesto: a.puesto,
           fallo: a.fallo, fijo: a.fijo, foco: a.foco ? a.foco.endsAt : null, atras: typeof _paceAndroid === 'object' ? _paceAndroid.atras : 0,
           pausa: a.pausa ? a.pausa.endsAt : null, pausaPuesto: a.pausaPuesto, pausaFallo: a.pausaFallo };
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
  /* Los canales, antes que cualquier aviso que los nombre: en la misma fila. */
  paceAndroidAvisoEnFila(paceAndroidCanales);
  paceAndroidAvisoPermisoMirar();
  paceAndroidAvisoExactoMirar();
}

try { paceAndroidAvisosArrancar(); } catch (e) {}

Object.assign(window, {
  paceAndroidAvisos, paceAndroidAvisoPermiso, paceAndroidAvisoPedir, paceAndroidAvisoExacto,
  paceAndroidAvisoExactoMirar, paceAndroidAvisoExactoPedir, paceAndroidAvisoFallo, paceAndroidFoco,
  paceAndroidPausa, paceAndroidCampana, paceAndroidEstado,
});
