/* PACE · E2E · importar y borrar dicen la verdad (auditoría del 21 oct. 2026, 2, 3 y 4)
 * ===================================================================================
 * Una auditoría externa (ChatGPT), comprobada en el código por la coordinadora, encontró tres
 * casos en los que «Tus datos» decía una cosa y hacía otra:
 *
 *  2. IMPORTAR A MEDIAS. La barrera de eventos devuelve `legacyWritten: true` cuando el estado
 *     entra y el registro de sesiones no (`interrupted`, o `unavailable` con una copia que lo
 *     traía). Ajustes solo miraba `legacyWritten`: decía «Importado» y recargaba.
 *  3. BORRAR QUE NO BORRA. «Borrar todos mis datos» recargaba pasara lo que pasara, así que si
 *     el navegador no dejaba borrar, la página volvía con todo y sin una palabra.
 *  4. EL FOCO DE ANTES. Importar no tocaba `pace.timer.v1`: un bloque de antes de importar, si
 *     ya había terminado, se contaba al recargar en la historia que acababa de entrar. Lo mismo
 *     dejaba ofrecer «Continúa» de una Respira o un Mueve de antes (`pace.breathe.v1`,
 *     `pace.cuerpo.v1`).
 *
 * Calibradas en rojo contra el `index.html` de v0.174.0: caen las cuatro primeras. La de
 * CONTROL vigila el arreglo del 3: si lo que falla es el registro y no el estado, lo borrado
 * NO puede volver (con v0.174.0 pasa porque recargaba siempre; cae si la barrera vuelve a
 * decir «no se escribió» cuando sí se escribió).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, aceptarAvisosPace, CLAVE_ESTADO, abrirTusDatos } = require('./helpers');
const { leerContenedor, esperarInit, sembrarEventos } = require('./eventos.helpers');

const PARCIAL = 'Se importaron tus datos, pero no el registro de tus sesiones. Puedes volver a importar la copia.';
const NO_BORRA = 'No se pudo borrar. Tus datos siguen intactos.';

const guardado = (page) => page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || 'null'), CLAVE_ESTADO);

/* Acepta los avisos de PACE y apunta su texto: la pregunta de antes y, si lo hay, el aviso
   (antes eran el `confirm` y el `alert` del navegador; Ez, 3A del 27 oct.). */
function apuntarDialogos(page) {
  return aceptarAvisosPace(page);
}

/* Cuenta las recargas de la página desde ahora. */
function contarRecargas(page) {
  const cuenta = { n: 0 };
  page.on('load', () => { cuenta.n++; });
  return cuenta;
}

async function entregarCopia(page, copia) {
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  await page.locator('input[type="file"][accept="application/json,.json"]').setInputFiles({
    name: 'pace-backup-20261021.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(copia)),
  });
}

const ESTADO_COPIA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, totalFocusMin: 42 };

test('2 · si el registro de sesiones no entra, la copia no se anuncia como completa', async ({ context, page }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 3);
  const seccion = await page.evaluate(() => window.paceEventsExport());
  /* El paso 3 de la barrera falla: el almacén de eventos no acepta el reemplazo. */
  await page.evaluate(() => {
    window.eventsWebReplaceFromImport = () => Promise.resolve({ result: 'rejected', container: null });
  });
  const dialogos = await apuntarDialogos(page);
  const recarga = page.waitForEvent('load');
  await entregarCopia(page, { app: 'PACE', version: 'v0.174.0', state: ESTADO_COPIA, events: seccion });
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  expect(dialogos.length, 'la copia se anunció como completa: no hubo aviso de lo que no entró').toBe(2);
  expect(dialogos[1]).toBe(PARCIAL);
  expect(dialogos.navegador, 'preguntó con la ventana del navegador').toEqual([]);
  /* Lo que dice el aviso es verdad: el estado entró y el registro no, ni el de la copia ni
     una mezcla con el de antes (al arrancar, el marcador lo deja vacío). */
  expect((await guardado(page)).totalFocusMin).toBe(42);
  await esperarInit(page);
  const c = await leerContenedor(page);
  expect(c.events.length, 'quedó una mezcla del registro de antes con el estado importado').toBe(0);
  expect(c.marker).toBeNull();
});

