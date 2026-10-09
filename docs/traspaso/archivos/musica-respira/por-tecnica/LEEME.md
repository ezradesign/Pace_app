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
| `marcadas.html`, `marcadas.js` | La página de las marcadas (9 oct.): «Marcada» y «Ahora» por técnica, un recorrido de 12 s por todas y el resumen para pegar. Se abre desde el servidor de PACE (lee los audios del repo). |
| `tecnicas.js` | Las 20 técnicas: fases, receta de A, la marcada `m` (bloque `MARCADAS`), por qué le va y texto de B. **Lo único que se edita a mano.** |
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

## Montado en la app (Ez eligió A el 8 oct.)

Ez: «aplicamos las novedades de los drones más personalizados a cada respiración y cuando los vaya
probando te digo». Está en `app/ui/Sound.musica.jsx` con las recetas en `app/ui/Sound.musica.parts.jsx`
(`PACE_MUSICA_TECNICA`), que copian las de `tecnicas.js` y los `ajusteDb` de `medidas.js`. La app usa
el mismo motor que la página: los drones se descodifican a 22 050 Hz y suenan en bucle dentro de Web
Audio, así que lo que suena es lo que se midió. `PACE_MUSICA` (por familia) queda de reserva para una
técnica sin receta. Lo vigila `tests/respira-musica.spec.js`.

Para cambiar una técnica cuando Ez la pruebe: tocar su receta en `tecnicas.js`, correr `construir.js`
hasta «Sin avisos», escucharla en la página y copiar la receta y su `ajusteDb` a
`Sound.musica.parts.jsx`.

## Las marcadas (9 oct.)

Ez, al escuchar las de A: «¿no te da la sensación que todos suenan igual?». Medido, sí: con la
distancia de color (espectro por tercios de octava de 50 Hz a 8 kHz, volumen igualado, raíz
cuadrática media de las diferencias en dB) nueve técnicas tenían una casi gemela a menos de 4
puntos; entre el drone claro y el cálido hay 8,3. Ez eligió «variaciones mucho más marcadas», sin
grabar nada. La receta `m` usa los mismos campos que `a`, así que la app no cambia de código: otra
nota, acordes que se oyen, colores como de vocal y movimientos que se notan en medio minuto.
`construir.js` mide también `m` (su ajuste va en `medidas.js`, dentro de `m`) y avisa si una queda a
menos de 6 de su vecina: con las marcadas la pareja más cercana está a 6,3 y no queda ninguna
gemela. Las medidas de `a` no cambian.

Para escucharlas, con el servidor de PACE en marcha (por ejemplo en el puerto 8792):
`http://localhost:8792/docs/traspaso/archivos/musica-respira/por-tecnica/marcadas.html`. Si en ese
localhost se abrió la app, su service worker guarda copias de todo lo que cuelga de él: la página
carga sus scripts con `?v=` y hay que subir ese número si cambian.
