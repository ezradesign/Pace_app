/* PACE · E2E · PACE COMPLETO NO SE ABRE SIN PAGAR (la seguridad antes de cobrar)
 * ==============================================================================
 * La auditoría externa del 22 oct. (ChatGPT, comprobada en el código) encontró dos
 * puertas antes de cobrar:
 *
 *   S1 · un booleano del estado, `premiumUnlocked`, abría PACE completo entero: bastaba
 *        cambiarlo en las herramientas del navegador. Ahora solo lo abren un código con
 *        la firma comprobada, la tienda del canal y, hasta v1, lo abierto para todos.
 *   S2 · el código guardado contaba ANTES de comprobar su firma (la comprobación de
 *        arranque es asíncrona), y para siempre si el navegador no podía comprobarla.
 *
 * Cada prueba apaga `PREMIUM_ABIERTO_HASTA_V1` para mirar lo que verá quien no pague
 * después de v1.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.use({ serviceWorkers: 'block' });

async function cerrarPremium(page) {
  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
}

/* Todo lo que PACE completo abre, preguntado al guard. */
const lo_que_abre = (page) => page.evaluate(() => ({
  pleno: window.hasPremiumEntitlement(),
  rutina: window.canAccessRoutine('extra.hang.bar'),
  rutinas: window.puedeCrearRutinas(),
  aprende: window.puedeAprender(),
  varia: window.puedeVariar(),
  calendario: window.puedeMantenerCalendario(),
}));
const NADA = { pleno: false, rutina: false, rutinas: false, aprende: false, varia: false, calendario: false };

/* Contra v0.176.0 cae: el booleano lo abría todo. */
test('S1 · tocar el estado a mano no abre PACE completo', async ({ page, context }) => {
  await sembrar(context, { premiumUnlocked: true });
  await irAlArtefacto(page);
  await cerrarPremium(page);
  expect(await lo_que_abre(page), 'el estado sembrado abre PACE completo').toEqual(NADA);

  await page.getByRole('button', { name: /^Mueve/ }).first().click();
  await expect(page.locator('[data-pace-lib-card="extra.hang.bar"]').first()).toHaveAttribute('data-locked', '1');

  /* Tampoco si se cambia con la app en marcha. */
  await page.evaluate(() => window.setState({ premiumUnlocked: true }));
  expect(await lo_que_abre(page), 'el estado cambiado en marcha abre PACE completo').toEqual(NADA);
});
