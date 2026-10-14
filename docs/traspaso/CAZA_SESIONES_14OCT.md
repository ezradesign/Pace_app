# Caza del 14 de octubre: las sesiones guiadas

La caza del Foco (`CAZA_FOCO_ESTADO_10OCT.md`) dejó fuera Respira, Mueve y Estira, y la del 7 de
octubre (`CAZA_BUGS_7OCT.md`) las recorrió por dentro (fases, textos, cierres) pero no miró qué pasa
con una sesión cuando la vida se mete por medio. Esta recorre eso con el `index.html` de `main` en
v0.162.0, en el móvil (360 × 718, táctil) y en el escritorio (1536 × 680): pausar, recargar, salir,
dos pestañas, la página oculta o el equipo dormido, el botón atrás de Android, el sonido, la apnea,
el cierre con su «¿te ayudó?», lo que cuenta al terminar y las rutinas propias. **Solo está lo que
se ha reproducido**: cada hallazgo lleva sus pasos y lo medido. Las sondas viven fuera del repo;
cada arreglo deja su prueba en `tests/`.

Gravedad: **pierde datos** (algo que hiciste desaparece), **descuadra** (las cuentas dicen algo que
no pasó) y **molesta** (no se pierde nada, pero confunde).

«Cambia lo que se ve» quiere decir que el arreglo pone en pantalla algo distinto de lo que hay hoy;
esos esperan el sí de Ez con fotos de antes y después. Los demás se arreglan sin preguntar, con una
prueba que falla en `main` y pasa en la rama.

**Estado el 14 de octubre:** los seis que no cambian lo que se ve están en v0.163.0, cada uno con su
prueba en `tests/caza-sesiones.spec.js` (roja contra v0.162.0). Los tres que sí lo cambian
(sesiones-7, 8 y 9) los vio Ez con fotos de la app real (`docs/proposals/sesiones-tres-preguntas.html`)
y eligió A en los tres; están arreglados en `claude/caza-sesiones-a8e105`, con sus pruebas rojas
contra v0.163.0 y un banco de 8 mutantes, todos muertos.

«Dormido» es el equipo en reposo o la app congelada por el sistema: el reloj de la pared sigue y la
página no corre ni se entera de que se ha ocultado (un portátil que se cierra, Android con la app en
el fondo). En las pruebas se hace saltando el reloj sin disparar ningún temporizador.

## Lo que se cuenta

### ~~sesiones-1 · Respira cuenta como practicado el rato con el equipo dormido~~
- **Arreglado:** el reloj de tiempo activo (`app/ui/SessionClock.jsx`, el de Respira y el de Mueve y Estira) late cada segundo y deja fuera todo hueco de más de 15 s entre latidos (`PACE_HUECO_MS`); la página oculta pero viva sigue contando (`tests/caza-sesiones.spec.js`, también con la retención).
- **Gravedad:** descuadra. **Cambia lo que se ve:** no (solo la cifra del cierre, que pasa a ser
  la de verdad).
- **Pasos:** Box 4·4·4·4 (5 min). Respirar 30 s y dejar el equipo dormido 30 minutos. Al volver, la
  sesión termina sola en la siguiente respiración con «30:00 TIEMPO».
- **Medido (móvil y escritorio):** `breathMinutes` +30, `breatheSessionsTotal` +1 y un
  `session.completed` con `activeSeconds: 1800` sobre un plan de 300. Los minutos de más empujan el
  logro «Maratón» (2000 minutos de vida) y el motor de la semana los leerá del registro.
- **Por qué:** el reloj de tiempo activo de Respira mide de pared mientras la sesión corre, y el
  rato dormido cae dentro del tramo abierto. La regla de s101/s102 es que no se acredita lo que no
  se ha presenciado; con la página viva y oculta (con su voz o su música) sí cuenta, como hasta hoy.

