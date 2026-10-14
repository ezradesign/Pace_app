/* PACE · E2E · EN UN PLAN, EL RELOJ ENSEÑA EL BLOQUE QUE VIENE (v0.162.0)
 * =======================================================================
 * En el recorrido del 13 oct. salió que, al terminar el bloque 1 de «Una hora», la home decía
 * «BLOQUE 2 DE 3 · 00:00 · Empezar bloque 2»: la etiqueta ya era la del bloque siguiente y el
 * reloj, el del que acabó, así que se leía como un bloque de cero minutos. Ez eligió que el
 * reloj enseñe lo que dura el siguiente. Sin plan, el 00:00 se queda (allí la etiqueta sigue
 * siendo la del bloque terminado).
 *
 * Contra v0.161.0 cae la primera: el reloj decía 00:00.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

async function bloqueDe15(page) {
  await page.getByRole('button', { name: /^15$/ }).filter({ visible: true }).first().click();
  await page.locator('[data-pace-cta]').click();
  await page.clock.runFor(15 * 60 * 1000 + 2000);
  await page.keyboard.press('Escape');
}

test('con el plan «Una hora», al terminar el bloque 1 el reloj dice los 15:00 del bloque 2', async ({ page, context }) => {
  await sembrar(context, { ritmo: {} });
  await page.clock.install({ time: new Date('2026-10-13T10:00:00') });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /Una hora/ }).filter({ visible: true }).first().click();
  await bloqueDe15(page);
  await expect(page.locator('[data-pace-dial-label]')).toHaveText(/Bloque 2 de 3/i);
  await expect(page.locator('[data-pace-dial-number]'), 'el reloj del bloque siguiente').toHaveText('15:00');
  await expect(page.locator('[data-pace-cta]')).toHaveText(/Empezar bloque 2/);
});

test('sin plan, al terminar el bloque el reloj se queda en 00:00', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date('2026-10-13T10:00:00') });
  await irAlArtefacto(page);
  await bloqueDe15(page);
  await expect(page.locator('[data-pace-dial-number]')).toHaveText('00:00');
  await expect(page.locator('[data-pace-cta]')).toHaveText(/Empezar otro ciclo/);
});
