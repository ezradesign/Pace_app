# Auditoría del sistema de tracking — PACE v0.28.7

> Sesión 68 — 2026-05-12 — auditoría pasiva, sin modificación de código.
> Objetivo: validar la fiabilidad del tracking antes de lanzamiento público (Reddit).

---

## 0. Resumen ejecutivo

**Veredicto:** lanzable a Reddit **sí, con caveats**. La app no pierde datos del día en curso ni corrompe sesiones individuales. Pero hay **tres bugs críticos** en el sistema de agregación histórica (`weeklyStats` + `history.months` + `history.years`) que producen **datos inflados o fantasma** en las vistas Mes y Año. Un usuario que use la app durante varias semanas verá totales mensuales y anuales más altos que la suma real de sus sesiones.

El daño es **silencioso**: la columna del día (vista Semana) y los contadores individuales (totalFocusMin, breatheSessionsTotal, streak) son fiables. Sólo se manifiesta en el heatmap mensual/anual y al hacer rollover entre días iguales de la semana (martes a martes, lunes a lunes…).

**Recomendación operativa:**

| Acción | Severidad | Cuándo |
|---|---|---|
| Fix C1 (reset de `weeklyStats` en rollover) | Crítico | Antes de Reddit |
| Fix C2 (doble archivado durante migración) | Crítico-histórico | Antes de Reddit |
| Fix C3 (idempotencia de `archiveDayToHistory`) | Crítico | Mismo PR que C1/C2 |
| Fix A1 (definición unificada de "día activo") | Alto | Antes de Reddit si tiempo lo permite |
| Fix A2 (rotura proactiva de streak en rollover) | Alto | Antes de Reddit |
| Fix A3 (DST en hydrate.week.perfect) | Alto | Post-lanzamiento (sólo 2 días/año) |
| Resto | Medio/Bajo | Post-lanzamiento |

No se han aplicado fixes en esta sesión. C1 cumple el criterio "pérdida de datos activa" pero su corrección requiere una decisión de diseño (semántica de `weeklyStats`) que debe tomar el autor antes de tocar código.

---

## 1. Inventario del sistema

### 1.1. Campos trackeados (en `defaultState`, [state-core.jsx:15](app/state-core.jsx:15))

| Campo | Tipo | Reseteo | Notas |
|---|---|---|---|
| `totalFocusMin` | number | Nunca | Monotónico |
| `cycle` | number | Cada rollover | Pomodoros del día |
| `weeklyStats.focusMinutes[7]` | int[] | **NUNCA** ⚠ | Indexado por `getDay()` (0=dom) |
| `weeklyStats.breathMinutes[7]` | int[] | **NUNCA** ⚠ | Igual |
| `weeklyStats.moveMinutes[7]` | int[] | **NUNCA** ⚠ | Igual |
| `weeklyStats.waterGlasses[7]` | int[] | **NUNCA** ⚠ | Igual |
| `streak.current/longest/lastActiveDate` | mixed | Manualmente en `updateStreak` | `lastActiveDate` usa `toDateString()` |
| `breatheSessionsTotal` | number | Nunca | Monotónico |
| `moveSessionsTotal` | number | Nunca | Monotónico |
| `morningDates[≤30]` | string[] | Cap por slice | `toDateString()` |
| `silentDates[≤30]` | string[] | Cap por slice | `toDateString()` |
| `waterGoalDates[≤14]` | string[] | Cap por slice | `toDateString()` |
| `routineCounts.{box,coherent,rounds,atg}` | obj | Nunca | Monotónico |
| `history.days["YYYY-MM-DD"]` | obj | Nunca, overwrite | Idempotente |
| `history.months["YYYY-MM"]` | obj | Nunca, **acumula** ⚠ | NO idempotente |
| `history.years["YYYY"]` | obj | Nunca, **acumula** ⚠ | NO idempotente |
| `paths.completed[id].{count,lastDoneAt}` | obj | Nunca | `lastDoneAt` usa `todayISO()` |
| `paths.history[]` | string[] | Nunca | ISO `'YYYY-MM-DD'` |
| `lastActiveDay` | string | Cada rollover | `toDateString()` |
| `_historyMigrated` | bool | Una vez (true) | Guard s43 |

### 1.2. Escritores (puntos que mutan tracking)

| Función | Origen UI | Mutaciones |
|---|---|---|
| [completePomodoro](app/state-timer.jsx:35) | [FocusTimer.jsx:56](app/focus/FocusTimer.jsx:56) — al llegar a 0 | `cycle`, `weeklyStats.focusMinutes`, `totalFocusMin`, achievements, `streak` |
| [addFocusMinutes](app/state-timer.jsx:16) | Llamado por `completePomodoro` | `weeklyStats.focusMinutes`, `totalFocusMin` |
| [completeBreathSession](app/state-achievements.jsx:147) | [BreatheSession.jsx:198](app/breathe/BreatheSession.jsx:198) | `plan.respira`, `weeklyStats.breathMinutes`, `breatheSessionsTotal`, `routineCounts`, achievements, `streak` |
| [completeMoveSession](app/state-achievements.jsx:189) | [MoveModule.jsx:92](app/move/MoveModule.jsx:92) | `plan.muevete`, `weeklyStats.moveMinutes`, `moveSessionsTotal`, achievements, `streak` |
| [completeExtraSession](app/state-achievements.jsx:209) | [MoveModule.jsx:91](app/move/MoveModule.jsx:91) | `plan.extra`, `weeklyStats.moveMinutes` (¡bucket compartido con Move!), `routineCounts.atg`, achievements, `streak` |
| [addWaterGlass](app/state-hydrate.jsx:23) | [HydrateModule.jsx:28,67,68](app/hydrate/HydrateModule.jsx:28), [PathRunner.jsx:206](app/paths/PathRunner.jsx:206) | `water.today`, `plan.hidratate`, `weeklyStats.waterGlasses`, `waterGoalDates`, achievements |
| [advancePathStep](app/state-paths.jsx:25) | [PathRunner.jsx:446](app/paths/PathRunner.jsx:446) | `paths.current`, en último paso: `paths.completed[id]`, `paths.history` |
| [completePath](app/state-paths.jsx:64) | **Sin llamadores** (huérfana) | Igual que advance final |
| [unlockAchievement](app/state-achievements.jsx:111) | Múltiples sitios | `achievements[id]`, dispara `checkCollectorAchievements` |
| [updateStreak](app/state-achievements.jsx:122) | `completePomodoro` + `complete*Session` | `streak.{current,longest,lastActiveDate}` |
| [rolloverIfNeeded](app/state-core.jsx:195) | `loadState` + `ensureDayFresh` | `history`, `cycle`, `plan`, `water.today`, `lastActiveDay` |

