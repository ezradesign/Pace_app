# Sesión 114 — Runner guiado · capa editorial (v0.58.0)

**Fecha:** 2026-07-21
**Versión:** v0.57.0 → v0.58.0
**Bloque:** GIRO «runner guiado» — **2ª de 2, CIERRA el giro** (s113 motor · s114
capa editorial). B2.2b-1 (contrato + duración derivada) pasa a ser lo siguiente.

**Principio rector (vigente):** «el usuario toca para empezar, pausar o adaptar;
NO para empujar la rutina hacia delante».

---

## 1 · Decisiones de arranque (AskUserQuestion → «las más profesionales»)

El usuario delegó las 4 decisiones abiertas pidiendo «las más profesionales y
que aporten más valor». Adoptadas:

1. **Meta de la pantalla final por módulo (1A):** Mueve → «Movimiento
   completado» · Estira → «Estiramiento completado». «Antídoto» deja de ser meta
   universal (resuelve el P3 `session.antidoteDone`); queda como identidad de
   rutina.
2. **Aviso de fin de intervalo (2A):** también en los últimos ~5 s de los pasos
   con reloj (timed/perSide), además de los descansos. Una **única** señal al
   cruzar el umbral, no una cuenta 5-4-3-2-1.
3. **Sitio del ajuste de descanso (3A):** **bloque nuevo «Sesiones»** en Ajustes
   (tras audio/notificación) — es ritmo de sesión, no audio, y aloja los ajustes
   de método que vienen (B2.2b).
4. **Acceso a «Cuídate» (4A):** siempre visible como línea secundaria bajo el
   shortCue, sin interacción. En altura baja se oculta el **rótulo**, nunca el
   **contenido**.

## 2 · Qué se implementó

### Instrucciones por capas (P0) — los 5 pilotos

Modelo de 3 campos por paso (opcionales, aditivos; `cue` se conserva como
fallback → **cero re-indexado** de las keys EN sN existentes):

- **`placeCue`** — setup completo, se muestra en la fase de **colocación**.
- **`cue` (shortCue)** — ejecución concisa, se muestra en **trabajo**.
- **`careCue`** — adaptación «Cuídate», línea secundaria **siempre visible** en
  trabajo (decisión 4A).

Pilotos tocados: `extra.desk.pushups`, `extra.chair.squats` (Mueve) ·
`move.neck.3`, `move.chair.antidote`, `move.couch.stretch` (Estira). Espejos EN:
keys **nuevas** `id.sN.placeCue` / `id.sN.careCue` en content/move.js y
content/extra.js (los `cue` existentes solo cambian de VALOR, no de posición).

- **Colocación para reps (fuerza):** un step `reps` con `placeCue` que **no
  viene tras un rest** gana una colocación AUTO (ventana para leer el setup y
  ponerse en posición antes de que arranque el pacer). El 1er set la muestra;
  los sets 2/3 vienen tras un rest (que ya recoloca y guía qué viene) → directo
  a trabajo, sin doble espera. Sigue siendo 0 taps (auto-fluye; «Empezar ya»
  opcional).
- **Lado integrado (perSide):** el lado deja de ser un kicker suelto — la palabra
  del lado abre la instrucción de trabajo como `<strong>` en el acento del módulo
  (`«Izquierda. Lleva la oreja…»`). «no en dos piezas».
- El hint genérico del pulso (`move.repsGuidedHint`) cede el sitio a la capa
  «Cuídate» (específica del ejercicio); la key queda por si se reutiliza.

### Pantalla final por MÓDULO (P0) — resuelve el P3 + reps reales

- `doneMeta` por `kind`: extra → `session.stretchDone` · move → `session.moveDone`.
- **Stats honestas** consumiendo `repsGuidedRef` (deuda directa de s113):
  - fuerza pura (todos los steps de ejercicio son reps): **tiempo · series ·
    reps guiadas reales**;
  - mixta (reps + otros, p. ej. neck.3): **tiempo · pasos · reps guiadas**;
  - movilidad pura: **tiempo · pasos**.
  - `repsGuidedRef` acredita SOLO reps guiadas reales (objetivo al
    auto-completar; `floor(elapsed/repSeconds)` al «Terminar antes») → **nunca el
    objetivo**. Verificado: desk.pushups terminando series antes → «Series 3 ·
    Reps 16», no 30.
  - Sin calorías, récords ni comparaciones.

### Ajuste de Tweaks del descanso (P1) — bloque «Sesiones»

- `restBetweenSets` en defaultState (**30**, recomendado; merge de loadState
  cubre instalaciones previas). Presets **Breve 20 / Tranquilo 30 / Amplio 45**.
- Helpers `v1RestSeconds()` + `v1StepDur(step)` (support): SOLO los rests con
  `restKind:'betweenSets'` toman el preset; el resto (incl. el **cierre
  respiratorio** sin restKind) usan su `dur`. `v1StepProgress` usa `v1StepDur`
  para el llenado de la barra. Verificado: desk.pushups rest sigue 20/30/45; el
  «Reset respiración» de chair.antidote queda en 30 fijo.
- **El descanso GUÍA:** anuncia la serie que viene (`move.restNext` «Luego: …»)
  y avisa en los últimos ~5 s (`move.restReady`, visual + sonido). El cierre
  (sin paso siguiente) no muestra nada de esto.

