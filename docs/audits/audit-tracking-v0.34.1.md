# Auditoría de tracking — PACE v0.34.1

> Sesión 86 — 2026-06-05 — **F2 del bloque Contenido+Premium**.
> Auditoría read-only de punta a punta. Sin modificación de código (salvo
> que se apruebe el micro-fix F-1 listado más abajo).
> Construye sobre [`audit-tracking-v0.28.7.md`](./audit-tracking-v0.28.7.md)
> (s68) y [`regression-tests-v0.28.8.md`](./regression-tests-v0.28.8.md) (s69).

---

## 0. Resumen ejecutivo

**Veredicto: el sistema de tracking está sano.** Los seis arreglos de la
sesión 69 (C1, C2, C3, A1, A2 + guards de migración) **siguen intactos** en
v0.34.1 y los ~16 refactors posteriores (split de PathRunner s80, main s82,
achievements s83, i18n s81, glifos s84) **no han tocado el núcleo de
tracking** ni roto sus invariantes. Los detectores de logros que dependen de
tracking son **todos correctos** (umbral por umbral contra el catálogo).

Se ha encontrado **un (1) bug de severidad media** de alcance estrecho,
introducido al crear el Pomodoro contextual de Caminos (s79), más cuatro
ítems cosméticos/heredados ya conocidos. No hay pérdida de datos, ni doble
conteo, ni días fantasma, ni inflación de agregados.

| ID | Severidad | Estado | Una línea |
|---|---|---|---|
| **F-1** | **Media** | **nuevo (s79)** | `PathFocusStep` acredita minutos de foco pero no llama `updateStreak`: un día de solo-foco-en-Camino sale activo en el heatmap pero no suma a la racha del sidebar |
| F-2 | Baja | heredado (A3, s68) | `checkHydrateWeekPerfect` usa `!== 86400000` estricto → falla en los 2 cambios de hora/año |
| F-3 | Cosmética | heredado (M1, s68) | `WeeklyStats.jsx` es código muerto: no está en `PACE.html`, no se bundlea |
| F-4 | Baja | semántica heredada (M5) | Caminos sellan fecha en UTC (`todayISO`) mientras el resto usa fecha local |
| F-5 | Cosmética | heredado (M3/B4) | `totalActions` y `dominantModule` mezclan agua con "acciones"/minutos |

**Recomendación:** sesión esencialmente **docs-only**. El único candidato a
micro-fix es **F-1** (1 línea, segura por idempotencia de `updateStreak`),
pero requiere una decisión de producto (¿el foco dentro de un Camino debe
contar para la racha diaria, igual que el Pomodoro de la home?). A la espera
de aprobación del usuario.

---

## 1. Alcance y metodología

Read-only sobre el código real de v0.34.1. Archivos leídos íntegros:
`state-core.jsx`, `state-timer.jsx`, `state-hydrate.jsx`,
`state-achievements.jsx`, `state-paths.jsx`, `state.jsx`,
`stats/StatsPanel.jsx`, `stats/YearView.jsx`, `stats/PathYearView.jsx`,
`stats/PathStats.jsx`, `stats/WeeklyStats.jsx`, `shell/Sidebar.jsx`
(WeekDots + hitos), los 4 `paths/steps/*`, `paths/registry.js`,
`achievements/catalog.js`, `move/MoveModule.jsx`, `extra/ExtraModule.jsx`,
`breathe/BreatheSession.jsx` (punto de crédito), `build-standalone.js` y el
orden de carga en `PACE.html`.

**Método de build verificado:** `build-standalone.js` inyecta cada archivo
como un `<script type="text/babel">` **separado** (no concatena en uno solo).
Los `const`/`function` de nivel superior comparten el **scope léxico global**
entre scripts — por eso existe la regla #3 de `CLAUDE.md` (nombres únicos) y
por eso un `const` duplicado entre archivos sería un `SyntaxError` fatal,
mientras que un `function` duplicado deja ganar al que cargue **último**.
Esto importa para F-3 (ver abajo).

---

## 2. Invariantes de s69 — VERIFICADOS

Todos los invariantes que F2 debía proteger siguen en pie:

### 2.1. Indexado lunes-primero (`getDayIndexMondayFirst` / `getMondayOf`)

