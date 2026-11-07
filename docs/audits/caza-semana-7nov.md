# Caza de la semana · 7 nov. 2026 (EN MARCHA, WIP)

Rama `claude/caza-semana-21914d`, sobre `claude/recorrido-6nov-645d6b` (42ae69c7), probando el `index.html`
compilado. Una persona vive con PACE del lunes 9 al martes 17 de noviembre de 2026 con el reloj de la página
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

## Dónde me quedo (7 nov., uso de la cuenta al 63 % y subiendo deprisa)

Hecho: el banco y una primera vuelta de lunes y martes de **oficina** y de **salta** (la semana entera de
salta corrió, pero otro proceso suyo que no murió al pararlo escribía en el mismo registro: hay que repetirla).
Falta: repetir las tres semanas enteras con el servidor fijo, el lunes 16 con la carta y el martes 17, los
logros, Estadísticas, es/en a 360 y 1280, y arreglar lo de abajo. **Siguiente paso:** `PORT=8892 node
.claude/static-server.js` en segundo plano y `PACE_E2E_PORT=8892 node docs/traspaso/archivos/caza-semana-7nov/semana.js oficina es escritorio`
(y `salta es movil`, `media en movil` en el 8893).

## Lo encontrado hasta ahora

### S1 · El bloque de antes de una reunión, empezado tarde, se mete en la reunión · molesta (código)

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

### S2 · La ventana tras ese bloque es la de siempre y dice «Foco de 45 minutos» de un bloque de 18 · molesta (código)

- **Pasos:** los mismos; a las 10:03 acaba el bloque 2.
- **Qué pasa:** detrás del bloque no hay pausa sino la reunión, así que `ritmoPropuesta` no sirve nada y sale la
  ventana de siempre: «Ciclo completado · Pausa bien hecha · Has cerrado un bloque. Elige tu pausa. **Has
  terminado un Foco de 45 minutos**», con una Estira. El bloque fue de 18 min: 45 es el del bloque siguiente, al
  que el aro ya se ha sincronizado. Y `dia.pausa` queda en 2 aunque no haya pausa (el plan toma la reunión como
  «la pausa abierta»).

### S3 · Al acabar la jornada, el «Foco manual» se queda con la duración del último bloque · pulido (por mirar)

- Tras la jornada el aro dice «Foco manual» con 28 o 34 min (lo que duró el último bloque recolocado) y así sigue
  a la mañana siguiente antes de preparar el día. Quien empieza un Foco por libre después de la jornada lo
  empieza de 28 o 34 min. Por confirmar si es a propósito.

## Lo que salió bien hasta ahora

- El `.ics` del lunes: nueve eventos con sus horas locales y su pausa en el título, iguales al plan.
- Las reuniones de Google: «Hoy tienes 2 reuniones y el día las rodea», siete bloques escritos, y el día las
  esquiva (`o10:00+60`, `o15:00+30`).
- El lunes de oficina entero: nueve bloques, la comida a su hora, los estados de cada parada (`hecha`/`saltada`)
  iguales a lo que se hizo, el día cerrado a las 19:00 («Tu jornada ya terminó») y el resumen del lunes en el
  registro al abrir el martes. Ningún error de consola de la app.
