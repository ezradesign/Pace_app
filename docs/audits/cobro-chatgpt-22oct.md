# Lo que falta para cobrar · auditoría de ChatGPT, 22 oct. 2026

Ez se la pidió a ChatGPT la noche del 22 oct. con el prompt de la coordinadora («qué le falta a PACE para
cobrar legalmente en España y la UE en v1») y pidió guardarla para las próximas sesiones. Es la lista de
la Fase 6 del cobro, punto 13 de la cola de `docs/traspaso/relevo-coordinadora-22oct.md`.

**Comprobado en el código el mismo día** (la coordinadora): `PACE_TIENDA_WEB.enlaces` es `{ vida: null,
mes: null }` y `gestionar: null` (`app/state-compra.js`); `functions/api/` solo tiene `avisame.js`;
`PREMIUM_ABIERTO_HASTA_V1 = true` (`app/state-entitlement.jsx`). Lo legal y lo fiscal no se ha
comprobado: es para la gestoría, y ChatGPT marca él mismo lo que no pudo confirmar.

## Veredicto

PACE todavía no está lista para activar los cobros, y no hace falta retrasar por ello una v1 gratuita.
La tienda web tiene los enlaces vacíos y el adaptador de Google Play no compra, no restaura ni reconoce
compras. Además, `/premium` ya promete aviso dos días antes de acabar la prueba, cancelar en dos toques,
recuperar el código y devolución en 14 días: tiene que coincidir con lo que haga la app y cada tienda.

## 1. La venta y los derechos de quien compra

| Qué falta | Obligatorio | Quién | Cuándo |
|---|---|---|---|
| Aviso legal con nombre, NIF, domicilio de la actividad y contacto (art. 10 LSSI). Que Stripe venda no quita identificarse | Sí | Ez; el código lo enlaza | Antes |
| Condiciones de compra y licencia por canal: qué incluye, activación, duración, dispositivos, recuperación, soporte, cancelación, devolución, garantía; quién es el vendedor en cada pago (art. 97 TRLGDCU) | Sí, el contenido | Ez con Stripe y Google | Antes |
| La oferta mensual completa al elegir el plan: «7 días gratis; después 2,99 €/mes, IVA incluido; se renueva hasta que canceles», cuándo es el primer cargo y cómo evitarlo (política de Google) | Sí | Ez y el código | Antes |
| El botón final deja claro que hay que pagar, también con prueba gratis; confirmación en soporte duradero con la información del contrato (art. 98.2 y 98.7) | Sí | Stripe y Google; Ez revisa los textos | Antes |
| Definir «de por vida» y quitar ambigüedades: «lo que compras no se quita» puede leerse también para la mensualidad (art. 61) | Sí, que sea claro y cierto | Ez | Antes |
| El desistimiento legal de 14 días, separado de la devolución comercial; la prueba de 7 días no lo sustituye (arts. 102-105) | Sí | Ez y el vendedor | Antes |
| Nada de renuncia genérica «por ser digital»: el art. 103.m pide comienzo, consentimiento previo, conocimiento expreso y confirmación | Solo si se usa la excepción | Stripe/Google; Ez valida | Antes |
| La devolución «en 14 días, sin preguntas» de /premium: desde qué fecha y cómo se pide en web y Android | Sí, porque está prometida | Ez con Stripe y Google | Antes |
| La función de desistimiento en línea (art. 11 bis de la Directiva 2011/83, por la 2023/2673, desde el 19-6-2026): visible, con confirmación y acuse. ChatGPT no confirmó la ley española ni si Link y Play la cubren | A resolver | El vendedor; Ez y el código dan el acceso | Antes |
| El aviso de renovación del art. 97.1.p (15 días antes del plazo para no renovar) y cómo encaja en una mensualidad; el aviso de fin de prueba a 48 h no lo cubre | Cuando aplique | Stripe y Google; Ez comprueba | Antes |

## 2. El alta, los impuestos y las facturas

