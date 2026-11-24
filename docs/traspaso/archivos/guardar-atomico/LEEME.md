# `guardar()` sin carreras: dos renovaciones de la mensual a la vez, 6 nov.

Rama `claude/guardar-atomico-166e3f`, sobre `main` en 2fdfd4fe (v0.191.1). Es el punto `guardar()` de la revisión de ChatGPT
del 5 nov. (`docs/audits/chatgpt-5nov/revision-5nov.md`), que va antes de encender la mensual. No hay versión nueva ni
CHANGELOG ni STATE: eso lo pone la coordinadora al juntar. No cambia nada en pantalla, en `app/` ni en el panel de Cloudflare.

## Qué pasaba

KV no tiene transacciones. `guardar()` leía `suscripcion:<id>`, comparaba fechas y escribía. Si dos renovaciones distintas
de una mensual llegaban a la vez (la de un mes que Stripe reintenta tarde y la del mes siguiente), las dos leían lo mismo y,
si la más corta escribía la última, se quedaba ella. A partir de ahí `/api/renovar` y `/recuperar` daban un código que
acaba un mes antes de lo pagado.

## Qué cambió

- **`cobro/mensual.js`, nuevo.** Cada periodo pagado de una mensual se guarda en su propia llave,
  `periodo:<id>:<expiresAt>`. Dos periodos distintos nunca escriben en la misma llave, y un aviso repetido escribe lo mismo
  en la suya. Para leer se usa la lista de llaves de KV (`list`, con todas sus páginas) y se coge el código que más dura,
  `suscripcion:` incluida. Tres funciones: `mensualGuardar`, `mensualUltimo` y `mensualBorrar`.
- **`functions/api/stripe.js`**: `guardar()` compara con `mensualUltimo` y guarda con `mensualGuardar`. La baja comprueba
  con `mensualUltimo` si la mensual tenía código y borra todos sus códigos con `mensualBorrar`.
- **`renovar.js` y `recuperar.js`** dan `mensualUltimo` donde antes leían `suscripcion:` a pelo.
- **`suscripcion:<id>` se queda.** Se sigue leyendo, porque es lo único que hay de las mensuales guardadas antes y lo que está
  en KV no se puede migrar. También se sigue escribiendo: si un día se vuelve a una versión anterior de la web en
  Cloudflare, encuentra un código. Puede acabar con el más corto de dos avisos solapados, así que nadie se fía solo de ella.

### Por qué esta salida y no la de releer

La otra salida era quedarse con el máximo y releer antes y después de escribir para corregir. Eso estrecha la ventana, pero
no la cierra. Un aviso que leyó antes puede escribir después de que el otro haya hecho su última relectura. Además, KV tarda
hasta un minuto en enseñar fuera de su centro de datos lo que se escribió en él. Con una llave por periodo, lo que queda
guardado es la suma de todo lo que se escribió, sin que importe el orden, y la lectura toma el máximo. No hace falta nada
nuevo en Cloudflare: `list` es del mismo KV `VENTAS`.

### Qué queda sin cubrir

- **Un minuto de retraso, nunca hacia atrás.** La lista de llaves puede tardar hasta un minuto en enseñar un periodo nuevo
  fuera del centro de datos donde se escribió. Durante ese rato se lee el código de antes, como si la renovación no hubiera
  llegado aún. La app vuelve a preguntar y el código lleva tres días de margen.
- **Una baja a la vez que una renovación** puede dejar guardado el código de esa renovación después de la baja. Nadie lo da:
  `renovar` y `recuperar` miran antes la marca `baja:` y contestan «terminada», y la prueba lo comprueba en los dos órdenes.
  Ese código no lleva datos de nadie y queda al lado de la marca, que ya se guarda para siempre. Antes pasaba lo mismo con
  `suscripcion:`.
- **Dos avisos del mismo periodo con algo distinto** comparten llave, porque acaban en el mismo milisegundo. Es el caso del
  alta con prueba y su factura de 0 €: puede quedarse cualquiera de los dos. Duran lo mismo y como mucho cambia `trialEnd`.
  Antes también pasaba.
