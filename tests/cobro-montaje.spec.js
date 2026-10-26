/* PACE · E2E · EL COBRO WEB QUE ELIGIÓ EZ (1A 2A 3A, 26 oct. 2026)
 * ================================================================
 * Sobre https://claude.ai/artifact/RE7fBBgo79RhA34a5igCoV:
 *   1A · la página de gracias (gracias/index.html) da el código con «Abrir PACE con tu código»,
 *        Copiar, Descargar y Mandármelo;
 *   2A · dos días antes de que acabe la prueba, una hoja al abrir PACE, una sola vez;
 *   3A · «Gestionar la suscripción» en su fila, debajo de PACE completo, si hay dónde.
 * Y el código caducado dice por qué: sin conexión para renovar, o la suscripción terminó.
 * Las funciones de Cloudflare las hace `page.route`: el servidor de la suite no las ejecuta.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { firmar, conLlaveDePrueba } = require('./licencia.helpers');

test.use({ serviceWorkers: 'block' });

const DIA = 24 * 3600 * 1000;
const mensual = (extra) => firmar(Object.assign({ type: 'monthly', order: 'sub_1AbCdEf', expiresAt: Date.now() + 9 * DIA }, extra));

async function abrir(page, context, codigo, renovar) {
  await conLlaveDePrueba(context);
  await context.route('**/api/renovar', (r) => (renovar ? renovar(r) : r.abort()));
  await sembrar(context, { licencia: codigo });
  await irAlArtefacto(page);
  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
}

async function ajustesDatos(page) {
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  const datos = page.getByRole('button', { name: 'Copias, borrar y código' });
  if (await datos.isVisible().catch(() => false)) await datos.click();
}

