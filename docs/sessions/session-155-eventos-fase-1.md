# Sesión 155 — LA MEMORIA ES DEL USUARIO, NO NUESTRA

> **v0.87.0 → v0.88.0.** FASE 3 del plan operativo: nace `pace.events.v1`, el
> registro **local** de uso. Fase 1 del esquema de s117 —modelo canónico,
> adaptador web, Web Locks, baseline, export/import/reset, recuperación y
> pruebas multi-pestaña—, **sin un solo emisor**.

---

## 0. Qué entraba, decidido con el usuario antes de tocar nada

El frente se eligió al arrancar: **producto**, no Wrangler. Wrangler es la última
pieza del CI pero queda **inerte** hasta que existan los secretos de la cuenta, y
cerrar una sesión con YAML que nadie ha visto correr contradice la lección de
s153 («simular no es ejecutar»). La Fase 2 (ola B de glifos) y la 2.5 siguen
bloqueadas esperando arte, así que **eventos era lo siguiente real** en el orden
del `ROADMAP`, y es lo único cuyo valor **caduca**: el histórico que no se emite
no se reconstruye.

Tres decisiones más, tomadas con el usuario antes de escribir código:

1. **Alcance = Fase 1 del esquema, tal como la fija §25.** No se rediseña nada:
   el documento está cerrado desde s117 y APTO. Sin emisores, porque §25 prohíbe
   emitir antes de que el adaptador esté en `READ_WRITE`.
2. **El backup público NO cambia en s155.** Se implementa y prueba el contrato
   entero (`exportSnapshot` · `validateImport` · `replaceFromImport` · `reset`),
   pero el JSON de «Tus datos» no gana sección de eventos: hoy el contenedor
   está vacío y sería superficie sin dato.
3. **Sí entra lo imprescindible del import**: reiniciar el contenedor, porque sin
   eso un backup importado convive con un baseline capturado del estado
   *anterior*.

A mitad de arranque el usuario añadió **condiciones de privacidad** explícitas
(local-first estricto, minimización, control y transparencia, retención,
integridad, red de seguridad) y pidió parar si aparecía una contradicción con lo
que ya está escrito. **Aparecieron dos**, y son la sección 1.

---

## 1. Dos contradicciones, las dos con una página PÚBLICA

No estaban en el diseño ni en el código nuevo: las crea **el simple hecho de que
exista una segunda clave de almacenamiento**.

| Dónde | Qué prometía | Qué pasaba al añadir `pace.events.v1` |
|---|---|---|
| `privacy.html` ↔ `TweaksPanel.jsx:400` | «Puedes borrarlo todo desde Ajustes (reset)… el borrado es inmediato y **definitivo**» | El reset hacía `removeItem('pace.state.v2')` **y nada más** ⇒ el contenedor **sobrevivía** |
| `privacy.html` ↔ `TweaksData.jsx:28` | «Puedes exportar **todo** tu estado como archivo JSON» | El export lee solo `pace.state.v2` ⇒ deja de ser cierto **en cuanto haya emisores** |

**La primera se arregla hoy**: el reset pasa por la barrera y borra los dos
almacenes. La alternativa era publicar a sabiendas una frase falsa.

**La segunda tiene fecha de caducidad, no arreglo inmediato** — y ahí está lo
interesante. La instrucción del usuario («no metas eventos en el backup mientras
el contenedor esté vacío») y la frase de `privacy.html` son compatibles **hoy** e
incompatibles **el día del primer emisor**. Una nota en el backlog es
exactamente el mecanismo que ya falló en s149 y en s151 (un documento que nadie
relee en la sesión correcta), así que en vez de anotarlo se instaló un **gate
mecánico en el `verify`**:

> si aparece una llamada a `paceEventsAppend(` en cualquier archivo de `app/`
> **fuera de `app/events/`** y el export de «Tus datos» **no** lleva la sección
> de eventos ⇒ **rojo**.

