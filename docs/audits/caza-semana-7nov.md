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

## Dónde me quedo (7 nov., uso de la cuenta al 88 %: paro aquí)

Hecho: el banco; la semana entera de **oficina** y de **salta**, con su lunes 16 (la carta) y su martes 17;
S1 y S2 arreglados con su prueba (`tests/ritmo-reunion-tarde.spec.js`, roja con cada arreglo quitado: el aro
en 18:00, y la ventana con «45 minutos») y su fila en `DECISIONES_TECNICAS_VIGENTES.md`; `verify` en verde.
S4 arreglado con su prueba (roja sin el arreglo) y su fila; `verify` en verde tras cada arreglo. Las pruebas de la zona («ritmo-*», `aro-jornada`, `cambio-de-dia`) **no se han pasado aún** con `--workers=1`: es lo primero.
**Falta, por orden:** la zona con un worker; repetir
**oficina** limpia (el martes el banco se paró a las 10:52 tras la ventana de siempre y dejó esa página abierta, así
que el miércoles corrió con dos pestañas: de ahí el resumen del 11 repetido y la pregunta «¿Pongo tu salida a las
13:15?», que salen de lo que el banco dejó de hacer); la persona **media** (en, 360); Estadísticas y Logros (el banco
no encontró sus botones: son «Ver estadísticas» y «Ver logros», por `aria-label`); es/en a 360 y 1280; la suite
de la zona con `--workers=1`; y la página de Ez en `docs/audits/caza-semana-7nov/pagina-ez.html` con sus fotos.
Para correrlo: `PORT=8892 node .claude/static-server.js` en segundo plano y
`PACE_E2E_PORT=8892 RECORRIDO_FOTOS=<carpeta> node docs/traspaso/archivos/caza-semana-7nov/semana.js oficina es escritorio`
(y `salta es movil`, `media en movil`, en el 8893 con su servidor).

## Lo encontrado hasta ahora

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

- **Arreglo de S1 y S2:** `ritmoDurSiEmpiezas` (`app/state-ritmo.jsx`): si empiezas tarde y detrás viene una
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

### S3 · Al acabar la jornada, el «Foco manual» se queda con la duración del último bloque · pulido (por mirar)

- Tras la jornada el aro dice «Foco manual» con 28 o 34 min (lo que duró el último bloque recolocado) y así sigue
  a la mañana siguiente antes de preparar el día. Quien empieza un Foco por libre después de la jornada lo
  empieza de 28 o 34 min. Por confirmar si es a propósito.

### Visto y apuntado, sin ser fallo

- **La comida, saltada con un bloque:** el viernes, quien se salta la pausa de las 13:42 y empieza el bloque 6
  a las 13:43 trabaja de 13:43 a 14:28: el bloque (45 min, el de después de comer) se come la comida y el día pasa
  de 8 a 9 bloques. Es lo que pidió al pulsar; el aro podría marcar lo que cabe hasta la comida (como con las
  reuniones). Para Ez.
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
