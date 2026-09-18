# s194 · El origen de cada sesión (v0.124.0)

**Fecha:** 2026-09-18 · **Versión publicada:** v0.124.0 · **Suite:** 253 → **257**

> Encargo: el usuario pidió seguir por las tres piezas de la página «por dónde seguir»
> (`docs/proposals/por-donde-seguir-s194.html`) —el origen de cada sesión, recolocar a mitad de
> día y el norte— y preguntó qué recomendaba para el norte. Recomendación dada: **A ya, C
> después, B aparcada**, y el orden **1 → 2 → 3A**, cada una con su versión. Esta es la 1.

---

## 0 · Qué faltaba

`pace.events.v1` guardaba cada sesión completada con dos contextos —`standalone` o `path`— y
nada más. No sabía si la persona eligió la rutina en la carta, si se la propuso la pausa, si
era el plato que «A tu ritmo» sirvió o si tocó la parada de la línea. Sin eso no se puede saber
si el menú funciona (la primera idea del experto de s192) ni diseñar «propuestas para cada día
de la semana» con datos. Es instrumentación: **nada cambia en la pantalla**.

## 1 · Lo decidido antes de tocar

- **Dos campos, no uno compuesto**: `origin` (la PUERTA: `aro` · `pausa` · `biblioteca` ·
  `sidebar` · `parada` · `camino`) y `fromMenu` (si lo empezado era lo que el menú sirvió).
  Responden a preguntas distintas y con la puerta sola `pausa` y `sidebar` son ambiguas.
- **Los dos admiten `null`**: la puerta se anota en el gesto y vive **en memoria** (como el
  `runId` del feedback, §7.2), así que una sesión que sobrevive a una recarga —Foco persistido,
  Respira reanudada— llega sin puerta; un evento anterior a s194 tampoco la trae.
- **No se consolida en el baseline** (§13): el consumidor previsto —Stats «Semana», lectura C—
  lee ventanas de eventos retenidos (120 días), no totales. Si algún día hace falta el total, se
  añade al fold como `sessionsByRoutine` (s190). Sin consumidor, no se construye.
- **Dentro de un Camino manda `camino`**, se haya anotado lo que se haya anotado: el runner lo
  monta el Camino, no un gesto.

## 2 · La implementación

| Dónde | Qué |
|---|---|
| `events-payloads.js` | `EVENT_ORIGINS`; `session.completed` lleva `origin` (enum, null si no está en la lista) y `fromMenu` (booleano o null). Lista permitida, como todo lo demás |
| `state-events.jsx` | `paceOrigenPendiente` en memoria; `paceOrigenSesion(puerta, desdeMenu)` la anota; `emitSessionCompleted` la **consume** (también si el almacén rechaza el evento) y con `inPath` la pisa con `camino` |
| `main.jsx` | `abrirBiblioteca(kind)` anota `biblioteca` (TopBar, RitmoHome, atajo `?go=`, barra lateral por módulo); `handleBreakChoice(choice, rutina, desdeMenu)` anota `pausa` |
| `BreakMenu.jsx` | el tercer argumento de `onChoose`: si la rutina elegida es la propuesta y su motivo es `ritmo.*`, era del menú |
| `main.eventos.jsx` | `resume`/`repeat`/`suggest` anotan `sidebar`, o `parada` si el detalle trae `parada: true`; `ritmo` dice si la tarjeta era la pausa del menú |
| `Sidebar.jsx` | `emitir(a.kind, { targetId, ritmo: !!a.ritmo })` |
| `RitmoLinea.jsx` | `ritmoEmpezarParada` dispara con `parada: true` |
| `FocusTimer.jsx` | `startFocusVisual` anota `aro` con `fromMenu = !!aro` (hay plan) al empezar, no al reanudar |
| `EVENTOS_SCHEMA.md` | **rev. 7**: §8 con los dos campos y el porqué; historial de revisión al día (también la rev. 6 de s172, que no figuraba) |

## 3 · Lo que cazó la red

