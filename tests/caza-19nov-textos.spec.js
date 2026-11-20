/* PACE · tests/caza-19nov-textos.spec.js
   ======================================
   Lo que se lee mal (caza del 19 nov. 2026, lo recomendado por Ez):

   3 · El aviso del sello y el del código salen en el idioma de ahora, no en el de cuando se abrió PACE.
   8 · «Tras 0 de tus 60 Focos, una pausa.» dice otra frase con cero (8A).
   9 · «Otro» con más de 180 se queda en 180, igual que con menos de 5 sube a 5 (9A).
   11 · La línea del Mes dice horas y minutos y el número de vasos va como las otras cifras (11A).
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.describe('3 · el aviso, en el idioma de ahora', () => {
  test('cambiar a inglés sin recargar: el sello sale entero en inglés', async ({ page, context }) => {
    await sembrar(context, {});
    await irAlArtefacto(page);
    await page.evaluate(() => window.setState({ lang: 'en' }));
    await page.waitForTimeout(1000);   // el sello del idioma sale solo, y el de la prueba va detrás, no junto a él
    await page.evaluate(() => showToast({ id: 'first.step', type: 'achievement' }));
    /* Cambiar de idioma gana su propio sello, que sale antes (los sellos salen al ganarlos, 1A del 18 nov.):
       se mira el aviso de «First step», que sale solo detrás. */
    const sello = page.locator('[data-pace-sello-aro], [data-pace-toast]').filter({ hasText: 'First step' }).first();
    await expect(sello).toBeVisible({ timeout: 15000 });
    await expect(sello).toContainText('New stamp');
    await expect(sello).toContainText('First step');
    await expect(sello).not.toContainText('Primer paso');
  });

  test('y al volver al español, en español', async ({ page, context }) => {
    await sembrar(context, { lang: 'en' });
    await irAlArtefacto(page);
    await page.evaluate(() => window.setState({ lang: 'es' }));
    await page.waitForTimeout(1000);
    await page.evaluate(() => showToast({ id: 'first.step', type: 'achievement' }));
    const sello = page.locator('[data-pace-sello-aro], [data-pace-toast]').filter({ hasText: 'Primer paso' }).first();
    await expect(sello).toBeVisible({ timeout: 15000 });
    await expect(sello).toContainText('Nuevo sello');
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

test.describe('11 · la línea del Mes', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('horas y minutos, y los vasos como las demás cifras', async ({ page, context }) => {
    const hoy = new Date();
    const iso = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
    /* Un día del mes con todo; `loadState` rehace el mes desde los días. */
    await sembrar(context, {
      lastActiveDay: hoy.toDateString(),
      history: { days: { [iso]: { focusMinutes: 1236, breathMinutes: 27, moveMinutes: 66, waterGlasses: 78 } }, months: {}, years: {} },
    });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Ver estadísticas' }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Mes', exact: true }).first().click();
    const linea = page.locator('.pace-heatmap-totals').first();
    await expect(linea).toBeVisible();
    const texto = (await linea.textContent()).replace(/\s+/g, ' ');
    expect(texto).toContain('Foco 20 h 36 min');
    expect(texto).toContain('Respira 27 min');
    expect(texto).toContain('Cuerpo 1 h 6 min');
    expect(texto).toContain('78 vasos');
    /* El 78 no va en la letra de los rótulos (la serif itálica de «Foco»). */
    const estilo = await linea.evaluate((el) => {
      const n = [...el.querySelectorAll('*')].find((x) => x.textContent.trim() === '78');
      return n ? getComputedStyle(n).fontStyle : 'sin-nodo';
    });
    expect(estilo).not.toBe('italic');
  });
});
