# «Tus rutinas» y las tarjetas de las bibliotecas (revisión de ChatGPT del 28 oct.), 29 oct. 2026

Rama `claude/tus-rutinas-c0cf03`, sin juntar en `main`. Los casos vienen de `docs/audits/chatgpt-28oct/04-tus-rutinas.md`
(C1-C6), `03-valor-de-pace.md` (U1, U2) y `07-entender-y-repetir.md` (R2, R3). Cada uno lleva su prueba en
`tests/tus-rutinas-chatgpt.spec.js` o, U1 y C6, en `tests/tus-rutinas-borrador.spec.js`, y se vio caer antes del arreglo
(contra el `main` de la 0.185.0, o contra la rama para U1 y C6). No se ha subido la versión ni se han tocado CHANGELOG, STATE ni la
hoja de Ez.

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
| U1 (Ez: B) | 5a76c8d | Cerrar el constructor no pregunta: lo que llevas es un borrador, uno solo, en el estado (`customDraft`, con `setCustomDraft` / `getCustomDraft` / `clearCustomDraft` en `state-custom.jsx`). Se escribe 400 ms después de cada cambio y enseguida al cerrar, con `pagehide` y al ocultarse la página. «Tus rutinas» lo ofrece en el sitio de «Crear rutina» («Seguir con tu borrador»), y el constructor lo retoma con «Sigues con tu borrador de hoy, 10:42.» y «Empezar de cero», o, si es de una rutina que existe, «Sigues con tus cambios en “…”.» y «Deshacer los cambios». En «Elige un ejercicio», Escape, la × y tocar fuera vuelven a la rutina. El saneador descarta un borrador que no se lee entero (`paceBorradorValido`), y solo él |
| C6 (Ez: A) | 7a17fc4 | El constructor mira antes de guardar si ya hay diez rutinas o si la rutina se borró en otra pestaña, y lo dice en una línea encima de Guardar, con la rutina en pantalla y en el borrador; «Guardarla como nueva» la guarda con otro id |

Dos filas nuevas arriba en DECISIONES_TECNICAS (la ficha y lo que pide; el borrador y lo que no deja guardar) y retoques en las de
`enPausa` y `customSegundos`. El censo de textos pasa de 1064 a 1078 (`preview.eq.chair`, `lib.where.either`, `lib.series.cada`,
`custom.draft.*` x8 y `custom.save.*` x3).

## Cómo está probado

`npm run verify` en verde tras C6. Las 13 pruebas de U1 y C6 pasan, y cada una se vio caer contra la rama antes de montarlo; las de
«otra pestaña» usan una segunda página de verdad, y una comprueba que una rutina guardada antes sigue intacta. **La suite entera,
sobre 7a17fc4 (lo último que toca código), pasa: 1072 en verde, 2 saltadas (el audio del iPhone, como siempre) y una caída, foco-5 de `pestanas-foco.spec.js` (`clock.pauseAt: Cannot fast-forward to the past`, el reloj de la prueba bajo carga), que repetida sola con `--workers=1` pasa: 1073 en verde, en 33,8 min en el 8809.** Para repetirla, tras `node build-standalone.js`:
`PACE_E2E_PORT=8809 npx playwright test`. Lo que cae por tiempo mientras otra sesión prueba a la vez se repite con `--workers=1`
antes de creerlo (pasó con R2 y R3 de `tus-rutinas-auditoria.spec.js`, que pasan solas).

## Espera a Ez

**Mirar las fotos y decir «júntalo».** Página «Tus rutinas, montado»: https://claude.ai/artifact/3uABsmongj5csezvonsWWY
(`docs/proposals/tus-rutinas-montado-29oct.html`). Las fotos se rehacen con `fotos-montado.js` (servidor en el 8810, para no chocar
con la suite) y `pagina-montado.js` de esta carpeta, tras `node build-standalone.js`. Dos cosas que la maqueta no decía y que la página
le enseña:

- Al cambiar una rutina que ya existe, el botón dice «Deshacer los cambios» y no «Empezar de cero»: la deja como estaba guardada, en
  vez de vaciarla.
- Hay un solo borrador: si hay uno y se cambia otra rutina con su lápiz, lo nuevo ocupa su sitio.

La maqueta que eligió Ez: https://claude.ai/artifact/LD2aRGw2gsrK2XM2DrovkB (`docs/proposals/tus-rutinas-u1-c6-29oct.html`).

## Para quien siga

- **`customDraft` no está en `defaultState` a propósito**: el saneador devuelve a `null` un objeto donde la fábrica tiene `null`, y
  se llevaría el borrador. Lo mira su propio bloque en `state-core.sanea.js`, y `deleteCustomRoutine` se lleva el de su rutina.
- **B4 (la otra sesión)**: las rutinas del catálogo «Core silencioso» y las de «Extensión torácica» siguen con
  `equipment: []` en `move.data.js` y `extra.data*.js`, que esta sesión no tocaba.
- **C4 y el runner**: los textos de la ficha van ya en el idioma de la app, porque `v1Instr` traduce por la posición del paso
  en su rutina y una propia no tiene esas claves. Si el runner aprende a leer una clave por paso (como `hacerla`, pero por
  paso), `moveRutinaGuiada` puede dejar de cachear por idioma.
- **C4 y el primer paso**: en una rutina propia, como en el catálogo, la colocación del primer paso solo se ve si el paso trae
  `setup: ready`; es lo mismo que B4 arregla en el runner.
- Las rutinas guardadas antes conservan su `cue`, que ya no se lee; desaparece la próxima vez que se guarden.
- La unión de `node_modules` se quita al acabar; para probar, se vuelve a enlazar al del repo principal (`mklink /J`).
