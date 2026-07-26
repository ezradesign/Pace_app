# Sesión 122 — Claridad UX de la home (v0.65.0)

> Objetivo: que una persona, sin explicaciones, entienda la home — distinga
> **Foco manual** de **Camino guiado**, sepa qué es un Camino y cuál es la acción
> principal. Trabajo de **jerarquía + copy + affordance**, gobernado por
> `docs/product/HOME_REDISENO_PROPUESTA.md` (§1/§3/§4/§5/§6). NO más catálogo, NO
> migración de rutinas, NO runner, NO eventos. Bump v0.64.0 → **v0.65.0**.

## Alcance

Pieza (A) **CLARIDAD** de HOME_REDISENO. La pieza (B) **§0 solapamiento
responsive** entró en parte por decisión explícita del usuario (ver abajo). §7
(Tweaks/Estadísticas) queda fuera.

## Auditoría previa (estado «antes»)

- **Orden DOM:** TopBar → Timer → **Actividades** → **Camino** (el Camino
  recomendado, enterrado al fondo).
- **Colisión de CTA:** dos botones verdes idénticos, ambos «Comenzar»
  (`focus.start` y `path.card.start`), sin un único CTA primario.
- **«Camino» sin explicar:** la tarjeta mostraba nombre + tagline + 3 iconos
  diminutos; sin etiqueta, sin decir que es una secuencia guiada, sin duración
  (y en el caso sugerido-simple ni pintaba la etiqueta, `label=null`).
- **Foco vs Camino** indistinguibles; el timer mostraba «FOCO» (modo), no
  «manual».

## Cambios entregados

### Sistema verbal (rompe la colisión «Comenzar»)
- Timer: `focus.start` «Comenzar» → **«Empezar foco»** / «Start» → «Start focus».
- Camino: `path.card.start` «Comenzar» → **«Iniciar camino»** / «Start» → «Start path».
- Biblioteca: `paths.library.viewAll` «Ver todos» → **«Ver caminos»** / «View all» → «Browse paths».
- Actividades ya usan nombre directo (Respira/Estira/Mueve/Hidrátate).
- Cada verbo indica la CONSECUENCIA; ES y EN misma intención. Paridad ES+EN.

### «Foco manual» DENTRO del círculo (decisión del usuario)
- La primera iteración añadió un kicker «FOCO MANUAL» como línea suelta sobre el
  timer. El usuario lo rechazó: robaba altura al aro y era redundante con el
  «FOCO» del círculo. Solución final: el rótulo DENTRO del círculo pasa a
  **«FOCO MANUAL»** (`modeLabel = t('focus.manual.label')` solo en modo foco;
  Pausa/Larga sin cambio) y se elimina la línea suelta → el aro conserva su
  tamaño de siempre («sol amaneciendo», 70-80% del círculo). Nueva clave i18n
  `focus.manual.label` ES+EN.

### Tarjeta de Camino: compacta + se explica sola
- Se conserva el diseño **original compacto** con los **iconos** de paso pequeños
  (petición del usuario: iconos, no un word-sequence completo) + una línea de TEXTO
  **«Rutina guiada · N pasos»** que explica qué es un Camino y su composición sin
  depender de interpretar iconos (añadida en la auditoría de coherencia, ver abajo).
- **Eyebrow SIEMPRE visible:** «CAMINO SUGERIDO · ~N min» / «CAMINO FAVORITO · ~N
  min» (`paths.suggested.label`/`.favorite` reetiquetadas a «Camino sugerido/favorito»
  / «Suggested/Favorite path»). Da la señal «esto es un Camino» + su duración sin
  abrirlo.
- **Duración aproximada** calculada leyendo el `.min` de cada paso
  (`pathDurationMin`: focus→`step.min`; breathe→`getBreatheRoutine().min`;
  body→`resolveBodyRoutine().routine.min`; hydrate/opcional no suma). Nueva clave
  `paths.suggested.approxMin` «~{n} min». Solo LEE datos ya en window; no toca el
  runner ni los Caminos.
- CTA **«Iniciar camino»** en **contorno** (secundario). El único CTA visualmente
  primario es «Empezar foco» del timer (relleno).

