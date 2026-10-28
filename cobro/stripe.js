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
    /* Con la prueba, Stripe no cobra al alta (`no_payment_required`): el código dice cuándo acaba. */
    if (o.mode === 'subscription' && typeof o.subscription === 'string' && o.payment_status === 'no_payment_required') {
      return { plan: 'monthly', order: o.subscription, sesion: o.id, trialEnd: ahora + STRIPE_PRUEBA_MS,
        expiresAt: ahora + STRIPE_PRUEBA_MS + STRIPE_MARGEN_MS };
    }
    if (o.mode === 'subscription' && typeof o.subscription === 'string' && o.payment_status === 'paid') {
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

/* · stripeBuscarCompra: para /recuperar (functions/api/recuperar.js). Con el correo de la compra
     y el número de su recibo, busca la compra en Stripe en ese momento, con una llave de solo
     lectura (`STRIPE_LECTURA`). Vale el número del recibo del cobro y el de la factura (la
     primera de la mensual o cualquiera de sus renovaciones): no se sabe aún cuál enseña Stripe
     en su modo «vende por ti», y se mira con su modo de pruebas antes de cobrar a nadie.
     Lo que se compara se lee y se olvida: aquí no se guarda nada. */

const STRIPE_API = 'https://api.stripe.com/v1/';

/* El número como se compara: en mayúsculas, sin «#», espacios ni guiones. */
export function stripeNumero(texto) {
  return String(texto || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function stripeLeer(ruta, llave, pedir) {
  const r = await pedir(STRIPE_API + ruta, { headers: { Authorization: 'Bearer ' + llave } });
  if (!r || !r.ok) throw new Error('stripe ' + (r && r.status));
  return r.json();
}

function numerosDe(...objetos) {
  const out = [];
  objetos.forEach((o) => {
    if (!o || typeof o !== 'object') return;
    ['receipt_number', 'number'].forEach((k) => { if (typeof o[k] === 'string' && o[k]) out.push(stripeNumero(o[k])); });
  });
  return out;
}

/* -> { plan: 'lifetime', order, devuelta } | { plan: 'monthly', order } | null (sin compra con
   ese correo y ese número). Lanza si Stripe no contesta. `pedir` es fetch. */
export async function stripeBuscarCompra(correo, recibo, llave, pedir) {
  const buscado = stripeNumero(recibo);
  if (!buscado || !correo || !llave) return null;
  const correos = [String(correo).trim()];
  if (correos[0].toLowerCase() !== correos[0]) correos.push(correos[0].toLowerCase());
  for (const c of correos) {
    const lista = await stripeLeer('checkout/sessions?status=complete&limit=100&customer_details[email]=' + encodeURIComponent(c) +
      '&expand[]=data.payment_intent.latest_charge&expand[]=data.invoice', llave, pedir);
    const sesiones = (lista && Array.isArray(lista.data)) ? lista.data : [];
    for (const s of sesiones) {
      if (!s || typeof s.id !== 'string') continue;
      const cobro = s.payment_intent && s.payment_intent.latest_charge;
      if (s.mode === 'payment' && s.payment_status === 'paid' && numerosDe(cobro, s.invoice).indexOf(buscado) !== -1) {
        return { plan: 'lifetime', order: s.id, devuelta: !!(cobro && (cobro.refunded || cobro.disputed)) };
      }
      if (s.mode !== 'subscription' || typeof s.subscription !== 'string') continue;
      if (numerosDe(s.invoice).indexOf(buscado) !== -1) return { plan: 'monthly', order: s.subscription };
      const facturas = await stripeLeer('invoices?limit=100&subscription=' + encodeURIComponent(s.subscription), llave, pedir);
      const todas = (facturas && Array.isArray(facturas.data)) ? facturas.data : [];
      if (todas.some((f) => numerosDe(f).indexOf(buscado) !== -1)) return { plan: 'monthly', order: s.subscription };
    }
    if (sesiones.length) break;
  }
  return null;
}
