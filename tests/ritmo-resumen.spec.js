/* PACE · E2E · EL RESUMEN DEL DÍA DE «A TU RITMO» (`ritmo.day.closed`)
 * ===================================================================
 * El primer paso del motor de la semana (Ez, 8 oct. 2026): cuando un día de «A tu
 * ritmo» ya pasó, el registro local guarda qué sirvió y qué pasó con cada parada.
 * Sin esto, lo saltado y los «Otra» se perdían al elegir el día siguiente.
 *
 * Los asertos son RELACIONALES: el resumen se compara con lo que la app sirvió ese
 * día y con lo que se pulsó, no con números escritos aquí. El 8 de octubre de 2026
 * es jueves y el 9, viernes; el huso, el de playwright.config.js.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, CLAVE_ESTADO } = require('./helpers');
const { leerContenedor, esperarInit } = require('./eventos.helpers');

const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const AYER = '2026-10-08';
const AYER_MANANA = new Date('2026-10-08T08:30:00+02:00');
const HOY_MANANA = new Date('2026-10-09T08:30:00+02:00');
/* Una reunión de 11:00 a 11:30, leída del calendario: el día la esquiva y deja una pausa justo antes. */
const OCUPADO = { fecha: AYER, tramos: [[660, 30]], fuente: 'ics' };

const estado = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), CLAVE_ESTADO);
async function resumenes(page) {
  const c = await leerContenedor(page);
  return ((c && c.events) || []).filter((e) => e.type === 'ritmo.day.closed');
}

/* Las paradas que la app sirve AHORA, con la clave de cada plato. */
function paradasServidas(page) {
  return page.evaluate(() => {
    const p = window.ritmoPlan(window.getState());
    return p.m.items.filter((it) => (it.tipo === 'pausa' || it.tipo === 'cierre') && it.platos && it.platos.length)
      .map((it) => ({ hora: it.desde, dur: it.dur, platos: it.platos.map((x) => ({ id: x.id, clave: x.clave })) }));
  });
}

test('el día de ayer se guarda resumido a la mañana siguiente, con lo hecho, lo saltado y los «Otra»', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: { semanaTipo: LV, ocupado: OCUPADO } });
  await page.clock.install({ time: AYER_MANANA });
  await irAlArtefacto(page);

  /* Ayer: «Comienza» sirve el jueves de siempre. */
  await page.locator('[data-pace-ritmo-habitual-comienza]').filter({ visible: true }).click();
  const servidas = await paradasServidas(page);
  expect(servidas.length, 'una jornada entera sirve varias paradas').toBeGreaterThan(4);

  /* «Otra» dos veces en la tercera parada: lo que se enseñó antes es lo descartado. */
  const clave = servidas[2].platos[0].clave;
  const descartados = [servidas[2].platos[0].id];
  await page.evaluate((k) => window.ritmoOtra([k]), clave);
  descartados.push((await paradasServidas(page))[2].platos[0].id);
  await page.evaluate((k) => window.ritmoOtra([k]), clave);
  const final = (await paradasServidas(page))[2].platos[0].id;
  /* La primera pausa hecha y la segunda saltada, como las deja la app (`dia.estados`). */
  await page.evaluate(() => window.setState((prev) => Object.assign({}, prev, {
    ritmo: Object.assign({}, prev.ritmo, { dia: Object.assign({}, prev.ritmo.dia, { estados: { 1: 'hecha', 2: 'saltada' } }) }),
  })));
  const finales = await paradasServidas(page);
  const horasServidas = finales.map((x) => x.hora);
  expect(await resumenes(page), 'mientras el día no ha pasado no se resume').toHaveLength(0);

  /* Hoy: se abre la app por la mañana. */
  await page.clock.setSystemTime(HOY_MANANA);
  await page.reload();
  await esperarInit(page);
  await expect.poll(async () => (await resumenes(page)).length, { timeout: 15000 }).toBe(1);

  const [e] = await resumenes(page);
  expect(e.localDay).toBe(AYER);
  expect(e.runId).toBeNull();
  expect(e.pathRunId).toBeNull();
  const p = e.payload;
  expect(p.fecha).toBe(AYER);
  expect(p.opcion).toBe('jornada');
  expect(p.habitual).toBe('jornada');
  expect(p.paradas.map((x) => x.hora), 'las paradas son las que se sirvieron').toEqual(horasServidas);
  expect(p.paradas.map((x) => x.estado)).toEqual(['hecha', 'saltada'].concat(Array(horasServidas.length - 2).fill(null)));
  const tercera = p.paradas[2].platos[0];
  expect(tercera.otras).toBe(2);
  expect(tercera.antes).toEqual(descartados);
  expect(tercera.id).toBe(final);
  expect(p.paradas.filter((x, i) => i !== 2).every((x) => x.platos.every((pl) => pl.otras === 0 && pl.antes.length === 0))).toBe(true);

  /* La reunión cuenta alrededor de las paradas cercanas (media hora antes y después) y en ninguna lejana. */
  const cerca = (x, i) => x.hora - 30 < 690 && x.hora + finales[i].dur + 30 > 660;
  expect(p.paradas.some((x, i) => cerca(x, i) && x.reunion > 0), 'alguna parada junto a la reunión la anota').toBe(true);
  expect(p.paradas.filter((x, i) => !cerca(x, i)).every((x) => x.reunion === 0)).toBe(true);

  /* Una sola vez, aunque se vuelva a abrir; y la cola queda vacía. */
  await page.reload();
  await esperarInit(page);
  await page.clock.fastForward(20 * 1000);
  expect(await resumenes(page)).toHaveLength(1);
  const r = (await estado(page)).ritmo;
  expect(r.resumido).toBe(AYER);
  expect(r.resumenes).toEqual([]);
  expect(errores).toEqual([]);
});