### ~~sesiones-2 · Mueve y Estira acreditan las pausas~~
- **Arreglado:** la semana recibe el tiempo de la sesión en marcha, con colocaciones y descansos pero sin pausas ni huecos (`useV1SessionClock`, en los dos runners). El evento no cambia: su `elapsedSeconds` sigue siendo de pared, como manda el esquema (`tests/caza-sesiones.spec.js`).
- **Gravedad:** descuadra. **Cambia lo que se ve:** no en la semana y las estadísticas. La cifra del
  cierre es aparte: sesiones-8.
- **Pasos:** Gemelos subrepticios (Mueve). Pausar a los 12 s, esperar 20 minutos, seguir y
  terminar: la semana suma 20 minutos de Mueve. Con Cuello (Estira), bloquear el móvil una hora a
  mitad (la sesión se pausa sola, como decidió Ez) y terminar al volver: 60 minutos de Estira.
- **Medido:** `moveMinutes` +20 y +60; el cierre dice «20:12» y «60:15»; los eventos dicen
  `activeSeconds` 7 en los dos, así que la semana y el registro no casan.
- **Por qué:** los minutos se sacan de la hora de inicio a la de fin (`sessionStart`), con las
  pausas dentro. Respira las deja fuera desde s98.

### ~~sesiones-3 · Si se oculta la página en «Prepárate», Mueve y Estira se hacen solas~~
- **Arreglado:** si la página ya está oculta cuando la sesión arranca, se pausa al arrancar (`useSesionAlOcultar`, `tests/caza-sesiones.spec.js`).
- **Gravedad:** descuadra. **Cambia lo que se ve:** no (al volver, la sesión está en pausa, como
  cuando se oculta a mitad).
- **Pasos:** Cuello (Estira) o Gemelos (Mueve). En «Prepárate 4», cambiar de pestaña o bloquear el
  móvil. Volver a los 10 minutos: «Estiramiento completado · 3:50 · 4 pasos · 5 reps».
- **Medido (móvil y escritorio):** cuenta una sesión entera que nadie hizo: los minutos, el plan del
  día (`extra: true`), las repeticiones «guiadas» (45 en Gemelos) y, con «A tu ritmo», la pausa
  hecha.
- **Por qué:** la pausa al ocultar solo escucha mientras la sesión corre; la preparación no se
  pausa, así que si la página ya está oculta cuando la sesión arranca, nadie la pausa.

### ~~sesiones-4 · Con el equipo dormido, Mueve y Estira saltan el paso y lo cuentan como trabajo~~
- **Arreglado:** un hueco de más de 15 s no avanza el ejercicio y pausa la sesión, como al ocultar la página (`useRelojSesion` y `useSesionAlOcultar`, `tests/caza-sesiones.spec.js`).
- **Gravedad:** descuadra. **Cambia lo que se ve:** no (al volver, la sesión está en pausa en el
  mismo paso, como al ocultar la página).
- **Pasos:** Cuello (Estira). Empezar el primer ejercicio y dejar el equipo dormido 30 minutos sin
  que la página se oculte (portátil cerrado). Al volver, la sesión está en el paso 2.
- **Medido:** `moveMinutes` +30 y `activeSeconds` 1808 en un ejercicio de 40 s: el rato dormido
  entra como trabajo.
- **Por qué:** el reloj por marcas de tiempo (s200) se pone al día con todo lo que ha pasado, y el
  rato dormido llega como segundos de ejercicio.

### ~~sesiones-5 · El «Tiempo» del cierre de Mueve y Estira sigue corriendo~~
- **Arreglado:** la cifra se congela al completar, en los dos runners (`tests/caza-sesiones.spec.js`). Sigue siendo de pared, con las pausas dentro: eso es sesiones-8.
- **Gravedad:** molesta. **Cambia lo que se ve:** no (la cifra deja de moverse).
- **Pasos:** terminar cualquier rutina de Mueve o Estira (también las propias) y, a los 30 s,
  contestar «¿Te ayudó esta pausa?»: el cierre pasa de «1:00» a «1:30».
- **Por qué:** la cifra se calcula en cada pintada con la hora de ese momento. Respira la congela.

