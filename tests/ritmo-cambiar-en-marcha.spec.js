/* PACE · E2E · «CAMBIAR» CON UN FOCO EN MARCHA: EL BLOQUE PASA AL DÍA NUEVO (Ez, 4B del 11 nov. 2026)
 * ===================================================================================================
 * Revisión de ChatGPT, punto 4. A las 9:00 empiezas la jornada entera con un bloque de 45; a las 9:10
 * pulsas «Cambiar» y eliges «Una hora». Antes, el día nuevo se componía desde las 9:10 con un bloque de 25
 * y ponía la pausa a las 9:35, en mitad del bloque que seguía corriendo. Ahora ese bloque es el bloque 1
 * del día nuevo, a su hora (9:00) y con su duración (45): «Una hora» va de 9:00 a 9:50, el bloque hasta las
 * 9:45 y la pausa de cierre detrás. Y al acabar, cuenta una vez, como ese bloque y a esa hora.
 * El cambio vive en `ritmoFocoDelDiaNuevo` (state-ritmo.recolocar.jsx), que llama ritmoElegir.
 * Séptima pasada de Fable, n.º 4: un Foco empezado antes de medianoche y aún en marcha también pasa al
 * día nuevo, desde las 0:00 y con lo que le queda; antes no entraba y el día empezaba a las 9:00.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const HOY = '2026-10-14';   // miércoles, horario de verano (+02:00)
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };

async function enMarcha(page, context, lang) {
  await sembrar(context, { ritmo: { dia: JORNADA }, soundOn: false, lang: lang || 'es',
    achievements: { 'first.step': { unlockedAt: 1 } } });
  await page.clock.install({ time: new Date(HOY + 'T09:00:00+02:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  const empezar = lang === 'en' ? 'Start the day' : 'Empezar jornada';
  await page.getByRole('button', { name: empezar, exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(250);
  await page.clock.fastForward(10 * 60 * 1000);
  await page.waitForTimeout(300);
}

function plan() {
  const p = ritmoPlan(getState());
  const tras = p.actual ? ritmoDetras(p.m, p.actual) : null;
  return { hechos: p.hechos, actual: p.actual ? p.actual.desde + '+' + p.actual.dur : null,
           tras: tras ? tras.tipo + '@' + tras.desde : null, desde: p.m.desde, fin: p.m.fin,
           focos: p.m.focos.map((f) => f.desde + '+' + f.dur) };
}

test('a las 9:10, con un bloque de 45 desde las 9:00, «Una hora» empieza con ese bloque y su pausa va a las 9:45', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await enMarcha(page, context);
  expect(await page.evaluate(() => ritmoFocoCorriendo()), 'GUARD: el bloque corre').toBe(true);

  await page.evaluate(() => { ritmoPreguntar(); ritmoElegir('1h'); });
  await page.waitForTimeout(400);
  const p = await page.evaluate(plan);
  expect(p.actual, 'el bloque 1 es el que corre: a las 9:00 y de 45').toBe('540+45');
  expect(p.tras, 'detrás, la pausa de cierre al acabar el bloque (9:45)').toBe('cierre@585');
  expect(p.desde, 'el día empieza a las 9:00').toBe(540);

  /* El panel dice lo mismo que el aro: nada a las 9:35. */
  const panel = await page.locator('[data-pace-ritmo-panel]').first().innerText().catch(() => '');
  expect(panel, 'el panel no pone la pausa en mitad del bloque').not.toContain('9:35');

  /* Al acabar el bloque cuenta una vez, como el bloque 1 y a su hora. */
  await page.clock.fastForward(35 * 60 * 1000 + 2000);
  await page.waitForTimeout(800);
  const fin = await page.evaluate(() => {
    const s = getState(), p = ritmoPlan(s);
    return { hechos: p.hechos, primero: p.m.focos[0].desde + '+' + p.m.focos[0].dur, cycle: s.cycle,
             pausa: p.pausa ? p.pausa.tipo + '@' + p.pausa.desde : null };
  });
  expect(fin.cycle, 'el bloque cuenta una vez').toBe(1);
  expect(fin.hechos, 'y es el bloque 1 del día nuevo').toBe(1);
  expect(fin.primero, 'con su hora y su duración').toBe('540+45');
  expect(fin.pausa, 'y abre la pausa de cierre a las 9:45').toBe('cierre@585');
  expect(errores).toEqual([]);
});

test('en inglés, igual: el día nuevo empieza a las 9:00 con el bloque de 45', async ({ page, context }) => {
  await enMarcha(page, context, 'en');
  await page.evaluate(() => { ritmoPreguntar(); ritmoElegir('1h'); });
  await page.waitForTimeout(400);
  const p = await page.evaluate(plan);
  expect(p.actual).toBe('540+45');
  expect(p.tras).toBe('cierre@585');
});

test('sin un Foco empezado, el día nuevo sigue empezando a la hora de elegir', async ({ page, context }) => {
  await sembrar(context, { ritmo: { dia: JORNADA }, soundOn: false, achievements: { 'first.step': { unlockedAt: 1 } } });
  await page.clock.install({ time: new Date(HOY + 'T09:10:00+02:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
  await page.evaluate(() => { ritmoPreguntar(); ritmoElegir('1h'); });
  await page.waitForTimeout(300);
  const d = await page.evaluate(() => getState().ritmo.dia);
  expect(d.desde, 'a las 9:10').toBe(550);
  expect(d.primerBloque == null, 'sin bloque heredado').toBe(true);
});

test('un Foco de 25 empezado a las 23:50 y «Una hora» elegida a las 0:05: el bloque es el 1, de 0:00 a 0:15, y cuenta al acabar', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: { libre: '2026-10-13' }, focusMinutes: 25, soundOn: false, achievements: { 'first.step': { unlockedAt: 1 } } });
  await page.clock.install({ time: new Date('2026-10-13T23:50:00+02:00') });
  await irAlArtefacto(page);
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  const cta = page.locator('[data-pace-cta]').filter({ visible: true }).first();
  await cta.click();
  await expect(cta).toHaveText(/Pausar/);
  await page.clock.fastForward(15 * 60 * 1000);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => [todayISO(), ritmoFocoCorriendo()]), 'GUARD: ya es el día 14 y el bloque corre').toEqual([HOY, true]);

  await page.evaluate(() => { ritmoPreguntar(); ritmoElegir('1h'); });
  await page.waitForTimeout(400);
  const d = await page.evaluate(() => { const x = getState().ritmo.dia; return { desde: x.desde, primerBloque: x.primerBloque }; });
  expect(d, 'empezaba a las 9:00 y sin el bloque').toEqual({ desde: 0, primerBloque: 15 });
  const p = await page.evaluate(() => { const x = ritmoPlan(getState()); return { actual: x.actual && x.actual.desde + '+' + x.actual.dur, cerrado: !!x.cerrado }; });
  expect(p, 'el bloque 1 del día, abierto: la hora de ayer (23:50) no lo cierra').toEqual({ actual: '0+15', cerrado: false });

  await page.clock.fastForward(10 * 60 * 1000 + 2000);
  await page.waitForTimeout(800);
  const fin = await page.evaluate(() => { const s = getState(), x = ritmoPlan(s); return { cycle: s.cycle, hechos: x.hechos, pausa: !!x.pausa }; });
  expect(fin, 'cuenta una vez, como el bloque 1, y abre su pausa').toEqual({ cycle: 1, hechos: 1, pausa: true });
  expect(errores).toEqual([]);
});
