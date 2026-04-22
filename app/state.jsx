/* PACE · Estado global
   Simple store con useSyncExternalStore + localStorage
*/

const { useSyncExternalStore, useCallback } = React;

const LS_KEY = 'pace.state.v1';
const PACE_VERSION = 'v0.11.9';

const defaultState = {
  // Settings / Tweaks
  palette: 'crema',           // crema | oscuro | envejecido
  font: 'cormorant',          // garamond | cormorant | mono
  layout: 'sidebar',          // sidebar | minimal | editorial
  sidebarCollapsed: false,    // true cuando el usuario colapsa el sidebar a icon-rail
  timerStyle: 'aro',          // numero | circulo | barra | analogico | aro (híbrido círculo+barra)
  breathStyle: 'flor',        // pulso | ondas | petalo | organico | flor (híbrido pulso+pétalo)
  logoVariant: 'pace',        // pace (lockup vaca-P) | lineal | sello | ilustrado
  soundOn: false,

  // Foco
  focusMode: 'foco',          // foco | pausa | larga
  focusMinutes: 25,           // 15 | 25 | 35 | 45
  cycle: 0,                   // Pomodoros completados hoy
  totalFocusMin: 0,           // minutos totales acumulados

  // Plan del día
  plan: {
    muevete: false,
    respira: false,
    extra: false,
    hidratate: false,
  },

  // Hidratación
  water: { goal: 8, today: 0, lastReset: null },

  // Logros
  achievements: {},           // { [id]: { unlockedAt } }

  // Stats semanales
  weeklyStats: {
    focusMinutes: [0,0,0,0,0,0,0],
    breathMinutes: [0,0,0,0,0,0,0],
    moveMinutes: [0,0,0,0,0,0,0],
    waterGlasses: [0,0,0,0,0,0,0],
  },

  // Streak
  streak: { current: 0, longest: 0, lastActiveDate: null },

  // Intención del día
  intention: '',

  // Recordatorios — DECISIÓN (v0.11.3): la sección de UI se eliminó del Sidebar
  // para que todo quepa en 1920×1080 sin scroll. El array se conserva en el
  // state para no romper instalaciones existentes (usuarios que ya tengan
  // recordatorios guardados en localStorage) y por si se reintroduce un día
  // la sección (probablemente en un modal dedicado, no en el sidebar).
  // No hay action que lo mute actualmente.
  reminders: [],

  // Rollover: día de calendario del último uso (toDateString()).
  // Cuando cambia, se resetean cycle / plan / water.today al cargar.
  lastActiveDay: null,
};

let _state = loadState();
const _listeners = new Set();

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...defaultState, lastActiveDay: new Date().toDateString() };
    const parsed = JSON.parse(raw);
    return rolloverIfNeeded({ ...defaultState, ...parsed });
  } catch (e) {
    return { ...defaultState, lastActiveDay: new Date().toDateString() };
  }
}

/* Rollover diario: si el día de calendario ha cambiado desde la última actividad,
   reseteamos los contadores "de hoy" (ciclo de pomodoros, plan del día, vasos de agua).
   Se llama al cargar el estado y también defensivamente antes de escribir cualquier
   contador "de hoy" desde las actions (completePomodoro, addWaterGlass, etc.) para
   cubrir el caso de que la pestaña siga abierta al cruzar la medianoche. */
function rolloverIfNeeded(state) {
  const today = new Date().toDateString();
  if (state.lastActiveDay === today) return state;
  return {
    ...state,
    cycle: 0,
    plan: { muevete: false, respira: false, extra: false, hidratate: false },
    water: { ...state.water, today: 0, lastReset: today },
    lastActiveDay: today,
  };
}

function ensureDayFresh() {
  const next = rolloverIfNeeded(_state);
  if (next !== _state) {
    _state = next;
    persistState();
    _listeners.forEach(l => l());
  }
}

