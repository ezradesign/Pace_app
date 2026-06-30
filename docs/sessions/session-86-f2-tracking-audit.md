# Sesión 86 — F2: auditoría de tracking + fix F-1

**Versión:** v0.34.1 → **v0.34.2** (patch)
**Fecha:** 2026-06-05
**Bloque:** Contenido+Premium — **Fase 2** (auditoría de tracking)
**Tipo:** audit (read-only) + 1 micro-fix aprobado + cierre completo

> Informe completo de la auditoría (hallazgos por severidad con referencias
> file:línea + tabla de casos de prueba):
> [`docs/audits/audit-tracking-v0.34.1.md`](../audits/audit-tracking-v0.34.1.md).

---

## Contexto

F2 del bloque planificado en F0 (s84-bis). Objetivo: **de-risquear la base de
tracking** antes de F3 (gating) y F4–F6 (contenido), verificando que los
arreglos de la sesión 69 (C1/C2/C3/A1/A2 + guards de migración) siguen
intactos tras los ~16 refactors posteriores (split de PathRunner s80, main
s82, achievements s83, i18n s81, glifos s84).

Sesión planteada como **principalmente read-only**: solo aplicar micro-fixes
ante un bug claro, con aprobación previa. Se encontró **uno** (F-1), el
usuario dio OK ("lo que tú me recomiendes"), y se aplicó con cierre completo.

---

## Auditoría — veredicto: tracking sano

Alcance: `state-core.jsx`, `state-timer/hydrate/achievements/paths.jsx`, las
vistas (`StatsPanel`, `YearView`, `PathYearView`, `PathStats`,
`WeeklyStats`), `Sidebar` (WeekDots + hitos), los 4 `paths/steps/*`,
`registry.js`, `catalog.js`, los módulos de cuerpo y `BreatheSession`.

Invariantes de s69 **verificados intactos**:

- **Lunes-primero** (`getDayIndexMondayFirst` / `getMondayOf`) coherente en
  todos los escritores y lectores; `defaultState.weeklyStats` documenta la
  convención; sin doble-reorder en las vistas.
- **History idempotente** (C3): `archiveDayToHistory` sobrescribe `days[iso]`
  y recalcula `months`/`years` desde `days`.
- **Reset semanal** (C1) al cruzar lunes; archivado del día previo antes del
  reset (sin pérdida).
- **Guard anti-doble-archivado** de la migración s43 (C2) + migración
  compensatoria de agregados (`_historyRecalculated_v0_28_8`).
- **Rotura proactiva de racha** (A2) con aritmética de día-calendario
  (DST-safe).
- **Agua sola NO cuenta** como día activo (A1): `updateStreak` no se llama
  desde `addWaterGlass`; `YearView.isActiveDay` = focus|breath|move>0.
- **Detectores de logros** correctos umbral por umbral contra `catalog.js`
  (`master.focus.day`=240, `master.retreat`=120, `focus.hours.*`,
  `*.sessions.*`, `streak.*`, `stats.*`, etc.); `IMPLEMENTED_ACHIEVEMENTS`
  sin huecos (cada id tiene trigger y viceversa).

Hallazgos: **1 medio (aplicado) + 4 cosméticos/heredados (documentados)**.

---

## F-1 (medio, nuevo s79) — APLICADO

**`app/paths/steps/PathFocusStep.jsx`.** El Pomodoro contextual de un Camino
acreditaba foco con `addFocusMinutes(step.min)` pero **no** llamaba
`updateStreak`. La home sí lo hace por separado en `completePomodoro`. Efecto:
un día de **solo-foco-en-Camino** (saltando los pasos breathe/body) salía
**activo en el heatmap/YearView** (porque `isActiveDay` mira
`focusMinutes>0`) pero **no sumaba a `streak.current`** del sidebar —
reintroduciendo la clase de discrepancia A1 por la vía del foco.

**Fix:** llamar `updateStreak()` tras el crédito, como la home. Es seguro:
`updateStreak` es idempotente por día (`if (last === today) return;`), así que
no doble-cuenta si el Camino también ejecuta un paso breathe/body (que ya lo
llama vía `complete*Session`).

```js
try {
  addFocusMinutes(step.min || 25);
  creditedRef.current = true;
  if (typeof updateStreak === 'function') updateStreak();
} catch (e) {}
```

---

## Cosméticos/heredados (documentados, NO aplicados)

- **F-2** (baja, A3): `checkHydrateWeekPerfect` usa `!== 86400000` estricto →
  falla en los 2 cambios de hora/año. Fix futuro: banda de tolerancia.
- **F-3** (cosmética, M1): `WeeklyStats.jsx` es código muerto (no está en
  `PACE.html`, no se bundlea). Cleanup futuro: borrar.
- **F-4** (baja, M5): Caminos sellan fecha en UTC (`todayISO`) mientras el
  resto usa local; misatribuye un Camino de madrugada por un día.
- **F-5** (cosmética, M3/B4): `totalActions` y `dominantModule` mezclan agua
  con "acciones"/minutos (rótulo confuso, sin impacto en datos).

---

## Verificación runtime

- Build limpio: **60 archivos validados** (11 .js + 49 .jsx).
- Standalone v0.34.2: `PACE_VERSION === 'v0.34.2'`, title correcto, fix
  inlineado (`updateStreak` en `PathFocusStep`, línea 11264 del bundle).
- **Smoke test headless** (Edge): el standalone renderiza la app completa
  (welcome modal + sidebar con Ritmo + chips de actividad + Camino sugerido),
  sin pantalla en blanco ni error fatal. El fix no rompió nada.

---

## Build

- `PACE_standalone.html`: **622 KB**. `index.html` copia exacta.
- Backup `PACE_standalone_v0.34.1_20260605.html` creado; cap 20 mantenido
  (rotado el más antiguo `v0.28.3_20260512.html`).

---

## Decisiones

| ID | Decisión | Razón |
|---|---|---|
| D1 | Aplicar F-1 (no diferir a F3) | Bug de corrección con fix de 1 línea seguro; deja la base de tracking *arreglada*, no solo documentada, de cara a F3/F4-F6 |
| D2 | Bump patch v0.34.2 (no minor) | Es un bugfix puntual, sin feature |
| D3 | F-2..F-5 documentados, no aplicados | Cosméticos/heredados de baja prioridad; no justifican tocar más código en una sesión de auditoría |
| D4 | F-1 = `updateStreak()` (no replicar todo `completePomodoro`) | El paso de Camino debe seguir siendo minimal (decisión s79): NO se añaden `first.step`/`master.pomodoro.*` (específicos de Pomodoro), solo la racha diaria, que es actividad genérica |

---

## Próxima sesión — F3

Gating a nivel sesión: campo `access` en rutinas Respira/Mueve/Estira + sello
PREMIUM + desbloqueo inicial/logro + superficie premium discreta en Tweaks.
