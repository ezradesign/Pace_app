# Sesion 77 -- v0.31.0 -- feat(camino): PathTransitions

> 2026-05-17. Tres cards de transicion intra-overlay que cierran los
> saltos abruptos al abrir un Camino, entre cada par de pasos y antes
> de la CompletionScreen. Cero audio nuevo. Volatil (no persiste).

---

## Contexto

s76 dejo continuidad **dentro** de cada pantalla del Camino (SenderoBar
sticky + TimerDial compartido) y al **cerrar** (CompletionScreen rica).
Quedaban tres saltos abruptos sin transicion:

1. Al abrir el overlay -> primer paso.
2. Entre cada par de pasos consecutivos.
3. Del ultimo paso -> CompletionScreen.

s77 los cierra con un unico modulo nuevo `PathTransitions.jsx` que
exporta tres variantes (`IntroCard`, `StepIntro`, `OutroCard`) sobre un
componente base (`TransitionCardBase`) y una pequena modificacion en
`SenderoBar` (prop `size="lg"` y prop `orbVisible`).

Prompt cerrado con 14 decisiones tras conversacion s76->s77, registradas
en STATE.md al cierre de s76.

## Auditoria previa

- CLAUDE.md, STATE.md, DESIGN_SYSTEM.md leidos.
- Working tree clean, commit s76 publicado (`9e8f458`).
- Las 7 checkboxes runtime de s76 no estaban marcadas en STATE.md.
  Validacion estatica del s76 confirmo: build limpio (42 archivos sin
  errores sintacticos), z-index sticky correcto (95 > SessionShell 90),
  body-attr empuja paddings, `<title>` SVG por hito presente, filtro de
  logros por `unlockedAt >= startedAt` correcto. Las capturas pixel-perfect
  (A/B/C/altura movil) quedan implicit cubiertas por D/E/F/G del propio
  cierre s77 (capturar D-G obliga a pasar por home Pomodoro, PathFocusStep
  y CompletionScreen).
- Maquina de estados de PathRunner leida en
  [PathRunner.jsx:511-657](../../app/paths/PathRunner.jsx). cur.stepIndex,
  handleStepExit con isLast, useEffect body-attr s76.
- SenderoBar leida en [SenderoBar.jsx](../../app/paths/SenderoBar.jsx).
  prop sticky, React.memo, `<title>` por hito.
- Sound.jsx leida solo para confirmar que NO se modifica (decision 15).

## Decisiones aplicadas

| # | Decision | Implementacion |
|---|---|---|
| 1 | 3 fronteras: IntroCard + StepIntro + OutroCard | Tres exports en PathTransitions.jsx + PathRunner los monta segun `phase` |
| 2 | Intra-overlay (no modal sobre Home) | Cards renderizadas dentro de `.path-runner-overlay` con `position: absolute` |
| 3 | Volatiles. Recargar = aterriza en paso destino | Step intermedio: `advancePathStep` AHORA + phase='transition'. Ultimo: snapshot local en `pendingComplete` |
| 4 | Duraciones 2.5s / 2s / 1.5s | Tokens `--path-intro-ms` / `--path-step-ms` / `--path-outro-ms` |
| 5 | Entrada/salida fade + scale 0.96->1.0 / 1.0->0.96 (200ms) | `--path-card-fade-ms`, `--path-card-scale-from`. Doble rAF al mount para asegurar pintado del estado inicial |
| 6 | Cross-fade OutroCard -> CompletionScreen 400ms | `CompletionScreen` con prop `fadeIn` que aplica opacity 0->1 transition 400ms al montar. Ambos componentes con background `var(--paper)` -> efecto cross-fade limpio |
| 7 | Card entera tappable + "toca para continuar" Garamond italic ink-3 13px | onClick en raiz + `path.runner.transition.continue` i18n |
| 8 | Skip = StepIntro normal al siguiente disponible | `handleStepExit('skip')` llama `advancePathStep('skip')` y phase='transition'. skipped queda en `cur.skippedSteps` |
| 9 | StepIntro bloqueante: paso siguiente se monta TRAS la card | Render dispatch por phase: cuando phase='transition' SOLO StepIntro, no el step |
| 10 | Orbe 6px + glow 12px en var(--c3=focus), solo StepIntro | `<animateMotion>` SMIL dur=2s sobre la curva Bezier del segmento prev->current. Path construido con `sbSegmentPath` reutilizado |
| 11 | Layout vertical: SenderoBar arriba ~30% + titulo centrado + hint base | Flex column space-between, padding `10vh 32px 6vh` |
| 12 | SenderoBar de transicion sin labels (solo circulos) | Prop `size="lg"` desactiva `.hito-labels` y aumenta altura SVG a clamp(140px, 22vh, 220px) |
| 13 | Copy minimalista por variante | IntroCard: path.name + 0/N. StepIntro: kind.name + parcial + orbe. OutroCard: path.name + N/N |
| 14 | OutroCard ≡ IntroCard estructural (solo cambia sendero 0/N vs N/N) | Misma TransitionCardBase con diferentes props |
| 15 | Silencio total en transiciones | Sound.jsx no modificado. Ningun `playSound` en PathTransitions |

