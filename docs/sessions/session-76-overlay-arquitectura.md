# Sesion 76 -- v0.30.0 -- feat(camino): arquitectura overlay (TimerDial + SenderoBar sticky + CompletionScreen rica)

**Fecha:** 2026-05-16
**Version entregada:** v0.30.0
**Bundle:** PACE_standalone.html 583 KiB (597 KB decimal)
**SHA256:** `1722414C6C7EBF4D4AD90A73A261DE2630EF7027BA4B7C4217E58EFFE81B402A`

---

## Resumen ejecutivo

Tres cambios estructurales en el overlay PathRunner que resuelven los tres
problemas detectados en la auditoria visual de la s75 (capturas 3, 4 y 5):

1. **TimerDial compartido**: el anillo circular del Pomodoro se extrae a un
   componente comun consumido por FocusTimer (home) y PathFocusStep
   (Camino). Elimina la divergencia visual entre ambos sitios.
2. **SenderoBar sticky persistente**: la barra de progreso del Camino pasa
   a `position: fixed` con z-index 95, persiste sobre BreatheSession y
   MoveSession (que usaban SessionShell z=90 fixed y la tapaban).
3. **CompletionScreen rica**: cierre simbolico con SenderoBar al 100%,
   lista "Recorrido" con numerales romanos en Garamond italic, tiempo
   elapsed y glifo de logros desbloqueados durante el Camino.

Scope cerrado. Sin tweaks de color, sin Caminos nuevos, sin tocar el
catalogo. Bump a v0.30.0 por la naturaleza arquitectural del cambio.

---

## Auditoria previa (Tarea 0)

**Paso previo obligatorio para Cambio 3d** (logros durante el Camino):
verificar el shape de `state.achievements[id]`.

Resultado: `unlockAchievement` en
[`state-achievements.jsx:111-120`](../../app/state-achievements.jsx) ya
guarda `unlockedAt: Date.now()` (desde antes de s76). **No requiere
migracion de shape** -> el filtro por `unlockedAt >= snapshot.startedAt`
es directo.

**Diagnostico del bug de Cambio 2** (SenderoBar tapada en Respira/Mueve):
`SessionShell.root` en
[`SessionShell.jsx:40`](../../app/ui/SessionShell.jsx) usa
`position: 'fixed', inset: 0, zIndex: 90`. PathRunner.overlay usa
z-index 80. SessionShell hereda zIndex superior y oculta TopBar y
SenderoBar al renderizar a viewport completo. PathFocusStep no usa
SessionShell -> por eso SenderoBar SI se ve en el Pomodoro del Camino.

Solucion adoptada: SenderoBar fija a z-index 95 (sobre SessionShell)
+ atributo `body[data-pace-path-active]` toggleado por PathRunner que
empuja el padding-top de overlay y de SessionShell. !important
necesario porque SessionShell.root usa estilo inline.

---

## Que se hizo

### Cambio 1 -- TimerDial compartido

1. **Nuevo** [`app/ui/TimerDial.jsx`](../../app/ui/TimerDial.jsx) (123 ln):
   componente puramente presentacional con anillo SVG, arco de progreso,
   tipografia Garamond italic, modeLabel, subtitle y slot opcional `inner`.
   - viewBox 100 / radio 47.5 / strokeWidth 0.35 base + 0.7 progreso
     / strokeLinecap round / strokeOpacity 0.7 -> identico al TimerAro
     previo.
   - Estilos `timerDialStyles` (frame, inner, modeLabel, numberHuge,
     subtitleItalic, innerDivider) -- antes vivian en focusStyles.
   - `interpolateRingColor()` extraida desde FocusTimer.jsx a este modulo.
   - Exporta a window: `TimerDial`, `interpolateRingColor`.

2. **`FocusTimer.jsx`**: `TimerAro` eliminada. `TimerVisualization` llama
   `<TimerDial>` directamente en estilo aro. focusStyles purgado de los 6
   estilos migrados; en su lugar, comentario apuntando a TimerDial.
   `interpolateRingColor` eliminada localmente (vive en TimerDial).

