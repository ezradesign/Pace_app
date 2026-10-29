# El runner de Mueve y Estira, más claro (29 oct. 2026)

Rama `claude/runner-claro-15db3c`, sin juntar en `main`. Casos de las revisiones de ChatGPT del 28 oct.
(`docs/audits/chatgpt-28oct/LEEME.md`): B1-B4, R4, R6 y, con maqueta, B3, P5, P6 y P8.

## Hecho (cada uno con su prueba, roja contra la 0.185.0 antes del arreglo)

| Caso | Qué | Dónde | Prueba |
|---|---|---|---|
| B4 | La colocación escrita se ve 5 s antes de empezar, salvo en otra serie del mismo ejercicio. Seis no salían: «Silla sin ruedas» de Core silencioso, el isquio de pie, los hombros de Escritorio express, rodar hacia abajo, Elevación de talones y la Pica tras un descanso | `v1StepSetup` y `v1MismoEjercicioAntes` (`MoveSessionV1.support.jsx`) | `tests/runner-colocacion.spec.js` (8) |
| B1 | Sin Auto, esperar a «›» con la cuenta en 0 no suma a ningún reloj; las reps a tu ritmo sí | `esperaMano` (`MoveSessionV1.jsx`) | `tests/runner-espera.spec.js` (espera-1, espera-2) |
| B2 | En pausa, encender Auto solo cambia la preferencia; lo pendiente pasa al reanudar, sin repetir sonidos | los tres efectos que avanzan miran `paused`; `sonadoRef` | `tests/runner-espera.spec.js` (espera-3 a 5) |
| R4 | «Glúteos invisibles», paso 3: «unos ocho segundos… Tres veces» (con diez no cabían en 30 s), en los dos idiomas | `move.data.js`, `i18n/content/move.js` | `tests/runner-cabe.spec.js` (cabe-1, lee la frase en pantalla) |
| R6 | La barra de 4·7·8 (y de toda Respira por tiempo) se mide contra el final de verdad, ciclos enteros | `finSec` (`BreatheSession.jsx`) | `tests/runner-cabe.spec.js` (cabe-2) |

**Material, con B4 (aviso de la coordinadora, 29 oct.)**: «Core silencioso» declara `equipment: ['stableChair']`
(«Una silla estable, sin ruedas», clave que ya está en `main`), y «Antes de empezar» lo dice (última prueba de
`runner-colocacion.spec.js`, roja antes). **Falta, a propósito**: las tres rutinas con «Extensión torácica»
(`extra.data.js`, dos, y `extra.data.piernas.js`, una) siguen con `equipment: []`; piden silla con respaldo, que es
la clave nueva `chair` de la rama de «Tus rutinas» (f8fe136). La pone la coordinadora al juntar las dos ramas.

B4 cambió la duración estimada de esas seis rutinas (+5 s) y obligó a ajustar `tests/runner-aro-colocate.spec.js`
(los hombros de Escritorio express ya se colocan). Filas nuevas arriba de `DECISIONES_TECNICAS_VIGENTES.md`.

## Espera a Ez: la maqueta

https://claude.ai/artifact/Mtv9tKsUy9qWgJgKwfD788 (HTML en `docs/proposals/runner-claro-29oct.html`; fotos con
`fotos.js` y página con `pagina.js`, en esta carpeta). Recomendado: **B3 A, P5 A, P6 A, P8 A**.
- B3 A: la flecha cuenta las reps de la banda («Hecho») y «Saltar este paso» va junto al número, como el «+15 s».
- P5 A: una palabra bajo cada botón del mando; la de la flecha dice lo que hace.
- P6 A: «Con una basta» en el descanso tras la primera serie (solo en «Levántate y sube», la única con esa frase),
  y la rutina cuenta entera.
- P8 A: «En pausa» en el mismo sitio, y al reanudar un ejercicio, 5 s de «Colócate» y luego lo que quedaba.

Se monta solo lo que Ez elija; la coordinadora pasa la respuesta.

## Para quien siga

- Pruebas en el 8808 (`PACE_E2E_PORT=8808`). Con otras suites a la vez, lo que caiga por tiempo se repite con
  `--workers=1` antes de creerlo.
- `MoveSessionV1.jsx` ronda las 485 líneas: lo que se monte de la maqueta va en un `.parts` nuevo.
- `node_modules` es una unión al del repo principal; se quita con `cmd /c rmdir node_modules`.
