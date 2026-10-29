# «Tus rutinas» y las tarjetas de las bibliotecas (revisión de ChatGPT del 28 oct.), 29 oct. 2026

Rama `claude/tus-rutinas-c0cf03`, sin juntar en `main`. Los casos vienen de `docs/audits/chatgpt-28oct/04-tus-rutinas.md`
(C1-C6), `03-valor-de-pace.md` (U1, U2) y `07-entender-y-repetir.md` (R2, R3). Cada uno lleva su prueba en
`tests/tus-rutinas-chatgpt.spec.js`, que se vio caer contra el `main` de la 0.185.0 antes del arreglo.
No se ha subido la versión ni se han tocado CHANGELOG, STATE ni la hoja de Ez.

## Hecho, un commit por caso

| Caso | Commit | Qué cambia |
|---|---|---|
| C3 (seguridad) | f8fe136 | `EXERCISE_PIDE` pide la banda, la silla sin ruedas, la silla con respaldo (clave nueva `chair`), la pared y la mesa o el cojín «si lo necesitas» donde lo dice el texto. `scripts/verify.rutinas.js` casa el texto de cada ejercicio con lo que pide, en los dos sentidos, con sus excepciones razonadas |
| C1 | 6356312 | Estira se esconde (`enPausa`) al abrir el constructor, y el constructor va después de las dos bibliotecas en `main.jsx` |
| C5 | a074f8e | Claves en inglés de «Zancada con apertura»; `verify` pide nombre y cue en ES y EN a los 73 ejercicios |
| C2 | d724bab | `customMinutos` (`state-custom.jsx`): una cifra para la tarjeta, el constructor, la vista previa y el `min` guardado |
| R2, R3 | 1bee157 | «sentado o de pie» si cada ejercicio vale de las dos formas (`libraryDonde`); las series son de UN ejercicio: «2 ejercicios · 2 series de cada», o sin línea. Van juntos porque comparten la tarjeta y su archivo de textos |
| U2 | 662284d | La tarjeta de una rutina propia se empieza con un botón de verdad (`.pace-lib-hit`), con el lápiz aparte; `Card` gana `hover` |
| C4 | b560f81 | Una rutina propia guarda `{ name, dur }`; cada paso toma de la ficha del catálogo (`ejercicioFicha`) la colocación, el cuidado, el «colócate» y si se puede saltar. La acción es el cue neutro del registro, porque la del catálogo cuenta las repeticiones de su serie |

Fila nueva arriba en DECISIONES_TECNICAS (la ficha y lo que pide) y retoques en las de `enPausa` y `customSegundos`.
El censo de textos pasa de 1064 a 1067 (`preview.eq.chair`, `lib.where.either`, `lib.series.cada`).

## Cómo está probado

`npm run verify` en verde tras C4. Las pruebas de «Tus rutinas», de la biblioteca, del runner, del saneador y de los eventos
pasan (89 en 4,8 min, con `--workers=3`). **La suite entera se lanzó hacia las 11:00 del 29 oct. en el 8809; si este LEEME no
dice su resultado, no llegó a acabar**: repítela tras `node build-standalone.js` con
`PACE_E2E_PORT=8809 npx playwright test`, y lo que caiga por tiempo, otra vez con `--workers=1`.

## Por dónde seguir

1. Con la respuesta de Ez a la maqueta, montar U1 y C6 en `app/custom/CustomBuilder.jsx` (y `state-custom.jsx` si es la B
   de U1: el borrador en el estado, uno solo), con su prueba que caiga antes contra esta rama y textos en ES y EN.
2. La suite entera en verde, y quitar la unión de `node_modules` del worktree (`cmd /c rmdir node_modules`).

## Espera a Ez: U1 y C6

Maqueta publicada: https://claude.ai/artifact/LD2aRGw2gsrK2XM2DrovkB (`docs/proposals/tus-rutinas-u1-c6-29oct.html`).
Recomendado «U1 B · C6 A»: el borrador que espera en el dispositivo y una línea encima de Guardar. Las fotos y la página se
rehacen con `fotos-u1-c6.js` y `pagina-u1-c6.js` de esta carpeta (tras `node build-standalone.js`).

## Para quien siga

- **B4 (la otra sesión)**: las rutinas del catálogo «Core silencioso» y las de «Extensión torácica» siguen con
  `equipment: []` en `move.data.js` y `extra.data*.js`, que esta sesión no tocaba.
- **C4 y el runner**: los textos de la ficha van ya en el idioma de la app, porque `v1Instr` traduce por la posición del paso
  en su rutina y una propia no tiene esas claves. Si el runner aprende a leer una clave por paso (como `hacerla`, pero por
  paso), `moveRutinaGuiada` puede dejar de cachear por idioma.
- **C4 y el primer paso**: en una rutina propia, como en el catálogo, la colocación del primer paso solo se ve si el paso trae
  `setup: ready`; es lo mismo que B4 arregla en el runner.
- Las rutinas guardadas antes conservan su `cue`, que ya no se lee; desaparece la próxima vez que se guarden.
