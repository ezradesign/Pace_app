/* PACE · tests/caza-19nov-textos.spec.js
   ======================================
   Lo que se lee mal (caza del 19 nov. 2026, lo recomendado por Ez):

   3 · El aviso del sello y el del código salen en el idioma de ahora, no en el de cuando se abrió PACE.
   8 · «Tras 0 de tus 60 Focos, una pausa.» dice otra frase con cero (8A).
   9 · «Otro» con más de 180 se queda en 180, igual que con menos de 5 sube a 5 (9A).
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

test.describe('9 · «Otro» se queda en el límite por los dos lados', () => {
  for (const [escrito, queda] of [['999', 180], ['181', 180], ['3', 5], ['90', 90]]) {
    test(escrito + ' se queda en ' + queda, async ({ page, context }) => {
      await sembrar(context, {});
      await irAlArtefacto(page);
      await page.getByRole('button', { name: 'Otro' }).click();
      const campo = page.locator('input[type="number"]').first();
      await campo.fill(escrito);
      await campo.press('Enter');
      await expect(page.locator('[data-pace-dial-number]')).toHaveText(String(queda).padStart(2, '0') + ':00');
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).focusMinutes)).toBe(queda);
    });
  }
});

/* «Qué te ayuda» sale de los eventos (stats-ayuda.js); aquí se le da el resultado hecho, que es lo que
   pinta la tarjeta: 60 Focos y ninguna pausa justo después. */
test.describe('8 · «Después del Foco» con cero pausas', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const [lang, sale, noSale] of [
    ['es', 'Aún no has parado justo después de un Foco.', 'Tras 0 de'],
    ['en', 'You haven’t taken a break right after a Focus block yet.', 'after 0 of'],
  ]) {
    test('dice que aún no has parado, sin el cero (' + lang + ')', async ({ page, context }) => {
      await sembrar(context, { lang });
      await irAlArtefacto(page);
      await page.evaluate(() => {
        window.statsAyuda = () => ({ bien: null, hora: null, tras: { a: 0, b: 60, manana: [0, 30], tarde: [0, 30] }, semanas: 3 });
      });
      await page.getByRole('button', { name: lang === 'en' ? 'View stats' : 'Ver estadísticas' }).first().click();
      await page.getByRole('dialog').getByRole('button', { name: lang === 'en' ? 'What helps' : 'Qué te ayuda', exact: true }).first().click();
      const frase = page.locator('[data-pace-ayuda-view] .pace-ay-frase').first();
      await expect(frase).toHaveText(sale);
      await expect(page.getByRole('dialog')).not.toContainText(noSale);
    });
  }

  test('con alguna pausa, la frase de siempre', async ({ page, context }) => {
    await sembrar(context, {});
    await irAlArtefacto(page);
    await page.evaluate(() => {
      window.statsAyuda = () => ({ bien: null, hora: null, tras: { a: 12, b: 60, manana: null }, semanas: 3 });
    });
    await page.getByRole('button', { name: 'Ver estadísticas' }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Qué te ayuda', exact: true }).first().click();
    await expect(page.locator('[data-pace-ayuda-view] .pace-ay-frase').first()).toHaveText('Tras 12 de tus 60 Focos, una pausa.');
  });
});
