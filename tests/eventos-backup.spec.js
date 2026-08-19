/* PACE · el backup lleva pace.events.v1, y lo devuelve (s169)
 * ===========================================================
 * `privacy.html` promete exportar «todo tu estado ... e importarlo en otro
 * dispositivo». Hasta s169 el backup NO llevaba el registro de uso, y era
 * correcto: el contenedor estaba vacio porque no habia emisores. La Fase 2 lo
 * cambia, y esta es la CONDICION DE ENTRADA — se pone antes que el primer
 * emisor, a proposito, para que el gate del `verify` no pille a nadie a mitad.
 *
 * QUE DEFIENDE, y por que cada una hace falta:
 *
 *  1. QUE EL EXPORT LA LLEVE. Sin esto la promesa publica es falsa en cuanto
 *     exista un evento. Se comprueba sobre el ARCHIVO que el navegador
 *     descarga de verdad, no sobre el objeto que lo construye: lo que el
 *     usuario se lleva es el archivo.
 *
 *  2. QUE EL IMPORT LA DEVUELVA. Exportar historial que al restaurar se tira
 *     seria peor que no exportarlo -- la mitad de la frase que se defiende es
 *     «e importarlo en otro dispositivo». `tests/eventos.spec.js` ya cubre el
 *     camino contrario (backup ANTIGUO, sin seccion, que REINICIA), asi que
 *     aqui va el nuevo y los dos quedan cubiertos.
 *
 *  3. QUE UNA SECCION CORRUPTA ABORTE EL IMPORT ENTERO. Es el aserto fuerte:
 *     §17 dice que si la validacion falla NO se modifica ningun almacen, y eso
 *     incluye `pace.state.v2`, que ni siquiera pertenece a este subsistema. El
 *     fallo que atrapa es el tentador: validar la seccion, descartarla si esta
 *     mal y seguir importando el estado «que al menos eso se salva». Eso deja
 *     al usuario con estado nuevo e historial ajeno, que es la MEZCLA que todo
 *     el diseño evita.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');
const { CLAVE_EVENTOS, leerContenedor, esperarInit, sembrarEventos } = require('./eventos.helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

/* Abre Ajustes y entrega un archivo al input de import. */
async function importar(page, objeto) {
  page.on('dialog', d => d.accept());
  await page.locator('button[aria-label="Abrir tweaks"]').click();
  await page.locator('input[type="file"][accept="application/json,.json"]')
    .setInputFiles({
      name: 'pace-backup-20260101.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(objeto)),
    });
}

/* -------------------------------------------------------------------------- */

test('el backup que se DESCARGA lleva la seccion de eventos, con sus campos', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 3);

  await page.locator('button[aria-label="Abrir tweaks"]').click();
  /* Se lee el ARCHIVO, no el objeto: es lo que el usuario se lleva. */
  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar', exact: true }).click(),
  ]);
  const ruta = await descarga.path();
  const backup = JSON.parse(require('fs').readFileSync(ruta, 'utf8'));

  expect(backup.app).toBe('PACE');
  expect(backup.state, 'el estado legacy sigue estando').toBeTruthy();

  const ev = backup.events;
  expect(ev, 'el backup NO lleva seccion de eventos: privacy.html promete exportar TODO el estado').toBeTruthy();
  /* Los campos que §17 exige en el export. Se comprueban por PRESENCIA y no
     por valor: los valores son del contenedor y ya los cubre eventos.spec.js. */
  ['schemaVersion', 'exportedAt', 'activatedAt', 'baseline', 'events', 'pruneCursor', 'retentionDays']
    .forEach(k => expect(ev, 'falta `' + k + '` en la seccion de eventos').toHaveProperty(k));
  expect(ev.events.length, 'los 3 eventos sembrados no viajan en el backup').toBe(3);

  expect(errores, 'consola con errores').toEqual([]);
});

