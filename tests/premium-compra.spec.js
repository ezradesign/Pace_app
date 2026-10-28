/* PACE · E2E · LA INVITACIÓN CON LOS BOTONES DE COMPRA Y «¿LO HAS PERDIDO?» (punto 12 del ROADMAP)
 * ==============================================================================================
 * Ez, 28 oct. 2026, sobre https://claude.ai/artifact/VDdAWeb8msGvckeGXxFjWV:
 *   3A · con la tienda del canal lista, la invitación acaba como la última pantalla de la
 *        bienvenida: los dos precios de la tienda en una frase, «Probar 7 días gratis» y «Ahora
 *        no» del mismo tamaño, el aviso de antes de cobrar y «Prefiero pagarlo una vez». Hasta
 *        entonces sigue como hoy, con «Llega con la versión 1».
 *   2A · debajo del campo del código, «¿Lo has perdido? Recupéralo con tu correo», que abre
 *        pacegrass.app/recuperar en otra pestaña. En Android no hay código y no sale.
 * La tienda de la web se abre poniendo sus dos enlaces de pago en `PACE_TIENDA_WEB.enlaces`,
 * como en compra-tienda.spec.js; lo de pago se cierra apagando `PREMIUM_ABIERTO_HASTA_V1`.
 * Contra v0.184.0 caen todas menos la de «sin tienda, como hoy» (el control).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');
const { firmar, conLlaveDePrueba } = require('./licencia.helpers');

test.use({ serviceWorkers: 'block' });

const HOJA = '[data-pace-premium-hoja]';

async function comoEnV1(page, conTienda) {
  await page.evaluate((tienda) => {
    window.PREMIUM_ABIERTO_HASTA_V1 = false;
    if (tienda) window.PACE_TIENDA_WEB.enlaces = { vida: '/index.html#tienda-vida', mes: '/index.html#tienda-mes' };
  }, !!conTienda);
}

async function invitar(page) {
  await page.evaluate(() => window.paceAbrirPremium({ nombre: 'Colgarse' }));
  await page.locator(HOJA).waitFor({ state: 'visible' });
}

test.describe('3A · la invitación con la tienda abierta', () => {
  test('sin tienda, como hoy: «Llega con la versión 1» y ningún precio', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await comoEnV1(page, false);
    await invitar(page);
    const hoja = page.locator(HOJA);
    await expect(hoja).toContainText('Llega con la versión 1.');
    await expect(hoja.locator('[data-pace-premium-precios], [data-pace-premium-vida]')).toHaveCount(0);
    await expect(hoja.getByRole('button', { name: /Probar/ })).toHaveCount(0);
  });

  test('como la bienvenida: los dos precios, «Probar» y «Ahora no» iguales, el aviso y «Prefiero pagarlo una vez»', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context);
    await irAlArtefacto(page);
    await comoEnV1(page, true);
    await invitar(page);

    const hoja = page.locator(HOJA);
    await expect(hoja).toHaveAttribute('data-pace-premium-hoja', 'invita');
    await expect(hoja).toContainText('Colgarse');
    await expect(hoja).toContainText('Es parte de PACE completo.');
    await expect(hoja).not.toContainText('Llega con la versión 1.');
    /* Los precios, los de la tienda y escritos en el idioma de la app. */
    await expect(hoja.locator('[data-pace-premium-precios]')).toHaveText('19,99 € una vez, o 2,99 € al mes con 7 días gratis.');
    const probar = hoja.getByRole('button', { name: 'Probar 7 días gratis' });
    const ahora = hoja.getByRole('button', { name: 'Ahora no' });
    await expect(probar).toBeVisible();
    const [a, b] = [await probar.boundingBox(), await ahora.boundingBox()];
    expect(Math.abs(a.width - b.width), '«Ahora no» igual de ancho que «Probar»').toBeLessThan(1);
    expect(Math.abs(a.height - b.height)).toBeLessThan(1);
    await expect(hoja).toContainText('Te avisamos dos días antes de que acabe la prueba.');
    await expect(hoja.locator('[data-pace-premium-vida]')).toHaveText('Prefiero pagarlo una vez, 19,99 €');
    await expect(hoja.locator('[data-pace-premium-tengo]')).toHaveText('Tengo un código');

    await ahora.click();
    await expect(page.locator(HOJA)).toHaveCount(0);
    expect(errores).toEqual([]);
  });

  test('«Probar 7 días gratis» lleva al pago al mes y «Prefiero pagarlo una vez», al de por vida; la hoja se cierra', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await comoEnV1(page, true);
    await invitar(page);
    await page.locator(HOJA).getByRole('button', { name: 'Probar 7 días gratis' }).click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#tienda-mes');
    await expect(page.locator(HOJA)).toHaveCount(0);

    await invitar(page);
    await page.locator('[data-pace-premium-vida]').click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#tienda-vida');
    await expect(page.locator(HOJA)).toHaveCount(0);
  });

  test('la tienda que da el código aquí mismo acaba como un canje; si falla, lo dice y la hoja sigue', async ({ page, context }) => {
    await conLlaveDePrueba(context);
    await sembrar(context);
    await irAlArtefacto(page);
    await comoEnV1(page, true);
    await page.evaluate(() => { window.paceTiendaWeb.comprar = () => Promise.resolve({ ok: false, motivo: 'error' }); });
    await invitar(page);
    const hoja = page.locator(HOJA);
    await hoja.getByRole('button', { name: 'Probar 7 días gratis' }).click();
    await expect(hoja.locator('[data-pace-premium-error="compra"]')).toHaveText('No se ha podido abrir la compra. Prueba otra vez.');
    await expect(hoja).toHaveAttribute('data-pace-premium-hoja', 'invita');

    const codigo = firmar({ order: 'cs_test_compra' });
    await page.evaluate((c) => { window.paceTiendaWeb.comprar = () => Promise.resolve({ ok: true, licencia: c }); }, codigo);
    await page.locator('[data-pace-premium-vida]').click();
    await expect(hoja).toHaveAttribute('data-pace-premium-hoja', 'ok');
    await expect(hoja).toContainText('PACE completo es tuyo, para siempre.');
    expect(await page.evaluate(() => window.getState().licencia)).toBe(codigo);
  });
});

