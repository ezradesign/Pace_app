# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.40.0
**Ultima sesion:** #95 -- 2026-07-08 - feat(entitlement): **Cirugia 1 -- guard central de entitlement + degustacion explicita**. Nuevo `app/state-entitlement.jsx` con `canAccessRoutine`/`canAccessPath` como UNICO punto de verdad del acceso (hoy derivado de `premiumUnlocked`; el sitio que cambiara con la licencia). Consumido por RoutineCard (gate de las 3 bibliotecas) + PathBreatheStep/PathBodyStep + getSuggestedPath. `path.weekend` deja de ser excepcion tacita: sus 2 steps premium llevan `tasting:true` explicito que el guard reconoce. `PathStepLocked` (auto-skip silencioso) como fallback defensivo. Autofocus del Welcome enguardado tras `(pointer: coarse)` (sin auto-teclado en movil). **Comportamiento observable identico con `premiumUnlocked=false`.** NO toca F3b. Bump **v0.40.0**. Diario: `docs/sessions/session-95-guard-entitlement.md`
**Ultima actualizacion de este archivo:** 2026-07-08 - sesion 95
**Build entregado:** `PACE_standalone.html` v0.40.0 (719 KB) + `index.html` (idem, SHA256 identico)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.40.0** (s95: + script tag `state-entitlement.jsx` antes de state-paths + titulo bump) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.40.0** (719 KB, 70 archivos, regenerado s95) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.40.0** (s95: regenerado por build-standalone.js, SHA256 identico) |
| `app/state-entitlement.jsx` | Guard central de entitlement: `canAccessRoutine`/`canAccessPath` -- UNICO punto de verdad del acceso | **v0.40.0** (nuevo s95, ~65 ln; hoy derivan de `premiumUnlocked`, con degustacion via `{tasting}`; EL sitio que cambiara con la licencia) |
| `app/custom/exercise-registry.js` | Registro interno de ejercicios (65 items / 8 grupos, curado a mano) + getExerciseDef -- alimenta el constructor, NO biblioteca navegable | **v0.38.0** (nuevo s93, 136 ln; name = ES canonico = key de glifo) |
| `app/custom/CustomRoutines.jsx` | Seccion "Tus rutinas" en MoveLibrary (locked/empty/cards + crear) + CustomRoutineCard con lapiz | **v0.38.0** (nuevo s93, 164 ln; superficie premium entera, RoutineCard intocado) |
| `app/custom/CustomBuilder.jsx` | Modal constructor 2 vistas (editor con steppers/reordenar/borrar 2-toques + picker agrupado) | **v0.38.0** (nuevo s93, 259 ln; overlay singleton via CustomEvent pace:open-custom-builder) |
| `app/state-custom.jsx` | CUSTOM_LIMITS + CRUD de customRoutines (sanitize + lectura defensiva) | **v0.38.0** (nuevo s93, 100 ln; split por dominio estilo s57) |
| `app/i18n/content/custom.js` | Patch EN del registro: custom.ex.<name ES>.{name,cue} + custom.cat.*.label | **v0.38.0** (nuevo s93, 168 ln; reutiliza los EN de content/move+extra) |
| `app/glyphs/exercise-glyphs.jsx` | 46 glifos SVG line-art para Move/Stretch (sistema 1) | **v0.34.0** (s84: 28 ports + 18 mantenimientos -- iter cerrado 31/46 aprobados + 15 pendientes; 527 -> 554 ln) |
| `app/glyphs/achievement-glyphs.jsx` | 34 glifos SVG heraldica para Logros (sistema 2) -- strings de SVG, `Object.assign(window, { ACHIEVEMENT_GLYPHS })` | **v0.33.3** (nuevo s83, 68 ln) |
| `LICENSE` | Elastic License 2.0 en la raiz | Sin cambios desde v0.12.9 |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standalone |
| `app/ui/Sound.jsx` | Sonidos sintetizados Web Audio | **v0.35.0** (s90: `ambientDrone.start(force)` + flag interno `forced` -- bypasa ambientOn para Coherente 432, soundOn manda siempre; primera modificacion desde v0.21.0, ~10 ln) |
| `app/ui/SessionShell.jsx` | Cascara compartida de sesiones activas | **v0.17.0** |
| `app/ui/Primitives.jsx` | Modal, Card, Tag, Button, Divider, Meta, PremiumSeal, displayItalic | **v0.34.3** (s87: + `PremiumSeal` chip reutilizable --premium; s88: ahora tambien consumido por TweaksPanel, sin cambios en el componente) |
| `app/tweaks/TweakSecretsWatcher.jsx` | Detectores de secretos | **v0.22.0** |
| `app/tweaks/TweaksPanel.jsx` | Panel de Ajustes (ejes + agua + reset; orquesta TweaksDataSection y PremiumSection) | **v0.34.5** (s89: split 519->351 ln + stepper "Objetivo de agua" 4-12 con patch funcional `set(s=>...)`. s88: superficie premium. s71: reorden) |
| `app/tweaks/TweaksData.jsx` | Seccion "Tus datos" -- Export/Import JSON + msg + iconos + tweaksDataStyles | **v0.34.5** (nuevo s89, 193 ln; logica de s17 intacta, extraida literal) |
| `app/tweaks/PremiumSection.jsx` | Superficie premium display-only (sello + input licencia disabled + copy honesto) | **v0.34.5** (nuevo s89, 47 ln; creada en s88 dentro del panel, extraida s89) |
| `app/breathe/BreatheVisual.jsx` | Respiracion - visual + getSequence | **v0.35.0** (s90: +4 patrones F4 en getSequence -- diaphragm/yin/bhramari/co2, 230 ln; s89: `data-pace-essential` en los 5 wrappers -- exime la guia de respiracion del kill de prefers-reduced-motion) |
| `app/breathe/BreatheLibrary.jsx` | Respiracion - biblioteca + seguridad (define `RoutineCard`, compartido por los 3 modulos) | **v0.40.0** (s95: `RoutineCard.isLocked = !canAccessRoutine(id)` -- gate real via guard central, equivalente exacto, `usePace()` para reactividad, `isPremium` sigue inline; s90: F4 12->20 tecnicas + free-first; s88: gating premiumUnlocked) |
| `app/breathe/BreatheSession.jsx` | Respiracion - sesion guiada | **v0.35.0** (s90: +3 labels en PHASE_KEYS + mapeo playPhaseSound + `drone.start(routine.drone === true)`; s67: playPhaseSound helper + fix huecos A/B/C inhalacion) |
| `app/move/MoveModule.jsx` | Modulo Mueve | **v0.38.0** (s93: MoveLibrary monta CustomRoutinesSection tras los grupos + helper `tStep` para EN de pasos custom por nombre + displayRoutine salta lookup en custom, 436 ln; s92: F6 7->14 + MOVE_ROUTINES agrupado) |
| `app/extra/ExtraModule.jsx` | Modulo Estira | **v0.36.0** (s91: F5 7->14 rutinas + `EXTRA_ROUTINES` agrupado en 4 grupos como Respira + `getExtraRoutine` adaptado, 204 ln; s88: atg.knees + ancestral a premium) |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.39.0** (s94: clipPath del mini-sendero con id unico por instancia `sendero-clip-<useId>`, +5 ln -> 535; OJO: ya estaba en ~530 ln, no en las 497 registradas -- vuelve a deuda) |
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
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.40.0** (s95: solo bump PACE_VERSION; s93: + `customRoutines: []` en defaultState, 511 ln; s89: + `detectInitialPalette()`; s88: + `premiumUnlocked:false`) |
| `app/state-timer.jsx` | addFocusMinutes, completePomodoro | **v0.28.8** (s69: getDayIndexMondayFirst en addFocusMinutes + checkFocusDayAchievement) |
| `app/state-hydrate.jsx` | addWaterGlass | **v0.28.8** (s69: getDayIndexMondayFirst en addWaterGlass) |
| `app/state-achievements.jsx` | unlockAchievement, detectores, complete*Session | **v0.32.0** (s78: + checkAllPathsCompleted + export a window; s69: getDayIndexMondayFirst en 4 escritores de weeklyStats + checkRetreatAchievement) |
| `app/state-paths.jsx` | Caminos CRUD + stats | **v0.40.0** (s95: `getSuggestedPath` salta candidatos con `!canAccessPath` en cada nivel -- hoy todos free, jerarquia identica; s78: jerarquia lastViewed>horario>anytime>catalog[0]; s75: lastViewed + setLastViewedPath) |
| `app/state-settings.jsx` | setLang | **v0.27.5** (nuevo s57) |
| `app/state.jsx` | Indice — re-export consolidado | **v0.40.0** (s95: + `canAccessRoutine`/`canAccessPath`; s75: + setLastViewedPath; s69: recompute*/getDayIndexMondayFirst/getMondayOf) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez | **v0.40.0** (s95: autofocus del input intencion enguardado tras `matchMedia('(pointer: coarse)')` -- solo escritorio, no auto-teclado en movil; s19: base) |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.32.1** (s79: fade-out aditivo 300ms via estado exiting + opacity transition; visible TOAST_DURATION_MS sin cambios; s77b: TOAST_DURATION_MS de window con fallback 3000ms) |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | **v0.28.9** (s71: PaceLogoImage invert+screen en oscuro) |
| `app/main.jsx` | Orquestador puro (composicion + state + handlers + JSX root) | **v0.33.2** (s82: split mecanico variante B, 600 ln -> 279 ln, -53% -- TopBar/ActivityBar/CSS responsive a `app/main/`) |
| `app/main/_responsive.js` | IIFE: inyecta `<style id="pace-main-responsive-css">` con reglas @media globales (TopBar, ActivityBar, main content, sidebar handle, fallback vh/dvh) | **v0.33.2** (nuevo s82, 105 ln; literal de main.jsx 20-112) |
| `app/main/TopBar.jsx` | Tabs Foco/Pausa/Larga + 3 iconos top-right (Stats prop / Logros CustomEvent / Tweaks prop) + topBarStyles | **v0.33.2** (nuevo s82, 106 ln) |
| `app/main/ActivityBar.jsx` | 4 chips Respira/Estira/Mueve/Hidratate + 4 iconos SVG inline (ABBreathe/ABStretch/ABMove/ABDrop) + responsive grid | **v0.33.2** (nuevo s82, 170 ln) |
| `app/i18n/strings/_bootstrap.js` | Crea window.PACE_STRINGS = { es:{}, en:{} } vacio | **v0.33.1** (nuevo s81, 15 ln) |
| `app/i18n/strings/ui.js` | i18n shell UI: welcome + support + sidebar + topbar + activity + settings + tweaks + break + premium | **v0.34.5** (s89: + `tweaks.eje.water`/`tweaks.water.value` ES+EN; s88: + `premium.tweaks.*`; s87: + `premium.seal`/`premium.soon`) |
| `app/i18n/strings/sessions.js` | i18n actividades vivas: session + common + lib + focus + breathe (phases/sesion/safety) + lib breathe/move/extra + move + hydrate + custom | **v0.38.0** (s93: +~33 keys `custom.*` ES+EN chrome del constructor, 329 ln; s90: +3 fases F4; nuevo s81) |
| `app/i18n/strings/paths.js` | i18n Caminos: path runner + names + kind + library + suggested + hydrate + error + card | **v0.33.1** (nuevo s81, 122 ln; 47 ES + 47 EN) |
| `app/i18n/strings/stats.js` | i18n panel Ritmo: stats base + tabs + heatmap mensual + vista anual + caminos | **v0.33.1** (nuevo s81, 108 ln; 42 ES + 42 EN) |
| `app/i18n/strings/achievements.js` | i18n catalogo de logros: ach.cat/seal/toast | **v0.33.1** (nuevo s81, 40 ln; 16 ES + 16 EN) |
| `app/i18n/content/breathe.js` | Patch EN de contenido Respira: fases (con override D-1) + categorias + 20 tecnicas | **v0.37.0** (nuevo s92, 94 ln; split de strings-content.js al superar ~470 ln con F6) |
| `app/i18n/content/move.js` | Patch EN de contenido Mueve (ids extra.*): grupos mueve.cat.* + 14 rutinas | **v0.37.0** (nuevo s92, 186 ln; incluye ~100 keys F6) |
| `app/i18n/content/extra.js` | Patch EN de contenido Estira (ids move.*): grupos extra.cat.* + 14 rutinas | **v0.37.0** (nuevo s92, 202 ln) |
| `app/tokens.css` | Tokens CSS + base | **v0.34.5** (s89: reduced-motion recalibrado -- el kill global exime subtrees `[data-pace-essential]` via :not() L4; s87: + `--premium`/`--premium-soft`; s79: recalibrado oscuro +10%; s77/s77b: tokens transicion + --focus-cta) |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.40.0** (s95: `tasting:true` en los 2 steps premium de path.weekend -- degustacion curada explicita para el guard; s78: catalogo cerrado a 7 con path.tea/path.breath) |
| `app/paths/PathRunner.jsx` | Runner de caminos -- SOLO orquestador (maquina de fases + dispatcher) | **v0.33.0** (s80: split, 835->244 ln, -71%; useRef removido del destructure; dispatcher PathHydrateStep uniformado a step/onExit) |
| `app/paths/PathRunner.parts.jsx` | PathTopBar + ExitConfirmModal + StepError + PathStepLocked (chrome del overlay) | **v0.40.0** (s95: + `PathStepLocked` -- auto-skip silencioso de un step premium inaccesible, dead code hoy; s94: boton confirmar tokenizado; ~142 ln) |
| `app/paths/CompletionScreen.jsx` | Pantalla de Camino completado (SenderoBar 100% + recorrido + logros) | **v0.39.0** (s94: h2 stack hardcodeado -> `var(--font-display)`; 206 ln; CS_ROMAN local) |
| `app/paths/steps/_shared.js` | window.pathStepStyles = { btnTypography, btnOutline } | **v0.33.0** (nuevo s80, 23 ln) |
| `app/paths/steps/PathBreatheStep.jsx` | Step Respira + SafetyGate | **v0.40.0** (s95: consulta `canAccessRoutine(id, {tasting})` -> false = PathStepLocked; nuevo s80) |
| `app/paths/steps/PathFocusStep.jsx` | Step Foco (Pomodoro contextual de Camino) | **v0.34.2** (s86: + `updateStreak()` tras acreditar foco -- F-1, el foco-en-Camino cuenta para la racha como la home; nuevo s80, compone btnBase desde _shared.js) |
| `app/paths/steps/PathHydrateStep.jsx` | Step Hidratacion | **v0.33.0** (nuevo s80, 113 ln; compone btnBase desde _shared.js + padding 28; firma uniformada a (step, onExit)) |
| `app/paths/steps/PathBodyStep.jsx` | Step Cuerpo (dispatcher Move/Extra via resolveBodyRoutine) | **v0.40.0** (s95: consulta `canAccessRoutine(id, {tasting})` -> false = PathStepLocked; nuevo s80) |
| `app/paths/PathTransitions.jsx` | Cards intro/step/outro entre pantallas del Camino | **v0.39.0** (s94: titulo + hint a `var(--font-display)` -- siguen data-font; 251 ln) |
| `app/paths/SenderoBar.jsx` | Sendero visual del progreso interno | **v0.31.0** (s94: auditado contra DESIGN_SYSTEM, limpio -- cero cambios; s77b: prop sticky retirada + hito-labels solo done; 180 ln) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.39.0** (s94: `--olive`(huerfana)->`--focus` en barra de acento (estaba invisible) y asterisco + asterisco a font-display + transitions a tokens; 192 ln) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.39.0** (s94: `--olive`(huerfana)->`--focus` x3 (barra/tag Favorito/boton Fav) + panel a `--sh-modal` + transition a tokens; 180 ln) |
| `manifest.json` | PWA manifest | **v0.28.5** (s65: reescrito -- PNGs, start_url /,  scope /, theme crema) |
| `sw.js` | Service Worker PWA | **v0.40.0** (s95: CACHE_NAME pace-v0.40.0; s89: activate borra caches pace-* viejos + navegaciones network-first con fallback a cache) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |
| `.claude/static-server.js` | Mini servidor estatico del preview (s80) | **v0.38.0** (s93: + `Cache-Control: no-store` -- sin validadores Chrome cacheaba .jsx heuristicamente y la verificacion veia codigo viejo) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.39.0_20260708.html` <- creado s95 (snapshot del v0.39.0 publicado en s94)
- `backups/PACE_standalone_v0.38.0_20260708.html` <- creado s94 (snapshot del v0.38.0 publicado en s93)
- `backups/PACE_standalone_v0.37.0_20260708.html` <- creado s93 (snapshot del v0.37.0 publicado en s92)
- `backups/PACE_standalone_v0.36.0_20260707.html` <- creado s92 (snapshot del v0.36.0 publicado en s91)
- `backups/PACE_standalone_v0.35.0_20260707.html` <- creado s91 (snapshot del v0.35.0 publicado en s90)
- `backups/PACE_standalone_v0.34.5_20260707.html` <- creado s90 (snapshot del v0.34.5 publicado en s89)
- `backups/PACE_standalone_v0.34.4_20260707.html` <- creado s89 (snapshot del v0.34.4 publicado en s88)
- `backups/PACE_standalone_v0.34.3_20260707.html` <- creado s88 (snapshot del v0.34.3 publicado en s87; renombrado en s89 al corregir la fecha real de s88)
- `backups/PACE_standalone_v0.34.2_20260630.html` <- creado s87 (snapshot del v0.34.2 publicado en s86, desde git HEAD)
- `backups/PACE_standalone_v0.34.1_20260605.html` <- creado s86 (snapshot del v0.34.1 publicado en s85)
- `backups/PACE_standalone_v0.34.0_20260605.html` <- creado s85 (snapshot del v0.34.0 publicado en s84)
- `backups/PACE_standalone_v0.33.3_20260524.html` <- creado s84 (copia del v0.33.3 publicado en s83)
- `backups/PACE_standalone_v0.33.2_20260523.html` <- creado s83
- `backups/PACE_standalone_v0.33.1_20260523.html` <- creado s82
- `backups/PACE_standalone_v0.33.0_20260519.html` <- creado s81
- `backups/PACE_standalone_v0.32.1_20260518.html` <- creado s80
- `backups/PACE_standalone_v0.32.0_20260518.html`
- `backups/PACE_standalone_v0.31.0_20260517.html`
- `backups/PACE_standalone_v0.30.0_20260517.html`
- `backups/PACE_standalone_v0.29.0_20260516.html`

Nota s95: cap 20 mantenido rotando el mas antiguo (`v0.28.12_20260516.html`)
al crear el backup del v0.39.0.

---

## Ultima sesion (resumen operativo)

**Sesion 95 - v0.40.0 - feat(entitlement): Cirugia 1 -- guard central de
entitlement + degustacion explicita.** Primera sesion del plan maestro
post-bloque.

### Que se hizo (s95)

- **Tarea 0**: commit s94 (`995f513`, v0.39.0) en git ✓, working tree
  limpio. Mapeados los 7 puntos que leen acceso hoy; **verificado que
  `path.weekend` es el UNICO Camino que referencia rutinas premium**
  (nadi.shodhana + atg.knees) -> solo el necesita degustacion explicita.
- **Guard central** `app/state-entitlement.jsx` (nuevo, ~65 ln, cargado
  antes de state-paths, re-exportado en state.jsx):
  `canAccessRoutine(id, {tasting})` (desconocida->true fail-open,
  free->true, premium->`premiumUnlocked||tasting`) y `canAccessPath(id)`
  (paths free hoy -> true). UNICO punto de verdad; el sitio que cambiara
  con la licencia.
- **Degustacion explicita**: los 2 steps premium de `path.weekend` llevan
  `tasting:true` en registry.js. Deja de ser excepcion tacita; el
  comportamiento no cambia (weekend sigue lanzando ambas).
- **Consumidores**: `RoutineCard` (gate de las 3 bibliotecas) ->
  `isLocked = !canAccessRoutine(id)` (equivalente exacto, `usePace()` para
  reactividad, `isPremium` inline para el sello). `PathBreatheStep`/
  `PathBodyStep` consultan el guard con `{tasting: step.tasting}` ->
  rama false = `PathStepLocked` (auto-skip silencioso, nuevo en
  PathRunner.parts.jsx, dead code hoy). `getSuggestedPath` salta
  candidatos con `!canAccessPath` en cada nivel. `CustomRoutinesSection`
  se queda en `premiumUnlocked` (feature-gate, no routineId).
- **Autofocus Welcome**: el `setTimeout(focus)` se enguarda tras
  `matchMedia('(pointer: coarse)')` -> autofocus solo en escritorio (no
  auto-teclado en movil).

### Verificacion + cierre

Preview :8765, protocolo s93 (purga SW+caches tras cada tanda). Con
`premiumUnlocked=false`: guard verificado por caso; biblioteca con las 8
premium en sello+"Pronto"+`cursor:default` y free clicables (**gating
identico al previo**); **degustacion viva** -- `path.weekend` lanza la
sesion de Nadi Shodhana (premium) en vivo, sin bloqueo. Con
`premiumUnlocked=true` (snapshot + restaurado): premium clicables con sello,
"Pronto"->min (reactividad via usePace). Welcome: puntero fino enfoca el
input; forzando `(pointer: coarse)` NO enfoca (activeElement=BODY -- el
preview no emula coarse al redimensionar, se verifico forzando matchMedia).
`getSuggestedPath`->path.afternoon. EN: premium con "Soon". Estado
restaurado (lang=es, premium=false, sin path). Consola sin errores.
Cierre: backup `v0.39.0_20260708` (rotado `v0.28.12`, cap 20), rebuild
standalone+index (719 KB, 70 archivos, SHA256 identico), standalone
verificado en preview (v0.40.0, guard + 2 tasting), diario s95, CHANGELOG
(v0.38.0 degradado a enlace), ROADMAP (s95 hecha), memoria actualizada.

## Proxima sesion -- s96: timer engine timestamp-based

Segunda cirugia del plan maestro (ver `ROADMAP.md`, "Camino a v1.0"):
motor de timer basado en timestamps (idle/running/paused/completed) que no
derive en background + migrar FocusTimer y PathFocusStep +
`completeFocusSession()` unificado. Prioridad de fix: Focus (critico) >
Breathe (activeTime, s97) > Move.

### Despues -- Plan maestro v1.0 (adoptado s93)

Secuencia completa en `ROADMAP.md` ("Camino a v1.0"): s96 timer engine ·
s97 breathe activeTime · s98 stats vivos + safety/privacy · s99 PWA
completa · s100-101 build Etapa A (precompilar ANTES que Vite) · s102
onboarding · s103 home Caminos al centro · s104-105 taxonomia + filtros +
sigilo · pre-venta: glifos D-4 + trial/licencia (cambiando formalmente la
decision F3b) + landing.

---

## Decisiones activas

| Decision | Desde | Detalle |
|---|---|---|
| Bloque Contenido+Premium: gating a nivel sesion | s85 | La unidad gateable es lo que pulsas "empezar" (Respira=tecnica, Mueve/Estira=rutina). NO se exponen ejercicios sueltos navegables (gatear pasos dentro de una rutina = muro de pago a mitad de flujo). El registro interno de ejercicios se reserva para el constructor premium (F7). Ver CONTENT.md + ROADMAP.md |
| Gating ANTES del contenido | s85 | El modelo de access + sello premium va en F3, antes de crecer el catalogo (F4-F6). No se puede etiquetar access con honestidad sin el campo ni el sello visible |
| Copy BMC: nucleo libre (opcion A) + premium aparte | s85 | El modal Buy Me a Coffee queda como donacion pura (truth-fix: "el nucleo es gratis", fuera "sin pro"). El premium tendra superficie propia discreta en Tweaks (F3). Donar NO desbloquea nada; secret.supporter solo de honor |
| Campo `access` solo en paths/registry.js -- SUPERSEDED s88 | s85 | (Historico) Los datos de ejercicios no tenian `access`. En s88 (F3b) se anadio `access:'premium'` a 8 de las 26 rutinas. Caminos siguen todos free |
| F3b solo binario free/premium (locked.* y licencia real diferidos) | s88 | F3b enciende lo construido en F3a sin abrir el sistema de licencia. Los estados intermedios `locked.initial`/`locked.achievement`/`locked.both` de MONETIZATION.md y la validacion de clave firmada (expiresAt, tipos lifetime/pass/season) quedan para post-v1.0. NO implementar validacion |
| Set premium = 8/26, ~1/3 por modulo, solo lo mas profundo | s88 | El usuario aprobo la direccion pero pidio menos premium. Criterio binario: entrada/accesible=free (incl. las 2 iniciales por modulo y las variantes *mas largas* como box.6/coherent.66), avanzado/profundo=premium. Respira 4 (rounds.full/express, nadi.shodhana, kapalabhati), Mueve 2 (wall.sit, core.stealth), Estira 2 (atg.knees, ancestral). `safety` conservado en las premium con retencion |
| `premiumUnlocked` controla el bloqueo real; el sello marca "es de pago" | s88 | `RoutineCard`: `isPremium` (sello siempre) vs `isLocked` (accent/clic off + "Pronto"). `premiumUnlocked:false` por defecto sin compra real hasta v1.0. Poner el flag a true (compra/logro futuro) abre todas las premium sin tocar UI. Input de licencia en Tweaks es display-only (disabled, sin validacion). **s95:** el calculo de `isLocked` pasa por el guard central `!canAccessRoutine(id)` (equivalente exacto) |
| Guard central de entitlement = UNICO punto de verdad del acceso | s95 | `app/state-entitlement.jsx`: `canAccessRoutine(id, {tasting})` + `canAccessPath(id)`. Todo lo que decide acceso pasa por aqui (RoutineCard, PathBreatheStep/PathBodyStep, getSuggestedPath). Hoy derivan del booleano `premiumUnlocked`; en pre-venta pasaran a licencia‖trial cambiando SOLO este archivo. **NO cambia F3b** (licencia sigue diferida): es el cableado que la implementara. `CustomRoutinesSection` queda fuera (feature-gate de la superficie del constructor, no un routineId; revisar en licencia). Regla: cualquier chequeo nuevo de acceso se anade AL guard, no suelto en un componente |
| `path.weekend` = degustacion curada, ahora EXPLICITA (`tasting:true`) | s89, explicita s95 | El Camino free lanza nadi.shodhana + atg.knees (premium) POR DISENO (D-8a). **s95:** esos 2 steps llevan `tasting:true` en registry.js -> el guard concede acceso a premium con `premiumUnlocked=false`. Deja de ser excepcion tacita; el comportamiento no cambia. La decision final (degustacion vs version free) se toma en la sesion de licencia. Logros premium-tied aceptados (D-8b). Si un Camino futuro referencia premium SIN tasting, `PathStepLocked` lo salta en silencio (candado en la puerta, nunca a mitad de flujo) |
| Autofocus del Welcome solo con puntero fino | s95 | El `setTimeout(focus)` del input intencion se enguarda tras `matchMedia('(pointer: coarse)')`: solo enfoca en escritorio. En tactil auto-abria el teclado (Android Chrome) sobre una bienvenida calmada de campo OPCIONAL; iOS lo ignoraba sin gesto. Patron reutilizable para futuros autofocus en modales de arranque |
| Reduced-motion con excepcion `data-pace-essential` | s89 | El kill global de prefers-reduced-motion exime subtrees marcados (hoy: los 5 wrappers de BreathVisual). La expansion del circulo ES la guia de respiracion (WCAG 2.3.3 motion esencial). Todo lo decorativo sigue congelado. Si un futuro componente tiene motion funcional, marcarlo con el mismo attr |
| Paleta oscura automatica SOLO en primer arranque | s89 | `detectInitialPalette()` lee prefers-color-scheme unicamente en las ramas sin estado guardado de loadState. La eleccion manual de Tweaks persiste y siempre gana; no se re-sigue el SO en caliente. Nota: usuario nuevo con SO oscuro acumula dias para secret.dark.mode desde el dia 1 (aceptado) |
| Steppers con patch funcional `set(s=>...)` | s89 | El stepper de agua usa la forma funcional del setState del store: clics rapidos en el mismo render no pisan estado (la version con closure saltaba pasos, hallado en verificacion). Patron a reutilizar en futuros steppers/contadores |
| SW: navegaciones network-first, assets cache-first, cleanup en activate | s89 | Las updates de HTML llegan sin esperar re-chequeo del SW (fallback a cache + '/' offline). activate borra todo cache pace-* != CACHE_NAME. No cambiar a cache-first puro sin revisar la estrategia de updates |
| Free-first dentro de cada grupo de biblioteca | s90 | Los items free van antes que los premium en cada grupo de las 3 bibliotecas (aplicado a Respira en F4; aplicar igual en F5/F6). El usuario free ve primero lo que puede usar; en Energia ademas orden ascendente por profundidad (bellows -> express -> full -> long) |
| `ambientDrone.start(force)` para sesiones con drone integral | s90 | `routine.drone: true` (hoy solo Coherente 432) fuerza el drone aunque ambientOn este apagado. `soundOn` (master) manda SIEMPRE; el flag `forced` interno lo respeta `resume()` (sin el, pausar+reanudar mataba el drone) y muere en `stop()`. Patron a reutilizar si otra sesion necesita sonido integral |
| Sin logros `explore.*` para tecnicas F4 (y cola D-8b cerrada) | s90 | `explorationMap` y `BREATH_ROUTINE_CATEGORIES` son mapas cerrados con guard: las 8 tecnicas nuevas no desbloquean logros de exploracion (evita inflar el catalogo, coherente con cap s78). `master.collector.half/full` usa umbrales fijos 50/100 logros -- crecer el catalogo NO lo distorsiona, cola de D-8b cerrada sin codigo. Si en F5-F7 se quieren logros nuevos de contenido, decision aparte. Aplicado tambien en F5 (s91): las 7 rutinas nuevas de Estira sin logros |
| Bibliotecas de cuerpo agrupadas (mismo shape que BREATHE_ROUTINES) | s91, cerrado s92 | `EXTRA_ROUTINES` (s91) y `MOVE_ROUTINES` (s92) son objetos agrupados `{ key: { label, aside, items } }` -- las librerias renderizan grupos con tR() y los helpers `getExtraRoutine`/`getMoveRoutine` hacen loop de grupos (misma firma). Las 3 bibliotecas quedan homogeneas (Respira/Estira/Mueve), free-first por grupo |
| Prefijo i18n `mueve.cat.*` para los grupos de Mueve | s92 | Elegido por el usuario sobre `movelib.cat.*`. `move.cat.*` descartado: el namespace `move.*` lo ocupan los ids de Estira (swap s14) y seria confuso. Regla general: los grupos de biblioteca usan prefijo del MODULO VISUAL (breathe.cat / extra.cat / mueve.cat), no del id |
| strings-content.js troceado en `app/i18n/content/` por modulo visual | s92 | Al superar ~470 ln con F6 (habria quedado ~495) se dividio en breathe.js + move.js + extra.js (nombres por modulo VISUAL: move.js contiene ids extra.* y extra.js ids move.*, como sus modulos). Cargan tras `strings/*` en PACE.html preservando el override D-1 (vive en content/breathe.js). Si un archivo de content/ se acerca a 500 ln, subdividir por dominio |
| Pasos nuevos sin glifo usan DefaultGlyph hasta aprobacion (D-4) | s91, s92 | Los pasos net-new de F5 (11) y F6 (9) renderizan el fallback de tres arcos (digno, no placeholder roto). NO dibujar glifos sin que el usuario los apruebe primero (patron s84: el usuario itera en HTML de exploracion -> port literal). La cola D-4 queda en 35 (15 de s84 + 11 de F5 + 9 de F6) |
| Registro de ejercicios CURADO a mano en `app/custom/` (no derivado runtime) | s93 | `EXERCISE_REGISTRY` = union deduplicada de los steps de MOVE+EXTRA con cue neutro y dur por defecto, 65 items / 8 grupos. Un registro derivado heredaria cues contextuales ("12 reps", "8 lentas") al azar. Al crecer los catalogos en F8+, añadir a mano los pasos que merezcan entrar al constructor. `name` = ES canonico = key de glifo |
| Rutinas custom: prefijo `custom.<Date.now()>` + credito via completeMoveSession | s93 | El prefijo jamas colisiona con `extra.*`/`move.*` (blindados) y al no estar en ningun mapa de logros (exploreMap, BREATH_ROUTINE_CATEGORIES) una sesion custom solo acredita lo generico de Mueve (moveMinutes, plan.muevete, moveSessionsTotal, first.stretch). Sin logros nuevos (decision F4 en pie). Cues no editables en F7 (vienen del registro) |
| i18n del registro por NOMBRE canonico ES como key (`custom.ex.<name>.*`) | s93 | Las rutinas custom no tienen keys posicionales `<id>.sN.*`; el EN de sus pasos se resuelve por nombre en `content/custom.js` (mismo criterio que las keys de glifo). `MoveSession.tStep` bifurca: custom por nombre, catalogo posicional. Los EN reutilizan los ya establecidos en content/move+extra para no divergir |
| Builder como overlay singleton que OCULTA MoveLibrary mientras esta abierto | s93 | Estado en main.jsx + apertura via CustomEvent `pace:open-custom-builder` (patron s50+). Ocultar la biblioteca evita que dos Modal escuchen Escape a la vez; al cerrar el builder la biblioteca reaparece (openLibrary conserva 'move'). Si otro overlay futuro convive con un Modal, mismo patron |
| Preview: purgar SW+caches tras CADA tanda de edits + static-server con no-store | s93 | El SW se re-registra en cada carga (purgarlo solo al arrancar NO basta -- s93 congelo un fix de mitad de sesion). Ademas los .jsx sin validadores se cacheaban heuristicamente en HTTP: `Cache-Control: no-store` en `.claude/static-server.js`. Diagnostico util: `window.Componente.toString()` para ver el codigo compilado real |
| Sin tokens sinonimos en tokens.css (huerfanas por reemplazo directo) | s94 | `--olive`/`--terracota` se resolvieron sustituyendo por `var(--focus)`/`var(--breathe)` en los consumidores, NO creando alias. Regla: dos nombres para el mismo color = deriva del design system. Si un modulo necesita un acento propio de verdad, token nuevo documentado en DESIGN_SYSTEM.md, no alias. Corolario s94: titulos con stack de fuente hardcodeado se tokenizan a `var(--font-display)` (el blindaje Georgia de s20 es SOLO para cifras MM:SS/racha) |
| Plan maestro v1.0 adoptado — secuencia s94→ en ROADMAP.md | s93 | Sintesis de reflexiones del usuario verificada contra el repo. Claves: build en DOS etapas (precompilar Babel+React prod+fuentes self-hosted ANTES que Vite/ESM); guard central de entitlement con degustacion explicita (path.weekend deja de ser excepcion tacita cuando llegue la licencia); trial 7 dias de arranque EXPLICITO (no auto); `premiumUnlocked` pasara a derivarse de licencia‖trial (guardar la clave, no un booleano); licencia ECDSA P-256 (no Ed25519, compat WebCrypto/WebView); cola D-4 es pre-venta; timers: Focus > Breathe > Move. Adelantar licencia = cambiar formalmente la decision F3b, no implementar por encima |
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
| `app/tweaks/TweaksPanel.jsx` | 351 | SALE (s89, antes 519 -- split en TweaksData.jsx + PremiumSection.jsx) |
| `app/state-core.jsx` | 511 | BAJA-MEDIA (s93: +5 ln customRoutines -- el CRUD fue a state-custom.jsx para no agravar; candidato natural: extraer helpers de history a state-history.jsx si vuelve a crecer) |
| `app/i18n/strings/ui.js` | ~345 | BAJA (dentro de limite, dominio mas grande del split) |
| `app/i18n/strings-content.js` | -- | SALE (s92: troceado en `app/i18n/content/` breathe 94 + move 186 + extra 202 ln al superar ~470 con F6) |
| `app/glyphs/exercise-glyphs.jsx` | 554 | BAJA (s84, dentro de limite tras port; iter cerrado 31/46 aprobados) |
| `app/achievements/Achievements.jsx` | 184 | SALE (s83, antes 409 -- split en achievements/catalog.js + glyphs/achievement-glyphs.jsx) |
| `app/main.jsx` | 279 | SALE (s82, antes 600 -- split en main/_responsive + TopBar + ActivityBar) |
| `app/shell/Sidebar.jsx` | 535 | MEDIA (s94: re-entra -- estaba en ~530 reales sin registrar desde s61, +5 ln del clipPath unico; candidato natural: extraer SenderoDelDia + StatusBar a `shell/`) |
| `app/paths/PathRunner.jsx` | 244 | SALE (s80, antes 835 -- split en steps/ + parts + CompletionScreen) |
| `app/i18n/strings.js` | -- | SALE (s81, antes 791 -- split en strings/_bootstrap + ui + sessions + paths + stats + achievements) |

**Backlog tecnico MEDIA (s89): vacio de nuevo** -- el split de TweaksPanel se
ejecuto en s89 (P0). Quedan del P2 de la auditoria
(`docs/audits/audit-producto-v0.34.4.md`): build precompilado (A-5), tests del
state (A-6), import sanitizado (A-7), manifest rico -- para el camino a v1.0,
pendientes de calendario.

### Deudas semanticas (no de tamaño, no urgentes)

| Item | Detectado en | Detalle |
|---|---|---|
| D-1 override silencioso content/breathe.js (antes strings-content.js) | s81 audit, movido s92 | 3 keys `breathe.phase.*` con valores distintos (Inhale again vs more; Oceanic vs Ocean). 8 keys mas duplicadas pero coincidentes. Tras el split s92 el override vive en `app/i18n/content/breathe.js` (mismo orden de carga). Decision futura |
| D-2 duplicidad "Hecho hoy" | s81 audit | `path.card.done` + `paths.library.doneToday` mismo valor, dos keys. Consolidar a una |
| D-3 namespaces path / paths inconsistentes | s81 audit (existente desde s53) | Singular `path.*` (runner, hydrate, card, error) + plural `paths.*` (library, suggested, path, kind, runner.repeat). Mezcla historica |
| D-4 35 glifos pendientes sin aprobar (15 de s84 + 11 de s91/F5 + 9 de s92/F6) | s84 + s91 + s92 | De s84 (iteraciones v8-v13 en exploracion, no en `window.APPROVED`): World's greatest stretch, Cossack squat, Pigeon, ATG split squat, Tibialis raise, Nordics, Sissy squat, Deep squat hold, Crawling, Ground sitting transitions, Inclinacion lateral, Escalenos, Wrist circles, Seated twist, Ankle circles. De s91/F5 (sin iteracion aun, renderizan DefaultGlyph): Gato-camello, Palmas al suelo, Rezo invertido, Circulos de hombro, Couch stretch, Onda espinal, Puente toracico, Rodar hacia abajo, Rana, Pliegue adelante, Isquio a una pierna. De s92/F6 (idem): Sentadilla a silla, Apretar gluteos, Superman, Pica en escritorio, Sentadilla bulgara, Plancha, Plancha lateral, Hollow hold, Hang activo. Portar cuando el usuario apruebe |
| D-5 divergencia move.desk.quick paso 5 | s84 | HTML del usuario lista `Apertura de pecho` donde repo lista `Chin tucks`. Decision de catalogo en sesion futura (modificar EXTRA_ROUTINES o mantener repo) |
| D-6 strokeWidth wrapper G | s84 | Versiones aprobadas del HTML usan 1.5 (v3-v8, v12) o 2.0 (v9), pero wrapper G del repo unifica a 1.8. Si el usuario quiere unificar a 2.0 (estilo V9), cambio aislado del wrapper afecta los 46 glifos por igual |
| D-7 racha foco-en-Camino (F-1) -- RESUELTO s86 | s86 audit | `PathFocusStep` no llamaba `updateStreak` -> un dia de solo-foco-en-Camino salia activo en heatmap/YearView pero no sumaba a `streak.current`. **Corregido en v0.34.2** (anadido `updateStreak()` tras el credito, idempotente por dia). Ver `docs/audits/audit-tracking-v0.34.1.md` |
| D-8 fuga premium via `path.weekend` + logros ligados a premium -- RESUELTO s89 (decision) + cola cerrada s90 | s88 audit | (a) `path.weekend` declarado **degustacion curada** (decision activa s89, cero codigo). (b) Logros premium-tied aceptados. (c) Cola cerrada en s90: `master.collector.half/full` usa umbrales fijos 50/100 logros desbloqueados, NO un denominador por catalogo -- crecer F4-F6 no lo distorsiona. Ver `docs/audits/audit-producto-v0.34.4.md` |