### 1.3. Lectores

| Vista | Fuente |
|---|---|
| [WeekView (StatsPanel)](app/stats/StatsPanel.jsx:11) | `state.weeklyStats` |
| [MonthHeatmap](app/stats/StatsPanel.jsx:193) | `state.history.days`, `state.history.months` |
| [YearView](app/stats/YearView.jsx:95) | `state.history.days`, `state.history.years` (sólo `availableYears`) |
| [PathStats](app/stats/PathStats.jsx:63) | `state.paths.history`, `state.paths.completed`, `computePathStreaks` |
| [PathYearView](app/stats/PathYearView.jsx:52) | `state.paths.history` |
| [WeeklyStats](app/stats/WeeklyStats.jsx:3) | `state.weeklyStats` — **código muerto, no se monta** |
| Sidebar | `state.streak.current` (asumido — confirmar) |
| Achievements panel | `state.achievements`, indirectamente todo el tracking |

### 1.4. Diagrama de flujo (ASCII)

```
FOCUS:
  FocusTimer.useEffect (remainingSec===0 && running)
    → completePomodoro()
        ├─ ensureDayFresh() ─────────────┐
        │                                │
        │   getState().lastActiveDay !== today
        │     → rolloverIfNeeded()
        │         ├─ migrateWeeklyStatsToHistory(state)  [solo 1ª vez]
        │         │     ↓
        │         │   history.days/months/years ←─ weeklyStats[7]
        │         │   (archiva 7 días: lastActiveDay..lastActiveDay-6)
        │         │
        │         ├─ archiveDayToHistory(lastActiveDay) ⚠ DOBLE
        │         │     (si _historyMigrated era false → suma 2x en months/years)
        │         │
        │         └─ reset cycle=0, plan={}, water.today=0
        │            (NO resetea weeklyStats[]) ⚠
        │
        ├─ setState({ cycle: cycle+1 })
        ├─ addFocusMinutes(focusMinutes)
        │     ├─ ensureDayFresh() [idem 2ª vez, ya idempotente]
        │     ├─ setState({
        │     │     totalFocusMin += mins,
        │     │     weeklyStats.focusMinutes[getDay()] += mins  ⚠ del slot del día
        │     │   })
        │     └─ unlockAchievement('focus.hours.10/50/100') si umbral
        │
        ├─ unlockAchievement('first.step')
        ├─ checkTimeOfDayAchievements()
        ├─ checkSilentDayAchievement()
        └─ updateStreak()
              streak.current ← (last === yesterday ? +1 : 1)
              streak.longest ← max(longest, current)

WATER:
  HydrateModule.button.onClick / PathRunner.PathHydrateStep
    → addWaterGlass(±1)
        ├─ ensureDayFresh()
        ├─ setState({
        │     water.today += delta,
        │     plan.hidratate = true (si today>0),
        │     weeklyStats.waterGlasses[getDay()] += delta  ⚠ Math.max(0, …)
        │   })
        └─ si delta > 0:
              unlockAchievement('first.sip')
              checkPlanAchievements / checkSilentDayAchievement
              si today >= goal y no estaba en waterGoalDates:
                push y checkHydrateWeekPerfect

BREATHE / MOVE / EXTRA:
  Sesión completada → complete*Session(routineId, durationMin)
    ├─ ensureDayFresh()
    ├─ setState({
    │     plan.X = true,
    │     weeklyStats.X[getDay()] += durationMin,
    │     X_SessionsTotal++ (sólo breathe / move; extra NO)
    │   })
    ├─ unlockAchievement / checkRetreatAchievement / checkSilentDayAchievement
    ├─ exploreMap[id] → unlockAchievement
    ├─ routineCounts[cat]++ (si aplica)  ⚠ extra suma a moveMinutes bucket
    └─ updateStreak()

PATH:
  PathRunner.handleStepExit(reason) → advancePathStep(reason)
    └─ si nextIndex >= path.steps.length:
          setState({
            paths.current = null,
            paths.completed[id].{count++, lastDoneAt: todayISO()},
            paths.history.push(todayISO())
          })
   (No actualiza streak ni weeklyStats — los pasos individuales lo hacen
    via complete*Session si el step ejecuta una sesión real.)

ROLLOVER (medianoche):
  ensureDayFresh()  ⚠ sólo se llama dentro de acciones (add/complete*),
                    no hay listener de visibility/focus
    → si lastActiveDay !== today:
        archiveDayToHistory(lastActiveDay) ← weeklyStats[dow(lastActive)]
        weeklyStats SE QUEDA INTACTO ⚠
        plan reset / water.today=0 / cycle=0
        setTimeout(unlockAchievement('first.return'))
        checkStatsAchievements() (en try/catch)
```

---

## 2. Hallazgos por severidad

### 2.1. CRÍTICOS

---

#### C1 — `weeklyStats` no se resetea en rollover · DOBLE CONTEO en la misma semana

**Archivo:** [app/state-core.jsx:218-225](app/state-core.jsx:218)

**Descripción:** `rolloverIfNeeded` archiva el día anterior y resetea `cycle`, `plan`, `water.today`, pero **NO resetea el array `weeklyStats[]`**. Como los 4 vectores `weeklyStats.{focus,breath,move,water}` están indexados por `getDay()` (0=dom..6=sab), la siguiente vez que el usuario vuelve a hacer actividad en el mismo día de la semana, el slot se **suma encima** del valor anterior.

**Escenario reproducible:**

