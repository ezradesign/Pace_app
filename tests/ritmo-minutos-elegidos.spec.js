/* PACE · E2E · con el día servido, los minutos que eliges se quedan hasta que empiezas
 * ==================================================================================
 * Ez, 2A de la caza de huecos (23 nov. 2026). Con la jornada puesta y el bloque sin empezar, tocar 15
 * encima del aro ponía 15:00, y al minuto `ritmoSincronizar` volvía a 45:00 sin avisar. En plena comida,
 * igual, y «Luego» seguía diciendo 45 min. Ahora lo elegido se queda (también tras recargar), «Después»
 * y «Luego» lo dicen, y el bloque dura eso. Contra la 0.215.0 caen las tres primeras.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { HOY, HORARIO, a, vis } = require('./comida.helpers');

const diaDesde = (desde) => ({ ritmo: { horario: HORARIO, dia: { fecha: HOY, opcion: 'jornada', desde, cicloBase: 0, cambios: {} } } });
const numero = (page) => vis(page, '[data-pace-dial-number]').first();
const chip = (page, n) => vis(page, 'button').filter({ hasText: new RegExp('^' + n + '$') }).first();

test('a las 9:00, 15 se queda pasado el minuto y tras recargar, y el bloque dura 15', async ({ page, context }) => {
  await sembrar(context, diaDesde(540));
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  await expect(numero(page)).toHaveText('45:00');
  await chip(page, 15).click({ force: true });
  await expect(numero(page)).toHaveText('15:00');
  await page.clock.runFor(61000);
  await page.waitForTimeout(300);
  await expect(numero(page), 'no vuelve solo a 45 al minuto').toHaveText('15:00');
  await page.reload();
  await numero(page).waitFor({ state: 'visible' });
  await page.clock.runFor(61000);
  await expect(numero(page), 'tras recargar, sigue en 15').toHaveText('15:00');
  await vis(page, '[data-pace-cta]').first().click();
  await page.waitForTimeout(400);
  const t = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1') || 'null'));
  expect(t && t.minutes, 'el bloque empezado dura lo elegido').toBe(15);
  expect(await page.evaluate(() => getState().ritmo.dia.minutosElegidos || null), 'empezado, la elección se borra').toBeNull();
});

test('en plena comida, 15 se queda y «Después» y «Luego» dicen 15 min', async ({ page, context }) => {
  await sembrar(context, diaDesde(860));
  await page.clock.install({ time: a('14:20') });
  await irAlArtefacto(page);
  await expect(vis(page, '[data-pace-dial-label]').first(), 'GUARD: el aro de la comida').toHaveText('Comida');
  await chip(page, 15).click({ force: true });
  await page.clock.runFor(61000);
  await page.waitForTimeout(300);
  await expect(vis(page, '[data-pace-aro-despues]').first()).toHaveText('Después: bloque 1 · 15 min');
  /* La tarjeta del móvil, a 360 px. */
  await page.setViewportSize({ width: 360, height: 640 });
  await page.waitForTimeout(400);
  await expect(vis(page, '.pace-rt-mov [data-pace-ritmo-luego]').first()).toContainText('15 min');
  await expect(chip(page, 15)).toHaveAttribute('aria-pressed', 'true');
});

test('elegir lo mismo que el plan quita la elección', async ({ page, context }) => {
  await sembrar(context, diaDesde(540));
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  await chip(page, 15).click({ force: true });
  expect(await page.evaluate(() => getState().ritmo.dia.minutosElegidos)).toEqual({ min: 15, bloque: 0 });
  await chip(page, 45).click({ force: true });
  expect(await page.evaluate(() => getState().ritmo.dia.minutosElegidos)).toBeNull();
  await page.clock.runFor(61000);
  await expect(numero(page)).toHaveText('45:00');
});

test('por libre, como siempre: lo elegido se queda', async ({ page, context }) => {
  await sembrar(context, { ritmo: { libre: true } });
  await page.clock.install({ time: a('10:00') });
  await irAlArtefacto(page);
  await chip(page, 15).click({ force: true });
  await page.clock.runFor(61000);
  await expect(numero(page)).toHaveText('15:00');
});
