/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-core.toast.jsx — el buzon de los avisos (toasts) y su aplazamiento
   durante un Camino. Cortado de `state-core.jsx` en s198, POR UN PUNTO y tal
   cual, al pasar aquel de 500 lineas con el saneado del estado: el store y el
   buzon de avisos son dos cosas y no se miran. Carga JUSTO DESPUES de
   state-core.jsx; nadie lo llama al evaluarse (`showToast` y `onToast` se usan
   al montar o en un gesto), asi que el orden solo importa por legibilidad.
*/
/* ============================
   TOAST (buffer pre-mount)
   ============================ */

const _toastListeners = new Set();
const _pendingToasts = [];      // buffer pre-mount (aun sin listeners)
const _deferredToasts = [];     // s105: aplazados mientras hay UI de Camino
let _caminoUiActive = false;    // s105: lo fija PathRunner (pasos + Completion)

function _emitToast(t) {
  if (_toastListeners.size === 0) { _pendingToasts.push(t); return; }
  _toastListeners.forEach(l => l(t));
}

function showToast(toast) {
  const t = { ...toast, _id: Date.now() + Math.random() };
  /* s105: durante un Camino (pasos, transiciones y CompletionScreen) los
     toasts de logro se APLAZAN para no taparse sobre las pantallas del runner;
     PathRunner marca la UI de Camino activa/inactiva via setCaminoUiActive y
     al volver a home se vuelcan los pendientes. */
  if (_caminoUiActive) { _deferredToasts.push(t); return; }
  _emitToast(t);
}

function setCaminoUiActive(active) {
  const was = _caminoUiActive;
  _caminoUiActive = !!active;
  if (was && !_caminoUiActive && _deferredToasts.length > 0) {
    const drained = _deferredToasts.splice(0);
    // pequeno respiro para que el runner desmonte antes del primer toast
    setTimeout(() => { drained.forEach(_emitToast); }, 60);
  }
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