1. Lunes 11 mayo: usuario hace 1 pomodoro de 25 min → `weeklyStats.focusMinutes[1] = 25`.
2. Martes 12 mayo: usuario abre app. `rolloverIfNeeded` archiva lunes en `history.days[2026-05-11] = {focusMinutes:25}`. `weeklyStats` sigue `[0,25,0,0,0,0,0]`.
3. Martes 12 mayo: hace 30 min focus. `weeklyStats.focusMinutes[2] = 30`. Vista Semana muestra L=25, M=30. **Correcto.**
4. Pasan 7 días. Lunes 18 mayo: `weeklyStats.focusMinutes` sigue `[*,25,30,*,*,*,*]` (los slots no reseteados aún contienen lunes y martes pasados).
5. Usuario hace 30 min focus el lunes 18. `addFocusMinutes(30)` ejecuta `week[1] = 25 + 30 = 55`.
6. **Vista Semana muestra L=55 minutos** cuando sólo hizo 30. **+25 min fantasma.**
7. Martes 19: `rolloverIfNeeded` archiva lunes 18 con `weeklyStats[1]=55` → `history.days[2026-05-18] = {focusMinutes:55}` (inflado) → `history.months[2026-05].focusMinutes += 55` (inflado).

**Caso peor:** si el usuario NO hace nada el lunes 18 pero sí hizo algo el lunes 11, al hacer rollover el martes 19, `weeklyStats[1]` sigue siendo 25. Se archiva como `history.days[2026-05-18] = {focusMinutes:25}` **aunque ese día no hubo actividad**. **Día fantasma.**

**Impacto:**
- Vista Semana: sobreestima el día actual cuando el slot reutilizado tenía valor.
- Heatmap Mes: días fantasma con datos del mismo día de semanas anteriores.
- Heatmap Año: igual, propaga al `monthAggregate` y `yearAggregate` por `archiveDayToHistory`.
- `totalFocusMin`: **NO afectado** (sólo se incrementa en `addFocusMinutes` con el delta real).
- `streak`: NO afectado (usa `lastActiveDate`, no `weeklyStats`).

**Fix propuesto:**

Opción A (limpia, recomendada): tras archivar `lastActiveDay`, resetear todos los slots de `weeklyStats` cuya posición corresponde a días entre `lastActiveDay` (exclusivo) y `today` (inclusivo). Si han pasado ≥7 días, resetear todo el array.

```js
function resetStaleWeeklySlots(weeklyStats, lastActiveDay, today) {
  const last = new Date(lastActiveDay).getTime();
  const now  = new Date(today).getTime();
  const daysGap = Math.round((now - last) / 86400000);
  if (daysGap >= 7) {
    return {
      focusMinutes:  [0,0,0,0,0,0,0],
      breathMinutes: [0,0,0,0,0,0,0],
      moveMinutes:   [0,0,0,0,0,0,0],
      waterGlasses:  [0,0,0,0,0,0,0],
    };
  }
  const next = {
    focusMinutes:  [...weeklyStats.focusMinutes],
    breathMinutes: [...weeklyStats.breathMinutes],
    moveMinutes:   [...weeklyStats.moveMinutes],
    waterGlasses:  [...weeklyStats.waterGlasses],
  };
  for (let i = 1; i <= daysGap; i++) {
    const dow = new Date(last + i * 86400000).getDay();
    next.focusMinutes[dow]  = 0;
    next.breathMinutes[dow] = 0;
    next.moveMinutes[dow]   = 0;
    next.waterGlasses[dow]  = 0;
  }
  return next;
}
```

Aplicar dentro de `rolloverIfNeeded` antes del return final.

Opción B (más drástica): convertir `weeklyStats` a "últimos 7 días por offset" (no por `getDay()`). Requiere refactor mayor del lector `WeekBarRow`.

**Severidad:** CRÍTICA — pérdida de fidelidad activa hoy mismo. Recomendado fix antes de Reddit.

---

#### C2 — Doble archivado de `lastActiveDay` durante migración s43 · inflación histórica

**Archivo:** [app/state-core.jsx:195-208](app/state-core.jsx:195), interacción con [migrateWeeklyStatsToHistory:179-189](app/state-core.jsx:179)

**Descripción:** `rolloverIfNeeded` ejecuta:

```js
let migratedState = migrateWeeklyStatsToHistory(state);  // archiva 7 días: lastActiveDay..-6
let nextHistory = migratedState.history;
if (migratedState.lastActiveDay) {
  nextHistory = archiveDayToHistory(nextHistory, migratedState.lastActiveDay, ...);
  // ⚠ Archiva lastActiveDay POR SEGUNDA VEZ
}
```

`migrateWeeklyStatsToHistory` archiva el `lastActiveDay` (offset=0) **y luego** `rolloverIfNeeded` lo archiva otra vez. Como `archiveDayToHistory` es idempotente sobre `history.days` (overwrite) pero acumulativo sobre `history.months` y `history.years`, el resultado es:

- `history.days[lastActiveDay]` → correcto (overwrite).
- `history.months[lastActiveDayMonth]` → **doble suma del delta del lastActiveDay**.
- `history.years[lastActiveDayYear]` → **doble suma del delta del lastActiveDay**.

**Escenario reproducible:**

Usuario actualizó de v0.24.x (pre-s43) a v0.25.x+ teniendo `weeklyStats.focusMinutes = [0,0,0,0,0,30,0]` y `lastActiveDay = 'Fri May 02 2026'`. Primera carga post-update con un día distinto a "today":

1. `loadState` → `rolloverIfNeeded({...defaultState, ...parsed})` con `_historyMigrated=false`.
2. `migrateWeeklyStatsToHistory`:
   - offset=0 → archiva `Fri May 02` con weeklyStats[5]=30. `history.days['2026-05-02']={focus:30}`, `months['2026-05'].focus = 0+30 = 30`, `years['2026'].focus = 0+30 = 30`.
   - offset=1..6 → otros días con weeklyStats[4..0]=0 → no archiva (hasData=false).
3. `rolloverIfNeeded` continúa: `archiveDayToHistory(nextHistory, 'Fri May 02 2026', weeklyStats)`:
   - `history.days['2026-05-02']={focus:30}` (overwrite, OK).
   - `months['2026-05'].focus = 30+30 = 60` ⚠
   - `years['2026'].focus = 30+30 = 60` ⚠
