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
| **v0.16.0** | 2026-05-05 | Split BreatheModule (3 archivos: BreatheVisual + BreatheLibrary + BreatheSession) + 4 detectores nuevos (master.collector.half/full, master.silent.day, master.retreat) | #34 | [abajo ↓](#v0160--2026-05-05--split-breathemodule--logros-aplazados) |
| **v0.15.0** | 2026-05-04 | Loop post-Pomodoro: BreakMenu con rotación inteligente (computeScore + sort + "Para ti" + done indicator) | #33 | [abajo ↓](#v0150--2026-05-04--loop-post-pomodoro) |
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

## [v0.16.0] — 2026-05-05 — Split BreatheModule + logros aplazados

### Refactor
- **`app/breathe/BreatheModule.jsx` troceado en 3 archivos** (techo 500 líneas de CLAUDE.md):
  - **`BreatheVisual.jsx`** (~155 líneas) — `getSequence()` + `breathVisualStyles` + `BreathVisual` (5 variantes: pulso, ondas, petalo, organico, flor). Sin hooks. Renombrado `visualStyles` → `breathVisualStyles` para evitar colisión global.
  - **`BreatheLibrary.jsx`** (~130 líneas) — `BREATHE_ROUTINES` + `BreatheLibrary` + `RoutineCard` + `BreatheSafety`.
  - **`BreatheSession.jsx`** (~210 líneas) — `BreatheSession` con toda la lógica de ticker, hold, retención, atajos de teclado. Aliases de hooks renombrados a `useStateBRSess / useEffectBRSess / useRefBRSess` para no colisionar con los de BreatheLibrary.
  - `BreatheModule.jsx` eliminado. Exports a `window` conservados idénticos: `BreatheLibrary`, `BreatheSafety`, `BreatheSession`.
  - `PACE.html` actualizado: 1 `<script>` → 3 `<script>` en orden de dependencia (Visual → Library → Session).

### Añadido — detectores de logros (sesión 34)
- **`master.collector.half`** — 50 logros desbloqueados. Detector `checkCollectorAchievements()` llamado al final de cada `unlockAchievement` exitoso. Lectura de `Object.keys(_state.achievements).length` post-setState. Idempotente por diseño: no hay riesgo de recursión infinita.
- **`master.collector.full`** — 100 logros. Mismo detector y misma llamada.
- **`master.silent.day`** — 1 día usando la app con `soundOn=false`. Nuevo campo `silentDates: []` en `defaultState` (toDateStrings, cap 30). Detector `checkSilentDayAchievement()` llamado desde `completeBreathSession`, `completeMoveSession`, `completePomodoro`, `completeExtraSession` y `addWaterGlass` (delta>0).
- **`master.retreat`** — 2h de breathe+move en un día. Detector `checkRetreatAchievement()` usa los buckets `weeklyStats.breathMinutes[day] + moveMinutes[day] >= 120` ya existentes. Extra suma al bucket moveMinutes (decisión activa), así que `completeExtraSession` también lo evalúa.
- **`IMPLEMENTED_ACHIEVEMENTS`** en `Achievements.jsx`: 45 → 49 ids. Contador Maestría 5/25 → 9/25.

### Cambiado
- **`app/state.jsx`:** `PACE_VERSION` `'v0.15.0'` → `'v0.16.0'`. Campo `silentDates: []` en `defaultState`.
- **`PACE.html`:** título actualizado a `v0.16.0`.
- **`PACE_standalone.html`:** regenerado con `node build-standalone.js` (~365 KB).

### Backups
- Rotado `backups/PACE_standalone_v0.12.8_20260423_1700.html` (el más antiguo, estábamos al límite).
- Añadido `backups/PACE_standalone_v0.15.0_20260505.html` (recuperado de git antes de regenerar).
- 5 backups activos: v0.12.9, v0.12.10, v0.13.0, v0.14.0, v0.15.0.

### Archivos
- **Nuevos:** `app/breathe/BreatheVisual.jsx`, `app/breathe/BreatheLibrary.jsx`, `app/breathe/BreatheSession.jsx`, `backups/PACE_standalone_v0.15.0_20260505.html`, `docs/sessions/session-34-split-breathe-logros.md`.
- **Eliminados:** `app/breathe/BreatheModule.jsx`.
- **Modificados:** `PACE.html`, `app/state.jsx`, `app/achievements/Achievements.jsx`, `PACE_standalone.html`, `CHANGELOG.md`, `STATE.md`.

Detalle completo: [`docs/sessions/session-34-split-breathe-logros.md`](./docs/sessions/session-34-split-breathe-logros.md).

