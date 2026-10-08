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
