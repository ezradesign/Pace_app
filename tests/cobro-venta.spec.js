/* PACE · E2E · COBRAR EN LA WEB: EL AVISO DE STRIPE, LA FIRMA CON k2 Y LA PÁGINA DE GRACIAS
 * =========================================================================================
 * Sin cuenta de Stripe todavía: los avisos son inventados y van firmados con un secreto
 * de prueba, y la llave k2 de estas pruebas se crea en cada pasada (nunca la de verdad).
 * Prueban las funciones de Cloudflare a pelo, en Node, como premium-pagina prueba
 * «Avísame»: functions/api/stripe.js (recibe «pago hecho» y firma), functions/api/codigo.js
 * (lo da a la página de gracias), cobro/stripe.js y cobro/venta.js.
 */
'use strict';

const crypto = require('crypto');
const path = require('path');
const { pathToFileURL } = require('url');
const { test, expect } = require('@playwright/test');

const RAIZ = path.join(__dirname, '..');
const importar = (rel) => import(pathToFileURL(path.join(RAIZ, rel)).href);

const k2 = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const K2_PRIVADA = JSON.stringify(k2.privateKey.export({ format: 'jwk' }));
const SECRETO = 'whsec_prueba_' + crypto.randomBytes(16).toString('hex');

function almacen() {
  const datos = new Map();
  return { datos, get: async (k) => (datos.has(k) ? datos.get(k) : null), put: async (k, v, o) => { datos.set(k, v); datos.set('ttl:' + k, o && o.expirationTtl); },
    delete: async (k) => { datos.delete(k); datos.delete('ttl:' + k); } };
}

function firmaStripe(cuerpo, t, secreto) {
  return 't=' + t + ',v1=' + crypto.createHmac('sha256', secreto || SECRETO).update(t + '.' + cuerpo).digest('hex');
}

function aviso(evento, opciones) {
  const o = opciones || {};
  const cuerpo = JSON.stringify(evento);
  const t = o.t != null ? o.t : Math.floor(Date.now() / 1000);
  return new Request('https://pacegrass.app/api/stripe', { method: 'POST', body: cuerpo,
    headers: { 'Content-Type': 'application/json', 'Stripe-Signature': o.firma || firmaStripe(cuerpo, t, o.secreto) } });
}

const env = (kv) => ({ STRIPE_AVISO_SECRETO: SECRETO, PACE_K2_PRIVADA: K2_PRIVADA, VENTAS: kv });

