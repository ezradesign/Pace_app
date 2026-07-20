# Sesión 113 — Runner guiado · motor (v0.57.0)

**Fecha:** 2026-07-20
**Versión:** v0.56.0 → v0.57.0
**Bloque:** GIRO «runner guiado» (decisión del usuario 2026-07-18, post-s112;
registrado en commit `bc12839`). Primera de dos: s113 motor · s114 capa
editorial. B2.2b-1 pasa a DESPUÉS, alimentado por el comportamiento real.

**Principio rector:** «el usuario toca para empezar, pausar o adaptar; NO para
empujar la rutina hacia delante». La rutina se completa SIN tocar la pantalla
tras el arranque; el único tap legítimo es el gate `ready` (colocación
compleja). Aplica las ENMIENDAS registradas a R2/R3/BASE §3-A
(DECISIONES_PRODUCTO §B2) — no se reabrieron.

---

## 1 · Decisiones de arranque (AskUserQuestion, las 3 previstas)

1. **Reps de fuerza: el guiado SUSTITUYE al libre** en los pilotos (no
   conviven). «Terminar antes» queda como salida anticipada — la enmienda R2
   ya lo definía así.
2. **Señal por rep: pulso visual + tick sonoro suave** reutilizando la familia
   actual de Sound.jsx (`tick`; sin recetas nuevas — el audio nuevo es s114).
   En suelo/pared no se mira la pantalla; todo funciona igual en silencio.
3. **Transición de lado: 10 s** por defecto (equilibrio silla/suelo; «Empezar
   ya» absorbe los rápidos, «Más tiempo» los lentos; override por paso →
   metadatos B2.2b-1).

## 2 · Qué se implementó

### Reps guiadas con cadencia (enmienda R2)

- `mode:'reps'` pasa de «objetivo suave + Terminé» (s111) a **guiado**: el
  reloj marca la cadencia (`V1_REP_SECONDS = 4` — fuerza, 2 bajar + 2 subir,
  ref. ACE 2-8 s), contador grande «n» + label «de {N} reps», **pulso visual**
  (`pace-rep-pulse`, scale 1→0.86→1 con la duración real de la rep) + **tick
  suave por rep** · **avance AUTO al objetivo**.
- `step.repSeconds` opcional por paso: **Chin tucks de `neck.3` declara 8 s**
  (control postural con retención «mantén 3-5 s», no cadencia de fuerza;
  5×8 = 40 s cuadra con su `dur`). Base del `tempo` de B2.2b-1.
- **«Terminar antes» siempre visible** (primaria); **pausa disponible** (botón
  y Espacio; el pulso se congela con `animationPlayState`).
- **Acreditación honesta**: `repsGuidedRef` acumula solo las reps realmente
  guiadas (objetivo al auto-completar; `floor(elapsed/repSeconds)` al terminar
  antes). Lo consumirá la pantalla final de s114 — nunca se acredita el
  objetivo como resultado.
- **Reduced-motion**: el pulso NO cuelga de `data-pace-essential` a propósito →
  el kill global de tokens.css lo congela y queda el contador sin animación.
- La barra de progreso de reps deja de ser 0: `elapsed / (reps × repSeconds)`.

### Transición AUTO de lado (enmienda R3)

- Fin del lado 1 → señal suave (`move.step`, familia actual) → pantalla de
  transición: kicker «Cambia de lado» + cuenta **10 s** en estilo gate (56px
  `--ink-2`, no es el timer) + **«Ahora: Derecha»** + «El lado siguiente
  empieza solo» → **el lado 2 arranca solo**.
- «Empezar ya» (salta) · «Más tiempo» (+5 s) · «Pausar» — OPCIONALES;
  «Anterior» no se muestra durante la transición. «Siguiente» en un perSide
  lado 0 entra en la transición (no salta el lado).

### Prep · Rest · min

- **Prep 5 s** (antes 3) en el runner v1; legacy sigue en 3.
- **Rest entre series 30 s** (antes 20) + **`restKind: 'betweenSets'`** en los
  4 descansos de `desk.pushups` y `chair.squats` — tipado mínimo, base del
  ajuste de Tweaks de s114. El **«Reset respiración» de `chair.antidote` NO se
  toca ni se tipa** (es CIERRE; comentario en el dato para que s114 no lo
  pise). El rest ya terminaba solo; «Saltar» sigue opcional.
- `extra.desk.pushups` **min 2 → 3** (ejecución real medida 3:00-3:25; la
  derivación formal es B2.2b-1).

### Layout compacto por ALTURA (P1 del giro)

- **SessionShell.jsx** (nivel shell, beneficia a los 4 tipos + legacy): tiers
  `(min-width: 641px) and (max-height: 700|560|430px)` — padding root,
  prep-num 140/110/84, done compacto, `[data-pace-move-timer]` 96/72/60, hint
  oculto ≤560. **Tier a 700, no 720**: a ≥701px todo cabía ya en s112 (las
  alturas estándar quedan idénticas).
- **MoveSessionV1.support.jsx** (solo v1, ganchos `data-pace-v1-*`): márgenes →
  tipografías secundarias → **glifo oculto a ≤430px** (landscape móvil). Orden
  respetado: espacios → glifo → decorativo; NUNCA instrucciones ni controles.
- **Retrato estrecho** `(max-width: 640px) and (max-height: 700px)`: SOLO
  espacios (el bloque móvil por anchura de s27 sigue mandando en tipografía) —
  arregla el desborde de 18px del paso de reps en 360×640.