test('un backup CON seccion devuelve ese historial, no lo reinicia', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);

  /* La seccion se fabrica con el contrato REAL (`paceEventsExport`) y no a
     mano: un JSON escrito aqui podria pasar la validacion y no parecerse a lo
     que la app produce de verdad. */
  await sembrarEventos(page, 3);
  const seccion = await page.evaluate(() => window.paceEventsExport());
  expect(seccion.events.length).toBe(3);

  /* Ahora el dispositivo tiene OTRA historia, mas larga. Si el import
     reiniciara —el camino de los backups antiguos— quedarian 0; si fusionara,
     8. Las dos son el fallo, y por eso el numero de partida es distinto. */
  await page.evaluate(() => window.paceEventsReset());
  await sembrarEventos(page, 8);
  const antes = await leerContenedor(page);
  expect(antes.events.length).toBe(8);

  await importar(page, {
    app: 'PACE', version: 'v0.99.0', exportedAt: new Date().toISOString(),
    state: { firstSeen: 1, lang: 'es', palette: 'crema', totalFocusMin: 42 },
    events: seccion,
  });

  /* Se espera a que el contenedor CAMBIE (deje de tener los 8 de partida), no
     a que valga 3. Esperar el valor bueno hace que un producto roto salga como
     un timeout mudo en vez de como el aserto que explica que paso -- medido en
     la calibracion de s169, donde reiniciar en vez de reemplazar daba
     «Timeout 15000ms exceeded» y ni una palabra mas. */
  await page.waitForFunction(() => {
    const raw = localStorage.getItem('pace.events.v1');
    if (!raw) return false;
    return JSON.parse(raw).events.length !== 8;
  }, null, { timeout: 15000 });

  const despues = await leerContenedor(page);
  expect(despues.events.length, 'ni reinicio (0) ni fusion (11): reemplazo').toBe(3);
  expect(despues.activatedAt, 'el activatedAt viene del backup, no es uno nuevo').toBe(seccion.activatedAt);
  expect(despues.marker, 'el marcador quedo colgado tras el import').toBeNull();
});

test('una seccion CORRUPTA aborta el import ENTERO: tampoco entra el estado', async ({ page }) => {
  await irAlArtefacto(page);
  await esperarInit(page);
  await sembrarEventos(page, 4);

  const antesEventos = await leerContenedor(page);

  /* `schemaVersion` del FUTURO: el validador lo rechaza sin tocar nada, porque
     no sabe que campos dejaria a medias. El estado que acompaña es bien
     visible a proposito -- si se colara, se ve. */
  await importar(page, {
    app: 'PACE', version: 'v9.99.0', exportedAt: new Date().toISOString(),
    state: { firstSeen: 1, lang: 'en', palette: 'crema', totalFocusMin: 999999 },
    events: { schemaVersion: 99, activatedAt: new Date().toISOString(), events: [], baseline: {} },
  });

  /* CARRERA ENTRE LOS DOS DESENLACES, y no espera solo al bueno. Si aqui se
     esperase unicamente el mensaje de error, un producto que ACEPTA el backup
     invalido no daria el aserto explicativo sino un `toBeVisible` agotado a
     los 15 s -- pasa en la calibracion, comprobado. Esperando a CUALQUIERA de
     los dos finales, el fallo llega al aserto de abajo, que si dice que paso. */
  await page.waitForFunction(() => {
    const entro = (localStorage.getItem('pace.state.v2') || '').indexOf('999999') !== -1;
    const err = /No se pudo|no se pudo|Error|error/.test(document.body.innerText || '');
    return entro || err;
  }, null, { timeout: 15000 });

  const despuesEventos = await leerContenedor(page);
  const despuesEstado = await page.evaluate(() => localStorage.getItem('pace.state.v2'));

  expect(despuesEventos.events.length, 'el historial cambio pese a que el backup era invalido').toBe(4);
  expect(despuesEventos.activatedAt, 'el contenedor se reinicio con un backup invalido').toBe(antesEventos.activatedAt);

  /* TRAMPA DEL INSTRUMENTO, medida (s169): la primera version de este aserto
     comparaba `pace.state.v2` ENTERO contra una foto de antes, y salio rojo con
     el producto SANO -- la app normaliza y RE-PERSISTE su propio estado al
     arrancar, asi que el documento cambia sin que nadie importe nada. Comparar
     un documento que la app tambien escribe no es lo mismo que comprobar que
     el import no escribio. Se miran los campos que el backup HABRIA cambiado,
     que es lo unico que distingue las dos hipotesis. */
  const estado = JSON.parse(despuesEstado);
  expect(estado.totalFocusMin, 'ENTRO totalFocusMin del backup invalido (§17: no se toca NINGUN almacen)').not.toBe(999999);
  expect(estado.lang, 'ENTRO el idioma del backup invalido').toBe('es');
  expect(despuesEstado, 'algun campo del backup invalido se colo en el estado').not.toContain('999999');
});
