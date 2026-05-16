# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.29.0
**Ultima sesion:** #75 -- 2026-05-16 - feat(camino): sendero hibrido + renombrado sensorial + fix dawn/dusk + foco interno suma a stats (v0.29.0)
**Ultima actualizacion de este archivo:** 2026-05-16 - sesion 75
**Build entregado:** `PACE_standalone.html` v0.29.0 (575.6 KB) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.29.0** (s75: titulo bump + carga SenderoBar.jsx) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.29.0** (575.6 KB, regenerado s75) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.29.0** (s75: regenerado por build-standalone.js) |
| `app/glyphs/exercise-glyphs.jsx` | 46 glifos SVG -- 13 rediseñados en s60 | **v0.28.1** (iter parcial s60, sin cambios s61) |
| `LICENSE` | Elastic License 2.0 en la raiz | Sin cambios desde v0.12.9 |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standalone |
| `app/ui/Sound.jsx` | Sonidos sintetizados Web Audio | **v0.21.0** |
| `app/ui/SessionShell.jsx` | Cascara compartida de sesiones activas | **v0.17.0** |
| `app/ui/Primitives.jsx` | Modal, Card, Tag, Button, Divider, Meta, displayItalic | **v0.19.0** |
| `app/tweaks/TweakSecretsWatcher.jsx` | Detectores de secretos | **v0.22.0** |
| `app/tweaks/TweaksPanel.jsx` | Panel de Ajustes | **v0.28.9** (s71: quitar envejecido, reorden idioma→audio→ejes, ambient marginLeft) |
| `app/breathe/BreatheVisual.jsx` | Respiracion - visual + getSequence | **v0.16.0** |
| `app/breathe/BreatheLibrary.jsx` | Respiracion - biblioteca + seguridad | **v0.17.0** |
| `app/breathe/BreatheSession.jsx` | Respiracion - sesion guiada | **v0.28.7** (s67: playPhaseSound helper + fix huecos A/B/C inhalacion) |
| `app/move/MoveModule.jsx` | Modulo Mueve | **v0.28.0** (StepGlyph usa ExerciseGlyph s59, sin cambios s61) |
| `app/extra/ExtraModule.jsx` | Modulo Estira | **v0.17.0** |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.28.8** (s69: WeekDots indexa weeklyStats[i] lunes-primero, hitos usa getDayIndexMondayFirst) |
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.28.10** (s72: strokeOpacity 0.7 + fallback c3 musgo apagado) |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.15.0** |
| `app/achievements/Achievements.jsx` | Catalogo + coleccion | **v0.25.3** |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.5** (s64: overflowY:hidden en data-pyv-wrap -- fix scroll vertical) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.4** (s63: titulo marginBottom 6->4) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.28.8** (s69: isActiveDay helper + computeYearStats unifica criterio "dia activo" = focus|breath|move>0, agua sola NO cuenta) |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.28.8** (s69: WeekBarRow elimina reorder, itera data lunes-primero) |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** (nuevo s58) |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** (nuevo s58) |
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.29.0** (s75: PACE_VERSION bump + paths.lastViewed en defaultState + migracion loadState) |
| `app/state-timer.jsx` | addFocusMinutes, completePomodoro | **v0.28.8** (s69: getDayIndexMondayFirst en addFocusMinutes + checkFocusDayAchievement) |
| `app/state-hydrate.jsx` | addWaterGlass | **v0.28.8** (s69: getDayIndexMondayFirst en addWaterGlass) |
| `app/state-achievements.jsx` | unlockAchievement, detectores, complete*Session | **v0.28.8** (s69: getDayIndexMondayFirst en 4 escritores de weeklyStats + checkRetreatAchievement) |
| `app/state-paths.jsx` | Caminos CRUD + stats | **v0.29.0** (s75: getSuggestedPath refactor -> lastViewed + setLastViewedPath + startPath actualiza lastViewed) |
| `app/state-settings.jsx` | setLang | **v0.27.5** (nuevo s57) |
| `app/state.jsx` | Indice — re-export consolidado | **v0.29.0** (s75: + setLastViewedPath; s69: recompute*/getDayIndexMondayFirst/getMondayOf) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez | **v0.19.0** |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.25.0** |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | **v0.28.9** (s71: PaceLogoImage invert+screen en oscuro) |
| `app/main.jsx` | Orquestador + TopBar + ActivityBar | **v0.27.0** (PathsLibrary montado s53) |
| `app/i18n/strings.js` | Strings ES + EN | **v0.29.0** (s75: 5 Caminos renombrados ES+EN + paths.kind.{breathe\|focus\|body\|hydrate}.name) |
| `app/tokens.css` | Tokens CSS + base | **v0.29.0** (s75: bloque .sendero-bar scoped) |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.26.0-alpha** |
| `app/paths/PathRunner.jsx` | Runner de caminos | **v0.29.0** (s75: SenderoBar integrado + TopBar dots->header tipografico + fix strings crudos dawn/dusk + PathFocusStep wire a addFocusMinutes) |
| `app/paths/SenderoBar.jsx` | Sendero visual del progreso interno | **v0.29.0** (nuevo s75) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.28.2** (s61: responsive movil propio, layout compacto, fix dual-only column) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.27.2** (a11y: aria-labelledby/Escape/focus s55) |
| `manifest.json` | PWA manifest | **v0.28.5** (s65: reescrito -- PNGs, start_url /,  scope /, theme crema) |
| `sw.js` | Service Worker PWA | **v0.29.0** (s75: CACHE_NAME pace-v0.29.0) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.28.12_20260516.html` <- creado s75
- `backups/PACE_standalone_v0.28.11_20260512.html`
- `backups/PACE_standalone_v0.28.10_20260512.html`
- `backups/PACE_standalone_v0.28.9_20260512.html`
- `backups/PACE_standalone_v0.28.8_20260512.html`
- `backups/PACE_standalone_v0.28.7_20260512.html`
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
- `backups/PACE_standalone_v0.27.0_20260508.html` (rotado `v0.25.4_20260508.html`)

---

## Ultima sesion (resumen operativo)

**Sesion 75 - v0.29.0 - feat(camino): sendero hibrido + renombrado sensorial + fix dawn/dusk + foco interno suma a stats**

### Contexto

Primer cambio funcional del modulo Caminos desde s54. Tres ejes:
renombrado evocador de los 5 Caminos (de horarios a sensoriales),
componente `SenderoBar` nuevo (sendero visual con curva organica + halos
en hitos), refactor de `getSuggestedPath()` para depender de la
preferencia del usuario (`lastViewed`) y no de la hora. Bugs heredados
corregidos. Detalle completo en
[`docs/sessions/session-75-sendero-implementacion.md`](./docs/sessions/session-75-sendero-implementacion.md).

### Que se hizo

1. **Renombrado de 5 Caminos** (`strings.js` ES + EN). IDs internos
   intactos para preservar `state.paths.completed/favorite/history`:
   dawn->Morning Glory, midday->Hierbabuena/Spearmint,
   afternoon->Chispa de Cerilla/Matchstrike, dusk->Lampara de
   Mesa/Desk Lamp, weekend->Ventana Abierta/Open Window.
2. **`app/paths/SenderoBar.jsx` (nuevo)**: SVG 640x100, curva Bezier
   asimetrica entre hitos equidistantes, halos radiales con
   `currentColor` (tema-agnostico), `useId()` para IDs unicos.
3. **`PathRunner.jsx`**: SenderoBar integrado entre TopBar y
   `path-step-body`. TopBar pasa de dots a header tipografico (Garamond
   italic 22px). Fix de 3 sitios donde se mostraba el ID crudo
   (`"dawn"`): TopBar caller, aria-label overlay, CompletionScreen h2.
4. **`PathFocusStep`**: cuando el timer llega a 0 (no por skip), dispara
   `addFocusMinutes(step.min)` una vez (guard `creditedRef`). Skip o
   salida no acreditan -- alineado con Pomodoro estandar.
5. **`getSuggestedPath()` refactor**: lee `state.paths.lastViewed`; si
   sigue en el catalogo, lo devuelve; si no, primer Camino.
   `startPath()` actualiza `lastViewed` automaticamente; sin tocar
   selectores.
6. **`defaultState.paths`**: anadido `lastViewed: null`. Migracion
   defensiva en `loadState`. Re-export `setLastViewedPath` en
   `app/state.jsx`.
7. **CSS**: bloque scoped `.sendero-bar` en `tokens.css`. Cero
   variables nuevas a nivel global. `flex-shrink: 0` para fijar la
   barra bajo el TopBar.
8. **Carga**: `SenderoBar.jsx` en `PACE.html` antes de `PathRunner.jsx`.
9. **i18n nuevas claves**: `paths.kind.{breathe|focus|body|hydrate}.name`
   (8 entradas ES+EN) para etiquetar los hitos del sendero.
10. **Bump version v0.29.0**: `state-core`, `PACE.html`, `sw.js`.

### Build

- Bundle: **575.6 KB** (567 -> 575.6, +8.6 KB por SenderoBar + CSS +
  i18n + refactor). 41 archivos validados (40 -> 41).
- SHA256: `9D7AC04378F54E3C73E6B98DDA30BF206525F22A9A7E27294D837A49F5018CB9`
  (identico en `index.html`).
- Backup: `backups/PACE_standalone_v0.28.12_20260516.html`. Rotado
  `v0.25.4_20260508.html` (cap 20).
- `check-session.ps1`: rama main, sin commits pendientes, sin worktrees,
  tamano en rango.

### Pendientes activos (diferidos por scope)

- **s76**: crear los 2 Caminos faltantes (Te sin Azucar / Plain Tea -
  reenganche tras pausa; Halito / Breath - micropausa). Catalogo 5 -> 7.
- **s76**: revisar selector inferior Caminos (`SuggestedPathCard`,
  `PathsLibrary`) -- esta s75 NO los toca por scope.
- **s77**: animacion de transicion del halo al saltar de hito.
- Si el halo unico (0.70) no convence en oscuro, diferenciar via dos
  gradientes por `[data-palette]` (Vela 0.78 claro / Candil 0.62 oscuro).
- **A3** (DST en `checkHydrateWeekPerfect`) - solo 2 dias/año, post-Reddit.
- **A4** (`checkStatsAchievements` con 1 dia de retraso desde `loadState`) - post-Reddit.
- **M1** (eliminar `WeeklyStats.jsx` codigo muerto) - solo arreglada indexacion interna.
- **M2..M6, B1..B5** - documentados en informe s68.
- **TODO Fase 2 (~3 jun 2026):** eliminar `PACE_standalone.html`, dejar solo `index.html`.
- **Glifos ejercicio s60** (13/46), `PathYearView` movil, logro `master.midnight.never`.
- **Split `strings.js`** (~755 ln tras s75, ALTA).
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
| `app/i18n/strings.js` | 774 | ALTA |
| `app/main.jsx` | 600 | MEDIA |
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/state-core.jsx` | 470 | BAJA (dentro de limite) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
