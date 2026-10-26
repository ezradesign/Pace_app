/* PACE · /api/codigo — EL CÓDIGO DE QUIEN ACABA DE PAGAR
   ============================================================
   Stripe devuelve al comprador a la página de gracias con el id de su compra
   (`?sesion={CHECKOUT_SESSION_ID}`). La página pregunta aquí por su código, el que
   firmó /api/stripe al recibir el aviso del pago (functions/api/stripe.js):

   GET ?sesion=cs_…  -> 200 { codigo } · 404 { pendiente: true } si el aviso aún no ha
                        llegado (la página vuelve a preguntar unos segundos) · 400 si no es
                        un id de compra · 503 sin el almacén `VENTAS`.

   El id de la compra es largo y no se adivina: tenerlo es haber vuelto de pagar. Lo que
   se contesta no se guarda en ninguna caché. */

const SESION = /^cs_(test_|live_)?[A-Za-z0-9]{10,240}$/;

function respuesta(datos, estado) {
  return new Response(JSON.stringify(datos), {
    status: estado || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestGet({ request, env }) {
  if (!env.VENTAS) return respuesta({ ok: false, motivo: 'cerrada' }, 503);
  const sesion = new URL(request.url).searchParams.get('sesion') || '';
  if (!SESION.test(sesion)) return respuesta({ ok: false, motivo: 'sesion' }, 400);
  const codigo = await env.VENTAS.get('sesion:' + sesion);
  return codigo ? respuesta({ ok: true, codigo: codigo }) : respuesta({ ok: false, pendiente: true }, 404);
}
