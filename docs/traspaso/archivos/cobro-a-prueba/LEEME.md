# El cobro de la web, a prueba antes de vender (A1-A7), 28 oct.

Rama `claude/magical-dhawan-987161`, sobre `main` en 95bfcd6 (v0.185.0). Los siete casos del cobro de la revisión de
ChatGPT del 28 oct. (`docs/traspaso/relevo-coordinadora-22oct.md`, bloque «28 oct., ~20:10», punto 5). Sin versión
nueva ni CHANGELOG, STATE u hoja: los pone la coordinadora al juntar. Nada cambia en pantalla: ni textos nuevos ni
maqueta (el censo de textos sigue en 1064).

## Qué se arregló

- **A1 · nada va hacia atrás, y la baja se queda** (`functions/api/stripe.js`). `suscripcion:<id>` solo se escribe con
  un código cuyo `expiresAt` es mayor que el guardado; `sesion:<id>` se escribe una sola vez. La baja deja
  `baja:<id>` (con la fecha del aviso), borra el código de la mensual (lo que promete `privacy.html`) y, desde ahí,
  ningún aviso vuelve a dar código a esa suscripción, ni la compra si llega después. Un aviso repetido no escribe
  nada: el almacén queda igual, byte a byte. La marca de una mensual de PACE no caduca; la de una suscripción sin
  código (otra cosa de la cuenta, o una de PACE cuya compra aún no llegó) dura 30 días, más de lo que Stripe sigue
  mandando aquella compra, para no guardar para siempre el número de quien no compró PACE.
- **A2 · las fechas son las de Stripe** (`cobro/stripe.js`, `stripeLeerPago`). Ya no recibe la hora: la prueba acaba a
  los 7 días del `created` del aviso (el mismo en cada reintento) y la mensual pagada al alta vale su primer mes
  (el mismo día del mes siguiente, o el último del mes si no lo tiene, como Stripe) y no 7 + 3 días. Las renovaciones,
  con el final del periodo de su factura, como antes. **La llave de lectura no hizo falta**: con lo que trae el aviso
  basta, y el aviso funciona igual sin `STRIPE_LECTURA`. La factura de 0 € de la prueba trae el mismo fin (al segundo)
  y no mueve nada. Un aviso sin `created` no firma nada (Stripe siempre lo manda). Si el aviso llega cuando su periodo
  ya acabó, tampoco (antes, `firmarVenta` lanzaba y la función daba 500).
- **A3 · «terminada» solo con la baja** (`functions/api/renovar.js`). 410 solo con `baja:`; sin código guardado y sin
  baja, 404 `{ pendiente: true }`, como `/api/codigo`. La app ya trataba cualquier respuesta que no fuera 410 como «sin
  red» y volvía a preguntar (al abrir, al volver la red y cada seis horas): no hizo falta cambiarla, y queda una prueba
  que lo fija. Lo mismo en `/api/recuperar`: la mensual sin código ni baja da 503 `{ motivo: 'pendiente' }`, y la
  página dice lo que ya decía con 503, «Aún no se puede recuperar aquí. Escríbenos y te lo mandamos.» (antes decía
  que la suscripción había terminado).
- **A4 · la renovación no pisa lo que entró mientras tanto** (`app/state-licencia.js`). Tras comprobar la firma del
  código nuevo, y justo antes de escribir, mira que lo guardado siga siendo el código del que partió; si no, no toca
  nada (devuelve `'otro'`). Así una de por vida canjeada desde /gracias mientras la mensual se renovaba no se cambia
  nunca por la mensual.
- **A5 · importar: desde que se escribe la copia, nada guarda lo de antes encima** (`app/state-core.jsx`,
  `app/tweaks/TweaksData.jsx`). Al escribir la copia, `paceAdoptarEstado(copia, true)` la pone en memoria y apaga
  `persistState` hasta recargar (desde ahí siempre se recarga: a los 900 ms o al cerrar el aviso de la copia a medias).
  **Un detalle que no estaba en el arreglo propuesto**: la copia se lee con `loadState(true)`, como la de otra pestaña
  (`state-core.pestanas.js`). Con el objeto saneado tal cual, la app se caía entera («Algo se ha torcido»:
  `ActivityBar` lee un campo que añaden las migraciones del arranque); lo vieron las dos pruebas del aviso parcial que
  ya existían. Si `loadState` no pudiera leer la copia, lo de memoria se queda, pero tampoco se guarda.
  `state-core.jsx` queda en **500 líneas justas** (el tope que mide `verify`).
