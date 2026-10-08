/* PACE · el documento habla el idioma de la app
 * =============================================
 * Con la app en inglés, `<html lang>` seguía en «es»: el lector de pantalla leía
 * el inglés con voz castellana y Chrome ofrecía «traducir del español». Y las
 * flechas de Estadísticas › Mes y › Año se anunciaban en castellano («Mes
 * anterior») porque su etiqueta estaba escrita a mano (caza de bugs del 7 de
 * octubre, ingles-6 e ingles-9). Nada de esto se ve: se lee del DOM.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test('<html lang> sigue al idioma al arrancar y al cambiarlo en vivo', async ({ page, context }) => {
  await sembrar(context, { lang: 'en' });
  await irAlArtefacto(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.evaluate(() => window.setState({ lang: 'es' }));
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('las flechas de Mes y Año se anuncian en inglés', async ({ page, context }) => {
  await sembrar(context, { lang: 'en' });
  await irAlArtefacto(page);
  await page.keyboard.press('s');
  await page.getByRole('button', { name: 'Month', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Previous month' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next month' })).toBeVisible();
  await page.getByRole('button', { name: 'Year', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Previous year' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next year' })).toBeVisible();
});
