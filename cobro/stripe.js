/* PACE · cobro/stripe.js — LO ÚNICO QUE SABE DE STRIPE
   ============================================================
   Fino y aparte, para enchufarlo cuando Ez tenga la cuenta (modo «vende por ti»):

   · stripeAvisoValido: ¿este aviso («webhook») lo mandó Stripe? Stripe firma cada aviso
     con el secreto del punto de aviso (`whsec_…`, el secreto `STRIPE_AVISO_SECRETO` en
     Cloudflare): la cabecera `Stripe-Signature` lleva `t=<segundos>` y una o varias
     `v1=<HMAC-SHA256 en hex de «t.cuerpo»>`. Se compara sin atajos (siempre todos los
     caracteres) y un aviso de hace más de cinco minutos no vale: así uno copiado no se
     puede volver a mandar.
   · stripeLeerPago: del aviso, lo que hace falta para firmar el código, o null si no es
     un pago hecho. La compra de por vida es un pago único (`mode: payment`, pagado); la
     mensual, una suscripción (`mode: subscription`), con los siete días de prueba
     (`no_payment_required`) o ya pagada. El correo no se lee: el código no lo lleva.

   Las pruebas (tests/cobro-venta.spec.js) mandan avisos inventados, firmados con un
   secreto de prueba creado en la propia prueba. */

export const STRIPE_TOLERANCIA_S = 300;
/* El mensual vale el periodo pagado y tres días más: si la renovación llega tarde, nadie
   se queda sin lo que paga. La prueba de siete días, igual. */
export const STRIPE_MARGEN_MS = 3 * 24 * 3600 * 1000;
export const STRIPE_PRUEBA_MS = 7 * 24 * 3600 * 1000;

function hex(bytes) {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
}

function igual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/* -> true si la firma vale y el aviso es de los últimos cinco minutos. */
export async function stripeAvisoValido(cuerpo, cabecera, secreto, ahoraS) {
  if (typeof cuerpo !== 'string' || typeof cabecera !== 'string' || !secreto) return false;
  let t = null;
  const firmas = [];
  cabecera.split(',').forEach((parte) => {
    const i = parte.indexOf('=');
    const k = parte.slice(0, i).trim(), v = parte.slice(i + 1).trim();
    if (k === 't') t = Number(v);
    else if (k === 'v1') firmas.push(v);
  });
  if (!Number.isFinite(t) || !firmas.length) return false;
  if (Math.abs(ahoraS - t) > STRIPE_TOLERANCIA_S) return false;
  const llave = await crypto.subtle.importKey('raw', new TextEncoder().encode(secreto),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const esperada = hex(await crypto.subtle.sign('HMAC', llave, new TextEncoder().encode(t + '.' + cuerpo)));
  let vale = false;
  firmas.forEach((f) => { if (igual(f, esperada)) vale = true; });
  return vale;
}

/* evento (el JSON del aviso) -> { plan, order, sesion?, expiresAt? } | null
   · checkout.session.completed: la compra (por vida) o el alta de la suscripción.
   · invoice.paid de una suscripción: cada renovación; el código nuevo vale hasta el final
     del periodo pagado (más el margen). */
export function stripeLeerPago(evento, ahora) {
  const o = evento && evento.data && evento.data.object;
  if (!o || typeof o !== 'object') return null;
  if (evento.type === 'checkout.session.completed') {
    if (o.mode === 'payment' && o.payment_status === 'paid' && typeof o.id === 'string') {
      return { plan: 'lifetime', order: o.id, sesion: o.id };
    }
    if (o.mode === 'subscription' && typeof o.subscription === 'string'
        && (o.payment_status === 'paid' || o.payment_status === 'no_payment_required')) {
      return { plan: 'monthly', order: o.subscription, sesion: o.id, expiresAt: ahora + STRIPE_PRUEBA_MS + STRIPE_MARGEN_MS };
    }
    return null;
  }
  /* Desde la API de 2025, la factura dice su suscripción en `parent`. */
  const sub = typeof o.subscription === 'string' ? o.subscription
    : (o.parent && o.parent.subscription_details && o.parent.subscription_details.subscription) || null;
  if (evento.type === 'invoice.paid' && typeof sub === 'string') {
    const lineas = (o.lines && Array.isArray(o.lines.data)) ? o.lines.data : [];
    const fin = lineas.reduce((m, l) => Math.max(m, (l && l.period && Number(l.period.end)) || 0), 0);
    if (!(fin * 1000 > ahora)) return null;
    return { plan: 'monthly', order: sub, expiresAt: fin * 1000 + STRIPE_MARGEN_MS };
  }
  return null;
}

/* evento -> el id de la suscripción que ha terminado (cancelada al acabar su periodo, o sin
   pagar), o null. Desde entonces /api/renovar ya no da códigos nuevos para ella. */
export function stripeLeerFin(evento) {
  const o = evento && evento.data && evento.data.object;
  if (!o || evento.type !== 'customer.subscription.deleted' || typeof o.id !== 'string') return null;
  return o.id;
}
