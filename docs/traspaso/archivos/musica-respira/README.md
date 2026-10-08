# Música de Respira · traspaso (6 oct 2026)

## Qué se decidió
- **Mixto** (Ez, 6 oct): la música respira con cada ejercicio de ciclo fijo. Sube al inhalar, se queda quieta en el sostén y baja al exhalar. Rondas, Bhastrika y Kapalabhati (ciclos de 2-4 s) llevan la música quieta. Coherente 432 sigue sin música (tiene su propio drone).
- La envolvente **no la hace la IA**: se aplica sobre un drone limpio en Sol a 432. En la app irá en directo (WebAudio), llamada desde `playPhaseSound()` en `app/breathe/BreatheSession.support.jsx` en cada fase. Así nunca se desfasa, ni al pausar. **Hecho y aprobado por Ez el 8 oct. 2026** (`app/ui/Sound.musica.jsx`), con los tres drones en `app/breathe/musica/`.

## Las 20 pistas de Genspark (44 archivos, 20 distintos)
- Solo sirven 4, todas de ElevenLabs. Las otras 16 son canciones: melodía, cambios de acorde, golpes o batería, otras tonalidades. La provisional que tenía la app (`energia.mp3`, igual que `pace_energia_lyria`, ya retirada) estaba en Do menor y tenía ataques.
- Pranayama no tiene ninguna pista usable. Ninguna marea de Balance es exacta.
- Detalle: `metricas-20-pistas.md` (medidor validado con 352 pruebas sintéticas) y `revision-visual-20-pistas.txt` (espectrogramas, pista a pista).
- La propuesta quedó a medias: el reparto final por ejercicio y la revisión adversaria no llegaron a terminar.

## Los tres drones base (`bases/`, mono 64 kbps, en Sol con La = 432, bucle con fundido, a -20 dBFS RMS)
| drone | sale de | proceso | suena en |
|---|---|---|---|
| `sol-claro.mp3` | `energia_elevenlabs` (v2) | -31,77 cents, low-shelf -10 dB < 180 Hz, bucle 9,95-213,15 s | Energía, Balance, Pranayama |
| `sol-calido.mp3` | `equilibrio_elevenlabs` (v2) | +5 semitonos (Re→Sol) y -31,77 cents, bucle 13,70-231,40 s | Equilibrio |
| `sol-menor.mp3` | `balance10_elevenlabs` (v1, antigua) | +2 semitonos (Fa→Sol) y -31,77 cents, low-shelf -4 dB, bucle 30,90-229,00 s | Relajación |

- Ganancia en la app: **0,158** para las tres (deja el cuerpo en -36 dBFS, el nivel del drone de la app).
- Rubberband con `transients=smooth:detector=soft:window=long:pitchq=quality`. Con la opción por defecto, transponer inventaba ataques: 19 por minuto en sol-calido.

## La envolvente (`escucha-respira.html` y `scripts/envolvente.py`)
- Curva de coseno alzado por fase. Inhala 0→1, sostén quieto, exhala 1→0. En el suspiro, la primera inhalación llega a 0,8.
- Volumen: de -profundidad a 0 dB (profundidad 3 dB por defecto, ajustable de 0 a 8).
- Brillo: paso-bajo de 650 Hz (cerrado) a 9 kHz (abierto), exponencial con la misma curva.
- La página publicada (https://claude.ai/artifact/Xu2bQaNCYDAKih6PJ12y6M, en la cuenta anterior) guarda las elecciones de Ez en su base de datos (colección `elecciones`). Para usarla en la otra cuenta: abrir el HTML con `bases/` y la carpeta `app/breathe/voz/` copiada como `voz/` al lado. Las elecciones solo se guardan en la versión publicada.

## Pendiente
1. Hecho el 8 oct.: cada técnica tiene su receta (`PACE_MUSICA_TECNICA`, en `app/ui/Sound.musica.parts.jsx`). Cómo se hicieron, se miden y se cambian: `por-tecnica/LEEME.md`.
2. Regenerar Pranayama (tanpura) solo con ElevenLabs, pidiendo «in G, root G (98 Hz), body in G3-G4», prepararla con `procesar.py` y darle una entrada en `PACE_MUSICA_BASES`.
3. Captura de los términos de Genspark y del modelo usado (ElevenLabs) antes de publicar.

## Scripts (`scripts/`, Python 3 + numpy + scipy + ffmpeg con rubberband)
- `procesar.py ENTRADA SALIDA INICIO FIN [FUNDIDO] [ESTIRA] [SEMITONOS] [GRAVE_DB]`: prepara un drone.
- `envolvente.py DRONE SALIDA EJERCICIO [MIN] [DB]`: renderiza la envolvente a archivo (para pruebas).
- `medir.py OUT.json AUDIO...`: el medidor de las 20 pistas.
