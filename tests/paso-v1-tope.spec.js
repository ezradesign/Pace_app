/* PACE · E2E · LA SEMANA DE PRUEBA NO SE ALARGA EDITANDO UNA COPIA (Ez, O1 A de la octava, 11 nov. 2026)
 * ======================================================================================================
 * `pasoV1.hasta` viaja en la copia de «Tus datos». Importar una copia es escribirla en el almacén y
 * recargar, así que lo que se defiende es el ARRANQUE: el saneador (app/state-core.sanea.js) topa `hasta`
 * a siete días desde `at`, y un `at` del futuro cuenta como ahora.
 * Sin el bloque de `pasoV1` del saneador caen las dos primeras; el CONTROL no se mueve.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const DIA = 24 * 3600 * 1000;
const BASE = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, novedadesVistas: '*', totalFocusMin: 300 };

async function abrirEnV1(page, context, pasoV1) {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
  });
  await sembrar(context, Object.assign({}, BASE, { pasoV1 }));
  await irAlArtefacto(page);
  return page.evaluate(() => ({ paso: window.getState().pasoV1, vigente: window.pacePruebaV1Vigente(), hasta: window.pacePruebaV1Hasta(), ahora: Date.now() }));
}

test('una copia con la semana alargada a dos meses vuelve a siete días desde que empezó', async ({ page, context }) => {
  const at = Date.now() - 2 * DIA;
  const r = await abrirEnV1(page, context, { at, previo: true, hasta: at + 60 * DIA, rutinas: [], avisado: true });
  expect(r.paso.hasta, 'la semana de prueba sigue alargada').toBe(at + 7 * DIA);
  expect(r.hasta).toBe(at + 7 * DIA);
  expect(r.vigente).toBe(true);
});

test('empezó hace nueve días y la copia dice que dura un mes más: ya acabó', async ({ page, context }) => {
  const at = Date.now() - 9 * DIA;
  const r = await abrirEnV1(page, context, { at, previo: true, hasta: Date.now() + 30 * DIA, rutinas: [], avisado: true });
  expect(r.vigente, 'la semana de prueba sigue abierta pasados siete días').toBe(false);
  expect(r.hasta).toBe(null);
});

test('CONTROL · una semana de siete días sin tocar se queda como estaba', async ({ page, context }) => {
  const at = Date.now() - 3 * DIA;
  const paso = { at, previo: true, hasta: at + 7 * DIA, rutinas: ['extra.hang.bar'], avisado: true };
  const r = await abrirEnV1(page, context, paso);
  expect(r.paso).toEqual(paso);
  expect(r.vigente).toBe(true);
});
