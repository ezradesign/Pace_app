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

### 0.189.0 o la que toque (la versión de prueba definitiva), para la prueba cerrada

Sustituye a las de la 0.184.0, que no llegó a subirse. Parten de lo que ya tiene la gente en Play (la 0.174.0) y llegan
hasta `main` (la 0.188.0) más lo que falta: los dos dibujos (Rana y Palmas en la mesa) y el logo. El número lo fija el
`bump` cuando entren, y la fila de la tabla se escribe cuando Ez la suba. Si el logo no entra, se quita «Logo nuevo.» /
«New logo.» y sobra sitio. Si cambia algo más de la app antes de subirla, se relee que cada frase siga siendo verdad.
Notas, de 417 a 430 caracteres:

```
<es-ES>
Mueve y Estira, renovados: pausas cortas para empezar, ejercicios y dibujos nuevos, y cada ejercicio dice dónde colocarte y qué necesitas. Con bloques cortos, el aro te propone un momento para moverte. Nueva bienvenida, Ajustes más sencillos y «Qué te ayuda» en Estadísticas. Con el móvil bloqueado, un aviso te dice lo que queda del Foco, y al acabar suena una sola vez. Logo nuevo. Gracias por probarla: cuéntame lo que falle.
</es-ES>
<es-419>
Mueve y Estira, renovados: pausas cortas para empezar, ejercicios y dibujos nuevos, y cada ejercicio dice dónde colocarte y qué necesitas. Con bloques cortos, el aro te propone un momento para moverte. Nueva bienvenida, Ajustes más sencillos y «Qué te ayuda» en Estadísticas. Con el celular bloqueado, un aviso te dice lo que queda del Foco, y al acabar suena una sola vez. Logo nuevo. Gracias por probarla: cuéntame lo que falle.
</es-419>
<en-US>
Move and Stretch, renewed: short breaks to start with, new exercises and drawings, and each exercise tells you where to stand and what you need. With short blocks, the ring suggests a moment to move. A new welcome, simpler Settings and «What helps» in Stats. With your phone locked, a notification shows what is left of your Focus, and it rings only once at the end. New logo. Thanks for testing: tell me what breaks.
</en-US>
```

### «Qué probar» de TestFlight, para la misma versión

Para el grupo externo «Testers iPhone» (la gente tiene la 0.175.0). Va en el campo «Qué probar» de la compilación, que
admite hasta 4000 caracteres; el inglés va debajo del español, como en la ficha.

```
Esta versión trae todo lo nuevo desde la 0.175.0.

Lo nuevo
- Mueve y Estira, renovados: «Para empezar» (pausas de 2-3 minutos), ejercicios y dibujos nuevos, textos más claros y, en cada ejercicio, dónde colocarte y qué necesitas. «Auto» pasa de paso solo y «Antes de empezar» deja mirar cómo se hace cada ejercicio.
- Con bloques cortos, el aro te propone un momento para moverte.
- Nueva bienvenida con una visita guiada, Ajustes más sencillos y «Qué te ayuda» en Estadísticas.
- La carta del lunes de «A tu ritmo» se puede dejar para luego.
- Logo nuevo.

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
- Move and Stretch, renewed: "Start here" (2-3 minute breaks), new exercises and drawings, clearer steps and, for each exercise, where to stand and what you need. "Auto" moves on by itself, and "Before you start" lets you see how each exercise is done.
- With short blocks, the ring suggests a moment to move.
- A new welcome with a guided tour, simpler Settings and "What helps" in Stats.
- Monday's letter from "At your pace" can wait until later.
- New logo.

What only shows on a real iPhone
1. Start a Focus and leave the app: the notification arrives on time and rings only once.
2. In Breathe, the screen stays on.
3. Settings › Copies, delete and PACE Complete › Export a copy: the share sheet opens and you can save to Files.
4. Sound plays when you tap and, with the silent switch on, it does not.
5. Top and bottom: nothing hidden by the island or the home bar, in light and dark.
6. The icon and the launch screen.

Tell me what breaks or what you would miss: take a screenshot of PACE and the iPhone offers to send it as feedback.
```