- **Definición:** [state-core.jsx:130](app/state-core.jsx:130) — `0=lunes … 6=domingo`.
- **`defaultState.weeklyStats`** documenta la convención lunes-primero ([state-core.jsx:47-54](app/state-core.jsx:47)).
- **Escritores** (todos lunes-primero):
  `addFocusMinutes` [state-timer.jsx:19](app/state-timer.jsx:19),
  `addWaterGlass` [state-hydrate.jsx:27](app/state-hydrate.jsx:27),
  `completeBreathSession` [state-achievements.jsx:166](app/state-achievements.jsx:166),
  `completeMoveSession` [state-achievements.jsx:208](app/state-achievements.jsx:208),
  `completeExtraSession` [state-achievements.jsx:229](app/state-achievements.jsx:229),
  `checkFocusDayAchievement` [state-timer.jsx:11](app/state-timer.jsx:11),
  `checkRetreatAchievement` [state-achievements.jsx:121](app/state-achievements.jsx:121).
- **Lectores** (todos lunes-primero, sin doble-reorder):
  `WeekBarRow` [StatsPanel.jsx:97](app/stats/StatsPanel.jsx:97) (`today = (getDay()+6)%7`, comentario que confirma que se eliminó el rotado viejo),
  `WeekDots` [Sidebar.jsx:342](app/shell/Sidebar.jsx:342),
  hitos del arco [Sidebar.jsx:236-240](app/shell/Sidebar.jsx:236),
  `dowMonday` del heatmap mensual [StatsPanel.jsx:192](app/stats/StatsPanel.jsx:192),
  `YearView` [YearView.jsx:57](app/stats/YearView.jsx:57) y `PathYearView` [PathYearView.jsx:37](app/stats/PathYearView.jsx:37) (`(getDay()+6)%7`).
- **`archiveDayToHistory`** indexa con `getDayIndexMondayFirst(dateStr)` ([state-core.jsx:200](app/state-core.jsx:200)). ✔ coherente con los escritores.

### 2.2. Idempotencia del history (C3)

[archiveDayToHistory:199-219](app/state-core.jsx:199): `days[iso]` es
**overwrite** (no acumula) y `months`/`years` se **recalculan desde `days`**
vía `recomputeMonthFromDays` / `recomputeYearFromDays`
([state-core.jsx:150-177](app/state-core.jsx:150)). Llamar N veces para la
misma fecha da el mismo resultado. ✔ (cubierto por Test 5).

### 2.3. Reset semanal de `weeklyStats` (C1)

[rolloverIfNeeded:273-287](app/state-core.jsx:273): al cruzar a una semana
lunes-domingo distinta (`getMondayOf(today) !== getMondayOf(lastActiveDay)`)
se resetea **todo** el array a cero. El archivado del día previo
([state-core.jsx:267-271](app/state-core.jsx:267)) ocurre **antes** del reset
y lee `migratedState.weeklyStats` (valores originales), así que el último día
de la semana anterior se guarda íntegro en `history.days` antes de limpiar.
No hay slot reutilizado entre semanas → sin doble-conteo ni día fantasma. ✔
(cubierto por Test 1).

### 2.4. Guard anti-doble-archivado en migración s43 (C2)

[rolloverIfNeeded:262-271](app/state-core.jsx:262): `wasAlreadyMigrated`
captura `_historyMigrated` **al entrar**; solo se archiva `lastActiveDay`
aparte si la migración NO acaba de ejecutarse (que ya lo cubre). ✔

### 2.5. Migración compensatoria de agregados (C2/C3 histórico)

[loadState:373-376](app/state-core.jsx:373): guard
`_historyRecalculated_v0_28_8` → `recomputeAllHistoryAggregates` recalcula
`months`/`years` desde `days`. Idempotente. Repara cualquier inflación
previa. ✔ (cubierto por Test 2).

### 2.6. Rotura proactiva de racha (A2)

[rolloverIfNeeded:289-301](app/state-core.jsx:289): si
`lastActiveDate < ayer` (comparando a medianoche con `setHours(0,0,0,0)` —
DST-safe), `streak.current = 0` de inmediato al cargar, sin esperar a la
siguiente sesión. `longest` se preserva. ✔ (cubierto por Test 4).

### 2.7. Agua sola NO cuenta como día activo (A1)

- `updateStreak` **no** se llama desde `addWaterGlass`
  ([state-hydrate.jsx:36-48](app/state-hydrate.jsx:36) solo dispara
  `first.sip` / plan / week-perfect). ✔
