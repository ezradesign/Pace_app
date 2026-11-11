# Montado: 4 B, 6 A y 7 A (11 nov. 2026)

Las tres letras de Ez a la segunda revisión de ChatGPT, montadas en la rama `claude/chatgpt-jornada-9nov`.

- Página para Ez: **https://claude.ai/artifact/RifLYxtf23zjW51atRD4U3** (`montado.html`, con las fotos de esta carpeta al lado).
  Desde la otra cuenta la dirección da 404: se republica desde `montado.html` con sus doce `.jpg`.
- Fotos: `N-antes-m.jpg` / `N-despues-m.jpg` a 360 × 740 y `N-antes-d.jpg` / `N-despues-d.jpg` a 1536 × 710.
  «Antes» es el `index.html` del merge con main 0.197.0 (ad731251), antes de las tres letras.
- Medidas de la home (scroll y textos que se pisan) a 360 × 740, 1536 × 710 y 1920 × 860: `__medidas.txt`.

| Letra | Commit | Prueba | Mutante |
|---|---|---|---|
| 4 B · «Cambiar» con un Foco en marcha: el bloque pasa al día nuevo | bb7fe9d3 | `tests/ritmo-cambiar-en-marcha.spec.js` (3) | sin el cambio caen 2 («550+25») |
| 7 A · una pausa hecha dice los minutos que hiciste | c1edb818 | `tests/ritmo-pausa-minutos-hechos.spec.js` (3) | con la tarjeta y la línea de antes caen las 3 |
| 6 A · «Además, por tu cuenta» en Estadísticas › Hoy | 80465a5b | `tests/stats-hoy-por-tu-cuenta.spec.js` (3) | sin la lista, o casando sin `runId`, caen 2 |
