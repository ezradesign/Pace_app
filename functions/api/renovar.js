/* PACE · /api/renovar — EL CÓDIGO NUEVO DE LA MENSUAL
   ============================================================
   El código de la mensual caduca al final del periodo pagado más tres días
   (cobro/stripe.js). Al acercarse esa fecha, la app de la web manda aquí el código que
   tiene, y la función le devuelve el último que firmó /api/stripe para esa suscripción
   (el de la renovación). Es la única conexión de la app, y solo para quien paga al mes.

   POST { codigo }  -> 200 { codigo } con el último de esa suscripción (puede ser el mismo,
                       si aún no se ha renovado) · 410 { terminada } si la suscripción ya
                       no sigue · 400 si el código no lo firmó k2 o no es de una mensual ·
                       503 sin la k2 o sin el almacén.

   Traer el código de antes es haber pagado esa suscripción: no hay cuentas ni correo. La
   firma se comprueba con la mitad pública de la k2 que ya tiene la función. */

import { comprobarVenta } from '../../cobro/venta.js';

const CUERPO_MAX = 2048;

function respuesta(datos, estado) {
  return new Response(JSON.stringify(datos), {
    status: estado || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.PACE_K2_PRIVADA || !env.VENTAS) return respuesta({ ok: false, motivo: 'cerrada' }, 503);
  const origen = request.headers.get('Origin');
  if (origen && origen !== new URL(request.url).origin) return respuesta({ ok: false, motivo: 'origen' }, 403);
  const texto = await request.text();
  if (texto.length > CUERPO_MAX) return respuesta({ ok: false, motivo: 'formato' }, 413);
  let pedido;
  try { pedido = JSON.parse(texto); } catch (e) { return respuesta({ ok: false, motivo: 'formato' }, 400); }
  const datos = await comprobarVenta(pedido && pedido.codigo, env.PACE_K2_PRIVADA);
  if (!datos || datos.type !== 'monthly' || typeof datos.order !== 'string') return respuesta({ ok: false, motivo: 'codigo' }, 400);
  const ultimo = await env.VENTAS.get('suscripcion:' + datos.order);
  return ultimo ? respuesta({ ok: true, codigo: ultimo }) : respuesta({ ok: false, terminada: true }, 410);
}