### Señales de audio SIN voz (P2) — familia move en Sound.jsx

Con las primitivas y la afinación 432 existentes (sin 2º contexto ni sistema de
notas paralelo):

- **`move.warn`** — aviso ÚNICO de fin de intervalo (~5 s): glide descendente
  G4→D4 (espejo del ascenso de `move.start`), NO cuenta atrás sonora. Se dispara
  una vez al cruzar `elapsed === effDur-5` en descansos y pasos con reloj
  (decisión 2A). El `tick` de reps queda aparte y más suave.
- **`move.side`** — cambio de lado (dos toques triangle E4→B4, «giro»);
  `enterChange` pasa de `move.step` a `move.side`.
- Todo bajo `soundOn` + try/catch → silencio total y sin errores con
  `soundOn:false` (verificado).

### CSS (compactación por altura)

La capa «Cuídate» suma una línea → se apretó el tier de altura ≤700 (glyph/cue/
care margins) y el tier retrato para mantener el **delta 0** de s113. El rótulo
`data-pace-v1-care-label` se oculta en ≤560 (≥641px de ancho); el contenido
nunca.

## 3 · Verificación (dev :8765 + standalone; SW purgado + reload mismo gesto)

- **desk.pushups (flujo completo, dev):** prep 5 → **colocación** (kicker
  «Colócate» + placeCue + gate 5→1 + placeHint) → **trabajo** (shortCue +
  «Cuídate», sin kicker de lado) → descanso («Luego: Flexiones inclinadas») →
  sets 2/3 **directos a trabajo** (regla afterRest) → **pantalla final
  «Movimiento completado» · Tiempo 1:56 · Series 3 · Reps 16** (honesto,
  terminando series antes; no 30).
- **neck.3 (Estira):** chin tucks (reps) colocación + trabajo con «Cuídate» ·
  Inclinación lateral (perSide) con **lado integrado** («Izquierda. …», `<strong>`
  acento extra, sin kicker).
- **couch.stretch (5º piloto, premium desbloqueado tmp):** colocación `ready`
  («Colócate» + placeCue + «Empiezas por: Izquierda» + «Estoy listo») → trabajo
  lado integrado + «Cuídate»; kind=extra → «Estiramiento completado».
- **Tweaks «Sesiones»:** 3 presets, «Tranquilo · 30s» activo por defecto; clic
  Amplio → `restBetweenSets=45`. Lógica: `v1StepDur(deskRest)`=20/30/45,
  `v1StepDur(cierre)`=30 fijo.
- **Audio:** `move.warn`/`move.side`/`tick` sin error con sonido; no-op silencioso
  con `soundOn:false`.
- **Viewports (delta 0, sin scrollbar, RE-MEDIDOS):** trabajo con «Cuídate» en
  1280×600 · 1024×512 · 844×390 (glyph + rótulo «Cuídate» ocultos, contenido
  visible) · 360×640 (rótulo visible). Colocación (placeCue largo) en 844×390:
  12 muestras a delta 0.
- **Legacy** `move.shoulders.5`: prep **3** (no 5), glyph 44, **sin atributos
  v1**, sin «Cuídate», kicker «Paso 1 de 5» — byte-idéntico.
- **reduced-motion:** s114 no añade animaciones (careCue y lado son estáticos);
  el pulso de reps (s113) sigue sin `data-pace-essential` → el kill global lo
  congela.
- **Consola limpia** (solo marcadores en carga fresca; el buffer del pane los
  duplica y los conserva entre recargas — verificado con marcadores).
- **Standalone** regenerado UNA vez (3136 KB, 83 scripts, sanity OK): v0.58.0,
  capas vivas, delta 0, consola limpia. Bump ×3 (state-core · PACE.html título ·
  sw.js CACHE_NAME). Backup `v0.57.0_20260721` (rotado `v0.37.0_20260708`, cap
  20).

## 4 · Fuera de alcance respetado

B2.2b-1 contrato/duración derivada · feedback «¿te ayudó?» · eventos · Welcome ·
a11y (sesión propia) · migrar las otras 22 rutinas · **voz/TTS (NUNCA en esta
fase)** · diagramas de dos poses (los itera el usuario, regla D-4).

## 5 · Deuda nueva o confirmada

- `SessionShell.jsx` 494 ln (INTOCADO en s114 — roza el tope; el próximo cambio
  que lo toque extrae el CSS inyectado primero).
- `MoveSessionV1.jsx` 480 ln · `TweaksPanel.jsx` 462 ln (ambos con margen).
- `move.repsGuidedHint` queda como key sin consumidor tras ceder el sitio a
  «Cuídate» (retirar o reutilizar en B2.2b).
- `cue` en los 5 pilotos es fallback (superado por placeCue/shortCue); B2.2b-1
  puede consolidar `instruction.*`.
- Deuda de entorno (s112/s113): SW dev puede servir versión vieja → purga +
  reload en el MISMO gesto (aplicado); buffer de consola del pane duplica y
  sobrevive recargas → marcadores en carga fresca.
- PWA en navegador real (instalación + notificación): sigue del usuario (s102).
