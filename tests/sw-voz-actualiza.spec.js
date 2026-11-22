/* PACE · E2E · LA VOZ GUARDADA SIGUE TRAS UNA VERSIÓN NUEVA (caza de datos del 22 nov. 2026)
 * ==========================================================================================
 * La voz de Mueve y Estira no va al precache (Ez, 6A del 21 nov.): se guarda en la caché de la
 * versión la primera vez que suena, y desde ahí habla sin conexión. Al activar la versión siguiente,
 * `activate` borraba la caché vieja entera, voz incluida: quien actualizaba en casa y abría una
 * rutina en el tren la oía con madera. Ahora la versión nueva vuelve a pedir a la red lo que la vieja
 * tenía guardado al usarlo (sw.js, `pedirOtraVezLoGuardadoAlUsar`).
 *
 * La versión nueva es el mismo sw.js con otro CACHE_NAME, servido con otra dirección. En main cae:
 * tras activar, la voz no está en ninguna caché y sin red no llega.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina } = require('./helpers');

const VOZ = '/app/move/voz/sulafat-es-numeros.mp3';
const NUEVA = 'pace-v9.9.9';

test('la voz de Mueve guardada al usarla se oye sin conexión también después de actualizar', async ({ page, context }) => {
  await sembrar(context);
  const src = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8').replace(/const CACHE_NAME = '[^']+'/, "const CACHE_NAME = '" + NUEVA + "'");
  await context.route('**/sw.js?nueva=1', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: src }));
  await irAlArtefacto(page);
  for (let i = 0; i < 4 && !(await page.evaluate(() => !!navigator.serviceWorker.controller)); i++) {
    await page.waitForTimeout(1000);
    await irAlArtefacto(page);
  }
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller), 'GUARD: la página no quedó controlada').toBe(true);

  /* La voz suena una vez con red: queda en la caché de esta versión. */
  await page.evaluate((voz) => fetch(voz).then((r) => r.arrayBuffer()), VOZ);
  await esperarEnPagina(page, async (voz) => !!(await caches.match(voz)), VOZ, { timeout: 10_000 });

  /* Llega la versión nueva y se activa (lo que hace «Actualizar»). */
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.register('sw.js?nueva=1');
    await new Promise((ok) => { const mira = () => (reg.waiting ? ok() : setTimeout(mira, 100)); mira(); });
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  });
  await esperarEnPagina(page, async (n) => { const k = await caches.keys(); return k.length === 1 && k[0] === n; }, NUEVA, { timeout: 20_000 });

  await expect.poll(() => page.evaluate((voz) => caches.match(voz).then((r) => !!r), VOZ),
    { message: 'la voz guardada no pasó a la caché de la versión nueva', timeout: 10_000 }).toBe(true);
  await context.setOffline(true);
  const sinRed = await page.evaluate((voz) => fetch(voz).then((r) => r.status, () => 'sin respuesta'), VOZ);
  expect(sinRed, 'sin conexión, la voz no llega').toBe(200);
});
