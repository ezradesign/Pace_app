# Sesion 69 — 2026-05-12 — fix(tracking): C1+C2+C3+A1+A2 (v0.28.8)

> Pre-lanzamiento Reddit. Aplica los 5 fixes criticos/altos identificados en
> la auditoria pasiva s68 (`docs/audits/audit-tracking-v0.28.7.md`).

---

## 1. Resumen ejecutivo

La auditoria s68 detecto que `weeklyStats` no se reseteaba entre semanas
(C1), que la migracion s43 archivaba dos veces (C2), y que `archiveDayToHistory`
era asimetrico (idempotente sobre `days`, acumulativo sobre `months/years` — C3).
La consecuencia visible: heatmap Mes y Año mostraban totales inflados, y la
columna del dia actual sumaba minutos fantasma cuando la app llevaba >7 dias
abierta.

Tambien quedaban dos altos de UX: (A1) la racha del ano contaba "agua sola" como
dia activo, mientras que `streak.current` no, generando discrepancia visible
entre sidebar y YearView; y (A2) el streak no se rompia proactivamente cuando
el usuario pasaba dias inactivo — la UI mentia hasta la siguiente sesion.

Esta sesion arregla los 5 (C1, C2, C3, A1, A2) con la menor superficie posible,
añade una **migracion compensatoria idempotente** para corregir datos ya
inflados, y deja **5 tests de regresion** ejecutables en DevTools antes del
commit.

A3 (DST) y A4 (logros con retraso) quedan documentados pero diferidos a una
sesion post-Reddit.

---

## 2. Decisiones de diseno (tomadas por el autor antes de codificar)

| Bug | Opcion elegida | Justificacion |
|---|---|---|
| C1 (semantica de `weeklyStats`) | **B** — semana fija lunes-domingo, reset completo cada nuevo lunes, `weeklyStats[0]=lunes ... [6]=domingo` | Mas predecible que "ultimos 7 dias por offset" (A). Resetear todo al cruzar lunes elimina la posibilidad de dias fantasma. |
| A2 (rotura de streak) | **X** — deteccion proactiva en `rolloverIfNeeded`. Si `streak.lastActiveDate < ayer`, `current = 0` antes de retornar el nuevo estado | UX directa: cuando el usuario abre la app despues de 2+ dias, la UI dice "0" inmediatamente, no la siguiente sesion. |
| C2 (datos pasados) | **P** — migracion compensatoria que recalcula `history.months` y `history.years` desde `history.days` (integro por overwrite idempotente) | `days` no esta corrompido; recompute es 100% seguro. Guard `_historyRecalculated_v0_28_8` para una sola ejecucion. |

---

## 3. Validacion previa (Tarea 0)

Los 5 bugs se confirmaron en codigo antes de tocar nada:

| Bug | Cita exacta | Estado |
|---|---|---|
| C1 | `app/state-core.jsx:195-226` (rolloverIfNeeded retorna `cycle:0, plan:{...}, water:{...}, lastActiveDay`. No toca `weeklyStats`) | Confirmado |
| C2 | `app/state-core.jsx:184-187` (migracion archiva offset 0..6) + `:202-208` (rolloverIfNeeded vuelve a archivar lastActiveDay) | Confirmado |
| C3 | `:171` overwrite `days[iso]=delta`; `:127-140` y `:144-156` `prev + delta` acumulativo en months/years | Confirmado |
| A1 | `state-achievements.jsx:122-141` (updateStreak NO se llama desde addWaterGlass); `YearView.jsx:11-15,64-78` (computeDayScore incluye waterGlasses/8, computeYearStats cuenta `cell.score > 0`) | Confirmado |
| A2 | `state-achievements.jsx:132` unica mutacion de `streak` esta dentro de `updateStreak`, solo invocada al completar sesion. Sin logica de rotura proactiva en ningun otro punto | Confirmado |

---

## 4. Cambios aplicados

### 4.1. `app/state-core.jsx` — reescrito casi por completo

**Nuevos helpers:**

- `getDayIndexMondayFirst(date)` — indice 0=lunes..6=domingo desde un Date o string.
- `getMondayOf(date)` — lunes 00:00 local de la semana que contiene `date`.
- `recomputeMonthFromDays(days, monthKey)` — suma idempotente de un mes desde `history.days`.
- `recomputeYearFromDays(days, yearKey)` — idem para un año.
- `recomputeAllHistoryAggregates(history)` — recompute completo, usado en migracion compensatoria.
- `reindexWeeklyStatsMondayFirst(ws)` — rotacion `nuevo[i] = viejo[(i+1)%7]`.

