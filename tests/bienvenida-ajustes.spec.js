/* PACE · la bienvenida y los Ajustes: los fallos de la auditoría externa del 21-22 oct.
 * ===================================================================================
 * Uno por caso (STATE.md, «Deuda conocida»), y cada uno cae sin su arreglo. El Atrás de
 * Android (A2) vive en android-nativo.spec.js, que tiene el Capacitor falso.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { CLAVE_ESTADO, RUTA_ARTEFACTO } = require('./helpers');

const leerEstado = (page) => page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || '{}'), CLAVE_ESTADO);

test('A1 · el idioma que se elige en la bienvenida quita «Auto» y sigue al volver a abrir', async ({ page }) => {
  await page.goto(RUTA_ARTEFACTO);
  await expect(page.getByRole('button', { name: 'Comenzar' })).toBeVisible();

  await page.getByTitle('Cambiar a English').click();
  await expect(page.getByRole('button', { name: 'Begin' })).toBeVisible();
  const st = await leerEstado(page);
  expect(st.lang).toBe('en');
  expect(st.langAuto, 'la bienvenida dejó el idioma en «Auto»').toBe(false);

  /* El navegador va en español (playwright.config.js): con «Auto» volvería a él. */
  await page.reload();
  await expect(page.getByRole('button', { name: 'Begin' }), 'al volver a abrir, el idioma volvió al del sistema').toBeVisible();
});
