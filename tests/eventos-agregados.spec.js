/* PACE · E2E · LOS AGREGADOS, Y QUE LA PODA NO SE LLEVE EL TOTAL (s189)
 * =====================================================================
 * `pace.events.v1` borra los eventos crudos a los 120 dias. Si no hubiera nada
 * mas, a los cuatro meses la app no sabria que hiciste tu primera sesion. Los
 * agregados son esa memoria larga, y la regla del esquema (§13) es una linea:
 *
 *     valor vivo = baseline + fold(retenidos)
 *
 * LO QUE ESTOS ASERTOS DEFIENDEN, y por que cada uno existe:
 *  1 · que el fold cuente sesiones POR RUTINA, que es el agregado que ninguna
 *      otra capa puede dar (`state.routineCounts` cuenta por CATEGORIA);
 *  2 · que el total **no cambie al podar** -- «destilar antes de borrar» (§12):
 *      se pierde el detalle, nunca la cuenta;
 *  3 · que no se cuente DOS VECES lo ya consolidado (idempotencia por cursor);
 *  4 · que una rutina que ya no existe conserve su total (es historia);
 *  5 · que el preview lo diga, en los dos idiomas, y que **calle** cuando no
 *      hay nada que decir o el almacen no puede responder.
 *
 * POR QUE SE SIEMBRAN EVENTOS VIEJOS Y NO SE ESPERA A DICIEMBRE. Hoy no se ha
 * podado nada: las sesiones se emiten desde v0.102.0 (2026-08-20) y la ventana
 * es de 120 dias, asi que el baseline esta VACIO en cualquier instalacion real
 * y los dos extremos de la suma no se pueden distinguir mirando. Se siembra con
 * `occurredAt` inyectado -- que `makeEvent` acepta, derivando el dia civil de
 * ese instante y no de hoy (§7.3)-- y se poda a mano. Sigue siendo el contrato:
 * ni una linea del JSON se escribe a dedo.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { esperarInit } = require('./eventos.helpers');

/* Siembra sesiones POR EL CONTRATO. `diasAtras` mueve el evento al pasado para
   poder podarlo; 0 es hoy. */
function sembrarSesiones(page, routineId, n, diasAtras) {
  return page.evaluate(async ([rid, cuantas, atras]) => {
    for (let i = 0; i < cuantas; i++) {
      const cuando = new Date(Date.now() - atras * 86400000).toISOString();
      const e = window.makeEvent({
        type: 'session.completed', runId: 'run-' + rid + '-' + atras + '-' + i,
        occurredAt: cuando,
        payload: {
          /* `stretch`, no `extra`: el enum de la capa de eventos usa nombres
             SEMANTICOS (`EVENT_MODULES_SESSION` = focus/breathe/move/stretch),
             aunque los ids de rutina sigan cruzados (`move.*` es Estira).
             Con `extra` el payload no valida y `makeEvent` devuelve null. */
          module: 'stretch', routineId: rid, completionReason: 'natural',
          elapsedSeconds: 300, activeSeconds: 300,
          plannedSeconds: 300, plannedSecondsSource: 'derived',
        },
      });
      if (!e) throw new Error('makeEvent devolvio null: el payload no valida');
      await window.eventsWebAppend(e);
    }
    return window.paceEventsSnapshot().events.length;
  }, [routineId, n, diasAtras || 0]);
}

const agregados = (page) => page.evaluate(() => {
  const a = window.paceEventsAggregates();
  const snap = window.paceEventsSnapshot();
  return {
    porRutina: a.sessionsByRoutine, porTipo: a.totalsByType,
    crudos: snap.events.length,
    baseline: snap.baseline.sessionsByRoutine,
    cursor: !!snap.pruneCursor,
  };
});