### ~~sesiones-6 · Con dos pestañas, la segunda ofrece seguir una Respira que está viva en la primera~~
- **Arreglado:** la pestaña con la sesión abierta deja un latido en `pace.breathe.viva` (cada 5 s, válido 15 s) y, mientras late, las demás no la ofrecen; al salir o cerrar se borra y se ofrece otra vez, y la barra lateral se vuelve a mirar sola (`tests/caza-sesiones.spec.js`).
- **Gravedad:** descuadra. **Cambia lo que se ve:** no (mientras la sesión siga viva en la otra, la
  tarjeta ofrece lo que ofrecería sin ella).
- **Pasos:** Box en la pestaña A. Abrir PACE en la pestaña B: la barra lateral dice «Continúa · Box
  4·4·4·4 · La dejaste a medias». Si se toca, las dos respiran la misma sesión, y al terminar las
  dos cuentan.
- **Medido:** `breatheSessionsTotal` 2, dos `session.completed` y un minuto en cada uno.

## Lo que eligió Ez

### ~~sesiones-7 · «Terminar» nada más empezar cuenta una sesión entera~~
- **Arreglado (Ez eligió A):** con menos de medio minuto de práctica no cuenta nada y el cierre lo
  dice, «Sesión sin contar», sin cifras ni «¿Te ayudó esta pausa?»; en un Camino, el paso sigue como
  saltado. Desde 30 s el redondeo ya daba un minuto, así que por encima no cambia nada.
- **Gravedad:** descuadra. **Cambia lo que se ve:** sí.
- **Pasos:** Box 4·4·4·4 → «Empezar ahora» → «Terminar»: «Sesión completada · 0:00 TIEMPO». Tres
  veces seguidas dan tres logros: «Primer aliento», el de explorar Box (que pide tres sesiones de la
  técnica) y «Lluvia» (tres respiraciones el mismo día). En Estira, tocar «siguiente» hasta el final
  (1 s) da «Estiramiento completado · 0:01» y el plan del día hecho.
- **Medido:** cada una suma 1 minuto (el mínimo que se acredita «si hubo práctica») y un evento con
  `activeSeconds: 0`.

### ~~sesiones-8 · El «Tiempo» del cierre de Mueve y Estira lleva las pausas dentro~~
- **Arreglado (Ez eligió A):** el cierre dice el tiempo de la sesión sin las pausas, el mismo número
  que va a la semana (con colocarse, cambiar de lado y los descansos).
- **Gravedad:** molesta. **Cambia lo que se ve:** sí.
- **Pasos:** Gemelos subrepticios con una pausa de 20 minutos a mitad (en la vida real, bloquear el
  móvil a mitad, que pausa la sesión, y volver al rato): el cierre decía «21:35 TIEMPO» tras 1:35 de
  rutina. En Respira, el mismo caso dice el tiempo respirado, sin la pausa.

### ~~sesiones-9 · Recargar o salir a mitad de Mueve y Estira lo pierde todo~~
- **Arreglado (Ez eligió A):** como Respira, la barra ofrece «Continúa · Cuello · Paso 2 de 4»; al
  tocarla se entra por «Prepárate» al principio de ese paso y lo hecho antes se suma al terminar.
  Dura dos horas y el mismo día; en un Camino no se guarda.
- **Gravedad:** descuadra. **Cambia lo que se ve:** sí (haría falta ofrecer seguir).
- **Pasos:** Cuello (Estira), un minuto dentro, recargar (o «Hay una versión nueva», o «Salir»): la
  sesión desaparece, no cuenta nada y la barra lateral no ofrece seguir. En Respira, la misma
  recarga deja «Continúa · La dejaste a medias», por la ronda o por el tiempo practicado (s186).

## Lo que falta

### sesiones-10 · La voz masculina (bradford) se oye entrecortada en el navegador de un Android
- **Gravedad:** molesta. **Cambia lo que se ve:** no, pero cambia cómo suena: Ez lo oye en su móvil
  antes de subirlo.
- **Pasos (lo vio Ez; aquí no se ha reproducido):** Respira con la voz masculina en castellano, en
  el navegador de un Doogee Blade 20 Max (Android, MediaTek de gama media): se oye entrecortada. La
  femenina (sulafat) se oye bien en el mismo móvil. No se sabe si sonaba la música. De la APK no ha
  dicho nada.