**Funciones refactorizadas:**

- `archiveDayToHistory(history, dateStr, weeklyStats)` ahora 100% idempotente.
  Usa `getDayIndexMondayFirst(dateStr)` para leer el slot (alineado con la
  nueva convencion del array). Recalcula `months[mk]` y `years[yk]` desde
  `days` cada vez. Llamar N veces produce el mismo resultado.
- `rolloverIfNeeded(state)`:
  - Captura `wasAlreadyMigrated = state._historyMigrated` ANTES de
    `migrateWeeklyStatsToHistory`. Solo re-archiva si era `true` (fix C2).
  - Calcula `prevMonday` vs `todayMonday`. Si difieren, `weeklyStats` -> ceros (fix C1).
  - Calcula si `streak.lastActiveDate < ayer` -> `current = 0` (fix A2).
- `loadState()`:
  - Antes del rollover: si `!parsed._weeklyStatsReindexed_v0_28_8`, llama
    `reindexWeeklyStatsMondayFirst` (fix indexacion).
  - Si `!parsed._historyRecalculated_v0_28_8`, llama
    `recomputeAllHistoryAggregates` (migracion compensatoria de C2/C3).
- `defaultState` añade 2 guards: `_weeklyStatsReindexed_v0_28_8`,
  `_historyRecalculated_v0_28_8`.

**Funciones eliminadas:**

- `updateMonthAggregate`, `updateYearAggregate` (asimetria de C3). Sustituidas
  por `recomputeMonthFromDays` / `recomputeYearFromDays`. Sin consumidores
  externos en el repo (verificado por grep).

### 4.2. Escrituras a `weeklyStats` (lunes-primero)

- `app/state-timer.jsx:11,19` — `checkFocusDayAchievement` + `addFocusMinutes` usan `getDayIndexMondayFirst(new Date())`.
- `app/state-hydrate.jsx:27` — `addWaterGlass` idem.
- `app/state-achievements.jsx:105,150,192,213` — `checkRetreatAchievement` + 3 `complete*Session` idem.

### 4.3. Lecturas (eliminacion del reorder)

- `app/stats/StatsPanel.jsx:97` — eliminado `const reordered = [data[1], ... data[0]]`. `WeekBarRow` itera `data` directamente.
- `app/stats/WeeklyStats.jsx:68` — idem (codigo muerto pero corregido por consistencia).
- `app/shell/Sidebar.jsx:339` — `WeekDots` ahora indexa `weeklyStats.focusMinutes[i]` (sin `(i+1)%7`).
- `app/shell/Sidebar.jsx:235` — `hitos` proxy usa `getDayIndexMondayFirst(new Date())`.

### 4.4. `app/stats/YearView.jsx` — A1

Nuevo helper `isActiveDay(entry)` con criterio "focus|breath|move > 0".
`computeYearStats` cuenta `activeDays`, `curStreak`, `maxStreak` segun ese
criterio (agua sola NO cuenta). `totalActions` sigue sumando `Math.round(cell.score)`
sin cambios (eso es M3, fuera de scope).

### 4.5. Version + bundle

- `app/state-core.jsx`: `PACE_VERSION = 'v0.28.8'`.
- `PACE.html`: `<title>...v0.28.8</title>`.
- `sw.js`: `CACHE_NAME = 'pace-v0.28.8'`.
- `app/state.jsx`: re-exports de `recomputeMonthFromDays`, `recomputeYearFromDays`, `recomputeAllHistoryAggregates`, `getDayIndexMondayFirst`, `getMondayOf` en lugar de `updateMonthAggregate`/`updateYearAggregate`.

---

## 5. Tabla de archivos modificados

