/* PACE · E2E · LA DURACIÓN DECLARADA DE CADA RUTINA CASA CON LA QUE DURA (v0.161.0)
 * =================================================================================
 * La tarjeta y la vista previa enseñan la duración CALCULADA (`estimateDuration`, s115),
 * pero el filtro «≤ N min» de la biblioteca, y quien cuente con `routine.min`, usan la
 * DECLARADA. En el recorrido del 13 oct. «Sentadilla en pared» declaraba 2 min y duraba
 * 3: salía en «≤ 2 min» con «3 MIN» en la tarjeta. El aviso existía, pero solo en la
 * consola de desarrollo.
 *
 * Contra v0.160.0 cae con `extra.wall.sit`.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test('ninguna rutina de Mueve ni de Estira declara unos minutos que no dura', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const todas = [];
    const andar = (v, d) => {
      if (!v || typeof v !== 'object' || d > 5) return;
      if (Array.isArray(v)) { v.forEach((x) => andar(x, d + 1)); return; }
      if (v.id && Array.isArray(v.steps) && typeof v.min === 'number') { todas.push(v); return; }
      Object.values(v).forEach((x) => andar(x, d + 1));
    };
    andar(window.MOVE_ROUTINES, 0); andar(window.EXTRA_ROUTINES, 0);
    const descanso = (window.getState && window.getState().restBetweenSets) || 30;
    const fuera = [];
    for (const rt of todas) {
      const est = window.estimateDuration(rt, descanso);
      const lo = Math.floor(est.minSec / 60), hi = Math.ceil(est.maxSec / 60);
      if (rt.min < lo || rt.min > hi) fuera.push(rt.id + ': declara ' + rt.min + ' min y dura ' + lo + '–' + hi);
    }
    return { cuantas: todas.length, fuera };
  });
  /* GUARD DE CERO: si el catálogo dejara de encontrarse, el aserto de abajo pasaría vacío. */
  expect(r.cuantas, 'no encuentro las rutinas de Mueve y Estira').toBeGreaterThan(20);
  expect(r.fuera, 'rutinas cuya duración declarada no es la que dura').toEqual([]);
});
