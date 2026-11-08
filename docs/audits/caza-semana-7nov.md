# Caza de la semana · 7 y 8 nov. 2026

Rama `claude/caza-semana-21914d`, sobre `claude/recorrido-6nov-645d6b` (42ae69c7) y, desde el 8 nov., con
`claude/abierta-horas-7nov-a2419d` dentro (8fd817b1: `main` en 0.193.0 y las letras E1 A, V1 A y V2 A), probando
el `index.html` compilado. Una persona vive con PACE del lunes 9 al martes 17 de noviembre de 2026 con el reloj de la página
(`page.clock`), clics de verdad y la página abierta o cerrada como haría ella. El banco, en
`docs/traspaso/archivos/caza-semana-7nov/` (`semana.js`, `personas.js`, `calendario.js`, `final.js` y los
`_*.js` que reproducen cada fallo). Se corre desde la raíz del repo con un servidor ya arrancado en su puerto
(`PORT=8892 node .claude/static-server.js`): si el banco arranca el suyo, al acabar lo mata y deja sin servidor a
otro banco que lo compartía (pasó dos veces).

## Las tres personas

- **oficina** (es, 1280 px): jornada de 9 a 17 de lunes a viernes, comida a las 14:00. Pausas impares hechas con
  un «Sí» y pares con «Ahora no». Lunes: el `.ics`. Martes: reuniones de Google (10:00-11:00 y 15:00-15:30,
  proveedor y API falseados). Miércoles: cierra el portátil a las 12:50 y deja PACE abierto toda la noche.
  Viernes: se va a las 15:30. El lunes 16 rechaza la carta.
- **media** (en, 360 px): media jornada de mañana de lunes a viernes; el miércoles, «Hoy es distinto» y jornada
  entera. El lunes 16 acepta la carta y dice que sí a la pregunta de las horas.
- **salta** (es, 360 px): jornada de 9 a 17 en el papel, pero llega a las 9:40; cambia la primera pausa con
  «Otra», se salta casi todas y el miércoles no abre PACE (portátil cerrado del martes al jueves). El lunes 16
  acepta los cambios de la carta y dice que no a la pregunta de las horas.

## Dónde me quedo (8 nov.)

**La unión con abierta-horas.** `git merge origin/claude/abierta-horas-7nov-a2419d`: los dos `state-ritmo` se juntaron
solos (S1 y E1 tocan `ritmoBloqueEmpezado` en líneas distintas y los dos arreglos siguen dentro); solo chocó
`DECISIONES_TECNICAS_VIGENTES.md`, con las filas de las dos ramas arriba. `state-ritmo.jsx` quedó en 505 líneas:
`ritmoDurSiEmpiezas` pasó a `state-ritmo.ahora.jsx`, que va de lo mismo (el día leído desde ahora). Al juntarlas
cayó `ritmo-reunion-tarde`, y no por lo que mide: era un fallo nuevo de la unión (S8, abajo), arreglado.
`verify` pasa. La zona con un worker en el 8892 (`ritmo-*`, `aro-jornada`, `cambio-de-dia`, `sello-aro`,
`abierta-horas`, `bloques-cortos`) y las vecinas que leen el temporizador guardado (`android-avisos`,
`android-calendario`, `android-nativo`, `caza-foco`, `checklist-foco`, `estado-saneado`, `importar-borrar`,
`textos-honestos`): **290 de 290** (11,3 min). Ninguna prueba hubo que ponerla al día por E1 o V2.

**La página de Ez:** `docs/audits/caza-semana-7nov/pagina-ez.html` (264 KB, un solo archivo con las fotos en webp
dentro), publicada en https://claude.ai/artifact/C8okoSLuDnN2bBxtSdQSbw. Se rehace con `fotos-ez.js` (8893) y
`pagina-ez.js` (la plantilla al lado). Tres casos, con la recomendada primero:
- **S3 · el Foco libre tras la jornada**: A vuelve a tus minutos de antes del día (25 si nunca los cambiaste);
  B el bloque normal de ese día (35 o 45); C como ahora (33, los del último bloque).
