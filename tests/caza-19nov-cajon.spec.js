/* PACE · tests/caza-19nov-cajon.spec.js
   =====================================
   EL CAJÓN DEL MÓVIL (caza del 19 nov. 2026, Ez «sí» a la 1 y a la 2).

   1 · Arranca cerrado. `sidebarCollapsed:false` se guardaba y la siguiente vez PACE abría con el
       panel tapando el reloj; también quien viene del ordenador, donde el panel se queda abierto.
       En el ordenador sigue recordando cómo lo dejaste.
   2 · Es un diálogo: `role="dialog"`, Escape lo cierra, el tabulador no sale a la home que queda
       detrás y al cerrarlo el foco vuelve a «Abrir panel». En el móvil y en la tableta vertical.
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

  test('en el ordenador el panel no es un diálogo', async ({ page, context }) => {
    await sembrar(context, { sidebarCollapsed: false });
    await irAlArtefacto(page);
    await expect(page.locator('[data-pace-sidebar]')).not.toHaveAttribute('role', 'dialog');
  });
});

for (const [nombre, vp] of [['móvil', { width: 360, height: 640 }], ['tableta vertical', { width: 820, height: 1180 }]]) {
  test.describe('2 · el cajón con teclado, en ' + nombre, () => {
    test.use({ viewport: vp });

    test('diálogo, el tabulador se queda dentro, Escape lo cierra y el foco vuelve a «Abrir panel»', async ({ page, context }) => {
      await sembrar(context, {});
      await irAlArtefacto(page);
      const abrir = page.locator('[data-pace-sidebar-open]');
      await abrir.focus();
      await page.keyboard.press('Enter');
      const cajon = page.locator('[data-pace-sidebar]');
      await expect(cajon).toBeVisible();
      await expect(cajon).toHaveAttribute('role', 'dialog');
      await expect(cajon).toHaveAttribute('aria-modal', 'true');
      await expect(cajon).toHaveAttribute('aria-label', /panel/i);

      /* Más tabulaciones de las que tiene el cajón: tiene que dar la vuelta dentro. */
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        const dentro = await page.evaluate(() => !!(document.activeElement && document.activeElement.closest('[data-pace-sidebar]')));
        expect(dentro, 'tabulación ' + (i + 1) + ' fuera del cajón').toBe(true);
      }
      await page.keyboard.press('Shift+Tab');
      expect(await page.evaluate(() => !!document.activeElement.closest('[data-pace-sidebar]'))).toBe(true);

      await page.keyboard.press('Escape');
      await expect(cajon).toHaveCount(0);
      await expect(abrir).toBeFocused();
    });

    test('cerrarlo con su flecha también devuelve el foco a «Abrir panel»', async ({ page, context }) => {
      await sembrar(context, {});
      await irAlArtefacto(page);
      await page.locator('[data-pace-sidebar-open]').click();
      await page.locator('[data-pace-sidebar-toggle]').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-pace-sidebar]')).toHaveCount(0);
      await expect(page.locator('[data-pace-sidebar-open]')).toBeFocused();
    });
  });
}