- **`tests/eventos-origen.spec.js`, 4 tests**: el aro con plan (`aro` + true) y la propuesta
  de la pausa (`pausa` + true) en una misma jornada; la parada tocada (`parada` + true) y la
  tarjeta de la barra lateral con la pausa abierta (`sidebar` + true); una biblioteca
  (`biblioteca` + false) y el aro sin plan (`aro` + false); y en puro: la puerta se consume, sin
  puerta sale null y no la anterior, dentro de un Camino manda `camino` aunque haya puerta
  anotada, y lo que no está en la lista sale a null.
- **`scripts/audit/banco-origen-s194.js`**: 12 mutantes con pasada de control —una puerta por
  mutante, más el consumo, el Camino y la lista permitida— (resultado en `STATE.md`).
- **El botón «Volver al inicio» del cierre de sesión es HERMANO de `[data-pace-session-done]`**,
  no hijo: el primer intento del test lo buscaba dentro y esperó 60 s. Se busca en
  `[data-pace-session-root]`.
- `pathRunId` es **opcional** en `session.completed` (§7.1): el emisor con `inPath` y sin
  `paths.current` emite igual, con `context: 'path'`. El test lo asume, no lo contradice.

## 4 · Lo que no se probó, y lo que queda

- **La puerta `biblioteca` tras la pausa**: elegir una tarjeta de módulo en el menú de la pausa
  anota `pausa`, se abre la biblioteca y lo que se empiece desde ella sale como `pausa` con
  `fromMenu: false`. Es la intención (la pausa fue la puerta), no se asertó.
- **Una sesión reanudada tras recargar sale con `origin: null`.** Declarado, no arreglado: la
  puerta no se persiste a propósito (§7.2).
- **Ningún consumidor lee todavía `origin`**: es la pieza que hace posible la lectura C del
  norte y «Stats Semana»; hasta entonces el dato se acumula en los 120 días de retención.
- Siguen en la cola: **recolocar a mitad de día** (pieza 2, pintar antes) · **el norte, lectura A**
  (pieza 3) · `MoveSessionV1.jsx` en 500 líneas · los huecos declarados de s193.

---

# Pieza 2 · Recolocar a mitad de día (v0.125.0)

**Suite:** 257 → **260** · el usuario: «me parecen bien las propuestas por el momento» (siempre · la
cola se funde · el bloque dura lo que marca el aro).

## 5 · Qué faltaba

Las horas de la línea eran las del plan: si el bloque 2 empezaba a las 9:50 y lo empezabas a las
10:10, la línea seguía diciendo 9:50 y todo lo de detrás iba veinte minutos «mal». Y llegar antes
no existía: el plan esperaba a tu hora de inicio aunque ya estuvieras.

## 6 · La maqueta, sobre la app de antes y la de después

`scripts/audit/recolocar-s194.js` fotografía el MISMO guion dos veces —con `--hoy` sobre el
artefacto anterior a la regla y sin él sobre el nuevo— y con `--pagina` compone
`docs/proposals/recolocar-r1.html`. El guion: jornada a las 9:00 · bloque 1 · al acabar, la pausa
y 25 minutos de espera (son las 10:10) · «Empezar bloque 2» · el bloque 2 acaba, 10 minutos más ·
«Empezar bloque 3» · y aparte, llegar antes: a las 8:40 con el plan a las 9:00. Medido en las fotos:

| Estado | Hoy | Propuesta |
|---|---|---|
| Bloque 2 a las 10:10 | actual «9:50», paradas 10:35 · 11:25 · 12:25 · 13:15 | actual **10:10**, paradas **10:55 · 11:45 · 12:45 · 13:35**, comida 14:00, hasta 17:00, 9 bloques, **5 h 50** de foco (eran 6 h 10) |
| Bloque 3 con 10 min más | actual «10:40» | actual **11:10**, **8 bloques**, 5 h 30 |
| Llegar a las 8:40 | actual «9:00» | actual **8:40**, paradas 9:25 · 10:15 · … |

