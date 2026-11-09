/* PACE · E2E · UN DÍA QUE NO SE PUDO RESUMIR NO SE PIERDE (ChatGPT, 8 nov. 2026, con el sí de Ez)
 * ==============================================================================================
 * Antes, si `ritmoResumenDe` reventaba, `ritmoResumenAntesDePisar` marcaba el día como resumido sin
 * resumen: al elegir el día siguiente se pisaba, y el motor de la semana no lo veía nunca. Ahora el
 * día no se marca, su copia va a `ritmo.sinResumir` y `ritmoResumirAhora` la reintenta.
 *
 * El fallo se fuerza en `ritmoHorarioDelDia`, que el resumen llama por el global con la fecha del día
 * que resume (`ritmoMenu` la llama con la de hoy): solo revienta el resumen del martes, y solo
 * mientras `__paceFallaResumen` esté en localStorage. El 13 de octubre de 2026 es martes.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, CLAVE_ESTADO, pulsarComienza } = require('./helpers');
const { leerContenedor, esperarInit } = require('./eventos.helpers');

const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const MARTES = '2026-10-13';
const MARTES_MANANA = new Date('2026-10-13T08:30:00+02:00');
const MIERCOLES_MANANA = new Date('2026-10-14T08:30:00+02:00');
const FALLA = '__paceFallaResumen';

const estado = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), CLAVE_ESTADO);
async function resumenes(page) {
  const c = await leerContenedor(page);
  return ((c && c.events) || []).filter((e) => e.type === 'ritmo.day.closed');
}
function paradasServidas(page) {
  return page.evaluate(() => {
    const p = window.ritmoPlan(window.getState());
    return p.m.items.filter((it) => (it.tipo === 'pausa' || it.tipo === 'cierre') && it.platos && it.platos.length)
      .map((it) => ({ hora: it.desde, platos: it.platos.map((x) => ({ id: x.id, clave: x.clave })) }));
  });
}

/* Antes de que cargue la app: el global que exponen sus scripts pasa por aquí. */
function fallarElResumen(context) {
  return context.addInitScript(({ fecha, clave }) => {
    let real;
    Object.defineProperty(window, 'ritmoHorarioDelDia', {
      configurable: true,
      get() {
        return real && function (h, f) {
          if (f === fecha && localStorage.getItem(clave)) throw new Error('fallo forzado del resumen');
          return real.apply(this, arguments);
        };
      },
      set(v) { real = v; },
    });
  }, { fecha: MARTES, clave: FALLA });
}

