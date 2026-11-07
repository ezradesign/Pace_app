/* PACE · E2E · PACE ABIERTO TODA LA JORNADA (auditoría del 7 nov. 2026)
 * ====================================================================
 * Quien trabaja sentado deja PACE abierto horas, cierra el portátil al comer y vuelve.
 * Lo que se ve al volver tiene que ser verdad. Informe: docs/audits/abierta-horas-7nov.md.
 *
 *  · A1 · el portátil se cierra a mitad de un bloque y se abre una hora después: el día
 *    apuntaba el bloque hasta la hora de volver (de 9:00 a 10:20, 80 min en vez de 45) y la
 *    cabecera sumaba ese rato como foco. El bloque dura lo que duró; lo de en medio es margen.
 *    Igual si lo que se cerró fue PACE y se abre después.
 *  · A2 · las losetas de «A tu ritmo» dicen horas desde ahora («Una hora · Hasta las 9:00»),
 *    y nada las repintaba: abierta a las 9:00 y sin tocar, a las 11:00 seguía «Hasta las 10:00».
 *  · A3 · si el navegador no deja guardar, lo hecho solo vive en memoria, y la medianoche
 *    relevaba el día desde lo guardado: el día de ayer se archivaba sin lo de la tarde.
 *  · E1 · (Ez, E1 A) elegida la jornada a las 8:00 y de vuelta a las 11:00 sin empezar, el aro
 *    decía «Bloque 1 de 11» y la barra «A las 8:45»: el día sin empezar se lee desde ahora.
 * Calibrado en ROJO contra el `index.html` de v0.192.0.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, terminarBloque, CLAVE_ESTADO } = require('./helpers');

const HOY = '2026-10-14';   // miércoles, horario de verano (+02:00)
const a = (hhmm, dia) => new Date((dia || HOY) + 'T' + hhmm + ':00+02:00');
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };

async function ponerVisibilidad(page, v) {
  await page.evaluate((valor) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => valor });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => valor === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, v);
}

/* El día de «A tu ritmo» como lista [tipo, desde, dur]. */
const elDia = (page) => page.evaluate(() => {
  const p = ritmoPlan(getState());
  return { items: p.m.items.map((it) => [it.tipo, it.desde, it.dur]), hechos: p.hechos };
});

async function empezarJornada(page, context) {
  await sembrar(context, { ritmo: { horario: HORARIO, dia: JORNADA } });
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
  await expect(page.locator('[data-pace-cta]').filter({ visible: true })).toHaveText('Pausar foco');
}

test.describe('A1 · el bloque que acaba con el portátil cerrado dura lo que duró', () => {
  test('cerrado de 9:20 a 10:20: el bloque va de 9:00 a 9:45 y lo de en medio es margen', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await empezarJornada(page, context);
    await page.clock.fastForward(20 * 60 * 1000);
    await ponerVisibilidad(page, 'hidden');
    await page.clock.fastForward(60 * 60 * 1000);
    await ponerVisibilidad(page, 'visible');
    await expect.poll(() => page.evaluate(() => ritmoPlan(getState()).hechos)).toBe(1);
    const d = await elDia(page);
    expect(d.items[0], 'el bloque se apuntó hasta la hora de volver').toEqual(['foco', 540, 45]);
    expect(d.items[1], 'el rato con la tapa cerrada es margen libre').toEqual(['libre', 585, 35]);
    expect(errores).toEqual([]);
  });

  test('PACE cerrado y abierto una hora después: el mismo bloque, de 9:00 a 9:45', async ({ page, context }) => {
    await empezarJornada(page, context);
    await page.clock.fastForward(20 * 60 * 1000);
    await page.goto('about:blank');
    await page.clock.fastForward(60 * 60 * 1000);
    await irAlArtefacto(page);
    await expect.poll(() => page.evaluate(() => ritmoPlan(getState()).hechos)).toBe(1);
    expect((await elDia(page)).items[0]).toEqual(['foco', 540, 45]);
  });

  test('CONTROL: despierto, el bloque que acaba a su hora no deja margen', async ({ page, context }) => {
    await empezarJornada(page, context);
    await terminarBloque(page);
    await expect.poll(() => page.evaluate(() => ritmoPlan(getState()).hechos)).toBe(1);
    const d = await elDia(page);
    expect(d.items[0]).toEqual(['foco', 540, 45]);
    expect(d.items.filter((it) => it[0] === 'libre' && it[1] < 600)).toEqual([]);
  });
});