Es RELACIONAL: no dice cuántos emisores hay ni cuándo llegan, solo que **los dos
lados van juntos**. Es la tesis de s153 aplicada a una promesa de privacidad: la
vigilancia nueva va al `verify`, no a un TODO.

**Tercera comprobación pedida y descartada por innecesaria**: tocar
`privacy.html` ya. En Fase 1 el contenedor **no guarda ninguna categoría nueva de
información** — guarda `activatedAt`, un array **vacío** y una **copia** de
tallies que ya viven en `routineFeedback` dentro de `pace.state.v2`. La página
pública se actualiza cuando de verdad cambie lo que se guarda, o sea con los
emisores.

---

## 2. Qué se construyó, y por qué en cinco archivos

La separación no es estética: es la **capa A / capa B** que exige §5 del esquema.

| Archivo | Capa | Qué es |
|---|---|---|
| `app/events/events-payloads.js` (112 ln) | **A · canónica** | El **esquema de payloads**, o sea dónde vive la minimización: cada payload se reconstruye **campo a campo** desde una **lista permitida** |
| `app/events/events-model.js` (448 ln) | **A · canónica** | Envelope, tipos, correlación tipada, orden canónico, retención, baseline, presupuesto, export/validación. **No nombra `localStorage` ni `navigator.locks`**: si una función de ahí necesitara tocar el almacenamiento, estaría en el archivo equivocado |
| `app/events/events-adapter-web.js` (351 ln) | **B · backend** | `localStorage` + **Web Locks**. Aquí SÍ se nombran, porque son detalles de ESTE backend |
| `app/events/events-adapter-null.js` (70 ln) | **B · backend** | El adaptador **inerte**: `file://`, Capacitor sin adaptador nativo, y almacenamiento bloqueado |
| `app/events/events-store.js` (293 ln) | fachada | Detecta runtime (§20), elige adaptador, publica el contrato y orquesta la **barrera** entre almacenes. Nadie habla con un adaptador directamente |

**El adaptador inerte no es relleno.** §20 prohíbe que Android/iOS caigan al
adaptador web porque el WebView se presente como `https://localhost`, y §19.2
que `file://` emita aunque el navegador exponga Web Locks. Que exista un archivo
donde eso está escrito y comentado es la diferencia entre una regla y una
esperanza.

### Tres archivos cruzaron las 500 líneas, y la regla 1 no es decorativa

Al medir al final: `events-model.js` en **533**, `verify.integridad.js` en **603**
y `TweaksPanel.jsx` en **508** (venía de 493 y lo desbordaron mis 15 líneas). La
regla 1 de `CLAUDE.md` dice «si crecen, trocear», y es la misma que s152 aplicó
para sacar la segunda tanda del verify. Se trocearon los tres:

- `events-payloads.js` sale del modelo — y **gana** con la mudanza, porque la
  minimización merece archivo propio y cabecera propia.
- `scripts/verify.eventos.js` sale de `verify.integridad.js`, invocado igual que
  esta lo es por `verify.js`. `listaCorta` **se pasa por parámetro** en vez de
  duplicarse: dos formateadores con criterios distintos darían mensajes distintos
  para el mismo problema.
- En `TweaksPanel.jsx`, recortar comentarios era pelear con el síntoma. Lo que
  sobraba era **arquitectura**: «borrar todo» dejó de ser una línea el día que
  hubo dos almacenes, así que la orquestación se fue a `paceEventsWipeAll` y el
  `onClick` volvió a ser una línea (494 ln).

**Y el troceo se cobró un rojo del `verify`, con razón.** `paceEventsWipeAll`
nació haciendo `localStorage.removeItem('pace.state.v2')` ella misma, y la
comprobación 2 —«`app/events/` no escribe el almacén legacy»— la cazó. El arreglo
fue de diseño, no del checker: `wipeLocalState()` vive en `state-core.jsx`, que
es **el dueño de esa clave**. El módulo de eventos **orquesta** la operación de
dos almacenes, pero no mete la mano en el dominio de otro.

