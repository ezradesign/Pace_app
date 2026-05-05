/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Estado global: simple store con useSyncExternalStore + localStorage.
*/

const { useSyncExternalStore, useCallback } = React;

/* NOTA (sesión 37 · v0.19.0): clave de localStorage bumpeada de v1 a v2.
   Pre-lanzamiento sin usuarios reales — hard reset intencional. Elimina
   la necesidad de migración para campos legacy (timerStyle circle/numero,
   layout editorial). Cualquier estado v1 guardado se ignora; arranca
   limpio con defaultState en v2. */
const LS_KEY = 'pace.state.v2';
const PACE_VERSION = 'v0.19.0';

const defaultState = {
  // Settings / Tweaks
  palette: 'crema',           // crema | oscuro | envejecido
  font: 'cormorant',          // garamond | cormorant | mono
  layout: 'sidebar',          // sidebar | minimal (editorial eliminado en v0.19.0)
  sidebarCollapsed: false,    // true cuando el usuario colapsa el sidebar a icon-rail
  timerStyle: 'aro',          // aro (default) | barra | analogico (circle/numero eliminados en v0.19.0)
  breathStyle: 'flor',        // pulso | ondas | petalo | organico | flor (híbrido pulso+pétalo)
  logoVariant: 'pace',        // pace (lockup vaca-P) | lineal | sello | ilustrado
  soundOn: false,
  lang: 'en',                 // 'es' | 'en' — detectado de navigator.language en first load

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

  // Contadores acumulados de sesiones por módulo (sesión 29).
  // Crecen monótonamente; nunca resetean en rollover. Alimentan los
  // logros breathe.sessions.10/50 y move.sessions.25.
  breatheSessionsTotal: 0,
  moveSessionsTotal: 0,

  // Set de fechas (toDateString()) en las que el usuario hizo al menos
  // una sesión antes de las 9:00. Cap de 30 entradas (suficiente para
  // alimentar `morning.5`). Sesión 29.
  morningDates: [],

  // Intención del día — capturada opcionalmente en el Welcome de primera
  // vez (sesión 17 / v0.12.0), visible también para edición futura.
  intention: '',

  // Welcome de primera vez (sesión 17 / v0.12.0).
  // `firstSeen`: timestamp de la primera interacción con el WelcomeModal.
  //   null = nunca visto → auto-trigger dispara la bienvenida.
  //   Una vez cerrado (OK o skip), se fija timestamp y no vuelve nunca.
  //   Mismo patrón que `supportSeenAt` (v0.11.11).
  firstSeen: null,

  // Buy Me a Coffee — monetización por donación (sesión 16, v0.11.11).
  // `supportSeenAt`: timestamp de la primera apertura del modal de apoyo.
  //   null = nunca visto → el auto-trigger (a los 7 días de racha) puede
  //   dispararse. Una vez visto (manual o auto) se fija el timestamp y
  //   no vuelve a auto-abrirse nunca. El usuario puede re-abrirlo las
  //   veces que quiera desde el botón del sidebar.
  // `supportCopyVariant`: DEPRECADO post-v0.12.1. El copy se consolidó
  //   en una sola variante ("Da de pastar a la vaca" con icono de vaca).
  //   Se conserva el campo en el state para no romper instalaciones
  //   existentes, pero SupportModule ignora su valor.
  supportSeenAt: null,
  supportCopyVariant: 'pastar',

  // Recordatorios — DECISIÓN (v0.11.3): la sección de UI se eliminó del Sidebar
  // para que todo quepa en 1920×1080 sin scroll. El array se conserva en el
  // state para no romper instalaciones existentes (usuarios que ya tengan
  // recordatorios guardados en localStorage) y por si se reintroduce un día
  // la sección (probablemente en un modal dedicado, no en el sidebar).
  // No hay action que lo mute actualmente.
  reminders: [],

  // Fechas (toDateString()) en las que se realizó alguna acción con soundOn=false.
  // Cap de 30 entradas. Alimenta master.silent.day. Sesión 34.
  silentDates: [],

  // Rollover: día de calendario del último uso (toDateString()).
  // Cuando cambia, se resetean cycle / plan / water.today al cargar.
  lastActiveDay: null,
};

