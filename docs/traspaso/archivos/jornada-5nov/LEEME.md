# El aro como paso actual: 1A, 2B y sin la frase de ayuda (Ez, 5-6 nov. 2026)

Rama `claude/maqueta-jornada-40d7ea`. Terminada, a falta de juntarla. Páginas: la elegida,
https://claude.ai/artifact/JT45Q7FuqAurUChGqLhqgg (`docs/proposals/jornada-paso-actual.html`); la del tamaño del aro, con cuentas
de la otra cuenta (`jornada-aro-tamanos.html`); y lo montado, `docs/proposals/jornada-montada.html`.

**Montado:** `app/focus/FocusTimer.jornada.jsx` (nuevo) con «Hacer la pausa» en el aro y «Empezar ya el bloque N» como enlace,
«Pausar foco» / «Reanudar foco», «Después: …» solo en el escritorio y «Pausa terminada». «Preparar jornada» en lugar de «Comienza».
La tarjeta sin jornada, sin subtítulo y más baja. Sin la frase «Cada bloque es un pomodoro…» (`RitmoComo`). Y `home-geometry.js`
sin la tolerancia de 1 px, que dejaba 1 px de scroll a 1280×800.

**El aro:** 1917×857, de 391 a 445 sin jornada y de 392 a 426 con ella preparada; 1536×710, de 327 a 372 y de 305 a 332.

**Probado:** `npm run verify`; 138 pruebas vecinas en Chromium; once mutantes, todos en rojo; 100 medidas de scroll (cinco momentos,
dos idiomas, diez tamaños) con máximo 0 px. **Sin probar:** la suite entera, WebKit, y un móvil o un iPhone de verdad.

La versión, `STATE.md` y `CHANGELOG.md` los pone la coordinadora al juntar. `main.jsx`, `FocusTimer.pestanas.jsx` y los teclados
de las sesiones no se han tocado. Los guiones de esta carpeta llevan rutas absolutas y usan el puerto 8852.