- **A6 · solo dan código las compras de PACE** (`cobro/stripe.js`, las dos funciones). Una compra cuenta si la abrió
  uno de los enlaces de pago de PACE: su `payment_link` está en `PACE_ENLACES_STRIPE`, una variable de Cloudflare con
  los cuatro números `plink_…` (los dos enlaces de prueba y los dos de verdad, separados por comas). Una factura no dice
  de qué enlace viene: es de PACE si su suscripción ya tiene código, el que dio la compra (si la primera factura llega
  antes que la compra, se ignora y no falta nada: la compra lleva el mismo mes). En `/recuperar`, igual con las
  compras que encuentra. Sin ningún `plink_` en la variable (o con la dirección `buy.stripe.com` pegada en su lugar),
  `/api/stripe` y `/api/recuperar` dan 503, como sin las otras piezas: Stripe reintenta el aviso tres días.
- **A7 · el modo de prueba da códigos de tres días** (`STRIPE_MODO_PRUEBA_MS`). Un aviso con `livemode` que no sea
  `true` firma un código que caduca a los tres días de su `created`, de por vida o mensual (también sus renovaciones);
  `/recuperar` hace lo mismo con una compra de prueba, desde el momento de recuperarla. Una de por vida de prueba lleva
  `expiresAt`, y la app ya sabía leerlo («Hasta el …» en Ajustes, y caduca).

## Cómo se probó

**En rojo contra la 0.185.0, antes de arreglar nada**, con las pruebas ya escritas (provocado, no supuesto):
- Servidor, en Node (`tests/cobro-avisos.spec.js`, nuevo; `cobro-venta` y `cobro-recuperar`): cayeron 15 de 24, cada
  una por lo suyo. A1: el código de la mensual pagada al momento valía 10 días y no su mes; repetir avisos cambió lo
  guardado; tras la baja, una factura volvió a dar código. Y el caso del relevo, provocado aparte con el código de la
  0.185.0 sacado de git: con la factura antes que la compra, `suscripcion:` se quedó con 10 días de un mes pagado de
  30, y es lo que habría dado `/api/renovar`. A2: la prueba contada desde la
  llegada (un día de más con un aviso de ayer) y la mensual pagada a 10,04 días. A3: `/api/renovar` y `/recuperar`
  dijeron «terminada» (410) sin baja. A6: la compra de otro enlace firmó, sin enlaces no se apagó, y `/recuperar` dio
  código de una compra ajena. A7: la de por vida de prueba, sin fecha de fin (para siempre), en el aviso y en
  `/recuperar`.
- App, en el navegador contra el `index.html` de la 0.185.0: A4, la mensual renovada pisó la de por vida (la respuesta
  de `/api/renovar` retenida con `page.route`, la de por vida canjeada y la respuesta soltada); A5, las dos pruebas
  (un cambio provocado justo tras escribir la copia, y otro con el aviso parcial abierto) guardaron 500 encima del 42
  de la copia. La de A3 en la app pasó ya en la 0.185.0, como se esperaba (la app ya estaba bien).

**Después del arreglo**: las 24 del servidor y las de la app en verde; `importar-borrar` y `eventos-backup` enteras en
verde (la de «sin almacén» mira además que no salga ningún error en la consola). `npm run verify` en verde (el único
aviso es el de siempre, el build que reescribe `PACE_standalone.html`, restaurado). La suite entera con
`--workers=1` en el puerto 8807: no llegó a pasarla (se quedó sin uso). La pasó la coordinadora el 29 oct. en el
puerto 8814, con dos sesiones más trabajando a la vez: **1067 en verde y 2 saltadas** (el audio del iPhone, como siempre),
en 22,3 min. Juntada en `main` como **0.186.0** con el «júntalo» de Ez y su frase de la privacidad, afinada: «De una
que terminó quedan solo su número y el día en que terminó», porque la marca guarda también la fecha del aviso.

