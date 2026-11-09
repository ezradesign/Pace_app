/* PACE · E2E · CAMBIAR LA CADENCIA, LAS HORAS O LAS REUNIONES NO REHACE LO HECHO (ChatGPT, 9 nov. 2026, punto 3)
 * ==========================================================================================================
 * El día se compone en vivo y solo `dia.pasado` queda fuera. Con los bloques a su hora no se recoloca nada, así
 * que lo de la mañana se recomponía con la cadencia, el horario o las reuniones nuevas: seis bloques de 5 hechos
 * seguidos de 9:00 a 9:30 pasaban a tener pausas en medio, y la pausa «hecha» (va por ordinal) era la de las 9:05.
 * Ahora, antes de guardar el cambio, lo hecho se congela (`ritmoFijarLoHecho`, state-ritmo.recolocar.jsx).
 *
 * El día se siembra como lo deja el aro de verdad: el primer bloque empezó a las 9:00 con el aro a 5
 * (`ritmoBloqueEmpezado` pone `pasado: []`, `primerBloque` y `bloque`), los seis a su hora, y la pausa de las
 * 9:30 abierta y hecha. Son las 9:32.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const HOY = '2026-10-14';   // miércoles, horario de verano (+02:00)
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+02:00');
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const DIA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pasado: [], primerBloque: 5, bloque: 5,
              pausa: 6, estados: { 1: 'hecha' } };

async function abrir(page, context) {
  await sembrar(context, { ritmo: { horario: HORARIO, dia: DIA }, focusMinutes: 5, cycle: 6,
    lastActiveDay: 'Wed Oct 14 2026', _historyMigrated: true,   // si no, el relevo del día pone `cycle` a cero
    achievements: { 'first.step': { unlockedAt: 1 } } });
  await page.clock.install({ time: a('09:32') });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
}

/* Lo que no debe moverse: las horas de los bloques hechos, la pausa abierta y su estado. */
function foto() {
  const s = getState(), p = ritmoPlan(s);
  const n = p.pausa ? ritmoOrdinal(p.m, p.pausa) : null;
  return {
    hechos: p.hechos,
    focos: p.m.focos.slice(0, p.hechos).map((f) => f.desde + '+' + f.dur),
    pausa: p.pausa ? p.pausa.desde + '+' + p.pausa.dur : null,
    estado: n != null ? p.estados[n] : null,
    platos: p.pausa ? (p.pausa.platos || []).map((pl) => pl.id).join() : null,
    minutos: s.totalFocusMin,
  };
}

test('cambiar a «después de cada bloque» con seis bloques de 5 hechos: sus horas y la pausa hecha no se mueven', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context);
  const antes = await page.evaluate(foto);
  expect(antes.focos, 'GUARD: seis bloques de 5 seguidos de 9:00 a 9:30')
    .toEqual(['540+5', '545+5', '550+5', '555+5', '560+5', '565+5']);
  expect(antes.pausa, 'GUARD: la pausa de las 9:30 está abierta').toMatch(/^570\+/);
  expect(antes.estado, 'GUARD: y hecha').toBe('hecha');

  await page.evaluate(() => bloquesElegir('cada'));
  const despues = await page.evaluate(foto);
  expect(despues, 'lo hecho sigue igual').toEqual(antes);
  /* Lo que queda sí sigue la cadencia nueva: detrás de cada bloque, una pausa. */
  const resto = await page.evaluate(() => {
    const p = ritmoPlan(getState());
    return { actual: p.actual.desde, detras: ritmoDetras(p.m, p.actual).tipo, pasado: getState().ritmo.dia.pasado.length };
  });
  expect(resto.actual, 'el bloque siguiente, al acabar la pausa (9:35) o después').toBeGreaterThanOrEqual(575);
  expect(resto.detras, 'y detrás, su pausa').toBe('pausa');

  /* Volver a «a mi ritmo» no congela otra vez lo mismo. */
  await page.evaluate(() => bloquesElegir('ritmo'));
  expect(await page.evaluate(() => getState().ritmo.dia.pasado.length), 'congelar dos veces no añade nada').toBe(resto.pasado);
  expect(await page.evaluate(foto)).toEqual(antes);
  expect(errores).toEqual([]);
});

test('una reunión nueva a las 9:10 o una comida más pronto no mueven lo hecho', async ({ page, context }) => {
  await abrir(page, context);
  const antes = await page.evaluate(foto);
  expect(await page.evaluate(() => calendarioGuardarOcupado([{ desde: 550, dur: 15 }], 'prueba', ritmoHoy())), 'GUARD: la reunión se guarda').toBe(true);
  expect(await page.evaluate(foto), 'con la reunión').toEqual(antes);
  await page.evaluate(() => ritmoHorario('comida', 720));
  expect(await page.evaluate(foto), 'con la comida a las 12:00').toEqual(antes);
});
