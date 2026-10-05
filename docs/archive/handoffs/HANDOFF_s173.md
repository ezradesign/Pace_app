# HANDOFF · s173

**Punto de partida limpio.** Versión **v0.102.2** en los 7 sitios · `npm run verify`
PASA · `npm run test:e2e` **115/115** · `PACE_standalone.html` intacto en v0.71.0 ·
**árbol commiteado y pusheado**.

> El ESTADO vive en [`STATE.md`](../STATE.md). Esto es el **plan de trabajo**: lo que
> ya está medido para no volver a medirlo, y las trampas que costaron tiempo.
> Si los dos se contradicen, gana `STATE.md`.

---

## 0 · Lo que s172 dejó CERRADO y no hay que volver a mirar

- **El emisor de `pace.events.v1`** (PASO 2 de la Fase 3 / Fase 2 del esquema). Los
  cuatro tipos emiten en dual-write. El gate del verify lo confirma en su otra rama.
- **Los 15 glifos por lados**: entran por **espejo**, no por dibujo. Cableado y con
  test.
- **El círculo del paso de descanso**, que no se pintaba.
- **La deriva del círculo del runner**, cerrada en s172b: 0 px en 8 viewports.
- **La documentación de s171**, destilada, y sus dos generados que mentían.

---

## 1 · Lo primero: LA RETENCIÓN, que ya no tiene excusa

Hasta s172 la nota del `NO_CUBRE` decía «sin emisores no hay nada que podar». **Ya hay
emisores y el contenedor crece.** Lo único que lo acota hoy es la poda por
**PRESUPUESTO**, y ésa **sólo salta ante un error de almacenamiento** — no es una
política, es un airbag.

Lo que hace falta (§12 del esquema, y las tres piezas **ya están implementadas**):
`selectEventsToPrune` + `foldEventsIntoBaseline` + `nextPruneCursor`, enganchadas al
**rollover diario** y **sin un segundo reloj**. El punto de extensión está **declarado
por escrito** en `app/events/events-adapter-web.js`, justo al lado de
`eventsWebPruneForBudget`.

**Ojo con el orden**: podar consolida en el `baseline`, así que un fallo a medias no
puede dejar el contenedor sin los eventos Y sin el agregado. Todo dentro del lock
exclusivo, como la poda por presupuesto.

---

## 2 · El arte que falta · 7 piezas, cola autocontenida

**[`docs/product/GLIFOS_A_DIBUJAR.md`](product/GLIFOS_A_DIBUJAR.md) es la cola viva** y
no hace falta abrir nada más para generar: lleva dentro el preámbulo de estilo, las
cuatro reglas del pipeline y una ficha por pieza con **el cue que el usuario lee en
pantalla**. `GLIFOS_ENCARGO_TANDA.md` queda como el histórico de las tres tandas.

| # | Pieza | ¿Dónde sale? | Hoy se ve como |
|---|---|---|---|
| 1 | `descanso.png` | **18 pasos** en 10 rutinas | dos barras de reproductor |
| 2 | `fondos-en-silla.png` | 3 pasos | grabado **sin silla** = otro ejercicio |
| 3 | `pica-en-escritorio.png` | 1 | glifo por defecto |
| 4 | `onda-espinal.png` | 1 | glifo por defecto |
| 5 | `rana.png` | 1 | glifo por defecto |
| 6 | `puente-isquio-a-una-pierna.png` | 1 | SVG viejo |
| 7 | `deslizamientos-en-pared.png` | 1 | grabado, pared no legible |

**Si sólo entra una, la 1.** `Descanso` se ve más que cualquier ejercicio del set; las
otras seis suman 8 apariciones entre todas. **`Nordics` NO está en la cola**: no
aparece en ninguna rutina del catálogo —sólo en el registro del constructor— y ya
tiene SVG, así que no cae al glifo por defecto.

### El estilo no se reinventa: está en producción

