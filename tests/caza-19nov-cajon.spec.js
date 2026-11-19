/* PACE · tests/caza-19nov-cajon.spec.js
   =====================================
   EL CAJÓN DEL MÓVIL (caza del 19 nov. 2026, Ez «sí» a la 1).

   1 · Arranca cerrado. `sidebarCollapsed:false` se guardaba y la siguiente vez PACE abría con el
       panel tapando el reloj; también quien viene del ordenador, donde el panel se queda abierto.
       En el ordenador sigue recordando cómo lo dejaste.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.describe('1 · en el móvil, PACE abre con el panel cerrado', () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test('guardado abierto, arranca cerrado y con «Abrir panel» a mano', async ({ page, context }) => {
    await sembrar(context, { sidebarCollapsed: false });
    await irAlArtefacto(page);
    await expect(page.locator('[data-pace-sidebar-open]')).toBeVisible();
    await expect(page.locator('[data-pace-sidebar]')).toHaveCount(0);
  });

  test('abrirlo y recargar: vuelve cerrado', async ({ page, context }) => {
    await sembrar(context, {});
    await irAlArtefacto(page);
    await page.locator('[data-pace-sidebar-open]').click();
    await expect(page.locator('[data-pace-sidebar]')).toBeVisible();
    await page.reload();
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await expect(page.locator('[data-pace-sidebar]')).toHaveCount(0);
  });
});

test.describe('1 · en el ordenador, el panel recuerda cómo lo dejaste', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('guardado abierto, sigue abierto; guardado cerrado, sigue cerrado', async ({ page, context }) => {
    await sembrar(context, { sidebarCollapsed: false });
    await irAlArtefacto(page);
    await expect(page.locator('[data-pace-sidebar]')).toBeVisible();
    await page.locator('[data-pace-sidebar-toggle]').click();
    await expect(page.locator('[data-pace-sidebar]')).toHaveCount(0);
    await page.reload();
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await expect(page.locator('[data-pace-sidebar]')).toHaveCount(0);
  });

});
