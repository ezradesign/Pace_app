# La cola única: las auditorías de Fable del 9 y 10 nov., juntas

La mía (`auditoria.md`, vivida en la app) y las cinco pasadas de la externa (`externa-10nov.md` y
`externa-10nov-pasadas-2-3-4.md`, que lleva de la 2 a la 5, leídas en `main`), comprobadas en `externa-10nov-comprobado.md` y
`externa-10nov-pasadas-2-3-4-comprobado.md`. La sexta (nativo, compra en el móvil y Ajustes, `externa-sexta-10nov.md`),
comprobada en `externa-sexta-10nov-comprobado.md`: sus filas llevan una S y su detalle va al final. Lo que ya está hecho en una rama se dice «ya hecho, espera tu júntalo». La
página para Ez, con las fotos: https://claude.ai/artifact/C2uFSMM8eWhcRxpXLGWkAx (EcLj6; la copia de 5iWBf,
2QnMBypqSRVJCmPeNJazZA, se queda en la primera cola).

## Lo que más mueve la venta, por orden

1. **Una fila para comprar en Ajustes.** Antes de v1 no hay nada cerrado, así que el botón de compra no sale nunca a quien
   ya usa PACE. Sin ella, encender la venta no la ve nadie que no vaya a /premium. *(Mía, M2.)*
2. **Que la web capte a quien llega.** Juntar la landing (ya hecha), abrir «Avísame» y que `robots.txt`, `sitemap.xml` y el
   título no sean la app con su versión. *(Externa X1, X2; tu lista.)*
3. **Antes de dar la prueba a los testers, dos arreglos.** Que su quinta pausa no gaste la única petición de valoración, y
   que en el móvil el fin de la pausa avise, con un sonido distinto del fin del Foco. *(Externa 2.2, 4.F2, 4.F3.)* Y dos
   más de la sexta: que en el iPhone el fin del Foco suene (hoy no suena nada con PACE en el fondo), y que un Android
   restaurado de la copia de Google no pueda borrar una reunión de verdad. *(Sexta, nº 1 y nº 4.)*
4. **Que el ejercicio de la pausa devuelva al Foco.** El cierre dice «Volver al inicio» y, por libre, el aro espera en
   00:00. *(Mía, F2.)*
5. **Un aviso opcional a la hora de entrada, en el móvil.** Hoy el único aviso es el fin de un Foco; PACE ya sabe tu horario.
   *(Externa I1 y 3.V5.)*
6. **Que lo de pago se vea.** La semana que cambia y la carta del lunes se apagan en silencio sin PACE completo, y nada avisa
   cuando acaba la semana de prueba de v1. *(Mía M1 y M5; externa D3 y 2.5. Pide la decisión D-3.)*
7. **Que las cifras del día cuadren.** La pausa contada como foco, la cadencia que rehace lo hecho, la hora de empezar que se
   mueve y el doble cómputo: **ya hecho, espera tu júntalo** (`claude/chatgpt-jornada-9nov`), y las letras de 4, 6 y 7.
8. **Antes de cobrar, dos cuidados.** Sacar de `STATE.md` dónde viven las llaves, y la revisión de un fisioterapeuta que
   `CONTENT.md` pide antes de v1 (Fondos en silla, gratis hoy). *(Externa X7, D5 y 3.6.)*

## La cola entera

