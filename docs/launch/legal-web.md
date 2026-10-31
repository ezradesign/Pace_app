# Lo legal para vender en la web · lo averiguado el 30 oct. 2026

Punto 16 del ROADMAP. Lo comprobado en las fuentes, para Ez y para quien le revise los textos (gestor o
jurista). **No es consejo legal.** Los borradores están en `legal/` (no se publican: `scripts/web-dist.js`
solo copia las carpetas de su lista, y `legal` no está). La página para Ez, con sus preguntas, en
`docs/launch/legal-web-para-ez.html` (https://claude.ai/artifact/GT6ZwHQHY6bKk7vBuYrUw2). Ez eligió
**1A 2A 3A 4A 5A** (30 oct.), ya puestas en los borradores.

## 1. Quién vende con «vende por ti» (Managed Payments)

Lo dicen las condiciones de Stripe («Stripe Managed Payments», modificadas el 28 sep. 2026, en
https://stripe.com/legal/ssa-services-terms, sección «Stripe Managed Payments»):

- El servicio lo da **Sold through Link, LLC** («SMP»), filial de Stripe (§1.1).
- §2.1(a): SMP es el **merchant of record** (quien cobra y figura en el pago), pero «SMP is not the seller
  of record, SMP does not have or receive possession of the Product, and SMP will not book the revenue».
  Ez le encarga vender **en nombre de Ez** y queda obligado por lo que haga SMP.
- Solo **para el IVA**, SMP cuenta como quien hace la venta (interfaz electrónica o comisionista, §2.1(a)
  y §4.1), y por eso cobra, declara e ingresa el IVA y emite la factura al cliente **en su propio nombre**
  (§4.1(e), «agente no revelado»). A Ez le hace una autofactura (§4.5).
- §4.1(a): para vendedores de algunos países, SMP solo lleva el IVA de las ventas a otros países. **España
  no es uno de ellos**: la documentación de impuestos (https://docs.stripe.com/payments/managed-payments/tax-compliance)
  dice que lleva las ventas dentro del país en todos, salvo Singapur (entre empresas) y Japón, y que lleva las
  ventas a los 27 de la UE. **Pero no las de los países que no están en su lista**: en Latinoamérica solo
  cubre México (y algunas islas). Una compra desde Argentina, Chile o Colombia deja a Ez a cargo de sus
  impuestos allí: pregunta para el gestor (¿se limita la venta a los países cubiertos?).

**Lo seguro:** ante el cliente, el pago lo hace Link («Sold through Link», `LINK.COM*` en el extracto, los
recibos y facturas salen de Link). **La duda para el jurista:** a efectos de consumo (TRLGDCU), ¿el
«empresario» que vende es Ez, SMP o los dos? Las condiciones dicen que el vendedor del producto es Ez y
que SMP actúa por su cuenta; el art. 97.1.c pide entonces la identidad y la dirección «del empresario por
cuya cuenta actúa». Lo prudente, y lo que asumen los borradores: **Ez se identifica como vendedor del
contenido y da las condiciones, el desistimiento y la devolución; Link cobra, factura y atiende el pago.**

## 2. Qué cubre ya Stripe y qué no

Documentación «How Managed Payments works» (https://docs.stripe.com/payments/managed-payments/how-it-works)
y las condiciones citadas:

| Qué | ¿Lo cubre Stripe? |
|---|---|
| IVA de cada país: calcula, cobra, declara | Sí en España y en la UE (§4.1); no en los países fuera de su lista |
| Recibos y facturas al cliente | Sí, desde Link, siempre, con PDF |
| Página de pago con el pie de condiciones de pago estándar | Sí. Se pueden añadir las condiciones y la privacidad propias en los ajustes de Checkout |
| Soporte del pago, cancelar la suscripción, cambiar la tarjeta | Sí, en link.com y en el soporte de Link |
| Disputas y fraude | Sí |
| Correo de inicio de la prueba | Sí, siempre |
| Aviso de fin de la prueba | **Solo en pruebas de MÁS de 7 días.** La de PACE es de 7: no llega (lo hace PACE, que ya lo promete) |
| Aviso antes de cada renovación | Solo si Ez enciende «Upcoming renewals» en Stripe. Si no, solo antes del aniversario de 12 meses |
| Devolución «sin preguntas» | **No.** Link solo revisa (60 días) lo no recibido, lo que no es como se describe, lo dañado o lo no autorizado; «change of mind» y «unused subscriptions», no (https://support.link.com/questions/sold-through-link-refunds). SMP puede devolver dentro de 60 días aunque Ez diga menos (§3.3), y lo devuelto se descuenta a Ez |
| Desistimiento legal de 14 días | Link remite a «the consumer laws in your country» y a sus condiciones. **No se ha visto que dé la función de desistimiento en línea** ni que pida en el pago el consentimiento del art. 103.m |
| Lo que se dice de la suscripción antes de pagar (precio, cada cuánto, renovación, cómo cancelar) | **No: lo tiene que decir Ez** (§3.2: «User must clearly and conspicuously disclose the terms of the subscription to Customers before or at checkout») |
| Nombre, dirección y país de quien vende, antes de pedir la tarjeta | **No: Ez** (Stripe Payments Terms §3.4(b), que se aplican a Ez como vendedor por §3.6 de Managed Payments) |
| La información que pide la ley al consumidor | **Ez** (Payments Terms §3.7: «User must provide the disclosures Law requires») |

## 3. Lo que dice la ley (BOE y EUR-Lex)

TRLGDCU, texto consolidado del BOE (BOE-A-2007-20555), última actualización publicada el 28 feb. 2026:

- **Art. 97.1** (antes de contratar a distancia): identidad, nombre comercial, dirección completa,
  **teléfono** y correo (c); precio total con impuestos y, en suscripción, el total por periodo (e); el
  desistimiento con sus condiciones, plazo, procedimiento y **el modelo de formulario** (j); cuando no hay
  desistimiento, decirlo o decir cuándo se pierde (m); la garantía legal de conformidad (n); la duración
  y, si se prolonga sola, cómo se resuelve (p).
- **Art. 97.1.p, segunda frase:** «En aquellos contratos de duración determinada, sujetos a renovación,
  se informará al consumidor o usuario, con quince días de antelación de forma previa al vencimiento del
  plazo para comunicar la voluntad de no renovación». **Duda para el jurista:** una mensualidad que se
  renueva sola y se cancela cuando se quiera, ¿es «de duración determinada sujeta a renovación»? Si lo es,
  un aviso 15 días antes de cada mes no tiene sentido práctico; hay que saber qué basta.
- **Art. 102:** 14 días naturales para desistir sin motivo. **Art. 104.a:** en servicios, desde el día
  del contrato. Son nulas las cláusulas de renuncia (102.2).
- **Art. 103.m:** sin desistimiento en el contenido digital sin soporte material cuando la ejecución ha
  empezado y, si hay que pagar, con (1) consentimiento previo, (2) conocimiento expreso de que se pierde y
  (3) la confirmación del art. 98.7. **Duda:** PACE completo, ¿es contenido digital (103.m) o servicio
  digital (103.a: solo se pierde cuando el servicio está **completamente** ejecutado, cosa que una
  suscripción no está nunca)? Con la mensualidad, casi seguro servicio.
- **La función de desistimiento en línea:** la Directiva (UE) 2023/2673 añade el art. 11 bis a la
  Directiva 2011/83 (EUR-Lex, CELEX 32023L2673): en lo contratado por una web, una función rotulada
  «desistir del contrato aquí» o algo inequívoco, visible y disponible todo el plazo; pide el nombre, qué
  contrato y dónde mandar el acuse; se confirma con «confirmar desistimiento», y el comerciante manda sin
  demora un acuse en soporte duradero con el contenido, la fecha y la hora. Transposición: 19 dic. 2025;
  se aplica desde el 19 jun. 2026. **En el TRLGDCU consolidado (28 feb. 2026) no está**: España no la ha
  transpuesto todavía (la OCU lo denunció el 20 jun. 2026; según una guía de Línea Gráfica, va en un
  anteproyecto de 7 ene. 2026 como art. 106 bis, sin confirmar en el BOE). **Duda:** ¿hay que darla ya?
  Lo prudente: sí, porque se vende en toda la UE y otros países sí la han puesto, y cuesta poco.
- **LSSI art. 10:** en la web, nombre, NIF, domicilio y correo del prestador, de forma permanente, fácil y
  gratuita. Que venda Link no lo quita.

## 4. Lo que tiene que poner PACE (resumen)

1. Un **aviso legal** con nombre, NIF, dirección y correo (y teléfono, por el 97.1.c).
2. **Condiciones de compra** por plan, con quién vende y quién cobra.
3. **Desistimiento y devolución**, separados: los 14 días de la ley y la devolución de 14 días «sin
   preguntas» que ya promete /premium, que la hace Ez desde Stripe porque Link no la hace.
4. Junto a los botones de compra, lo que pide Stripe §3.2: «7 días gratis; después 2,99 €/mes, IVA
   incluido; se renueva cada mes hasta que canceles; cancelas en Ajustes o en link.com».
5. La **función de desistimiento en línea**: la 1A de Ez, montada (`/desistir`, y el enlace en /premium,
   gracias y Ajustes), con lo que hace Ez para encenderla (`docs/launch/desistir.md`).
6. En Stripe: las condiciones y la privacidad de PACE en los ajustes de Checkout, el correo de soporte
   al día y, si el jurista lo pide, «Upcoming renewals» encendido.
7. En `privacy.html`, la sección de compras: ya dice que cobra Link por cuenta de quien vende y cuenta el
   desistimiento (`#desistir`); falta el nombre del responsable y el plazo de conservación.
