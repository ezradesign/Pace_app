# La séptima pasada externa (las cuatro ramas de la 0.198.0), comprobada punto a punto

Contra `main` (v0.198.1, 1d895915), el 11 nov. de 2026, leyendo código y con pruebas que fallan. La pasada auditó las
cuatro ramas antes de juntarlas; ya están juntas, así que sus «rama 2, 3 y 4» son `main`. El texto entero está en
`externa-septima-11nov.md`, en la rama `claude/auditoria-fable-9nov-8401fc` (no se copia aquí). Los números son los suyos.
Los arreglos van en la rama `claude/septima-comprobada-11nov`, sin versión nueva.

**Cuenta:** 16 puntos. **10 ciertos** (n.º 1, 4, 6, 7, 9, 10, 12, 14, 15 y 16), **3 a medias** (n.º 2, 3 y 5), **1 falso**
(n.º 13), **1 ya resuelto al juntar** (n.º 11) y **1 que pide la letra de Ez** (n.º 8, cierto en lo que supone). Arreglados:
todos los ciertos y a medias menos el n.º 9, que solo se deja dicho en el comentario, y los n.º 11 y 12, que ya no aplican
(el 12 era el 7).

**Lo más importante, por orden:**
1. **n.º 7, cierto:** con la salida a las 17:00, un último bloque de 16:30 visto al volver a las 18:00 (el móvil bloqueado,
   lo normal) dejaba el día fuera de Ocaso. Igual con un Foco pausado.
2. **n.º 1, cierto:** el día de la actualización (o con una copia de antes) la rutina de una pausa salía dos veces en
   Estadísticas › Hoy.
3. **n.º 4, cierto:** «Cambiar» con un Foco empezado antes de medianoche no lo pasaba al día nuevo (Ez eligió 4B).

## (a) Datos

- **n.º 1** Lo de antes de la actualización sale dos veces en «Hoy» · **cierto**: `app/stats/StatsHoy.jsx:64-68`
  (`statsHoySueltas`) descarta solo los `runId` de `dia.sesiones`, que no existía antes de la 0.198.0. Una pausa hecha antes
  sale en su parada y su sesión, abajo, en «Además, por tu cuenta». **Arreglado** (f1b5f745): con alguna pausa `hecha` sin
  su sesión apuntada no se pinta ese bloque. Es más estricto que lo que pedía la pasada («sin `sesiones`»): cubre también
  el día mixto (pausas de la mañana con la versión vieja y de la tarde con la nueva). Desde la 0.198 toda pausa hecha lleva
  su sesión (`ritmoPausaHecha` solo la llama `emitSessionCompleted`, con `runId`), así que solo pasa con datos de antes.
  La semilla de `tests/stats-hoy-por-tu-cuenta.spec.js` llevaba tres pausas hechas sin sesión y ahora lleva las suyas,
  como cualquier día de la 0.198. Prueba nueva en ese archivo, con mutante.
- **n.º 2** En el iPhone, «hecha» sin minutos · **a medias**: que los minutos salían solo del registro es cierto
  (`app/state-ritmo.pausa.jsx:111-133`, `ritmoSesionesHoy` lee `paceEventsSnapshot`). Que el registro esté vacío en el
  iPhone es **falso**: es el comentario viejo que la sexta pasada ya dio por falso (nº 3; `events-store.js:90-100`, el
  iPhone usa el adaptador web). Donde sí falta: la otra pestaña (n.º 5), una copia importada sin el registro y `file://`.
  **Arreglado** (f1b5f745): `ritmoPausaHecha` guarda lo sumado en `dia.sesionesMin = { runId: minutos }` y se lee de ahí.
  `dia.sesiones` no cambia de forma, así que lo apuntado por la 0.198.x se sigue leyendo del registro y una pestaña con la
  versión de antes no tropieza (con `{ id, min }` dentro de la lista no casaría los `runId`). Sin migración ni borrado.
- **n.º 3** «hecha · 0 min» · **a medias**: el código lo permitía (`state-ritmo.pausa.jsx:135`, `min != null`; y
  `completeExtraSession` manda 0 si la duración no es positiva, `state-achievements.jsx:431-447`), pero **la reproducción de
  la pasada no da 0**: «Terminar antes» al momento no cuenta nada (menos de medio minuto, `MoveSessionV1.jsx:123-124`,
  `MoveModule.jsx:145-150`, `BreatheSession.jsx:224-237`), y lo que cuenta suma al menos 1 minuto. **Arreglado igual**
  (f1b5f745): `min > 0`. Prueba con una sesión de 0 min emitida a mano, con mutante.