test('A2 · con PACE abierto y sin tocar, las losetas siguen la hora', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: HORARIO, semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'] } });
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  const unaHora = page.locator('[data-pace-ritmo-loseta="1h"]');
  await expect(unaHora).toContainText('Hasta las 10:00');
  /* Dos horas a la vista: el vigilante de cada minuto corre (y una vez más, al llegar). */
  await page.clock.fastForward(2 * 60 * 60 * 1000);
  await page.clock.fastForward(60 * 1000);
  await expect(unaHora, 'a las 11:01 la loseta seguía ofreciendo una hora hasta las 10:00').toContainText('Hasta las 12:00');
  /* Oculta no repinta nada; al volver al frente, sí, sin esperar al minuto. */
  await ponerVisibilidad(page, 'hidden');
  await page.clock.fastForward(60 * 60 * 1000);
  await ponerVisibilidad(page, 'visible');
  await expect(unaHora).toContainText('Hasta las 13:00', { timeout: 2000 });
});

test('E1 · elegida la jornada a las 8:00 y sin empezar, a las 11:00 el día va desde las 11:00', async ({ page, context }) => {
  const errores = capturarErrores(page);
  const ocho = { inicio: 480, comida: 840, comidaDur: 60, salida: 1080 };
  await sembrar(context, { sidebarCollapsed: false, ritmo: { horario: ocho, dia: { fecha: HOY, opcion: 'jornada', desde: 480, cicloBase: 0, cambios: {} } } });
  await page.clock.install({ time: a('08:00') });
  await irAlArtefacto(page);
  const rotulo = page.locator('[data-pace-dial-label]').filter({ visible: true });
  await expect(rotulo).toHaveText('Bloque 1 de 11');
  /* Tres horas en una reunión, con PACE de fondo; al volver, el día empieza ahora. */
  await ponerVisibilidad(page, 'hidden');
  await page.clock.fastForward(3 * 60 * 60 * 1000);
  await ponerVisibilidad(page, 'visible');
  await expect(rotulo, 'el aro seguía en el plan de las 8:00').toHaveText('Bloque 1 de 8');
  await expect(page.locator('aside').first(), 'la barra decía «A las 8:45»').toContainText('11:45');
  expect((await elDia(page)).items[0], 'la línea empezaba a las 8:00').toEqual(['foco', 660, 45]);
  expect(await page.evaluate(() => getState().ritmo.dia.desde), 'leerlo no escribe nada').toBe(480);
  /* Empezar a la misma hora lo fija: con el bloque en marcha ya no se lee desde ahora. */
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
  await expect(page.locator('[data-pace-cta]').filter({ visible: true })).toHaveText('Pausar foco');
  expect(await page.evaluate(() => getState().ritmo.dia.desde)).toBe(660);
  expect((await elDia(page)).items[0], 'empezado a las 11:00, el día volvía a las 8:00').toEqual(['foco', 660, 45]);
  expect(errores).toEqual([]);
});

test('A3 · sin poder guardar, la medianoche no tira lo hecho por la tarde', async ({ page, context }) => {
  await sembrar(context, { sidebarCollapsed: false });
  /* La semilla entra; desde ahí, el navegador no deja escribir el estado (lleno). */
  await context.addInitScript((clave) => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === clave && this.getItem(clave) && window.__lleno) throw new DOMException('lleno', 'QuotaExceededError');
      return orig.call(this, k, v);
    };
  }, CLAVE_ESTADO);
  await page.clock.install({ time: a('23:30') });
  await irAlArtefacto(page);
  await page.evaluate(() => { window.__lleno = true; });
  for (let i = 0; i < 3; i++) await page.evaluate(() => addWaterGlass(1));
  expect(await page.evaluate(() => getState().water.today)).toBe(3);
  await page.clock.fastForward(40 * 60 * 1000);   // las 00:10, a la vista
  await expect.poll(() => page.evaluate(() => getState().lastActiveDay)).toBe('Thu Oct 15 2026');
  const ayer = await page.evaluate(() => (getState().history.days['2026-10-14'] || {}).waterGlasses || 0);
  expect(ayer, 'el día de ayer se archivó desde lo guardado, sin los tres vasos').toBe(3);
});
