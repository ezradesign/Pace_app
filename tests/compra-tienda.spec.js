/* PACE · el punto de compra y el último paso de la bienvenida (Fase 6, 16 oct. 2026)
 * ==========================================
 * Toda compra pasa por `app/state-entitlement.jsx` (paceTiendaAbierta, paceTiendaPlanes,
 * paceComprar), con una tienda por canal (`app/state-compra.js`). Hoy las dos están
 * vacías: la bienvenida acaba en «¿Cómo es tu semana?» y nada enseña un botón de compra.
 * Con la tienda abierta, la bienvenida enseña PACE completo una vez, al final, con los
 * dos precios de la tienda y «Ahora no» igual de grande que «Probar 7 días gratis»
 * (opción A de Ez, https://claude.ai/artifact/AvME9EqcMHXhywx43vEdKG).
 *
 * Para abrir la tienda de la web basta con poner sus dos enlaces de pago: la prueba lo
 * hace en el objeto que lee la app (`PACE_TIENDA_WEB.enlaces`), antes de pasar de la
 * primera pantalla, porque la lista de pantallas se recalcula en cada paso.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { capturarErrores, RUTA_ARTEFACTO, CLAVE_ESTADO } = require('./helpers');

async function abrirTiendaWeb(page, mes) {
  await page.evaluate((enlaceMes) => {
    window.PACE_TIENDA_WEB.enlaces = { vida: '/index.html#tienda-vida', mes: enlaceMes || '/index.html#tienda-mes' };
  }, mes);
}

async function hastaLaSemana(page) {
  await page.goto(RUTA_ARTEFACTO);
  await page.locator('[role=dialog] [data-pace-cta]').waitFor({ state: 'visible' });
}

test('con la tienda cerrada no hay nada que comprar y la bienvenida acaba en la semana', async ({ page }) => {
  const errores = capturarErrores(page);
  await hastaLaSemana(page);

  const tienda = await page.evaluate(async () => ({
    canal: window.paceTiendaCanal(),
    abierta: window.paceTiendaAbierta(),
    planes: window.paceTiendaPlanes('es'),
    compra: await window.paceComprar('vida'),
  }));
  expect(tienda).toEqual({ canal: 'web', abierta: false, planes: [], compra: { ok: false, motivo: 'cerrada' } });

  await page.locator('[role=dialog] [data-pace-cta]').click();
  /* La semana es la última: su botón dice «Comenzar» y cierra la bienvenida. */
  await expect(page.locator('[data-pace-semana-guardar]')).toHaveText('Comenzar');
  await page.locator('[data-pace-semana-guardar]').click();
  await expect(page.locator('[role=dialog][data-pace-scene-card]')).toHaveCount(0);
  await expect(page.locator('[data-pace-onb-probar]')).toHaveCount(0);
  expect(errores).toEqual([]);
});

test('con la tienda abierta, el último paso enseña los dos precios y «Ahora no» cierra para siempre', async ({ page }) => {
  const errores = capturarErrores(page);
  await hastaLaSemana(page);
  await abrirTiendaWeb(page);

  await page.locator('[role=dialog] [data-pace-cta]').click();
  await expect(page.locator('[data-pace-semana-guardar]')).toHaveText('Continuar');
  await page.locator('[data-pace-semana-guardar]').click();

  await expect(page.getByRole('heading', { name: 'PACE es gratis.' })).toBeVisible();
  /* Los precios, los de la tienda y escritos en el idioma de la app. */
  await expect(page.locator('[data-pace-onb-precios]')).toHaveText('19,99 € una vez, o 2,99 € al mes con 7 días gratis.');
  const probar = page.locator('[data-pace-onb-probar]');
  const ahora = page.locator('[data-pace-onb-ahora]');
  await expect(probar).toHaveText('Probar 7 días gratis');
  await expect(ahora).toHaveText('Ahora no');
  await expect(page.locator('[data-pace-onb-vida]')).toHaveText('Prefiero pagarlo una vez, 19,99 €');

  /* «Ahora no» igual de grande que «Probar 7 días gratis». */
  const [a, b] = [await probar.boundingBox(), await ahora.boundingBox()];
  expect(Math.abs(a.width - b.width)).toBeLessThan(1);
  expect(Math.abs(a.height - b.height)).toBeLessThan(1);

  await ahora.click();
  await expect(page.locator('[role=dialog][data-pace-scene-card]')).toHaveCount(0);
  const visto = await page.evaluate((clave) => JSON.parse(localStorage.getItem(clave)).firstSeen, CLAVE_ESTADO);
  expect(typeof visto).toBe('number');

  /* Se enseña UNA vez: al volver, la app abre en la home. */
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await expect(page.locator('[data-pace-onb-probar]')).toHaveCount(0);
  expect(errores).toEqual([]);
});

test.describe('en un móvil en inglés', () => {
  test.use({ locale: 'en-GB', viewport: { width: 360, height: 740 } });

  test('a 360 px los dos botones van uno sobre otro, igual de anchos, con el precio en inglés', async ({ page }) => {
    await hastaLaSemana(page);
    await abrirTiendaWeb(page);
    await page.locator('[role=dialog] [data-pace-cta]').click();
    await page.locator('[data-pace-semana-guardar]').click();

    await expect(page.locator('[data-pace-onb-precios]')).toHaveText('€19.99 once, or €2.99 a month with 7 days free.');
    const [a, b] = [await page.locator('[data-pace-onb-probar]').boundingBox(), await page.locator('[data-pace-onb-ahora]').boundingBox()];
    expect(Math.abs(a.width - b.width)).toBeLessThan(1);
    expect(b.y).toBeGreaterThan(a.y + a.height - 1);
    expect(a.x + a.width).toBeLessThanOrEqual(360);
  });
});

test('«Probar 7 días gratis» cierra la bienvenida y lleva a la página de pago del plan al mes', async ({ page }) => {
  await hastaLaSemana(page);
  await abrirTiendaWeb(page);
  await page.locator('[role=dialog] [data-pace-cta]').click();
  await page.locator('[data-pace-semana-guardar]').click();
  await page.locator('[data-pace-onb-probar]').click();

  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#tienda-mes');
  const visto = await page.evaluate((clave) => JSON.parse(localStorage.getItem(clave)).firstSeen, CLAVE_ESTADO);
  expect(typeof visto).toBe('number');
});

test('quien ya tiene PACE completo no ve la tienda, y lo que la tienda dice que tienes abre PACE completo', async ({ page }) => {
  await hastaLaSemana(page);
  await abrirTiendaWeb(page);
  expect(await page.evaluate(() => window.paceTiendaAbierta())).toBe(true);

  /* La tercera fuente del guard: lo que la tienda sabe (Play, cuando llegue). */
  const conCompra = await page.evaluate(() => {
    const antes = window.hasPremiumEntitlement();
    window.paceTiendaWeb.vigente = () => true;
    return { antes, despues: window.hasPremiumEntitlement(), abierta: window.paceTiendaAbierta() };
  });
  expect(conCompra).toEqual({ antes: false, despues: true, abierta: false });
});
