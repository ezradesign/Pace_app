/* PACE · E2E · «TUS RUTINAS» ES DE PACE COMPLETO TAMBIÉN DESDE LA BARRA LATERAL (v0.161.0)
 * =========================================================================================
 * En el recorrido del 13 oct. salió que «Tus rutinas», en la barra lateral, abría el
 * CONSTRUCTOR a quien no tiene PACE completo: se podía crear una rutina que luego salía
 * cerrada en la biblioteca. Desde la biblioteca ya salía la invitación (v0.157.0); ahora
 * también desde la barra y desde cualquier `pace:open-custom-builder`.
 *
 * Contra v0.160.0 cae la primera: se abría el constructor.
 *
 * HASTA v1 se abre para todos (Ez, 20 oct. 2026: Google tiene que poder revisar toda la
 * app en Play, y en Android no hay código ni compra que lo abra). Por eso la primera
 * apaga `PREMIUM_ABIERTO_HASTA_V1` para medir el candado de después de v1, y la tercera
 * mide lo de hoy. Contra v0.173.2 cae la tercera: salía la invitación.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const invitacion = (page) => page.locator('[data-pace-premium-hoja]');
const constructor = (page) => page.getByRole('heading', { name: 'Nueva rutina' });

test('después de v1, sin PACE completo, «Tus rutinas» y el evento del constructor abren la invitación', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
  await page.locator('aside[data-pace-sidebar]').getByRole('button', { name: /rutinas/i }).click();
  await expect(invitacion(page), 'la barra lateral no lleva a la invitación').toBeVisible();
  await expect(constructor(page), 'la barra lateral abre el constructor sin PACE completo').toHaveCount(0);

  await page.keyboard.press('Escape');
  await expect(invitacion(page)).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-custom-builder', { detail: { id: null } })));
  await expect(invitacion(page), 'el evento del constructor no lleva a la invitación').toBeVisible();
  await expect(constructor(page)).toHaveCount(0);
});

test('hasta v1, sin PACE completo, «Tus rutinas» abre el constructor', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.locator('aside[data-pace-sidebar]').getByRole('button', { name: /rutinas/i }).click();
  await expect(constructor(page), 'hasta v1 la barra lateral no abre el constructor').toBeVisible();
  await expect(invitacion(page)).toHaveCount(0);
  expect(await page.evaluate(() => window.hasPremiumEntitlement()), 'abrirlo no es tener PACE completo').toBe(false);
});

test('con PACE completo, «Tus rutinas» abre el constructor', async ({ page, context }) => {
  await sembrar(context, { premiumUnlocked: true });
  await irAlArtefacto(page);
  await page.locator('aside[data-pace-sidebar]').getByRole('button', { name: /rutinas/i }).click();
  await expect(constructor(page)).toBeVisible();
  await expect(invitacion(page)).toHaveCount(0);
});
