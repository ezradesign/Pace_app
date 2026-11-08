/* PACE · E2E · EL DÍA CERRADO POR LA HORA DICE LO MISMO QUE EL ÚLTIMO BLOQUE (caza de la semana, 8 nov. 2026)
 * ===================================================================================================
 * Ez eligió V2 A: el último bloque cierra el día también en el aro («Jornada cerrada», «Lo que queda
 * del día es tuyo», «Seguir por libre»). Con el día cerrado por la hora y bloques sin hacer solo
 * cambiaba el rótulo («Tu jornada ya terminó»), y debajo quedaba lo de siempre: en el banco de
 * oficina, «Ciclo completado · Empezar otro ciclo» el día que el bloque acabó con el portátil
 * cerrado y «Atención sostenida · Empezar foco» el día que se fue pronto. Es el mismo cierre, con los
 * mismos textos en castellano y en inglés (`aroCerrado`, FocusTimer.jornada.jsx).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const HOY = '2026-10-14';   // miércoles, horario de verano (+02:00)
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+02:00');
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

async function ponerVisibilidad(page, v) {
  await page.evaluate((valor) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => valor });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => valor === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, v);
}

/* Empieza la jornada a las 9:00 y cierra el portátil de 9:20 a 10:00: el bloque 1 acabó a las 9:45
   con la tapa cerrada y se cuenta al volver (el aro se queda con ese bloque completado). Luego PACE
   sigue abierto sin tocarlo, con bloques sin hacer, hasta pasada la salida (a pasos de 5 min). */
async function bloqueYTapa(page, context, lang) {
  await sembrar(context, Object.assign({ ritmo: { horario: HORARIO, dia: JORNADA } }, lang ? { lang } : {}));
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  await vis(page, '[data-pace-cta]').first().click();
  await page.clock.fastForward(20 * 60 * 1000);
  await ponerVisibilidad(page, 'hidden');
  await page.clock.fastForward(40 * 60 * 1000);
  await ponerVisibilidad(page, 'visible');
  await expect.poll(() => page.evaluate(() => getState().cycle)).toBe(1);
  await expect(vis(page, '[data-pace-dial-label]'), 'GUARD: quedan bloques').toHaveText(/^(Bloque|Block) 2 /);
  for (let i = 0; i < 200 && await page.evaluate(() => Date.now()) < a('17:40').getTime(); i++) {
    await page.clock.fastForward(Math.min(5 * 60 * 1000, a('17:40').getTime() - await page.evaluate(() => Date.now())));
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => { const p = ritmoPlanBase(getState()); return p.hechos < p.total; }), 'GUARD: el día se cierra con bloques sin hacer').toBe(true);
}

test('cerrado por la hora tras un bloque con la tapa cerrada: «Jornada cerrada», no «Ciclo completado»', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await bloqueYTapa(page, context);
  await expect(vis(page, '[data-pace-dial-label]'), 'decía «Tu jornada ya terminó»').toHaveText('Jornada cerrada');
  await expect(vis(page, '[data-pace-dial-hasta]')).toHaveText('45 min de foco');
  await expect(vis(page, '[data-pace-dial-subtitle]'), 'decía «Ciclo completado»').toHaveText('Lo que queda del día es tuyo');
  await expect(vis(page, '[data-pace-cta]'), 'ofrecía «Empezar otro ciclo»').toHaveText('Seguir por libre');
  /* Y seguir por libre es un Foco de los de siempre. */
  await vis(page, '[data-pace-cta]').first().click();
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Foco manual');
  expect(errores).toEqual([]);
});

test('en inglés, los mismos textos que V2', async ({ page, context }) => {
  await bloqueYTapa(page, context, 'en');
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Day complete');
  await expect(vis(page, '[data-pace-dial-subtitle]')).toHaveText('The rest of the day is yours');
  await expect(vis(page, '[data-pace-cta]')).toHaveText('Keep going freestyle');
});
