/* PACE · E2E · EL ORIGEN DE CADA SESIÓN en pace.events.v1 (s194 · rev. 7 del esquema)
 * ====================================================================================
 * Hasta s193 el registro distinguía dos contextos —suelta o dentro de un Camino— y
 * nada más: no sabía si una sesión la eligió la persona en la carta, se la propuso la
 * pausa, era el plato del menú o tocó la parada de la línea. Sin eso no se puede saber
 * si «A tu ritmo» funciona, que era la primera idea del experto de s192, ni diseñar
 * «propuestas para cada día de la semana» con datos.
 *
 * QUÉ DEFIENDE: que cada PUERTA deje su marca en `session.completed` —`origin` (por
 * dónde se entró) y `fromMenu` (si era lo que el menú sirvió)— y que la marca se
 * consuma: la siguiente sesión sin puerta anotada sale con null, no con la anterior.
 *  · el aro con plan → 'aro' + true · el aro sin plan → 'aro' + false
 *  · la propuesta de la pausa con motivo `ritmo.*` → 'pausa' + true
 *  · la parada abierta de la línea → 'parada' + true
 *  · la tarjeta de la barra lateral con la pausa del menú → 'sidebar' + true
 *  · una biblioteca → 'biblioteca' + false
 *  · dentro de un Camino → 'camino' + false, se haya anotado lo que se haya anotado
 *
 * TRAMPAS QUE VIVEN AQUÍ (de ritmo.spec y eventos-emisor.spec):
 *  · el reloj va CON OFFSET (`+02:00`): Node lo calcula en el huso del runner (s192);
 *  · un `fastForward` grande no adelanta una sesión de cuerpo: de 1 s en 1 s;
 *  · el append es asíncrono: se espera al evento, no a un timeout;
 *  · cada pieza del panel existe dos veces en el DOM: se toma la visible.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior } = require('./helpers');
const { leerContenedor, esperarInit } = require('./eventos.helpers');

const NUEVE = new Date('2026-09-17T09:00:00+02:00');
const FECHA = '2026-09-17';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
/* Un bloque hecho y su pausa ABIERTA (ver ritmo.spec.js: `lastActiveDay` en formato del
   rollover, o el relevo pone `cycle` a cero). */
const CON_PAUSA = { ritmo: { dia: Object.assign({}, JORNADA, { pausa: 1 }) }, cycle: 1,
                    lastActiveDay: 'Thu Sep 17 2026', _historyMigrated: true };

async function abrir(page, context, extra) {
  await sembrar(context, extra || {});
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
  await esperarInit(page);
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); }
}

/* Lleva la sesión de cuerpo montada hasta su cierre. */
async function terminarSesionCuerpo(page) {
  const done = page.locator('[data-pace-session-done]');
  for (let s = 0; s < 400 && (await done.count()) === 0; s++) await segundos(page, 1);
  expect(await done.count(), 'GUARD: la sesión no llegó al cierre').toBeGreaterThan(0);
}

/* El pomodoro de la home, minuto a minuto hasta que se abre la pausa. */
async function terminarBloque(page) {
  for (let i = 0; i < 60; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) return;
  }
  throw new Error('GUARD: el bloque no terminó');
}

/* Espera a que haya N sesiones y devuelve la última. */
async function ultimaSesion(page, n) {
  await page.waitForFunction((k) => {
    const raw = localStorage.getItem('pace.events.v1');
    return !!raw && (JSON.parse(raw).events || []).filter((e) => e.type === 'session.completed').length >= k;
  }, n, { timeout: 5000 });
  const sesiones = ((await leerContenedor(page)).events || []).filter((e) => e.type === 'session.completed');
  expect(sesiones.length, 'una sesión terminada deja UN evento').toBe(n);
  return sesiones[n - 1];
}

/* «Volver al inicio» desde el cierre de la sesión. */
async function volverAlInicio(page) {
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Volver al inicio', exact: true }).click();
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);
}

/* El preview de §18.3 y su «Empezar». */
async function empezarDesdePreview(page) {
  const preview = overlaySuperior(page);
  await preview.getByRole('button', { name: 'Empezar', exact: true }).click();
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(1);
}

test('el aro con plan es «aro» servido por el menú, y la propuesta de la pausa es «pausa» servida por el menú', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context, { ritmo: { dia: JORNADA } });

  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
  const foco = await ultimaSesion(page, 1);
  expect(foco.payload.module).toBe('focus');
  expect(foco.payload.origin, 'el bloque se empezó en el aro').toBe('aro');
  expect(foco.payload.fromMenu, 'con plan, el bloque es del menú').toBe(true);

  /* La pausa propone el plato del menú («A tu ritmo · antídoto a la silla»). */
  const prop = page.locator('[data-pace-break-prop]');
  await expect(prop).toContainText('A tu ritmo');
  await prop.getByRole('button', { name: 'Empezar', exact: true }).click();
  await empezarDesdePreview(page);
  await terminarSesionCuerpo(page);
  const plato = await ultimaSesion(page, 2);
  expect(plato.payload.module).toBe('stretch');
  expect(plato.payload.origin, 'se eligió en el menú de la pausa').toBe('pausa');
  expect(plato.payload.fromMenu, 'y era el plato que sirvió el menú').toBe(true);
  expect(errores).toEqual([]);
});

