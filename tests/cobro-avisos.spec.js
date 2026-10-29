/* PACE · E2E · LOS AVISOS DE STRIPE: EN CUALQUIER ORDEN, CON SUS FECHAS, SOLO DE PACE Y SIN DAR NADA DE VERDAD EN PRUEBAS
 * =======================================================================================================
 * Revisión de ChatGPT del 28 oct. 2026, comprobada por la coordinadora en el código de la 0.185.0
 * (docs/traspaso/relevo-coordinadora-22oct.md, «28 oct., ~20:10», punto 5). Stripe no promete el
 * orden de sus avisos ni que lleguen una sola vez, y reintenta durante tres días:
 *  A1 · /api/stripe escribía `suscripcion:<id>` sin mirar lo que había y la baja lo borraba: un aviso
 *       repetido o desordenado ponía encima un código más corto o resucitaba uno terminado.
 *  A2 · las fechas salían de la hora de LLEGADA del aviso: un reintento movía el fin de la prueba, y
 *       la mensual pagada al alta valía los 7 + 3 días de la prueba y no su mes.
 *  A6 · cualquier pago de la cuenta de Stripe daba un código de PACE.
 *  A7 · una compra del modo de prueba de Stripe firmaba con la k2 de verdad un código para siempre.
 * Calibradas en rojo contra la 0.185.0: caen las siete.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { importar, DIA, ENLACE, almacen, env, evento, aviso, leerCodigo, mesDespues } = require('./cobro.helpers');

/* Una mensual pagada al momento, sin prueba, que empezó hace una hora (`S`, en segundos, como Stripe):
   el aviso de la compra, su primera factura, la renovación del mes siguiente y la baja. */
const SUB = 'sub_1OrdenAbCdEf';
const SESION = 'cs_test_orden1A2b3C4d5E6f';
const S = Math.floor(Date.now() / 1000) - 3600;
const MES1 = mesDespues(S), MES2 = mesDespues(MES1);
const factura = (id, inicio, fin, extra) => evento('invoice.paid', Object.assign({ id, object: 'invoice', amount_paid: 299,
  parent: { subscription_details: { subscription: SUB } }, lines: { data: [{ period: { start: inicio, end: fin } }] } }, extra), { created: inicio + 2 });
const ALTA = evento('checkout.session.completed', { id: SESION, object: 'checkout.session', mode: 'subscription', payment_status: 'paid',
  subscription: SUB, payment_link: ENLACE.mes, invoice: 'in_orden1' }, { created: S + 1 });
const FACTURA1 = factura('in_orden1', S, MES1, { billing_reason: 'subscription_create' });
const RENOVACION = factura('in_orden2', MES1, MES2, { billing_reason: 'subscription_cycle' });
const BAJA = evento('customer.subscription.deleted', { id: SUB, object: 'subscription', status: 'canceled' });

let stripe, renovar;
test.beforeAll(async () => {
  stripe = await importar('functions/api/stripe.js');
  renovar = await importar('functions/api/renovar.js');
});

const manda = async (kv, ev) => (await stripe.onRequestPost({ request: aviso(ev), env: env(kv) })).json();
const datosDe = (kv, clave) => (kv.datos.get(clave) ? leerCodigo(kv.datos.get(clave)).datos : null);
const pideRenovar = (kv, codigo) => renovar.onRequestPost({ request: new Request('https://pacegrass.app/api/renovar',
  { method: 'POST', body: JSON.stringify({ codigo }) }), env: env(kv) });

