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
     un pago hecho de PACE. La compra de por vida es un pago único (`mode: payment`, pagado);
     la mensual, una suscripción (`mode: subscription`), con los siete días de prueba
     (`no_payment_required`) o ya pagada. El correo no se lee: el código no lo lleva.
     LOS PAGOS QUE SE CONFIRMAN TARDE (un adeudo SEPA y parecidos; auditoría de seguridad del
     28 oct.): la compra llega acabada pero sin pagar (`unpaid`) y no se firma nada; días
     después Stripe manda `checkout.session.async_payment_succeeded`, con la misma sesión ya
     pagada, y se firma entonces, igual que una compra pagada al momento. Sin atenderlo,
     quien pagara así se quedaría sin su código.
     LAS FECHAS SON LAS DE STRIPE (revisión de ChatGPT del 28 oct., A2): las de la factura y, en
     la compra, la del propio aviso (`created`), que es la misma en cada reintento. Salían de la
     hora de llegada: un reintento movía el fin de la prueba que enseñan /gracias y el aviso de
     dos días antes, y la mensual pagada al alta valía los días de la prueba y no su mes. La
     llave de lectura no hace falta: lo que trae el aviso basta.
     SOLO LO DE PACE (A6): una compra cuenta si la abrió uno de los enlaces de pago de PACE
     (`payment_link`, de la lista `PACE_ENLACES_STRIPE`): la cuenta de Stripe es la de toda la
     actividad de Ez y puede vender otra cosa. Una factura no dice de qué enlace viene: es de
     PACE si su suscripción ya tiene código, y eso lo mira functions/api/stripe.js en `VENTAS`.
     EL MODO DE PRUEBA DE STRIPE (A7): un aviso con `livemode` que no es `true` da un código de
     pocos días. Se firma con la k2 de verdad, y sin esto una compra de mentira abriría PACE
     completo para siempre.

   Las pruebas (tests/cobro-venta.spec.js y cobro-avisos.spec.js) mandan avisos inventados,
   firmados con un secreto de prueba creado en la propia prueba. */

export const STRIPE_TOLERANCIA_S = 300;
/* El mensual vale el periodo pagado y tres días más: si la renovación llega tarde, nadie
   se queda sin lo que paga. La prueba de siete días, igual. */
export const STRIPE_MARGEN_MS = 3 * 24 * 3600 * 1000;
export const STRIPE_PRUEBA_MS = 7 * 24 * 3600 * 1000;
export const STRIPE_MODO_PRUEBA_MS = 3 * 24 * 3600 * 1000;

/* `PACE_ENLACES_STRIPE` -> los enlaces de pago de PACE, los del modo de prueba y los de verdad:
   lo que empieza por `plink_`, separado por comas o espacios. La dirección `buy.stripe.com` del
   enlace no es su número y no cuenta. */
export function stripeEnlaces(texto) {
  return String(texto || '').split(/[\s,;]+/).filter((s) => /^plink_[A-Za-z0-9]{6,}$/.test(s));
}

/* Un mes después, como cuenta Stripe un periodo mensual: el mismo día del mes siguiente a la
   misma hora (UTC), o su último día si no lo tiene (del 31 de enero, al 28 o 29 de febrero). */
function unMesDespues(ms) {
  const d = new Date(ms);
  const ultimo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 2, 0)).getUTCDate();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, Math.min(d.getUTCDate(), ultimo),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
}

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

/* Los dos avisos de una compra pagada: al acabarla, o al confirmarse más tarde el pago. */
export const STRIPE_COMPRA_PAGADA = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];

/* evento (el JSON del aviso), enlaces (stripeEnlaces) -> { plan, order, sesion?, factura?, expiresAt?, trialEnd? } | null
   · checkout.session.completed o .async_payment_succeeded de un enlace de PACE: la compra (por
     vida) o el alta de la suscripción, si ya está pagada. La prueba acaba a los siete días del
     aviso y la mensual pagada vale su primer mes, las dos con su margen.
   · invoice.paid de una suscripción (`factura`): cada renovación; el código nuevo vale hasta el
     final del periodo pagado (más el margen).
   Quien firma mira que `expiresAt` no haya pasado ya: un aviso puede llegar tras días de reintentos. */
