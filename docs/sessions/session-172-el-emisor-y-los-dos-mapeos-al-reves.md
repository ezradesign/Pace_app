# s172 · EL EMISOR, Y DOS MAPEOS QUE ESTABAN AL REVÉS

**v0.102.2** · `npm run verify` PASA · `npm run test:e2e` **115/115** (eran 105)
· `PACE_standalone.html` intacto en v0.71.0.

> La sesión abrió con el árbol de s171 **sin commitear** y con tres bloques
> pedidos: cerrar s171, el emisor de la Fase 3 y dos prompts de arte. Los tres
> están hechos. Lo que no estaba en el plan es que **dos de las tres cosas que
> el handoff daba por sabidas eran falsas**, y las dos se cazaron midiendo.

---

## 1 · Lo de s171, commiteado y destilado

Dos commits: el árbol tal cual con el mensaje que traía el handoff, y la
destilación de la segunda mitad al diario de s171, `CHANGELOG` y `STATE`.

Tres cosas salieron al hacerlo:

- **`MoveSessionV1.support.jsx` llevaba el comentario `s171b` DUPLICADO**, uno
  de ellos **huérfano** (sin reglas detrás) y repitiendo al otro. Se fundió la
  única frase que aportaba —que la causa no era la línea «Empiezas por» sino la
  **ausencia del contador**— y se borró el duplicado.
- **Dos documentos GENERADOS se quedaron mintiendo tras la tanda de arte.**
  `GLIFOS_EJERCICIOS_PENDIENTES.md` decía «47 con arte · 14 pendientes» cuando ya
  eran **57 · 4**; se regeneró con su script. `GLIFOS_ESTIRA_PENDIENTES.md`, de
  s170, **no tiene generador en el repo** y de sus 11 sólo siguen sin arte `Onda
  espinal` y `Rana`: lleva aviso de CADUCADO en cabecera. **Nada vigila estos
  dos** — `verify.encargo.js` sólo mira el encargo de logros.
- El «queda propuesto, no hecho» del aire bajo el cue **ya no era cierto**: el
  prerrequisito que nombraba (que el bloque declare alto mínimo) lo hizo la
  segunda mitad de s171. Corregido donde lo decía.

---

## 2 · El emisor de `pace.events.v1` — PASO 2 de la Fase 3

Los cuatro tipos emiten: `session.completed` en los cuatro módulos,
`feedback.answered`, `path.step.completed` y `path.completed`. **Dual-write**: la
escritura legacy sigue mandando (stats, logros, rachas) y el evento se añade al
lado; si el evento falla, no se cae nada.

### Dónde vive el emisor lo decide el CHECKER, no el gusto

`app/state-events.jsx`, en la capa de estado y **fuera de `app/events/`**. No es
donde cayó: `verify.eventos.js` §5 define «emisor» como una llamada a
`paceEventsAppend` **fuera del subsistema**, y con eso exige que el backup
público lleve la sección de eventos —la promesa de `privacy.html`—. Escondiendo
la llamada dentro de `app/events/`, el gate habría seguido diciendo «sin
emisores» **con emisores puestos**: un verde que no mira nada. El verify ya lo
confirma en la otra rama: *«hay emisores (app/state-events.jsx) y el export de
"Tus datos" incluye la sección»*.

### EL MAPEO DE `kind:'body'` DEL HANDOFF ESTABA AL REVÉS EN LOS CINCO CASOS

El plan heredado decía: «mapear `'body'` → `move` si el `routineId` empieza por
`move.`, `stretch` si empieza por `extra.`». Los cinco pasos de cuerpo que
existen en el catálogo de Caminos dicen lo contrario:

| `routineId` del paso | Dice el prefijo | Dice el catálogo |
|---|---|---|
| `move.neck.3` | move | **stretch** (`EXTRA_ROUTINES`) |
| `move.hips.5` | move | **stretch** |
| `move.atg.knees` | move | **stretch** |
| `move.chair.antidote` | move | **stretch** |
| `extra.desk.pushups` | stretch | **move** (`MOVE_ROUTINES`) |

