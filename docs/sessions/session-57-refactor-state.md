# Session 57 — Refactor state.jsx en modulos (v0.27.5)

**Fecha:** 2026-05-11
**Version:** v0.27.3 → v0.27.5
**Tipo:** refactor — sin cambios de comportamiento

---

## Contexto y motivacion

`app/state.jsx` habia crecido a 1026 lineas concentrando logica heterogenea:
store core, loadState, rollover, history helpers, toast buffer, actions de timer,
hydrate, achievements, paths y settings. Era el archivo mas editado del proyecto
y la principal fuente historica de truncamientos del Edit tool (s48, s51, s54, s54b).
Aunque desde s56 el blindaje del build caza truncamientos, seguia siendo el archivo
con mayor riesgo y mayor friccion al leer/modificar.

---

## Mapa funcion → modulo

| Funcion / Constante | Modulo |
|---|---|
| LS_KEY, PACE_VERSION, defaultState | state-core |
| isMobileViewport, todayISO, toISODate, zeroEntry | state-core |
| updateMonthAggregate, updateYearAggregate | state-core |
| archiveDayToHistory, migrateWeeklyStatsToHistory | state-core |
| rolloverIfNeeded, ensureDayFresh, loadState | state-core |
| _state, _listeners, persistState, getState, setState, subscribe | state-core |
| applyTheme, usePace | state-core |
| _toastListeners, _pendingToasts, showToast, onToast | state-core |
| checkFocusDayAchievement, addFocusMinutes, completePomodoro | state-timer |
| checkHydrateWeekPerfect, addWaterGlass | state-hydrate |
| BREATH_ROUTINE_CATEGORIES, checkPlanAchievements | state-achievements |
| checkTimeOfDayAchievements, checkCollectorAchievements | state-achievements |
| checkSilentDayAchievement, checkRoutineCountAchievements | state-achievements |
| checkStatsAchievements, checkRetreatAchievement | state-achievements |
| unlockAchievement, updateStreak | state-achievements |
| completeBreathSession, completeMoveSession, completeExtraSession | state-achievements |
| startPath, advancePathStep, completePath, abandonPath | state-paths |
| getSuggestedPath, computePathStreaks, getPathStats | state-paths |
| setFavoritePath, clearFavoritePath, toggleFavoritePath | state-paths |
| setLang | state-settings |

---

## Archivos creados / modificados

| Archivo | Accion | Lineas |
|---|---|---|
| app/state-core.jsx | NUEVO | 356 |
| app/state-timer.jsx | NUEVO | 49 |
| app/state-hydrate.jsx | NUEVO | 52 |
| app/state-achievements.jsx | NUEVO | 251 |
| app/state-paths.jsx | NUEVO | 166 |
| app/state-settings.jsx | NUEVO | 13 |
| app/state.jsx | REESCRITO (indice) | 58 |
| PACE.html | actualizado (scripts + v0.27.5) | — |
| build-standalone.js | fix ruta TS Windows | — |

**Lineas antes:** 1026 (state.jsx monolitico)
**Lineas despues:** 356 + 49 + 52 + 251 + 166 + 13 + 58 = **945 total**
**Overhead:** -81 lineas (-8%) — reduccion por eliminacion de comentarios duplicados.

---

## Validaciones T9

| Traza | Descripcion | Resultado |
|---|---|---|
| a | loadState con LS vacio → defaultState completo | OK |
| b | loadState con state existente → migracion preserva slices | OK |
| c | startPath + advancePathStep → completed+1, history+1 | OK |
| d | addWaterGlass +1/-1 → contador correcto | OK |
| e | unlockAchievement idempotente | OK |
| f | setLang persiste en localStorage | OK |

**21/21 checks OK.**

---

## Validaciones V1..V8

| Check | Resultado |
|---|---|
| V1: cada state-*.jsx < 400 lineas | OK (max: state-core 356, state-achievements 251) |
| V2: state.jsx (indice) < 150 lineas | OK (58 lineas) |
| V3: total <= 1.05 * 1026 = 1077 lineas | OK (945 lineas) |
| V4: 31 exports preservados | OK (lista identica) |
| V5: build sin errores | OK (39 archivos, 0 errores, 0 WARN) |
| V6: trazas T9 a-f | OK (21/21) |
| V7: bundle 538 KB, no null, no replacement chars | WARN (538 KB, 2 KB bajo rango 540-580) |
| V8: simbolos clave >= 16 ocurrencias totales | OK (170 ocurrencias) |

V7 WARN: el bundle encogió 7 KB respecto al build pre-refactor (545 KB → 538 KB)
porque el indice state.jsx paso de 1026 a 58 lineas y los nuevos modulos
tienen menos comentarios. Sin codigo perdido — verificado por V8 y T9.

---

## Notas tecnicas

- `defaultState` permanece entero en state-core (no se fragmento en slices)
  para evitar dependencias circulares en tiempo de parse (let _state = loadState()
  se ejecuta cuando se parsea state-core.jsx, antes de que otros modulos carguen).
- Dependencias cruzadas (timer → achievements, hydrate → achievements, etc.) son
  todas en runtime — no en tiempo de parse. Sin problemas de inicializacion.
- `build-standalone.js` parchado para buscar TypeScript en node_modules local
  ademas de la ruta Linux (fragil en el entorno Windows del worktree).
- Backups: eliminados v0.17.0, v0.18.0, v0.19.1, v0.20.0 (marcados para borrar).
  Total: 20 backups exactos.