---

## [v0.15.0] — 2026-05-04 — Loop post-Pomodoro

### Añadido
- **`app/breakmenu/BreakMenu.jsx` — rotación inteligente post-Pomodoro:**
  - Función `computeScore(key, state)` a nivel de módulo. Puntúa cada opción
    según lo hecho hoy: Respira → 0 si `plan.respira`, 2 si no; Mueve → 0/2
    igual; Agua → 3 si 0 vasos, 1 si debajo del objetivo, 0 si meta cubierta.
  - Las 3 cartas se reordenan por score desc en cada apertura del BreakMenu.
    El sort es estable: empates conservan el orden original (Respira > Mueve > Agua).
  - Carta con mayor puntuación (top score > 0): muestra tag `<Tag color="var(--focus)">Para ti</Tag>`
    en la parte superior de la tarjeta.
  - Cartas con score 0 (ya hechas hoy): borde pasa a `var(--line)` (muted) +
    punto semitransparente color-módulo en esquina superior derecha +
    descripción "Ya hecho hoy · otra ronda si quieres".
  - Los atajos de teclado (B/M/H) siguen mapeados por actividad, no por
    posición visual — el reordenamiento no los rompe.
- **`build-standalone.js`** — script Node.js nuevo que reemplaza la herramienta
  `super_inline_html` del entorno anterior. Inlinea `tokens.css`, todos los
  `.jsx` y el logo como data URI base64. Uso: `node build-standalone.js`.

### Cambiado
- **`app/state.jsx`:** `PACE_VERSION` bumpeado a `'v0.15.0'`.
- **`PACE.html`:** título actualizado a `v0.15.0`.
- **`PACE_standalone.html`:** regenerado con el nuevo script (~364 KB, incluye
  el BreakMenu con rotación).

### Archivos
- **Modificados:** `app/breakmenu/BreakMenu.jsx`, `app/state.jsx`, `PACE.html`,
  `PACE_standalone.html`, `CHANGELOG.md`, `STATE.md`.
- **Nuevos:** `build-standalone.js`, `backups/PACE_standalone_v0.14.0_20260504.html`,
  `docs/sessions/session-33-loop-post-pomodoro.md`.

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
- **`addFocusMinutes` (state.jsx)** — la evaluación de umbrales de
  logros `focus.hours.10/50/100` dependía de una variable de cierre
  (`nextTotal`) capturada fuera del updater. Ahora se lee `_state`
  tras el `setState` asíncrono: los logros se disparan sobre el valor
  recién persistido, no sobre un snapshot intermedio.
- **`completePomodoro` (state.jsx)** — mismo patrón: el updater ya no
  captura variables para decisiones posteriores; se lee `_state.cycle`
  después del commit para los umbrales de logro.
- **Toast buffer race (state.jsx)** — `onToast` vaciaba el buffer de
  toasts pendientes sólo si el listener entrante era el primero
  (`size === 1`). Bajo StrictMode de React (mount/unmount doble en
  dev), el segundo listener no recibía los toasts acumulados.
  Reemplazado por `wasEmpty` que captura el estado ANTES de añadir.
- **`applyTheme` se llamaba en cada `setState` (state.jsx)** — 2
  `setAttribute()` DOM por cada tick, aunque palette/font no hubieran
  cambiado. Ahora sólo se ejecuta si `prev.palette !== _state.palette`
  o `prev.font !== _state.font`. Micro-optimización de sólo render.

### Cambiado
- **Sidebar: eliminada la sección `Intención`** (tenía un textarea que
  muchos usuarios dejaban vacío). El campo `state.intention` sigue
  existiendo — se captura opcionalmente en el WelcomeModal (decidido
  en sesión 17). La retirada deja más respiro visual y sube la
  prominencia del footer.
- **Sidebar: el pill "Invita a un café" gana prominencia por
  sustracción** — al quitar la sección Intención el footer tiene
  más aire alrededor del pill, así que gana presencia sin necesitar
  rehacer el componente. Se mantiene el diseño elegante original
  de sesión 16 (pill delgado paper con borde fino, icono taza,
  copy italic pequeño). Se probó durante esta sesión una
  `SupportCard` más destacada (3 líneas + CTA pill terracota)
  pero el usuario confirmó que el pill original era más elegante:
  la elegancia viene del contraste con el espacio vacío, no de
  inflar el componente. Revertido al pill original.
