# PACE en Google Play · registro de subidas

Una línea por cada vez que una versión entra en una pista de Play Console. Sirve para saber siempre
qué tiene cada grupo de gente y qué número de versión ya está gastado (Play no deja repetirlo).

La rutina, elegida por Ez el 8 de octubre de 2026 (está explicada en [guia.html](guia.html)):

1. **Viernes:** Ez dice «toca Play». Claude elige la versión, escribe aquí sus notas y la fila.
2. Ez descarga `PACE-X.Y.Z.aab` del borrador de release `vX.Y.Z` (GitHub → Releases) y lo sube a la
   **prueba interna**. Lo prueba en su móvil el fin de semana.
3. **Lunes:** si va bien, «Promocionar versión» a la **prueba cerrada**. Más adelante, de la cerrada
   a **producción** tras unos días.
4. Si algo se rompe, no se retira nada: se sube una versión nueva solo con el arreglo (`X.Y.Z+1`).

Cada promoción es una fila nueva con la misma versión.

| Fecha | Versión | Pista | Notas de la versión (lo que leen los testers) |
|---|---|---|---|
| | | | |

## Notas de la versión

Máximo 500 caracteres por idioma, en frases que entienda cualquiera: qué cambia para quien la usa, no
cómo está hecho. Van en español (`<es-ES>`) y en inglés (`<en-US>`), así:

```
<es-ES>
Primera versión de prueba de PACE en Android. Gracias por probarla: cuéntame lo que falle y lo que echarías de menos.
</es-ES>
<en-US>
PACE's first test version on Android. Thanks for trying it: tell me what breaks and what you'd miss.
</en-US>
```

### 0.184.0 (184000), para la prueba cerrada

Bajado el 28 oct. 2026 a `subidas-play\PACE-0.184.0.aab` (artefacto `pace-play-v0.184.0` de la ejecución 40695334443
del trabajo Android): firmado con la llave de subida (`PACE-UPL`) y con los mismos permisos que la 0.174.0, así que
Play no pide ninguna declaración nueva. Trae todo lo que la prueba cerrada no tenía desde la 0.174.0. La fila de la
tabla se escribe cuando Ez la suba. Notas, de 398 a 419 caracteres:

```
<es-ES>
Mueve y Estira, renovados: pausas cortas para empezar, ejercicios nuevos y textos más claros. Con bloques cortos, el aro te propone un momento para moverte. Nueva bienvenida, Ajustes más sencillos y «Qué te ayuda» en Estadísticas. Con el móvil bloqueado, un aviso te dice lo que queda del Foco, y al acabar suena una sola vez. Lo que PACE pone en tu calendario va privado. Gracias por probarla: cuéntame lo que falle.
</es-ES>
<es-419>
Mueve y Estira, renovados: pausas cortas para empezar, ejercicios nuevos y textos más claros. Con bloques cortos, el aro te propone un momento para moverte. Nueva bienvenida, Ajustes más sencillos y «Qué te ayuda» en Estadísticas. Con el celular bloqueado, un aviso te dice lo que queda del Foco, y al acabar suena una sola vez. Lo que PACE pone en tu calendario va privado. Gracias por probarla: cuéntame lo que falle.
</es-419>
<en-US>
Move and Stretch, renewed: short breaks to start with, new exercises and clearer steps. With short blocks, the ring suggests a moment to move. A new welcome, simpler Settings and «What helps» in Stats. With your phone locked, a notification shows what is left of your Focus, and it rings only once at the end. What PACE adds to your calendar is now private. Thanks for testing: tell me what breaks.
</en-US>
```

### 0.191.1 (191001), la versión de prueba definitiva, para la prueba cerrada

Bajado el 6 nov. 2026, con el sí de Ez, a `subidas-play\PACE-0.191.1.aab` (15 249 266 bytes, md5 `e44956b5…`) desde el
borrador de release `v0.191.1`, compilado sobre 35ee22b9: firmado, y el manifiesto dice 0.191.1. Entra por la prueba interna
y se promociona a la cerrada (`guia.html`, punto 5). La del iPhone subió a TestFlight el mismo día: compilación 191001,
ejecución 42290322689 de `ios.yml`, «Upload succeeded» a las 21:43; falta darla al grupo «Testers iPhone» con el texto de
abajo.

