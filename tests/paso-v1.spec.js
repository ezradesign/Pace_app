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
 *  · La hoja del día de v1 (Ez, 1A del 28 oct.): una vez al abrir PACE y sin una sesión delante,
 *    con los siete días y su fecha, las que se quedan con su módulo, «Lo gratis sigue gratis» y
 *    solo «Entendido»; con muchas, cinco y «Y n más». Y en Ajustes, «Prueba hasta el …» mientras
 *    dura la semana.
 * Contra v0.184.0 caen todas menos la primera (el control): no hay `pasoV1`.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina, abrirTusDatos, MEDIODIA } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const DIA = 24 * 3600 * 1000;
const HOJA = '[data-pace-premium-hoja="pasov1"]';

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
    /* Lo único que cambia es `avisado`, que apunta la hoja del día de v1 al salir. */
    const sin = (r) => Object.assign({}, r, { avisado: null });
    expect(sin(await page.evaluate(() => window.getState().pasoV1))).toEqual(sin(antes));
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
    /* En una sola vuelta: la hoja puede haber salido ya y haberlo apuntado. */
    const r = await page.evaluate(() => {
      const p = window.getState().pasoV1;
      window.setState({ pasoV1: Object.assign({}, p, { avisado: false }) });
      const sin = !!window.pacePasoV1PorAvisar();
      window.hasPremiumEntitlement = () => true;
      return { sin, con: window.pacePasoV1PorAvisar() };
    });
    expect(r).toEqual({ sin: true, con: null });
  });
});

