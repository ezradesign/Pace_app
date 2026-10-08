# Un drone por técnica de Respira (8 oct. 2026)

Encargo de Ez: «¿podemos mejorar los drones de cada actividad de Respira para que sean únicos y
agradables?». Parte de la música de la rama `claude/respira-musica-drones` (tres drones en Sol con
la envolvente en directo) y propone dos caminos:

- **A, variaciones en directo (recomendado).** Cada técnica toma los mismos tres drones de `../bases/`
  y la app los cambia en el momento: otra nota de la escala de Sol, un color, una segunda voz suave y,
  en algunas, un movimiento lento. Sin archivos nuevos.
- **B, un drone grabado por técnica.** Ez lo genera fuera con `brief-B-por-tecnica.md` (ElevenLabs
  Music). 19 archivos, unos 30 MB más en el APK. Recomendado solo para las técnicas que Ez marque
  como «Grabada».

## Archivos

| Archivo | Qué es |
|---|---|
| `escucha-por-tecnica.html` | La página: escuchar cada técnica (propuesta y «así suena hoy») con la voz encima, elegir y responder. |
| `tecnicas.js` | Las 20 técnicas: fases, receta de A, por qué le va y texto de B. **Lo único que se edita a mano.** |
| `motor.js` | El motor de Web Audio, el mismo para la página y para el medidor. |
| `medidas.js` | Generado: medidas y ajuste de nivel de cada variación. |
| `brief-B-por-tecnica.md` | Generado: el brief de B, listo para pegar. |
| `construir.js` | Mide, escribe los dos generados y arma la copia autocontenida. |

## Cómo se rehace

Desde la raíz del repo, después de tocar `tecnicas.js`:

```bash
node docs/traspaso/archivos/musica-respira/por-tecnica/construir.js
```

Tiene que acabar en «Sin avisos». Mide en Chromium, en el puerto 8783 (`PACE_PUERTO` para cambiarlo),
90 s de cada técnica sin la voz. Lo que comprueba:
- volumen medio igual al de hoy en esa técnica (±0,5 dB), con el pulmón lleno como mucho 1,5 dB por
  encima de hoy;
- ningunos agudos (por encima de 2 kHz) por encima del drone más claro de hoy, que es el que Ez ya
  oyó con la voz encima;
- en la banda del móvil (300 Hz a 4 kHz) no se pierden más de 3 dB respecto a hoy.

Con `--autocontenida SALIDA.html` arma una copia de 6,7 MB con los audios dentro, para enviarla sola.
La versión publicada es https://claude.ai/artifact/E6ourw8dU6NBuAPRJYR5s9 (audios en `audio/`); las
elecciones de Ez se guardan en su base de datos, colecciones `elecciones` (una por técnica:
`A`, `hoy` o `B`) y `respuestas` (`camino`, `notas`, `nadi`, `drone432` y `nota`).

## Lo que encontró la medida

- Sol oscuro casi no tiene nada por encima de 500 Hz, así que el filtro de la envolvente de hoy
  (650 Hz cerrado) apenas se oye en Relajación: allí la música solo respira en volumen. Las
  variaciones de Relajación cierran el filtro mucho más abajo (220 a 300 Hz).
- El drone de Coherente 432 es un seno de 96 Hz: en la banda del móvil queda unos 38 dB por debajo de
  su volumen, así que un altavoz pequeño casi no lo da.
- Un paneo centrado (`StereoPanner`) resta 3 dB por canal; en Nadi Shodhana lo compensa el ajuste.

## Si Ez elige A

Se monta en `app/ui/Sound.musica.jsx`: una tabla por técnica junto a `PACE_MUSICA` (que queda de
reserva), un segundo `<audio>` para la segunda voz, `playbackRate` con `preservesPitch = false` para
cambiar de nota, los filtros y el oscilador lento en la misma cadena, y `fase()` recibe el lado en
Nadi Shodhana. Las recetas y los ajustes de `tecnicas.js` y `medidas.js` se copian tal cual.