**Lo que se vio mirando y no leyendo**: el hueco del retraso no se pintaba y la línea dejaba de
ser proporcional al tiempo justo ahí. Se pinta **punteado, como el margen libre** antes de la comida.

## 7 · La implementación

- **`ritmo.regla.js`**: `ritmoComponer(..., previos)`. Con `previos` el día empieza EXACTAMENTE en
  `ahora` (también antes de tu hora), el bloque que acaba de empezar dura lo que marca el aro
  (`primerBloque`, y si cruza la hora de comer, se come al acabarlo: `comer()` ya no retrocede), la
  numeración, la cadencia de la larga, el presupuesto de foco, los platos servidos, las claves de
  «otra» y el agua continúan desde lo hecho; con `comidaHecha` no se sirve otra.
- **`state-ritmo.jsx`**: `ritmoBloqueEmpezado(minutos)` compara la hora exacta con la del plan y,
  si difieren, **congela** lo anterior al bloque en `dia.pasado` (sin la rutina viva, se rehidrata
  del catálogo al leer), fija `dia.desde` y `dia.primerBloque`. `ritmoMenu` compone el resto con
  `ritmoPrevios(pasado)` y antepone la historia, con el hueco del retraso como `libre`.
- **`FocusTimer.jsx`** pasa `state.focusMinutes` al empezar.
- **`RitmoPiezas.jsx`**: el **bug del selector** que encontró el usuario a las 17:20 — el inicio solo
  llegaba a las 13:00 (`RITMO_RANGOS`). Ahora inicio 5:00–21:00, comida 11:00–17:00, salida
  12:00–23:30.

## 8 · Lo que cazó la red

- **`ritmo.spec.js`, 17 → 20**: recolocar veinte minutos tarde (desde, historia congelada, bloque
  forzado, paradas movidas, comida a su hora, salida igual, retraso punteado, nada repetido, la
  barra lateral, y sobrevive a la recarga) · llegar antes es empezar · la regla en puro con
  `previos` (numeración, cadencia, sin repetir, claves, comida hecha, cruce de la comida, presupuesto
  con bloque forzado de 35, agua).
- **Un aserto de s193 cambió con razón**: pulsar «Empezar bloque 2» a las 9:45 sin esperar la pausa
  recoloca a 9:45, y la siguiente pausa dice 10:30, no 10:35.
- **`scripts/audit/banco-recolocar-s194.js`**: la primera pasada dio **13 de 14**. El vivo era `it.de`
  (el total del día escrito en cada bloque): nadie lo leía desde s192 —el total lo da `plan.total`—,
  así que **se quitó el campo, no se añadió un aserto** (lección de s190). Segunda pasada, 13 mutantes
  (resultado en `STATE.md`). Dos hubo que hacer distinguibles ANTES de correrlo: el bloque forzado con
  una duración distinta de la del plan (35, no 45) y la comida hecha con la hora de comer por delante
  (13:00).
- `ritmo.spec.js` está en **465 líneas**: lo siguiente que crezca ahí va a un spec hermano.

## 9 · Lo que queda de esta pieza

- El **modo oscuro** del hueco punteado no se ha mirado. El **cierre** sigue sin ser «Ahora».
- «Hoy voy por libre» **debería destacar más** (el usuario): cinco variantes fotografiadas en
  `docs/proposals/por-libre-r1.html` (C y D pisan la línea; C2 sube la fila; **E** lo muda a la
  cabecera como píldora verde). **Eligió E**; aplicada (`.pace-rt-libre`, `RitmoLibre` fuera de la
  fila de la línea y dentro de `.pace-rt-der` junto al contexto). Sin scroll en 1280×879 ni 1536×714.
- **El banco dio 12 de 13 en la segunda pasada** con un mutante que en la primera mordía: un `verify`
  concurrente (compila `index.html`, que es lo que sirve el 8765) lo hizo «vivir». Tercera pasada en
  limpio: **13 de 13**. Nada que compile mientras corre un banco.