- **S7 · la comida saltada con un bloque**: A el bloque empezado antes de comer acaba a la hora de comer (14 min a
  las 13:46), como antes de una reunión; B como ahora (45 min, hasta las 14:31); C sin «Empezar ya el bloque» en
  la pausa de antes de comer. Nota en la página: en plena reunión el aro ofrece «Empezar bloque 3 · 45:00» y se
  queda así salvo que Ez diga otra cosa (quien lo pulsa no está en la reunión).
- **S6 · la carta que no cambia nada**: A si ya era de 2 minutos no lo propone; B como ahora.

La foto de la A de S7 cambia `ritmoDurSiEmpiezas` en la página (la regla de la A); de ella solo se enseña el aro,
porque la línea de abajo no está hecha para la A y pondría una pausa a las 14:00 en vez de la comida.

**oficina otra vez** (`semana.js oficina es escritorio`, 8892, con la espera de la reunión corregida y abierta-horas
dentro): los cinco días, la carta y el martes 17, **sin errores de consola**. Nueve bloques el lunes, miércoles y
jueves; ocho el martes con las dos reuniones, y el bloque 2 acaba a las 10:00 en punto (S1). El miércoles, con el
portátil cerrado de 12:19 a 13:09, el bloque 5 cuenta y el aro dice «Pausa terminada» (A1 y V1 de abierta-horas).
El viernes se va a las 15:56. El lunes 16 rechaza la carta («No, déjala») y el martes 17 el día es el de siempre.
La carta («Terminas a las 19:05. ¿Pongo tu salida a las 19:05?») no es del banco, como creí el 7 nov.: es S10.
Visto también, para quien lleve V2: con el día cerrado por la hora y bloques sin hacer, el aro dice «Tu jornada ya
terminó» pero sigue con el texto y el botón de antes («Ciclo completado · Empezar otro ciclo» el miércoles,
«Atención sostenida · Empezar foco · 30:00» el viernes), no con «Lo que queda del día es tuyo · Seguir por libre».
Y S3 en el banco: tras el jueves, el viernes por la mañana el Foco libre está en 24.

**salta otra vez** (`semana.js salta es movil`, 8892): sin errores de consola, sin scroll, cortes ni textos sin
traducir. «Otra» queda apuntado con lo descartado los tres días (`10:25 p hecha extra.legs.standing×1[extra.desk.pushups]`,
S4). La carta no trae «descansa»: «Empuje sencillo» se descartó el lunes y el martes, pero el jueves la primera pausa
servía «Piernas sin pasos» y el «Otra» cayó sobre ella (las rutinas cambian de un día a otro); con dos no llega. Es el
banco: `tests/ritmo-otra-carta.spec.js` lo cubre con tres días sobre la misma rutina. La carta pregunta «¿Pongo tu
entrada a las 9:40?» (contestada «No», el martes 17 empieza a las 9:00) y S3 sale cada mañana (Foco libre en 34).

**Falta:** las letras de Ez (S3, S7 y S6) y S10 (sin arreglar).

Para correrlo: `PORT=8892 node .claude/static-server.js` en segundo plano (y 8893 para el segundo) y
`PACE_E2E_PORT=8892 RECORRIDO_FOTOS=<carpeta> node docs/traspaso/archivos/caza-semana-7nov/semana.js oficina es escritorio`.
No compiles (`build-standalone.js`) mientras corre una suite en la misma carpeta: la suite prueba lo que haya.

## Lo encontrado hasta ahora

### S8 · Al juntar E1, el primer bloque del día se perdía sin contarse al acabar · bloquea (código) · ARREGLADO

- **Pasos** (`tests/ritmo-reunion-tarde.spec.js`, ya con abierta-horas dentro): martes, jornada elegida y empezada
  a las 8:52; el bloque 1 acaba a las 9:37.