- **Lo que cuesta.** Cada `renovar`, `recuperar` y aviso de la mensual hace un `list`. La app solo llama a `renovar` en los
  3,5 días antes de caducar, como mucho cada seis horas (y al abrir o al volver la red), y deja de preguntar en cuanto tiene
  el código nuevo. Salen unas pocas llamadas al mes por suscriptor. El plan gratis de KV deja 1.000 `list` al día, que dan
  para miles de suscriptores. Si un día se pasara, `renovar` fallaría como sin red: la app sigue con su código hasta su
  fecha y lo vuelve a pedir.
- **Los periodos viejos no se borran** mientras la mensual sigue (unos 12 al año). Los quita la baja. Podarlos antes abría
  otra carrera para casi nada.

## Cómo se probó

- **En rojo primero** (commit 9313b86d, con el código de la 0.191.1): `tests/cobro-a-la-vez.spec.js` usa `aLaVez`
  (`tests/cobro.helpers.js`), que hace que dos entregas a `/api/stripe` lean todo antes de que ninguna escriba. Después
  escribe entera una y la otra la última: lectura A, lectura B, escritura B, escritura A. Con la renovación corta la última,
  `/api/renovar` dio el mes de antes (`1799524738000` en vez de `1802203138000`). El almacén en memoria tiene ahora `list`,
  como el de Cloudflare: en orden, por páginas y con `cursor`.
- **Lo que ya funcionaba, también probado a la vez:**
  - repetir los dos avisos, uno detrás de otro o solapados, no cambia ni una llave;
  - una baja solapada con una renovación da «terminada» en los dos órdenes;
  - lo que guardó la versión de antes (solo `suscripcion:`) se sigue leyendo, renovando y dando de baja, y una factura de
    esa mensual se reconoce;
  - `cobro-recuperar` tiene una prueba nueva con dos renovaciones a la vez;
  - `cobro-avisos` comprueba ahora que tras la baja no queda ningún `periodo:`.
- **Mutantes**, cada uno en rojo y vuelto a dejar como estaba con `git checkout`:
  1. `mensualUltimo` lee solo `suscripcion:`: caen las dos pruebas de renovaciones a la vez (`renovar` y `recuperar`).
  2. `mensualGuardar` escribe todos los periodos en la misma llave: caen las mismas dos.
  3. `mensualBorrar` no borra los periodos: cae la de la baja de `cobro-avisos`.
- `npm run verify`: pasa, 0 problemas. El único aviso es el de siempre, que restaura `PACE_standalone.html`.
- Las del cobro en el puerto 8872 (`tests/cobro-*.spec.js tests/compra-*.spec.js tests/recuperar-pagina.spec.js
  tests/premium-compra.spec.js`): 89 en verde. La suite entera la pasa la coordinadora al juntar.

## Para juntar

- La regla nueva está arriba del todo en `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.
- Propuesta para el CHANGELOG: «La mensual guarda cada periodo pagado en su propia llave y da el que más dura: dos
  renovaciones a la vez ya no dejan la más corta (revisión de ChatGPT del 5 nov.).»
- En `docs/audits/chatgpt-5nov/revision-5nov.md`, la fila de `guardar()` puede pasar a hecha con esta rama.
- No hay que tocar nada en Cloudflare ni en Stripe.

## En palabras llanas, para Ez

Antes: si a quien paga al mes le llegaban dos cobros de Stripe casi a la vez (por ejemplo, un mes que Stripe reintenta tarde
justo cuando entra el del mes siguiente), la web podía quedarse con el más antiguo. Su PACE completo se habría cerrado un mes
antes de lo pagado. Era raro, y el cobro del mes siguiente lo arreglaba solo.

Ahora: cada mes pagado se guarda aparte, sin borrar los otros, y la web siempre da el que llega más lejos. Da igual en qué
orden lleguen los avisos. Lo demás sigue igual: el pago de por vida no lo toca nada, una baja sigue cerrando la suscripción,
un aviso repetido no cambia nada, «recuperar mi código» funciona como antes y lo que ya estaba guardado se lee igual.