- `YearView.isActiveDay` = `focus|breath|move > 0`, agua excluida
  ([YearView.jsx:66-71](app/stats/YearView.jsx:66)); `computeYearStats`
  usa `isActiveDay` para `activeDays` y `maxStreak`
  ([YearView.jsx:74-91](app/stats/YearView.jsx:74)). ✔ (cubierto por Test 3).

### 2.8. Guards de migración e instalación limpia

`_historyMigrated`, `_weeklyStatsReindexed_v0_28_8`,
`_historyRecalculated_v0_28_8` presentes ([state-core.jsx:96-98](app/state-core.jsx:96)).
La instalación nueva los marca `true` ([state-core.jsx:336-337](app/state-core.jsx:336))
para no re-migrar un estado ya en formato nuevo. ✔

### 2.9. Detectores de logros (umbral por umbral vs `catalog.js`)

| Logro | Detector (file:línea) | Umbral código | Catálogo | OK |
|---|---|---|---|---|
| `master.focus.day` | [state-timer.jsx:13](app/state-timer.jsx:13) | `weeklyStats.focus[day] ≥ 240` | "4h de foco en un día" | ✔ |
| `master.retreat` | [state-achievements.jsx:124](app/state-achievements.jsx:124) | `breath[day]+move[day] ≥ 120` | "2h respira + mueve" | ✔ |
| `focus.hours.10/50/100` | [state-timer.jsx:29-31](app/state-timer.jsx:29) | `totalFocusMin/60 ≥ 10/50/100` | horas acumuladas | ✔ |
| `master.pomodoro.8` | [state-timer.jsx:41](app/state-timer.jsx:41) | `cycle ≥ 8` (resetea al día) | "8 Pomodoros en un día" | ✔ |
| `master.long.focus` | [state-timer.jsx:42](app/state-timer.jsx:42) | `focusMins ≥ 45` | "45 min sin pausa" | ✔ |
| `breathe.sessions.10/50` | [state-achievements.jsx:175-176](app/state-achievements.jsx:175) | `breatheSessionsTotal ≥ 10/50` | sesiones acumuladas | ✔ |
| `move.sessions.25` | [state-achievements.jsx:217](app/state-achievements.jsx:217) | `moveSessionsTotal ≥ 25` | sesiones acumuladas | ✔ |
| `streak.3…365` + `stats.streak.30` | [state-achievements.jsx:149-156](app/state-achievements.jsx:149) | `current ≥ N` | días seguidos | ✔ |
| `master.box/coherent/rounds.10`, `atg.20` | [state-achievements.jsx:64-70](app/state-achievements.jsx:64) | `routineCounts[cat] ≥ N` | sesiones por tipo | ✔ |
| `stats.month.first` | [state-achievements.jsx:84](app/state-achievements.jsx:84) | `≥ 20` días en un mes | "Veinte días" | ✔ |
| `stats.month.focus` | [state-achievements.jsx:88](app/state-achievements.jsx:88) | `months.focus ≥ 600` | "Diez horas" | ✔ |
| `stats.year.first` | [state-achievements.jsx:97](app/state-achievements.jsx:97) | `≥ 12` meses | "Doce meses" | ✔ |
| `master.path.all7` | [state-achievements.jsx:106-116](app/state-achievements.jsx:106) | `count ≥ 1` en los 7 | "los siete caminos" | ✔ |
| `morning.5` / `master.dawn` / `master.dusk` / `master.silent.day` | [state-achievements.jsx:27-61](app/state-achievements.jsx:27) | hora / silencio | catálogo | ✔ |
| `master.collector.half/full` | [state-achievements.jsx:45-49](app/state-achievements.jsx:45) | `≥ 50/100` logros | colección | ✔ |

**Consistencia `IMPLEMENTED_ACHIEVEMENTS` ↔ triggers:** se cruzaron los 69
ids del Set ([catalog.js:165-207](app/achievements/catalog.js:165)) contra
todos los `unlockAchievement(...)` del código (incluidos los `exploreMap`
dinámicos de `completeBreathSession`/`completeExtraSession`). **Cada id
"implementado" tiene un trigger real y cada trigger apunta a un id del Set.**
No hay logros "fantasma" (pintados como ganables sin detector) ni detectores
huérfanos. Los 37 restantes del catálogo de 106 (p.ej. `master.marathon`,
`master.gardener`, seasonales) se pintan como "Pronto"/secretos — intencional.

