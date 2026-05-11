# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.28.1
**Ultima sesion:** #60 -- 2026-05-11 - refactor(glyphs): iteracion parcial 13/46 (v0.28.1) -- **PAUSADA**
**Ultima actualizacion de este archivo:** 2026-05-11 - sesion 60
**Build entregado:** `PACE_standalone.html` v0.28.1 (556 KB)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.28.1** (titulo bump s60) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.28.1** (556 KB, regenerado s60) |
| `app/glyphs/exercise-glyphs.jsx` | 46 glifos SVG -- 13 rediseñados en s60 | **v0.28.1** (iter parcial s60, 525 ln) |
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
| `app/move/MoveModule.jsx` | Modulo Mueve | **v0.28.0** (StepGlyph usa ExerciseGlyph s59, sin cambios s60) |
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
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.28.1** (PACE_VERSION bump s60) |
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
- `backups/PACE_standalone_v0.28.0_20260511.html` <- creado s60
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

**Sesion 60 - v0.28.0 -> v0.28.1 - refactor(glyphs): iteracion parcial 13/46 -- PAUSADA**

### Que se hizo

**Problema:** feedback del usuario tras s59 -- los 46 glifos abstractos no
comunican el ejercicio a alguien sin contexto. Referencia: los 4 iconos
del home (pulmones, arco, mancuerna, gota) que son claros y minimalistas.

**Tres tandas de iteracion sin convergencia plena:**

1. **Tanda 1 (8 glifos)** -- abstraccion organica con metaforas (luna,
   enso, diafragma, pulmones, espiral). Usuario: "siguen sin ser
   ilustrativos al ejercicio".
2. **Tanda 2 (5 prototipos)** -- estrategia hibrida E asignando A/B/C
   por tipo (silueta postura / parte+flecha / objeto+cuerpo). Usuario:
   "no funciona, revisa bien de que va cada ejercicio".
3. **Tanda 3 (5 prototipos)** -- minimalismo radical, **4 patrones**
   canonicos definidos: (1) cuerpo como una sola forma, (2) objeto solo,
   (3) parte del cuerpo aislada, (4) metafora pura. Max 5 elementos por
   glifo (referencia: home icons 2-5).
4. **Usuario pausa** antes de cerrar el ciclo de validacion.

### Estado final en disco (v0.28.1)

- **13 glifos rediseñados:** Descanso, Reset respiracion, Deep breaths
  (metafora OK) + Squat profundo, Fondos en silla, Wrist circles, Chin
  tucks, Chest opener (minimalismo radical OK) + Squeeze fist, Wall sit,
  Calf raises, Apertura de pecho, Rotacion toracica (intermedios, pendientes
  refinar al patron correcto).
- **33 glifos sin tocar** -- estilo abstracto s59.
- **Build:** 557 KB → 556 KB, 0 errores.
- **Backup:** `backups/PACE_standalone_v0.28.0_20260511.html`.

### Proxima sesion (cuando se retome)

- Validar visualmente con el usuario los 5 glifos minimalistas radicales.
- Si funciona: propagar 4 patrones a los 38 restantes (33 sin tocar + 5
  intermedios a refinar). Asignacion tentativa documentada en
  `docs/sessions/session-60-glyphs-iter-incompleto.md` "Cuando se retome".
- Si no funciona: nueva direccion (esta fue la tercera, queda poco margen).

Otros pendientes (de sesiones anteriores, sin tocar en s60):
- PathYearView mobile (heatmap en 320px) -- pendiente desde s58.
- Detector logro master.midnight.never -- pendiente desde s58.
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
