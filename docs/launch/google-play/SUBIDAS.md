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
