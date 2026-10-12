/* PACE · E2E · varias pestañas, un solo estado (caza del 10 oct., estado-1, -2 y -3)
 * ===============================================================================
 * Cada pestaña llevaba su copia de `pace.state.v2` y la escribía ENTERA en cada gesto, así que la
 * que se abrió antes borraba lo hecho en la otra al tocar cualquier cosa. Medido en v0.154.0:
 * tres vasos en B y uno en A dejaban un vaso; «Borrar todo» en B y un vaso en A devolvían los
 * 500 minutos borrados; una copia importada en B se perdía con un vaso en A.
 *
 * Las tres primeras caen contra el `index.html` de v0.154.0. Las dos últimas son controles: que
 * una pestaña no adopte lo que no se puede leer y que adoptar no escriba (ni ping-pong).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, CLAVE_ESTADO } = require('./helpers');

const guardado = (page) => page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || 'null'), CLAVE_ESTADO);
const unVaso = (page) => page.locator('[data-pace-sidebar]').getByRole('button', { name: /Añadir un vaso/ }).click();

async function dosPestanas(context, extra) {
  await sembrar(context, extra);
  const a = await context.newPage();
  await irAlArtefacto(a);
  const b = await context.newPage();
  await irAlArtefacto(b);
  return { a, b };
}

test('estado-1 · los vasos de una pestaña no los borra la que se abrió antes', async ({ context }) => {
  const { a, b } = await dosPestanas(context);
  const errores = capturarErrores(a);
  await unVaso(b); await unVaso(b); await unVaso(b);
  await expect.poll(async () => (await guardado(b)).water.today).toBe(3);

  await a.bringToFront();
  /* La que lleva rato abierta ya enseña los tres de la otra, sin recargar. */
  await expect(a.locator('[data-pace-sidebar]')).toContainText('Tres vasos de ocho');
  await unVaso(a);
  expect((await guardado(a)).water.today, 'la pestaña vieja pisó los vasos de la otra').toBe(4);
  expect(errores).toEqual([]);
});

test('estado-2 · «Borrar todos mis datos» en una pestaña no lo resucita la otra', async ({ context }) => {
  const hoy = new Date().toDateString();
  const { a, b } = await dosPestanas(context, { totalFocusMin: 500, lastActiveDay: hoy,
    water: { goal: 8, today: 4, lastReset: hoy } });
  b.on('dialog', d => d.accept());
  await b.getByRole('button', { name: 'Abrir ajustes' }).click();
  const recarga = b.waitForEvent('load');
  await b.getByRole('button', { name: 'Borrar todos mis datos' }).click();
  await recarga;

  /* La otra pestaña adopta el borrado sin recargar... */
  await expect.poll(() => a.evaluate(() => getState().totalFocusMin)).toBe(0);
  /* ...y lo siguiente que escriba ya no lleva lo borrado. */
  await a.evaluate(() => addWaterGlass(1));
  const s = await guardado(a);
  expect(s.totalFocusMin, 'la otra pestaña devolvió los minutos borrados').toBe(0);
  expect(s.water.today).toBe(1);
});

test('estado-3 · una copia importada en una pestaña no la pisa la otra', async ({ context }) => {
  const { a, b } = await dosPestanas(context);
  b.on('dialog', d => d.accept());
  await b.getByRole('button', { name: 'Abrir ajustes' }).click();
  const recarga = b.waitForEvent('load');
  await b.locator('input[type="file"][accept="application/json,.json"]').setInputFiles({
    name: 'pace-backup-20261001.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'PACE', version: 'v0.154.0',
      state: { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, totalFocusMin: 4321 } })),
  });
  await recarga;
  await b.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  await a.bringToFront();
  await unVaso(a);
  expect((await guardado(a)).totalFocusMin, 'la otra pestaña pisó la copia importada').toBe(4321);
});

test('CONTROL · lo que no se puede leer no se adopta: la pestaña se queda con su copia y la vuelve a guardar', async ({ context }) => {
  const { a, b } = await dosPestanas(context, { totalFocusMin: 777 });
  await b.evaluate((clave) => localStorage.setItem(clave, '{"roto'), CLAVE_ESTADO);
  await b.evaluate((clave) => localStorage.setItem(clave, '[1,2,3]'), CLAVE_ESTADO);
  await a.waitForTimeout(300);
  expect(await a.evaluate(() => getState().totalFocusMin), 'adoptó el estado de fábrica').toBe(777);
  await unVaso(a);
  expect((await guardado(a)).totalFocusMin).toBe(777);
});

test('CONTROL · adoptar no escribe: un vaso en una pestaña es UNA escritura, no un ping-pong', async ({ context }) => {
  await context.addInitScript((clave) => {
    window.__escrituras = 0;
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (k === clave) window.__escrituras++; return orig.call(this, k, v); };
  }, CLAVE_ESTADO);
  const { a, b } = await dosPestanas(context);
  await a.waitForTimeout(500);
  const antesA = await a.evaluate(() => window.__escrituras);
  const antesB = await b.evaluate(() => window.__escrituras);
  await unVaso(b);
  await expect.poll(() => a.evaluate(() => getState().water.today)).toBe(1);
  await a.waitForTimeout(1500);
  expect(await a.evaluate(() => window.__escrituras) - antesA, 'la pestaña que adopta escribió').toBe(0);
  expect(await b.evaluate(() => window.__escrituras) - antesB, 'hubo ping-pong entre pestañas').toBeLessThanOrEqual(2);
});
