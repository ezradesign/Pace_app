/* PACE · Espacio solo pausa donde la pausa se ve
 * ==============================================
 * En la sesión de Respira, Espacio pausa y reanuda. En la preparación y en la
 * retención no hay botón de pausa ni aviso, y aun así Espacio pausaba: la cuenta
 * atrás se quedaba quieta sin decir nada, y al pulsar «Empezar ahora» o
 * «Respirar de nuevo» la sesión arrancaba ya pausada, con el aviso de inhalar
 * sonando y el círculo parado (caza de bugs del 7 de octubre, respira-4).
 *
 * Trampas, las de retencion.spec.js: el reloj se instala antes de `goto` y se
 * avanza de segundo en segundo, porque el ticker se resuscribe por fase.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(12); }
}

async function abrir(page, nombre) {
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: nombre, exact: true }).click();
  const modal = overlaySuperior(page);
  if (await modal.getByRole('button', { name: 'Empezar sesión' }).count()) {
    await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  await expect(page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' })).toBeVisible();
}

const sesion = page => page.locator('[data-pace-session-root]');

test('Espacio en la preparación no la congela: la cuenta sigue y la sesión arranca respirando', async ({ page }) => {
  await abrir(page, 'Box 4·4·4·4');
  await page.keyboard.press('Space');
  await segundos(page, 5);
  /* La preparación dura 3 s: pasada, la sesión está en marcha y su pie ofrece
     pausar, no reanudar. */
  await expect(sesion(page).getByRole('button', { name: /Pausar/ })).toBeVisible();
  await expect(sesion(page).getByRole('button', { name: /Reanudar/ })).toHaveCount(0);
});

test('Espacio y luego «Empezar ahora»: la sesión no nace pausada', async ({ page }) => {
  await abrir(page, 'Box 4·4·4·4');
  await page.keyboard.press('Space');
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
  await segundos(page, 1);
  await expect(sesion(page).getByRole('button', { name: /Pausar/ })).toBeVisible();
  await expect(sesion(page).getByRole('button', { name: /Reanudar/ })).toHaveCount(0);
});

test('Espacio en la retención y luego «Respirar de nuevo»: la ronda 2 arranca respirando', async ({ page }) => {
  await abrir(page, 'Rondas express');
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
  let enHold = false;
  for (let s = 0; s < 130 && !enHold; s++) {
    enHold = await page.evaluate(() => /RETÉN SIN AIRE/i.test(document.body.innerText || ''));
    if (!enHold) await segundos(page, 1);
  }
  expect(enHold, 'la sesión no llegó a la retención').toBe(true);
  await page.keyboard.press('Space');
  await segundos(page, 2);
  await sesion(page).getByRole('button', { name: 'Respirar de nuevo' }).click();
  await segundos(page, 1);
  await expect(sesion(page).getByRole('button', { name: /Pausar/ })).toBeVisible();
  await expect(sesion(page).getByRole('button', { name: /Reanudar/ })).toHaveCount(0);
});

test('en la sesión activa Espacio sigue pausando', async ({ page }) => {
  await abrir(page, 'Box 4·4·4·4');
  await sesion(page).getByRole('button', { name: 'Empezar ahora' }).click();
  await segundos(page, 1);
  await page.keyboard.press('Space');
  await expect(sesion(page).getByRole('button', { name: /Reanudar/ })).toBeVisible();
});
