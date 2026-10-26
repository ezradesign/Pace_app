/* PACE · /api/stripe — «PAGO HECHO»: STRIPE AVISA Y LA WEB FIRMA EL CÓDIGO
   ============================================================
   Stripe manda aquí un aviso cada vez que alguien paga (la compra de por vida, el alta
   de la mensual con su prueba y cada renovación). La función comprueba que el aviso es
   de Stripe (cobro/stripe.js), firma el código PACE1 con k2 (cobro/venta.js) y lo deja
   en el almacén `VENTAS` para la página de gracias (functions/api/codigo.js):

     sesion:<id de la compra>       el código, para la página de gracias (90 días)
     suscripcion:<id de la mensual> el último código de esa mensual, para renovarlo

   Cuando una mensual termina (customer.subscription.deleted), se borra su `suscripcion:`, y
   /api/renovar contesta desde entonces que ya no hay código nuevo.

   Solo eso: ni el correo ni el nombre. Lo demás de Stripe no se toca (contesta 200 para
   que no lo vuelva a mandar).

   APAGADA hasta que Ez conecte las tres piezas en Cloudflare (503 mientras falte una):
   el secreto `STRIPE_AVISO_SECRETO` (el `whsec_…` del punto de aviso), el secreto
   `PACE_K2_PRIVADA` (lo crea `npm run licencia:k2`) y el almacén KV `VENTAS`. La app no
   la usa. Cloudflare la sirve como módulo: el `export` es su formato. */

import { stripeAvisoValido, stripeLeerPago, stripeLeerFin } from '../../cobro/stripe.js';
import { firmarVenta } from '../../cobro/venta.js';

const CUERPO_MAX = 256 * 1024;
const SESION_DIAS = 90;

function respuesta(datos, estado) {
  return new Response(JSON.stringify(datos), {
    status: estado || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_AVISO_SECRETO || !env.PACE_K2_PRIVADA || !env.VENTAS) return respuesta({ ok: false, motivo: 'cerrada' }, 503);
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
    await env.VENTAS.delete('suscripcion:' + fin);
    return respuesta({ ok: true, codigo: false });
  }
  const pago = stripeLeerPago(evento, ahora);
  if (!pago) return respuesta({ ok: true, codigo: false });
  const codigo = await firmarVenta(pago, env.PACE_K2_PRIVADA, ahora);
  if (pago.sesion) await env.VENTAS.put('sesion:' + pago.sesion, codigo, { expirationTtl: SESION_DIAS * 24 * 3600 });
  if (pago.plan === 'monthly') await env.VENTAS.put('suscripcion:' + pago.order, codigo);
  return respuesta({ ok: true, codigo: true });
}