## Que se hizo

### NUEVO `app/paths/PathTransitions.jsx` (233 ln)

- `TransitionCardBase` (privado al modulo) -- logica comun: entrada
  fade+scale via doble rAF, hold timer, salida fade+scale al expirar o
  al tap, callback `onContinue`. Lee duraciones de `getComputedStyle`
  con fallback hardcoded (--path-intro-ms / step / outro / card-fade-ms /
  card-scale-from).
- `IntroCard({ pathName, blocks, onContinue })` -- titulo path.name,
  currentIndex=0, durationVar='intro' (2500ms).
- `StepIntro({ kindName, blocks, currentIndex, onContinue })` -- titulo
  paths.kind.{kind}.name, currentIndex=cur.stepIndex (el destino),
  durationVar='step' (2000ms), orbVisible=true.
- `OutroCard({ pathName, blocks, onContinue })` -- titulo path.name,
  currentIndex=blocks.length (todos done), durationVar='outro' (1500ms).
- Layout flex column space-between con SenderoBar en slot superior,
  titulo en centro vertical y hint "toca para continuar" en base.
- Exports a window: `IntroCard`, `StepIntro`, `OutroCard`.

### MODIFICA `app/paths/SenderoBar.jsx` (148 -> 161 ln)

- Nuevas props `size` y `orbVisible`. `size === 'lg'` anyade className
  `lg` y suprime `.hito-labels` (junto con la supresion existente para
  `sticky`).
- Orbe viajero condicional: cuando `orbVisible && currentIndex > 0 &&
  currentIndex <= total - 1`, renderiza dos `<circle>` dentro de un `<g>`
  con `<animateMotion dur="2s" fill="freeze" path={orbPath} />`. orbPath
  construido como `M ${xs[prev]} 50 ${sbSegmentPath(xs[prev], xs[cur],
  prevIdx)}` (reutiliza la misma funcion de generacion de Bezier que el
  trazo de fondo, asi orbe y curva quedan alineados pixel-a-pixel).
- Glow: circle r=7 fill var(--focus) opacity 0.30. Punto: r=3 fill
  var(--focus).
- React.memo conservado.

### MODIFICA `app/paths/PathRunner.jsx` (660 -> 719 ln)

- `CompletionScreen` -- nueva prop `fadeIn`. Doble rAF al mount para
  arrancar opacity 0 y transicionar a 1 (400ms ease-out). Solo activo
  cuando PathRunner monta CompletionScreen tras OutroCard.
- `PathRunner` -- estado nuevo `phase` ('intro' | 'step' | 'transition' |
  'outro') y `pendingComplete` (snapshot + reason capturados al iniciar
  OutroCard, comiteados en `handleOutroDone`).
- `useEffect` inicializador de phase: en mount/cambio de `cur.id`,
  activa 'intro' si `cur.stepIndex === 0` y `(Date.now() - startedAt) <
  1500ms`. Al recargar, este margen ya habra expirado -> phase='step'.
