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

test('A3 · volver atrás desde «¿Cómo es tu semana?» no borra lo que ya se había tocado', async ({ page }) => {
  const EDITOR = '[data-pace-semana-editor]';
  const dia = (n) => page.locator(EDITOR + ' [data-pace-semana-dia="' + n + '"]');
  await page.goto(RUTA_ARTEFACTO);
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await page.locator(EDITOR).waitFor({ state: 'visible' });

  await dia(3).click();                 // miércoles: jornada → media
  await page.locator(EDITOR + ' [data-pace-ritmo-horario="inicio"]').selectOption('480');
  await expect(dia(3)).toHaveAttribute('aria-label', 'miércoles, Media');

  await page.getByRole('button', { name: /Atrás/ }).click();
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await page.locator(EDITOR).waitFor({ state: 'visible' });
  await expect(dia(3), 'volver atrás borró el día tocado').toHaveAttribute('aria-label', 'miércoles, Media');
  await expect(page.locator(EDITOR + ' [data-pace-ritmo-horario="inicio"]'), 'volver atrás borró la hora').toHaveValue('480');

  /* Sigue sin escribir nada hasta guardar, y lo que guarda es el borrador entero. */
  expect(await leerEstado(page)).toEqual({});
  await page.locator('[data-pace-semana-guardar]').click();
  const st = await leerEstado(page);
  expect(st.ritmo.semanaTipo[2]).toBe('media');
  expect(st.ritmo.horario).toEqual({ inicio: 480 });
});