- **Qué pasaba:** la home volvía a «Empezar jornada · Bloque 1 de 7», `cycle` seguía en 0 y no salía la pausa.
- **Por qué:** entre que el bloque acaba y FocusTimer lo cuenta (su vuelta siguiente; con la pestaña de fondo,
  hasta un minuto), la clave `pace.timer.v1` sigue con el `endsAt` ya pasado y `ritmoFocoCorriendo` decía que no
  había bloque. Con E1 (`ritmoDesdeSinEmpezar`), el día con el primer bloque sin contar se leía «sin empezar»
  desde ahora; RitmoHome llamaba a `ritmoSincronizar`, el aro pasaba de 45 a 43 min y
  `loadPersistedFocusTimer` ya no casaba los minutos: el bloque se tiraba.
- **Arreglo:** `ritmoFocoCorriendo` cuenta también el `endsAt` de hoy ya pasado (FocusTimer borra la clave al
  contarlo o al quedarse parado). Fila arriba del todo en `DECISIONES_TECNICAS_VIGENTES.md`. Lo vigila
  `tests/ritmo-reunion-tarde.spec.js`, que sin el arreglo cae en su primer `terminarBloque`.

### S10 · Un Foco que acaba con el portátil cerrado se apunta a la hora de volver, y la carta propone mover tu salida · molesta (código) · por arreglar

- **Pasos** (`semana.js oficina`): lunes, martes y jueves, al acabar la jornada, «Seguir por libre» a las 17:04 (25
  min, acaba a las 17:29); PACE abierto y el reloj salta a las 19:00, como con el portátil cerrado.
- **Qué pasa:** el lunes 16 la carta pregunta «Terminas a las 19:05. ¿Pongo tu salida a las 19:05?».
- **Por qué:** `emitSessionCompleted` (`state-events.jsx`) apunta `session.completed` a la hora en que PACE cuenta el
  Foco, no a la hora en que acabó; con el portátil cerrado (o PACE cerrado y abierto el mismo día) es la hora de
  volver. `motorHoras` (`ritmo.motor.js`) saca tu salida del último Foco del día (`hasta` + el cierre): tres días a las
  19:00 y propone las 19:05. A1 de abierta-horas ya arregló lo mismo en el plan del día (`finBloque`), no en el
  evento. Arreglo probable: que el Foco vencido se apunte con su `endsAt`. No se tocó (tope de uso).

### S9 · Con la jornada cerrada, el punto del aro tapa «Ciclo 4 / 4» · pulido (visual) · para mirar

- En las fotos de S3 (`ez-s3-*-hoy-tarde`, 1280 y 360): el punto verde del final del aro cae encima de «Siguiente
  · Ciclo 4 / 4», bajo «Seguir por libre». Además «Siguiente · Ciclo 4 / 4» con la jornada cerrada no dice nada.
  Es visual: va con maqueta, no se tocó.


### S1 · El bloque de antes de una reunión, empezado tarde, se mete en la reunión · molesta (código) · ARREGLADO

- **Pasos** (`_reunion.js`): martes con reuniones a las 10:00-11:00; jornada de 9:00 empezada a las 8:52; al
  acabar el bloque 1 (9:37), «Ahora no»; a las 9:45, «Empezar bloque 2».
- **Qué pasa:** a las 9:37 el plan pone el bloque 2 de 9:42 a 10:00 (18 min) y el aro se queda en 18:00. Empezado
  a las 9:45, el bloque dura sus 18 min y acaba a las **10:03, dentro de la reunión**; y la línea pinta la reunión
  de **10:03 a 11:00** (`o10:03+57`), cuando en el calendario es a las 10:00.
- **Qué debería pasar:** la regla ya lo dice para el día que compone: «antes de una reunión, el bloque deja sitio
  a su pausa; si no cabe ni eso, acaba al empezar la reunión». El bloque empezado tarde debería acabar a las 10:00
  (15 min) y la reunión seguir a las 10:00.
