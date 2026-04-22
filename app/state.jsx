/* PACE · Estado global
   Simple store con useSyncExternalStore + localStorage
*/

const { useSyncExternalStore, useCallback } = React;

const LS_KEY = 'pace.state.v1';

const defaultState = {
  // Settings / Tweaks
  palette: 'crema',           // crema | oscuro | envejecido
  font: 'cormorant',          // garamond | cormorant | mono
  layout: 'sidebar',          // sidebar | minimal | editorial
  timerStyle: 'aro',          // numero | circulo | barra | analogico | aro (híbrido círculo+barra)
  breathStyle: 'flor',        // pulso | ondas | petalo | organico | flor (híbrido pulso+pétalo)
  logoVariant: 'lineal',      // lineal | sello | ilustrado
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

  // Recordatorios
  reminders: [],
};

let _state = loadState();
const _listeners = new Set();

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch (e) {
    return { ...defaultState };
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
  const s = getState();
  const day = new Date().getDay();
  const week = [...s.weeklyStats.focusMinutes];
  week[day] += mins;
  setState({
    totalFocusMin: s.totalFocusMin + mins,
    weeklyStats: { ...s.weeklyStats, focusMinutes: week },
  });
  // Logros por horas de foco
  const h = (s.totalFocusMin + mins) / 60;
  if (h >= 10) unlockAchievement('focus.hours.10');
  if (h >= 50) unlockAchievement('focus.hours.50');
  if (h >= 100) unlockAchievement('focus.hours.100');
}

function completePomodoro() {
  const s = getState();
  setState({ cycle: s.cycle + 1 });
  addFocusMinutes(s.focusMinutes);
  unlockAchievement('first.step');
  if (s.cycle + 1 >= 8) unlockAchievement('master.pomodoro.8');
  updateStreak();
}

function completeBreathSession(routineId, durationMin) {
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

function completeExtraSession() {
  setState(s => ({ plan: { ...s.plan, extra: true } }));
  unlockAchievement('first.extra');
  updateStreak();
}

function addWaterGlass(delta = 1) {
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

/* TOAST NOTIFICATIONS */
const _toastListeners = new Set();
function showToast(toast) {
  const t = { ...toast, _id: Date.now() + Math.random() };
  _toastListeners.forEach(l => l(t));
}
function onToast(listener) {
  _toastListeners.add(listener);
  return () => _toastListeners.delete(listener);
}

// Init theme on load
applyTheme();

Object.assign(window, {
  usePace, getState, setState, subscribe,
  unlockAchievement, completePomodoro,
  completeBreathSession, completeMoveSession, completeExtraSession,
  addWaterGlass, addFocusMinutes, updateStreak,
  showToast, onToast,
});
