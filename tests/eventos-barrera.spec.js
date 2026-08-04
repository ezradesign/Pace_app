/* PACE · pace.events.v1 — el registro LOCAL de uso (s155)
 * =======================================================
 * Estas pruebas defienden promesas que estan escritas en una pagina
 * PUBLICA (`privacy.html`) y en el diseño (`docs/product/EVENTOS_SCHEMA.md`).
 * El `verify` comprueba de forma ESTATICA que el codigo tenga la forma correcta;
 * esto comprueba que el contenedor SE COMPORTE como se prometio, en un
 * navegador de verdad, con Web Locks reales y dos pestañas reales.
 *
 * Convenciones heredadas de s154 y que aqui siguen mordiendo:
 *   · los matchers comparan `textContent`, no lo que se ve;
 *   · `getByRole({name})` casa por SUBCADENA -> `exact: true` siempre;
 *   · `addInitScript` corre en CADA navegacion (la semilla escribe solo si falta).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');
const { CLAVE_EVENTOS, leerContenedor, esperarInit, sembrarEventos } = require('./eventos.helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });


test('DOS pestañas emiten a la vez y no se pierde ni un evento', async ({ page, context }) => {
  /* El P0 del diseño: dos read-modify-write concurrentes sobre el mismo
     almacen pierden eventos. Web Locks lo serializa, y esto lo comprueba con
     dos pestañas DE VERDAD, no con dos promesas en la misma. */
  await irAlArtefacto(page);
  await esperarInit(page);
  await page.evaluate(() => window.eventsWebReset(null));

  const otra = await context.newPage();
  await otra.goto('/index.html');
  await otra.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(otra);

  /* La segunda pestaña NO recaptura el baseline: `activatedAt` ya existe. */
  const a = await leerContenedor(page);
  const b = await leerContenedor(otra);
  expect(b.activatedAt).toBe(a.activatedAt);

  const emitir = (p, marca) => p.evaluate(async prefijo => {
    const tareas = [];
    for (let i = 0; i < 10; i++) {
      const e = window.makeEvent({
        type: 'session.completed', runId: prefijo + '-' + i,
        payload: { module: 'breathe', routineId: 'breathe.box',
                   completionReason: 'natural', elapsedSeconds: 60, activeSeconds: 55 },
      });
      tareas.push(window.eventsWebAppend(e));
    }
    const res = await Promise.all(tareas);
    return res.filter(r => r.result === 'committed').length;
  }, marca);

  const [na, nb] = await Promise.all([emitir(page, 'A'), emitir(otra, 'B')]);
  expect(na).toBe(10);
  expect(nb).toBe(10);

  const final = await leerContenedor(page);
  expect(final.events.length, 'se perdieron eventos: la exclusion no serializo').toBe(20);
  expect(new Set(final.events.map(e => e.id)).size).toBe(20);
  /* Y quedan en el orden canonico, que es el unico que la poda entiende. */
  const ordenado = await page.evaluate(evs => {
    for (let i = 1; i < evs.length; i++) if (window.compareEvents(evs[i - 1], evs[i]) > 0) return false;
    return true;
  }, final.events);
  expect(ordenado).toBe(true);

  await otra.close();
});

test('si falla la escritura del estado, el import ABORTA sin tocar los eventos', async ({ page }) => {
  /* El camino feliz ya estaba cubierto; este es el que faltaba y el que de
     verdad prueba la promesa de integridad. Si `pace.state.v2` no se puede
     escribir (cuota, almacenamiento bloqueado), lo que NO puede pasar es que el
     contenedor de eventos se reinicie igual y la UI cante victoria. */
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 4);

  const antesEventos = await page.evaluate(() => localStorage.getItem('pace.events.v1'));
  await page.evaluate(() => window.setState({ totalFocusMin: 1234 }));
  const antesEstado = await page.evaluate(() => localStorage.getItem('pace.state.v2'));

  /* Se rompe SOLO la escritura de la clave legacy: el contenedor de eventos
     tiene que poder seguir escribiendose, o la prueba no distinguiria «aborto
     bien» de «no habia almacenamiento». */
  await page.evaluate(() => {
    const real = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'pace.state.v2') throw new Error('QuotaExceededError simulado');
      return real.call(this, k, v);
    };
  });

  const backup = JSON.stringify({
    app: 'PACE', version: 'v0.88.1', exportedAt: new Date().toISOString(),
    state: { firstSeen: 1, lang: 'es', totalFocusMin: 999 },
  });

  /* Sin esto Playwright DESCARTA el confirm por defecto, el import devuelve
     antes de empezar y la prueba falla por una razon que no es la que cree. */
  page.on('dialog', d => d.accept());
  await page.locator('button[aria-label="Abrir tweaks"]').click();
  await page.locator('input[type="file"][accept="application/json,.json"]')
    .setInputFiles({ name: 'pace-backup-rota.json', mimeType: 'application/json', buffer: Buffer.from(backup) });

  /* El aviso de error tiene que aparecer — y no el de «Importado». */
  await expect(page.getByText('No se pudo guardar. Tus datos siguen intactos.', { exact: true })).toBeVisible();
  await expect(page.getByText('Importado — recargando…', { exact: true })).toHaveCount(0);

  /* Y lo esencial: NADA se movio. Los dos almacenes byte a byte, y sin
     marcador colgando — vivo, el proximo arranque «recuperaria» una operacion
     que nunca ocurrio y borraria el historial de todas formas. */
  const trasEventos = await page.evaluate(() => localStorage.getItem('pace.events.v1'));
  const trasEstado = await page.evaluate(() => localStorage.getItem('pace.state.v2'));
  expect(trasEstado, 'el estado legacy cambio pese a fallar la escritura').toBe(antesEstado);
  expect(JSON.parse(trasEstado).totalFocusMin).toBe(1234);
  expect(trasEventos, 'el contenedor de eventos se movio con la escritura fallida').toBe(antesEventos);
  expect(JSON.parse(trasEventos).events.length).toBe(4);
  expect(JSON.parse(trasEventos).marker, 'quedo un marcador de una operacion que se abortó').toBeNull();
});

