# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.28.2
**Ultima sesion:** #61 -- 2026-05-11 - chore(ui): sidebar cleanup + Ritmo fit + camino movil (v0.28.2)
**Ultima actualizacion de este archivo:** 2026-05-11 - sesion 61
**Build entregado:** `PACE_standalone.html` v0.28.2 (554 KB)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.28.2** (titulo bump s61, CSS PathStats compactado, regla SPC > div eliminada) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.28.2** (554 KB, regenerado s61) |
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
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.28.2** (s61: eliminado bloque contadores, 630->497 ln) |
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.20.0** |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.15.0** |
| `app/achievements/Achievements.jsx` | Catalogo + coleccion | **v0.25.3** |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.2** (s61: celda 14->12) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.2** (s61: label heatmap margin 12->6) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.28.2** (s61: celda 14->12, day labels 14->12) |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.28.2** (s61: WeekView compactado, MonthHeatmap 1fr+aspect-ratio) |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** (nuevo s58) |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** (nuevo s58) |
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.28.2** (PACE_VERSION bump s61) |
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
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.28.2** (s61: responsive movil propio, layout compacto, fix dual-only column) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.27.2** (a11y: aria-labelledby/Escape/focus s55) |
| `build-standalone.js` | Genera el bundle offline | **v0.26.1** (validateFileEnd + fix WARN s52) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.28.1_20260511.html` <- creado s61
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
- `backups/PACE_standalone_v0.25.1_20260507.html`
- `backups/PACE_standalone_v0.25.0_20260507_pre48.html`
- `backups/PACE_standalone_v0.25.0_20260507.html`
- `backups/PACE_standalone_v0.24.0_20260506.html`
- `backups/PACE_standalone_v0.23.0_20260506.html`
- `backups/PACE_standalone_v0.22.1_20260506.html`

---

## Ultima sesion (resumen operativo)

**Sesion 61 - v0.28.1 -> v0.28.2 - chore(ui): sidebar cleanup + Ritmo fit + camino movil**

### Que se hizo

Tres limpiezas de UI a peticion del usuario, sin tocar logica de
producto:

1. **Sidebar:** eliminado el bloque de **3 contadores** (pomodoros /
   rondas / racha) bajo el logo. No aportaba nada y comprimia las
   secciones de abajo. Ahora respiran. En movil, deja de pedir scroll.
   Codigo eliminado: JSX `cycles/cycleCount/cycleItem*3`, iconos SVG
   `PomodoroIcon/RoundsIcon/StreakFlameIcon` y estilos asociados.
   `Sidebar.jsx`: **630 → 497 lineas** (sale de deuda tecnica >500 ln).

2. **Modal Stats (Ritmo) en web:** las 4 pestanas ahora caben sin scroll
   vertical. Cambios clave:
   - `WeekView`: cards mas compactas (padding 16/14->10/12, num 28->22),
     `WeekBarRow` altura 64->44, marginBottom 18->10, nota inferior
     compactada. Tabs container marginBottom 24->14.
   - `MonthHeatmap`: paso de celdas fijas 36×36 a clases CSS con grid
     `1fr` + `aspect-ratio:1`. El calendario llena ahora el ancho del
     modal (820px). En movil override a `repeat(7, minmax(0, 32px))`.
   - `YearView` y `PathYearView`: celda 14→12, day labels height 14→12.
     Las 53 columnas + labels caben en el modal sin scroll horizontal.
   - `PathStats` + CSS PathStats en PACE.html: gaps/padding/fontSize
     compactados para que summary + tabla + heatmap quepan sin scroll.

3. **Camino sugerido en movil:** el `PathMiniCard` se apilaba en columna
   por un bug heredado (regla `[data-pace-spc] > div { flex-direction:
   column }` aplicaba tambien a la tarjeta unica, no solo al contenedor
   dual). Ahora:
   - Regla anterior eliminada de PACE.html.
   - Nuevo CSS responsive en `SuggestedPathCard.jsx` (pace-spc-
     responsive-css) que **solo** apila el contenedor dual
     (`[data-pace-spc-dual]`) y compacta la card unica:
     padding 14/20 → 10/12, gap 16 → 10, tagline ocultado, nombre
     17 → 15, iconos 20 → 16, boton 8/16 → 7/12.
   - Atributos `data-pace-spc-*` añadidos en JSX para targeting limpio.

### Build

- Backup: `backups/PACE_standalone_v0.28.1_20260511.html`.
- Bundle: 556 KB → 554 KB (-2 KB). Parser TS: 40 archivos validados.
- Version: v0.28.1 → v0.28.2 en `state-core.jsx` y `PACE.html`.

### Notas / pendientes que se aplazan a otra sesion

Pendientes heredados (NO se han tocado en s61):

- **Glifos de ejercicio (sesion 60 quedo en pausa con 13/46):** validar
  visualmente con el usuario los 5 minimalistas radicales y, si
  funcionan, propagar los 4 patrones canonicos a los 38 restantes
  (asignacion tentativa en `docs/sessions/session-60-glyphs-iter-
  incompleto.md`). Si no funcionan, nueva direccion.
- `PathYearView` movil (heatmap en 320px) -- pendiente desde s58.
- Detector logro `master.midnight.never` -- pendiente desde s58.
- Iconos PNG reales para PWA manifest.
- Split `strings.js` (742 ln, ALTA).
- Las claves i18n `sidebar.counter.pomodoros/rounds/streak` quedan
  huerfanas tras esta sesion -- se pueden podar en cleanup futuro.
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
