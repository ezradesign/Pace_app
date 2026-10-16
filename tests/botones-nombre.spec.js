/* PACE · el nombre de un botón es su texto, no su icono (16 oct. 2026)
 * =====================================================================
 * En la auditoría del 16 oct., el lector de pantalla decía «▶| Terminar» y
 * «❚❚ Pausar» en la sesión de Respira: el `Button` de `ui/Primitives.jsx`
 * metía el icono dentro del nombre. El icono va oculto al lector y el botón se
 * llama como se lee.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test('los botones de una sesión de Respira se llaman por su texto, sin el icono', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Ujjayi', exact: true }).click();
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toHaveCount(1);
  await page.getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(sesion.getByRole('button', { name: 'Terminar', exact: true })).toHaveCount(1);
  await expect(sesion.getByRole('button', { name: 'Pausar', exact: true })).toHaveCount(1);
});
