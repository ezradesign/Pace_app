/* PACE · E2E · LA VOZ GUARDADA SIGUE TRAS UNA VERSIÓN NUEVA (caza de datos del 22 nov. 2026)
 * ==========================================================================================
 * La voz de Mueve y Estira no va al precache (Ez, 6A del 21 nov.): se guarda en la caché de la
 * versión la primera vez que suena, y desde ahí habla sin conexión. Al activar la versión siguiente,
 * `activate` borraba la caché vieja entera, voz incluida: quien actualizaba en casa y abría una
 * rutina en el tren la oía con madera. Ahora la versión nueva vuelve a pedir a la red lo que la vieja
 * tenía guardado al usarlo (sw.js, `pedirOtraVezLoGuardadoAlUsar`).
 *
 * LA VERSIÓN NUEVA SE SIRVE TAMBIÉN EN `sw.js`, como tras publicar. Si `sw.js` seguía dando la de
 * antes, la prueba fallaba con carga: al activarse la nueva, la página recarga (`controllerchange`,
 * PACE.html), la app vuelve a registrar `sw.js` en el `load`, eso reinstalaba la versión de antes, la
 * página la tomaba por la suya (ACTIVAR_SI_SOLA) y su `activate` borraba la caché nueva. En la vida
 * real no pasa: publicada la nueva, `sw.js` ya no da la de antes.
 * En main cae: tras activar, la voz no está en ninguna caché y sin red no llega.
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
  await irAlArtefacto(page);
  for (let i = 0; i < 4 && !(await page.evaluate(() => !!navigator.serviceWorker.controller)); i++) {
    await page.waitForTimeout(1000);
    await irAlArtefacto(page);
  }
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller), 'GUARD: la página no quedó controlada').toBe(true);

  /* La voz suena una vez con red: queda en la caché de esta versión. */
  await page.evaluate((voz) => fetch(voz).then((r) => r.arrayBuffer()), VOZ);
  await esperarEnPagina(page, async (voz) => !!(await caches.match(voz)), VOZ, { timeout: 10_000 });

  /* Sale la versión nueva. Desde aquí el servidor da la nueva en `sw.js`, como tras publicar, y la
     prueba la registra con otra dirección para que el navegador la instale ya (lo que hace «Actualizar»
     es el SKIP_WAITING). */
  const src = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8').replace(/const CACHE_NAME = '[^']+'/, "const CACHE_NAME = '" + NUEVA + "'");
  await context.route(/\/sw\.js(\?.*)?$/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: src }));
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.register('sw.js?nueva=1');
    await new Promise((ok) => { const mira = () => (reg.waiting ? ok() : setTimeout(mira, 100)); mira(); });
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  });
  await esperarEnPagina(page, async (n) => { const k = await caches.keys(); return k.length === 1 && k[0] === n; }, NUEVA, { timeout: 20_000 });

  await expect.poll(() => page.evaluate(([voz, n]) => caches.open(n).then((c) => c.match(voz)).then((r) => !!r), [VOZ, NUEVA]),
    { message: 'la voz guardada no pasó a la caché de la versión nueva', timeout: 10_000 }).toBe(true);
  await context.setOffline(true);
  const sinRed = await esperarSinRed(page);
  expect(sinRed, 'sin conexión, la voz no llega').toBe(200);
});

/* La página recarga al activarse la versión nueva: se pide la voz cuando ya ha vuelto. */
async function esperarSinRed(page) {
  let r = null;
  await esperarEnPagina(page, async (voz) => { window.__vozSinRed = await fetch(voz).then((x) => x.status, () => 'sin respuesta'); return true; }, VOZ, { timeout: 10_000 });
  r = await page.evaluate(() => window.__vozSinRed);
  return r;
}
