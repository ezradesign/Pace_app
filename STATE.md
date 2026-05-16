# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.30.0
**Ultima sesion:** #76 -- 2026-05-16 - feat(camino): arquitectura overlay -- TimerDial compartido + SenderoBar sticky persistente + CompletionScreen rica (v0.30.0)
**Ultima actualizacion de este archivo:** 2026-05-16 - sesion 76
**Build entregado:** `PACE_standalone.html` v0.30.0 (583 KiB / 597 KB decimal) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.30.0** (s76: titulo bump + carga TimerDial.jsx antes de FocusTimer) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.30.0** (583 KiB, regenerado s76) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.30.0** (s76: regenerado por build-standalone.js) |
| `app/glyphs/exercise-glyphs.jsx` | 46 glifos SVG -- 13 rediseñados en s60 | **v0.28.1** (iter parcial s60, sin cambios s61) |
| `LICENSE` | Elastic License 2.0 en la raiz | Sin cambios desde v0.12.9 |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standalone |
| `app/ui/Sound.jsx` | Sonidos sintetizados Web Audio | **v0.21.0** |
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
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.30.0** (s76: TimerAro + interpolateRingColor + 6 estilos eliminados, ahora viven en TimerDial; TimerVisualization llama <TimerDial> directo) |
| `app/ui/TimerDial.jsx` | Anillo circular compartido (FocusTimer + PathFocusStep) | **v0.30.0** (nuevo s76) |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.15.0** |
| `app/achievements/Achievements.jsx` | Catalogo + coleccion | **v0.25.3** |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.5** (s64: overflowY:hidden en data-pyv-wrap -- fix scroll vertical) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.4** (s63: titulo marginBottom 6->4) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.28.8** (s69: isActiveDay helper + computeYearStats unifica criterio "dia activo" = focus|breath|move>0, agua sola NO cuenta) |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.28.8** (s69: WeekBarRow elimina reorder, itera data lunes-primero) |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** (nuevo s58) |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** (nuevo s58) |
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.30.0** (s76: PACE_VERSION bump) |
| `app/state-timer.jsx` | addFocusMinutes, completePomodoro | **v0.28.8** (s69: getDayIndexMondayFirst en addFocusMinutes + checkFocusDayAchievement) |
| `app/state-hydrate.jsx` | addWaterGlass | **v0.28.8** (s69: getDayIndexMondayFirst en addWaterGlass) |
| `app/state-achievements.jsx` | unlockAchievement, detectores, complete*Session | **v0.28.8** (s69: getDayIndexMondayFirst en 4 escritores de weeklyStats + checkRetreatAchievement) |
| `app/state-paths.jsx` | Caminos CRUD + stats | **v0.29.0** (s75: getSuggestedPath refactor -> lastViewed + setLastViewedPath + startPath actualiza lastViewed) |
| `app/state-settings.jsx` | setLang | **v0.27.5** (nuevo s57) |
| `app/state.jsx` | Indice — re-export consolidado | **v0.29.0** (s75: + setLastViewedPath; s69: recompute*/getDayIndexMondayFirst/getMondayOf) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez | **v0.19.0** |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.25.0** |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | **v0.28.9** (s71: PaceLogoImage invert+screen en oscuro) |
| `app/main.jsx` | Orquestador + TopBar + ActivityBar | **v0.27.0** (PathsLibrary montado s53) |
| `app/i18n/strings.js` | Strings ES + EN | **v0.30.0** (s76: + path.runner.complete.recorrido ES/EN) |
| `app/tokens.css` | Tokens CSS + base | **v0.30.0** (s76: + --sendero-sticky-h + bloque .sendero-bar.sticky + reglas body[data-pace-path-active] empujando padding overlay y SessionShell) |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.26.0-alpha** |
| `app/paths/PathRunner.jsx` | Runner de caminos | **v0.30.0** (s76: PathFocusStep consume TimerDial + SenderoBar sticky reubicada ANTES de PathTopBar + useEffect body[data-pace-path-active] + CompletionScreen rica con SenderoBar 100%, lista Recorrido y caja de logros del Camino) |
| `app/paths/SenderoBar.jsx` | Sendero visual del progreso interno | **v0.30.0** (s76: prop sticky + React.memo + <title> SVG tooltips por hito) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.28.2** (s61: responsive movil propio, layout compacto, fix dual-only column) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.27.2** (a11y: aria-labelledby/Escape/focus s55) |
| `manifest.json` | PWA manifest | **v0.28.5** (s65: reescrito -- PNGs, start_url /,  scope /, theme crema) |
| `sw.js` | Service Worker PWA | **v0.30.0** (s76: CACHE_NAME pace-v0.30.0) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.29.0_20260516.html` <- creado s76 (restaurado desde git show HEAD tras regeneracion)
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
- `backups/PACE_standalone_v0.27.5_20260511.html`
- `backups/PACE_standalone_v0.27.3_20260511.html`
- `backups/PACE_standalone_v0.27.2_20260509.html`
- `backups/PACE_standalone_v0.27.1b_20260509.html`
- `backups/PACE_standalone_v0.27.0_20260509.html` (rotado `v0.27.0_20260508.html`)

---

## Ultima sesion (resumen operativo)

**Sesion 76 - v0.30.0 - feat(camino): arquitectura overlay (TimerDial + SenderoBar sticky + CompletionScreen rica)**

### Contexto

Tres cambios estructurales sobre el overlay PathRunner que resuelven
los problemas detectados en la auditoria visual de la s75 (capturas
3, 4 y 5). Scope cerrado: sin tweaks de color, sin Caminos nuevos, sin
tocar el catalogo. Bump a v0.30.0 por la naturaleza arquitectural del
cambio. Detalle completo en
[`docs/sessions/session-76-overlay-arquitectura.md`](./docs/sessions/session-76-overlay-arquitectura.md).

### Que se hizo

1. **`app/ui/TimerDial.jsx` (nuevo, 123 ln)**: anillo SVG + arco de
   progreso + tipografia Garamond italic + modeLabel + subtitle + slot
   opcional `inner`. Consumido por `FocusTimer` (home) y `PathFocusStep`
   (Camino). Pixel-equivalente al `TimerAro` previo (viewBox 100, radio
   47.5, strokeWidth 0.35 base + 0.7 progreso, strokeOpacity 0.7).
   Incluye `interpolateRingColor()` extraida desde FocusTimer. Exporta a
   window: `TimerDial`, `interpolateRingColor`.
2. **`FocusTimer.jsx`**: `TimerAro` + `interpolateRingColor` + 6 estilos
   migrados eliminados. `TimerVisualization` llama directo a
   `<TimerDial>` en estilo aro.
3. **`PathRunner.PathFocusStep`**: sustituye bloque hardcoded
   `fontSize: 96` por `<TimerDial mode="foco" subtitle={null} inner={null}>`.
   Controles del Camino (Iniciar/Pausar + Skip) fuera del dial. Guard
   defensivo `typeof TimerDial === 'function'` con fallback al render
   anterior.
4. **`tokens.css`**: token nuevo `--sendero-sticky-h: 38px`. Bloque CSS
   `.sendero-bar.sticky` (position fixed top:0 z=95 background var
   --paper border-bottom). Reglas globales
   `body[data-pace-path-active]` que empujan padding-top del overlay y
   de SessionShell (este con `!important` por inline-style).
5. **`SenderoBar.jsx`**: nueva prop `sticky` (anyade className).
   Cada hito envuelto en `<g><title>...</title>...</g>` -> tooltip
   nativo (sustituto de los labels ocultos en sticky). Envuelto en
   `React.memo` (PathFocusStep tickea cada segundo, sin memo re-render
   gratuito con blocks/currentIndex estables).
6. **`PathRunner`**: nuevo `useEffect` que toggle
   `body[data-pace-path-active]` mientras `cur != null`. SenderoBar
   movido **antes** de PathTopBar (orden visual: sendero arriba, nombre
   del Camino debajo) con prop `sticky`.
7. **`CompletionScreen` rica**: ahora consume `usePace()`. Renderiza
   SenderoBar al 100% done (sin sticky, recupera variante con labels) +
   lista "Recorrido" con numerales romanos en Garamond italic + skipped
   tenue (opacity 0.45 + line-through) + tiempo `elapsed` (sin cambio)
   + caja `--achievement-soft` con logros desbloqueados durante el
   Camino (filtra `state.achievements` por `unlockedAt >= snapshot.startedAt`,
   resuelve glifo desde `window.ACHIEVEMENT_CATALOG`).
8. **i18n**: 1 clave nueva permitida en la sesion --
   `path.runner.complete.recorrido` (ES "Recorrido" / EN "Journey").
9. **PACE.html**: nueva linea de carga `app/ui/TimerDial.jsx` antes de
   `focus/FocusTimer.jsx`.
10. **Bump version v0.30.0**: `state-core` (PACE_VERSION), `sw.js`
    (CACHE_NAME), `PACE.html` (title).

### Verificacion previa critica (Cambio 3d)

`unlockAchievement` en
[`state-achievements.jsx:111-120`](./app/state-achievements.jsx) ya
guarda `unlockedAt: Date.now()` desde antes de s76. No requiere
migracion de shape -- el filtro `unlockedAt >= snapshot.startedAt` es
directo.

### Diagnostico del bug de SenderoBar tapada

`SessionShell.root` ([SessionShell.jsx:40](./app/ui/SessionShell.jsx))
usa `position: fixed, zIndex: 90`. PathRunner.overlay esta en z=80
-> SessionShell cubre la SenderoBar al renderizar BreatheSession /
MoveSession. PathFocusStep no usa SessionShell -> por eso era el unico
sitio donde se veia. Solucion adoptada: SenderoBar a z=95 + atributo
body que empuja paddings.

### Build

- Bundle: **583 KiB** (597 KB decimal; 575.6 -> 583, +7.5 KiB por
  TimerDial + CompletionScreen rica + sticky CSS + i18n + memo).
  42 archivos validados (41 -> 42 por TimerDial.jsx).
- SHA256:
  `1722414C6C7EBF4D4AD90A73A261DE2630EF7027BA4B7C4217E58EFFE81B402A`
  (identico en `index.html`).
- Backup: `backups/PACE_standalone_v0.29.0_20260516.html` (restaurado
  desde `git show HEAD:PACE_standalone.html` tras detectar que la
  regeneracion sobrescribio el standalone antes del paso de rotacion).
  Rotado el mas antiguo (`v0.27.0_20260508.html`) para mantener el cap
  de 20.

### Pendientes activos (diferidos por scope)

**Cierre s76 sin validacion runtime (BLOQUEA cierre Git limpio):**

Los tres cambios estan aplicados, build pasa y backup rotado, pero la
sesion automatizada no toco la UI corriendo. Antes del commit el usuario
debe verificar en navegador:

- [ ] **Captura A** -- Home Pomodoro (FocusTimer aro completo, modo foco).
      Debe ser pixel-equivalente al s75. Sin la captura, no hay garantia de
      que el refactor TimerAro -> TimerDial no haya producido drift.
- [ ] **Captura B** -- Pomodoro dentro de un Camino (PathFocusStep). Mismo
      aro Garamond que A. Verifica Cambio 1 desde el flujo Camino.
- [ ] **Captura C** -- CompletionScreen al final de un Camino (idealmente
      con un logro nuevo desbloqueado durante el Camino para validar
      Cambio 3d): SenderoBar 100% + lista Recorrido + caja de logro.
- [ ] **Consola limpia** al cargar `index.html` y al ejecutar el checklist
      base CLAUDE.md (Pomodoro->BreakMenu / Respira modal seguridad /
      logro->Toast / Tweaks paleta / persistencia recarga).
- [ ] **SenderoBar sticky en Respira + Mueve dentro de Camino**: confirmar
      que SE VE sobre BreatheSession y MoveSession en CLARO y en OSCURO
      (el bug original era exactamente este -- z-index 95 y body-attr lo
      arreglan en teoria, pero falta el ojo).
- [ ] **Tooltip nativo `<title>` SVG** por hito de SenderoBar: comprobar
      hover en Chrome y Firefox. Si el delay es molesto (suele serlo en
      Firefox, ~700ms), evaluar reemplazar por tooltip custom CSS en s77.
- [ ] **`--sendero-sticky-h` = 38px** es placeholder visual. Medir altura
      real necesaria con la captura B para no comer pantalla en movil
      (ajuste fino programado para s77, pero podria adelantarse si se ve
      mal en 375x812).

**Roadmap UX overlay Camino (s76 cubre el primer bloque):**

- **s77 - PathTransitions.jsx** -> ver seccion **Proxima sesion** abajo
  (prompt operativo cerrado con 14 decisiones tras conversacion s76->s77).

- **s77b - Microcopia y ritmo (post-PathTransitions):**
  1. Toast duracion 5000 -> 3000ms en [`Toast.jsx:20`]. Mover a token
     `--toast-duration` o constante en `state-core` (no magic number).
  2. CTA "Comenzar" home: del actual a **verde musgo apagado** (variante
     viva del oliva `--c3`, NO verde-saturado tipo Stripe -- rompe tono
     artesanal).
  3. Animacion de transicion del halo en SenderoBar al saltar de hito
     **fuera** de transiciones (heredado s75, distinto del orbe viajero
     que vive solo en StepIntro de s77).
  4. **Afinar `--sendero-sticky-h`** (hoy 38px placeholder de s76) -- se
     adelanta a s77 si las capturas E/F muestran que rompe layout movil.
  5. **Lift `SB_ROMAN` / `CS_ROMAN` a `app/ui/numerals.js`** cuando
     aparezca el tercer consumidor de numerales romanos (decision s76:
     duplicacion aceptada hasta entonces).

- **s78 - Catalogo Caminos:**
  1. Crear 2 Caminos faltantes (Te sin Azucar / Plain Tea -- reenganche
     tras pausa; Halito / Breath -- micropausa). Catalogo 5 -> 7.
  2. Revisar selector inferior Caminos (`SuggestedPathCard`,
     `PathsLibrary`).

**Otros pendientes activos (independientes del roadmap):**

- Si el halo unico (0.70) no convence en oscuro, diferenciar via dos
  gradientes por `[data-palette]` (Vela 0.78 claro / Candil 0.62 oscuro).
- **A3** (DST en `checkHydrateWeekPerfect`) - solo 2 dias/año, post-Reddit.
- **A4** (`checkStatsAchievements` con 1 dia de retraso desde `loadState`) - post-Reddit.
- **M1** (eliminar `WeeklyStats.jsx` codigo muerto) - solo arreglada indexacion interna.
- **M2..M6, B1..B5** - documentados en informe s68.
- **TODO Fase 2 (~3 jun 2026):** eliminar `PACE_standalone.html`, dejar solo `index.html`.
- **Glifos ejercicio s60** (13/46), `PathYearView` movil, logro `master.midnight.never`.
- **Split `strings.js`** (~775 ln tras s76, ALTA).
- Claves i18n huerfanas `sidebar.counter.pomodoros/rounds/streak`.
- **Backups en cap absoluto (20/20)** desde s76: la proxima rotacion
  eliminara `v0.27.1b_20260509.html`. Si interesa conservar versiones
  hito (v0.27.0 ya rotado, v0.28.0 glifos, v0.29.0 sendero), considerar
  mover esos a `backups/keep/` antes del proximo cierre.

## Proxima sesion -- s77 (PathTransitions.jsx)

> **Prompt operativo cerrado** tras conversacion s76->s77 (2026-05-17).
> 14 decisiones cristalizadas. Bump v0.30.0 -> v0.31.0.
> **Precondicion bloqueante:** cierre Git de s76 publicado (las 7
> checkboxes de "Cierre s76 sin validacion runtime" marcadas + commit).

### Contexto

s76 cubrio continuidad **dentro** de cada pantalla del Camino (SenderoBar
sticky + TimerDial compartido) y al **cerrar** (CompletionScreen rica).
Quedan 3 saltos abruptos: al abrir Camino -> primer paso, entre cada par
de pasos, ultimo paso -> CompletionScreen. s77 los cierra con un unico
modulo.

### Scope cerrado

- **NUEVO** `app/paths/PathTransitions.jsx` -- exporta `IntroCard`,
  `StepIntro`, `OutroCard` a `window`.
- **MODIFICA** `app/paths/PathRunner.jsx` -- estados `intro`/`transition`/
  `outro` en la maquina + hooks de timing + cross-fade 400ms a
  CompletionScreen.
- **MODIFICA** `app/paths/SenderoBar.jsx` -- prop `size="lg"` (sin labels,
  no-sticky, alta) + prop `orbVisible` para el orbe viajero.
- **MODIFICA** `app/tokens.css` -- tokens nuevos
  (`--path-intro-ms: 2500ms`, `--path-step-ms: 2000ms`,
  `--path-outro-ms: 1500ms`, `--path-card-fade-ms: 200ms`,
  `--path-card-scale-from: 0.96`) + `@keyframes path-orb-travel`.
- **MODIFICA** `app/i18n/strings.js` -- UNICA clave nueva
  `path.runner.transition.continue` ES "toca para continuar" /
  EN "tap to continue".
- **MODIFICA** `PACE.html` -- carga PathTransitions.jsx ANTES de
  PathRunner.jsx + bump title.
- **MODIFICA** `app/state-core.jsx` (PACE_VERSION) + `sw.js` (CACHE_NAME
  -> `pace-v0.31.0`).

### 14 decisiones (no negociables)

**Flujo/estructura:**
1. 3 fronteras: IntroCard al abrir + StepIntro entre cada par + OutroCard
   antes de CompletionScreen.
2. Intra-overlay (NO modal sobre Home). `SuggestedPathCard` y
   `PathsLibrary` NO se tocan.
3. Transiciones VOLATILES: recargar = aterriza en paso destino sin
   transicion. Cero cambios en shape de `paths.current`, cero migracion.

**Timing:**
4. Duraciones: 2.5s intro / 2s step / 1.5s outro (tokens CSS).
5. Entrada/salida de card: fade + scale 0.96->1.0 / 1.0->0.96, 200ms,
   ease-out/in.
6. Cross-fade OutroCard -> CompletionScreen: 400ms.

**Skip:**
7. Card entera tappable. Texto sutil "toca para continuar" Garamond
   italic `--ink-3` 13px abajo.
8. Skip de paso desde dentro: StepIntro normal al siguiente paso
   disponible (skipped queda en snapshot, no acorta sendero).
9. StepIntro BLOQUEANTE: paso siguiente se monta TRAS cerrar la card.
   Comportamiento por paso identico al actual (Respira/Mueve auto, Foco
   espera "Iniciar").

**Visual:**
10. Halo viajando: orbe 6px + glow 12px en `var(--c3)`. Recorre la curva
    del SenderoBar del ultimo done al current. CSS puro (`offset-path`
    sobre la curva SVG o `animateMotion`). **Solo en StepIntro**.
11. Layout vertical: SenderoBar grande arriba (~30% alto) + nombre
    centrado en vertical + "toca para continuar" en la base.
12. SenderoBar de transicion SIN labels (solo circulos). Nombre del
    siguiente unico protagonista textual.
13. Copy minimalista:
    - IntroCard: `path.name` + SenderoBar 0/N.
    - StepIntro: `paths.kind.{kind}.name` + SenderoBar parcial + orbe.
    - OutroCard: `path.name` + SenderoBar N/N (orbe asentado en ultimo).
14. OutroCard === IntroCard en estructura. Solo cambia estado del
    sendero (0/N vs N/N). El cierre simbolico lo aporta CompletionScreen
    rica tras el cross-fade.

**Audio:**
15. SILENCIO TOTAL en transiciones. Cero sonidos nuevos. Los existentes
    intactos (fin Pomodoro, vaso, fase respiracion, logro).

### Auditoria previa obligatoria

1. Leer CLAUDE.md, STATE.md, DESIGN_SYSTEM.md.
2. **Confirmar cierre Git s76 publicado** (commit + 7 checkboxes runtime
   validadas). Si no -> NO empezar, el diff se vuelve ingobernable.
3. Leer maquina de estados de PathRunner.jsx (`cur.stepIndex`,
   `nextStep`, `abandonPath`, `useEffect` data-pace-path-active s76).
4. Leer SenderoBar.jsx (prop `sticky` de s76, `<title>` SVG, `React.memo`).
5. Leer Sound.jsx solo para confirmar que NO se aniade nada (decision 15).

### Cierre de sesion s77 (4 capturas + 3 runtime)

- [ ] **Captura D** -- IntroCard al abrir un Camino: SenderoBar 0/N +
      nombre del Camino + tap continua al paso 1.
- [ ] **Captura E** -- StepIntro entre dos pasos: SenderoBar parcial con
      orbe a medio camino + nombre del siguiente kind grande.
- [ ] **Captura F** -- OutroCard antes del cross-fade: SenderoBar 100%
      + nombre del Camino + tap continua a Completion.
- [ ] **Captura G** -- CompletionScreen rica tras el cross-fade
      (regresion s76: sigue luciendo identica?).
- [ ] Camino con 1 skip intermedio: solo 1 StepIntro al paso destino,
      sin "saltando..." (decision 8).
- [ ] Recargar durante una StepIntro: aterriza directo en paso destino
      sin transicion (decision 3).
- [ ] Consola limpia en claro y oscuro + sticky de s76 sigue funcionando
      en Respira/Mueve dentro del Camino (regresion).

### Antipatrones (NO hacer)

- Audio nuevo de transicion.
- Persistir `inTransition` en `paths.current`.
- Labels visibles en SenderoBar de transicion.
- Tocar flujo desde Home / PathsLibrary.
- Mas de 1 clave i18n nueva.
- Sustituir CompletionScreen rica de s76 por OutroCard.
- Tocar SuggestedPathCard, PathsLibrary, FocusTimer, BreatheSession,
  MoveSession.

---

## Decisiones activas

| Decision | Desde | Detalle |
|---|---|---|
| Sintetizar audio (no WAVs) | s28 | Web Audio API, 432 Hz base |
| Elastic License 2.0 | s26 | No SaaS competidores, si uso personal/comercial propio |
| Anti-truncamiento: Python write | s48-s52 | Nunca Edit tool con caracteres especiales |
| Build con TS parser real | s56 | Aborta con linea:columna exacta en cualquier error sintactico |

| Overlay via CustomEvent | s50+ | PathRunner, PathsLibrary -- evita prop drilling |

---

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/i18n/strings.js` | 774 | ALTA |
| `app/main.jsx` | 600 | MEDIA |
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/state-core.jsx` | 470 | BAJA (dentro de limite) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
