/* PACE · el foco no se pierde ni se esconde (auditoría de accesibilidad del 7 nov. 2026)
 * =====================================================================================
 * Lo que midió la auditoría sobre la 0.192.0 recorriendo cada pantalla con Tab:
 *
 *  · Al salir de una sesión, el foco caía en <body>. La sesión se empieza desde una tarjeta
 *    de la biblioteca y la biblioteca se cierra en ese mismo render: cuando la sesión miraba
 *    quién tenía el foco ya no había nadie, y al cerrarse no tenía a dónde devolverlo. Ahora
 *    vuelve al chip que abrió la biblioteca (ui/Dialogo.jsx).
 *  · Con Ajustes abierto, el foco se quedaba en la rueda, detrás, y el Tab caía en botones de
 *    la home que el panel tapa: 6 de 38 paradas a 360 px y 3 de 54 a 1280. Ahora entra en el
 *    panel, da la vuelta dentro y al cerrar vuelve a la rueda. Para el ratón sigue siendo un
 *    panel no modal (tweaks/TweaksPanel.jsx).
 *
 * Calibrado en rojo contra la 0.192.0 y con cada arreglo quitado.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');

const pulsar = async (page, loc) => { await loc.focus(); await page.keyboard.press('Enter'); };

test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

test('al salir de una sesión con Escape, el foco vuelve al chip que abrió la biblioteca', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  const chip = page.getByRole('button', { name: /^Respira/ });
  await pulsar(page, chip);
  await pulsar(page, page.locator('.pace-lib [data-pace-lib-card="breathe.coherent.55"] h4 button').filter({ visible: true }).first());
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toBeVisible();
  await expect(page.locator('.pace-lib'), 'GUARD: la biblioteca sigue abierta debajo').toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(sesion).toHaveCount(0);
  await expect(chip, 'el foco se perdió al salir de la sesión').toBeFocused();
  expect(errores).toEqual([]);
});

test('también con «Salir» y desde «Antes de empezar» de Mueve', async ({ page }) => {
  await irAlArtefacto(page);
  const chip = page.getByRole('button', { name: /^Mueve/ });
  await pulsar(page, chip);
  await pulsar(page, page.locator('.pace-lib [data-pace-lib-card]:not([data-locked]) h4 button').filter({ visible: true }).first());
  await pulsar(page, page.locator('[data-pace-modal-card] [data-pace-cta]').filter({ visible: true }).first());
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toBeVisible();
  await sesion.getByRole('button', { name: 'Salir', exact: true }).click();
  await expect(sesion).toHaveCount(0);
  await expect(chip).toBeFocused();
});

for (const [ancho, alto] of [[360, 800], [1280, 800]]) {
  test.describe(ancho + ' px', () => {
    test.use({ viewport: { width: ancho, height: alto } });

    test('Ajustes: el foco entra al abrir, el Tab no sale a lo que el panel tapa y vuelve a la rueda al cerrar', async ({ page }) => {
      await irAlArtefacto(page);
      const rueda = page.getByRole('button', { name: 'Abrir ajustes' });
      await pulsar(page, rueda);
      const panel = page.locator('[data-pace-tweaks-panel]');
      await expect(panel).toBeVisible();
      const dentro = () => page.evaluate(() => {
        const p = document.querySelector('[data-pace-tweaks-panel]');
        return !!(p && p.contains(document.activeElement));
      });
      expect(await dentro(), 'el foco se quedó fuera del panel al abrirlo').toBe(true);
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press(i % 9 === 8 ? 'Shift+Tab' : 'Tab');
        expect(await dentro(), 'Tab número ' + (i + 1) + ' salió del panel').toBe(true);
      }
      await page.keyboard.press('Escape');
      await expect(panel).toHaveCount(0);
      await expect(rueda, 'el foco no volvió a la rueda').toBeFocused();
    });
  });
}

test('Ajustes sigue sin ser modal para el ratón: con el panel abierto se pulsa la home', async ({ page }) => {
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
  /* Control: pasa igual sin el arreglo. Se pulsa por el texto que se ve, no por el nombre nuevo. */
  await page.locator('[data-pace-toque]').filter({ hasText: /^15$/ }).click();
  await expect(page.locator('[data-pace-dial-number]')).toHaveText('15:00');
  await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
});
