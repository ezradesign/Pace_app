/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-core.jsx — store, loadState, rollover, history helpers, toast.
   Split de state.jsx (sesion 57 / v0.27.5).
*/

const { useSyncExternalStore } = React;

/* NOTA (sesion 37 · v0.19.0): clave bumpeada de v1 a v2. Hard reset intencional. */
const LS_KEY = 'pace.state.v2';
const PACE_VERSION = 'v0.28.5';

const defaultState = {
  // Settings / Tweaks
  palette: 'crema',
  font: 'cormorant',
  layout: 'sidebar',
  sidebarCollapsed: false,
  timerStyle: 'aro',
  breathStyle: 'flor',
  logoVariant: 'pace',
  soundOn: false,
  ambientOn: false,
  lang: 'en',

  // Foco
  focusMode: 'foco',
  focusMinutes: 25,
  cycle: 0,
  totalFocusMin: 0,

  // Plan del dia
  plan: { muevete: false, respira: false, extra: false, hidratate: false },

  // Hidratacion
  water: { goal: 8, today: 0, lastReset: null },

  // Logros
  achievements: {},

  // Stats semanales
  weeklyStats: {
    focusMinutes:  [0,0,0,0,0,0,0],
    breathMinutes: [0,0,0,0,0,0,0],
    moveMinutes:   [0,0,0,0,0,0,0],
    waterGlasses:  [0,0,0,0,0,0,0],
  },

  // Streak
  streak: { current: 0, longest: 0, lastActiveDate: null },

  // Contadores acumulados de sesiones (crecen monotonamente, nunca resetean).
  breatheSessionsTotal: 0,
  moveSessionsTotal: 0,

  // Fechas (toDateString()) con sesion antes de las 9:00. Cap 30.
  morningDates: [],

  intention: '',
  firstSeen: null,
  supportSeenAt: null,
  supportCopyVariant: 'pastar',
  reminders: [],

  // Fechas de dias silenciosos (soundOn=false). Cap 30.
  silentDates: [],

  // Fechas en que water.today alcanzo water.goal. Cap 14.
  waterGoalDates: [],

  // Contadores por tipo de rutina. { box, coherent, rounds, atg }.
  routineCounts: {},

  // Historico de actividad (sesion 43).
  // days: { "YYYY-MM-DD": {focusMinutes, breathMinutes, moveMinutes, waterGlasses} }
  // months: { "YYYY-MM": ... }   years: { "YYYY": ... }
  history: { days: {}, months: {}, years: {} },

  // Caminos (sesion 49 / v0.26.0-alpha).
  paths: {
    current: null,
    completed: {},
    favorite: null,
    history: [],
  },

  // Migration guard (sesion 43).
  _historyMigrated: false,

  // Rollover: dia del ultimo uso (toDateString()).
  lastActiveDay: null,
};

/* ============================
   UTILS
   ============================ */