4. Resultado: `days['2026-05-02']` dice 30 min. `months['2026-05']` dice 60 min. **Incoherencia visible: la suma de los días del mes NO coincide con el total del mes.**

**Impacto:**
- Vista Mes: `totalFocus` (calculado desde `history.months[monthKey]`) infla el total respecto a la suma de celdas.
- Vista Año: `computeYearStats` itera `yearData` (que viene de `history.days`) y suma `cell.score` — esa suma SÍ es coherente con las celdas. Pero `state.history.years` (no usado en YearView para totales, sólo para `availableYears`) está corrupto.
- Sólo afecta a usuarios que actualizaron pre→post s43 con weeklyStats poblado. **Estado ya corrupto, no se puede deshacer sin migración compensatoria.**

**Fix propuesto:**

```js
function rolloverIfNeeded(state) {
  const today = new Date().toDateString();
  if (state.lastActiveDay === today) return state;

  const migratedState = migrateWeeklyStatsToHistory(state);

  let nextHistory = migratedState.history || { days: {}, months: {}, years: {} };
  // Sólo archivar si NO acaba de migrar (la migración ya cubre lastActiveDay)
  if (migratedState.lastActiveDay && state._historyMigrated /* ya migrado, este es rollover normal */) {
    nextHistory = archiveDayToHistory(nextHistory, migratedState.lastActiveDay, migratedState.weeklyStats);
  }
  ...
}
```

Y para corregir los datos ya corruptos, una migración compensatoria de una sola vez: recomputar `history.months` y `history.years` sumando `history.days` desde cero. Esto es **idempotente y seguro**:

```js
function recomputeAggregatesFromDays(history) {
  const months = {};
  const years  = {};
  for (const [iso, d] of Object.entries(history.days || {})) {
    const mk = iso.slice(0, 7);
    const yk = iso.slice(0, 4);
    months[mk] = months[mk] || zeroEntry();
    years[yk]  = years[yk]  || zeroEntry();
    months[mk].focusMinutes  += d.focusMinutes  || 0;
    months[mk].breathMinutes += d.breathMinutes || 0;
    months[mk].moveMinutes   += d.moveMinutes   || 0;
    months[mk].waterGlasses  += d.waterGlasses  || 0;
    years[yk].focusMinutes   += d.focusMinutes  || 0;
    years[yk].breathMinutes  += d.breathMinutes || 0;
    years[yk].moveMinutes    += d.moveMinutes   || 0;
    years[yk].waterGlasses   += d.waterGlasses  || 0;
  }
  return { ...history, months, years };
}
```

Aplicar tras un nuevo guard `_aggregatesRecomputed = false → true`.

**Severidad:** CRÍTICA-histórica. El daño ya está hecho pero la migración compensatoria es trivial y sin riesgo.

---

#### C3 — `archiveDayToHistory` no es idempotente sobre `months`/`years`

**Archivo:** [app/state-core.jsx:159-175](app/state-core.jsx:159)

**Descripción:** `history.days[isoDate] = delta` es overwrite (idempotente). `updateMonthAggregate` y `updateYearAggregate` **suman** el delta. Si por cualquier ruta se llama dos veces para la misma fecha (C2 es un caso real), los meses y años se inflan.

**Fix propuesto:** dos opciones complementarias.

(a) Hacer idempotente: si `history.days[isoDate]` ya existe, **restar** el valor previo antes de sumar el nuevo delta:

```js
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
  const prev = (history.days || {})[isoDate];

  // Si ya existe, calcular diff respecto al previo para mantener idempotencia
  // en months/years
  const adj = prev ? {
    focusMinutes:  delta.focusMinutes  - (prev.focusMinutes  || 0),
    breathMinutes: delta.breathMinutes - (prev.breathMinutes || 0),
    moveMinutes:   delta.moveMinutes   - (prev.moveMinutes   || 0),
    waterGlasses:  delta.waterGlasses  - (prev.waterGlasses  || 0),
  } : delta;

  let h = { ...history, days: { ...history.days, [isoDate]: delta } };
  h = updateMonthAggregate(h, isoDate, adj);
  h = updateYearAggregate(h, isoDate, adj);
  return h;
}
```

(b) Eliminar la causa raíz (C2) — preferible.

**Severidad:** CRÍTICA latente. Sin C2 corregido, también se manifiesta cualquier futura llamada redundante.

---

### 2.2. ALTOS

---

#### A1 — Definición de "día activo" incoherente entre `streak` y `YearView.maxStreak`

**Archivos:** [app/state-achievements.jsx:122-141](app/state-achievements.jsx:122) (streak), [app/stats/YearView.jsx:64-78](app/stats/YearView.jsx:64) (year stats).

**Descripción:**
- `updateStreak()` se llama desde `completePomodoro`, `completeBreathSession`, `completeMoveSession`, `completeExtraSession`. **No se llama desde `addWaterGlass`**. Es decir, hidratarse no cuenta como actividad para el streak.
- `YearView.computeYearStats` cuenta `cell.score > 0`, donde `cell.score` incluye `waterGlasses/8`. Hidratarse SÍ cuenta para el "maxStreak" del año.
- `computeDayScore` también incluye agua.

**Resultado:**
- Usuario que un día sólo hidrata: `streak.current` se queda igual (no se rompe ni se incrementa). Pero `history.days[date]` tiene `waterGlasses>0` → en YearView aparece como día activo, en el footer "Racha máxima" cuenta.
- Si el siguiente día no hace nada, `streak.current` SÍ se rompe al hacer rollover (lastActiveDate>=2 días atrás → la próxima sesión reinicia current=1).

**Impacto en confianza:** el usuario verá "racha máxima 12 días" en YearView, pero `streak.longest` (que probablemente se muestra en sidebar/welcome) dice 8. Discrepancia visible.

**Fix propuesto:** decidir UN criterio canónico:
- Opción A: hidratar cuenta como actividad → llamar `updateStreak()` en `addWaterGlass` cuando `delta > 0`.
- Opción B: hidratar NO cuenta → en `computeDayScore` poner `waterGlasses/8` a 0 si no hay otra actividad (más complejo).

Recomiendo Opción A (más intuitivo y alineado con la filosofía calmada del producto).

**Severidad:** ALTA — discrepancia visible.

