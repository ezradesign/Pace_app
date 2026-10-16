# Encargo: el motor de la semana, ya

16 oct. 2026. Ez fijó la dirección antes de cobrar: que PACE aprenda de cada persona
(`DECISIONES_PRODUCTO.md`, «Lo que hace bueno a PACE antes de cobrar»). Eligió montar ya el motor
que aceptó con la página `docs/traspaso/archivos/motor-semana/motor-semana.html`, sin esperar a tener
semanas de datos: aprende desde la primera semana de los testers, que son amigos (se puede cambiar
lo que haga falta). Va después de la revisión de todos los ejercicios
(`REVISION_EJERCICIOS.md`, aquí al lado): usa sus conclusiones sobre zonas, rutinas de pie y horas.

## Para la sesión que lo haga

Eres la sesión `motor-semana` de PACE. Trabajas en tu propio worktree y tu rama. No toques git en la
carpeta principal ni en otras de `.claude/worktrees/`.

Lee antes: `CLAUDE.md`, `STATE.md`, la página del motor (`motor-semana.html`, con `medidas.json` y
sus fotos), en `docs/product/DECISIONES_TECNICAS_VIGENTES.md` las filas de «A tu ritmo», de las
series (`LAS SERIES ELIGEN CADA PLATO`), de los eventos (`pace.events.v1`, ningún canal de red) y de
PACE completo, y el código: `app/ritmo/ritmo.series.js` (la capa 1, gratis), `app/state-ritmo*.jsx`
(sobre todo `state-ritmo.resumen.jsx` y `ritmo.day.closed`), `app/state-events.jsx` y
`app/state-entitlement.jsx`. Lo que decidió la revisión de ejercicios está en su LISTO y en
`DECISIONES_PRODUCTO.md`.

Lo que Ez ya eligió (no se vuelve a preguntar):
- Cuatro cosas, y cada una cambia algo concreto: qué te sienta bien (de «¿te ayudó?»), qué pausas
  saltas, qué cambias con «Otra» y a qué horas trabajas de verdad.
- Dos cambios por semana como mucho.
- La carta del lunes en una ventana, también cuando no cambia nada.
- Nada de esto sin PACE completo (hasta v1 está abierto para los testers). La capa 1 sigue gratis.

Cómo se trabaja:
1. Con los datos que ya guarda la app (eventos y resumen de cada día), escribe el motor como una
   función pura (entra la semana, sale qué cambia y por qué), en un archivo nuevo de `app/ritmo/`, y
   pruébalo con semanas sembradas: una que no cambia nada, una con cada una de las cuatro señales y
   una con más de dos cambios posibles (se queda con dos).
2. Que los cambios lleguen a «A tu ritmo» por la `memoria` de las series, sin romper que
   `ritmoComponer` sea pura.
3. Antes de pintar la carta, fotos de la app real a 360 y 1280 px con opciones para Ez, calcando la
   página que ya aceptó. Pregúntale con AskUserQuestion.
4. Cada cambio con su prueba en `tests/`, roja contra main de verdad y verde en la rama.
5. Cierre: `npm run verify`, `node build-standalone.js` y luego `git checkout -- PACE_standalone.html`,
   y la suite entera con tu puerto y `--workers=2`; lo que caiga, repítelo solo con `--workers=1`.
   Termina con «LISTO PARA MAIN: rama <rama>, commit <sha>», con CHANGELOG:, STATE: y DECISIONES: en el
   mensaje del commit. No subas a main ni hagas bump.

Reglas: mira `get_usage`; desde el 85 % del límite de 5 horas, commit «wip», push y
`.claude/relevo/RELEVO.md`; nada pasa del 95 %. Commits firmados por ezradesign, sin Co-Authored-By.
Habla con Ez en español sencillo y hazle las preguntas con opciones y una recomendación.
