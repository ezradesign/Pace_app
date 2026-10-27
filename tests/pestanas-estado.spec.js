/* PACE · E2E · varias pestañas, un solo estado (caza del 10 oct., estado-1, -2 y -3)
 * ===============================================================================
 * Cada pestaña llevaba su copia de `pace.state.v2` y la escribía ENTERA en cada gesto, así que la
 * que se abrió antes borraba lo hecho en la otra al tocar cualquier cosa. Medido en v0.154.0:
 * tres vasos en B y uno en A dejaban un vaso; «Borrar todo» en B y un vaso en A devolvían los
 * 500 minutos borrados; una copia importada en B se perdía con un vaso en A.
 *
 * Las tres primeras caen contra el `index.html` de v0.154.0. Las dos últimas vigilan el arreglo:
 * que una pestaña no adopte lo que no se puede leer (eso pasa también en v0.154.0) y que adoptar no
 * escriba ni despierte un ping-pong (esa cae en v0.154.0 porque allí no se adopta nada).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, aceptarAvisosPace, CLAVE_ESTADO, SEMILLA, abrirTusDatos } = require('./helpers');

const guardado = (page) => page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || 'null'), CLAVE_ESTADO);
const unVaso = (page) => page.locator('[data-pace-sidebar]').getByRole('button', { name: /Añadir un vaso/ }).click();

async function dosPestanas(context, extra) {
  await sembrar(context, extra);
  const a = await context.newPage();
  await irAlArtefacto(a);
  const b = await context.newPage();
  await irAlArtefacto(b);
  return { a, b };
}

test('estado-1 · los vasos de una pestaña no los borra la que se abrió antes', async ({ context }) => {
  const { a, b } = await dosPestanas(context);
  const errores = capturarErrores(a);
  await unVaso(b); await unVaso(b); await unVaso(b);
  await expect.poll(async () => (await guardado(b)).water.today).toBe(3);

  await a.bringToFront();
  /* La que lleva rato abierta ya enseña los tres de la otra, sin recargar. */
  await expect(a.locator('[data-pace-sidebar]')).toContainText('Tres vasos de ocho');
  await unVaso(a);
  expect((await guardado(a)).water.today, 'la pestaña vieja pisó los vasos de la otra').toBe(4);
  expect(errores).toEqual([]);
});

test('estado-2 · «Borrar todos mis datos» en una pestaña no lo resucita la otra', async ({ context }) => {
  const hoy = new Date().toDateString();
  /* Semilla de UNA vez: `sembrar` escribe en cada carga si falta la clave, y tras «Borrar todo»
     falta, así que la recarga de B volvería a sembrar los 500 minutos. La marca no es `pace.*`,
     que es lo que barre el borrado. */
  await context.addInitScript(([clave, estado]) => {
    if (localStorage.getItem('__sembrado')) return;
    localStorage.setItem('__sembrado', '1');
    localStorage.setItem(clave, JSON.stringify(estado));
  }, [CLAVE_ESTADO, Object.assign({}, SEMILLA, { totalFocusMin: 500, lastActiveDay: hoy,
    water: { goal: 8, today: 4, lastReset: hoy } })]);
  const a = await context.newPage();
  await irAlArtefacto(a);
  const b = await context.newPage();
  await irAlArtefacto(b);
  await aceptarAvisosPace(b);
  await b.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(b);
  const recarga = b.waitForEvent('load');
  await b.getByRole('button', { name: 'Borrar todos mis datos' }).click();
  await recarga;

  /* La otra pestaña adopta el borrado sin recargar... */
  await expect.poll(() => a.evaluate(() => getState().totalFocusMin)).toBe(0);
  /* ...y lo siguiente que escriba ya no lleva lo borrado. */
  await a.evaluate(() => addWaterGlass(1));
  const s = await guardado(a);
  expect(s.totalFocusMin, 'la otra pestaña devolvió los minutos borrados').toBe(0);
  expect(s.water.today).toBe(1);
});

test('estado-3 · una copia importada en una pestaña no la pisa la otra', async ({ context }) => {
  const { a, b } = await dosPestanas(context);
  await aceptarAvisosPace(b);
  await b.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(b);
  const recarga = b.waitForEvent('load');
  await b.locator('input[type="file"][accept="application/json,.json"]').setInputFiles({
    name: 'pace-backup-20261001.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'PACE', version: 'v0.154.0',
      state: { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, totalFocusMin: 4321 } })),
  });
  await recarga;
  await b.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  await a.bringToFront();
  await unVaso(a);
  expect((await guardado(a)).totalFocusMin, 'la otra pestaña pisó la copia importada').toBe(4321);
});

