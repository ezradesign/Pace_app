/* PACE · E2E · HASTA v1, LAS RUTINAS PREMIUM ESTAN ABIERTAS
 * =========================================================
 * Decision de Ez (6 oct. 2026): el cobro llega despues de cerrar Android, asi
 * que hasta v1 todas las rutinas premium se pueden usar y los testers de la
 * prueba cerrada las prueban. Se siguen viendo con su «Premium» (dice que seran
 * de pago), pero sin «Pronto». El constructor de rutinas propias sigue cerrado.
 * El interruptor es `PREMIUM_ABIERTO_HASTA_V1` (app/state-entitlement.jsx).
 *
 * Contra la version anterior fallan las dos: la tarjeta salia bloqueada.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior, capturarErrores } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

test('una rutina premium de Estira sale abierta, con su «Premium» y sin «Pronto», y se empieza', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Estira/ }).click();
  const tarjeta = page.locator('[data-pace-lib-card="move.spine.waves"]');
  await expect(tarjeta).toBeVisible();
  await expect(tarjeta).not.toHaveAttribute('data-locked', '1');
  await expect(tarjeta).toContainText('Premium');
  await expect(tarjeta).not.toContainText('Pronto');
  /* En toda la biblioteca de Estira no queda ninguna bloqueada. */
  await expect(page.locator('[data-pace-lib-card][data-locked="1"]')).toHaveCount(0);

  await tarjeta.getByRole('button').first().click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(1);
  expect(errores).toEqual([]);
});

test('solo se abren las rutinas: el constructor de rutinas propias sigue cerrado', async ({ page }) => {
  await irAlArtefacto(page);
  const acceso = await page.evaluate(() => ({
    rutina: window.canAccessRoutine('move.spine.waves'),
    constructor: window.hasPremiumEntitlement(),
    comprado: window.getState().premiumUnlocked,
  }));
  expect(acceso.rutina, 'la rutina premium sigue cerrada').toBe(true);
  expect(acceso.constructor, 'abrir las rutinas abrio tambien el constructor').toBe(false);
  expect(acceso.comprado, 'abrir hasta v1 no es comprar: premiumUnlocked sigue false').toBe(false);
});
