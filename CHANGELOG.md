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
| **v0.34.4** | 2026-06-30 | feat(premium): F3b -- activacion del gating sobre las rutinas existentes (8 premium / 26, binario free/premium) + `premiumUnlocked` en defaultState (cableado, sin compra real) + superficie premium display-only en Tweaks | #88 | [abajo](#v0344----2026-06-30----featpremium-f3b-activacion-del-gating) |
| **v0.34.3** | 2026-06-30 | feat(premium): F3a -- mecanismo de gating a nivel sesion (campo `access` + componente `PremiumSeal` + sello/Pronto en `RoutineCard` + token `--premium`); dormante (todas las rutinas siguen free) | #87 | [abajo](#v0343----2026-06-30----featpremium-f3a-mecanismo-de-gating) |
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

## [v0.34.4] -- 2026-06-30 -- feat(premium): F3b activacion del gating

Sesion 88. **Fase 3b del bloque Contenido+Premium: enciende el gating** sobre las
rutinas que ya existen. Alcance acotado al **binario `free`/`premium`** (los
estados `locked.*` y la licencia real quedan post-v1.0). Diario:
[session-88](./docs/sessions/session-88-f3b-activacion-gating.md).

### Set premium (8 / 26, binario, ~1/3 por modulo)

El usuario aprobo la direccion pero pidio **menos premium**. Criterio: lo de
entrada/accesible se queda `free`, lo avanzado/profundo va `premium`. Las 2
iniciales de cada modulo se respetan como free.

- **Respira (4):** `breathe.rounds.full`, `breathe.rounds.express`,
  `breathe.nadi.shodhana`, `breathe.kapalabhati`. Las variantes *mas largas*
  (box.6, coherent.66) y ujjayi se quedan free.
- **Mueve (2):** `extra.wall.sit`, `extra.core.stealth` (isometricos al limite).
- **Estira (2):** `move.atg.knees`, `move.ancestral` (ATG avanzado + suelo).

`safety: true` conservado en las premium con retencion (rounds, kapalabhati): el
modal seguira siendo obligatorio cuando se desbloqueen.

### Added

- **`app/state-core.jsx`** -- `premiumUnlocked: false` en `defaultState`. Sin
  ruta de compra real hasta v1.0: permanece `false` y toda rutina `premium` se
  ve bloqueada. El cableado queda listo para que un flag futuro la abra.
