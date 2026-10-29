# Catorce dibujos de ejercicio nuevos, 29 oct.

## AL RELEVO (29 oct., ~20:30)

**Hecho: los tres aclarados** (Ez, «Sí, y aclara los 3»). Sí a los catorce tal como están, y Paloma, Flexor de
cadera y Sentadilla a silla rehechos desde sus originales (en `Pace_app\dibujos-22oct\pagina-29oct\aclarar\`,
fuera de git) hasta la mediana del sombreado del set. Ningún .webp a mano (D-4), sin versión nueva y sin juntar.

**La causa no era el dibujo**: los tres salían encogidos al 99,8 % para caber en el círculo, y ese remuestreo
reparte cada raya fina entre dos píxeles: medido, les doblaba la tinta suave (de ahí el p96-p98 y la mancha gris).
Por eso la curva sola no llegaba (lo que se probó a las 18:40). La ingesta ya no encoge si lo que sobra cabe en la
tolerancia del guard (`HOLGURA` = 1,5 px de 376, invisible). Sin el encogido quedaban en p66, p0 y p38, y la curva de
`ACLARADO` termina de ajustarlos:

| Dibujo | `ACLARADO` | Sombreado antes → ahora | Línea antes → ahora |
|---|---|---|---|
| Paloma | `{ suave: 1.4 }` (curva solo en α ≤ 128, nueva) | p98 → p51 | p40 → p17 |
| Flexor de cadera | 1.3 | p96 → p42 | p74 → p32 |
| Sentadilla a silla | 1.1 | p96 → p49 | p83 → p40 |

La línea de Paloma (185,7 sobre 255, p25 = 186,6) sale así del original sin encoger; la curva solo-suave no la toca.
Con la curva entera la línea se hundía a p6 y el sombreado subía. `--aclarado slug=s1.4` prueba la curva solo-suave.

**Ojo para quien reingeste**: `HOLGURA` cambia el resultado de cualquier dibujo que se encogía menos de 1,5 px.
Desliza el talón (de los catorce, sombreado p74-p81) es uno, y la página le ofrece a Ez rehacerlo igual. Los
demás del set no se han reingestado: si se rehace la ingesta entera, alguno puede salir más nítido que hoy.

**Página**: `docs/proposals/dibujos-29oct.html` (780 KB, no se publica) y la ligera, publicada en
https://claude.ai/artifact/Q6LWNCb6KNFqexLTRabqoZ. «Los que se salen» es ahora el antes y después
(`fotos/tiras/aclarados.png`; las máscaras de antes, en `pagina-29oct\mascaras-antes-aclarar`, de 30fc197f).

**Suite** en el 8810 con estos tres: 1066 en verde, 2 saltadas y 1 caída, `eventos-origen.spec.js:93` (tiempo agotado
con la suite de otra sesión en el 8808 a la vez). Sola, con `--workers=1`, pasa en 16 s. `verify` en verde.

Rama `claude/elegant-pascal-d54e40`, sobre `main` en 11a60591. Catorce dibujos de Genspark que la coordinadora
revisó contra el paso de cada ejercicio: Bisagra de cadera, Gemelo en pared (el más recogido), Piernas elevadas
sentado (la v2 de Ez), Desliza el talón, Remo con banda, 90/90, Rotación torácica de pie, Inclinación de tronco,
Gato-camello, Remo con tu mano (pegado en el chat, en webp), Pica en escritorio, Rodar hacia abajo, Sentarse y
levantarse del suelo y Apretar glúteos (sentado). Sin versión nueva y sin juntar: la coordinadora la junta con el
«júntalo» de Ez, después del runner y de «Tus rutinas».

Página para Ez: `docs/proposals/dibujos-29oct.html`; si pasa de 512 KB, que su visor no abre, la versión ligera
es `docs/proposals/dibujos-29oct-ligera.html` (solo el círculo del móvil de cada dibujo).

## Lo que decidió Ez

- **El sombreado, con el rojo blanqueado** (29 oct., «de tu tira de 5 el primero es el mejor»). El commit «WIP:»
  b121db1c conservaba la mancha roja en los cinco primeros (tabla `CON_ROJO` de la ingesta) para que no salieran
  lavados, y Ez lo vio de más, «sobre todo en Piernas elevadas sentado». Se le enseñaron el blanqueo, el rayado sin
  la mancha, media mancha y la mancha entera, y eligió el blanqueo: lo que hace el resto del set. La tabla se ha
  quitado y los catorce entran con la ingesta de siempre.
- **Gemelo en pared, el más recogido**: sustituye al que salía a dos tercios de la escala de sus vecinos.

## Lo medido

`scripts/glifos/medir-trazo.js` mide lo que se pinta de cada máscara (tinta, sombreado, línea y grosor del
contorno) contra los muñecos enteros que ya estaban y se quedan (42). Los catorce quedan con el sombreado en la
mediana o por debajo (Desliza el talón, p74, es la excepción: la ingesta lo encoge al 99,8 % para que quepa y ese
remuestreo ablanda el trazo), con menos tinta en total que la media y la línea algo más oscura (el trazo de
Genspark). Remo con tu mano llegó como webp comprimido y mide como los demás (sombreado p12, como Bisagra).

Se probó a calibrar una curva por dibujo contra la mediana de las cuatro medidas y no casa con lo que ve Ez: la
línea del set es tan pareja (186-192 sobre 255 entre p25 y p75) que la fórmula oscurecía el dibujo entero para
corregir un 4 % de línea. Por eso no hay curva para ninguno.

## Los que se salen del set (ya aclarados)

**Paloma, Flexor de cadera y Sentadilla a silla** salían con el sombreado en p96-p98. Ez pidió aclararlos y ya
están en la mediana (ver «AL RELEVO»); sus originales son los números 13, 18 y 19 de `scripts/glifos/mapa-estira.txt`.
Sentarse y levantarse del suelo, que salía más grande, ya tiene dibujo nuevo.

## Cómo se rehace la página

Desde la carpeta del worktree, con las fotos fuera de git en `Pace_app\dibujos-22oct\pagina-29oct\fotos`:

1. `node build-standalone.js` y `git checkout -- PACE_standalone.html` (las fotos son del `index.html`).
2. `node docs/traspaso/archivos/dibujos-29oct/fotos.js <fotos>/blanqueado [id,id…]` y
   `… <fotos>/vecinos vecinos [id,id…]` (puerto 8810; si ya hay un servidor de este worktree en él, lo usa).
3. `node docs/traspaso/archivos/dibujos-29oct/tira.js set <fotos>/tiras/set.png 104 3 <los nuevos, separados por comas>`;
   `sombreado-29.png` y `aclarados.png` con el modo `lista` (las máscaras del WIP están en `pagina-29oct\mascaras-wip`).
4. `node docs/traspaso/archivos/dibujos-29oct/pagina.js <fotos> docs/proposals/dibujos-29oct.html` y, con
   `--ligera`, la versión ligera.

## Lo que no entra

`Rana`, que se repite, y `Palmas en la mesa`, porque las versiones revisadas el 29 oct. tienen los dedos hacia
fuera. Son los dos dibujos de ejercicio que quedan; la cuenta entera está en `docs/product/GLIFOS_A_DIBUJAR.md`
(24, con los de logros).
