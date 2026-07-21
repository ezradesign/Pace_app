/* PACE · state.jsx — INDICE
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Este archivo es el punto de entrada del sistema de estado.
   La logica vive en los modulos state-*.jsx (cargados antes en PACE.html).
   Aqui solo se re-exporta la API publica completa al window para que
   cualquier componente pueda acceder a ella sin conocer la estructura interna.

   Orden de carga en PACE.html:
     1. state-history.jsx     (utils fecha + history helpers + getHistoryWithToday — s101)
     2. state-core.jsx        (store, loadState, rollover, migraciones, toast)
     3. state-timer.jsx       (addFocusMinutes, completePomodoro, completeFocusSession)
     4. state-hydrate.jsx     (addWaterGlass)
     5. state-achievements.jsx (unlockAchievement, complete*Session, updateStreak)
     6. state-paths.jsx       (paths CRUD, stats)
     7. state-settings.jsx    (setLang)
     8. state-feedback.jsx    (recordRoutineFeedback, shouldPromptRoutineFeedback — s116)
     9. state.jsx             (este archivo — re-export consolidado)

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
  completeFocusSession,
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
  // sesion 43 -- history helpers (refactor s69; viven en state-history desde s101)
  zeroEntry,
  toISODate,
  archiveDayToHistory,
  recomputeMonthFromDays,
  recomputeYearFromDays,
  recomputeAllHistoryAggregates,
  getDayIndexMondayFirst,
  getMondayOf,
  getHistoryWithToday, // s101 -- stats vivos (Mes/Año incluyen el dia actual)
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
  // sesion 116 -- feedback ligero por rutina (B2.2b-2)
  recordRoutineFeedback,
  shouldPromptRoutineFeedback,
  nextRoutineFeedback,
});
