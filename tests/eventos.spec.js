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

/* -------------------------------------------------------------------------- */

test('el contenedor nace activado, en READ_WRITE, y activar es idempotente', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);

  const c1 = await leerContenedor(page);
  expect(c1, 'el contenedor no llego a crearse').not.toBeNull();
  expect(c1.schemaVersion).toBe(1);
  expect(c1.activatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  expect(c1.events).toEqual([]);
  expect(c1.marker).toBeNull();

  expect(await page.evaluate(() => window.paceEventsCapability())).toBe('events.read_write');
  expect(await page.evaluate(() => window.paceEventsCanWrite())).toBe(true);
  expect(await page.evaluate(() => window.paceEventsAdapter())).toBe('web');

  /* LA condicion que impide el doble conteo (§15.1 paso 3): recargar no vuelve
     a capturar el baseline. Si `activatedAt` se moviera, cada arranque
     re-capturaria los contadores y el dia que haya consumidor contaria de mas. */
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(page);
  const c2 = await leerContenedor(page);
  expect(c2.activatedAt).toBe(c1.activatedAt);
  expect(c2.baseline.capturedAt).toBe(c1.baseline.capturedAt);
});

test('el contenedor no habla con nadie: cero peticiones fuera del origen', async ({ page, baseURL }) => {
  /* La promesa de producto es que los eventos NO salen del dispositivo. El
     `verify` mira el codigo de app/events/; esto mira el CABLE. */
  const fuera = [];
  const origen = new URL(baseURL).origin;
  page.on('request', req => {
    if (req.url().indexOf(origen) !== 0 && req.url().indexOf('data:') !== 0 && req.url().indexOf('blob:') !== 0) {
      fuera.push(req.method() + ' ' + req.url());
    }
  });

  await irAlArtefacto(page);
  await esperarInit(page);

  /* Se ejercita el contrato ENTERO mientras se escucha el cable: emitir,
     exportar, validar, reemplazar y resetear. */
  await sembrarEventos(page, 3);
  await page.evaluate(async () => {
    const snap = window.paceEventsExport();
    window.paceEventsValidateImport(snap);
    await window.eventsWebReplaceFromImport(snap);
    await window.eventsWebReset(null);
  });

  expect(fuera, 'algo salio del origen mientras operaba el contenedor').toEqual([]);
});

test('el payload solo guarda los campos permitidos: nada de texto libre', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);

  const out = await page.evaluate(async () => {
    /* Se intenta colar texto libre y datos que el esquema NO contempla. */
    const e = window.makeEvent({
      type: 'feedback.answered', runId: 'run-x',
      payload: {
        routineId: 'move.neck', module: 'move', response: 'no',
        notaLibre: 'me duele la espalda desde el lunes',
        ip: '192.168.1.44', archivo: 'C:/Users/yo/informe-medico.pdf',
      },
    });
    await window.eventsWebAppend(e);
    return {
      claves: Object.keys(e.payload),
      crudo: localStorage.getItem('pace.events.v1'),
    };
  });

  /* Lista PERMITIDA, no lista prohibida: el payload se reconstruye campo a
     campo, asi que lo que no esta en el esquema no puede colarse aunque nadie
     lo haya previsto. */
  expect(out.claves.sort()).toEqual(['module', 'response', 'routineId']);
  expect(out.crudo).not.toContain('me duele la espalda');
  expect(out.crudo).not.toContain('192.168.1.44');
  expect(out.crudo).not.toContain('informe-medico');
});

test('reset vacia el contenedor y renueva activatedAt', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 4);

  const antes = await leerContenedor(page);
  expect(antes.events.length).toBe(4);

  const res = await page.evaluate(() => window.eventsWebReset(null).then(r => r.result));
  expect(res).toBe('committed');

  const despues = await leerContenedor(page);
  expect(despues.events).toEqual([]);
  /* Renovar `activatedAt` no es cosmetico: marca que lo de antes ya no cuenta,
     y sin eso el baseline viejo seguiria describiendo un historial que ya no
     existe. */
  expect(despues.activatedAt).not.toBe(antes.activatedAt);
  expect(despues.marker).toBeNull();
});

test('«Borrar todos mis datos» de Ajustes borra los DOS almacenes', async ({ page }) => {
  /* `privacy.html` promete que desde Ajustes «puedes borrarlo todo» y que el
     borrado es «inmediato y definitivo». Con dos almacenes, eso solo es cierto
     si el reset pasa por la barrera. */
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 3);

  /* Un valor escrito por LA APP (no por la semilla), para poder ver que el
     almacen legacy tambien se fue. */
  await page.evaluate(() => window.setState({ totalFocusMin: 4242 }));
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).totalFocusMin)).toBe(4242);

  const antes = await leerContenedor(page);

  page.on('dialog', d => d.accept());
  await page.locator('button[aria-label="Abrir tweaks"]').click();
  await page.getByRole('button', { name: 'Borrar todos mis datos', exact: true }).click();

  await page.waitForFunction(previo => {
    const raw = localStorage.getItem('pace.events.v1');
    if (!raw) return false;
    const c = JSON.parse(raw);
    return c.activatedAt !== previo && c.events.length === 0;
  }, antes.activatedAt, { timeout: 15000 });

  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(page);

  const despues = await leerContenedor(page);
  expect(despues.events).toEqual([]);
  expect(despues.activatedAt).not.toBe(antes.activatedAt);
  expect(despues.marker).toBeNull();
  /* El almacen legacy tambien: el 4242 lo escribio la app y ya no esta (lo que
     hay ahora es la semilla que `addInitScript` repone en cada navegacion). */
  expect(await page.evaluate(() => (JSON.parse(localStorage.getItem('pace.state.v2')) || {}).totalFocusMin))
    .not.toBe(4242);
});

