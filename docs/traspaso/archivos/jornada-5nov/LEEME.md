# El aro como paso actual: 1A y 2B (Ez, 5 nov. 2026)

Rama `claude/maqueta-jornada-40d7ea`, ya con la 0.190.0 de `main`. Página elegida: https://claude.ai/artifact/JT45Q7FuqAurUChGqLhqgg

**Hecho:** `app/focus/FocusTimer.jornada.jsx` (nuevo) con «Hacer la pausa» en el aro y «Empezar ya el bloque N» como enlace,
«Pausar foco» / «Reanudar foco», «Después: …» en el escritorio y «Pausa terminada»; «Preparar jornada» en vez de «Comienza»; la
tarjeta sin jornada sin subtítulo y más baja (el aro pasó de 391 a más de 440 px a 1917×857). `tests/aro-jornada.spec.js` y las
pruebas que esperaban los textos viejos. `npm run verify` pasaba en el último intento. Decisión y regla, en `docs/product/`.

**Falta, en este orden:**
1. Ver si está en verde la última tanda de vecinas (`bloques-cortos`, `hora-y-medianoche`, `ritmo-pausa-entera`, `ritmo-pausa`,
   `ritmo-tarjeta-movil`, `ver-ejercicio`, `eventos-origen`, `ritmo-reloj`, `ritmo-panel`, `home-a11y`, `inicio-modulos`,
   `aro-modo-identidad`, `toques-movil`, `lienzo`, `aro-jornada`, en Chromium). La lanzó esta sesión y no llegó a leerse el resultado.
   La tanda anterior dio 115 verdes y 11 rojas, todas ya corregidas en las pruebas, sin confirmar.
2. Mutantes: `mutantes.js` (aquí) deshace cada cambio en el `index.html` compilado. Sin correr.
3. Medir que la home no pide scroll en dos idiomas y hacer las fotos de lo montado a 360 y 1280: `montado.js`. Sin correr.
4. `npm run verify`, `node build-standalone.js` y, después de eso, `LISTO PARA MAIN`. La versión la pone la coordinadora.

**Sin respuesta, pregunta a Ez sobre «2b (en la jornada)»:** con la jornada entera ya elegida el aro sigue en 392 px (305 a
1536×710). X: quitar la frase «Cada bloque es un pomodoro en el aro…», que da 426 (332 a 1536×710). Y: dejarla, 2B era solo la
tarjeta. Si no contesta, se queda Y.

Los guiones llevan rutas absolutas de esta carpeta y usan `node_modules` del repo principal; el servidor, el puerto 8852.
`capas-y-pausa` toca `FocusTimer.pestanas.jsx`, `main.jsx` y los teclados de las sesiones: aquí no se han tocado.