/* ------------------------------------------------------------------ 1 */
test('el fold cuenta las sesiones por RUTINA', async ({ page, context }) => {
  await sembrar(context, {});
  await irAlArtefacto(page);
  await esperarInit(page);

  await sembrarSesiones(page, 'move.hips.5', 3, 0);
  await sembrarSesiones(page, 'move.wrists', 1, 0);
  const a = await agregados(page);

  expect(a.porRutina['move.hips.5'], 'no cuenta las tres de la misma rutina').toBe(3);
  expect(a.porRutina['move.wrists']).toBe(1);
  /* Y el total por tipo sigue siendo el de siempre: 4 sesiones. */
  expect(a.porTipo['session.completed']).toBe(4);
  /* Sin podar, el baseline esta vacio: todo sale de los crudos. Es el estado de
     CUALQUIER instalacion de hoy, y por eso los asertos 2 y 3 existen. */
  expect(a.baseline, 'el baseline no deberia tener nada aun').toEqual({});
  expect(a.crudos).toBe(4);
});

/* ------------------------------------------------------------------ 2 */
test('la poda se lleva el detalle y NO el total', async ({ page, context }) => {
  await sembrar(context, {});
  await irAlArtefacto(page);
  await esperarInit(page);

  await sembrarSesiones(page, 'move.hips.5', 2, 400);   // podables
  await sembrarSesiones(page, 'move.hips.5', 1, 0);     // de hoy
  const antes = await agregados(page);
  expect(antes.porRutina['move.hips.5'], 'GUARD: no se sembraron las tres').toBe(3);
  expect(antes.crudos).toBe(3);

  const podados = await page.evaluate(() => window.paceEventsPrune());
  const despues = await agregados(page);

  expect(podados, 'la poda no se llevo nada: los eventos viejos no eran podables').toBeTruthy();
  expect(despues.crudos, 'el detalle deberia haberse reducido').toBeLessThan(antes.crudos);
  expect(despues.baseline['move.hips.5'], 'el baseline no recogio lo podado').toBe(2);
  expect(despues.porRutina['move.hips.5'],
    'la poda se llevo parte del TOTAL: eso es perder historia, no detalle').toBe(3);
});

/* ------------------------------------------------------------------ 3 */
test('lo ya consolidado no se vuelve a contar', async ({ page, context }) => {
  await sembrar(context, {});
  await irAlArtefacto(page);
  await esperarInit(page);

  await sembrarSesiones(page, 'move.hips.5', 2, 400);
  await page.evaluate(() => window.paceEventsPrune());
  const unaVez = await agregados(page);

  /* Leer DOS veces no puede sumar, y podar otra vez tampoco: el cursor es lo que
     lo garantiza. Este es el aserto que separa «suma bien» de «suma una vez». */
  const otraVez = await agregados(page);
  await page.evaluate(() => window.paceEventsPrune());
  const trasSegundaPoda = await agregados(page);

  expect(unaVez.cursor, 'GUARD: la poda no dejo cursor').toBe(true);
  expect(otraVez.porRutina).toEqual(unaVez.porRutina);
  expect(trasSegundaPoda.porRutina,
    'podar dos veces cambia el total: el fold no es idempotente').toEqual(unaVez.porRutina);
});

/* ------------------------------------------------------------------ 4 */
test('una rutina que ya no existe conserva su total', async ({ page, context }) => {
  await sembrar(context, {});
  await irAlArtefacto(page);
  await esperarInit(page);

  /* Una rutina propia borrada, o un id retirado del catalogo. */
  await sembrarSesiones(page, 'custom.borrada.hace.meses', 2, 400);
  await page.evaluate(() => window.paceEventsPrune());
  const a = await agregados(page);

  expect(a.porRutina['custom.borrada.hace.meses'],
    'se perdio el total de una rutina que ya no esta: eso es borrar historia').toBe(2);
  /* Y nadie tiene que saber nombrarla para que el numero exista: quien no sepa,
     no la pinta. */
  const enCatalogo = await page.evaluate(() =>
    !!(window.getBreatheRoutine && window.getBreatheRoutine('custom.borrada.hace.meses')));
  expect(enCatalogo, 'GUARD: el id de prueba no deberia existir en el catalogo').toBe(false);
});

