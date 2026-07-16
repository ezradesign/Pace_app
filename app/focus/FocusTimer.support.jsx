/* PACE · FocusTimer.support — helpers sin UI del Pomodoro (s102 · v0.47.0)
   Extraídos a archivo propio para no llevar FocusTimer.jsx (~466 ln) por
   encima del tope de 500. Dos responsabilidades pequeñas y acotadas:

   1) maybeNotifyFocusEnd(opts) — notificación de fin de Pomodoro (PWA).
      Solo dispara si el usuario activó el aviso en Ajustes
      (state.notifyFocusEnd), la pestaña NO está visible (mirando la app, el
      sonido y la pantalla de fin ya avisan; duplicar sería ruido) y el
      permiso está concedido (se pide al activar el toggle, nunca aquí).
      Vía registration.showNotification (funciona con la PWA instalada) con
      fallback a new Notification. silent:true — la campana pomodoro.end de
      la app es el sonido; el SO no añade un segundo. El click la cierra y
      enfoca la app (notificationclick en sw.js). Nunca rompe la app
      (try/catch integral, patrón playSound).

   2) loadPersistedFocusTimer / persistFocusTimer — persistencia del Pomodoro
      running en recarga (s102, resuelve el fork s96). Clave localStorage
      `pace.timer.v1` FUERA de pace.state.v2: el timer sigue siendo local
      (decisión s96), solo sobrevive a la recarga. Se persiste ÚNICAMENTE
      running en modo foco; pausar/reset/completar limpian. Al montar,
      FocusTimer reanuda solo si endsAt sigue en el futuro Y modo/minutos
      coinciden con el state; un timer expirado estando fuera se descarta en
      silencio — no se acreditan minutos no presenciados (tracking honesto,
      línea s101). */

const PACE_TIMER_KEY = 'pace.timer.v1';

/* B1.2 (s108): notifyFocusEnd arranca ON por defecto, pero el permiso del
   navegador exige un gesto real. Se pide UNA vez por carga de página, en el
   primer «Comenzar» de Foco (el otro punto de petición sigue siendo el
   toggle de Ajustes, TweaksPanel.enableNotify). Con permiso ya resuelto
   (granted/denied) o toggle apagado no hace nada; si el usuario deniega
   aquí, el flag baja a false para que el toggle de Ajustes refleje la
   realidad (cerrar el prompt sin responder lo deja en 'default' y se
   re-intentará en otra carga). Solo en web: en file:// no hay aviso. */
let _notifyPermissionAsked = false;
function maybeRequestNotifyPermission(state, set) {
  try {
    if (_notifyPermissionAsked) return;
    if (!state || !state.notifyFocusEnd) return;
    if (typeof Notification === 'undefined' || !Notification.requestPermission) return;
    if (!/^https?:$/.test(window.location.protocol)) return;
    if (Notification.permission !== 'default') return;
    _notifyPermissionAsked = true;
    Notification.requestPermission().then((p) => {
      if (p === 'denied') set({ notifyFocusEnd: false });
    }).catch(() => {});
  } catch (e) {}
}

function maybeNotifyFocusEnd(opts) {
  try {
    if (!opts || !opts.enabled) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const title = opts.title || 'PACE';
    const nOpts = {
      body: opts.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'pace-focus-end', // colapsa duplicados en una sola notificación
      silent: true,
    };
    const fallback = () => { try { new Notification(title, nOpts); } catch (e) {} };
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.showNotification) reg.showNotification(title, nOpts);
        else fallback();
      }).catch(fallback);
    } else {
      fallback();
    }
  } catch (e) {}
}

/* Devuelve el endsAt (ms epoch) a reanudar, o null (y limpia la clave si
   estaba corrupta/expirada/incoherente). El caller pasa el modo y los
   minutos VIGENTES del state: si no coinciden con lo guardado, se descarta. */
function loadPersistedFocusTimer(focusMode, focusMinutes) {
  try {
    const raw = localStorage.getItem(PACE_TIMER_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const durMs = focusMinutes * 60 * 1000;
    const valid = saved
      && typeof saved.endsAt === 'number'
      && saved.mode === 'foco' && focusMode === 'foco'
      && saved.minutes === focusMinutes
      && saved.endsAt > Date.now()
      && saved.endsAt - Date.now() <= durMs; // blindaje contra relojes raros
    if (valid) return saved.endsAt;
    localStorage.removeItem(PACE_TIMER_KEY);
    return null;
  } catch (e) {
    try { localStorage.removeItem(PACE_TIMER_KEY); } catch (e2) {}
    return null;
  }
}

/* Escribe la clave mientras hay un foco running; cualquier otro estado la
   limpia (pausa, reset, completado, modos pausa/larga). */
function persistFocusTimer(runningFoco, endsAt, minutes) {
  try {
    if (runningFoco && endsAt) {
      localStorage.setItem(PACE_TIMER_KEY, JSON.stringify({ endsAt, mode: 'foco', minutes }));
    } else {
      localStorage.removeItem(PACE_TIMER_KEY);
    }
  } catch (e) {}
}

Object.assign(window, { maybeNotifyFocusEnd, maybeRequestNotifyPermission, loadPersistedFocusTimer, persistFocusTimer });