test.describe('la hoja del día de v1 (1A)', () => {
  test('sale una vez al abrir PACE: los siete días, las que se quedan con su módulo y solo «Entendido»; Ajustes dice hasta cuándo', async ({ page, context }) => {
    await page.clock.install({ time: MEDIODIA });
    await comoEnV1(context);
    await sembrar(context, USABA);
    await irAlArtefacto(page);
    await sembrarSesiones(page, [['breathe', 'breathe.rounds.full', true]]);
    await pasarAV1(page);

    const hoja = page.locator(HOJA);
    await expect(hoja).toBeVisible({ timeout: 8000 });
    const r = await page.evaluate(() => window.getState().pasoV1);
    expect(r.avisado, 'se apunta al abrirla: no vuelve a salir').toBe(true);
    const fechas = await page.evaluate((h) => ({
      larga: new Date(h).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      corta: new Date(h).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
    }), r.hasta);
    await expect(hoja.getByRole('heading')).toHaveText('Siete días de PACE completo');
    await expect(hoja).toContainText('Como ya usabas PACE, lo tienes entero hasta el ' + fechas.larga + ', sin tarjeta y sin pagar nada.');
    await expect(hoja).toContainText('Y estas se quedan tuyas para siempre, porque ya las hiciste:');
    /* Por módulo: Respira, Mueve y Estira. Los ids de Mueve son `extra.*` y los de Estira, `move.*`. */
    const filas = hoja.locator('[data-pace-pasov1-rutina]');
    expect(await filas.evaluateAll((li) => li.map((x) => [x.getAttribute('data-pace-pasov1-rutina'), x.lastElementChild.textContent])))
      .toEqual([['breathe.rounds.full', 'Respira'], ['extra.hang.bar', 'Mueve'], ['move.couch.stretch', 'Estira']]);
    await expect(filas.nth(1)).toContainText('Colgarse');
    await expect(hoja).toContainText('Lo gratis sigue gratis.');
    /* No vende nada: un solo botón y ningún enlace. */
    await expect(hoja.getByRole('button')).toHaveText(['Entendido']);
    await expect(hoja.locator('a')).toHaveCount(0);
    await hoja.getByRole('button', { name: 'Entendido' }).click();
    await expect(hoja).toHaveCount(0);

    /* Ajustes › Tus datos, mientras dura la semana. */
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    await abrirTusDatos(page);
    await expect(page.locator('[data-pace-licencia-prueba]')).toHaveText('Prueba hasta el ' + fechas.corta);

    /* Una sola vez: al volver a abrir PACE, nada. */
    await page.reload();
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await page.waitForTimeout(2500);
    await expect(hoja).toHaveCount(0);

    /* Pasada la semana, la fila vuelve a la de siempre. */
    await page.clock.fastForward(7 * DIA + 60000);
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    await abrirTusDatos(page);
    await expect(page.locator('[data-pace-licencia-prueba]')).toHaveCount(0);
    await expect(page.locator('[data-pace-tweaks-panel]')).toContainText('Introducir código');
  });

  test('con una sesión delante no sale: espera a que se cierre', async ({ page, context }) => {
    await page.clock.install({ time: MEDIODIA });
    await comoEnV1(context);
    /* La pantalla de una sesión, desde el arranque del día de v1. */
    await context.addInitScript(() => {
      if (localStorage.getItem('prueba.sesion') !== '1') return;
      document.addEventListener('DOMContentLoaded', () => {
        const s = document.createElement('div');
        s.setAttribute('data-pace-session-root', '');
        s.setAttribute('data-pace-prueba-sesion', '');
        document.body.appendChild(s);
      });
    });
    await sembrar(context, USABA);
    await irAlArtefacto(page);
    await page.evaluate(() => localStorage.setItem('prueba.sesion', '1'));
    await pasarAV1(page);
    await page.waitForTimeout(3000);
    await expect(page.locator(HOJA)).toHaveCount(0);
    expect((await page.evaluate(() => window.getState().pasoV1)).avisado).toBe(false);

    await page.evaluate(() => document.querySelector('[data-pace-prueba-sesion]').remove());
    await page.clock.fastForward(61000);
    await expect(page.locator(HOJA)).toBeVisible();
  });

  test('en inglés, y con muchas: cinco y «And n more»', async ({ page, context }) => {
    const MUEVE = ['extra.core.stealth', 'extra.banda.espalda', 'extra.hang.bar', 'extra.push.ladder', 'extra.wall.sit', 'extra.legs.single', 'extra.core.plank'];
    const cuentas = {};
    MUEVE.forEach((id) => { cuentas['rutina.' + id] = 1; });
    await comoEnV1(context);
    await sembrar(context, Object.assign({}, USABA, { lang: 'en', routineCounts: cuentas }));
    await irAlArtefacto(page);
    await pasarAV1(page);
    expect((await page.evaluate(() => window.getState().pasoV1)).rutinas.length, 'las siete son de pago').toBe(7);

    const hoja = page.locator(HOJA);
    await expect(hoja).toBeVisible({ timeout: 8000 });
    await expect(hoja.getByRole('heading')).toHaveText('Seven days of PACE Complete');
    await expect(hoja).toContainText('Since you were already using PACE, you have all of it until ');
    await expect(hoja.locator('[data-pace-pasov1-rutina]')).toHaveCount(5);
    await expect(hoja.locator('[data-pace-pasov1-rutina]').first()).toContainText('Move');
    await expect(hoja.locator('[data-pace-pasov1-mas]')).toHaveText('And 2 more, yours too.');
    await expect(hoja).toContainText('What is free stays free.');
    await expect(hoja.getByRole('button')).toHaveText(['Got it']);
  });
});

test.describe('la hoja del día de v1 en un móvil', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('a 360 px cabe entera, sin scroll dentro', async ({ page, context }) => {
    await comoEnV1(context);
    await sembrar(context, Object.assign({}, USABA, { sidebarCollapsed: true }));
    await irAlArtefacto(page);
    await sembrarSesiones(page, [['breathe', 'breathe.rounds.full', true]]);
    await pasarAV1(page);
    await expect(page.locator(HOJA)).toBeVisible({ timeout: 8000 });
    /* La hoja entra animada: se mide quieta. */
    await page.waitForFunction(() => {
      const c = document.querySelector('[data-pace-modal-card]');
      const animaciones = c.getAnimations({ subtree: true });
      for (let e = c.parentElement; e; e = e.parentElement) animaciones.push(...e.getAnimations());
      return animaciones.every((a) => a.playState !== 'running');
    });
    const m = await page.locator('[data-pace-modal-card]').evaluate((c) => {
      const r = c.getBoundingClientRect();
      return { arriba: r.top, abajo: r.bottom, dentro: c.scrollHeight - c.clientHeight, ancho: document.documentElement.scrollWidth };
    });
    expect(m.arriba).toBeGreaterThanOrEqual(0);
    expect(m.abajo).toBeLessThanOrEqual(740);
    expect(m.dentro).toBeLessThanOrEqual(1);
    expect(m.ancho).toBeLessThanOrEqual(360);
  });
});
