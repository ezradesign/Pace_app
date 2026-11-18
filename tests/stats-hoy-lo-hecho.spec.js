/* PACE · E2E · ESTADÍSTICAS › HOY DICE LO QUE HICISTE EN CADA PAUSA (recorrido de tester, 18 nov. 2026)
 * ====================================================================================================
 * El martes del recorrido, la pausa de las 10:34 servía «Glúteos en la silla»; con «Otra» salió
 * «Escritorio express» y se hizo. Por la tarde, Estadísticas › Hoy decía «Manos y muñecas · hecha»: el
 * día se recompone con la regla al pintarlo, y con lo hecho ya contado la regla sirve otra cosa en ese
 * hueco. Lo hecho se guarda al hacerlo (`dia.platos`, state-ritmo.pausa.jsx) y es lo que se enseña.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarModalAsentado } = require('./helpers');

/* Martes 24 nov. a las 17:40: dos bloques hechos, la primera pausa por su cuenta y la segunda hecha
   con Escritorio express (move.desk.quick), que la regla no sirve ahí sin «Otra». */
const MARTES = new Date('2026-11-24T17:40:00+01:00');
const SEMILLA = {
  cycle: 2, lastActiveDay: 'Tue Nov 24 2026', soundOn: false,
  _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
  achievements: { 'first.step': { unlockedAt: 1 } },
  ritmo: { dia: { fecha: '2026-11-24', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {},
    estados: { 1: 'cuenta', 2: 'hecha' }, platos: { 2: ['move.desk.quick'] } } },
};

async function abrirHoy(page, context, lang) {
  await sembrar(context, Object.assign({}, SEMILLA, { lang }));
  await page.clock.install({ time: MARTES });
  await irAlArtefacto(page);
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.getByRole('button', { name: lang === 'en' ? 'View stats' : 'Ver estadísticas' }).click();
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await esperarModalAsentado(page);
}

/* Lo que la regla sirve hoy en la segunda pausa, sin mirar lo hecho. */
const servidaSegunda = (page) => page.evaluate(() => {
  const p = ritmoPlan(getState());
  const it = p.m.items.find((x) => (x.tipo === 'pausa' || x.tipo === 'cierre') && ritmoOrdinal(p.m, x) === 2);
  return it.platos.map((pl) => pl.id);
});

const nombres = (page) => page.evaluate(() => [...document.querySelectorAll('[data-pace-hoy-parada]')]
  .map((c) => c.querySelector('.pace-sh-n').textContent.trim()));

test('la pausa hecha con «Otra» sale con la rutina que hiciste, no con la que la regla sirve ahora', async ({ page, context }) => {
  await abrirHoy(page, context, 'es');
  expect(await servidaSegunda(page), 'GUARD: la regla no sirve Escritorio express en ese hueco').not.toContain('move.desk.quick');
  const n = await nombres(page);
  expect(n[1], 'la segunda parada es la pausa de Escritorio express').toBe('Escritorio express');
});

test('en inglés, con su nombre en inglés', async ({ page, context }) => {
  await abrirHoy(page, context, 'en');
  expect((await nombres(page))[1]).toBe('Desk Express');
});
