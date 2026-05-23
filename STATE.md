# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.33.2
**Ultima sesion:** #82 -- 2026-05-23 - refactor(main): split `app/main.jsx` (600 ln) en `app/main/` -- variante B equilibrada (3 archivos: `_responsive.js` + `TopBar.jsx` + `ActivityBar.jsx`). PaceApp queda intacto como orquestador puro (279 ln, -53%). Tercer split mecanico consecutivo tras s80 (PathRunner) y s81 (strings) -- patron `app/<carpeta>/` consolidado
**Ultima actualizacion de este archivo:** 2026-05-23 - sesion 82
**Build entregado:** `PACE_standalone.html` v0.33.2 (617 KB; 632,064 bytes) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.33.2** (s82: bloque shell con 3 nuevos `<script src>` antes de main.jsx -- `_responsive.js` + `TopBar.jsx` + `ActivityBar.jsx` + comentario explicativo del orden + titulo bump) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.33.2** (617 KB, regenerado s82) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.33.2** (s82: regenerado por build-standalone.js) |
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
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.33.2** (s82: PACE_VERSION bump; s81: idem bump; s77b: + constante TOAST_DURATION_MS=3000 exportada a window) |
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
| `app/main.jsx` | Orquestador puro (composicion + state + handlers + JSX root) | **v0.33.2** (s82: split mecanico variante B, 600 ln -> 279 ln, -53% -- TopBar/ActivityBar/CSS responsive a `app/main/`) |
| `app/main/_responsive.js` | IIFE: inyecta `<style id="pace-main-responsive-css">` con reglas @media globales (TopBar, ActivityBar, main content, sidebar handle, fallback vh/dvh) | **v0.33.2** (nuevo s82, 105 ln; literal de main.jsx 20-112) |
| `app/main/TopBar.jsx` | Tabs Foco/Pausa/Larga + 3 iconos top-right (Stats prop / Logros CustomEvent / Tweaks prop) + topBarStyles | **v0.33.2** (nuevo s82, 106 ln) |
| `app/main/ActivityBar.jsx` | 4 chips Respira/Estira/Mueve/Hidratate + 4 iconos SVG inline (ABBreathe/ABStretch/ABMove/ABDrop) + responsive grid | **v0.33.2** (nuevo s82, 170 ln) |
| `app/i18n/strings/_bootstrap.js` | Crea window.PACE_STRINGS = { es:{}, en:{} } vacio | **v0.33.1** (nuevo s81, 15 ln) |
| `app/i18n/strings/ui.js` | i18n shell UI: welcome + support + sidebar + topbar + activity + settings + tweaks + break + welcome lang toggle | **v0.33.1** (nuevo s81, 315 ln; 134 ES + 134 EN) |
| `app/i18n/strings/sessions.js` | i18n actividades vivas: session + common + lib + focus + breathe (phases/sesion/safety) + lib breathe/move/extra + move + hydrate | **v0.33.1** (nuevo s81, 227 ln; 93 ES + 93 EN) |
| `app/i18n/strings/paths.js` | i18n Caminos: path runner + names + kind + library + suggested + hydrate + error + card | **v0.33.1** (nuevo s81, 122 ln; 47 ES + 47 EN) |
| `app/i18n/strings/stats.js` | i18n panel Ritmo: stats base + tabs + heatmap mensual + vista anual + caminos | **v0.33.1** (nuevo s81, 108 ln; 42 ES + 42 EN) |
| `app/i18n/strings/achievements.js` | i18n catalogo de logros: ach.cat/seal/toast | **v0.33.1** (nuevo s81, 40 ln; 16 ES + 16 EN) |
| `app/i18n/strings-content.js` | Patch EN final de contenido (rutinas Move/Breathe/Extra) | **v0.18.0** (s81: SIN CAMBIOS pero queda al final de la cadena i18n -- preserva override silencioso de 3 keys breathe.phase.*) |
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
| `sw.js` | Service Worker PWA | **v0.33.2** (s82: CACHE_NAME pace-v0.33.2) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.33.1_20260523.html` <- creado s82 (copia del v0.33.1 publicado en s81)
- `backups/PACE_standalone_v0.33.0_20260519.html` <- creado s81
- `backups/PACE_standalone_v0.32.1_20260518.html` <- creado s80
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

Nota s82: cap 20 mantenido rotando el mas antiguo (`v0.27.6_20260511.html`)
al crear el backup del v0.33.1 publicado en s81.

---

## Ultima sesion (resumen operativo)

**Sesion 82 - v0.33.2 - refactor(main): split `app/main.jsx` (600 ln) en `app/main/` (variante B equilibrada: _responsive.js + TopBar.jsx + ActivityBar.jsx). PaceApp intacto como orquestador puro (279 ln, -53%).**

### Contexto

s82 toma el siguiente candidato MEDIO de deuda que s81 dejo en cola:
`app/main.jsx` (600 ln). Tercera sesion consecutiva de split mecanico
tras s80 (PathRunner) y s81 (strings.js). El patron `app/<carpeta>/` ya
es convencion en el codebase.

Auditoria detecta cero acoplamientos problematicos: `TopBar` y
`ActivityBar` son hijos puros sin consumidor externo. El bloque CSS
responsive es global por design.

Diario: [s82](./docs/sessions/session-82-main-split.md). Documentos de
apoyo: [audit](./docs/sessions/session-82-audit.md),
[design](./docs/sessions/session-82-design.md).

### Que se hizo

1. **Tarea 0 -- precondiciones**: 7/7 OK. git limpio, version coherente,
   standalone v0.33.1 carga limpia en preview, main.jsx = 600 ln exactas.
2. **Tarea 1 -- auditoria** ([session-82-audit.md](./docs/sessions/session-82-audit.md)):
   tabla de 10 secciones, 29 invariantes numeradas, 17 edge cases, 5
   deudas semanticas detectadas (NO arregladas: scope = split puro).
3. **Tarea 2 -- design con 3 variantes** ([session-82-design.md](./docs/sessions/session-82-design.md)):
   - **A** Minima: solo ActivityBar -> 459 ln (-24%). NO cumple metrica.
   - **B** Equilibrada (aprobada): `_responsive.js` + TopBar + ActivityBar
     -> 255 ln estimado (-57%). PaceApp intacto.
   - **C** Maximalista: B + 2 hooks (overlay/keyboard) -> 180 ln (-70%).
     Premature abstraction (1 consumidor).
   Usuario delega: "la que sea mas profesional". Agente elige **B** --
   cumple metrica + respeta principio "no premature abstraction" del
   codebase + coherente con s80/s81.
4. **Tarea 3 -- implementacion mecanica**:
   - Crear `app/main/_responsive.js` (105 ln; IIFE inyecta `<style>` global).
   - Crear `app/main/TopBar.jsx` (106 ln; TopBar + topBarStyles).
   - Crear `app/main/ActivityBar.jsx` (170 ln; ActivityBar + 4 iconos AB*).
   - Editar PACE.html: +3 `<script src>` antes de main.jsx + comentario.
   - **Verificacion intermedia** (3 archivos cargados, main.jsx aun sin
     tocar): TopBar/ActivityBar definidos dos veces; ultimo gana (idempotente
     por copia literal). Consola 0 errores. ✓
   - Reescribir main.jsx (600 -> 279 ln, -53%; literal copia de PaceApp
     intacto, sin tocar logica).
5. **Tarea 4 -- verificacion** (16 invariantes runtime):
   - 4.1 TopBar: tabs (focusMode larga/foco), 3 iconos (Stats prop, Logros
     CustomEvent, Tweaks prop), i18n ES<->EN -> tabs/aria/chips actualizan.
   - 4.2 ActivityBar: 4 chips -> abren BreatheLibrary/ExtraLibrary/
     MoveLibrary/HydrateTracker. i18n correcto.
   - 4.3 Overlays + atajos + cowClicks + recarga: S/T/L toggle, cowClicks
     -> secret.cow.click unlock, PathsLibrary CustomEvent abre, focusMode
     'larga' sobrevive recarga.
   - 4.4 Edge cases: T+INPUT skip, guard CSS no duplica, fallback dvh
     intacto, mobile <=768px tabs ocultos.
   - Console errors a lo largo de todo el ciclo: **cero**.
6. **Tarea 6 -- versionado y build**:
   - Backup `backups/PACE_standalone_v0.33.1_20260523.html` (copia del
     v0.33.1 publicado). Cap 20 mantenido (rotado v0.27.6_20260511.html).
   - Bump (state-core, PACE.html, sw.js) -> v0.33.2.
   - Rebuild: bundle **617 KB (632,064 bytes; +3,138 vs v0.33.1)**.
     SHA-256: `66455A34...387EFD`. `index.html` byte-perfect.
   - 58 archivos validados (10 .js + 48 .jsx; antes 55 = +3 nuevos).
7. **Tarea 7 -- documentacion**: audit + design + diario s82 + CHANGELOG
   (degradacion de v0.33.0 a fila-de-enlace, detalle nuevo de v0.33.2)
   + STATE.md (este archivo).

### Decisiones tomadas

- D1 -- **Variante B aprobada** (3 archivos: `_responsive.js` + TopBar +
  ActivityBar). No A (no cumple metrica) ni C (premature abstraction).
- D2 -- **Carpeta `app/main/`** coherente con `app/paths/steps/` (s80) y
  `app/i18n/strings/` (s81). Tercer split mecanico con el mismo patron.
- D3 -- **CSS responsive a `_responsive.js` IIFE**, no inline en
  TopBar/ActivityBar. El `<style>` toca selectores de AMBOS componentes
  + main + sidebar handle. Es config global, no de un componente.
- D4 -- **`topBarStyles` con TopBar.jsx; 4 iconos AB* con ActivityBar.jsx**.
  Cada uno tiene 1 unico consumidor (verificado por Grep). Cohesion.
- D5 -- **NO extraer hooks** (variante C descartada). 1 consumidor hoy.
  Reconsiderar si llega un segundo entry point (p.ej. EmbedApp).
- D6 -- **`Object.assign(window, { TopBar, ActivityBar })` preservado**
  desde sus archivos respectivos. Sin consumidor externo, pero
  estabilidad de superficie publica. Mantener.
- D7 -- **Arranque directo `#pace-root` preservado**. Legacy v0.12, cero
  coste, removerlo abre debate -- fuera de scope.
