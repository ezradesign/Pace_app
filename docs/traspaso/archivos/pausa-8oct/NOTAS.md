# La pausa más elegante: lo comprobado en el código (8 oct. 2026)

Encargo de Ez: «¿el breakmenú puede ser más elegante y con una mejor tipografía? Desentona con el
resto de la app». Esta sesión se cortó por el límite de uso antes de hacer fotos. Aquí está lo
comprobado leyendo el código, para que la siguiente sesión haga las fotos y la página sin repetirlo.

## Lo que desentona, comprobado

1. **Los botones van en letra de interfaz y con esquinas, no en píldora.** «Hacer la pausa»,
   «Seguir con el bloque N», «Empezar» y «Saltar esta pausa» usan `Button` (`app/ui/Primitives.jsx`):
   Inter Tight 14, radio `--r-md`. Las llamadas principales del resto de la app son píldoras en
   serif itálica:
   - «Empezar foco» (`focusStyles.startBtnPrimary`, `app/focus/FocusTimer.support.jsx`): píldora,
     serif itálica 16, `--focus-cta`.
   - «Empezar» de la vista previa de una rutina (`app/ui/RoutinePreview.jsx`): píldora, serif
     itálica 16, **con el color del módulo** (`--extra` en Estira, `--move` en Mueve).
   - «Comienza →» (`.pace-rt-tm-pildora`, `app/ritmo/ritmo.css.jsx`): píldora de papel tonal,
     serif itálica 18, borde de `--focus` al 35 %.
2. **Todo va en terracota sea cual sea la rutina.** La tarjeta del plato tiene el borde y el fondo
   en `--breathe`, el motivo y el glifo en `--breathe-2`, y el botón es la variante `terracota`
   (también `--breathe`). Es el color de Respira; Estira es `--extra` (#6B7A8F) y Mueve `--move`
   (#9A7B4F). Pasa con «A tu ritmo» (`BreakMenu.ritmo.jsx`) y sin él (la propuesta de
   `BreakMenu.jsx`, p. ej. «Llevas 45 minutos sentado» para una rutina de Estira).
3. **Hidrátate es otra tarjeta con otro estilo.** Borde de 1,5 px en `--hydrate`, fondo
   `--hydrate-soft`, nombre en serif 20 y «Un vaso ahora» en sans 12 alineado a la derecha. Dos
   tarjetas rellenas de dos colores compiten por ser lo principal.
4. **El subtítulo suena a máquina:** «17:45 · lo que el menú tenía para ahora.» (en inglés, «what
   the menu had for now.»), `break.ritmo.sub` en `app/i18n/strings/breakmenu.js`.
5. **«A tu ritmo ·» se repite** al principio de cada motivo (`break.prop.ritmo.*`,
   `app/i18n/strings/ritmo.js`), cuando arriba ya pone «Bloque 1 de 2 · hecho».
6. **Dos maneras de cerrar:** la × del `Modal` arriba a la derecha y «Saltar esta pausa» abajo.

## Por comprobar con fotos

- **La comida.** `ritmoPropuesta` (`app/state-ritmo.jsx`) devuelve `modulo: 'water'` y
  `rutina: null` para la comida. En `BreakMenu.ritmo.jsx` eso deja sin nombre, sin minutos y sin
  glifo la tarjeta del plato (solo el motivo), y «Hacer la pausa» abriría Hidrátate, igual que la
  tarjeta azul de debajo. Si las fotos lo confirman, es un defecto, no solo una cuestión de estilo.
- La línea «Atajo: Intro · H · Esc» se esconde por debajo de 640 px (`pace-break-responsive-css`).

## Reglas que cualquier opción respeta

- La pausa propone UNA cosa con su motivo; sin motivo, el menú de siempre (fila de s187 en
  `DECISIONES_TECNICAS_VIGENTES.md`).
- La propuesta no hace crecer la ventana a 360×640 (`tests/pausa-propone.spec.js`, test 2).
- Con menú, una sola pregunta (hacer la pausa o seguir), el plato con su glifo y solo Hidrátate
  aparte (fila de s195b). `Button` no reenvía `data-*`: las pruebas buscan los botones por su nombre.

## Cómo seguir

1. En esta copia no hay `node_modules`: `npm ci` antes de nada. `index.html` está construido
   (v0.149.0, el de `origin/main`).
2. Servir con `PORT=8785 node .claude/static-server.js` (nunca 8765 ni 8775; la suite, con
   `PACE_E2E_PORT=8786`). Partir de `docs/traspaso/archivos/motor-semana/fotos.js`, que ya levanta su
   servidor y comprueba que es el de esta carpeta.
3. Para abrir la pausa con menú: sembrar `ritmo.dia` como en `tests/ritmo-pausa.spec.js`
   (`{ fecha, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} }` a las 9:00), pulsar
   «Empezar jornada» y avanzar el reloj de minuto en minuto (uno grande no abre la pausa). Para la
   larga y la comida, mirar antes en `ritmoPlan(getState()).m.items` qué bloque las precede, sembrar
   `cycle` con los bloques ya hechos y poner el reloj a la hora de empezar ese bloque.
4. Sin menú: `focusMinutes: 45` (propone Estira) y un estado con todo hecho (sin propuesta), como en
   `tests/pausa-propone.spec.js`.
5. Fotos a 360×640, 360×718, 1280×800 y 1920×1080, en crema y en oscuro, y una en inglés; después,
   dos o tres opciones inyectadas en el DOM y la página con la recomendación y las preguntas.
