# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.33.3
**Ultima sesion:** #83 -- 2026-05-23 - refactor(achievements): split `app/achievements/Achievements.jsx` (409 ln) en `achievements/` + `glyphs/` -- variante B (3 archivos: `catalog.js` + `achievement-glyphs.jsx` + `Achievements.jsx` solo UI). 409 ln -> 184 ln (-55%). Cuarto split mecanico consecutivo tras s80/s81/s82 -- convencion `app/glyphs/` consolidada con 2 hermanos (`exercise-glyphs` + `achievement-glyphs`)
**Ultima actualizacion de este archivo:** 2026-05-23 - sesion 83
**Build entregado:** `PACE_standalone.html` v0.33.3 (620 KB; 635,365 bytes) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.33.3** (s83: + 2 `<script src>` antes de Achievements.jsx -- `app/glyphs/achievement-glyphs.jsx` + `app/achievements/catalog.js` + comentario orden estricto + titulo bump) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.33.3** (620 KB, regenerado s83) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.33.3** (s83: regenerado por build-standalone.js) |
| `app/glyphs/exercise-glyphs.jsx` | 46 glifos SVG line-art para Move/Stretch (sistema 1) | **v0.28.1** (iter parcial s60, sin cambios s61-s83; ampliable/sustituible en s85+) |
| `app/glyphs/achievement-glyphs.jsx` | 34 glifos SVG heraldica para Logros (sistema 2) -- strings de SVG, `Object.assign(window, { ACHIEVEMENT_GLYPHS })` | **v0.33.3** (nuevo s83, 68 ln) |
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
| `app/achievements/Achievements.jsx` | UI pura del catalogo (Achievements modal + Seal componente + renderGlyph + isImplemented) | **v0.33.3** (s83: split mecanico variante B, 409 ln -> 184 ln, -55% -- DATA migrada a catalog.js + glifos a app/glyphs/achievement-glyphs.jsx; lee globales como `const X = window.X || fallback`) |
| `app/achievements/catalog.js` | ACHIEVEMENT_CATALOG (106 entradas) + CAT_META (7 categorias) + IMPLEMENTED_ACHIEVEMENTS (Set 69 ids) -- expone los 3 a window | **v0.33.3** (nuevo s83, 209 ln; lee `window.ACHIEVEMENT_GLYPHS` para entradas con glyphSvg) |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.5** (s64: overflowY:hidden en data-pyv-wrap -- fix scroll vertical) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.4** (s63: titulo marginBottom 6->4) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.28.8** (s69: isActiveDay helper + computeYearStats unifica criterio "dia activo" = focus|breath|move>0, agua sola NO cuenta) |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.28.8** (s69: WeekBarRow elimina reorder, itera data lunes-primero) |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** (nuevo s58) |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** (nuevo s58) |
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.33.3** (s83: PACE_VERSION bump; s82/s81: idem bump; s77b: + constante TOAST_DURATION_MS=3000 exportada a window) |
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
| `sw.js` | Service Worker PWA | **v0.33.3** (s83: CACHE_NAME pace-v0.33.3) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.33.2_20260523.html` <- creado s83 (copia del v0.33.2 publicado en s82)
- `backups/PACE_standalone_v0.33.1_20260523.html` <- creado s82
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

Nota s83: cap 20 mantenido rotando el mas antiguo (`v0.28.0_20260511.html`)
al crear el backup del v0.33.2 publicado en s82.

---

## Ultima sesion (resumen operativo)

**Sesion 83 - v0.33.3 - refactor(achievements): split `app/achievements/Achievements.jsx` (409 ln) en `achievements/` + `glyphs/` (variante B: catalog.js + achievement-glyphs.jsx + Achievements.jsx solo UI). 409 ln -> 184 ln (-55%). Convencion `app/glyphs/` consolidada con 2 archivos hermanos.**

### Contexto

s83 toma el ultimo candidato MEDIO de deuda del backlog s82:
`app/achievements/Achievements.jsx` (estimado ~500 ln, real 409). Cuarta
sesion consecutiva de split mecanico tras s80 (PathRunner), s81 (strings)
y s82 (main). El patron `app/<carpeta>/` esta ya consolidado como
convencion del codebase.

A diferencia de los splits anteriores, el archivo mezclaba dos
responsabilidades naturales: **datos** (catalogo de 100 logros + glifos
SVG + metadata + set de implementados) y **UI** (modal + sello). La
separacion natural es por tipo: datos a `catalog.js`, glifos a
`app/glyphs/achievement-glyphs.jsx` (hermano de `exercise-glyphs.jsx`).

Auditoria detecta cero acoplamientos problematicos:
`state-achievements.jsx` NO consume `ACHIEVEMENT_CATALOG`; solo dispara
`unlockAchievement(id)` con ids hardcoded. Consumidores externos
(`CompletionScreen.jsx:50`, `Toast.jsx:13`) usan lectura defensiva de
`window.ACHIEVEMENT_CATALOG`. Cero duplicacion de SVG con
`exercise-glyphs.jsx` (sistemas visuales distintos: heraldica vs
line-art).

Diario: [s83](./docs/sessions/session-83-achievements-split.md).
Documentos de apoyo: [audit](./docs/sessions/session-83-audit.md),
[design](./docs/sessions/session-83-design.md).

### Que se hizo

1. **Tarea 0 -- precondiciones**: 7/7 OK. git limpio, version coherente,
   standalone v0.33.2 carga limpia en preview, Achievements.jsx = 409 ln
   (no ~500 como estimaba STATE.md -- sobreestimacion 22%).
2. **Tarea 1 -- auditoria** ([session-83-audit.md](./docs/sessions/session-83-audit.md)):
   tabla de 9 secciones (DATA 57% + UI 36% + LOGIC 5%), inventario de
   34 glifos SVG + alias `first.plan` + 71 logros con unicode fallback,
   cero duplicacion con exercise-glyphs.jsx, 25 invariantes numeradas,
   12 edge cases.
3. **Tarea 2 -- design con 3 variantes** ([session-83-design.md](./docs/sessions/session-83-design.md)):
   - **A** Solo datos: catalog.js mixto (glifos+catalogo+meta) -> 175 ln
     en Achievements.jsx (-57%). Cumple metrica pero no establece
     `app/glyphs/` como convencion.
   - **B** Datos + glifos separados (aprobada): catalog.js + achievement-
     glyphs.jsx -> 184 ln en Achievements.jsx (-55%). Convencion
     `app/glyphs/` con 2 hermanos.
   - **C** B + Seal aislado: 80 ln en Achievements.jsx (-80%). Premature
     abstraction (1 consumidor, cero caso de reuso).
   Usuario aprueba B: "si es lo correcto, si". Coherente con principio
   "no premature abstraction" aplicado en s82.
4. **Tarea 3 -- implementacion mecanica**:
   - Crear `app/glyphs/achievement-glyphs.jsx` (68 ln; SVG helpers +
     `GLYPH_SVG` map + alias + `Object.assign(window, { ACHIEVEMENT_GLYPHS })`).
   - Crear `app/achievements/catalog.js` (209 ln; lee
     `window.ACHIEVEMENT_GLYPHS` para entradas + `ACHIEVEMENT_CATALOG` +
     `CAT_META` + `IMPLEMENTED_ACHIEVEMENTS` + `Object.assign`).
   - Editar PACE.html: +2 `<script src>` antes de Achievements.jsx +
     comentario orden estricto.
   - **Verificacion intermedia** (3 archivos cargados + Achievements.jsx
     aun sin tocar): consola 0 errores, modal abre identico, 106 seals,
     35 glyphs map, alias funciona. ✓
   - Reescribir Achievements.jsx (409 -> 184 ln, -55%; cuerpo de
     componentes byte-identico, lee globales como `const X = window.X
     || fallback`).
5. **Tarea 4 -- verificacion** (5 fases):
   - 4.1 Modal: 7 categorias, 106 seals, 35 SVGs renderizados, getComputedStyle
     OK por estado, ESC cierra.
   - 4.2 Unlock: `window.unlockAchievement('first.step')` -> seal cambia
     a border solid + opacity 1 (antes dashed/0.55). Detector intacto.
   - 4.3 Invariantes criticos: globales correctos (catalog 106, glyphs
     35, IMPLEMENTED 69 ids), CompletionScreen/Toast leen via window OK,
     state-achievements intacto, consola limpia.
   - 4.4 Edge cases: alias `first.plan` consume glifo de `first.ritual`,
     `secret.cow.click` locked -> '?', cambio idioma ES->EN ("Primeros
     pasos" -> "First steps").
   - 4.5 Glifos pixel-perfect: heptagonal `master.path.all7` path
     byte-identico (`M22 6 L35 13 L38 26 L29 37 L15 37 L6 26 L9 13 Z`),
     familia streak/heptagonal coherente, `exercise-glyphs.jsx` NO
     modificado (verificado por `git diff --stat`).
   - Console errors a lo largo de todo el ciclo: **cero**.
6. **Tarea 6 -- versionado y build**:
   - Backup `backups/PACE_standalone_v0.33.2_20260523.html` (copia del
     v0.33.2 publicado). Cap 20 mantenido (rotado v0.28.0_20260511.html).
   - Bump (state-core, PACE.html, sw.js) -> v0.33.3.
   - Rebuild: bundle **620 KB (635,365 bytes; +3,301 vs v0.33.2)**.
     SHA-256: `23EF9FF6...7B62B6C7`. `index.html` byte-perfect.
   - 60 archivos validados (11 .js + 49 .jsx; antes 58 = +2 nuevos).
   - Verificacion runtime sobre standalone v0.33.3: heptagonal byte-
     identico, modal funcional, todos los globales correctos.
7. **Tarea 7 -- documentacion**: audit + design + diario s83 + CHANGELOG
   (degradacion de v0.33.1 a fila-de-enlace, detalle nuevo de v0.33.3)
   + STATE.md (este archivo).

### Decisiones tomadas

- D1 -- **Variante B aprobada** (3 archivos: catalog + glyphs + UI). No A
  (no establece `app/glyphs/` como convencion) ni C (premature abstraction).
- D2 -- **`achievement-glyphs.jsx` con extension `.jsx`** aunque no
  contenga JSX. Coherencia con hermano `exercise-glyphs.jsx`. Trade-off
  cosmetico aceptado.
- D3 -- **`IMPLEMENTED_ACHIEVEMENTS` expuesto a window** (era local-only).
  Simetria con `ACHIEVEMENT_CATALOG`. Coste cero.
- D4 -- **Achievements.jsx lee globales como `const X = window.X || fallback`**
  al inicio del archivo. Captura una vez al cargar + fallback defensivo.
- D5 -- **NO consolidar heraldica con line-art**. Sistemas visualmente
  distintos. Mismo namespace `app/glyphs/` pero almacenamiento, keys y
  estilo diferentes.
- D6 -- **NO modificar `state-achievements.jsx`**. Cero acoplamiento.
  Scope creep evitado.
- D7 -- **NO arreglar counter "100 logros" vs 106 reales**. Deuda menor
  de copy, no de codigo. Diferida a s87+.
- D8 -- **`build-standalone.js` sin cambios**. 60 archivos validados
  automaticamente.

### Build

- Bundle: **620 KB** (635,365 bytes; +3,301 bytes vs v0.33.2 = 632,064,
  +0.5%). Crecimiento por cabeceras de doc-comment de los 2 archivos
  nuevos. Estimado en design: ~3 KB; real: +3 KB. Exacto.
- 60 archivos validados (11 .js + 49 .jsx).
- `index.html` byte-a-byte identico a `PACE_standalone.html`.
- SHA-256: `23EF9FF6752B61D586C5C4A43DF6911583AE57AC733BBC65AC9A81795C62B6C7`.
- Backup creado: `backups/PACE_standalone_v0.33.2_20260523.html` (617 KB).

### Validacion runtime usuario

Cubierta integramente por preview local en `localhost:8765`. **Fases
4.1 a 4.5 verificadas**: modal, unlock, invariantes, edge cases, glifos
pixel-perfect. Standalone tras rebuild verifica los mismos invariantes
que el modular. Console errors: cero. Pendiente de inspeccion manual
visual: confirmar pixel-a-pixel que los seals se ven igual que en
v0.33.2 (riesgo minimo, refactor mecanico verificado por equivalencia
de path `d` y conteo de circles).

## Proxima sesion -- s84 (polish pre-Reddit, contenido)

s83 cierra el ultimo candidato de deuda MEDIA. El backlog tecnico
visible queda **vacio** (`state-core.jsx` esta en BAJA, dentro de
limite). La app esta lista para pasar a fase de polish + contenido sin
sensacion de deuda pendiente.

Candidatos sugeridos para s84:

1. **README.md desactualizado** (v0.27.6 -> v0.33.3 con resumen
   consolidado). Reservado en s82 para esta sesion.
2. **Generar `og:image` decente**.
3. **Capturar screenshots oficiales** claro/oscuro x Home/Camino/Completion
   para Reddit + landing.
4. **Draftear post de Reddit** con lista de subreddits relevantes.
5. **Actualizar `scripts/check-session.ps1`** con rango de tamaño
   correcto (615-625 KB; ahora avisa con 530-600 KB).

Sesion s84 es de **contenido y comunicacion**, no de codigo. Distinto
caracter al patron de splits s80-s83.

### Precondicion bloqueante

Cierre Git de s83 publicado por el usuario (commit + push manual).

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
| `app/achievements/Achievements.jsx` splittado en `achievements/` + `glyphs/` (variante B) | s83 | Tres archivos: `app/glyphs/achievement-glyphs.jsx` (heraldica para logros, 34 SVG + alias `first.plan`, expone `window.ACHIEVEMENT_GLYPHS`), `app/achievements/catalog.js` (`ACHIEVEMENT_CATALOG` + `CAT_META` + `IMPLEMENTED_ACHIEVEMENTS`, expone los 3 a window), `app/achievements/Achievements.jsx` (UI pura, lee globales con fallback). Si en el futuro surge un segundo consumidor de `Seal` (carrusel en Stats, micropreview en Camino completado), evaluar Variante C; hoy es premature abstraction |
| Convencion `app/glyphs/` como home definitivo de sistemas de glifos | s83 | Dos archivos hermanos sin solapamiento: `exercise-glyphs.jsx` (s60, line-art para Move/Stretch, 46 glifos -- ampliable/sustituible en s85+ por nuevos disenos del usuario en paralelo) + `achievement-glyphs.jsx` (s83, heraldica para Logros, 34 glifos + alias -- cerrado y estable, no se modifica en s85+). Mismo namespace, mismo viewBox 0 0 44 44, mismo `currentColor`, pero almacenamiento (JSX components vs strings de SVG), keys (nombres de paso vs achievement ids) y estilo visual (postura vs sello) totalmente diferentes |
| `IMPLEMENTED_ACHIEVEMENTS` expuesto a window | s83 | Era local-only pre-s83. Tras split a `catalog.js`, expuesto por simetria con `ACHIEVEMENT_CATALOG`. Coste cero, abre la puerta a que otro modulo lo lea sin importar el catalogo entero. Hoy NO tiene consumidores externos |
| Achievements.jsx lee globales como `const X = window.X \|\| fallback` al inicio del archivo | s83 | Captura los valores una vez al cargar (orden de carga garantiza que `catalog.js` ya ejecuto). Fallback defensivo (`[]`, `{}`, `new Set()`) por si en algun escenario el orden falla -- degradacion graceful en lugar de TypeError. Patron mas legible que leer `window.*` dentro de cada uso |

---

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/state-core.jsx` | ~475 | BAJA (dentro de limite) |
| `app/i18n/strings/ui.js` | 315 | BAJA (dentro de limite, dominio mas grande del split) |
| `app/achievements/Achievements.jsx` | 184 | SALE (s83, antes 409 -- split en achievements/catalog.js + glyphs/achievement-glyphs.jsx) |
| `app/main.jsx` | 279 | SALE (s82, antes 600 -- split en main/_responsive + TopBar + ActivityBar) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
| `app/paths/PathRunner.jsx` | 244 | SALE (s80, antes 835 -- split en steps/ + parts + CompletionScreen) |
| `app/i18n/strings.js` | -- | SALE (s81, antes 791 -- split en strings/_bootstrap + ui + sessions + paths + stats + achievements) |

**Backlog tecnico de prioridad MEDIA: vacio.** Tras s83, todos los candidatos
de deuda MEDIA del backlog s82 han salido. La app esta lista para pasar a
fase de polish + contenido (s84+) sin sensacion de deuda visible pendiente.

### Deudas semanticas (no de tamaño, no urgentes)

| Item | Detectado en | Detalle |
|---|---|---|
| D-1 override silencioso strings-content.js | s81 audit | 3 keys `breathe.phase.*` con valores distintos (Inhale again vs more; Oceanic vs Ocean). 8 keys mas duplicadas pero coincidentes. Decision futura |
| D-2 duplicidad "Hecho hoy" | s81 audit | `path.card.done` + `paths.library.doneToday` mismo valor, dos keys. Consolidar a una |
| D-3 namespaces path / paths inconsistentes | s81 audit (existente desde s53) | Singular `path.*` (runner, hydrate, card, error) + plural `paths.*` (library, suggested, path, kind, runner.repeat). Mezcla historica |
