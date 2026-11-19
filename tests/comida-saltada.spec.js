/* PACE · E2E · VOLVER AL FOCO EN PLENA COMIDA LA CORTA AHÍ (caza del 19 nov. 2026)
 * ==========================================================================
 * Ez: «si te saltas la comida… hay bugs raros». Con la comida de 14:00 a 15:00, empezar el bloque 2 a
 * las 14:05 (o volver antes de tiempo tras «Ir a comer») guardaba la comida ENTERA como hecha: la
 * línea pintaba la comida hasta las 15:00 y el bloque encima, desde las 14:05, y Estadísticas › Hoy
 * contaba una hora lejos de la pantalla. La comida dura lo que duró: hasta que empezaste el bloque.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { capturarErrores } = require('./helpers');
const { plan, pasado, vis, hasta, enLaComida } = require('./comida.helpers');

/* Ningún tramo empieza antes de que acabe el anterior (la pausa saltada sí se solapa con el bloque que
   la salta: es como se pinta desde s195, y aquí no hay ninguna). */
const sinSolapes = (page) => page.evaluate(() => {
  const items = ritmoPlan(getState()).m.items;
  return items.slice(1).filter((it, i) => it.desde < items[i].desde + items[i].dur && items[i].tipo !== 'pausa')
    .map((it, i) => items[i].tipo + ritmoHora(items[i].desde) + '+' + items[i].dur + ' / ' + it.tipo + ritmoHora(it.desde));
});

test('saltarse la comida: el bloque 2 a las 14:05 deja la comida en 5 minutos, sin pisarse', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await enLaComida(page, context);
  await hasta(page, '14:05');
  await vis(page, '[data-pace-cta]').first().click();
  await page.waitForTimeout(400);
  expect(await pasado(page), 'la comida se guardaba entera, de 14:00 a 15:00').toBe('f13:15+45 c14:00+5');
  expect(await sinSolapes(page), 'el bloque de las 14:05 iba encima de la comida').toEqual([]);
  expect(await plan(page)).toMatch(/^f13:15\+45 c14:00\+5 f14:05\+45 /);
  expect(errores).toEqual([]);
});

test('volver antes tras «Ir a comer»: a las 14:40, la comida cuenta 40 minutos (también en Estadísticas)', async ({ page, context }) => {
  await enLaComida(page, context, 'Ir a comer');
  await hasta(page, '14:40');
  await vis(page, '[data-pace-cta]').first().click();
  await page.waitForTimeout(400);
  expect(await pasado(page)).toBe('f13:15+45 c14:00+40');
  expect(await sinSolapes(page)).toEqual([]);
  const hoy = await page.evaluate(() => statsHoyParadas(ritmoPlan(getState())).filter((x) => x.comida).map((x) => ritmoHora(x.it.desde) + '+' + x.it.dur));
  expect(hoy, 'Estadísticas › Hoy contaba la hora entera').toEqual(['14:00+40']);
});

test('«Seguir con el bloque 2» a las 14:00 en punto: la comida no vuelve más tarde', async ({ page, context }) => {
  await enLaComida(page, context, 'Seguir con el bloque 2');
  await page.waitForTimeout(400);
  expect(await sinSolapes(page)).toEqual([]);
  const p = await plan(page);
  expect(p).toMatch(/^f13:15\+45 c14:00\+0 f14:00\+45 /);
  expect(p.match(/c\d/g).length, 'una sola comida (y el cierre)').toBe(2);
});

test('CONTROL · volver a su hora, a las 15:00, deja la comida entera', async ({ page, context }) => {
  await enLaComida(page, context, 'Ir a comer');
  await hasta(page, '15:00');
  await vis(page, '[data-pace-cta]').first().click();
  await page.waitForTimeout(400);
  expect(await plan(page)).toMatch(/^f13:15\+45 c14:00\+60 f15:00\+45 /);
});