---

#### A2 — `streak.current` no se rompe proactivamente · UI miente hasta la siguiente sesión

**Archivo:** [app/state-achievements.jsx:122-141](app/state-achievements.jsx:122)

**Descripción:** `updateStreak` se llama únicamente al COMPLETAR una sesión. Si el usuario tenía `streak.current = 5` el lunes y no abre la app hasta el viernes, la sidebar (asumido — confirmar dónde se muestra) sigue diciendo "5" hasta que el viernes complete algo, momento en que `last !== yesterday → current=1`.

**Impacto:** UX deceptiva. El usuario ve "5 días seguidos" cuando realmente la racha está rota desde el martes.

**Fix propuesto:** en `rolloverIfNeeded`, evaluar la rotura:

```js
function rolloverIfNeeded(state) {
  // ... lógica existente ...
  let nextStreak = state.streak;
  if (state.streak.lastActiveDate) {
    const last = new Date(state.streak.lastActiveDate).getTime();
    const now  = new Date(today).getTime();
    if (Math.round((now - last) / 86400000) >= 2) {
      nextStreak = { ...state.streak, current: 0 };
    }
  }
  return {
    ...migratedState,
    history: nextHistory,
    streak: nextStreak,
    cycle: 0,
    plan: { muevete: false, respira: false, extra: false, hidratate: false },
    water: { ...migratedState.water, today: 0, lastReset: today },
    lastActiveDay: today,
  };
}
```

**Severidad:** ALTA — afecta confianza inmediata del usuario.

---

#### A3 — `checkHydrateWeekPerfect` falla en cambios de DST

**Archivo:** [app/state-hydrate.jsx:12-21](app/state-hydrate.jsx:12)

**Descripción:** Compara `dates[i] - dates[i-1] !== 86400000`. En cambio de DST (España: último domingo de marzo +1h, último domingo de octubre −1h), la diferencia entre dos días consecutivos en `getTime()` puede ser 23h (82800000) o 25h (90000000). El check estricto !== 86400000 falla, y el achievement no se desbloquea aunque sean 7 días seguidos.

**Escenario reproducible:** rellenar `waterGoalDates` con 7 fechas consecutivas que crucen el cambio horario de primavera 2026 (29 de marzo).

**Fix propuesto:** tolerancia razonable:

```js
function checkHydrateWeekPerfect() {
  const dates = (getState().waterGoalDates || [])
    .map(d => new Date(d).getTime())
    .sort((a, b) => a - b);
  if (dates.length < 7) return;
  for (let i = dates.length - 1; i >= dates.length - 6; i--) {
    const diffHours = (dates[i] - dates[i - 1]) / 3600000;
    if (diffHours < 20 || diffHours > 28) return;  // tolerancia DST
  }
  unlockAchievement('hydrate.week.perfect');
}
```

**Severidad:** ALTA — pero sólo afecta 2 días al año.

---

#### A4 — `checkStatsAchievements` no se llama desde `loadState`

**Archivo:** [app/state-core.jsx:232-272](app/state-core.jsx:232) (loadState), [app/state-core.jsx:310-318](app/state-core.jsx:310) (ensureDayFresh).

**Descripción:** `checkStatsAchievements` (que detecta `stats.month.first`, `stats.month.focus`, `stats.year.first`) sólo se ejecuta dentro de `ensureDayFresh` **cuando hay rollover**. Tras el rollover de la carga inicial (que sí ocurre en `loadState` vía `rolloverIfNeeded`), `checkStatsAchievements` NO se llama porque `loadState` no usa `ensureDayFresh`.

**Impacto:** un usuario que cruza el umbral (20 días activos en un mes / 600 min focus en un mes / 12 meses con datos) entre dos sesiones desbloquea el achievement con un día de retraso, cuando vuelve a abrir la app al día siguiente.

**Fix propuesto:** añadir al final de `loadState`, antes del return, en un `setTimeout(0)` (para que state-achievements ya esté cargado):

```js
setTimeout(() => { try { checkStatsAchievements(); } catch (e) {} }, 0);
```

**Severidad:** ALTA — retraso de 24 h en achievements. Cosmético pero frustrante.

---

### 2.3. MEDIOS

---

#### M1 — `WeeklyStats.jsx` es código muerto

**Archivo:** [app/stats/WeeklyStats.jsx](app/stats/WeeklyStats.jsx)

**Descripción:** `WeeklyStats` se exporta a `window` pero no se monta desde `main.jsx`. Su funcionalidad está duplicada en [WeekView dentro de StatsPanel.jsx](app/stats/StatsPanel.jsx:11). Sigue listado en STATE.md como "archivo vivo" pero no es alcanzable desde la UI.

**Fix propuesto:** eliminar el archivo y la referencia en STATE.md. Cargarlo desde `PACE.html` lo añade al bundle sin propósito.

**Severidad:** MEDIA (deuda técnica, no impacto en datos).

---

#### M2 — Migración s54 reconstruye `paths.history` perdiendo fechas reales

**Archivo:** [app/state-core.jsx:249-258](app/state-core.jsx:249)

**Descripción:** Si `parsed.paths.history` está ausente, se reconstruye desde `paths.completed[id]`, donde sólo se conoce `lastDoneAt`. Todas las completions previas se atribuyen a esa fecha:

```js
if (e && e.lastDoneAt && e.count) {
  for (let i = 0; i < e.count; i++) hist.push(e.lastDoneAt);
}
```

Resultado: usuario que completó "dawn" 5 veces en días distintos → `paths.history = [lastDoneAt, lastDoneAt, lastDoneAt, lastDoneAt, lastDoneAt]`. **PathYearView muestra esos 5 completions todos el mismo día.** `computePathStreaks` ve un sólo día activo → `bestStreak = 1`.

**Impacto:** sólo afecta a usuarios que actualizaron a v0.27.1+ desde versiones anteriores. Daño ya hecho. No es recuperable.

**Fix propuesto:** documentar como conocido. No ejecutar la migración de nuevo. Mantener guard `!parsed.paths.history`.

**Severidad:** MEDIA — irrecuperable pero limitado a usuarios legacy.

---

#### M3 — `computeYearStats.totalActions` redondea score fraccional

