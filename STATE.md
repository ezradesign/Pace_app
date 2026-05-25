# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.34.0
**Ultima sesion:** #84 -- 2026-05-24 - feat(glyphs): cierre del iter parcial 13/46 abierto en s60 -- port literal de 31/46 glifos aprobados por el usuario desde HTML de exploracion (bundler autoextract gzip+base64 desempaquetado) + 15 pendientes mantenidos en s60. 28 ports (12 Mueve + 16 Estira) + 3 keep identico + 15 keep s60. exercise-glyphs.jsx 527 -> 554 ln (+5%)
**Ultima actualizacion de este archivo:** 2026-05-24 - sesion 84
**Build entregado:** `PACE_standalone.html` v0.34.0 (622 KB; 636,429 bytes) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.34.0** (s84: titulo bump) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.34.0** (622 KB, regenerado s84) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.34.0** (s84: regenerado por build-standalone.js) |
| `app/glyphs/exercise-glyphs.jsx` | 46 glifos SVG line-art para Move/Stretch (sistema 1) | **v0.34.0** (s84: 28 ports + 18 mantenimientos -- iter cerrado 31/46 aprobados + 15 pendientes; 527 -> 554 ln) |
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
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.34.0** (s84: PACE_VERSION bump; s83/s82/s81: idem bump; s77b: + constante TOAST_DURATION_MS=3000 exportada a window) |
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
| `sw.js` | Service Worker PWA | **v0.34.0** (s84: CACHE_NAME pace-v0.34.0) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.33.3_20260524.html` <- creado s84 (copia del v0.33.3 publicado en s83)
- `backups/PACE_standalone_v0.33.2_20260523.html` <- creado s83
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

Nota s84: cap 20 mantenido rotando el mas antiguo (`v0.28.1_20260511.html`
-- ironicamente el del s60 iter parcial que esta sesion cierra) al crear
el backup del v0.33.3 publicado en s83.

---

## Ultima sesion (resumen operativo)

**Sesion 84 - v0.34.0 - feat(glyphs): cierre del iter parcial 13/46 abierto en s60 -- port literal de 31/46 glifos aprobados por el usuario desde HTML de exploracion + 15 pendientes mantenidos en s60. exercise-glyphs.jsx 527 -> 554 ln (+5%).**

### Contexto

s84 cierra el **iter abierto en s60 hace 153 dias** portando literalmente
las versiones aprobadas por el usuario en su HTML de exploracion
(`Glifos Mueve y Estira _ standalone v0.19.html`, bundler autoextract
gzip+base64 desempaquetado con script temporal `scripts/extract-glyphs-bundle.js`).

La convencion del HTML (descubierta en `asset-12-6422ee88.js`) es:
**`window.APPROVED[stepName]` es la fuente de verdad** sobre que version
esta bloqueada para cada glifo. Cobertura APPROVED: 31 aprobados / 46
totales · 15 pendientes.

Diario: [s84](./docs/sessions/session-84-glifos-cierre-iter.md).
Documentos de apoyo: [audit](./docs/sessions/session-84-audit.md),
[design](./docs/sessions/session-84-design.md).

### Que se hizo

1. **Tarea 0 -- precondiciones**: 6/6 tecnicas OK + 3 decisiones de
   usuario (`AskUserQuestion`): mantener s60 en los 15 pendientes,
   v0.34.0 minor, port literal + documentar divergencias.
2. **Tarea 1 -- auditoria** ([session-84-audit.md](./docs/sessions/session-84-audit.md)):
   tabla de 46 glifos con accion {port/keep idéntico/keep s60/add/orphan},
   cobertura 1:1 con MOVE_ROUTINES + EXTRA_ROUTINES, consumidor unico
   real `MoveModule.jsx:295`, divergencias documentadas (strokeWidth
   1.5/2.0 vs 1.8 del wrapper, opacidades, dasharray).
3. **Tarea 2 -- design** ([session-84-design.md](./docs/sessions/session-84-design.md)):
   28 ports (12 Mueve + 16 Estira) + 3 keep identico + 15 keep s60,
   orden del archivo en 2 bloques, wrapper G intacto (strokeWidth 1.8
   unificado a nivel repo), archivo NO se trocea.
4. **Tarea 3 -- implementacion**:
   - Header `app/glyphs/exercise-glyphs.jsx` actualizado a v0.34.0.
   - Bloque A: 12 ports Mueve (Flexiones inclinadas NEW, Descanso NEW,
     Wall sit NEW, Calf raises ALT, Seated hollow V5, Squeeze fist V9,
     Finger extension V9, Wrist stretch V5, Chin tucks V8, Scapular
     squeeze NEW, Thoracic extension NEW, Chest opener NEW). Checkpoint:
     build OK, 46 glifos, consola limpia.
   - Bloque B: 16 ports Estira (Apertura de pecho V8, Rotacion toracica
     NEW, Flexor de cadera V8, Cuello y trapecios V6, Reset respiracion
     NEW, 90/90 ALT, Squat profundo ALT, Puente con marcha NEW, Scapular
     wall slides V8, Band pull-apart NEW, External rotation ALT, Dead
     hang NEW, Elephant walk V7, Hang pasivo ALT, Shrug + round V12,
     Deep breaths NEW). Checkpoint: build OK.
5. **Tarea 4 -- verificacion** (5 fases):
   - 4.1 Cobertura runtime: glifos renderizan visualmente en rutinas
     Mueve (Squeeze fist V9, Finger extension V9, Wrist stretch V5) y
     Estira (Apertura de pecho V8).
   - 4.2 Paletas: `currentColor` heredado correctamente en oscuro
     (stroke = `rgb(154, 123, 79)` = `var(--move)`).
   - 4.3 Snapshot control: 15 PENDIENTES + 3 keep idéntico byte-perfect
     intactos (verificado por `git diff` -- 0 ocurrencias para las 18
     keys mantenidas).
   - 4.4 Edge cases: keys especiales (apostrofe, parentesis, slash, +,
     acentos UTF-8) funcionan; glifos con >5 elementos renderizan OK.
   - 4.5 Coherencia visual: opcional, NO ejecutada (delegada a inspeccion
     manual del usuario).
   - Snapshot DOM byte-perfect: render off-DOM de los 28 ports verifico
     conteo exacto path/circle/ellipse/rect contra HTML del usuario.
   - Console errors a lo largo de todo el ciclo: **cero**.
6. **Tarea 6 -- versionado y build**:
   - Backup `backups/PACE_standalone_v0.33.3_20260524.html` desde
     `git show HEAD:PACE_standalone.html`. Cap 20 mantenido (rotado
     `v0.28.1_20260511.html` -- ironicamente el del s60 iter parcial).
   - Bump (state-core, PACE.html, sw.js) -> v0.34.0.
   - Rebuild: bundle **622 KB (636,429 bytes; +1,064 vs v0.33.3)**.
     SHA-256: `8C02F9AE...A171EB6`. `index.html` byte-perfect.
   - 60 archivos validados (11 .js + 49 .jsx) -- mismos que s83.
   - Verificacion runtime sobre standalone v0.34.0: Squeeze fist V9
     byte-perfect, Cossack squat (keep s60) byte-perfect, todos los
     globales correctos.
   - `scripts/check-session.ps1` OK con aviso conocido de rango.
7. **Tarea 7 -- documentacion**: audit + design + diario s84 + CHANGELOG
   (degradacion de v0.33.2 a fila-de-enlace, detalle nuevo de v0.34.0)
   + STATE.md (este archivo). Scripts temporales borrados.

### Decisiones tomadas

- D1 -- **Port literal del CUERPO SVG dentro del wrapper G del repo
  (stroke 1.8)**. Preserva geometria byte-perfect (mismo `d`,
  `cx`/`cy`/`r`, opacidades, dasharray) pero unifica strokeWidth a nivel
  repo. El wrapper estandariza el lenguaje; cambiar a 2.0 (estilo V9)
  seria decision separada.
- D2 -- **15 PENDIENTES mantenidos en s60** (no portar v8/v9/v10/v11/v12/v13
  sin aprobacion explicita). Decision usuario Tarea 0. Sirven como
  CONTROL de Fase 4.3.
- D3 -- **Bump minor v0.34.0** (no patch v0.33.4). Cierre del iter
  abierto en s60 -- objetivo declarado del prompt. 28/46 = 61%
  modificados, 31/46 = 67% bloqueados.
- D4 -- **Wrapper G intacto** (NO unificar strokeWidth a 2.0). Cambiar
  el wrapper afectaria los 46 glifos por igual incluido los 15 mantenidos.
- D5 -- **NO trocear `exercise-glyphs.jsx`** (estimacion 554 ln, dentro
  del umbral 600).
- D6 -- **NO modificar `EXTRA_ROUTINES`** para reconciliar divergencia
  `move.desk.quick` (HTML pone `Apertura de pecho` donde repo pone
  `Chin tucks` en paso 5). Scope = solo glifos.
- D7 -- **NO modificar `achievement-glyphs.jsx`**. Sistema visual
  separado (heraldica vs line-art).
- D8 -- **Comentarios contextuales actualizados con tag de version**
  `(NEW)`, `(V8)`, `(V9)`, etc. Facilita rastrear el origen del SVG en
  sesiones futuras.
- D9 -- **Script temporal borrado al cerrar** (`scripts/extract-glyphs-bundle.js`
  + `scripts/extracted-glyphs/`).

### Build

- Bundle: **622 KB** (636,429 bytes; +1,064 bytes vs v0.33.3 = 635,365,
  +0.17%). Estimado en design ±0 a +2 KB; real +1 KB. Exacto.
- 60 archivos validados (11 .js + 49 .jsx). Mismos que s83 -- no se
  crearon archivos nuevos en `app/`.
- `index.html` byte-a-byte identico a `PACE_standalone.html`.
- SHA-256: `8C02F9AE9E7FCA393F09CFBB0371227A5D6BBFB49E08F0EE4BB7C3FB3A171EB6`.
- Backup creado: `backups/PACE_standalone_v0.33.3_20260524.html` (635 KB).

### Validacion runtime usuario

Cubierta via preview local en `localhost:8765/PACE_standalone.html`.
**Fases 4.1 a 4.4 verificadas**: cobertura runtime visual, paletas,
snapshot control 15 pendientes + 3 keep idéntico byte-perfect, edge
cases. Fase 4.5 (coherencia visual) opcional, delegada a inspeccion
manual del usuario.

Pendiente de inspeccion manual visual: confirmar legibilidad de glifos
a 32px en mobile, detectar potenciales confusiones entre pares similares
(Chin tucks v8 vs Apertura de pecho v8, Squeeze fist v9 vs Apertura de
pecho v8). Si detecta confusion -> iteracion focal en sesion futura.

## Proxima sesion -- s85 (polish pre-Reddit)

s84 cierra el iter abierto en s60 (153 dias entre apertura y cierre).
La app queda **lista para fase de polish + contenido** sin sensacion
de deuda visible:

- Backlog tecnico MEDIA: **vacio** (heredado de s83).
- Iter visual: **cerrado** (31/46 aprobados portados + 15 mantenidos
  hasta nueva aprobacion).

Candidatos sugeridos para s85:

1. **README.md desactualizado** (v0.27.6 -> v0.34.0 con resumen
   consolidado). Reservado en s82+s83 para esta sesion.
2. **Generar `og:image` decente**.
3. **Capturar screenshots oficiales** claro/oscuro x Home/Camino/Completion
   para Reddit + landing.
4. **Draftear post de Reddit** con lista de subreddits relevantes.
5. **Actualizar `scripts/check-session.ps1`** con rango de tamaño
   correcto (615-625 KB; ahora avisa con 530-600 KB).

Sesion s85 es de **contenido y comunicacion**, no de codigo.

### Precondicion bloqueante

Cierre Git de s84 publicado por el usuario (commit + push manual).

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
| Iter glifos canonicos Mueve/Estira cerrado (port literal desde HTML del usuario) | s84 | 31/46 glifos con version bloqueada en `window.APPROVED` del HTML de exploracion portados literal al wrapper G del repo (strokeWidth 1.8 unificado). 15 pendientes mantenidos en s60 hasta nueva aprobacion del usuario. Patron "port literal desde HTML del usuario, no reinterpretar" reutilizable cuando el usuario aporte iteraciones de glifos en sesiones futuras |
| Wrapper G de `exercise-glyphs.jsx` mantenido a strokeWidth 1.8 aunque las versiones aprobadas del HTML usen 1.5 (v3-v8, v12) o 2.0 (v9) | s84 | Unifica el lenguaje visual a nivel repo en lugar de copiar el stroke de cada version. Si en el futuro el usuario decide unificar a 2.0 (estilo V9), cambio aislado del wrapper afecta los 46 glifos por igual -- mejor que mezclar strokeWidths por glifo |
| Para los 15 glifos PENDIENTES (sin entrada en `window.APPROVED`), mantener s60 hasta nueva aprobacion del usuario | s84 | World's greatest stretch, Cossack squat, Pigeon, ATG split squat, Tibialis raise, Nordics, Sissy squat, Deep squat hold, Crawling, Ground sitting transitions, Inclinacion lateral, Escalenos, Wrist circles, Seated twist, Ankle circles. Iteraciones disponibles en exploracion (v8/v9/v10/v11/v12/v13) pero no aprobadas por el usuario. Sirven como CONTROL de Fase 4.3 (snapshot comparativo) -- si cambian, error |

---

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/state-core.jsx` | ~485 | BAJA (dentro de limite) |
| `app/i18n/strings/ui.js` | 315 | BAJA (dentro de limite, dominio mas grande del split) |
| `app/glyphs/exercise-glyphs.jsx` | 554 | BAJA (s84, dentro de limite tras port; iter cerrado 31/46 aprobados) |
| `app/achievements/Achievements.jsx` | 184 | SALE (s83, antes 409 -- split en achievements/catalog.js + glyphs/achievement-glyphs.jsx) |
| `app/main.jsx` | 279 | SALE (s82, antes 600 -- split en main/_responsive + TopBar + ActivityBar) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
| `app/paths/PathRunner.jsx` | 244 | SALE (s80, antes 835 -- split en steps/ + parts + CompletionScreen) |
| `app/i18n/strings.js` | -- | SALE (s81, antes 791 -- split en strings/_bootstrap + ui + sessions + paths + stats + achievements) |

