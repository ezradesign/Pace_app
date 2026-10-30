# El botón para desistir: lo que hace Ez y lo que falta montar

La 1A de Ez (30 oct. 2026, en https://claude.ai/artifact/GT6ZwHQHY6bKk7vBuYrUw2): un botón «Desistir del
contrato aquí» que lleva a `pacegrass.app/desistir`, un formulario corto (nombre, correo de la compra,
número del recibo si lo tiene y el plan), «Confirmar desistimiento» y un acuse por correo con lo que dijo,
la fecha y la hora. Lo pide el art. 11 bis de la Directiva 2011/83 desde el 19 jun. 2026
(`docs/launch/legal-web.md`).

**Ya está, sin publicar:** la página (`desistir/index.html`), la función (`functions/api/desistir.js`) y
sus pruebas (`tests/desistir-funcion.spec.js` y `tests/desistir-pagina.spec.js`). Sin la llave del correo
la página dice que el formulario aún no está abierto y manda desistir por correo, que la ley también admite.

## El servicio de correo: Resend

La función manda dos correos: uno a Ez (para que devuelva el pago en Stripe) y el acuse al comprador.
Para eso hace falta un servicio que mande correos desde `pacegrass.app`. **Propuesto: Resend.**

- Gratis hasta 3.000 correos al mes y 100 al día (https://resend.com/blog/new-free-tier). Cada
  desistimiento gasta dos.
- Se conecta con Cloudflare de un toque: el botón «Sign in to Cloudflare» pone solo los registros del
  dominio y lo verifica en unos minutos (https://resend.com/docs/knowledge-base/cloudflare).
- Solo correos de texto, sin seguimiento de aperturas.

**La alternativa, Brevo** (francesa, en la UE): gratis hasta 300 correos al día, pero el plan gratis lleva
su marca y el alta tiene más pasos. Si Ez prefiere una empresa europea, cambian unas diez líneas de la
función. Resend es una empresa de Estados Unidos: el nombre, el correo y el número de quien desiste pasan
por ella, y `privacy.html` lo tiene que decir (el texto, abajo).

## Lo que hace Ez, en este orden

1. **Cuenta en Resend.** Entra en resend.com, «Sign up», con tu correo. El plan gratis vale.
2. **Tu dominio.** En Resend › **Domains** › **Add domain**, escribe `pacegrass.app`. Si te deja elegir
   región, la de Irlanda (`eu-west-1`), que es la más cercana.
3. **Conectarlo con Cloudflare.** En la página del dominio, pulsa **«Sign in to Cloudflare»**, entra con tu
   cuenta de Cloudflare y acepta. Resend pone solo sus registros. No tocan la web: van en `send.pacegrass.app`
   y en `resend._domainkey`. En unos minutos el dominio sale **Verified**.
   *Si no sale ese botón:* copia cada registro que te enseña Resend en Cloudflare › tu dominio › **DNS** ›
   **Añadir registro**, con el proxy en **«Solo DNS»** (la nube gris).
4. **La llave.** En Resend › **API Keys** › **Create API key**: nombre «PACE desistir», permiso **Sending
   access** y solo el dominio `pacegrass.app`. Copia la llave, que empieza por `re_`. Solo se ve una vez.
   **Ni a un chat ni a un correo**: con ella, cualquiera podría mandar correos como PACE.
5. **La llave, en Cloudflare.** En dash.cloudflare.com › **Workers y Pages** › el proyecto de pacegrass.app ›
   **Configuración** › **Variables y secretos** › **Añadir**: tipo **Secreto**, nombre `RESEND_CLAVE`,
   valor la llave. Guarda y pulsa **Retry deployment**.
6. **Probarlo**, cuando la coordinadora lo publique: abre `pacegrass.app/desistir`, pon tu nombre y otro
   correo tuyo, y confirma. Te tiene que llegar el aviso a hola.ezradesign@gmail.com y el acuse al otro
   correo. La primera vez, mira también en la carpeta de spam.

## Lo que monta la coordinadora, con el sí de Ez

Después de la 0.188.0, que trae cambios en /premium:

- **Publicar la página y los textos:** `desistir` y `legal` a `WEB_CARPETAS` de `scripts/web-dist.js`, y
  `desistir/index.html` fuera de `NO_SE_PUBLICA` en `scripts/verify.web.js`. Los textos de `legal/`, con los
  datos de Ez, sin el aviso de borrador y sin `noindex`, y solo después de la revisión profesional.
- **El botón «Desistir del contrato aquí»** en el pie de `/premium`, en la página de gracias y en Ajustes de
  la web (solo en la web: en Android y en el iPhone se compra y se devuelve en Play y en la App Store). Lleva
  a `/desistir/` y tiene que estar a la vista durante los 14 días.
- **`privacy.html`**, una sección `#desistir` (y `#desistir-en`), que la página ya enlaza:

  > **Si desistes de una compra en la web.** En pacegrass.app/desistir escribes tu nombre, el correo con el
  > que pagaste, el número del recibo si lo tienes y el plan. La web se lo manda por correo a [NOMBRE], que
  > vende PACE completo, para devolverte el dinero, y te manda a ti el acuse con lo que nos dijiste, la fecha
  > y la hora. Los dos correos salen por Resend, un servicio de envío de correos de Estados Unidos, con su
  > propia política de privacidad. La web de PACE no guarda nada: el aviso se queda en el buzón de [NOMBRE]
  > [PLAZO: el que diga el gestor para guardar lo de las ventas]. Para frenar a los robots, cuenta los
  > intentos desde una misma conexión, cinco por hora como mucho, con un código hecho con tu IP, no la IP,
  > que se borra solo a la hora.

## Lo que queda aparte

- **Un código de por vida devuelto sigue abriendo PACE completo** en el navegador donde estaba: no hay
  lista de anulados para los códigos de venta (k2), solo para los de los testers. El de la mensual deja de
  renovarse al cancelar. Los borradores dicen que, al desistir, ya no se puede usar PACE completo con ese
  código, que es lo que dice la ley, no lo que impide el código. Si Ez quiere que deje de abrirse, es trabajo
  aparte (una lista de pedidos anulados que la app lea al renovar o al abrir la web).
- **La pregunta 2 de Ez** («¿y si ponemos 7?»): el desistimiento de la ley no puede bajar de 14 días; lo
  único que podría ser de 7 es la devolución sin preguntas, que /premium ya promete en 14. Los borradores
  siguen con 14 en las dos hasta que Ez conteste.
