/* PACE · cobro/venta.js — EL CÓDIGO DE QUIEN COMPRA, FIRMADO CON k2
   ============================================================
   Lo usa la función de la web que recibe «pago hecho» (functions/api/stripe.js). Firma
   el mismo código que la app ya comprueba sin servidor (app/state-licencia.js):

     PACE1.<datos en base64url>.<firma ECDSA P-256 con SHA-256 sobre «PACE1.<datos>»>

   con la llave k2, SOLO PARA VENTAS. k1 (los testers) no sale del PC de Ez y no se toca.
   La privada de k2 vive en los secretos de Cloudflare (`PACE_K2_PRIVADA`, la crea
   `npm run licencia:k2` en el PC de Ez) y nunca en el repositorio.

   Los datos llevan `order`, el número de pedido (la compra de por vida) o de suscripción
   (la mensual), para poder anular solo ese código (`k2:<order>` en
   PACE_LICENCIAS_ANULADAS). El mensual lleva además `expiresAt` (milisegundos): el
   periodo pagado y unos días de margen; la app pide uno nuevo al acercarse el final. El
   del alta con prueba lleva `trialEnd` (milisegundos): con él la app avisa dos días antes
   de que acabe la prueba, sin preguntar a nadie.

   Aquí no hay nada de Stripe: si un día cobra otro (Paddle), cambia el que lee el pago,
   no esto. Módulo de Cloudflare (`export`), con WebCrypto, que también tiene Node. */

export const VENTA_KEY_ID = 'k2';
export const VENTA_PLANES = ['lifetime', 'monthly'];

function b64url(bytes) {
  let bin = '';
  const b = new Uint8Array(bytes);
  for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* La privada de k2 como JWK (texto o ya leída), sin nada más que lo que firma. */
export async function ventaLlave(privada) {
  const jwk = typeof privada === 'string' ? JSON.parse(privada) : privada;
  if (!jwk || jwk.kty !== 'EC' || jwk.crv !== 'P-256' || !jwk.d || !jwk.x || !jwk.y) throw new Error('llave');
  return crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', d: jwk.d, x: jwk.x, y: jwk.y },
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

/* venta: { plan: 'lifetime' | 'monthly', order, expiresAt? }  ->  'PACE1.…'
   `ahora` (ms) da el día de `issuedAt`, en UTC. */
export async function firmarVenta(venta, privada, ahora) {
  if (!venta || VENTA_PLANES.indexOf(venta.plan) === -1) throw new Error('plan');
  if (typeof venta.order !== 'string' || !/^[A-Za-z0-9_]{6,255}$/.test(venta.order)) throw new Error('pedido');
  const datos = { type: venta.plan, keyId: VENTA_KEY_ID, issuedAt: new Date(ahora).toISOString().slice(0, 10), order: venta.order };
  if (venta.plan === 'monthly') {
    if (!(venta.expiresAt > ahora)) throw new Error('caduca');
    datos.expiresAt = Math.round(venta.expiresAt);
    if (venta.trialEnd > ahora) datos.trialEnd = Math.round(venta.trialEnd);
  }
  const firmado = 'PACE1.' + b64url(new TextEncoder().encode(JSON.stringify(datos)));
  const llave = await ventaLlave(privada);
  const firma = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, llave, new TextEncoder().encode(firmado));
  return firmado + '.' + b64url(firma);
}

function deB64url(s) {
  const bin = atob(String(s).replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((String(s).length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/* ¿Este código lo firmó k2? Con la mitad pública de la privada (x, y). -> sus datos o null.
   Lo usa la renovación del mensual: traer el código de antes es haber pagado esa suscripción. */
export async function comprobarVenta(codigo, privada) {
  try {
    const partes = String(codigo || '').split('.');
    if (partes.length !== 3 || partes[0] !== 'PACE1') return null;
    const jwk = typeof privada === 'string' ? JSON.parse(privada) : privada;
    const llave = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y },
      { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const vale = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, llave, deB64url(partes[2]),
      new TextEncoder().encode(partes[0] + '.' + partes[1]));
    if (!vale) return null;
    const datos = JSON.parse(new TextDecoder().decode(deB64url(partes[1])));
    return datos && datos.keyId === VENTA_KEY_ID ? datos : null;
  } catch (e) { return null; }
}