- D8 -- **`build-standalone.js` sin cambios**. `validateAppFiles` walkea
  recursivo. 3 nuevos archivos se descubren automatico.

### Build

- Bundle: **617 KB** (632,064 bytes; +3,138 bytes vs v0.33.1 = 628,926,
  +0.5%). Crecimiento por cabeceras de doc-comment de 3 archivos nuevos
  + 2 `Object.assign` + comentarios preservados. Estimado en design:
  +1-2 KB; real: +3 KB (cabeceras mas extensas).
- 58 archivos validados (10 .js + 48 .jsx).
- `index.html` byte-a-byte identico a `PACE_standalone.html`.
- SHA-256: `66455A340EBC492CBA07F65FDBE7994345F51A77679091CCFEFF32576F387EFD`.
- Backup creado: `backups/PACE_standalone_v0.33.1_20260523.html` (614 KB).

### Validacion runtime usuario

Cubierta integramente por preview local (`.claude/static-server.js`
heredado de s80) en `localhost:8765`. **16/16 invariantes verificadas**:
TopBar, ActivityBar, atajos, cowClicks, PathsLibrary, persistencia,
edge cases mobile/INPUT/dvh/guard. Console errors: cero. Pendiente de
inspeccion manual visual: confirmar pixel-a-pixel que el shell se ve
igual que en v0.33.1 (riesgo minimo, refactor mecanico sin cambios
de CSS visible).