Sustituye a las de la 0.184.0, que no llegó a subirse. Parten de lo que ya tiene la gente en Play (la 0.174.0) y llegan
hasta `main` con la 0.190.0 y lo que se junte antes de subirla: todos los dibujos de ejercicio (Rana y Palmas en la mesa,
los dos últimos, entraron el 5 nov.), las horas con el «− 9:00 +», lo que pasa sin querer, los arreglos de datos y compra,
y que Atrás no saque de una sesión. El logo se queda como está (Ez, 4 nov.), así que ya no se anuncia. El número lo fija
el `bump` cuando entren, y la fila de la tabla se escribe cuando Ez la suba. Si cambia algo más de la app antes de
subirla, se relee que cada frase siga siendo verdad. Notas, de 475 a 483 caracteres:

```
<es-ES>
Mueve y Estira, renovados: pausas cortas para empezar, un dibujo en cada ejercicio y dónde colocarte. Las horas de «A tu ritmo» se eligen con el «− 9:00 +». Una pausa que aún no llega solo abre su ficha, y Atrás cierra un aviso sin sacarte de la sesión. Importar una copia ya no te quita el código de PACE completo. Con el móvil bloqueado, un aviso te dice lo que queda del Foco. Nueva bienvenida y «Qué te ayuda» en Estadísticas. Gracias por probarla: cuéntame lo que falle.
</es-ES>
<es-419>
Mueve y Estira, renovados: pausas cortas para empezar, un dibujo en cada ejercicio y dónde colocarte. Las horas de «A tu ritmo» se eligen con el «− 9:00 +». Una pausa que aún no llega solo abre su ficha, y Atrás cierra un aviso sin sacarte de la sesión. Importar una copia ya no te quita el código de PACE completo. Con el celular bloqueado, un aviso te dice lo que queda del Foco. Nueva bienvenida y «Qué te ayuda» en Estadísticas. Gracias por probarla: cuéntame lo que falle.
</es-419>
<en-US>
Move and Stretch, renewed: short breaks to start with, a drawing for every exercise and where to stand. Pick the hours of «At your pace» with «− 9:00 +». A break that has not come yet only opens its card, and Back closes a notice without taking you out of the session. Importing a copy no longer removes your PACE Complete code. With your phone locked, a notification shows what is left of your Focus. A new welcome and «What helps» in Stats. Thanks for testing: tell me what breaks.
</en-US>
```

De dónde sale cada frase, para releerla antes de subir:

| Frase | Dónde está |
|---|---|
| un dibujo en cada ejercicio | `GLIFOS_A_DIBUJAR.md`: ejercicios sin dibujo, 0 (Rana y Palmas, 0.190.0) |
| dónde colocarte | el runner de la 0.187.0 (B4) |
| las horas con el «− 9:00 +» | 0.190.0: inicio, fin y comida, de media hora en media hora |
| una pausa que aún no llega solo abre su ficha | 0.190.0 («lo que pasa sin querer») |
| Atrás cierra un aviso sin sacarte de la sesión | `df1ff767`, en `main` tras la 0.190.0: un aviso sobre una sesión se cierra con el primer Atrás |
| importar una copia no quita el código | `f87a6161`. Con él, exportar desde Ajustes guarda lo que se ve y la copia de rescate dice si salió |

### «Qué probar» de TestFlight, para la misma versión

Para el grupo externo «Testers iPhone» (la gente tiene la 0.175.0). Va en el campo «Qué probar» de la compilación, que
admite hasta 4000 caracteres; el inglés va debajo del español, como en la ficha. Sin «Atrás»: el iPhone no lo tiene.

