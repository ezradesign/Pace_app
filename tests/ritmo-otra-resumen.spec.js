/* PACE · E2E · LO QUE SE DESCARTA CON «OTRA» LLEGA AL RESUMEN DEL DÍA (caza de la semana, 7 nov. 2026)
 * ==================================================================================================
 * El motor de la semana propone que una rutina descanse contando lo descartado con «Otra» en los
 * resúmenes de cada día (`ritmo.day.closed`, `platos[].antes`). El resumen lo sacaba recomponiendo
 * el día y se lo saltaba en lo congelado; y en un día de verdad lo pasado está congelado en cuanto
 * un bloque empieza a otra hora que la del plan. La persona que cambió la primera pausa tres días
 * dejaba `otras: 1, antes: []` y la carta nunca podía proponerlo. Ahora «Otra» apunta en el día lo
 * que descarta (`dia.descartes`) y el resumen lo usa.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, terminarBloque, capturarErrores, esperarEnPagina } = require('./helpers');

const LUNES = new Date(2026, 10, 9, 9, 0);
const RITMO = {
  semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'],
  horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
};
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const platoDe = (page, ord) => page.evaluate((n) => {
  const p = ritmoPlan(getState());
  const it = p.m.items.filter((x) => x.tipo === 'pausa' || x.tipo === 'cierre')[n - 1];
  return { id: it.platos[0].id, clave: it.platos[0].clave };
}, ord);

test('«Otra» en una pausa que luego se congela: el resumen dice qué rutina se descartó', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: RITMO, lastActiveDay: new Date(2026, 10, 8).toDateString() });
  await page.clock.install({ time: LUNES });
  await irAlArtefacto(page);
  const comienza = vis(page, '[data-pace-ritmo-comienza]');
  if (await comienza.count()) await comienza.first().click();
  await vis(page, '[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"]').first().click();
  await vis(page, '[data-pace-cta]').first().click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
  await vis(page, '[data-pace-break-shortcut] button').first().click();

  /* «Otra» en la pausa abierta (en el escritorio vive en la ficha de la parada; aquí, su acción). */
  const antes = await platoDe(page, 1);
  await page.evaluate((c) => ritmoOtra([c]), antes.clave);
  const despues = await platoDe(page, 1);
  expect(despues.id, 'GUARD: «Otra» cambia la rutina de la pausa').not.toBe(antes.id);

  /* El bloque 2, antes de su hora: lo de antes (la pausa cambiada) queda congelado. */
  await page.clock.fastForward(3 * 60 * 1000);
  await page.waitForTimeout(200);
  await vis(page, 'button').filter({ hasText: /^Empezar ya el bloque 2$/ }).first().click();
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => (getState().ritmo.dia.pasado || []).some((x) => x.tipo === 'pausa')), 'GUARD: la pausa cambiada ya es historia (`dia.pasado`)').toBe(true);

  /* Al día siguiente el lunes se resume. */
  await page.clock.fastForward(new Date(2026, 10, 10, 9, 0).getTime() - await page.evaluate(() => Date.now()));
  await page.evaluate(() => ritmoResumirAhora());
  await esperarEnPagina(page, () => (window.paceEventsSnapshot().events || []).some((e) => e.type === 'ritmo.day.closed'), null, { timeout: 8000 });
  const parada = await page.evaluate(() => window.paceEventsSnapshot().events.find((e) => e.type === 'ritmo.day.closed').payload.paradas[0]);
  expect(parada.platos[0].id).toBe(despues.id);
  expect(parada.platos[0].otras).toBe(1);
  expect(parada.platos[0].antes, 'lo descartado, para que el motor pueda proponer que descanse').toEqual([antes.id]);
  expect(errores).toEqual([]);
});
