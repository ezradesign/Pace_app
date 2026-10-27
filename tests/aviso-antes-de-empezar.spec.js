/* PACE · E2E · EL AVISO COMÚN EN «ANTES DE EMPEZAR» (revisión de ChatGPT del 26 oct., comprobada el 27)
 * ===================================================================================================
 * La hoja de antes de empezar decía qué necesitas, la posición y los pasos, y nada de parar si algo
 * duele o marea: eso lo pide la base de Mueve y Estira (BASE_MUEVE_ESTIRA §8) para cualquier
 * ejercicio. Ahora lo dice una línea, la última antes de «Empezar», en Mueve y en Estira, en
 * castellano y en inglés.
 *
 * Contra v0.181.0 cae: la línea no existía.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior } = require('./helpers');

const T = {
  es: { aviso: 'Respira con normalidad y, si notas dolor o mareo, para.', empezar: 'Empezar',
    rutinas: [['Mueve', 'Fuerza en suelo'], ['Estira', 'Brazos libres']] },
  en: { aviso: 'Breathe normally, and stop if you feel pain or dizziness.', empezar: 'Start',
    rutinas: [['Move', 'Floor Strength'], ['Stretch', 'Free Arms']] },
};

for (const lang of ['es', 'en']) {
  test(`${lang} · «Antes de empezar» avisa de parar con dolor o mareo, justo encima de «Empezar»`, async ({ page, context }) => {
    await sembrar(context, { lang });
    const errores = capturarErrores(page);
    await irAlArtefacto(page);
    for (const [modulo, rutina] of T[lang].rutinas) {
      await page.getByRole('button', { name: new RegExp('^' + modulo) }).first().click();
      const lib = page.locator('.pace-lib').locator('visible=true').first();
      await lib.waitFor({ state: 'visible' });
      await lib.getByText(rutina, { exact: true }).locator('visible=true').first().click();
      const hoja = overlaySuperior(page);
      const aviso = hoja.locator('[data-pace-preview-aviso]');
      await expect(aviso, rutina).toHaveText(T[lang].aviso);
      await expect(aviso).toBeVisible();
      /* Lo último que se lee: el elemento que lo sigue es el botón de empezar. */
      const siguiente = await aviso.evaluate((el) => el.nextElementSibling && el.nextElementSibling.textContent);
      expect(siguiente, rutina).toBe(T[lang].empezar);
      await page.keyboard.press('Escape');
      await expect(hoja.locator('[data-pace-preview-aviso]')).toHaveCount(0);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
    expect(errores).toEqual([]);
  });
}
