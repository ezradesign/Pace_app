# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.31.0
**Ultima sesion:** #77 + #77b -- 2026-05-17 - feat(camino): PathTransitions + fix SenderoBar visible + retirada de sticky + microcopia (v0.31.0)
**Ultima actualizacion de este archivo:** 2026-05-17 - sesion 77b
**Build entregado:** `PACE_standalone.html` v0.31.0 (598 KB; 612,203 bytes) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.31.0** (s77: carga PathTransitions.jsx antes de PathRunner.jsx + titulo bump) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.31.0** (598 KB, regenerado s77b) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.31.0** (s77b: regenerado por build-standalone.js) |
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
| `app/achievements/Achievements.jsx` | Catalogo + coleccion | **v0.25.3** |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.5** (s64: overflowY:hidden en data-pyv-wrap -- fix scroll vertical) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.4** (s63: titulo marginBottom 6->4) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.28.8** (s69: isActiveDay helper + computeYearStats unifica criterio "dia activo" = focus|breath|move>0, agua sola NO cuenta) |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.28.8** (s69: WeekBarRow elimina reorder, itera data lunes-primero) |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** (nuevo s58) |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** (nuevo s58) |
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.31.0** (s77: PACE_VERSION bump; s77b: + constante TOAST_DURATION_MS=3000 exportada a window) |
| `app/state-timer.jsx` | addFocusMinutes, completePomodoro | **v0.28.8** (s69: getDayIndexMondayFirst en addFocusMinutes + checkFocusDayAchievement) |
| `app/state-hydrate.jsx` | addWaterGlass | **v0.28.8** (s69: getDayIndexMondayFirst en addWaterGlass) |
| `app/state-achievements.jsx` | unlockAchievement, detectores, complete*Session | **v0.28.8** (s69: getDayIndexMondayFirst en 4 escritores de weeklyStats + checkRetreatAchievement) |
| `app/state-paths.jsx` | Caminos CRUD + stats | **v0.29.0** (s75: getSuggestedPath refactor -> lastViewed + setLastViewedPath + startPath actualiza lastViewed) |
| `app/state-settings.jsx` | setLang | **v0.27.5** (nuevo s57) |
| `app/state.jsx` | Indice — re-export consolidado | **v0.29.0** (s75: + setLastViewedPath; s69: recompute*/getDayIndexMondayFirst/getMondayOf) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez | **v0.19.0** |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.31.0** (s77b: lee TOAST_DURATION_MS de window, fallback 3000ms; antes 5000 hardcoded) |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | **v0.28.9** (s71: PaceLogoImage invert+screen en oscuro) |
| `app/main.jsx` | Orquestador + TopBar + ActivityBar | **v0.27.0** (PathsLibrary montado s53) |
| `app/i18n/strings.js` | Strings ES + EN | **v0.31.0** (s77: + path.runner.transition.continue ES/EN) |
| `app/tokens.css` | Tokens CSS + base | **v0.31.0** (s77 + s77b: + 5 tokens transicion --path-{intro,step,outro}-ms + --path-card-{fade-ms,scale-from} + bloque .sendero-bar.lg + reglas .lg .hito-labels max-width 720 + .lg .hito-label/roman font-size 12/11 + token --focus-cta crema/oscuro + @keyframes path-orb-travel reservado; **RETIRADO**: --sendero-sticky-h, .sendero-bar.sticky y sus 4 reglas, body[data-pace-path-active], @keyframes sb-halo-fade-in) |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.26.0-alpha** |
| `app/paths/PathRunner.jsx` | Runner de caminos | **v0.31.0** (s77: maquina phase intro/step/transition/outro + pendingComplete + handleIntro/Transition/OutroDone + render dispatch por phase + CompletionScreen fadeIn 400ms; s77b: quitado useEffect data-pace-path-active + quitado render SenderoBar sticky de step phase; 660->717 ln) |
| `app/paths/PathTransitions.jsx` | Cards intro/step/outro entre pantallas del Camino | **v0.31.0** (nuevo s77, 232 ln; s77b: render SenderoBar lg sin guard typeof) |
| `app/paths/SenderoBar.jsx` | Sendero visual del progreso interno | **v0.31.0** (s77: + prop size="lg" + prop orbVisible + orbe viajero via animateMotion sobre la curva Bezier; s77b: **prop sticky retirada** + hito-labels filtran solo done (i<currentIndex) -- comportamiento unificado en lg y CompletionScreen; 148->164 ln) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.31.0** (s77b: CTA Comenzar usa var(--focus-cta) por coherencia con el Pomodoro) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.31.0** (s77b: CTA Comenzar usa var(--focus-cta)) |
| `manifest.json` | PWA manifest | **v0.28.5** (s65: reescrito -- PNGs, start_url /,  scope /, theme crema) |
| `sw.js` | Service Worker PWA | **v0.31.0** (s77: CACHE_NAME pace-v0.31.0) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.30.0_20260517.html` <- creado s77 (copia previa al rebuild, evitando el problema s76 de sobrescritura)
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
- `backups/PACE_standalone_v0.27.3_20260511.html`
- `backups/PACE_standalone_v0.27.2_20260509.html`
- `backups/PACE_standalone_v0.27.0_20260509.html` (rotado `v0.27.1b_20260509.html` segun decision s76)

---

## Ultima sesion (resumen operativo)

**Sesiones 77 + 77b - v0.31.0 - feat(camino): PathTransitions + fix SenderoBar visible + retirada de sticky + microcopia**

### Contexto

s77 cerro los tres saltos abruptos del overlay del Camino con un
modulo nuevo `PathTransitions.jsx`. Pero la validacion runtime del
usuario tras el build revelo un bug critico: la SenderoBar dentro de
las TransitionCards no era visible. s77b diagnostico la causa raiz
(guards `typeof SenderoBar === 'function'` evaluando `false` porque
`React.memo()` retorna objeto, no funcion -- bug heredado de s76 que
afectaba 3 sitios sin detectar), aplico el fix, aplico la microcopia
diferida (Toast 3000ms + CTA verde musgo apagado), y -- tras nueva
validacion runtime -- **retiro la SenderoBar sticky introducida en
s76** (se sentia invasiva sobre cada ejercicio).

Cierre unificado: s77 + s77b van en un solo commit v0.31.0. Diarios:
[s77](./docs/sessions/session-77-path-transitions.md)
+ [s77b](./docs/sessions/session-77b-fix-microcopia.md).

### Que se hizo

**Bloque s77 (PathTransitions):**
1. **NUEVO `app/paths/PathTransitions.jsx` (232 ln)**: tres exports
   (`IntroCard`, `StepIntro`, `OutroCard`) sobre `TransitionCardBase`
   privado. Entrada fade+scale (doble rAF), hold timer leyendo tokens
   CSS, salida acelerada por tap. Layout vertical: SenderoBar grande
   arriba, titulo Garamond italic clamp(36-64px), hint "toca para
   continuar". Card entera tappable.
2. **`SenderoBar.jsx`**: + prop `size="lg"` + prop `orbVisible` ->
   orbe viajero animateMotion sobre la curva Bezier (alineado
   pixel-a-pixel via `sbSegmentPath` reutilizado).
3. **`PathRunner.jsx`**: maquina `phase: intro|step|transition|outro`
   + `pendingComplete` para diferir advance final + dispatch render
   por phase + `useEffect` inicializador con margen 1.5s (al
   recargar, aterrizas en 'step' -- decision 3 volatil).
4. **`CompletionScreen`**: + prop `fadeIn` (doble rAF -> opacity 0->1
   en 400ms ease-out). Cross-fade limpio por background compartido
   `var(--paper)`.
5. **5 tokens nuevos** en tokens.css (`--path-{intro,step,outro}-ms`,
   `--path-card-{fade-ms,scale-from}`) + bloque `.sendero-bar.lg`.
6. **1 clave i18n nueva**: `path.runner.transition.continue`.
7. Bump v0.31.0 (state-core, sw.js).

**Bloque s77b (fix + microcopia + retirada sticky):**

1. **🐛 Fix raiz SenderoBar invisible (3 guards)**: quitados
   `typeof SenderoBar === 'function'` en `PathTransitions.jsx:131`,
   `PathRunner.jsx:703` (sticky en step phase) y
   `PathRunner.jsx:202` (CompletionScreen). React.memo retorna
   objeto, no funcion -- el guard bloqueaba el render. Los 3 sitios
   probablemente llevaban rotos desde s76 sin que nadie lo notara
   porque la validacion runtime quedo pendiente.
2. **Toast 3000ms**: nueva constante `TOAST_DURATION_MS = 3000` en
   `state-core.jsx`, exportada a window. `Toast.jsx` la lee con
   fallback a 3000 (antes 5000ms hardcoded).
3. **CTAs "Comenzar" -> verde musgo apagado** (3 botones unificados):
   nuevo token `--focus-cta: #506B3E` (crema) / `#8AA776` (oscuro)
   en `tokens.css`. Usado en:
   - `FocusTimer.jsx` startBtnPrimary (CTA Pomodoro home).
   - `SuggestedPathCard.jsx` (CTA Camino sugerido del home).
   - `PathsLibrary.jsx` (CTA cada Camino en el overlay biblioteca).
   El "Repetir camino" del CompletionScreen se mantiene en `var(--ink)`
   (accion secundaria). Tres opciones mostradas en chat
   (Medio / Calido / Profundo); usuario eligio Medio.