| # | Qué | Qué gana quien usa PACE | Esfuerzo | Cuándo |
|---|---|---|---|---|
| 1 | Fila «Tenerlo para siempre · 19,99 €» en Ajustes | Puede comprarlo sin buscar la web | Poco | Antes de v1, al encender la venta |
| 2 | La landing en la raíz | Entiende qué es PACE antes de abrir la app | Ya hecho, espera tu júntalo | Ya |
| 3 | Abrir «Avísame» (el KV) | Puede dejar su correo y enterarse | Poco (tuyo) | Ya |
| 4 | `robots.txt` y `sitemap.xml` propios; la versión fuera del título y, con un bloque en marcha, la cuenta atrás en él (pasada 5, idea 4) | Encuentra PACE en los buscadores con un nombre limpio, y ve el reloj desde otra pestaña | Poco | Antes de v1 |
| 5 | La cuenta de la jornada (puntos 1, 2, 3 y 5) | Ve cifras que cuadran | Ya hecho, espera tu júntalo | Ya |
| 6 | Las letras de 4, 6 y 7 (recomendadas 4B 6A 7A) | «Cambiar» con un Foco en marcha y «Hoy» con lo hecho por libre | Tu letra, luego medio | Antes de v1 |
| 7 | El `guardar()` atómico de la mensual | Una renovación nunca pisa otra | Ya hecho, espera tu júntalo | Antes del mensual |
| 8 | La valoración no se cuenta mientras PACE está abierto hasta v1 (2.2) | Los testers reciben la petición cuando su reseña ya es pública | Poco | Antes de dar la prueba a los testers |
| 9 | El fin de la pausa avisa en el móvil, con un sonido distinto del fin del Foco; en Android, la alarma exacta se ofrece también al empezar el primer Foco (4.F2, 4.F3, 2.T4) | Sabe sin mirar si toca parar o volver, y el aviso llega a su hora | Poco a medio | Antes de dar la prueba a los testers |
| S1 | En el iPhone el aviso de fin de Foco lleva la campana de PACE: hoy se programa sin sonido y la campana de PACE calla por él (sexta nº 1; según D-10) | Sabe que acabó el bloque sin mirar el móvil | Poco | Antes de dar la prueba a los testers del iPhone |
| S2 | La lista de eventos de PACE en el calendario de Android se olvida en un móvil restaurado o reinstalado (sexta nº 4; según D-8) | Nunca le desaparece una reunión de verdad | Poco (una línea nativa) | Antes de dar la prueba a los testers |
| 10 | /beta deja de decir «sin rachas» mientras haya logros de días seguidos (2.T1) | Lo que promete la página es lo que encuentra | Poco | Ya |
| 11 | El cierre del ejercicio dice lo que sigue (propuesta 2) | Un toque menos y sabe qué toca | Poco | Antes de v1 |
| 12 | La bienvenida y la invitación sin «v1» (propuesta 4) | Entiende a la primera qué es gratis y hasta cuándo | Poco | Antes de v1 |
| 13 | Sacar de `STATE.md` dónde viven las llaves | Nada visible; evita dar pistas a quien lee el repo | Poco | Antes de cobrar |
| 14 | La revisión de fisioterapeuta de Fondos en silla y los ejercicios aparcados | Lo que hace es seguro | Medio (de fuera) | Antes de v1 |
| 15 | Los cambios de sentido, brazo o lado dentro de un paso se avisan, con señal y texto («Brazos libres», «Rotación lenta», «Círculos de tobillo», «Giro sentado», «Desliza el talón») (3.2) | Sigue el ejercicio sin leer la pantalla con el cuello girado | Medio | Antes de v1 |
| 16 | Menos descanso en las rutinas suaves gratis: hoy «Levántate y sube» y «Piernas sin pasos» descansan tanto como trabajan (3.3) | La primera pausa del día no se siente lenta | Poco | Antes de v1 |
| 17 | El aviso de fin no sustituye en silencio al anterior (una etiqueta por bloque) | No se pierde el aviso del bloque siguiente | Poco | Antes de v1 |
| 18 | Una nota, una vez, cuando acaba la semana de prueba de v1 | No se encuentra cosas cerradas sin aviso | Medio | Antes de v1 |
| 19 | El correo de Stripe que recuerda el fin de la prueba, además de la hoja al abrir PACE (2.3) | El aviso de antes del cobro llega aunque no abra PACE | Poco (tuyo, en Stripe) | Antes de encender la mensual |
| 20 | «Pausa bien hecha» antes de hacerla, y la duración que cambia («3 min» y «2–3 min») | Textos que no se contradicen | Poco | Antes de v1 |
| 21 | Pedir que lo guardado no se borre en Safari, recomendar instalar y recordar la copia de vez en cuando (2.T6) | No pierde su historia ni su código | Poco | Antes de v1 |
| 22 | Un tope de unos 3 s a la red al abrir PACE instalada; si no llega, la copia guardada (2.T2) | Con una wifi mala no se queda en blanco | Poco | Antes de v1 |
| S3 | Importar: la pregunta dice de qué día es la copia y avisa si es de una versión más nueva que la app; el selector acepta cualquier archivo (sexta nº 5, 25 y 6) | Sabe qué copia está metiendo, y la encuentra en Drive o WhatsApp | Poco | Antes de v1 |
| S4 | Ajustes: el lector de pantalla lee el precio y el estado de las filas que son botón; «Audio» en la sección inglesa; los comentarios viejos del registro del iPhone y del interruptor (sexta nº 19, 20, 3 y 22) | Con lector de pantalla oye el precio antes de tocar | Poco | Antes de v1 |
| 23 | Capturas en el manifiesto | Chrome enseña una instalación con fotos | Poco | Antes de v1 |
| 24 | «Rutina propia» y el manifiesto en inglés; el atajo de Mueve sin «movilidad» y uno de Estira (2.T5) | En inglés no hay nada a medias | Poco | Antes de v1 |
| 25 | Los botones del constructor de 24 px, más grandes para el dedo, con maqueta (pasada 5, idea 6) | Edita sus rutinas en el móvil sin errar el toque | Poco | Antes de v1 |
| 26 | Aviso opcional a la hora de entrada (Android y iPhone) | Un motivo para abrir PACE cada mañana | Medio | Antes de v1 si cabe; si no, la primera actualización |
| 27 | Las bibliotecas a mano en el móvil, sin abrir el cajón, con maqueta (4.E1) | «Un estiramiento de cuello ahora» está a un toque | Medio | Antes de v1 si cabe |
| 28 | «¿Te ayudó?» menos veces, y el «No» con su porqué («aquí no podía», «difícil», «me molestó») (3.V3, 3.V4) | Contesta cuando importa, y un «aquí no podía» no le aparta la rutina una semana | Medio | Antes de v1 si cabe |
| S5 | El paquete de las tiendas: la hoja de compra y la fila de Ajustes de las apps hablan con Play y con Apple (sexta nº 8 a 14; detalle al final) | Lo que dice la app tras pagar en la tienda es verdad | Medio; espera tus altas | Con Play Billing y la compra de Apple (puntos 14 y 15) |
| 29 | La línea de los lunes (propuesta 3; según D-3) | Sabe que existe una semana que aprende | Medio (falta la maqueta del móvil) | Con v1 |
| 30 | Una carta dentro de los siete días de prueba (U4) | Prueba lo que va a pagar | Medio | Tú: después de v1. Las auditorías, también la pasada 5: antes |
| 31 | Los logros de constancia por días de jornada (también lo piden 4.F4 y 4.F5) | Quien trabaja de lunes a viernes también los gana | Poco | Después de v1 |
| 32 | «Con un plan» y «Primer ritual» cuentan las pausas que sirve «A tu ritmo» (4.F6) | Hace sus pausas y gana el logro | Poco | Después de v1 |
| 33 | Esconder Foco/Pausa/Larga con la jornada en marcha; sin jornada, que la pausa dure lo que digas (4.F7) | Un solo sistema de pausas | Poco | Después de v1 |
| 34 | «Foco manual» y «Ciclo N / 4», con maqueta | El aro explica lo que cuenta | Poco | Después de v1 |
| 35 | La primera pausa del primer día, suave | Lo primero que pide PACE no cuesta | Medio | Después de v1 |
| 36 | Menos toques hasta moverse (hoy tres) | La pausa empieza antes | Medio | Después de v1 |
| 37 | Una pregunta en la bienvenida («¿qué te molesta más?» y «¿dónde trabajas?», 3.O2) | El plan se siente suyo y no le propone flexiones delante de la oficina | Medio | Después de v1 |
| 38 | Marcar una reunión a mano en el día | El plan la rodea sin conectar el calendario | Medio | Después de v1 |
| 39 | Una intensidad del día (ligera o entera), junto a V1 «Solo pausas» | Menos ocasiones de fallar la primera semana | Medio | Después de v1 |
| 40 | Voz en Mueve y Estira | Hace el ejercicio sin mirar la pantalla | Mucho | Después de v1 |
| 41 | Vibración al ritmo de las repeticiones en el móvil (3.5) | Lo sigue en silencio, en una oficina abierta | Medio | Después de v1 |
| 42 | Una pausa para los ojos y otra de caminar a por agua (3.7) | Pausas discretas y una que une moverse y beber | Medio | Después de v1 |
| 43 | Subir la dosis tras varios «Sí» («¿pasamos a 2 × 8?») (3.V2) | PACE crece con quien lo usa | Mucho | Después de v1 |
| 44 | Una pregunta semanal de cómo está, con su línea, en la carta (3.V1; sin consejo médico) | Ve que le sirve, no solo lo que hizo | Mucho | Después de v1 |
| 45 | El calendario de verdad: elegir calendarios y el permiso que no caduca | El plan ve todas sus reuniones | Mucho; espera tus altas | Después de v1 |
| 46 | Una sola forma de evento en el calendario | Un evento igual lo ponga como lo ponga | Poco | Después de v1 |
| S6 | Una copia espejo de lo guardado en un archivo del móvil, por si el iPhone vacía el almacén (sexta nº 16) | No pierde su historia con el móvil sin espacio | Medio | Después de v1 |
| 47 | Fuera de la precarga las láminas de Caminos (1 MB) y los dibujos grandes (2,1 MB) (2.T3) | La instalación baja menos | Poco | Después de v1 |
| 48 | Cerrar la vía de la consola a lo abierto hasta v1 | Nada visible | Poco | El día de v1 |
| 49 | Las cifras de `CONTENT.md` al día | Nada visible | Poco | Cuando toque |