test('CONTROL · lo que no se puede leer no se adopta: la pestaña se queda con su copia y la vuelve a guardar', async ({ context }) => {
  const { a, b } = await dosPestanas(context, { totalFocusMin: 777 });
  await b.evaluate((clave) => localStorage.setItem(clave, '{"roto'), CLAVE_ESTADO);
  await b.evaluate((clave) => localStorage.setItem(clave, '[1,2,3]'), CLAVE_ESTADO);
  await a.waitForTimeout(300);
  expect(await a.evaluate(() => getState().totalFocusMin), 'adoptó el estado de fábrica').toBe(777);
  await unVaso(a);
  expect((await guardado(a)).totalFocusMin).toBe(777);
});

test('CONTROL · adoptar no escribe: tras un vaso en una pestaña, ninguna de las dos sigue escribiendo', async ({ context }) => {
  await context.addInitScript((clave) => {
    window.__escrituras = 0;
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (k === clave) window.__escrituras++; return orig.call(this, k, v); };
  }, CLAVE_ESTADO);
  const { a, b } = await dosPestanas(context);
  await a.waitForTimeout(500);
  const antesA = await a.evaluate(() => window.__escrituras);
  await unVaso(b);
  await expect.poll(() => a.evaluate(() => getState().water.today)).toBe(1);
  /* B escribe lo que escribe un vaso (el agua, el plan, algún logro); lo que no puede pasar es que
     la escritura de una despierte a la otra y siga sin fin. */
  await a.waitForTimeout(500);
  const trasB = await b.evaluate(() => window.__escrituras);
  await a.waitForTimeout(1500);
  expect(await a.evaluate(() => window.__escrituras) - antesA, 'la pestaña que adopta escribió').toBe(0);
  expect(await b.evaluate(() => window.__escrituras), 'hubo ping-pong entre pestañas').toBe(trasB);
});

/* AUDITORÍA DEL 21 OCT. (8) · DOS ESCRITURAS CASI A LA VEZ. Adoptar llega con el evento `storage`,
   que el navegador entrega a la otra pestaña un rato DESPUÉS de guardar: si en ese rato la otra
   escribe, lo hace sobre su copia de antes y se pierde lo de la primera. Aquí se mide desde qué
   separación entre dos vasos (uno en cada pestaña) no se pierde ninguno. */
async function dosVasosSeparados(a, b, ms) {
  await a.evaluate(() => setState({ water: Object.assign({}, getState().water, { today: 0 }) }));
  await expect.poll(() => b.evaluate(() => getState().water.today)).toBe(0);
  const t0 = Date.now() + 150;
  const vaso = (t) => new Promise((r) => setTimeout(() => { addWaterGlass(1); r(); }, Math.max(0, t - Date.now())));
  await Promise.all([a.evaluate(vaso, t0), b.evaluate(vaso, t0 + ms)]);
  await a.waitForTimeout(250);
  return (await guardado(a)).water.today;
}

test('estado-4 · dos vasos en dos pestañas a 100 ms o más no se pierden (y por debajo, se mide)', async ({ context }) => {
  const { a, b } = await dosPestanas(context, { lastActiveDay: new Date().toDateString() });
  const medida = [];
  for (const ms of [0, 10, 100, 250]) {
    const vasos = [];
    for (let i = 0; i < 3; i++) vasos.push(await dosVasosSeparados(a, b, ms));
    medida.push({ ms, perdidos: vasos.filter(v => v < 2).length, de: vasos.length });
  }
  /* Medido el 21 oct. en v0.174.0 (5 intentos por separación): a 0, 1 y 2 ms se pierde uno de
     los dos vasos 5 de 5 veces; a 5 ms, 2 de 5; a 10 ms, 3 de 5; a 20, 50 y 100 ms, ninguno. Dos
     gestos de una persona en dos ventanas no caben en 20 ms; dos escrituras de la app sola, sí.
     Qué hacer con eso lo decide Ez (STATE.md, «Espera a Ez»). Solo se aserta la escala humana,
     para no depender de la carga de la máquina. */
  console.log('[estado-4] vasos perdidos por separación:', JSON.stringify(medida));
  medida.filter(m => m.ms >= 100).forEach(m =>
    expect(m.perdidos, 'a ' + m.ms + ' ms entre dos vasos se perdió uno').toBe(0));
});
