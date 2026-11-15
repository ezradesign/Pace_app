/* PACE · E2E · CON UNA WIFI MALA, PACE NO SE QUEDA EN BLANCO (auditoría externa del 10 nov., 2.T2)
 * ================================================================================================
 * `sw.js` pedía la página a la red sin tope: la copia guardada solo salía si la red FALLABA. Con una
 * conexión que ni llega ni falla, PACE instalada se quedaba en blanco hasta que el navegador se
 * rendía. Ahora, si a los 3 s la red no ha contestado y hay copia, se da la copia; la respuesta de la
 * red se guarda cuando llega.
 * NO CUBRE: una red lenta de verdad en un móvil (aquí la red «no contesta» porque la prueba retiene la
 * petición del service worker).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test('red lenta · con la red que no contesta, la app abre con la copia guardada en unos 3 s', async ({ context, page }) => {
  test.setTimeout(60000);
  await sembrar(context);
  await irAlArtefacto(page);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  /* La red retiene la página 20 s: lo que tarda una wifi que ni llega ni falla. */
  let retenidas = 0;
  await context.route('**/index.html', async (route) => {
    retenidas++;
    await new Promise((r) => setTimeout(r, 20000));
    await route.continue().catch(() => {});
  });
  const t0 = Date.now();
  await page.goto('/index.html', { timeout: 30000 });
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible', timeout: 30000 });
  const tardo = Date.now() - t0;
  expect(retenidas, 'la prueba no retuvo la petición: no mide nada').toBeGreaterThan(0);
  expect(tardo, 'con la red sin contestar, PACE esperó a la red en vez de dar la copia').toBeLessThan(12000);
});