### Jerarquía §1 + solapamiento «sol» (§0, decisión del usuario)
- **Reorden:** Camino POR ENCIMA de Actividades (Timer → Camino → Actividades).
  Actividades quedan como accesos manuales secundarios.
- **Solapamiento editorial «sol amaneciendo»:** la tarjeta sube y tapa el arco
  INFERIOR del círculo hasta rozar los puntos de CICLO, para que el timer se lea
  como un sol saliendo tras la tarjeta y no como un círculo entero.
  - Se hace con `transform: translateY(-118px)` (NO margin): un margen negativo
    libera hueco del flujo y, como el timer es `flex:1`, éste lo reclama y
    RECENTRA el aro hacia abajo (medido: gap CICLO→tarjeta solo bajaba 127→68).
    El transform no toca el flujo → el aro se queda quieto y la tarjeta pinta por
    encima (orden del DOM + `z-index:2`). Se sube también la ActivityBar el mismo
    desplazamiento para que la siga sin abrir hueco.
  - **Gate a alturas ≥760px:** la distancia CICLO→tarjeta es ~130px estable entre
    ~760 y ~1080px (el aro escala con la altura y el hueco lo acompaña), así que
    -118px aterriza 9-19px por debajo del CICLO en ese rango, sin taparlo ni tapar
    el botón. Por debajo de 760px NO se aplica (el aro ya desborda; caso corto
    diferido a §0).

## Verificación (navegador, dev + standalone)

- **Móvil vertical** 360×640 y 390×844 (ES+EN): círculo completo, CTA/CICLO
  libres, tarjeta + actividades debajo, sin colisión.
- **Escritorio** 1280×900 / 1440×900: solapamiento «sol» activo, tarjeta 9-19px
  por debajo del CICLO, botón libre (37-48px), sin tapar controles.
- **EN:** «MANUAL FOCUS» dentro, «Start focus» / «Start path» / «Browse paths» /
  «SUGGESTED PATH · ~12 MIN». Sin `[i18n] missing`.
- Consola limpia. **Standalone v0.65.0** (3209 KB) montado y verificado (FOCO
  MANUAL dentro + Iniciar camino + solapamiento; 0 errores).

## Auditoría de coherencia pre-commit (correcciones)

Tras el resumen, una auditoría de coherencia detectó tres huecos que se corrigieron
CON CÓDIGO antes de cerrar:

1. **Camino explicado en TEXTO, no solo iconos.** «CAMINO SUGERIDO» + iconos no
   explicaba qué es un Camino. Se añade la línea **«Rutina guiada · N pasos»** /
   «Guided routine · N steps» (`paths.suggested.guidedSteps`, N = `steps.length`);
   los iconos quedan como acento visual. Ahora el criterio «comprensible sin
   interpretar iconos» se cumple.
2. **Un único CTA visualmente primario.** Había dos rellenos verdes (timer + Camino).
   El CTA del Camino pasa a **contorno** (secundario); el único primario es «Empezar
   foco» del timer.
3. **Solapamiento «sol» = excepción LIMITADA, no §0 completo.** Se documenta como tal
   en todos los canónicos (diario, STATE, DECISIONES, DESIGN_SYSTEM, memoria,
   CHANGELOG): solapamiento editorial limitado ≥760 px por autorización del usuario;
   el patrón `transform` es PROVISIONAL, no sustituye el diseño de §0 (flujo normal +
   margen negativo controlado + círculo responsive). Además, para no dejar la tarjeta
   pegada bajo el aro grande a poca altura, se añade un **swap de orden** con flex
   `order` en **ancho+corto** (`@media (min-width:700px) and (max-height:759px)`):
   restaura Actividades→Camino como colchón. En portrait estrecho (<700 px) el aro es
   pequeño y la tarjeta puede ir arriba sin colisión.

### Matriz responsive (evidencia, dev, medida con getBoundingClientRect)

