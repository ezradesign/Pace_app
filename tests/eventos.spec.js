/* PACE · pace.events.v1 — el registro LOCAL de uso (s155)
 * =======================================================
 * Estas diez pruebas defienden promesas que estan escritas en una pagina
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

const CLAVE_EVENTOS = 'pace.events.v1';

test.beforeEach(async ({ context }) => { await sembrar(context); });

/* Lee el contenedor crudo desde el navegador. */
function leerContenedor(page) {
  return page.evaluate(clave => {
    const raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : null;
  }, CLAVE_EVENTOS);
}

/* Espera a que la inicializacion del arranque haya terminado. La fachada
   memoiza su promesa, asi que volver a pedirla no relanza nada. */
function esperarInit(page) {
  return page.evaluate(() => window.paceEventsInitialize());
}

/* Siembra N eventos por el CONTRATO (no escribiendo el JSON a mano): asi la
   prueba ejercita el mismo camino que usara la Fase 2. */
function sembrarEventos(page, n) {
  return page.evaluate(async cuantos => {
    for (let i = 0; i < cuantos; i++) {
      const e = window.makeEvent({
        type: 'session.completed', runId: 'run-' + i,
        payload: {
          module: 'focus', routineId: 'focus.25', completionReason: 'natural',
          elapsedSeconds: 1500, activeSeconds: 1500,
          plannedSeconds: 1500, plannedSecondsSource: 'preset',
        },
      });
      await window.eventsWebAppend(e);
    }
    return JSON.parse(localStorage.getItem('pace.events.v1')).events.length;
  }, n);
}

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
