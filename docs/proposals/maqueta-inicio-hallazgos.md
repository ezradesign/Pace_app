# Maqueta del inicio (M7 · M6 · M4) — hallazgos, 22 oct.

Sesión de la rama `claude/maqueta-inicio-3a2a59`. Nada montado en el repo todavía (espera la elección de Ez).
Guiones y fotos en el scratchpad de la sesión a9e1ef82 (`fotos.js`, `voz/render.js`, `voz/wav.js`).

## M4 · la voz grave en Rondas — la cifra de 3,57 s era falsa
- `bradford-exhala.mp3`: la palabra va de 0,108 a 1,309 s (**1,20 s**). Luego 2,3 s de silencio y un
  **chasquido en los últimos ~15 ms** del archivo (pico −21 dBFS). La medida «último sample sobre −50 dBFS»
  lo tomó por el final de la palabra (`fin: 3.68` en `PACE_VOZ_CLIPS`).
- Con el chasquido fuera, 1,20 + 0,15 = 1,35 s cabe en las fases de 2 s: la voz dice «exhala» en las tres
  rondas sin acelerar ni regrabar. Además, hoy el chasquido suena a −31 dBFS unos 3,6 s después de cada
  «exhala» en rutinas lentas (medido en Exhalación 4·6 renderizando con el motor real).
- Montaje probable: `fin` 1,309 y que la voz deje de sonar poco después de `fin` (o recortar el archivo).
  Las otras voces no tienen ese chasquido (bradford inhala/mantén, −52 dB al final, bajo el umbral).

## M6 · Ajustes del móvil
- Contenido: 743 px en la web, 812 en Android si falta «Alarmas y recordatorios» (fila + nota, +69).
  Hoy 72 dvh = 525 px a 730 → 218/287 px de scroll.
- A (recomendada): «Tus datos» como enlace en su línea de título (hoja aparte con copias, borrar, código y
  pie), filas a 34 px, divisores a 8 px, la nota de Android como línea pequeña de su fila, max-height
  100dvh−64px → 534 (web) / 574 (Android): sin scroll a 730 y a 640, es y en (a 640 Android, 1 px de sobra).
- B todo junto apretado: 605/670 → sin scroll a 730, 22/87 px a 640. C por temas (pestañas): 286/354, nunca scroll.

## M7 · la home
- Hoy y la A (módulos + tarjeta corta = lo que se ve «por libre») no piden scroll a 360×730/640 en es/en.
- «Por libre» y «sin contestar» solo se distinguen en: el calendario (por libre borra las pausas de hoy de
  PACE), la semana (por libre deja de proponer «como cada jueves» hasta mañana). Estadísticas › Hoy dice
  «Por libre» en los dos casos ya hoy. Nada de por libre se guarda en el resumen del día ni en el motor.