**Archivo:** [app/stats/YearView.jsx:64-78](app/stats/YearView.jsx:64)

**Descripción:** El "total actions" mostrado en el footer del año es `sum(Math.round(cell.score))` donde `cell.score` puede ser fraccional (waterGlasses/8 da 0.125, 0.25, etc.). El label dice "X acciones" pero realmente es "suma de puntuación redondeada por día".

**Impacto:** confuso si un usuario hace cálculos manuales. Por ejemplo, 3 pomodoros + 2 sesiones de breathe + 8 vasos en un día → score = 3 + 1 + 0 + 1 = 5 → 5 "acciones". Pero realmente fueron 3 + 2 + 8 = 13 acciones contables.

**Fix propuesto:** o renombrar la métrica ("nivel acumulado") o cambiar a un conteo real:

```js
function computeYearStats(yearData) {
  let actions = 0, activeDays = 0, maxStreak = 0, curStreak = 0;
  for (const cell of yearData) {
    if (cell.isFuture) break;
    if (cell.entry) {
      actions += (cell.entry.focusMinutes  ? Math.round(cell.entry.focusMinutes/25) : 0)
              + (cell.entry.breathMinutes > 0 ? 1 : 0)
              + (cell.entry.moveMinutes   > 0 ? 1 : 0)
              + (cell.entry.waterGlasses  || 0);
      activeDays++;
      curStreak++;
      if (curStreak > maxStreak) maxStreak = curStreak;
    } else if (!cell.isPreUse) {
      curStreak = 0;
    }
  }
  return { totalActions: actions, activeDays, maxStreak };
}
```

**Severidad:** MEDIA — métrica engañosa.

---

#### M4 — `loadState` shallow merge no rellena objetos anidados parciales

**Archivo:** [app/state-core.jsx:259](app/state-core.jsx:259)

**Descripción:** `{ ...defaultState, ...parsed }` es shallow. Si `parsed.streak = { current: 5 }` (sin `lastActiveDate` por algún motivo), el merge sobreescribe el objeto entero y `state.streak.longest` queda `undefined`. `state.streak.lastActiveDate` también. Las llamadas posteriores con `Math.max(s.streak.longest, current)` propagan `NaN`.

**Impacto:** ningún flujo actual genera estado parcial así, pero futuras migraciones pueden hacerlo. Defensa débil.

**Fix propuesto:** deep merge selectivo en `loadState` para objetos críticos:

```js
const merged = {
  ...defaultState,
  ...parsed,
  streak: { ...defaultState.streak, ...(parsed.streak || {}) },
  water: { ...defaultState.water, ...(parsed.water || {}) },
  weeklyStats: { ...defaultState.weeklyStats, ...(parsed.weeklyStats || {}) },
  history: { ...defaultState.history, ...(parsed.history || {}) },
  plan: { ...defaultState.plan, ...(parsed.plan || {}) },
  paths: { ...defaultState.paths, ...(parsed.paths || {}) },
};
```

**Severidad:** MEDIA — defensa preventiva.

---

#### M5 — `lastActiveDay`, `streak.lastActiveDate`, `paths.history` usan formatos distintos

**Descripción:**
- `lastActiveDay` y `streak.lastActiveDate` → `toDateString()` ("Mon May 11 2026").
- `paths.history`, `paths.completed[id].lastDoneAt`, `history.days` keys → `todayISO()` ("2026-05-11").

**Impacto:** imposible cruzar `streak.lastActiveDate` con `paths.history` directamente. Cualquier futuro query "¿el día de la última path fue el mismo de la última sesión?" requiere normalización.

**Fix propuesto:** migrar todo a ISO. `toDateString()` también es local; ISO es local también si se construye con `toISODate(dateString)`. Convergencia.

**Severidad:** MEDIA — deuda técnica, no bug activo.

---

#### M6 — `extra` y `move` comparten bucket `weeklyStats.moveMinutes`

**Archivo:** [app/state-achievements.jsx:214-219](app/state-achievements.jsx:214)

**Descripción:** `completeExtraSession` suma a `weeklyStats.moveMinutes[day]` también. Comentario interno lo justifica como decisión histórica ("rutinas de movilidad pasaron de MOVE a EXTRA_ROUTINES; ids estables"). Sin embargo:
- Vista Semana tiene 4 barras: focus, breath, move, water. **No hay barra para "extra"**.
- Si el usuario hace una sesión de Estira (extra), aparece en la barra MOVE.

**Impacto:** semánticamente confuso pero documentado como decisión activa. Solo si en algún momento se quiere separar "movilidad" de "estiramientos" en stats.

**Fix propuesto:** ninguno por ahora — está documentado como decisión. Solo señalar.

**Severidad:** MEDIA — diseño deliberado, anotado.

---

### 2.4. BAJOS

---

#### B1 — `completePath()` exportado pero sin llamadores · doble conteo si se usa

**Archivo:** [app/state-paths.jsx:64-80](app/state-paths.jsx:64)

**Descripción:** `completePath(pathId)` push history + incrementa completed.count. **No se llama desde ningún sitio**: el flujo real va por `advancePathStep` que ya hace lo mismo en el último paso. Si por error futuro alguien llama `completePath` después de `advancePathStep`, doble conteo.

**Fix propuesto:** o eliminar `completePath` o añadir guard "ya completada hoy".

**Severidad:** BAJA — código muerto inocuo hoy.

---

#### B2 — `ensureDayFresh` se invoca dos veces consecutivas en `completePomodoro`

**Archivo:** [app/state-timer.jsx:35-46](app/state-timer.jsx:35)

**Descripción:** `completePomodoro` llama `ensureDayFresh` al inicio. Luego llama `addFocusMinutes`, que también llama `ensureDayFresh`. La segunda invocación es no-op (la primera ya hizo el rollover si era necesario), pero es ruido.

**Fix propuesto:** eliminar la llamada de `addFocusMinutes` confiando en que cualquier escritor superior la haga, o eliminarla de `completePomodoro`. Decisión menor.

**Severidad:** BAJA — sin daño.

---

#### B3 — `morningDates`/`silentDates`/`waterGoalDates` susceptibles a cambio de TZ

