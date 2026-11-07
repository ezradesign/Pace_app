# Textos en inglés · lo montado (7 nov. 2026)

Rama `claude/textos-ingles-7nov-a227ea`, sobre `main` 0.192.0. Las letras de Ez: **1A 2A 3A 4A 5A**. Sin subir la
versión (la sube la coordinadora al juntar). La página para Ez: `montado-ez.html`.

## Lo hecho

- **Las 281 filas de `comprobado.md`**, con la columna «Queda» como texto final: 256 claves del bloque inglés de
  `app/i18n/` (251 líneas, porque varias filas comparten clave) y 42 cambios en las cinco páginas web. Un script
  comprobó antes de cambiar cada una que el texto de hoy era el de la fila, y después cargó los archivos en el orden
  de `PACE.html` para ver que el valor que gana es el nuevo. Las claves no cambian: solo el texto.
- **1A, inglés americano** en toda la app y la web: *color theme*, *practice*, *catalog*, *analog*, *license*,
  *toward*; las tres británicas de hoy, fuera («centre» en `move.back.standing.s1`, «catalogue» en
  `premium.inc.custom.d` y en /premium, «energising», que se iba con su fila), y además «practised» (un `alt` de
  /premium) y «cancelled» → «canceled» (`settings.msg.export.cancel`, /desistir, el correo de
  `functions/api/desistir.js` y `legal/desistimiento/`). Las fechas siguen en en-GB. «acknowledgement» se queda:
  también es americano.
- **2A**: «The antidote to sitting.» (bienvenida y Estira), «The antidote to sitting» (`ritmo.motivo.estira` y
  `break.prop.ritmo.estira`), «A quick antidote to sitting» (la pausa de Mueve), «The antidote to desk work» y «The
  antidote to typing» (dos grupos de Estira). El español no se toca.
- **3A**, las promesas de Respira, fuera en los dos idiomas (`app/breathe/BreatheLibrary.jsx` y
  `content/breathe.js`): los subtítulos de Energía, Equilibrio y Relajación, y Box 4·4·4·4, Diafragmática, Tolerancia
  CO₂, Rítmica yin y Bhramari. El antes y después, en la página de Ez.
- **4A**, en los dos idiomas: «Corto y discreto, casi siempre sin material» (`lib.move.subtitle`), «Movimientos
  pequeños, en tu mesa» (el grupo Sigilo), «Bajo la mesa, sentado o de pie» (Gemelos) y «Glúteos en la silla» /
  «Seated Glute Squeezes», «Actívalos sin levantarte de la silla» (`app/move/move.data.js` y `content/move.js`). El id
  `extra.glutes.stealth` se queda.
- **5A**: las tres promesas de lo gratis se quedan como están; solo «the core, no strings» pasa a «the core, no
  strings attached».
- **Las cinco diferencias de sentido**: `session.hold` y `breathe.phase.sosten.vacio` dicen «Hold after exhaling»;
  `lib.empty.floor.n` y `lib.empty.any.n` vuelven a llevar `{n}`; **D-1**, `content/breathe.js` dice «Inhale more»
  como `sessions.js` (siguen distintas las dos oceánicas, y así lo dicen su cabecera y su fila de
  `DECISIONES_TECNICAS_VIGENTES.md`); «Shoulder shrugs» con su clave «Shrug + round» intacta; y «Latest achievement».
- **`CONTENT.md`**: el nombre nuevo de los glúteos y una línea con el criterio en Respira y en Mueve (lo que se hace,
  no lo que le pasa al cuerpo; sin absolutos).
- `app/i18n/strings/sessions.js` no gana ninguna clave (la rama de accesibilidad añade dos).

## Lo que he cambiado sobre `comprobado.md`, y por qué

- Fila 12, `sidebar.agua.ninguno`: **«Zero glasses of {m}»** en vez de «0 of {m} glasses». En la barra el número va
  con letra («Four glasses of eight»), y «0 of eight glasses» mezclaba cifra y letra.
- Fila 243, /premium: **«Achievements, your day and your week»** en vez de «Achievements, daily and weekly stats».
  Debajo ya pone «stats», como en «Your month, your year and what helps».
- Fila 179: «Deep breaths, in rounds» / «Respiraciones profundas, en rondas», que es lo que dicen las tres rutinas de
  Energía («30 deep breaths…»).
- Seis textos que ninguna fila nombraba y aún decían «copy» donde el resto ya dice «backup»
  (`settings.data.export.title`, `settings.data.import.title`, `settings.msg.import.partial`,
  `settings.reset.cuerpo` y `.app`, `settings.import.titulo` y `red.global.copia`): la página de Ez prometía «backup
  para las copias» en todas partes.

## Lo que no

- La ficha de Google Play (`docs/launch/google-play/ficha.md`) no estaba en la revisión y sigue con su inglés (lo
  vigila `tests/textos-honestos.spec.js` 14). Si se quiere igual que /premium («More in-depth routines», «A week
  tailored to you»), es otra pasada, y se sube a Play a mano.
- Otras descripciones de Respira que no prometen un efecto en el cuerpo se quedan: «Reset rápido», «Freno suave»,
  «Pensada para soltar el día…» (ya con su «pensada para» desde el paquete T).
- La suite entera, no: la corre la coordinadora al juntar.

## Cómo se probó

- `npm run verify`: pasa (0 problemas).
- `node build-standalone.js`, y `PACE_standalone.html` devuelto como estaba.
- Las pruebas que nombraban un texto viejo, buscadas en `tests/` con los textos que salen del diff, y corridas con
  `PACE_E2E_PORT=8888 --workers=1` junto con las que miden la home y la barra: RESULTADO_E2E
- Fotos a 360 px en inglés (fases de Respira, «A tu ritmo», la barra) y la barra a 1280, y Respira y Mueve en
  español a 360, en la página de Ez.

## Al juntar

Juntar antes `claude/accesibilidad-7nov-e36d06`. CONFLICTOS