### 2.10. Sin doble-conteo en Caminos

Un Camino acredita cada paso una sola vez: `breathe`→`completeBreathSession`,
`body`→`completeMove/ExtraSession` (vía `MoveSession.dispatchComplete`
[MoveModule.jsx:90-93](app/move/MoveModule.jsx:90)), `focus`→`addFocusMinutes`
(con `creditedRef` que blinda contra recrédito [PathFocusStep.jsx:19,29-31](app/paths/steps/PathFocusStep.jsx:29)),
`hydrate`→`addWaterGlass`. `advancePathStep` solo toca `paths.completed`/
`paths.history` ([state-paths.jsx:51-65](app/state-paths.jsx:51)); **no**
duplica weeklyStats. `completePath` sigue huérfana (sin llamadores) pero
inocua. ✔

---

## 3. Hallazgos

### F-1 · MEDIA · `PathFocusStep` acredita foco pero no actualiza la racha — NUEVO (s79)

**Archivos:** [paths/steps/PathFocusStep.jsx:29-31](app/paths/steps/PathFocusStep.jsx:29),
contraste con [state-timer.jsx:35-46](app/state-timer.jsx:35).

**Descripción.** El Pomodoro contextual de un Camino acredita los minutos con
`addFocusMinutes(step.min)` cuando el contador llega a 0. `addFocusMinutes`
([state-timer.jsx:16-33](app/state-timer.jsx:16)) suma a
`weeklyStats.focusMinutes[day]` + `totalFocusMin` y comprueba `focus.hours.*`
y `master.focus.day`, **pero no llama `updateStreak`**. En la home, en cambio,
`completePomodoro` llama `updateStreak()` por separado tras `addFocusMinutes`
([state-timer.jsx:45](app/state-timer.jsx:45)).

Consecuencia: los minutos de foco de un Camino **sí** marcan el día como
activo para el heatmap anual (`isActiveDay` mira `focusMinutes>0`) y suman a
`YearView.maxStreak`, pero **no** avanzan `streak.current` del sidebar ni
disparan `first.day`/`streak.*`.

**Escenario reproducible.**
1. Día sin otra actividad. Usuario abre `path.tea` = `[breathe, hydrate, focus]`.
2. Salta el paso `breathe` (botón Saltar → `onExit('skip')`, no acredita).
3. Salta `hydrate`.
4. Completa el `focus` de 10 min → `addFocusMinutes(10)`.
5. Resultado: `weeklyStats.focus[day]=10` → mañana se archiva → **YearView
   muestra el día activo y cuenta para `maxStreak`**. Pero `streak.current`
   **no** se incrementó → el sidebar no refleja la actividad y no se
   desbloquea `first.day`/`streak.N` por ese día.

**Por qué importa.** Reintroduce la clase de discrepancia A1 (heatmap vs
racha) que s69 había alineado, ahora por la vía del foco-en-Camino. Es además
una asimetría conceptual: *el mismo trabajo de foco cuenta para la racha si se
hace desde la home, pero no desde un Camino.* En el flujo de Camino completo
la racha **sí** se actualiza (vía el paso breathe/body, que sí llaman
`updateStreak`), así que el fallo solo aflora si el usuario salta esos pasos.

**Micro-fix propuesto (pendiente de aprobación).** Tras el crédito en
`PathFocusStep`, llamar `updateStreak()`:

```js
if (!creditedRef.current && typeof addFocusMinutes === 'function') {
  try {
    addFocusMinutes(step.min || 25);
    if (typeof updateStreak === 'function') updateStreak();   // ← F-1
    creditedRef.current = true;
  } catch (e) {}
}
```

Es **seguro**: `updateStreak` es idempotente por día (`if (last === today)
return;` [state-achievements.jsx:142](app/state-achievements.jsx:142)), así
que llamarlo además del paso breathe/body de un Camino no doble-cuenta.

**Decisión de producto requerida.** ¿El foco dentro de un Camino debe contar
para la racha diaria? (Recomendación del auditor: **sí**, por coherencia con
la home y con el heatmap.) La decisión s79 hizo el paso minimalista a
propósito (sin badge, sin presets, "Reset no acredita"), pero esa decisión
hablaba de *no acreditar Pomodoro/foco extra*, no de la racha diaria; esto
parece un descuido, no un diseño.

