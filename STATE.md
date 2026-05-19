# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.33.1
**Ultima sesion:** #81 -- 2026-05-19 - refactor(i18n): split `app/i18n/strings.js` (791 ln, 664 keys) en `app/i18n/strings/` -- variante B pragmatica (6 archivos: _bootstrap + ui + sessions + paths + stats + achievements). Scope reorientado desde el prompt original (transiciones del Camino ya existian desde s77) al candidato de deuda ALTA que s80 dejo en cola (v0.33.1)
**Ultima actualizacion de este archivo:** 2026-05-19 - sesion 81
**Build entregado:** `PACE_standalone.html` v0.33.1 (614 KB; 628,926 bytes) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.33.1** (s81: bloque i18n de 3 a 8 `<script src>` por split de strings -- _bootstrap + ui + sessions + paths + stats + achievements + strings-content + useT + titulo bump) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.33.1** (614 KB, regenerado s81) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.33.1** (s81: regenerado por build-standalone.js) |
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
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.33.1** (s81: PACE_VERSION bump; s80: idem bump; s77b: + constante TOAST_DURATION_MS=3000 exportada a window) |
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
| `sw.js` | Service Worker PWA | **v0.33.1** (s81: CACHE_NAME pace-v0.33.1) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.33.0_20260519.html` <- creado s81 (copia pristina restaurada desde HEAD previa al rebuild v0.33.1)
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
- `backups/PACE_standalone_v0.27.6_20260511.html`

Nota s81: `v0.27.5_20260511.html` no existia fisicamente en el filesystem
cuando se intento rotar (STATE.md previo lo listaba); cap 20 se mantiene
con el alta de `v0.33.0_20260519.html` sin necesidad de rotar.

---

## Ultima sesion (resumen operativo)

**Sesion 81 - v0.33.1 - refactor(i18n): split `app/i18n/strings.js` (791 ln) en `app/i18n/strings/` (variante B pragmatica: _bootstrap + 5 dominios)**

### Contexto

El prompt original de s81 pedia **transiciones contemplativas** entre
Steps del Camino (IntroCard/StepIntro/OutroCard + halo SenderoBar).
Auditoria de precondiciones (Tarea 0) detecta que **toda esa
infraestructura ya existia completa desde s77**: `PathTransitions.jsx`
con `IntroCard`/`StepIntro`/`OutroCard` (252 ln, ya en window), state
machine `intro/step/transition/outro` integrada en PathRunner.jsx,
tokens `--path-intro-ms/--path-step-ms/--path-outro-ms/--path-card-fade-ms`
en tokens.css, y `path.runner.transition.continue` ES/EN en strings.

Reporte al usuario con 4 opciones de scope alternativo. Elige **"Cambiar
scope a otro candidato s80"**, luego **"Split strings.js (ALTA deuda)"**
de los 4 candidatos del backlog.

Diario: [s81](./docs/sessions/session-81-strings-split.md). Documentos de
apoyo: [audit](./docs/sessions/session-81-audit.md),
[design](./docs/sessions/session-81-design.md).

### Que se hizo

1. **Tarea 0 -- precondiciones**: 6/7 OK, fallo en condicion 7
   (PathTransitions.jsx no debia existir; existia desde s77 con 252 ln).
   Reportado al usuario con tabla de evidencias. Cambio de scope confirmado.
2. **Tarea 1 -- auditoria** ([session-81-audit.md](./docs/sessions/session-81-audit.md)):
   estructura i18n (3 archivos), conteo por dominio (31 bloques, 664 keys),
   4 deudas tecnicas detectadas (D-1 override silencioso, D-2 duplicidad
   "Hecho hoy", D-3 namespaces inconsistentes, D-4 bloques minusculos),
   13 invariantes, 10 edge cases.
3. **Tarea 2 -- design con 3 variantes** ([session-81-design.md](./docs/sessions/session-81-design.md)):
   - **A** Conservadora: 3 archivos + strings.js reducido a 330 ln (sin bootstrap).
   - **B** Pragmatica: 6 archivos en `strings/` con `_bootstrap.js` + 5 dominios.
   - **C** Maximalista: 14 archivos (1 por dominio).
   Usuario delega: "LA QUE TU RECOMIENDES Y SEA MAS PROFESIONAL". Agente
   elige **B** (5 dominios coherentes, carpeta dedicada, bootstrap explicito).
4. **Tarea 3 -- implementacion mecanica**:
   - Crear `app/i18n/strings/_bootstrap.js` (15 ln; vacio).
   - Crear `app/i18n/strings/achievements.js`, `paths.js`, `stats.js`
     (paralelo; archivos chicos).
   - Crear `app/i18n/strings/ui.js`, `sessions.js` (paralelo; archivos
     grandes con welcome+support+tweaks y session+breathe+focus+move+hydrate
     respectivamente).
   - Verificacion intermedia con Grep: 664 keys en los 6 archivos =
     exactamente las 664 originales. Cero perdida.
   - Editar `PACE.html` -- de 3 a 8 `<script src>` i18n + comentario explicativo.
   - Eliminar `app/i18n/strings.js`.
5. **Tarea 4 -- verificacion**:
   - `node build-standalone.js`: 55 archivos validados (50 previos +
     6 nuevos - 1 eliminado = 55). OK.
   - Runtime via preview local (`.claude/static-server.js` heredado de s80):
     `Object.keys(PACE_STRINGS.es).length = 332`, `.en = 545`. Snapshot
     a11y del home con un Camino activo (Hierbabuena + PathHydrateStep):
     textos correctos en TopBar/Sidebar/FocusTimer/ActivityBar/overlay.
     Override D-1 verificado preservado.
6. **Tarea 6 -- versionado y build**:
   - Restaurar pristino v0.33.0 desde HEAD antes del backup.
   - Backup `backups/PACE_standalone_v0.33.0_20260519.html`. Cap 20
     mantenido (v0.27.5 ya no existia fisicamente).
   - Bump (state-core, PACE.html, sw.js) -> v0.33.1.
   - Rebuild: bundle 614 KB (628,926 bytes; +4,387 vs v0.33.0). SHA-256:
     `3b9c49c0...367ae`. `index.html` byte-perfect.
7. **Tarea 7 -- documentacion**: audit + design + diario s81 + CHANGELOG
   (degradacion de v0.32.1 a fila-de-enlace, detalle nuevo de v0.33.1)
   + STATE.md (este archivo).

### Decisiones tomadas

- D1 -- **Cambio de scope documentado y trazable**: prompt -> transiciones
  ya existian -> split de strings.js. Audit + design + diario reflejan el
  cambio.
- D2 -- **Variante B aprobada** (no A ni C). Pragmatica: 5 dominios
  coherentes, carpeta dedicada, bootstrap explicito. Cumple `<500 ln`
  con holgura.
- D3 -- **Bootstrap explicito** `_bootstrap.js` vs "primer archivo crea el
  objeto". Mas resistente a errores de parse.
- D4 -- **`strings-content.js` intacto**, sigue cargando al final.
  Override silencioso D-1 PRESERVADO en runtime.
- D5 -- **ES y EN en mismo archivo del split** (no separar por idioma).
  Siempre se actualizan en paralelo.
- D6 -- **NO consolidar deudas D-1 a D-4 en s81**. Scope = split mecanico
  puro. Cualquier consolidacion abre debate de UX/copy fuera del prompt.
- D7 -- **`build-standalone.js` sin cambios**. `validateAppFiles` walkea
  recursivo; los 6 archivos nuevos se descubren automatico.
- D8 -- **Cap 20 backups mantenido sin rotar explicito**. El backup mas
  antiguo (`v0.27.5_20260511.html`) ya no existia fisicamente cuando se
  intento el `rm`; el alta de `v0.33.0_20260519.html` mantiene el cap
  sin operacion destructiva sobre los demas.

### Build

- Bundle: **614 KB** (628,926 bytes; +4,387 bytes vs v0.33.0 = 624,539,
  +0.7%). Crecimiento por cabeceras de doc-comment de 6 archivos nuevos
  (~6-15 ln cada uno) + Object.assign wrappers (~3 ln × 2 idiomas × 5
  dominios). Estimado en design: +2-3 KB; real: +4 KB (atribuible a
  cabeceras mas extensas de lo previsto).
- 55 archivos validados (9 .js + 46 .jsx).
- `index.html` byte-a-byte identico a `PACE_standalone.html`.
- SHA-256: `3b9c49c0736e237dfffd37067b88793af501b0ce820221d0cd61934575a367ae`.
- Backup creado: `backups/PACE_standalone_v0.33.0_20260519.html` (610 KB,
  pristino restaurado desde HEAD).

### Validacion runtime usuario

Cubierta principalmente por preview local (recarga + 19 keys sample de
los 5 dominios ES+EN + snapshot a11y con un Camino activo). Quedan
pendientes de inspeccion manual: navegar por StatsPanel (verificar
textos de stats.month.* / stats.year.* / stats.paths.*) y Achievements
(textos ach.cat.*); abrir TweaksPanel (textos tweaks.confirm.*); ningun
riesgo conocido -- el split es mecanico y el conteo coincide.

## Proxima sesion -- s82 (sin scope fijo)

s81 cierra el split de strings.js (deuda ALTA mayor). Candidatos para
s82 segun deuda actual:

1. **`app/main.jsx`** (600 ln, MEDIA): orquestador + TopBar +
   ActivityBar. Candidato a extraer ActivityBar a `app/main/ActivityBar.jsx`.
2. **`app/achievements/Achievements.jsx`** (~500 ln, MEDIA): catalogo
   + coleccion + preview. Catalogo a `app/achievements/catalog.js`.
3. **Catalog split Move/Stretch**: si se quiere diferenciar en catalogo
   (`kind: 'move' | 'stretch'` en vez de `'body'`). Trivial ahora con
   `steps/` ya extraido.
4. **Consolidar overrides D-1 a D-3** de strings: decidir Ocean vs
   Oceanic, eliminar redundancia "Hecho hoy", unificar namespace path/paths.

### Precondicion bloqueante

Cierre Git de s81 publicado por el usuario (commit + push manual).

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

---

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/main.jsx` | 600 | MEDIA |
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/state-core.jsx` | ~475 | BAJA (dentro de limite) |
| `app/i18n/strings/ui.js` | 315 | BAJA (dentro de limite, dominio mas grande del split) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
| `app/paths/PathRunner.jsx` | 244 | SALE (s80, antes 835 -- split en steps/ + parts + CompletionScreen) |
| `app/i18n/strings.js` | -- | SALE (s81, antes 791 -- split en strings/_bootstrap + ui + sessions + paths + stats + achievements) |

### Deudas semanticas (no de tamaño, no urgentes)

| Item | Detectado en | Detalle |
|---|---|---|
| D-1 override silencioso strings-content.js | s81 audit | 3 keys `breathe.phase.*` con valores distintos (Inhale again vs more; Oceanic vs Ocean). 8 keys mas duplicadas pero coincidentes. Decision futura |
| D-2 duplicidad "Hecho hoy" | s81 audit | `path.card.done` + `paths.library.doneToday` mismo valor, dos keys. Consolidar a una |
| D-3 namespaces path / paths inconsistentes | s81 audit (existente desde s53) | Singular `path.*` (runner, hydrate, card, error) + plural `paths.*` (library, suggested, path, kind, runner.repeat). Mezcla historica |