test('tocar la parada abierta es «parada», siempre del menú; la tarjeta de la barra lateral es «sidebar»', async ({ page, context }) => {
  await abrir(page, context, CON_PAUSA);
  const parada = vis(page, '[data-pace-ritmo-linea]').locator('[data-pace-ritmo-parada]').first();
  await expect(parada).toHaveClass(/pace-rt-ahora/);
  await parada.click();
  await empezarDesdePreview(page);
  await terminarSesionCuerpo(page);
  const s1 = await ultimaSesion(page, 1);
  expect(s1.payload.origin).toBe('parada');
  expect(s1.payload.fromMenu).toBe(true);

  /* De vuelta en la home, la barra lateral sigue ofreciendo la pausa abierta («Tu
     pausa · 9:45»): su tarjeta es otra puerta. */
  await volverAlInicio(page);
  const lateral = page.locator('[data-pace-sidebar]');
  await expect(lateral).toContainText('Tu pausa · 9:45');
  const plato = await page.evaluate(() => ritmoPlan(getState()).pausa.platos[0].name);
  await lateral.getByRole('button', { name: plato }).click();
  await empezarDesdePreview(page);
  await terminarSesionCuerpo(page);
  const s2 = await ultimaSesion(page, 2);
  expect(s2.payload.origin).toBe('sidebar');
  expect(s2.payload.fromMenu, 'la tarjeta era la pausa del menú').toBe(true);
});

test('una biblioteca es «biblioteca» y no es del menú; el aro sin plan es «aro» y tampoco', async ({ page, context }) => {
  await abrir(page, context);   /* la semilla común: por libre, la carta siempre */
  await page.getByRole('button', { name: /^Estira/ }).click();
  await page.getByRole('heading', { name: 'Escritorio express' }).click();
  await empezarDesdePreview(page);
  await terminarSesionCuerpo(page);
  const s1 = await ultimaSesion(page, 1);
  expect(s1.payload.origin).toBe('biblioteca');
  expect(s1.payload.fromMenu).toBe(false);

  await volverAlInicio(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
  const s2 = await ultimaSesion(page, 2);
  expect(s2.payload.module).toBe('focus');
  expect(s2.payload.origin).toBe('aro');
  expect(s2.payload.fromMenu, 'sin plan, el bloque no es del menú').toBe(false);
});

test('la puerta se CONSUME, dentro de un Camino manda «camino», y el esquema rechaza lo que no está en la lista', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate(async () => {
    const out = {};
    const datos = { elapsedSeconds: 60, activeSeconds: 60, plannedSeconds: 60, plannedSecondsSource: 'declared', completionReason: 'natural' };
    const eventos = () => (JSON.parse(localStorage.getItem('pace.events.v1') || '{}').events || []).filter((e) => e.type === 'session.completed');
    const espera = async (n) => { for (let i = 0; i < 100 && eventos().length < n; i++) await new Promise((res) => setTimeout(res, 20)); return eventos(); };

    /* 1 · anotada y consumida */
    paceOrigenSesion('biblioteca', false);
    emitSessionCompleted('stretch', 'move.desk.quick', datos);
    let l = await espera(1);
    out.primera = [l[0].payload.origin, l[0].payload.fromMenu];
    out.pendienteTrasConsumir = paceOrigenPendienteLeer();
    /* 2 · sin puerta anotada: null, no la anterior */
    emitSessionCompleted('stretch', 'move.desk.quick', datos);
    l = await espera(2);
    out.segunda = [l[1].payload.origin, l[1].payload.fromMenu];
    /* 3 · dentro de un Camino manda «camino» aunque haya puerta anotada, y la
       anotada se consume igual. `pathRunId` es opcional en session.completed
       (§7.1), así que sin `paths.current` el evento sale igual, con context 'path'. */
    paceOrigenSesion('parada', true);
    emitSessionCompleted('stretch', 'move.desk.quick', Object.assign({ inPath: true }, datos));
    out.pendienteTrasCamino = paceOrigenPendienteLeer();
    l = await espera(3);
    out.camino = [l[2].context, l[2].payload.origin, l[2].payload.fromMenu];
    /* makeEvent NORMALIZA, no decide la puerta: lo que llega en la lista, pasa */
    const enCamino = makeEvent({ type: 'session.completed', context: 'path', runId: newEventId(), pathRunId: newEventId(),
      payload: Object.assign({ module: 'stretch', routineId: 'x', origin: 'parada', fromMenu: true }, datos) });
    out.caminoConservaLoQuePasa = [enCamino.payload.origin, enCamino.payload.fromMenu];
    /* 4 · la lista permitida */
    const raro = makeEvent({ type: 'session.completed', runId: newEventId(),
      payload: Object.assign({ module: 'focus', routineId: 'focus', origin: 'telepatia', fromMenu: 'si' }, datos) });
    out.raro = [raro.payload.origin, raro.payload.fromMenu];
    out.enums = EVENT_ORIGINS.slice();
    return out;
  });
  expect(r.primera).toEqual(['biblioteca', false]);
  expect(r.pendienteTrasConsumir, 'la puerta se consume al emitir').toBeNull();
  expect(r.segunda, 'sin puerta anotada, null y no la anterior').toEqual([null, null]);
  expect(r.pendienteTrasCamino, 'un Camino también consume lo anotado').toBeNull();
  expect(r.camino, 'dentro de un Camino manda «camino»').toEqual(['path', 'camino', false]);
  expect(r.caminoConservaLoQuePasa, 'makeEvent normaliza, no decide la puerta').toEqual(['parada', true]);
  expect(r.raro, 'lo que no está en la lista sale a null').toEqual([null, null]);
  expect(r.enums).toEqual(['aro', 'pausa', 'biblioteca', 'sidebar', 'parada', 'camino']);
});