- **WelcomeModal rehecho para caber sin scroll en 720p** — antes era
  un apilado vertical (logo + Meta + título + lede + valores +
  intención + botón + skip) que en pantallas cortas pedía scroll.
  Ahora es una grid de 2 columnas en el header (logo+meta a la izq,
  título+lede a la der), fila de valores compacta (10px padding vs
  14px), input de intención ligeramente más corto, y botón +
  "prefiero saltarlo" en línea horizontal. Total: ~440px de alto
  (antes ~620px).
- **`PACE_VERSION`** en `state.jsx`: `v0.12.0` → `v0.12.1`.
- **`<title>` de `PACE.html`**: `v0.12.0` → `v0.12.1`.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.12.1** (~224 KB, sin cambio
  significativo de tamaño).
- `PACE.html` y `PACE_standalone.html` cargan con logs limpios (solo
  warnings habituales de Babel standalone).
- Screenshot del Welcome en fresh state confirma que entra sin
  scroll en viewport 1920×1080.
- Screenshot del sidebar con state populado confirma que el pill
  Invita a un café destaca visualmente con el espacio extra del
  footer, y que la sección Intención ya no aparece.

Detalle: [`docs/sessions/session-18-pulido-bugs-layout.md`](./docs/sessions/session-18-pulido-bugs-layout.md) *(por escribir)*.

---

## [v0.12.0] — 2026-04-22 — Welcome, Export/Import, tweak-secrets

Combo de sesión corta (~5h) recomendado por el `STATE.md` cerrado en
sesión 16. Tres frentes que se refuerzan entre sí: el Welcome es lo
primero que el usuario ve y comunica los mismos valores que el modal
de BMC; el Export/Import hace literal la promesa "todo local, para
siempre"; los tweak-secrets recompensan la exploración de estilo sin
anunciar nada.