test('importar un backup ANTIGUO reinicia el contenedor en vez de mezclarlo', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 5);
  const antes = await leerContenedor(page);
  expect(antes.events.length).toBe(5);

  /* Un backup real de PACE: no trae seccion de eventos. Conservar el
     contenedor actual junto a este estado seria la MEZCLA de §17 — el baseline
     describiria unos contadores que ya no son los de este estado. */
  const backup = JSON.stringify({
    app: 'PACE', version: 'v0.87.0', exportedAt: new Date().toISOString(),
    state: { firstSeen: 1, lang: 'es', palette: 'crema', totalFocusMin: 777,
             routineFeedback: { 'move.neck': { yes: 3, some: 1, no: 0 } } },
  });

  page.on('dialog', d => d.accept());
  await page.locator('button[aria-label="Abrir tweaks"]').click();
  await page.locator('input[type="file"][accept="application/json,.json"]')
    .setInputFiles({ name: 'pace-backup-20260101.json', mimeType: 'application/json', buffer: Buffer.from(backup) });

  await page.waitForFunction(previo => {
    const raw = localStorage.getItem('pace.events.v1');
    if (!raw) return false;
    const c = JSON.parse(raw);
    return c.activatedAt !== previo && c.events.length === 0;
  }, antes.activatedAt, { timeout: 15000 });

  const despues = await leerContenedor(page);
  expect(despues.events).toEqual([]);
  expect(despues.activatedAt).not.toBe(antes.activatedAt);
  expect(despues.marker, 'el marcador quedo colgado tras el import').toBeNull();
  /* El baseline se recaptura del estado que ACABA de entrar, no del anterior. */
  expect(despues.baseline.feedback['move.neck']).toEqual({ yes: 3, some: 1, no: 0 });
});

test('replaceFromImport REEMPLAZA (no fusiona) y es idempotente', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 6);

  const out = await page.evaluate(async () => {
    const leer = () => JSON.parse(localStorage.getItem('pace.events.v1'));
    /* Un snapshot con UN solo evento, de los seis que hay ahora mismo. */
    const snap = window.buildEventsExport(leer());
    const uno = Object.assign({}, snap, { events: [snap.events[0]] });
    const r1 = await window.eventsWebReplaceFromImport(uno);
    const tras1 = leer();
    const r2 = await window.eventsWebReplaceFromImport(uno);
    const tras2 = leer();
    return {
      r1: r1.result, r2: r2.result,
      n1: tras1.events.length, n2: tras2.events.length,
      idsIguales: JSON.stringify(tras1.events) === JSON.stringify(tras2.events),
      esperado: uno.events[0].id, obtenido: tras1.events[0].id,
    };
  });

  expect(out.r1).toBe('committed');
  /* 1, no 7: es reemplazo TOTAL. Si fusionara, aqui saldrian los seis mas el
     importado, y ese es justo el bug que §17 prohibe. */
  expect(out.n1).toBe(1);
  expect(out.obtenido).toBe(out.esperado);
  /* Importar dos veces deja el mismo estado. */
  expect(out.r2).toBe('committed');
  expect(out.n2).toBe(1);
  expect(out.idsIguales).toBe(true);
});

test('un snapshot invalido se rechaza SIN tocar el contenedor', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 3);

  const out = await page.evaluate(async () => {
    const crudo = () => localStorage.getItem('pace.events.v1');
    const antes = crudo();
    const bueno = window.buildEventsExport(JSON.parse(antes));
    const casos = {
      noEsObjeto: 'un string cualquiera',
      sinSchema: Object.assign({}, bueno, { schemaVersion: undefined }),
      schemaFuturo: Object.assign({}, bueno, { schemaVersion: 99 }),
      sinEventos: Object.assign({}, bueno, { events: undefined }),
      eventoRoto: Object.assign({}, bueno, { events: [{ id: 'no-es-uuid', v: 1, type: 'x' }] }),
      sinActivatedAt: Object.assign({}, bueno, { activatedAt: null }),
    };
    const razones = {}, resultados = {};
    for (const k of Object.keys(casos)) {
      razones[k] = window.paceEventsValidateImport(casos[k]).reason;
      resultados[k] = (await window.eventsWebReplaceFromImport(casos[k])).result;
    }
    return { razones, resultados, intacto: crudo() === antes };
  });

  /* Un JSON sintacticamente valido NO es un snapshot valido: cada caso da su
     razon concreta, no un «false» generico. */
  expect(out.razones).toEqual({
    noEsObjeto: 'shape',
    sinSchema: 'schema-missing',
    schemaFuturo: 'schema-newer',
    sinEventos: 'events-missing',
    eventoRoto: 'event-invalid',
    sinActivatedAt: 'activatedAt-missing',
  });
  Object.keys(out.resultados).forEach(k => expect(out.resultados[k]).toBe('rejected'));
  /* Lo que de verdad importa: BYTE a byte, el contenedor no se movio. */
  expect(out.intacto, 'un import rechazado modifico el contenedor').toBe(true);
});