**Cinco de cinco.** Los ids son históricos: s15 movió rutinas de un módulo al
otro y los conservó como identificadores estables, así que **no dicen de qué
módulo son**. Quien lo sabe es `resolveBodyRoutine()`, el mismo resolutor que
`PathBodyStep` usa para elegir runner. Con la regla del prefijo los eventos
habrían salido con el módulo cambiado **sin romper nada**: ni un error en
consola, ni un test rojo, y el dato envenenado para siempre.

### Dos decisiones que el esquema no cerraba — y que al final SE ESCRIBEN en él

Se tomaron para poder emitir, anotadas como desviaciones conscientes; el usuario
las revisó con las dos opciones delante y **acabaron en el esquema (rev. 6)**, así
que dejan de ser notas que alguien pueda leer dentro de tres sesiones como si
fueran la regla.

- **`routineId` de Foco = `focus`**, una sola identidad para el módulo. §8 lo
  exige y un bloque de foco no tiene catálogo detrás. Se descartó
  `focus.<minutos>` por dos hechos medidos: **la duración ya viaja en
  `plannedSeconds`** —duplicarla obliga además a sumar cuatro cubos para «total de
  foco»— y **los cuatro cubos no tenían consumidor**, porque el que agrupa por
  `routineId` es «qué te ayuda», que se alimenta del feedback, y **en Foco no se
  pide feedback nunca**. Comparar 25 contra 45 sigue saliendo de `plannedSeconds`,
  que es lo que hace la decisión reversible en las dos direcciones.
- **`plannedSeconds` de Respira sin rondas = `routine.min × 60`, `declared`.** La
  fila de §6.4 hablaba sólo de rondas, que son **3 de 20**; las otras 17 terminan
  cuando el **tiempo activo** alcanza ese número, o sea que es el plan real y no
  una estimación. Emitir `null` habría tirado un dato exacto **sin poder
  recuperarlo después**, y `plannedSecondsSource` ya permite ignorarlo a quien
  sólo se fíe de planes derivados. §6.4 pasa a separar las tres familias y a decir
  el límite de las rondas: allí la retención la suelta el usuario, así que su plan
  queda por debajo del activo real.

### El `runId` sin tocar los runners

§7.1 exige que `session.completed` y su `feedback.answered` compartan `runId`, y
§7.2 dice que no hace falta persistirlo. Así que se genera **al emitir** y se
recuerda en memoria; el feedback correlaciona **sólo si su rutina es la de esa
sesión**. Antes que inventar una correlación, se pierde el evento. Coste en los
runners: **cero líneas**.

### La red: 7 tests, 10 mutaciones

`tests/eventos-emisor.spec.js`. Incluye el **censo relacional** del mapeo contra
el catálogo entero **con prueba negativa**: si algún día ningún id contradice su
prefijo, el test avisa de que ya no distingue las dos reglas.

| Mutación | Cae |
|---|---|
| el prefijo en vez del catálogo | mapeo · Camino |
| feedback sin correlación | feedback de otra rutina |
| `activeSeconds = elapsedSeconds` | sesión de cuerpo |
| `pathRunId` leído tras el avance | Camino |
| emisor inerte | 3 tests |
| plan `declared` en el v1 | sesión de cuerpo |
| emitir al empezar | sesión de cuerpo |
| salir acredita | «Salir» no emite |
| plan de Respira a `null` | Respira · early |
| «Finalizar» no marca early | early |

**Una mentira del instrumento**: el primer aserto del Camino comparaba el
**orden de llegada** de los eventos y salió rojo con razón — el almacén guarda en
el orden canónico de §11 (instante, y a igual instante desempata por `id`, que es
aleatorio) y el test dispara los tres pasos en el **mismo milisegundo**. Se
ordena por `stepIndex`; en uso real los pasos van separados por minutos.

### Lo que queda vivo

La **retención por calendario** (120 d, §12) sigue implementada y sin programar.
Su nota en el `NO_CUBRE` decía «sin emisores no hay nada que podar» — premisa que
**acaba de caducar**. Reescrita: hoy lo único que acota el contenedor es la poda
por **presupuesto**, que sólo salta ante un error de almacenamiento.

---

## 3 · Los dos prompts de arte eran la MISMA pieza