**Descripción:** Mismo problema que `streak`. Si el usuario viaja, los strings `toDateString()` reflejan el día local del nuevo TZ. Comparaciones con fechas previas pueden producir resultados inesperados (e.g., un día contado dos veces si el vuelo cruza el meridiano).

**Severidad:** BAJA — escenario raro.

---

#### B4 — `MonthHeatmap.dominantModule` cuenta agua como `glasses*5` minutos

**Archivo:** [app/stats/StatsPanel.jsx:151-161](app/stats/StatsPanel.jsx:151)

**Descripción:** Para decidir el "color dominante" del día, agua se convierte arbitrariamente a 5 min/vaso. Sin justificación documentada. Si un día tiene 1 min focus y 2 vasos (10 "min"), el color dominante es agua. Decisión arbitraria de diseño.

**Severidad:** BAJA — cosmética.

---

#### B5 — `intentions`, `firstSeen`, etc.: defaultState añadidos sin migración explícita

**Descripción:** Campos como `firstSeen`, `supportSeenAt`, `supportCopyVariant`, `reminders` se asumen presentes en código posterior. El shallow merge `{ ...defaultState, ...parsed }` rellena los faltantes en el primer nivel, así que están seguros. **No bug, sólo confirmación.**

---

## 3. Scripts de reproducción en DevTools

Pegar en la consola del navegador (con la app abierta). Verifican y/o reproducen los hallazgos.

### 3.1. Verificar C1 (weeklyStats no reset)

```js
// PASO 1 — leer estado actual y crear datos sintéticos para "hace 7 días"
const s = JSON.parse(localStorage.getItem('pace.state.v2'));
console.log('Antes:', { weeklyStats: s.weeklyStats, lastActiveDay: s.lastActiveDay });

// Simular que la última actividad fue el mismo día de la semana, hace 7 días
const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toDateString();
const todayDow = new Date().getDay();
const fakeWeekly = { focusMinutes:[0,0,0,0,0,0,0], breathMinutes:[0,0,0,0,0,0,0],
                     moveMinutes:[0,0,0,0,0,0,0], waterGlasses:[0,0,0,0,0,0,0] };
fakeWeekly.focusMinutes[todayDow] = 60;  // 60 min hace 7 días, slot dow

const corrupted = { ...s, lastActiveDay: sevenDaysAgo, weeklyStats: fakeWeekly };
localStorage.setItem('pace.state.v2', JSON.stringify(corrupted));
location.reload();
// Tras reload: completar 1 pomodoro de 25 min hoy. Ver vista Semana:
//   bug → la barra de hoy mostrará 60+25=85
//   correcto tras fix → 25
```

### 3.2. Verificar C2 (doble archivado migración)

```js
// Forzar el escenario de migración inicial post-s43
const s = JSON.parse(localStorage.getItem('pace.state.v2'));
const yesterday = new Date(Date.now() - 86400000);
const dowYesterday = yesterday.getDay();
const fakeWeekly = { focusMinutes:[0,0,0,0,0,0,0], breathMinutes:[0,0,0,0,0,0,0],
                     moveMinutes:[0,0,0,0,0,0,0], waterGlasses:[0,0,0,0,0,0,0] };
fakeWeekly.focusMinutes[dowYesterday] = 30;

const corrupted = {
  ...s,
  _historyMigrated: false,   // forzar migración
  lastActiveDay: yesterday.toDateString(),
  weeklyStats: fakeWeekly,
  history: { days: {}, months: {}, years: {} },
};
localStorage.setItem('pace.state.v2', JSON.stringify(corrupted));
location.reload();

// Tras reload, leer:
const s2 = JSON.parse(localStorage.getItem('pace.state.v2'));
const isoYesterday = yesterday.toISOString().slice(0, 10);
const monthKey = isoYesterday.slice(0, 7);
const yearKey  = isoYesterday.slice(0, 4);

console.log('days[yesterday].focus:', s2.history.days[isoYesterday]?.focusMinutes);   // 30 (correcto)
console.log('months[month].focus:',   s2.history.months[monthKey]?.focusMinutes);     // bug: 60, fix: 30
console.log('years[year].focus:',     s2.history.years[yearKey]?.focusMinutes);       // bug: 60, fix: 30
```

### 3.3. Verificar A1 (streak vs hydrate)

```js
// Simular que ayer SOLO hidrataste y hoy no abriste la app aún
const s = JSON.parse(localStorage.getItem('pace.state.v2'));
const yesterday = new Date(Date.now() - 86400000);

s.streak = { current: 5, longest: 10, lastActiveDate: new Date(Date.now() - 2*86400000).toDateString() };
// La last session fue hace 2 días; pero ayer sólo bebió agua
s.history.days[yesterday.toISOString().slice(0,10)] = { focusMinutes:0, breathMinutes:0, moveMinutes:0, waterGlasses:8 };
localStorage.setItem('pace.state.v2', JSON.stringify(s));
location.reload();

// Tras reload, abrir StatsPanel → Año:
//   maxStreak en YearView contará ayer como activo (porque waterGlasses>0)
//   streak.current en sidebar dirá 5 (no se rompe ni se incrementa)
// Conclusión: dos métricas, dos definiciones.
```

### 3.4. Verificar A2 (streak no se rompe proactivamente)

```js
const s = JSON.parse(localStorage.getItem('pace.state.v2'));
const fiveDaysAgo = new Date(Date.now() - 5 * 86400000);
s.streak = { current: 7, longest: 7, lastActiveDate: fiveDaysAgo.toDateString() };
s.lastActiveDay = fiveDaysAgo.toDateString();
localStorage.setItem('pace.state.v2', JSON.stringify(s));
location.reload();

// Tras reload, sin hacer nada: la UI sigue diciendo streak=7
// Sólo se actualizará a 1 cuando se complete una sesión hoy
// Fix esperado: tras reload, streak.current === 0
console.log('streak:', JSON.parse(localStorage.getItem('pace.state.v2')).streak);
```

### 3.5. Verificar C3 (idempotencia archiveDayToHistory)

