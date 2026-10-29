# El runner de Mueve y Estira, más claro (29 oct. 2026)

## AL RELEVO (29 oct., ~18:30)

- **Montado y subido** (commits `a1071407` código y pruebas, `813a3d38` fotos y guiones): la tercera vuelta del reparto
  de Ez entera (sección de abajo). `npm run verify` pasa; `index.html` compilado y en el commit.
- **Medido**: las 14 pantallas en cinco pasos y dos idiomas con `censo-montado.js`: el círculo nunca menor que hoy, nada
  pisado, ningún texto cortado, sin scroll. Pruebas del runner (`runner-reparto`, `-claro`, `-auto`, `-mando`,
  `-circulo`, `-letra`, `-congelado`) en verde en el 8808.
- **Página de fotos hecha**, con la ligera: https://claude.ai/artifact/MiGd9feEQgLE8GtLSxUULL.
- **Falta**: el resultado de la suite entera en el 8808, que estaba corriendo al relevo. Para retomarla, desde esta carpeta:
  `PACE_E2E_PORT=8808 npx playwright test --reporter=line`. Si cae una, repetirla sola antes de creerla:
  `PACE_E2E_PORT=8808 npx playwright test tests/<archivo> -g "<nombre>" --workers=1`. Con verde, nada más: la rama ya
  está subida, y juntar es de la coordinadora con el «júntalo» de Ez.
- Si `node_modules` no está (la unión al del repo principal), `build-standalone.js` dice «TypeScript not found»:
  `New-Item -ItemType Junction -Path node_modules -Target "<repo>\node_modules"` en PowerShell.
- Para rehacer el censo o la página: `git show 05e2252f:index.html > <tmp>/index-hoy.html`, luego
  `node docs/traspaso/archivos/runner-claro/censo-montado.js <tmp>/censo <tmp>/index-hoy.html censo todas`,
  `node docs/traspaso/archivos/runner-claro/censo-montado.js <tmp>/fotos <tmp>/index-hoy.html fotos 360x740,412x915,1280x720,1536x710 pausa,vuelta`
  y `node docs/traspaso/archivos/runner-claro/reparto-pagina.js <tmp>/censo <tmp>/fotos docs/proposals/runner-reparto-montado-29oct.html`
  (otra vez con `...-ligera.html ligera` al final).

Rama `claude/runner-claro-15db3c`, sin juntar en `main`. Casos de las revisiones de ChatGPT del 28 oct.
(`docs/audits/chatgpt-28oct/LEEME.md`): B1-B4, R4, R6 y, con maqueta, B3, P5, P6 y P8, ya montados; y la tercera vuelta
del reparto que dibujó Ez (abajo).

## Hecho (cada uno con su prueba, roja antes del arreglo: B1-R6 contra la 0.185.0; B3-P8 contra esta rama)

| Caso | Qué | Dónde | Prueba |
|---|---|---|---|
| B4 | La colocación escrita se ve 5 s antes de empezar, salvo en otra serie del mismo ejercicio. Seis no salían: «Silla sin ruedas» de Core silencioso, el isquio de pie, los hombros de Escritorio express, rodar hacia abajo, Elevación de talones y la Pica tras un descanso | `v1StepSetup` y `v1MismoEjercicioAntes` (`MoveSessionV1.support.jsx`) | `tests/runner-colocacion.spec.js` (8) |
| B1 | Sin Auto, esperar a «›» con la cuenta en 0 no suma a ningún reloj; las reps a tu ritmo sí | `esperaMano` (`MoveSessionV1.jsx`) | `tests/runner-espera.spec.js` (espera-1, espera-2) |
| B2 | En pausa, encender Auto solo cambia la preferencia; lo pendiente pasa al reanudar, sin repetir sonidos | los tres efectos que avanzan miran `paused`; `sonadoRef` | `tests/runner-espera.spec.js` (espera-3 a 5) |
| R4 | «Glúteos invisibles», paso 3: «unos ocho segundos… Tres veces» (con diez no cabían en 30 s), en los dos idiomas | `move.data.js`, `i18n/content/move.js` | `tests/runner-cabe.spec.js` (cabe-1, lee la frase en pantalla) |
| R6 | La barra de 4·7·8 (y de toda Respira por tiempo) se mide contra el final de verdad, ciclos enteros | `finSec` (`BreatheSession.jsx`) | `tests/runner-cabe.spec.js` (cabe-2) |
| B3 A | En el paso con banda la flecha cuenta lo hecho («Hecho» sin Auto, «Terminar serie» con él) y «Saltar este paso» es la pastilla de la fila del número; terminarlo antes no corta la rutina | `onSaltar` (`MoveSessionV1.jsx`, `.cuerpo.jsx`) | `tests/runner-claro.spec.js` (b3-1, b3-2) |
| P5 A | Una palabra bajo cada botón del mando, dentro del botón; la de la flecha dice lo que hace. En escritorio el mando baja 10 px al margen vacío (si no, el círculo salía menor que en el móvil) | `.pace-v1-rotulo` (`.mando.jsx`, `.css.jsx`), `ultimo` | p5-1 a p5-3 |
| P6 A | «Con una basta», centrada bajo «SEGUNDOS», en los descansos entre dos series del mismo ejercicio de una rutina con `unaBasta` (hoy solo «Levántate y sube»); cuenta entera, también al reanudar, y el cierre dice las series hechas | `MoveSessionV1.parts.jsx` (`v1BastaDestino`), `bastaRef`, `basta` en `pace.cuerpo.v1` | p6-1 a p6-3 |
| P8 B | Al pausar, lo de debajo del dibujo se apaga y un velo dice «Sesión en pausa»; el círculo y su arco se ven. Al reanudar, 3, 2, 1 (aún en pausa) y lo que quedaba | `useV1Vuelta`, `VeloV1`, `useV1Teclas` (`.parts.jsx`) | p8-1 a p8-3 |

