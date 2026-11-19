/* PACE · tests/caza-19nov-textos.spec.js
   ======================================
   Lo que se lee mal (caza del 19 nov. 2026, lo recomendado por Ez):

   3 · El aviso del sello y el del código salen en el idioma de ahora, no en el de cuando se abrió PACE.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.describe('3 · el aviso, en el idioma de ahora', () => {
  test('cambiar a inglés sin recargar: el sello sale entero en inglés', async ({ page, context }) => {
    await sembrar(context, {});
    await irAlArtefacto(page);
    await page.evaluate(() => window.setState({ lang: 'en' }));
    await page.evaluate(() => showToast({ id: 'first.step', type: 'achievement' }));
    const sello = page.locator('[data-pace-sello-aro], [data-pace-toast]').first();
    await expect(sello).toBeVisible();
    await expect(sello).toContainText('New stamp');
    await expect(sello).toContainText('First step');
    await expect(sello).not.toContainText('Primer paso');
  });

  test('y al volver al español, en español', async ({ page, context }) => {
    await sembrar(context, { lang: 'en' });
    await irAlArtefacto(page);
    await page.evaluate(() => window.setState({ lang: 'es' }));
    await page.evaluate(() => showToast({ id: 'first.step', type: 'achievement' }));
    const sello = page.locator('[data-pace-sello-aro], [data-pace-toast]').first();
    await expect(sello).toContainText('Primer paso');
    await expect(sello).not.toContainText('First step');
  });

  test('el aviso del código, también', async ({ page, context }) => {
    await sembrar(context, {});
    await irAlArtefacto(page);
    await page.evaluate(() => window.setState({ lang: 'en' }));
    await page.evaluate(() => showToast({ type: 'licencia', ok: true }));
    const aviso = page.locator('[data-pace-toast="licencia"]');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('PACE Complete is yours');
    await expect(aviso).toContainText('Code');
  });
});
