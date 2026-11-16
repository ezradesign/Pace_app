# Dónde me quedé · voz de Mueve y Estira en inglés (16 nov. 2026)

Paré al 94 % de las 5 h. Encargo de la coordinadora: las tomas en inglés de Ez
(`Audio - Cuerpo\files_20261116_094336.zip`, dos versiones de cada toma), con una sección para escoger
en «Para oír» y las recomendadas ya montadas.

## Hecho (en este commit)

- Las 16 tomas pasaron por `scripts/voz-cuerpo-tomas.js`, recortadas como en castellano.
- Montadas en la app las recomendadas: `app/move/voz/*-en-*.mp3`, la tabla
  (`app/ui/Sound.voz.cuerpo.datos.js`) y las 8 filas nuevas de `sw.js`, todo escrito por el guion.
  El censo del precache pasa a 285.
- `voz-5` ahora prueba en la app cada voz e idioma (antes, solo castellano).
- `npm run verify` pasa.

## Recomendadas (por medidas: tono parejo en semitonos, huecos y topes)

| Voz | Toma | Recomendada | Por qué |
|---|---|---|---|
| bradford | números | versión 2 | tono más parejo (2,5 frente a 2,9), cae menos al final y el nivel varía menos |
| bradford | cuenta | versión 2 | los números no caen al final (la 1 cae unos 3 semitonos), como pedía el prompt |
| bradford | avisos | versión 1 | tono mucho más parejo (1,6 frente a 4,1) |
| bradford | lados | versión 1 | tono algo más parejo (3,8 frente a 4,3) |
| sulafat | números | mezcla | la versión 2 se corta en el 21 (faltan 22-25); en la 1, «one» dura 1,87 s (tope 1,5) y no deja recortar. Se usa el «one» de la 2 y del «two» al final de la 1 |
| sulafat | cuenta | versión 2 | tono parejo (0,3 frente a 1,8) y los tres números duran casi igual |
| sulafat | avisos | versión 2 | tono parejo (0,7 frente a 4,5) |
| sulafat | lados | versión 2 | tono y nivel más parejos (0,8 frente a 2,5; 2,5 dB frente a 5) |

Todas cortan limpio y caben en sus topes. Los huecos entre palabras quedan en 0,40-0,45 s.
Pesos en inglés: sulafat 795 KB y bradford 557 KB.

La mezcla de los números de sulafat se hizo empalmando cuadros MP3 enteros: los 60 primeros cuadros de
la versión 2 (hasta 1,44 s) y, de la versión 1, desde el cuadro 109 (2,62 s). Al primer cuadro de la
versión 1 se le calla por la reserva de bits (`ensamblar` de `scripts/voz-cuerpo-mp3.js`). Si Ez no la
quiere, el «repite» es `sulafat-en-repite-one.mp3` con el prompt de una palabra en inglés de
`docs/proposals/voz-cuerpo-15nov/PROMPTS_VOZ_CUERPO.md`, y la línea `One.`

## Lo que falta

1. `node build-standalone.js`, `git checkout -- PACE_standalone.html` y las pruebas
   `tests/voz-cuerpo.spec.js` y `tests/voz-cuerpo-tomas.spec.js` (puerto 8835): no se pasaron porque el
   `index.html` no estaba construido.
2. La sección de inglés en «Para oír» de `docs/proposals/voz-cuerpo-15nov/index.html`: las dos
   versiones de cada toma una junto a otra, con botón por palabra y «Oír seguidas», y la recomendada
   marcada con su porqué (la tabla de arriba). Las versiones no recomendadas hay que volver a sacarlas
   del zip (descomprimir en una carpeta nueva, renombrar a `VOZ-en-TOMA.mp3`, pasar `procesar` con
   `salida` y `datos` en una carpeta aparte) y guardarlas en la rama para la página.
3. Republicar la página (https://claude.ai/artifact/JvtkcA2htQF8ByWtMGu9oU), STATE/CHANGELOG si toca,
   y un commit sin `Co-Authored-By` en esta rama. `main` no se toca.