```js
// Llamar archiveDayToHistory dos veces a mano y comprobar inflación
const s = JSON.parse(localStorage.getItem('pace.state.v2'));
const weekly = { focusMinutes:[0,0,0,0,0,0,0], breathMinutes:[0,0,0,0,0,0,0],
                 moveMinutes:[0,0,0,0,0,0,0], waterGlasses:[0,0,0,0,0,0,0] };
const dow = new Date().getDay();
weekly.focusMinutes[dow] = 20;

let h = { days: {}, months: {}, years: {} };
h = window.archiveDayToHistory(h, new Date().toDateString(), weekly);
h = window.archiveDayToHistory(h, new Date().toDateString(), weekly);  // 2ª llamada

const iso = window.toISODate(new Date().toDateString());
console.log('days:', h.days[iso].focusMinutes);                  // 20 (overwrite OK)
console.log('months:', h.months[iso.slice(0,7)].focusMinutes);   // bug: 40, fix: 20
console.log('years:', h.years[iso.slice(0,4)].focusMinutes);     // bug: 40, fix: 20
```

### 3.6. Verificar M2 (migración paths.history)

```js
// Forzar el camino sin paths.history
const s = JSON.parse(localStorage.getItem('pace.state.v2'));
s.paths = s.paths || { current: null, favorite: null, completed: {}, history: [] };
delete s.paths.history;
s.paths.completed = { 'path.dawn': { count: 5, lastDoneAt: new Date().toISOString().slice(0,10) } };
localStorage.setItem('pace.state.v2', JSON.stringify(s));
location.reload();

const s2 = JSON.parse(localStorage.getItem('pace.state.v2'));
console.log('paths.history:', s2.paths.history);
// Bug confirmado: 5 entradas con la MISMA fecha (lastDoneAt), no las 5 fechas reales
```

### 3.7. Sanity check global

```js
// Verificar coherencia: suma de days en cada mes vs months[mes]
const s = JSON.parse(localStorage.getItem('pace.state.v2'));
const computed = {};
for (const [iso, d] of Object.entries(s.history.days || {})) {
  const mk = iso.slice(0,7);
  computed[mk] = computed[mk] || { focusMinutes:0, breathMinutes:0, moveMinutes:0, waterGlasses:0 };
  computed[mk].focusMinutes  += d.focusMinutes  || 0;
  computed[mk].breathMinutes += d.breathMinutes || 0;
  computed[mk].moveMinutes   += d.moveMinutes   || 0;
  computed[mk].waterGlasses  += d.waterGlasses  || 0;
}
console.table(Object.keys(computed).reduce((r, mk) => {
  r[mk] = {
    'days→focus': computed[mk].focusMinutes,
    'months.focus': (s.history.months[mk] || {}).focusMinutes,
    'days→breath': computed[mk].breathMinutes,
    'months.breath': (s.history.months[mk] || {}).breathMinutes,
  };
  return r;
}, {}));
// Si alguna fila tiene desfase entre días→X y months.X, has tocado C2/C3.
```

---

## 4. Plan de fixes recomendado

### Sprint pre-Reddit (PR único, sesión 69 propuesta)

1. **C1**: añadir reset de slots stale en `rolloverIfNeeded`.
2. **C2**: eliminar el segundo archivado en `rolloverIfNeeded` cuando viene de migración.
3. **C3**: hacer `archiveDayToHistory` idempotente (diff respecto a `days[iso]` previo).
4. **Migración compensatoria**: recomputar `history.months` y `history.years` desde `history.days`, guard `_aggregatesRecomputed_v0_28_8`.
5. **A2**: romper streak en `rolloverIfNeeded` cuando `lastActiveDate >= 2 días atrás`.
6. **A4**: llamar `checkStatsAchievements()` en `setTimeout(0)` desde `loadState`.

**Tests manuales tras el PR:**

- [ ] Completar 1 pomodoro hoy. Vista Semana: barra del día actual = 25 min.
- [ ] Cambiar `lastActiveDay` a hace 7 días con weeklyStats[dowToday]=60 (script 3.1). Reload + 1 pomodoro. Barra hoy = 25, no 85.
- [ ] Cambiar `_historyMigrated=false`, weeklyStats con 30 min ayer (script 3.2). Reload. `months[mes].focus === 30`, no 60.
- [ ] Streak=7, lastActiveDate hace 5 días (script 3.4). Reload. **streak.current === 0**.
- [ ] Forzar 20 días en `history.days` del mes actual + reload. Toast `stats.month.first` aparece en la primera carga.
- [ ] Heatmap mes: la suma manual de celdas debe coincidir con el footer "Total focus".

### Sprint post-Reddit (sin urgencia)

- A1: alinear definición de "día activo" (streak desde water).
- A3: tolerancia DST en `checkHydrateWeekPerfect`.
- M1: eliminar `WeeklyStats.jsx`.
- M3: renombrar/corregir `totalActions` en YearView.
- M4: deep merge en `loadState`.
- M5: unificar formato de fecha (todo a ISO).
- M6: separar bucket `extra` de `move` en weeklyStats (si se decide).
- B1/B2: limpieza.

---

## 5. Apéndice — coherencia path heatmap vs path table

- `PathStats.total` (footer card) = `state.paths.history.length` → cuenta total cruda (con duplicados del mismo día).
- `PathTable.byPath[id].count` = `state.paths.completed[id].count` → coherente con `history.push` en `advancePathStep`.
- `PathYearView.yearTotal` = suma de celdas = suma de `dayMap[iso]` (que viene de `history`) → coherente con `PathStats.total`.

**No hay divergencia detectada entre las tres lecturas de paths.** OK.

---

## 6. Apéndice — observaciones sin impacto

- `PathRunner.handleStepExit` llama `advancePathStep` (que en el último paso completa y pushea history). **No llama también `completePath`**, por lo que no hay doble conteo.
- `setState` es síncrono y secuencial en el modelo actual. Las lecturas `getState()` tras un `setState` ven el valor actualizado. OK.
- `unlockAchievement` es idempotente: chequea `s.achievements[id]` y retorna `false` si ya existe.
- `persistState` es try/catch silencioso: si localStorage está bloqueado (modo privado), la app sigue funcionando pero **el usuario pierde datos al recargar sin saberlo**. Recomendación de UX (no en alcance): mostrar toast no intrusivo si `localStorage.setItem` falla.

---

**Fin del informe.**
