/* PACE · /api/stripe — «PAGO HECHO»: STRIPE AVISA Y LA WEB FIRMA EL CÓDIGO
   ============================================================
   Stripe manda aquí un aviso cada vez que alguien paga (la compra de por vida, el alta
   de la mensual con su prueba y cada renovación; si el pago se confirma días después, como
   un adeudo SEPA, el aviso de esa confirmación). La función comprueba que el aviso es
   de Stripe y de una compra de PACE (cobro/stripe.js), firma el código PACE1 con k2
   (cobro/venta.js) y lo deja en el almacén `VENTAS` para la página de gracias
   (functions/api/codigo.js):

     sesion:<id de la compra>       el código, para la página de gracias (90 días)
     suscripcion:<id de la mensual> el último código de esa mensual, para renovarlo
     baja:<id de la mensual>        la marca de que terminó (con la fecha del aviso)

   Cuando una mensual termina (customer.subscription.deleted), se borra su `suscripcion:` y
   queda su `baja:`, que no se borra: /api/renovar contesta desde entonces que terminó. De una
   suscripción sin código (otra cosa de la cuenta, o una de PACE cuya compra aún no ha llegado)
   la marca dura un mes, más de lo que Stripe sigue mandando aquella compra: si llega, no da
   código, y no se guarda para siempre el número de quien no compró PACE.

   EN CUALQUIER ORDEN Y LAS VECES QUE SEA (revisión de ChatGPT del 28 oct., A1). Stripe no
   promete el orden de sus avisos ni que lleguen una sola vez, y reintenta durante tres días.
   Aquí nada va hacia atrás: `suscripcion:` solo cambia por un código que dura más, `sesion:`
   se escribe una vez, y tras la baja ningún aviso vuelve a dar código. Las fechas son las de
   Stripe y no las de la llegada (cobro/stripe.js), así que un aviso repetido no escribe nada
   y dos a la vez escriben lo mismo: KV no tiene transacciones. Una factura no dice de qué
   enlace de pago viene: es de PACE si su suscripción ya tiene código, el que dio la compra.
   Si llega antes que la compra se ignora, y no falta nada: la compra lleva el mismo mes.

   Solo eso: ni el correo ni el nombre. Lo demás de Stripe no se toca (contesta 200 para
   que no lo vuelva a mandar).

   APAGADA hasta que Ez conecte las cuatro piezas en Cloudflare (503 mientras falte una):
   el secreto `STRIPE_AVISO_SECRETO` (el `whsec_…` del punto de aviso), el secreto
   `PACE_K2_PRIVADA` (lo crea `npm run licencia:k2`), el almacén KV `VENTAS` y
   `PACE_ENLACES_STRIPE`, los enlaces de pago de PACE (docs/launch/cobro-web.md). La app no
   la usa. Cloudflare la sirve como módulo: el `export` es su formato. */

import { stripeAvisoValido, stripeLeerPago, stripeLeerFin, stripeEnlaces } from '../../cobro/stripe.js';
import { firmarVenta, ventaDatos } from '../../cobro/venta.js';

const CUERPO_MAX = 256 * 1024;
const SESION_DIAS = 90;
const BAJA_SIN_CODIGO_DIAS = 30;

function respuesta(datos, estado) {
  return new Response(JSON.stringify(datos), {
    status: estado || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/* La baja de una suscripción: su marca, una vez (repetida no se acorta), y fuera su código. */
async function darDeBaja(kv, sub, fecha) {
  if (!(await kv.get('baja:' + sub))) {
    if (await kv.get('suscripcion:' + sub)) await kv.put('baja:' + sub, fecha);
    else await kv.put('baja:' + sub, fecha, { expirationTtl: BAJA_SIN_CODIGO_DIAS * 24 * 3600 });
  }
  await kv.delete('suscripcion:' + sub);
}

/* Guarda el código de un pago donde falte. -> si la compra tiene su código (escrito ahora o antes). */
async function guardar(env, pago, ahora) {
  const kv = env.VENTAS;
  let suscripcion = false;
  if (pago.plan === 'monthly') {
    if (await kv.get('baja:' + pago.order)) return false;
    const guardado = ventaDatos(await kv.get('suscripcion:' + pago.order));
    if (pago.factura && !guardado) return false;
    suscripcion = !(guardado && guardado.expiresAt >= pago.expiresAt);
  }
  const sesion = !!pago.sesion && !(await kv.get('sesion:' + pago.sesion));
  if (sesion || suscripcion) {
    const codigo = await firmarVenta(pago, env.PACE_K2_PRIVADA, ahora);
    if (sesion) await kv.put('sesion:' + pago.sesion, codigo, { expirationTtl: SESION_DIAS * 24 * 3600 });
    if (suscripcion) await kv.put('suscripcion:' + pago.order, codigo);
  }
  return true;
}

export async function onRequestPost({ request, env }) {
  const enlaces = stripeEnlaces(env.PACE_ENLACES_STRIPE);
  if (!env.STRIPE_AVISO_SECRETO || !env.PACE_K2_PRIVADA || !env.VENTAS || !enlaces.length) return respuesta({ ok: false, motivo: 'cerrada' }, 503);
  if (Number(request.headers.get('Content-Length')) > CUERPO_MAX) return respuesta({ ok: false, motivo: 'formato' }, 413);
  const cuerpo = await request.text();
  if (cuerpo.length > CUERPO_MAX) return respuesta({ ok: false, motivo: 'formato' }, 413);
  const ahora = Date.now();
  const vale = await stripeAvisoValido(cuerpo, request.headers.get('Stripe-Signature'), env.STRIPE_AVISO_SECRETO, ahora / 1000);
  if (!vale) return respuesta({ ok: false, motivo: 'firma' }, 400);
  let evento;
  try { evento = JSON.parse(cuerpo); } catch (e) { return respuesta({ ok: false, motivo: 'formato' }, 400); }
  const fin = stripeLeerFin(evento);
  if (fin) {
    await darDeBaja(env.VENTAS, fin, String(Number(evento.created) || Math.floor(ahora / 1000)));
    return respuesta({ ok: true, codigo: false });
  }
  const pago = stripeLeerPago(evento, enlaces);
  if (!pago || !(pago.expiresAt === undefined || pago.expiresAt > ahora)) return respuesta({ ok: true, codigo: false });
  return respuesta({ ok: true, codigo: await guardar(env, pago, ahora) });
}