## Proxima sesion -- s83 (sin scope fijo)

s82 cierra el split de main.jsx (deuda MEDIA del backlog s81). Candidatos
para s83:

1. **`app/achievements/Achievements.jsx`** (~500 ln, MEDIA): catalogo +
   coleccion + preview. Catalogo a `app/achievements/catalog.js`. Siguiente
   candidato natural -- mismo patron de split mecanico aplicable.
2. **Catalog split Move/Stretch**: si se quiere diferenciar en catalogo
   (`kind: 'move' | 'stretch'` en vez de `'body'`). Trivial ahora con
   `steps/` ya extraido.
3. **Consolidar deudas semanticas i18n** D-1 (override Ocean vs Oceanic),
   D-2 (duplicidad "Hecho hoy"), D-3 (namespace path/paths) detectadas
   en audit s81.
4. **`scripts/check-session.ps1`** -- actualizar rango de tamaño
   (530-600 KB desactualizado; real 605-617 KB). Bajo coste.
5. **Variante C hooks de s82** -- solo si llega un segundo entry point
   que reutilice `useOverlayManager` / `useGlobalKeyboard`. Hoy no aporta.

### Precondicion bloqueante

Cierre Git de s82 publicado por el usuario (commit + push manual).

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
| i18n splittado en `app/i18n/strings/` con bootstrap explicito + 5 dominios | s81 | `_bootstrap.js` crea `window.PACE_STRINGS = { es:{}, en:{} }` vacio. Cinco archivos hijos (ui/sessions/paths/stats/achievements) hacen `Object.assign(PACE_STRINGS.{es,en}, {...})`. `strings-content.js` (s38) sigue cargando al final preservando el override silencioso de 3 keys `breathe.phase.*`. Si en el futuro se anyaden idiomas, ampliar el bootstrap y patch en los 5 archivos. Si se anyade un dominio nuevo grande, archivo propio bajo `strings/`; si es pequeño (<=10 keys), agruparlo con dominio padre |
| ES y EN en mismo archivo del split (no separar por idioma) | s81 | Siempre se actualizan en paralelo. Separar `welcome-es.js` + `welcome-en.js` duplicaria archivos sin beneficio. Si en el futuro se anyade un tercer idioma, evaluar; con 2 idiomas no merece la pena |
| Override silencioso strings-content.js sobre 3 keys breathe.phase.* (deuda explicita D-1) | s81 | `strings-content.js` redefine `inhala.mas` ("Inhale again" vs "Inhale more"), `inhala.oceanica` ("Oceanic" vs "Ocean") y `exhala.oceanica` (idem) con valores distintos al split. No consolidado en s81 (debate de copy). Decision futura: consolidar valores o mover los 11 duplicados a sessions.js y dejar strings-content.js solo con keys unicas |
| `app/main.jsx` splittado en `app/main/` (variante B equilibrada) | s82 | Tres archivos hijos: `_responsive.js` (IIFE, inyecta `<style>` global con guard), `TopBar.jsx` (tabs + 3 iconos + topBarStyles + window expose), `ActivityBar.jsx` (4 chips + 4 iconos AB* inline + window expose). PaceApp queda intacto en main.jsx como orquestador puro (state local + handlers + JSX). Si en el futuro hay un segundo entry point que comparta logica de overlays/atajos, evaluar variante C (hooks `useOverlayManager` + `useGlobalKeyboard`). Hasta entonces es premature abstraction. `topBarStyles` y los 4 iconos AB* viajan cada uno con su unico consumidor (cohesion sobre extraccion temprana) |
| CSS responsive global del shell vive en `app/main/_responsive.js` (IIFE) | s82 | El bloque `<style id="pace-main-responsive-css">` toca selectores de TopBar + ActivityBar + main content + sidebar handle + fallback vh/dvh. Es config global de layout, NO de un componente. Patron `_` prefix coherente con `_shared.js` (s80) y `_bootstrap.js` (s81). Guard `getElementById` impide doble inyeccion. No expone nada a window: side effect del modulo |
| `Object.assign(window, { TopBar, ActivityBar })` preservado tras split | s82 | Ningun consumidor externo los usa hoy (verificado por Grep), pero se preserva por estabilidad de superficie publica. Removerlo abriria debate; mantenerlo cuesta cero |