3. **`PathRunner.PathFocusStep`** ([`PathRunner.jsx:282`](../../app/paths/PathRunner.jsx)):
   sustituye el bloque hardcoded
   `fontSize: 96 / font-family: 'EB Garamond, Georgia'` por
   `<TimerDial>` con `mode="foco"`, `modeLabel=t('topbar.mode.focus')`,
   `subtitle={null}`, `inner={null}`. Controles del Camino (Iniciar/Pausar
   + Skip) viven fuera del dial, preservando el patron de salida del
   PathRunner.
   - Guard `typeof TimerDial === 'function'` con fallback al render
     anterior (defensivo ante orden de carga).
   - Progreso calculado: `1 - (remaining / totalSec)`.

4. **`PACE.html`**: nueva linea de carga
   `app/ui/TimerDial.jsx` antes de `focus/FocusTimer.jsx` (y por tanto
   antes de `paths/PathRunner.jsx`).

### Cambio 2 -- SenderoBar sticky persistente

1. **Token nuevo** en [`tokens.css`](../../app/tokens.css):
   `--sendero-sticky-h: 38px` en `:root`. Documentado: ajuste de
   altura final queda para s77.

2. **Variante CSS `.sendero-bar.sticky`** (bloque nuevo en `tokens.css`):
   `position: fixed; top: 0; left/right: 0; height: var(--sendero-sticky-h); z-index: 95; background: var(--paper); border-bottom: 1px solid var(--line)`.
   El SVG ajusta `height: calc(var(--sendero-sticky-h) - 6px)`. Los
   `.hito-labels` se ocultan en sticky (no caben en 38px).

3. **Reglas globales** en `tokens.css` para empujar padding cuando hay
   Camino activo:
   ```css
   body[data-pace-path-active] .path-runner-overlay {
     padding-top: var(--sendero-sticky-h);
   }
   body[data-pace-path-active] [data-pace-session-root] {
     padding-top: calc(28px + var(--sendero-sticky-h)) !important;
   }
   ```
   `!important` necesario para sobrescribir el `padding: '28px 48px 40px'`
   inline de SessionShell.root.

4. **`SenderoBar`** ([`SenderoBar.jsx`](../../app/paths/SenderoBar.jsx)):
   - Nueva prop opcional `sticky`. Anade `' sticky'` al className.
   - Cada hito ahora envuelve su circulo en un `<g>` con `<title>` SVG
     para tooltip nativo al hover (sustituto de los labels que se ocultan
     en modo sticky).
   - **Envuelto en `React.memo`** (componente exportado). PathFocusStep
     tickea cada segundo via `setRemaining`; sin memo, SenderoBar
     re-render por tick con `blocks`/`currentIndex` estables.

5. **`PathRunner`** ([`PathRunner.jsx:392-401`](../../app/paths/PathRunner.jsx)):
   - Nuevo `useEffect`: si `cur` existe, setea
     `document.body.setAttribute('data-pace-path-active', '1')`; cleanup
     lo retira. Dependencia: `cur?.id`.
   - SenderoBar movido **antes** de PathTopBar en el render (orden visual
     consistente: sendero en lo mas alto, nombre del Camino debajo). Pasa
     `sticky` activado.

### Cambio 3 -- CompletionScreen rica

1. **i18n nueva clave** (unica permitida en la sesion):
   `path.runner.complete.recorrido` -> ES "Recorrido" / EN "Journey".
   Anadida en [`strings.js:359`](../../app/i18n/strings.js) y
   [`strings.js:742`](../../app/i18n/strings.js).

2. **`CompletionScreen`** reescrita en
   [`PathRunner.jsx:105-265`](../../app/paths/PathRunner.jsx):
   - Acceso al state via `usePace()` (antes era stateless).
   - Reconstruccion de `senderoBlocks` a partir de `path.steps`.
   - **SenderoBar al 100% done**: render con `currentIndex={totalSteps}`,
     SIN prop `sticky` (recupera la variante con labels y altura completa).
   - **Lista "Recorrido"**: `<ul>` discreto con cada paso como `<li>`:
     - Numeral romano (I, II, III, IV, V, VI, VII) en Garamond italic
       13px, `text-align: right`, color `--ink-3`.
     - Nombre del kind (`t('paths.kind.' + s.kind + '.name')`) en Garamond
       italic 16px, color `--ink-2`.
     - **Skipped** detectado via `new Set(snapshot.skippedSteps)`:
       opacity 0.45 + `line-through` + color `--ink-3`.
   - **Tiempo elapsed**: conservado (calculo identico al previo).
   - **Logros del Camino**: filtra
     `Object.keys(state.achievements)` por
     `v.unlockedAt >= snapshot.startedAt`. Cada uno se busca en
     `window.ACHIEVEMENT_CATALOG` para resolver title + glyph/glyphSvg.
     Render: caja `--achievement-soft` con borde `--achievement`,
     glifo en circulo 26px + titulo Garamond italic.
   - Numerales romanos `CS_ROMAN` duplicados localmente (SenderoBar tiene
     su propio SB_ROMAN). No se expone helper global aun; cuando haya
     tercer consumidor toca lifting.

