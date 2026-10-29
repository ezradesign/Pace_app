# El runner de Mueve y Estira, más claro (29 oct. 2026)

Rama `claude/runner-claro-15db3c`, sin juntar en `main`. Casos de las revisiones de ChatGPT del 28 oct.
(`docs/audits/chatgpt-28oct/LEEME.md`): B1-B4, R4, R6 y, con maqueta, B3, P5, P6 y P8, ya montados.

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

## Para quien siga

- Pruebas en el 8808 (`PACE_E2E_PORT=8808`). Con otras suites a la vez, lo que caiga por tiempo se repite con
  `--workers=1` antes de creerlo.
- `MoveSessionV1.jsx` ronda las 485 líneas: lo nuevo va en `MoveSessionV1.parts.jsx` (cargado antes que él).
- `tests/runner-cabe.spec.js` (cabe-2, la barra de 4·7·8) cae a veces con otras suites a la vez («acabó antes de
  cuatro ciclos», «llena 3 s»); sola, en verde.
- `node_modules` es una unión al del repo principal; se quita con `cmd /c rmdir node_modules`.
