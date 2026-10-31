# El botón para desistir: lo que hace Ez

La 1A de Ez (30 oct. 2026, en https://claude.ai/artifact/GT6ZwHQHY6bKk7vBuYrUw2), con sus cinco letras
(1A 2A 3A 4A 5A): un botón «Desistir del contrato aquí» que lleva a `pacegrass.app/desistir`, un formulario
corto (nombre, correo de la compra, número del recibo si lo tiene y el plan), «Confirmar desistimiento» y
un acuse por correo con lo que dijo, la fecha y la hora. Lo pide el art. 11 bis de la Directiva 2011/83
desde el 19 jun. 2026 (`docs/launch/legal-web.md`). Los 14 días se quedan, sin casilla para renunciar a
ellos al pagar (la 2A).

## Lo que ya está montado

- **La página** `desistir/index.html`, publicada en `pacegrass.app/desistir`. Mientras Ez no conecte el
  correo, dice que el formulario aún no está abierto y manda desistir por correo, que la ley también admite.
- **La función** `functions/api/desistir.js`: manda con Resend el aviso a Ez (primero) y el acuse al
  comprador. No guarda nada.
- **El enlace «Desistir del contrato aquí»:**
  - en el pie de `/premium`, solo cuando la función tiene la llave del correo;
  - en la página de gracias, siempre (allí solo llega quien ha pagado);
  - en Ajustes de la web, debajo de PACE completo, solo con un código de venta. En Android y en el iPhone
    no sale: allí se compra y se devuelve en Google Play y en la App Store.
- **`privacy.html`**: quién cobra (Link, por cuenta de quien vende) y la sección `#desistir`.
- **Las pruebas**: `tests/desistir-funcion.spec.js`, `tests/desistir-pagina.spec.js` y
  `tests/desistir-ajustes.spec.js`.

## El servicio de correo: Resend

La función manda dos correos desde `pacegrass.app`: uno a Ez, para que devuelva el pago, y el acuse al
comprador. **Propuesto: Resend.**

- Gratis hasta 3.000 correos al mes y 100 al día (https://resend.com/blog/new-free-tier). Cada
  desistimiento gasta dos.
- Se conecta con Cloudflare de un toque: el botón «Sign in to Cloudflare» pone solo los registros del
  dominio y lo verifica en unos minutos (https://resend.com/docs/knowledge-base/cloudflare).
- Solo correos de texto, sin seguimiento de aperturas.

**La alternativa, Brevo** (francesa, en la UE): gratis hasta 300 correos al día, pero el plan gratis lleva
su marca y el alta tiene más pasos. Si Ez prefiere una empresa europea, cambian unas diez líneas de la
función y una frase de `privacy.html`. Resend es de Estados Unidos, y la privacidad ya lo dice.

## Lo que hace Ez para encenderlo, en este orden

Hazlo cuando vayas a encender la venta: en cuanto la llave esté puesta, el enlace sale en el pie de /premium.

1. **Cuenta en Resend.** Entra en resend.com, pulsa «Sign up» y regístrate con tu correo. El plan gratis vale.
2. **Tu dominio.** En Resend › **Domains** › **Add domain**, escribe `pacegrass.app`. Si te deja elegir
   región, elige la de Irlanda (`eu-west-1`), que es la más cercana.
3. **Conectarlo con Cloudflare.** En la página del dominio, pulsa **«Sign in to Cloudflare»**, entra con tu
   cuenta de Cloudflare y acepta. Resend pone solo sus registros, que no tocan la web: van en
   `send.pacegrass.app` y en `resend._domainkey`. En unos minutos el dominio sale **Verified**.
   *Si no sale ese botón:* copia cada registro que te enseña Resend en Cloudflare › tu dominio › **DNS** ›
   **Añadir registro**, con el proxy en **«Solo DNS»** (la nube gris).
4. **La llave.** En Resend › **API Keys** › **Create API key**: nombre «PACE desistir», permiso **Sending
   access** y solo el dominio `pacegrass.app`. Copia la llave, que empieza por `re_`. Solo se ve una vez.
   **Ni a un chat ni a un correo**: con ella, cualquiera podría mandar correos como PACE.
5. **La llave, en Cloudflare.** En dash.cloudflare.com › **Workers y Pages** › el proyecto de pacegrass.app ›
   **Configuración** › **Variables y secretos** › **Añadir**: tipo **Secreto**, nombre `RESEND_CLAVE`, y de
   valor la llave. Guarda y pulsa **Retry deployment**.
6. **Probarlo.** Abre `pacegrass.app/desistir`: ya tiene que salir el formulario. Pon tu nombre y otro correo
   tuyo, y confirma. Te tiene que llegar el aviso a hola.ezradesign@gmail.com y el acuse al otro correo. La
   primera vez, mira también en la carpeta de spam.

## Lo que hace Ez con cada desistimiento

Le llega un correo «Desistimiento D-…» con los datos. Como mucho en 14 días:

1. En Stripe, busca la compra por el correo del comprador.
2. Devuelve el pago entero. Si es la mensualidad, cancela la suscripción ya: deja de renovarse y su código
   caduca solo.
3. Si es la de por vida, pásale a la coordinadora su número de pedido (empieza por `cs_live_`): su código se
   anula con la versión siguiente, en la lista de anulados de la app (`PACE_LICENCIAS_ANULADAS`, en
   `app/licencia.llaves.js`, con `k2:` delante del pedido). Hasta entonces, sigue abriendo PACE completo en su navegador.

## Lo que falta, y es de Ez o de un profesional

- Publicar los textos de `legal/` con los datos de Ez, sin el aviso de borrador y sin `noindex`, después de
  la revisión profesional. Ese día: `legal` a `WEB_CARPETAS`, el enlace a `/legal/desistimiento/` en
  `/desistir` (está marcado en un comentario) y los enlaces a los tres textos desde /premium.
- En `privacy.html`, el plazo que diga el gestor para guardar lo de las ventas, y el nombre de quien vende
  cuando esté el aviso legal.