### Bumps de version

- [`state-core.jsx:13`](../../app/state-core.jsx): `PACE_VERSION` v0.29.0
  -> v0.30.0.
- [`sw.js:1`](../../sw.js): `CACHE_NAME` `pace-v0.29.0` -> `pace-v0.30.0`.
- [`PACE.html:6`](../../PACE.html): `<title>` v0.29.0 -> v0.30.0.

---

## Build

- Bundle: **583 KiB** (597 KB decimal). 42 archivos validados (antes 41 -- +1
  TimerDial.jsx). Delta +7.5 KiB vs s75 (TimerDial 123 ln + CompletionScreen
  rica + sticky CSS + i18n + memo).
- SHA256:
  `1722414C6C7EBF4D4AD90A73A261DE2630EF7027BA4B7C4217E58EFFE81B402A`.
  `index.html` regenerado por `build-standalone.js` como copia identica.
- Backup: `backups/PACE_standalone_v0.29.0_20260516.html`
  (restaurado desde `git show HEAD:PACE_standalone.html` tras detectar que
  la regeneracion sobrescribio el standalone antes del paso de rotacion).
  Rotado el mas antiguo: `PACE_standalone_v0.27.0_20260508.html`.
  Cap mantenido en 20.

---

## Verificacion (capturas pendientes -- ritual nuevo s76)

CLAUDE.md / prompt s76 indican adjuntar tres capturas como bloque final
para establecer la costumbre de auditar regresiones visuales en sesiones
futuras. **Pendientes en este ciclo:** al ser sesion automatizada sin
acceso al runtime UI, dejo el slot reservado para que el usuario las
suba o las anote en la siguiente sesion. Estructura propuesta:

```
[ ] Captura A -- Home Pomodoro (FocusTimer aro completo, modo foco).
    Debe ser pixel-equivalente al s75. Verificacion de Cambio 1 desde el
    lado del usuario que NO usa Caminos.
[ ] Captura B -- Pomodoro dentro de un Camino (PathFocusStep).
    Debe lucir el mismo aro Garamond que la captura A, no la version
    "cutre" pre-s76. Verificacion de Cambio 1 desde el flujo Camino.
[ ] Captura C -- CompletionScreen al final de un Camino (idealmente
    con un logro nuevo desbloqueado durante la sesion para validar
    Cambio 3d). SenderoBar al 100% + lista Recorrido + caja de logro.
```

Verificacion automatizada hecha en esta sesion:
- `node build-standalone.js`: parser TS real, 42 archivos validados, 0
  errores de sintaxis. Bundle final reverificado.
- `git status` post-build: sospechosos esperados -- PACE.html (carga
  TimerDial + bump version), tokens.css (token + sticky CSS), FocusTimer.jsx
  (refactor a TimerDial), PathRunner.jsx (sticky + body attr + CompletionScreen),
  SenderoBar.jsx (sticky + memo + title tooltips), strings.js (recorrido),
  state-core.jsx (version), sw.js (cache name), PACE_standalone.html +
  index.html (regenerados), STATE.md + CHANGELOG.md (docs).

---

## Pendientes activos (diferidos por scope)

**Roadmap UX overlay Camino** (decidido s75, s76 cubre solo el primer
bloque):

