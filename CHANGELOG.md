# Changelog

Todos los cambios notables del proyecto PACE.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Versionado semántico informal — ver [`CLAUDE.md`](./CLAUDE.md#versionado-semántico-informal).

**Convención:** este archivo solo detalla las **2 últimas versiones**. Para
versiones anteriores, la tabla enlaza al diario completo en
[`docs/sessions/`](./docs/sessions/).

---

## Historial completo

| Versión | Fecha | Título | Sesión | Detalle |
|---|---|---|---|---|
| **v0.50.0** | 2026-07-15 | feat: **fuentes self-hosted (cierra Etapa A) + todayISO local + integridad de Caminos** -- **`todayISO()` a fecha LOCAL** (bug UTC: rachas/history anotaban el día anterior entre medianoche y ~2 AM; 7 sitios, reutiliza `toISODate()`) · **fuentes self-hosted preservando Cormorant** (hallazgo: el default real de títulos es Cormorant, no EB Garamond → decisión s103 revisada): copia local subset-latin de **Cormorant + EB Garamond + Inter Tight** (12 caras, 520 KB) en `fonts/`, `@font-face` con ruta absoluta `/fonts/` (fuera el @import de Google), precache web + **data URIs standalone** (`inlineFonts`), MIME woff2; **JetBrains Mono retirada** (→ ui-monospace) → **cero peticiones externas de fuente** en los 3 artefactos · **BreakMenu coherente**: iconos `AB*` de la home + **Estira** (4 actividades, grid 2×2) · **frame fantasma de PathRunner** resuelto (fase 'intro' fijada en render, no en efecto → sin warning) · **toasts de logro aplazados** durante Caminos (no tapan las pantallas; se vuelcan al salir) · **bug de integridad**: un Camino solo cuenta como completado con **≥1 paso hecho** (antes saltarlo todo desbloqueaba "Cartógrafa") · aro del pomodoro alineado en Pausa/Larga | #105 | [abajo](#v0500----2026-07-15----feat-fuentes-self-hosted-cierra-etapa-a--todayiso-local--integridad-de-caminos) |
| **v0.49.0** | 2026-07-14 | feat(paths): **escenas ilustradas de Caminos — arte D-4 completo** (entrega del usuario, iterado en vivo) -- las **7 láminas** editoriales como escena FULL-BLEED del runner (intro/transición/completion vía `PathIllustration`; sesiones activas intactas) · **casquetes**: las bolas pintadas van cubiertas en gris y se **RELLENAN con el color de su actividad** al completarse (pop + eco; el orbe s77 se retiró) · cámara cover que sigue al hito (pan 2s) y encuadra el **final del camino** en la Completion · etiqueta del paso **anclada a la bola** (placa de papel del arte) · **tagline del Camino en la intro** (beneficio visible) · placa translúcida tras RECORRIDO/DESBLOQUEADO · regla **"sobre el arte siempre es de día"** (re-mapeo de tinta/papel/acentos a paleta crema dentro de las superficies ilustradas en oscuro) · pipeline: **archivo+precache en web / data URI solo standalone** (2371 KB autocontenido; index.html 970 KB) · `scripts/ingest-lamina.js` (normaliza+mide, modo híbrido) · fix `PACE_VERSION` desincronizada (v0.46.0 desde s101) · fallback SenderoBar intacto para futuros caminos sin arte | #104 | [abajo](#v0490----2026-07-14----featpaths-escenas-ilustradas-de-caminos--arte-d-4-completo) |
| **v0.48.0** | 2026-07-13 | build: **Etapa A — precompilado Babel + React production** (plan maestro s103, 1ª de 2) -- los 74 scripts `text/babel` se **compilan en build** (`@babel/core` 7.29 en memoria, sourceType script + retainLines; IIFE por archivo + re-exposición AST de function/var top-level = semántica exacta del eval de Babel standalone) · **React 18.3.1 production UMD self-hosted** (vendor/ desde npm) e inlineado en ambos artefactos · **@babel/standalone fuera del output** → cero CDN de JS, cero compile en el navegador (antes ~4 MB de unpkg + 1-3 s por carga), standalone 100 % autocontenido en JS por primera vez · dev (PACE.html) intacto · pins deliberados Babel 7 / TypeScript 5 · fuentes self-hosted → s104 | #103 | [session-103](./docs/sessions/session-103-build-etapa-a.md) |
| **v0.47.0** | 2026-07-13 | feat(pwa): **PWA completa** (plan maestro s102) -- **manifest.webmanifest** completo (id, 4 **shortcuts** con deep links `/?go=`, launch_handler, colores alineados a `--paper #F2EDE0`) · **fix despliegue**: `index.html` se servía SIN `<link rel="manifest">` desde s48c (el build lo quitaba del standalone y copiaba literal) → la PWA no era instalable; el build re-inserta el link solo en la copia desplegada · **update prompt** (sw.js sin skipWaiting incondicional → worker en waiting + aviso discreto "Actualizar/Luego" via `UpdatePrompt.jsx`; navegaciones siguen network-first s89) · **notificación fin-pomodoro** opt-in (toggle en Ajustes, permiso al activar, solo pestaña oculta, silent; click enfoca la app) · enlaces **Seguridad · Privacidad** en Ajustes (solo web) · **Pomodoro persiste la recarga** (`pace.timer.v1` fuera de pace.state; reanuda solo si sigue vivo, expirado se descarta sin acreditar — cierra el fork s96) | #102 | [session-102](./docs/sessions/session-102-pwa-completa.md) |
| **v0.46.0** | 2026-07-10 | feat(stats): **stats a fondo** (P2 del usuario) -- auditoría completa del tracking (mapa escritores→lectores, 8 hallazgos) + **stats vivos**: nuevo `state-history.jsx` con `getHistoryWithToday` memoizado (reutiliza `archiveDayToHistory`) → **Mes/Año/totales incluyen el día actual** (antes ciegos hasta el rollover); state-core 511→407 ln (sale de deuda) · **WeekDots del sidebar con criterio s69** (focus\|breath\|move>0; antes solo foco) · fila "Mueve" → **"Cuerpo"** (moveMinutes = Mueve+Estira, la etiqueta mentía) · **racha de Caminos viva** (cuenta desde ayer si hoy no hay) · fix DST en hydrate.week.perfect · WeeklyStats.jsx muerto borrado · páginas estáticas **/safety + /privacy** (autocontenidas, ES+EN, rama oscura) | #101 | [session-101](./docs/sessions/session-101-stats-a-fondo.md) |
| **v0.45.0** | 2026-07-10 | feat(paths): **remate premium de Caminos** (los 3 pendientes de feedback de s99) -- **OutroCard eliminada** (duplicaba la CompletionScreen; el último paso pasa DIRECTO a "Camino completado", PathRunner pierde la fase `outro` y `pendingComplete`, decisión s77 actualizada) · **CompletionScreen "ceremonia editorial"** (fuera el check genérico; kicker + nombre del Camino protagonista + meta "IV pasos · 24 min" con hairline + **sendero héroe con draw-in** (prop `drawIn` de SenderoBar: el trazo se dibuja y los hitos entran escalonados) + recorrido sin caja + logros como sellos) · **banding de atmósfera suavizado** (hint de interpolación 22% + capa de grano SVG ~4% como dither; arregla steps, transiciones y completado a la vez) | #100 | [session-100](./docs/sessions/session-100-remate-caminos.md) |
| **v0.44.0** | 2026-07-09 | feat(ui+paths): **pulido global + overhaul premium de Caminos** -- pack de microinteracciones (glow del aro Pomodoro cuando corre, hover TopBar/CTA, entrada de modulos, modales scale+fade, scrollbar Firefox) · **Caminos**: fix "Volver al inicio" -> **"Siguiente"** en Respira/Mueve/Foco (SessionDone recibe `inPath`) · **PathFocusStep/PathHydrateStep** adoptan el SessionShell compartido (coherencia total con Respira/Mueve) · **timer "aro de marcas de minuto"** + numero protagonista · **botones del Foco por color** (verde/naranja/gris, revisa s79) · **atmosfera por paso** (wash tenue del acento del modulo, solo en Caminos) · cards de transicion editoriales (kicker romano) + sendero con hito actual acentuado · CompletionScreen rediseñada · bola del timer home -50% | #99 | [session-99](./docs/sessions/session-99-pulido-caminos-premium.md) |
| **v0.43.0** | 2026-07-09 | fix(breathe): **tiempo activo en Respira** -- `BreatheSession` mide un `activeTime` timestamp-based (excluye pausas manuales; inmune al estrangulamiento de timers en background) que sustituye al wall-clock/nominal en 3 sitios: **fin de sesion no-rounds** (`getActiveSec() >= routine.min*60`, las pausas ya no acercan el final), **barra de progreso no-rounds** (mismo reloj) y **credito a stats/logros** (`completeBreathSession` recibe minutos activos reales, no `routine.min` -> arregla el sobre-credito al pulsar "Terminar" pronto; firma intacta, cero cambios en state) · pantalla "done" muestra tiempo activo · retira estado muerto `cycle`/`startTime`/`doneInCycle` | #98 | [session-98](./docs/sessions/session-98-tiempo-activo-breathe.md) |
| **v0.42.0** | 2026-07-08 | fix(ui): pulido **modo oscuro legible** (recalibracion en bloque `--ink-3 #756D5D→#B2A995` que gobierna toda la letra fina + `--line`/`--line-2` para aro y bordes; logo invertido intacto por peticion del usuario) · **aro del timer empieza siempre vacio** (useCountdown: idle deriva `remaining` de `durationSec`, ya no reflejaba relleno proporcional al cambiar preset) · **progreso de Respira = barra segmentada por bloques** (un segmento por ciclo/ronda, el activo se rellena por dentro; sustituye las bolas, que se disparaban a ~50-100 en rutinas largas) + retira "Ns/Ns" redundante · fix solape precontador "3" (SessionPrep) y countdown de Mueve centrado | #97 | [session-97](./docs/sessions/session-97-pulido-oscuro-progreso.md) |
| **v0.41.0** | 2026-07-08 | refactor(focus): Cirugia 2 -- **motor de timer basado en timestamps** (`app/focus/useCountdown.jsx`, estados idle/running/paused/completed; `remaining = f(Date.now())` en cada tick -> **cero deriva en background**, la pestana oculta ya no subcuenta) migrado a FocusTimer (home) y PathFocusStep (Camino) · `completeFocusSession(context)` unificado que **PRESERVA la distincion** (home = completePomodoro con cycle+logros de pomodoro; Camino = addFocusMinutes+updateStreak sin cycle) · `'completed'` terminal (cierra un doble-credito latente) · **comportamiento observable identico en primer plano** (creditos, sonidos, logros, drone, single-shot) | #96 | [session-96](./docs/sessions/session-96-timer-engine.md) |
| **v0.40.0** | 2026-07-08 | feat(entitlement): Cirugia 1 -- **guard central `canAccessRoutine`/`canAccessPath`** (UNICO punto de verdad del acceso, hoy derivado de `premiumUnlocked`; el sitio que cambiara con la licencia) consumido por RoutineCard + PathBreatheStep/PathBodyStep + getSuggestedPath · **degustacion EXPLICITA** de path.weekend (`tasting:true` a nivel step, deja de ser excepcion tacita) · autofocus Welcome solo con puntero fino (sin auto-teclado en movil) · **comportamiento observable identico con premiumUnlocked=false** | #95 | [session-95](./docs/sessions/session-95-guard-entitlement.md) |
| **v0.39.0** | 2026-07-08 | feat(paths): F8 -- polish visual de los 6 componentes de Caminos contra DESIGN_SYSTEM (**CIERRA el bloque Contenido+Premium**) · fix huerfanas `--olive`/`--terracota` -> tokens reales (barra de acento invisible + boton salir ilegible) · clipPath unico por instancia en Sidebar · titulos de Caminos tokenizados a var(--font-display) (siguen los tweaks data-font) · purga CSS muerto .path-dots | #94 | [session-94](./docs/sessions/session-94-f8-visual-caminos.md) |
| **v0.38.0** | 2026-07-08 | feat(custom): F7 -- registro interno de ejercicios (65 items / 8 grupos, curado a mano) + constructor de rutinas premium (crear/editar/borrar/lanzar con el runner de MoveSession) · seccion "Tus rutinas" al final de la biblioteca Mueve, superficie premium entera · `customRoutines` en state (CRUD en state-custom.jsx) · crédito via completeMoveSession sin logros nuevos | #93 | [session-93](./docs/sessions/session-93-f7-constructor-rutinas.md) |
| **v0.37.0** | 2026-07-07 | feat(move): F6 -- catalogo Mueve 7 -> 14 rutinas (7 nuevas Strengthside/Jess Martin-inspired: sentadillas de silla, gluteos invisibles, espalda de oficina, empuje·progresion, colgarse, piernas·a una, core·plancha) · MOVE_ROUTINES agrupado en 4 grupos free-first (prefijo mueve.cat.*) · strings-content.js troceado en app/i18n/content/ (breathe/move/extra) · 9 pasos nuevos con DefaultGlyph (cola D-4 -> 35) | #92 | [session-92](./docs/sessions/session-92-f6-contenido-mueve.md) |
| **v0.36.0** | 2026-07-07 | feat(extra): F5 -- catalogo Estira 7 -> 14 rutinas (7 nuevas Strengthside-inspired: despertar matinal, muñecas y manos, hombros·circulos, couch stretch, columna·ondas, caderas·suelo, cadena posterior) · biblioteca agrupada en 4 grupos como Respira · 11 pasos nuevos con DefaultGlyph (cola D-4) · ~109 keys EN | #91 | [session-91](./docs/sessions/session-91-f5-contenido-estira.md) |
| **v0.35.0** | 2026-07-07 | feat(breathe): F4 -- catalogo Respira 12 -> 20 tecnicas (8 nuevas: diafragmatica, exhalacion 4·6, ritmica yin, coherente 432 con drone forzado, bhramari, kumbhaka 1:4:2, tolerancia CO2, rondas profundas 5×35 precursora CTB) · 4 patrones nuevos en getSequence · 3 fases nuevas i18n · ambientDrone.start(force) · free-first en grupos · safety en toda retencion/apnea | #90 | [session-90](./docs/sessions/session-90-f4-contenido-respira.md) |
| **v0.34.5** | 2026-07-07 | fix+feat(P0 auditoria): SW limpia caches viejos + network-first navegaciones · reduced-motion con excepcion motion esencial (BreathVisual) · paleta oscura auto en primer arranque · objetivo de agua configurable en Tweaks (4-12) · split TweaksPanel 519->351 ln (TweaksData + PremiumSection) · D-8 resuelto como degustacion curada | #89 | [session-89](./docs/sessions/session-89-p0-auditoria-fixes.md) |
| **v0.34.4** | 2026-07-07 | feat(premium): F3b -- activacion del gating sobre las rutinas existentes (8 premium / 26, binario free/premium) + `premiumUnlocked` en defaultState (cableado, sin compra real) + superficie premium display-only en Tweaks | #88 | [session-88](./docs/sessions/session-88-f3b-activacion-gating.md) |
| **v0.34.3** | 2026-06-30 | feat(premium): F3a -- mecanismo de gating a nivel sesion (campo `access` + componente `PremiumSeal` + sello/Pronto en `RoutineCard` + token `--premium`); dormante (todas las rutinas siguen free) | #87 | [session-87](./docs/sessions/session-87-f3a-gating-mecanismo.md) |
| **v0.34.2** | 2026-06-05 | fix(tracking): F-1 PathFocusStep llama updateStreak (el foco-en-Camino cuenta para la racha, como la home) + docs auditoria F2 de tracking (informe + casos de prueba) | #86 | [session-86](./docs/sessions/session-86-f2-tracking-audit.md) |
| **v0.34.1** | 2026-06-05 | fix(support)+docs: copy Buy Me a Coffee honesto (nucleo libre, fuera "sin pro") + recrear CONTENT.md y ROADMAP.md (borrados en be81606) -- arranque bloque Contenido+Premium F1 | #85 | [session-85](./docs/sessions/session-85-f1-bmc-docs.md) |
| **v0.34.0** | 2026-05-24 | feat(glyphs): cierre iter glifos canonicos Mueve/Estira -- 31/46 aprobados portados literal desde HTML exploracion del usuario (new/alt/v5/v6/v7/v8/v9/v12) + 15 mantenidos del s60 hasta nueva aprobacion | #84 | [session-84](./docs/sessions/session-84-glifos-cierre-iter.md) |
| **v0.33.3** | 2026-05-23 | refactor(achievements): split `app/achievements/Achievements.jsx` (409 ln) en `achievements/` + `glyphs/` (catalog.js + achievement-glyphs.jsx) -- variante B -- 409 ln -> 184 ln (-55%); convencion `app/glyphs/` consolidada con 2 hermanos | #83 | [session-83](./docs/sessions/session-83-achievements-split.md) |
| **v0.33.2** | 2026-05-23 | refactor(main): split `app/main.jsx` (600 ln) en `app/main/` (_responsive + TopBar + ActivityBar) -- variante B (equilibrada) -- 600 ln -> 279 ln (-53%) | #82 | [session-82](./docs/sessions/session-82-main-split.md) |
| **v0.33.1** | 2026-05-19 | refactor(i18n): split `app/i18n/strings.js` (791 ln) en `app/i18n/strings/` (_bootstrap + ui + sessions + paths + stats + achievements) -- variante B (pragmatica) | #81 | [session-81](./docs/sessions/session-81-strings-split.md) |
| **v0.33.0** | 2026-05-18 | refactor(paths): split PathRunner.jsx en steps/ (Breathe/Focus/Hydrate/Body) -- 835 ln -> 244 ln (-71%) + contrato uniforme `(step, onExit(reason))` + `_shared.js` btnTypography/btnOutline | #80 | [session-80](./docs/sessions/session-80-split-pathrunner.md) |
| **v0.32.1** | 2026-05-18 | fix(ui): pomodoro contextual en Camino (aro + pausa/reset/saltar) + fade-out toasts + oscuro +10% | #79 | [session-79](./docs/sessions/session-79-pomodoro-camino-fadeout-oscuro.md) |
| **v0.32.0** | 2026-05-17 | feat(camino): catalogo 5 -> 7 (path.tea + path.breath) + redisenio PathHydrateStep + getSuggestedPath jerarquica (lastViewed > horario > anytime > catalog[0]) + logro master.path.all7 | #78 | [abajo](#v0320----2026-05-17----featcamino-catalogo-5--7) |
| **v0.31.0** | 2026-05-17 | feat(camino): PathTransitions + fix SenderoBar visible + retirada de sticky + microcopia (Toast 3s, CTA verde musgo) | #77 + #77b | [session-77](./docs/sessions/session-77-path-transitions.md) + [s77b](./docs/sessions/session-77b-fix-microcopia.md) |
| **v0.30.0** | 2026-05-16 | feat(camino): arquitectura overlay -- TimerDial compartido + SenderoBar sticky persistente + CompletionScreen rica | #76 | [session-76](./docs/sessions/session-76-overlay-arquitectura.md) |
| **v0.29.0** | 2026-05-16 | feat(camino): sendero hibrido + renombrado sensorial + fix dawn/dusk + foco interno suma a stats | #75 | [session-75](./docs/sessions/session-75-sendero-implementacion.md) |
| **v0.28.12** | 2026-05-12 | style(ui): recalibrar oscuro a negro calido sutil con escalonamiento reducido | #74 | [session-74](./docs/sessions/session-74-oscuro-recalibrado.md) |
| **v0.28.11** | 2026-05-12 | style(ui): subir luminosidad y escalonar fondos modo oscuro | #73 | [abajo](#v02811----2026-05-12----styleui-subir-luminosidad-y-escalonar-fondos-modo-oscuro) |
| **v0.28.10** | 2026-05-12 | style(ui): marron oscuro calido + aro suavizado en modo oscuro | #72 | [abajo](#v02810----2026-05-12----styleui-marron-oscuro-calido--aro-suavizado) |
| **v0.28.9** | 2026-05-12 | feat(ux): aro dinamico + retira envejecido + logo modo oscuro + reorden tweaks | #71 | [session-71](./docs/sessions/session-71-aro-dinamico-limpieza-tweaks.md) |
| **v0.28.8** | 2026-05-12 | fix(tracking): C1+C2+C3+A1+A2 weeklyStats reset semanal + history idempotente + streak proactivo + dia activo unificado | #69 | [session-69](./docs/sessions/session-69-fix-tracking-idempotente.md) |
| **v0.28.7** | 2026-05-11 | fix(breathe): inhalacion suena en arranque y reinicio de ciclo | #67 | [session-67](./docs/sessions/session-67-fix-breathe-play-inhale.md) |
| **v0.28.6** | 2026-05-12 | fix(ui): logo completo + tagline sidebar movil + cache-bust iconos maskable safe zone | #66 | [session-66](./docs/sessions/session-66-fix-logo-tagline-movil.md) |
| **v0.28.5** | 2026-05-11 | fix(deploy): index.html root + manifest PWA + iconos PNG vaca pastando (Cloudflare Pages) | #65 | [session-65](./docs/sessions/session-65-fix-cloudflare-pwa.md) |
| **v0.28.5** | 2026-05-12 | fix(ui): logo movil cortado + hueco sidebar movil + scroll vertical heatmaps anuales + nota Semana restaurada (desktop only) | #64 | [session-64](./docs/sessions/session-64-fixes-ui-menores.md) |
| **v0.28.4** | 2026-05-12 | feat(ui): scroll residual Stats desktop eliminado (WeekView sin nota, Mes 56->48px, Año futuros solo borde, Caminos margenes) + sidebar movil compacta (logo 48px, dividers, streak 44->32) + Stats movil Semana 2x2/Caminos 3col | #63 | [session-63](./docs/sessions/session-63-fix-desktop-movil.md) |
| **v0.28.3** | 2026-05-11 | chore(ui): WeekView + PathStats compactacion segunda pasada -- barras 44->36, PathStat cards 10/14->8/12, gap 14->10 -- todas las pestanas Stats sin scroll en 1080p + heatmap ano completo (7 etiquetas dia + futuros visibles) | #61/62 | [session-61](./docs/sessions/session-61-cleanup-sidebar-ritmo.md) |
| **v0.28.2** | 2026-05-11 | chore(ui): sidebar mas limpio (eliminados 3 contadores hoy) + Ritmo web sin scroll en Semana/Mes/Ano/Caminos + camino sugerido compacto en movil + Sidebar.jsx 630->497 ln (sale de deuda) | #61 | [session-61](./docs/sessions/session-61-cleanup-sidebar-ritmo.md) |
| **v0.28.1** | 2026-05-11 | refactor(glyphs): iteracion parcial 13/46 glifos hacia lenguaje home (objeto/forma/parte aislada/metafora) -- 4 patrones canonicos definidos, pendiente propagar a 33 restantes | #60 | [session-60](./docs/sessions/session-60-glyphs-iter-incompleto.md) |
| **v0.28.0** | 2026-05-11 | feat(glyphs): 46 glifos canonicos por paso individual Mueve/Estira -- pantalla activa de sesion deja de mostrar placeholder y muestra simbolo abstracto unico por ejercicio | #59 | [abajo](#v0280----2026-05-11----featglyphs-46-glifos-canonicos-por-paso) |
| **v0.27.6** | 2026-05-11 | chore(workflow): blindaje Git -- WORKFLOW.md, check-session.ps1, README actualizado a version real, bump version | #58 | [abajo](#v0276----2026-05-11----choreworkflow-blindaje-git) |
| **v0.27.5** | 2026-05-11 | refactor(state): state.jsx dividido en 6 modulos por dominio (core/timer/hydrate/achievements/paths/settings) sin cambios de comportamiento | #57 | [session-57](./docs/sessions/session-57-refactor-state.md) |
| **v0.27.3** | 2026-05-09 | chore(build): blindaje build con parser sintactico real -- TS parser reemplaza 4 checks heuristicos, aborta con linea/columna exacta | #56 | [abajo](#v0273----2026-05-09----chorebuild-blindaje-build-con-parser-real) |
| **v0.27.2** | 2026-05-09 | chore(polish): i18n sync ES/EN, a11y overlays (role/Escape/focus), mobile audit, smoke tests documentados | #55 | [abajo](#v0272----2026-05-09----chorpolish-i18n-sync-a11y-overlays-mobile-smoke-tests) |
| **v0.27.1b** | 2026-05-09 | fix(i18n): restaurar claves paths.path.*.name/tagline EN truncadas en s54 + refuerzo build check-d/e | #54b | (hotfix, sin seccion detalle) |
| **v0.27.1** | 2026-05-09 | feat(stats): seccion Caminos en Stats -- total, rachas current/best, tabla por camino, heatmap anual + paths.history persistido | #54 | [abajo](#v0271--2026-05-09) |
| **v0.27.0** | 2026-05-08 | feat(paths): Caminos parte 2 -- PathsLibrary overlay, sistema favorito, boton Repetir, sugerencia dual favorito+hora | #53 | [abajo](#v0270--2026-05-08) |
| **v0.26.1** | 2026-05-08 | chore: saneamiento tecnico - encoding STATE.md, validateFileEnd en build, 0 WARN, audit deuda 5 archivos >500 lineas | #52 | [abajo](#v0261--2026-05-08--chore-saneamiento-tecnico) |
| **v0.26.0** | 2026-05-08 | feat(paths): SuggestedPathCard -- tarjeta home que sugiere el camino del momento, 4 icons de paso, doneToday badge, 10 claves i18n -- cierra sistema Caminos | #51 | [abajo ↓](#v0260--2026-05-08--featpaths-suggestedpathcard) |
| **v0.26.0-beta** | 2026-05-08 | feat(paths): PathRunner UI — overlay full-screen, 4 kinds, modal in-app de salida, pantalla de completado, reanudacion tras recarga | #50 | [abajo ↓](#v0260-beta--2026-05-08--featpaths-pathrunner-ui) |
| **v0.26.0-alpha** | 2026-05-08 | feat(paths): Caminos parte 1 — capa de datos (5 caminos canónicos, helpers lookup, funciones state, migración defensiva) | #49 | [abajo ↓](#v0260-alpha--2026-05-08--featpaths-caminos-parte-1--capa-de-datos) |
| **v0.25.4** | 2026-05-08 | fix(achievements): hotfix Achievements.jsx truncado en s48d — restaurado desde origin/main + correcciones 48d re-aplicadas + validador de strings en build-standalone.js | #48d.1 | [session-48d1](./docs/sessions/session-48d1-hotfix-achievements-truncado.md) |
| **v0.25.3** | 2026-05-08 | fix(achievements): auditoría glifos Dirección D — 18 sustituidos por canónicos + 13 nuevos portados desde glyphs-explorations.html | #48d | [session-48d](./docs/sessions/session-48d-auditoria-glifos.md) |
| **v0.25.2** | 2026-05-07 | fix(standalone): repara crash post-s48b — 10 .jsx tenían `<script type="text/babel">` literal al inicio (provocaba doble script en el bundle y SyntaxError de Babel) + PACE.html truncado sin mount loop ni `</body></html>` + manifest.json eliminado del standalone (causaba CORS en file://) | #48c | [abajo ↓](#v0252--2026-05-07--fixstandalone-repara-crash-post-s48b) |
| **v0.25.1** | 2026-05-07 | fix(achievements): 20 glifos Dirección D portados literal de design/glyphs-explorations.html (viewBox 44×44, currentColor) — corrige inventados a ojo de s46; restauración masiva de 12 archivos truncados | #48b | [abajo ↓](#v0251--2026-05-07--fixachievements-glifos-canónicos-dirección-d) |
| **v0.25.0** | 2026-05-06 | feat: stats achievements (4 logros nuevos) + mobile UX fixes (sidebar+tabs) + 10 glifos SVG constelaciones + renderGlyph en Seal y Toast | #46 | [session-46](./docs/sessions/session-46-stats-ux-glifos.md) |
| **v0.24.0** | 2026-05-06 | fix(standalone): regenerar build roto de s44 (truncamiento transitorio — sin cambios en código fuente) | #45 | [session-45](./docs/sessions/session-45-fix-standalone-build.md) |
| **v0.24.0** | 2026-05-06 | feat(stats): YearView — heatmap anual 53×7, score compuesto, 5 niveles tierra→oliva, navegación entre años, click celda→zoom mes, responsive scroll-snap | #44 | [session-44](./docs/sessions/session-44-yearview.md) |
| **v0.23.0** | 2026-05-06 | feat(history): capa de datos history (days/months/years) + migration guard + MonthHeatmap con tabs Semana\|Mes\|Año + tooltip responsive | #43 | [abajo ↓](#v0230--2026-05-06--feathistory-capa-de-datos--heatmap-mensual) |
| **v0.22.1** | 2026-05-06 | fix(ux): hints teclado ocultos en móvil + title attrs eliminados en MoveSession + cronómetro reescalado (128→72px) + shortcut BreakMenu oculto | #42 | [abajo ↓](#v0221--2026-05-06--fixux-corrección-ux-móvil) |
| **v0.22.0** | 2026-05-06 | feat: split TweakSecretsWatcher + i18n ambient toggle + 5 detectores logros (hydrate.week.perfect + master.box/coherent/rounds.10 + master.atg.20) | #41 | [session-41](./docs/sessions/session-41-drone-toggle-logros.md) |
| **v0.21.0** | 2026-05-06 | feat(audio): sonidos move.start/step/end + hydrate.sip/goal + achievement.unlock/secret — capa 1 completa | #40 | [abajo ↓](#v0210--2026-05-06--feataudio-sonidos-movhydrateachievements) |
| **v0.20.0** | 2026-05-06 | fix: crash ToastHost variable shadowing (t/useT) + mount loop 6-check + guard breathNoise | #38b patch | [abajo ↓](#v0200--2026-05-05--feataudio-refactor-432-hz) |
| **v0.20.0** | 2026-05-05 | feat(audio): refactor 432 Hz + primitivas componibles + respiración realista con ruido blanco filtrado + pomodoro.start/end | #38a | [abajo ↓](#v0200--2026-05-05--feataudio-refactor-432-hz) |
| **v0.19.1** | 2026-05-05 | fix(i18n): crash al cargar — useT() faltante en AchievementsPreview + auditoría defensiva de 8 componentes | #37 hotfix | [session-37](./docs/sessions/session-37-i18n-pwa-ajustes.md) |
| **v0.19.0** | 2026-05-05 | Cierre i18n total (fases respiración + 8 strings restantes) + PWA activada (manifest+SW) + panel Ajustes limpiado (audio primero, timer 3 ops, layout 2 ops) + hard reset localStorage v2 | #37 | [abajo ↓](#v0190--2026-05-05--cierre-i18n--pwa--ajustes) |
| **v0.18.0** | 2026-05-05 | i18n de contenido (ejercicios Respira/Mueve/Estira) + FocusTimer i18n completo + toggle ES·EN en WelcomeModal + dot verde del aro eliminado | #36 | [abajo ↓](#v0180--2026-05-05--i18n-contenido--focustimer--dot-eliminado) |
| **v0.17.0** | 2026-05-05 | i18n ES/EN completo: auditoría + 3 bugs críticos corregidos + migración de 6 módulos (BreatheLibrary, MoveModule, ExtraModule, HydrateModule, WeeklyStats, Achievements) | #35 | [session-35](./docs/sessions/session-35-i18n-completo.md) |
| **v0.16.0** | 2026-05-05 | Split BreatheModule (3 archivos: BreatheVisual + BreatheLibrary + BreatheSession) + 4 detectores nuevos (master.collector.half/full, master.silent.day, master.retreat) | #34 | [session-34](./docs/sessions/session-34-split-breathe-logros.md) |
| **v0.15.0** | 2026-05-04 | Loop post-Pomodoro: BreakMenu con rotación inteligente (computeScore + sort + "Para ti" + done indicator) | #33 | [session-33](./docs/sessions/session-33-loop-post-pomodoro.md) |
| **v0.14.3** | 2026-05-04 | Code review: 7 fixes de calidad (dead state, condición redundante, aria-live, sip sound, logros recientes) | #32 | [session-32](./docs/sessions/session-32-code-review-fixes.md) |
| **v0.14.2** | 2026-04-30 | Fix de comillas en DESIGN_SYSTEM.md (revisión externa commit cd75d27) | #31 | [session-31](./docs/sessions/session-31-fix-comillas-design-system.md) |
| **v0.14.1** | 2026-04-30 | DESIGN_SYSTEM.md creado + limpieza de duplicación: tokens, paletas, tipografía, espaciado, breakpoints y utilidades centralizados | #30 | [session-30](./docs/sessions/session-30-design-system.md) |
| **v0.14.0** | 2026-04-29 | Fruta fácil II: 6 logros nuevos cazables (`breathe.sessions.10/50`, `move.sessions.25`, `morning.5`, `master.long.focus`, `master.dawn`, `master.dusk`) + canvas exploratorio de glifos en 4 direcciones visuales | #29 | [session-29](./docs/sessions/session-29-logros-aplazados-glifos.md) |
| **v0.13.0** | 2026-04-29 | Fruta fácil: 8 logros nuevos cazables (5 primeros pasos + 3 rachas largas) + módulo `Sound.jsx` con Web Audio sintetizado (4 tonos) cableado a fin de Pomodoro, vaso de agua y cambio de fase de respiración | #28 | [session-28-fruta-facil-logros-sonidos.md](./docs/sessions/session-28-fruta-facil-logros-sonidos.md) |
| **v0.12.10** | 2026-04-23 | Modales responsive en móvil: patrón `<style>` + `data-pace-*` + `!important` aplicado a Primitives.Modal (10 modales de golpe), SessionShell (prep/done) y TweaksPanel (bottom-sheet) | #27 | [session-27-modales-mobile.md](./docs/sessions/session-27-modales-mobile.md) |
| **v0.12.9** | 2026-04-23 | Licencia: `LICENSE` (Elastic License 2.0) + cabeceras de copyright en fuentes principales + sección "Licencia" en README + 4ª vía de monetización (Pase mensual) | #26 | [session-26-refactor-fase2.md](./docs/sessions/session-26-refactor-fase2.md) |
| v0.12.8 | 2026-04-23 | Refactor Fase 2: extracción de `SessionShell`, limpieza de Support, saneo de exports a `window`, helper `displayItalic` | #26 | [session-26-refactor-fase2.md](./docs/sessions/session-26-refactor-fase2.md) |
| **v0.12.7** | 2026-04-23 | Auditoría interna previa al refactor · sin cambios de código · informe en [`docs/audits/audit-v0.12.7.md`](./docs/audits/audit-v0.12.7.md) | #25 | [abajo ↓](#v0127--2026-04-23--auditoria-interna) |
| v0.12.7 | 2026-04-23 | Scroll asimétrico: home con `100dvh` puro (4 botones siempre) + sidebar con `min-height: calc(100dvh + 1px)` que recupera el auto-hide de la barra del navegador | #24 | [session-24-scroll-asimetrico.md](./docs/sessions/session-24-scroll-asimetrico.md) |
| v0.12.6 | 2026-04-23 | DVH fit: `100dvh` con fallback a `100vh` para que el móvil encaje con o sin barra de URL | #23 | [session-23-dvh-fit.md](./docs/sessions/session-23-dvh-fit.md) |
| v0.12.5 | 2026-04-23 | Responsive móvil: sidebar desacoplada fullscreen + home que cabe en 375×812 sin scroll | #22 | [session-22-responsive-movil.md](./docs/sessions/session-22-responsive-movil.md) |
| v0.12.4 | 2026-04-23 | Briefing de dirección: gating 2+2+2, modelo Lifetime, CTB, Ritmos, responsive móvil | #21 | [session-21-briefing-direccion.md](./docs/sessions/session-21-briefing-direccion.md) |
| v0.12.3 | 2026-04-22 | Timer: número gigante con más aire sobre el subtítulo + pill "Otro" para minutos personalizados | #20 | [session-20-timer-aire-otro.md](./docs/sessions/session-20-timer-aire-otro.md) |
| v0.12.2 | 2026-04-22 | Pill de apoyo consolidada + Tweaks de logo/copy retirados + standalone autocontenido | #19 | [session-19-pill-consolidada-standalone.md](./docs/sessions/session-19-pill-consolidada-standalone.md) |
| v0.12.1 | 2026-04-22 | Pulido: bugs de race condition, sidebar más limpio, Welcome compacto | #18 | [session-18-pulido-bugs-layout.md](./docs/sessions/session-18-pulido-bugs-layout.md) |
| v0.12.0 | 2026-04-22 | Welcome de primera vez + Export/Import JSON + 6 tweak-secrets | #17 | [session-17-welcome-export.md](./docs/sessions/session-17-welcome-export.md) |
| v0.11.11 | 2026-04-22 | Integración Buy Me a Coffee: frente 1 de monetización | #16 | [session-16-bmc-integracion.md](./docs/sessions/session-16-bmc-integracion.md) |
| v0.11.10 | 2026-04-22 | Logros: arreglo `explore.*` + estado "Próximamente" | #15 | [session-15-logros-proximamente.md](./docs/sessions/session-15-logros-proximamente.md) |
| v0.11.9 | 2026-04-22 | Swap Mueve ↔ Estira: contenido reubicado + título del modal | #14 | [session-14-swap-mueve-estira.md](./docs/sessions/session-14-swap-mueve-estira.md) |
| v0.11.8 | 2026-04-22 | Backlog de robustez: 6 bugs del informe de auditoría | #13 | [session-13-backlog-robustez.md](./docs/sessions/session-13-backlog-robustez.md) |
| v0.11.7 | 2026-04-22 | Barra horizontal del sidebar: logo 2.5× + iconos gráficos | #12 | [session-12-barra-horizontal.md](./docs/sessions/session-12-barra-horizontal.md) |
| v0.11.6 | 2026-04-22 | Limpieza sin riesgo: dead code del backlog de auditoría | #11 | [session-11-limpieza.md](./docs/sessions/session-11-limpieza.md) |
| v0.11.5 | 2026-04-22 | Auditoría: 7 bugs críticos + logo local | #10 | [session-10-auditoria.md](./docs/sessions/session-10-auditoria.md) |
| v0.11.4 | 2026-04-22 | Timer "Aro" alineado a referencia visual | #9 | [session-09-timer-aro.md](./docs/sessions/session-09-timer-aro.md) |
| v0.11.3 | 2026-04-22 | Logo oficial v2, Tweaks topbar-derecha, viewport 1920×1080 | #8 | [session-08-logo-oficial.md](./docs/sessions/session-08-logo-oficial.md) |
| v0.11.2 | 2026-04-22 | Sidebar colapsable, Sendero, logo Pace. lockup | #7 | [session-07-sidebar-sendero.md](./docs/sessions/session-07-sidebar-sendero.md) |
| v0.11.1 | 2026-04-22 | Iconos ActivityBar restaurados | #6 | [session-06-iconos-activitybar.md](./docs/sessions/session-06-iconos-activitybar.md) |
| v0.11.0 | 2026-04-22 | Fortalecimiento del proyecto: README, CHANGELOG, ROADMAP | #5 | [session-05-fortalecimiento.md](./docs/sessions/session-05-fortalecimiento.md) |
| v0.10.1 | 2026-04-22 | Reorganización modular post-GitHub | #4 | [session-04-reorganizacion.md](./docs/sessions/session-04-reorganizacion.md) |
| v0.10 | 2026-04-22 | Pulido del core (Respira + Mueve) | #3 | [session-03-pulido-core.md](./docs/sessions/session-03-pulido-core.md) |
| v0.9.2 | 2026-04-22 | Refinamiento post-feedback: Aro + Flor + Estira | #2 | [session-02-refinamiento.md](./docs/sessions/session-02-refinamiento.md) |
| v0.9 | 2026-04-22 | Base inicial — 14 JSX + 100 logros + 5 módulos | #1 | [session-01-base.md](./docs/sessions/session-01-base.md) |

---

## [v0.50.0] -- 2026-07-15 -- feat: fuentes self-hosted (cierra Etapa A) + todayISO local + integridad de Caminos

Sesión 105. Planificada como "fuentes + todayISO" (2ª pieza de Etapa A);
creció con cuatro arreglos pedidos en vivo. Diario:
[session-105](./docs/sessions/session-105-fuentes-todayiso-caminos.md).

### todayISO a fecha local (bug UTC verificado s104)

`new Date().toISOString().slice(0,10)` usa UTC → entre medianoche y el offset
(~1-2 AM en España) devolvía el **día anterior**. Se reutiliza `toISODate()`
(local) en **7 sitios** (todayISO canónico, 2 copias en cards de Caminos, 2
walkers de racha, watcher de secretos, nombre del backup). Verificado en
preview con TZ Europe/Madrid.

### Fuentes self-hosted — preservando Cormorant (cierra Etapa A)

Hallazgo: el default real de títulos es **Cormorant Garamond**, no EB Garamond
(decisión s103 revisada con el usuario tras comparativa visual). Copia local
subset-latin de **Cormorant + EB Garamond + Inter Tight** (12 caras, 520 KB) en
`fonts/`; `@font-face` con ruta absoluta `/fonts/` (fuera el `@import` de
Google) + `unicode-range` latin + `font-display:swap`. **JetBrains Mono
retirada** (`--font-mono` → ui-monospace). Web: archivos + precache sw.js.
Standalone: nuevo paso de build `inlineFonts` → data URIs. MIME woff2 en
static-server. **Cero peticiones a fonts.googleapis/gstatic** en los 3
artefactos; título/UI/cifras idénticos; ciclo SW completo verificado en vivo.

### BreakMenu coherente + integridad de Caminos + pulido

- **BreakMenu**: usa los glifos `AB*` de la ActivityBar (expuestos a window
  desde `main/ActivityBar.jsx`) + añade **Estira** → las 4 actividades de la
  home, grid 2×2, atajo E; iconos `BM*` genéricos eliminados.
- **Bug B (integridad)**: `advancePathStep` marcaba el Camino completado
  aunque se saltara/saliera todo → desbloqueaba logros "sin hacerlo". Ahora
  `current.doneCount` cuenta los pasos hechos de verdad (`reason==='done'`) y
  el Camino solo cuenta con **≥1 paso hecho**; si no, se abandona sin crédito.
- **A (toasts)**: los toasts de logro se **aplazan** mientras hay UI de Camino
  (`setCaminoUiActive` + cola en state-core) y se vuelcan al volver a home,
  para no taparse sobre las pantallas.
- **#3 (frame fantasma)**: la fase 'intro' se fija en RENDER al cambiar el
  Camino (no en un efecto) → sin el warning React de setState-en-render.
- **Aro del pomodoro**: spacer que reserva el alto de la fila MIN en Pausa/
  Larga → el aro no se desplaza ~30 px.

### Verificación

Preview :8765, protocolo s93 + seed fresco. Verificado en dev, compilado
(index.html) y standalone. Bump v0.50.0 (título ×3 + CACHE_NAME + PACE_VERSION).
Backup `v0.49.0_20260715` desde git HEAD (rotado `v0.34.0_20260605`, cap 20).
Standalone 3052 KB / index ~970 KB.

---

## [v0.49.0] -- 2026-07-14 -- feat(paths): escenas ilustradas de Caminos — arte D-4 completo

Sesión 104. Planificada como "fuentes self-hosted", pero el usuario ENTREGÓ
las 7 láminas del arte D-4 y las priorizó (las fuentes pasan a s105). Todo
el diseño se iteró EN VIVO con él (2 tandas de AskUserQuestion + 4 rondas de
feedback con mockups suyos). Diario:
[session-104](./docs/sessions/session-104-arte-caminos.md).

### La escena ilustrada (`app/paths/illustrations/`)

- **`PathIllustration.jsx`** (nuevo): escena cover FULL-BLEED en las 3
  pantallas del runner (IntroCard/StepIntro vía TransitionCardBase +
  CompletionScreen), img+SVG en el mismo encuadre → los marcadores caen al
  píxel sobre las bolas pintadas. Sesiones activas SIN arte (no distrae).
- **Casquetes** (lenguaje final iterado): bolas cubiertas en gris
  (`--line`/`--line-2`) hasta completarse → se RELLENAN con el color de SU
  actividad (`--breathe`/`--focus`/`--move`/`--hydrate` según el kind real
  del paso) con pop (`pace-scene-fill`) + eco de latido. El hito actual late
  en el color de la actividad que toca. El orbe s77 se retiró.
- **Cámara**: encuadre centrado en el hito actual con clamp; pan de 2 s
  acompañando el avance donde el viewport recorta; la Completion encuadra
  el **final del camino** (`finish`: el sol, el farol, la tetera, la
  cabaña, el loto…).
- **Tipografía sobre el arte**: título del Camino + **tagline** (beneficio
  visible) arriba en el cielo; etiqueta del paso (nombre + numeral) en
  **placa mini de papel del arte** anclada bajo la bola; placa translúcida
  tras RECORRIDO/DESBLOQUEADO en la Completion.
- **"Sobre el arte siempre es de día"**: en paleta oscura,
  `[data-pace-scene-card]` re-mapea `--ink*`/`--paper*`/`--line*` y los
  acentos de actividad a los valores CREMA (el arte no se tematiza; son
  copias de la paleta día — actualizar si se recalibra).
- **Fallback vivo**: un camino sin lámina en el índice renderiza el
  SenderoBar clásico EXACTO (SenderoBar intocado, decisión s99 respetada).

### Pipeline de assets

- `paths.index.js`: metadatos por lámina (dots {x,y,r,color} medidos por
  escaneo, paper, focusY, finish). `scripts/ingest-lamina.js` normaliza
  (1365×768 WebP q82) y mide en **modo híbrido** (semillas visuales +
  centroide local + crecimiento radial — el detector 100 % automático no es
  fiable en láminas cálidas). `sharp` como devDependency (pins intactos).
- **Web**: los .webp viajan como ARCHIVOS + PRECACHE en sw.js (offline
  fiel; index.html se queda en 970 KB) · **standalone**: data URIs
  (paso 6b del build, `inlineIllustrations`) → 2371 KB, 100 % autocontenido.
  MIME .webp en static-server.

### Además

- Fix `PACE_VERSION` v0.46.0 → v0.49.0 (desincronizada desde s101; el
  footer del sidebar y el export JSON mentían — entra al checklist de bump).
- Análisis estratégico externo VERIFICADO contra el repo: "CowLogo
  corrupto" FALSO · `todayISO()` en UTC **CIERTO** (7 sitios; tarea propia
  s105) · destilado a ROADMAP (After Pomodoro, programas 7/14 días, ASO).
- Hallazgo pre-existente: frame fantasma de fase 'step' en PathRunner
  (warning React solo en dev; arreglar en sesión propia).

### Verificación

Protocolo s93 por tanda. Dev: los 7 caminos (imagen, nº de bolas — breath
2 ✓, etiqueta por kind, pulso) + recorridos completos de dawn en claro/
oscuro/móvil + fallback. Compilado: monta sin Babel, .webp 1 vez por red.
Standalone: data URI, cero peticiones. Consola limpia en compilado. Backup
`v0.48.0_20260714` desde git HEAD (rotado `v0.33.3_20260524`, cap 20).

---

## [v0.48.0] -- 2026-07-13 -- build: Etapa A — precompilado Babel + React production

Sesión 103. Plan maestro "Camino a v1.0", fila s103-104 (primera de las dos
sesiones; **las fuentes self-hosted quedan para s104**, bifurcaciones ya
decididas: solo EB Garamond + Inter Tight, data URIs en el standalone).
Cuatro bifurcaciones decididas por el usuario antes de tocar. Cero cambios
de arquitectura: `app/` intacto, window globals intactos, `PACE.html` dev
sigue con CDN development + Babel standalone. Diario:
[session-103](./docs/sessions/session-103-build-etapa-a.md).

### Qué cambia en los artefactos generados

- Los **74 scripts `text/babel`** (73 archivos + mount loop) se compilan EN
  BUILD con `@babel/core` (misma major.minor 7.29 que el @babel/standalone
  del navegador): `sourceType: 'script'`, preset-env targets evergreen
  (conserva `?.`/`??` nativos), `retainLines` (stack traces → línea real).
- **Semántica de scope reproducida con fidelidad**: Babel standalone ejecuta
  cada archivo vía eval indirecto (function/var top-level → window
  automático; const/let privados). El build envuelve cada archivo en una
  **IIFE** (los `const {useState}=React` / `GLYPH_SVG` repetidos ya no
  chocan) y **re-expone por AST** los function/var top-level (así viajan
  `RoutineCard` y otros globals implícitos que nunca pasaron por
  Object.assign).
- **React 18.3.1 production UMD** inlineado en standalone + index.html
  (origen: paquete npm verificado por lockfile, copiado a `vendor/`);
  **@babel/standalone retirado** del output.
- Invariantes nuevas del build: sin tags text/babel residuales, sin
  unpkg.com, sin `</script>` en JS inlineado, sanity post-escritura.

### Resultado

**Cero JS por CDN y cero compile en el navegador** (antes: React dev +
ReactDOM dev + Babel ~2,9 MB desde unpkg y 1-3 s de compile por carga; el
"standalone offline" no era offline de verdad). Standalone 774 KB → 924 KB
(React inline + JSX compilado) pero autocontenido en JS por primera vez.
Referencias externas restantes: SOLO el @import de Google Fonts (cae en
s104). `index.html` conserva el `<link rel="manifest">` (s102).

### Verificación

Preview :8765, protocolo s93 + seed fresco. Checklist funcional COMPLETO
sobre el compilado (Welcome, Respira/Mueve/Estira, Hidrátate + persistencia,
logro + toast visible, paleta, deep links `?go=`, pomodoro s102 en ambas
ramas con BreakMenu y crédito) · equivalencia dev=compilado · **pareja SW
s89+s102 con dos SW reales**: waiting + barra "Hay una versión nueva" →
Actualizar → activación + purga del cache viejo + reload con estado intacto;
primer install sin bucle. Trap de errores en vivo: cero errores. Backup
`v0.47.0_20260713` desde git HEAD (rotado `v0.33.2_20260523`, cap 20).
Pins deliberados: **Babel 7 / TypeScript 5** (npm sin pin trae Babel 8
ESM-only y TS 7 Go sin la API del validador — ambos rompen el build; no
subir de major sin sesión propia).

---
