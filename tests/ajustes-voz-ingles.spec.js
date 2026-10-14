/* PACE · E2E · EN INGLÉS, AJUSTES OFRECE LAS VOCES COMO EN CASTELLANO
 * ===================================================================
 * Desde v0.162.0 y hasta que hubo voces grabadas en inglés, Ajustes marcaba «Tone» con la app en
 * inglés y atenuaba las dos voces, con una línea que decía que la voz solo hablaba castellano
 * (Ez, 13 oct.). Con «Inhale / Hold / Exhale» grabadas (14 oct.) la fila es la misma en los dos
 * idiomas: marca la voz elegida, se puede cambiar, y la línea se va. «In the background» sigue.
 *
 * Contra v0.163.0 cae: en inglés salía marcado «Tone» y las voces no se podían pulsar.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test('en inglés Ajustes marca la voz elegida, deja cambiarla y no dice que solo hable castellano', async ({ page, context }) => {
  await sembrar(context, { lang: 'en', voice: 'sulafat', voiceOn: true, soundOn: true });
  await irAlArtefacto(page);
  await page.keyboard.press('t');
  const fila = page.locator('[data-pace-aj-fila="signal"]');
  await expect(fila.getByRole('button', { name: 'Clear voice' })).toHaveAttribute('aria-pressed', 'true');
  await expect(fila.getByRole('button', { name: 'Deep voice' })).toBeEnabled();
  await expect(fila).not.toContainText('Spanish');
  await expect(page.locator('[data-pace-aj-fila="bg"]')).toContainText('In the background');

  await fila.getByRole('button', { name: 'Deep voice' }).click();
  await expect(fila.getByRole('button', { name: 'Deep voice' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => window.getState().voice)).toBe('bradford');

  await page.getByRole('button', { name: 'Español', exact: true }).click();
  const filaEs = page.locator('[data-pace-aj-fila="signal"]');
  await expect(filaEs.getByRole('button', { name: 'Voz grave' })).toHaveAttribute('aria-pressed', 'true');
});