Lo común de las pruebas del cobro en Node vive ahora en `tests/cobro.helpers.js` (la llave k2 de cada pasada, el
almacén en memoria, los avisos firmados y los cuatro enlaces de prueba); `cobro-venta` y `cobro-recuperar` lo usan, y
sus avisos llevan ya `created`, `livemode` y `payment_link`, como los de Stripe. `recuperar-pagina.spec.js` tiene una
fila más: con 503 `pendiente`, la página manda escribir.

## Lo que falta o no está probado

- **Nada de esto se ha probado contra Stripe**: que las sesiones de los enlaces de pago traen `payment_link` también en
  el modo «vende por ti», que el número `plink_` se ve en la barra del navegador como dice el paso de Ez, y el orden
  real de los avisos de un alta. Se mira con la compra de prueba (paso de abajo y «Cómo saber que funciona» de
  `docs/launch/cobro-web.md`, puesto al día).
- **KV no tiene transacciones**: queda un hueco, una factura de renovación procesada justo a la vez que la baja de su
  suscripción (la factura lee «sin baja», la baja borra el código y la factura lo vuelve a escribir). `/api/renovar`
  contesta «terminada» igual (mira la marca primero), pero ese código quedaría guardado hasta otra baja. No pasa en la
  práctica (la baja llega al final de un periodo o tras cobros fallidos, no con una factura pagada), y por eso no se
  ha complicado más.
- **El canje a mano sigue escribiendo lo que se canjea**: si alguien con una de por vida abre un enlace viejo de una
  mensual, la cambia. Es un gesto suyo y no un aviso que llega tarde; cambiarlo pide un texto nuevo («ya tienes PACE
  completo para siempre»), así que va con maqueta si Ez lo quiere.
- `/api/codigo` no cambia: el minuto que KV recuerda que una clave no estaba sigue pesando en /gracias, que ya pregunta
  durante una hora y lo explica.

## Lo que necesito de Ez (para su hoja, sin jerga)

1. **Los números de los enlaces de pago, en Cloudflare** (ahora los de prueba; los de verdad, al encenderlos). En
   Stripe, abre «Enlaces de pago» y entra en cada enlace de PACE: en la barra de direcciones sale algo como
   `…/payment-links/plink_1Q…`. Copia lo que empieza por `plink_`. En Cloudflare, en el proyecto de pacegrass.app ›
   Configuración › Variables y secretos › Añadir, tipo «Texto», nombre `PACE_ENLACES_STRIPE`, y de valor los números
   separados por comas (los de prueba y los de verdad juntos). Guardar y *Retry deployment*. Sin esto, la web no da
   códigos aunque esté todo lo demás. Está como paso 4 en `docs/launch/cobro-web.md`.
2. **Una frase de la privacidad, para que decida Ez** (no la he tocado: es texto legal). `privacy.html` dice que el
   código de una mensual «se borra cuando termina», y es verdad; pero ahora queda para siempre el número de esa
   suscripción, como marca de que terminó, para no volver a darle código. Propuesta, tras «y se borra cuando termina»:
   «; de una que terminó queda solo su número, para no volver a darle código» (en inglés: «; of one that ended, only
   its number stays, so it never gets a code again»).
3. Con A7, una compra de prueba ya no da PACE completo para siempre: lo de la hoja de «desactiva el enlace de prueba»
   deja de ser urgente (sigue siendo buena idea al pasar a real).

## Para la coordinadora, al juntar

- **Choques posibles**: `index.html` (se regenera); `app/state-core.jsx` queda en 500 líneas, así que otra rama que le
  sume una tendrá que recortar; `tests/cobro-venta.spec.js` y `cobro-recuperar.spec.js` cambian casi enteros (usan
  `cobro.helpers.js`). El censo de textos no cambia.