## Las decisiones que las auditorías discuten (dicho una vez)

**D-1 · El precio y el mensual** (decidido el 15 oct. y el 5 nov.). La externa vendería solo el de por vida, a 19,99 € de
lanzamiento y más caro después, porque el mensual casi nadie lo elegirá y trae casi toda la complejidad del cobro.
- **A** · Como está: 2,99 €/mes con 7 días gratis y 19,99 € de por vida desde v1. **Recomendada**: la prueba de 7 días solo
  existe con el mensual, y es lo único que deja a alguien probar PACE completo sin pagar antes; la complejidad ya está hecha.
- **B** · Solo de por vida, 19,99 € de lanzamiento y más caro después.

**D-2 · La bienvenida** (15 oct., punto 5; 27 oct., 2A). Las dos auditorías ven que PACE completo sale antes de que la
persona haya hecho nada.
- **A** · Como está.
- **B** · Bienvenida y semana; la pantalla de PACE completo sale una vez, al acabar la primera pausa entera. **Recomendada**:
  entonces ya sabe qué es una pausa y la oferta se entiende.

**D-3 · La semana que no se anuncia** (20 oct., punto 4, «Nada nuevo en pantalla»). Lo más propio de PACE completo no se
ve, ni teniéndolo ni sin tenerlo.
- **A** · Como está.
- **B** · Una línea los lunes, a quien no tiene PACE completo (propuesta 3). **Recomendada**.
- **C** · Además, una frase de motivo de la semana para quien lo tiene, como las de las pausas («Esta semana, más caderas»).