---

### F-2 · BAJA · `checkHydrateWeekPerfect` frágil ante cambios de hora (DST) — heredado A3

**Archivo:** [state-hydrate.jsx:12-21](app/state-hydrate.jsx:12).

`if (dates[i] - dates[i - 1] !== 86400000) return;` exige exactamente 24h
entre días consecutivos. En los 2 cambios de hora al año (España: último
domingo de marzo +1h, último de octubre −1h) dos medianoches locales
consecutivas distan 23h/25h → el check falla y `hydrate.week.perfect` no se
desbloquea aunque sean 7 días seguidos al objetivo. Ya señalado en s68 (A3),
nunca arreglado.

**Fix (si se aborda):** banda de tolerancia, como ya hace `computePathStreaks`
con `Math.round` ([state-paths.jsx:167](app/state-paths.jsx:167)):

```js
const diffH = (dates[i] - dates[i - 1]) / 3600000;
if (diffH < 20 || diffH > 28) return;
```

Impacto real: 2 días/año. No urgente.

> Nota relacionada: `updateStreak` calcula "ayer" con
> `Date.now() - 86400000` ([state-achievements.jsx:143](app/state-achievements.jsx:143)),
> también frágil en DST. Pero la rotura de racha del rollover (A2) usa
> aritmética de día-calendario (`setHours(0,0,0,0)`), DST-safe, así que el
> comportamiento neto de la racha es robusto salvo el incremento exacto en el
> día del cambio de hora. Misma clase que F-2; no urgente.

---

### F-3 · COSMÉTICA · `WeeklyStats.jsx` es código muerto — heredado M1

**Archivo:** [stats/WeeklyStats.jsx](app/stats/WeeklyStats.jsx).

No aparece en los `<script src>` de `PACE.html` (verificado: el bloque de
stats solo carga `YearView` → `PathYearView` → `PathStats` → `StatsPanel`,
líneas 177-180) → **no se bundlea** y **no se monta**. Su funcionalidad vive
en `WeekView`/`WeekBarRow` dentro de `StatsPanel.jsx`. Como `StatsPanel` carga
**último**, su `WeekBarRow` (height 36, compactado s61-63) es la global
efectiva; no hay colisión con la `WeekBarRow` duplicada del archivo muerto
porque este nunca carga. Es peso muerto en el repo, sin riesgo.

**Cleanup (opcional):** borrar el archivo. No está en la tabla de "archivos
vivos" del `STATE.md` actual, así que no requiere edición de docs.

---

### F-4 · BAJA (semántica) · Caminos sellan fecha en UTC; el resto en local — heredado M5

`paths.history` y `paths.completed[].lastDoneAt` se sellan con `todayISO()` =
`new Date().toISOString().slice(0,10)` = fecha **UTC**
([state-core.jsx:113-115](app/state-core.jsx:113), usado en
[state-paths.jsx:62-63](app/state-paths.jsx:62)). El resto del tracking
(`lastActiveDay`, `streak.lastActiveDate`, claves de `history.days` vía
`toISODate`) usa fecha **local**. Para un usuario en España (UTC+1/+2), un
Camino completado entre las 00:00 y las 02:00 locales se archiva con la fecha
del **día anterior**.

Internamente el subsistema de Caminos es coherente (tanto `PathYearView` como
`computePathStreaks` operan en UTC), así que las rachas de Caminos no se
corrompen; pero diverge del heatmap general y puede malatribuir por un día un
Camino de madrugada. Pre-existente, bajo impacto. Anotar para una futura
unificación de formato de fecha (todo a local o todo a ISO-local).

---

### F-5 · COSMÉTICA · Métricas que mezclan agua — heredado M3/B4

- `computeYearStats.totalActions` suma `Math.round(cell.score)` y `score`
  incluye fracción de agua ([YearView.jsx:14,80](app/stats/YearView.jsx:80)).
  La etiqueta dice "acciones" pero es "nivel acumulado". Un día de solo agua
  aporta 1 a `totalActions` pero 0 a `activeDays`/`maxStreak` (correcto para
  la racha, confuso para el rótulo).
- `dominantModule` convierte agua a `glasses*5` "minutos" solo para elegir el
  color dominante de la celda mensual ([StatsPanel.jsx:154](app/stats/StatsPanel.jsx:154)).