test('un contenedor de version FUTURA se lee pero no se reescribe', async ({ page }) => {
  /* §9 y §18: una version antigua de PACE que normalizara un contenedor nuevo
     le borraria en silencio los campos que no conoce. Con web, PWA y Android
     compartiendo formato, esto deja de ser hipotetico. */
  await irAlArtefacto(page);
  await esperarInit(page);

  const futuro = await page.evaluate(() => {
    const c = {
      schemaVersion: 99,
      activatedAt: '2027-01-01T00:00:00.000Z',
      events: [],
      baseline: { capturedAt: null, feedback: {}, totalsByType: {} },
      pruneCursor: null,
      marker: null,
      campoDelFuturo: 'algo que esta version no entiende',
    };
    localStorage.setItem('pace.events.v1', JSON.stringify(c));
    return localStorage.getItem('pace.events.v1');
  });

  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(page);

  const estado = await page.evaluate(async () => {
    const cap = window.paceEventsCapability();
    const puede = window.paceEventsCanWrite();
    /* Se intentan las tres mutadoras: ninguna puede tocar el contenedor. */
    const reset = await window.paceEventsReset(null);
    const append = await window.paceEventsAppend(window.makeEvent({
      type: 'path.completed', pathRunId: 'p1', payload: { pathId: 'dawn', stepsCount: 2 },
    }));
    /* Y AHORA EL ADAPTADOR A PELO, saltandose la fachada. Sin esto la prueba no
       vale: `paceEventsReset` corta en `canWrite()` y el guard de DENTRO del
       lock —el autoritativo— no llega a ejecutarse nunca. Se comprobo: rompiendo
       ese guard, la prueba seguia verde. Y no es defensa redundante, es la que
       cubre la ventana entre leer la capacidad y adquirir el lock, en la que
       otra pestaña puede haber escrito un contenedor mas nuevo. */
    const directo = await window.eventsWebReset(null);
    const marcado = await window.eventsWebMark('import');
    return { cap, puede, reset: reset.result, append: append.result,
             directo: directo.result, marcado: marcado.result,
             crudo: localStorage.getItem('pace.events.v1') };
  });

  expect(estado.cap).toBe('events.read_only');
  expect(estado.puede).toBe(false);
  expect(estado.reset).toBe('unavailable');
  expect(estado.append).toBe('unavailable');
  /* El guard de dentro del lock, alcanzado de verdad. */
  expect(estado.directo).toBe('unavailable');
  expect(estado.marcado).toBe('unavailable');
  /* BYTE A BYTE: ni el arranque ni las mutadoras lo tocaron, y el campo que
     esta version no entiende sigue ahi. */
  expect(estado.crudo, 'se reescribio un contenedor de version futura').toBe(futuro);
  expect(estado.crudo).toContain('campoDelFuturo');
});

test('una operacion interrumpida deja marcador y el arranque la completa', async ({ page }) => {
  /* §22: entre dos almacenes no hay atomicidad. Si el proceso muere despues de
     escribir el estado legacy y antes de reiniciar el contenedor, el marcador
     sobrevive — y la siguiente inicializacion tiene que terminar el trabajo,
     porque si no queda una mezcla de historial viejo con estado nuevo. */
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 4);

  /* Se simula el corte: marcador puesto, contenedor SIN reiniciar. */
  await page.evaluate(() => window.eventsWebMark('import'));
  const aMedias = await leerContenedor(page);
  expect(aMedias.marker.op).toBe('import');
  expect(aMedias.events.length).toBe(4);

  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(page);

  const recuperado = await leerContenedor(page);
  expect(recuperado.marker, 'el marcador sobrevivio al arranque').toBeNull();
  expect(recuperado.events, 'la recuperacion no completo el reinicio').toEqual([]);
  expect(recuperado.activatedAt).not.toBe(aMedias.activatedAt);

  /* Y recuperar dos veces deja lo mismo: la recuperacion es idempotente. */
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(page);
  const otraVez = await leerContenedor(page);
  expect(otraVez.activatedAt).toBe(recuperado.activatedAt);

  expect(errores).toEqual([]);
});
