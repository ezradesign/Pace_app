# Los avisos del iPhone (rama `claude/awesome-albattani-270a62`, 28 oct. 2026)

Lo que dejó para después Android a fondo (0.184.0): sus cuatro arreglos de los avisos, ahora en el iPhone, el
aviso de fin que nombra la pausa de «A tu ritmo» en las dos apps, y dos pruebas que caían. Sin versión: la sube
la coordinadora al juntarla. La empezó una sesión de la otra cuenta, que se paró al cambiar de cuenta sin commit;
`775db39` guarda su copia de trabajo tal cual y lo de después va encima.

Página para Ez con los textos del aviso de fin, antes y después, y qué cambia en el iPhone en palabras llanas:
https://claude.ai/artifact/7Hj5sHmFuuzVP5QFntqdN7 (`docs/proposals/avisos-iphone-28oct.html`). Le pregunta una
cosa: **A** (recomendada) el móvil dice lo mismo que la web; **B** el móvil sigue con «Foco completado». Los
textos de la página salen de la app (jornada entera del 17 sep., es y en) con `textos-aviso.js`, en esta
carpeta: `ritmoAvisoFin` con `cycle` bloque a bloque, jornada y media, contra el `index.html` servido
(`node docs/traspaso/archivos/avisos-iphone/textos-aviso.js "$(pwd)" 8806`). Solo el de bloques cortos lleva
números de ejemplo. Si Ez dice B, basta con que FocusTimer no pase `fin` a `paceNativoFoco`, y las
pruebas «el aviso de fin dice lo que viene» de `android-avisos` e `ios-avisos.safari` pasan a pedir «Foco
completado».

## Lo hecho

1. **El iPhone, como Android** (`app/ui/ios.js`). A1, una sola campana: si iOS tenía el aviso de un bloque,
   PACE no toca la suya ni al volver ni al abrirla después de que iOS la cerrara (`paceIosCampana`, por
   `paceNativoCampana`). A2, el aviso se quita a tiempo: todo va en fila y un «quitar» que falla se repite al
   pausar o reiniciar. A3, «puesto» solo cuando iOS contesta, guardado en `pace.ios.aviso`; si no lo deja,
   Ajustes lo dice («El iPhone no dejó poner el último aviso de fin de Foco.») y la campana es de PACE. A4, al
   volver se mira el permiso y Ajustes se repinta (`pace:avisos-nativo`, el evento de las dos apps). Y sin el
   permiso no se programa; el sí que llega con la app inactiva por la pregunta de iOS pone el aviso entonces.
2. **El aviso de fin con «A tu ritmo»** (`app/ritmo/ritmo.aviso.js`, `app/ui/nativo.js`): en Android y en el
   iPhone decía siempre «Foco completado». Ahora dice lo mismo que el aviso de la web al acabar el bloque (la D2
   de Ez, s198): la pausa que viene y la hora del bloque siguiente. **No hay textos nuevos**: son los
   `notify.ritmo.*` que ya usa la web. Sin «A tu ritmo», el de siempre. Ez tiene que verlos en la página.
3. **`ritmo-pausa-libre.spec.js:45`**: no era la espera, era el reloj. Al cambiar de reloj con uno en marcha, un
   tic que caía entre el reinicio y el pintado daba el reloj por acabado (`Date.now() >= null`), y con el PC
   cargado ese hueco crece. Arreglado en `app/focus/useCountdown.jsx` y vigilado por «un tic entre el reinicio y
   el pintado» de `tests/aro-modo-identidad.spec.js`. Además, las tres `ritmo-pausa*` acaban el bloque con
   `terminarBloque` (tests/helpers.js): salto justo al final y espera a la ventana, sin minuto a minuto.
4. **`scripts/glifos/generar-pendientes.js`**: caía al arrancar sin carpeta (`path.join` con `undefined`) y
   leía el checkout principal escrito a mano. Ahora usa su propio repo y una carpeta temporal, y cuenta aparte
   el arte que ya no se pide; `docs/product/GLIFOS_EJERCICIOS_PENDIENTES.md` regenerado con él (68 identidades,
   58 con arte y 10 pendientes; doce identidades nuevas aún no tienen fila en el encargo y salen «Sin grupo»).

Las reglas técnicas, en `DECISIONES_TECNICAS_VIGENTES.md` (dos filas arriba del todo) y una clave más en el
censo de `verify` (`settings.notify.fallo.ios`; la de Android pasa a `.android`).

## Las pruebas (28 oct., en este worktree, puerto 8806)

- `npm run verify`: pasa, 0 problemas.
- `node build-standalone.js` y `git checkout -- PACE_standalone.html`: `index.html` no cambia con lo de después de
  `775db39` (el comentario de FocusTimer no llega al artefacto).
- Avisos, pausas y Safari, con `--workers=1` (`android-avisos`, `ios-avisos.safari`, `ios-nativo.safari`,
  `aro-modo-identidad`, `ritmo-pausa`, `ritmo-pausa-entera`, `ritmo-pausa-libre`): 98 pasan y 2 se saltan (el
  audio del iPhone, que el WebKit de la suite no trae: ya se saltaban en `main`).
- La suite entera con `--workers=1`: 1017 pasan y 2 se saltan (las mismas), en 45,9 min.
- `node scripts/glifos/generar-pendientes.js` sin argumentos: arranca, da 68 · 58 · 10 y deja el documento igual.

## Lo que falta

- Que Ez vea los textos del aviso de fin y diga si valen (la página de arriba).
- Probarlo en un iPhone de verdad (TestFlight): que iOS entregue el aviso a su hora y que no suene dos veces.
- Al juntar: «Lo que falta para vender» toca `app/ui/ios.js` (la ventana de valorar, 4A); el choque, si sale, es
  de la coordinadora.

## Línea de CHANGELOG propuesta

La versión la pone la coordinadora al juntar:

```
| v0.X.Y | 2026-10-28 | Los avisos del iPhone, como los de Android en la 0.184.0. El aviso de fin de Foco suena una sola vez: si el iPhone ya avisó, PACE no vuelve a tocar la campana al volver, ni al abrirla después de que el iPhone la cerrara. Se quita a tiempo al volver, pausar o reiniciar, aunque el iPhone tarde en contestar o falle la primera vez; solo se da por puesto cuando el iPhone lo confirma, y si no lo deja, Ajustes lo dice y la campana es de PACE. Sin el permiso ya no se intenta, y el sí que se da con un Foco en marcha pone el aviso. Ajustes se entera del permiso al volver de los Ajustes del iPhone. En los dos móviles, con «A tu ritmo», el aviso de fin dice la pausa que toca y a qué hora vuelves, con las palabras de la web («Tu pausa: Piernas sin pasos · 3 min»), y no «Foco completado». Y al cambiar de reloj con uno en marcha, con el equipo muy cargado, el aro ya no puede darse por acabado |
```