**D-4 · El repositorio público** (18 oct.: el repo sigue público). La externa lo cerraría antes de cobrar.
- **A** · Como está.
- **B** · Privado antes de encender la venta.
- **C** · Público, pero sin decir dónde viven las llaves y sin las notas de fallos de cobro abiertos hasta que estén
  cerrados. **Recomendada**: el CI de las pruebas gasta muchos minutos y en un repo privado se pagan; con C no se pierde nada.

**D-5 · Qué rutinas de pago se quedan el día de v1** (15 oct., punto 1: «las que ya hizo alguna vez»). Hoy cuenta cualquier
sesión empezada, terminada o no (`state-paso-v1.js:22-23`): quien abra las 18 unos segundos antes de v1 se las queda todas, y
el repositorio público lo explica.
- **A** · Como está: basta con haberla empezado.
- **B** · Solo las que acabó alguna vez (o contestó «¿Te ayudó?», que solo sale al acabar). **Recomendada**: es lo que
  quiere decir «ya la hizo», y nadie pierde una rutina que de verdad usaba.

**D-6 · Los logros de trasnochar** (pasada 4). «Búho» (usar PACE de 2 a 4 h) y «Ocaso» (cinco días con sesión después de
las 21 h) premian lo contrario de una jornada que acaba a su hora; «Nunca a medianoche» ya existe.
- **A** · Como están.
- **B** · Retirar «Búho» y «Ocaso» del catálogo; quien ya los tenga los conserva. **Recomendada**: van contra el tono de
  PACE, y uno es secreto: nadie los echa de menos.
