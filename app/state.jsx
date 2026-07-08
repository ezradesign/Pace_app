/* PACE · state.jsx — INDICE
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Este archivo es el punto de entrada del sistema de estado.
   La logica vive en los modulos state-*.jsx (cargados antes en PACE.html).
   Aqui solo se re-exporta la API publica completa al window para que
   cualquier componente pueda acceder a ella sin conocer la estructura interna.

   Orden de carga en PACE.html:
     1. state-core.jsx        (store, loadState, helpers, toast)
     2. state-timer.jsx       (addFocusMinutes, completePomodoro)
     3. state-hydrate.jsx     (addWaterGlass)
     4. state-achievements.jsx (unlockAchievement, complete*Session, updateStreak)
     5. state-paths.jsx       (paths CRUD, stats)
     6. state-settings.jsx    (setLang)
     7. state.jsx             (este archivo — re-export consolidado)

   Sesion 57 / v0.27.5 — split desde monolito de 1026 lineas.
*/

/* Re-exportacion consolidada — lista identica a la del Object.assign
   original de state.jsx v0.27.4. Ningun nombre anadido ni eliminado. */
Object.assign(window, {
  usePace,
  getState,
  setState,
  subscribe,
  unlockAchievement,
  completePomodoro,
  completeBreathSession,
  completeMoveSession,
  completeExtraSession,
  addWaterGlass,
  addFocusMinutes,
  updateStreak,
  ensureDayFresh,
  showToast,
  onToast,
  setLang,
  PACE_VERSION,
  // sesion 43 -- history helpers (refactor sesion 69)
  zeroEntry,
  toISODate,
  archiveDayToHistory,
  recomputeMonthFromDays,
  recomputeYearFromDays,
  recomputeAllHistoryAggregates,
  getDayIndexMondayFirst,
  getMondayOf,
  // sesion 49 -- Caminos
  startPath,
  advancePathStep,
  completePath,
  abandonPath,
  getSuggestedPath,
  setFavoritePath,
  clearFavoritePath,
  toggleFavoritePath,
  setLastViewedPath, // s75
  getPathStats,
  // sesion 95 -- guard central de entitlement
  canAccessRoutine,
  canAccessPath,
});
