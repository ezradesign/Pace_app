# Ocho dibujos de ejercicio nuevos, 29 oct.

Rama `claude/elegant-pascal-d54e40`, sobre `main` en 11a60591. Ocho dibujos de Genspark que la coordinadora revisó
contra el paso de cada ejercicio: Bisagra de cadera, Gemelo en pared, Piernas elevadas sentado, Desliza el talón,
Remo con banda, 90/90, Rotación torácica de pie e Inclinación de tronco. Sin versión nueva y sin juntar: la
coordinadora la junta con el «júntalo» de Ez, después del runner y de «Tus rutinas».

Página para Ez: `docs/proposals/dibujos-29oct.html` (466 KB: cabe en su visor, que no abre más de 512 KB; si
creciera, `pagina.js` saca una versión ligera con `--ligera`).

## Lo que decidió Ez

- **El sombreado, con el rojo blanqueado** (29 oct., «de tu tira de 5 el primero es el mejor»). El commit «WIP:»
  b121db1c conservaba la mancha roja en los cinco primeros (tabla `CON_ROJO` de la ingesta) para que no salieran
  lavados, y Ez lo vio de más, «sobre todo en Piernas elevadas sentado». Se le enseñaron el blanqueo, el rayado sin
  la mancha, media mancha y la mancha entera, y eligió el blanqueo: lo que hace el resto del set. La tabla se ha
  quitado y los ocho entran con la ingesta de siempre.
- **Gemelo en pared, el más recogido**: sustituye al que salía a dos tercios de la escala de sus vecinos.

## Lo medido

`scripts/glifos/medir-trazo.js` mide lo que se pinta de cada máscara (tinta, sombreado, línea y grosor del
contorno) contra los 46 muñecos enteros que ya estaban. Los ocho quedan con el sombreado en la mediana o por debajo
(Desliza el talón, p74, es la excepción: la ingesta lo encoge al 99,8 % para que quepa y ese remuestreo ablanda el
trazo), con menos tinta en total que la media y la línea algo más oscura (el trazo de Genspark).

Se probó a calibrar una curva por dibujo contra la mediana de las cuatro medidas y no casa con lo que ve Ez: la
línea del set es tan pareja (186-192 sobre 255 entre p25 y p75) que la fórmula oscurecía el dibujo entero para
corregir un 4 % de línea. Por eso no hay curva para ninguno de los ocho.

## Los que se salen del set (apuntados para Ez, sin tocar)

- **Paloma, Flexor de cadera y Sentadilla a silla**: una mancha oscura en el músculo, sombreado p98. Recomendación:
  aclararlos con la curva de la ingesta (`ACLARADO`), como Hueco abdominal el 14 oct. Sus originales están numerados
  (`scripts/glifos/mapa-estira.txt`: 13, 18 y 19) y hay que localizarlos en `Glifos de ejercicios - Estira`.
- **Sentarse y levantarse del suelo**: más grande que el resto. Ya está en la cola para redibujar.

## Cómo se rehace la página

Desde la carpeta del worktree, con las fotos fuera de git en `Pace_app\dibujos-22oct\pagina-29oct\fotos`:

1. `node build-standalone.js` y `git checkout -- PACE_standalone.html` (las fotos son del `index.html`).
2. `node docs/traspaso/archivos/dibujos-29oct/fotos.js <fotos>/blanqueado` y `… <fotos>/vecinos vecinos` (puerto 8810).
3. `node docs/traspaso/archivos/dibujos-29oct/tira.js set <fotos>/tiras/set.png 104 3 <los ocho, separados por comas>`;
   `sombreado-29.png` y `se-salen.png` con el modo `lista` (las máscaras del WIP están en `pagina-29oct\mascaras-wip`).
4. `node docs/traspaso/archivos/dibujos-29oct/pagina.js <fotos> docs/proposals/dibujos-29oct.html`.

## Lo que no entra

`Rodar hacia abajo` y `Sentarse y levantarse del suelo` (todavía no valen), y `Rana` y `Pica en escritorio`, que se
repiten. Lo que queda por dibujar está en `docs/product/GLIFOS_A_DIBUJAR.md`: 30 en total, 8 de ejercicio.
