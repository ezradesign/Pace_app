/* PACE · E2E · DOS AVISOS DE STRIPE A LA VEZ: LO QUE QUEDA NO DEPENDE DE CUÁL ESCRIBE EL ÚLTIMO
 * =============================================================================================
 * Revisión de ChatGPT del 5 nov. 2026 (docs/audits/chatgpt-5nov/revision-5nov.md, `guardar()`),
 * comprobada por la coordinadora: /api/stripe leía `suscripcion:<id>`, comparaba y escribía, sin
 * nada atómico (KV no tiene transacciones). Un aviso repetido escribe lo mismo, pero dos
 * renovaciones DISTINTAS de una mensual que llegan a la vez (la de un mes que Stripe reintenta tarde
 * y la del mes siguiente) leían lo mismo, y si la más corta escribía la última se quedaba guardada:
 * /api/renovar daba un código que acaba un mes antes de lo pagado. Las de cobro-avisos mandan los
 * avisos uno detrás de otro y no lo veían; aquí van solapados con `aLaVez` (cobro.helpers.js).
 * Calibrada en rojo contra la 0.191.1: cae la primera, con la renovación más corta.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { importar, DIA, ENLACE, almacen, aLaVez, env, evento, aviso, leerCodigo, mesDespues } = require('./cobro.helpers');

/* Una mensual pagada al momento hace una hora (`S`, en segundos, como Stripe), la renovación de su
   segundo mes y la del tercero: dos periodos distintos, que acaban en `MES2` y en `MES3`. */
const SUB = 'sub_1ALaVezAbCdEf';
const SESION = 'cs_test_aLaVez1A2b3C4d5E6f';
const S = Math.floor(Date.now() / 1000) - 3600;
const MES1 = mesDespues(S), MES2 = mesDespues(MES1), MES3 = mesDespues(MES2);
const ALTA = evento('checkout.session.completed', { id: SESION, object: 'checkout.session', mode: 'subscription', payment_status: 'paid',
  subscription: SUB, payment_link: ENLACE.mes, invoice: 'in_vez1' }, { created: S + 1 });
const factura = (id, inicio, fin) => evento('invoice.paid', { id, object: 'invoice', amount_paid: 299, billing_reason: 'subscription_cycle',
  parent: { subscription_details: { subscription: SUB } }, lines: { data: [{ period: { start: inicio, end: fin } }] } }, { created: inicio + 2 });
const CORTA = factura('in_vez2', MES1, MES2);
const LARGA = factura('in_vez3', MES2, MES3);
const BAJA = evento('customer.subscription.deleted', { id: SUB, object: 'subscription', status: 'canceled' });

let stripe, renovar;
test.beforeAll(async () => {
  stripe = await importar('functions/api/stripe.js');
  renovar = await importar('functions/api/renovar.js');
});

const manda = async (kv, ev) => (await stripe.onRequestPost({ request: aviso(ev), env: env(kv) })).json();
const pideRenovar = (kv, codigo) => renovar.onRequestPost({ request: new Request('https://pacegrass.app/api/renovar',
  { method: 'POST', body: JSON.stringify({ codigo }) }), env: env(kv) });
const nombre = (ev) => (ev === CORTA ? 'la renovación corta' : ev === LARGA ? 'la larga' : 'la baja');

/* Lo que da /api/renovar a quien trae el código del alta: el estado y, si hay, la fecha del código. */
async function renueva(kv) {
  const r = await pideRenovar(kv, kv.datos.get('sesion:' + SESION));
  const cuerpo = await r.json();
  if (!cuerpo.codigo) return { estado: r.status, cuerpo };
  const c = leerCodigo(cuerpo.codigo);
  expect(c.vale, 'el código de la renovación no lo firmó k2').toBe(true);
  return { estado: r.status, expiresAt: c.datos.expiresAt, order: c.datos.order };
}

test('dos renovaciones distintas a la vez: escriba la que escriba la última, renovar da la que más dura', async () => {
  for (const [ultima, otra] of [[CORTA, LARGA], [LARGA, CORTA]]) {
    const como = 'leen las dos y escribe la última ' + nombre(ultima);
    const kv = almacen();
    await manda(kv, ALTA);
    const [ra, rb] = await aLaVez(kv, (v) => manda(v, ultima), (v) => manda(v, otra));
    expect([ra, rb], como).toEqual([{ ok: true, codigo: true }, { ok: true, codigo: true }]);
    expect(await renueva(kv), como + ': se quedó guardado el mes de antes').toEqual({ estado: 200, expiresAt: MES3 * 1000 + 3 * DIA, order: SUB });

    /* Repetir los dos avisos, uno detrás de otro o a la vez, no cambia nada. */
    const antes = new Map(kv.datos);
    for (const ev of [CORTA, LARGA, ALTA]) expect(await manda(kv, ev), como + ': ' + nombre(ev) + ' repetida').toEqual({ ok: true, codigo: true });
    await aLaVez(kv, (v) => manda(v, ultima), (v) => manda(v, otra));
    expect(kv.datos, como + ': un aviso repetido cambió lo guardado').toEqual(antes);
  }
});

test('una baja a la vez que una renovación: en los dos órdenes, renovar dice «terminada»', async () => {
  for (const [ultima, otra] of [[LARGA, BAJA], [BAJA, LARGA]]) {
    const kv = almacen();
    await manda(kv, ALTA);
    await aLaVez(kv, (v) => manda(v, ultima), (v) => manda(v, otra));
    expect(await renueva(kv), 'escribe la última ' + nombre(ultima)).toEqual({ estado: 410, cuerpo: { ok: false, terminada: true } });
    expect(await manda(kv, LARGA), 'una renovación después de la baja dio código').toEqual({ ok: true, codigo: false });
  }
});

/* Lo que ya está en `VENTAS` no se puede migrar: lo escribió la versión de antes, solo en
   `suscripcion:<id>`, y se tiene que seguir leyendo igual. */
test('lo que guardó la versión de antes se sigue leyendo, renovando y dando de baja', async () => {
  const nuevo = almacen();
  await manda(nuevo, ALTA);
  const kv = almacen({ ['sesion:' + SESION]: nuevo.datos.get('sesion:' + SESION), ['suscripcion:' + SUB]: nuevo.datos.get('suscripcion:' + SUB) });
  expect(await renueva(kv), 'el código del alta guardado antes').toEqual({ estado: 200, expiresAt: mesDespues(S + 1) * 1000 + 3 * DIA, order: SUB });
  expect(await manda(kv, LARGA)).toEqual({ ok: true, codigo: true });
  expect(await manda(kv, CORTA), 'una factura de una mensual guardada antes no se reconoció').toEqual({ ok: true, codigo: true });
  expect(await renueva(kv), 'la renovación corta que llega tarde pisó la larga').toEqual({ estado: 200, expiresAt: MES3 * 1000 + 3 * DIA, order: SUB });
  expect(await manda(kv, BAJA)).toEqual({ ok: true, codigo: false });
  expect(await renueva(kv)).toEqual({ estado: 410, cuerpo: { ok: false, terminada: true } });
  expect(kv.datos.get('ttl:baja:' + SUB), 'la marca de una mensual de PACE guardada antes caduca').toBeUndefined();
});