- **n.º 4** «Cambiar» con un Foco de antes de medianoche · **cierto**: `app/state-ritmo.recolocar.jsx:226` devolvía `null`
  si el inicio era de otro día. Con uno de 25 desde las 23:50, «Una hora» elegida a las 0:05 empezaba a las 9:00 y sin él.
  **Arreglado** (cceed91d, 4B de Ez): si sigue en marcha, es el bloque 1 desde las 0:00 y dura lo que le queda. Hacía
  falta algo más que la pasada no vio: las horas del plan son minutos de reloj, y las 23:50 de ayer (1430) eran «después
  de la salida» de hoy, así que al acabar el bloque no se abría su pausa (`ritmoBloqueTerminado`). Ahora la hora de ayer
  cuenta desde la medianoche (`ritmoDesdeHoy`, también en `ritmoFocoEmpezo`). Uno en pausa desde ayer sigue sin entrar.
  Prueba en `tests/ritmo-cambiar-en-marcha.spec.js`: cae con el archivo de `main` («empezaba a las 9:00») y cae sin la
  medianoche al acabar («no abre su pausa»).
- **n.º 5** La otra pestaña dice «hecha» sin minutos · **a medias, pasajero**: el registro de cada pestaña es una copia en
  memoria que se relee al arrancar, tras escribir esa pestaña y al volver a ella (`events-adapter-web.idb.js:20-24`); con
  dos ventanas a la vista, la que no hizo la sesión no la ve hasta que se vuelve a ella. **Arreglado** con el n.º 2.

## (b) Guardar o no guardar

- **n.º 6** `pace.aro.carta.v1` sin mirar la landing · **cierto en el código, sin efecto hoy**:
  `app/main/home-geometry.horario.js:55-62` escribe directo. Hoy no llega con la landing delante porque la app no monta
  (`landing/cara.js:79`). Lo de «la copia importada, nada se guarda hasta recargar» no aplica: esa guarda es del estado, y
  esto son medidas de la ventana. **Arreglado** (ecbd78d6): `if (window.PACE_CARA === 'landing') return;` al entrar. Prueba en
  `tests/landing-cara.spec.js`, con mutante que quita la guarda y guarda la clave.

## (c) Logros

- **n.º 7** Ocaso calcula el inicio desde ahora · **cierto**: `app/state-achievements.ocaso.js:32` (`Date.now()` menos lo que
  dura) y `app/state-timer.jsx:61`, que no le pasaba el inicio aunque `FocusTimer.jsx:50` lo tenía. **Arreglado** (12bbe52d):
  `completeFocusSession` pasa `inicio` y `fin`; la cuenta vieja queda de reserva, desde el final. Pruebas con bloques de
  verdad en el aro (pausado 40 min; con PACE cerrado de 16:40 a 18:00): con la cuenta vieja caen. Lo que la pasada no dijo:
  esos dos días, además de no salir «tarde», **cuentan** para Ocaso (al empezar a las 16:30 el día se recompone con un solo
  bloque antes de la salida, y queda cerrado con él).
- **n.º 8** ¿«Una hora» da Ocaso? · **cierto lo que supone; pide la letra de Ez (pregunta 1)**: `ocaso.js:46` no mira la
  opción ni la hora. **Medido**: cinco días de «Una hora» con su bloque hecho dan «Cinco jornadas cerradas a su hora». La
  prueba que lo dice está en `tests/logros-ocaso-buho.spec.js` («HOY, a falta de la letra de Ez…»); si Ez elige que no,
  se da la vuelta. La regla no se ha tocado.
- **n.º 9** El «No» que se puede deshacer no mira Búho · **cierto**: `app/state-feedback.jsx:100` sale antes de
  `paceBuhoMirar()` (`:103`), y `SessionFeedback.jsx:57` emite el evento al salir pero no mira Búho. Si ese «No» es la
  respuesta 25, Búho llega al acabar la siguiente sesión. **Solo dicho en el comentario** (1b2cbeea): darlo al contestar lo
  dejaría ganado aunque se deshiciera, y un logro no se quita.
- **n.º 10** Un Foco que cruza la medianoche · **cierto**: `ocaso.js:33` apuntaba `todayISO()` del día nuevo, que no tiene
  nada que ver. **Arreglado** (12bbe52d), y no salía «gratis con el n.º 7» como decía la pasada: el plan de hoy no sabe la
  salida de ayer. `paceOcasoMirar` apunta la salida del día que cuenta (`ocasoSalida`), y un Foco empezado ese día tras su
  salida que acaba pasada la medianoche lo saca de la cuenta y no marca el día nuevo. `ocasoSalida` nace como `{}`: con
  `null` de fábrica, `paceSanearEstado` la borraba en cada arranque (lo destapó la prueba). Prueba con mutante.

