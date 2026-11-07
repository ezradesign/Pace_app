/* PACE · E2E · CAZA DEL DÍA DE v1 Y DE LA COMPRA (7 nov. 2026)
 * ==============================================================
 * Las cinco personas del día de v1 (docs/audits/caza-v1-compra-7nov.md). Lo que se rompió:
 *
 *  · UNA COPIA DE ANTES DE v1 VOLVÍA A DAR LA SEMANA. `pasoV1` va dentro del estado y la copia lo
 *    pisa entero; una de antes de v1 no lo trae, y el arranque siguiente lo calculaba de nuevo:
 *    siete días más de todo, con su hoja, cada vez que se importara. Ahora se queda el de ahora
 *    (`pacePasoV1Conservar`, state-paso-v1.js, por `paceConservarAlImportar`), y a su lista se
 *    suman las de pago que hizo según la copia.
 *  · Y UNA COPIA DE OTRO EQUIPO donde PACE se instaló ya en v1 (`previo: false`) quitaba las rutinas
 *    que se quedan de quien sí lo usaba antes.
 *
 * El control (pasa con y sin el arreglo): tras «Borrar todo», la copia de después de v1 devuelve
 * la semana y la lista, como siempre.
 * Contra 62875b4d caen las dos primeras.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, aceptarAvisosPace, abrirTusDatos, CLAVE_ESTADO } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const DIA = 24 * 3600 * 1000;

/* Desde el primer arranque, v1: `PREMIUM_ABIERTO_HASTA_V1` en false sin tocar el código. */
async function enV1(context) {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
  });
}

/* Alguien que usaba PACE antes de v1, con dos de pago hechas. */
const USABA = {
  history: { days: { '2026-10-20': { focusMinutes: 50, breathMinutes: 5, moveMinutes: 6, waterGlasses: 4, holdSeconds: 0 } }, months: {}, years: {} },
  routineCounts: { 'rutina.extra.hang.bar': 2, 'rutina.move.neck.3': 4 },
  moveSessionsTotal: 2, totalFocusMin: 300,
};
const BASE = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, novedadesVistas: '*' };

async function importar(page, copia) {
  await aceptarAvisosPace(page);
  const recarga = page.waitForEvent('load');
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  await page.locator('input[type="file"][accept="application/json,.json"]').setInputFiles({
    name: 'pace-backup.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'PACE', version: 'v0.190.0', state: copia })),
  });
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  /* Lo que haría el arranque: el paso se calcula al cargar, y la hoja se mira al segundo y medio. */
  await page.waitForTimeout(2500);
}

const guardado = (page) => page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || 'null'), CLAVE_ESTADO);

test.describe('importar una copia el día de v1', () => {
  test('una copia de antes de v1 no vuelve a abrir la semana, y suma las de pago que trae', async ({ page, context }) => {
    await enV1(context);
    /* Su semana acabó hace dos días; se le quedó «Colgarse». */
    const PASO = { at: Date.now() - 9 * DIA, previo: true, hasta: Date.now() - 2 * DIA, rutinas: ['extra.hang.bar'], avisado: true };
    await sembrar(context, Object.assign({}, USABA, { pasoV1: PASO }));
    await irAlArtefacto(page);
    expect(await page.evaluate(() => window.canAccessRoutine('breathe.rounds.long'))).toBe(false);

    /* La copia de octubre: sin `pasoV1`, con «Rondas completas» (de pago) hecha entonces. */
    await importar(page, Object.assign({}, BASE, USABA, {
      routineCounts: { 'rutina.extra.hang.bar': 2, 'rutina.breathe.rounds.full': 1, 'rutina.move.neck.3': 4 }, totalFocusMin: 120,
    }));

    const s = await guardado(page);
    expect(s.totalFocusMin, 'la copia no entró').toBe(120);
    expect({ at: s.pasoV1.at, hasta: s.pasoV1.hasta, previo: s.pasoV1.previo, avisado: s.pasoV1.avisado },
      'la copia vieja volvió a empezar la semana').toEqual({ at: PASO.at, hasta: PASO.hasta, previo: true, avisado: true });
    expect(s.pasoV1.rutinas).toEqual(['breathe.rounds.full', 'extra.hang.bar']);
    const r = await page.evaluate(() => ({
      otra: window.canAccessRoutine('breathe.rounds.long'), crear: window.puedeCrearRutinas(), abierto: window.paceAbiertoAhora(),
      suyas: ['extra.hang.bar', 'breathe.rounds.full'].map((id) => window.canAccessRoutine(id)),
      hoja: !!document.querySelector('[data-pace-premium-hoja="pasov1"]'),
    }));
    expect(r).toEqual({ otra: false, crear: false, abierto: false, suyas: [true, true], hoja: false });
  });

  test('una copia de un equipo donde PACE se instaló ya en v1 no quita las que se quedan', async ({ page, context }) => {
    await enV1(context);
    const PASO = { at: Date.now() - 2 * DIA, previo: true, hasta: Date.now() + 5 * DIA, rutinas: ['extra.hang.bar'], avisado: true };
    await sembrar(context, Object.assign({}, USABA, { pasoV1: PASO }));
    await irAlArtefacto(page);
    await importar(page, Object.assign({}, BASE, { totalFocusMin: 30, pasoV1: { at: Date.now() - DIA, previo: false } }));

    const s = await guardado(page);
    expect(s.totalFocusMin, 'la copia no entró').toBe(30);
    expect(s.pasoV1, 'la copia de otro equipo le quitó su semana y su lista').toEqual(PASO);
  });

  test('CONTROL · tras «Borrar todo», la copia de después de v1 devuelve la semana y la lista', async ({ page, context }) => {
    await enV1(context);
    /* Lo que deja «Borrar todo» en v1: el arranque de alguien que no usaba PACE. */
    await sembrar(context, { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, novedadesVistas: '*',
      pasoV1: { at: Date.now() - 60000, previo: false } });
    await irAlArtefacto(page);
    const PASO = { at: Date.now() - 3 * DIA, previo: true, hasta: Date.now() + 4 * DIA, rutinas: ['extra.hang.bar'], avisado: true };
    await importar(page, Object.assign({}, BASE, USABA, { pasoV1: PASO }));
    expect((await guardado(page)).pasoV1).toEqual(PASO);
    expect(await page.evaluate(() => window.paceAbiertoAhora())).toBe(true);
  });
});

/* LA PRUEBA DEL MENSUAL PROMETE QUE SE CANCELA DESDE AJUSTES (/premium, /gracias y el aviso de los dos
   días): sin el portal de Stripe (`PACE_TIENDA_WEB.gestionar`), el aviso solo dice «Seguir con la
   prueba» y Ajustes no tiene «Gestionar la suscripción». El día que el mensual tenga enlace, tiene que
   tener también dónde cancelarlo. Hoy el mensual no tiene enlace y esto pasa; cae si se enciende solo. */
test('el mensual no se vende sin dónde cancelarlo', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const t = await page.evaluate(() => ({ mes: window.PACE_TIENDA_WEB.enlaces.mes, gestionar: window.PACE_TIENDA_WEB.gestionar }));
  if (t.mes) expect(t.gestionar, 'el mensual tiene enlace de pago y no tiene portal para cancelarlo').toMatch(/^https:\/\//);
});
