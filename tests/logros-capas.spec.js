/* PACE · E2E · LOS LOGROS CON LAS CAPAS DE MUEVE Y ESTIRA (Ez, 24 oct. 2026: A)
 * ============================================================================
 * ATG y Ancestral dejan de salir en la lista (2A), así que sus cuatro logros («ATG asentado»,
 * «Ancestral», «Rodillas de acero» y «Primitiva») ya no se pueden ganar. Ez eligió la A: quien
 * ya los tenga los conserva y los sigue viendo; a quien no, dejan de salir en Logros y no cuentan
 * en el denominador. «Cuerpo de campo» pide los otros cuatro «explora» de Estira. Y «Fuerte en
 * la oficina» (todas las de Mueve) no puede quedar imposible: no pide «Colgarse», que es barra.
 * Contra v0.175.2 caen las cuatro.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const CUATRO = ['explore.atg', 'explore.ancestral', 'master.atg.20', 'master.ancestral.10'];

test('sin ellos, los cuatro de ATG y Ancestral no salen en Logros ni cuentan', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const r = await page.evaluate((C) => ({
    enCatalogo: C.filter((id) => window.ACHIEVEMENT_CATALOG.some((a) => a.id === id)),
    disponibles: window.ACHIEVEMENTS_AVAILABLE,
    conDetector: window.ACHIEVEMENT_CATALOG.filter((a) => window.achievementIsAvailable(a)).length,
  }), CUATRO);
  expect(r.enCatalogo).toEqual([]);
  expect(r.disponibles, 'el denominador cuenta lo que no se puede ganar').toBe(r.conDetector);
});

test('quien ya tiene uno lo conserva y lo sigue viendo', async ({ page, context }) => {
  await sembrar(context, { achievements: { 'explore.atg': 1760000000000, 'master.ancestral.10': 1760000000000 } });
  await irAlArtefacto(page);
  const r = await page.evaluate((C) => C.filter((id) => window.ACHIEVEMENT_CATALOG.some((a) => a.id === id)), CUATRO);
  expect(r).toEqual(['explore.atg', 'master.ancestral.10']);
});

test('«Cuerpo de campo» se gana con los otros cuatro «explora» de Estira', async ({ page, context }) => {
  await sembrar(context, { achievements: { 'explore.hips': 1, 'explore.shoulders': 1, 'explore.neck': 1, 'explore.desk': 1 } });
  await irAlArtefacto(page);
  const r = await page.evaluate(() => { checkExploreCompleto(); return !!getState().achievements['explore.all.move']; });
  expect(r).toBe(true);
});

test('«Fuerte en la oficina» pide las de Mueve sin barra, también las nuevas, y se puede ganar', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const ids = [];
    for (const g of Object.values(window.MOVE_ROUTINES)) for (const x of g.items) ids.push(x.id);
    const sinBarra = ids.filter((id) => id !== 'extra.hang.bar');
    const cuenta = {};
    sinBarra.forEach((id) => { cuenta['rutina.' + id] = 1; });
    setState({ routineCounts: Object.assign({}, getState().routineCounts || {}, cuenta) });
    checkExploreCompleto();
    return { ids, ganado: !!getState().achievements['explore.all.extra'] };
  });
  expect(r.ids).toEqual(expect.arrayContaining(['extra.pausa.suelo', 'extra.banda.espalda']));
  expect(r.ids, 'Postura reset ya es de Estira').not.toContain('extra.posture.set');
  expect(r.ganado, 'no se gana sin «Colgarse»: imposible sin barra').toBe(true);
});