test('2 · sin almacén para el registro, una copia que lo trae avisa y una que no lo trae entra entera', async ({ context, page }) => {
  await context.addInitScript(() => { Object.defineProperty(window, 'indexedDB', { value: undefined, configurable: true }); });
  await sembrar(context);
  await irAlArtefacto(page);
  const errores = capturarErrores(page);
  const dialogos = await apuntarDialogos(page);
  const seccion = {
    schemaVersion: 1, exportedAt: new Date().toISOString(), activatedAt: new Date(Date.now() - 86400000).toISOString(),
    baseline: null, pruneCursor: null, retentionDays: 365, events: [],
  };
  /* Sin eventos dentro no se pierde nada: «Importado». */
  let recarga = page.waitForEvent('load');
  await entregarCopia(page, { app: 'PACE', state: ESTADO_COPIA, events: seccion });
  await expect(page.locator('.pace-aj-msg')).toHaveText('Importado — recargando…');
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  expect(dialogos.length).toBe(1);

  /* Con eventos dentro, el registro no tiene dónde entrar en este navegador: se dice. */
  const evento = await page.evaluate(() => window.makeEvent({
    type: 'session.completed', runId: 'run-1',
    payload: { module: 'focus', routineId: 'focus', completionReason: 'natural', elapsedSeconds: 1500,
      activeSeconds: 1500, plannedSeconds: 1500, plannedSecondsSource: 'preset' },
  }));
  recarga = page.waitForEvent('load');
  await entregarCopia(page, { app: 'PACE', state: Object.assign({}, ESTADO_COPIA, { totalFocusMin: 43 }),
    events: Object.assign({}, seccion, { events: [evento] }) });
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  expect(dialogos.length, 'el registro de la copia se perdió sin aviso').toBe(3);
  expect(dialogos[2]).toBe(PARCIAL);
  expect((await guardado(page)).totalFocusMin).toBe(43);
  expect(errores).toEqual([]);
});

test('3 · si el navegador no deja borrar, «Borrar todos mis datos» lo dice y no recarga', async ({ context, page }) => {
  await sembrar(context, { totalFocusMin: 500 });
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 2);
  await page.evaluate((clave) => {
    const orig = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (k) {
      if (k === clave) throw new DOMException('bloqueado', 'SecurityError');
      return orig.call(this, k);
    };
  }, CLAVE_ESTADO);
  await apuntarDialogos(page);
  const recargas = contarRecargas(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  await page.getByRole('button', { name: 'Borrar todos mis datos' }).click();

  await expect(page.locator('.pace-aj-msg'), 'no dijo que no había podido borrar').toHaveText(NO_BORRA);
  await page.waitForTimeout(800);
  expect(recargas.n, 'recargó como si hubiera borrado').toBe(0);
  expect((await guardado(page)).totalFocusMin, 'el aviso dice «intactos» y lo son').toBe(500);
  expect((await leerContenedor(page)).events.length).toBe(2);
});

test('CONTROL · si lo que falla es el registro y no el estado, lo borrado no vuelve', async ({ context, page }) => {
  /* Semilla de una vez: tras el borrado falta la clave y `sembrar` la volvería a escribir. */
  await context.addInitScript(([clave]) => {
    if (localStorage.getItem('__sembrado')) return;
    localStorage.setItem('__sembrado', '1');
    localStorage.setItem(clave, JSON.stringify({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
      ritmo: { libre: true }, totalFocusMin: 500 }));
  }, [CLAVE_ESTADO]);
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 2);
  /* El estado se borra; vaciar el registro FALLA a medio camino (la promesa se rechaza). */
  await page.evaluate(() => { window.eventsWebReset = () => Promise.reject(new Error('el almacén no responde')); });
  await apuntarDialogos(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  const recarga = page.waitForEvent('load');
  await page.getByRole('button', { name: 'Borrar todos mis datos' }).click();
  /* Tiene que recargar: lo que hay en memoria es lo borrado, y el siguiente gesto lo devolvería. */
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'attached' });
  expect(await page.evaluate(() => window.getState().totalFocusMin), 'lo borrado volvió').toBe(0);
  /* Y el marcador de la barrera termina de vaciar el registro al arrancar. */
  await esperarInit(page);
  expect((await leerContenedor(page)).events.length).toBe(0);
});

test('4 · importar descarta lo pasajero: un Foco de antes no se cuenta en la copia, y no se ofrece seguir lo de antes', async ({ context, page }) => {
  const hoy = new Date().toDateString();
  await sembrar(context, { focusMode: 'foco', focusMinutes: 25, lastActiveDay: hoy });
  await irAlArtefacto(page);
  /* Un bloque de 25 que empezó antes de importar y ya terminó (hoy), y una Respira y un Mueve
     a medias. */
  await page.evaluate(() => {
    const ahora = Date.now();
    localStorage.setItem('pace.timer.v1', JSON.stringify({ endsAt: ahora - 60000, mode: 'foco', minutes: 25, id: 'antes' }));
    localStorage.setItem('pace.breathe.v1', JSON.stringify({ v: 1, routineId: 'breathe.box', savedAt: ahora - 60000,
      activeMs: 30000, round: 1, breaths: 3, startedAt: ahora - 120000 }));
    localStorage.setItem('pace.cuerpo.v1', JSON.stringify({ v: 1, routineId: 'move.neck.3', savedAt: ahora - 60000 }));
  });
  await apuntarDialogos(page);
  const recarga = page.waitForEvent('load');
  await entregarCopia(page, { app: 'PACE', version: 'v0.174.0',
    state: Object.assign({}, ESTADO_COPIA, { focusMode: 'foco', focusMinutes: 25, lastActiveDay: hoy }) });
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);

  expect(await page.evaluate(() => window.getState().totalFocusMin), 'el Foco de antes se contó en la copia importada').toBe(42);
  const claves = await page.evaluate(() => Object.keys(localStorage));
  ['pace.timer.v1', 'pace.breathe.v1', 'pace.cuerpo.v1'].forEach((k) =>
    expect(claves, k + ' sobrevivió a la importación').not.toContain(k));
});