4. **RETIRADA SenderoBar sticky (inversion del feature s76)**:
   - `PathRunner.jsx`: quitado render `<SenderoBar ... sticky />` en
     phase==='step' + quitado `useEffect` que toggleaba
     `body[data-pace-path-active]`.
   - `SenderoBar.jsx`: prop `sticky` retirada de la firma y className.
   - `tokens.css`: eliminados token `--sendero-sticky-h`, bloque
     `.sendero-bar.sticky` (5 reglas), selectores
     `body[data-pace-path-active]` (2 reglas).
5. **Labels (kind + romano) en TransitionCards**: en
   `SenderoBar.jsx`, el `hito-labels` cambia de
   `{!sticky && !isLarge && (...)}` a `{currentIndex > 0 && (...)}`
   con filtro interno `i >= currentIndex -> return null`. Una sola
   regla unificada: solo done. IntroCard sin labels (currentIndex=0),
   StepIntro N labels, OutroCard/CompletionScreen todas.
6. **CSS labels en lg**: nuevas reglas en `tokens.css`:
   `.lg .hito-labels { max-width: 720px }` (alinear con wrap del SVG)
   + `.lg .hito-label { font-size: 12px }` +
   `.lg .hito-roman { font-size: 11px }` (legibilidad en card grande).