Se pidieron dos glifos, `Descanso` y `Respira`. Medido: las **12** apariciones de
«Respira.» en los catálogos —8 como `instruction.action`, 4 como `cue`— son
**todas** de un paso llamado `Descanso`. No existe ninguna otra identidad con ese
nombre; la que se le parece, `Reset respiración` (alias de «Respiraciones
profundas»), **ya tiene arte ingestada**.

### Y «no tiene círculo» no era que faltara el dibujo

Censo de los **66** nombres de paso distintos de las dos familias (Estira **no se
publica en `window`**: sus nombres salen del fuente, y por mirar sólo Mueve el
primer censo dijo «1 sin dibujo» donde hay 3):

| | Cuántos | Cuáles |
|---|---|---|
| Sin ningún dibujo (`DefaultGlyph`) | 3 | `Pica en escritorio` · `Onda espinal` · `Rana` |
| Con SVG viejo, sin arte anatómico | 2 | **`Descanso` (×18)** · `Puente isquio a una pierna` |

`Descanso` **sí tenía glifo**; lo que pasaba es que **el runner v1 no lo
pintaba**: el glifo iba dentro de un `{!isRest && …}`. En el paso más repetido de
la app el círculo no es que se moviera — **desaparecía**, que es la versión
extrema del defecto al que s171 dedicó la sesión entera. En el runner legacy sí
se veía, porque sus pasos de descanso no declaran `mode`.

**Arreglado**: el descanso pinta su círculo, y R5 de s113 («el descanso es el
paso apagado») se respeta **por color y no por ausencia** — `stepAccent` ya vale
`--ink-3` y `stepAccentSoft` `--paper-3`. Medido a 390×844: mismo tamaño que el
del trabajo (186 px) y 0 px de desborde en los tres viewports de la suite.

El prompt quedó escrito en `GLIFOS_ENCARGO_TANDA.md` §4, en el estilo del set
anatómico —no en el pictograma del encargo original— y avisando de que `Reset
respiración` ya ocupa los «dos arcos en el pecho».

---

## 4 · El círculo: dos diagnósticos cortos y el que sí era

**Tres sesiones seguidas apuntando al sitio equivocado**, y el usuario viéndolo igual
en su portátil y en su teléfono todo el rato.

- **s171** dijo: lo causa el gate «ready», que no pinta contador.
- **s172** midió el footer y dijo: es el footer (89 → 39 px al pasar de dos filas de
  controles a una; el centro crece 50 y el bloque, centrado, baja la mitad). Cierto,
  **pero sólo para el caso descanso ↔ trabajo**.
- **s172b**, con las capturas del usuario delante, midió los viewports y encontró lo
  que faltaba: **el anclaje de s171 era un ACANTILADO**.

| viewport | `min-height` | salto |
|---|---|---|
| 1280×900 | 648px | 0 px |
| 1280×880 | 633px | 3 px |
| **1280×879** | **auto** | **61 px** |
| 390×844 | 591px | 0 px |
| 390×780 | 546px | 0 px |
| **360×730** (su móvil) | **auto** | **53 px** |
| 360×640 | auto | 53 px |

**Sus dos pantallas caen justo por debajo de los suelos** (780 móvil / 880 escritorio),
así que el anclaje que las dos sesiones anteriores dieron por bueno **no se aplicaba ni
una vez en sus dispositivos**.

### La causa está un nivel más arriba de donde se buscó

`centerBody` centra con `margin:auto` (s112) un bloque **cuya altura varía con el
contenido**. El centrado reparte una holgura distinta en cada pantalla y el círculo baja
la mitad de esa diferencia. El footer es **una** fuente de variación; el contenido es la
otra (la pantalla de colocarse no pinta contador). Y ningún `min-height` del bloque puede
arreglarlo por debajo del suelo, porque ahí el bloque ya no llega a ese alto.

**Arreglo**: anular el margen superior y conservar el inferior, así que la holgura cae
debajo —donde s171 la quería—. Acotado al runner v1 con `:has()`, y con `!important`
porque **el margen es un estilo EN LÍNEA**: sin él la regla se aplica, no falla, y no
cambia nada. Medido: **0 px en los 8 viewports**.

