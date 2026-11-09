/* PACE · E2E · TUS MINUTOS DESPUÉS DE LA JORNADA (Ez, S3 A del 8 nov. 2026; caza de la semana)
 * ========================================================================================
 * El aro mide lo que mide el bloque que toca, y al acabar el día se quedaba con los minutos del
 * último: «Seguir por libre» y el Foco de la mañana siguiente empezaban de 33. Ahora vuelven tus
 * minutos de antes del día, y 25 si nunca los cambiaste:
 *  · en el acto, al acabar el último bloque (sin esperar al minuto del aro);
 *  · al cerrarse el día por la hora con bloques sin hacer;
 *  · y a la mañana siguiente, antes de preparar el día.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior, terminarBloque } = require('./helpers');

const HOY = '2026-10-14';
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const a = (hhmm, dia) => new Date((dia || HOY) + 'T' + hhmm + ':00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const minutos = (page) => page.evaluate(() => getState().focusMinutes);
const hastaLas = async (page, ms) => {
  for (let i = 0; i < 200 && await page.evaluate(() => Date.now()) < ms; i++) {
    await page.clock.fastForward(Math.min(5 * 60 * 1000, ms - await page.evaluate(() => Date.now())));
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(300);
};

test('en el acto, al acabar el último bloque: «Seguir por libre» empieza con tus minutos', async ({ page, context }) => {
  /* «Una hora» a las 9:00: dos bloques de 25 con su pausa. Tus minutos, 15. */
  await sembrar(context, { focusMinutes: 15, ritmo: { horario: HORARIO, dia: { fecha: HOY, opcion: '1h', desde: 540, cicloBase: 0, cambios: {} } } });
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
  expect(await minutos(page), 'GUARD: el plan pone sus minutos').toBe(25);
  await vis(page, '[data-pace-cta]').first().click();
  await terminarBloque(page);
  await overlaySuperior(page).getByRole('button', { name: 'Ahora no', exact: true }).click();
  await vis(page, '[data-pace-aro-seguir]').click();   /* «Empezar ya el bloque 2» */
  await page.waitForTimeout(300);
  await terminarBloque(page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await expect(vis(page, '[data-pace-dial-label]'), 'GUARD: el día se cerró').toHaveText('Jornada cerrada');
  expect(await minutos(page), 'se quedaba con los 25 del último bloque').toBe(15);
  await expect(vis(page, '[data-pace-dial-number]')).toHaveText('15:00');
  await vis(page, '[data-pace-cta]').click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).minutes)).toBe(15);
});

test('cerrado por la hora, y a la mañana siguiente: 25 si nunca los cambiaste', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: HORARIO, dia: { fecha: HOY, opcion: '2h', desde: 900, cicloBase: 0, cambios: {} } } });
  await page.clock.install({ time: a('15:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
  expect(await minutos(page), 'GUARD: «Dos horas» pone bloques de 35').toBe(35);
  /* El bloque 1 y nada más: a las 17:10 el día se cerró por la hora con dos bloques sin hacer. */
  await vis(page, '[data-pace-cta]').first().click();
  await terminarBloque(page);
  await overlaySuperior(page).getByRole('button', { name: 'Ahora no', exact: true }).click();
  await hastaLas(page, a('17:10').getTime());
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Jornada cerrada');
  await expect.poll(() => minutos(page), { message: 'se quedaba con los 35 del plan' }).toBe(25);
  /* La mañana siguiente, antes de preparar el día. */
  await hastaLas(page, a('08:30', '2026-10-15').getTime());
  await page.reload();
  await page.locator('[data-pace-dial-number]').first().waitFor();
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Foco manual');
  await expect(vis(page, '[data-pace-dial-number]')).toHaveText('25:00');
});

test('tus minutos se guardan cuando el plan pone los suyos, y «Hoy voy por libre» los devuelve', async ({ page, context }) => {
  await sembrar(context, { focusMinutes: 35, ritmo: { horario: HORARIO, dia: { fecha: HOY, opcion: '1h', desde: 540, cicloBase: 0, cambios: {} } } });
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => getState().ritmo.focoLibre), 'tus minutos se guardan al poner el plan los suyos').toBe(35);
  await vis(page, '[data-pace-ritmo-libre]').first().click();
  await page.waitForTimeout(300);
  await page.clock.fastForward(61 * 1000);
  await page.waitForTimeout(300);
  expect(await minutos(page), 'yendo por libre, vuelven tus minutos').toBe(35);
});