Ambos son decisiones de presentación heredadas, sin impacto en datos.

---

## 4. Tabla de casos de prueba (entrada → estado esperado)

Pegables en DevTools con la app abierta (clave `pace.state.v2`). Los tests
1-5 son los de [`regression-tests-v0.28.8.md`](./regression-tests-v0.28.8.md)
y deben **seguir pasando** en v0.34.1 (re-confirman los invariantes §2).
Los tests 6-9 cubren lo nuevo/heredado de esta auditoría.

| # | Qué verifica | Entrada | Estado esperado |
|---|---|---|---|
| 1 | C1 reset semanal | `lastActiveDay` = lunes pasado, `weeklyStats.focus=[60,0,…]` + reload | Tras rollover, **todos** los slots de `weeklyStats` a 0 |
| 2 | C2/C3 agregados | `history.days` con 3 días + `months/years` inflados al doble + `_historyRecalculated_v0_28_8=false` + reload | `months[mes] === Σ days[*]` (sin inflación) |
| 3 | A1 agua sola | 3 días con **solo** `waterGlasses=8` + reload | YearView "Racha máxima" = **0** (agua no es día activo) |
| 4 | A2 racha proactiva | `streak.current=7`, `lastActiveDate` hace 3 días + reload | `streak.current === 0`, `longest` preservado |
| 5 | C3 idempotencia | `archiveDayToHistory(h, fecha, weekly)` ×3 | `days/months/years` idénticos a ×1 |
| 6 | Lunes-primero E2E | 1 pomodoro de 25 min **hoy** | La barra del día actual (WeekView) y el dot de hoy (WeekDots) marcan el día correcto = `(getDay()+6)%7` |
| 7 | Rollover día (no semana) | Actividad lunes; abrir miércoles (misma semana) sin tocar martes | `history.days[lunes]` archivado; `weeklyStats` **no** reseteado; barra de martes = 0 |
| 8 | Idempotencia recarga | Completar sesiones, recargar 3× sin cruzar medianoche | `weeklyStats`, `totalFocusMin`, `breatheSessionsTotal`, `streak` **sin cambios** entre recargas |
| 9 | **F-1 foco-en-Camino** | Día limpio; abrir `path.tea`, **saltar** breathe + hydrate, completar el `focus` | **Bug actual:** `weeklyStats.focus[day]>0` (día activo en YearView) **pero** `streak.current` sin cambio. **Tras fix F-1:** `streak.current` incrementa y se desbloquea `first.day` |

> **Caso 9 detallado (DevTools):**
> ```js
> // Antes: anota streak.current
> const before = JSON.parse(localStorage.getItem('pace.state.v2')).streak.current;
> // …abre path.tea, salta breathe + hydrate, completa el focus de 10 min…
> const s = JSON.parse(localStorage.getItem('pace.state.v2'));
> const day = (new Date().getDay()+6)%7;
> console.log('focus[day]:', s.weeklyStats.focusMinutes[day]); // > 0
> console.log('streak.current:', s.streak.current, '(antes', before, ')');
> // BUG: focus[day] > 0 pero streak.current === before
> // FIX: streak.current === before + 1 (o 1 si racha estaba rota)
> ```

---

## 5. Recomendación operativa

| Acción | Severidad | Cuándo |
|---|---|---|
| **F-1** — `updateStreak()` en `PathFocusStep` | Media | Esta sesión, **si el usuario aprueba** la decisión de producto |
| F-2 — tolerancia DST en `checkHydrateWeekPerfect` | Baja | Oportunista (2 días/año) |
| F-3 — borrar `WeeklyStats.jsx` | Cosmética | Limpieza oportunista |
| F-4 — unificar formato de fecha de Caminos | Baja | Tarea aparte de "unificación de fechas" |
| F-5 — renombrar/aclarar métricas con agua | Cosmética | Post-lanzamiento |

**Si se aplica F-1:** cierre de sesión completo (build, backup, diario,
CHANGELOG, STATE, bump patch). **Si no:** sesión docs-only — este informe +
nota en `STATE.md`, sin regenerar standalone ni bumpear versión.

La base de tracking queda **de-risqueada** para F3 (gating) y F4-F6
(contenido): el indexado, la idempotencia, la racha y los detectores son
fiables. F-1 es la única deuda de corrección y es de bajo alcance.

---

**Fin del informe.**
