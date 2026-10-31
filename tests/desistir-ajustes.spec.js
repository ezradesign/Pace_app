/* PACE · E2E · «DESISTIR DEL CONTRATO AQUÍ» EN AJUSTES (punto 16 del ROADMAP)
 * ========================================================================
 * Ez, 1A del 30 oct. 2026: quien compró PACE completo en la web tiene en Ajustes, debajo de PACE
 * completo, la fila que abre pacegrass.app/desistir. Un código de venta lleva el número del pedido
 * (`order`); el de un tester, no. Solo en la web: en Android y en el iPhone se compra y se devuelve
 * en su tienda. Como en cobro-montaje.spec.js, el código se firma con la llave de prueba.
 *
 * QUE DEFIENDE: con un código de venta (de por vida o al mes) sale la fila y abre /desistir/ sin
 * preguntar nada a ningún servidor; con el de un tester o sin código, no sale.
 * Contra 1c5fc44e caen las dos primeras: no hay fila.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, abrirTusDatos } = require('./helpers');
const { firmar, conLlaveDePrueba } = require('./licencia.helpers');

test.use({ serviceWorkers: 'block' });

const DIA = 24 * 3600 * 1000;

async function ajustes(page, context, codigo) {
  await conLlaveDePrueba(context);
  await context.route('**/api/renovar', (r) => r.abort());
  const pedidas = [];
  await context.route('**/api/desistir', (r) => { pedidas.push(r.request().url()); return r.abort(); });
  if (codigo) await sembrar(context, { licencia: codigo });
  await irAlArtefacto(page);
  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  return pedidas;
}

const fila = (page) => page.getByRole('button', { name: /Desistir del contrato aquí/ });

test('con un código de por vida comprado en la web, la fila abre /desistir/ sin preguntar a nadie', async ({ page, context }) => {
  const pedidas = await ajustes(page, context, firmar({ order: 'cs_live_a1B2c3D4' }));
  await expect(page.locator('[data-pace-licencia-estado]')).toHaveText('Para siempre');
  await expect(fila(page)).toBeVisible();
  await page.evaluate(() => { window.open = (u, d, o) => { window.__abierto = [u, d, o]; return null; }; });
  await fila(page).click();
  expect(await page.evaluate(() => window.__abierto)).toEqual(['/desistir/', '_blank', 'noopener']);
  expect(pedidas).toEqual([]);
});

test('con la mensual comprada en la web, también', async ({ page, context }) => {
  await ajustes(page, context, firmar({ type: 'monthly', order: 'sub_1AbCdEf', expiresAt: Date.now() + 9 * DIA }));
  await expect(page.locator('[data-pace-licencia-estado]')).toHaveText(/^Hasta el /);
  await expect(fila(page)).toBeVisible();
});

test('con el código de un tester, o sin código, no sale', async ({ page, context }) => {
  await ajustes(page, context, firmar({ tester: 3 }));
  await expect(page.locator('[data-pace-licencia-estado]')).toHaveText('Para siempre');
  await expect(fila(page)).toHaveCount(0);
});
