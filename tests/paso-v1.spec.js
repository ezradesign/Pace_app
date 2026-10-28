/* PACE · E2E · EL DÍA DE v1, NADIE PIERDE LO QUE YA USABA (punto 12 del ROADMAP)
 * ==============================================================================
 * Ez, 15 oct. 2026 («Cómo se vende PACE completo», punto 1): quien usaba PACE antes de v1 recibe
 * su semana de prueba con un aviso y, además, las rutinas de pago que ya hizo alguna vez se le
 * quedan abiertas para siempre; las demás se cierran al acabar la prueba. La lista sale de lo
 * guardado en su equipo y se fija una sola vez, al pasar a v1 (app/state-paso-v1.js).
 *
 * «Pasar a v1» es arrancar con `PREMIUM_ABIERTO_HASTA_V1` en false. Hoy está en true, así que estas
 * pruebas lo fuerzan ANTES de que cargue la app, con una propiedad de `window` que no se deja
 * cambiar (`comoEnV1`), y solo desde que la prueba lo pide: así el primer arranque es el de antes
 * de v1 y el registro de eventos se puede sembrar con la app de siempre.
 *
 * QUE DEFIENDE:
 *  · Antes de v1 no se apunta nada.
 *  · El día de v1, quien ya usaba PACE: siete días con todo abierto y la lista de las de pago que
 *    hizo (las del registro de eventos, terminadas o no, y las de los contadores del estado), sin
 *    las gratis. Pasada la semana, solo esas.
 *  · Se fija una sola vez: lo que se hace después no entra, y recargar no la vuelve a calcular.
 *  · Quien instala ya en v1 no recibe semana ni lista.
 * Contra v0.184.0 caen todas menos la primera (el control): no hay `pasoV1`.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina, MEDIODIA } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const DIA = 24 * 3600 * 1000;

/* Desde que la prueba pone `prueba.v1`, cada arranque es de v1. */
async function comoEnV1(context) {
  await context.addInitScript(() => {
    if (localStorage.getItem('prueba.v1') !== '1') return;
    Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
  });
}

async function pasarAV1(page) {
  await page.evaluate(() => localStorage.setItem('prueba.v1', '1'));
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarEnPagina(page, () => !!(window.getState().pasoV1), null, { timeout: 8000 });
}

/* Sesiones en el registro, como las deja el runner: una de Respira de pago terminada antes y una
   gratis. */
async function sembrarSesiones(page, ids) {
  await page.waitForFunction(() => typeof window.eventsWebAppend === 'function' && typeof window.makeEvent === 'function');
  await page.evaluate(async (lista) => {
    let n = 0;
    for (const [mod, id, temprano] of lista) {
      const e = window.makeEvent({ type: 'session.completed', runId: 'run-v1-' + (n++), occurredAt: new Date(Date.now() - 3600000).toISOString(),
        payload: { module: mod, routineId: id, completionReason: temprano ? 'early' : 'natural', elapsedSeconds: 300, activeSeconds: 300,
          plannedSeconds: 600, plannedSecondsSource: 'declared' } });
      if (!e) throw new Error('makeEvent devolvió null');
      await window.eventsWebAppend(e);
    }
  }, ids);
}

/* Alguien que usaba PACE: una historia corta, dos rutinas de pago enteras y una gratis. */
const USABA = {
  history: { days: { '2026-10-20': { focusMinutes: 50, breathMinutes: 5, moveMinutes: 6, waterGlasses: 4, holdSeconds: 0 } }, months: {}, years: {} },
  routineCounts: { 'rutina.extra.hang.bar': 2, 'rutina.move.couch.stretch': 1, 'rutina.move.neck.3': 4, 'tag.HANG': 2 },
  moveSessionsTotal: 2,
};

