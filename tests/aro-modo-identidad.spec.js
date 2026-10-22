/* PACE · E2E · UNA PAUSA NO SE VUELVE FOCO (auditoría del 21 oct. 2026)
 * ======================================================================
 * El reloj del aro solo se reiniciaba si cambiaba su DURACIÓN. Con el Foco a 5 min (la
 * pausa corta dura 5) o a 15 (la larga dura 15), cambiar de modo en la barra de arriba
 * no lo reiniciaba: la pausa seguía corriendo como Foco y, al acabar, contaba como un
 * bloque de trabajo. Ahora el reloj es el de un modo y una duración: cambiar cualquiera
 * de los dos lo deja a cero, en marcha o en pausa. Contra v0.174.0 falla.
 *
 * NO CUBRE: la confirmación al salir de una pausa empezada (la barra solo pregunta con
 * un Foco empezado), que no existe.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const numero = (p) => p.locator('[data-pace-dial-number]');
const cta = (p) => p.locator('[data-pace-cta]');
const modo = (p, nombre) => p.locator('[data-pace-tabs] button').filter({ hasText: nombre });

async function abrir(page, context, minutos) {
  await sembrar(context, { soundOn: false, focusMinutes: minutos });
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  await context.clock.pauseAt(new Date(ARRANQUE.getTime() + 60 * 1000));
}

for (const [pausa, minutos, texto] of [['Pausa', 5, '05:00'], ['Larga', 15, '15:00']]) {
  for (const parada of [false, true]) {
    test(pausa + ' de ' + minutos + ' min ' + (parada ? 'en pausa' : 'en marcha') + ' → Foco de ' + minutos + ': empieza a cero y no cuenta como foco', async ({ page, context }) => {
      await abrir(page, context, minutos);
      await expect(numero(page)).toHaveText(texto);
      await modo(page, pausa).click();
      await expect(cta(page)).toHaveText('Empezar pausa');
      await cta(page).click();
      await context.clock.fastForward(4 * 60 * 1000);
      await context.clock.runFor(1000);
      if (parada) {
        await cta(page).click();
        await expect(cta(page)).toHaveText('Continuar');
      }
      expect(await numero(page).textContent(), 'la pausa ha corrido').not.toBe(texto);

      await modo(page, 'Foco').click();
      /* el Foco empieza entero y parado: no hereda el tiempo de la pausa */
      await expect(numero(page)).toHaveText(texto);
      await expect(cta(page)).toHaveText('Empezar foco');
      /* y pasado lo que le quedaba a la pausa, nada cuenta como trabajo */
      await context.clock.fastForward(minutos * 60 * 1000);
      await context.clock.runFor(2000);
      expect(await page.evaluate(() => getState().cycle || 0), 'la pausa se contó como foco').toBe(0);
      expect(await page.evaluate(() => getState().totalFocusMin || 0)).toBe(0);
      await expect(numero(page)).toHaveText(texto);
    });
  }
}

test('CONTROL · el Foco de 5 empezado desde cero acaba a los 5 minutos y cuenta', async ({ page, context }) => {
  await abrir(page, context, 5);
  await modo(page, 'Pausa').click();
  await modo(page, 'Foco').click();
  await cta(page).click();
  await context.clock.fastForward(5 * 60 * 1000 + 2000);
  await expect.poll(() => page.evaluate(() => getState().cycle)).toBe(1);
  expect(await page.evaluate(() => getState().totalFocusMin)).toBe(5);
});
