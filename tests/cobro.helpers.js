/* PACE · E2E · LO COMÚN DE LAS PRUEBAS DEL COBRO, EN NODE
 * =======================================================
 * Las funciones de Cloudflare (functions/api/*.js) se prueban a pelo, en Node, sin cuenta de
 * Stripe: los avisos son inventados y van firmados con un secreto de prueba, la llave k2 se crea
 * en cada pasada (nunca la de verdad) y el almacén `VENTAS` vive en memoria. Lo usan
 * cobro-venta, cobro-avisos y cobro-recuperar.
 */
'use strict';

const crypto = require('crypto');
const path = require('path');
const { pathToFileURL } = require('url');

const RAIZ = path.join(__dirname, '..');
const importar = (rel) => import(pathToFileURL(path.join(RAIZ, rel)).href);

const k2 = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const K2_PRIVADA = JSON.stringify(k2.privateKey.export({ format: 'jwk' }));
const SECRETO = 'whsec_prueba_' + crypto.randomBytes(16).toString('hex');
const DIA = 24 * 3600 * 1000;

/* Los enlaces de pago de PACE en estas pruebas: los dos del modo de prueba de Stripe y los dos de
   verdad, todos en `PACE_ENLACES_STRIPE`, como los pondrá Ez en Cloudflare. */
const ENLACE = { vida: 'plink_1VidaPrueba00001', mes: 'plink_1MesPrueba000002', vidaReal: 'plink_1VidaReal000003', mesReal: 'plink_1MesReal0000004' };
const ENLACES = Object.values(ENLACE).join(', ');

/* `VENTAS` en memoria; apunta también la caducidad con la que se guardó cada clave. */
function almacen(inicial) {
  const datos = new Map(Object.entries(inicial || {}));
  return { datos, get: async (k) => (datos.has(k) ? datos.get(k) : null),
    put: async (k, v, o) => { datos.set(k, v); datos.set('ttl:' + k, o && o.expirationTtl); },
    delete: async (k) => { datos.delete(k); datos.delete('ttl:' + k); } };
}

const env = (kv, extra) => Object.assign({ STRIPE_AVISO_SECRETO: SECRETO, PACE_K2_PRIVADA: K2_PRIVADA, VENTAS: kv || almacen(),
  PACE_ENLACES_STRIPE: ENLACES }, extra || {});

/* Un aviso como los manda Stripe: con su fecha (`created`, en segundos) y del modo de verdad, salvo
   que `extra` diga otra cosa. */
function evento(type, objeto, extra) {
  return Object.assign({ id: 'evt_' + crypto.randomBytes(8).toString('hex'), object: 'event', type,
    created: Math.floor(Date.now() / 1000), livemode: true, data: { object: objeto } }, extra || {});
}

function firmaStripe(cuerpo, t, secreto) {
  return 't=' + t + ',v1=' + crypto.createHmac('sha256', secreto || SECRETO).update(t + '.' + cuerpo).digest('hex');
}

/* La entrega a /api/stripe: firmada en el momento (`t`), como cada intento de Stripe. */
function aviso(ev, opciones) {
  const o = opciones || {};
  const cuerpo = JSON.stringify(ev);
  const t = o.t != null ? o.t : Math.floor(Date.now() / 1000);
  return new Request('https://pacegrass.app/api/stripe', { method: 'POST', body: cuerpo,
    headers: { 'Content-Type': 'application/json', 'Stripe-Signature': o.firma || firmaStripe(cuerpo, t, o.secreto) } });
}

/* Lo que comprueba la app (app/state-licencia.js), en Node: la firma con k2 y los datos. */
function leerCodigo(codigo) {
  const [pre, datos, firma] = codigo.split('.');
  const vale = crypto.verify('sha256', Buffer.from(pre + '.' + datos), { key: k2.publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(firma, 'base64url'));
  return { pre, vale, datos: JSON.parse(Buffer.from(datos, 'base64url').toString('utf8')) };
}

/* Un mes después, como cuenta Stripe un periodo mensual (en segundos): el mismo día del mes
   siguiente, o su último día si no lo tiene. */
function mesDespues(s) {
  const d = new Date(s * 1000);
  const ultimo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 2, 0)).getUTCDate();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, Math.min(d.getUTCDate(), ultimo),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()) / 1000;
}

module.exports = { importar, k2, K2_PRIVADA, SECRETO, DIA, ENLACE, ENLACES, almacen, env, evento, firmaStripe, aviso, leerCodigo, mesDespues };