export function stripeLeerPago(evento, enlaces) {
  const o = evento && evento.data && evento.data.object;
  const creado = evento ? Number(evento.created) * 1000 : NaN;
  if (!o || typeof o !== 'object' || !(creado > 0)) return null;
  const pago = leerPago(evento.type, o, creado, enlaces || []);
  /* Del modo de prueba, unos días desde el aviso y nunca para siempre. */
  if (pago && evento.livemode !== true) pago.expiresAt = Math.min(pago.expiresAt || Infinity, creado + STRIPE_MODO_PRUEBA_MS);
  return pago;
}

function leerPago(tipo, o, creado, enlaces) {
  if (STRIPE_COMPRA_PAGADA.indexOf(tipo) !== -1) {
    if (enlaces.indexOf(o.payment_link) === -1 || typeof o.id !== 'string') return null;
    if (o.mode === 'payment' && o.payment_status === 'paid') return { plan: 'lifetime', order: o.id, sesion: o.id };
    if (o.mode !== 'subscription' || typeof o.subscription !== 'string') return null;
    /* Con la prueba, Stripe no cobra al alta (`no_payment_required`): el código dice cuándo acaba. */
    if (o.payment_status === 'no_payment_required') {
      return { plan: 'monthly', order: o.subscription, sesion: o.id, trialEnd: creado + STRIPE_PRUEBA_MS,
        expiresAt: creado + STRIPE_PRUEBA_MS + STRIPE_MARGEN_MS };
    }
    if (o.payment_status === 'paid') {
      return { plan: 'monthly', order: o.subscription, sesion: o.id, expiresAt: unMesDespues(creado) + STRIPE_MARGEN_MS };
    }
    return null;
  }
  /* Desde la API de 2025, la factura dice su suscripción en `parent`. */
  const sub = typeof o.subscription === 'string' ? o.subscription
    : (o.parent && o.parent.subscription_details && o.parent.subscription_details.subscription) || null;
  if (tipo === 'invoice.paid' && typeof sub === 'string') {
    const lineas = (o.lines && Array.isArray(o.lines.data)) ? o.lines.data : [];
    const fin = lineas.reduce((m, l) => Math.max(m, (l && l.period && Number(l.period.end)) || 0), 0);
    if (!(fin > 0)) return null;
    return { plan: 'monthly', order: sub, factura: true, expiresAt: fin * 1000 + STRIPE_MARGEN_MS };
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
     Solo cuentan las compras de los enlaces de PACE (A6), y de una del modo de prueba se dice
     (`prueba`) para que su código dure poco (A7).
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

/* -> { plan: 'lifetime', order, devuelta, prueba } | { plan: 'monthly', order } | null (sin
   compra de PACE con ese correo y ese número). Lanza si Stripe no contesta. `pedir` es fetch;
   `enlaces`, los de stripeEnlaces. */
export async function stripeBuscarCompra(correo, recibo, llave, pedir, enlaces) {
  const buscado = stripeNumero(recibo);
  if (!buscado || !correo || !llave) return null;
  const correos = [String(correo).trim()];
  if (correos[0].toLowerCase() !== correos[0]) correos.push(correos[0].toLowerCase());
  for (const c of correos) {
    const lista = await stripeLeer('checkout/sessions?status=complete&limit=100&customer_details[email]=' + encodeURIComponent(c) +
      '&expand[]=data.payment_intent.latest_charge&expand[]=data.invoice', llave, pedir);
    const sesiones = (lista && Array.isArray(lista.data)) ? lista.data : [];
    for (const s of sesiones) {
      if (!s || typeof s.id !== 'string' || (enlaces || []).indexOf(s.payment_link) === -1) continue;
      const cobro = s.payment_intent && s.payment_intent.latest_charge;
      if (s.mode === 'payment' && s.payment_status === 'paid' && numerosDe(cobro, s.invoice).indexOf(buscado) !== -1) {
        return { plan: 'lifetime', order: s.id, devuelta: !!(cobro && (cobro.refunded || cobro.disputed)), prueba: s.livemode !== true };
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