- **C** · Cambiarlos por uno de cerrar la jornada a su hora.

**D-7 · Ofrecer PACE completo después de un «Sí» o al cerrar la jornada** (pasada 5). La regla de hoy, en `ROADMAP.md:157`:
«Lo cerrado lleva un candado de línea fina y, al tocarlo, una invitación; nada propone algo cerrado.» Y en
`DECISIONES_TECNICAS_VIGENTES.md:187`: «Lo cerrado se puede tocar y abre la invitación; "Para ahora" no propone nada
cerrado». La regla prohíbe proponer una rutina cerrada, no ofrecer la compra; pero hoy la invitación solo sale al tocar un
candado, en la bienvenida, el día de v1 y al acabar la prueba. La lista de «nunca» incluye «Publicidad o monetización
intrusiva» (`ROADMAP.md:403`).
- **A** · Como está; el momento semanal lo da D-3 B (la línea de los lunes). **Recomendada**: una oferta pegada a «¿Te
  ayudó?» tuerce la respuesta que alimenta «Qué te ayuda», y el cierre del día es el momento de soltar el móvil.
- **B** · Una línea discreta tras un «Sí» a «¿Te ayudó?», a quien no tiene PACE completo, como mucho una vez por semana.
- **C** · Una línea en el cierre de una jornada completa, como mucho una vez por semana.

**D-8 · La copia automática de Google en Android** (sexta, P1). Hoy está encendida y se lleva PACE entero a un móvil nuevo,
con la lista de eventos que PACE puso en el calendario de ESTE móvil; en otro, esa lista puede señalar una reunión ajena.
- **A** · Mantenerla, y que la lista se olvide en un móvil restaurado (la hora de instalación de Android guardada con ella).
  **Recomendada**: sin cuentas, que la historia sobreviva al cambio de móvil es de lo poco que la protege.
- **B** · Apagarla: un móvil nuevo empieza de cero, salvo con la copia de «Tus datos».
- **C** · Como está.

**D-9 · Con qué se cobra en las apps** (sexta, P2; para cuando estén tus altas).
- **A** · Un complemento que habla directo con Play y con Apple, sin servicio de terceros. **Recomendada**: sigue «sin
  cuenta, sin rastreo» y no cambia las fichas de privacidad.
- **B** · Un servicio de terceros que lo gestiona (tipo RevenueCat).

**D-10 · El sonido del fin de Foco en el iPhone** (sexta, P4). Hoy no suena nada con PACE en el fondo.
- **A** · El sonido de avisos del iPhone.
- **B** · La campana de PACE, la misma de la web y de Android. **Recomendada**: se reconoce como PACE.
- **C** · Sin sonido en el aviso, y que PACE suene al volver.

**D-11 · «Te avisamos dos días antes de que acabe la prueba», en las apps** (sexta, P5; con la mensual, después de v1).
- **A** · Quitar la frase en las apps. **Recomendada** (la pasada prefería B): la tienda sabe cuándo acaba la prueba; la app
  lo calcula, y el aviso dependería de un permiso que se puede negar.
- **B** · Programar un aviso del móvil el día 5, al comprar.

