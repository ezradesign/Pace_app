# HANDOFF · s173

**Punto de partida limpio.** Versión **v0.102.1** en los 7 sitios · `npm run verify`
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

## 2 · El arte que falta, con su cola ya escrita

`docs/product/GLIFOS_ENCARGO_TANDA.md` es la cola viva. **57 de 61 identidades con
arte**; faltan:

| | Piezas |
|---|---|
| Sin dibujo | `Pica en escritorio` · `Nordics` · `Onda espinal` · `Rana` |
| Con el mueble por rehacer | `Fondos en silla` · `Deslizamientos en pared` |
| La 62ª, con prompt YA escrito (§4) | **`Descanso`** |

**`Descanso` es el que más se ve de toda la app**: 18 apariciones, y hoy enseña dos
barras de reproductor dentro del círculo nuevo. Su prompt está en §4 del encargo, en el
estilo del set anatómico y avisando de que `Reset respiración` ya ocupa los «dos arcos
en el pecho».

**Y ojo con `Puente torácico`**: entró con silla en s171 y **sigue sin mirarse a tamaño
real**. Lleva dos sesiones pedido.

### Trampas de la ingesta, todas pagadas ya

- **La ingesta reescribe el mapa ENTERO**: la carpeta de origen tiene que llevar **las 57
  que ya están**, o se borran. Los viejos se recuperaron en s171 **emparejando por
  CONTENIDO** (firma de tinta → 32×32 → correlación, peor pareja 0,849); ese script
  quedó en el scratchpad y **hay que reescribirlo o moverlo a `scripts/glifos/`**.
- **Tras cada tanda hay que re-correr `generar-pendientes.js`** y subir a mano el censo
  `precache` de `verify.integridad.js` (**dos filas por pieza**). s171 no lo hizo y el
  documento se quedó diciendo «47 · 14» cuando eran «57 · 4».
- Las tablas editoriales del encargo van a **CUATRO columnas** o el generador se las come.

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

## 4 · Dos decisiones del emisor que conviene revisar ANTES de que haya consumidores

Las tomó s172 porque el esquema no las cerraba, y están anotadas como **desviaciones
conscientes**, no como interpretación:

- **`routineId` de Foco = `focus.<minutos>`.** §8 exige `routineId` y un bloque de foco
  no tiene rutina. Coincide con lo que ya asumían los helpers de s155.
- **`plannedSeconds` de Respira sin rondas = `routine.min × 60`, `declared`.** §6.4 sólo
  contempla la fila de rondas. El motor termina cuando el **tiempo activo** alcanza ese
  número, así que es un plan conocido, no una estimación; emitir `null` habría perdido
  **17 de 20** rutinas.

Si alguna no gusta, **cambiarla ahora es barato**: no hay ningún consumidor leyendo el
contenedor todavía.

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
