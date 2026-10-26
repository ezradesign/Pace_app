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
const { otra, firmar, conLlaveDePrueba } = require('./licencia.helpers');

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

/* La comprobación de la firma, frenada: nunca termina. */
async function firmaQueNoAcaba(context) {
  await context.addInitScript(() => { SubtleCrypto.prototype.verify = () => new Promise(() => {}); });
}

/* Contra v0.176.0 cae: mientras se comprobaba, el código ya contaba. */
test('S2 · un código guardado no cuenta mientras se comprueba su firma', async ({ page, context }) => {
  await conLlaveDePrueba(context);
  await firmaQueNoAcaba(context);
  await sembrar(context, { licencia: firmar({ tester: 11 }) });
  await irAlArtefacto(page);
  await cerrarPremium(page);
  await page.waitForTimeout(300);
  expect(await lo_que_abre(page), 'el código cuenta sin haber comprobado la firma').toEqual(NADA);
});

/* Contra v0.176.0 cae: «sin WebCrypto no se aparta nada» dejaba abierto un código falso para siempre. */
test('S2 · si el navegador no puede comprobar la firma, un código falso no cuenta y no se borra', async ({ page, context }) => {
  await conLlaveDePrueba(context);
  await context.addInitScript(() => { SubtleCrypto.prototype.verify = () => Promise.reject(new Error('sin WebCrypto')); });
  const falso = firmar({ tester: 12 }, otra.privateKey);
  await sembrar(context, { licencia: falso });
  await irAlArtefacto(page);
  await cerrarPremium(page);
  await page.waitForTimeout(300);
  expect(await lo_que_abre(page), 'un código sin comprobar abre PACE completo').toEqual(NADA);
  expect(await page.evaluate(() => window.getState().licencia), 'lo guardado no se toca').toBe(falso);
});

/* Contra v0.176.0 cae: lo que llegaba al estado en marcha (una copia de «Tus datos») contaba sin
   comprobarse hasta la siguiente vez que se abriera la app. */
test('S2 · un código que llega con la app en marcha cuenta solo cuando su firma vale', async ({ page, context }) => {
  await conLlaveDePrueba(context);
  await sembrar(context);
  await irAlArtefacto(page);
  await cerrarPremium(page);

  await page.evaluate((c) => window.setState({ licencia: c }), firmar({ tester: 13 }, otra.privateKey));
  expect(await lo_que_abre(page), 'el código falso cuenta al llegar').toEqual(NADA);
  await page.waitForTimeout(300);
  expect(await lo_que_abre(page), 'el código falso cuenta después de comprobarlo').toEqual(NADA);

  await page.evaluate((c) => window.setState({ licencia: c }), firmar({ tester: 14 }));
  await expect.poll(() => page.evaluate(() => window.hasPremiumEntitlement()), 'el código bueno no llega a contar').toBe(true);
  expect(await page.evaluate(() => window.canAccessRoutine('extra.hang.bar'))).toBe(true);
});
