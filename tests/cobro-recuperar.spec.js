/* PACE · E2E · /api/recuperar: EL CÓDIGO DE UNA COMPRA, OTRA VEZ (punto 12 del ROADMAP)
 * =====================================================================================
 * Ez, 15 oct. 2026 («Cómo se cobra PACE completo», punto 2): con el correo de la compra y el número
 * del recibo, la función busca la compra en Stripe en ese momento y vuelve a dar el código, sin
 * guardar nada. Sin cuenta de Stripe todavía: el Stripe de estas pruebas es falso y contesta como
 * su API (listas de Checkout Sessions por correo y de facturas por suscripción), y la llave k2 se
 * crea en cada pasada. En Node, como tests/cobro-venta.spec.js (lo común, en cobro.helpers.js).
 *
 * QUE DEFIENDE:
 *  · Apagada sin las cuatro piezas de Ez; solo desde la propia web; formatos y tamaños.
 *  · La de por vida vuelve a firmarse con k2 y su pedido; la mensual da el último código de su
 *    suscripción (el de /api/renovar), por el número de la primera factura o de una renovación.
 *  · El número se compara sin «#», espacios ni guiones, y el correo sin mayúsculas.
 *  · Sin compra con ese correo y ese número, lo mismo exista o no el correo; devuelta o terminada,
 *    lo dice; Stripe caído, 502. No escribe nada en `VENTAS`.
 *  · Diez intentos por hora desde una conexión; el undécimo, 429.
 *  · Lo de la revisión de ChatGPT del 28 oct. que también toca aquí: solo las compras de los enlaces
 *    de PACE (A6), «terminada» solo con la marca de la baja (A3) y una compra del modo de prueba de
 *    Stripe con un código de pocos días (A7). Esas tres caen contra la 0.185.0.
 * Contra v0.184.0 caen todas: no hay /api/recuperar.
 */
'use strict';

const crypto = require('crypto');
const { test, expect } = require('@playwright/test');
const { importar, DIA, ENLACE, almacen, env: envCobro, leerCodigo } = require('./cobro.helpers');

const LLAVE = 'rk_test_' + crypto.randomBytes(12).toString('hex');
const env = (kv) => envCobro(kv, { STRIPE_LECTURA: LLAVE });

/* Lo que tiene la cuenta de Stripe de estas pruebas. */
const cobro = (id, numero, extra) => ({ id: 'pi_' + id, latest_charge: Object.assign({ id: 'ch_' + id, receipt_number: numero, refunded: false, disputed: false }, extra) });
const POR_VIDA = { id: 'cs_test_vida1A2b3C4d5E6f', object: 'checkout.session', livemode: true, mode: 'payment', payment_status: 'paid', status: 'complete',
  payment_link: ENLACE.vidaReal, customer_details: { email: 'Quien@Compra.es' }, invoice: null, payment_intent: cobro(1, '1653-2453') };
const DEVUELTA = { id: 'cs_test_devu1A2b3C4d5E6f', object: 'checkout.session', livemode: true, mode: 'payment', payment_status: 'paid', status: 'complete',
  payment_link: ENLACE.vidaReal, customer_details: { email: 'otra@compra.es' }, invoice: null, payment_intent: cobro(2, '2001-0002', { refunded: true }) };
const MENSUAL = { id: 'cs_test_mes1A2b3C4d5E6f7', object: 'checkout.session', livemode: true, mode: 'subscription', payment_status: 'no_payment_required',
  status: 'complete', subscription: 'sub_1AbCdEf', payment_link: ENLACE.mesReal, customer_details: { email: 'mes@compra.es' },
  invoice: { id: 'in_1', number: 'A1B2C3D4-0001', receipt_number: null }, payment_intent: null };
/* Una compra de la misma cuenta que no es PACE (A6) y una del modo de prueba de Stripe (A7). */
const OTRA_COSA = { id: 'cs_test_otro1A2b3C4d5E6f', object: 'checkout.session', livemode: true, mode: 'payment', payment_status: 'paid', status: 'complete',
  payment_link: 'plink_1OtraCosa000009', customer_details: { email: 'otro@compra.es' }, invoice: null, payment_intent: cobro(4, '4004-0004') };
const DE_PRUEBA = { id: 'cs_test_prue1A2b3C4d5E6f', object: 'checkout.session', livemode: false, mode: 'payment', payment_status: 'paid', status: 'complete',
  payment_link: ENLACE.vida, customer_details: { email: 'prueba@compra.es' }, invoice: null, payment_intent: cobro(5, '5005-0005') };
const STRIPE = {
  sesiones: { 'quien@compra.es': [POR_VIDA], 'Quien@Compra.es': [POR_VIDA], 'otra@compra.es': [DEVUELTA], 'mes@compra.es': [MENSUAL],
    'otro@compra.es': [OTRA_COSA], 'prueba@compra.es': [DE_PRUEBA] },
  facturas: { sub_1AbCdEf: [{ id: 'in_1', number: 'A1B2C3D4-0001' }, { id: 'in_2', number: 'A1B2C3D4-0002', receipt_number: '3002-7781' }] },
};