7. **Halo dinamico SenderoBar (probado y revertido)**: durante s77b
   se anyadio `@keyframes sb-halo-fade-in` + className
   `sendero-halo-current` + key compuesta para forzar remount al
   saltar de hito. Eliminado en el mismo s77b al quedar como dead
   code tras retirar la sticky (excluido en .lg, sin escenario en
   CompletionScreen).

### Asimetria documentada (decision 3 -- s77)

Step intermedio: `advancePathStep` AHORA -> cur.stepIndex se persiste
antes de la card. Al recargar, aterrizas en step destino.

Ultimo step: snapshot en `pendingComplete` (estado local), advance
diferido a `handleOutroDone`. Al recargar durante OutroCard, aterrizas
en el ultimo step. El edge case requiere recargar en ventana de 1.5s
y la complejidad de mantener un "limbo" persistido es desproporcionada.

### Validacion runtime usuario (s77b)

- ✅ TransitionCards: SenderoBar visible entre pantallas (Intro/Step/
  Outro). El usuario confirmo en runtime ("ahora se ve entre
  pantallas").
- ✅ Step phase sin sticky superior (decision del usuario tras ver la
  sticky en runtime).
- ⏳ Capturas A/B/C/G + decisiones s77 (skip 1 StepIntro, recarga
  durante StepIntro, tooltip `<title>`, consola limpia, Toast 3000ms,
  CTA verde musgo): el usuario procedera al commit/push directo --
  validacion completa se asume aceptada.

### Build

- Bundle: **598 KB** (612,203 bytes). -2,300 bytes vs s77 inicial por
  dead code limpio de la sticky retirada.
- 43 archivos validados (sin cambios vs s77).
- `index.html` byte-a-byte identico a `PACE_standalone.html`.
- Backup: `backups/PACE_standalone_v0.30.0_20260517.html` (creado en
  s77 ANTES del build). Sin rotacion adicional en s77b -- misma
  version v0.31.0.

### Roadmap UX overlay Camino (s75->s76->s77->s77b COMPLETADOS)

✅ s75 -- SenderoBar hibrido + sendero implementacion.
✅ s76 -- Arquitectura overlay: TimerDial compartido + SenderoBar
   sticky persistente + CompletionScreen rica.
✅ s77 -- PathTransitions: IntroCard + StepIntro + OutroCard +
   cross-fade.
✅ s77b -- Fix SenderoBar visible + microcopia (Toast 3s + CTA verde
   musgo) + **retirada de sticky** (decision del usuario tras runtime).

## Proxima sesion -- s78 (Catalogo Caminos)

### Scope propuesto

1. **Crear 2 Caminos faltantes** para llevar el catalogo de 5 -> 7:
   - `path.tea` -- Te sin Azucar / Plain Tea: reenganche tras pausa
     (kinds candidatos: breathe ligero + hidratate + 1 micro-focus).
   - `path.breath` -- Halito / Breath: micropausa corta (2-3 pasos
     breathe centricos, sin focus ni body).
2. **Revisar selector inferior Caminos**: `SuggestedPathCard`
   (logica de sugerencia con catalogo ampliado) y `PathsLibrary`
   (overlay biblioteca -- layout con 7 caminos vs 5 actuales, scroll
   o grid?).
3. Definir nameKey + tagline ES/EN + horario sugerido por Camino.
4. Anyadir entradas a `paths.history` si se incorpora a stats anuales.

### Precondicion bloqueante

Cierre Git de s77+s77b publicado por el usuario (commit + push
manual).

### Decisiones pendientes para el prompt s78

- ¿`path.tea` lleva un `breathe` o un `extra` (estira corto)?
- ¿`path.breath` reusa rutinas existentes (sphere/box/coherent) o
  introduce una nueva muy corta (3 min, 4-4-4-4)?
- ¿Horarios sugeridos -- algun slot del dia donde encajen mejor?
- ¿Algun logro `master.path.X` ligado a completar todos los 7?

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

---

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/paths/PathRunner.jsx` | 717 | ALTA (s77/s77b: 660->717 ln, candidato split a PathCompletion + PathSteps) |
| `app/i18n/strings.js` | 776 | ALTA |
| `app/main.jsx` | 600 | MEDIA |
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/state-core.jsx` | ~475 | BAJA (dentro de limite) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