- **Por qué:** `ritmoSincronizar` pone el aro con la duración del plan compuesto a las 9:37, y al empezar
  (`ritmoBloqueEmpezado`) «el bloque que acaba de empezar dura lo que marca el aro, pase lo que pase»
  (`ritmo.regla.js`, `enMarcha`): la reunión se corre detrás.
- Va con E1 de `claude/abierta-horas-7nov-a2419d` (el día elegido y sin empezar se queda en la hora de elegir):
  la duración que enseña el aro antes de empezar sale de un plan viejo.

### S2 · La ventana tras ese bloque es la de siempre y dice «Foco de 45 minutos» de un bloque de 18 · molesta (código) · ARREGLADO

- **Pasos:** los mismos; a las 10:03 acaba el bloque 2.
- **Qué pasa:** detrás del bloque no hay pausa sino la reunión, así que `ritmoPropuesta` no sirve nada y sale la
  ventana de siempre: «Ciclo completado · Pausa bien hecha · Has cerrado un bloque. Elige tu pausa. **Has
  terminado un Foco de 45 minutos**», con una Estira. El bloque fue de 18 min: 45 es el del bloque siguiente, al
  que el aro ya se ha sincronizado. Y `dia.pausa` queda en 2 aunque no haya pausa (el plan toma la reunión como
  «la pausa abierta»).

- **Arreglo de S1 y S2:** `ritmoDurSiEmpiezas` (`app/state-ritmo.ahora.jsx`): si empiezas tarde y detrás viene una
  reunión, el bloque deja sitio a su pausa o acaba al empezar la reunión; el aro la marca (cada minuto y al volver
  a la página) y empezar con ella no cuenta como «otra duración». `breakPropuesta` lee los minutos del último
  bloque hecho del plan. Comprobado con `_reunion.js`: a las 9:45 el aro dice 15:00, el bloque acaba a las 10:00,
  la reunión sigue de 10:00 a 11:00 y el bloque de las 11:00 sigue de 45.

### S4 · Lo que se cambia con «Otra» llega al resumen del día sin la rutina descartada · bloquea lo que aprende (código) · ARREGLADO

- **Pasos:** el banco de **salta** (`semana.js salta es movil`): «Otra» en la primera pausa el lunes, el martes y el
  jueves, y se hace la nueva. El lunes 16, en el registro: `10:25 pausa hecha extra.legs.standing ×1 []`.
- **Qué pasa:** el resumen (`ritmo.day.closed`) dice que la pausa se cambió una vez (`otras: 1`) pero no qué se
  descartó (`antes: []`). `ritmoResumenDe` lo saca recomponiendo el día (`ritmoDescartados`) y se lo salta en lo
  congelado (`!it.congelado`), y en un día de verdad todo lo pasado está congelado: cada bloque que empieza o acaba
  a una hora que no es la del plan congela lo de antes. El motor cuenta lo descartado para proponer que una rutina
  descanse (`ritmo.motor.js`, `otras[id]`): **nunca puede proponerlo** con datos de uso real.
- **Arreglo:** `ritmoOtra` apunta en el día el id del plato que se descarta al pulsar (`dia.descartes[clave]`) y el
  resumen lo usa antes que recomponer. `tests/ritmo-otra-resumen.spec.js`: «Otra» en la primera pausa, el bloque 2
  empezado antes de su hora (la pausa queda en `dia.pasado`) y, al día siguiente, el resumen dice `antes: [la
  rutina descartada]`. Roja con el arreglo quitado (`antes: []`). Falta la prueba de punta a punta: tres días con
  «Otra» sobre la misma rutina y la carta del lunes que propone que descanse.

### S5 · El sello del aro se queda encima del número si el aro cambia mientras se ve · molesta (código) · ARREGLADO

- **Pasos** (`fotos-ez.js`, la comida): viernes, jornada entera; en la pausa de las 13:45 sale «Nuevo sello · Día
  de foco» en el aro, en el sitio de «Luego, el bloque 7»; «Ahora no» y «Empezar ya el bloque 7».