Y los **3 px que aún movían el nombre**: la reserva del rótulo vacío era `1.2em` y el
rótulo lleno se pintaba con el interlineado normal de la fuente (~1,45). Se fija
`line-height: 1.2` y las dos formas miden lo mismo **por construcción**, en vez de que
una reserva adivine lo que la otra mide. **El trinquete baja de 30 a 0.**

### Lo que costó, y no fue el diagnóstico

**La trampa de los backticks dentro del template literal del CSS mordió TRES veces en
este mismo cambio** (s139, s156, s157, s158, s162, s171 y ahora), dos de ellas con la
salida del build silenciada: las medidas salían **idénticas** y parecía que el arreglo no
servía. La regla, ya escrita en la cabecera del archivo nuevo: **si una medida no cambia
cuando debería, mirar PRIMERO si el build pasó**.

El CSS del runner salió a `app/move/MoveSessionV1.css.jsx` (211 líneas) porque el support
rebasaba las 500 — trocear, no recortar comentarios.

## 5 · Los 15 por lados: espejo, cero dibujos nuevos

**Sólo 12 de los 15 pueden recibir lado**, y está medido: `90/90`, `Elevación de
talones` y `Sentadilla búlgara` **no tienen ni un paso `mode:'perSide'`** en
ningún catálogo (su lado vive en el *cue*), así que el runner no tiene lado que
pasarles — un segundo dibujo suyo no se vería nunca. Eso es trabajo de contenido,
no de arte.

Para los 12, el segundo lado es **`scaleX(-1)`** sobre la pieza: los 15 son
espejo puro (§3 del encargo) y el set comparte convención —«perfil mirando a la
derecha» (§1)—, así que **una decisión global** (el dibujo tal cual es
«Izquierda») sustituye a 15 encargos. Funciona igual sobre los 41 SVG que aún no
tienen máscara, así que los pasos por lados se ven bien **antes** de que llegue su
arte.

**Lo que el espejo no da, dicho por escrito**: en una figura de perfil,
izquierda y derecha no son legibles en el dibujo. Garantiza que **cambia** y que
es coherente con el set, no que un fisio lo firme — y un duplicado dibujado
tampoco lo daría: el límite es la vista de perfil, no el número de piezas.

La decisión se tomó **mirando**: se generó una hoja con las 12 piezas y su espejo
al lado, al tamaño real del runner (179 px), ordenadas por **cuánto se nota el
espejo**. Ese número también mintió a la primera: comparar una línea de 1–2 px
con su reflejo mide **desplazamiento**, no lateralidad, y las 12 puntuaban igual
de altas (1,4–1,9) mientras el ojo veía dos idénticas. Con desenfoque de
tolerancia el orden ya coincide con lo que se ve: de **0,43** (sólo gira la
cabeza) a **1,60** (voltea el cuerpo entero).

`tests/glifos-por-lado.spec.js`: 2 tests, **4 mutaciones**, todas muerden.

---

## 6 · Verificación

`npm run verify` PASA (0 problemas) · `npm run test:e2e` **115/115** (eran 105)
sobre el `index.html` regenerado · `PACE_standalone.html` intacto en v0.71.0.

## 7 · NO cubierto

- **La retención por calendario**, sin programar (arriba).
- **Los 25 px del footer**: diagnosticados y asertados, no arreglados. Las dos
  salidas son decisiones visuales.
- **`path.step.completed` va sin `runId`**: §7.1 lo declara opcional y la
  correlación Camino↔sesión viaja por `pathRunId`. Enhebrar el id del paso
  exigiría tocar los cuatro steps.
- **Ni un píxel comparado**: el descanso y el espejo se miraron en captura, no
  con un comparador. Y **el arte de `Descanso` sigue sin dibujar** — hoy se ve el
  SVG viejo dentro del círculo nuevo.
- **`Puente torácico`** entró con silla en s171 y **sigue sin mirarse a tamaño
  real**.
- **Tres archivos rozan las 500 líneas** (`BreatheSession.jsx` 500,
  `MoveSessionV1.jsx` 500, `MoveSessionV1.support.jsx` 499): lo siguiente que
  entre ahí **obliga a trocear**, y esta sesión ya pagó ese peaje dos veces.
