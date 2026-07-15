# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.50.0
**Ultima sesion:** #105 -- 2026-07-15 - **Fuentes self-hosted (cierra Etapa A) + todayISO local + integridad de Caminos + pulido** (7 arreglos: `todayISO()` a fecha LOCAL en 7 sitios via `toISODate()` -- bug UTC anotaba el dia anterior entre medianoche y ~2 AM; **fuentes self-hosted preservando Cormorant** -- hallazgo: el default real de titulos es Cormorant, no EB Garamond, decision s103 revisada; copia local subset-latin de Cormorant+EB Garamond+Inter Tight, 12 caras 520 KB en `fonts/`, `@font-face` ruta absoluta `/fonts/`, precache web + data URIs standalone via `inlineFonts`, JetBrains Mono retirada -> ui-monospace, MIME woff2, cero peticiones a Google en los 3 artefactos; **BreakMenu coherente** -- iconos `AB*` de la home + Estira, 4 actividades grid 2x2; **aro del pomodoro** alineado en Pausa/Larga (spacer que reserva la fila MIN); **frame fantasma de PathRunner** resuelto -- fase 'intro' fijada en render, no en efecto, sin warning; **toasts de logro aplazados** durante Caminos; **bug de integridad B** -- un Camino solo cuenta con >=1 paso hecho de verdad, antes saltarlo todo desbloqueaba "Cartografa"). Diario: `docs/sessions/session-105-fuentes-todayiso-caminos.md`. **Etapa A del build CERRADA** (precompilado s103 + fuentes s105). Historico previo: [`ARTE D-4 s104`](./CHANGELOG.md#v0490----2026-07-14----featpaths-escenas-ilustradas-de-caminos--arte-d-4-completo) (el usuario ENTREGO las 7 laminas y las priorizo sobre las fuentes, que pasan a s105; diseño iterado EN VIVO: 2 tandas AskUserQuestion + 4 rondas de feedback con mockups suyos). Escena cover FULL-BLEED en las 3 pantallas del runner (`PathIllustration.jsx` + `paths.index.js` con dots/paper/focusY/finish medidos por escaneo, no a ojo); **casquetes** (las bolas pintadas van cubiertas en gris `--line` → se RELLENAN con el color de SU actividad al completarse, pop `pace-scene-fill` + eco de latido; el orbe s77 RETIRADO por feedback); camara que sigue al hito actual (pan 2s) y encuadra el FINAL del camino en la Completion (`finish`); etiqueta del paso ANCLADA a la bola (placa mini de papel del arte, tinta `--ink-2/-3`); **tagline en la IntroCard** (beneficio visible); placa translucida tras RECORRIDO/DESBLOQUEADO; regla **"sobre el arte siempre es de dia"** (`[data-pace-scene-card]` re-mapea tinta/papel/acentos a crema en oscuro); pipeline **archivo+precache web / data URI solo standalone**; `scripts/ingest-lamina.js` (normaliza+mide, MODO HIBRIDO con semillas visuales). Fix `PACE_VERSION` (v0.46.0 desde s101). Analisis estrategico externo VERIFICADO contra el repo: `todayISO()` en UTC = bug real (7 sitios) → tarea s105; CowLogo corrupto = FALSO. Fallback SenderoBar intacto. Diario: `docs/sessions/session-104-arte-caminos.md`
**Ultima actualizacion de este archivo:** 2026-07-15 - sesion 105
**Build entregado:** `PACE_standalone.html` v0.50.0 (3052 KB, 7 laminas + 12 fuentes inline, 100% autocontenido, cero peticiones externas) + `index.html` (~970 KB, laminas + fuentes como archivo + precache + `<link rel="manifest">`)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.49.0** (s104: bump titulo + 2 scripts nuevos de laminas tras SenderoBar y ANTES de PathTransitions/CompletionScreen; dev sigue CDN development + Babel standalone) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.49.0** (2371 KB, 76 scripts compilados + **7 laminas de Caminos como data URI** -- paso 6b del build; solo queda el @import de Google Fonts → s105; sigue SIN link de manifest, file://) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.49.0** (970 KB -- las laminas van como ARCHIVOS `/app/paths/illustrations/assets/*.webp` + precache, NO data URIs; + `<link rel="manifest">` re-insertado -- s102) |
| `vendor/` | React 18.3.1 production UMD self-hosted (react + react-dom .min.js) | **NUEVO s103** (copiados del paquete npm, verificados por integrity del lockfile; el build los inlinea -- NO se sirven como archivos) |
| `package.json` + `package-lock.json` | Toolchain del build (devDependencies) | **s104**: + `sharp` (ingesta de laminas). s103: `@babel/core`/`preset-env`/`preset-react` PINEADOS a major 7 + `typescript` a major 5 + react/react-dom 18.3.1 (fuente de vendor/). OJO: los latest (Babel 8 ESM-only, TS 7 Go) ROMPEN el build -- no subir de major sin sesion propia |
| `app/paths/illustrations/paths.index.js` | Indice de laminas: pathId → dots {x,y,r,color} + paper + focusY + finish (metadatos MEDIDOS por escaneo) | **NUEVO s104** (~110 ln; las 7 laminas dentro; el build busca el literal del campo src -- no escribir esa ruta en comentarios) |
| `app/paths/illustrations/PathIllustration.jsx` | Escena cover full-bleed del runner: casquetes gris→color de actividad, pulso/pop/eco, camara con pan, etiqueta del paso en placa | **NUEVO s104** (~230 ln; fallback = los padres renderizan SenderoBar si getPathIllustration(pathId) es null) |
| `app/paths/illustrations/assets/*.webp` | Las 7 laminas normalizadas (1365x768, WebP q82) | **NUEVO s104** (~1.1 MB total; web las sirve + precache, standalone las inlinea) |
| `scripts/ingest-lamina.js` | Ingesta de laminas: normaliza + mide bolas/papel + emite bloque del indice | **NUEVO s104** (~200 ln; MODO HIBRIDO canonico: semillas visuales "x:y,..." 4º arg + centroide local + crecimiento radial -- el detector 100% automatico NO es fiable en laminas calidas) |
| `safety.html` | Pagina estatica `/safety` (Cloudflare Pages) -- disclaimers respiracion/movilidad, ES+EN | **v0.46.0** (nueva s101, ~190 ln; autocontenida, rama oscura via prefers-color-scheme, paleta COPIADA de tokens.css; sin enlazar desde la UI aun) |
| `privacy.html` | Pagina estatica `/privacy` (Cloudflare Pages) -- local-first, sin cuentas/analitica, ES+EN | **v0.46.0** (nueva s101, ~190 ln; misma base visual que safety.html) |
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
| `app/ui/SessionShell.jsx` | Cascara compartida de sesiones activas | **v0.45.0** (s100: `sessionAtmosphere` suavizado -- hint 22% + grano SVG feTurbulence 4% como dither anti-banding, 364 ln; s99: prop `atmosphere` + helper a window; s97: SessionPrep caption; s17 base) |
| `app/ui/Primitives.jsx` | Modal, Card, Tag, Button, Divider, Meta, PremiumSeal, displayItalic | **v0.44.0** (s99: card del Modal entra con `pace-modal-in` scale+fade; s87: + `PremiumSeal`; s88: consumido por TweaksPanel) |
| `app/tweaks/TweakSecretsWatcher.jsx` | Detectores de secretos | **v0.22.0** |
| `app/tweaks/TweaksPanel.jsx` | Panel de Ajustes (ejes + agua + notificacion + reset + legal; orquesta TweaksDataSection y PremiumSection) | **v0.47.0** (s102: + bloque "Aviso de fin de Foco" tras Audio (permiso al activar, hint blocked con re-render forzado) + enlaces Seguridad·Privacidad tras Reset (gate `isWeb` compartido), 430 ln. s89: split 519->351 + stepper agua) |
| `app/tweaks/TweaksData.jsx` | Seccion "Tus datos" -- Export/Import JSON + msg + iconos + tweaksDataStyles | **v0.34.5** (nuevo s89, 193 ln; logica de s17 intacta, extraida literal) |
| `app/tweaks/PremiumSection.jsx` | Superficie premium display-only (sello + input licencia disabled + copy honesto) | **v0.34.5** (nuevo s89, 47 ln; creada en s88 dentro del panel, extraida s89) |
| `app/breathe/BreatheVisual.jsx` | Respiracion - visual + getSequence | **v0.35.0** (s90: +4 patrones F4 en getSequence -- diaphragm/yin/bhramari/co2, 230 ln; s89: `data-pace-essential` en los 5 wrappers -- exime la guia de respiracion del kill de prefers-reduced-motion) |
| `app/breathe/BreatheLibrary.jsx` | Respiracion - biblioteca + seguridad (define `RoutineCard`, compartido por los 3 modulos) | **v0.40.0** (s95: `RoutineCard.isLocked = !canAccessRoutine(id)` -- gate real via guard central, equivalente exacto, `usePace()` para reactividad, `isPremium` sigue inline; s90: F4 12->20 tecnicas + free-first; s88: gating premiumUnlocked) |
| `app/breathe/BreatheSession.jsx` | Respiracion - sesion guiada | **v0.44.0** (s99: recibe `inPath` -> SessionDone "Siguiente" + atmosfera por paso. s98: **reloj de tiempo activo timestamp-based** `activeMsRef`/`segStartRef`/`getActiveSec()` -- alimenta fin no-rounds + barra + credito (minutos activos, no `routine.min`); retira `startTime`/`cycle`/`doneInCycle`. s97: barra SEGMENTADA por bloques (tope 24). s90: +3 labels + drone; s67: playPhaseSound) |
| `app/move/MoveModule.jsx` | Modulo Mueve | **v0.44.0** (s99: MoveSession recibe `inPath` -> SessionDone "Siguiente" + atmosfera. s97: countdown de paso centrado 22/22 + lineHeight 1.08. s93: CustomRoutinesSection + tStep, ~440 ln; s92: F6 7->14) |
| `app/extra/ExtraModule.jsx` | Modulo Estira | **v0.36.0** (s91: F5 7->14 rutinas + `EXTRA_ROUTINES` agrupado en 4 grupos como Respira + `getExtraRoutine` adaptado, 204 ln; s88: atg.knees + ancestral a premium) |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.46.0** (s101: WeekDots con criterio "dia activo" s69 -- focus\|breath\|move>0, antes solo foco encendia el punto; +6 ln -> 541, sigue en deuda; s94: clipPath unico por instancia) |
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.47.0** (s102: notificacion en onComplete rama foco + 2 efectos de persistencia (restore al montar / persist en running), 493 ln -- OJO al borde del tope, helpers nuevos van a FocusTimer.support.jsx. s99: glow + data-pace-cta. s96: useCountdown) |
| `app/focus/useCountdown.jsx` | Motor de cuenta atras timestamp-based compartido (FocusTimer home + PathFocusStep Camino) | **v0.47.0** (s102: + `restore(endsAtMs)` -- reanuda desde idle con el endsAt ORIGINAL (el tiempo de la recarga cuenta como transcurrido) + expone `endsAt` solo en running, 158 ln. s97: idle deriva de durationSec. s96: nuevo, `endsAt` como verdad, `completed` terminal) |
| `app/ui/TimerDial.jsx` | Anillo circular compartido (FocusTimer + PathFocusStep) | **v0.44.0** (s99: prop `running` -> `data-pace-dial-running` (glow) + **variante `ticks`** (60 marcas tipo reloj + numero protagonista, la usa el Foco de Camino) + punto guia home -50%; s76 base, sigue presentacional) |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.15.0** |
| `app/achievements/Achievements.jsx` | UI pura del catalogo (Achievements modal + Seal componente + renderGlyph + isImplemented) | **v0.33.3** (s83: split mecanico variante B, 409 ln -> 184 ln, -55% -- DATA migrada a catalog.js + glifos a app/glyphs/achievement-glyphs.jsx; lee globales como `const X = window.X || fallback`) |
| `app/achievements/catalog.js` | ACHIEVEMENT_CATALOG (106 entradas) + CAT_META (7 categorias) + IMPLEMENTED_ACHIEVEMENTS (Set 69 ids) -- expone los 3 a window | **v0.33.3** (nuevo s83, 209 ln; lee `window.ACHIEVEMENT_GLYPHS` para entradas con glyphSvg) |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.5** (s64: overflowY:hidden en data-pyv-wrap -- fix scroll vertical) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.4** (s63: titulo marginBottom 6->4) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.28.8** (s69: isActiveDay helper + computeYearStats unifica criterio "dia activo" = focus|breath|move>0, agua sola NO cuenta) |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.46.0** (s101: consume `getHistoryWithToday` -- Mes/Año/totales con el dia actual + fila "Cuerpo" (`stats.label.body`), 441 ln; s69: WeekBarRow lunes-primero) |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** (nuevo s58) |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** (nuevo s58) |
| `app/state-history.jsx` | Utils de fecha + helpers de history + **`getHistoryWithToday` (stats vivos)** -- carga ANTES de state-core (loadState los resuelve via window) | **v0.46.0** (nuevo s101, 160 ln; extraido de state-core + selector memoizado por identidad que reutiliza `archiveDayToHistory`) |
| `app/state-core.jsx` | Store, loadState, rollover, migraciones, toast | **v0.49.0** (s104: fix `PACE_VERSION` -- llevaba v0.46.0 desde s101, el footer del sidebar y el export JSON mentian; ENTRA AL CHECKLIST de bump junto a titulo+CACHE_NAME. s102: notifyFocusEnd defaults, ~415 ln; s101: split state-history) |
| `app/state-timer.jsx` | addFocusMinutes, completePomodoro, completeFocusSession | **v0.41.0** (s96: + `completeFocusSession(context, opts)` -- dispatcher que preserva la distincion home(completePomodoro)/path(addFocusMinutes+updateStreak); s69: getDayIndexMondayFirst en addFocusMinutes + checkFocusDayAchievement) |
| `app/state-hydrate.jsx` | addWaterGlass | **v0.46.0** (s101: fix DST en checkHydrateWeekPerfect -- `Math.round(diff/86400000)`, la igualdad exacta a 24h rompia la cadena en cambios de hora; s69: getDayIndexMondayFirst) |
| `app/state-achievements.jsx` | unlockAchievement, detectores, complete*Session | **v0.32.0** (s78: + checkAllPathsCompleted + export a window; s69: getDayIndexMondayFirst en 4 escritores de weeklyStats + checkRetreatAchievement) |
| `app/state-paths.jsx` | Caminos CRUD + stats | **v0.46.0** (s101: racha actual VIVA en computePathStreaks -- si hoy no hay Camino cuenta desde ayer, iguala la semantica del streak principal; s95: getSuggestedPath via guard; s78: jerarquia lastViewed>horario>anytime>catalog[0]) |
| `app/state-settings.jsx` | setLang | **v0.27.5** (nuevo s57) |
| `app/state.jsx` | Indice — re-export consolidado | **v0.46.0** (s101: + `getHistoryWithToday` + orden de carga actualizado; s96: + `completeFocusSession`; s95: + `canAccessRoutine`/`canAccessPath`) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez | **v0.40.0** (s95: autofocus del input intencion enguardado tras `matchMedia('(pointer: coarse)')` -- solo escritorio, no auto-teclado en movil; s19: base) |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.32.1** (s79: fade-out aditivo 300ms via estado exiting + opacity transition; visible TOAST_DURATION_MS sin cambios; s77b: TOAST_DURATION_MS de window con fallback 3000ms) |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | **v0.28.9** (s71: PaceLogoImage invert+screen en oscuro) |
| `app/main.jsx` | Orquestador puro (composicion + state + handlers + JSX root) | **v0.47.0** (s102: + efecto deep links `?go=` (consume una vez + replaceState; focus NO auto-arranca) + monta `<UpdatePrompt/>` junto a ToastHost, 314 ln; s82: split variante B 600->279) |
| `app/main/_responsive.js` | IIFE: inyecta `<style id="pace-main-responsive-css">` con reglas @media globales (TopBar, ActivityBar, main content, sidebar handle, fallback vh/dvh) | **v0.33.2** (nuevo s82, 105 ln; literal de main.jsx 20-112) |
| `app/main/TopBar.jsx` | Tabs Foco/Pausa/Larga + 3 iconos top-right (Stats prop / Logros CustomEvent / Tweaks prop) + topBarStyles | **v0.33.2** (nuevo s82, 106 ln) |
| `app/main/ActivityBar.jsx` | 4 chips Respira/Estira/Mueve/Hidratate + 4 iconos SVG inline (ABBreathe/ABStretch/ABMove/ABDrop) + responsive grid | **v0.33.2** (nuevo s82, 170 ln) |
| `app/i18n/strings/_bootstrap.js` | Crea window.PACE_STRINGS = { es:{}, en:{} } vacio | **v0.33.1** (nuevo s81, 15 ln) |
| `app/i18n/strings/ui.js` | i18n shell UI: welcome + support + sidebar + topbar + activity + settings + tweaks + break + premium + pwa | **v0.47.0** (s102: + 13 keys ES+EN -- `tweaks.notify.*` (5) + `tweaks.legal.*` (2) + `notify.focus.*` (2) + `update.*` (4), 377 ln; s89: agua; s88: premium.tweaks) |
| `app/i18n/strings/sessions.js` | i18n actividades vivas: session + common + lib + focus + breathe (phases/sesion/safety) + lib breathe/move/extra + move + hydrate + custom | **v0.44.0** (s99: + `session.next` ("Siguiente"/"Next") + `session.focusDoneMeta/Copy` ES+EN; s93: +~33 keys `custom.*`, ~335 ln; nuevo s81) |
| `app/i18n/strings/paths.js` | i18n Caminos: path runner + names + kind + library + suggested + hydrate + error + card | **v0.45.0** (s100: + `path.runner.complete.steps` "{n} pasos" + `.achievements` "Desbloqueado" ES+EN, 132 ln; s99: + `paths.library.count.one/many` ES+EN; nuevo s81) |
| `app/i18n/strings/stats.js` | i18n panel Ritmo: stats base + tabs + heatmap mensual + vista anual + caminos | **v0.46.0** (s101: + `stats.label.body` "Cuerpo"/"Body" + valores de `stats.month.total.move`/`.tooltip.move` a Cuerpo, 117 ln; nuevo s81) |
| `app/i18n/strings/achievements.js` | i18n catalogo de logros: ach.cat/seal/toast | **v0.33.1** (nuevo s81, 40 ln; 16 ES + 16 EN) |
| `app/i18n/content/breathe.js` | Patch EN de contenido Respira: fases (con override D-1) + categorias + 20 tecnicas | **v0.37.0** (nuevo s92, 94 ln; split de strings-content.js al superar ~470 ln con F6) |
| `app/i18n/content/move.js` | Patch EN de contenido Mueve (ids extra.*): grupos mueve.cat.* + 14 rutinas | **v0.37.0** (nuevo s92, 186 ln; incluye ~100 keys F6) |
| `app/i18n/content/extra.js` | Patch EN de contenido Estira (ids move.*): grupos extra.cat.* + 14 rutinas | **v0.37.0** (nuevo s92, 202 ln) |
| `app/tokens.css` | Tokens CSS + base | **v0.49.0** (s104: + bloque **ESCENA DE CAMINO** (`[data-pace-path-scene]`: scene-pulse-ring, scene-fill-in + keyframe pace-scene-fill, scene-echo-ring, exclusion del reveal) + regla **"sobre el arte siempre es de dia"** (`[data-palette="oscuro"] [data-pace-scene-card]` re-mapea ink/paper/line Y acentos a la paleta CREMA -- son COPIAS, actualizar si se recalibra la crema); OJO ~600 ln, deuda crece. s100: draw-in sendero; s99: microinteracciones; s97: recalibracion oscuro; s89: reduced-motion `[data-pace-essential]`) |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.40.0** (s95: `tasting:true` en los 2 steps premium de path.weekend -- degustacion curada explicita para el guard; s78: catalogo cerrado a 7 con path.tea/path.breath) |
| `app/paths/PathRunner.jsx` | Runner de caminos -- SOLO orquestador (maquina de fases + dispatcher) | **v0.49.0** (s104: pasa `pathId` a IntroCard/StepIntro. OJO hallazgo: frame fantasma de fase 'step' antes del efecto que pone 'intro' -- warning React en dev, arreglar en sesion propia. s100: fuera 'outro', 230 ln; s80: split 835->244) |
| `app/paths/PathRunner.parts.jsx` | PathTopBar + ExitConfirmModal + StepError + PathStepLocked (chrome del overlay) | **v0.40.0** (s95: + `PathStepLocked` -- auto-skip silencioso de un step premium inaccesible, dead code hoy; s94: boton confirmar tokenizado; ~142 ln) |
| `app/paths/CompletionScreen.jsx` | Pantalla de Camino completado (ceremonia editorial sobre la escena ilustrada) | **v0.49.0** (s104: escena full-bleed de fondo (fixed, zIndex -1, isolation) encuadrada en el FINAL del camino + **placa translucida** tras RECORRIDO/DESBLOQUEADO (csPlateStyle, crema fija rgba) + halo en "Repetir camino"; SenderoBar drawIn queda como fallback sin arte; s100: ceremonia editorial, ~300 ln) |
| `app/paths/steps/_shared.js` | window.pathStepStyles = { btnTypography, btnOutline } | **v0.33.0** (nuevo s80, 23 ln) |
| `app/paths/steps/PathBreatheStep.jsx` | Step Respira + SafetyGate | **v0.44.0** (s99: pasa `inPath` a BreatheSession -> "Siguiente" + atmosfera; s95: guard `canAccessRoutine(id, {tasting})` -> PathStepLocked; nuevo s80) |
| `app/paths/steps/PathFocusStep.jsx` | Step Foco (Pomodoro contextual de Camino) | **v0.44.0** (s99: reescrito sobre el **SessionShell compartido** + timer variante `ticks` + botones por color `--pfbtn` + done via SessionDone "Siguiente". s96: `useCountdown` + `completeFocusSession('path')`; contrato (step, onExit) intacto) |
| `app/paths/steps/PathHydrateStep.jsx` | Step Hidratacion | **v0.44.0** (s99: reescrito sobre el **SessionShell compartido** (header + footer + atmosfera azul); s80: firma (step, onExit)) |
| `app/paths/steps/PathBodyStep.jsx` | Step Cuerpo (dispatcher Move/Extra via resolveBodyRoutine) | **v0.44.0** (s99: pasa `inPath` a MoveSession -> "Siguiente" + atmosfera; s95: guard -> PathStepLocked; nuevo s80) |
| `app/paths/PathTransitions.jsx` | Cards intro/step entre pantallas del Camino | **v0.49.0** (s104: escena full-bleed detras del contenido (zIndex -1) + StepIntro con titulo ANCLADO a la bola (titleAtDot) + IntroCard con **tagline** del catalogo + dotLabel/dotKicker + halo de papel `textHaloScene`; sin arte, card clasica + linea "I · Respira" bajo el titulo; ~360 ln; s100: OutroCard eliminada) |
| `app/paths/SenderoBar.jsx` | Sendero visual clasico -- FALLBACK vivo para caminos sin lamina (hoy los 7 tienen; queda para futuros) | **v0.45.0** (INTOCADO en s104, decision s99 respetada; s100: prop `drawIn`, 194 ln) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.44.0** (s99: acento en gradiente `--focus`->`--focus-cta` + hover con halo `--focus-soft`; s94: huerfanas -> tokens reales; ~195 ln) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.44.0** (s99: header editorial con **contador** (`paths.library.count.one/many`) + filas `data-pace-plib-row` (hover halo+lift) + acento gradiente; s94: huerfanas -> tokens; ~200 ln) |
| `manifest.webmanifest` | PWA manifest (renombrado desde manifest.json en s102) | **v0.47.0** (s102: id "/", categories, 4 shortcuts con `/?go=`, launch_handler focus-existing, colores → `--paper #F2EDE0`; s65 base) |
| `sw.js` | Service Worker PWA | **v0.49.0** (s104: CACHE_NAME bump + las **7 laminas al PRECACHE** (offline fiel). s102: SIN skipWaiting incondicional -- worker en WAITING hasta SKIP_WAITING del UpdatePrompt; + notificationclick; s89: activate borra caches viejos + navegaciones network-first) |
| `app/ui/UpdatePrompt.jsx` | Aviso de version nueva del SW ("Actualizar / Luego") | **v0.47.0** (nuevo s102, 118 ln; escucha `pace:sw-waiting` + `window.__paceSwWaitingReg` del registro en PACE.html; wrapper flex centrador sin transform para no pelear con pace-slide-up; zIndex 150, bajo Toast 200; en file:// retorna null) |
| `app/focus/FocusTimer.support.jsx` | Helpers sin UI del Pomodoro: `maybeNotifyFocusEnd` + persistencia `pace.timer.v1` | **v0.47.0** (nuevo s102, 89 ln; notificacion solo con toggle activo + pestaña oculta + permiso granted, via SW showNotification con fallback, silent; persistencia solo running-foco, expirado se descarta sin acreditar) |
| `build-standalone.js` | Genera el bundle offline (AHORA compilador: Etapa A) | **v0.48.0** (s103: `compileBabel` en memoria (sourceType script + retainLines + targets evergreen) + **IIFE por archivo + `collectGlobalNames` re-expone function/var top-level por AST** (semantica exacta del eval de Babel standalone) + React production inlineado desde vendor/ + @babel/standalone retirado + `replaceOutsideComments` + invariantes (sin text/babel residual, sin unpkg, sin `</script>` en JS, sanity post-escritura). **s104: paso 6b `inlineIllustrations`** -- las laminas van como data URI SOLO en el standalone (index.html conserva rutas de archivo; invariante de referencia huerfana). s102: re-inserta manifest solo en index.html. OJO: los replacement de String.replace con JS minificado van como FUNCION ($& envenena strings) |
| `.claude/static-server.js` | Mini servidor estatico del preview (s80) | **v0.49.0** (s104: + MIME `.webp`; s102: + `.webmanifest` + rutas bonitas /safety /privacy; s93: `Cache-Control: no-store`) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.49.0_20260715.html` <- creado s105 (snapshot del v0.49.0 publicado en s104, extraido de git HEAD -- patron s87)
- `backups/PACE_standalone_v0.48.0_20260714.html` <- creado s104 (snapshot del v0.48.0 publicado en s103, extraido de git HEAD -- patron s87)
- `backups/PACE_standalone_v0.47.0_20260713.html` <- creado s103 (snapshot del v0.47.0 publicado en s102, extraido de git HEAD -- patron s87)
- `backups/PACE_standalone_v0.46.0_20260713.html` <- creado s102 (snapshot del v0.46.0 publicado en s101)
- `backups/PACE_standalone_v0.45.0_20260710.html` <- creado s101 (snapshot del v0.45.0 publicado en s100)
- `backups/PACE_standalone_v0.44.0_20260710.html` <- creado s100 (snapshot del v0.44.0 publicado en s99)
- `backups/PACE_standalone_v0.43.0_20260709.html` <- creado s99 (snapshot del v0.43.0 publicado en s98)
- `backups/PACE_standalone_v0.42.0_20260709.html` <- creado s98 (snapshot del v0.42.0 publicado en s97)
- `backups/PACE_standalone_v0.41.0_20260708.html` <- creado s97 (snapshot del v0.41.0 publicado en s96)
- `backups/PACE_standalone_v0.40.0_20260708.html` <- creado s96 (snapshot del v0.40.0 publicado en s95)
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
Nota s105: cap 20 mantenido rotando el mas antiguo (`v0.34.0_20260605.html`)
al crear el backup del v0.49.0.

---

## Ultima sesion (resumen operativo)

**Sesion 105 - v0.50.0 - Fuentes self-hosted (cierra Etapa A) + todayISO
local + integridad de Caminos + pulido.** Planificada como "fuentes +
todayISO"; crecio con 4 arreglos pedidos en vivo (aro, BreakMenu, frame
fantasma, y 2 bugs de Caminos). 7 arreglos, todos verificados en dev,
compilado y standalone.

### Que se hizo (s105)

- **`todayISO()` a fecha LOCAL** (bug UTC verificado s104): 7 sitios pasan a
  `toISODate()` (helper local ya existente en state-history) -- todayISO
  canonico, 2 copias en cards de Caminos (via `window.todayISO()`), 2 walkers
  de racha en state-paths, watcher de dia-oscuro, y el nombre del backup en
  TweaksData (8º sitio; el `exportedAt` se queda en ISO, es timestamp). NO se
  toco el parseo `new Date("YYYY-MM-DD")` (UTC, inocuo para offsets +).
  Verificado en preview con TZ Europe/Madrid (00:30 daba ayer, ahora hoy).
- **Fuentes self-hosted preservando Cormorant.** HALLAZGO clave: el default
  real de titulos es **Cormorant Garamond** (`defaultState.font='cormorant'`),
  no EB Garamond -> la decision s103 ("solo EB Garamond") se tomo por error;
  con comparativa visual el usuario eligio **preservar Cormorant**. Copia
  local subset-latin de Cormorant (titulos) + EB Garamond (cifras/glifos/logo,
  el 600 recortado) + Inter Tight (UI) = 12 caras 520 KB en `fonts/`.
  `@font-face` ruta ABSOLUTA `/fonts/` + unicode-range latin + font-display
  swap (fuera el @import de Google). JetBrains Mono retirada -> ui-monospace.
  Web = archivos + precache sw.js; standalone = data URIs (`inlineFonts`,
  gemelo de inlineIllustrations); MIME woff2. Cero peticiones a Google en los
  3 artefactos; ciclo SW completo verificado en vivo.
- **BreakMenu coherente**: iconos `AB*` de la ActivityBar (expuestos a window
  desde main/ActivityBar.jsx) + Estira -> 4 actividades, grid 2x2, atajo E,
  cuenta para first.cycle. Iconos `BM*` genericos eliminados.
- **Aro del pomodoro** en Pausa/Larga: spacer `height:26` que reserva la fila
  MIN (solo existe en Foco) -> el aro no sube ~30 px. FocusTimer 493->498 ln.
- **Frame fantasma PathRunner (#3)**: la fase 'intro' se fija en RENDER al
  cambiar el Camino (patron oficial React `if (curId !== seenPathId)`), no en
  un efecto -> React re-renderiza antes de montar el step, sin el warning.
  (Descubierto: las cards de transicion auto-avanzan por diseño, ~2.8s.)
- **Toasts aplazados (A)**: `setCaminoUiActive` + cola en state-core; mientras
  hay UI de Camino (cur || justCompleted) los toasts de logro se aplazan y se
  vuelcan al volver a home (no tapan las pantallas).
- **Integridad de Caminos (B, bug de correccion)**: `advancePathStep` marcaba
  el Camino completado aunque se saltara/saliera todo (desbloqueaba
  "Cartografa" sin hacerlo). Ahora `current.doneCount` cuenta pasos hechos de
  verdad (reason 'done') y **solo cuenta con >=1 paso hecho**; si no, se
  abandona sin credito. PathRunner refleja la regla para la ceremonia.

### Pendiente

- **PWA en navegador REAL** (instalacion + notificacion): sigue del usuario
  desde s102.
- `tokens.css` crecio con los 12 @font-face (deuda; candidato a extraer).
- `FocusTimer.jsx` a 498 ln (al borde; lo nuevo va a FocusTimer.support.jsx).
- Automatizar el bump de version en el build (package.json como fuente).

## Proxima sesion -- s106: onboarding

Etapa A del build CERRADA. Siguiente en el plan maestro (ROADMAP "Camino a
v1.0"): **onboarding 3 pantallas** (necesidad + tiempo + entorno -> `profile`)
+ primer Camino automatico. La bienvenida vistosa/cercana era peticion del
usuario (s103-cierre); las escenas ilustradas de Caminos (s104) son material
natural del onboarding. Metrica guia: primer Camino completado en < 3 min.

### Despues -- Plan maestro v1.0 (adoptado s93)

~~build Etapa A s103~~ · ~~arte D-4 s104~~ · ~~fuentes + todayISO s105~~ ·
onboarding (s106) · home Caminos al centro + After Pomodoro (s107) · taxonomia
+ filtros + sigilo (s108-109) · pre-venta: glifos (revision COMPLETA) +
trial/licencia + landing + programas 7/14 dias + ASO + Starter Story A FONDO
antes de pricing.

---


## Decisiones activas

| Decision | Desde | Detalle |
|---|---|---|
| Identidad tipografica = **Cormorant** (titulos) + EB Garamond (cifras/glifos/logo) + Inter Tight (UI); todo self-hosted | s105 | HALLAZGO: el default real de titulos es Cormorant (`defaultState.font='cormorant'` + regla `[data-font="cormorant"]`), NO EB Garamond -- la decision s103 "solo EB Garamond" se tomo por error (asumia que EB Garamond ya era el display). Con la info completa el usuario eligio PRESERVAR Cormorant (cero cambio visual). Las 3 familias van self-hosted subset-latin en `fonts/` (12 caras; EB Garamond 600 recortado, no lo usa nadie). JetBrains Mono NO se hostea -> `--font-mono` cae a ui-monospace (solo devtools). Ruta ABSOLUTA `/fonts/` en tokens.css (unica que resuelve en dev/index/standalone). El build `inlineFonts` las mete como data URI SOLO en el standalone (gemelo de las laminas). Si se añade una fuente/peso, ampliar el set en tokens.css + precache sw.js + (el build las inlinea solas) |
| Un Camino cuenta como completado solo con >=1 paso hecho de verdad | s105 | `advancePathStep` marcaba el Camino completado (count++, history, checkAllPathsCompleted -> "Cartografa") aunque se saliera/saltara TODO -> logros "sin hacerlo" (bug B). Ahora `current.doneCount` cuenta solo `reason==='done'` (salir/saltar no acredita, ya era asi a nivel actividad); si al terminar `doneCount<1` se abandona sin credito. `PathRunner.handleStepExit` aplica la MISMA regla para mostrar (o no) la CompletionScreen. "Hacer 1 paso y salir" SI cuenta (hiciste algo); "recorrerlo saltandolo entero" NO. Regla al añadir logros/creditos de Camino: colgar del completado real, no del mero avance |
| Toasts de logro APLAZADOS durante un Camino | s105 | El toast (z 200) se dibujaba sobre el overlay de Camino (z 80) tapando las pantallas (bug A). `state-core` tiene cola `_deferredToasts` + flag `_caminoUiActive`; `showToast` aplaza si el flag esta activo. `PathRunner` marca la UI activa mientras haya `cur || justCompleted` (pasos + transiciones + CompletionScreen) via `setCaminoUiActive`; al volver a home se vuelcan (60ms de respiro). La CompletionScreen sigue mostrando sus propios logros. Regla: cualquier UI full-screen que no deba ser interrumpida por toasts reutiliza `setCaminoUiActive` |
| Escena ilustrada de Caminos SOLO en el runner; SenderoBar = lenguaje fuera + fallback dentro | s104 | La escena full-bleed (PathIllustration) vive UNICAMENTE en IntroCard/StepIntro/CompletionScreen -- las sesiones activas NO llevan arte (distrae). SenderoBar queda INTOCADO (decision s99 respetada) como fallback vivo para cualquier camino sin lamina en el indice. Miniaturas para biblioteca/home = thumbs estaticos cuando toque (s107), sin coreografia. Si la escena se filtra fuera del runner con mas trucos de camara, se pierde la simplicidad -- frontera deliberada |
| Marcadores "casquetes": gris → color de actividad; SIN orbe | s104 | Las bolas pintadas del arte van SIEMPRE cubiertas por un casquete gris (`--line`/`--line-2`); al completar un paso su bola se RELLENA con el color de SU actividad (kind real del paso → `--breathe`/`--focus`/`--move`/`--hydrate`) con pop + eco de latido; el hito actual late en el color de la actividad que toca. Los colores PINTADOS en el arte son IRRELEVANTES (van cubiertos): las laminas futuras solo necesitan posiciones/nº de bolas correctos. El orbe animateMotion s77 se RETIRO de la escena (feedback usuario); el "viaje" = pop de relleno + pan de camara 2s. En SenderoBar (fallback) el orbe sigue |
| "Sobre el arte siempre es de dia" | s104 | El arte es papel claro FIJO (no se tematiza). En oscuro, `[data-pace-scene-card]` (tokens.css) re-mapea `--ink*`/`--paper*`/`--line*` Y los acentos de actividad a los valores CREMA -- sin esto el texto era ilegible y los rellenos salian pastel. Son COPIAS literales de la paleta dia: si se recalibra la crema, actualizar TAMBIEN ese bloque (mismo aviso que safety/privacy.html) |
| Laminas: archivo+precache en WEB / data URI SOLO en standalone; el arte se mide UNA vez | s104 | index.html referencia los .webp como archivos (entran al PRECACHE de sw.js → offline fiel, HTML ~970 KB); el build (paso 6b) las inlinea SOLO en PACE_standalone.html (autocontencion, 2371 KB). Laminas futuras via `scripts/ingest-lamina.js` en MODO HIBRIDO (semillas visuales "x:y,..." + centroide local + crecimiento radial; el detector 100% automatico NO es fiable en laminas calidas). REGLA D-4: el arte se mide cuando es DEFINITIVO -- no iterar una lamina ya medida (las coordenadas se rompen en silencio) |
| Build Etapa A: artefactos COMPILADOS con semantica de eval reproducida (IIFE + re-exposicion AST) | s103 | Los artefactos generados llevan JS plano compilado; el dev sigue en Babel standalone. La fidelidad de semantica la garantizan DOS piezas del build que van JUNTAS: la IIFE por archivo (const/let privados; sin ella los duplicados entre archivos lanzan "already declared") y la re-exposicion de function/var top-level via `collectGlobalNames` (los globals implicitos tipo `RoutineCard` siguen viajando). Regla para codigo nuevo: el canal EXPLICITO `Object.assign(window, ...)` sigue siendo la convencion (CLAUDE.md regla 2); los globals implicitos funcionan pero no añadir nuevos a proposito. Cualquier cambio al pipeline del build se verifica con el checklist funcional completo sobre el COMPILADO, no solo dev |
| Toolchain del build PINEADO: Babel major 7 + TypeScript major 5 | s103 | `@babel/core`/`preset-env`/`preset-react` a ^7 (7.29.x, misma major.minor que el @babel/standalone 7.29.0 del navegador -- semantica identica dev/prod) y `typescript` a ^5 (API clasica `ts.createSourceFile` del validador s56). Los latest de 2026 ROMPEN el build: Babel 8 es ESM-only y TypeScript 7 (port Go) no expone la API via require. NO subir de major sin sesion propia que migre build-standalone.js. React/react-dom 18.3.1 en devDeps son la FUENTE de vendor/ (re-copiar de node_modules si se actualiza React) |
| SW: updates con PROMPT (worker en waiting), nunca skipWaiting incondicional | s102 | El install de sw.js ya NO llama skipWaiting: el worker nuevo queda en waiting hasta que el usuario acepte en `UpdatePrompt.jsx` (postMessage SKIP_WAITING → controllerchange → reload, con guard del primer install) o cierre todas las pestañas. "Luego" respeta el waiting (reaparece en la proxima carga). Las NAVEGACIONES siguen network-first (s89 intacta): el HTML fresco llega sin esperar al SW; el prompt gobierna la activacion del worker y el precache offline. NO reintroducir el skipWaiting incondicional -- mata el prompt. Cualquier cambio de estrategia revisa la pareja s89+s102 |
| Notificacion fin-pomodoro: opt-in, permiso solo al activar, solo pestaña oculta, silent | s102 | `notifyFocusEnd:false` por defecto. El permiso del navegador se pide UNICAMENTE al encender el toggle en Ajustes (gesto real; nunca al arrancar ni al terminar). Dispara solo si `document` NO esta visible (mirando la app, campana + pantalla de fin ya avisan) y solo en modo foco (pausa/larga no). `silent:true`: la campana pomodoro.end de la app es EL sonido; el SO no añade otro. Via `registration.showNotification` con fallback a `new Notification`; click enfoca la app (notificationclick, sw.js). Limitacion aceptada P1: con throttling de fondo puede llegar con ~1 min de retraso. Si se quiere notificar pausa/larga, es decision de producto nueva |
| Pomodoro persiste la recarga via `pace.timer.v1`, FUERA de pace.state.v2 (cierra fork s96) | s102 | El timer sigue siendo LOCAL (decision s96): la clave aparte solo hace que sobreviva a la recarga. Se escribe SOLO con foco running (pausa/reset/fin/otros modos limpian). Al montar, FocusTimer reanuda via `useCountdown.restore(endsAt)` (endsAt ORIGINAL: el tiempo de la recarga cuenta como transcurrido) solo si endsAt sigue en el futuro Y modo/minutos coinciden con el state; **expirado estando fuera → se descarta en silencio SIN acreditar** (no se abonan minutos no presenciados, linea s101). Blindaje extra: `endsAt-now <= duracion` |
| manifest.webmanifest unico; el build re-inserta el link SOLO en index.html | s102 | `manifest.json` se renombro (no hay dos manifests). El standalone sigue SIN `<link rel="manifest">` (CORS en file://, s48c vigente); el paso 9 del build lo re-inserta en la copia `index.html` desplegada (fix del hallazgo: Cloudflare servia la app sin manifest → no instalable). Shortcuts con deep links `/?go=` que main.jsx consume UNA vez (replaceState); `focus` NO auto-arranca el timer. Iconos de shortcut = icono de la app hasta que haya arte (regla D-4) |
| Enlaces legales (/safety /privacy) viven en Ajustes, solo en web | s102 | Fila discreta al pie del panel, tras Reset ("Seguridad · Privacidad"), `_blank noopener` para no matar un timer corriendo. Gate `isWeb` (http/https): en el standalone file:// esas rutas no resuelven y NO se renderizan. El mismo gate cubre el bloque de notificacion; si aparece mas superficie solo-web en Tweaks, reutilizarlo. Decision de sitio de s101 CERRADA (se eligio Tweaks sobre footer del sidebar: el home queda limpio) |
| Stats vivos: los paneles leen `getHistoryWithToday`, el rollover sigue siendo el UNICO escritor de history | s101 | Selector memoizado en `state-history.jsx` (memo por identidad de `history`/`weeklyStats` + dayKey) que reutiliza `archiveDayToHistory(h, hoy, weeklyStats)` -- overwrite idempotente + recompute de mes/año, cero logica nueva. El estado persistido NO cambia. Regla: cualquier panel/consumidor futuro que muestre history lee el SELECTOR, nunca `state.history` directo. Los detectores de logros de stats siguen sobre el history real (rollover) -- pueden disparar un dia tarde, aceptado. La racha de Caminos se alineo con la misma semantica (viva si ayer hubo Camino y hoy aun no) |
| La serie `moveMinutes` se etiqueta "Cuerpo" en stats (Mueve+Estira comparten cubo) | s101 | `completeMoveSession` y `completeExtraSession` escriben al MISMO `weeklyStats.moveMinutes` desde siempre; etiquetarla "Mueve" mentia por omision. Key `stats.label.body` (Semana) + valores de `stats.month.total.move`/`.tooltip.move`. La serie propia `extraMinutes` se DESCARTO por ahora (migracion + el historico viejo quedaria mezclado igualmente); si algun dia se separa, decision nueva. Los chips de ActivityBar no cambian (Mueve y Estira siguen siendo modulos distintos) |
| `/safety` y `/privacy` = paginas estaticas AUTOCONTENIDAS en raiz | s101 | Cero peticiones externas (coherente con lo que promete privacy), ES+EN en la misma pagina, Georgia display (blindaje), rama oscura via prefers-color-scheme (sin toggle manual). OJO: llevan COPIAS inline de la paleta crema+oscuro -- si se recalibran tokens, actualizar ambas. Sin enlazar desde la UI aun (decision de sitio pendiente, → s102/landing). Sin email personal publicado |
| CompletionScreen = ceremonia editorial; sin OutroCard; draw-in SOLO alli | s100 | La celebracion del Camino es TIPOGRAFICA (kicker + nombre protagonista + meta romana + hairline + sendero heroe), sin iconografia generica (el check en circulo se retiro) ni cajas rellenas (recorrido y logros van con hairlines/sellos). El **draw-in** del sendero (prop `drawIn`) queda reservado a la CompletionScreen: en TransitionCards el sendero es lectura rapida, no ceremonia. La OutroCard se elimino (ver fila s77). Si se quiere mas celebracion futura, la via es la ilustracion por Camino (espera arte, D-4), no volver a iconos genericos |
| Todos los steps de Camino usan el SessionShell compartido | s99 | `PathFocusStep` y `PathHydrateStep` (antes pelados bajo `PathTopBar`) reescritos para usar el mismo `SessionShell` que Respira/Mueve -> los 4 tipos de paso comparten header (code+nombre) + footer + hint + atmosfera. El `PathTopBar` queda cubierto por el shell (como ya pasaba con Respira/Mueve). Consecuencia: el "× Salir" del Foco/Agua ahora hace lo mismo que en Respira/Mueve (`onExit('exit')` -> avanza/salta el paso, coherente); abandonar el Camino entero sigue via Esc (confirmacion PathRunner). El "done" del Foco pasa por `SessionDone` |
| Atmosfera por paso (SessionShell `atmosphere`), SOLO en Camino | s99 | `SessionShell` acepta `atmosphere` = token `*-soft` del modulo del paso (Respira terracota / Foco verde / Cuerpo tan / Agua azul) -> wash radial MUY tenue (doble capa via helper `sessionAtmosphere`, expuesto a window). Propagado por SessionPrep/SessionDone/SessionShell. Las sesiones lo pasan solo si `inPath` (el home queda limpio). Reutilizado en cards de transicion (por kind) y CompletionScreen (`--focus-soft`). **s100: banding RESUELTO** en el helper -- hint de interpolacion 22% + capa de grano SVG (feTurbulence 4%) como dither; si un wash futuro banda, mismo remedio, no subir alphas |
| Timer: variante `ticks` (aro de marcas de minuto) para el Foco de Camino | s99 | `TimerDial` gana prop `ticks`: 60 marcas radiales tipo reloj (cada 5 mayor) que se encienden con el color segun `progress`, + numero PROTAGONISTA (`numberHugeTicks`). El home mantiene el aro clasico (arco + punto guia, este ultimo -50% en s99 por peticion). Eleccion del usuario sobre "reloj analogico". `modeLabel` ahora condicional (el Foco de Camino lo omite: la identidad vive en el header del shell) |
| Botones del Foco por color (revisa s79) | s99 | s79 decia "3 botones outline del MISMO peso". El usuario pidio color: Empezar/Pausar **verde** (`--focus`), Reiniciar **naranja** (`--breathe`), Saltar **gris** (`--ink-3`, relleno `--paper-3`). Cada boton fija `--pfbtn` con su acento; el hover (`[data-pace-path-btn]:hover`, tokens.css) rellena con ese color. Deja de ser "mismo peso": el color marca la funcion. La regla de fondo de s79 (pomodoro contextual, sin presets/ciclo/badge) sigue |
| Sendero: curva fluida original + hito actual acentuado (cierra iteracion cresta/valle) | s99 | Se probo mover los hitos a crestas/valles (primer pase de B) y el usuario prefirio la **curva fluida original con hitos en la linea** -> revertido (SB_SEG_PARAMS y1/y2 restaurados, `cy=50`). Se conserva SOLO el **anillo pulsante** (`sendero-pulse-ring`) y se anade `accent` prop: tinta SOLO el hito ACTUAL (halo+anillo+punto) en el color del paso (currentColor del `<g>`), el resto en ink. Regla: no rediseñar la forma del sendero sin OK explicito |
| "Siguiente" (no "Volver al inicio") en el done de una sesion dentro de Camino | s99 | `SessionDone` acepta `doneButtonLabel`; `BreatheSession`/`MoveSession` reciben `inPath` y pasan `t('session.next')`. La accion `onExit('done')` ya avanzaba el Camino; era solo el label (la sesion no sabia que estaba en Camino). Fuera de Camino el label sigue siendo "Volver al inicio" |
| BreatheSession: un solo reloj de tiempo activo (timestamp-based) | s98 | `activeMsRef`/`segStartRef`/`getActiveSec()` en `BreatheSession.jsx`, segmentado por `useEffect([stage,paused])` (abre en active/hold sin pausa, cierra sumando al pausar/salir). Mide `Date.now()` -> inmune al estrangulamiento de timers en background; excluye SOLO pausas manuales (la pestana oculta cuenta, como el Focus de s96). Es la verdad UNICA de: fin no-rounds (`getActiveSec() >= routine.min*60`), barra de progreso no-rounds y **credito** (`completeBreathSession` recibe minutos activos reales `max(1,round(sec/60))`, no `routine.min`; firma intacta -> cero cambios en state). Extiende la regla de progreso de s97: la barra no-rounds se llena por tiempo activo (antes cycle+phaseTime, equivalente). La rama rounds del progreso (por ronda/respiracion) queda intacta, ya inmune. Regla: cualquier tiempo que una sesion acredite o muestre sale de este reloj, nunca del wall-clock ni del nominal. Fuera de scope: el ticker de fase sigue en setInterval (solo afecta la animacion visual con pestana oculta, no el tiempo acreditado) |
| Logo en oscuro NO se reemplaza (PNG invertido = original) | s97 | `CowLogo.PaceLogoImage` en oscuro usa `mixBlendMode:'screen' + filter:invert(1)` (azul/rosa). En el backlog s96 figuraba como "logo descolorido (bug)"; **NO lo es**: el usuario lo valida como estetica noche y es el logo OFICIAL. Se intento sustituir por el lockup SVG tokenizado y lo rechazo de plano. NO tocar el tratamiento del logo en oscuro; si algun dia se mejora la fidelidad, via un ASSET PNG oscuro que el usuario apruebe, nunca SVG ni quitar el invert. Memoria `feedback-logo-oscuro-original` |
| Progreso de sesiones activas = BARRA SEGMENTADA por bloques, no bolas | s97 | En Respira el progreso es una **barra segmentada** -- un segmento por bloque de respiracion (rounds: por ronda; no-rounds: por ciclo del patron, el "grupo 4·4·4·4"), el activo se rellena por dentro; `segTotal/segFilled/segActiveProgress` desde `sessionProgress`, **tope 24 segmentos** (rutinas largas agrupan varios ciclos por segmento). Sintetiza "barra" + "agrupar por bloques" y usa el mismo lenguaje que la barra segmentada de Mueve. Se descartaron bolas 1:1 (una por fase/ciclo se dispara a ~50-100 en rutinas de 10-20 min). Regla: progreso de sesiones = barra (segmentada si hay bloques naturales); reservar bolas/puntos para conteos pequeños y fijos (ej. CICLO del pomodoro). El numeral grande + circulo que respira marcan la FASE; no duplicar con "Ns/Ns" |
| 2a recalibracion oscuro EN BLOQUE (`--ink-3`/`--line`/`--line-2`) | s97 | Extiende la decision s79. El bug: s79 dejo `--ink-*` intactos y `--ink-3 #756D5D` quedo MAS oscuro que en la paleta clara (`#8A8372`) -> letra fina ilegible. Subidos EN BLOQUE `--ink-3 ->#B2A995` (~7:1, gobierna TODA la letra fina, por debajo de `--ink-2` para no colapsar jerarquia), `--line ->#4d4536`, `--line-2 ->#5f5544` (aro TimerDial + bordes). `--paper*`/`--ink`/`--ink-2` intactos. Si hace falta otro recalibrado, seguir moviendo en bloque, no peldano suelto |
| Motor de timer timestamp-based, LOCAL (no persiste en pace.state) | s96 | `app/focus/useCountdown.jsx`: la verdad del tiempo vive en `endsAt`; `remaining = ceil((endsAt-Date.now())/1000)` en cada render, el tick de 1s solo refresca UI -> **cero deriva en background** (la pestana oculta no subcuenta; `visibilitychange` corrige al volver). `completed` terminal (no re-credita). Compartido por FocusTimer y PathFocusStep via `completeFocusSession(context)` que **PRESERVA la distincion** home(cycle+logros de pomodoro)/path(minutos+streak). **FORK resuelto:** NO persiste el Pomodoro running en pace.state -- recargar resetea el timer (persistirlo es decision UX aparte, encaja con s99 PWA). Cualquier timer nuevo (breathe s97) debe usar este motor |
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
| Transiciones Camino volatiles | s77, revisada s100 | No persisten en paths.current. Step intermedio: advance AHORA + StepIntro. Ultimo (s100): la **OutroCard se ELIMINO** (duplicaba la CompletionScreen sin informacion nueva) -> snapshot local a `justCompleted` + advance INMEDIATO; ya no hace falta diferir porque CompletionScreen renderiza desde el snapshot, no desde paths.current |
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
| `app/tweaks/TweaksPanel.jsx` | 430 | BAJA (s102: +79 ln de notificacion+legal; re-crece pero dentro de limite. Si vuelve a crecer, candidato natural: extraer el bloque de notificacion a seccion propia como TweaksData/PremiumSection) |
| `app/state-core.jsx` | 412 | SALE (s101: split a state-history.jsx 511 -> 407; s102: +5 del default notifyFocusEnd) |
| `app/focus/FocusTimer.jsx` | 493 | **MEDIA** (s102: +37 ln de notificacion+persistencia lo dejan AL BORDE del tope; los helpers ya viven en FocusTimer.support.jsx -- la proxima adicion al modulo Foco debe ir alli o a un split del MinutesPicker) |
| `app/i18n/strings/ui.js` | 377 | BAJA (s102: +26 ln de keys PWA; dentro de limite, dominio mas grande del split) |
| `app/i18n/strings-content.js` | -- | SALE (s92: troceado en `app/i18n/content/` breathe 94 + move 186 + extra 202 ln al superar ~470 con F6) |
| `app/glyphs/exercise-glyphs.jsx` | 554 | BAJA (s84, dentro de limite tras port; iter cerrado 31/46 aprobados) |
| `app/achievements/Achievements.jsx` | 184 | SALE (s83, antes 409 -- split en achievements/catalog.js + glyphs/achievement-glyphs.jsx) |
| `app/main.jsx` | 279 | SALE (s82, antes 600 -- split en main/_responsive + TopBar + ActivityBar) |
| `app/shell/Sidebar.jsx` | 541 | MEDIA (s101: +6 ln del criterio s69 en WeekDots; s94: re-entro; candidato natural: extraer SenderoDelDia + StatusBar a `shell/`) |
| `app/tokens.css` | 514 | BAJA (s100: el bloque draw-in del sendero lo pasa de ~475 a 514; es CSS global, no JSX -- candidato natural si vuelve a crecer: extraer el CSS del SenderoBar (~110 ln) a un archivo propio cargado tras tokens) |
| `app/paths/PathRunner.jsx` | 244 | SALE (s80, antes 835 -- split en steps/ + parts + CompletionScreen) |
| `app/i18n/strings.js` | -- | SALE (s81, antes 791 -- split en strings/_bootstrap + ui + sessions + paths + stats + achievements) |

**Backlog tecnico MEDIA:** FocusTimer.jsx a 493 ln (ver tabla). Del P2 de
la auditoria (`docs/audits/audit-producto-v0.34.4.md`): build precompilado
(A-5) **HECHO en s103 salvo fuentes (s104)**; quedan tests del state (A-6)
e import sanitizado (A-7). El "manifest rico" del P2 quedo HECHO en s102.

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

### Backlog de pulido / UX (feedback usuario s96)

Recogido con capturas al cerrar s96. Lista completa en `ROADMAP.md` ->
"Backlog de pulido / UX (feedback s96)" + memoria `ux-refinement-backlog`.

**Hecho en s97 (v0.42.0):**
- ✓ **Modo oscuro legible**: recalibracion tokens (`--ink-3`/`--line`/
  `--line-2`). El "logo descolorido" NO era bug -> el usuario valida el
  invertido (ver decisiones activas).
- ✓ **Precontador "3" solapa caption** (SessionPrep) + **countdown de Mueve**
  descentrado + **bolas de Respira** sin sentido -> barra segmentada por bloques.

**Hecho en s99 + s100 (v0.44.0 / v0.45.0):**
- ✓ **Caminos runner refinado**: overhaul premium s99 (SessionShell en los 4
  tipos de paso, timer ticks, botones por color, atmosfera, kicker romano) +
  remate s100 (CompletionScreen ceremonia editorial, OutroCard eliminada,
  banding suavizado). Queda OPCIONAL: ilustracion por Camino (espera arte, D-4).

**Hecho en s101 (v0.46.0):**
- ✓ **Stats a fondo** (P2 del usuario, s100): auditoria 8 hallazgos + stats
  vivos (Mes/Año con el dia actual) + WeekDots criterio s69 + fila "Cuerpo" +
  racha Caminos viva + fix DST + WeeklyStats muerto borrado. Diferidos: H7
  (credito solo-al-completar de Mueve/Estira, "Move timer: bajo") y H8
  (proxies del Sendero del dia → s106 sidebar).

**Pendiente (sin planificar):**
- **[Visual]** pomodoro web con semicirculo fijo integrado en las pills
  (no depender del zoom) · sidebar (divisor logo↔Ritmo sube + mas util).
- **[Producto]** builder premium mas visible + ejercicios de Mueve Y Estira
  · filtros en bibliotecas para movil (mapea a la fase de taxonomia+filtros).
- **[Feedback s101-cierre]** AUDIO: Sound.jsx mas pulido y atractivo (encaje:
  sesion de audio premium ANTES del bloque CTB) · GLIFOS: los de Mueve/Estira
  "tienen fallas, no coherentes ni premium" → la iter pre-venta pasa de la
  cola D-4 a revision COMPLETA del set (el usuario itera, port literal) ·
  CONTENIDO: titulos de ejercicios en ingles dificiles de entender →
  auditoria de nomenclatura ES (mapea a s107-108; OJO name ES = key de
  glifo/i18n custom, s93). Detalle en ROADMAP "Backlog de pulido".
- **[Feedback s102-cierre]** POMODORO: subtitulo dinamico por duracion
  (15/25/35/45, ≥2 frases estilo PACE rotando aleatorio por preset; hoy
  `focus.subtitle.focus` es fijo) · CTA: "Comenzar" poco atractivo →
  explorar opciones y que el usuario ELIJA · STATS: panel Ritmo SIN scroll
  vertical en web (reaparecio; la fila "Cuerpo" s101 sumo una fila) ·
  **GAMIFICACION SUAVE** (matiza CLAUDE.md: agresiva no, suave si; video
  ref "I built a habit system as addicting as a casino" de SpoonFedStudy;
  sesion de DISEÑO propia antes de codigo) · PLATAFORMAS: web + Android +
  **iOS** cuando corresponda (Capacitor cubre ambos, post-venta). Principios
  transversales del usuario: bonita, simple, util, profesional, vistosa,
  sencilla y facil de usar. Detalle en ROADMAP "Backlog de pulido".
- **[Feedback s103-cierre]** i18n 3+ IDIOMAS para la app final (preparar
  cuando toque; arquitectura lista, decision s81) · RESEARCH competidores
  Google Play + App Store (leer reseñas, destilar insights; pre-venta) ·
  canal **@StarterStoryBuild** + video monetizacion (memoria
  premium-strategy-sources) · BUILDER "Tus rutinas" para Mueve Y Estira +
  mucho mas visible · boton **(i) de informacion por ejercicio** (mapea
  s107-108) · UI general mas atractiva y vistosa · SIDEBAR mas bonita/
  organizada/util (¿custom routines premium ahi? → decidir en s106) ·
  LOGROS: pacing inicial (demasiados sellos sin casi hacer nada → sesion
  gamificacion suave) + glifos de logros sin coherencia de constelaciones
  (ej. Cuello atendido, Escritorio express) → la revision COMPLETA pre-venta
  cubre TAMBIEN los de logros · estilos de TIMER Barra/Analogico feos vs
  Aro · OPS: protocolo de updates con clientes reales (base SW s102 hecha;
  falta smoke tests + rollback + versionado de datos; pre-venta) · VISUAL
  RESPIRA mas bonito/grafico (sesion de diseño, propuestas registradas) ·
  WELCOME mas vistosa/cercana/explicativa (amplia s105) · BREAKMENU sin los
  glifos de ActivityBar de la home (fix pequeño, proxima sesion de pulido) ·
  **BUG aro del timer**: en PAUSA y LARGA el aro se mueve del sitio y no
  respeta el diseño de FOCO (la fila MIN de presets solo existe en Foco →
  la columna sube; reservar el espacio o equivalente). Detalle en ROADMAP.
- **[Entre sesiones — experimento ilustraciones Caminos]** El usuario
  planea una sesion experimental aparte: ilustracion editorial como fondo
  del modulo Caminos (empieza por path.dawn, asset a
  `app/paths/illustrations/assets/`). Patron arte s84/D-4 (el usuario
  aporta, se porta literal). Si aterriza antes de s104, la Tarea 0 de git
  debe esperar cambios en `app/paths/` + assets nuevos.
