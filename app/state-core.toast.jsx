/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-core.toast.jsx — el buzon de los avisos (toasts) y su espera. Cortado de
   `state-core.jsx` en s198, POR UN PUNTO y tal cual, al pasar aquel de 500 lineas
   con el saneado del estado: el store y el buzon de avisos son dos cosas y no se
   miran. Carga JUSTO DESPUES de state-core.jsx; nadie lo llama al evaluarse
   (`showToast` y `onToast` se usan al montar o en un gesto), asi que el orden solo
   importa por legibilidad.
*/
/* ============================
   TOAST (buffer pre-mount)
   ============================ */

const _toastListeners = new Set();
const _pendingToasts = [];      // buffer pre-mount (aun sin listeners)
const _esperando = [];          // avisos que esperan a que no haya nada encima de la home
let _esperaTimer = null;
let _caminoUiActive = false;    // s105: lo fija PathRunner (pasos + Completion)

/* UN SELLO NO PISA NADA (Ez, 8 oct. 2026: «los sellos no deben pisar los elementos»).
   El aviso salia en el acto, abajo y por encima de todo (z 200), y con el primer
   Pomodoro tapaba el pie de la pausa, «Saltar esta pausa» incluido; igual el de
   Hidratate o el cierre de una rutina. Ahora ESPERA mientras haya algo abierto
   encima de la home y sale al volver a ella. El logro se gana igual al instante
   (s145): lo que espera es el aviso, y con el su sonido (lo toca ToastHost al
   recibirlo).

   Lo que cuenta como «algo abierto», mirado en el momento y no apuntado por cada
   superficie: un dialogo de la pila (`paceHayDialogo`: la pausa, Hidratate, cualquier
   Modal, el onboarding y la sesion de Respira, que pasa por SessionShell), una sesion
   montada (`[data-pace-session-root]`, tambien la de Mueve y Estira) y la UI de un
   Camino (s105). Asi una superficie nueva queda cubierta sin acordarse de nadie.

   EL RESPIRO DEL PRINCIPIO es lo que lo hace funcionar con la pausa: el sello de
   «Primer paso» se encola al CERRAR el bloque y la pausa se monta en ese mismo gesto,
   un instante despues. Sin esperar ese instante, el aviso ya estaria fuera. */
const AVISO_RESPIRO_MS = 400;
const AVISO_REINTENTO_MS = 500;

function _avisoTaparia() {
  if (_caminoUiActive) return true;
  try {
    if (typeof paceHayDialogo === 'function' && paceHayDialogo()) return true;
    if (document.querySelector('[data-pace-session-root]')) return true;
  } catch (e) {}
  return false;
}

function _intentarAvisos() {
  _esperaTimer = null;
  if (!_esperando.length) return;
  if (_avisoTaparia()) { _esperaTimer = setTimeout(_intentarAvisos, AVISO_REINTENTO_MS); return; }
  _esperando.splice(0).forEach(_emitToast);
}

function _esperarHueco(ms) {
  if (_esperaTimer) clearTimeout(_esperaTimer);
  _esperaTimer = setTimeout(_intentarAvisos, ms);
}

function _emitToast(t) {
  if (_toastListeners.size === 0) { _pendingToasts.push(t); return; }
  _toastListeners.forEach(l => l(t));
}

function showToast(toast) {
  const t = { ...toast, _id: Date.now() + Math.random() };
  _esperando.push(t);
  _esperarHueco(AVISO_RESPIRO_MS);
}

/* s105: PathRunner marca la UI de Camino activa mientras haya pasos, transiciones o
   CompletionScreen; al volver a la home, los avisos que esperaban salen tras un
   pequeno respiro para que el runner desmonte (si no queda nada mas abierto). */
function setCaminoUiActive(active) {
  const was = _caminoUiActive;
  _caminoUiActive = !!active;
  if (was && !_caminoUiActive && _esperando.length > 0) _esperarHueco(60);
}

function onToast(listener) {
  const wasEmpty = _toastListeners.size === 0;
  _toastListeners.add(listener);
  /* Vaciar buffer pendiente en cuanto hay al menos un listener (fix StrictMode). */
  if (wasEmpty && _pendingToasts.length > 0) {
    const drained = _pendingToasts.splice(0);
    setTimeout(() => { drained.forEach(t => listener(t)); }, 0);
  }
  return () => _toastListeners.delete(listener);
}

Object.assign(window, { showToast, onToast, setCaminoUiActive });