/* Lo que comprueba la app (app/state-licencia.js), en Node: la firma y los datos. */
function leerCodigo(codigo) {
  const [pre, datos, firma] = codigo.split('.');
  const vale = crypto.verify('sha256', Buffer.from(pre + '.' + datos), { key: k2.publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(firma, 'base64url'));
  return { pre, vale, datos: JSON.parse(Buffer.from(datos, 'base64url').toString('utf8')) };
}

const COMPRA = { id: 'evt_1', type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_a1B2c3D4e5F6g7H8', mode: 'payment', payment_status: 'paid', customer_details: { email: 'quien@compra.es' } } } };
const ALTA = { id: 'evt_2', type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_z9Y8x7W6v5U4t3S2', mode: 'subscription', payment_status: 'no_payment_required', subscription: 'sub_1AbCdEf' } } };

test.describe('el cobro en la web', () => {
  let stripe, codigo, renovar;
  test.beforeAll(async () => {
    stripe = await importar('functions/api/stripe.js');
    codigo = await importar('functions/api/codigo.js');
    renovar = await importar('functions/api/renovar.js');
  });

  test('sin las tres piezas de Ez está apagada', async () => {
    for (const falta of ['STRIPE_AVISO_SECRETO', 'PACE_K2_PRIVADA', 'VENTAS']) {
      const e = env(almacen());
      delete e[falta];
      expect((await stripe.onRequestPost({ request: aviso(COMPRA), env: e })).status, falta).toBe(503);
    }
    expect((await codigo.onRequestGet({ request: new Request('https://pacegrass.app/api/codigo?sesion=cs_test_a1B2c3D4e5F6g7H8'), env: {} })).status).toBe(503);
  });

  test('la compra de por vida: firma un código con k2 y su pedido, para siempre, y la página de gracias lo recoge', async () => {
    const kv = almacen();
    const r = await stripe.onRequestPost({ request: aviso(COMPRA), env: env(kv) });
    expect(await r.json()).toEqual({ ok: true, codigo: true });
    const guardado = kv.datos.get('sesion:cs_test_a1B2c3D4e5F6g7H8');
    const c = leerCodigo(guardado);
    expect(c.pre).toBe('PACE1');
    expect(c.vale, 'la firma con k2 no vale').toBe(true);
    expect(c.datos).toEqual({ type: 'lifetime', keyId: 'k2', issuedAt: new Date().toISOString().slice(0, 10), order: 'cs_test_a1B2c3D4e5F6g7H8' });
    /* Ni el correo ni nada más de la compra. */
    expect(JSON.stringify([...kv.datos])).not.toContain('quien@compra.es');
    expect(kv.datos.get('ttl:sesion:cs_test_a1B2c3D4e5F6g7H8')).toBe(90 * 24 * 3600);

    const g = await codigo.onRequestGet({ request: new Request('https://pacegrass.app/api/codigo?sesion=cs_test_a1B2c3D4e5F6g7H8'), env: { VENTAS: kv } });
    expect(g.status).toBe(200);
    expect(g.headers.get('Cache-Control')).toBe('no-store');
    expect(await g.json()).toEqual({ ok: true, codigo: guardado });
  });

  test('la mensual: el alta con la prueba vale 7 días y 3 de margen, y cada renovación hasta el final del periodo', async () => {
    const kv = almacen();
    const antes = Date.now();
    await stripe.onRequestPost({ request: aviso(ALTA), env: env(kv) });
    const alta = leerCodigo(kv.datos.get('sesion:cs_test_z9Y8x7W6v5U4t3S2'));
    expect(alta.vale).toBe(true);
    expect(alta.datos.type).toBe('monthly');
    expect(alta.datos.order).toBe('sub_1AbCdEf');
    /* La prueba acaba a los 7 días: con eso avisa la app dos días antes. */
    expect((alta.datos.trialEnd - antes) / (24 * 3600 * 1000)).toBeCloseTo(7, 2);
    const dias = (alta.datos.expiresAt - antes) / (24 * 3600 * 1000);
    expect(dias).toBeGreaterThan(9.99);
    expect(dias).toBeLessThan(10.01);
    expect(kv.datos.get('suscripcion:sub_1AbCdEf')).toBe(kv.datos.get('sesion:cs_test_z9Y8x7W6v5U4t3S2'));

    /* La renovación, con la factura como la manda la API de 2025 (la suscripción en `parent`). */
    const fin = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
    const renueva = { id: 'evt_3', type: 'invoice.paid', data: { object: { id: 'in_1',
      parent: { subscription_details: { subscription: 'sub_1AbCdEf' } }, lines: { data: [{ period: { start: fin - 30 * 24 * 3600, end: fin } }] } } } };
    await stripe.onRequestPost({ request: aviso(renueva), env: env(kv) });
    const nuevo = leerCodigo(kv.datos.get('suscripcion:sub_1AbCdEf'));
    expect(nuevo.vale).toBe(true);
    expect(nuevo.datos.expiresAt).toBe(fin * 1000 + 3 * 24 * 3600 * 1000);
  });

  test('un aviso que no firmó Stripe, uno viejo o uno cambiado no firman nada', async () => {
    const kv = almacen();
    const otro = await stripe.onRequestPost({ request: aviso(COMPRA, { secreto: 'whsec_otro' }), env: env(kv) });
    expect(otro.status).toBe(400);
    const viejo = await stripe.onRequestPost({ request: aviso(COMPRA, { t: Math.floor(Date.now() / 1000) - 301 }), env: env(kv) });
    expect(viejo.status, 'un aviso de hace más de cinco minutos').toBe(400);
    /* La firma de un aviso, puesta a otro (el de un pago que no se hizo). */
    const t = Math.floor(Date.now() / 1000);
    const firma = firmaStripe(JSON.stringify(COMPRA), t);
    const cambiado = Object.assign({}, COMPRA, { id: 'evt_9' });
    expect((await stripe.onRequestPost({ request: aviso(cambiado, { firma }), env: env(kv) })).status).toBe(400);
    const sinCabecera = new Request('https://pacegrass.app/api/stripe', { method: 'POST', body: JSON.stringify(COMPRA) });
    expect((await stripe.onRequestPost({ request: sinCabecera, env: env(kv) })).status).toBe(400);
    expect(kv.datos.size).toBe(0);
  });

  test('lo que no es un pago hecho no firma nada, y la página de gracias espera', async () => {
    const kv = almacen();
    const sinPagar = JSON.parse(JSON.stringify(COMPRA));
    sinPagar.data.object.payment_status = 'unpaid';
    for (const e of [sinPagar, { id: 'evt_4', type: 'customer.created', data: { object: { id: 'cus_1' } } }]) {
      const r = await stripe.onRequestPost({ request: aviso(e), env: env(kv) });
      expect(await r.json()).toEqual({ ok: true, codigo: false });
    }
    expect(kv.datos.size).toBe(0);
    const espera = await codigo.onRequestGet({ request: new Request('https://pacegrass.app/api/codigo?sesion=cs_test_a1B2c3D4e5F6g7H8'), env: { VENTAS: kv } });
    expect(espera.status).toBe(404);
    expect(await espera.json()).toEqual({ ok: false, pendiente: true });
    const mala = await codigo.onRequestGet({ request: new Request('https://pacegrass.app/api/codigo?sesion=suscripcion:sub_1'), env: { VENTAS: kv } });
    expect(mala.status, 'se pide otra cosa del almacén').toBe(400);
  });

  test('la renovación: con el código de antes da el último de esa mensual; terminada, ya no', async () => {
    const kv = almacen();
    const pide = (c) => renovar.onRequestPost({ request: new Request('https://pacegrass.app/api/renovar', { method: 'POST', body: JSON.stringify({ codigo: c }) }), env: env(kv) });
    await stripe.onRequestPost({ request: aviso(ALTA), env: env(kv) });
    const alta = kv.datos.get('sesion:cs_test_z9Y8x7W6v5U4t3S2');
    const r = await pide(alta);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, codigo: kv.datos.get('suscripcion:sub_1AbCdEf') });
    /* Un código de por vida, uno falso o uno que no firmó k2 no renuevan nada. */
    await stripe.onRequestPost({ request: aviso(COMPRA), env: env(kv) });
    expect((await pide(kv.datos.get('sesion:cs_test_a1B2c3D4e5F6g7H8'))).status, 'el de por vida').toBe(400);
    const [pre, datos] = alta.split('.');
    expect((await pide(pre + '.' + datos + '.' + Buffer.alloc(64).toString('base64url'))).status, 'firma falsa').toBe(400);
    /* Stripe avisa de que la suscripción terminó: desde ahí, 410. */
    await stripe.onRequestPost({ request: aviso({ id: 'evt_5', type: 'customer.subscription.deleted', data: { object: { id: 'sub_1AbCdEf' } } }), env: env(kv) });
    const fin = await pide(alta);
    expect(fin.status).toBe(410);
    expect(await fin.json()).toEqual({ ok: false, terminada: true });
  });
});
