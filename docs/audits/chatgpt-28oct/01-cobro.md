# Revisión 1 de ChatGPT (28 oct. 2026): El cobro de la web y la importación

> Texto tal cual lo pegó Ez. ChatGPT leyó `main` en `c702a11`, sin ejecutar la app. Lo que comprobó la
> coordinadora contra el código de la 0.185.0, con sus códigos (A1-A6 (y A7, de la coordinadora)), está en `LEEME.md` de esta
> carpeta y en el relevo (`docs/traspaso/relevo-coordinadora-22oct.md`, bloque «28 oct., ~20:10»).

---

Mi conclusión de esta pasada: antes de cobrar, reforzaría la integridad de compras y de importación de datos. Hay casos donde una persona puede haber pagado y recibir una fecha incorrecta, recuperar una licencia anterior o ver que su suscripción ha terminado sin que eso esté demostrado.
La revisión es solo lectura: no he ejecutado PACE ni sus pruebas. Te separo los fallos deducibles del código de los riesgos que necesitan reproducción.
1. Un aviso antiguo de Stripe puede sobrescribir una renovación más reciente
Prioridad: alta · Antes de activar cobros.
Archivo: `functions/api/stripe.js`, función `onRequestPost`.
El servidor escribe cada código mensual directamente sobre `suscripcion:<id>`. No comprueba si está sustituyendo una licencia que caduca más tarde ni conserva un estado de suscripción terminada: al terminar, simplemente borra la clave. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/functions/api/stripe.js)
Secuencia concreta:

1. Llega una renovación que concede acceso hasta el 28 de noviembre, más el margen.
2. Después se entrega otra vez el aviso del alta.
3. El aviso del alta genera otro código y sobrescribe el de noviembre.

Qué ve la persona: en otro navegador, o al recuperar la compra, puede obtener un código con menos vigencia. También hay una variante: después de procesar la baja, un aviso anterior puede volver a crear la clave borrada.
Esto no requiere una firma falsificada: Stripe puede entregar eventos duplicados y no garantiza su orden de entrega. [Fuente](https://docs.stripe.com/webhooks)
Arreglo: procesamiento idempotente y serializado por suscripción; consultar el estado vigente cuando corresponda; impedir retrocesos indebidos y conservar una marca explícita de terminación. No basta con añadir un `get` y después un `put` sin protección frente a concurrencia.
Prueba: entregar alta, renovación y baja en distintos órdenes, incluidos duplicados y peticiones simultáneas. El resultado debe corresponder al estado real de Stripe.
Certeza: el sobrescrito incondicional se deduce del código; falta reproducir sus efectos completos.
2. La prueba empieza cuando llega el aviso, no cuando empieza realmente en Stripe
Prioridad: alta · Antes de activar cobros.
Archivo: `cobro/stripe.js`, función `stripeLeerPago`.
Para el alta con prueba, se calcula `trialEnd` como hora de recepción + siete días. Para un alta mensual ya pagada también se concede una duración fija de siete días más tres de margen, en lugar de obtener el periodo contratado. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/cobro/stripe.js)
Secuencia concreta:

* La prueba empieza el lunes a las 09:00.
* El servidor procesa el aviso el martes a las 09:00.
* PACE firma una licencia que dice que la prueba termina el martes siguiente; en Stripe puede terminar el lunes.

Qué ve la persona: una fecha que no coincide con la del cobro. La página de gracias muestra precisamente el `trialEnd` incluido en el código, así que el error llega al texto visible. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/gracias/index.html)
Arreglo: obtener de Stripe el final real de prueba y el periodo vigente. Separar esa fecha del margen técnico de acceso sin conexión. Un reenvío no debe desplazar ninguna de las dos.
Prueba: procesar el mismo alta al instante, 24 horas después y como duplicado. La fecha de prueba debe ser idéntica en todos los casos.
Certeza: deducido del código.
3. «No encuentro la clave» se interpreta como «suscripción terminada»
Prioridad: alta · Antes de activar cobros.
Archivo: `functions/api/renovar.js`, función `onRequestPost`.
Si `VENTAS.get('suscripcion:' + order)` devuelve vacío, el endpoint responde 410, `terminada: true`. No distingue una baja confirmada de una clave todavía no visible o una incidencia de almacenamiento. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/functions/api/renovar.js)
Cloudflare KV tiene consistencia eventual: una escritura puede tardar 60 segundos o más en verse en otras ubicaciones y también se almacenan temporalmente las respuestas de «no existe». [Fuente](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
Secuencia concreta:

1. Una lectura obtiene «no existe».
2. El webhook guarda una licencia válida.
3. Otra petición todavía recibe la ausencia almacenada.
4. PACE interpreta esa ausencia como terminación.

Qué ve la persona: si su código ya está caducado, puede aparecer el motivo «terminada» sin haber confirmado una baja.
Arreglo: responder «pendiente/no disponible» ante una ausencia no explicada. Reservar el 410 para una terminación explícita. Para el estado autoritativo de las compras, utilizar una solución con garantías de consistencia adecuadas.
Prueba: simular que KV sigue devolviendo vacío después de escribir. PACE debe reintentar, no afirmar que la suscripción terminó.
Certeza: la interpretación incorrecta está en el código; su frecuencia real necesita pruebas de integración.
4. Una renovación que llega tarde puede sustituir una compra de por vida
Prioridad: alta · Antes de activar cobros.
Archivo: `app/state-licencia.js`, funciones `paceLicenciaRenovar` y `paceLicenciaCanjear`.
La renovación captura el código mensual al iniciar la petición. Cuando llega la respuesta, comprueba que corresponde a aquella suscripción, pero no comprueba que siga siendo la licencia que la persona tiene ahora. Después llama al canje, que guarda el código recibido. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/state-licencia.js)
Secuencia concreta:

1. Empieza una renovación mensual con la conexión lenta.
2. Antes de recibirla, canjeas una compra de por vida.
3. Llega la renovación pendiente.
4. El código mensual sustituye al de por vida.

Qué ves: desaparece «Para siempre» y vuelve una fecha de caducidad.
Arreglo: asociar la petición a la licencia de partida y descartar la respuesta si esa licencia ha cambiado. Repetir la comprobación inmediatamente antes de escribir, después de la verificación criptográfica.
Prueba: retener la respuesta de renovación, canjear una licencia de por vida y liberar después la respuesta. La licencia de por vida debe permanecer.
Certeza: carrera deducible del código; falta ejecutarla.
5. La importación deja una ventana donde el estado antiguo puede volver a guardarse encima
Prioridad: alta por posible pérdida de datos.
Archivo: `app/tweaks/TweaksData.jsx`, función `importarDeVerdad`.
La importación escribe el estado nuevo directamente en almacenamiento, pero no sustituye en ese momento el estado vivo de la app. Después espera 900 ms antes de recargar. En la importación parcial, espera a que cierres el aviso. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/tweaks/TweaksData.jsx)
Durante ese intervalo, `setState` sigue trabajando con el estado anterior y persiste el objeto completo. Por tanto, una escritura puede tapar la copia recién importada. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/state-core.jsx)
Secuencia concreta para probar:

1. La instalación actual tiene 25 minutos de foco.
2. Importas una copia que contiene 500 minutos.
3. Tras terminar la escritura y antes de recargar, se produce una actualización del estado anterior.
4. Esa actualización vuelve a guardar los 25 minutos, con sus cambios.

Qué ve la persona: «Importado», pero después faltan los datos de la copia o aparecen mezclados.
Arreglo: tratar la importación como una operación exclusiva: bloquear escrituras ordinarias y respuestas asíncronas mientras cambia el estado; sustituir coherentemente la memoria y los almacenes antes de reabrir la interacción. La recarga retardada no debe ser la garantía de integridad.
Prueba: forzar una escritura durante esos 900 ms y durante el aviso parcial. Comprobar estado, historial y eventos después de recargar.
Certeza: existe la ventana de inconsistencia; la reproducción mediante un temporizador real necesita ejecución.
6. Se verifica que el pago viene de Stripe, pero no que sea del producto correcto
Prioridad: alta si la cuenta tiene otros productos; preventiva si solo vende PACE.
Archivo: `cobro/stripe.js`, función `stripeLeerPago`.
La rama de compra de por vida acepta una sesión con `mode: payment` y `payment_status: paid`. No comprueba el producto, el precio autorizado ni el Payment Link de PACE. La rama de facturas tampoco filtra las líneas por el producto contratado. La autenticidad del aviso no demuestra qué se compró. Esto se observa en el mismo lector de pagos descrito en el punto 2.
Secuencia concreta:

1. En esa cuenta de Stripe también vendes otro producto.
2. Su evento llega al mismo destino.
3. El lector lo interpreta como una compra de PACE.

Qué ocurre: puedes emitir una licencia de por vida por una compra ajena a PACE, o calcular una vigencia usando líneas que no corresponden.
Arreglo: lista de productos/precios autorizados, validada en servidor; comprobar las líneas de Checkout y de las facturas. No basarlo únicamente en el importe, porque puede haber descuentos e impuestos.
Prueba: enviar un pago auténtico de otro producto y una factura con varias líneas. Ninguno debe conceder acceso fuera de lo contratado.
Certeza: falta la validación; el impacto depende de la configuración de Stripe.
Qué dicen las pruebas que he leído
Las pruebas de cobro cubren firma, alta, renovación y baja en el orden esperado. Su almacén simulado es un `Map`, así que no reproduce la consistencia eventual de KV. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/tests/cobro-venta.spec.js)
Las pruebas de renovación comprueban que no entre un código de otra suscripción, pero no el caso de cambiar de licencia mientras hay una respuesta pendiente. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/tests/cobro-renovar.spec.js)
Orden que seguiría: proteger la importación → evitar que una respuesta antigua sustituya una licencia nueva → hacer robusto el procesamiento de Stripe → corregir fechas y estados de renovación → validar productos.
No desmontaría la arquitectura: los problemas encontrados están en las transiciones y la concurrencia, no en la idea de usar licencias firmadas. Pero no daría el circuito de cobro por cerrado solo porque funciona una compra de prueba en el orden normal.
