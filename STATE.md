# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.33.0
**Ultima sesion:** #80 -- 2026-05-18 - refactor(paths): split PathRunner.jsx en steps/ (Breathe/Focus/Hydrate/Body) -- 835 ln -> 244 ln (-71%) + contrato uniforme `(step, onExit(reason))` + `_shared.js` btnTypography/btnOutline (v0.33.0)
**Ultima actualizacion de este archivo:** 2026-05-18 - sesion 80
**Build entregado:** `PACE_standalone.html` v0.33.0 (610 KB; 624,539 bytes) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.33.0** (s80: 7 nuevos `<script src>` para el split + titulo bump) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.33.0** (610 KB, regenerado s80) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.33.0** (s80: regenerado por build-standalone.js) |
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
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.33.0** (s80: PACE_VERSION bump; s77b: + constante TOAST_DURATION_MS=3000 exportada a window) |
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
| `app/paths/PathRunner.jsx` | Runner de caminos -- SOLO orquestador (maquina de fases + dispatcher) | **v0.33.0** (s80: split, 835->244 ln, -71%; useRef removido del destructure; dispatcher PathHydrateStep uniformado a step/onExit) |
| `app/paths/PathRunner.parts.jsx` | PathTopBar + ExitConfirmModal + StepError (chrome del overlay) | **v0.33.0** (nuevo s80, 131 ln) |
| `app/paths/CompletionScreen.jsx` | Pantalla de Camino completado (SenderoBar 100% + recorrido + logros) | **v0.33.0** (nuevo s80, 206 ln, extraido literal de PathRunner.jsx; CS_ROMAN local) |
| `app/paths/steps/_shared.js` | window.pathStepStyles = { btnTypography, btnOutline } | **v0.33.0** (nuevo s80, 23 ln) |
| `app/paths/steps/PathBreatheStep.jsx` | Step Respira + SafetyGate | **v0.33.0** (nuevo s80, 32 ln) |
| `app/paths/steps/PathFocusStep.jsx` | Step Foco (Pomodoro contextual de Camino) | **v0.33.0** (nuevo s80, 118 ln; compone btnBase desde _shared.js + padding 22; logica s79 intacta) |
| `app/paths/steps/PathHydrateStep.jsx` | Step Hidratacion | **v0.33.0** (nuevo s80, 113 ln; compone btnBase desde _shared.js + padding 28; firma uniformada a (step, onExit)) |
| `app/paths/steps/PathBodyStep.jsx` | Step Cuerpo (dispatcher Move/Extra via resolveBodyRoutine) | **v0.33.0** (nuevo s80, 16 ln) |
| `app/paths/PathTransitions.jsx` | Cards intro/step/outro entre pantallas del Camino | **v0.31.0** (nuevo s77, 232 ln; s77b: render SenderoBar lg sin guard typeof) |
| `app/paths/SenderoBar.jsx` | Sendero visual del progreso interno | **v0.31.0** (s77: + prop size="lg" + prop orbVisible + orbe viajero via animateMotion sobre la curva Bezier; s77b: **prop sticky retirada** + hito-labels filtran solo done (i<currentIndex) -- comportamiento unificado en lg y CompletionScreen; 148->164 ln) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.31.0** (s77b: CTA Comenzar usa var(--focus-cta) por coherencia con el Pomodoro) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.31.0** (s77b: CTA Comenzar usa var(--focus-cta)) |
| `manifest.json` | PWA manifest | **v0.28.5** (s65: reescrito -- PNGs, start_url /,  scope /, theme crema) |
| `sw.js` | Service Worker PWA | **v0.33.0** (s80: CACHE_NAME pace-v0.33.0) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.32.1_20260518.html` <- creado s80 (copia pristina restaurada desde HEAD previa al rebuild v0.33.0)
- `backups/PACE_standalone_v0.32.0_20260518.html`
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
- `backups/PACE_standalone_v0.27.5_20260511.html` (rotado `v0.27.3_20260511.html` en s80 para mantener cap de 20)

---

## Ultima sesion (resumen operativo)

**Sesion 80 - v0.33.0 - refactor(paths): split PathRunner.jsx en steps/ (Breathe/Focus/Hydrate/Body)**

### Contexto

PathRunner.jsx llevaba marcada como deuda ALTA desde varias sesiones
(835 ln tras el redisenio de s79). s80 ejecuta el split tecnico
programado: refactor puro, cero cambios funcionales/visuales/timing/copy.

Diario: [s80](./docs/sessions/session-80-split-pathrunner.md). Documentos
de apoyo: [audit](./docs/sessions/session-80-audit.md),
[design](./docs/sessions/session-80-design.md),
[regression-check](./docs/sessions/session-80-regression-check.md).

### Que se hizo

1. **Auditoria estructural previa** detallada (28 invariantes listadas).
   Detecta 2 discrepancias con el prompt:
   - "5 steps (Move + Stretch)" en el prompt vs 4 kinds reales en el
     catalogo (`PathBodyStep` dispatcher resuelve a Move/Extra via
     `resolveBodyRoutine`).
   - Para cumplir metrica PathRunner.jsx <=280 ln hay que extraer
     tambien chrome (TopBar + ExitModal + StepError), no solo Steps.
2. **Diseño del contrato uniforme** `(step, onExit(reason))` --
   rechaza el contrato amplio del prompt (block/onAbort/pathContext)
   como premature abstraction.
3. **Implementacion mecanica** en orden incremental (sin romper el repo
   en ningun paso intermedio):
   - `app/paths/steps/_shared.js` (23 ln) -- btnTypography + btnOutline.
   - `app/paths/steps/PathBreatheStep.jsx` (32 ln) -- + SafetyGate.
   - `app/paths/steps/PathFocusStep.jsx` (118 ln).
   - `app/paths/steps/PathHydrateStep.jsx` (113 ln) -- contrato uniformado.
   - `app/paths/steps/PathBodyStep.jsx` (16 ln) -- dispatcher.
   - `app/paths/PathRunner.parts.jsx` (131 ln) -- chrome del overlay.
   - `app/paths/CompletionScreen.jsx` (206 ln) -- pantalla terminal.
   - `PACE.html` -- 7 nuevos `<script src>` en orden correcto.
   - Verificacion intermedia (tras paso 5, antes de reducir
     PathRunner.jsx): parser TS pasa, scope-isolation confirmado.
   - `PathRunner.jsx` reducido de 835 a 244 ln (solo orquestador +
     dispatcher). Dispatcher PathHydrateStep uniformado.
4. **Verificacion runtime** via preview local (Node mini-HTTP en
   `.claude/`): home pixel-a-pixel identico, app carga limpia (0
   errores), `startPath('path.midday')` -> PathHydrateStep monta con
   contrato nuevo, Beber incrementa water + avanza, Skip no toca water,
   reload mid-Camino rehidrata estado correctamente.
5. **Bump v0.33.0** (state-core, PACE.html, sw.js) + restore pristino
   v0.32.1 antes del backup + rebuild.

### Decisiones tomadas

- D1 -- **Mantener `PathBodyStep` como dispatcher** (no `PathMoveStep` /
  `PathStretchStep`). Dividir requeriria cambiar catalogo + migrar
  localStorage = cambio de comportamiento.
- D2 -- **Extender split a `PathRunner.parts.jsx`** (TopBar +
  ExitConfirmModal + StepError). Necesario para PathRunner.jsx <=280 ln.
- D3 -- **Contrato uniforme `(step, onExit(reason))`** -- no el amplio
  del prompt. 3/4 Steps ya usaban onExit; solo PathHydrateStep rompia.
- D4 -- **`_shared.js` solo btnTypography + btnOutline, padding por
  Step**. Focus usa 22px, Hydrate usa 28px; coherencia falsa forzarlo.
- D5 -- **`CS_ROMAN` queda local en CompletionScreen.jsx**. Decision
  s79: no extraer hasta 3 consumidores. El split no añade ninguno.
- D6 -- **useRef removido del destructure de React en PathRunner.jsx**:
  el orquestador post-split ya no usa refs (migradas a PathFocusStep
  como useRefFS).
- D7 -- **`.claude/launch.json` + `.claude/static-server.js`**: mini
  servidor estatico Node sin deps para preview local. Util para
  regresion runtime en futuras sesiones sin depender del browser del
  usuario.
- D8 -- **Restaurar pristino v0.32.1 desde HEAD antes del backup**.
  El build de verificacion intermedia sobreescribio el bundle;
  `git checkout HEAD -- PACE_standalone.html index.html` garantiza que
  el backup sea pristino.

### Build

- Bundle: **610 KB** (624,539 bytes; +3,093 bytes vs v0.32.1 = 621,446).
  Crecimiento esperado por boilerplate de 7 archivos nuevos (cabeceras
  + IIFE wrappers + Object.assign).
- 50 archivos validados (43 anteriores + 7 nuevos del split).
- `index.html` byte-a-byte identico a `PACE_standalone.html`.
- SHA-256:
  `d2c66c6c494f78a7f1c49c489d86e44ad34421635112c6e9f8413e50c231d61b`.
- Backup creado: `backups/PACE_standalone_v0.32.1_20260518.html`
  (607 KB, pristino restaurado desde HEAD). Rotado el mas antiguo:
  `v0.27.3_20260511.html`.

### Validacion runtime usuario

Cubierta principalmente por preview local (Morning Glory + Hierbabuena
con Beber/Skip + reload). Quedan pendientes de inspeccion manual:
los 5 Caminos no testeados live (afternoon, tea, dusk, weekend, breath
-- usan mismo dispatcher por kind, riesgo minimo); PathFocusStep credit
logic completa (verificada estaticamente); inspeccion visual del halo
de SenderoBar avanzando entre bloques.

## Proxima sesion -- s81 (sin scope fijo)

s80 cierra la deuda ALTA mas grande (PathRunner.jsx). Candidatos para
s81 segun deuda actual:

1. **`app/i18n/strings.js`** (776 ln, ALTA): split por dominio
   (focus/breathe/move/extra/hydrate/paths/achievements/ui).
2. **`app/main.jsx`** (600 ln, MEDIA): orquestador + TopBar +
   ActivityBar. Candidato a extraer ActivityBar a `app/main/ActivityBar.jsx`.
3. **`app/achievements/Achievements.jsx`** (~500 ln, MEDIA): catalogo
   + coleccion + preview. Catalogo a `app/achievements/catalog.js`.
4. **Catalog split Move/Stretch**: si se quiere diferenciar en catalogo
   (`kind: 'move' | 'stretch'` en vez de `'body'`). Trivial ahora con
   `steps/` ya extraido.

### Precondicion bloqueante

Cierre Git de s80 publicado por el usuario (commit + push manual).

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
| PathRunner.jsx splittado en `steps/` + `PathRunner.parts.jsx` + `CompletionScreen.jsx` | s80 | Steps son hojas puras (props in, callback out). Contrato uniforme `(step, onExit(reason))`. Si en el futuro un Step necesita disparar `abandonPath`, añadir `onAbort` como segundo callback opcional -- no forzarlo en todos los Steps si solo uno lo necesita |
| Estilos comunes entre Steps via `window.pathStepStyles` | s80 | `btnTypography` (6 keys) + `btnOutline` (4 keys) deduplicados. Padding por Step (Focus 22px, Hydrate 28px). Si aparece tercer Step con tipografia outline, mantener; si el padding tambien converge, parametrizar |
| PathBodyStep dispatcher (kind:'body' resuelve Move/Extra via resolveBodyRoutine), NO PathMoveStep + PathStretchStep separados | s80 | Splittear a nivel archivo seria solo cosmetico mientras el catalogo siga usando `kind:'body'`. Si se quiere diferenciar, cambiar catalogo + crear los dos Steps especificos -- bajo coste ahora con `steps/` ya extraido |

---

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/i18n/strings.js` | 776 | ALTA |
| `app/main.jsx` | 600 | MEDIA |
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/state-core.jsx` | ~475 | BAJA (dentro de limite) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
| `app/paths/PathRunner.jsx` | 244 | SALE (s80, antes 835 -- split en steps/ + parts + CompletionScreen) |
