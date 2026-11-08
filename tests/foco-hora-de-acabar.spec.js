/* PACE · E2E · EL FOCO SE APUNTA A LA HORA EN QUE ACABÓ (caza de la semana, S10, 8 nov. 2026)
 * =========================================================================================
 * Un Foco de 25 empezado a las 17:05 acaba a las 17:30. Si en ese momento el portátil está
 * cerrado (o PACE cerrado) y se vuelve a las 19:00, PACE lo cuenta al volver, y
 * `session.completed` se apuntaba a las 19:00, con 115 min de más en `elapsedSeconds`. El motor
 * de «A tu ritmo» saca de ahí tu hora de salida (`motorHoras`): tres días así y la carta
 * preguntaba «Terminas a las 19:05. ¿Pongo tu salida a las 19:05?» (oficina, en el banco).
 * El evento va a la hora a la que acabó (`finBloque` de FocusTimer → `emitSessionCompleted`)
 * y lo que duró se mide hasta ella.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, terminarBloque, capturarErrores } = require('./helpers');

const EMPIEZA = new Date(2026, 10, 10, 17, 5);
const VUELVE = new Date(2026, 10, 10, 19, 0);
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

async function ponerVisibilidad(page, v) {
  await page.evaluate((valor) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => valor });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => valor === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, v);
}

async function empezarFoco(page, context) {
  await sembrar(context, { focusMinutes: 25, lastActiveDay: EMPIEZA.toDateString() });
  await page.clock.install({ time: EMPIEZA });
  await irAlArtefacto(page);
  await vis(page, '[data-pace-cta]').first().click();
  await expect(vis(page, '[data-pace-cta]').first()).toHaveText(/Pausar/);
}

/* El último Foco del registro, como lo lee el motor: la hora de acabar y lo que duró. */
const elFoco = (page) => page.evaluate(() => {
  const ev = (paceEventsSnapshot().events || []).filter((e) => e.type === 'session.completed' && e.payload.module === 'focus');
  const e = ev[ev.length - 1];
  if (!e) return null;
  const f = new Date(e.occurredAt);
  const m = ritmoMotorEntrada(getState(), ritmoHoy()).focos.slice(-1)[0] || null;
  return { acabo: f.getHours() + ':' + String(f.getMinutes()).padStart(2, '0'), dia: e.localDay, min: Math.round(e.payload.elapsedSeconds / 60), motor: m };
});
const ESPERADO = { acabo: '17:30', dia: '2026-11-10', min: 25, motor: { fecha: '2026-11-10', desde: 1025, hasta: 1050 } };

test('portátil cerrado de 17:20 a 19:00: el Foco se apunta a las 17:30 y dura 25 min', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await empezarFoco(page, context);
  await page.clock.fastForward(15 * 60 * 1000);
  await ponerVisibilidad(page, 'hidden');
  await page.clock.fastForward(VUELVE.getTime() - await page.evaluate(() => Date.now()));
  await ponerVisibilidad(page, 'visible');
  await expect.poll(() => page.evaluate(() => getState().cycle)).toBe(1);
  await expect.poll(() => elFoco(page), 'se apuntaba a la hora de volver (19:00) y con 115 min de más').toEqual(ESPERADO);
  expect(errores).toEqual([]);
});

test('PACE cerrado y abierto a las 19:00: el mismo Foco, a las 17:30', async ({ page, context }) => {
  await empezarFoco(page, context);
  await page.clock.fastForward(15 * 60 * 1000);
  await page.goto('about:blank');
  await page.clock.fastForward(VUELVE.getTime() - EMPIEZA.getTime() - 15 * 60 * 1000);
  await irAlArtefacto(page);
  await expect.poll(() => page.evaluate(() => getState().cycle)).toBe(1);
  await expect.poll(() => elFoco(page)).toEqual(ESPERADO);
});

test('CONTROL: despierto, el Foco que acaba a su hora se apunta a su hora', async ({ page, context }) => {
  await empezarFoco(page, context);
  await terminarBloque(page);
  await expect.poll(() => elFoco(page)).toEqual(ESPERADO);
});
