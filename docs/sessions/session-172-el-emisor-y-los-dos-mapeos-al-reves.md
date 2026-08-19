# s172 · EL EMISOR, Y DOS MAPEOS QUE ESTABAN AL REVÉS

**v0.102.0** · `npm run verify` PASA · `npm run test:e2e` **115/115** (eran 105)
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

### Dos decisiones que el esquema no cerraba

- **`routineId` de Foco** = `focus.<minutos>`. §8 lo exige y un bloque de foco no
  tiene rutina. No es invento: es lo que ya asumían los helpers de s155.
- **`plannedSeconds` de Respira sin rondas** = `routine.min × 60`, `declared`.
  §6.4 sólo contempla la fila de rondas; el motor termina cuando el **tiempo
  activo** alcanza ese número, así que es un plan conocido antes de empezar, no
  una estimación. La alternativa literal era `null` y perdía **17 de 20**
  rutinas. **Anotada como desviación consciente de la letra.**

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

## 4 · La causa de los 25 px que quedaban NO era la que estaba escrita

El comentario del trinquete de `runner-circulo.spec.js` decía que la deriva
residual la causa el gate «ready» por no pintar contador. **Es el FOOTER.**

Medido con el árbol delante, a 390×844:

| | Trabajo | Descanso |
|---|---|---|
| `session-footer` | **89 px** (2 filas de controles) | **39 px** (1 fila) |
| `session-center` | 672 | **722** |
| bloque (`min-height` 70vh) | 591 | 591 |
| **círculo `top`** | **69** | **94** |

El footer pierde 50 px, el centro crece esos 50, y como el bloque va **centrado**
dentro de él baja la mitad: **25**. El párrafo del test queda corregido; la deuda
sigue asertada con el mismo tope de 30 porque arreglarla —reservar el footer o
alinear el bloque arriba— es una **decisión visual**, no un descuido.

> **El verde de esa suite no decía nada de la pantalla de descanso**: su recorrido
> avanza a clicks y un descanso **termina solo**, así que nunca aterrizaba en uno.
> Por eso el test nuevo va aparte y llega a propósito con «Terminar antes».

---

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