- **Qué pasa:** el aro pasa a ser el del bloque (el número crece, su línea baja) y el sello se queda donde
  estaba, encima del 45:00. A 360, tras la jornada, «Nuevo sello · Primer paso» sobre el 45:00.
- **Por qué:** `toastHuecoDelAro` se medía una vez, al salir, y el sello es `position: fixed`.
- **Arreglo:** `SelloEnAro` vuelve a medir con cada cambio de la página o de la ventana (y cada 250 ms).

### S6 · La carta propone «pasa a ser de 2 minutos» para una pausa que ya era de 2 · espera a Ez (página)

- **Pasos:** la persona **media** (en, 360): la pausa de las 12:15 saltada lunes, miércoles y jueves, con
  «Escritorio express» y «Tronco sentado», las dos de 2 minutos. El lunes 16 la carta: «La pausa de las 12:15, que
  saltaste tres días, pasa a ser de 2 minutos». Aceptada, el martes 17 sirve otra de 2 minutos: no cambia nada.
- **Por qué:** el motor no sabe los minutos de lo servido (el resumen guarda ids, no minutos). Cambia lo que
  propone la carta: va a la página de Ez.

### S7 · La comida, saltada con un bloque, se queda atrás · molesta (producto) · espera a Ez (página)

- **Pasos** (`fotos-ez.js`, la comida): viernes, jornada entera, comida a las 14:00; en la pausa larga de las 13:45,
  «Ahora no» y, a las 13:46, «Empezar ya el bloque 7».
- **Qué pasa:** el bloque (45 min, el de después de comer) va de 13:46 a 14:31; la línea deja la comida atrás, como
  si hubiera pasado, lo siguiente es una pausa a las 14:31 y el día pasa de 9 a 10 bloques. Es lo que pidió al
  pulsar, pero nada le dice que trabaja en su hora de comer. `ritmoDurSiEmpiezas` solo mira la reunión que viene
  detrás de un bloque empezado tarde; este empieza antes de su hora, con la comida por medio.
- Parecido en plena reunión: a las 10:04, con la reunión de 10:00 a 11:00, el aro ofrece «Empezar bloque 3 · 45:00».

### S3 · Al acabar la jornada, el «Foco manual» se queda con la duración del último bloque · espera a Ez (página)

- Tras la jornada el aro dice «Foco manual» con 28 o 34 min (lo que duró el último bloque recolocado) y así sigue
  a la mañana siguiente antes de preparar el día. Quien empieza un Foco por libre después de la jornada lo
  empieza de 28 o 34 min.
- Con V2 A dentro (8 nov.): tras el último bloque el aro dice «Jornada cerrada · Seguir por libre», y «Seguir por
  libre» empieza un Foco de 33 (el último bloque de la jornada de dos horas); a la mañana siguiente, «Foco manual
  · 33:00» y un «33» en la fila de minutos.

### Visto y apuntado, sin ser fallo

- **La pregunta de las horas va antes que la pausa corta:** salta se saltó la pausa de las 11:15 cuatro días, pero la
  carta solo trae «¿Pongo tu entrada a las 9:40?»: es la regla (uno de rutinas y uno de la forma, y las horas
  primero). Contestada «No», no se aplica nada y el martes empieza a las 9:00 (comprobado).
- La racha vuelve a 0 el lunes tras el fin de semana libre: es la regla de días seguidos.

## Lo que salió bien hasta ahora

- El `.ics` del lunes: nueve eventos con sus horas locales y su pausa en el título, iguales al plan.
- Las reuniones de Google: «Hoy tienes 2 reuniones y el día las rodea», siete bloques escritos, y el día las
  esquiva (`o10:00+60`, `o15:00+30`).
- El lunes de oficina entero: nueve bloques, la comida a su hora, los estados de cada parada (`hecha`/`saltada`)
  iguales a lo que se hizo, el día cerrado a las 19:00 («Tu jornada ya terminó») y el resumen del lunes en el
  registro al abrir el martes. Ningún error de consola de la app.
