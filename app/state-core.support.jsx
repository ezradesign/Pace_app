/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-core.support.jsx — detección de entorno, MIGRACIONES y ROLLOVER.
   Extraído de `state-core.jsx` en s148, que llegó a 510 líneas (el límite de
   CLAUDE.md es 500). Mismo patrón `*.support` que `state-achievements.support`
   (s146), `MoveSessionV1.support` y `FocusTimer.support`.

   Qué vive aquí: todo lo que convierte un estado GUARDADO (posiblemente de una
   versión vieja) en un estado de HOY. `state-core.jsx` se queda con el store,
   `loadState`, el tema y los toasts.

   ============================================================
   ESTE ARCHIVO CARGA **ANTES** QUE state-core.jsx. NO ES OPCIONAL.
   ============================================================
   `state-core.jsx` hace `let _state = loadState();` en el cuerpo del archivo,
   o sea que `loadState` corre AL EVALUARSE, no al montar. Y `loadState` llama
   a `rolloverIfNeeded`, `detectInitialPalette`, `isMobileViewport` y
   `reindexWeeklyStatsMondayFirst`, que están aquí. Si este archivo cargara
   después, `loadState` reventaría en el primer arranque de cada pestaña.

   Es la misma razón por la que `state-history.jsx` y `flags.js` van antes que
   `state-core.jsx`: `rolloverIfNeeded` resuelve `archiveDayToHistory` y
   `getMondayOf` por window, y `loadState` lee las banderas de superficie.
   El orden completo en PACE.html es:
     i18n → state-history → flags → state-core.support → state-core → …

   `unlockAchievement` es la excepción y ya lo era: se llama DIFERIDO con
   `setTimeout` porque `state-achievements.jsx` carga después. Ver el comentario
   en `rolloverIfNeeded`.
*/

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

Object.assign(window, {
  isMobileViewport, detectInitialPalette,
  migrateWeeklyStatsToHistory, reindexWeeklyStatsMondayFirst,
  rolloverIfNeeded,
});
