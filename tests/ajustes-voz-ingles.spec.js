/* PACE · E2E · EN INGLÉS, AJUSTES NO OFRECE UNA VOZ QUE NO SUENA (v0.162.0)
 * =========================================================================
 * Las locuciones de Respira solo existen en castellano: en inglés suena el tono aunque se elija
 * una voz. Hasta v0.161.0 Ajustes dejaba marcada «Clear voice» debajo de la nota que lo
 * explicaba. Ez eligió (13 oct.) que en inglés quede marcado «Tone», que es lo que suena, y las
 * dos voces atenuadas, sin tocar lo guardado: al volver al castellano vuelve la voz elegida.
 * Y «Plays behind» pasa a «In the background».
 *
 * Contra v0.161.0 cae: «Clear voice» salía marcada y se podía pulsar.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test('en inglés las voces se ven atenuadas y marca «Tone»; en castellano vuelve la voz', async ({ page, context }) => {
  await sembrar(context, { lang: 'en', voice: 'sulafat', voiceOn: true, soundOn: true });
  await irAlArtefacto(page);
  await page.keyboard.press('t');
  const fila = page.locator('[data-pace-aj-fila="signal"]');
  await expect(fila.getByRole('button', { name: 'Tone' })).toHaveAttribute('aria-pressed', 'true');
  await expect(fila.getByRole('button', { name: 'Clear voice' })).toBeDisabled();
  await expect(fila.getByRole('button', { name: 'Deep voice' })).toBeDisabled();
  await expect(page.locator('[data-pace-aj-fila="bg"]')).toContainText('In the background');
  /* Lo guardado no se toca. */
  expect(await page.evaluate(() => window.getState().voice)).toBe('sulafat');

  await page.getByRole('button', { name: 'Español', exact: true }).click();
  const filaEs = page.locator('[data-pace-aj-fila="signal"]');
  await expect(filaEs.getByRole('button', { name: 'Voz clara' })).toHaveAttribute('aria-pressed', 'true');
  await expect(filaEs.getByRole('button', { name: 'Voz clara' })).toBeEnabled();
});