/* Elegir el día de hoy pisa `ritmo.dia`. Si nada había resumido aún el de ayer —el
   registro abre tarde—, su resumen tiene que estar ya en la cola al pisarlo. El
   reloj se mueve sin disparar temporizadores, así que solo `ritmoGuardar` puede
   haberlo puesto ahí. */
test('elegir el día de hoy antes del primer resumen no pierde el de ayer', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: { semanaTipo: LV } });
  await page.clock.install({ time: AYER_MANANA });
  await irAlArtefacto(page);
  await esperarInit(page);
  await page.locator('[data-pace-ritmo-habitual-comienza]').filter({ visible: true }).click();

  await page.clock.setSystemTime(HOY_MANANA);
  const tras = await page.evaluate(() => {
    window.ritmoElegir('jornada');
    const r = window.getState().ritmo;
    return { fecha: r.dia.fecha, cola: (r.resumenes || []).map((x) => x.fecha), resumido: r.resumido };
  });
  expect(tras.fecha).toBe('2026-10-09');
  expect(tras.cola, 'el resumen de ayer entra en la cola antes de pisar el día').toEqual([AYER]);
  expect(tras.resumido).toBe(AYER);

  await page.clock.fastForward(20 * 1000);
  await expect.poll(async () => (await resumenes(page)).map((e) => e.payload.fecha), { timeout: 15000 }).toEqual([AYER]);
  expect(errores).toEqual([]);
});

/* Lista permitida: lo que no está en el esquema no entra, ni un texto ni un título. */
test('el resumen solo guarda horas, módulos e ids: lo demás se cae', async ({ page }) => {
  await irAlArtefacto(page);
  const limpio = await page.evaluate(() => window.normalizeEventPayload('ritmo.day.closed', {
    fecha: '2026-10-08', opcion: 'jornada', habitual: 'jornada', inicio: 540, salida: 1020, nota: 'algo mío',
    paradas: [{ hora: 585, tipo: 'pausa', estado: 'hecha', reunion: 0, titulo: 'Reunión con Ana',
      platos: [{ modulo: 'estira', id: 'move.neck.3', otras: 1, antes: ['extra.calf'], nombre: 'Cuello' }] }],
  }));
  expect(Object.keys(limpio).sort()).toEqual(['fecha', 'habitual', 'inicio', 'opcion', 'paradas', 'salida']);
  expect(Object.keys(limpio.paradas[0]).sort()).toEqual(['estado', 'hora', 'platos', 'reunion', 'tipo']);
  expect(Object.keys(limpio.paradas[0].platos[0]).sort()).toEqual(['antes', 'id', 'modulo', 'otras']);
});