Las convenciones salen de **mirar las 57 piezas**, no de un documento: **pared** =
línea vertical pegada al cuerpo · **suelo** = horizontal corta bajo los pies ·
**silla/mesa** = una recta a la altura del apoyo · **movimiento** = línea **de puntos**
con punta de flecha. Con eso, **§1 de `GLIFOS_EJERCICIOS_REDISENO.md` está SUPERADO**:
pedía pictograma de trazo grueso y lo que hay es grabado anatómico con rayado fino.

### Dos cosas que sólo puede cerrar el usuario

- **La vista de `Rana`**: su gesto se ve desde atrás o arriba y sería la única pieza
  del set fuera de perfil/frontal. Las dos salidas están en su ficha.
- **Mirar a tamaño real las 18 piezas de la 2ª tanda.** La revisión una a una se hizo
  sobre las **47 primeras**; las 18 que entraron después se asignaron pero **nadie las
  ha mirado**, así que la lista de «hay que rehacer» puede tener alguna más escondida.
  El detector que funciona es la pieza a 700 px con su encargo al lado. **`Puente
  torácico`** sigue esperando esa mirada desde s171.

### Trampas de la ingesta, todas pagadas ya

- **La ingesta reescribe el mapa ENTERO**: la carpeta de origen tiene que llevar **las
  57 que ya están**, o se borran. Los viejos se recuperaron en s171 **emparejando por
  CONTENIDO** (firma de tinta → 32×32 → correlación, peor pareja 0,849); ese script
  quedó en el scratchpad y **hay que reescribirlo o moverlo a `scripts/glifos/`**.
- **Tras cada tanda hay que re-correr `generar-pendientes.js`** y subir a mano el censo
  `precache` de `verify.integridad.js` (**dos filas por pieza**).
- Las tablas editoriales del encargo van a **CUATRO columnas** o el generador se las
  come; las que describen piezas van a **TRES**, que es lo que él captura.

---

## 3 · El círculo del runner — CERRADO, y el trinquete está en 0

Ya no hay nada que decidir aquí. Lo que se movía no era el gate «ready» (s171) ni sólo el
footer (s172): era que **`centerBody` centra con `margin:auto` un bloque cuya altura varía
con el contenido**, y el anclaje en vh de s171 era un **acantilado** que se apagaba entero
un píxel por debajo de sus suelos — justo donde caían los dos dispositivos del usuario.

Arreglado alineando el bloque arriba (`margin-top: 0 !important`, acotado con `:has()`).
**0 px de deriva en 8 viewports**, y el trinquete de `runner-circulo.spec.js` está en
**0**: si vuelve a moverse un píxel, salta.

Dos cosas que conviene no deshacer:

- **El `!important` no es pereza**: el margen viene como estilo EN LÍNEA desde s112.
- **No tocar `margin:auto` en `SessionShell`**: alinea arriba cuando el contenido
  desborda, y eso evita que un `justify-content:center` recorte el principio en pantallas
  cortas.

## 4 · Las dos decisiones del emisor — DECIDIDAS y escritas en el esquema

Ya no hay nada que revisar. El usuario las decidió con las dos opciones delante y
**están escritas en `EVENTOS_SCHEMA.md` (rev. 6)**, así que código y documento dicen lo
mismo:

- **Foco emite `focus`**, una sola identidad para el módulo. La duración vive sólo en
  `plannedSeconds`. Se descartó `focus.<minutos>` porque sus cuatro cubos no tienen
  consumidor: el que agrupa por `routineId` es «qué te ayuda», y **en Foco no se pide
  feedback**.
- **Respira sin rondas mantiene `routine.min × 60`, `declared`** — es el número contra
  el que corre el motor, no una estimación. §6.4 gana la fila que le faltaba, con las
  tres familias separadas y el límite de las rondas dicho por escrito.

**Lo que esto deja libre**: la Fase 2 del plan del esquema (§25) queda **CERRADA**. Lo
siguiente del subsistema es la retención (§1 de este documento).

