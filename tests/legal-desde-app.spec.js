/* PACE · tests/legal-desde-app.spec.js
   =====================================
   Privacidad y Seguridad abiertas desde las apps (`?app=1`, app/ui/nativo.js) no ofrecen «Volver a la app»:
   llevaba a la raíz de pacegrass.app, que a quien llega nuevo le enseña la landing con la compra de la web
   (auditoría de Fable, nº 14; Apple lo mira). En la web, el enlace sigue. Contra la 0.213.0 cae la primera.
*/
'use strict';
const { test, expect } = require('@playwright/test');

for (const [pagina, otra, nombre] of [['privacy', 'safety', 'Seguridad'], ['safety', 'privacy', 'Privacidad']]) {
  test('/' + pagina + '?app=1, desde las apps: sin «Volver a la app», y la otra página conserva la marca', async ({ page }) => {
    await page.goto('/' + pagina + '.html?app=1');
    await expect(page.getByRole('link', { name: 'Volver a la app' })).toHaveCount(0);
    await expect(page.locator('.footer')).not.toContainText('·  ·');
    await expect(page.locator('.footer').getByRole('link', { name: nombre })).toHaveAttribute('href', '/' + otra + '?app=1');
  });
  test('CONTROL · /' + pagina + ' en la web: «Volver a la app» sigue', async ({ page }) => {
    await page.goto('/' + pagina + '.html');
    await expect(page.getByRole('link', { name: 'Volver a la app' })).toHaveAttribute('href', '/');
    await expect(page.locator('.footer').getByRole('link', { name: nombre })).toHaveAttribute('href', '/' + otra);
  });
}