- **`app/tweaks/TweaksPanel.jsx`** -- superficie premium discreta (tras "Tus
  datos"): sello `PremiumSeal` + titulo + copy honesto + input de licencia
  **disabled** (display-only, sin validacion) + CTA "Pronto" disabled + nota
  offline.
- **`app/i18n/strings/ui.js`** -- `premium.tweaks.title` / `.body` /
  `.placeholder` / `.cta` / `.note` (ES + EN).

### Changed

- **`app/breathe/BreatheLibrary.jsx`** -- `RoutineCard` lee `premiumUnlocked`:
  `isPremium` (marca de pago, sello siempre) vs `isLocked = isPremium &&
  !premiumUnlocked` (bloqueo real: accent/clic off + "Pronto"). Flip del flag
  abre las premium sin tocar UI.
- **`app/move/MoveModule.jsx`** (`extra.wall.sit`, `extra.core.stealth`) +
  **`app/extra/ExtraModule.jsx`** (`move.atg.knees`, `move.ancestral`) +
  **`app/breathe/BreatheLibrary.jsx`** (4 tecnicas) -- `access: 'premium'`.
- **`PACE.html`** / **`app/state-core.jsx`** / **`sw.js`** -- bump v0.34.4.
- **`CHANGELOG.md`** -- v0.34.2 degradado a fila-de-enlace (convencion: solo 2
  ultimas detalladas).

### Verificacion runtime

Via preview local (puerto propio; otra sesion ocupaba :8765).

- Respira: PREMIUM + "Pronto" en las 4 premium (rounds con ⚠ safety); box.6 /
  coherent.66 / ujjayi / resto free con minutos (screenshot).
- Mueve: PREMIUM en wall.sit + core.stealth (screenshot). Estira: PREMIUM en
  atg.knees + ancestral (screenshot). Tweaks: superficie premium completa
  (screenshot).
- `eval`: 8 flags `access:'premium'` correctos, `premiumUnlocked === false`,
  `PACE_VERSION === 'v0.34.4'`. Consola sin errores.

### Build

- `PACE_standalone.html`: **628 KB**, 60 archivos validados. `index.html` copia
  exacta (**SHA256 identico**, `f9b9fef0…18a4dd`).
- Backup `PACE_standalone_v0.34.3_20260630.html` creado; cap 20 (rotado el mas
  antiguo `v0.28.5_20260512.html`).

---

## [v0.34.3] -- 2026-06-30 -- feat(premium): F3a mecanismo de gating

Sesion 87. **Fase 3a del bloque Contenido+Premium: el mecanismo de gating a
nivel sesion**, construido y verificado pero **dormante** -- todas las rutinas
siguen `free`, nada cambia para el usuario. F3b encendera el desbloqueo real y
designara el set premium.

### Added

- **`app/tokens.css`** -- tokens `--premium` (#9C6B2E) + `--premium-soft`. Bronce
  profundo, deliberadamente mas oscuro que `--achievement` (#B8934A) y `--move`
  (#9A7B4F) para que el sello no se confunda con ninguno. Tono tierra, sin
  dorado brillante ni gradiente.
- **`app/ui/Primitives.jsx`** -- componente reutilizable `PremiumSeal` (chip
  inline; prop `label` opcional, por defecto i18n `premium.seal`). Expuesto a
  `window` para reuso en F3b (Tweaks / Caminos).
- **`app/i18n/strings/ui.js`** -- `premium.seal` / `premium.soon` (ES + EN).

### Changed

- **`app/breathe/BreatheLibrary.jsx`** -- `RoutineCard` (compartido por las 3
  bibliotecas Respira/Mueve/Estira via `window`) lee `routine.access`: si
  `'premium'`, muestra el sello + "Pronto" (en lugar de los minutos) y
  **desactiva el clic** (no arranca). Convencion documentada: ausente|`'free'` =
  libre, `'premium'` = de pago. La designacion de que rutinas son premium y el
  desbloqueo real llegan en F3b / F5-F7.
- **`DESIGN_SYSTEM.md`** -- documentado el token `--premium` / `--premium-soft`.
- **`PACE.html`** / **`app/state-core.jsx`** / **`sw.js`** -- bump v0.34.3.
- **`CHANGELOG.md`** -- v0.34.1 degradado a fila-de-enlace (convencion: solo 2
  ultimas detalladas).

### Verificacion runtime

Via preview local en `localhost:8765`.

- Con una rutina marcada premium temporalmente (Box 6.6.6.6): sello PREMIUM en
  bronce `rgb(156,107,46)` + fondo `--premium-soft`, "Pronto" en lugar de los
  minutos (screenshot). Tarjeta libre `cursor: pointer` vs premium
  `cursor: default` (no clicable) -- confirmado.
- Flag temporal **revertido**; standalone limpio verificado: 0 rutinas premium
  en datos, token (#9C6B2E) y componente `PremiumSeal` presentes, consola sin
  errores.
- Build limpio: **60 archivos validados**.

### Build

- `PACE_standalone.html`: **625 KB**. `index.html` copia exacta (SHA256 identico).
- Backup `PACE_standalone_v0.34.2_20260630.html` creado (snapshot del v0.34.2
  publicado, desde git HEAD); cap 20 (rotado el mas antiguo
  `v0.28.4_20260512.html`).

> **v0.34.2** (s86) detallada en
> [session-86](./docs/sessions/session-86-f2-tracking-audit.md) — convencion:
> solo las 2 ultimas versiones se detallan aqui.

---
## [v0.34.1] -- 2026-06-05 -- fix(support): copy BMC honesto + recrear CONTENT/ROADMAP

Detalle completo en [session-85-f1-bmc-docs.md](./docs/sessions/session-85-f1-bmc-docs.md).

---

## [v0.34.0] -- 2026-05-24 -- feat(glyphs): cierre iter glifos canonicos Mueve/Estira

Detalle completo en [session-84-glifos-cierre-iter.md](./docs/sessions/session-84-glifos-cierre-iter.md).

---

## [v0.33.3] -- 2026-05-23 -- refactor(achievements): split Achievements.jsx en achievements/ + glyphs/

Detalle completo en [session-83-achievements-split.md](./docs/sessions/session-83-achievements-split.md).

---

## [v0.33.2] -- 2026-05-23 -- refactor(main): split main.jsx en main/

Detalle completo en [session-82-main-split.md](./docs/sessions/session-82-main-split.md).

---

## [v0.32.0] -- 2026-05-17 -- feat(camino): catalogo 5 -> 7

Sesion 78. Cierra el catalogo de Caminos a **7** (anyade `path.tea` y
`path.breath`), introduce el slot `'anytime'` para Caminos sin hora fija
y enriquece `getSuggestedPath` con jerarquia explicita de 4 niveles que
preserva la inversion s75 (lastViewed wins) mientras incorpora la logica
horaria como capa nueva. Redisenia el `PathHydrateStep` del PathRunner
para que hable el mismo lenguaje visual que el `HydrateModule` del home
(contador Garamond gigante + grid de vasos + botones del mismo peso).
Anyade un unico logro nuevo (`master.path.all7`, "Cartografa") con glifo
heptagonal de la familia visual de `streak.7` / `streak.365`.

Diario: [session-78-catalogo-caminos.md](./docs/sessions/session-78-catalogo-caminos.md).

Bump a v0.32.0 por feature de catalogo + slot horario nuevo + logro
nuevo + redisenio visual coherente del step Hydrate.

### Added

- **`app/paths/registry.js`** -- 2 entradas nuevas en PATH_CATALOG:
  - `path.tea` (timeOfDay `'afternoon'`): 3 pasos -- breathe.coherent.55
    + hydrate (optional) + focus 10 min. ~17 min total. Reenganche
    progresivo de sobremesa.
  - `path.breath` (timeOfDay `'anytime'` -- nuevo): 2 pasos -- breathe.478
    + breathe.coherent.55. ~8 min. Micropausa de respiracion sin foco ni
    cuerpo.
- **`app/state-achievements.jsx`** -- funcion `checkAllPathsCompleted`.
  Recorre `PATH_CATALOG` y exige `paths.completed[id].count >= 1` para
  cada uno. Guard `catalog.length >= 7`. Exportada a window.
- **`app/achievements/Achievements.jsx`** -- entrada `master.path.all7`
  en categoria `maestria` (title "Cartografa", desc "Recorre los siete
  caminos al menos una vez"). Anyadida a `IMPLEMENTED_ACHIEVEMENTS` bajo
  nuevo subgrupo "Caminos (1/1) -- sesion 78". Glifo SVG `master.path.all7`
  (heptagono regular: 7 puntos r=1.6 en vertices + centro r=2.4 + path
  conectandolos en bucle, stroke 0.5 opacity 0.5). Familia visual de
  streak.7 y streak.365.
- **i18n** -- 8 claves nuevas (4 x ES/EN):
  - `paths.path.tea.name` ES "Infusion" / EN "Steeping".
  - `paths.path.tea.tagline` ES "Un vapor breve, y la tarde recobra forma."
    / EN "A brief steam, and the afternoon takes shape again.".
  - `paths.path.breath.name` ES "Halito" / EN "Breath".
  - `paths.path.breath.tagline` ES "Dos vientos cortos para volver." /
    EN "Two short winds to return.".
  - `path.hydrate.skip` ES "Saltar" / EN "Skip" (nueva clave especifica
    del step, ademas del `path.runner.skip` global).
  - `path.hydrate.glasses.today` ES "Vasos hoy" / EN "Glasses today".

### Changed

- **`app/state-paths.jsx`** -- `getSuggestedPath` reescrita con jerarquia
  explicita de 4 niveles:
  1. `lastViewed` (s75, preferencia del usuario).
  2. `timeOfDay` match (sabado/domingo -> slot `'weekend'`; resto: slot
     horario actual segun la hora del sistema -- morning <9h, midday <13h,
     afternoon <17h, evening >=17h).
  3. Slot `'anytime'` (nuevo, fallback antes de catalog[0]).
  4. `catalog[0]` (ultimo recurso, garantia de no devolver null).
  Hook nuevo en `advancePathStep` cuando se cierra un Camino: dispara
  `window.checkAllPathsCompleted` via `setTimeout(0)` para que el detector
  lea el estado ya actualizado y evite re-entradas en el reducer.
- **`app/paths/PathRunner.jsx`** -- `PathHydrateStep` reescrito de cero
  (~50 ln -> ~108 ln). Lectura de `state.water.{today, goal}` via
  `usePace()`. Nuevo layout vertical:
  - Contador `clamp(72px, 12vw, 112px)` EB Garamond italic en
    `var(--hydrate)` con ` / goal` a 0.42em en `var(--ink-3)`.
  - Meta-label "Vasos hoy" 11px tracking 0.22em uppercase.
  - Grid de `goal` vasos (`gridTemplateColumns: 'repeat(goal, 1fr)'`,
    aspectRatio 1/1.3, max-width 360px) replicando 1:1 el patron visual
    del `HydrateTracker` del home (border 1.5px var(--line) /
    var(--hydrate) + fill desde top 40%). **NO interactivos** (es step de
    Camino, no tracker).
  - Copy 18px EB Garamond italic max-width 360px.
  - Dos botones del **mismo peso visual** via `btnBase` compartido
    (padding 10px 28px, radius --r-sm, fontSize 13, font display italic);
    diferencia solo de color: "Saltar" outline 1px var(--line-2) +
    transparent + var(--ink-2); "Beber" fill var(--hydrate) + paper.
    Sin jerarquia CTA principal/secundario -- refuerza que la accion es
    de verdad opcional.
- **`app/i18n/strings.js`** -- microcopy hydrate redisenada en ES/EN:
  - `path.hydrate.copy` "Si te apetece, suma un vaso." (antes "Un vaso de
    agua, si te apetece") / "If you feel like it, add a glass.".
  - `path.hydrate.drank` "Beber" (antes "He bebido") / "Drink" (antes
    "I drank"). Pasa de primera persona declarativa a infinitivo
    invitando.
- **`PACE.html`** -- titulo `v0.32.0`.
- **`app/state-core.jsx`** -- `PACE_VERSION` `v0.32.0`.
- **`sw.js`** -- `CACHE_NAME` `pace-v0.32.0`.

### Racional

El catalogo 7 estaba prometido desde el prompt original del proyecto. s78
lo cierra con 2 Caminos que ocupan huecos del lexico (sobremesa con
infusion, micropausa pura de respiracion) sin duplicar `kinds` (path.tea
es el unico Camino con focus 10 min -- mas corto que los 15/25 estandar;
path.breath es el unico sin focus ni cuerpo). El slot `'anytime'` permite
sugerir Caminos sin hora fija sin forzarlos a competir con los slots
horarios -- queda como fallback explicito en la cascada.

`getSuggestedPath` se enriquece sin romper la inversion s75: lastViewed
sigue ganando porque el usuario validar runtime que esta es la
expectativa correcta (memoria > sugerencia contextual). La logica
horaria entra solo cuando lastViewed no aplica (primer uso o tras reset).

El redisenio del PathHydrateStep es la pieza visualmente mas evidente.
El step previo (circulo 64px con emoji + un parrafo en Garamond + dos
botones de jerarquia desigual) se sentia fuera de tono dentro del overlay
y, peor, comunicaba mal la opcionalidad del paso ("He bebido" oscuro como
CTA principal sugeria que era la accion preferida). La nueva version
toma prestado el lenguaje del HydrateModule del home (mismo contador,
mismos vasos visuales, mismo color) y equilibra los botones para que la
opcionalidad sea visual, no textual.

Un solo logro nuevo por sesion mantiene el ritmo del catalogo de 90+
logros sin inflar de golpe. `master.path.all7` es meta natural del
catalogo cerrado; el glifo heptagonal continua una familia visual ya
establecida (streak.7 / streak.365).

### Build

- `PACE_standalone.html`: **605 KB** (619,615 bytes; +7,412 bytes vs
  v0.31.0). Crecimiento: 2 entradas catalogo + 8 claves i18n duplicadas
  + redisenio PathHydrateStep (+98 ln neto en PathRunner.jsx, 717 -> 815) + glifo SVG +
  detector + extension de getSuggestedPath.
- `index.html`: identico byte-a-byte.
- 43 archivos validados (sin cambios estructurales vs s77b).
- Backup creado: `backups/PACE_standalone_v0.31.0_20260517.html` (605 KB).
  Rotado el mas antiguo: `backups/PACE_standalone_v0.27.0_20260509.html`.

### Diferido a sesiones siguientes

- **s79 (puro tecnico)** -- Split `app/paths/PathRunner.jsx` (825 ln).
  Candidatos: `CompletionScreen`, los 4 `Path*Step`, `ExitConfirmModal`.
  Estado real al cerrar s78: 815 ln (717 -> 815 por redisenio
  PathHydrateStep, +98 ln neto).
- **i18n del catalogo de logros** -- 90+ entradas con title/desc en
  espanyol hardcoded. Migracion a `t()` es proyecto en si mismo.
- **Logica horaria fina** -- `evening` cubre 17h-3am. Si en el futuro
  hay un Camino nocturno (>=22h), conviene distinguir `night`.

---

<!-- v0.31.0 archivado en s79: ver
     docs/sessions/session-77-path-transitions.md +
     docs/sessions/session-77b-fix-microcopia.md -->

## [v0.31.0] -- 2026-05-17 -- feat(camino): PathTransitions

Sesiones **77 + 77b** unificadas en un solo commit. s77 introdujo las
TransitionCards (Intro/Step/Outro) entre pantallas del Camino, la
maquina de phases en PathRunner, el orbe viajero en SenderoBar y el
cross-fade a CompletionScreen. s77b corrigio un bug runtime que dejaba
la SenderoBar invisible en 3 sitios, aplico la microcopia diferida
(Toast 3000ms + CTA verde musgo) y -- tras validacion del usuario --
**retiro la SenderoBar sticky introducida en s76** (se sentia invasiva
sobre cada ejercicio). El progreso visual del Camino vive ahora solo
entre pantallas, no superpuesto al ejercicio activo.

Diarios: [session-77-path-transitions.md](./docs/sessions/session-77-path-transitions.md)
+ [session-77b-fix-microcopia.md](./docs/sessions/session-77b-fix-microcopia.md).

Bump a v0.31.0 por feature UX nueva (no fix).

### Added

- **`app/paths/PathTransitions.jsx`** -- nuevo (233 ln). Tres
  componentes (`IntroCard`, `StepIntro`, `OutroCard`) sobre un
  `TransitionCardBase` privado que centraliza la logica de entrada
  fade+scale (doble rAF al mount), hold timer leyendo duraciones de
  tokens CSS, salida acelerada por tap. Layout vertical: SenderoBar
  grande arriba, titulo Garamond italic clamp(36-64px) centrado en
  vertical, hint "toca para continuar" en la base. Toda la card es
  area de tap.
- **`app/state-core.jsx`** -- constante exportada
  `TOAST_DURATION_MS = 3000` (s77b). Antes 5000ms hardcodeado en
  Toast.jsx; ahora unica fuente de verdad.
- **`app/tokens.css`** -- 5 tokens nuevos en `:root`:
  `--path-intro-ms: 2500ms`, `--path-step-ms: 2000ms`,
  `--path-outro-ms: 1500ms`, `--path-card-fade-ms: 200ms`,
  `--path-card-scale-from: 0.96`. Bloque `.sendero-bar.lg` (max-width
  720, altura SVG `clamp(140px, 22vh, 220px)`). Reglas s77b para
  alinear las labels de hito en lg: `.sendero-bar.lg .hito-labels
  { max-width: 720px; }` + font-size 12/11px. Tokens
  `--focus-cta: #50624D` (crema) y `#8E9D88` (oscuro) para los CTAs
  "Comenzar" del producto (verde apagado equilibrado, mas gris que
  el --focus puro). `@keyframes path-orb-travel` reservado.
  `.sendero-bar .sendero-orb { pointer-events: none; }`.
- **i18n** -- 1 sola clave nueva (limite autoimpuesto en s77):
  `path.runner.transition.continue` ES "toca para continuar" /
  EN "tap to continue".

### Changed

- **`app/paths/SenderoBar.jsx`** -- nuevas props `size` (acepta `"lg"`)
  y `orbVisible`. Cuando `orbVisible && currentIndex > 0`, renderiza un
  orbe viajero: 2 `<circle>` (glow r=7 opacity 0.30, dot r=3) con
  `<animateMotion dur="2s" fill="freeze">` sobre la curva Bezier del
  segmento prev->current, reutilizando `sbSegmentPath` para alineacion
  pixel-a-pixel.
  - s77b: prop `sticky` **retirada** (sin consumidor restante). Bloque
    `hito-labels` cambia de filtro: ahora muestra SOLO los hitos done
    (`i < currentIndex`). Una unica regla unificada: en IntroCard cero
    labels, en StepIntro/OutroCard van apareciendo segun avanza el
    Camino, en CompletionScreen (currentIndex=totalSteps) muestra
    todos. Sin label para el current (ya esta en grande arriba) ni
    para los pending (sin spoiler).
- **`app/paths/PathRunner.jsx`** -- maquina de fases nueva:
  `phase: 'intro' | 'step' | 'transition' | 'outro'` (estado local,
  volatil). Estado `pendingComplete` para snapshotar el cierre del
  ultimo paso antes de OutroCard.
  - `useEffect` inicializador: phase='intro' solo si `cur.stepIndex
    === 0` y `(Date.now() - cur.startedAt) < 1500ms`. Al recargar,
    aterrizas en 'step' (decision 3 del prompt s77: transiciones
    volatiles).
  - `handleStepExit` reescrito: intermedio llama `advancePathStep`
    AHORA y entra en phase='transition'; ultimo captura snapshot en
    `pendingComplete` y entra en phase='outro' (el advance final se
    difiere a `handleOutroDone`).
  - Tres nuevos callbacks: `handleIntroDone`, `handleTransitionDone`,
    `handleOutroDone`. Este ultimo dispara setJustCompleted +
    advancePathStep (cur=null + CompletionScreen fadeIn).
  - Render dispatch por phase: la capa step (TopBar + body del paso)
    SOLO se monta con phase='step'. Las tres cards de transicion son
    hermanas con `position: absolute`. Cumple decision 9 del prompt
    s77 (StepIntro bloqueante: el siguiente step se monta TRAS la
    card).
  - `useEffect` de Escape extendido: ignora la tecla en phases
    no='step' (la card es tappable de por si).
  - **s77b**: eliminado el `useEffect` que toggleaba
    `body[data-pace-path-active]` y el render
    `<SenderoBar ... sticky />` dentro del step phase. La barra
    sticky de s76 se retira por completo.
- **`CompletionScreen`** -- nueva prop `fadeIn`. Doble rAF al mount
  para arrancar opacity 0 y transicionar a 1 en 400ms ease-out. Activo
  solo cuando se entra desde OutroCard. Ambos comparten background
  `var(--paper)`, asi el cross-fade es limpio.
- **`app/focus/FocusTimer.jsx`** -- `startBtnPrimary` cambia
  `background: 'var(--focus)'` -> `'var(--focus-cta)'` (border igual).
- **`app/paths/SuggestedPathCard.jsx`** + **`app/paths/PathsLibrary.jsx`**
  -- CTA "Comenzar" en ambos cambia `background: 'var(--ink)'` ->
  `'var(--focus-cta)'`. Los 3 CTAs principales de "Comenzar" (Pomodoro
  home + Camino sugerido + cada Camino en biblioteca) quedan unificados
  en verde musgo. El "Repetir camino" del CompletionScreen se mantiene
  en `var(--ink)` (accion secundaria).
- **`app/ui/Toast.jsx`** -- lee `TOAST_DURATION_MS` de window
  (fallback a 3000 si no esta definido) en vez del 5000 hardcoded.
- **`PACE.html`** -- nueva linea de carga
  `app/paths/PathTransitions.jsx` ANTES de
  `app/paths/PathRunner.jsx` (que lo consume). Titulo `v0.31.0`.
- **`app/state-core.jsx`** -- `PACE_VERSION` `v0.31.0`.
- **`sw.js`** -- `CACHE_NAME` `pace-v0.31.0`.

### Fixed (s77b)

- **SenderoBar invisible en 3 sitios -- causa raiz: guard
  `typeof SenderoBar === 'function'` evaluaba `false`** porque
  `React.memo()` retorna un objeto, no una funcion. El guard estaba
  en `PathTransitions.jsx:131` (TransitionCards lg), `PathRunner.jsx:
  703` (sticky en step phase) y `PathRunner.jsx:202` (CompletionScreen
  rica). Los tres introducidos en s76 sin validacion runtime real --
  probablemente llevaban rotos desde entonces. Fix: render directo sin
  guard. El orden de carga en `PACE.html` ya garantiza que
  `window.SenderoBar` exista antes de que React evalue los consumidores.

### Removed (s77b)

- **SenderoBar sticky completa** (feature s76). Tras validacion runtime
  con la fix, el usuario decidio que la barra fija sobre cada ejercicio
  invade la pantalla. Se quitan:
  - Render `<SenderoBar ... sticky />` y `useEffect` de toggle de
    `body[data-pace-path-active]` en `app/paths/PathRunner.jsx`.
  - Prop `sticky` de `app/paths/SenderoBar.jsx`.
  - Token `--sendero-sticky-h` y bloque CSS `.sendero-bar.sticky` con
    sus 4 reglas asociadas en `app/tokens.css`.
  - Selectores `body[data-pace-path-active] .path-runner-overlay` y
    `body[data-pace-path-active] [data-pace-session-root]`.
- **Halo dinamico `@keyframes sb-halo-fade-in`** anyadido durante s77b
  y revertido en el mismo s77b al quedar como dead code tras retirar
  la sticky (excluido en .lg, sin escenario en CompletionScreen).

### Racional

s76 dejo continuidad **dentro** de cada pantalla del Camino y al
**cerrar**, pero los **saltos** entre pantallas seguian siendo
abruptos. s77 introduce un breath narrativo (intro 2.5s / step 2s /
outro 1.5s) que da forma de "ceremonia interior" al recorrido sin
meter audio nuevo (decision 15: silencio total). El orbe viajero en
StepIntro es el unico elemento dinamico: marca visualmente "venimos
de aqui, vamos alli" reutilizando la curva del SenderoBar como pista.
La sticky de s76, aunque arquitecturalmente correcta, en runtime
restaba foco al ejercicio activo -- s77b la retira y deja el progreso
solo en los momentos rituales (entre pantallas + completion).

### Build

- `PACE_standalone.html`: **598 KB** (612,203 bytes; -1 KB vs s77
  inicial por dead code limpio de la sticky retirada).
- `index.html`: identico byte-a-byte.
- 43 archivos validados (42 -> 43 por PathTransitions.jsx).
- Backup: `backups/PACE_standalone_v0.30.0_20260517.html` (creado en
  s77 ANTES del build, evitando el problema detectado en s76 donde la
  regeneracion sobrescribia el standalone antes del paso de rotacion).
  Rotado el mas antiguo (`v0.27.1b_20260509.html`).

### Diferido a sesiones siguientes

- s78 -- catalogo Caminos 5 -> 7 (Te sin Azucar / Plain Tea + Halito /
  Breath).
- Split `app/paths/PathRunner.jsx` (717 ln tras s77b) en
  `PathCompletion.jsx` + `PathSteps.jsx`.
- Split `app/i18n/strings.js` (~776 ln).
- Lift `SB_ROMAN` / `CS_ROMAN` a `app/ui/numerals.js` cuando aparezca
  el tercer consumidor.
- Validar contraste WCAG de `--focus-cta` oscuro (`#8AA776` sobre
  `var(--paper)` oscuro).

---

<!-- v0.31.0 y anteriores: detalle archivado en docs/sessions/. -->
<!-- (regla CLAUDE.md: solo detalle de las 2 ultimas versiones aqui) -->
<!-- Detalle v0.31.0 -> docs/sessions/session-77-path-transitions.md + s77b -->
<!-- Detalle v0.29.0 -> docs/sessions/session-75-sendero-implementacion.md -->
<!-- A partir de aqui, los bloques inline son trazabilidad historica de
     versiones anteriores a la regla. No se actualizan en sesiones nuevas. -->

---

## [v0.28.8] -- 2026-05-12 -- fix(tracking): weeklyStats reset, history idempotente, streak proactivo

Sesion 69. Aplica los 5 fixes criticos/altos identificados en la auditoria de tracking
(s68 — `docs/audits/audit-tracking-v0.28.7.md`) antes del lanzamiento publico. Tres
decisiones de diseno del autor: (B) semana fija lunes-domingo con reset completo cada
nuevo lunes; (X) deteccion proactiva de rotura de streak; (P) migracion compensatoria
que recalcula `history.months/years` desde `history.days` (integro por overwrite
idempotente).

### Fixed

- **C1 — reset semanal de `weeklyStats`**: en `rolloverIfNeeded` se compara el "lunes"
  de `lastActiveDay` con el "lunes" de hoy via `getMondayOf()`. Si difieren, los 4
  vectores se ponen a `[0,0,0,0,0,0,0]`. Resuelve doble conteo lunes-a-lunes y dias
  fantasma. (`app/state-core.jsx`)
- **C2 — doble archivado en migracion s43**: `rolloverIfNeeded` ya no vuelve a
  archivar `lastActiveDay` cuando `migrateWeeklyStatsToHistory` acaba de cubrirlo
  (guard `wasAlreadyMigrated`). (`app/state-core.jsx`)
- **C3 — `archiveDayToHistory` idempotente**: `history.days[iso]` sigue siendo
  overwrite, pero `months/years` ahora se RECALCULAN desde `days` para esa
  clave (`recomputeMonthFromDays` + `recomputeYearFromDays`). Archivar el mismo
  dia N veces produce el mismo resultado. Funciones antiguas `updateMonthAggregate`
  y `updateYearAggregate` eliminadas. (`app/state-core.jsx`)
- **A1 — definicion unificada de "dia activo"**: `computeYearStats` en YearView
  ahora cuenta como activo unicamente los dias con `focusMinutes>0 OR breathMinutes>0
  OR moveMinutes>0`. Agua sola NO cuenta para la racha del ano, alineado con
  `updateStreak()`. Helper `isActiveDay(entry)` documentado. (`app/stats/YearView.jsx`)
- **A2 — rotura proactiva del streak**: `rolloverIfNeeded` evalua si
  `streak.lastActiveDate < ayer 00:00`; en ese caso `streak.current = 0`
  inmediatamente, sin esperar a la siguiente sesion. `streak.longest` y
  `streak.lastActiveDate` preservados. (`app/state-core.jsx`)
- **Convencion `weeklyStats` lunes-primero**: el array de 7 slots pasa de
  `getDay()`-indexed (0=domingo) a `lunes=0..domingo=6`. Helper
  `getDayIndexMondayFirst(date)` introducido. Todas las escrituras actualizadas
  en `state-timer.jsx`, `state-hydrate.jsx`, `state-achievements.jsx` (4 puntos),
  `state-core.jsx`. Lectores `StatsPanel.WeekBarRow`, `WeeklyStats.WeekBarRow`,
  `Sidebar.WeekDots` y `Sidebar.hitos` ya no rotan el array (eliminado el
  reorder `[data[1]..data[0]]`).

### Added (migracion compensatoria)

- **`recomputeAllHistoryAggregates(history)`** en `loadState` (guard
  `_historyRecalculated_v0_28_8`): recalcula `months` y `years` desde `days`
  una vez por instalacion. Datos previamente inflados por C2/C3 quedan
  corregidos sin intervencion del usuario.
- **`reindexWeeklyStatsMondayFirst(ws)`** en `loadState` (guard
  `_weeklyStatsReindexed_v0_28_8`): re-indexa los 7 slots de domingo-primero
  a lunes-primero con `nuevo[i] = viejo[(i+1)%7]`. Una vez por instalacion.

### Changed

- **`app/state-core.jsx`**: PACE_VERSION → `v0.28.8`. Default state anade
  `_weeklyStatsReindexed_v0_28_8: false` y `_historyRecalculated_v0_28_8: false`.
  Helpers nuevos exportados a window: `getDayIndexMondayFirst`, `getMondayOf`,
  `recomputeMonthFromDays`, `recomputeYearFromDays`, `recomputeAllHistoryAggregates`.
  Eliminados de exports: `updateMonthAggregate`, `updateYearAggregate`.
- **`PACE.html`**: titulo `v0.28.8`.
- **`sw.js`**: `CACHE_NAME` -> `pace-v0.28.8`.

### Not changed (deliberadamente fuera de scope)

- **A3** (DST en `checkHydrateWeekPerfect`): post-lanzamiento — solo afecta 2 dias/ano.
- **A4** (`checkStatsAchievements` con retraso de 1 dia desde `loadState`): post-lanzamiento.
- **M1** (`WeeklyStats.jsx` codigo muerto): solo arreglada la indexacion interna por
  consistencia. La eliminacion del archivo se aplaza.
- **M2..M6, B1..B5**: documentados en el informe, aplazados.

### Build

- `PACE_standalone.html`: 566 KB (+6 KB vs v0.28.7).
- `index.html` generado como copia exacta (SHA256: `C1290554...0D40FB`).
- Backup: `backups/PACE_standalone_v0.28.7_20260512.html` (rotado el mas antiguo v0.25.2 / 20260507).

### Verificacion

Tests de regresion en `docs/audits/regression-tests-v0.28.8.md` (5 scripts DevTools).
Antes del commit el usuario debe ejecutarlos en ventana incognita y confirmar PASS.

---

<!-- v0.28.7 y anteriores: ver tabla de historial + docs/sessions/ -->

## [v0.27.6] -- 2026-05-11 -- chore(workflow): blindaje Git

Sesion de infraestructura pura. Sin cambios de app ni UI.

### Added

- **`docs/WORKFLOW.md`**: protocolo de cierre de sesion Git — como detectar si
  estas en worktree vs main, comandos de merge y push, checklist de 11 pasos,
  tabla de senales de alarma y limpieza de worktrees obsoletos.
- **`scripts/check-session.ps1`**: script PowerShell de solo lectura que detecta
  worktrees activos, cambios sin commitear, commits sin push, lista worktrees y
  estado del bundle. Imprime resumen "Todo en GitHub" o lista acciones requeridas.

### Changed

- **`README.md`**: version actualizada de v0.12.9 (dato obsoleto) a v0.27.6 +
  nueva seccion "Estado actual" con tabla de modulos, Caminos, logros, stats,
  i18n, state split, build y links a WORKFLOW.md y BUILD.md.
- **`docs/BUILD.md`**: nueva seccion "Despues del build" con recordatorios de
  commit/push manual y llamada a `scripts/check-session.ps1`.
- **`app/state-core.jsx`**: PACE_VERSION bumpeada a `v0.27.6`.
- **`PACE.html`**: titulo bumpeado a `v0.27.6`.

### Build

- `PACE_standalone.html`: 538 KB, 0 errores, 0 WARN.

---

## [v0.27.5] -- 2026-05-11 -- refactor(state): split en 6 modulos

Refactor de infraestructura puro. Sin cambios de comportamiento ni UI.

### Changed

- **`app/state.jsx`** (1026 lineas) dividido en 6 modulos cohesivos + indice:
  - `state-core.jsx` (356 ln): store, loadState, rollover, history helpers, toast
  - `state-timer.jsx` (49 ln): addFocusMinutes, completePomodoro
  - `state-hydrate.jsx` (52 ln): addWaterGlass, checkHydrateWeekPerfect
  - `state-achievements.jsx` (251 ln): unlockAchievement, detectores, complete*Session, updateStreak
  - `state-paths.jsx` (166 ln): paths CRUD, stats, favoritos
  - `state-settings.jsx` (13 ln): setLang
  - `state.jsx` (58 ln): indice — re-export consolidado del API publica
- **`PACE.html`**: scripts state-*.jsx en orden correcto antes de state.jsx. Titulo v0.27.5.
- **`PACE_VERSION`**: bumpeada a `v0.27.5` en state-core.jsx.
- **`build-standalone.js`**: ruta TypeScript ampliada para funcionar en Windows (fallback a node_modules local).
- Total lineas state: 1026 → 945 (-8%). Ningun archivo supera 400 lineas.
- API publica preservada identica (31 exports, mismo nombre).
- Comportamiento: 21/21 trazas de validacion OK.

### Sizes

- `PACE.html`: titulo bumpeado a v0.27.5.
- `PACE_standalone.html`: 538 KB (vs 545 KB pre-refactor, -7 KB por menos comentarios duplicados).

---

## [v0.27.2] -- 2026-05-09 -- chore(polish): i18n sync, a11y overlays, mobile, smoke tests

Sesion de pulido sin features nuevas. Consistencia i18n, accesibilidad basica
en overlays de Caminos, responsive mobile y documentacion de smoke tests.

### Fixed
- `app/i18n/strings.js`: verificado 0 diff entre bloques ES/EN (321 claves cada uno).
- `app/i18n/strings.js`: verificado 0 claves t() huerfanas en JSX.

### Changed
- `app/paths/PathRunner.jsx`: overlay principal con `role="dialog"`, `aria-modal="true"`,
  Escape handler (redirige a ExitConfirmModal si paso obligatorio, abandona si opcional).
- `app/paths/PathRunner.jsx`: ExitConfirmModal con `role="dialog"`, `aria-modal="true"`,
  `aria-labelledby`, Escape handler (cancela), focus inicial en boton Seguir via ref.
- `app/paths/PathsLibrary.jsx`: `aria-labelledby` + id en titulo, Escape handler,
  focus inicial en boton cerrar via ref, aria-label i18n (`common.close`), icono ✕ canónico.
- `PACE.html`: `@media (max-width:480px)` -- padding .path-topbar, min-height 44px en
  botones touch de overlays, .path-stats-summary en columna, SuggestedPathCard dual a columna.
- `PACE.html`: titulo bumpeado a v0.27.2.
- `app/state.jsx`: PACE_VERSION bumpeado a v0.27.2.

### Added
- `docs/qa/smoke-tests.md`: 7 smoke tests manuales reproducibles (Pomodoro, path.dawn
  completo, abandon a mitad, favorito dual, libreria->completar, Stats Caminos, i18n EN).

### Build
- 544 KB, 0 ERRORs, 0 WARNs.

Detalle: [`docs/sessions/session-55-polish.md`](./docs/sessions/session-55-polish.md).

---

## [v0.27.1] -- 2026-05-09 -- feat(stats): seccion Caminos

Estadisticas de Caminos integradas en el panel Stats existente como cuarta tab.

### Nuevo
- `app/stats/PathStats.jsx` (105 ln): tab Caminos -- contador total, rachas current/best, tabla por camino (nombre i18n, veces, ultimo dia), heatmap anual.
- `app/stats/PathYearView.jsx` (176 ln): clon ligero de YearView con fuente paths.history (array ISO strings), niveles 0-4 segun count por dia.
- `getPathStats()` y `computePathStreaks()` en state.jsx, exportadas a window.
- `paths.history` en defaultState: array ISO strings registrado al completar cada camino.
- Migracion defensiva: instalaciones pre-s54 derivan history desde paths.completed.lastDoneAt.
- 10 claves i18n nuevas x 2 idiomas (stats.tab.paths + stats.paths.*).

### Mejorado
- `StatsPanel.jsx`: cuarta tab "Caminos" que renderiza PathStats.
- `PACE.html`: scripts PathYearView + PathStats, CSS .path-stats-*, titulo v0.27.1.
- `PACE_VERSION` bumpeado a `v0.27.1`.

### Build
- 542 KB, 0 ERRORs, 0 WARNs.

Detalle: [`docs/sessions/session-54-estadisticas-caminos.md`](./docs/sessions/session-54-estadisticas-caminos.md).

---

## [v0.27.0] -- 2026-05-08 -- feat(paths): Caminos parte 2

Segunda parte del sistema de Caminos. Biblioteca visual, favoritos, repeticion y sugerencia dual.

### Nuevo
- `app/paths/PathsLibrary.jsx` (168 ln): overlay modal con los 5 caminos, toggle favorito, boton comenzar, badges estado.
- `setFavoritePath`, `clearFavoritePath`, `toggleFavoritePath` en `state.jsx` + exportadas a `window`.

### Mejorado
- `SuggestedPathCard.jsx`: modo dual (favorito + sugerido por hora si son distintos), boton "Ver todos".
- `PathRunner.jsx` CompletionScreen: boton "Repetir camino" secundario.
- `app/i18n/strings.js`: 11 claves nuevas x 2 idiomas (ES + EN).
- `PACE.html`: script PathsLibrary, titulo v0.27.0.
- `app/main.jsx`: monta `<PathsLibrary />`.
- `PACE_VERSION` bumpeado a `v0.27.0`.

### Build
- 526 KB, 0 ERRORs, 0 WARNs.

---

<!-- Solo se detallan las 2 ultimas versiones. Para v0.26.1 y anteriores ver docs/sessions/ -->
## [v0.26.0] -- 2026-05-08 -- feat(paths): SuggestedPathCard

Tercera y ultima sesion del sistema de Caminos. Cierra `v0.26.0` (sin sufijo alpha/beta).

### Que se hizo

**Creado:**
- `app/paths/SuggestedPathCard.jsx` (92 lineas) -- SPCIconBreathe/Focus/Body/Hydrate + tarjeta principal con acento oliva, doneToday badge, boton Comenzar.

**Modificado:**
- `app/main.jsx` -- `<SuggestedPathCard />` montado entre ActivityBar y cierre de `<main>`.
- `app/i18n/strings.js` -- 10 claves `paths.path.*.name/tagline` en ES y EN (20 entradas totales).
- `PACE.html` -- script SuggestedPathCard.jsx + bump titulo v0.26.0.
- `app/state.jsx` -- bump PACE_VERSION v0.26.0-beta -> v0.26.0.

**Validacion:** V1..V6 OK. Bundle 492 KB, 0 errores, 2 WARN conocidos.

Detalle: [`docs/sessions/session-51-suggested-path-card.md`](./docs/sessions/session-51-suggested-path-card.md).

---

## [v0.26.0-beta] -- 2026-05-08 -- feat(paths): PathRunner UI

Sesion 50 - segunda de tres sesiones del sistema de Caminos. PathRunner se monta como overlay full-screen cuando paths.current != null. Con paths.current === null devuelve null - cero impacto visual en home.

### Added
- **`app/paths/PathRunner.jsx`** (434 lineas) - overlay PathRunner con 9 subcomponentes: PathTopBar (dots de progreso), ExitConfirmModal (in-app, sin window.confirm), CompletionScreen (click explicito), StepError, PathHydrateStep (addWaterGlass protegido), PathFocusStep (timer simple), PathBreatheStep (con safety gate), PathBodyStep (resolveBodyRoutine -> MoveSession), PathRunner (orquestador).
- **12 claves i18n** en ES y EN: `path.runner.*` (exit, confirm, skip, done, complete), `path.hydrate.*`, `path.error.routineNotFound`.
- **CSS** `.path-runner-overlay`, `.path-topbar`, `.path-dots`, `.path-dot`, `.path-step-body`, `.path-modal-back` en bloque `pace-paths-css` en PACE.html.

### Changed
- **`app/main.jsx`** - `<PathRunner />` insertado antes de `<ToastHost />`.

---

## [v0.26.0-alpha] — 2026-05-08 — feat(paths): Caminos parte 1 — capa de datos

Sesión 49 · primera de tres sesiones del sistema de Caminos. Sin UI todavía — solo capa de datos limpia y verificable. Con `state.paths.current === null` (estado por defecto), la app se ve y funciona idéntica a v0.25.4.

### Added
- **`app/paths/registry.js`** (nuevo, 88 líneas) — `PATH_CATALOG` con 5 caminos canónicos (`path.dawn`, `path.midday`, `path.afternoon`, `path.dusk`, `path.weekend`), `getPath(id)`, `resolveBodyRoutine(id)` (busca en Move → Extra). Exportado a `window`.
- **`state.paths`** en `defaultState` — `{ current, completed, favorite }`. Migración defensiva en `loadState`: si `parsed.paths` no existe (instalación previa a v0.26), se inicializa con el default sin tocar otros campos.
- **`startPath(pathId)`** — inicia un camino desde el step 0.
- **`advancePathStep(reason)`** — avanza al siguiente paso (`'done'` o `'skip'`). Si es el último, completa el camino en ambos casos. Actualiza `paths.completed[id].count` y `lastDoneAt`.
- **`completePath(pathId)`** — atajo manual de compleción.
- **`abandonPath()`** — cancela el camino en curso (`current → null`).
- **`getSuggestedPath(now?)`** — heurístico horario: fin de semana → `path.weekend`; 6-11h → `path.dawn`; 12-14h → `path.midday`; 15-17h → `path.afternoon`; 18-22h → `path.dusk`; fuera de rango → `path.dusk`.
- **`getBreatheRoutine(id)`** en BreatheLibrary · **`getMoveRoutine(id)`** en MoveModule · **`getExtraRoutine(id)`** en ExtraModule — helpers de lookup expuestos a `window`, usados por `resolveBodyRoutine`.
- **`todayISO()`** — helper interno que devuelve fecha en formato `YYYY-MM-DD`.

### Pending (próximas sesiones)
- Sesión 50: `PathRunner.jsx` + claves i18n `paths.*`
- Sesión 51: `SuggestedPathCard.jsx` en home

---

## [v0.25.4] — 2026-05-08 — fix(achievements): hotfix Achievements.jsx truncado

Sesión 48d.1 · hotfix del truncamiento introducido en s48d.

**Causa raíz:** la llamada Edit que reemplazó el bloque `GLYPH_SVG` en s48d
truncó `app/achievements/Achievements.jsx` en la línea 273 (el archivo completo
tiene 389 líneas en base). El standalone inlineó el archivo a medias y Babel
lanzó `Unterminated string constant` al cargarlo.

### Fixed
- **`app/achievements/Achievements.jsx` restaurado** — base limpia recuperada
  de `origin/main` (389 líneas), correcciones de s48d re-aplicadas mediante
  script Python. Archivo final: 402 líneas, balance `{`/`}` 207/207, Object.assign OK.
  Incluye las 33 entradas `GLYPH_SVG` + alias + 34 referencias `glyphSvg` en catálogo.
- **`build-standalone.js` mejorado** — añadida `validateNoUnclosedStrings()` en
  modo warning: detecta strings/template literals sin cerrar al final de cada
  `.jsx` inlineado y avisa por consola sin abortar el build.
- **`app/state.jsx`** — `PACE_VERSION` v0.25.3 → v0.25.4.
- **`PACE.html`** — título actualizado a v0.25.4.

### Bundle v0.25.4
493566 bytes / 481 KB · 0 null bytes · `</body>` ×1 · `</html>` ×1 ·
29 bloques babel · 0 `fill="#` en GLYPH_SVG.

### Backups
`backups/PACE_standalone_v0.25.3_20260508_ROTO.html` (bundle truncado conservado) ·
`backups/PACE_standalone_v0.25.4_20260508.html` (nuevo bundle sano). Total: 18 backups.

---

## [v0.25.3] — 2026-05-08 — fix(achievements): auditoría glifos Dirección D

Sesión 48d · auditoría mecánica post-s48/48b/48c. Comparación byte a byte de
cada `glyphSvg` de `GLYPH_SVG` contra la sección "Dirección D · Constelación"
de `design/glyphs-explorations.html`. **Nota:** el bundle v0.25.3 estaba roto
(Achievements.jsx truncado); corregido en v0.25.4.

Sesión 48d · auditoría mecánica post-s48/48b/48c. Comparación byte a byte de
cada `glyphSvg` de `GLYPH_SVG` contra la sección "Dirección D · Constelación"
de `design/glyphs-explorations.html`.

**Causa raíz de las divergencias B:** la sesión 48 reducia portó los cuerpos
SVG omitiendo el espacio entre elementos (`/>` en lugar de `"/> "`). Visualmente
equivalentes, pero literalmente distintos del canónico. En `first.ritual`
además faltaba el segmento degenerado `M22 22 L22 22` del path.

**Fixed (B — 18 sustituidos por canónicos literales):**
`first.step`, `first.breath`, `first.stretch`, `first.sip`, `first.extra`,
`first.cycle`, `first.ritual` (+ contenido real), `first.day`,
`streak.3`, `streak.7`, `streak.30`, `streak.365`,
`breathe.sessions.10`, `breathe.sessions.50`, `move.sessions.25`,
`explore.box`, `explore.coherent`, `explore.rounds`.

**Added (C — 13 nuevos portados desde Dirección D):**
`explore.nadi`, `explore.physiological`, `explore.hips`, `explore.atg`,
`explore.ancestral`, `master.pomodoro.8`, `master.long.focus`,
`master.dawn`, `master.dusk`, `master.focus.day`, `master.retreat`,
`master.marathon`, `master.centurion`.
Cada uno también recibió `glyphSvg: GLYPH_SVG['<id>']` en su entrada
del `ACHIEVEMENT_CATALOG`.

**Sin cambios (A):** `focus.hours.100` (coincidía literalmente).
**Sin canónico (D):** `secret.cow.click` (intacto, es secreto).
**Alias (E):** `first.plan → first.ritual` verificado OK.

Totales: GLYPH_SVG pasa de 20 a 33 entradas + 1 alias.
Verificación estructural 6/6 OK: 0 `fill="#`, 0 sin `glyphSvg` en catálogo,
`viewBox 44×44` OK, alias OK, 274 líneas (< 500).
Standalone: 491202 bytes / 479 KB, 0 anomalías.

---

## [v0.25.2] — 2026-05-07 — fix(standalone): repara crash post-s48b

Sesión 48c · hotfix de carga: el standalone v0.25.1 generaba `Uncaught SyntaxError`
de Babel (`Unexpected token, expected "}"` en SessionShell:41) y la consola
escupía además dos errores CORS de `manifest.json` que parecían un crash. Causa
raíz: en la sesión 48 truncada, 10 archivos `.jsx` quedaron con la línea
literal `  <script type="text/babel">` al principio. El `build-standalone.js`
los envuelve en otro `<script type="text/babel">{contenido}</script>`, así que
el primer `</script>` interno cerraba ambos a nivel HTML y el segundo
`<script type="text/babel">` quedaba como JSX literal — Babel pegaba el petardazo
al verlo. Adicionalmente, el propio `PACE.html` estaba truncado: faltaba el
mount loop (`function mount() { ... }`) y los cierres `</body></html>`. Ningún
backup posterior a v0.20.0 estaba completo.

### Fixed
- **10 .jsx limpiados** — `<script type="text/babel">` eliminado de la primera
  línea de: `app/tweaks/TweaksPanel.jsx`, `app/breakmenu/BreakMenu.jsx`,
  `app/hydrate/HydrateModule.jsx`, `app/extra/ExtraModule.jsx`,
  `app/move/MoveModule.jsx`, `app/breathe/BreatheSession.jsx`,
  `app/focus/FocusTimer.jsx`, `app/ui/Toast.jsx`, `app/ui/Sound.jsx`,
  `app/ui/SessionShell.jsx`. Resto del contenido intacto (verificado balance
  de llaves/paréntesis, conteo de líneas y final con `Object.assign(window, ...)`).
- **`PACE.html` reconstruido completo** — añadido el bloque
  `<script type="text/babel" data-presets="env,react">` con la `function mount()`
  6-check (PaceApp + BreakMenu + TweaksPanel + BreatheSession + MoveSession +
  ToastHost) + timeout 5 s (decisión s38b) + registro del Service Worker para
  PWA + cierres `</body></html>`. Backup del PACE.html previo: `PACE.html.bak.pre-fix`.
- **`build-standalone.js` reescrito completo via bash** — el archivo previo se
  truncaba al editarlo con la herramienta Edit. Ahora se escribe vía heredoc.
  Se añade paso `0`: `html.replace(/\s*<link rel="manifest"[^>]*>\s*/, '\n  ')`
  para sacar el `<link rel="manifest">` del bundle final. Razón: en `file://`
  (uso típico del standalone) el manifest dispara dos errores CORS rojos en
  consola que parecen un crash sin serlo. `PACE.html` (dev / PWA) lo conserva.

### Verificación
- Bundle: 480 KB / 491 202 bytes / 9 145 líneas.
- 0 null bytes, 0 U+FFFD, 0 `<script type="text/babel"><script` doble.
- 27 bloques `<script type="text/babel">` (26 módulos + mount loop) con balance
  perfecto de llaves y paréntesis (script de validación con `node`).
- `</body>` y `</html>` presentes 1 vez cada uno al final.
- `function mount` aparece 1 vez (en el bundle generado).
- `rel="manifest"` desaparecido del bundle (se conserva en `PACE.html`).

### Archivos
**Modificados:** los 10 `.jsx` listados arriba, `PACE.html`, `build-standalone.js`,
`app/state.jsx` (`PACE_VERSION` v0.25.0 → v0.25.2; la 0.25.1 nunca llegó a
quedar reflejada en la constante por la corrupción).  
**Nuevos:** `backups/PACE_standalone_v0.25.1_20260507_pre48c.html`,
`backups/PACE_standalone_v0.25.2_20260507.html`,
`PACE.html.bak.pre-fix`,
`docs/sessions/session-48c-fix-standalone-truncamientos.md`.

### Bugs/issues abiertos descubiertos durante la sesión
Ninguno — todos los archivos `.jsx` quedaron con balance correcto y ningún
truncamiento intermedio detectable. La fuente del problema era exclusivamente
la línea-cabecera `<script>` espuria al principio.

Detalle: [`docs/sessions/session-48c-fix-standalone-truncamientos.md`](./docs/sessions/session-48c-fix-standalone-truncamientos.md)

---

## [v0.25.1] — 2026-05-07 — fix(achievements): glifos canónicos Dirección D

Sesión 48b · restauración masiva de 12 archivos truncados + portado definitivo de
glifos canónicos Dirección D a `Achievements.jsx`. Standalone limpio 478 KB.

### Fixed
- **20 glifos portados literalmente** de `design/glyphs-explorations.html`
  (sección "Dirección D · Constelación"). viewBox 44×44 exacto, `currentColor`
  en lugar de códigos hex, geometría preservada sin cambios.
- **Bug corregido (s46):** los 10 glifos previos eran inventados a ojo con
  viewBox 24×24, no portados de la exploración canónica.
- **`first.plan`** alias de `first.ritual` (decisión s28).
- **`secret.cow.click`** reescalado proporcional 24→44 (×1.833) — no tiene
  canónico en la exploración (logro secreto).
- **Nuevas entradas glyphSvg en catálogo:** `streak.7`, `streak.30`, `streak.365`,
  `focus.hours.100`, `breathe.sessions.10`, `breathe.sessions.50`,
  `move.sessions.25`, `explore.box`, `explore.coherent`, `explore.rounds`.
- **Restauración de archivos truncados** (sesión 48 previa fallida):
  `state.jsx`, `main.jsx`, `strings.js`, `BreatheLibrary.jsx`, `SessionShell.jsx`,
  `Sound.jsx`, `Toast.jsx`, `FocusTimer.jsx`, `BreatheSession.jsx`,
  `MoveModule.jsx`, `ExtraModule.jsx`, `HydrateModule.jsx`, `BreakMenu.jsx`,
  `TweaksPanel.jsx`. Fuente: backup `v0.25.0_20260507`.
- **`build-standalone.js`** reconstruido completo con `readFileClean()` blindado
  (BOM UTF-8/16 + null bytes + abort si el bundle final contiene null bytes).

### Entradas en GLYPH_SVG (20 total)
Primeros pasos (8): `first.step`, `first.breath`, `first.stretch`, `first.sip`,
`first.extra`, `first.cycle`, `first.ritual`, `first.day`.
Constancia (8): `streak.3`, `streak.7`, `streak.30`, `streak.365`,
`focus.hours.100`, `breathe.sessions.10`, `breathe.sessions.50`, `move.sessions.25`.
Exploración (3): `explore.box`, `explore.coherent`, `explore.rounds`.
Alias: `first.plan` → `first.ritual`. Secreto: `secret.cow.click`.

**Archivos:** `app/achievements/Achievements.jsx` (389L, reescrito via bash).  
**Standalone:** 478 KB, 0 null bytes, 0 U+FFFD.  
**Verificación:** 20 entradas GLYPH_SVG, 21 glyphSvg en catálogo, 0 `fill="#`.

Detalle: [`docs/sessions/session-48b-glifos-canonicos-restauracion.md`](./docs/sessions/session-48b-glifos-canonicos-restauracion.md)

---

## [v0.25.0] — 2026-05-06 — feat: stats achievements + mobile UX + 10 constellation glyphs

Sesión 46 · 5 bloques. Nueva categoría de logros "Estadísticas", dos fixes de UX móvil,
y 10 glifos SVG (Dirección D: Constelaciones) que arrancan la migración visual del catálogo.

### Bloque B — fix(copy): "Ritmo semanal" → "Ritmo"
- `app/i18n/strings.js`: `stats.title` ES→`'Ritmo'` / EN→`'Rhythm'`; nuevas claves
  `stats.tag` (ES `'Estadísticas'` / EN `'Stats'`) y `ach.cat.stats` (ES/EN).

### Bloque C2 — fix(mobile): sidebar colapsado en primera carga
- `app/state.jsx`: nueva `isMobileViewport()` + `loadState()` fuerza
  `sidebarCollapsed: true` en móvil cuando no hay preferencia guardada.

### Bloque C1 — fix(mobile): ocultar tabs TopBar en ≤768px
- `app/main.jsx`: CSS `[data-pace-topbar] [data-pace-tabs] { display: none !important; }`
  en `@media (max-width: 768px)`. Tabs no necesarios en móvil (BreakMenu maneja modo).

### Bloque A — feat(achievements): categoría "Estadísticas" con 4 logros
- `app/achievements/Achievements.jsx`: 4 entradas nuevas (`stats.streak.30`,
  `stats.month.first`, `stats.month.focus`, `stats.year.first`); `CAT_META.estadisticas`.
- `app/state.jsx`: `checkStatsAchievements()` + llamada en `ensureDayFresh()`;
  `updateStreak()` dispara `stats.streak.30` al cruzar 30 días.

### Bloque D — feat(glyphs): 10 glifos SVG Constelaciones
- **Dirección D (Constelaciones) adoptada.** Invalida decisión s29 (híbrido A+B).
- `app/achievements/Achievements.jsx`: `GLYPH_SVG` (11 entradas), `renderGlyph()`,
  `Seal` actualizado; campo `glyphSvg` en 11 entradas del catálogo.
- `app/ui/Toast.jsx`: `full` incluye `glyphSvg`; render SVG condicional en el círculo.
- **Nuevo:** `design/glyphs-constelaciones-preview.html` — preview a Seal (56px) y Toast (40px).

**Archivos:** `state.jsx`, `main.jsx`, `Achievements.jsx`, `Toast.jsx`, `strings.js`, `PACE.html`.  
**Standalone:** 476 KB — cierra con `</body></html>`.  
**Logros cazables:** 54 → **58** (+4 Estadísticas).

Detalle: [`docs/sessions/session-46-stats-ux-glifos.md`](./docs/sessions/session-46-stats-ux-glifos.md)

---

## [v0.24.0] — 2026-05-06 — feat(stats): YearView

Heatmap anual completo. Cierra el frente Stats al 100% (Semana | Mes | Año funcionales).

**Nuevo archivo `app/stats/YearView.jsx`** (324 líneas)
- Score compuesto por día: `focusBlocks (cap 3) + breathSessions + moveSessions + waterFrac/8`. Techo natural ≈ 5.
- 5 niveles visuales: vacío (paper-3), 1-2 (ocre/move 22-48%), 3 (terracota/breathe 72%), 4 (oliva/focus 100%) — salto de familia cromática para "día pleno".
- Grid 53 columnas × 7 filas. Etiquetas de mes flotando; etiquetas de día (L/X/V) a la izquierda.
- Días futuros: hueco invisible (sin presión silenciosa). Pre-uso: crema/borde muy tenue.
- Navegación ‹ › entre años con datos + año actual.
- Click en celda → zoom al tab "Mes" navegado a esa fecha.
- Tooltip desktop (fixed) + móvil (card bottom 88px, cierra al tocar fuera).
- Footer: total acciones · días activos · racha máxima.
- Responsive ≤640px: scroll horizontal + scroll-snap por trimestre + celdas 11px.

**`app/stats/StatsPanel.jsx`** (393 líneas)
- `MonthHeatmap` acepta `initialYear`/`initialMonth` para el jump desde YearView.
- `StatsPanel` gestiona `jumpYear`/`jumpMonth` + `handleNavigateToMonth`.
- `maxWidth` del Modal: 780 → 820px.

**`app/i18n/strings.js`**: 10 claves nuevas ES + 10 EN (prefijo `stats.year.*`).

**Infraestructura**: `PACE.html` +script `YearView.jsx`; `PACE_VERSION` v0.24.0; standalone 451 KB; backup v0.23.0.

Detalle: [`docs/sessions/session-44-yearview.md`](./docs/sessions/session-44-yearview.md)

---

## [v0.23.0] — 2026-05-06 — feat(history): capa de datos + heatmap mensual

Sistema de historial de actividad completo + nueva vista MonthHeatmap en el panel de estadísticas.

**BLOQUE A — Capa de datos (`state.jsx`)**
- `defaultState` ampliado con `history: { days:{}, months:{}, years:{} }` y `_historyMigrated: false`.
- 6 funciones puras nuevas: `zeroEntry`, `toISODate`, `updateMonthAggregate`, `updateYearAggregate`, `archiveDayToHistory`, `migrateWeeklyStatsToHistory`.
- `rolloverIfNeeded` extendido: archiva el día que termina en `history.days` (solo si hay datos) y actualiza agregados mes/año de forma incremental. Migration guard de una sola vez al primer rollover post-upgrade.

**BLOQUE B — UI (`StatsPanel.jsx`)**
- `WeeklyStats.jsx` → `StatsPanel.jsx`. Script tag y JSX actualizados.
- Tabs `Semana | Mes | Año` sobre el contenido del modal.
- `MonthHeatmap`: grid 7 cols (L→D), color por módulo dominante (5 niveles de opacidad via div interno absoluto), navegación ‹ ›, totales del mes, tooltip hover/tap, responsive ≤640px.
- `YearView`: placeholder "Próximamente" (sesión 44).
- 15 claves i18n nuevas en ES + EN.

**Archivos:** `state.jsx`, `stats/StatsPanel.jsx` (nuevo), `i18n/strings.js`, `PACE.html`, `main.jsx`.
**Detalle:** [`docs/sessions/session-43-history-heatmap-mensual.md`](./docs/sessions/session-43-history-heatmap-mensual.md)

---

## [v0.22.1] — 2026-05-06 — fix(ux): corrección UX móvil

Cuatro fixes quirúrgicos de UX móvil. Sin cambios de comportamiento en desktop.

- **SessionShell.jsx** — `[data-pace-session-hint]` pasa de reescalar a `display: none` en ≤640px. El hint de teclado ya no aparece en móvil donde no tiene utilidad.
- **MoveModule.jsx** — Eliminados `title="←"`, `title="Espacio"`, `title="→"` de los tres botones de MoveSession (evita tooltip nativo en long-press móvil). Cronómetro de pasos `data-pace-move-timer` + bloque CSS responsive: 128px → 72px en ≤640px.
- **BreakMenu.jsx** — `data-pace-break-shortcut` en el div contenedor + bloque CSS: `.pace-meta` oculto en ≤640px. El botón "Saltar" (`<Button>`) no se ve afectado.

Detalle completo: [`docs/sessions/session-42-ux-movil-hints-timer-shortcut.md`](./docs/sessions/session-42-ux-movil-hints-timer-shortcut.md).

---

## [v0.22.0] — 2026-05-06 — feat: split + i18n + 5 detectores logros

### Split — TweakSecretsWatcher extraído

`TweakSecretsWatcher` movido de `TweaksPanel.jsx` a `app/tweaks/TweakSecretsWatcher.jsx`
(61 líneas). `TweaksPanel.jsx` pasa de 553 → **479 líneas**. Sin cambio de comportamiento.
`PACE.html` carga el nuevo archivo justo antes de `TweaksPanel.jsx`.

### i18n — toggle ambient

`aria-label` y texto del toggle "+ ambiente durante sesiones" migrados a
`t('settings.audio.ambient')`. Clave añadida en ES y EN en `strings.js`.

### Detectores de logros — state.jsx

Nuevos campos en `defaultState`: `waterGoalDates: []` + `routineCounts: {}`.

Nuevas funciones:
- `checkHydrateWeekPerfect()` — 7 días consecutivos con `water.today ≥ water.goal`.
- `checkRoutineCountAchievements(category)` — umbrales por tipo de rutina.
- `BREATH_ROUTINE_CATEGORIES` — mapa routineId → categoría (`box / coherent / rounds`).

Hooks añadidos en `addWaterGlass`, `completeBreathSession` y `completeExtraSession`.

### IMPLEMENTED_ACHIEVEMENTS

Añadidos: `hydrate.week.perfect` (Constancia **15/15** cerrada),
`master.box.10`, `master.coherent.10`, `master.rounds.10`, `master.atg.20`
(Maestría **13/25**).

Detalle completo: [`docs/sessions/session-41-drone-toggle-logros.md`](./docs/sessions/session-41-drone-toggle-logros.md).

---

## [v0.21.0] — 2026-05-06 — feat(audio): sonidos mov/hydrate/achievements

Detalle completo: [`docs/sessions/session-40-sonidos-modulos.md`](./docs/sessions/session-40-sonidos-modulos.md).

---

## [v0.20.0] — 2026-05-05 — feat(audio): refactor 432 Hz

Detalle completo: [`docs/sessions/session-38a-audio-refactor-432hz.md`](./docs/sessions/session-38a-audio-refactor-432hz.md) y [`docs/sessions/session-38b-fix-mount-race.md`](./docs/sessions/session-38b-fix-mount-race.md).

---

## [v0.19.1] — 2026-05-05 — fix(i18n): useT() AchievementsPreview

Detalle completo: [`docs/sessions/session-37-i18n-pwa-ajustes.md`](./docs/sessions/session-37-i18n-pwa-ajustes.md).

---

## [v0.19.0] — 2026-05-05 — Cierre i18n + PWA + Ajustes

Detalle completo: [`docs/sessions/session-37-i18n-pwa-ajustes.md`](./docs/sessions/session-37-i18n-pwa-ajustes.md).

---

## [v0.18.0] — 2026-05-05 — i18n contenido + FocusTimer + dot eliminado

Detalle completo: [`docs/sessions/session-36-i18n-content-toggle.md`](./docs/sessions/session-36-i18n-content-toggle.md).

---

## ~~[v0.17.0]~~ — detalle retirado (ver tabla · diario: [session-35](./docs/sessions/session-35-i18n-completo.md))

## ~~[v0.16.0]~~ — detalle retirado (ver tabla · diario: [session-34](./docs/sessions/session-34-split-breathe-logros.md))

Split `BreatheModule.jsx` en 3 archivos (`BreatheVisual` + `BreatheLibrary` + `BreatheSession`) + 4 detectores de logros nuevos (`master.collector.half/full`, `master.silent.day`, `master.retreat`). Maestría 5/25 → 9/25.

---

## ~~[v0.15.0]~~ — detalle retirado (ver tabla · diario: [session-33](./docs/sessions/session-33-loop-post-pomodoro.md))

`BreakMenu` con rotación inteligente post-Pomodoro: `computeScore` + sort + tag "Para ti" + indicador done. Nuevo `build-standalone.js` (Node.js, reemplaza `super_inline_html`).

---

## ~~[v0.14.3]~~ — detalle retirado (ver tabla · diario: [session-32](./docs/sessions/session-32-code-review-fixes.md))

7 correcciones de calidad sin cambios de comportamiento: dead state `justFinished` en FocusTimer, condición redundante en `rolloverIfNeeded`, `useRef` mal ubicado en MoveSession, `aria-live` en Toast, sonido `sip` en vasos individuales, orden de logros en Sidebar por `unlockedAt` desc.

---

## [v0.13.0] — 2026-04-29 — Fruta fácil: logros + sonidos

Sesión corta de fruta fácil del backlog priorizado. Tres bloques sin
cambios estructurales ni visuales: triggers de logros que ya estaban
en el catálogo como "Pronto", rachas largas y un módulo nuevo de
sonido sintetizado.

**Categoría "Primeros pasos" cerrada al 100%** (10/10) — antes 5/10.

### Añadido
- **5 triggers de primeros pasos:**
  - `first.cycle` — Pomodoro completado + el usuario elige una de
    las 3 micro-pausas activas en `BreakMenu` (Respira/Mueve/Hidrátate).
    "Saltar" no cuenta. Wrapper `handleChoose` en
    `app/breakmenu/BreakMenu.jsx`.
  - `first.ritual` — los 4 flags de `state.plan` en true (respira +
    muevete + extra + hidratate). Helper `checkPlanAchievements()`
    en `state.jsx`, llamado desde las 4 acciones de completar.
  - `first.plan` — mismo trigger que `first.ritual`. Decisión de
    producto: "completar el plan" === "tocar los 4 módulos del día".
  - `first.day` — primer día de uso. Disparado en `updateStreak`
    cuando `current >= 1` (idempotencia de `unlockAchievement`).
  - `first.return` — abrir la app un día distinto al de la última
    actividad. Disparado en `rolloverIfNeeded()` con `setTimeout`
    para no llamar `unlockAchievement` desde dentro de `loadState`.
- **3 rachas largas:** `streak.14`, `streak.60`, `streak.365`.
  Tres líneas en el bloque de umbrales de `updateStreak`.
- **Bonus: `master.focus.day`** — 4h de foco en un día. Aprovecha
  el bucket diario `weeklyStats.focusMinutes[day]` ya existente.
  Evaluado al final de `addFocusMinutes`.
- **`app/ui/Sound.jsx`** (nuevo, ~110 líneas) — módulo de sonidos
  sutiles vía Web Audio API. Decisión técnica: **sintetizar** en
  lugar de descargar WAVs CC0. Razones: standalone más ligero
  (~3 KB vs 50-100 KB), coherencia filosófica (campana de campo,
  no click digital), cero dependencias externas. Catálogo:
  - `tick` — click 800 Hz, 30 ms (no cableado, disponible).
  - `complete` — campana do5+sol5+do6, 600 ms. Cableado en
    `FocusTimer` al llegar a 00:00.
  - `sip` — gota con glide 600→380 Hz, 200 ms. Cableado en
    `HydrateTracker` (clic en vaso y botón "+").
  - `breath` — la4, 250 ms, gain 0.045 (muy discreto). Cableado
    en `BreatheModule` al cambio de fase del ticker principal.
- **`<template id="__bundler_thumbnail">`** en `PACE.html` — splash
  SVG con paleta crema y wordmark "Pace · FOCO · CUERPO". Requerido
  por `super_inline_html`; se muestra brevemente al cargar el
  standalone y como fallback no-JS.

### Cambiado
- `IMPLEMENTED_ACHIEVEMENTS` en `Achievements.jsx`: 30 → 39 ids
  (+9). Comentarios de categoría actualizados ("10/10", "10/15",
  "2/25").
- `PACE_VERSION`: `v0.12.10` → `v0.13.0` en `state.jsx`.
- Título de `PACE.html` actualizado.

### Reglas vigentes nuevas (decisiones activas)
- **Sonidos sintetizados con Web Audio en lugar de samples WAV.**
  Cualquier sonido nuevo se añade como receta en `SOUND_RECIPES`.
  Si se necesita un sample real (efecto que no se sintetiza bien),
  evaluar el coste en KB del standalone antes. **El sonido nunca
  debe romper la app**: todos los `playSound` van envueltos en
  `try/catch` y el módulo es noop silencioso ante cualquier fallo.
- **`first.ritual` y `first.plan` comparten trigger.** "Completar
  el plan del día" === "tocar los 4 módulos del día". Si en el
  futuro se quisieran diferenciar, habría que inventar un umbral
  artificial — no merece la pena.

### Verificación
- `PACE.html` carga limpio (consola sin errores).
- `PACE_standalone.html` regenerado a ~358 KB (+1 KB por `Sound.jsx`).
- Sonidos probados con `playSound('complete')` etc. desde devtools.
- Triggers de logros nuevos no probados manualmente (requeriría
  manipular `lastActiveDate` en localStorage). Riesgo bajo: la
  lógica es comparación de enteros con el patrón validado por
  `streak.3/7/30/100`.

### Archivos
- **Nuevos:** `app/ui/Sound.jsx`,
  `docs/sessions/session-28-fruta-facil-logros-sonidos.md`,
  `backups/PACE_standalone_v0.12.10_20260429.html`.
- **Modificados:** `PACE.html`, `PACE_standalone.html`,
  `app/state.jsx`, `app/breakmenu/BreakMenu.jsx`,
  `app/achievements/Achievements.jsx`, `app/focus/FocusTimer.jsx`,
  `app/hydrate/HydrateModule.jsx`, `app/breathe/BreatheModule.jsx`,
  `CHANGELOG.md`, `STATE.md`.

Detalle completo: [`docs/sessions/session-28-fruta-facil-logros-sonidos.md`](./docs/sessions/session-28-fruta-facil-logros-sonidos.md).

---

## [v0.12.10] — 2026-04-23 — Modales responsive en móvil

Se cierra el último frente bloqueante pre-v1.0 de adaptación móvil:
los **10 modales** del producto más `SessionShell` (pantallas de
sesión Respira/Mueve) y `TweaksPanel` reciben tratamiento responsive
siguiendo el patrón ya establecido en sesiones 22-24 (decisión activa
vigente: bloque `<style>` inyectado en `<head>` con selectores
`[data-pace-*]` y `!important`, no estilos inline modificados).

**Regla no negociable respetada:** 0 cambios de comportamiento
observable en desktop. Los estilos inline siguen siendo la fuente
de verdad; el CSS responsive solo actúa bajo `640px`.

### Añadido
- **`data-pace-modal-*` attrs** en `app/ui/Primitives.jsx` sobre el
  JSX del `<Modal>` base: backdrop, card, close, head, title,
  subtitle. Como los 9 modales del producto (Respira biblioteca y
  seguridad, Mueve, Estira, Hidrátate, BreakMenu, Achievements,
  WeeklyStats, Welcome, Support — 10 contando variantes) delegan
  todos en el mismo `<Modal>`, basta un único punto de inyección.
- **`data-pace-session-*` attrs** en `app/ui/SessionShell.jsx`:
  root, header, title, center, footer, hint, prep, prep-num,
  prep-copy, done, done-hero, done-title, stats, stat, stat-num,
  done-copy. Cubre las pantallas fullscreen de Respira y Mueve.
- **`data-pace-tweaks-panel`** en `app/tweaks/TweaksPanel.jsx`
  sobre el panel raíz.
- **3 bloques `<style>` responsive** inyectados en `<head>` con
  `id` únicos:
  - `pace-modal-responsive-css` — en Primitives.jsx. Transforma
    el modal centrado 85vh en sheet pegado al borde inferior
    (`place-items: end center`), ancho 100%, `max-height:
    calc(100dvh - 24px)` con fallback `100vh` (decisión sesión
    23), padding interior reducido un paso (`var(--s-6)` →
    `var(--s-5)`), título 32→26, botón × 28→36 para target táctil.
  - `pace-session-responsive-css` — en SessionShell.jsx. Padding
    root 28/48/40 → 16/20/24, header título 22→18, prep número
    200→128, done `h1` 56→34, círculo 120→80, stats con `flex-wrap`
    y gap 40→20 para que no desborden con 3 stats a 375 px.
  - `pace-tweaks-responsive-css` — en TweaksPanel.jsx. El panel
    320×auto bottom-right pasa a bottom-sheet full-width con
    `border-radius` solo superior, `max-height: 72dvh`, sombra
    superior invertida. Se conserva la ausencia de backdrop
    (filosofía "afinar mientras la app sigue viva").

### Cambiado
- **`app/state.jsx`:** `PACE_VERSION` bump v0.12.9 → v0.12.10.
- **`PACE.html`:** título `<title>` bump v0.12.9 → v0.12.10.
- **`STATE.md`:** celdas de versión, entrada de "Última sesión"
  reescrita (sustituir, no añadir), frente de "Modales móviles"
  movido de backlog bloqueante a resuelto.

### Regenerado
- **`PACE_standalone.html`** v0.12.10 vía `super_inline_html`.
  ~357 KB (sube ~7 KB sobre v0.12.9 por los 3 bloques CSS y los
  ~40 data-attrs añadidos — el standalone inlinea el PNG del logo
  también, no se ha tocado esa parte).

### Decisiones reafirmadas / nuevas
- **Responsive móvil cerrado como frente.** Home (sesiones 22-24)
  + modales (esta sesión) cubren todas las superficies. Cualquier
  tratamiento responsive futuro sigue el mismo patrón documentado.
- **Breakpoint único 640px.** No se añade breakpoint intermedio;
  alineado con main.jsx y Sidebar.jsx.
- **Sheet en vez de card centrada.** Los 10 modales en móvil se
  anclan al borde inferior (patrón nativo iOS/Android, mejor
  ergonomía del pulgar). Facilita la futura transición a PWA.

### Archivos
- **Modificados:** `app/ui/Primitives.jsx`, `app/ui/SessionShell.jsx`,
  `app/tweaks/TweaksPanel.jsx`, `app/state.jsx`, `PACE.html`,
  `PACE_standalone.html`, `CHANGELOG.md`, `STATE.md`.
- **Nuevos:** `docs/sessions/session-27-modales-mobile.md`,
  `backups/PACE_standalone_v0.12.9_20260423.html`.

### Verificación
- Preview de `PACE.html` carga limpia (solo warning esperado del
  Babel in-browser, ruido del sandbox).
- Regeneración del standalone sin advertencias.
- Auditoría visual formal a 375×812 queda como tarea opcional de
  sesión 28 (razón: el valor del patrón centralizado via Modal
  base es alto; la auditoría individual de 10 capturas PNG tenía
  coste desproporcionado para detectar ajustes de refinamiento).

### Versión
- `v0.12.9` → **`v0.12.10`** (patch — CSS responsive aditivo, cero
  cambios de comportamiento observable en desktop).

Detalle completo: [`docs/sessions/session-27-modales-mobile.md`](./docs/sessions/session-27-modales-mobile.md).

---

## [v0.12.9] — 2026-04-23 — Licencia + 4ª vía de monetización

Se cierra la decisión de licencia del código pendiente desde
[`docs/proposals/license-analysis.md`](./docs/proposals/license-analysis.md)
y, aprovechando la sesión, se amplía el modelo de monetización
a **4 vías** añadiendo el **Pase mensual** como cuarta opción.

**Regla no negociable respetada:** ningún cambio de comportamiento
observable. No se toca lógica de negocio, render, ni state. La app
post-v0.12.9 se ve y se comporta idéntica a v0.12.8.

### Añadido
- **`LICENSE`** en la raíz con el texto oficial de la **Elastic
  License 2.0**. Copyright © 2026 ezradesign. Protege explícitamente
  contra: (a) ofrecer PACE como servicio alojado/administrado, (b)
  eludir la validación Lifetime/Pase, (c) retirar avisos de licencia,
  copyright o marca. Permite leer, clonar, modificar, forkear para
  uso personal/educativo y proponer PRs.
- **Sección "Licencia"** en `README.md` con explicación en claro de
  qué se puede y qué no, separación entre licencia del código (ELv2)
  y licencias comerciales del producto (Lifetime, Pase, Temporadas),
  y línea de contacto para usos alternativos (issue en GitHub).
- **Cabeceras de copyright** en los 4 fuentes principales:
  `app/state.jsx`, `app/main.jsx`, `app/ui/Primitives.jsx`,
  `app/ui/SessionShell.jsx`. Patrón:
  ```
  /* PACE · Foco · Cuerpo
     Copyright © 2026 ezradesign
     Licensed under the Elastic License 2.0 — see LICENSE
     ...
  */
  ```
  El resto de archivos fuente (módulos, shell, ui secundario, etc.)
  hereda la licencia a nivel de repo vía LICENSE. Las cabeceras
  individuales se añadieron solo a los 4 fuentes "firma" del
  proyecto según decisión explícita del usuario.
- **Pase mensual** como 4ª vía de monetización en `MONETIZATION.md`:
  3,99 € puntual con caducidad de 30 días, sin renovación automática,
  sin backend. Se emite como clave firmada con `expiresAt`; la app
  valida offline. Coexiste con Lifetime, Temporadas y donaciones BMC.
  Pensado como onramp alternativo para quien no quiere comprometer
  los 20 € del Lifetime de golpe.

### Cambiado
- **`MONETIZATION.md`** reescrito para reflejar 4 vías en vez de 3.
  La filosofía no cambia: sigue sin haber backend, sin cuentas, sin
  tracking, sin suscripción con renovación automática. Se matiza el
  bullet "❌ Suscripción mensual" para aclarar que lo que se descarta
  es la suscripción clásica con renovación + backend, no el pago
  puntual con caducidad (que es lo que es el Pase).
- **`README.md`** actualizado: versión v0.12.2 → v0.12.9, build
  entregado correcto (`PACE_standalone.html` en vez del nombre viejo
  `PACE_App_1_38.html`), tamaño del standalone actualizado, `LICENSE`
  añadido al diagrama de estructura.
- **`app/state.jsx`:** `PACE_VERSION` bump v0.12.8 → v0.12.9.
- **`PACE.html`:** título `<title>` bump v0.12.8 → v0.12.9.
- **`STATE.md`:** celda de versión actual, build entregado y entrada
  de última sesión. Nueva **decisión activa** registrada al tope de
  "⚠️ Decisiones activas" con la elección de ELv2 + razón.

### Regenerado
- **`PACE_standalone.html`** v0.12.9 vía `super_inline_html` con
  las cabeceras y el bump aplicados.
- **`backups/PACE_standalone_v0.12.8_20260423_1700.html`** — backup
  del v0.12.8 antes de regenerar. Siguen 2 backups locales (v0.12.7
  + v0.12.8), margen cómodo frente a la regla "máximo 5".

### Resultado
- **+1 archivo nuevo en raíz** (`LICENSE`, ~2,4 KB).
- **~90 líneas cambiadas** repartidas entre README, MONETIZATION,
  CHANGELOG, STATE y las 4 cabeceras. Todo documentación o metadata.
- **0 cambios de lógica.** La app es funcionalmente idéntica.

### Verificación
- Preview de `PACE_standalone.html` regenerado: limpio.
- `PACE_VERSION` consistente en state.jsx, PACE.html y título de
  ventana.
- Cabeceras añadidas **antes** del contenido original de cada archivo,
  sin borrar comentarios descriptivos previos.

---

## [v0.12.8] — 2026-04-23 — Refactor Fase 2

Ejecución de los 4 ítems de prioridad A del informe de auditoría
[`docs/audits/audit-v0.12.7.md`](./docs/audits/audit-v0.12.7.md)
validados al cierre de sesión 25. Regla no negociable: ningún
cambio de comportamiento observable. La app post-sesión 26 se ve
y se comporta idéntica a v0.12.7.

### Añadido
- **`app/ui/SessionShell.jsx`** — cáscara compartida de sesiones
  activas. Exporta `SessionShell`, `SessionHeader`, `SessionPrep`,
  `SessionDone`, `SessionStat` y `sessionShellStyles`. Absorbe la
  duplicación top-1 del repo (audit §3.1): `sessionStyles`/
  `moveSessionStyles` + `SessionHeader`/`MoveHeader` + `Stat`/
  `MoveStat` + pantallas prep/done de Breathe y Move. Cargado en
  `PACE.html` tras `Primitives.jsx` y antes de los módulos que lo
  consumen.
- **`displayItalic`** en `app/ui/Primitives.jsx` — helper para el
  par inline más repetido del repo (`fontFamily: 'var(--font-display)',
  fontStyle: 'italic'`). Uso por spread: `{...displayItalic, fontSize: 22}`.
  Exportado a `window` junto con los demás primitivos.

### Cambiado
- **`app/breathe/BreatheModule.jsx`** — ramas `prep`/`done` del
  BreatheSession ahora delegan en `<SessionPrep>`/`<SessionDone>`;
  ramas `hold`/`active` envueltas en `<SessionShell>` conservando
  visuales específicos (BreathVisual, dots, countdown). Eliminado
  el bloque local `sessionStyles` (~45 líneas), `SessionHeader`
  local (~12), `Stat` local (~12). Export saneado: de 6 símbolos a
  3 (`BreatheLibrary`, `BreatheSafety`, `BreatheSession`).
  Aplicado `displayItalic` en 8 sitios. Tamaño del archivo: ~740 →
  ~565 líneas.
- **`app/move/MoveModule.jsx`** — mismo patrón: `prep`/`done` a
  `<SessionPrep>`/`<SessionDone>`, `active` envuelto en
  `<SessionShell>` con Meta de paso, ruler + hint. Eliminado
  `MoveHeader`, `MoveStat`, `moveSessionStyles`. Export saneado: de
  3 símbolos a 2 (`MoveLibrary`, `MoveSession`). `displayItalic` en
  7 sitios incluido `StepGlyph`. Tamaño: ~360 → ~280 líneas.
- **`app/support/SupportModule.jsx`** — eliminado `CupIcon` (17 líneas
  de SVG muerto) y `BigCup` (22 líneas muertas) — audit §2.1 alta
  confianza. Callsites saneados: `SupportIcon` y `SupportHero` ya no
  reciben `variant={state.supportCopyVariant}` (siempre devuelven vaca
  desde v0.12.2). Firma de `supportCopy()` sin argumento. `displayItalic`
  en 4 sitios (Value label, title, cta, alreadyLink).
- **`app/extra/ExtraModule.jsx`** — export saneado: de
  `{ExtraLibrary, EXTRA_ROUTINES}` a `{ExtraLibrary}` (audit §4.1).
  `displayItalic` en el h3 de "Rutinas".
- **`app/ui/CowLogo.jsx`** — export saneado. De 7 símbolos a 1
  (`PaceWordmark`). `CowLogo`, `PaceLockup`, `PaceLogoImage` son
  dependencias internas del wordmark; `CowLogoLineal/Sello/Ilustrado`
  son variantes dormidas vivas por compat `localStorage` legacy pero
  no se exponen al global.
- **`app/achievements/Achievements.jsx`** · **`app/breakmenu/BreakMenu.jsx`** ·
  **`app/focus/FocusTimer.jsx`** · **`app/shell/Sidebar.jsx`** ·
  **`app/stats/WeeklyStats.jsx`** · **`app/tweaks/TweaksPanel.jsx`** ·
  **`app/ui/Toast.jsx`** — `displayItalic` aplicado (un sitio cada uno,
  tres en Achievements, tres en FocusTimer).
- **`app/state.jsx` · PACE_VERSION** — `v0.12.7` → `v0.12.8`.
- **`PACE.html` · title** — `v0.12.7` → `v0.12.8`; nueva entrada
  `<script src="app/ui/SessionShell.jsx">` entre `Primitives.jsx` y
  `CowLogo.jsx`.

### Conservado por decisión explícita
- **`state.supportCopyVariant`** — campo del state marcado como
  `DEPRECADO` en `state.jsx` se mantiene por compat `localStorage` de
  instalaciones existentes. `SupportModule` ya no lo consume.
- **`supportCopy()` y `SupportIcon`** — siguen exportados a `window`
  sin argumentos por si un futuro caller quiere re-bifurcar el copy.
- **Variantes `CowLogoLineal/Sello/Ilustrado`** — conservadas en el
  archivo pero fuera del namespace global. `CowLogo()` las invoca
  internamente para soportar `logoVariant: 'lineal'|'sello'|'ilustrado'`
  en localStorage legacy.
- **Ítems B/C del informe** — `useKeyboardShortcuts` hook, troceo de
  `BreatheModule`, `paceDate()` helper, limpieza de campos dormidos del
  state (`intention`, `reminders`, `font`) y los ~20 sitios multi-línea
  restantes de `displayItalic` quedan para sesión 27+.

### Resultado cuantitativo
- **~115 líneas de código fuente** menos en neto (Breathe+Move pierden
  ~255, SessionShell aporta ~140).
- **Dead code eliminado:** `CupIcon` + `BigCup` + pares de callsites
  con variante ignorada ≈ 62 líneas (audit §2.1 ítem #2).
- **Exports globales reducidos:** de 17 símbolos innecesarios a 0 en
  el namespace `window`.
- **Un único sitio** donde vive el layout de sesión activa
  (`app/ui/SessionShell.jsx`). Prepara el terreno para adaptar modales
  a móvil en sesión 27.

### Standalone
- `backups/PACE_standalone_v0.12.7_20260423.html` — rotado.
- `PACE_standalone.html` — regenerado con `super_inline_html` desde
  `PACE.html` v0.12.8. Tamaño: ~349 KB (prácticamente idéntico al
  anterior porque el peso dominante sigue siendo el PNG del logo
  embebido).

### Verificación
- Preview de `PACE.html` y `PACE_standalone.html` limpia (solo warning
  esperado de Babel in-browser).
- Sin imports rotos tras el saneo de exports (grep confirma que los
  símbolos retirados del global no se consumen fuera de su módulo).

Detalle completo: [`docs/sessions/session-26-refactor-fase2.md`](./docs/sessions/session-26-refactor-fase2.md).

---

## [v0.12.7] — 2026-04-23 — Auditoría interna

Sesión 25 fue auditoría pura **sin refactor**. El único entregable
fue el informe
[`docs/audits/audit-v0.12.7.md`](./docs/audits/audit-v0.12.7.md)
(~290 líneas, 7 apartados: inventario, dead code, duplicación,
inconsistencias, riesgos, oportunidades, priorización). No se tocó
ningún archivo de código fuente; `PACE_standalone.html` quedó
bit-a-bit idéntico al entregado en sesión 24.

### Plan validado al cierre
Los 4 ítems de prioridad A ejecutados en sesión 26 (v0.12.8):
1. Extraer `SessionShell.jsx`.
2. Limpiar Support (`CupIcon`, `BigCup`, callsites `supportCopyVariant`).
3. Sanear exports a `window`.
4. Helper `displayItalic`.

Detalle completo: [`docs/sessions/session-25-auditoria-refactor.md`](./docs/sessions/session-25-auditoria-refactor.md).

---

## [v0.12.7] — 2026-04-23 — Scroll asimétrico

Segunda iteración del encaje móvil. La sesión 23 (v0.12.6) arregló
el encaje del contenido con la barra del navegador visible, pero
tuvo un efecto colateral inesperado: al dejar el documento sin
scroll latente, el navegador móvil perdió la señal que usa para
recoger automáticamente su barra de URL, y el usuario quedaba
bloqueado con ~56-100px menos de los que su dispositivo podía dar.

v0.12.7 resuelve ambos problemas a la vez con **scroll asimétrico
por vista**: la home mantiene `100dvh` puro (los 4 botones siempre
a la vista), la sidebar móvil pasa a `min-height: calc(100dvh +
1px)` con `height: auto` para forzar un píxel de scroll latente
que provoca el auto-hide de la barra.

### Cambiado
- **`app/shell/Sidebar.jsx` · bloque `pace-sidebar-responsive-css`** —
  dentro de `@media (max-width: 768px) [data-pace-sidebar]`, las
  cuatro declaraciones de alto se sustituyen:
  ```css
  /* antes: */
  height: 100vh; height: 100dvh;
  max-height: 100vh; max-height: 100dvh;

  /* después: */
  min-height: calc(100vh + 1px);
  min-height: calc(100dvh + 1px);
  height: auto;
  max-height: none;
  ```
  El `+1px` es invisible pero es suficiente señal para que el
  navegador active su auto-hide al scrollear. `height: auto` deja
  que el drawer se dimensione al contenido sin límites
  artificiales. `max-height: none` quita el techo de v0.12.6.
  `overflow-y: auto` se conserva como red de seguridad.
- **`app/state.jsx` · PACE_VERSION** — `v0.12.6` → `v0.12.7`.
- **`PACE.html` · title** — `v0.12.6` → `v0.12.7`.

### Sin cambios
- **`app/main.jsx` · bloque `pace-main-responsive-css`** — la regla
  `[data-pace-app-root] { height: 100vh; height: 100dvh; … }` se
  queda tal cual. Gobierna la home y todas las vistas de main, que
  deben caber sin scroll. La asimetría es intencional: home sin
  scroll latente (barra del navegador visible, 4 botones siempre),
  sidebar con scroll latente de 1px (barra se oculta al deslizar).

### Notas de diseño
- **Por qué scroll asimétrico y no una única regla para toda la
  app.** Los dos objetivos son incompatibles en el mismo
  contenedor: "todo cabe sin scroll" implica documento = viewport,
  y el navegador necesita documento > viewport para disparar el
  auto-hide. Tratamos cada vista por separado: la home prioriza
  visibilidad de los 4 botones, la sidebar prioriza recuperar los
  ~56-100px de la barra.
- **Por qué `min-height: calc(100dvh + 1px)` y no `101vh` o
  similares.** `100dvh` se recalcula dinámicamente con el viewport
  visible, así que cuando la barra se recoge el drawer sabe cuánto
  espacio nuevo tiene. El `+1px` garantiza scroll latente en el
  instante inicial (con barra visible). Suma de lo mejor de las
  dos unidades.
- **Por qué no `requestFullscreen` ni PWA en esta sesión.**
  Fullscreen API exige gesto explícito, no funciona en iPhone
  (solo iPad), y enseña banner intrusivo. PWA (manifest + iconos
  + prompt) sí resolvería el auto-hide de forma permanente pero
  es sesión propia — queda en backlog para después de modales
  móviles y antes del Lifetime, donde actúa como multiplicador
  de valor ("compras una vez, instalado, sin barra, offline").

### Coste conocido
- **Primer abrir del drawer con barra URL visible:** aparece
  encajado en el espacio visible. Primer gesto de scroll hacia
  abajo recoge la barra y el drawer crece ~56-100px. A partir del
  segundo uso se abre ya expandido. El tirón se ve una vez.
- **Auto-hide requiere gesto real del usuario.** Si abre la
  sidebar y no desliza, la barra se queda. Comportamiento estándar
  de iOS Safari / Chrome Android, imposible de forzar desde
  CSS/JS sin entrar en fullscreen API.

### Conservado
- **Cifras de identidad** — `MM:SS` y `0` en EB Garamond italic.
- **Patrón responsive** — `<style>` + `[data-*]` + `!important`.
- **Desktop 1920×1080** — idéntico.
- **Home móvil** — idéntica a v0.12.6.

### Versión
- `v0.12.6` → `v0.12.7` (cambios de código, regenera standalone).

Detalle completo: [`docs/sessions/session-24-scroll-asimetrico.md`](./docs/sessions/session-24-scroll-asimetrico.md).

---

## [v0.12.6] — 2026-04-23 — DVH fit

Sesión de cirujano: una sola unidad CSS cambia para resolver el
último bug de encaje móvil heredado de v0.12.5. El sidebar
fullscreen y el layout raíz pasan de `100vh` a `100dvh` (dynamic
viewport height). Con ello el contenido encaja en el espacio
**realmente visible** del navegador, aparezca o desaparezca la
barra de URL. Se mantiene fallback a `100vh` para navegadores
antiguos (pre iOS Safari 15.4 / Chrome Android 108 / Firefox 101).

### Cambiado
- **`app/shell/Sidebar.jsx` · bloque `pace-sidebar-responsive-css`** —
  dentro de `@media (max-width:768px) [data-pace-sidebar]` se
  duplican las declaraciones de alto con el patrón estándar
  fallback + override:
  ```css
  height: 100vh;      /* fallback navegadores antiguos */
  height: 100dvh;     /* navegadores modernos */
  max-height: 100vh;
  max-height: 100dvh;
  ```
  El drawer fullscreen ya no se corta si la barra de URL está
  visible.
- **`app/main.jsx` · bloque `pace-main-responsive-css`** — nueva
  regla CSS **fuera de `@media`** (aplica desktop + móvil):
  `[data-pace-app-root] { height: 100vh; height: 100dvh;
  max-height: 100vh; max-height: 100dvh; }`.
  Se aplica fuera del media query porque en desktop
  `100dvh === 100vh` (no hay UI dinámica que descontar), así que
  no hay regresión posible y el código queda más simple.
- **`app/main.jsx` · div raíz de `PaceApp`** — recibe
  `data-pace-app-root` y pierde `height: '100vh'` /
  `maxHeight: '100vh'` del objeto de estilos inline (delegados al
  bloque CSS para poder expresar la cascada fallback → override,
  que un objeto JS con una sola key por propiedad no puede
  expresar). Se conservan inline `display`, `overflow`,
  `background`, `position`.
- **`app/state.jsx` · PACE_VERSION** — `v0.12.5` → `v0.12.6`.
- **`PACE.html` · title** — `v0.12.5` → `v0.12.6`.

### Notas de diseño
- **Patrón CSS fallback de dos líneas**. Navegadores que no
  entienden `100dvh` descartan esa declaración y se quedan con
  `100vh`. Los que sí la entienden la aplican por ser la última
  válida en el orden de cascada. Cero user-agent sniffing.
- **Aplicado también en desktop**. El usuario preguntó si
  conviene cambiarlo sólo en `@media (max-width:768px)` o también
  en el layout raíz desktop. Se aplica también en desktop porque
  `100dvh === 100vh` allí donde no hay barra dinámica — no hay
  matemática distinta, no hay regresión. Además futuros modos
  (PWA, ventana pequeña con barra de herramientas) ya funcionan
  sin nuevo código. Si alguna vez saliera mal, aislarlo a
  `@media (max-width:768px)` es un cambio de tres líneas.
- **Por qué no quedarse con `100vh`**. `vh` siempre se resuelve
  al alto máximo del viewport — el que tiene el navegador con la
  barra de URL oculta. Con la barra desplegada, el layout se
  desborda ~56px porque `vh` no lo compensa. `dvh` se recalcula
  dinámicamente al espacio real. Es la unidad correcta para este
  caso desde 2022 (spec w3c csswg); sólo esperamos a que el
  soporte fuera ≥97% para usarla, y ya lo es.

### Conservado (no retirado)
- **Cifras de identidad** — `MM:SS` del timer y `0` de la racha
  siguen en EB Garamond italic blindado. Decisión activa desde
  sesión 20.
- **Patrón responsive** — `<style>` inyectado con `[data-*]` y
  `!important`. Decisión activa desde sesión 22.
- **Desktop 1920×1080** — idéntico. Verificado en preview:
  `[data-pace-app-root]` resuelve a `height: window.innerHeight`.

### Versión
- `v0.12.5` → `v0.12.6` (cambios de código, regenera standalone).

Detalle completo: [`docs/sessions/session-23-dvh-fit.md`](./docs/sessions/session-23-dvh-fit.md).

---

> *Las versiones anteriores ya no se detallan aquí — ver la tabla
> de arriba para enlaces al diario completo de cada sesión.*

---

## [v0.14.2] — 2026-04-30 — Fix de comillas en DESIGN_SYSTEM.md

Tarea de pulido de documentación tras revisión externa del commit cd75d27.

### Cambiado
- **`DESIGN_SYSTEM.md`** líneas 133-134: añadidas comillas simples de
  cierre antes del `|` en la tabla "Tipografías alternativas (tweaks)":
  - `'Cormorant Garamond', Georgia, serif'` (antes sin comilla final).
  - `'JetBrains Mono', ui-monospace, monospace'` (antes sin comilla final).
- **`CHANGELOG.md`** — entrada v0.14.2 añadida a la tabla y detalle abajo.
- **`STATE.md`** — bump v0.14.1 → v0.14.2, sesión #31.

### Verificado (no cambiado)
- **Punto 2 (breakpoints):** `≤ 640px`, `≤ 768px` y `grid 2×2` correctos
  en disco. No tocados.
- **Punto 3 (encoding):** tildes y símbolos especiales (`≤`, `×`, `→`,
  `—`, comillas) verificados en 5 muestras. Falsos positivos descartados.
- **Punto 4 (línea 19):** bullet único con wrap estándar. No tocado.
- **Cero cambios de código.** Cero cambios visuales.

### Archivos
- **Nuevos:** `docs/sessions/session-31-fix-comillas-design-system.md`.
- **Modificados:** `DESIGN_SYSTEM.md`, `CHANGELOG.md`, `STATE.md`.

---

## [v0.14.1] — 2026-04-30 — DESIGN_SYSTEM.md creado + limpieza de duplicación

<!-- sección v0.12.5 detallada retirada al comprimirse tras el
     bump a v0.12.7 (convención: solo las 2 últimas detalladas).
     Diario completo en docs/sessions/session-22-responsive-movil.md.
     Texto eliminado desde aquí hasta el siguiente separador. -->

## ~~[v0.12.5]~~ — detalle retirado (ver tabla · diario: [session-22](./docs/sessions/session-22-responsive-movil.md))

Resumen en una frase: responsive móvil bloqueante pre-v1.0 —
sidebar desacoplada fullscreen + home que cabe en 375×812 sin
scroll. La sesión 23 (v0.12.6) lo afinó con `100dvh`; la sesión
24 (v0.12.7) recuperó el auto-hide de la barra del navegador.

<!-- CUERPO-V0125-RETIRADO-INICIO -->
<!--
### Cambiado
- **`app/shell/Sidebar.jsx` · sidebar fullscreen en móvil** — se
  inyecta un bloque `<style id="pace-sidebar-responsive-css">` con
  reglas `@media (max-width: 768px)` que sobrescriben el layout
  del sidebar a `position:fixed; inset:0; width:100vw;
  height:100vh; z-index:60`. Resultado: en móvil el sidebar deja
  de empujar el main (era un panel de 280px) y pasa a cubrirlo
  entero como un drawer. El chevron de cerrar crece a 44×44px
  (hit target accesible) y el `logoBar` reduce `min-height` a
  84px para dejar sitio a las secciones de abajo.
- **`app/main.jsx` · TopBar, MainContent y ActivityBar responsive**
   — bloque `<style id="pace-main-responsive-css">` con tres
  bloques de reglas:
  - **TopBar**: padding lateral 14→12px, tabs Foco/Pausa/Larga
    comprimidos (padding 6→5px, fontSize 11→10px, letter-spacing
    0.18→0.14em), los 3 iconos a 40×40px.
  - **Main content**: padding lateral 40→12px. Gana ~56px de
    ancho útil para el aro.
  - **ActivityBar**: de `flex` con `min-width:180px` por chip
    (que forzaba scroll horizontal en móvil) a `grid 2x2`. En
    `max-height:720px` (SE, 12 mini) se oculta el sub-label
    ("ritmo, calma", "afloja tensión") para comprimir más.
  - Handle `≡` flotante de reabrir sidebar a 44×44px en móvil.
- **`app/focus/FocusTimer.jsx` · aro que no se desborda** — el
  `aroFrame` cambia de `min(56vh, 520px)` a
  `min(56vh, 86vw, 520px)`. El `86vw` entra en juego solo en
  viewports estrechos (móvil), donde antes el aro calculaba
  56vh=~455px en un iPhone 12 y se salía por la derecha de un
  ancho de 390px. En desktop (1920×1080), `min` sigue resolviendo
  a 520 como antes — comportamiento idéntico. El `focusStyles.root`
  padding lateral cambia de `40px` fijo a `clamp(0, 4vw, 40px)`
  como refuerzo.
- **`app/state.jsx` · PACE_VERSION** — `v0.12.1` → `v0.12.5`. La
  versión mostrada en el footer del sidebar pasa a `v0.12.5`.
- **`PACE.html` · title** — `v0.12.3` → `v0.12.5`.

### Notas de diseño
- **Media queries vía `<style>` inyectado, no modificación de
  inline styles.** Los objetos `sidebarStyles`, `focusStyles`,
  etc. viven como JS objects y Babel standalone no los pasa por
  ningún pipeline CSS. La alternativa — añadir lógica de
  `window.matchMedia` en cada componente — complicaría el código
  sin ganar nada. El patrón elegido (inyectar `<style>` con
  selectores `[data-*]` y `!important` sobre los inline styles)
  es trivial de leer, no duplica estilos, y deja el desktop
  exactamente igual. Ya se usaba para los spinners del input
  type=number en FocusTimer. Decisión activa nueva en STATE.md.
- **Breakpoint único a 768px.** Cubre todos los móviles relevantes
  (iPhone SE 375, 12 390, 14 Pro Max 430, tablets portrait hasta
  768). Añadir más breakpoints habría complicado sin justificación.
  Un segundo bloque `@media (max-width:768px) and (max-height:720px)`
  afina los viewports verticales ajustados (SE, 12 mini) ocultando
  los sub-labels de los chips.
- **No se toca el layout flex del root.** El `<main>` sigue
  ocupando 100% menos el sidebar en desktop. En móvil, como el
  sidebar es `position:fixed`, deja de contar para el layout flex
  y el main toma 100vw por sí solo, sin cambios en JS.

### Conservado (no retirado)
- **Cifras de identidad en EB Garamond italic** (decisión activa
  desde sesión 20). El `MM:SS` del timer y el `0` de la racha del
  sidebar siguen en fuente fija `'EB Garamond', Georgia, serif`.
- **Estructura del estado y del panel Tweaks** — cero cambios.

### Versión
- `v0.12.4` → `v0.12.5` (cambios de código, regenera standalone).

Detalle completo: [`docs/sessions/session-22-responsive-movil.md`](./docs/sessions/session-22-responsive-movil.md).
-->
<!-- CUERPO-V0125-RETIRADO-FIN -->

---

## [v0.12.3] — 2026-04-22 — Timer: aire + Otro + tipografía blindada + tweak retirado

Sesión de pulido que empezó con dos peticiones concretas del usuario
y derivó en cuatro decisiones que refuerzan la filosofía de sesión 19
("menos variantes, más identidad"). Las cifras de identidad se
blindan a EB Garamond, y el tweak de tipografía display se retira:
si PACE ya tiene una identidad tipográfica decidida (Cormorant
default + EB Garamond en cifras), dejar al usuario elegir entre 3
alternativas no aporta.

### Cambiado
- **`app/focus/FocusTimer.jsx` · separación número ↔ subtítulo** — en
  el estilo Aro (default) el `marginTop` del subtítulo pasa de 10 →
  30 (+20px de aire). Los estilos Number y Circle reciben la misma
  separación proporcional. Resultado: el número gigante respira, el
  divisor inferior queda limpio, y la composición del aro gana
  jerarquía tipográfica. No afecta a Bar ni Analog (otras
  composiciones).
- **`app/focus/FocusTimer.jsx` · `MinutesPicker` con opción "Otro"** —
  después del preset 45 se añade una etiqueta "Otro" con el mismo
  tratamiento tipográfico que "MIN" (uppercase, 10px,
  letter-spacing 0.18em, color `--ink-3`, peso 500), separada con
  un margen izquierdo de 6px que deja claro que pertenece a otra
  categoría visual que los numerales. Al clickar se expande a un
  `<input type="number">` inline. Rango válido: 1–180 min. Enter o
  blur confirma, Escape cancela. Si el valor actual no es preset,
  la etiqueta cambia a una pill numeral activa con el valor, que
  se integra con `15/25/35/45`. Los spinners nativos del
  `<input type="number">` quedan ocultos vía CSS para respetar la
  densidad calmada de la línea de presets.

### Notas de diseño
- **Rango 1–180.** Cubre desde pomodoros ultra-cortos (micro-sesiones
  de 1–5 min) hasta deep work real (hasta 3h). Por encima entra en
  territorio donde ya no es un pomodoro — es algo que necesita su
  propia UX.
- **"Otro" como etiqueta hermana de "MIN", no como pill.** El
  primer boceto usaba una pill italic, pero rompía la jerarquía:
  "Otro" no es un valor del mismo rango que los numerales, es una
  acción para abrir otro registro. Darle el mismo tratamiento que
  "MIN" (uppercase pequeño, spacing ancho, color tenue) hace que
  se lea correctamente como meta-opción. Cuando se activa con un
  valor custom, entonces sí pasa a pill numeral para convivir con
  los presets.
- **Icono ausente.** Se probó mentalmente un `+` o lápiz pero rompía
  la densidad de la línea. La palabra "Otro" basta — PACE es
  calmado, no minimalista por minimalismo.

### Cambiado (tipografía de cifras de identidad)
- **`app/shell/Sidebar.jsx` · `streakNum` blindado a EB Garamond** —
  el estilo del número grande del contador de racha pasa de
  `fontFamily: 'var(--font-display)'` a
  `fontFamily: "'EB Garamond', Georgia, serif"`. No pasa por la
  variable, así que aunque se cambie la tipografía display por
  otros medios (import JSON, devtools) el "0" sigue siempre en EB
  Garamond italic. El label "días seguidos" y el sub "Mejor: N
  días" siguen usando `--font-display` (texto descriptivo, no
  cifra de identidad).

### Retirado del panel de Tweaks
- **"Tipografía display"** (`font`): el eje se elimina del panel.
  Los 4 ejes que quedan son **paleta, layout, timer, breath**. La
  identidad tipográfica de PACE ya está decidida: Cormorant
  Garamond como display por defecto + EB Garamond blindado en
  cifras de identidad. No tiene sentido que el usuario elija entre
  3 alternativas — decide PACE.

### Conservado (no retirado)
- El campo `state.font` sigue existiendo en `app/state.jsx` y en el
  `localStorage` de usuarios existentes. Solo se elimina del panel
  de Tweaks. Instalaciones previas que tuvieran `font` distinto de
  `'cormorant'` no pierden datos pero tampoco verán el cambio
  aplicado — el default se impone.
- `TweakSecretsWatcher` sigue escuchando `state.font === 'mono'`
  para disparar `secret.mono` por si el valor llega vía import
  JSON o devtools. Logro dormido pero vivo, mismo patrón que
  `secret.seal` y `secret.illustrated` en sesión 19.

### Notas de diseño — tipografía
- **Las cifras son firma; el texto es lenguaje.** Un número gigante
  (el 25:00 del timer, el 0 del contador de racha) es un símbolo
  visual de identidad — si el usuario cambia la tipografía
  display, no debe cambiar, igual que un logo no cambia con la
  paleta. El texto descriptivo ("Concentración profunda", "días
  seguidos") sí sigue la tipografía display porque es lenguaje.
- **La decisión de display ya no es del usuario.** Se intentó en
  su día ofrecer Cormorant / EB Garamond / Mono como opción. Pero
  una tipografía display es parte del ADN visual de un producto
  calmado — no una preferencia de usuario. Cormorant Garamond es
  suficientemente cálida, editorial y legible para ser *la*
  tipografía de PACE. Decidir bien una vez.

---

## [v0.12.2] — 2026-04-22 — Pill consolidada y standalone autocontenido

Sesión breve de simplificación. El botón de apoyo en el sidebar tenía
cuatro variantes de copy configurables (`cafe`, `pasto`, `vaca`, `come`)
que mezclaban metáforas y diluían la identidad. Se consolidan en una
sola línea alineada con la filosofía del producto (la vaca que *pace* =
PACE), con el icono a la derecha para invertir la jerarquía clásica y
dar más peso al gesto. Además, el tweak "Logo de la vaca" se retira:
decidir entre 5 variantes del logo no aportaba al usuario final y
añadía ruido al panel.

Como efecto colateral, `PACE_standalone.html` por fin es **de verdad
autocontenido**: el logo oficial viaja como data URI dentro del bundle,
sin dependencia de rutas externas.

### Cambiado
- **`app/support/SupportModule.jsx`** — las 4 variantes de copy
  (`cafe`/`pasto`/`vaca`/`come`) se reducen a una única
  `SUPPORT_COPY_DEFAULT`:
  - Label: *"Da de pastar a la vaca"*.
  - Icono: siempre la silueta de vaca (antes alternaba con taza).
  - Orden en el pill y en el CTA del modal: **texto → icono** (icono
    a la derecha), invirtiendo el patrón habitual.
  - `supportCopy(variant)` mantiene la firma pero ignora el argumento
    — compatibilidad con código existente que lo siga llamando.
- **`app/tweaks/TweaksPanel.jsx`** — retirados dos ejes del panel:
  - *"Logo de la vaca"* (`logoVariant`): el logo queda fijo en la
    variante oficial `'pace'`.
  - *"Copy del botón de apoyo"* (`supportCopyVariant`): ya no tiene
    sentido al consolidar el copy.
- **`app/ui/CowLogo.jsx`** — el `PACE_LOGO_URL` ya no es una constante
  hardcoded. Se lee del atributo `src` de un `<img id="pace-logo-src">`
  pre-cargado en `PACE.html`. Esto permite que `super_inline_html`
  inlinee el PNG como data URI al generar el bundle, sin romper la
  carga modular.

### Conservado (no retirado)
- Los campos `logoVariant` y `supportCopyVariant` siguen existiendo en
  `app/state.jsx` y en el `localStorage` de los usuarios. Solo se
  eliminan del panel de Tweaks. Instalaciones existentes no pierden
  datos.
- Los logros secretos `secret.seal` y `secret.illustrated` (ligados a
  `logoVariant`) quedan dormidos pero definidos, por si se reintroducen
  como easter egg futuro.

### Nuevo
- **`PACE_standalone.html` autocontenido de verdad** — el logo PNG se
  inlinea como data URI en el bundle (tamaño: ~326 KB, antes ~225 KB).
  El archivo ahora funciona al 100% sin servidor ni dependencias
  locales. Se ha versionado este build como `PACE_App_1_38.html` a
  efectos de entrega.

### Notas de diseño
- "Da de pastar a la vaca" se eligió sobre "Da de comer" porque
  *pastar* vincula directamente con el brand (PACE = pacer) y con la
  metáfora que recorre toda la UI (la vaca del logo pasta en el campo).
- El icono a la derecha es una decisión intencional: rompe la
  convención del botón web (icono-izquierda) y da al texto el peso de
  la acción. El icono actúa como firma visual, no como señalética.

---

## [v0.12.1] — 2026-04-22 — Pulido: bugs y layout

Sesión corta de consolidación: tras la sesión 17 (feature-heavy) tocó
 revisar código con lupa y arreglar lo que estaba levemente roto pero
 pasaba desapercibido. También dos cambios de UX: quitar la sección
 "Intención" del sidebar (redundante con el Welcome) y rediseñar el
 Welcome para que no necesite scroll en pantallas 720p.

### Arreglado
- **`addFocusMinutes`