/* Un Stripe falso en `fetch`, que apunta lo que se le pide. */
function conStripe(cuenta, falla) {
  const pedidas = [];
  globalThis.fetch = async (url, opciones) => {
    pedidas.push({ url: String(url), auth: opciones && opciones.headers && opciones.headers.Authorization });
    if (falla) throw new Error('sin red');
    const u = new URL(url);
    if (u.origin !== 'https://api.stripe.com') return new Response('{}', { status: 404 });
    if (u.pathname === '/v1/checkout/sessions') {
      const lista = cuenta.sesiones[u.searchParams.get('customer_details[email]')] || [];
      return new Response(JSON.stringify({ object: 'list', data: lista, has_more: false }), { status: 200 });
    }
    if (u.pathname === '/v1/invoices') {
      return new Response(JSON.stringify({ object: 'list', data: cuenta.facturas[u.searchParams.get('subscription')] || [], has_more: false }), { status: 200 });
    }
    return new Response('{}', { status: 404 });
  };
  return pedidas;
}

const pedir = (cuerpo, cabeceras) => new Request('https://pacegrass.app/api/recuperar', { method: 'POST',
  body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo), headers: Object.assign({ 'Content-Type': 'application/json' }, cabeceras || {}) });

test.describe('/api/recuperar', () => {
  let recuperar, fetchDeVerdad;
  test.beforeAll(async () => { recuperar = await importar('functions/api/recuperar.js'); fetchDeVerdad = globalThis.fetch; });
  test.afterEach(() => { globalThis.fetch = fetchDeVerdad; delete globalThis.caches; });

  test('sin las cuatro piezas de Ez está apagada, y solo contesta a la propia web', async () => {
    conStripe(STRIPE);
    for (const falta of ['STRIPE_LECTURA', 'PACE_K2_PRIVADA', 'VENTAS', 'PACE_ENLACES_STRIPE']) {
      const e = env();
      delete e[falta];
      expect((await recuperar.onRequestPost({ request: pedir({ correo: 'quien@compra.es', recibo: '1653-2453' }), env: e })).status, falta).toBe(503);
    }
    const fuera = await recuperar.onRequestPost({ request: pedir({ correo: 'quien@compra.es', recibo: '1653-2453' }, { Origin: 'https://otra.web' }), env: env() });
    expect(fuera.status).toBe(403);
    for (const malo of [{ correo: 'no-es-correo', recibo: '1653-2453' }, { correo: 'quien@compra.es', recibo: '' }, { correo: 'quien@compra.es', recibo: '<script>' }]) {
      expect((await recuperar.onRequestPost({ request: pedir(malo), env: env() })).status).toBe(400);
    }
    expect((await recuperar.onRequestPost({ request: pedir('{"correo":"' + 'x'.repeat(3000) + '"}'), env: env() })).status).toBe(413);
  });

  test('la de por vida: la busca en Stripe con la llave de lectura y la vuelve a firmar con k2 y su pedido', async () => {
    const pedidas = conStripe(STRIPE);
    const kv = almacen();
    const r = await recuperar.onRequestPost({ request: pedir({ correo: '  Quien@Compra.es ', recibo: '#1653 2453' }), env: env(kv) });
    expect(r.status).toBe(200);
    expect(r.headers.get('Cache-Control')).toBe('no-store');
    const { codigo } = await r.json();
    const c = leerCodigo(codigo);
    expect(c.vale, 'la firma con k2 no vale').toBe(true);
    expect(c.datos).toEqual({ type: 'lifetime', keyId: 'k2', issuedAt: new Date().toISOString().slice(0, 10), order: 'cs_test_vida1A2b3C4d5E6f' });
    expect(pedidas.length).toBeGreaterThan(0);
    expect(pedidas.every((p) => p.auth === 'Bearer ' + LLAVE)).toBe(true);
    expect(pedidas[0].url).toContain('customer_details[email]=Quien%40Compra.es');
    /* Nada guardado. */
    expect(kv.datos.size).toBe(0);
  });

  test('la mensual: el último código de su suscripción, por la primera factura o por una renovación', async () => {
    conStripe(STRIPE);
    const kv = almacen({ 'suscripcion:sub_1AbCdEf': 'PACE1.ultimo.codigo' });
    /* El correo con mayúsculas también la encuentra: Stripe lo guarda como se escribió al pagar. */
    for (const [correo, recibo] of [['mes@compra.es', 'A1B2C3D4-0001'], ['Mes@Compra.es', 'a1b2c3d4 0002'], ['mes@compra.es', '3002-7781']]) {
      const r = await recuperar.onRequestPost({ request: pedir({ correo, recibo }), env: env(kv) });
      expect(r.status, recibo).toBe(200);
      expect(await r.json()).toEqual({ ok: true, codigo: 'PACE1.ultimo.codigo' });
    }
    expect(kv.datos.size).toBe(1);
    /* Si la mensual ya terminó (/api/stripe dejó la marca de su baja), no hay código nuevo. */
    const r = await recuperar.onRequestPost({ request: pedir({ correo: 'mes@compra.es', recibo: 'A1B2C3D4-0001' }), env: env(almacen({ 'baja:sub_1AbCdEf': '1761600000' })) });
    expect(r.status).toBe(410);
    expect((await r.json()).motivo).toBe('terminada');
  });

  test('A3 · la mensual sin su código guardado y sin baja no dice «terminada»: dice que aún no se puede', async () => {
    conStripe(STRIPE);
    const r = await recuperar.onRequestPost({ request: pedir({ correo: 'mes@compra.es', recibo: 'A1B2C3D4-0001' }), env: env(almacen()) });
    expect(r.status, 'dijo que la suscripción había terminado sin la marca de la baja').toBe(503);
    expect(await r.json()).toEqual({ ok: false, motivo: 'pendiente' });
  });

  test('sin compra con ese correo y ese número, lo mismo exista o no el correo; devuelta, lo dice; Stripe caído, 502', async () => {
    conStripe(STRIPE);
    const mal = await recuperar.onRequestPost({ request: pedir({ correo: 'quien@compra.es', recibo: '9999-9999' }), env: env() });
    const nadie = await recuperar.onRequestPost({ request: pedir({ correo: 'nadie@nada.es', recibo: '1653-2453' }), env: env() });
    expect([mal.status, nadie.status]).toEqual([404, 404]);
    expect(await mal.json()).toEqual(await nadie.json());
    const devuelta = await recuperar.onRequestPost({ request: pedir({ correo: 'otra@compra.es', recibo: '2001-0002' }), env: env() });
    expect(devuelta.status).toBe(410);
    expect((await devuelta.json()).motivo).toBe('devuelta');
    conStripe(STRIPE, true);
    expect((await recuperar.onRequestPost({ request: pedir({ correo: 'quien@compra.es', recibo: '1653-2453' }), env: env() })).status).toBe(502);
  });

  test('A6 · una compra de la misma cuenta que no es de PACE no da código', async () => {
    conStripe(STRIPE);
    const kv = almacen();
    const r = await recuperar.onRequestPost({ request: pedir({ correo: 'otro@compra.es', recibo: '4004-0004' }), env: env(kv) });
    expect(r.status, 'una compra de otro enlace de pago dio un código de PACE').toBe(404);
    expect(await r.json()).toEqual({ ok: false, motivo: 'no' });
    expect(kv.datos.size).toBe(0);
  });

  test('A7 · una compra del modo de prueba de Stripe da un código de pocos días', async () => {
    conStripe(STRIPE);
    const r = await recuperar.onRequestPost({ request: pedir({ correo: 'prueba@compra.es', recibo: '5005-0005' }), env: env() });
    expect(r.status).toBe(200);
    const c = leerCodigo((await r.json()).codigo);
    expect(c.vale).toBe(true);
    expect(c.datos.type).toBe('lifetime');
    expect(c.datos.expiresAt, 'una compra de prueba dio PACE completo para siempre').toBeLessThanOrEqual(Date.now() + 3 * DIA);
    expect(c.datos.expiresAt).toBeGreaterThan(Date.now());
  });

  test('diez intentos por hora desde una conexión; el undécimo espera', async () => {
    conStripe(STRIPE);
    const cache = new Map();
    globalThis.caches = { default: {
      match: async (req) => (cache.has(req.url) ? new Response(cache.get(req.url)) : undefined),
      put: async (req, res) => { cache.set(req.url, await res.text()); },
    } };
    const ip = { 'CF-Connecting-IP': '203.0.113.7' };
    for (let i = 0; i < 10; i++) {
      expect((await recuperar.onRequestPost({ request: pedir({ correo: 'quien@compra.es', recibo: '9999-000' + i }, ip), env: env() })).status).toBe(404);
    }
    const once = await recuperar.onRequestPost({ request: pedir({ correo: 'quien@compra.es', recibo: '1653-2453' }, ip), env: env() });
    expect(once.status).toBe(429);
    expect(once.headers.get('Retry-After')).toBe('3600');
    /* La IP no se guarda: solo una huella. */
    expect([...cache.keys()].join(' ')).not.toContain('203.0.113.7');
    /* Otra conexión sigue entrando. */
    expect((await recuperar.onRequestPost({ request: pedir({ correo: 'quien@compra.es', recibo: '1653-2453' }, { 'CF-Connecting-IP': '198.51.100.2' }), env: env() })).status).toBe(200);
  });
});
