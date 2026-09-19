# s195 (bis) · La pausa con memoria (v0.126.0)

**Fecha:** 2026-09-19 · **Versión publicada:** v0.126.0 · **Suite:** 277 → **281**

> Con `docs/proposals/ideas-s195.html` delante, el usuario decidió: la pausa con menú (el calco,
> «pero con un glifo del ejercicio principal»), el agua por tiempo, recolocar también al terminar,
> y las pausas hechas/saltadas. Y dejó tres cosas para ver variantes: la tarjeta por libre
> («mucho más elegante y llamativa»), el interruptor de la comida («cuadrado o más elegante, esa
> píldora es demasiado grande»), y los nombres de la semana («arrancar, aire… no me convencen»).
> Diario de la primera parte de s195: [session-195](./session-195-la-barra-fea-y-el-final-del-dia.md).

---

## 1 · Lo hecho, con su porqué

- **La pausa con menú** (`app/breakmenu/BreakMenu.ritmo.jsx`, nuevo): al acabar un bloque de «A tu
  ritmo», el modal pregunta una sola cosa. Cejilla «Bloque 1 de 9 · hecho», título «Tu pausa»,
  «9:45 · lo que el menú tenía para ahora», el plato con **el glifo de su ejercicio** (el de las
  tarjetas de rutina, `libraryGlifos` + `ExerciseGlyph`; Respira lleva el de su módulo) y «3 min ·
  Estira · y un vaso de agua» si la pausa lleva vaso. Tres salidas: **Hacer la pausa** (la rutina, por
  la puerta de siempre), **Seguir con el bloque N+1** (cierra y arranca el aro por `pace:ritmo-seguir`,
  que `FocusTimer` escucha; la pausa queda saltada) y **Otra cosa…** (despliega los cuatro módulos).
  «Saltar esta pausa» sigue. Solo con propuesta `ritmo.*` y pausa abierta; sin menú, el modal de
  siempre (`pausa-propone.spec.js` sigue verde sin tocarlo).
- **El agua va por tiempo** (`ritmo.regla.js`): un vaso en cada parada a la que se llega con ≥ 50 min
  desde el último (el inicio del día cuenta como último, también tras recolocar: `previos.ultimoVaso`
  arranca en `pasado[0].desde`); la comida siempre lleva vaso y reinicia desde que acaba; tope, la
  meta menos lo bebido. Jornada 9–17 con comida a las 14: 10:35 · 11:25 · 12:25 · 13:15 · comida ·
  16:20 = **6 vasos** (antes 8, uno en cada pausa); «Dos horas» 2 (antes 4); «Una hora» 1.
- **Recolocar también al terminar** (`state-ritmo.jsx`, `ritmoBloqueTerminado`): si el bloque acaba a
  una hora que no es la del plan, lo hecho se congela hasta ese bloque —que dura lo que duró— y el
  resto se recompone desde ahora con **la pausa la primera** (`previos.pausaPendiente`; la regla la
  sirve antes de ningún bloque, salvo que ya no quepa otro —entonces es el cierre— o que la comida
  esté encima). Al empezar el siguiente, la pieza de s194 recoloca otra vez.
- **Y la duración que pones manda** (`dia.bloque`): si el aro marca 25 con un plan de 45, empezar
  también recoloca y los bloques que vienen son de 25 (`previos.bloque` sustituye a `forma.bloque`).
  Salió del test: `ritmoSincronizar` devolvía el aro a 45 al subir `cycle`, y el usuario había
  preguntado justo eso («si cambio la duración del pomodoro, ¿se autoajustan?»).
- **La línea tiene memoria** (`dia.estados`, por ordinal de parada; `ritmoOrdinal`): una sesión
  terminada con la pausa abierta la deja **hecha** (`emitSessionCompleted` → `ritmoPausaHecha`);
  empezar el bloque sin hacerla la deja **saltada**. La parada hecha se rellena con su color; la
  saltada va al 40 % y a trazos, y su etiqueta dice «saltada». En móvil, los puntos igual.

## 2 · Lo que salió haciéndolo

- **`useEffect` pelado en `FocusTimer.jsx`**: el verify lo cazó como identificador sin ligar en el
  artefacto (el crash de s144). El alias es `useEffectFT`.
- **`Button` no reenvía `data-*`**: los botones del modal se buscan por nombre en las pruebas.
- **El test de «recolocar al terminar» no podía acabar el bloque antes de tiempo desde la UI**: se
  pausa el aro 3 min a mitad y el bloque acaba a las 9:28 en vez de a las 9:25.
- **`eventos-origen.spec.js`** buscaba «Empezar» dentro de la propuesta: con menú, ahora es «Hacer la
  pausa» fuera de ella.
- **La primera pasada completa dejó un rojo en `ritmo-panel.spec.js`**: el escenario del test (una hora
  a las 14:30) ya no tenía gota en ninguna fila con la regla nueva, y de paso destapó que tras recolocar
  el reloj del agua arrancaba en «ahora» y no en el inicio del día (arreglado: `previos.ultimoVaso`).

## 3 · La red

`tests/ritmo-pausa.spec.js`, **4 tests**, los cuatro en rojo contra el artefacto de v0.125.3: el agua en
puro (separación ≥ 50, la comida siempre, la primera pausa sin vaso, una hora 1–2, dos horas ≤ 3) · el
modal con menú y «Seguir» (saltada) · «Hacer la pausa» y la sesión que la deja hecha (y empezar el
bloque 2 no la pisa) · acortar el pomodoro (bloques de 25) y acabar tarde (la pausa a las 9:28).

## 4 · Lo que se declara sin cubrir

- La hoja (la jornada entera) no dice hecha/saltada en sus filas pasadas (solo la línea y los puntos).
- Stats «Hoy» y la barra lateral no cuentan «4 de 7 pausas» todavía.
- Cerrar el modal con la X o Escape deja la pausa abierta (como antes): no marca nada hasta que
  empiezas el bloque.
- El modal con menú en móvil (360) no se ha fotografiado: mismo `Modal`, una tarjeta menos.

## 5 · La ronda 2 de ideas

`scripts/audit/ideas-s195-r2.js` → **`docs/proposals/ideas-s195-r2.html`**: tres variantes calcadas
de la tarjeta por libre (losetas · **el arco del día** · columnas), tres del interruptor de la comida
(casilla · **la palabra «comes / no comes»** · mini interruptor) y tres formas de nombrar los días
(verbos · **sin título, una frase** · solo el tema) más los temas por región o **por intención**.
Enviada, sin decidir.