test.describe('3A · «Gestionar» en Ajustes', () => {
  test('con la mensual y el portal puesto, una fila propia debajo de PACE completo; sin portal, no sale', async ({ page, context }) => {
    await abrir(page, context, mensual());
    await expect.poll(() => page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
    await ajustesDatos(page);
    await expect(page.locator('[data-pace-licencia-estado]')).toHaveText(/^Hasta el /);
    await expect(page.getByRole('button', { name: /Gestionar la suscripción/ })).toHaveCount(0);

    await page.evaluate(() => { window.PACE_TIENDA_WEB.gestionar = 'https://billing.stripe.com/p/login/prueba'; window.setState({}); });
    const fila = page.getByRole('button', { name: /Gestionar la suscripción/ });
    await expect(fila).toBeVisible();
    await expect(fila).toContainText('Stripe ›');
    await page.evaluate(() => { window.open = (u) => { window.__abierto = u; return null; }; });
    await fila.click();
    const abierto = await page.evaluate(() => window.__abierto);
    expect(abierto).toBe('https://billing.stripe.com/p/login/prueba');
  });

  test('con un código de por vida no hay nada que gestionar', async ({ page, context }) => {
    await abrir(page, context, firmar({ tester: 3 }));
    await page.evaluate(() => { window.PACE_TIENDA_WEB.gestionar = 'https://billing.stripe.com/p/login/prueba'; });
    await ajustesDatos(page);
    await expect(page.locator('[data-pace-licencia-estado]')).toHaveText('Para siempre');
    await expect(page.getByRole('button', { name: /Gestionar la suscripción/ })).toHaveCount(0);
  });
});

test.describe('caducado, con su motivo', () => {
  test('sin red dice «Sin conexión para renovar»; si terminó, «Terminó el …»', async ({ page, context }) => {
    await abrir(page, context, mensual({ expiresAt: Date.now() - DIA }));
    await ajustesDatos(page);
    await expect(page.locator('[data-pace-licencia-caducada]')).toHaveText('Sin conexión para renovar');

    await page.unroute('**/api/renovar');
    await context.unroute('**/api/renovar');
    await page.route('**/api/renovar', (r) => r.fulfill({ status: 410, contentType: 'application/json', body: '{"ok":false,"terminada":true}' }));
    await page.evaluate(() => window.paceLicenciaRenovar(true));
    await expect(page.locator('[data-pace-licencia-caducada="terminada"]')).toHaveText(/^Terminó el /);
  });
});

test.describe('2A · el aviso del fin de la prueba', () => {
  test('a un día del fin, una hoja al abrir sin lista de ventajas; «Seguir con la prueba» la cierra y no vuelve', async ({ page, context }) => {
    await abrir(page, context, mensual({ trialEnd: Date.now() + DIA }));
    const hoja = page.locator('[data-pace-premium-hoja="prueba"]');
    await expect(hoja).toBeVisible();
    await expect(hoja.locator('h2')).toHaveText(/^Tu prueba acaba el /);
    await expect(hoja).toContainText('se cobra el primer mes: 2,99');
    await expect(hoja.locator('ul')).toHaveCount(0);
    /* Sin portal de Stripe todavía, no promete cancelar desde aquí. */
    await expect(hoja.getByRole('button', { name: 'Gestionar la suscripción' })).toHaveCount(0);
    await hoja.getByRole('button', { name: 'Seguir con la prueba' }).click();
    await expect(hoja).toHaveCount(0);
    expect(await page.evaluate(() => window.getState().premiumAvisoPrueba)).toBe('sub_1AbCdEf');

    await page.reload();
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await page.waitForTimeout(2200);
    await expect(page.locator('[data-pace-premium-hoja]')).toHaveCount(0);
  });

  test('lejos del fin, o sin prueba, no sale', async ({ page, context }) => {
    await abrir(page, context, mensual({ trialEnd: Date.now() + 5 * DIA }));
    await page.waitForTimeout(2200);
    await expect(page.locator('[data-pace-premium-hoja]')).toHaveCount(0);
  });
});

test.describe('1A · la página de gracias', () => {
  const SESION = 'cs_test_a1B2c3D4e5F6g7H8';

  test('espera al aviso del pago, da el código y las cuatro formas de quedárselo', async ({ page }) => {
    const codigo = mensual({ trialEnd: Date.now() + 7 * DIA });
    let veces = 0;
    await page.route('**/api/codigo?*', (r) => (++veces < 2
      ? r.fulfill({ status: 404, contentType: 'application/json', body: '{"ok":false,"pendiente":true}' })
      : r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, codigo }) })));
    await page.goto('/gracias/index.html?sesion=' + SESION);
    await expect(page.locator('[data-gracias-espera]')).toBeVisible();
    await expect(page.locator('[data-gracias-listo]')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('h1:visible')).toHaveText('Gracias. Ya es tuyo.');
    await expect(page.locator('[data-gracias-codigo]')).toHaveText(codigo);
    await expect(page.locator('[data-gracias-abrir]')).toHaveAttribute('href', '/#codigo=' + encodeURIComponent(codigo));
    const correo = await page.locator('[data-gracias-correo]').getAttribute('href');
    expect(decodeURIComponent(correo)).toContain(codigo);
    expect(correo.startsWith('mailto:?subject=')).toBe(true);
    await expect(page.locator('[data-gracias-prueba-texto]')).toContainText('dos días antes');

    const bajada = page.waitForEvent('download');
    await page.locator('[data-gracias-bajar]').click();
    expect((await bajada).suggestedFilename()).toBe('PACE-codigo.txt');

    /* En inglés, lo mismo. */
    await page.locator('[data-idioma]').click();
    await expect(page.locator('[data-gracias-abrir]')).toHaveText('Open PACE with your code');
  });

  test('es solo de la web: no entra en el APK, y web-dist la publica', () => {
    const raiz = require('path').join(__dirname, '..');
    const fs = require('fs');
    expect(fs.readFileSync(require('path').join(raiz, 'scripts', 'android-www.js'), 'utf8')).not.toMatch(/gracias/);
    expect(fs.readFileSync(require('path').join(raiz, 'scripts', 'web-dist.js'), 'utf8')).toContain("const WEB_CARPETAS = ['premium', 'beta', 'gracias'];");
  });

  test('sin compra que encontrar, dice a quién escribir', async ({ page }) => {
    await page.goto('/gracias/index.html');
    await expect(page.locator('[data-gracias-falta]')).toBeVisible();
    await expect(page.locator('[data-gracias-falta]')).toContainText('número del recibo de Stripe');
  });

  test('«Abrir PACE con tu código» deja PACE completo puesto en este navegador', async ({ page, context }) => {
    await conLlaveDePrueba(context);
    await sembrar(context);
    const codigo = mensual();
    await page.goto('/index.html#codigo=' + encodeURIComponent(codigo));
    await expect(page.locator('[data-pace-toast="licencia"]')).toContainText('PACE completo ya es tuyo.');
    expect(await page.evaluate(() => window.getState().licencia)).toBe(codigo);
  });
});