---

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/state-core.jsx` | ~475 | BAJA (dentro de limite) |
| `app/i18n/strings/ui.js` | 315 | BAJA (dentro de limite, dominio mas grande del split) |
| `app/main.jsx` | 279 | SALE (s82, antes 600 -- split en main/_responsive + TopBar + ActivityBar) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
| `app/paths/PathRunner.jsx` | 244 | SALE (s80, antes 835 -- split en steps/ + parts + CompletionScreen) |
| `app/i18n/strings.js` | -- | SALE (s81, antes 791 -- split en strings/_bootstrap + ui + sessions + paths + stats + achievements) |

### Deudas semanticas (no de tamaño, no urgentes)

| Item | Detectado en | Detalle |
|---|---|---|
| D-1 override silencioso strings-content.js | s81 audit | 3 keys `breathe.phase.*` con valores distintos (Inhale again vs more; Oceanic vs Ocean). 8 keys mas duplicadas pero coincidentes. Decision futura |
| D-2 duplicidad "Hecho hoy" | s81 audit | `path.card.done` + `paths.library.doneToday` mismo valor, dos keys. Consolidar a una |
| D-3 namespaces path / paths inconsistentes | s81 audit (existente desde s53) | Singular `path.*` (runner, hydrate, card, error) + plural `paths.*` (library, suggested, path, kind, runner.repeat). Mezcla historica |