| Archivo | Cambio |
|---|---|
| `app/state-core.jsx` | Reescrito: helpers nuevos, archiveDayToHistory idempotente, rollover con C1+A2+C2, loadState con 2 guards de migracion. PACE_VERSION → v0.28.8. |
| `app/state-timer.jsx` | `getDay()` → `getDayIndexMondayFirst()` en 2 funciones. |
| `app/state-hydrate.jsx` | Idem en `addWaterGlass`. |
| `app/state-achievements.jsx` | Idem en `checkRetreatAchievement` + 3 `complete*Session`. |
| `app/state.jsx` | Exports actualizados: nuevas funciones, elimina updateMonth/YearAggregate. |
| `app/stats/StatsPanel.jsx` | `WeekBarRow`: eliminado reorder. |
| `app/stats/WeeklyStats.jsx` | Idem (codigo muerto, fixed por consistencia). |
| `app/stats/YearView.jsx` | `isActiveDay()` helper + `computeYearStats` con criterio unificado. |
| `app/shell/Sidebar.jsx` | `WeekDots` sin `(i+1)%7`; `hitos` con helper lunes-primero. |
| `PACE.html` | Titulo → v0.28.8. |
| `sw.js` | CACHE_NAME → pace-v0.28.8. |
| `PACE_standalone.html` | Regenerado (566 KB). |
| `index.html` | Regenerado (idem, SHA256 identico). |
| `CHANGELOG.md` | Entrada v0.28.8 + fila en tabla; v0.28.6 sale del detalle. |
| `STATE.md` | Reescrita "Ultima sesion", versiones actualizadas, backups rotados. |
| `docs/audits/regression-tests-v0.28.8.md` | NUEVO — 5 tests DevTools. |
| `docs/sessions/session-69-fixes-tracking-criticos.md` | Este diario. |
| `backups/PACE_standalone_v0.28.7_20260512.html` | Backup creado; rotado v0.25.2 / 20260507. |

---

## 6. Bugs NO arreglados (deliberadamente)

| Bug | Severidad | Razon para diferir |
|---|---|---|
| A3 (DST en hydrate.week.perfect) | ALTA | Solo afecta 2 dias/año (cambios de hora). Post-Reddit. |
| A4 (checkStatsAchievements con 1 dia de retraso) | ALTA | Cosmetico, achievement se desbloquea al siguiente abrir. Post-Reddit. |
| M1 (WeeklyStats.jsx codigo muerto) | MEDIA | Solo se corrigio la indexacion interna por consistencia. Eliminacion completa = otra sesion. |
| M2 (paths.history s54 con fechas duplicadas) | MEDIA | Daño hecho a usuarios legacy, irrecuperable. Documentado en informe. |
| M3 (totalActions redondea score) | MEDIA | Cosmetica. Renombrar o cambiar formula = otra sesion. |
| M4 (deep merge en loadState) | MEDIA | Defensa preventiva, no bug activo. |
| M5 (mezcla toDateString/ISO) | MEDIA | Deuda tecnica. |
| M6 (extra y move comparten bucket) | MEDIA | Decision documentada. |
| B1..B5 | BAJA | Limpieza menor. |

---

## 7. Lecciones

1. **Idempotencia vs acumulacion**: cuando una estructura tiene fuente
   integra (aqui `history.days` por overwrite), los agregados derivados
   (months/years) deben recalcularse de la fuente, no acumularse. Acumular
   exige saber que la operacion se ejecuta exactamente una vez por evento,
   lo cual rara vez se garantiza en una app con migraciones, rollovers
   diferidos y handlers solapados. Recompute desde la fuente integra es la
   defensa por defecto.
2. **Semantica clara de campos temporales**: `weeklyStats[i]` con `i = getDay()`
   era ambiguo (¿es "dia de la semana" o "ultimos 7 dias"? ¿domingo es 0 o 6?).
   La nueva convencion lunes=0..domingo=6, con reset por semana fija, deja
   un solo mapeo correcto para escritura y lectura, sin reorders en consumidores.
3. **Reset proactivo vs reactivo**: rachas y agregados temporales que dependen
   del paso del tiempo deben evaluarse en cada carga, no solo cuando se
   "completa" algo. Si no, la UI miente mientras el usuario no actua.
4. **Migracion compensatoria via guard**: cuando un bug corrompe datos
   acumulativos, no basta con arreglar el bug. Hay que documentar la
   migracion compensatoria con un guard explicito (`_historyRecalculated_v0_28_8`)
   que se ejecute exactamente una vez por instalacion.

---

## 8. Verificacion antes del commit

El usuario debe:

1. Abrir la app en **ventana de incognito**.
2. Pegar los 5 tests de `docs/audits/regression-tests-v0.28.8.md` uno a uno
   en DevTools console.
3. Confirmar que cada uno imprime `PASS Test N`.
4. Si los 5 pasan -> commit + push.
5. Si alguno falla -> reportar cual y se ajusta.

**Mensaje de commit sugerido:**

```
fix(tracking): C1+C2+C3+A1+A2 weeklyStats/history idempotente + streak proactivo (v0.28.8)
```
