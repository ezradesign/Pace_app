/* PACE · E2E · COBRAR EN LA WEB: EL AVISO DE STRIPE, LA FIRMA CON k2 Y LA PÁGINA DE GRACIAS
 * =========================================================================================
 * Sin cuenta de Stripe todavía: los avisos son inventados y van firmados con un secreto
 * de prueba, y la llave k2 de estas pruebas se crea en cada pasada (nunca la de verdad).
 * Prueban las funciones de Cloudflare a pelo, en Node, como premium-pagina prueba
 * «Avísame»: functions/api/stripe.js (recibe «pago hecho» y firma), functions/api/codigo.js
 * (lo da a la página de gracias), functions/api/renovar.js, cobro/stripe.js y cobro/venta.js.
 * Lo común, en tests/cobro.helpers.js; el orden de los avisos, sus fechas, las compras que no
 * son de PACE y el modo de prueba de Stripe, en tests/cobro-avisos.spec.js.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { importar, DIA, ENLACE, almacen, env, evento, firmaStripe, aviso, leerCodigo } = require('./cobro.helpers');

const COMPRA = evento('checkout.session.completed', { id: 'cs_test_a1B2c3D4e5F6g7H8', object: 'checkout.session', mode: 'payment',
  payment_status: 'paid', payment_link: ENLACE.vida, customer_details: { email: 'quien@compra.es' } }, { id: 'evt_1' });
const ALTA = evento('checkout.session.completed', { id: 'cs_test_z9Y8x7W6v5U4t3S2', object: 'checkout.session', mode: 'subscription',
  payment_status: 'no_payment_required', subscription: 'sub_1AbCdEf', payment_link: ENLACE.mes }, { id: 'evt_2' });

test.describe('el cobro en la web', () => {
  let stripe, codigo, renovar;
  test.beforeAll(async () => {
    stripe = await importar('functions/api/stripe.js');
    codigo = await importar('functions/api/codigo.js');
    renovar = await importar('functions/api/renovar.js');
  });

  test('sin las cuatro piezas de Ez está apagada', async () => {
    for (const falta of ['STRIPE_AVISO_SECRETO', 'PACE_K2_PRIVADA', 'VENTAS', 'PACE_ENLACES_STRIPE']) {
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

  test('la mensual: el alta con la prueba vale 7 días y 3 de margen desde el alta, y cada renovación hasta el final del periodo', async () => {
    const kv = almacen();
    await stripe.onRequestPost({ request: aviso(ALTA), env: env(kv) });
    const alta = leerCodigo(kv.datos.get('sesion:cs_test_z9Y8x7W6v5U4t3S2'));
    expect(alta.vale).toBe(true);
    expect(alta.datos.type).toBe('monthly');
    expect(alta.datos.order).toBe('sub_1AbCdEf');
    /* La prueba acaba a los 7 días del alta: con eso avisa la app dos días antes. */
    expect(alta.datos.trialEnd).toBe(ALTA.created * 1000 + 7 * DIA);
    expect(alta.datos.expiresAt).toBe(ALTA.created * 1000 + 10 * DIA);
    expect(kv.datos.get('suscripcion:sub_1AbCdEf')).toBe(kv.datos.get('sesion:cs_test_z9Y8x7W6v5U4t3S2'));

    /* La renovación, con la factura como la manda la API de 2025 (la suscripción en `parent`). */
    const fin = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
    const renueva = evento('invoice.paid', { id: 'in_1', object: 'invoice', billing_reason: 'subscription_cycle', amount_paid: 299,
      parent: { subscription_details: { subscription: 'sub_1AbCdEf' } }, lines: { data: [{ period: { start: fin - 30 * 24 * 3600, end: fin } }] } });
    await stripe.onRequestPost({ request: aviso(renueva), env: env(kv) });
    const nuevo = leerCodigo(kv.datos.get('suscripcion:sub_1AbCdEf'));
    expect(nuevo.vale).toBe(true);
    expect(nuevo.datos.expiresAt).toBe(fin * 1000 + 3 * DIA);
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
    for (const e of [sinPagar, evento('customer.created', { id: 'cus_1' })]) {
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

  /* Un adeudo SEPA y parecidos: la compra acaba sin pagar y el pago se confirma días después. */
  test('el pago que se confirma tarde: nada al acabar la compra, y el código al confirmarse, de por vida y mensual', async () => {
    const kv = almacen();
    const acaba = JSON.parse(JSON.stringify(COMPRA));
    acaba.data.object.payment_status = 'unpaid';
    expect(await (await stripe.onRequestPost({ request: aviso(acaba), env: env(kv) })).json()).toEqual({ ok: true, codigo: false });
    expect(kv.datos.size).toBe(0);

    const confirmado = JSON.parse(JSON.stringify(COMPRA));
    confirmado.id = 'evt_5';
    confirmado.type = 'checkout.session.async_payment_succeeded';
    expect(await (await stripe.onRequestPost({ request: aviso(confirmado), env: env(kv) })).json()).toEqual({ ok: true, codigo: true });
    const vida = leerCodigo(kv.datos.get('sesion:cs_test_a1B2c3D4e5F6g7H8'));
    expect(vida.vale).toBe(true);
    expect(vida.datos.type).toBe('lifetime');
    expect(vida.datos.order).toBe('cs_test_a1B2c3D4e5F6g7H8');
    const g = await codigo.onRequestGet({ request: new Request('https://pacegrass.app/api/codigo?sesion=cs_test_a1B2c3D4e5F6g7H8'), env: { VENTAS: kv } });
    expect(g.status, 'la página de gracias lo recoge').toBe(200);

    /* La mensual sin prueba, pagada con un adeudo. */
    const alta = evento('checkout.session.async_payment_succeeded', { id: 'cs_test_q1W2e3R4t5Y6u7I8', object: 'checkout.session',
      mode: 'subscription', payment_status: 'paid', subscription: 'sub_2GhIjKl', payment_link: ENLACE.mes });
    await stripe.onRequestPost({ request: aviso(alta), env: env(kv) });
    const mes = leerCodigo(kv.datos.get('suscripcion:sub_2GhIjKl'));
    expect(mes.vale).toBe(true);
    expect(mes.datos.type).toBe('monthly');
    expect(kv.datos.get('sesion:cs_test_q1W2e3R4t5Y6u7I8')).toBe(kv.datos.get('suscripcion:sub_2GhIjKl'));

    /* Si el pago falla, no se firma nada. */
    const falla = JSON.parse(JSON.stringify(acaba));
    falla.id = 'evt_7';
    falla.type = 'checkout.session.async_payment_failed';
    falla.data.object.id = 'cs_test_f1F2f3F4';
    expect(await (await stripe.onRequestPost({ request: aviso(falla), env: env(kv) })).json()).toEqual({ ok: true, codigo: false });
    expect(kv.datos.has('sesion:cs_test_f1F2f3F4')).toBe(false);
  });

  const pide = (kv, c) => renovar.onRequestPost({ request: new Request('https://pacegrass.app/api/renovar', { method: 'POST', body: JSON.stringify({ codigo: c }) }), env: env(kv) });

  test('la renovación: con el código de antes da el último de esa mensual; terminada, ya no', async () => {
    const kv = almacen();
    await stripe.onRequestPost({ request: aviso(ALTA), env: env(kv) });
    const alta = kv.datos.get('sesion:cs_test_z9Y8x7W6v5U4t3S2');
    const r = await pide(kv, alta);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, codigo: kv.datos.get('suscripcion:sub_1AbCdEf') });
    /* Un código de por vida, uno falso o uno que no firmó k2 no renuevan nada. */
    await stripe.onRequestPost({ request: aviso(COMPRA), env: env(kv) });
    expect((await pide(kv, kv.datos.get('sesion:cs_test_a1B2c3D4e5F6g7H8'))).status, 'el de por vida').toBe(400);
    const [pre, datos] = alta.split('.');
    expect((await pide(kv, pre + '.' + datos + '.' + Buffer.alloc(64).toString('base64url'))).status, 'firma falsa').toBe(400);
    /* Stripe avisa de que la suscripción terminó: desde ahí, 410. */
    await stripe.onRequestPost({ request: aviso(evento('customer.subscription.deleted', { id: 'sub_1AbCdEf', object: 'subscription' })), env: env(kv) });
    const fin = await pide(kv, alta);
    expect(fin.status).toBe(410);
    expect(await fin.json()).toEqual({ ok: false, terminada: true });
  });

  /* A3 (revisión de ChatGPT del 28 oct.): sin su clave en `VENTAS` contestaba 410 «terminada», y no
     es lo mismo: falta también si el almacén aún no la ve (tarda en llegar a todos los centros de
     datos) o si el aviso del alta no llegó. «Terminada» es solo la marca de la baja. */
  test('A3 · sin la clave de esa mensual y sin baja, «pendiente», no «terminada»', async () => {
    const kv = almacen();
    await stripe.onRequestPost({ request: aviso(ALTA), env: env(kv) });
    const alta = kv.datos.get('sesion:cs_test_z9Y8x7W6v5U4t3S2');
    const vacio = almacen();
    const r = await pide(vacio, alta);
    expect(r.status, 'sin la clave dijo que la suscripción había terminado').toBe(404);
    expect(await r.json()).toEqual({ ok: false, pendiente: true });
    expect(r.headers.get('Cache-Control')).toBe('no-store');
    expect(vacio.datos.size, 'renovar no escribe nada').toBe(0);
  });
});
