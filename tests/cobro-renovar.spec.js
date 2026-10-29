/* PACE · E2E · LA MENSUAL SE RENUEVA SOLA, Y SIN RED SIGUE
 * =========================================================
 * El código de la mensual caduca al final del periodo pagado y tres días más. Desde tres
 * días y medio antes, la app de la web pide el nuevo a /api/renovar (state-licencia.js).
 * Aquí la función la hace `page.route`: el servidor de la suite no ejecuta funciones. La
 * llave es la de prueba (tests/licencia.helpers.js); la app no mira qué llave firmó.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { firmar, conLlaveDePrueba } = require('./licencia.helpers');

test.use({ serviceWorkers: 'block' });

const DIA = 24 * 3600 * 1000;
const mensual = (dias) => firmar({ type: 'monthly', order: 'sub_1AbCdEf', expiresAt: Date.now() + dias * DIA });
const estado = (page) => page.evaluate(() => { const e = window.paceLicenciaEstado(); return { estado: e.estado, motivo: e.motivo }; });

async function abrir(page, context, codigo, contesta) {
  await conLlaveDePrueba(context);
  const pedidos = [];
  await context.route('**/api/renovar', async (route) => {
    pedidos.push(JSON.parse(route.request().postData() || '{}'));
    await contesta(route);
  });
  await sembrar(context, { licencia: codigo });
  await irAlArtefacto(page);
  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
  return pedidos;
}

test('a dos días de caducar pide el nuevo, lo canjea y sigue abierto', async ({ page, context }) => {
  const viejo = mensual(2), nuevo = mensual(33);
  const pedidos = await abrir(page, context, viejo, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, codigo: nuevo }) }));
  await expect.poll(() => page.evaluate(() => window.getState().licencia)).toBe(nuevo);
  expect(pedidos).toEqual([{ codigo: viejo }]);
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
  expect(await estado(page)).toEqual({ estado: 'vigente', motivo: null });
});

test('lejos de caducar no pregunta a nadie', async ({ page, context }) => {
  const pedidos = await abrir(page, context, mensual(20), (r) => r.abort());
  await page.waitForTimeout(500);
  expect(pedidos).toEqual([]);
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
});

test('sin red sigue abierto hasta su fecha; caducado, dice «sin red», no «terminada»', async ({ page, context }) => {
  await abrir(page, context, mensual(1), (r) => r.abort('internetdisconnected'));
  await expect.poll(() => page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
  expect((await estado(page)).estado).toBe('vigente');

  /* El mismo código, ya caducado, y sin red. */
  await page.evaluate((c) => window.setState({ licencia: c }), mensual(-1));
  await page.evaluate(() => window.paceLicenciaRenovar(true));
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(false);
  expect(await estado(page)).toEqual({ estado: 'caducado', motivo: 'sin-red' });
});

test('si la suscripción ya no sigue, caducado dice «terminada»', async ({ page, context }) => {
  await abrir(page, context, mensual(-1), (r) => r.fulfill({ status: 410, contentType: 'application/json', body: '{"ok":false,"terminada":true}' }));
  await expect.poll(() => estado(page)).toEqual({ estado: 'caducado', motivo: 'terminada' });
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(false);
});

/* A3 (revisión de ChatGPT del 28 oct.): «terminada» es solo la marca de la baja. Si la web aún no
   tiene el código nuevo, contesta «pendiente»: para la app es como no tener red, y vuelve a pedirlo. */
test('A3 · «pendiente» es «sin red», no «terminada», y lo vuelve a pedir', async ({ page, context }) => {
  const viejo = mensual(-1), nuevo = mensual(30);
  let listo = false;
  const pedidos = await abrir(page, context, viejo, (r) => (listo
    ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, codigo: nuevo }) })
    : r.fulfill({ status: 404, contentType: 'application/json', body: '{"ok":false,"pendiente":true}' })));
  await expect.poll(() => pedidos.length).toBe(1);
  expect(await page.evaluate(() => window.paceLicenciaRenovar(true))).toBe('sin-red');
  expect(await estado(page)).toEqual({ estado: 'caducado', motivo: 'sin-red' });
  listo = true;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect.poll(() => page.evaluate(() => window.getState().licencia)).toBe(nuevo);
  expect(await estado(page)).toEqual({ estado: 'vigente', motivo: null });
});

/* A4 (revisión de ChatGPT del 28 oct.): al abrir PACE desde /gracias con una de por vida, la app
   canjea el enlace y renueva la mensual a la vez. La respuesta de la renovación que llega después
   no puede pisar lo que entró mientras tanto. */
test('A4 · si mientras renueva entra una de por vida, la respuesta que llega tarde no la pisa', async ({ page, context }) => {
  const viejo = mensual(2), nuevo = mensual(33);
  const vida = firmar({ order: 'cs_test_vida1A2b3C4d5E6f' });
  let soltar;
  const suelta = new Promise((r) => { soltar = r; });
  const pedidos = await abrir(page, context, viejo, async (r) => {
    await suelta;
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, codigo: nuevo }) });
  });
  await expect.poll(() => pedidos.length).toBe(1);
  /* La renovación del arranque espera su respuesta; esta es su promesa. */
  await page.evaluate(() => { window.__renovando = window.paceLicenciaRenovar(true); });
  expect(await page.evaluate((c) => window.paceLicenciaCanjear(c).then((r) => r.ok), vida)).toBe(true);
  soltar();
  await page.evaluate(() => window.__renovando);
  expect(await page.evaluate(() => window.getState().licencia), 'la mensual renovada pisó la de por vida').toBe(vida);
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
  expect(await page.evaluate(() => window.paceLicenciaEstado().datos.expiresAt)).toBeUndefined();
});

test('un código de otra suscripción no se canjea en la renovación', async ({ page, context }) => {
  const viejo = mensual(2);
  const ajeno = firmar({ type: 'monthly', order: 'sub_OTRA99', expiresAt: Date.now() + 40 * DIA });
  await abrir(page, context, viejo, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, codigo: ajeno }) }));
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.getState().licencia)).toBe(viejo);
});

test('en Ajustes, la mensual dice hasta cuándo, no «Para siempre»', async ({ page, context }) => {
  await abrir(page, context, mensual(20), (r) => r.abort());
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await expect(page.locator('[data-pace-licencia-estado]')).toHaveText(/^Hasta el /);
});