- **Pistas, sin comprobar en un móvil:** los MP3 son distintos (bradford, MPEG-1 a 44,1 kHz y
  128 kbps; sulafat, MPEG-2 a 24 kHz y 160 kbps). bradford empieza a sonar en el primer
  milisegundo («inhala» y «mantén», ini 0,001) y su «exhala» llega al final del archivo; sulafat
  lleva 0,39 s de silencio delante. Si Android tarda en abrir la salida del elemento de audio, el
  arranque de bradford se come la palabra. La música de Respira es Web Audio en directo y puede
  cargar la CPU de un móvil modesto: probar con la música apagada.
- **Lo que se probó (14 oct.):** una página con la palabra sonando de cuatro maneras
  (https://claude.ai/artifact/8X535itr15XDyTheDewDrq, en la cuenta nueva): como hoy (un `<audio>`
  por palabra, rebobinado), con una décima de silencio delante (cuatro tramas MP3 de silencio
  metidas tras la trama «Info», sin recodificar), con un silencio de fondo sonando durante la
  prueba, y por Web Audio. En el móvil de Ez **la de hoy ya se oye limpia**, así que el corte no
  viene de cómo arranca el clip, sino de lo que la app hace a la vez: la música de Respira (tres
  MP3 de 1,6 MB descodificados en Web Audio y un drone sintetizado), el tono, la animación.
- **Lo siguiente:** que Ez lo pruebe en la app, en el móvil, en castellano con «Voz grave», con
  la música puesta y con «Suena detrás: Nada». Si solo se corta con música, el arreglo probable es
  que la voz salga por el mismo Web Audio que la música (la variante 4 de la página), o no
  descodificar la música mientras habla la voz. Si se corta también sin música, mirar la
  animación y el resto de la sesión con el perfil de rendimiento de Chrome en el móvil.

## Lo que se probó y no falla

- Respira: pausar y seguir (el tiempo en pausa no cuenta; la música se apaga y vuelve); recargar a
  mitad (el registro guarda el tiempo practicado al ocultarse o cerrarse, y la barra lateral, en el
  móvil dentro del cajón, ofrece «Continúa»); salir a mitad (no cuenta y se puede seguir); la página
  oculta con la sesión viva (sigue sonando y contando, como se decidió).
- Rondas express de punta a punta en las dos medidas: el aviso de apnea con el botón apagado hasta
  marcar la casilla, dos retenciones, «2 rondas · 50 respiraciones», `holdSeconds` con lo retenido,
  un solo evento y su `feedback.answered`, y el sello «Primer aliento» dentro del aro al salir.
- Mueve y Estira: al ocultar la página a mitad se pausan y al volver siguen en pausa (s200); no
  suena ninguna ráfaga de avisos atrasados.
- Rutinas propias de «Tus rutinas» (con PACE completo) por Mueve y por Estira, en castellano y en
  inglés: el descanso va como descanso, cuentan como Mueve entren por donde entren y su evento lleva
  su plan.
- El botón atrás de Android sale de la sesión como Escape (`tests/android-nativo.spec.js`): en
  Respira se puede seguir después, y desde sesiones-9 también en Mueve y Estira.
- El sonido al salir a mitad: la música se apaga con su fundido y no queda nada sonando.

**Trampa de las pruebas.** La semilla de `tests/helpers.js` no lleva `weeklyStats` ni la marca de la
migración de s69, así que el primer guardado escribe la marca en falso y la siguiente lectura (otra
pestaña o una recarga) corre los minutos de la semana un día atrás. Una instalación real nunca
llega ahí (nace con la marca puesta), pero una prueba que siembre así y lea la semana tras recargar
mide un día equivocado. Las pruebas de esta caza siembran la marca.

## Lo que queda para un móvil de verdad

- Respira con la pantalla bloqueada: si la voz y la música siguen sonando y la sesión sigue al día.
- Android con la app en el fondo durante una sesión: Mueve y Estira deben volver en pausa, y Respira
  sin haber contado el rato del fondo si el sistema la congeló (sesiones-1).
