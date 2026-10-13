/* PACE · E2E · «TUS RUTINAS» ES DE PACE COMPLETO TAMBIÉN DESDE LA BARRA LATERAL (v0.161.0)
 * =========================================================================================
 * En el recorrido del 13 oct. salió que «Mis rutinas», en la barra lateral, abría el
 * CONSTRUCTOR a quien no tiene PACE completo: se podía crear una rutina que luego salía
 * cerrada en la biblioteca. Desde la biblioteca ya salía la invitación (v0.157.0); ahora
 * también desde la barra y desde cualquier `pace:open-custom-builder`.
 *
 * Contra v0.160.0 cae la primera: se abría el constructor.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const invitacion = (page) => page.locator('[data-pace-premium-hoja]');
const constructor = (page) => page.getByRole('heading', { name: 'Nueva rutina' });

test('sin PACE completo, «Mis rutinas» y el evento del constructor abren la invitación', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.locator('aside[data-pace-sidebar]').getByRole('button', { name: /rutinas/i }).click();
  await expect(invitacion(page), 'la barra lateral no lleva a la invitación').toBeVisible();
  await expect(constructor(page), 'la barra lateral abre el constructor sin PACE completo').toHaveCount(0);

  await page.keyboard.press('Escape');
  await expect(invitacion(page)).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-custom-builder', { detail: { id: null } })));
  await expect(invitacion(page), 'el evento del constructor no lleva a la invitación').toBeVisible();
  await expect(constructor(page)).toHaveCount(0);
});

test('con PACE completo, «Mis rutinas» abre el constructor', async ({ page, context }) => {
  await sembrar(context, { premiumUnlocked: true });
  await irAlArtefacto(page);
  await page.locator('aside[data-pace-sidebar]').getByRole('button', { name: /rutinas/i }).click();
  await expect(constructor(page)).toBeVisible();
  await expect(invitacion(page)).toHaveCount(0);
});