**Material, con B4 (aviso de la coordinadora, 29 oct.)**: «Core silencioso» declara `equipment: ['stableChair']`
(«Una silla estable, sin ruedas», clave que ya está en `main`), y «Antes de empezar» lo dice (última prueba de
`runner-colocacion.spec.js`, roja antes). **Falta, a propósito**: las tres rutinas con «Extensión torácica»
(`extra.data.js`, dos, y `extra.data.piernas.js`, una) siguen con `equipment: []`; piden silla con respaldo, que es
la clave nueva `chair` de la rama de «Tus rutinas» (f8fe136). La pone la coordinadora al juntar las dos ramas.

B4 cambió la duración estimada de esas seis rutinas (+5 s) y obligó a ajustar `tests/runner-aro-colocate.spec.js`
(los hombros de Escritorio express ya se colocan). Filas nuevas arriba de `DECISIONES_TECNICAS_VIGENTES.md`.

## Lo que eligió Ez en la maqueta, montado (29 oct.)

Maqueta: https://claude.ai/artifact/Mtv9tKsUy9qWgJgKwfD788 (`docs/proposals/runner-claro-29oct.html`, con `fotos.js` y
`pagina.js`). Ez: «B3A + P5A + P5A (la pill de con una basta queda mejor cuadrada debajo de segundos) + P8 B, pero
que se pueda ver la bola del dibujo arriba» (el segundo «P5A» es la P6).

**Fotos del montaje, para que Ez lo mire antes de juntar**: https://claude.ai/artifact/CunCYGXWuiHD39gdVmSnif
(`docs/proposals/runner-montado-29oct.html`; `montado.js` hace las fotos y
`montado-pagina.js` la página, en esta carpeta). Allí van pintadas, sin montar, las otras lecturas:
- P6 «cuadrada»: montada como «centrada debajo»; pintada, con esquinas rectas.
- P8 «que se vea la bola»: montada con el círculo fuera del velo; pintada, el velo translúcido sobre todo (se lee
  el número de detrás, por eso no se recomienda).
- Decidido aquí, a falta de Ez: bajo la flecha de un paso con reloj, «Siguiente» (pintado, «Hecho»); y «Con una
  basta» solo en «Levántate y sube» (la única que lo promete; en otra rutina es `unaBasta: true` en su dato).

**Pruebas de otros que cambian con esto** (comportamiento elegido por Ez, no regresión): «Terminar antes» pasa a
«Terminar serie» en siete pruebas; `runner-espera` (espera-3 a 5), `runner-mando` («+15 s» ya no se pulsa en pausa:
el velo lo tapa), `mueve-reloj` y `caza-sesiones` cuentan los 3 s del 3, 2, 1 como pausa.

## La tercera vuelta del reparto, montada (Ez, «Monta el runner», 29 oct. ~17:40)

Maqueta: `docs/proposals/runner-saltar-debajo-29oct.html` (guion `maqueta-c.js`). Montado en todas las rutinas de Mueve y
Estira y en «Tus rutinas» (mismo runner), con la regla técnica arriba de `DECISIONES_TECNICAS_VIGENTES.md`:
- **Una pastilla** en su hueco de siempre bajo la etiqueta del número (`.pace-v1-pastilla`); sale la fila aparte de
  «Con una basta» (`.pace-v1-numbasta`, `v1ConBasta`).