---

## 3. El build solo re-expone `function` y `var` — la trampa de s144, esquivada por lectura

Antes de escribir una línea se leyó cómo el build cruza la IIFE
(`build-standalone.js:365-377`): re-expone **`function` y `var` top-level**, y
un **`const` no cruza**. En desarrollo, Babel standalone los pone en un ámbito
global compartido y todo *parece* funcionar; dentro de la IIFE del artefacto, no.
Es exactamente el crash de s144, que estuvo **dos versiones publicado**.

Consecuencia: todas las constantes compartidas (`EVENTS_SCHEMA_VERSION`,
`EVENTS_READ_WRITE`, …) se publican a mano con `Object.assign(window, …)`, igual
que `sidebarStyles` desde s148.

**Y el `verify` mordió igual, dos veces, en la primera pasada:**

| Sin ligar | Veredicto |
|---|---|
| `Uint8Array` (fallback de UUIDv4) | **Falta en el `verify`**: es un intrínseco del lenguaje. Entra en `PLATAFORMA` con toda su familia de arrays tipados |
| `chrome` (detección de extensión) | **Mal en mi código**: `chrome` solo existe en Chromium, la referencia pelada es incorrecta de por sí. Pasa a `window.chrome` |

La distinción importa y es la que `verify.js` documenta en su cabecera: en
`PLATAFORMA` solo entra lo del navegador o del lenguaje. Meter ahí un nombre de
la app lo dejaría **sin vigilar para siempre**.

---

## 4. Cinco comprobaciones nuevas en el `verify`, todas RELACIONALES

Aplicando la clasificación de s152: **ninguna lleva número y ninguna caduca**.

1. **Cero canales de red** en `app/events/` (7 APIs vigiladas + cualquier URL).
2. **Una fuente de verdad por dominio**: `app/events/` no escribe `pace.state.v2`.
3. **El reset de Ajustes** pasa por la barrera (o `privacy.html` miente).
4. **El import** pasa por la barrera (o queda mezcla parcial).
5. **El gate export ↔ emisor** de la sección 1.

Más el **guard de cero** que exige s152: si `PACE.html` no declara ni un archivo
de `app/events/`, es **fallo explícito**, no un verde silencioso.

### La trampa que casi se lleva por delante la comprobación 1

Las cabeceras de `app/events/*` **nombran** `fetch`, `XMLHttpRequest`,
`sendBeacon`, `WebSocket` y `EventSource` — precisamente para prohibirlos. Un
`grep` a secas **se autoinculpa**: el checker habría dado rojo sobre su propia
documentación. Es la trampa de s146 (rutas entrecomilladas en los comentarios de
`sw.js`) entrando por otra puerta.

**Solución: se mira el CÓDIGO, no el archivo.** Cada fuente se compila con el
Babel del build y `comments: false`, y la búsqueda va sobre lo que queda.

---

## 5. Diez pruebas E2E, y por qué hacían falta dos pestañas de verdad

El `verify` comprueba que el código tenga la **forma** correcta. Que se
**comporte** como se prometió solo lo puede decir un navegador.

| Prueba | Qué defiende |
|---|---|
| nace activado, READ_WRITE, activar es **idempotente** | §15.1 paso 3 — si `activatedAt` se moviera, cada arranque recapturaría el baseline y el día que haya consumidor **contaría de más** |
| **cero peticiones fuera del origen** | La promesa de producto, medida en el **cable** y no en el código |
| **lista permitida** del payload | Se intenta colar `notaLibre`, `ip` y una ruta de archivo: los tres **desaparecen** |
| `reset` vacía y **renueva** `activatedAt` | Contrato |
| **«Borrar todos mis datos»** borra los DOS almacenes | La frase de `privacy.html`, por la UI real |
| **backup antiguo** reinicia en vez de mezclar | §17, por la UI real (`setInputFiles`) |
| `replaceFromImport` **reemplaza** (1, no 7) y es idempotente | El bug que §17 prohíbe |
| snapshot inválido **rechazado sin tocar** el contenedor | Seis casos, cada uno con su razón concreta; el contenedor **byte a byte** igual |
| **DOS pestañas** emiten a la vez: 20 de 20 | **El P0 del diseño** |
| operación interrumpida: marcador y **recuperación** | §22 |

