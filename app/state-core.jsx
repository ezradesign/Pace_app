/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-core.jsx — store, loadState, rollover, migraciones, toast.
   Split de state.jsx (sesion 57 / v0.27.5).

   Sesion 101: los utils de fecha y los helpers de history (zeroEntry,
   toISODate, todayISO, getDayIndexMondayFirst, getMondayOf, recompute*,
   archiveDayToHistory) viven en state-history.jsx, que CARGA ANTES:
   loadState()/rolloverIfNeeded los resuelven via window.
*/

const { useSyncExternalStore } = React;

/* NOTA (sesion 37 · v0.19.0): clave bumpeada de v1 a v2. Hard reset intencional. */
const LS_KEY = 'pace.state.v2';
/* s104: OJO — llevaba v0.46.0 desde s101 (footer del sidebar + export JSON
   mentían la versión). Entra al checklist de bump de cada cierre junto a
   <title> y CACHE_NAME; automatizarlo en el build queda anotado. */
const PACE_VERSION = 'v0.55.0';

/* Duracion del toast de logro desbloqueado (s77b). 3000ms da tiempo a leer
   sin interrumpir el ritmo de la sesion. Antes 5000ms se sentia largo. */
const TOAST_DURATION_MS = 3000;

const defaultState = {
  // Settings / Tweaks
  palette: 'crema',
  font: 'cormorant',
  layout: 'sidebar',
  sidebarCollapsed: false,
  timerStyle: 'aro',
  breathStyle: 'flor',
  logoVariant: 'pace',
  // B1.2 (s108): audio ON por defecto (opt-out en Ajustes). Solo afecta a
  // instalaciones nuevas: el merge de loadState conserva el valor persistido.
  soundOn: true,
  ambientOn: false,

  // Aviso de fin de Pomodoro vía notificación del navegador (s102 · PWA).
  // B1.2 (s108): ON por defecto (opt-out en Ajustes). El permiso del navegador
  // exige gesto: se pide en el primer «Comenzar» de Foco (o al encender el
  // toggle en Ajustes); si se deniega, el flag baja a false para que el toggle
  // refleje la realidad. Solo dispara con la pestaña en segundo plano.
  // Ver FocusTimer.support.jsx (maybeRequestNotifyPermission).
  notifyFocusEnd: true,
  lang: 'en',

  // Premium (s88 · bloque Contenido+Premium F3b). Flag de desbloqueo del
  // contenido premium. Sin ruta de compra real hasta v1.0: permanece false y
  // las rutinas con access:'premium' se muestran bloqueadas (sello + 'Pronto').
  // El cableado en RoutineCard ya lee este flag: ponerlo a true abre todas las
  // premium sin tocar UI. La validación de licencia real (claves firmadas,
  // expiresAt, tipos) queda para una fase posterior post-v1.0.
  premiumUnlocked: false,

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

  // Stats semanales — INDICE LUNES-PRIMERO (sesion 69 / v0.28.8).
  // [0]=lunes ... [6]=domingo. Antes de v0.28.8 era getDay()-style (0=dom).
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

  // Perfil del onboarding (s106). Capturado en la bienvenida de primera vez
  // (app/onboarding/): need 'calm'|'focus'|'body'|'energy' · time 'short'|
  // 'pause'|'block' · environment 'office'|'home'|'mixed'. Campo null =
  // pregunta saltada; completedAt = cuándo se cerró el flujo. Hoy alimenta
  // pickFirstPath (primer Camino); en s107 entrará al scoring de
  // getSuggestedPath. Instalaciones previas lo reciben con nulls por el
  // merge {...defaultState, ...parsed} de loadState (sin migración extra).
  profile: { need: null, time: null, environment: null, completedAt: null },
  supportSeenAt: null,
  supportCopyVariant: 'pastar',
  reminders: [],

  // Fechas de dias silenciosos (soundOn=false). Cap 30.
  silentDates: [],

  // Fechas en que water.today alcanzo water.goal. Cap 14.
  waterGoalDates: [],

  // Contadores por tipo de rutina. { box, coherent, rounds, atg }.
  routineCounts: {},

  // Rutinas custom del constructor premium (s93 · F7). CRUD y shape en
  // state-custom.jsx; los helpers leen con fallback [] por si un import
  // viejo reintroduce un estado sin la key.
  customRoutines: [],

  // Historico de actividad (sesion 43).
  // days: { "YYYY-MM-DD": {focusMinutes, breathMinutes, moveMinutes, waterGlasses} }
  // months: { "YYYY-MM": ... }   years: { "YYYY": ... }
  history: { days: {}, months: {}, years: {} },

  // Caminos (sesion 49 / v0.26.0-alpha; lastViewed s75).
  paths: {
    current: null,
    completed: {},
    favorite: null,
    history: [],
    lastViewed: null, // s75: ultimo Camino abierto, base de getSuggestedPath
  },

  // Migration guards.
  _historyMigrated: false,                  // sesion 43 — weeklyStats -> history.days
  _weeklyStatsReindexed_v0_28_8: false,     // sesion 69 — getDay() -> lunes-primero
  _historyRecalculated_v0_28_8: false,      // sesion 69 — months/years desde days

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

/* Paleta inicial (s89 · P0 auditoria): respeta prefers-color-scheme del
   sistema SOLO en el primer arranque (sin estado guardado). La eleccion
   manual de Tweaks persiste en localStorage y siempre gana en cargas
   posteriores — esto no re-sigue cambios del SO en caliente. */
function detectInitialPalette() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'oscuro' : 'crema';
  } catch (e) { return 'crema'; }
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