- **«Auto»** (`AutoV1`) bajo las palabras del mando si `useV1AutoAbajo` ve ≥ 700 px de alto; si no, junto a «Siguiente».
- **El círculo**: techo `escritorio ? 300 : 262` con `alto * (escritorio ? 0.36 : 0.3)`; el bloque se centra con márgenes
  `auto` (no `justify-content`); el velo de la pausa se coloca bajo el círculo medido.
- **Medidas**: las de la maqueta (`--v1-u`, `--v1-num`, letras un punto más a ≥ 820 px de alto en el móvil).
- **Textos**: «Colócate sin prisa · pulsa «Empezar ya»» / «Get set, no rush · press Begin now» (misma clave); durante el
  3, 2, 1 se apaga «Al reanudar…» sin mover nada.

**Fotos para Ez, hoy y montado, con todas las pantallas** (Ez lo pidió: «quiero ver todas las resoluciones del runner para
móvil y pc»): https://claude.ai/artifact/MiGd9feEQgLE8GtLSxUULL (`docs/proposals/runner-reparto-montado-29oct.html`, 781 KB;
la ligera, para su visor, `runner-reparto-montado-29oct-ligera.html`, 202 KB). La hacen `censo-montado.js` (fotos y
`censo.json`; con `fotos ... pausa,vuelta`, la pausa) y `reparto-pagina.js` (la página; con `ligera`, la ligera).

**Decidido al montarlo, a falta de que Ez lo mire en la página de fotos** (lo dice su recuadro):
- A 320 × 568 («justo») la pastilla va junto a su etiqueta: debajo no cabía y «Cuídate» pisaba la barra 20 px. La maqueta
  decía 10 px porque, centrada con `justify-content`, el bloque se salía también por arriba y cortaba el círculo bajo la
  cabecera (su censo no lo miraba; `censo-montado.js` sí).
- El número a la misma distancia de la descripción que de la barra, y la barra a 1,6 u del mando: lo pedían
  `runner-congelado` y `runner-mando` (la maqueta los rompía). Frente a la maqueta, el número sube unos 5 px y el círculo
  los gana.
- El número oculto del 3, 2, 1 guarda su alto: el texto del velo subía 9 px al empezar la cuenta.

**Censo** (`censo-montado.js`, hoy = `git show 05e2252:index.html`): las 14 pantallas en cinco pasos, en los dos idiomas. El
círculo no encoge en ninguna, no hay scroll ni texto cortado, y nada se pisa. Pruebas: `tests/runner-reparto.spec.js`
(r-1 a r-7), rojas contra el index de antes; r-6, también contra dos mutantes. Cambian con esto (lo eligió Ez): `runner-auto`
(auto-1 busca «Auto» en el mando), `runner-claro` (la pastilla en `.pace-v1-numgrupo`; «Con una basta» sin hueco propio) y
`runner-mando` (cuenta los tres botones redondos, no todos los del mando).

**Queda, como hoy**: a 320 px de ancho, «Siguiente: nombre largo» con «Auto» al lado parte en dos líneas y sube la barra en
ese paso. El texto que se ve no la pisa (lo mide r-7), pero la barra se mueve entre pasos. Sería otra maqueta.

## Para quien siga

- Pruebas en el 8808 (`PACE_E2E_PORT=8808`). Con otras suites a la vez, lo que caiga por tiempo se repite con
  `--workers=1` antes de creerlo.
- `MoveSessionV1.jsx` ronda las 485 líneas: lo nuevo va en `MoveSessionV1.parts.jsx` (cargado antes que él).
- `tests/runner-cabe.spec.js` (cabe-2, la barra de 4·7·8) cae a veces con otras suites a la vez («acabó antes de
  cuatro ciclos», «llena 3 s»); sola, en verde.
- `node_modules` es una unión al del repo principal; se quita con `cmd /c rmdir node_modules` (y se pone con
  `New-Item -ItemType Junction`). Sin ella, `build-standalone.js` dice «TypeScript not found».
- `page.clock.install` deja el reloj corriendo: un aserto que espera (`toBeHidden`, `toHaveCount(0)`) puede pasar porque
  la cuenta acabó y la pieza se fue. Lo que pasa en un instante se mira con un `evaluate` de una vez (r-6).