function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia &&
         window.matchMedia('(max-width: 768px)').matches;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toISODate(dateString) {
  const d = new Date(dateString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function zeroEntry() {
  return { focusMinutes: 0, breathMinutes: 0, moveMinutes: 0, waterGlasses: 0 };
}

/* ============================
   HISTORICO DE ACTIVIDAD (sesion 43)
   ============================ */

function updateMonthAggregate(history, dateStr, delta) {
  const key = dateStr.slice(0, 7);
  const prev = history.months[key] || zeroEntry();
  return {
    ...history,
    months: {
      ...history.months,
      [key]: {
        focusMinutes:  prev.focusMinutes  + delta.focusMinutes,
        breathMinutes: prev.breathMinutes + delta.breathMinutes,
        moveMinutes:   prev.moveMinutes   + delta.moveMinutes,
        waterGlasses:  prev.waterGlasses  + delta.waterGlasses,
      },
    },
  };
}

function updateYearAggregate(history, dateStr, delta) {
  const key = dateStr.slice(0, 4);
  const prev = history.years[key] || zeroEntry();
  return {
    ...history,
    years: {
      ...history.years,
      [key]: {
        focusMinutes:  prev.focusMinutes  + delta.focusMinutes,
        breathMinutes: prev.breathMinutes + delta.breathMinutes,
        moveMinutes:   prev.moveMinutes   + delta.moveMinutes,
        waterGlasses:  prev.waterGlasses  + delta.waterGlasses,
      },
    },
  };
}

function archiveDayToHistory(history, dateStr, weeklyStats) {
  const dow = new Date(dateStr).getDay();
  const delta = {
    focusMinutes:  (weeklyStats.focusMinutes  || [])[dow] || 0,
    breathMinutes: (weeklyStats.breathMinutes || [])[dow] || 0,
    moveMinutes:   (weeklyStats.moveMinutes   || [])[dow] || 0,
    waterGlasses:  (weeklyStats.waterGlasses  || [])[dow] || 0,
  };
  const hasData = Object.values(delta).some(v => v > 0);
  if (!hasData) return history;

  const isoDate = toISODate(dateStr);
  let h = { ...history, days: { ...history.days, [isoDate]: delta } };
  h = updateMonthAggregate(h, isoDate, delta);
  h = updateYearAggregate(h, isoDate, delta);
  return h;
}

/* Migration guard (sesion 43): copia weeklyStats → history.days en el primer
   rollover post-upgrade. Solo se ejecuta una vez (_historyMigrated === false). */
function migrateWeeklyStatsToHistory(state) {
  if (state._historyMigrated) return state;
  if (!state.lastActiveDay) return { ...state, _historyMigrated: true };
  let h = state.history || { days: {}, months: {}, years: {} };
  const lastDate = new Date(state.lastActiveDay);
  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(lastDate.getTime() - offset * 86400000);
    h = archiveDayToHistory(h, d.toDateString(), state.weeklyStats);
  }
  return { ...state, history: h, _historyMigrated: true };
}

/* ============================
   ROLLOVER
   ============================ */

function rolloverIfNeeded(state) {
  const today = new Date().toDateString();
  if (state.lastActiveDay === today) return state;

  let migratedState = migrateWeeklyStatsToHistory(state);

  let nextHistory = migratedState.history || { days: {}, months: {}, years: {} };
  if (migratedState.lastActiveDay) {
    nextHistory = archiveDayToHistory(
      nextHistory,
      migratedState.lastActiveDay,
      migratedState.weeklyStats
    );
  }

  /* Trigger first.return — abrir la app un dia distinto al ultimo.
     Deferred via setTimeout para no llamar a unlockAchievement desde
     dentro de loadState (achievements aun no cargado en este punto). */
  if (migratedState.lastActiveDay) {
    setTimeout(() => {
      try { unlockAchievement('first.return'); } catch (e) {}
    }, 0);
  }
  return {
    ...migratedState,
    history: nextHistory,
    cycle: 0,
    plan: { muevete: false, respira: false, extra: false, hidratate: false },
    water: { ...migratedState.water, today: 0, lastReset: today },
    lastActiveDay: today,
  };
}

/* ============================
   STORE PRIMITIVO
   ============================ */

function loadState() {
  const _detectLang = typeof detectInitialLang === 'function' ? detectInitialLang : () => 'en';
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      return {
        ...defaultState,
        lang: _detectLang(),
        lastActiveDay: new Date().toDateString(),
        ...(isMobileViewport() ? { sidebarCollapsed: true } : {}),
      };
    }
    const parsed = JSON.parse(raw);
    if (!parsed.lang) parsed.lang = _detectLang();
    /* Migracion defensiva s49: paths ausente en instalaciones pre-v0.26. */
    if (!parsed.paths) parsed.paths = defaultState.paths;
    /* Migracion defensiva s54: paths.history ausente. */
    if (parsed.paths && !parsed.paths.history) {
      const hist = [];
      for (const id in (parsed.paths.completed || {})) {
        const e = parsed.paths.completed[id];
        if (e && e.lastDoneAt && e.count) {
          for (let i = 0; i < e.count; i++) hist.push(e.lastDoneAt);
        }
      }
      parsed.paths.history = hist;
    }
    const merged = rolloverIfNeeded({ ...defaultState, ...parsed });
    if (parsed.sidebarCollapsed === undefined && isMobileViewport()) {
      return { ...merged, sidebarCollapsed: true };
    }
    return merged;
  } catch (e) {
    return {
      ...defaultState,
      lang: _detectLang(),
      lastActiveDay: new Date().toDateString(),
      ...(isMobileViewport() ? { sidebarCollapsed: true } : {}),
    };
  }
}

let _state = loadState();
const _listeners = new Set();

function persistState() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(_state)); } catch (e) {}
}

function getState() { return _state; }

function setState(patch) {
  const prev = _state;
  _state = typeof patch === 'function' ? patch(_state) : { ...(_state), ...patch };
  persistState();
  _listeners.forEach(l => l());
  /* Aplicar tokens visuales solo cuando palette o font cambian realmente. */
  if (prev.palette !== _state.palette || prev.font !== _state.font) {
    applyTheme();
  }
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

function ensureDayFresh() {
  const next = rolloverIfNeeded(_state);
  if (next !== _state) {
    _state = next;
    persistState();
    _listeners.forEach(l => l());
    try { checkStatsAchievements(); } catch (e) {}
  }
}

/* ============================
   TOAST (buffer pre-mount)
   ============================ */

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
  const wasEmpty = _toastListeners.size === 0;
  _toastListeners.add(listener);
  /* Vaciar buffer pendiente en cuanto hay al menos un listener (fix StrictMode). */
  if (wasEmpty && _pendingToasts.length > 0) {
    const drained = _pendingToasts.splice(0);
    setTimeout(() => { drained.forEach(t => listener(t)); }, 0);
  }
  return () => _toastListeners.delete(listener);
}

// Aplicar tema al cargar
applyTheme();

Object.assign(window, {
  LS_KEY, PACE_VERSION, defaultState,
  getState, setState, subscribe, usePace, ensureDayFresh,
  showToast, onToast,
  zeroEntry, toISODate, todayISO,
  archiveDayToHistory, updateMonthAggregate, updateYearAggregate,
});
