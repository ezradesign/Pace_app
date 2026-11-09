/* PACE · E2E · RECARGAR NO CAMBIA LA HORA A LA QUE EMPEZÓ UN FOCO (ChatGPT, 9 nov. 2026, punto 2)
 * ============================================================================================
 * Un Foco de 25 empezado a las 10:00, pausado de 10:05 a 10:15 y acabado a las 10:35. En marcha solo se
 * guardaba el final: al recargar tras reanudar, el inicio se sacaba restando 25 al final (10:10), y el
 * evento decía 25 min de reloj en vez de 35. De ahí saca el motor la hora a la que empiezas. Ahora el
 * inicio se guarda también en marcha y viaja con el aviso a las otras pestañas; la cuenta vieja queda
 * solo para lo guardado por versiones de antes.
 * Las tres maneras de hacer el mismo bloque dejan el mismo evento: sin recargar, recargando en marcha
 * después de reanudar y recargando en pausa.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { leerContenedor } = require('./eventos.helpers');

const DIEZ = new Date('2026-10-07T10:00:00+02:00');
const MIN = 60 * 1000;
const cta = (p) => p.locator('[data-pace-cta]');
const numero = (p) => p.locator('[data-pace-dial-number]');
/* El reloj de la página corre entre clic y clic: un segundo o dos. Lo que se mide son minutos (10:10 en vez de 10:00). */
const cerca = (x, y, margen) => Math.abs(x - y) <= margen;

async function recargar(page) {
  await page.reload();
  await numero(page).waitFor({ state: 'visible' });
  await page.waitForTimeout(300);
}

/* El bloque entero; `recarga`: 'marcha' (a las 10:20, ya reanudado) o 'pausa' (a las 10:10). */
async function bloque(page, context, recarga) {
  await sembrar(context, { soundOn: false });
  await context.clock.install({ time: DIEZ });
  await irAlArtefacto(page);
  await cta(page).click();
  await context.clock.fastForward(5 * MIN);
  await expect(cta(page)).toHaveText('Pausar');
  await cta(page).click();
  await expect(cta(page)).toHaveText('Continuar');
  await context.clock.fastForward(5 * MIN);
  if (recarga === 'pausa') await recargar(page);
  await context.clock.fastForward(5 * MIN);
  await expect(cta(page)).toHaveText('Continuar');
  await cta(page).click();
  await expect(cta(page)).toHaveText('Pausar');
  await context.clock.fastForward(5 * MIN);
  if (recarga === 'marcha') {
    await recargar(page);
    const empezo = await page.evaluate(() => ritmoFocoEmpezo());
    expect(cerca(empezo, DIEZ.getTime(), 5000), 'lo que lee el día del Foco en marcha: ' + new Date(empezo).toTimeString()).toBe(true);
  }
  await context.clock.fastForward(15 * MIN + 2000);
  await expect.poll(() => page.evaluate(() => getState().cycle)).toBe(1);
  const c = await leerContenedor(page);
  const ev = ((c && c.events) || []).filter((e) => e.type === 'session.completed' && e.payload && e.payload.module === 'focus');
  expect(ev.length, 'GUARD: un bloque contado').toBe(1);
  return { reloj: ev[0].payload.elapsedSeconds, activo: ev[0].payload.activeSeconds, min: await page.evaluate(() => getState().totalFocusMin) };
}

for (const recarga of [null, 'marcha', 'pausa']) {
  test('25 de foco con 10 de pausa, ' + (recarga ? 'recargando en ' + recarga : 'sin recargar') + ': 35 de reloj desde las 10:00', async ({ page, context }) => {
    const r = await bloque(page, context, recarga);
    expect(r.activo, 'el foco contado').toBe(25 * 60);
    expect(r.min).toBe(25);
    expect(cerca(r.reloj, 35 * 60, 5), 'de 10:00 a 10:35, con la pausa dentro: ' + r.reloj).toBe(true);
  });
}

test('la otra pestaña recibe la hora de empezar con el aviso: si es ella la que lo cuenta, 35 de reloj', async ({ page, context }) => {
  await sembrar(context, { soundOn: false });
  await context.clock.install({ time: DIEZ });
  await irAlArtefacto(page);
  await cta(page).click();
  await context.clock.fastForward(5 * MIN);
  await cta(page).click();
  await context.clock.fastForward(10 * MIN);
  const otra = await context.newPage();
  await irAlArtefacto(otra);
  await otra.waitForTimeout(300);
  await expect(cta(otra), 'GUARD: la otra recoge el bloque en pausa').toHaveText('Continuar');
  await cta(page).click();   // reanuda aquí: el aviso «corre» llega a la otra
  await expect(cta(otra)).toHaveText('Pausar');
  const guardado = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')));
  expect(cerca(guardado.inicio, DIEZ.getTime(), 5000), 'en marcha también se guarda la hora de empezar').toBe(true);
  await page.close();
  await context.clock.fastForward(20 * MIN + 2000);
  await expect.poll(() => otra.evaluate(() => getState().cycle)).toBe(1);
  const c = await leerContenedor(otra);
  const ev = ((c && c.events) || []).filter((e) => e.type === 'session.completed' && e.payload && e.payload.module === 'focus');
  expect(ev.length, 'GUARD: un bloque contado').toBe(1);
  expect(cerca(ev[0].payload.elapsedSeconds, 35 * 60, 5), 'de 10:00 a 10:35: ' + ev[0].payload.elapsedSeconds).toBe(true);

  /* Lo que guardaba la versión de antes (sin `inicio`): la cuenta de siempre. */
  const viejo = await otra.evaluate(() => {
    localStorage.setItem('pace.timer.v1', JSON.stringify({ mode: 'foco', minutes: 25, id: 'x', endsAt: Date.now() + 10 * 60 * 1000 }));
    return ritmoFocoEmpezo() === Date.now() - 15 * 60 * 1000;
  });
  expect(viejo).toBe(true);
});