test('si resumir el martes revienta, no se marca, queda su copia y al reintentar sale un solo resumen con lo descartado', async ({ page, context }) => {
  test.setTimeout(90000);
  const errores = capturarErrores(page);
  await fallarElResumen(context);
  await sembrar(context, { ritmo: { semanaTipo: LV } });
  await page.clock.install({ time: MARTES_MANANA });
  await irAlArtefacto(page);
  await esperarInit(page);

  /* El martes: «Otra» dos veces en la tercera parada; la primera, hecha, y la segunda, saltada. */
  await pulsarComienza(page);
  await page.locator('[data-pace-ritmo-habitual-comienza]').filter({ visible: true }).click();
  const servidas = await paradasServidas(page);
  expect(servidas.length, 'GUARD: una jornada entera sirve varias paradas').toBeGreaterThan(4);
  const clave = servidas[2].platos[0].clave;
  const descartados = [servidas[2].platos[0].id];
  await page.evaluate((k) => window.ritmoOtra([k]), clave);
  descartados.push((await paradasServidas(page))[2].platos[0].id);
  await page.evaluate((k) => window.ritmoOtra([k]), clave);
  await page.evaluate(() => window.setState((prev) => Object.assign({}, prev, {
    ritmo: Object.assign({}, prev.ritmo, { dia: Object.assign({}, prev.ritmo.dia, { estados: { 1: 'hecha', 2: 'saltada' } }) }),
  })));

  /* El miércoles por la mañana, con el resumen del martes roto. */
  await page.evaluate((c) => localStorage.setItem(c, '1'), FALLA);
  await page.clock.setSystemTime(MIERCOLES_MANANA);
  await page.reload();
  await esperarInit(page);
  await expect.poll(async () => ((await estado(page)).ritmo.sinResumir || []).map((d) => d.fecha), { timeout: 15000 }).toEqual([MARTES]);
  let r = (await estado(page)).ritmo;
  expect(r.resumido, 'el martes no queda marcado como resumido').not.toBe(MARTES);
  expect((r.resumenes || []).map((x) => x.fecha)).toEqual([]);
  expect(r.sinResumir[0].descartes[clave], 'la copia lleva lo descartado').toEqual(descartados);
  expect(await resumenes(page)).toHaveLength(0);

  /* Al volver a abrir, la copia sigue (el saneado del estado la deja pasar), y los reintentos del
     arranque, con el fallo puesto, no la repiten. */
  await page.reload();
  await esperarInit(page);
  await page.clock.fastForward(20 * 1000);
  r = (await estado(page)).ritmo;
  expect(r.sinResumir.map((d) => d.fecha)).toEqual([MARTES]);
  expect(r.resumido).not.toBe(MARTES);

  /* Elegir el día de hoy pisa `ritmo.dia`: el martes ya solo vive en su copia. */
  await page.evaluate(() => window.ritmoElegir('jornada'));
  r = (await estado(page)).ritmo;
  expect(r.dia.fecha).toBe('2026-10-14');
  expect(r.sinResumir.map((d) => d.fecha), 'una sola copia del martes').toEqual([MARTES]);

  /* Sin el fallo, el reintento lo resume una vez, con lo descartado de entonces. */
  await page.evaluate((c) => { localStorage.removeItem(c); window.ritmoResumirAhora(); }, FALLA);
  await expect.poll(async () => (await resumenes(page)).map((e) => e.payload.fecha), { timeout: 15000 }).toEqual([MARTES]);
  const p = (await resumenes(page))[0].payload;
  expect(p.paradas.slice(0, 2).map((x) => x.estado)).toEqual(['hecha', 'saltada']);
  expect(p.paradas[2].platos[0].otras).toBe(2);
  expect(p.paradas[2].platos[0].antes, 'lo descartado el martes, no lo de hoy').toEqual(descartados);

  await page.clock.fastForward(70 * 1000);
  await page.evaluate(() => window.ritmoResumirAhora());
  await page.waitForTimeout(500);
  expect(await resumenes(page), 'un solo resumen del martes').toHaveLength(1);
  r = (await estado(page)).ritmo;
  expect(r.sinResumir).toEqual([]);
  expect(r.resumenes).toEqual([]);
  expect(errores).toEqual([]);
});

test('CONTROL · un día sin opción (null sin error) se marca como siempre; las copias, una por fecha y con tope', async ({ page }) => {
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const sinOpcion = window.ritmoResumenAntesDePisar(window.getState(), { dia: { fecha: '2020-01-01' }, resumenes: [] });
    let x = { sinResumir: [] };
    for (let d = 1; d <= 16; d++) x = window.ritmoGuardarSinResumir(x, { fecha: '2020-02-' + String(d).padStart(2, '0'), opcion: 'jornada' });
    const otraVez = window.ritmoGuardarSinResumir(x, { fecha: '2020-02-16', opcion: 'jornada' });
    return { sinOpcion, fechas: x.sinResumir.map((d) => d.fecha), tope: window.RITMO_RESUMEN_COLA_MAX, igual: otraVez === x };
  });
  expect(r.sinOpcion.resumido).toBe('2020-01-01');
  expect(r.sinOpcion.sinResumir).toBeUndefined();
  expect(r.sinOpcion.resumenes).toEqual([]);
  expect(r.fechas).toHaveLength(r.tope);
  expect(r.fechas[r.fechas.length - 1]).toBe('2020-02-16');
  expect(new Set(r.fechas).size).toBe(r.fechas.length);
  expect(r.igual, 'la misma copia otra vez no escribe').toBe(true);
});
