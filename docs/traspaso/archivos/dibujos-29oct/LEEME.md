# Catorce dibujos de ejercicio nuevos, 29 oct.

## AL RELEVO (29 oct., ~18:30)

**Ez vio la página ligera y dijo «Sí, y aclara los 3»**: sí a los catorce tal como están (ya metidos y subidos en
esta rama), y aclarar Paloma, Flexor de cadera y Sentadilla a silla hasta la mediana del set con la curva de la
ingesta, como Hueco abdominal el 14 oct. Ningún .webp a mano (D-4). Sin versión nueva y sin juntar en `main`.

**Los originales de los tres, localizados** (por imagen: cada candidato pasado por el encuadre de la ingesta y
comparado con la máscara de hoy; correlación 0,85-0,89 frente a 0,18-0,36 del siguiente). Copiados con su nombre,
listos para la ingesta, en `Pace_app\dibujos-22oct\pagina-29oct\aclarar\` (fuera de git):
- `paloma.png` ← `Glifos de ejercicios - Estira\asset_7l2distn8_1787147624020.png`
- `flexor-de-cadera.png` ← `Glifos de ejercicios - Estira\HIGHEST_PRIORITY_CHARACTER_CONSISTENCY_ACROSS_8_-1787084036298.png`
- `sentadilla-a-silla.png` ← `Glifos de ejercicios - Estira\asset_bu68cfez4_1787170653696.png`

**La ingesta acepta ya `--aclarado slug=k,slug=k`** para probar curvas sin tocar la tabla `ACLARADO`.

**Qué falta, por orden** (desde la carpeta del worktree, `Pace_app\.claude\worktrees\elegant-pascal-d54e40`):
1. Probar curvas y medir. Por cada k (por ejemplo 1, 1.2, 1.4, 1.6, 1.8, 2):
   `node scripts/ingest-glifos-ejercicio.js --fusionar --origen "<Pace_app>/dibujos-22oct/pagina-29oct/aclarar" --aclarado "paloma=K,flexor-de-cadera=K,sentadilla-a-silla=K"`
   y `node scripts/glifos/medir-trazo.js paloma,flexor-de-cadera,sentadilla-a-silla` (sale el percentil de cada medida
   contra el resto de muñecos enteros). Hoy están en sombreado p98. Elegir para cada uno el k que deja el sombreado en
   la mediana sin que la línea se vaya por debajo de p25, y mirarlo en grande con
   `node docs/traspaso/archivos/dibujos-29oct/tira.js lista <salida.png> 220 5 app/glyphs/assets/ejercicios/paloma.webp …`.
   Ojo: el k mueve tinta fuerte a suave, así que el sombreado medido no siempre baja al subir k; hay que medirlo.
   Antes de la primera prueba, con k=1, comprobar que sale lo mismo que en git (`git diff --stat` sin cambios en los tres .webp).
2. Escribir los tres k en `ACLARADO` (`scripts/ingest-glifos-ejercicio.js`, con el porqué) y reingestar sin `--aclarado`.
3. En la página: un antes y un después de los tres junto a sus vecinos (las máscaras de antes están en git, en el
   commit de este relevo, 30fc197f: `git show 30fc197f:app/glyphs/assets/ejercicios/paloma.webp > …`), y la tira del
   set de nuevo: `node docs/traspaso/archivos/dibujos-29oct/tira.js set "<Pace_app>/dibujos-22oct/pagina-29oct/fotos/tiras/set.png" 104 3 <los catorce, por comas>`.
   La sección «Los que se salen» de `pagina.js` pasa a contar que ya están aclarados. Luego `pagina.js` (la completa y `--ligera`).
4. `npm run verify`, `node build-standalone.js`, `git checkout -- PACE_standalone.html` y la suite entera:
   `PACE_E2E_PORT=8810 npx playwright test` (otra sesión usa el 8808; si cae una prueba, repetirla sola). Si en el 8810
   ya hay un `static-server.js` de este worktree escuchando, la suite lo reutiliza (comprobado: sirve los mismos archivos).
5. Commit con el porqué, sin Co-Authored-By, y push de la rama. El resumen, a la coordinadora.

**La suite de los catorce** se lanzó a las ~18:15 y no había acabado al relevar: el commit de este relevo es «WIP:».

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

## Los que se salen del set (apuntados para Ez, sin tocar)

**Paloma, Flexor de cadera y Sentadilla a silla**: una mancha oscura en el músculo, sombreado p98. Recomendación:
aclararlos con la curva de la ingesta (`ACLARADO`), como Hueco abdominal el 14 oct. Sus originales están numerados
(`scripts/glifos/mapa-estira.txt`: 13, 18 y 19) y hay que localizarlos en `Glifos de ejercicios - Estira`.
Sentarse y levantarse del suelo, que salía más grande, ya tiene dibujo nuevo.

## Cómo se rehace la página

Desde la carpeta del worktree, con las fotos fuera de git en `Pace_app\dibujos-22oct\pagina-29oct\fotos`:

1. `node build-standalone.js` y `git checkout -- PACE_standalone.html` (las fotos son del `index.html`).
2. `node docs/traspaso/archivos/dibujos-29oct/fotos.js <fotos>/blanqueado [id,id…]` y
   `… <fotos>/vecinos vecinos [id,id…]` (puerto 8810; si ya hay un servidor de este worktree en él, lo usa).
3. `node docs/traspaso/archivos/dibujos-29oct/tira.js set <fotos>/tiras/set.png 104 3 <los nuevos, separados por comas>`;
   `sombreado-29.png` y `se-salen.png` con el modo `lista` (las máscaras del WIP están en `pagina-29oct\mascaras-wip`).
4. `node docs/traspaso/archivos/dibujos-29oct/pagina.js <fotos> docs/proposals/dibujos-29oct.html` y, con
   `--ligera`, la versión ligera.

## Lo que no entra

`Rana`, que se repite, y `Palmas en la mesa`, porque las versiones revisadas el 29 oct. tienen los dedos hacia
fuera. Son los dos dibujos de ejercicio que quedan; la cuenta entera está en `docs/product/GLIFOS_A_DIBUJAR.md`
(24, con los de logros).