test.describe('A1 · lo guardado de una mensual nunca va hacia atrás, y su baja no se deshace', () => {
  test('pagada al momento: llegue su primera factura antes o después de la compra, vale su mes, nunca los 10 días', async () => {
    for (const orden of [[ALTA, FACTURA1], [FACTURA1, ALTA]]) {
      const kv = almacen();
      for (const ev of orden) await manda(kv, ev);
      const como = orden.map((e) => e.type).join(' y luego ');
      for (const clave of ['suscripcion:' + SUB, 'sesion:' + SESION]) {
        const d = datosDe(kv, clave);
        expect(d, como + ': no hay ' + clave).not.toBeNull();
        expect(Math.abs(d.expiresAt - (MES1 * 1000 + 3 * DIA)), como + ': ' + clave + ' no vale el mes pagado').toBeLessThan(60 * 1000);
      }
    }
  });

  test('un aviso viejo que llega otra vez no pisa la renovación, y repetir cualquier aviso no cambia nada', async () => {
    const kv = almacen();
    for (const ev of [ALTA, FACTURA1, RENOVACION]) await manda(kv, ev);
    expect(datosDe(kv, 'suscripcion:' + SUB).expiresAt).toBe(MES2 * 1000 + 3 * DIA);
    const antes = new Map(kv.datos);
    for (const ev of [ALTA, FACTURA1, RENOVACION, FACTURA1, ALTA]) {
      expect(await manda(kv, ev), ev.type).toEqual({ ok: true, codigo: true });
    }
    expect(kv.datos, 'un aviso repetido cambió lo guardado').toEqual(antes);
  });

  test('la baja deja una marca: nada de lo que llegue después vuelve a dar código, y renovar dice «terminada»', async () => {
    const kv = almacen();
    await manda(kv, ALTA);
    const delAlta = kv.datos.get('sesion:' + SESION);
    expect(await manda(kv, BAJA)).toEqual({ ok: true, codigo: false });
    expect(kv.datos.has('suscripcion:' + SUB), 'el código de una mensual terminada sigue guardado').toBe(false);
    for (const ev of [RENOVACION, FACTURA1, ALTA, BAJA, RENOVACION]) {
      expect(await manda(kv, ev), ev.type + ' después de la baja').toEqual({ ok: true, codigo: false });
    }
    expect(kv.datos.has('suscripcion:' + SUB), 'un aviso de después de la baja la resucitó').toBe(false);
    const r = await pideRenovar(kv, delAlta);
    expect(r.status).toBe(410);
    expect(await r.json()).toEqual({ ok: false, terminada: true });
    /* La marca de una mensual de PACE no caduca, ni repetida la baja. */
    expect(kv.datos.get('ttl:baja:' + SUB)).toBeUndefined();

    /* Si la baja llega antes que la compra, tampoco hay código. Sin código no se sabe si es de PACE:
       su marca dura un mes, más de lo que Stripe sigue mandando aquella compra. */
    const otro = almacen();
    await manda(otro, BAJA);
    expect(otro.datos.get('ttl:baja:' + SUB)).toBe(30 * 24 * 3600);
    expect(await manda(otro, ALTA)).toEqual({ ok: true, codigo: false });
    expect(otro.datos.has('sesion:' + SESION)).toBe(false);
    expect(otro.datos.has('suscripcion:' + SUB)).toBe(false);
  });
});

test.describe('A2 · las fechas son las de Stripe, no las de la llegada del aviso', () => {
  test('la prueba acaba a los siete días del alta aunque el aviso llegue un día tarde, y dos veces da el mismo código', async () => {
    const ayer = Math.floor(Date.now() / 1000) - 24 * 3600;
    const sub = 'sub_1PruebaAbCdEf';
    const alta = evento('checkout.session.completed', { id: 'cs_test_prueba1A2b3C4d5E', object: 'checkout.session', mode: 'subscription',
      payment_status: 'no_payment_required', subscription: sub, payment_link: ENLACE.mes, invoice: 'in_prueba1' }, { created: ayer });
    const kv = almacen();
    await manda(kv, alta);
    const codigo = kv.datos.get('sesion:cs_test_prueba1A2b3C4d5E');
    const d = leerCodigo(codigo).datos;
    expect(d.trialEnd, 'la prueba se contó desde la llegada del aviso, no desde el alta').toBe(ayer * 1000 + 7 * DIA);
    expect(d.expiresAt).toBe(ayer * 1000 + 10 * DIA);
    await manda(kv, alta);
    expect(kv.datos.get('sesion:cs_test_prueba1A2b3C4d5E'), 'el mismo aviso otra vez cambió el código de la página de gracias').toBe(codigo);
    expect(kv.datos.get('suscripcion:' + sub)).toBe(codigo);

    /* La factura de 0 € de la prueba trae su periodo: no lo mueve. */
    await manda(kv, evento('invoice.paid', { id: 'in_prueba1', object: 'invoice', amount_paid: 0, billing_reason: 'subscription_create',
      parent: { subscription_details: { subscription: sub } }, lines: { data: [{ period: { start: ayer, end: ayer + 7 * 24 * 3600 } }] } }, { created: ayer }));
    expect(datosDe(kv, 'suscripcion:' + sub).trialEnd).toBe(ayer * 1000 + 7 * DIA);
  });

  test('la mensual pagada al alta vale su mes y tres días, no la prueba', async () => {
    const kv = almacen();
    await manda(kv, ALTA);
    const d = datosDe(kv, 'sesion:' + SESION);
    expect(d.trialEnd, 'sin prueba no hay fin de prueba').toBeUndefined();
    const dias = (d.expiresAt - S * 1000) / DIA;
    expect(dias, 'la mensual pagada valía lo de la prueba').toBeGreaterThanOrEqual(28 + 3);
    expect(dias).toBeLessThanOrEqual(31 + 3 + 0.01);
  });
});

