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

   EN LAS APPS (Android y iPhone) el WebView no trae Wake Lock: la pide el
   complemento KeepAwake (ui/nativo.js), que marca la ventana para que no se
   apague. Esa marca no se suelta al irse al fondo, asi que alli no hace falta
   volver a pedirla.

   `var`/`function` a proposito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var _paceLuz = { cuenta: 0, centinela: null, pidiendo: false, soltar: null, pedidas: 0 };

function paceLuzPedir() {
  try {
    var nativa = typeof paceNativoPlugin === 'function' ? paceNativoPlugin('KeepAwake') : null;
    if (nativa) {
      if (_paceLuz.centinela) return;
      _paceLuz.pedidas++;
      _paceLuz.centinela = 'nativa';
      Promise.resolve(nativa.keepAwake()).catch(function () {
        if (_paceLuz.centinela === 'nativa') _paceLuz.centinela = null;
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
      if (s === 'nativa') {
        var nativa = typeof paceNativoPlugin === 'function' ? paceNativoPlugin('KeepAwake') : null;
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

/* EN EL IPHONE, TOCAR UN CAMPO NO AMPLÍA LA PANTALLA.
   Safari y el WebView del iPhone amplían la página al enfocar un campo con la letra por debajo de
   16 px, y no la devuelven al salir: la home se queda ampliada y cortada hasta que se pellizca. Los
   campos de PACE van a 13-15 px («Otro» en los minutos, el código de PACE completo, la bienvenida,
   el nombre de una rutina). Con `maximum-scale=1` no amplía al enfocar y, desde iOS 10, se sigue
   pudiendo ampliar con dos dedos. Solo en el iPhone y el iPad: en Android ese valor sí quitaría el
   zoom con dos dedos, y allí no amplía al enfocar. Lo mide tests/ios-campo-sin-zoom.spec.js. */
function paceEsAppleTactil() {
  var ua = (navigator && navigator.userAgent) || '';
  /* El iPad con Safari de escritorio dice «Macintosh»: se le reconoce por la pantalla táctil. */
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);
}
try {
  var _paceVp = document.querySelector('meta[name="viewport"]');
  var _paceVpTexto = (_paceVp && _paceVp.getAttribute('content')) || '';
  if (_paceVp && paceEsAppleTactil() && !/maximum-scale/.test(_paceVpTexto)) {
    _paceVp.setAttribute('content', _paceVpTexto + ', maximum-scale=1');
  }
} catch (e) {}

Object.assign(window, { paceMantenerPantalla, paceLuzEstado });
