/* PACE · /api/recuperar — EL CÓDIGO DE UNA COMPRA, OTRA VEZ
   ============================================================
   Ez, 15 oct. 2026 («Cómo se cobra PACE completo», punto 2): quien pagó en la web y perdió su
   código lo recupera con el correo de la compra y el número del recibo. La página
   (pacegrass.app/recuperar) pregunta aquí; la función busca la compra en Stripe en ese momento
   (cobro/stripe.js) y le da su código:

     · la compra de por vida: se vuelve a firmar con k2 y su mismo pedido (cobro/venta.js), como
       el de la página de gracias, aunque hayan pasado más de los 90 días que guarda `VENTAS`;
     · la mensual: el último código de esa suscripción, el mismo que da /api/renovar. Si ya no
       sigue, no hay código nuevo.

   POST { correo, recibo } -> 200 { codigo } · 404 { motivo: 'no' } si no hay compra con ese
     correo y ese número (lo mismo si el correo no existe, para no decir quién compró) · 410
     { motivo: 'terminada' } si la mensual ya terminó · 410 { motivo: 'devuelta' } si la compra se
     devolvió o se reclamó al banco · 400 si falta algo · 403 desde otra web · 413 · 429 · 502 si
     Stripe no contesta · 503 sin las tres piezas de Ez.

   NO SE GUARDA NADA DE NADIE: el correo y el número van a Stripe, que ya los tiene, y se
   olvidan. El límite de intentos (diez por hora desde una misma conexión, para que nadie pruebe
   números a ciegas) vive en la caché del centro de datos con una huella de la IP y la hora, como
   el de «Avísame»; si la caché falla, la puerta sigue abierta.

   APAGADA hasta que Ez conecte en Cloudflare `STRIPE_LECTURA` (una llave restringida de Stripe
   que solo lee Checkout Sessions, cobros y facturas), `PACE_K2_PRIVADA` y el KV `VENTAS`
   (docs/launch/cobro-web.md). La app no la usa. Cloudflare la sirve como módulo. */

import { stripeBuscarCompra } from '../../cobro/stripe.js';
import { firmarVenta } from '../../cobro/venta.js';

const CORREO = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
const RECIBO = /^[#\sA-Za-z0-9-]{4,40}$/;
const CUERPO_MAX = 2048;
const INTENTOS_POR_HORA = 10;

function respuesta(datos, estado) {
  return new Response(JSON.stringify(datos), {
    status: estado || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/* ¿Ha pasado esta conexión de los intentos de esta hora? Cuenta el intento si no. */
async function demasiados(request) {
  const ip = request.headers.get('CF-Connecting-IP');
  const cache = typeof caches !== 'undefined' && caches && caches.default;
  if (!ip || !cache) return false;
  try {
    const hora = new Date().toISOString().slice(0, 13);
    const huella = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hora + '|recuperar|' + ip));
    const hex = Array.from(new Uint8Array(huella), (b) => b.toString(16).padStart(2, '0')).join('');
    const clave = new Request(new URL('/api/recuperar/intentos/' + hex, request.url).href);
    const previa = await cache.match(clave);
    const n = previa ? Number(await previa.text()) || 0 : 0;
    if (n >= INTENTOS_POR_HORA) return true;
    await cache.put(clave, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));
    return false;
  } catch (e) { return false; }
}

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_LECTURA || !env.PACE_K2_PRIVADA || !env.VENTAS) return respuesta({ ok: false, motivo: 'cerrada' }, 503);
  const origen = request.headers.get('Origin');
  if (origen && origen !== new URL(request.url).origin) return respuesta({ ok: false, motivo: 'origen' }, 403);
  if (Number(request.headers.get('Content-Length')) > CUERPO_MAX) return respuesta({ ok: false, motivo: 'formato' }, 413);
  const texto = await request.text();
  if (texto.length > CUERPO_MAX) return respuesta({ ok: false, motivo: 'formato' }, 413);
  if (await demasiados(request)) {
    const r = respuesta({ ok: false, motivo: 'espera' }, 429);
    r.headers.set('Retry-After', '3600');
    return r;
  }
  let datos;
  try { datos = JSON.parse(texto); } catch (e) { return respuesta({ ok: false, motivo: 'formato' }, 400); }
  const correo = String((datos && datos.correo) || '').trim();
  const recibo = String((datos && datos.recibo) || '').trim();
  if (correo.length > 254 || !CORREO.test(correo) || !RECIBO.test(recibo)) return respuesta({ ok: false, motivo: 'formato' }, 400);

  let compra;
  /* Envuelto: un `fetch` suelto, sin su `this`, puede fallar con «Illegal invocation». */
  const pedir = (url, opciones) => fetch(url, opciones);
  try { compra = await stripeBuscarCompra(correo, recibo, env.STRIPE_LECTURA, pedir); } catch (e) { return respuesta({ ok: false, motivo: 'stripe' }, 502); }
  if (!compra) return respuesta({ ok: false, motivo: 'no' }, 404);
  if (compra.devuelta) return respuesta({ ok: false, motivo: 'devuelta' }, 410);
  if (compra.plan === 'monthly') {
    const ultimo = await env.VENTAS.get('suscripcion:' + compra.order);
    return ultimo ? respuesta({ ok: true, codigo: ultimo }) : respuesta({ ok: false, motivo: 'terminada' }, 410);
  }
  const codigo = await firmarVenta({ plan: 'lifetime', order: compra.order }, env.PACE_K2_PRIVADA, Date.now());
  return respuesta({ ok: true, codigo: codigo });
}