test.describe('A6 · solo las compras de PACE dan código', () => {
  test('una compra de otro enlace de pago, o sin enlace, no da nada, y las facturas de esa suscripción tampoco', async () => {
    const kv = almacen();
    const ahora = Math.floor(Date.now() / 1000);
    const otraVida = evento('checkout.session.completed', { id: 'cs_test_otra1A2b3C4d5E6f', object: 'checkout.session', mode: 'payment',
      payment_status: 'paid', payment_link: 'plink_1OtraCosa000009' });
    const sinEnlace = evento('checkout.session.completed', { id: 'cs_test_suelta1A2b3C4d5E', object: 'checkout.session', mode: 'payment',
      payment_status: 'paid', payment_link: null });
    const otraMes = evento('checkout.session.completed', { id: 'cs_test_otraMes1A2b3C4d', object: 'checkout.session', mode: 'subscription',
      payment_status: 'paid', subscription: 'sub_1OtraAbCdEf', payment_link: 'plink_1OtraCosa000009' });
    const suFactura = evento('invoice.paid', { id: 'in_otra1', object: 'invoice', amount_paid: 500, billing_reason: 'subscription_cycle',
      parent: { subscription_details: { subscription: 'sub_1OtraAbCdEf' } }, lines: { data: [{ period: { start: ahora, end: ahora + 30 * 24 * 3600 } }] } });
    for (const ev of [otraVida, sinEnlace, otraMes, suFactura]) {
      expect(await manda(kv, ev), ev.data.object.id).toEqual({ ok: true, codigo: false });
    }
    expect([...kv.datos.keys()], 'una compra que no es de PACE dejó un código').toEqual([]);

    /* Los cuatro enlaces de PACE sí: los dos del modo de prueba y los dos de verdad. */
    for (const [i, enlace] of [ENLACE.vida, ENLACE.vidaReal, ENLACE.mes, ENLACE.mesReal].entries()) {
      const mensual = enlace === ENLACE.mes || enlace === ENLACE.mesReal;
      const ev = evento('checkout.session.completed', Object.assign({ id: 'cs_test_pace' + i + 'A2b3C4d5E6f', object: 'checkout.session',
        payment_status: mensual ? 'no_payment_required' : 'paid', payment_link: enlace },
      mensual ? { mode: 'subscription', subscription: 'sub_1Pace' + i + 'AbCd' } : { mode: 'payment' }));
      expect(await manda(kv, ev), enlace).toEqual({ ok: true, codigo: true });
    }
  });

  test('si en Cloudflare no hay ningún enlace de PACE (o se pegó la dirección del enlace), está apagada', async () => {
    const vida = evento('checkout.session.completed', { id: 'cs_test_vida9A2b3C4d5E6f', object: 'checkout.session', mode: 'payment',
      payment_status: 'paid', payment_link: ENLACE.vida });
    for (const valor of ['', 'https://buy.stripe.com/3cIcN6bVR8oK81IbMJ6wE00']) {
      const kv = almacen();
      const r = await stripe.onRequestPost({ request: aviso(vida), env: env(kv, { PACE_ENLACES_STRIPE: valor }) });
      expect(r.status, JSON.stringify(valor)).toBe(503);
      expect(kv.datos.size).toBe(0);
    }
  });
});

test.describe('A7 · el modo de prueba de Stripe no da nada para siempre', () => {
  test('una compra de prueba da un código de pocos días, de por vida o mensual, y su renovación también', async () => {
    const kv = almacen();
    const vida = evento('checkout.session.completed', { id: 'cs_test_modo1A2b3C4d5E6f', object: 'checkout.session', mode: 'payment',
      payment_status: 'paid', payment_link: ENLACE.vida }, { livemode: false });
    expect(await manda(kv, vida)).toEqual({ ok: true, codigo: true });
    const d = datosDe(kv, 'sesion:cs_test_modo1A2b3C4d5E6f');
    expect(d.type).toBe('lifetime');
    expect(d.expiresAt, 'una compra de prueba abrió PACE completo para siempre').toBeLessThanOrEqual(vida.created * 1000 + 3 * DIA);
    expect(d.expiresAt).toBeGreaterThan(Date.now());

    const sub = 'sub_1ModoPruebaAb';
    const alta = evento('checkout.session.completed', { id: 'cs_test_modo2A2b3C4d5E6f', object: 'checkout.session', mode: 'subscription',
      payment_status: 'paid', subscription: sub, payment_link: ENLACE.mes }, { livemode: false });
    await manda(kv, alta);
    expect(datosDe(kv, 'suscripcion:' + sub).expiresAt).toBeLessThanOrEqual(alta.created * 1000 + 3 * DIA);
    const ahora = Math.floor(Date.now() / 1000);
    const renueva = evento('invoice.paid', { id: 'in_modo1', object: 'invoice', amount_paid: 299, billing_reason: 'subscription_cycle',
      parent: { subscription_details: { subscription: sub } }, lines: { data: [{ period: { start: ahora, end: ahora + 30 * 24 * 3600 } }] } }, { livemode: false });
    await manda(kv, renueva);
    expect(datosDe(kv, 'suscripcion:' + sub).expiresAt, 'la renovación de prueba vale el mes').toBeLessThanOrEqual(renueva.created * 1000 + 3 * DIA);

    /* La misma compra en el modo de verdad sí es para siempre. */
    await manda(kv, evento('checkout.session.completed', { id: 'cs_live_modo3A2b3C4d5E6f', object: 'checkout.session', mode: 'payment',
      payment_status: 'paid', payment_link: ENLACE.vidaReal }));
    expect(datosDe(kv, 'sesion:cs_live_modo3A2b3C4d5E6f').expiresAt).toBeUndefined();
  });
});
