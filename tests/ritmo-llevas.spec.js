/* PACE · E2E · LO HECHO, CONTADO (s197 · v0.129.0)
 * ==================================================
 * La app ya RECORDABA qué pausas hiciste y cuáles saltaste (s195), pero solo lo enseñaba
 * en la línea del panel. Decidido con el calco delante:
 *  · LA HOJA del día (teléfono, «Ver la jornada entera») dice el estado de cada parada
 *    pasada, con la regla de la línea: la hecha conserva la tinta y su glifo se rellena;
 *    la saltada baja y puntea, y pierde la gota del vaso. Antes se atenuaba TODO lo
 *    pasado por igual y «lo atenuado lee como no hecho» (s193).
 *  · LA TARJETA «Siguiente pausa» de la barra lateral lleva el RECUENTO en palabras:
 *    «Llevas seis bloques y cuatro pausas». Es lo único que la línea no dice con
 *    palabras; las saltadas no se nombran. Sin un solo bloque hecho no aparece.
 *
 * TRAMPA: el progreso NO sale de la hora, sale de `cycle − cicloBase`; para sembrar una
 * tarde con bloques hechos hace falta `cycle` Y `lastActiveDay` en el formato del
 * rollover (`toDateString`), o el relevo del día lo pone a cero.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const HOY = '2026-09-22';
const TARDE = new Date(HOY + 'T15:30:00+02:00');
const ESTADOS = { 1: 'hecha', 2: 'hecha', 3: 'hecha', 4: 'saltada', 5: 'hecha' };
const dia = (estados) => ({ fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, estados: estados || ESTADOS });

async function abrir(page, context, { ciclos, estados, hora } = {}) {
  await sembrar(context, {
    cycle: ciclos == null ? 6 : ciclos,
    lastActiveDay: new Date(HOY + 'T12:00:00+02:00').toDateString(),
    _historyMigrated: true,
    ritmo: { dia: dia(estados) },
  });
  await page.clock.install({ time: hora || TARDE });
  await irAlArtefacto(page);
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

test.describe('la hoja del día recuerda', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('cada parada pasada dice si se hizo o se saltó', async ({ page, context }) => {
    await abrir(page, context);
    await vis(page, 'text=Ver la jornada entera').first().click();
    await page.waitForTimeout(600);
    const filas = page.locator('[data-pace-ritmo-lista] .pace-rt-plato');
    const estados = await filas.evaluateAll((els) => els.map((e) => e.getAttribute('data-pace-ritmo-estado-fila')));
    expect(estados.slice(0, 5), 'las cinco pasadas, con el estado de la línea').toEqual(['hecha', 'hecha', 'hecha', 'saltada', 'hecha']);
    expect(estados.slice(5).every((e) => e === null), 'y lo que viene, sin estado').toBe(true);
    const metas = await filas.evaluateAll((els) => els.map((e) => e.querySelector('.pace-rt-plato-m').textContent.trim()));
    expect(metas[0]).toContain('hecha');
    expect(metas[3], 'la saltada lo dice y no dice cuánto duró').toBe('saltada');
    /* GUARD: con el código anterior las cinco decían su duración y su motivo, no su estado */
    expect(metas[0], 'la hecha ya no repite «min · Estira · Antídoto a la silla»').not.toContain('·  ');
  });

  test('la hecha conserva la tinta y la saltada se atenúa y puntea', async ({ page, context }) => {
    await abrir(page, context);
    await vis(page, 'text=Ver la jornada entera').first().click();
    await page.waitForTimeout(600);
    const medidas = await page.evaluate(() => {
      const fila = (n) => document.querySelectorAll('[data-pace-ritmo-lista] .pace-rt-plato')[n];
      const glifo = (n) => getComputedStyle(fila(n).querySelector('.pace-rt-eje i'));
      const op = (n) => parseFloat(getComputedStyle(fila(n)).opacity);
      return { opHecha: op(0), opSaltada: op(3), bordeHecha: glifo(0).borderStyle, bordeSaltada: glifo(3).borderStyle,
               fondoHecha: glifo(0).backgroundColor, fondoSaltada: glifo(3).backgroundColor,
               gotas: Array.from(document.querySelectorAll('[data-pace-ritmo-lista] .pace-rt-plato')).map((f) => !!f.querySelector('.pace-rt-gota')) };
    });
    expect(medidas.opHecha, 'la hecha, a plena tinta').toBe(1);
    expect(medidas.opSaltada, 'la saltada, atenuada').toBeLessThan(0.5);
    expect(medidas.bordeSaltada, 'y punteada').toBe('dashed');
    expect(medidas.bordeHecha).toBe('solid');
    expect(medidas.fondoHecha, 'la hecha se rellena y la saltada no').not.toBe(medidas.fondoSaltada);
    expect(medidas.gotas[3], 'una pausa saltada no se bebió su vaso').toBe(false);
  });
});

test('la barra lateral cuenta lo que llevas, en palabras', async ({ page, context }) => {
  await abrir(page, context);
  const llevas = vis(page, '[data-pace-sidebar-llevas]');
  await expect(llevas).toHaveCount(1);
  await expect(llevas, 'seis bloques (cycle) y cuatro pausas HECHAS; la saltada no se nombra').toHaveText('Llevas seis bloques y cuatro pausas');
  const estilo = await llevas.evaluate((e) => { const c = getComputedStyle(e); return { italica: c.fontStyle, serif: /Garamond|serif/i.test(c.fontFamily), hilo: c.borderTopWidth }; });
  expect(estilo.italica, 'en la itálica serif de las losetas').toBe('italic');
  expect(estilo.serif).toBe(true);
  expect(parseFloat(estilo.hilo), 'con un hilo encima').toBeGreaterThan(0);
});

test('en singular, y sin un bloque hecho no aparece', async ({ page, context }) => {
  await abrir(page, context, { ciclos: 1, estados: { 1: 'hecha' }, hora: new Date(HOY + 'T10:00:00+02:00') });
  await expect(vis(page, '[data-pace-sidebar-llevas]')).toHaveText('Llevas un bloque y una pausa');
  await page.evaluate(() => { const s = getState(); setState({ cycle: 0, ritmo: Object.assign({}, s.ritmo, { dia: Object.assign({}, s.ritmo.dia, { estados: {} }) }) }); });
  await page.waitForTimeout(400);
  await expect(vis(page, '[data-pace-sidebar-llevas]'), 'recién empezado el día, la tarjeta no cuenta nada').toHaveCount(0);
});