test.describe('el paso a v1', () => {
  test('antes de v1 no se apunta nada', async ({ page, context }) => {
    await comoEnV1(context);
    await sembrar(context, USABA);
    await irAlArtefacto(page);
    await page.waitForTimeout(1200);
    expect(await page.evaluate(() => window.getState().pasoV1)).toBeUndefined();
    expect(await page.evaluate(() => window.canAccessRoutine('breathe.rounds.long'))).toBe(true);
  });

  test('quien ya usaba PACE: su semana con todo, y para siempre las de pago que hizo', async ({ page, context }) => {
    await page.clock.install({ time: MEDIODIA });
    await comoEnV1(context);
    await sembrar(context, USABA);
    await irAlArtefacto(page);
    await sembrarSesiones(page, [['breathe', 'breathe.rounds.full', true], ['breathe', 'breathe.box.4', false]]);
    await pasarAV1(page);

    const r = await page.evaluate(() => window.getState().pasoV1);
    expect(r.previo).toBe(true);
    expect(r.hasta - r.at).toBe(7 * DIA);
    expect(r.avisado).toBe(false);
    expect(r.rutinas.slice().sort()).toEqual(['breathe.rounds.full', 'extra.hang.bar', 'move.couch.stretch']);

    /* La semana: todo abierto, sin ser PACE completo comprado. */
    const semana = await page.evaluate(() => ({
      otra: window.canAccessRoutine('breathe.rounds.long'), crear: window.puedeCrearRutinas(), aprender: window.puedeAprender(),
      variar: window.puedeVariar(), calendario: window.puedeMantenerCalendario(), comprado: window.hasPremiumEntitlement(),
      abierto: window.paceAbiertoAhora(),
    }));
    expect(semana).toEqual({ otra: true, crear: true, aprender: true, variar: true, calendario: true, comprado: false, abierto: true });

    /* Pasada la semana: solo las suyas. */
    await page.clock.fastForward(7 * DIA + 60000);
    const despues = await page.evaluate(() => ({
      suyas: ['breathe.rounds.full', 'extra.hang.bar', 'move.couch.stretch'].map((id) => window.canAccessRoutine(id)),
      otras: ['breathe.rounds.long', 'extra.core.plank', 'move.hamstrings'].map((id) => window.canAccessRoutine(id)),
      gratis: window.canAccessRoutine('breathe.box.4'), crear: window.puedeCrearRutinas(), aprender: window.puedeAprender(),
      abierto: window.paceAbiertoAhora(),
    }));
    expect(despues).toEqual({ suyas: [true, true, true], otras: [false, false, false], gratis: true, crear: false, aprender: false, abierto: false });
  });

  test('la lista se fija una sola vez: lo de después no entra y recargar no la recalcula', async ({ page, context }) => {
    await page.clock.install({ time: MEDIODIA });
    await comoEnV1(context);
    await sembrar(context, USABA);
    await irAlArtefacto(page);
    await pasarAV1(page);
    const antes = await page.evaluate(() => window.getState().pasoV1);
    expect(antes.rutinas.slice().sort()).toEqual(['extra.hang.bar', 'move.couch.stretch']);

    /* Ya en v1 hace otra de pago (dentro de su semana) y vuelve a abrir PACE. */
    await sembrarSesiones(page, [['move', 'extra.core.plank', false]]);
    await page.evaluate(() => { const s = window.getState(); window.setState({ routineCounts: Object.assign({}, s.routineCounts, { 'rutina.extra.core.plank': 1 }) }); });
    await page.clock.fastForward(DIA);
    await page.reload();
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => window.getState().pasoV1)).toEqual(antes);
  });

  test('quien instala ya en v1 no recibe semana ni lista', async ({ page, context }) => {
    /* Antes que `comoEnV1`: los guiones de arranque corren en el orden en que se ponen. */
    await context.addInitScript(() => localStorage.setItem('prueba.v1', '1'));
    await comoEnV1(context);
    await page.goto('/index.html');
    await esperarEnPagina(page, () => !!(window.getState && window.getState().pasoV1), null, { timeout: 8000 });
    const r = await page.evaluate(() => window.getState().pasoV1);
    expect(r.previo).toBe(false);
    expect(r.rutinas).toBeUndefined();
    expect(await page.evaluate(() => [window.canAccessRoutine('breathe.rounds.long'), window.puedeCrearRutinas(), window.paceAbiertoAhora()]))
      .toEqual([false, false, false]);
  });

  test('con un código ya lo tiene todo: no hay aviso que dar', async ({ page, context }) => {
    await comoEnV1(context);
    await sembrar(context, USABA);
    await irAlArtefacto(page);
    await pasarAV1(page);
    expect(await page.evaluate(() => !!window.pacePasoV1PorAvisar())).toBe(true);
    await page.evaluate(() => { window.hasPremiumEntitlement = () => true; });
    expect(await page.evaluate(() => window.pacePasoV1PorAvisar())).toBeNull();
  });
});