- `handleStepExit` reescrito:
  - Intermedio: `advancePathStep(reason)` (cur.stepIndex avanza, se
    persiste en localStorage) + phase='transition'.
  - Ultimo: capturar snapshot en `pendingComplete`, phase='outro'. El
    avance final (`advancePathStep` que dispara `completePath`) se
    difiere hasta `handleOutroDone`.
- Tres callbacks de continuacion: `handleIntroDone`,
  `handleTransitionDone`, `handleOutroDone`.
- `useEffect` de Escape extendido: ignora la tecla durante phases
  no='step' (la card es tappable de por si, no necesita Escape).
- Render dispatch por phase: el bloque del step (SenderoBar sticky +
  PathTopBar + body) SOLO se monta cuando phase='step'. Las cards de
  transicion son hermanas (siblings) renderizadas con
  `position: absolute` sobre el overlay.

### MODIFICA `app/tokens.css`

- 5 tokens nuevos en `:root` (--path-intro-ms, --path-step-ms,
  --path-outro-ms, --path-card-fade-ms, --path-card-scale-from).
- Bloque `.sendero-bar.lg`: padding 0, max-width 720, altura SVG
  `clamp(140px, 22vh, 220px)`.
- `@keyframes path-orb-travel` (declarado, reservado para futura
  migracion a `offset-path`; el orbe vive hoy en `<animateMotion>`
  SMIL).
- `.sendero-bar .sendero-orb { pointer-events: none; }` -- el orbe es
  decorativo.

### MODIFICA `app/i18n/strings.js`

- 1 sola clave nueva (decision: maximo 1 i18n por sesion s77):
  - ES: `'path.runner.transition.continue': 'toca para continuar'`
  - EN: `'path.runner.transition.continue': 'tap to continue'`

### MODIFICA `PACE.html`

- Nueva linea `<script src="app/paths/PathTransitions.jsx">` ANTES de
  PathRunner.jsx. PathRunner consume `IntroCard`/`StepIntro`/`OutroCard`,
  asi que el orden de carga es critico (mismo patron que SenderoBar).
- `<title>` -> `v0.31.0`.

### Bump version

- `app/state-core.jsx`: `PACE_VERSION = 'v0.31.0'`.
- `sw.js`: `CACHE_NAME = 'pace-v0.31.0'`.

## Decisiones tecnicas relevantes

### Asimetria step intermedio vs ultimo en la persistencia

Decision 3 ("recargar = aterriza en paso destino sin transicion") se
cumple **estrictamente** para step intermedio (advancePathStep AHORA) y
**marginalmente** para el ultimo (snapshot en estado local pendingComplete,
advance diferido hasta tras OutroCard). Razon: si llamamos
advancePathStep para el ultimo paso AHORA, `completePath` limpia
`cur=null` y OutroCard no tiene contexto para renderizarse (cur es la
fuente de pathName y blocks).

Trade-off: si recargas durante OutroCard, aterrizas en el ultimo step
con el timer/contenido a 0 (que tecnicamente has completado pero el
state no lo refleja todavia). El edge case es marginal -- requeririas
recargar en una ventana de 1.5s -- y la complejidad de mantener un
"limbo" persistido es desproporcionada para este v1. Diferido a s77b si
se materializa el caso en uso real.

### Cross-fade via background compartido

`background: var(--paper)` en OutroCard y en CompletionScreen permite
que el cross-fade visual funcione con un solo gradient de opacity 0->1
en CompletionScreen (fadeIn 400ms), sin tener que mantener OutroCard
renderizada en paralelo. El usuario percibe la transicion como un
fundido del titulo del Camino al cierre rico, sobre el mismo fondo de
papel.

### Orbe: SMIL animateMotion, NO offset-path

SMIL es mas robusto cross-browser para SVG `<circle>` que `offset-path`
(Safari iOS aun renderiza inconsistente offset-path sobre elementos
SVG hijos). animateMotion garantiza el render. El keyframe
`path-orb-travel` queda en tokens.css como declaracion reservada por si
en el futuro queremos migrar a CSS puro con offset-path sobre un
elemento HTML hermano del SVG.

### PathRunner sigue gordo (719 ln)

