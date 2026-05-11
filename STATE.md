# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.28.6
**Ultima sesion:** #66 -- 2026-05-12 - fix(ui): logo completo + tagline sidebar movil + iconos maskable safe zone + cache-bust SW (v0.28.6)
**Ultima actualizacion de este archivo:** 2026-05-12 - sesion 66
**Build entregado:** `PACE_standalone.html` v0.28.6 (559 KB) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.28.5** (s65: manifest /manifest.json, iconos PNG, theme-color crema, metas PWA iOS/Android) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.28.5** (559 KB, regenerado s65) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.28.5** (s65: generado por build-standalone.js) |
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
| `app/breathe/BreatheSession.jsx` | Respiracion - sesion guiada | **v0.20.0** |
| `app/move/MoveModule.jsx` | Modulo Mueve | **v0.28.0** (StepGlyph usa ExerciseGlyph s59, sin cambios s61) |
| `app/extra/ExtraModule.jsx` | Modulo Estira | **v0.17.0** |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.28.6** (s66: 640px max-height+overflow eliminados en logobar -- logo+tagline integros en movil; data-pace-sidebar-logo max-width:200px) |
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.20.0** |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.15.0** |
| `app/achievements/Achievements.jsx` | Catalogo + coleccion | **v0.25.3** |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.5** (s64: overflowY:hidden en data-pyv-wrap -- fix scroll vertical) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.4** (s63: titulo marginBottom 6->4) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.28.5** (s64: overflowY:hidden en data-pace-year-grid-wrap -- fix scroll vertical) |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.28.5** (s64: nota inferior restaurada data-pace-week-note, oculta <=640px) |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** (nuevo s58) |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** (nuevo s58) |
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.28.6** (PACE_VERSION bump s66) |
| `app/state-timer.jsx` | addFocusMinutes, completePomodoro | **v0.27.5** (nuevo s57) |
| `app/state-hydrate.jsx` | addWaterGlass | **v0.27.5** (nuevo s57) |
| `app/state-achievements.jsx` | unlockAchievement, detectores, complete*Session | **v0.27.5** (nuevo s57) |
| `app/state-paths.jsx` | Caminos CRUD + stats | **v0.27.5** (nuevo s57) |
| `app/state-settings.jsx` | setLang | **v0.27.5** (nuevo s57) |
| `app/state.jsx` | Indice — re-export consolidado (58 lineas) | **v0.27.5** (reescrito s57) |
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
| `sw.js` | Service Worker PWA | **v0.28.6** (s66: CACHE_NAME pace-v0.28.6 -- cache-bust iconos maskable safe zone) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.28.5_20260512.html` <- creado s66
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
- `backups/PACE_standalone_v0.25.2_20260507.html`
- `backups/PACE_standalone_v0.25.1_20260507_pre48c.html`

---

## Ultima sesion (resumen operativo)

**Sesion 66 - v0.28.6 - fix(ui): logo completo + tagline sidebar movil + iconos maskable safe zone**

### Que se hizo

1. **Fix logo recortado en sidebar movil:** En `@media(max-width:640px)` de `Sidebar.jsx`,
   eliminados `min-height:48px`, `max-height:48px` y `overflow:hidden` del contenedor
   `[data-pace-sidebar-logobar]`. Eran las reglas que clippeaban el PNG del logo (vaca
   completa + tagline embebido). Ahora `overflow:visible` + `padding:6px 4px`.
   Nueva regla `[data-pace-sidebar-logo]` con `max-width:200px; width:100%; margin:0 auto`.
   Añadido atributo `data-pace-sidebar-logo` al div contenedor del logo en el JSX.

2. **Tagline restaurado:** El tagline "TOUCH GRASS, EVEN FROM YOUR DESK" está embebido
   en el PNG oficial (`pace-logo.png`), en la parte inferior. Al eliminar el clipping,
   queda visible automáticamente — no había elemento HTML separado.

3. **Cache-bust iconos maskable:** `CACHE_NAME` en `sw.js` bumpeado de `pace-v0.28.5`
   a `pace-v0.28.6`. Los iconos `icon-192-maskable.png` (192×192, 10.1 KB) e
   `icon-512-maskable.png` (512×512, 41.4 KB) ya estaban regenerados por el usuario
   con safe zone correcta (vaca ~70-75% del lienzo).

4. **Bump de version:** `state-core.jsx` + `PACE.html` → v0.28.6.

### Build

- Bundle: 559 KB (sin cambio). 40 archivos validados.
- `index.html` generado (559 KB, SHA256 identico a `PACE_standalone.html`).
- Backup: `backups/PACE_standalone_v0.28.5_20260512.html` (rotado el mas antiguo v0.25.1).

### Pendientes activos

- **TODO Fase 2 (~3 jun 2026):** eliminar `PACE_standalone.html` y dejar solo `index.html`.
  Actualizar PRECACHE de `sw.js` y `build-standalone.js` OUTPUT.
- **Glifos de ejercicio (s60 quedo en 13/46):** validar visualmente los
  5 minimalistas radicales y propagar 4 patrones a los 33 restantes.
- `PathYearView` movil (heatmap en 320px) -- pendiente desde s58.
- Detector logro `master.midnight.never` -- pendiente desde s58.
- Split `strings.js` (742 ln, ALTA).
- Claves i18n huerfanas `sidebar.counter.pomodoros/rounds/streak` -- podar en cleanup futuro.
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
| `app/state-core.jsx` | 356 | BAJA (dentro de limite) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