**Backlog tecnico de prioridad MEDIA: vacio.** Tras s83+s84, todos los
candidatos de deuda MEDIA del backlog s82 han salido + el iter visual de
glifos esta cerrado (31/46 aprobados portados, 15 mantenidos hasta nueva
aprobacion). La app esta lista para pasar a fase de polish + contenido
(s85+) sin sensacion de deuda visible pendiente.

### Deudas semanticas (no de tamaño, no urgentes)

| Item | Detectado en | Detalle |
|---|---|---|
| D-1 override silencioso strings-content.js | s81 audit | 3 keys `breathe.phase.*` con valores distintos (Inhale again vs more; Oceanic vs Ocean). 8 keys mas duplicadas pero coincidentes. Decision futura |
| D-2 duplicidad "Hecho hoy" | s81 audit | `path.card.done` + `paths.library.doneToday` mismo valor, dos keys. Consolidar a una |
| D-3 namespaces path / paths inconsistentes | s81 audit (existente desde s53) | Singular `path.*` (runner, hydrate, card, error) + plural `paths.*` (library, suggested, path, kind, runner.repeat). Mezcla historica |
| D-4 15 glifos pendientes sin aprobar | s84 | World's greatest stretch, Cossack squat, Pigeon, ATG split squat, Tibialis raise, Nordics, Sissy squat, Deep squat hold, Crawling, Ground sitting transitions, Inclinacion lateral, Escalenos, Wrist circles, Seated twist, Ankle circles. Iteraciones v8/v9/v10/v11/v12/v13 disponibles en exploracion del usuario pero no en `window.APPROVED`. Portar cuando el usuario apruebe |
| D-5 divergencia move.desk.quick paso 5 | s84 | HTML del usuario lista `Apertura de pecho` donde repo lista `Chin tucks`. Decision de catalogo en sesion futura (modificar EXTRA_ROUTINES o mantener repo) |
| D-6 strokeWidth wrapper G | s84 | Versiones aprobadas del HTML usan 1.5 (v3-v8, v12) o 2.0 (v9), pero wrapper G del repo unifica a 1.8. Si el usuario quiere unificar a 2.0 (estilo V9), cambio aislado del wrapper afecta los 46 glifos por igual |