- **CHANGELOG** (propuesta): «El cobro de la web, a prueba antes de vender (revisión de ChatGPT del 28 oct., A1-A7):
  los avisos de Stripe repetidos o desordenados ya no acortan ni resucitan una mensual, y su baja se queda; el fin de
  la prueba y el mes pagado salen de Stripe y no de cuándo llega el aviso (la mensual pagada al alta valía 10 días);
  renovar solo dice que terminó si Stripe avisó de la baja; una renovación que llega tarde no pisa una de por vida
  recién canjeada; al importar una copia, nada guarda encima lo de antes mientras recarga; solo dan código las compras
  de los enlaces de PACE (una pieza más en Cloudflare); y una compra del modo de prueba de Stripe da un código de tres
  días. No cambia nada que se vea.»
- **DECISIONES_TECNICAS_VIGENTES**, fila nueva arriba (propuesta; la versión, la que se ponga al juntar):

```
| **LOS AVISOS DE STRIPE VALEN EN CUALQUIER ORDEN Y REPETIDOS: `suscripcion:` SOLO CAMBIA POR UN CÓDIGO QUE DURA MÁS, LA BAJA DEJA `baja:` Y SOLO ELLA ES «TERMINADA»; LAS FECHAS SON LAS DE STRIPE; SOLO DAN CÓDIGO LOS ENLACES DE `PACE_ENLACES_STRIPE`; EL MODO DE PRUEBA, TRES DÍAS; Y LA APP MIRA LO GUARDADO JUSTO ANTES DE ESCRIBIR** | vX.Y.Z (28 oct. 2026; revisión de ChatGPT, A1-A7) | **El aviso** (`functions/api/stripe.js`): `suscripcion:<id>` solo se escribe con un `expiresAt` mayor que el guardado y `sesion:<id>` una vez; un aviso repetido no escribe nada. La baja escribe `baja:<id>` (para siempre si la mensual tenía código; 30 días si no, para no guardar números ajenos) y borra el código; tras ella ningún aviso da código. Una factura solo es de PACE si su suscripción ya tiene código. **Las fechas** (`stripeLeerPago`, sin hora de llegada): la prueba, 7 días desde el `created` del aviso; la mensual pagada al alta, su primer mes; las renovaciones, el fin del periodo de su factura; todo con 3 días de margen. **Solo PACE**: la compra cuenta si su `payment_link` está en `PACE_ENLACES_STRIPE` (los `plink_` de prueba y de verdad); sin ninguno, `stripe` y `recuperar` dan 503. **Modo de prueba**: `livemode` distinto de `true` firma códigos de 3 días (`STRIPE_MODO_PRUEBA_MS`), también en `/recuperar`. **«Terminada»** (410) solo con `baja:`; sin código, `/api/renovar` da 404 «pendiente» (la app lo trata como sin red) y `/recuperar` 503 «pendiente». **La app**: la renovación comprueba la firma y, justo antes de escribir, que lo guardado siga siendo el código de partida (`'otro'` si no); al importar, la copia leída con `loadState(true)` se pone en memoria con `paceAdoptarEstado(copia, true)` y `persistState` no escribe hasta recargar (el objeto saneado sin migrar tumba la app). Lo vigilan `cobro-avisos`, `cobro-venta`, `cobro-recuperar`, `cobro-renovar` e `importar-borrar` (A5). |
```
- **La fila del 26 oct.** («LA WEB COBRA SIN SERVIDOR PROPIO…») queda vieja en dos frases: `stripe` y `recuperar` piden
  también `PACE_ENLACES_STRIPE`, y el 410 de `paceLicenciaEstado` es solo con la baja. Basta con «(ver la fila del 28
  oct.)» o con cambiar esas dos frases.
- **STATE**, en «Espera a Ez»: `PACE_ENLACES_STRIPE` en Cloudflare (paso 4 de `docs/launch/cobro-web.md`), y la frase de
  la privacidad. **La hoja**: el paso 1 de arriba, antes de la compra de prueba.

`node_modules` de este worktree era un enlace (junction) al del repo principal; lo quito yo al acabar con
`cmd /c rmdir node_modules`.