/* Sesion 69 / v0.28.8: re-indexa weeklyStats de la convencion vieja
   (0=domingo, 1=lunes ... 6=sabado, indexado por getDay()) a la nueva
   (0=lunes, 1=martes ... 6=domingo). Mapping: nuevo[i] = viejo[(i+1)%7]. */
function reindexWeeklyStatsMondayFirst(ws) {
  const rot = (arr) => Array.isArray(arr) && arr.length === 7
    ? [arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[0]]
    : [0,0,0,0,0,0,0];
  return {
    focusMinutes:  rot(ws && ws.focusMinutes),
    breathMinutes: rot(ws && ws.breathMinutes),
    moveMinutes:   rot(ws && ws.moveMinutes),
    waterGlasses:  rot(ws && ws.waterGlasses),
  };
}

/* ============================
   ROLLOVER
   ============================ */

function rolloverIfNeeded(state) {
  const today = new Date();
  const todayStr = today.toDateString();
  if (state.lastActiveDay === todayStr) return state;

  /* Detectar si la migracion s43 esta por ejecutarse en esta llamada.
     Si _historyMigrated era false al entrar, migrateWeeklyStatsToHistory
     ya archivara lastActiveDay y NO debemos volver a archivarlo aqui (C2). */
  const wasAlreadyMigrated = !!state._historyMigrated;
  let migratedState = migrateWeeklyStatsToHistory(state);
  let nextHistory = migratedState.history || { days: {}, months: {}, years: {} };

  /* Archivar el dia previo solo si NO acaba de migrar (la migracion ya lo cubrio). */
  if (migratedState.lastActiveDay && wasAlreadyMigrated) {
    nextHistory = archiveDayToHistory(
      nextHistory, migratedState.lastActiveDay, migratedState.weeklyStats
    );
  }

  /* FIX C1 (sesion 69): si entramos en una nueva semana lunes-domingo,
     resetear weeklyStats por completo. */
  let nextWeekly = migratedState.weeklyStats;
  if (migratedState.lastActiveDay) {
    const prevMonday  = getMondayOf(new Date(migratedState.lastActiveDay)).getTime();
    const todayMonday = getMondayOf(today).getTime();
    if (todayMonday !== prevMonday) {
      nextWeekly = {
        focusMinutes:  [0,0,0,0,0,0,0],
        breathMinutes: [0,0,0,0,0,0,0],
        moveMinutes:   [0,0,0,0,0,0,0],
        waterGlasses:  [0,0,0,0,0,0,0],
      };
    }
  }

  /* FIX A2 (sesion 69): rotura proactiva del streak. Si la ultima sesion
     fue antes de ayer, current=0 inmediatamente (sin esperar a la siguiente). */
  let nextStreak = migratedState.streak;
  if (nextStreak && nextStreak.lastActiveDate) {
    const lastActive = new Date(nextStreak.lastActiveDate);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);
    if (lastActive.getTime() < yesterday.getTime()) {
      nextStreak = { ...nextStreak, current: 0 };
    }
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
    weeklyStats: nextWeekly,
    streak: nextStreak,
    cycle: 0,
    plan: { muevete: false, respira: false, extra: false, hidratate: false },
    water: { ...migratedState.water, today: 0, lastReset: todayStr },
    lastActiveDay: todayStr,
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
        palette: detectInitialPalette(),
        lastActiveDay: new Date().toDateString(),
        _weeklyStatsReindexed_v0_28_8: true,
        _historyRecalculated_v0_28_8: true,
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
    /* Migracion defensiva s75: paths.lastViewed ausente. */
    if (parsed.paths && parsed.paths.lastViewed === undefined) {
      parsed.paths.lastViewed = null;
    }

    /* Sesion 69 / v0.28.8: re-indexar weeklyStats de getDay() a lunes-primero.
       Idempotente via guard. Debe ocurrir ANTES de cualquier escritura/lectura
       que asuma la nueva convencion (incluyendo el rollover). */
    if (!parsed._weeklyStatsReindexed_v0_28_8 && parsed.weeklyStats) {
      parsed.weeklyStats = reindexWeeklyStatsMondayFirst(parsed.weeklyStats);
      parsed._weeklyStatsReindexed_v0_28_8 = true;
    }

    /* Sesion 69 / v0.28.8: migracion compensatoria de history.months/years.
       Como history.days es integro (overwrite idempotente desde s43),
       recalcular months/years desde days es 100% seguro y arregla cualquier
       inflacion previa de C2/C3. Idempotente via guard. */
    if (!parsed._historyRecalculated_v0_28_8 && parsed.history && parsed.history.days) {
      parsed.history = recomputeAllHistoryAggregates(parsed.history);
      parsed._historyRecalculated_v0_28_8 = true;
    }

    /* Sesion 71 / v0.28.9: paleta 'envejecido' retirada; migrar a 'crema'. */
    if (parsed.palette === 'envejecido') {
      parsed.palette = 'crema';
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
      palette: detectInitialPalette(),
      lastActiveDay: new Date().toDateString(),
      _weeklyStatsReindexed_v0_28_8: true,
      _historyRecalculated_v0_28_8: true,
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

// Aplicar tema al cargar
applyTheme();

/* Los utils de fecha e history (zeroEntry, toISODate, todayISO, getDayIndex-
   MondayFirst, getMondayOf, recompute*, archiveDayToHistory, getHistoryWith-
   Today) los expone state-history.jsx (s101). */
Object.assign(window, {
  LS_KEY, PACE_VERSION, TOAST_DURATION_MS, defaultState,
  detectInitialPalette,
  getState, setState, subscribe, usePace, ensureDayFresh,
  showToast, onToast, setCaminoUiActive,
});