```
Esta versión trae todo lo nuevo desde la 0.175.0.

Lo nuevo
- Mueve y Estira, renovados: «Para empezar» (pausas de 2-3 minutos), un dibujo en cada ejercicio, textos más claros y, en cada ejercicio, dónde colocarte y qué necesitas. «Auto» pasa de paso solo, y encenderlo a mitad de una serie no la da por hecha. «Antes de empezar» deja mirar cómo se hace cada ejercicio.
- Las horas de «A tu ritmo» (inicio, fin y comida) se eligen con el «− 9:00 +», de media hora en media hora: mantén pulsado para ir más deprisa, y «Empezar ahora» pone la hora de inicio en este momento.
- Lo que tocas sin querer cambia menos: una pausa que aún no llega solo abre su ficha, y el «No» de una rutina lo dice y se puede deshacer.
- Con bloques cortos, el aro te propone un momento para moverte. Y al acabar el Foco, la pausa espera a que termines la sesión que tengas en marcha.
- Nueva bienvenida con una visita guiada, Ajustes más sencillos y «Qué te ayuda» en Estadísticas. Respira te propone por dónde empezar la primera vez.
- La carta del lunes de «A tu ritmo» se puede dejar para luego.
- Tus datos, mejor cuidados: importar una copia no quita tu código de PACE completo, exportar desde Ajustes guarda lo que ves y la copia de rescate dice si salió o falló.

Lo que solo se ve en un iPhone de verdad
1. Empieza un Foco y sal de la app: el aviso llega a su hora y suena una sola vez.
2. En Respira, la pantalla no se apaga.
3. Ajustes › Copias, borrar y PACE completo › Exportar una copia: sale el menú de compartir y se puede guardar en Archivos.
4. El sonido suena al tocar y, con el interruptor de silencio puesto, no suena.
5. Arriba y abajo no hay nada tapado por la isla ni por la barra de inicio, en claro y en oscuro.
6. El icono y la pantalla de arranque.

Cuéntame lo que falle o lo que echarías de menos: haz una captura de PACE y el iPhone te ofrece mandarla como comentario.
```

```
This version brings everything new since 0.175.0.

What's new
- Move and Stretch, renewed: "Start here" (2-3 minute breaks), a drawing for every exercise, clearer steps and, for each exercise, where to stand and what you need. "Auto" moves on by itself, and turning it on in the middle of a set no longer counts the set as done. "Before you start" lets you see how each exercise is done.
- The hours of "At your pace" (start, finish and lunch) are picked with "− 9:00 +", half an hour at a time: hold to go faster, and "Start now" sets the start time to this moment.
- Things you touch by accident change less: a break that has not come yet only opens its card, and the "No" on a routine says so and can be undone.
- With short blocks, the ring suggests a moment to move. And when a Focus ends, the break waits until you finish the session you have going.
- A new welcome with a guided tour, simpler Settings and "What helps" in Stats. Breathe suggests where to start the first time.
- Monday's letter from "At your pace" can wait until later.
- Your data, better looked after: importing a copy no longer removes your PACE Complete code, exporting from Settings saves what you see, and the rescue copy tells you whether it worked or failed.

What only shows on a real iPhone
1. Start a Focus and leave the app: the notification arrives on time and rings only once.
2. In Breathe, the screen stays on.
3. Settings › Copies, delete and PACE Complete › Export a copy: the share sheet opens and you can save to Files.
4. Sound plays when you tap and, with the silent switch on, it does not.
5. Top and bottom: nothing hidden by the island or the home bar, in light and dark.
6. The icon and the launch screen.

Tell me what breaks or what you would miss: take a screenshot of PACE and the iPhone offers to send it as feedback.
```

### Capturas de la ficha: cuáles se han quedado viejas

Medido el 6 nov. 2026: se rehicieron las seis con `scripts/play/capturas.js` sobre la 0.190.0 (en una carpeta aparte) y se
compararon píxel a píxel con las de `capturas-sin-marco/`. Las de `capturas/` son la misma pantalla con su título encima, así
que valen lo mismo. Español e inglés van juntos.

| Captura | Estado | Por qué |
|---|---|---|
| `6-logros` | **Vieja** | La cabecera del panel decía «Disponibles» y «Próximamente» y ahora dice «Sellos reunidos» (0.190.0). |
| `3-respira` | **Vieja, por poco** | La etiqueta de arriba del «Coherente 5·5» decía «Balance» y ahora dice «Coherencia» (en inglés, «Coherence»). |
| `1-jornada`, `2-pausa`, `4-estira`, `5-foco-oscuro` | Valen | Salen idénticas, o con solo la animación distinta (un segundo del reloj, un tramo del aro). |

Ninguna captura enseña el «− 9:00 +» ni lo que pasa sin querer, así que esas dos novedades no dejan viejas las de la ficha.
Hay dos cosas que aún no están en `main` y las dejarán viejas otra vez: los dibujos de logros nuevos (`6-logros`, que enseña
sellos) y lo que cambie la home con la jornada (`1-jornada`, `2-pausa` y `5-foco-oscuro`). Conviene rehacer las seis una
sola vez, al final, con todo dentro: `node build-standalone.js` y `node scripts/play/capturas.js`.
