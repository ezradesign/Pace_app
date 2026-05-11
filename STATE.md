# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.28.0
**Ultima sesion:** #59 -- 2026-05-11 - feat(glyphs): 46 glifos canonicos por paso (v0.28.0)
**Ultima actualizacion de este archivo:** 2026-05-11 - sesion 59
**Build entregado:** `PACE_standalone.html` v0.28.0 (557 KB)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.28.0** (titulo bump s59 + script glifos) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.28.0** (557 KB, regenerado s59) |
| `app/glyphs/exercise-glyphs.jsx` | 46 glifos SVG canonicos por paso | **v0.28.0** (nuevo s59, 569 ln) |
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
| `app/move/MoveModule.jsx` | Modulo Mueve | **v0.28.0** (StepGlyph usa ExerciseGlyph s59) |
| `app/extra/ExtraModule.jsx` | Modulo Estira | **v0.17.0** |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.19.0** |
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.20.0** |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.15.0** |
| `app/achievements/Achievements.jsx` | Catalogo + coleccion | **v0.25.3** |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.27.1** (nuevo s54) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.27.1** (nuevo s54) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.24.0** |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.27.1** (tab Caminos s54) |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** (nuevo s58) |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** (nuevo s58) |
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.28.0** (PACE_VERSION bump s59) |
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
| `app/i18n/strings.js` | Strings ES + EN | **v0.27.2** (321 claves ES = 321 EN, 0 diff s55) |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.26.0-alpha** |
| `app/paths/PathRunner.jsx` | Runner de caminos | **v0.27.2** (a11y: role/aria-modal/Escape en PathRunner + ExitConfirmModal s55) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.27.0** (dual card + Ver todos s53) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.27.2** (a11y: aria-labelledby/Escape/focus s55) |
| `build-standalone.js` | Genera el bundle offline | **v0.26.1** (validateFileEnd + fix WARN s52) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.27.6_20260511.html` <- creado s59
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
- `backups/PACE_standalone_v0.25.1_20260507.html`
- `backups/PACE_standalone_v0.25.0_20260507_pre48.html`
- `backups/PACE_standalone_v0.25.0_20260507.html`
- `backups/PACE_standalone_v0.24.0_20260506.html`
- `backups/PACE_standalone_v0.23.0_20260506.html`
- `backups/PACE_standalone_v0.22.1_20260506.html`
- `backups/PACE_standalone_v0.22.0_20260506.html`
- `backups/PACE_standalone_v0.21.0_20260506.html`

---

## Ultima sesion (resumen operativo)

**Sesion 59 - v0.27.6 -> v0.28.0 - feat(glyphs): 46 glifos canonicos por paso**

### Que se hizo

**Problema:** durante una sesion activa de Mueve/Estira (y pasos `body` de
Caminos via PathRunner), todos los ejercicios mostraban el mismo placeholder
(circulo punteado con un caracter tipografico rotando). La pantalla no
comunicaba que ejercicio toca hacer.

**FASE A (Sonnet) — andamiaje + auditoria:**
- Auditoria de pasos unicos en `MOVE_ROUTINES` (13) + `EXTRA_ROUTINES` (33)
  = 46 step.name unicos. Decision: granularidad por paso, no por rutina.
- BreatheSession fuera de scope (usa BreathVisual animado).
- `app/glyphs/exercise-glyphs.jsx` con esqueleto + `ExerciseGlyph` + fallback.
- `MoveModule.jsx` StepGlyph reescrito para usar `<ExerciseGlyph id={step.name} />`.
- `PACE.html` carga el script antes de los modulos consumidores.

**FASE B (Opus 4.7) — diseno:**
- 46 SVGs line-art con helper `<G>` (viewBox 0 0 44 44, stroke 1.6 currentColor).
- Sin figuras humanas completas: objetos (silla, pared, barra, banda),
  partes aisladas (cabeza, codo, hip pivot), trayectorias (arcos, flechas).
- Pares semanticos diferenciados (Descanso vs Reset respiracion vs Deep
  breaths · Dead hang vs Hang pasivo · 5 ejercicios de cuello con vectores
  visuales distintos).
- Version bumpeada a v0.28.0 en state-core.jsx y PACE.html.

**Build:** 538 KB → 557 KB (+19 KB), 0 errores, 0 WARN.
**Validaciones V1-V6:** todas OK (569 ln ≤ 700, 46 keys, viewBox/stroke
canonicos, sin text ni fill solido, paths unicos, check-session limpio).

### Proxima sesion (sugerencias)
- Verificar visualmente recorriendo 4-5 rutinas distintas en navegador.
- Iterar glifos si alguno no comunica bien.
- PathYearView mobile (heatmap en 320px) — pendiente desde s58.
- Detector logro master.midnight.never — pendiente desde s58.
- Iconos PNG reales PWA manifest.
- Split Sidebar.jsx (630 ln) o strings.js (742 ln).
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
| `app/shell/Sidebar.jsx` | 630 | MEDIA |
| `app/main.jsx` | 600 | MEDIA |
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/state-core.jsx` | 356 | BAJA (dentro de limite) |