---

## 5 · Trampas medidas en s172 (no volver a pagarlas)

- **`EXTRA_ROUTINES` no se publica en `window`.** Un censo de pasos que sólo mire
  `MOVE_ROUTINES` dice «1 sin dibujo» donde hay 3. Los nombres de Estira salen del
  fuente.
- **Los ids de rutina son históricos y NO dicen de qué módulo son.** `move.*` puede ser
  Estira y `extra.*` puede ser Mueve — en los cinco casos que existen, el prefijo dice lo
  contrario que el catálogo. Preguntar siempre a `resolveBodyRoutine()`.
- **El almacén de eventos ordena por instante y desempata por `id` ALEATORIO** (§11). Un
  test que dispare varios eventos en el mismo milisegundo **no puede asertar el orden de
  llegada**; se ordena por el campo del payload.
- **`paceEventsAppend` devuelve una PROMESA.** Esperar al evento con `waitForFunction`,
  nunca con un `waitForTimeout`.
- **El recorrido de `runner-circulo.spec.js` nunca aterriza en un descanso**: avanza a
  clicks y un descanso termina solo. Para medir esa pantalla hay que llegar a propósito
  con «Terminar antes» y el reloj virtual.
- **Comparar una línea fina con su espejo mide DESPLAZAMIENTO, no lateralidad.** Sin
  desenfoque de tolerancia, las 12 piezas puntúan igual de asimétricas mientras el ojo ve
  dos idénticas.
- **NI UN BACKTICK dentro del template literal del CSS del runner.** Es la trampa que
  más ha vuelto (s139, s156, s157, s158, s162, s171 y **tres veces seguidas en s172b**):
  el build **ABORTA**, y si la salida está silenciada las medidas siguientes corren
  contra el artefacto viejo y salen **idénticas**. Regla: **si una medida no cambia
  cuando debería, mirar PRIMERO si el build pasó.** Está escrito en la cabecera de
  `app/move/MoveSessionV1.css.jsx`.
- **Dos archivos están clavados en 500 líneas**: `BreatheSession.jsx` y
  `MoveSessionV1.jsx`. **Lo siguiente que entre ahí obliga a trocear** — s172 pagó ese
  peaje tres veces, y la regla dice trocear, no recortar comentarios. El CSS del runner
  ya salió a `MoveSessionV1.css.jsx` por eso.
- **SI UN CENSO CUADRA CON OTRO, NO SON DOS FUENTES.** El de glifos decía 61
  identidades y son 62: el patrón de `identidadesVisuales()` sacaba los nombres con
  `/name: '...', mode:/` —el contrato del runner v1— y **los pasos LEGACY declaran
  `dur:`**. No saltó nada porque 61 coincidía con el censo de s164, que arrastraba el
  **mismo punto ciego**. Arreglado en s172, pero la lección se queda: dos fuentes de
  acuerdo pueden ser el mismo error dos veces.
- **El emisor no se mueve de `app/state-events.jsx`.** Si se mete dentro de
  `app/events/`, el gate del verify vuelve a decir «sin emisores» **con emisores
  puestos**.

---

## 6 · Lo demás que sigue vivo

El **color de «La jornada»** · el **equinoccio de otoño** · los **19 glifos de logro** ·
el **tirón del arco** (espera el banco de cuatro aros en el teléfono del usuario) · **D3**
(sidebar con racha y récord) · **Wrangler** y **proteger `main`** · la decisión **A vs B**
del tamaño de glifo (hoy el +50 % lo llevan sólo los anatómicos).

Y **nada vigila `GLIFOS_EJERCICIOS_PENDIENTES.md` ni `GLIFOS_ESTIRA_PENDIENTES.md`**:
`verify.encargo.js` sólo mira el encargo de logros. Si se quiere cerrar ese hueco, la
comprobación es **relacional** (la cabecera del generado ↔ el mapa de máscaras real) y va
al `verify`, no al YAML del CI.
