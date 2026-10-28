# Cobrar en la web: lo que hace Ez cuando tenga la cuenta de Stripe

El código ya está (v0.177.0 y lo que sigue): la web firma el código de quien paga con la llave **k2**,
lo da en la página de gracias, renueva el de la mensual y avisa antes de que acabe la prueba. Está
apagado hasta que pongas estas piezas. **Ni las llaves ni los secretos van nunca a un chat ni a un
correo**: con k2, cualquiera podría abrir PACE completo.

## 1. Crear k2, en tu PC (una vez)

En la carpeta de PACE, abre una terminal y escribe:

```bash
npm run licencia:k2
```

Deja dos archivos en tu carpeta `PACE-llave-licencias`, junto a la de k1 y la de Play:

- `k2.privada.pem`: la copia de seguridad. Llévala al disco duro con las otras.
- `k2.para-cloudflare.txt`: lo mismo en una sola línea, para pegarla en Cloudflare (paso 2). Bórralo
  después; si te hace falta otra vez, `npm run licencia:k2 -- --cloudflare` lo vuelve a escribir.

Además escribe la llave **pública** de k2 en `app/licencia.llaves.js`. Esa no es secreta: díselo a la
coordinadora y la sube con la versión siguiente, para que la app reconozca los códigos de venta.

## 2. Cloudflare: el secreto de k2 y el almacén de las ventas

En dash.cloudflare.com › Workers y Pages › el proyecto de pacegrass.app:

1. **Configuración › Variables y secretos › Añadir.** Tipo «Secreto», nombre `PACE_K2_PRIVADA`, y de
   valor la línea entera de `k2.para-cloudflare.txt` (ábrelo con el Bloc de notas y cópiala). Guarda.
2. **Almacenamiento › KV › Crear un espacio de nombres** llamado `pace-ventas`. Luego, en el
   proyecto, **Configuración › Enlaces › Añadir › Espacio de nombres KV**: nombre de la variable `VENTAS`
   y el espacio `pace-ventas`.

## 3. Stripe: el aviso de pago

En Stripe › Desarrolladores › Webhooks (o «Destinos de eventos») › Añadir un destino:

- URL: `https://pacegrass.app/api/stripe`
- Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid` y
  `customer.subscription.deleted`. El segundo es el de los pagos que se confirman días después (un
  adeudo SEPA y parecidos): sin él, quien pague así no recibe su código.

Stripe te enseña un secreto que empieza por `whsec_`. En Cloudflare (como en el paso 2.1) añade otro
secreto: nombre `STRIPE_AVISO_SECRETO`, valor ese `whsec_…`.

## 4. Stripe: los dos enlaces de pago y el portal

- Un enlace de pago de **19,99 €, una vez** (PACE completo para siempre).
- Otro de **2,99 € al mes con 7 días de prueba**.
- En los dos, la página de después de pagar: `https://pacegrass.app/gracias/?sesion={CHECKOUT_SESSION_ID}`
  (tal cual, con las llaves: Stripe pone ahí el número de la compra).
- El **portal del cliente** (Configuración › Facturación › Portal del cliente): actívalo y copia su enlace.

Esos tres enlaces **no son secretos**: pásaselos a la coordinadora. Van en la app
(`PACE_TIENDA_WEB` en `app/state-compra.js`) y desde ese momento salen los botones de compra y
«Gestionar la suscripción».

## 5. Stripe: la llave que solo lee, para /recuperar

`pacegrass.app/recuperar` busca la compra en Stripe con el correo y el número del recibo, y para eso
necesita leer, nunca cobrar ni cambiar nada. En Stripe › Desarrolladores › Claves de API › **Crear clave
restringida**: nombre «PACE recuperar», y solo **Lectura** en Checkout Sessions, Cargos (Charges),
PaymentIntents y Facturas (Invoices); todo lo demás, «Ninguno». La clave empieza por `rk_`. En
Cloudflare (como en el paso 2.1), otro secreto: nombre `STRIPE_LECTURA`, valor esa `rk_…`. Sin ella,
/recuperar dice que aún no se puede y manda escribirte.

Y en Stripe › Configuración › Facturación › Facturas, deja la numeración **por cliente** (la que viene):
con la numeración seguida de toda la cuenta, los números de factura se adivinan.

## Cómo saber que funciona

Con Stripe en modo de prueba, compra con la tarjeta `4242 4242 4242 4242`: la página de gracias tiene
que darte un código y «Abrir PACE con tu código» tiene que abrir PACE completo. Si la página se queda
esperando, el aviso no llega: mira en Stripe › Webhooks si el destino da error.

Si dejas pagar con adeudo SEPA (u otro método que se confirma tarde), pruébalo también con el IBAN de
prueba de Stripe para la confirmación: la página de gracias dice primero que el pago se está
confirmando y, cuando Stripe lo confirma, el código sale en esa misma página (al volver a abrirla) y en
/recuperar.

Después, en `pacegrass.app/recuperar`, escribe el correo de esa compra y el número de su recibo (el
correo de Stripe): tiene que darte el mismo código. Si dice que no la encuentra, mira qué número trae
el recibo de Stripe en su modo «vende por ti» y pásaselo a la coordinadora: la función compara el
número del recibo y el de la factura (`cobro/stripe.js`, `stripeBuscarCompra`).
