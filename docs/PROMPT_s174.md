# PROMPT · s174 — implementar el rediseño de las librerías

> Pegar tal cual al abrir la sesión nueva.

---

Arrancamos s174 de PACE. Sigue el protocolo de arranque de `CLAUDE.md` y confírmame el
estado antes de tocar nada.

**Contexto.** s173 cerró en **v0.103.0**, commiteado y pusheado. `npm run verify` PASA y
`npm run test:e2e` da **115/115**. Lo que entregó: la ingesta de glifos de ejercicio deja
de ser todo-o-nada (`--fusionar`), entran 4 dibujos (**59 de 62**, cola de 7 a 3), y nace
`scripts/verify.mascaras.js` con las primeras comprobaciones relacionales del arte de
ejercicio. Antes de tocar nada de glifos o del `verify`, lee las **dos filas de s173** en
`docs/product/DECISIONES_TECNICAS_VIGENTES.md`.

**Lo que viene ahora es implementar el rediseño de las tres librerías** (Respira, Mueve,
Estira), que en s173 quedó **aprobado mirándolo y sin una línea de código**. Todo lo
decidido —con sus medidas y el porqué de cada decisión— está en
`docs/product/LIBRERIAS_REDISENO.md`. **Léelo entero**: trae medido lo que no hay que
volver a medir.

## Antes de escribir código, hazme las preguntas

`LIBRERIAS_REDISENO.md` §8 lista lo que quedó **abierto**, y son decisiones mías, no tuyas.
Implementar con eso sin cerrar obliga a rehacer. Así que **primero pregúntame**, con tus
opciones y tu recomendación para cada una:

1. **La regla de «Para ahora».** Hoy son dos ids escritos a mano. ¿Elige por hora del día,
   por lo que no he hecho hoy, o por lo más corto que cabe en mi contexto?
2. **Las 12 rutinas premium**: ¿mezcladas con su sello, o agrupadas aparte?
3. **Respira**: ¿entra en esta tanda o espera? Su pantalla está esbozada pero no cerrada, y
   sus **14 patrones de respiración** pedirían **14 glifos de ritmo** — otro encargo de arte.
4. **Las tres ideas propuestas y sin respuesta**: el **glifo como filtro** (tocar un dibujo
   filtra las rutinas que lo llevan), **la transición biblioteca→sesión** (la capitular crece
   hasta el círculo del runner) y **«ya la hiciste»** (marca tenue en las de esta semana).
5. **El orden dentro de cada grupo** (hoy es orden de catálogo, que no es un orden) y **el
   estado vacío**, que va a existir: 9 de las 14 de Estira piden suelo.

## Cómo quiero que trabajes

- **Auditoría antes de tocar.** Los archivos son `MoveModule.jsx`, `ExtraModule.jsx`,
  `BreatheLibrary.jsx`, `CustomRoutines.jsx` y `Primitives.jsx`. Ojo: `BreatheLibrary` usa
  `Card` con `accent`, y ese patrón **gobierna** — el color de módulo va en el **hover**, no
  en el reposo. Y **no hay estado de filtro en ninguna librería**: hay que decidir dónde vive.
- **Maqueta HTML antes de implementar.** Es regla de continuidad, no una excepción de s173:
  el diseño se aprueba **viéndolo**, con los viewports reales (**360×730**, **412×844**,
  **1280**), el contenido REAL del catálogo y los tokens de `DESIGN_SYSTEM.md`. Si hay más de
  una dirección posible, ponlas **una al lado de otra** para elegir mirando.
- **No implementes la opción más sencilla si no es la más profesional, bonita y útil.**
- **Verificación medida en cada bloque**: `npm run verify` + `npm run test:e2e`, y **cada
  aserto nuevo se pone ROJO a propósito** antes de darlo por bueno.
- Cuando algo que yo dé por sabido no cuadre con lo que midas, **dímelo con el número
  delante**. En s173 pasó cuatro veces y las cuatro eran defectos reales.

## Lo que NO se tocó y sigue vivo

- **La retención por calendario de `pace.events.v1`** (120 d, §12). Las tres piezas están
  implementadas y el punto de extensión declarado; falta **programarla**. Tiene una pregunta
  de diseño sin responder: la poda es asíncrona bajo lock y `rolloverIfNeeded` es síncrono,
  así que o va **disparada-y-olvidada desde el rollover**, o **en el arranque tras
  `loadState`**. Las dos cumplen «sin segundo reloj»; la segunda es más fácil de probar.
  Ojo: `tests/retencion.spec.js` **ya existe y es de otra retención** (la apnea de Respira).
- **`Puente torácico` a tamaño real** y las **18 piezas de la 2ª tanda**, que nadie ha mirado.
- **`descanso.png`**: cuando lo dibuje, **no entrará por la ingesta** — `Descanso` está
  excluido a mano del censo. Hay que decidir antes si pasa a ser la identidad nº 63.
- El color de «La jornada», el equinoccio de otoño, los 19 glifos de logro y el tirón del arco.
