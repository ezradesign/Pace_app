/* PACE · E2E · TRES DÍAS CON «OTRA» SOBRE LA MISMA RUTINA, Y EL LUNES LA CARTA PROPONE QUE DESCANSE
 * ==================================================================================================
 * De punta a punta (caza de la semana, 7 nov. 2026): una persona cambia con «Otra» la misma rutina
 * el lunes, el martes y el miércoles, con la página abierta de un día a otro y los bloques empezados
 * antes de su hora (lo que congela lo de antes, como en un día de verdad). El lunes siguiente la carta
 * propone que esa rutina descanse. Antes, el resumen de cada día perdía lo descartado en cuanto la
 * pausa quedaba congelada (`antes: []`), y la carta no podía proponerlo nunca con datos de uso real.
 * La pieza del resumen la defiende `ritmo-otra-resumen.spec.js`; esta, que llega a la carta.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, terminarBloque, capturarErrores, esperarEnPagina } = require('./helpers');

const RITMO = {
  semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'],
  horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
};
const D = (d, h, m) => new Date(2026, 10, d, h, m || 0).getTime();
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

async function irA(page, ms) {
  const ahora = await page.evaluate(() => Date.now());
  if (ms > ahora) await page.clock.fastForward(ms - ahora);
  await page.waitForTimeout(250);
}

/* La pausa (aún sin congelar) que sirve esa rutina hoy, o la primera si no se pide ninguna. */
const pausaCon = (page, id) => page.evaluate((x) => {
  const p = ritmoPlan(getState());
  for (const it of p.m.items) {
    if (it.tipo !== 'pausa' || it.congelado) continue;
    const pl = (it.platos || []).find((q) => !x || q.id === x);
    if (pl) return { id: pl.id, clave: pl.clave, hora: ritmoHora(it.desde) };
  }
  return null;
}, id);

test('«Otra» tres días sobre la misma rutina: el lunes siguiente la carta propone que descanse', async ({ page, context }) => {
  test.setTimeout(120000);
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: RITMO, lastActiveDay: new Date(2026, 10, 8).toDateString() });
  await page.clock.install({ time: D(9, 8, 55) });
  await irAlArtefacto(page);

  /* Cambia la rutina de la primera pausa del lunes cada vez que el día la sirve: el martes y el
     jueves en la primera pausa, el miércoles no sale (las rutinas cambian de un día a otro). */
  let rutina = null;
  const cambiada = [];
  for (const d of [9, 10, 11, 12]) {
    if (d !== 9) { await irA(page, D(d, 8, 55)); await page.reload(); await page.waitForTimeout(800); }
    const comienza = vis(page, '[data-pace-ritmo-comienza]');
    if (await comienza.count()) await comienza.first().click();
    await vis(page, '[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"]').first().click();
    await vis(page, '[data-pace-cta]').first().click();
    await page.waitForTimeout(250);
    await terminarBloque(page);
    await vis(page, '[data-pace-break-shortcut] button:not([data-pace-break-cuenta])').first().click();   /* «Ahora no» */

    const antes = await pausaCon(page, rutina);
    if (antes) {
      rutina = antes.id;
      cambiada.push(d + ' ' + antes.hora);
      await page.evaluate((c) => ritmoOtra([c]), antes.clave);
      const despues = await page.evaluate((c) => ritmoPlan(getState()).m.items.flatMap((it) => it.platos || []).find((q) => q.clave === c).id, antes.clave);
      expect(despues, 'GUARD: «Otra» cambia la rutina').not.toBe(rutina);
    }

    /* El bloque 2 antes de su hora congela lo de antes, como en un día de verdad. */
    await page.clock.fastForward(3 * 60 * 1000);
    await page.waitForTimeout(200);
    await vis(page, 'button').filter({ hasText: /^Empezar ya el bloque 2$/ }).first().click();
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => (getState().ritmo.dia.pasado || []).length > 0), 'GUARD: lo de antes es historia').toBe(true);
  }
  expect(cambiada.length, 'GUARD: la misma rutina, cambiada tres días (' + cambiada.join(' · ') + ')').toBe(3);

  /* El lunes 16, la carta de la semana del 9 al 15. */
  await irA(page, D(16, 8, 50));
  await page.reload();
  await esperarEnPagina(page, () => { const c = getState().ritmo.carta; return !!(c && c.lunes === '2026-11-16'); }, null, { timeout: 20000 });
  const carta = await page.evaluate(() => ({
    antes: (window.paceEventsSnapshot().events || []).filter((e) => e.type === 'ritmo.day.closed')
      .map((e) => e.payload.fecha + ' ' + e.payload.paradas.flatMap((p) => p.platos.flatMap((q) => q.antes || [])).join(',')),
    cambios: getState().ritmo.carta.res.cambios.map((c) => c.tipo + ':' + (c.id || c.campo || c.hora)),
  }));
  expect(carta.antes.filter((x) => x.includes(rutina)).length, 'lo descartado llega a tres resúmenes: ' + carta.antes.join(' · ')).toBe(3);
  expect(carta.cambios, 'la carta propone que descanse lo cambiado tres veces').toContain('descansa:' + rutina);
  await expect(vis(page, '[data-pace-carta] [data-pace-carta-cambio="descansa"]').first()).toBeVisible();
  expect(errores).toEqual([]);
});