/* Abre la biblioteca del boton dado, entra en la PRIMERA tarjeta VISIBLE y
   devuelve su id de rutina. «La visible» y no «la primera»: cada pieza de la
   biblioteca existe DOS veces en el DOM -- lateral de escritorio y bloque de
   movil-- y la hoja apaga la que sobra, asi que un `querySelector` a secas
   devuelve la copia apagada, de ancho 0 (trampa de s174, documentada en
   `transicion-biblioteca.spec.js`). */
async function abrirPrimeraRutina(page, boton) {
  await page.getByRole('button', { name: boton }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
  const id = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('.pace-lib .pace-lib-hit'))
      .find(e => e.getBoundingClientRect().width > 0);
    if (!b) return null;
    b.click();
    return b.closest('[data-pace-lib-card]').getAttribute('data-pace-lib-card');
  });
  await page.waitForTimeout(400);
  return id;
}

/* ------------------------------------------------------------------ 5 */
test('el preview dice cuantas veces la has hecho, y calla cuando no hay nada', async ({ page, context }) => {
  await sembrar(context, {});
  await irAlArtefacto(page);
  await esperarInit(page);

  const id = await abrirPrimeraRutina(page, /Estira/);
  expect(id, 'GUARD: no se pudo abrir ninguna rutina de Estira').toBeTruthy();

  /* Sin sesiones no se pinta NADA: «0 veces» seria ruido, y pintar cero cuando
     el almacen no responde seria mentir. */
  expect(await page.locator('[data-pace-preview-veces]').count(),
    'pinta la cuenta sin haber hecho la rutina ni una vez').toBe(0);

  await sembrarSesiones(page, id, 3, 0);
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(page);
  const id2 = await abrirPrimeraRutina(page, /Estira/);
  expect(id2, 'la biblioteca abrio otra rutina tras recargar').toBe(id);

  /* El texto esperado se LEE del artefacto: una cadena copiada aqui envejeceria
     al primer cambio de copy y no diria nada del cableado. */
  const esperado = await page.evaluate(() =>
    String((window.PACE_STRINGS.es || {})['preview.doneCount.many'] || '').replace('{n}', '3'));
  expect(esperado, 'GUARD: no se pudo leer el copy ES del artefacto').toContain('3');
  await expect(page.locator('[data-pace-preview-veces]'),
    'con tres sesiones registradas la cuenta no aparece o no coincide').toHaveText(esperado);
});

/* ------------------------------------------------------------------ 6 */
test('la cuenta del preview habla en ingles, y en singular', async ({ page, context }) => {
  await sembrar(context, { lang: 'en', langAuto: false });
  await irAlArtefacto(page);
  await esperarInit(page);

  const id = await abrirPrimeraRutina(page, /Stretch/);
  expect(id, 'GUARD: no se pudo abrir ninguna rutina con la app en ingles').toBeTruthy();
  await sembrarSesiones(page, id, 1, 0);
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(page);
  await abrirPrimeraRutina(page, /Stretch/);

  /* UNA vez: la forma de SINGULAR, que es la que se olvida al traducir. */
  const esperado = await page.evaluate(() =>
    String((window.PACE_STRINGS.en || {})['preview.doneCount.one'] || ''));
  expect(esperado, 'GUARD: no se pudo leer el copy EN del artefacto').toBeTruthy();
  await expect(page.locator('[data-pace-preview-veces]'),
    'la cuenta sigue en castellano, o usa el plural para una sola vez').toHaveText(esperado);
});