La P3 de la sexta (el calendario del iPhone en v1) ya la decidiste el 29 oct.: el archivo. No se pregunta.

## Ideas para después de v1 (pasada 5)

La quinta pasada no trae fallos: trae ocho cosas que construir para que pagar merezca la pena. Comprobadas en
`externa-10nov-pasadas-2-3-4-comprobado.md`, «Pasada 5». Ninguna choca con la lista de «nunca» (sin cuentas, sin
wearables, sin IA visible), con la paleta ni con «sin gamificación agresiva», salvo lo que se dice en cada una. Antes de
v1 solo suben dos cosas pequeñas, ya en la tabla: la cuenta atrás en el título (fila 4: es una línea de código, y quien
usa PACE en una pestaña de la web no ve el reloj) y los botones de 24 px del constructor (fila 25: el constructor es de lo
que se vende y en el móvil se usa con el dedo). La idea 3, el llavero del calendario, ya es el punto 13 del camino a v1.
Por orden:

| # | Idea | Dónde está ya | Tamaño | Cuándo |
|---|---|---|---|---|
| P1 | Una carta corta al tercer día de la prueba de 7 días (idea 2) | Fila 30 (U4); Ez la dejó para después de v1 (30 oct., 3A, `DECISIONES_PRODUCTO.md:60`) | Medio: la carta existe, pide tres días (`MOTOR_DIAS_CARTA = 3`) | La primera actualización tras v1; tercera auditoría que la pide antes |
| P2 | Modo «Solo pausas», sin Pomodoro (idea 1) | `ROADMAP.md:103`, V1 sin fecha, «con maqueta y testers»; fila 39 | Grande: otra home, y en la web sin servidor solo avisa con PACE abierto | Después de v1, primero de lo nuevo |
| P3 | PACE fuera de la app: «Pausar» y «Hacer la pausa» en el aviso fijo de Android (idea 4) | Ez eligió N4 A sin botones (27 oct.); la pieza nativa quedó preparada (`DECISIONES_PRODUCTO.md:112-122`) | Medio: pausar con el móvil bloqueado pide más pieza nativa | Después de v1 |
| P4 | Partir de una rutina de PACE o duplicar una propia en el constructor (idea 6) | Nueva: solo hay crear y editar (`CustomRoutines.jsx`) | Pequeño | Después de v1 |
| P5 | Programas con principio y fin sobre los Caminos (idea 5) | Caminos ocultos hasta después de v1 (`app/flags.js:57`); su reescritura y Travesías, fuera de v1 (`ROADMAP.md:136`) | Grande | Después de v1, si Ez reabre los Caminos |
| P6 | Un widget con el bloque y la próxima pausa (idea 4) | `ROADMAP.md:381`: «widget de inicio (próximo break + vasos)» | Grande: nativo en Android y en el iPhone | Después de v1 |
| P7 | Pasar los datos al móvil sin cuenta (idea 7) | En parte: la copia de «Tus datos» se exporta e importa a mano. Un QR no lleva un historial (cabe el código, no la historia) | Medio por archivo; grande si es automático | Después de v1 |
| P8 | Resumen del año para compartir (idea 8) | «Wrapped», en «Fuera de v1» (`ROADMAP.md:318`); Año ya existe en Estadísticas (`app/stats/YearView.jsx`) | Medio | Después de v1; tiene sentido en diciembre |
| P9 | Fijar una rutina propia a una hora del día (idea 6) | Nueva; choca con «A tu ritmo», que decide qué toca en cada pausa | Medio | Después de v1, con maqueta |
| P10 | Una ventanita flotante con el aro en el ordenador (idea 4) | «Reloj de escritorio (Electron ligero)» en medio plazo; extensión de Chrome, fuera de v1 (`ROADMAP.md:316`) | Medio (Picture-in-Picture del navegador) a grande | Después de v1 |

## La sexta pasada: nativo, compra en el móvil y Ajustes