- `v1GlyphSize(vpH)`: ≥720 fórmula s112 intacta (150-240); <720 pendiente
  0.22 sin suelo de 150 (600→132 · 512→113; medido: con 150 desbordaba 16px).
- Footer del shell con `flexWrap: 'wrap'` (los 3 opcionales de la transición
  caben en anchos estrechos sin desbordar).
- El scroll del centro (s112) queda SOLO como red de seguridad.

### Fix de arquitectura destapado por la verificación

- Warning React **«Cannot update a component (Sidebar) while rendering
  (MoveSessionV1)»**: los updaters de `setElapsed`/`setPlaceLeft`/
  `setChangeLeft` disparaban side-effects (avance, sonidos, completion →
  estado global) DURANTE el render. Pre-existía desde s110; el motor guiado lo
  hacía constante al auto-avanzar. **Patrón nuevo**: los intervalos SOLO
  incrementan/decrementan su contador; los umbrales y side-effects viven en
  efectos aparte (deps `[elapsed]`/`[placeLeft]`/`[changeLeft]`). Verificado
  con marcador en carga fresca: la completion automática ya no lo emite.

### Split (regla <500 ln)

- **`MoveSessionV1.support.jsx` NUEVO** (119 ln, patrón FocusTimer.support):
  constantes del método (`V1_PLACE/REP/CHANGE_SECONDS`), helpers
  (`v1RepSeconds/v1RepTarget/v1StepProgress/v1StepWeight/v1GlyphSize`) y CSS
  inyectado (`pace-move-v1-css`: keyframes del pulso + tiers de altura v1).
  Carga ANTES de MoveSessionV1.jsx (tag nuevo en PACE.html).
  MoveSessionV1.jsx queda en 412 ln. SessionShell 493 ln (roza el tope —
  anotado en deuda).

### i18n (strings/sessions.js, ES+EN)

- Nuevas: `move.repsOf` («de {n} reps») · `move.repsGuidedHint` («Sigue el
  pulso · haz menos si hoy lo necesitas») · `move.finishEarly` («Terminar
  antes») · `move.sideAutoHint` («El lado siguiente empieza solo»).
- Retiradas (sin consumidores tras el corte): `move.repsTarget` ·
  `move.repsDone` · `move.repsHint` · `session.sideReady`.
- Los campos nuevos de paso (`restKind`, `repSeconds`) NO crean keys `sN`;
  ningún step insertado/borrado → EN posicionales intactos.

## 3 · Verificación (dev :8765 + standalone; SW purgado ×3 — sirvió versión vieja 2 veces)

- **desk.pushups COMPLETO sin tocar la pantalla** tras el arranque: prep 5 →
  3 series guiadas (avance auto al objetivo) → rests 30 s auto → done «3:00 ·
  5 pasos» (tiempo real) · 0 toasts sobre la ceremonia.
- **neck.3**: chin tucks a 8 s/rep («2 de 5» a ~12 s) · 3 cambios de lado
  automáticos · done «3:22» real.
- **couch.stretch** (flag premium temporal, restaurado): `ready` en paso 0
  espera sin cuenta («Empiezas por: Izquierda» + «Estoy listo») · transición
  capturada y PAUSADA (cuenta 10 congelada, «Ahora: Derecha», footer
  Más tiempo/Reanudar/Empezar ya) · «Más tiempo» 10→15 · reanuda · lado 2
  arranca SOLO.
- **chair.antidote**: «Siguiente» en perSide entra en la transición · Flexor
  de cadera con `ready` intacto · cierre respiratorio sin `restKind` (dato
  verificado en runtime).
- **Legacy** `move.shoulders.5`: prep 3, glifo 72, sin atributos v1, sin
  overflow — equivalencia funcional.
- **Viewports (delta de scroll = 0 y footer visible)**: 1280×600 (glifo 132) ·
  1024×512 (113) · 844×390 (glifo oculto, h1 22) · 360×640 (tier de espacios).
  Prep también medido en los 4.
- **Reduced-motion**: contrato verificado (el pulso no cuelga de
  `data-pace-essential`; el kill global lo congela, el contador sigue).
- **Silencio**: `soundOn:false` en vivo → el contador avanza, cero errores.
- **Consola limpia** (el único error del buffer era el warning histórico
  pre-fix, acotado con marcadores en carga fresca).
- **Standalone** regenerado UNA vez (3119 KB, 83 scripts): v0.57.0, reps
  guiadas con pulso 4 s vivas, legacy prep 3 intacto, consola limpia. Bump ×3
  (state-core · título PACE.html · CACHE_NAME sw.js). Backup
  `v0.56.0_20260720` (rotado `v0.36.0_20260707`, cap 20).

## 4 · Fuera de alcance respetado

Instrucciones por capas · pantalla final · ajuste Tweaks del descanso ·
familia de audio nueva (todo s114) · B2.2b-1 · feedback · eventos · Welcome ·
a11y (sesión propia) · migrar las otras 23 rutinas · voz/TTS (NUNCA en esta
fase).

## 5 · Deuda nueva o confirmada

- SessionShell.jsx 493 ln (roza el tope de 500; próximo cambio → split CSS).
- El SW en dev sirvió versión vieja 2 veces en la sesión (re-registro tras
  purga) → refuerza la deuda de entorno registrada en s112.
- La consola embebida del pane cuadruplica mensajes y su buffer sobrevive a
  las recargas: verificar con marcadores (`console.error('MARKER')`) en carga
  fresca — React dedupe warnings por carga.
- `repsGuidedRef` se registra pero aún no se muestra (lo consume la pantalla
  final de s114).
