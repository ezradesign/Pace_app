/* PACE · pace.events.v1 en IndexedDB — la MIGRACION desde localStorage (s200)
 * =========================================================================
 * Hasta v0.133 el contenedor vivia en `localStorage`. Con dos pestañas eso
 * perdia eventos (Chromium propaga `localStorage` entre procesos de forma
 * asincrona y el lock no fuerza una lectura fresca), asi que el adaptador web
 * paso a IndexedDB. Quien ya tenia historial lo trae consigo UNA vez:
 *   · nada se pierde: los mismos eventos, el mismo `activatedAt`, el mismo
 *     baseline -- si se recapturara, se contaria dos veces lo ya contado;
 *   · la clave vieja se borra SOLO despues de releer la copia;
 *   · si el almacen nuevo ya tiene un contenedor DISTINTO, la clave vieja no se
 *     toca: borrar lo que no se ha copiado es lo que la migracion promete no hacer.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');
const { leerContenedor, esperarInit, sembrarEventos } = require('./eventos.helpers');

/* Un contenedor de los de antes, fabricado con el modelo de la app en una
   pestaña aparte (para no inventar a mano la forma del envelope). */
async function contenedorViejo(browser) {
  const ctx = await browser.newContext();
  await sembrar(ctx);
  const p = await ctx.newPage();
  await irAlArtefacto(p);
  const raw = await p.evaluate(() => {
    const c = window.emptyEventsContainer();
    c.activatedAt = '2026-09-01T08:00:00.000Z';
    c.baseline = window.captureEventsBaseline(
      { routineFeedback: { 'move.neck': { yes: 2, some: 0, no: 1 } } }, c.activatedAt);
    for (let i = 0; i < 3; i++) {
      c.events.push(window.makeEvent({
        type: 'session.completed', runId: 'viejo-' + i,
        payload: { module: 'breathe', routineId: 'breathe.box',
                   completionReason: 'natural', elapsedSeconds: 60, activeSeconds: 55 },
      }));
    }
    c.events.sort(window.compareEvents);
    return JSON.stringify(c);
  });
  await ctx.close();
  return raw;
}

/* Siembra la clave vieja en `localStorage` SOLO en la primera navegacion. */
function sembrarClaveVieja(context, raw) {
  return context.addInitScript(valor => {
    if (sessionStorage.getItem('__s200_sembrado')) return;
    sessionStorage.setItem('__s200_sembrado', '1');
    localStorage.setItem('pace.events.v1', valor);
  }, raw);
}

test('el historial de localStorage pasa a IndexedDB entero y la clave vieja se borra', async ({ page, context, browser }) => {
  const errores = capturarErrores(page);
  const viejo = await contenedorViejo(browser);
  await sembrar(context);
  await sembrarClaveVieja(context, viejo);

  await irAlArtefacto(page);
  await esperarInit(page);

  const antes = JSON.parse(viejo);
  const ahora = await leerContenedor(page);
  expect(ahora, 'el almacen nuevo quedo vacio: la migracion no copio').not.toBeNull();
  expect(ahora.events.map(e => e.id)).toEqual(antes.events.map(e => e.id));
  expect(ahora.activatedAt, 'se recapturo el baseline: contaria dos veces').toBe(antes.activatedAt);
  expect(ahora.baseline.feedback['move.neck']).toEqual({ yes: 2, some: 0, no: 1 });

  const sigue = await page.evaluate(() => localStorage.getItem('pace.events.v1'));
  expect(sigue, 'la clave vieja sigue ahi despues de una copia verificada').toBeNull();
  /* Y la app puede seguir escribiendo sobre lo migrado. */
  expect(await page.evaluate(() => window.paceEventsCanWrite())).toBe(true);
  expect(errores).toEqual([]);
});

test('lo que una pestaña ANTIGUA escribe despues de migrar se fusiona al arrancar', async ({ page, context }) => {
  /* s200 · tarea 4. Una pestaña con v0.133 abierta sigue escribiendo su
     contenedor ENTERO en `localStorage`: el que tenia al migrar mas sus eventos
     nuevos. El arranque siguiente añade solo los ids que faltan. */
  const errores = capturarErrores(page);
  await sembrar(context);
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 2);
  const propio = await leerContenedor(page);

  const nuevoId = await page.evaluate((c) => {
    const e = window.makeEvent({
      type: 'session.completed', runId: 'pestana-vieja',
      payload: { module: 'breathe', routineId: 'breathe.box',
                 completionReason: 'natural', elapsedSeconds: 60, activeSeconds: 55 },
    });
    const viejo = Object.assign({}, c, { events: c.events.concat([e]) });
    localStorage.setItem('pace.events.v1', JSON.stringify(viejo));
    return e.id;
  }, propio);

  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(page);

  const tras = await leerContenedor(page);
  expect(tras.events.map(e => e.id), 'el evento de la pestaña antigua se quedo fuera').toContain(nuevoId);
  expect(tras.events.length, 'se duplicaron los eventos que ya estaban').toBe(3);
  expect(tras.activatedAt).toBe(propio.activatedAt);
  expect(await page.evaluate(() => localStorage.getItem('pace.events.v1')),
    'la clave vieja sigue ahi tras una fusion verificada').toBeNull();
  expect(errores).toEqual([]);
});

test('si IndexedDB ya tiene OTRO contenedor, la clave vieja no se borra', async ({ page, context, browser }) => {
  const viejo = await contenedorViejo(browser);
  await sembrar(context);
  /* Primera visita: nace un contenedor propio en IndexedDB. */
  await irAlArtefacto(page);
  await esperarInit(page);
  const propio = await leerContenedor(page);
  expect(propio.activatedAt).not.toBe(JSON.parse(viejo).activatedAt);

  /* Aparece una clave vieja DISTINTA (p. ej. una pestaña con la version
     anterior todavia abierta) y la app arranca otra vez. */
  await page.evaluate(v => localStorage.setItem('pace.events.v1', v), viejo);
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(page);

  const tras = await leerContenedor(page);
  expect(tras.activatedAt, 'la copia vieja piso al contenedor nuevo').toBe(propio.activatedAt);
  expect(await page.evaluate(() => localStorage.getItem('pace.events.v1')),
    'se borro una copia que no se habia migrado').toBe(viejo);
});