24 hallazgos comprobados en `externa-sexta-10nov-comprobado.md`: 15 ciertos, 4 a medias, 2 falsos (el registro del iPhone sí
escribe; Google y Outlook no salen en el iPhone), 1 ya decidido y 2 que solo se saben en un móvil.

**(a) Arreglos pequeños, sin decisión, listos para montar** (filas S3 y S4):
- La pregunta de importar dice de qué día es la copia (`exportedAt`) y avisa si es de una versión más nueva (nº 25 y 5).
- El selector de importar acepta cualquier archivo; lo que entra ya se valida (nº 6).
- `AjustesAccion` no esconde al lector la derecha cuando es texto: el precio de la fila de compra, «caducada»,
  «Introducir» (nº 19). Vale también para la rama 1A.
- «Audio» en vez de «Sound» como nombre de la sección inglesa (nº 20).
- Comentarios viejos: el registro del iPhone (`state-paso-v1.js:26-27`, `events-store.js:226-227`,
  `events-adapter-null.js:12`) y el interruptor de 32x18 (`TweaksPanel.parts.jsx:66`) (nº 3 y 22).

**(b) Lo que pide tu letra:** D-8 (S2), D-9, D-10 (S1) y D-11, arriba.

**(c) Lo que solo se sabe con un móvil.** Las del iPhone esperan a que haya una versión de prueba instalable (TestFlight).
1. **La copia de Google (Android, nº 4).** En el móvil con la beta, pulsa «Al calendario» un día con reuniones. Conecta el
   móvil al PC y escribe `adb shell bmgr backupnow com.ezradesign.pace` (o en Ajustes del móvil › Google › Copia de
   seguridad › «Crear copia ahora»). Desinstala PACE e instálalo otra vez desde Play. Abre PACE: ¿están tus días de antes?
   Si están, la copia viaja y hace falta S2.
2. **El sonido del aviso (iPhone, nº 1).** Con el sonido puesto, empieza un Foco de 5 minutos y bloquea el móvil. Al acabar,
   ¿suena o solo se enciende la pantalla? Abre PACE: ¿suena la campana? El código dice que no sonará nada.
3. **La música y el silencio (iPhone, nº 2).** Pon música en otra app y empieza una Respira con «Voz clara»: ¿se corta la
   música? Repite con el interruptor de silencio puesto: ¿qué se oye, la voz, el tono o nada?
4. **Copias entre versiones (nº 5).** Exporta la copia en la web (0.197.0) e impórtala en la beta de Android. Mira si
   están los días, los logros y los minutos de Foco.
5. **El selector (nº 6).** Exporta la copia a Drive. En otro móvil, «Importar una copia» y elige el archivo desde Drive,
   desde Archivos y desde WhatsApp: ¿se puede tocar o sale en gris?
Las pruebas 4 y 5 de la pasada (registro y calendario del iPhone) no hacen falta: el código ya dice que funcionan.

**(d) El paquete de las tiendas** (fila S5; para cuando tengas las altas de Play y Apple):
- La fila de Ajustes en las apps: «comprado» y «mensual» leídos de la tienda, «Restaurar compras» y «Gestionar» en el
  iPhone (nº 8). La rama 1A cubre la web: «Tenerlo para siempre · 19,99 €» y «Tengo un código».
- La hoja de compra: los días de prueba solo si la tienda los da (nº 9), «para siempre» solo con la de por vida (nº 10),
  enlaces a condiciones y privacidad y la línea de renovación (nº 11), «no se pudieron cargar los precios · Reintentar»
  (nº 12), lo último que dijo la tienda guardado con su fecha (nº 13), y una privacidad sin camino a la compra (nº 14).
- La ficha del iPhone dice que el calendario es por archivo (P3, ya decidido).
- Sin comprobar, a mirar al montarlas: normas 3.1.1, 3.1.2 y 2.1 de Apple; Billing 8 y objetivo 36 en Play; la declaración
  de salud y la ficha de datos de Play; códigos de oferta de Apple para la de por vida; que lo comprado en TestFlight no
  pasa a la versión publicada; el SDK de iOS 27 desde abril de 2027; las reglas de la UE y de EE. UU. sobre pagar fuera.
