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