test.describe('3A en un móvil en inglés', () => {
  test.use({ locale: 'en-GB', viewport: { width: 360, height: 740 } });

  test('a 360 px los dos botones van uno sobre otro, igual de anchos, y la hoja cabe', async ({ page, context }) => {
    await sembrar(context, { lang: 'en', sidebarCollapsed: true });
    await irAlArtefacto(page);
    await comoEnV1(page, true);
    await invitar(page);
    const hoja = page.locator(HOJA);
    await expect(hoja.locator('[data-pace-premium-precios]')).toHaveText('€19.99 once, or €2.99 a month with 7 days free.');
    const [a, b] = [await hoja.getByRole('button', { name: 'Try 7 days free' }).boundingBox(), await hoja.getByRole('button', { name: 'Not now' }).boundingBox()];
    expect(Math.abs(a.width - b.width)).toBeLessThan(1);
    expect(b.y).toBeGreaterThan(a.y + a.height - 1);
    await expect(hoja.locator('[data-pace-premium-vida]')).toHaveText('I would rather pay once, €19.99');
    const caja = await page.locator('[data-pace-modal-card]').boundingBox();
    expect(caja.y).toBeGreaterThanOrEqual(0);
    expect(caja.y + caja.height).toBeLessThanOrEqual(740);
  });
});

test.describe('2A · «¿Lo has perdido?» debajo del campo del código', () => {
  test('en la web abre pacegrass.app/recuperar en otra pestaña', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await page.evaluate(() => window.paceAbrirPremium({ modo: 'codigo' }));
    const enlace = page.locator('[data-pace-premium-recuperar]');
    await expect(enlace).toHaveText('¿Lo has perdido? Recupéralo con tu correo');
    await expect(enlace).toHaveAttribute('href', '/recuperar/');
    await expect(enlace).toHaveAttribute('target', '_blank');
    /* Debajo del campo y de sus botones. */
    const campo = await page.locator('[data-pace-premium-codigo]').boundingBox();
    expect((await enlace.boundingBox()).y).toBeGreaterThan(campo.y + campo.height);

    const [pestana] = await Promise.all([context.waitForEvent('page'), enlace.click()]);
    await pestana.waitForLoadState();
    expect(new URL(pestana.url()).pathname).toBe('/recuperar/');
    await expect(pestana.locator('h1:visible')).toHaveText('Recupera tu código');
  });

  test('en Android no hay código, y tampoco el enlace', async ({ page, context }) => {
    await context.addInitScript(() => {
      window.Capacitor = { getPlatform: () => 'android', isNativePlatform: () => true,
        Plugins: { App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() } } };
    });
    await sembrar(context);
    await irAlArtefacto(page);
    await page.evaluate(() => window.paceAbrirPremium({ modo: 'codigo' }));
    await expect(page.locator(HOJA)).toHaveAttribute('data-pace-premium-hoja', 'invita');
    await expect(page.locator('[data-pace-premium-recuperar], [data-pace-premium-tengo]')).toHaveCount(0);
  });
});