/* ------------------------------------------------------------------ 7
 * EL UNICO SITIO DONDE EL FILTRO POR CURSOR DEFIENDE ALGO.
 *
 * En el camino feliz la poda borra del contenedor lo que acaba de consolidar,
 * asi que los retenidos y el baseline nunca se solapan y el filtro es cinturon
 * y tirantes: el banco de mutaciones lo demostro -- quitarlo NO ponia rojo
 * nada, que es el defecto que s187 documento con el filtro de seguridad.
 *
 * Donde SI importa es en la recuperacion (§22): una poda interrumpida puede
 * dejar el baseline escrito y los eventos todavia presentes. Ese estado el
 * producto no lo sabe fabricar a voluntad, asi que aqui se escribe el
 * contenedor A MANO -- la unica vez en este archivo, y por esta razon.
 */
test('una poda interrumpida no cuenta dos veces lo consolidado', async ({ page, context }) => {
  await sembrar(context, {});
  await irAlArtefacto(page);
  await esperarInit(page);

  await sembrarSesiones(page, 'move.hips.5', 2, 400);

  /* Se simula el corte: el baseline YA recogio las dos, el cursor apunta a la
     ultima, y los eventos siguen ahi porque el borrado no llego a ocurrir. */
  const r = await page.evaluate(() => {
    const snap = window.paceEventsSnapshot();
    const ultimo = snap.events[snap.events.length - 1];
    const roto = {
      schemaVersion: snap.schemaVersion,
      activatedAt: snap.activatedAt,
      events: snap.events,
      baseline: Object.assign({}, snap.baseline, { sessionsByRoutine: { 'move.hips.5': 2 } }),
      pruneCursor: { occurredAt: ultimo.occurredAt, id: ultimo.id },
      marker: { op: 'prune', startedAt: new Date().toISOString() },
    };
    localStorage.setItem('pace.events.v1', JSON.stringify(roto));
    return {
      crudos: window.paceEventsSnapshot().events.length,
      total: window.paceEventsAggregates().sessionsByRoutine['move.hips.5'],
    };
  });

  expect(r.crudos, 'GUARD: el estado simulado deberia conservar los dos eventos').toBe(2);
  expect(r.total,
    'cuenta dos veces lo ya consolidado: el baseline y los crudos se solapan').toBe(2);
});

/* ------------------------------------------------------------------ 8
 * LA DEUDA P1, CERRADA (§15.3 del esquema · tercer punto de la Fase 3).
 *
 * `nextRoutineFeedback` guardaba los contadores con `cur.yes || 0`, que
 * conserva el TIPO: un `'3'` --de un backup editado a mano o del import, que
 * todavia no sanea (deuda A-7)-- pasaba la guarda y la suma lo CONCATENABA,
 * dando `'31'`. Un contador corrupto ademas alimenta el veto de la pausa
 * (s189), asi que no es cosmetico.
 */
test('un contador que llega como cadena se coacciona, no se concatena', async ({ page, context }) => {
  await sembrar(context, {});
  await irAlArtefacto(page);

  const r = await page.evaluate(() => {
    const previo = { 'move.hips.5': { yes: '3', some: null, no: '1' } };
    const s = window.nextRoutineFeedback(previo, 'move.hips.5', 'yes');
    return {
      yes: s['move.hips.5'].yes, no: s['move.hips.5'].no, some: s['move.hips.5'].some,
      tipo: typeof s['move.hips.5'].yes,
      /* Y la basura de verdad no cuenta como nada: ni negativos ni NaN. */
      basura: window.feedbackCount('-4') + window.feedbackCount('hola') + window.feedbackCount(2.7),
    };
  });

  expect(r.yes, 'la suma concatena en vez de sumar: «3» + 1 = «31»').toBe(4);
  expect(r.tipo).toBe('number');
  expect(r.no, 'un contador que no se toca sigue siendo cadena').toBe(1);
  expect(r.some).toBe(0);
  expect(r.basura, 'negativos, NaN o decimales no se normalizan a entero >= 0').toBe(2);
});
