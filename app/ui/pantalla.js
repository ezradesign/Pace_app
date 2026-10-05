/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   pantalla.js — LA PANTALLA NO SE APAGA A MITAD DE UNA SESION (s198)
   ============================================================
   Hasta v0.130.0 ninguna sesion pedia mantener la pantalla encendida, y en un
   telefono el bloqueo automatico (30 s en muchos Android) la apagaba a mitad
   de una respiracion guiada o de una plancha: justo cuando no tienes las manos
   para tocarla. Se usa la Screen Wake Lock API (Chrome Android 84, Safari 16.4);
   donde no existe no pasa nada.

   QUIEN LA PIDE: `SessionShell` al montarse, o sea Respira, Mueve, Estira y los
   pasos de un Camino, en sus tres pantallas (preparacion, ejercicio, final). El
   FOCO NO: un bloque de 25 a 45 minutos con la pantalla encendida es bateria, y
   el Pomodoro de la home nunca la ha pedido — `PathFocusStep` pasa
   `pantalla={false}` por coherencia.

   POR QUE UN CONTADOR Y UN RETRASO AL SOLTAR: cada cambio de pantalla de la
   sesion REMONTA `SessionShell` (son ramas distintas), y soltar y volver a pedir
   en el mismo frame es una peticion asincrona por pantalla. La cuenta absorbe el
   relevo y el retraso de 1,5 s evita soltarla entre una rama y la siguiente.

   EL NAVEGADOR LA SUELTA SOLO al ocultarse la pestaña; al volver se pide otra
   vez si sigue habiendo sesion.

   EN ANDROID el WebView no trae Wake Lock: la pide el complemento KeepAwake
   (ui/android.js), que marca la ventana para que no se apague. Esa marca no se
   suelta al irse al fondo, asi que alli no hace falta volver a pedirla.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var _paceLuz = { cuenta: 0, centinela: null, pidiendo: false, soltar: null, pedidas: 0 };

function paceLuzPedir() {
  try {
    var nativa = typeof paceAndroidPlugin === 'function' ? paceAndroidPlugin('KeepAwake') : null;
    if (nativa) {
      if (_paceLuz.centinela) return;
      _paceLuz.pedidas++;
      _paceLuz.centinela = 'android';
      Promise.resolve(nativa.keepAwake()).catch(function () {
        if (_paceLuz.centinela === 'android') _paceLuz.centinela = null;
      });
      return;
    }
    if (!navigator.wakeLock || typeof navigator.wakeLock.request !== 'function') return;
    if (document.visibilityState !== 'visible') return;
    if (_paceLuz.centinela || _paceLuz.pidiendo) return;
    _paceLuz.pidiendo = true;
    _paceLuz.pedidas++;
    navigator.wakeLock.request('screen').then(function (s) {
      _paceLuz.pidiendo = false;
      if (_paceLuz.cuenta === 0) { s.release().catch(function () {}); return; }
      _paceLuz.centinela = s;
      s.addEventListener('release', function () { if (_paceLuz.centinela === s) _paceLuz.centinela = null; });
    }).catch(function () { _paceLuz.pidiendo = false; });
  } catch (e) { _paceLuz.pidiendo = false; }
}

/* paceMantenerPantalla() -> soltar(). Idempotente: soltar dos veces no resta dos. */
function paceMantenerPantalla() {
  _paceLuz.cuenta++;
  if (_paceLuz.soltar) { clearTimeout(_paceLuz.soltar); _paceLuz.soltar = null; }
  paceLuzPedir();
  var hecho = false;
  return function soltar() {
    if (hecho) return;
    hecho = true;
    _paceLuz.cuenta = Math.max(0, _paceLuz.cuenta - 1);
    if (_paceLuz.cuenta > 0) return;
    _paceLuz.soltar = setTimeout(function () {
      _paceLuz.soltar = null;
      if (_paceLuz.cuenta > 0 || !_paceLuz.centinela) return;
      var s = _paceLuz.centinela;
      _paceLuz.centinela = null;
      if (s === 'android') {
        var nativa = typeof paceAndroidPlugin === 'function' ? paceAndroidPlugin('KeepAwake') : null;
        if (nativa) Promise.resolve(nativa.allowSleep()).catch(function () {});
        return;
      }
      try { s.release().catch(function () {}); } catch (e) {}
    }, 1500);
  };
}

/* Para las pruebas y para depurar: cuantas sesiones la piden y si esta cogida. */
function paceLuzEstado() {
  return { cuenta: _paceLuz.cuenta, activa: !!_paceLuz.centinela, pedidas: _paceLuz.pedidas };
}

try {
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && _paceLuz.cuenta > 0) paceLuzPedir();
  });
} catch (e) {}

Object.assign(window, { paceMantenerPantalla, paceLuzEstado });