let _state = loadState();
const _listeners = new Set();

function loadState() {
  const _detectLang = typeof detectInitialLang === 'function' ? detectInitialLang : () => 'en';
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      return { ...defaultState, lang: _detectLang(), lastActiveDay: new Date().toDateString() };
    }
    const parsed = JSON.parse(raw);
    /* Si el usuario no tiene lang guardado (instalación previa a i18n),
       detectarlo desde navigator.language y persistirlo. */
    if (!parsed.lang) parsed.lang = _detectLang();
    return rolloverIfNeeded({ ...defaultState, ...parsed });
  } catch (e) {
    return { ...defaultState, lang: _detectLang(), lastActiveDay: new Date().toDateString() };
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
  /* Trigger `first.return` — abrir la app un día distinto al de la
     última actividad. Sólo si había un día previo (no en la primera
     instalación, donde `lastActiveDay` viene null/undefined). El
     desbloqueo se delega a un microtask para no llamar a
     `unlockAchievement` desde dentro del propio loadState (la cola
     de toasts pendientes lo gestiona si el ToastHost aún no montó).
     Sesión 28. */
  if (state.lastActiveDay) {
    setTimeout(() => {
      try { unlockAchievement('first.return'); } catch (e) {}
    }, 0);
  }
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
  const prev = _state;
  _state = typeof patch === 'function' ? patch(_state) : { ...(_state), ...patch };
  persistState();
  _listeners.forEach(l => l());
  /* Optimización v0.12.1: aplicar tokens visuales sólo cuando palette o
     font cambian realmente. Antes se llamaba a setAttribute en cada tick
     (inocuo pero innecesario, 2 DOM writes por cada setState). */
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

/* ============================
   ACCIONES ESPECÍFICAS
   ============================ */

/* Detecta logros derivados del plan/ritual del día.
   Se llama desde cada acción de completar (pomodoro, breathe, move,
   extra, water) DESPUÉS del setState, leyendo `_state` ya actualizado.

   - `first.ritual`  → los 4 módulos del día tocados (respira + mueve +
                       extra + hidratate). El plan ya marca esos 4 flags;
                       basta con que los 4 sean true.
   - `first.plan`    → mismo trigger en código. Decisión de producto:
                       "completar el plan del día" === "tocar los 4 módulos
                       del día". `first.plan` se desbloquea junto a
                       `first.ritual` para que ambos sean cazables sin
                       inventar un segundo umbral artificial. Sesión 28.
   - `master.focus.day` → ya tenemos `addFocusMinutes` con buckets diarios;
                          aprovechamos esta función para chequear las 4h
                          (240 min) del día actual.
*/
function checkPlanAchievements() {
  const s = getState();
  const p = s.plan || {};
  if (p.muevete && p.respira && p.extra && p.hidratate) {
    unlockAchievement('first.ritual');
    unlockAchievement('first.plan');
  }
}

function checkFocusDayAchievement() {
  const s = getState();
  const day = new Date().getDay();
  const todayMin = (s.weeklyStats.focusMinutes || [])[day] || 0;
  if (todayMin >= 240) unlockAchievement('master.focus.day');
}

/* Detectores horarios — sesión 29.
   `master.dawn`  → sesión antes de las 7:00.
   `master.dusk`  → sesión después de las 21:00.
   `morning.5`    → 5 fechas distintas con sesión antes de las 9:00.
   Se llama desde cada acción de completar (breathe / move / extra /
   pomodoro). El registro de fechas para `morning.5` se persiste en el
   state como `morningDates: string[]` (toDateString) con cap de 30.
*/
function checkTimeOfDayAchievements() {
  const now = new Date();
  const h = now.getHours();
  if (h < 7) unlockAchievement('master.dawn');
  if (h >= 21) unlockAchievement('master.dusk');
  if (h < 9) {
    const today = now.toDateString();
    const s = getState();
    const list = Array.isArray(s.morningDates) ? s.morningDates : [];
    if (!list.includes(today)) {
      const next = [...list, today].slice(-30);
      setState({ morningDates: next });
      if (next.length >= 5) unlockAchievement('morning.5');
    }
  }
}

/* Detectores de logros collector — sesión 34.
   Se llama al final de cada unlockAchievement exitoso.
   Cuenta los logros ya en _state (incluido el que se acaba de añadir).
   unlockAchievement es idempotente → la recursión termina de forma natural. */
function checkCollectorAchievements() {
  const count = Object.keys(_state.achievements).length;
  if (count >= 50) unlockAchievement('master.collector.half');
  if (count >= 100) unlockAchievement('master.collector.full');
}

/* Detector master.silent.day — sesión 34.
   Registra hoy como día silencioso si soundOn=false y el usuario hizo algo.
   Se llama desde cada acción de completar. */
function checkSilentDayAchievement() {
  if (_state.soundOn) return;
  const today = new Date().toDateString();
  const list = Array.isArray(_state.silentDates) ? _state.silentDates : [];
  if (!list.includes(today)) {
    setState({ silentDates: [...list, today].slice(-30) });
    unlockAchievement('master.silent.day');
  }
}

/* Detector master.retreat — sesión 34.
   Usa los buckets weeklyStats ya existentes: breathMinutes[day] + moveMinutes[day].
   Extra suma al bucket moveMinutes (decisión activa), así que completeExtraSession
   también llama a este detector. */
function checkRetreatAchievement() {
  const day = new Date().getDay();
  const todayBreath = (_state.weeklyStats.breathMinutes || [])[day] || 0;
  const todayMove = (_state.weeklyStats.moveMinutes || [])[day] || 0;
  if (todayBreath + todayMove >= 120) unlockAchievement('master.retreat');
}

function unlockAchievement(id, note) {
  const s = getState();
  if (s.achievements[id]) return false;
  setState({
    achievements: { ...s.achievements, [id]: { unlockedAt: Date.now(), note } }
  });
  // Notificación flotante
  showToast({ id, type: 'achievement' });
  checkCollectorAchievements();
  return true;
}

function addFocusMinutes(mins) {
  ensureDayFresh();
  /* v0.12.1: calculamos todo dentro del updater y, tras el setState,
     leemos el total oficial desde `_state` (no desde una variable de
     cierre) para disparar logros. Evita el riesgo de que otra acción
     se cuele entre el updater y la evaluación de umbrales. */
  setState(prev => {
    const day = new Date().getDay();
    const week = [...prev.weeklyStats.focusMinutes];
    week[day] += mins;
    return {
      ...prev,
      totalFocusMin: prev.totalFocusMin + mins,
      weeklyStats: { ...prev.weeklyStats, focusMinutes: week },
    };
  });
  const h = _state.totalFocusMin / 60;
  if (h >= 10) unlockAchievement('focus.hours.10');
  if (h >= 50) unlockAchievement('focus.hours.50');
  if (h >= 100) unlockAchievement('focus.hours.100');
  /* Logro de día de foco intenso: 4h en una sola jornada. Se evalúa
     aquí porque `addFocusMinutes` es donde crecen los buckets diarios
     en `weeklyStats.focusMinutes[day]`. Sesión 28. */
  checkFocusDayAchievement();
}

function completePomodoro() {
  ensureDayFresh();
  /* v0.12.1: capturamos el valor de minutos de foco ANTES del updater
     (el modo/minutos puede cambiar por tweak durante el tick); el
     updater sólo incrementa cycle. Luego leemos el nuevo cycle desde
     `_state` para los umbrales de logro. */
  const focusMinsAtCompletion = _state.focusMinutes;
  setState(prev => ({ ...prev, cycle: prev.cycle + 1 }));
  addFocusMinutes(focusMinsAtCompletion);
  unlockAchievement('first.step');
  if (_state.cycle >= 8) unlockAchievement('master.pomodoro.8');
  /* `master.long.focus` — completar un Pomodoro de 45 min sin pausa.
     Se evalúa contra los minutos del bloque que acaba de cerrarse,
     no contra el state.focusMinutes (que puede haberse cambiado por
     tweak antes de que termine el ticker). Sesión 29. */
  if (focusMinsAtCompletion >= 45) unlockAchievement('master.long.focus');
  checkTimeOfDayAchievements();
  checkSilentDayAchievement();
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
    /* Contador acumulado de sesiones de respiración (sesión 29).
       Crece monótonamente; alimenta breathe.sessions.10/50. */
    breatheSessionsTotal: (s.breatheSessionsTotal || 0) + 1,
  });
  unlockAchievement('first.breath');
  /* Umbrales de constancia por módulo. Leemos `_state` ya actualizado
     para no usar variables de cierre (patrón validado en sesión 18). */
  if (_state.breatheSessionsTotal >= 10) unlockAchievement('breathe.sessions.10');
  if (_state.breatheSessionsTotal >= 50) unlockAchievement('breathe.sessions.50');
  checkPlanAchievements();
  checkTimeOfDayAchievements();
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
  checkRetreatAchievement();
  checkSilentDayAchievement();
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
    /* Contador acumulado de sesiones Mueve (sesión 29). Solo Mueve,
       Extra tiene su propio camino; el bucket de stats sí los suma. */
    moveSessionsTotal: (s.moveSessionsTotal || 0) + 1,
  });
  unlockAchievement('first.stretch');
  if (_state.moveSessionsTotal >= 25) unlockAchievement('move.sessions.25');
  checkPlanAchievements();
  checkTimeOfDayAchievements();
  checkRetreatAchievement();
  checkSilentDayAchievement();
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
  checkPlanAchievements();
  checkTimeOfDayAchievements();
  // Logros de exploración de movilidad.
  // NOTA (sesión 15): tras el swap de sesión 14, las rutinas de
  // movilidad (move.hips.5, move.shoulders.5, move.atg.knees,
  // move.ancestral, move.neck.3, move.desk.quick) pasaron de
  // MOVE_ROUTINES a EXTRA_ROUTINES y ahora desembocan aquí. Los ids de
  // rutina no se renombran (decisión activa: ids = identificadores
  // estables), así que el map conserva los ids `move.*` aunque viva en
  // completeExtraSession.
  const exploreMap = {
    'move.hips.5': 'explore.hips',
    'move.shoulders.5': 'explore.shoulders',
    'move.atg.knees': 'explore.atg',
    'move.ancestral': 'explore.ancestral',
    'move.neck.3': 'explore.neck',
    'move.desk.quick': 'explore.desk',
  };
  if (exploreMap[routineId]) unlockAchievement(exploreMap[routineId]);
  checkRetreatAchievement();
  checkSilentDayAchievement();
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
  if (delta > 0) {
    unlockAchievement('first.sip');
    checkPlanAchievements();
    checkSilentDayAchievement();
  }
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
  /* `first.day` — primer día de uso. Equivale a la primera vez que
     se llama a updateStreak con éxito, así que current === 1 lo
     captura. unlockAchievement es idempotente. Sesión 28. */
  if (current >= 1) unlockAchievement('first.day');
  if (current >= 3) unlockAchievement('streak.3');
  if (current >= 7) unlockAchievement('streak.7');
  if (current >= 14) unlockAchievement('streak.14');
  if (current >= 30) unlockAchievement('streak.30');
  if (current >= 60) unlockAchievement('streak.60');
  if (current >= 100) unlockAchievement('streak.100');
  if (current >= 365) unlockAchievement('streak.365');
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
  const wasEmpty = _toastListeners.size === 0;
  _toastListeners.add(listener);
  /* v0.12.1: vaciamos el buffer pendiente en cuanto hay AL MENOS un
     listener (antes la condición era `size === 1`, que fallaba bajo
     StrictMode cuando React monta y desmonta el host dos veces: el
     segundo listener nunca recibía los toasts buffeados). */
  if (wasEmpty && _pendingToasts.length > 0) {
    const drained = _pendingToasts.splice(0);
    // Despachamos en el próximo tick para no interferir con el mount del Host.
    setTimeout(() => { drained.forEach(t => listener(t)); }, 0);
  }
  return () => _toastListeners.delete(listener);
}

// Init theme on load
applyTheme();

function setLang(lang) {
  setState({ lang });
}

Object.assign(window, {
  usePace, getState, setState, subscribe,
  unlockAchievement, completePomodoro,
  completeBreathSession, completeMoveSession, completeExtraSession,
  addWaterGlass, addFocusMinutes, updateStreak,
  ensureDayFresh,
  showToast, onToast,
  setLang,
  PACE_VERSION,
});
