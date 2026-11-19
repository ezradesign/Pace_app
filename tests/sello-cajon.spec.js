/* PACE · E2E · EL SELLO DEL ARO NO SE PINTA ENCIMA DEL CAJÓN (recorrido de tester, 18 nov. 2026)
 * ==============================================================================================
 * En el móvil, tras la primera pausa, «Nuevo sello · Primer paso» seguía en el aro mientras el tester
 * abría el panel lateral, y se pintaba encima, montado sobre la fila de los vasos: el sello vive en
 * z 200 y el cajón en z 60. Con el cajón abierto no se ve, como con una ventana abierta (Toast.jsx).
 * En el escritorio la barra va al lado del aro y el sello sigue a la vista.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, MEDIODIA } = require('./helpers');

const sello = (page) => page.locator('[data-pace-sello-aro]');
const visibilidad = (page) => sello(page).evaluate((e) => getComputedStyle(e).visibility);

async function conSello(page, context, ancho, alto) {
  await sembrar(context, { sidebarCollapsed: true });
  await page.clock.install({ time: MEDIODIA });
  await page.setViewportSize({ width: ancho, height: alto });
  await irAlArtefacto(page);
  await page.evaluate(() => showToast({ id: 'first.step', type: 'achievement' }));
  await expect(sello(page), 'GUARD: el sello sale en el aro').toBeVisible();
}

test('en el móvil, con el cajón abierto el sello del aro no se ve', async ({ page, context }) => {
  await conSello(page, context, 360, 740);
  await page.getByRole('button', { name: 'Abrir panel' }).click();
  await expect(page.locator('[data-pace-sidebar]'), 'GUARD: el cajón está abierto').toBeVisible();
  expect(await sello(page).count(), 'GUARD: el sello sigue puesto (no se ha ido por tiempo)').toBe(1);
  expect(await visibilidad(page), 'el sello se pinta encima del cajón').toBe('hidden');
  await page.getByRole('button', { name: /Colapsar panel|Cerrar panel/ }).click();
  if (await sello(page).count()) expect(await visibilidad(page), 'al cerrar el cajón vuelve').toBe('visible');
});

test('en el escritorio, con la barra abierta al lado, el sello del aro se ve', async ({ page, context }) => {
  await sembrar(context, { sidebarCollapsed: false });
  await page.clock.install({ time: MEDIODIA });
  await page.setViewportSize({ width: 1280, height: 800 });
  await irAlArtefacto(page);
  await page.evaluate(() => showToast({ id: 'first.step', type: 'achievement' }));
  await expect(page.locator('[data-pace-sidebar]'), 'GUARD: la barra está abierta').toBeVisible();
  await expect(sello(page)).toBeVisible();
});