function persistState() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(_state)); } catch (e) {}
}

function getState() { return _state; }

function setState(patch) {
  _state = typeof patch === 'function' ? patch(_state) : { ...(_state), ...patch };
  persistState();
  _listeners.forEach(l => l());
  // Aplicar tokens visuales
  applyTheme();
}

function subscribe(listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function applyTheme() {
  const root = document.documentElement;
  root.setAttribute('data-palette', _state.palette);
  root.setAttribute('data-font', _state.font);
}

function usePace() {
  const state = useSyncExternalStore(subscribe, getState);
  return [state, setState];
}

/* ============================
   ACCIONES ESPECÍFICAS
   ============================ */

function unlockAchievement(id, note) {
  const s = getState();
  if (s.achievements[id]) return false;
  setState({
    achievements: { ...s.achievements, [id]: { unlockedAt: Date.now(), note } }
  });
  // Notificación flotante
  showToast({ id, type: 'achievement' });
  return true;
}

function addFocusMinutes(mins) {
  ensureDayFresh();
  // Actualización atómica: leemos y escribimos dentro del mismo updater
  // para no depender del `_state` snapshot del momento de la llamada
  // (evita stale state si se encadenan varias acciones en el mismo tick).
  let nextTotal = 0;
  setState(prev => {
    const day = new Date().getDay();
    const week = [...prev.weeklyStats.focusMinutes];
    week[day] += mins;
    nextTotal = prev.totalFocusMin + mins;
    return {
      ...prev,
      totalFocusMin: nextTotal,
      weeklyStats: { ...prev.weeklyStats, focusMinutes: week },
    };
  });
  // Logros por horas de foco — calculados sobre el total YA actualizado.
  const h = nextTotal / 60;
  if (h >= 10) unlockAchievement('focus.hours.10');
  if (h >= 50) unlockAchievement('focus.hours.50');
  if (h >= 100) unlockAchievement('focus.hours.100');
}

function completePomodoro() {
  ensureDayFresh();
  // Incremento atómico del ciclo.
  let nextCycle = 0;
  let focusMinsAtCompletion = 0;
  setState(prev => {
    nextCycle = prev.cycle + 1;
    focusMinsAtCompletion = prev.focusMinutes;
    return { ...prev, cycle: nextCycle };
  });
  addFocusMinutes(focusMinsAtCompletion);
  unlockAchievement('first.step');
  if (nextCycle >= 8) unlockAchievement('master.pomodoro.8');
  updateStreak();
}

function completeBreathSession(routineId, durationMin) {
  ensureDayFresh();
  const s = getState();
  const day = new Date().getDay();
  const week = [...s.weeklyStats.breathMinutes];
  week[day] += durationMin;
  setState({
    plan: { ...s.plan, respira: true },
    weeklyStats: { ...s.weeklyStats, breathMinutes: week },
  });
  unlockAchievement('first.breath');
  // Exploración
  const explorationMap = {
    'breathe.box.4': 'explore.box',
    'breathe.box.6': 'explore.box',
    'breathe.478': 'explore.478',
    'breathe.coherent.55': 'explore.coherent',
    'breathe.coherent.66': 'explore.coherent',
    'breathe.rounds.full': 'explore.rounds',
    'breathe.rounds.express': 'explore.rounds',
    'breathe.bellows': 'explore.bhastrika',
    'breathe.nadi.shodhana': 'explore.nadi',
    'breathe.ujjayi': 'explore.ujjayi',
    'breathe.kapalabhati': 'explore.kapalabhati',
    'breathe.physiological': 'explore.physiological',
  };
  if (explorationMap[routineId]) unlockAchievement(explorationMap[routineId]);
  updateStreak();
}

function completeMoveSession(routineId, durationMin) {
  ensureDayFresh();
  const s = getState();
  const day = new Date().getDay();
  const week = [...s.weeklyStats.moveMinutes];
  week[day] += durationMin;
  setState({
    plan: { ...s.plan, muevete: true },
    weeklyStats: { ...s.weeklyStats, moveMinutes: week },
  });
  unlockAchievement('first.stretch');
  const map = {
    'move.hips.5': 'explore.hips',
    'move.shoulders.5': 'explore.shoulders',
    'move.atg.knees': 'explore.atg',
    'move.ancestral': 'explore.ancestral',
    'move.neck.3': 'explore.neck',
    'move.desk.quick': 'explore.desk',
  };
  if (map[routineId]) unlockAchievement(map[routineId]);
  updateStreak();
}

function completeExtraSession(routineId, durationMin = 0) {
  ensureDayFresh();
  const s = getState();
  const day = new Date().getDay();
  const week = [...s.weeklyStats.moveMinutes];
  // Los minutos de Extra se agregan al bucket de 'move' en stats (ambos son cuerpo activo),
  // pero el plan del día y los logros sí se separan.
  if (durationMin > 0) week[day] += durationMin;
  setState({
    plan: { ...s.plan, extra: true },
    weeklyStats: { ...s.weeklyStats, moveMinutes: week },
  });
  unlockAchievement('first.extra');
  updateStreak();
}

function addWaterGlass(delta = 1) {
  ensureDayFresh();
  const s = getState();
  const day = new Date().getDay();
  const week = [...s.weeklyStats.waterGlasses];
  week[day] = Math.max(0, (week[day] || 0) + delta);
  const next = Math.max(0, s.water.today + delta);
  setState({
    water: { ...s.water, today: next },
    plan: { ...s.plan, hidratate: next > 0 ? true : s.plan.hidratate },
    weeklyStats: { ...s.weeklyStats, waterGlasses: week },
  });
  if (delta > 0) unlockAchievement('first.sip');
}

function updateStreak() {
  const s = getState();
  const today = new Date().toDateString();
  const last = s.streak.lastActiveDate;
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let current = s.streak.current;
  if (last === yesterday) current += 1;
  else current = 1;
  const longest = Math.max(s.streak.longest, current);
  setState({
    streak: { current, longest, lastActiveDate: today }
  });
  if (current >= 3) unlockAchievement('streak.3');
  if (current >= 7) unlockAchievement('streak.7');
  if (current >= 30) unlockAchievement('streak.30');
  if (current >= 100) unlockAchievement('streak.100');
}

/* TOAST NOTIFICATIONS
   Buffer pre-mount: si se dispara un toast antes de que ToastHost monte
   (p.ej. desbloqueo por rollover durante loadState), se encola en
   `_pendingToasts` y se vacía en orden cuando el primer listener se
   registra. Evita que el primer logro de una sesión "recién abierta" se
   pierda silenciosamente. */
const _toastListeners = new Set();
const _pendingToasts = [];
function showToast(toast) {
  const t = { ...toast, _id: Date.now() + Math.random() };
  if (_toastListeners.size === 0) {
    _pendingToasts.push(t);
    return;
  }
  _toastListeners.forEach(l => l(t));
}
function onToast(listener) {
  _toastListeners.add(listener);
  // Si es el primer listener, vaciamos el buffer pendiente.
  if (_toastListeners.size === 1 && _pendingToasts.length > 0) {
    const drained = _pendingToasts.splice(0);
    // Despachamos en el próximo tick para no interferir con el mount del Host.
    setTimeout(() => { drained.forEach(t => listener(t)); }, 0);
  }
  return () => _toastListeners.delete(listener);
}

// Init theme on load
applyTheme();

Object.assign(window, {
  usePace, getState, setState, subscribe,
  unlockAchievement, completePomodoro,
  completeBreathSession, completeMoveSession, completeExtraSession,
  addWaterGlass, addFocusMinutes, updateStreak,
  ensureDayFresh,
  showToast, onToast,
  PACE_VERSION,
});
