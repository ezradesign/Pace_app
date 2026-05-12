# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.28.8
**Ultima sesion:** #69 -- 2026-05-12 - fix(tracking): C1+C2+C3+A1+A2 weeklyStats/history idempotente + streak proactivo (v0.28.8)
**Ultima actualizacion de este archivo:** 2026-05-12 - sesion 69
**Build entregado:** `PACE_standalone.html` v0.28.8 (566 KB) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.28.8** (s69: titulo bump) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.28.8** (566 KB, regenerado s69) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.28.8** (s69: regenerado por build-standalone.js) |
| `app/glyphs/exercise-glyphs.jsx` | 46 glifos SVG -- 13 rediseñados en s60 | **v0.28.1** (iter parcial s60, sin cambios s61) |
| `LICENSE` | Elastic License 2.0 en la raiz | Sin cambios desde v0.12.9 |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standalone |
| `app/ui/Sound.jsx` | Sonidos sintetizados Web Audio | **v0.21.0** |
| `app/ui/SessionShell.jsx` | Cascara compartida de sesiones activas | **v0.17.0** |
| `app/ui/Primitives.jsx` | Modal, Card, Tag, Button, Divider, Meta, displayItalic | **v0.19.0** |
| `app/tweaks/TweakSecretsWatcher.jsx` | Detectores de secretos | **v0.22.0** |
| `app/tweaks/TweaksPanel.jsx` | Panel de Ajustes | **v0.22.0** |
| `app/breathe/BreatheVisual.jsx` | Respiracion - visual + getSequence | **v0.16.0** |
| `app/breathe/BreatheLibrary.jsx` | Respiracion - biblioteca + seguridad | **v0.17.0** |
| `app/breathe/BreatheSession.jsx` | Respiracion - sesion guiada | **v0.28.7** (s67: playPhaseSound helper + fix huecos A/B/C inhalacion) |
| `app/move/MoveModule.jsx` | Modulo Mueve | **v0.28.0** (StepGlyph usa ExerciseGlyph s59, sin cambios s61) |
| `app/extra/ExtraModule.jsx` | Modulo Estira | **v0.17.0** |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.28.8** (s69: WeekDots indexa weeklyStats[i] lunes-primero, hitos usa getDayIndexMondayFirst) |
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.20.0** |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.15.0** |
| `app/achievements/Achievements.jsx` | Catalogo + coleccion | **v0.25.3** |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.5** (s64: overflowY:hidden en data-pyv-wrap -- fix scroll vertical) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.4** (s63: titulo marginBottom 6->4) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.28.8** (s69: isActiveDay helper + computeYearStats unifica criterio "dia activo" = focus|breath|move>0, agua sola NO cuenta) |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.28.8** (s69: WeekBarRow elimina reorder, itera data lunes-primero) |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** (nuevo s58) |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** (nuevo s58) |
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.28.8** (s69: reescrito — archiveDayToHistory idempotente, rollover con C1+A2+C2, migracion compensatoria, reindex lunes-primero, 6 helpers nuevos) |
| `app/state-timer.jsx` | addFocusMinutes, completePomodoro | **v0.28.8** (s69: getDayIndexMondayFirst en addFocusMinutes + checkFocusDayAchievement) |
| `app/state-hydrate.jsx` | addWaterGlass | **v0.28.8** (s69: getDayIndexMondayFirst en addWaterGlass) |
| `app/state-achievements.jsx` | unlockAchievement, detectores, complete*Session | **v0.28.8** (s69: getDayIndexMondayFirst en 4 escritores de weeklyStats + checkRetreatAchievement) |
| `app/state-paths.jsx` | Caminos CRUD + stats | **v0.27.5** (nuevo s57) |
| `app/state-settings.jsx` | setLang | **v0.27.5** (nuevo s57) |
| `app/state.jsx` | Indice — re-export consolidado | **v0.28.8** (s69: re-export recomputeMonthFromDays/recomputeYearFromDays/recomputeAllHistoryAggregates/getDayIndexMondayFirst/getMondayOf en lugar de updateMonth/YearAggregate) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez | **v0.19.0** |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.25.0** |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | v0.12.8 |
| `app/main.jsx` | Orquestador + TopBar + ActivityBar | **v0.27.0** (PathsLibrary montado s53) |
| `app/i18n/strings.js` | Strings ES + EN | **v0.28.3** (s62: typo "ano"→"año" en stats.year.days.label + stats.paths.heatmap) |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.26.0-alpha** |
| `app/paths/PathRunner.jsx` | Runner de caminos | **v0.27.2** (a11y: role/aria-modal/Escape en PathRunner + ExitConfirmModal s55) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.28.2** (s61: responsive movil propio, layout compacto, fix dual-only column) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.27.2** (a11y: aria-labelledby/Escape/focus s55) |
| `manifest.json` | PWA manifest | **v0.28.5** (s65: reescrito -- PNGs, start_url /,  scope /, theme crema) |
| `sw.js` | Service Worker PWA | **v0.28.8** (s69: CACHE_NAME pace-v0.28.8) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.28.7_20260512.html` <- creado s69
- `backups/PACE_standalone_v0.28.6_20260511.html`
- `backups/PACE_standalone_v0.28.5_20260512.html`
- `backups/PACE_standalone_v0.28.4_20260512.html`
- `backups/PACE_standalone_v0.28.3_20260512.html`
- `backups/PACE_standalone_v0.28.2_20260511.html`
- `backups/PACE_standalone_v0.28.1_20260511.html`
- `backups/PACE_standalone_v0.28.0_20260511.html`
- `backups/PACE_standalone_v0.27.6_20260511.html`
- `backups/PACE_standalone_v0.27.5_20260511.html`
- `backups/PACE_standalone_v0.27.3_20260511.html`
- `backups/PACE_standalone_v0.27.2_20260509.html`
- `backups/PACE_standalone_v0.27.1b_20260509.html`
- `backups/PACE_standalone_v0.27.0_20260509.html`
- `backups/PACE_standalone_v0.27.0_20260508.html`
- `backups/PACE_standalone_v0.26.0_20260508.html`
- `backups/PACE_standalone_v0.26.0-alpha_20260508.html`
- `backups/PACE_standalone_v0.25.4_20260508.html`
- `backups/PACE_standalone_v0.25.3_20260508_ROTO.html`
- `backups/PACE_standalone_v0.25.2_20260508_pre48d.html`

---

## Ultima sesion (resumen operativo)

**Sesion 69 - v0.28.8 - fix(tracking): C1+C2+C3+A1+A2 weeklyStats/history idempotente + streak proactivo**

### Contexto

Auditoria s68 (`docs/audits/audit-tracking-v0.28.7.md`) detecto 3 criticos
(C1: weeklyStats no resetea entre semanas / C2: doble archivado en migracion
s43 / C3: archiveDayToHistory asimetrico) y 4 altos. Decisiones del autor
para s69: (B) semana fija lunes-domingo con reset completo / (X) rotura
proactiva del streak / (P) migracion compensatoria recomputando months/years
desde days. Diferidos a post-Reddit: A3 (DST), A4 (logros con 1 dia de retraso)
y todos los medios/bajos.

### Que se hizo

1. **Validacion previa (Tarea 0):** los 5 bugs (C1, C2, C3, A1, A2)
   confirmados en codigo con cita exacta de lineas antes de tocar nada.

2. **Fix C3 + Tarea 1 (`app/state-core.jsx`):** `archiveDayToHistory`
   reescrita para que sea 100% idempotente — `days[iso]` overwrite,
   `months[mk]` y `years[yk]` se RECALCULAN desde `days` cada vez.
   Funciones antiguas `updateMonthAggregate` y `updateYearAggregate`
   eliminadas. Nuevos helpers `recomputeMonthFromDays`,
   `recomputeYearFromDays`, `recomputeAllHistoryAggregates`.

3. **Fix C1 + Fix A2 + Tarea 2 (`rolloverIfNeeded`):** captura
   `wasAlreadyMigrated` antes de la migracion s43, asi NO re-archiva
   `lastActiveDay` si la migracion lo cubrio (fix C2). Compara
   `getMondayOf(lastActiveDay)` vs `getMondayOf(today)`; si difieren,
   `weeklyStats` → ceros (fix C1). Si `streak.lastActiveDate < ayer`,
   `streak.current = 0` proactivamente (fix A2).

4. **Convencion lunes-primero (Tarea 3):** array `weeklyStats[i]`
   pasa de `i = getDay()` (0=domingo) a `i = 0=lunes..6=domingo`.
   Helper nuevo `getDayIndexMondayFirst()`. Migracion automatica
   `reindexWeeklyStatsMondayFirst()` en `loadState` con guard
   `_weeklyStatsReindexed_v0_28_8`. Actualizadas todas las escrituras
   (`state-timer`, `state-hydrate`, 4 en `state-achievements`) y
   lectores (`StatsPanel.WeekBarRow`, `WeeklyStats.WeekBarRow`,
   `Sidebar.WeekDots`, `Sidebar.hitos`) — eliminados los reorders
   `[data[1]..data[0]]` y `(i+1)%7`.

5. **Fix A1 + Tarea 4 (`app/stats/YearView.jsx`):** helper `isActiveDay(entry)`
   con criterio `focus|breath|move > 0`. `computeYearStats` usa este criterio
   para `activeDays`, `curStreak`, `maxStreak` — agua sola YA NO cuenta para
   la racha del ano, alineado con `updateStreak()`. `totalActions` sin cambios
   (M3 fuera de scope).

6. **Migracion compensatoria + Tarea 5 (`loadState`):** llamada a
   `recomputeAllHistoryAggregates(history)` con guard
   `_historyRecalculated_v0_28_8`. Una sola vez por instalacion. Como
   `history.days` es integro por overwrite, recalcular `months/years`
   desde alli es 100% seguro y corrige los datos inflados por C2/C3.

7. **Bump de version:** `state-core.jsx` PACE_VERSION → v0.28.8.
   `PACE.html` title → v0.28.8. `sw.js` CACHE_NAME → `pace-v0.28.8`.

8. **Tests de regresion:** `docs/audits/regression-tests-v0.28.8.md`
   con 5 scripts DevTools (1 por bug) ejecutables en ventana incognita.

### Build

- Bundle: 566 KB (+6 KB vs v0.28.7). 40 archivos validados.
- `index.html` generado (SHA256: `C1290554...0D40FB`, identico al standalone).
- Backup: `backups/PACE_standalone_v0.28.7_20260512.html` (rotado el mas antiguo v0.25.2 / 20260507).
- `scripts/check-session.ps1`: sin worktrees, sin commits sin push, bundle 565.7 KB.

### Verificacion pendiente antes del commit

El usuario debe ejecutar los 5 tests de `docs/audits/regression-tests-v0.28.8.md`
en una ventana de incognito. Si los 5 imprimen `PASS Test N`, commitear con:

```
fix(tracking): C1+C2+C3+A1+A2 weeklyStats/history idempotente + streak proactivo (v0.28.8)
```

### Pendientes activos (diferidos por scope)

- **A3** (DST en `checkHydrateWeekPerfect`) — solo 2 dias/año, post-Reddit.
- **A4** (`checkStatsAchievements` con 1 dia de retraso desde `loadState`) — post-Reddit.
- **M1** (eliminar `WeeklyStats.jsx` codigo muerto) — solo arreglada indexacion interna.
- **M2..M6, B1..B5** — documentados en informe s68.
- **TODO Fase 2 (~3 jun 2026):** eliminar `PACE_standalone.html`, dejar solo `index.html`.
- **Glifos ejercicio s60** (13/46), `PathYearView` movil, logro `master.midnight.never`.
- **Split `strings.js`** (742 ln, ALTA).
- Claves i18n huerfanas `sidebar.counter.pomodoros/rounds/streak`.

## Decisiones activas

| Decision | Desde | Detalle |
|---|---|---|
| Sintetizar audio (no WAVs) | s28 | Web Audio API, 432 Hz base |
| Elastic License 2.0 | s26 | No SaaS competidores, si uso personal/comercial propio |
| Anti-truncamiento: Python write | s48-s52 | Nunca Edit tool con caracteres especiales |
| Build con TS parser real | s56 | Aborta con linea:columna exacta en cualquier error sintactico |

| Overlay via CustomEvent | s50+ | PathRunner, PathsLibrary -- evita prop drilling |

---

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/i18n/strings.js` | 742 | ALTA |
| `app/main.jsx` | 600 | MEDIA |
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/state-core.jsx` | 470 | BAJA (dentro de limite) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
