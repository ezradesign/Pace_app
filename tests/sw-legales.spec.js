/* PACE · E2E · sin red, cada página es la suya (auditoría del 21 oct. 2026, 6)
 * ===========================================================================
 * `sw.js` respondía a TODA navegación sin red y sin copia propia con la de `/`. `/privacy` y
 * `/safety` no estaban en el precache, así que sin red, desde Ajustes, se abría la app con la
 * dirección de la privacidad: una página legal que promete cosas y no se puede leer. Y cualquier
 * otra ruta de la web (/premium, una que no existe) se disfrazaba de app.
 *
 * Ahora las dos legales van en el precache y el respaldo a la app es solo para las rutas de la
 * app. Calibrada en rojo contra v0.174.0: caen las dos primeras. La tercera vigila que la app
 * siga abriendo sin red.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

/* Con el service worker activo, que es quien ha guardado el precache al instalarse. */
async function sinRed(context, page) {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await context.setOffline(true);
}

test('6 · sin red, /privacy y /safety abren su página, no la app', async ({ context, page }) => {
  await sinRed(context, page);
  await page.goto('/privacy');
  await expect(page, 'sin red, la privacidad abre la app').toHaveTitle('Privacidad · PACE');
  await expect(page.locator('h1').first()).toHaveText('Privacidad');
  await page.goto('/safety');
  await expect(page, 'sin red, la seguridad abre la app').toHaveTitle('Seguridad · PACE');
});

test('6 · sin red, una ruta que no es de la app no se disfraza de app', async ({ context, page }) => {
  await sinRed(context, page);
  for (const ruta of ['/premium/', '/beta/', '/no-existe']) {
    const r = await page.goto(ruta).catch(() => null);
    const html = r ? await r.text().catch(() => '') : '';
    expect(html, ruta + ' sin red sirvió la app').not.toContain('serviceWorker.register');
  }
});

/* Solo `/index.html`: en este servidor `/` es `PACE.html`, el de desarrollo, que sin red no monta
   (sus módulos no van en el precache). En pacegrass.app `/` es la app compilada. */
test('CONTROL · sin red, la app sigue abriendo', async ({ context, page }) => {
  await sinRed(context, page);
  await page.goto('/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
});
