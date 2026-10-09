/* PACE · E2E · UN SELLO NO PISA NADA (9 oct. 2026)
 * ================================================
 * Ez: «los sellos no deben pisar los elementos». El aviso de un sello nuevo salía en el
 * acto, abajo y por encima de todo: con el primer Pomodoro tapaba el pie de la pausa,
 * «Saltar esta pausa» incluido. Ahora espera mientras haya una ventana, una sesión o un
 * Camino abierto (state-core.toast.jsx) y sale al volver a la home.
 *
 * LO QUE NO CAMBIA, y se aserta: el sello se GANA al instante (s145; lo que espera es el
 * aviso) y el aplazamiento de los Caminos (s105) sigue funcionando por la misma cola.
 *
 * El aviso es el `div[aria-live]` de ToastHost (lo mismo que miran checklist-estado y
 * logros-i18n). Se espera 1,5 s antes de mirar que NO está: el buzón deja 0,4 s de respiro y
 * reintenta cada 0,5, así que en 1,5 s un aviso que no esperase ya habría salido. Y ese «no
 * está» se mira UNA vez (`sinAviso`): la negación de `toContainText` reintenta hasta que se
 * cumple, y un aviso que sí salió se va a los 3 s y lo daba por bueno.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, leerUltimoLogro, capturarErrores } = require('./helpers');

const aviso = (page) => page.locator('div[aria-live="polite"][aria-atomic="true"]');
const sinAviso = async (page, porque) => {
  await page.waitForTimeout(1500);
  expect(await aviso(page).textContent(), porque).not.toContain('Nuevo sello');
};

test('el primer Pomodoro: el sello no sale encima de la pausa, se gana igual y sale al cerrarla', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { focusMinutes: 15 });
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await page.waitForTimeout(250);
  for (let i = 0; i < 20; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  await expect(page.locator('[data-pace-break-shortcut]'), 'GUARD: no se abrió la pausa').toHaveCount(1);
  /* se ha ganado (s145), pero el aviso espera */
  await expect.poll(() => leerUltimoLogro(page), { message: 'GUARD: el primer Pomodoro no ganó su sello' }).toBe('first.step');
  await sinAviso(page, 'el sello sale encima de la pausa');
  await page.getByRole('button', { name: 'Saltar esta pausa', exact: true }).click();
  await expect(aviso(page), 'al cerrar la pausa el sello no sale').toContainText('Primer paso');
  expect(errores).toEqual([]);
});

test('durante una sesión el sello espera, y sale al volver a la home', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Box 4·4·4·4', exact: true }).click();
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion, 'GUARD: no se abrió la sesión').toHaveCount(1);
  await page.evaluate(() => showToast({ id: 'first.step', type: 'achievement' }));
  await sinAviso(page, 'el sello sale encima de la sesión');
  await page.keyboard.press('Escape');
  await expect(sesion, 'GUARD: la sesión no se cerró').toHaveCount(0);
  await expect(aviso(page), 'de vuelta en la home el sello no sale').toContainText('Primer paso');
});

test('el aplazamiento de los Caminos sigue: el sello espera a que se cierre su pantalla', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.evaluate(() => { setCaminoUiActive(true); showToast({ id: 'first.step', type: 'achievement' }); });
  await sinAviso(page, 'el sello sale encima de un Camino');
  await page.evaluate(() => setCaminoUiActive(false));
  await expect(aviso(page), 'al salir del Camino el sello no sale').toContainText('Primer paso');
});