## (e) Cruces al juntar

- **n.º 11** `index.html` y las filas de decisiones · **cierto en su día, ya resuelto**: la 0.198.0 se juntó con un solo
  build y las filas de las ramas 2 y 3 están las dos en `DECISIONES_TECNICAS_VIGENTES.md`.
- **n.º 12** `completePomodoro` tocado por las ramas 2 y 3 · **cierto; era el n.º 7**: se juntó sin choque de texto y sin
  usar el inicio, que es lo que arregla 12bbe52d. El cruce posible en `state-events.jsx` no lo hay: `paceUltimaPuertaLeer`
  está (`:90`) y lo usa `SessionDone.sigue.jsx`.
- **n.º 13** La línea de los lunes y el tamaño recordado del aro · **falso**. Medido a 1280×720 y a 1536×710, ya en v1,
  martes → lunes y lunes → martes, con el tamaño recordado del día anterior:
  | Ventana | Con actividades | Horario abierto | «Una hora» elegida, martes | «Una hora» elegida, lunes |
  |---|---|---|---|---|
  | 1280×720 | 391 px | 391 px | 412 px | 383 px |
  | 1536×710 | 372 px | 372 px | 426 px | 412 px |
  La línea solo sale con el día elegido, y en ese estado el tamaño no se recuerda: lo recordado (391 y 372) es igual los
  dos días. Sin scroll en ninguno; la línea, 22 px de alto, dentro del panel y en la ventana. Lo único: **los lunes, con
  el día elegido, el aro mide 14-29 px menos**, porque la línea ocupa su sitio. No es un fallo; si a Ez le molesta, es
  un cambio visual con maqueta.
- **n.º 14** La página «El aro fijo» dice «Montada: la A» · **cierto**: `docs/proposals/aro-fijo-10nov/aro-fijo.html:139`, de un
  aro fijo de 372 px que se deshizo. Nada enlaza la carpeta (`STATE.md` y `docs/traspaso/` nombran la rama, no la ruta).
  **Quitada** (59ffde23).

## (f) Pruebas

- **n.º 15** Ocaso se prueba sin bloques de verdad · **cierto**: `tests/logros-ocaso-buho.spec.js:23` cerraba el día con
  `cycle: 20` y `:59` llamaba a `paceOcasoFoco(25)` a mano. **Arreglado** (12bbe52d): cuatro pruebas que empiezan, pausan y
  acaban el bloque en el aro (pausado, PACE cerrado, control tardío, cruzando la medianoche). Con el cálculo viejo caen tres
  (pasado); el control, que espera «tarde», es el que tiene que caer si se quita la llamada de `completePomodoro` (deducido,
  no pasado).
- **n.º 16** «Trasnochar ya no lo da» no puede fallar · **cierto**: `:67-74` corre por libre, sin plan. **Arreglado**: «una
  jornada que se cierra sola por la hora, sin sus bloques, no cuenta aunque haya sesiones a las 22 h» (cae si la jornada
  cerrada por la hora cuenta) y su contraria, «con todos sus bloques hechos, una sesión a las 22 h no saca el día».

## La pregunta 2 de la pasada (Ajustes en la semana de prueba de v1)

**Confirmado**, sin tocar: `app/tweaks/PremiumSection.jsx:85-96`. Mientras dura la semana de prueba, la fila de PACE
completo dice «Prueba hasta el {fecha}» y, solo en la web, abre el campo del código. «Tenerlo para siempre · 19,99 €»
no sale: `premiumPlanEnAjustes` lo quita a propósito en la prueba (`:39`). Es un cambio visual; va con maqueta.

## Preguntas para Ez

1. **¿Cuenta para Ocaso un día de «Una hora»?** Hoy sí: cinco días de «Una hora» con su bloque hecho dan «Cinco jornadas
   cerradas a su hora». Opciones: **A** solo la jornada y la media jornada; **B** también «Dos horas»; **C** como hoy,
   cualquier día cerrado con sus bloques. **Recomiendo A**: el logro habla de jornadas.
2. **En la semana de prueba, ¿la fila de Ajustes ofrece «Tenerlo para siempre»?** Hoy solo dice hasta cuándo dura y deja
   poner un código. **A** añadir debajo «Tenerlo para siempre · 19,99 €» (con maqueta antes); **B** dejarla como está.
   **Recomiendo A**: es la semana en que más sentido tiene comprarlo.