**El P0 exigía dos pestañas reales, no dos promesas en la misma.** Dos
read-modify-write concurrentes sobre un mismo almacén **pierden eventos**; eso es
lo que motivó la arquitectura de adaptadores entera. Playwright abre una segunda
página en el mismo contexto —mismo origen, mismo `localStorage`, mismos Web
Locks— y se comprueba que las dos emiten 10 y quedan **20 con id único y en
orden canónico**. De paso queda asertado que la segunda pestaña **no recaptura**
el baseline.

---

## 6. 16 rojos, y los 17 mordieron a la primera

Mismo listón que s150, s152 y s154: guardar los bytes, romper algo **real**,
exigir salida ≠ 0, restaurar en un `finally` **comprobando el hash**.

Dos endurecimientos sobre el banco de s154, los dos por lecciones suyas:

- **Se exige que la cadena a sustituir aparezca EXACTAMENTE una vez.** El cuarto
  rojo de s154 no mordió porque se rompió **la línea equivocada** (el artefacto
  tiene varias llamadas a `renderGlyph`). Ahora eso es imposible: si aparece 0 o
  2 veces, el banco lo declara `[SIN APLICAR]` en vez de dar un rojo falso.
- **Sin `shell:true`**: se invoca el CLI de Playwright por su ruta con `node`,
  así un `-g` con espacios no llega partido.

Y **la calibración va antes de romper nada**: cada patrón tiene que apuntar a
**un solo test**.

**Resultado: 6 rojos del `verify` + 10 de la suite = 17 de 17, todos
restaurados byte a byte con el hash comprobado.** A diferencia de s154, donde
cuatro no mordieron — porque sus tres lecciones (`exact: true`, romper la
**causa** y no la etiqueta, `textContent` y no `innerText`) ya estaban aplicadas
al escribir.

**El guard de cero necesitó su propio banco**, y ahí el código de salida **no
basta**. El escenario real no es «alguien borra los archivos» —eso lo caza la
biyección `app/` ↔ `PACE.html`— sino un **refactor legítimo** que mueve el
subsistema de carpeta **y actualiza `PACE.html`**: las cinco comprobaciones se
quedarían mirando al vacío y pasarían en verde sobre nada. Se reprodujo moviendo
la carpeta de verdad, y se exigió **el mensaje del guard**, no solo el exit 1.

---

## 7. Lo que se guarda, lo que no, y dónde

**Esquema del contenedor** (`localStorage`, clave `pace.events.v1`, fuera de
`pace.state.v2`):

```
{ schemaVersion: 1,
  activatedAt:  "2026-08-04T10:08:23.597Z",   // ISO
  events:       [],                            // VACÍO en s155: no hay emisores
  baseline:     { capturedAt, feedback: {}, totalsByType: {} },
  pruneCursor:  null,                          // { occurredAt, id }
  marker:       null }                         // { op, startedAt } — recuperación
```

**Guarda**: el instante de activación · hechos con esquema **cerrado** y lista
permitida (módulo, id de rutina **del catálogo**, motivo de finalización,
duraciones en segundos, índice de paso) · totales consolidados · la mecánica de
poda y recuperación.

**No guarda, y está probado**: texto libre · datos médicos · nombres de archivo ·
IP · ubicación · contactos · credenciales · portapapeles · identificador de
usuario, de dispositivo, publicitario o de fingerprint.