### Añadido
- **`app/welcome/WelcomeModule.jsx`** (nuevo, ~240 líneas):
  - `WelcomeModal` — modal single-screen editorial: logo oficial
    (respeta `state.logoVariant`), título serif italic *"Antídoto a
    la silla. A tu ritmo."*, 3 valores (`Todo local · Sin cuentas ·
    Siempre gratis`), campo opcional de intención con auto-focus y
    Enter-to-submit, botón `Empezar` + link discreto `prefiero
    saltarlo`. Cap de 120 chars para la intención.
  - `useFirstTimeWelcome(setOpen)` — abre el modal una sola vez
    cuando `state.firstSeen == null`. Mismo patrón exacto que
    `useSupportAutoTrigger` de sesión 16 (demora 1.2s post-mount).
  - Evento global `pace:open-welcome` para re-abrir manualmente
    (uso dev / futuros Tweaks).
- **Export/Import JSON en Tweaks** (`TweaksPanel.jsx`):
  - Sección "Tus datos" con botones `Exportar` (descarga
    `pace-backup-YYYYMMDD.json` con `{app, version, exportedAt,
    state}`) e `Importar` (valida schema, pregunta `confirm()` con
    contador, reemplaza `localStorage.pace.state.v1`, recarga).
  - Feedback inline `✓ Backup descargado` (verde) / `✗ No se pudo
    exportar` (rojo), fade automático.
  - Caption explicando "Todo vive en tu navegador. El backup es un
    archivo JSON local — sin servidor, sin cuenta."
- **`TweakSecretsWatcher`** (componente auxiliar en mismo archivo,
  retorna `null`, se monta siempre desde `main.jsx`):
  - `secret.aged` cuando `palette === 'envejecido'`.
  - `secret.dark.mode` al acumular 7 días de calendario distintos
    con `palette === 'oscuro'`. Fechas en clave propia
    `pace.darkDays.v1` (cap 30).
  - `secret.mono` cuando `font === 'mono'`.
  - `secret.seal` cuando `logoVariant === 'sello'`.
  - `secret.illustrated` cuando `logoVariant === 'ilustrado'`.
- **`explore.tweaks`** se desbloquea al abrir el panel por primera
  vez (pasa de secreto a exploración visible).
- **Campos nuevos en default state**: `firstSeen: null` (timestamp
  al primer open del Welcome, ya sea "Empezar" o "skip").

### Cambiado
- **`PACE_VERSION`** en `state.jsx`: `v0.11.11` → `v0.12.0`.
- **`<title>` de `PACE.html`**: `v0.11.11` → `v0.12.0`.
- **`IMPLEMENTED_ACHIEVEMENTS`** en `Achievements.jsx` crece
  +6 ids: `explore.tweaks` + los 5 secretos tweak (`secret.aged`,
  `.dark.mode`, `.mono`, `.seal`, `.illustrated`). Total de
  "Próximamente" visible baja de 19 → 13.
- **`main.jsx`** monta `<WelcomeModal/>` y `<TweakSecretsWatcher/>`
  junto al resto de modales; consume `useFirstTimeWelcome`; escucha
  `pace:open-welcome`.
- **`PACE.html`** carga `app/welcome/WelcomeModule.jsx` antes de
  `Sidebar.jsx` porque `main.jsx` lo necesita.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.12.0** (~225 KB, +27 KB
  sobre v0.11.11).
- Rotado `backups/PACE_standalone_v0.11.11_20260422.html`.
- 3 backups activos (v0.11.9, v0.11.10, v0.11.11), bien por debajo
  del límite de 5.
- `PACE.html` y `PACE_standalone.html` cargados en iframe con logs
  limpios (sólo warnings habituales de Babel standalone).
- Screenshot en fresh state confirma que el Welcome aparece; tras
  fijar `firstSeen` manualmente, no vuelve a aparecer.

Detalle: [`docs/sessions/session-17-welcome-export-tweaksecrets.md`](./docs/sessions/session-17-welcome-export-tweaksecrets.md).

---

## [v0.11.11] — 2026-04-22 — Integración Buy Me a Coffee

Primer frente del plan de monetización diseñado en sesión 15: botones +
modal de apoyo a Buy Me a Coffee respetando los 3 principios éticos
(presencia calmada, razón explícita por valores, momento elegido).
El modal se dispara manualmente desde un pill en el sidebar, y una sola
vez automáticamente cuando la racha llega a 7 días.

### Añadido
- **`app/support/SupportModule.jsx`** (nuevo, ~290 líneas) con 3
  exports principales:
  - `SupportButton` — pill paper con borde fino que vive en el footer
    del sidebar. Icono de taza SVG en `currentColor`. Hover suave.
  - `SupportModal` — modal con hero de taza terracota, título serif
    italic **"PACE es gratis. Y lo seguirá siendo."**, 3 valores en
    fila (`Todo local · Sin tracking · Para siempre`), botón terracota
    que abre `buymeacoffee.com/ezradesign` en pestaña nueva, botón
    secundario `Copiar enlace` con feedback `✓ copiado`, y link
    `Ya doné →` que desbloquea `secret.supporter` por honor.
  - `useSupportAutoTrigger(setOpen)` — hook que abre el modal **una
    sola vez** cuando `streak.current >= 7` y `supportSeenAt == null`.
- **Logro `secret.supporter`** ("Sostienes el pasto", glifo `✦`)
  añadido al catálogo y a `IMPLEMENTED_ACHIEVEMENTS` en
  `Achievements.jsx` (5/21 secretos con trigger real).
- **Tweak `supportCopyVariant`** en `TweaksPanel.jsx` con 3 opciones:
  `cafe` ("Invita a un café", default), `pasto` ("Riega el pasto"),
  `vaca` ("Da de comer a la vaca"). El copy del pill del sidebar se
  actualiza en vivo.
- **Evento global `pace:open-support`** escuchado por `main.jsx`,
  mismo patrón que `pace:open-achievements`.
- **Campos nuevos en default state**: `supportSeenAt: null` y
  `supportCopyVariant: 'cafe'`.

### Cambiado
- **`PACE_VERSION`** en `state.jsx`: `v0.11.9` → `v0.11.11`. Corrige
  de paso un desfase que arrastraba desde sesión 15 (state decía
  `v0.11.9` aunque STATE.md y PACE.html decían `v0.11.10`).
- **`<title>` de `PACE.html`**: `v0.11.10` → `v0.11.11`.
- **Subtitle del modal de Logros**: `"100 coherentes"` →
  `"Colección creciente"` (ahora son 101 con el supporter).
- **`StatusBar` del Sidebar**: se inserta `<SupportButton>` entre la
  línea `En camino · ● Pace` y la línea de versión, con
  `marginTop: 10` y `marginBottom: 10` para respirar.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.11** (~198 KB, +16 KB
  por el módulo nuevo).
- Rotado `backups/PACE_standalone_v0.11.10_20260422.html` (ya existía
  el v0.11.9).
- 2 backups activos (v0.11.9, v0.11.10), bien por debajo del límite.
- Verificación funcional (`eval_js_user_view`):
  - `pace:open-support` abre el modal con el título correcto.
  - Tweak cambia copy del pill y del botón primario en vivo.
  - Botón "Ya doné" desbloquea `secret.supporter` y marca
    `supportSeenAt` con timestamp.

Detalle: [`docs/sessions/session-16-bmc-integracion.md`](./docs/sessions/session-16-bmc-integracion.md).

---

Para versiones anteriores, ver los diarios en [`docs/sessions/`](./docs/sessions/).


