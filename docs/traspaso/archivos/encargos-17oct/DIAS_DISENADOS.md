# Encargo: los días diseñados

17 oct. 2026. Ez fijó la dirección antes de cobrar (`DECISIONES_PRODUCTO.md`, «Lo que hace bueno a
PACE antes de cobrar»): «ofrecer días con rutinas bien hechas y medidas». Eligió los **días
diseñados**: cada día de la semana con su intención y sus rutinas, todas revisadas con el manual y
medidas de verdad, y las rutinas de pie que faltan para la tarde. Va después de la revisión de los
ejercicios (v0.172.0) y del motor de la semana (v0.173.0), que ya están en `main`.

**Regla de Ez (17 oct.): todo se hace en una habitación o en el escritorio, sin salir de casa.** Los
ejercicios nuevos llegan aquí, no antes.

## Para la sesión que lo haga

Eres la sesión `dias-disenados` de PACE. Trabajas en tu propio worktree y tu rama, con el puerto 8798
para el servidor y la suite (`PACE_E2E_PORT=8798`; si está ocupado, el 8799). No toques git en la
carpeta principal ni en otras de `.claude/worktrees/`. Antes de la suite, para cualquier servidor viejo
en tu puerto: uno arrancado antes de juntar `main` sirve el código de antes.

Lee antes: `CLAUDE.md` (la tabla de los ids cruzados de Mueve y Estira), `STATE.md`, `CONTENT.md`,
`docs/product/BASE_MUEVE_ESTIRA.md`, el informe de la revisión
`docs/traspaso/archivos/revision-ejercicios/REVISION.md` (§4: el momento, la postura y la zona de cada
rutina; §5: el Paseo corto y Hombros fuertes, que se proponían y Ez dejó para aquí), y en
`docs/product/DECISIONES_TECNICAS_VIGENTES.md` las filas de «A tu ritmo», de las series
(`LAS SERIES ELIGEN CADA PLATO`), del motor (`EL MOTOR DE LA SEMANA ES PURO`), de las promesas de los
pasos y de las duraciones. El código: `app/ritmo/ritmo.semana.js` (el tema de la semana y el acento de
cada día, que ya existen), `app/ritmo/ritmo.series.js` (la capa 1 y `RITMO_SERIES_META`),
`app/ritmo/ritmo.motor.js` y `app/state-ritmo*.jsx`.

1. **Qué es un día diseñado.** Hoy cada día ya lleva un tema de la semana y un acento (lunes a
   viernes), y las series eligen cada plato. Propón qué cambia con un día diseñado: la intención de
   cada día (por ejemplo, el lunes arrancar, el miércoles espalda y caderas, el viernes soltar), cómo
   se reparten los momentos de §4 (al empezar, tras comer, la tarde, el cierre), qué pasa con lo
   aprendido por el motor y con «Otra», y si es gratis o de PACE completo. Una página con una tabla
   de casos (un día de jornada, uno de «Dos horas», con el aro a 25 y a 10) y opciones con una
   recomendación. Ez decide con AskUserQuestion antes de montar nada.
2. **Los ejercicios nuevos, para dentro de casa.** Como mínimo los dos de la revisión, adaptados:
   **Paseo corto** en el sitio (marcha en el sitio o caminar por la habitación, sin escaleras ni
   salir) y **Hombros fuertes** (botella de agua o nada). Y las rutinas de pie que hagan falta para que
   la tarde no repita: con el aro a 10 o 15 hoy llegan cuatro pausas sentadas seguidas. Cada una con su
   fuente, explicaciones de 95 letras como mucho en los dos idiomas, sus segundos y su ritmo de
   verdad, su fila en `RITMO_SERIES_META` y su dibujo en el encargo de imágenes
   (`docs/product/GLIFOS_A_DIBUJAR.md` y un prompt como los de `archivos/encargos-14oct/`); mientras,
   salen con el dibujo genérico.
3. **Lo que se ve** (la frase del día, la línea, la pausa): fotos de la app real a 360 y 1280 px con
   opciones antes de montar, y fotos finales antes del LISTO.
4. Cada cambio con su prueba en `tests/`, roja contra main de verdad y verde en la rama;
   `node scripts/audit/censo-promesas.js` en 0 y `tests/duraciones.spec.js` en verde.
5. Cierre: `npm run verify`, `node build-standalone.js` y luego `git checkout -- PACE_standalone.html`,
   y la suite entera con tu puerto y `--workers=2`; lo que caiga, repítelo solo con `--workers=1`.
   Termina con «LISTO PARA MAIN: rama <rama>, commit <sha>», con CHANGELOG:, STATE: y DECISIONES: en el
   mensaje del commit. No subas a main ni hagas bump.

Reglas: mira `get_usage`; desde el 85 % del límite de 5 horas, commit «wip», push y
`.claude/relevo/RELEVO.md`; nada pasa del 95 %. Commits firmados por ezradesign, sin Co-Authored-By.
Habla con Ez en español sencillo y hazle las preguntas con AskUserQuestion, con opciones y una
recomendación. Los testers son amigos: se puede cambiar lo que haga falta.
