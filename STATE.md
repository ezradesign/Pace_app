# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.32.1
**Ultima sesion:** #79 -- 2026-05-18 - fix(ui): pomodoro contextual en Camino (aro + pausa/reset/saltar) + fade-out toasts + oscuro +10% (v0.32.1)
**Ultima actualizacion de este archivo:** 2026-05-18 - sesion 79
**Build entregado:** `PACE_standalone.html` v0.32.1 (607 KB; 621,446 bytes) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.32.1** (s79: titulo bump) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.32.1** (607 KB, regenerado s79) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.32.1** (s79: regenerado por build-standalone.js) |
| `app/glyphs/exercise-glyphs.jsx` | 46 glifos SVG -- 13 rediseñados en s60 | **v0.28.1** (iter parcial s60, sin cambios s61) |
| `LICENSE` | Elastic License 2.0 en la raiz | Sin cambios desde v0.12.9 |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standalone |
| `app/ui/Sound.jsx` | Sonidos sintetizados Web Audio | **v0.21.0** (s77: NO modificado, decision 15 -- silencio en transiciones) |
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
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.31.0** (s77b: startBtnPrimary usa var(--focus-cta) -- verde musgo #506B3E claro / #8AA776 oscuro) |
| `app/ui/TimerDial.jsx` | Anillo circular compartido (FocusTimer + PathFocusStep) | **v0.30.0** (s76, sin cambios s77) |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.15.0** |
| `app/achievements/Achievements.jsx` | Catalogo + coleccion | **v0.32.0** (s78: + entrada master.path.all7 en maestria + glifo SVG heptagonal + IMPLEMENTED_ACHIEVEMENTS subgrupo Caminos) |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.5** (s64: overflowY:hidden en data-pyv-wrap -- fix scroll vertical) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.4** (s63: titulo marginBottom 6->4) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.28.8** (s69: isActiveDay helper + computeYearStats unifica criterio "dia activo" = focus|breath|move>0, agua sola NO cuenta) |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.28.8** (s69: WeekBarRow elimina reorder, itera data lunes-primero) |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** (nuevo s58) |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** (nuevo s58) |
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.32.1** (s79: PACE_VERSION bump; s77b: + constante TOAST_DURATION_MS=3000 exportada a window) |
| `app/state-timer.jsx` | addFocusMinutes, completePomodoro | **v0.28.8** (s69: getDayIndexMondayFirst en addFocusMinutes + checkFocusDayAchievement) |
| `app/state-hydrate.jsx` | addWaterGlass | **v0.28.8** (s69: getDayIndexMondayFirst en addWaterGlass) |
| `app/state-achievements.jsx` | unlockAchievement, detectores, complete*Session | **v0.32.0** (s78: + checkAllPathsCompleted + export a window; s69: getDayIndexMondayFirst en 4 escritores de weeklyStats + checkRetreatAchievement) |
| `app/state-paths.jsx` | Caminos CRUD + stats | **v0.32.0** (s78: getSuggestedPath jerarquica lastViewed>horario>anytime>catalog[0] + hook checkAllPathsCompleted en advancePathStep; s75: getSuggestedPath refactor -> lastViewed + setLastViewedPath) |
| `app/state-settings.jsx` | setLang | **v0.27.5** (nuevo s57) |
| `app/state.jsx` | Indice — re-export consolidado | **v0.29.0** (s75: + setLastViewedPath; s69: recompute*/getDayIndexMondayFirst/getMondayOf) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez | **v0.19.0** |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.32.1** (s79: fade-out aditivo 300ms via estado exiting + opacity transition; visible TOAST_DURATION_MS sin cambios; s77b: TOAST_DURATION_MS de window con fallback 3000ms) |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | **v0.28.9** (s71: PaceLogoImage invert+screen en oscuro) |
| `app/main.jsx` | Orquestador + TopBar + ActivityBar | **v0.27.0** (PathsLibrary montado s53) |
| `app/i18n/strings.js` | Strings ES + EN | **v0.32.0** (s78: +8 claves -- tea/breath name+tagline ES/EN + microcopy hydrate redisenada -- path.hydrate.copy/drank/skip/glasses.today; s77: + path.runner.transition.continue) |
| `app/tokens.css` | Tokens CSS + base | **v0.32.1** (s79: recalibrado oscuro +10% luminosidad en paper/paper-2/paper-3/line/line-2, --ink-* intactos; s77 + s77b: 5 tokens transicion + bloque .sendero-bar.lg + token --focus-cta crema/oscuro) |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.32.0** (s78: + path.tea timeOfDay='afternoon' + path.breath timeOfDay='anytime' -- catalogo cerrado a 7) |
| `app/paths/PathRunner.jsx` | Runner de caminos | **v0.32.1** (s79: redisenio contextual de PathFocusStep -- subtitle "Concentracion profunda" en TimerDial + 3 botones mismo peso visual Pausar/Reset/Saltar via btnBase + handleReset que no acredita foco; 815->835 ln; s78: redisenio PathHydrateStep) |
| `app/paths/PathTransitions.jsx` | Cards intro/step/outro entre pantallas del Camino | **v0.31.0** (nuevo s77, 232 ln; s77b: render SenderoBar lg sin guard typeof) |
| `app/paths/SenderoBar.jsx` | Sendero visual del progreso interno | **v0.31.0** (s77: + prop size="lg" + prop orbVisible + orbe viajero via animateMotion sobre la curva Bezier; s77b: **prop sticky retirada** + hito-labels filtran solo done (i<currentIndex) -- comportamiento unificado en lg y CompletionScreen; 148->164 ln) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.31.0** (s77b: CTA Comenzar usa var(--focus-cta) por coherencia con el Pomodoro) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.31.0** (s77b: CTA Comenzar usa var(--focus-cta)) |
| `manifest.json` | PWA manifest | **v0.28.5** (s65: reescrito -- PNGs, start_url /,  scope /, theme crema) |
| `sw.js` | Service Worker PWA | **v0.32.1** (s79: CACHE_NAME pace-v0.32.1) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.32.0_20260518.html` <- creado s79 (copia previa al rebuild v0.32.1)
- `backups/PACE_standalone_v0.31.0_20260517.html`
- `backups/PACE_standalone_v0.30.0_20260517.html`
- `backups/PACE_standalone_v0.29.0_20260516.html`
- `backups/PACE_standalone_v0.28.12_20260516.html`
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
- `backups/PACE_standalone_v0.27.3_20260511.html` (rotado `v0.27.2_20260509.html` en s79 para mantener cap de 20)

---

## Ultima sesion (resumen operativo)

**Sesion 79 - v0.32.1 - fix(ui): pomodoro contextual en Camino (aro + pausa/reset/saltar) + fade-out toasts + oscuro +10%**

### Contexto

s78 cerro el catalogo de Caminos a 7 y redisenio PathHydrateStep para
alinearlo con HydrateModule. Tres flecos UX quedaron abiertos:
PathFocusStep todavia usaba controles minimos (Pausar/Saltar) sin
Reset y sin subtitulo dentro del aro; los toasts cortaban de golpe
tras los 3s; y la paleta oscura post-s74 dejaba el texto secundario
un punto apagado.

Diario: [s79](./docs/sessions/session-79-pomodoro-camino-fadeout-oscuro.md).

### Que se hizo

1. **`PathFocusStep` rediseniado contextualmente
   (`app/paths/PathRunner.jsx`, 815->835 ln)**:
   - `<TimerDial>` ahora recibe
     `subtitle={t('focus.subtitle.focus')}` ("Concentracion profunda"
     / "Deep focus"). Cierra la alineacion con el aro de FocusTimer
     iniciada en s76 cuando se extrajo TimerDial.
   - Tres botones del mismo peso visual via `btnBase` compartido
     (outline 1px var(--line-2), transparent, var(--ink-2), font
     display italic, padding 10x22, radius --r-sm):
     Pausar/Reanudar/Comenzar (toggle por `focus.pause` /
     `focus.continue` / `focus.start`) + Reset (`focus.restart`) +
     Saltar (`path.runner.skip`). Sin CTA dominante.
   - Nuevo `handleReset()`: pausa + restore `remaining = totalSec`.
     NO acredita foco (`creditedRef` intacto) ni avanza el Camino.
   - Bloque `done` sin cambios: CTA "Hecho" centrado al completar.
2. **Toast con fade-out aditivo 300ms (`app/ui/Toast.jsx`)**:
   - Toast insertado con `exiting: false`.
   - Tras `TOAST_DURATION_MS` (3000ms): primer setTimeout marca
     `exiting: true` -> div aplica `opacity: 0` con
     `transition: opacity 300ms ease-out`.
   - Tras `TOAST_DURATION_MS + 300ms`: segundo setTimeout desmonta
     del array. Duracion visible sin cambios.
3. **Paleta oscura +10% luminosidad (`app/tokens.css`)** en
   `[data-palette="oscuro"]`:
   - `--paper`: `#15130f` -> `#1d1a14`.
   - `--paper-2`: `#1d1a15` -> `#26211a`.
   - `--paper-3`: `#252119` -> `#2f2920`.
   - `--line`: `#332d24` -> `#3d362b`.
   - `--line-2`: `#403930` -> `#4a4238`.
   - `--ink-*` intactos.
4. **DESIGN_SYSTEM.md actualizado** -- tabla oscuro refleja los
   nuevos valores y la pre-existente desincronizacion documental
   (DS tenia `#1A1814` mientras tokens.css tenia `#15130f`) queda
   resuelta hacia los nuevos hex de s79.
5. **Bump v0.32.1** (state-core, PACE.html, sw.js).

### Decisiones tomadas

- D1 -- No extraer `ProgressRing.jsx`. Ya esta extraido como
  `app/ui/TimerDial.jsx` desde s76 (v0.30.0). El requerimiento del
  prompt esta cubierto sin crear componentes nuevos.
- D2 -- Tres botones outline (sin CTA dominante) en PathFocusStep.
  "Mismo peso visual" segun el prompt; consistente con PathHydrateStep
  (s78). Refuerza el caracter contemplativo de la sesion.
- D3 -- Reset NO acredita foco. Solo limpia el contador local.
- D4 -- `done` mantiene CTA solido "Hecho". Tras completar los 3
  botones contemplativos ya no aplican; el solido marca la unica
  accion pendiente (avanzar).
- D5 -- Fade aditivo, `TOAST_DURATION_MS` sin cambios. El prompt lo
  pide explicito.
- D6 -- Cambio inline en style del toast (no clase CSS). El render
  ya usa inline style; mantener consistencia evita mezclar tecnicas.
- D7 -- Cero claves i18n nuevas. Todas las etiquetas reutilizan
  claves existentes (`focus.start/pause/continue/restart` +
  `focus.subtitle.focus` + `path.runner.skip/done`).

### Build

- Bundle: **607 KB** (621,446 bytes; +1,831 bytes vs v0.32.0 =
  619,615).
- 43 archivos validados (sin cambios estructurales vs s78).
- `index.html` byte-a-byte identico a `PACE_standalone.html`.
- SHA-256:
  `143c219e8faf37592b2a1aeb6d597259d597cf92930f6b3209ad893a74a53c5b`.
- Backup creado: `backups/PACE_standalone_v0.32.0_20260518.html`
  (607 KB). Rotado el mas antiguo: `v0.27.2_20260509.html`.

### Validacion runtime usuario

Pendiente. Checklist propuesto en el diario s79 (10 puntos: titulo
v0.32.1, modo oscuro legible, Morning Glory hasta bloque foco con
subtitle visible + aro + 3 botones, pausar/reanudar, reset sin
abortar, saltar sin acreditar, SenderoBar+TransitionCards intactas,
toast con fade-out, alternancia claro/oscuro sin glitches).

## Proxima sesion -- s80 (split tecnico, sin features)

### Scope propuesto

1. **Split `app/paths/PathRunner.jsx`** -- 835 ln tras s79, sigue
   marcada como deuda ALTA. Candidatos a extraer:
   - `CompletionScreen` -> `app/paths/PathCompletion.jsx`.
   - 4 `Path*Step` (Breathe/Focus/Body/Hydrate) -> archivos hijos
     (PathFocusStep ya tiene tamano y forma autonoma para vivir
     en su propio archivo tras el redisenio de s79).
   - `ExitConfirmModal` + `PathTopBar` + `StepError` -> mover a
     `PathRunner.parts.jsx` o similar.
2. Tras el split, verificar:
   - PathTransitions sigue funcionando (Intro/Step/Outro).
   - getSuggestedPath con jerarquia s78 OK.
   - master.path.all7 detector dispara correctamente.
   - PathFocusStep s79 (subtitle + 3 botones + reset) intacto.
3. Sin cambios visuales ni de comportamiento -- es refactor puro.

### Precondicion bloqueante

Cierre Git de s79 publicado por el usuario (commit + push manual).

### Decisiones pendientes para el prompt s80

- Donde vive el helper `CS_ROMAN` (numerales) -- exportar de
  `state-core.jsx` o duplicar en CompletionScreen?
- `PathBreatheStep` + `PathBreatheSafetyGate` van juntos en
  `PathBreatheStep.jsx` o cada uno en su archivo?
- Conviene crear un `PathRunner.types.jsx` para `phase` y otros
  tipos compartidos?
- `btnBase` de PathHydrateStep + PathFocusStep ya se repite en dos
  steps -- candidato a `app/paths/pathButton.js` o equivalente.

---

## Decisiones activas

| Decision | Desde | Detalle |
|---|---|---|
| Sintetizar audio (no WAVs) | s28 | Web Audio API, 432 Hz base |
| Elastic License 2.0 | s26 | No SaaS competidores, si uso personal/comercial propio |
| Anti-truncamiento: Python write | s48-s52 | Nunca Edit tool con caracteres especiales |
| Build con TS parser real | s56 | Aborta con linea:columna exacta en cualquier error sintactico |
| Overlay via CustomEvent | s50+ | PathRunner, PathsLibrary -- evita prop drilling |
| Transiciones Camino volatiles | s77 | No persisten en paths.current. Step intermedio: advance AHORA. Ultimo: snapshot local pendingComplete + advance diferido |
| Progreso del Camino solo entre pantallas | s77b | Retirada la SenderoBar sticky de s76: vive en TransitionCards (Intro/Step/Outro) + CompletionScreen, no superpuesta sobre cada ejercicio. Razon: usuario validó en runtime que la sticky se sentia invasiva |
| Labels SenderoBar: solo hitos done | s77b | Filtro `i < currentIndex` unificado en lg y CompletionScreen. Current no se etiqueta (ya esta en grande arriba en TransitionCards), pending tampoco (sin spoiler) |
| Nuevo token --focus-cta para CTA Comenzar home | s77b | Variante mas viva y calida que --focus (#506B3E claro / #8AA776 oscuro). NO usar fuera del CTA principal de Pomodoro |
| Slot horario 'anytime' como fallback (no compite con slots fijos) | s78 | getSuggestedPath: si lastViewed no aplica, primero match de slot horario (morning/midday/afternoon/evening + weekend); si no, 'anytime' (path.breath); si no, catalog[0]. lastViewed sigue ganando siempre |
| Logro master.path.all7 ("Cartografa") = cap de 1 logro nuevo por sesion | s78 | Recorre los 7 Caminos al menos una vez. Glifo heptagonal familia streak.7/streak.365. NO meter mas logros en la misma sesion para no inflar el catalogo de golpe |
| PathHydrateStep usa mismo lenguaje visual que HydrateModule home | s78 | Contador Garamond + grid vasos + 2 botones mismo peso visual (Saltar outline / Beber relleno). Vasos NO interactivos -- es step de Camino, no tracker. Refuerza opcionalidad real |
| PathFocusStep es Pomodoro CONTEXTUAL, no libre | s79 | Subtitle "Concentracion profunda" + 3 botones outline mismo peso visual (Pausar/Reset/Saltar). SIN presets de minutos (los define el Camino) + SIN puntos de ciclo (los lleva el Camino) + SIN badge tipo sesion (vive en SenderoBar). Reset NO acredita foco. CTA "Hecho" solo al completar |
| Toast: fade-out aditivo 300ms tras TOAST_DURATION_MS | s79 | Estado `exiting` boolean + `opacity` + `transition` inline. TOAST_DURATION_MS sigue controlando duracion visible, no total (3000 vis + 300 fade = 3300 total). El fade se anyade, no sustituye |
| Paleta oscura recalibrada +10% en superficies/bordes, --ink-* intactos | s79 | paper/paper-2/paper-3/line/line-2 subidos para mejorar legibilidad del texto secundario sin perder calidez nocturna. NO tocar --ink-* (rompe contraste). Si en el futuro hace falta otro recalibrado, mover en bloque -- no romper la coherencia de escalado entre paper/paper-2/paper-3 |

---

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/paths/PathRunner.jsx` | 835 | ALTA (s79: 815->835 ln por redisenio PathFocusStep; candidato split a PathCompletion + 4xPathSteps + PathRunner.parts; programado en s80) |
| `app/i18n/strings.js` | 776 | ALTA |
| `app/main.jsx` | 600 | MEDIA |
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/state-core.jsx` | ~475 | BAJA (dentro de limite) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