**Un dato que se verificó en vez de suponerse**: el `routineId` de una rutina
personalizada es `custom.<Date.now()>` (`state-custom.jsx:64`) — un timestamp
opaco. **El nombre que escribe el usuario no entra en el id**, así que el log no
puede filtrar texto libre por esa vía.

**No hay envío remoto.** Cero `fetch`, `XMLHttpRequest`, `sendBeacon`,
`WebSocket`, `EventSource` y cero URLs en los cuatro archivos — asertado
estáticamente por el `verify` y medido en el cable por la suite.

---

## 8. Retención: implementada, NO programada

La ventana de **120 días** de §12 no se inventa aquí ni se deja abierta: está
cerrada en el diseño desde s117, y **destila antes de borrar** (el lote se funde
en `baseline` antes de eliminarse, así que se pierde el detalle por hecho pero
**nunca el total**).

Lo que s155 decide es **cuándo corre**:

- **La poda por CALENDARIO no se programa.** Sin emisores no hay nada que barrer,
  y §25 sitúa la consolidación en la Fase 3. El punto de extensión está
  **declarado y comentado** en `eventsWebPruneForBudget`: se engancha al rollover
  diario, sin crear un segundo reloj.
- **La poda por PRESIÓN DE PRESUPUESTO sí existe**, porque es lo que impide el
  crecimiento ilimitado: ~500 KB lógicos medidos con `TextEncoder` sobre el JSON
  canónico, poda por mitades desde lo más antiguo, y **reintento único** —si
  vuelve a fallar, se conserva el último contenedor válido y se devuelve error
  controlado, nunca el `catch(e){}` mudo de `persistState()`.

Queda **declarado en el bloque `NO_CUBRE`** del `verify`, que se imprime en cada
pasada también en verde.

---

## 9. Verificación

- **`npm run verify` PASA en 7,4 s**, 4 tandas, con las 5 comprobaciones nuevas y
  la versión **v0.88.0** coherente en los tres sitios · 102 módulos declarados =
  102 bloques compilados · **101 archivos de `app/`** sin huérfanos · ningún
  identificador sin ligar (421 publicados en window, 113 de plataforma).
- **`npm run test:e2e` PASA: 23/23 en 29,2 s** contra el `index.html` v0.88.0
  **recién regenerado** — las 13 de s154 **sin una regresión** y las 10 nuevas.
- **17/17 rojos**, los 16 archivos restaurados byte a byte con el hash comprobado.
- `index.html` regenerado: hash `A5D814221AE5986C`, **0 bytes CR** de 1 348 564.
- `PACE_standalone.html` restaurado byte-idéntico: **`998E3E358D689036`** (s134).
- **En el navegador**, sobre `index.html` con SW y cachés purgados y estado
  limpiado desde la página viva: contenedor creado y `READ_WRITE`, 190 bytes ·
  activación idempotente · 20 emisiones concurrentes sin perder una · excepción
  dentro del lock liberándolo · 6 snapshots inválidos rechazados dejando el
  contenedor intacto · snapshot de 1,65 MB rechazado por presupuesto · **inglés
  sin regresión** (`MANUAL FOCUS` / `Deep focus` / `Start focus`) · **consola sin
  errores**.

---

## 10. Estado al cerrar

**FASE 3 · Fase 1 del esquema: CERRADA.** Lo siguiente del subsistema es la
**Fase 2 (emisores)**, y tiene dos condiciones de entrada que ya no dependen de
que nadie se acuerde:

1. El `verify` exigirá que el export de «Tus datos» lleve la sección de eventos
   en cuanto aparezca el primer `paceEventsAppend(` fuera de `app/events/`.
2. La poda por calendario se engancha al rollover diario en la Fase 3.

Del frente CI sigue quedando **Wrangler** (inerte sin secretos) y **proteger
`main`** (acción del usuario, `gh` sin instalar).