| Qué falta | Obligatorio | Quién | Cuándo |
|---|---|---|---|
| Alta censal en Hacienda, modelo 036 (el 037 ya no existe), antes de empezar | Sí | Ez o la gestoría | Antes |
| Alta de autónomo (RETA) si la actividad es habitual, cobre poco o cobre un intermediario. Stripe y Google no dan de alta | Sí, si hay habitualidad | Ez | Antes |
| Aprobación real de Stripe Managed Payments (revisión de cuenta y producto, código fiscal elegible). Un Payment Link normal no hace a Stripe vendedor | Sí, para la web | Ez y Stripe | Antes |
| IVA en la web: con Managed Payments, Stripe lo calcula, lo cobra, lo declara y factura; no se liquida dos veces | Sí, delegado | Stripe; Ez revisa | Antes |
| IVA en Android: con la facturación de Google Play, lo gestiona Google | Sí, delegado | Google | Desde la primera venta |
| Lo fiscal de Ez con las plataformas y sus comisiones (facturas B2B, ROI, 349, inversión del sujeto pasivo en el 303), según los contratos reales | Lo que aplique | Ez con la gestoría | Antes y después |
| IRPF y registros: ingresos, comisiones, devoluciones, gastos; pagos fraccionados (modelo 130 en estimación directa) | Sí | Ez | Organizarlo antes |

## 3. Lo que tiene que hacer la app

| Qué falta | Obligatorio | Quién | Cuándo |
|---|---|---|---|
| Compra y activación web de verdad: cómo un pago o una prueba entrega la licencia, renueva la mensual y trata fallos y devoluciones | Entregar lo vendido, sí | Código y Ez; Stripe avisa | Antes |
| Facturación de Google Play: productos y precios, compra, verificación, pendientes, entrega y reconocer la compra en 3 días (si no, Google la devuelve) | Para vender en Play | Código con Google | Antes de cobrar en Android |
| Restaurar sin volver a cobrar: Android tras reinstalar o cambiar de móvil; web, con el código, el correo y el recibo que ya se anuncian | Sí | Código y Ez | Antes |
| «Gestionar» en Ajustes: portal de Stripe o Link en la web, centro de suscripciones de Play en Android. Cancelar no es devolver | Sí, con suscripciones | Código con Stripe y Google | Antes |
| El aviso de fin de prueba que se promete: Stripe solo lo documenta para pruebas de MÁS de 7 días; mejor uno que llegue sin abrir PACE | Sí, está prometido | Ez y el código | Antes |
| Sin conexión: guardar un derecho ya verificado, distinguir «sin red» de «vencida» y decir qué pide conexión | Lo prometido, sí | Código y Ez | Antes |
| La compra de por vida: en la web, pago único sin caducidad; en Android, producto único no consumible y restaurable, no una suscripción con ese nombre; quien pasa de mensual a por vida no debe seguir pagando sin saberlo | Si se vende | Ez, código, Stripe y Google | Antes |
| Apagar `PREMIUM_ABIERTO_HASTA_V1` sin bloquear a quien compró, y en Play Console cambiar el acceso de revisión y las compras digitales | Lo de Play, sí | Ez y el código | Antes de la versión de pago |

## 4. La privacidad con pagos

| Qué falta | Obligatorio | Quién | Cuándo |
|---|---|---|---|
| Una sección de compras en `privacy.html`: responsable, datos que se manejan (correo, pedido, producto, estado, licencia, soporte), fines, bases, destinatarios, conservación, derechos y AEPD | Sí | Ez | Antes |
| Precisar «sin cuenta» y «datos locales»: la práctica se queda en el equipo, pero los datos de la compra no; Link puede pedir cuenta y Android usa la de Google | Sí | Ez y los textos | Antes |
| Volver a rellenar Seguridad de los datos en Play con la integración final (historial de compras, envíos a un servidor) | Sí | Ez | Antes de la versión de pago |
| «Borrar mis datos» no borra recibos ni lo que hay que conservar por ley; los correos de compra no se usan para publicidad | Sí | Ez, Stripe, Google y el código | Antes y siempre |

## Lo que recomienda para lanzar con menos riesgo

1. Gestoría antes de vender: 036, RETA y los contratos y facturas de las dos plataformas.
2. Mantener la devolución de 14 días sin preguntas y no intentar excluirla en v1.
3. Cerrar primero el circuito entero: comprar, activar, cerrar la app, volver sin red, restaurar en otro
   equipo, cancelar y devolver.
4. No activar la mensual hasta probar el aviso de la prueba y las renovaciones.
5. Que un jurista valide tres cosas: si la oferta es contenido o servicio digital, la función de
   desistimiento y el aviso español de renovación.

Fuentes que cita: BOE (LSSI art. 10; TRLGDCU arts. 61, 97, 98, 102-105), Directiva (UE) 2023/2673, AEAT
(036, pagos fraccionados, IVA en servicios), Seguridad Social (RETA), Stripe (Managed Payments: elegibilidad,
impuestos, cómo funciona), Google Play (suscripciones, IVA, facturación, Seguridad de los datos) y AEPD.