| Viewport | Overlap | Orden | Scroll H | Card↔timer | Notas |
|---|---|---|---|---|---|
| 1440×900 | ON | Camino↑ | 0 | ok (45px) | «sol», ES+EN |
| 1280×900 | ON | Camino↑ | 0 | ok (50px) | «sol» |
| 390×844  | ON | Camino↑ | 0 | ok (37px) | «sol», portrait, ES+EN |
| 360×640  | off | Camino↑ | 0 | ok (40px) | aro pequeño, cabe sin swap |
| 1280×600 | off | Activ↑ (swap) | 0 | ok (72px) | timer↔actividades ~48px = §0 preexistente |
| 1024×512 | off | Activ↑ (swap) | 0 | ok (17px) | aro obscurece botón = §0 preexistente |
| 844×390  | off | Activ↑ (swap) | 0 | aro CLIPADO | «caso difícil» §0 (aro no cabe a 390px) |

En todos: sin scroll horizontal, CTA sin truncar (ES+EN, incl. «Start focus»/«Start
path»/«Browse paths»/«Guided routine · 3 steps»), «FOCO MANUAL»/«MANUAL FOCUS» dentro
del círculo, un único CTA primario (timer relleno), tarjeta↔timer sin superposición.
El **timer↔actividades** y el **aro clipado** a alturas muy cortas son el problema
**§0 preexistente** (aro grande fijo sin encoger por altura), NO regresión de s122.

### a11y (verificado)

- **Nombres accesibles**: chips de actividad exponen su texto («Respira ritmo,
  calma», etc.); iconos superiores con `aria-label` (Stats/Logros/Tweaks); reset del
  timer con `aria-label` + `title` (ya existían). Todos son `<button>` nativos →
  Tab/Enter/Space funcionan.
- **Objetivo interactivo**: tarjetas de actividad = botón de ancho completo; foco de
  teclado global `:focus-visible`.
- **Pendiente/menor**: el botón de reset del timer es 28 px (< 44 px táctil); el
  contraste de los meta-labels a 9-11 px en `--ink-3` es sistémico (todo el producto)
  — no introducido por s122; se anota, no se «cierra» como resuelto.

## Diferido (NO ejecutado en s122)

- **§0 short-viewport:** a alturas <720px (laptop corto / móvil apaisado) el aro
  grande fijo + tarjeta no caben sin la geometría responsive de §0 (círculo que
  encoge por altura). Su sesión propia.
- **§7:** pills Tweaks + estabilidad del contenedor de Estadísticas.
- **Scrollbar del runner v1 (hallazgo de s122, NO tocado):** `data-pace-session-center`
  (SessionShell, `overflowY:auto`) DESBORDA ~17px a alturas ≤~660px en pasos v1
  de mucho texto (`perSide` con prefijo de lado + acción 2 líneas + «Cúidate» 2
  líneas; medido en Estira «Cuello · 3 min» paso «Escalenos»: 360×640 → 486>469).
  El glifo v1 escala con la altura (`0.22·vpH`) → el contenido crece con el
  viewport; el runner LEGACY (glifo fijo) NO desborda. Solo «determinados
  ejercicios». **Restricción del usuario:** NO compactar copy/glifos/tipografía,
  NO ocultar el overflow — solución de layout responsive real en una sesión corta
  propia del runner (MoveSessionV1.support / SessionShell.responsive), verificando
  ready/timed/reps/perSide/descansos/DONE en 360×640, 390×660, 412×667, ES/EN.
  Chip de tarea creado.

## Archivos tocados

- `app/i18n/strings/sessions.js` — `focus.start` + `focus.manual.label` (ES+EN).
- `app/i18n/strings/paths.js` — `path.card.start`, `paths.library.viewAll`,
  `paths.suggested.label`/`.favorite`, `paths.suggested.approxMin` (ES+EN).
- `app/focus/FocusTimer.jsx` — `modeLabel` foco → «Foco manual».
- `app/main.jsx` — reorden Camino ↑ Actividades.
- `app/paths/SuggestedPathCard.jsx` — eyebrow+duración+iconos+CTA+solapamiento CSS.
- Bump v0.65.0: `app/state-core.jsx`, `PACE.html`, `sw.js` + build
  (`PACE_standalone.html`, `index.html`).