PathRunner cruza 700 lineas (de 660 en s76). Sigue lejos del limite
recomendado de 500 (regla 1 de CLAUDE.md). Posibles trocadas para s78+:
extraer `CompletionScreen` a `app/paths/PathCompletion.jsx`, extraer los
4 `Path*Step` a `app/paths/PathSteps.jsx`. Hoy es deuda registrada, no
bloqueo.

## Verificacion en cierre

Lo que **se puede verificar estaticamente** (build + lectura):

- [x] Build standalone limpio: 43 archivos validados (3 .js, 40 .jsx).
      Subio de 42 -> 43 por PathTransitions.jsx.
- [x] Bundle 599 KB (vs 583 de s76; +16 KB esperado por PathTransitions
      + i18n + CSS).
- [x] index.html = PACE_standalone.html byte-a-byte (613054 bytes).
- [x] Backup `v0.30.0_20260517.html` creado ANTES del build (correccion
      sobre el procedimiento s76 que sobrescribio).
- [x] Backup `v0.27.1b_20260509.html` rotado (cap 20 mantenido).
- [x] Cero referencias a `v0.30.0` en bundle; 6 referencias a `v0.31.0`.
- [x] 32 referencias a `PathTransitions|IntroCard|StepIntro|OutroCard`
      en el bundle (componente embedded correctamente).
- [x] Orden de carga PACE.html: SenderoBar -> PathTransitions ->
      PathRunner. Verificado en lineas 170-173.

Lo que **requiere validacion runtime** (usuario, browser):

- [ ] **Captura D** -- IntroCard al abrir un Camino: SenderoBar 0/N +
      nombre del Camino + tap avanza al paso 1.
- [ ] **Captura E** -- StepIntro entre dos pasos: SenderoBar parcial con
      orbe a medio camino + nombre del siguiente kind grande.
- [ ] **Captura F** -- OutroCard antes del cross-fade: SenderoBar 100% +
      nombre del Camino + tap avanza a CompletionScreen.
- [ ] **Captura G** -- CompletionScreen rica tras el cross-fade
      (regresion s76: sigue luciendo identica al cierre s76).
- [ ] Camino con 1 skip intermedio: solo 1 StepIntro por transicion,
      sin "saltando..." (decision 8).
- [ ] Recargar durante una StepIntro: aterriza directo en paso destino
      sin transicion (decision 3).
- [ ] Consola limpia en claro y oscuro + sticky de s76 sigue
      funcionando en Respira/Mueve dentro del Camino (regresion).

## Pendiente s77b (post-runtime)

Si la validacion runtime descubre problemas, candidatos a fix en s77b:

- Toast 5000 -> 3000ms via token `--toast-duration` o constante en
  state-core (no magic number).
- CTA "Comenzar" home -> verde musgo apagado (variante viva del oliva
  `--c3`, NO Stripe-saturado).
- Animacion del halo en SenderoBar al saltar de hito FUERA de
  transiciones (heredado s75, distinto del orbe viajero que vive solo
  en StepIntro).
- Afinar `--sendero-sticky-h` si la captura E muestra que rompe layout
  movil 375x812.
- Lift `SB_ROMAN` / `CS_ROMAN` a `app/ui/numerals.js` cuando aparezca
  el tercer consumidor (PathTransitions NO usa numerales -- por ahora
  siguen siendo dos copias).

## Build

- `PACE_standalone.html`: **599 KiB** (613,054 bytes).
- `index.html`: identico byte-a-byte.
- 43 archivos validados (42 -> 43 por PathTransitions.jsx).
- Backup nuevo: `backups/PACE_standalone_v0.30.0_20260517.html`.
- Rotado: `backups/PACE_standalone_v0.27.1b_20260509.html` (decision
  documentada en STATE.md tras s76).
- 20 backups vigentes.

## Cierre

s77 cierra el bloque UX overlay Camino abierto en s75->s76->s77:
- **s75** -- SenderoBar (hibrido lineal+halo).
- **s76** -- Arquitectura overlay (sticky + TimerDial + CompletionScreen).
- **s77** -- Transiciones entre pantallas (intro + step + outro).

Proxima sesion segun roadmap: **s78 -- Catalogo Caminos** (Te sin Azucar
/ Plain Tea + Halito / Breath; catalogo 5 -> 7 + revision del selector
inferior).