- **s77 -- Ritmo y microcopia** (sin tocar):
  1. Interstitial 2s entre pasos: card minimalista con SenderoBar grande
     + nombre del siguiente hito (Garamond italic) + animacion de halo
     viajando. Modulo `app/paths/PathTransitions.jsx` recomendado
     (IntroCard / StepIntro / Completion consistentes).
  2. Toast duracion 5000 -> 3000ms en [`Toast.jsx:20`]. Mover a token
     `--toast-duration` o constante en `state-core` (no magic number).
  3. CTA "Comenzar" home: del actual a verde musgo apagado (variante
     viva del oliva `--c3`, NO verde-saturado tipo Stripe).
  4. Animacion de transicion del halo al saltar de hito (heredado s75).
  5. Afinar `--sendero-sticky-h` (hoy 38px placeholder).

- **s78 -- Catalogo Caminos** (sin tocar):
  1. Crear 2 Caminos faltantes (Te sin Azucar / Plain Tea -- reenganche
     tras pausa; Halito / Breath -- micropausa). Catalogo 5 -> 7.
  2. Revisar selector inferior Caminos (`SuggestedPathCard`,
     `PathsLibrary`).

**Otros pendientes activos** (sin cambios desde s75):

- Si el halo unico (0.70) no convence en oscuro, diferenciar via dos
  gradientes por `[data-palette]` (Vela 0.78 claro / Candil 0.62 oscuro).
- A3 (DST en `checkHydrateWeekPerfect`) -- solo 2 dias/anyo, post-Reddit.
- A4 (`checkStatsAchievements` con 1 dia de retraso desde `loadState`) --
  post-Reddit.
- M1 (eliminar `WeeklyStats.jsx` codigo muerto) -- solo arreglada
  indexacion interna.
- M2..M6, B1..B5 -- documentados en informe s68.
- TODO Fase 2 (~3 jun 2026): eliminar `PACE_standalone.html`, dejar solo
  `index.html`.
- Glifos ejercicio s60 (13/46), `PathYearView` movil, logro
  `master.midnight.never`.
- Split `strings.js` (~775 ln tras s76, ALTA).
- Claves i18n huerfanas `sidebar.counter.pomodoros/rounds/streak`.

---

## Decisiones de la sesion

1. **TimerDial sin slot `inner` en PathFocusStep**: los controles del
   Camino (Iniciar/Pausar + Skip) quedan FUERA del dial. Razon: el slot
   `inner` se diseno para el patron Pomodoro home (Comenzar + reset); el
   PathFocusStep tiene `Skip` que rompe el equilibrio visual del aro de
   referencia. Mantener controles abajo simplifica el API de TimerDial
   (solo render, sin condicionales por proveniencia).

2. **!important para empujar padding de SessionShell**: alternativa
   considerada -- migrar `sessionShellStyles.root` a una clase CSS y
   aplicar la regla sin `!important`. Descartada por sobrecoste
   (afectaria a `SessionShell.jsx` y arriesga pixel-drift en todas las
   sesiones de Respira/Mueve/Estira). El `!important` queda en una sola
   regla scoped a `body[data-pace-path-active]` y revierte limpio al
   terminar el Camino.

3. **Logros durante el Camino**: implementado en s76 (no diferido a
   s77) porque la verificacion previa demostro que `unlockedAt` ya esta
   guardado desde el principio. Cero migracion necesaria.

4. **Numerales romanos duplicados** (SB_ROMAN + CS_ROMAN): mantener
   duplicacion hasta tener un tercer consumidor. Lift prematuro a
   `app/ui/numerals.js` aniade carga + indireccion para 7 strings de
   constantes.

---

## Cambios netos por archivo

| Archivo | Cambio |
|---|---|
| `app/ui/TimerDial.jsx` | NUEVO (123 ln) -- anillo + tipografia compartida |
| `app/focus/FocusTimer.jsx` | -73 ln (TimerAro + interpolateRingColor + 6 estilos -> TimerDial) |
| `app/paths/PathRunner.jsx` | +~180 ln (CompletionScreen rica + sticky effect + TimerDial wire en PathFocusStep) |
| `app/paths/SenderoBar.jsx` | +memo + prop sticky + `<title>` SVG tooltips |
| `app/tokens.css` | +1 token + bloque sticky + 2 reglas body-attr |
| `app/i18n/strings.js` | +2 lineas (recorrido ES+EN) |
| `app/state-core.jsx` | PACE_VERSION bump |
| `sw.js` | CACHE_NAME bump |
| `PACE.html` | +1 script TimerDial + title bump |
