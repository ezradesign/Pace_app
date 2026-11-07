/* PACE · E2E · EL BLOQUE DE ANTES DE UNA REUNIÓN, EMPEZADO TARDE (caza de la semana, 7 nov. 2026)
 * ===========================================================================================
 * Martes con una reunión de 10:00 a 11:00. La jornada empieza a las 8:52; el bloque 1 acaba a las
 * 9:37 y el plan pone el bloque 2 de 9:42 a 10:00. Quien vuelve de la pausa a las 9:45:
 *  · ve el aro en 15:00, lo que cabe antes de la reunión, y el bloque acaba a las 10:00; antes, el
 *    aro se quedaba en 18:00, el bloque acababa a las 10:03 dentro de la reunión y la línea corría
 *    la reunión a las 10:03 (`ritmoDurSiEmpiezas`, app/state-ritmo.jsx);
 *  · los bloques que vienen siguen con su duración (no es «otra duración», `dia.bloque`);
 *  · la ventana de después no habla de un «Foco de 45 minutos»: los minutos son los del bloque que
 *    acaba de terminar, no los del aro, que ya mide el siguiente (`breakPropuesta`).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, terminarBloque, capturarErrores } = require('./helpers');

const MARTES = new Date(2026, 10, 10, 8, 52);
const RITMO = {
  semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'],
  horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
  ocupado: { fecha: '2026-11-10', tramos: [[600, 60], [900, 30]], fuente: 'google' },
};
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const plan = (page) => page.evaluate(() => ritmoPlan(getState()).m.items.map((it) => it.tipo[0] + ritmoHora(it.desde) + '+' + it.dur).join(' '));

test('empezado tarde, el bloque de antes de la reunión acaba al empezarla y la ventana dice lo que duró', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: RITMO, lastActiveDay: new Date(2026, 10, 9).toDateString() });
  await page.clock.install({ time: MARTES });
  await irAlArtefacto(page);
  const comienza = vis(page, '[data-pace-ritmo-comienza]');
  if (await comienza.count()) await comienza.first().click();
  await vis(page, '[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"]').first().click();
  await vis(page, '[data-pace-cta]').first().click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
  expect(await plan(page), 'GUARD: el bloque 2 va de 9:42 a 10:00, pegado a la reunión').toContain('f9:42+18 o10:00+60');
  await vis(page, '[data-pace-break-shortcut] button').first().click();

  /* 9:45: tres minutos tarde. */
  await page.clock.fastForward(new Date(2026, 10, 10, 9, 45).getTime() - await page.evaluate(() => Date.now()));
  await page.waitForTimeout(300);
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Bloque 2 de 8');
  await expect(vis(page, '[data-pace-dial-number]'), 'el aro mide lo que cabe antes de la reunión').toHaveText('15:00');
  await vis(page, '[data-pace-cta]').first().click();
  await page.waitForTimeout(250);
  const timer = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')));
  expect(timer.minutes).toBe(15);
  expect(new Date(timer.endsAt).toTimeString().slice(0, 5), 'acaba al empezar la reunión').toBe('10:00');
  const tras = await plan(page);
  expect(tras, 'la reunión sigue a las 10:00').toContain('f9:45+15 o10:00+60');
  expect(tras, 'el bloque siguiente, con su duración').toContain('f11:00+45');
  expect(await page.evaluate(() => getState().ritmo.dia.bloque || null)).toBeNull();

  await terminarBloque(page);
  const ventana = vis(page, '[data-pace-modal-card]').first();
  await expect(ventana).toBeVisible();
  await expect(ventana, 'los minutos del bloque que acaba de terminar, no los del siguiente').not.toContainText('45 minutos');
  const prop = await page.evaluate(() => breakPropuesta(getState()));
  expect(prop.porque === 'sitting' ? prop.datos.n : 15).toBe(15);
  expect(errores).toEqual([]);
});
