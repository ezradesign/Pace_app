/* PACE · E2E · LA SEMANA DE «A TU RITMO» (s195c · v0.128.0)
 * ===========================================================
 * El norte, lectura A: el menú varía con la semana y con el día, todo desde la fecha
 * (semana ISO en ciclo de seis temas × acento del día × la regla de siempre), y
 * NADA lo anuncia (decisión del usuario: «2, nada», «menos es más»).
 *
 * QUE DEFIENDE, en puro (ritmo.semana.js es pura, como la regla) y por la app:
 *  · la semana ISO sin new Date("YYYY-MM-DD") y el ciclo de seis temas;
 *  · el tema LIDERA: en la semana de la cadera, la primera de Estira es de cadera/pierna;
 *  · los acentos: lunes arranca con Mueve, miércoles la larga es la segunda, jueves la
 *    última pausa antes de comer es de Respira, viernes el cierre es el Respira más largo QUE
 *    QUEPA; y el fin de semana no lleva acento (lo que sirve es la regla sobre los pozos del tema);
 *  · CADA PLATO CABE EN SU PARADA los cinco días: la pausa corta y el cierre duran 5' y los
 *    acentos son el primer Respira que entra ahí (la primera versión sirvió 10' en 5, medido);
 *  · los acentos respetan lo hecho: recolocando con pausas hechas, «arrancar» no toca nada;
 *  · varía: dos lunes seguidos y el lunes y el martes de la misma semana no sirven lo mismo;
 *    y es determinista: la misma fecha, el mismo día;
 *  · la app compone por la semana (ritmoMenu → semanaComponer) y NO PINTA NINGUNA PALABRA
 *    nueva: ni «semana», ni el nombre del tema.
 *
 * TRAMPA: los pozos se piden POR DÍA (`ritmoPozos(s, fecha)`), que rotan; calcularlos una
 * vez deja los cinco días iguales (pasó en la primera maqueta de s194).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

async function abrir(page, context, extra, hora) {
  await sembrar(context, extra || { ritmo: { libre: true } });
  if (hora) await page.clock.install({ time: hora });
  await irAlArtefacto(page);
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

test('la semana ISO, sin new Date("YYYY-MM-DD"), y el ciclo de seis temas', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate(() => ({
    lunes: semanaISO('2026-09-14'), primero: semanaISO('2026-01-01'), ultimo: semanaISO('2026-12-31'), enero27: semanaISO('2027-01-04'),
    temas: [38, 39, 40, 41, 42, 43, 44].map((n) => SEMANA_TEMAS[(n - 1) % SEMANA_TEMAS.length].id),
    deFecha: semanaDe('2026-09-16'),
  }));
  expect(r.lunes).toEqual({ n: 38, ano: 2026, diaSemana: 1 });
  expect(r.primero.n, 'el 1 de enero de 2026 es jueves: semana 1').toBe(1);
  expect(r.ultimo.n, '2026 tiene 53 semanas ISO').toBe(53);
  expect(r.enero27.n).toBe(1);
  expect(new Set(r.temas.slice(0, 6)).size, 'seis temas distintos en seis semanas').toBe(6);
  expect(r.temas[6], 'y la séptima repite la primera').toBe(r.temas[0]);
  expect(r.deFecha.tema.id).toBe('caderas');
  expect(r.deFecha.acento.id, 'el miércoles es «la mitad»').toBe('mitad');
});

test('el tema lidera y los cinco acentos hacen lo que dicen; el fin de semana, la regla sobre los pozos del tema', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((H) => {
    const dia = (iso) => { const sem = semanaDe(iso); return { sem, m: semanaComponer('jornada', H, ritmoPozos(getState(), iso), {}, 8, sem, null) }; };
    const pausas = (m) => m.items.filter((it) => it.tipo === 'pausa');
    const L = dia('2026-09-14'), X = dia('2026-09-16'), J = dia('2026-09-17'), V = dia('2026-09-18'), S = dia('2026-09-19');
    /* el tema lidera TODOS los días de la semana (la rotación diaria de los pozos no puede
       ponerlo por casualidad los cinco), y en la semana siguiente lidera el otro tema */
    const primeraTag = (m) => pausas(m).find((p) => p.platos[0] && p.platos[0].modulo === 'estira').platos[0].rutina.tag;
    const primeraEstira = [L, dia('2026-09-15'), X, J, V].map((d) => primeraTag(d.m));
    const primeraEstira39 = ['2026-09-21', '2026-09-22', '2026-09-23'].map((iso) => primeraTag(dia(iso).m));
    const largasX = pausas(X.m).map((p, i) => (p.larga ? i + 1 : 0)).filter(Boolean);
    const comidaJ = J.m.items.findIndex((it) => it.tipo === 'comida');
    let antesDeComer = null; for (let i = comidaJ - 1; i >= 0; i--) if (J.m.items[i].tipo === 'pausa' && !J.m.items[i].larga) { antesDeComer = J.m.items[i].platos[0].modulo; break; }
    const cierreV = V.m.items[V.m.items.length - 1];
    const pozosV = ritmoPozos(getState(), '2026-09-18');
    const cabenV = pozosV.respira.filter((x) => x.min <= cierreV.dur).map((x) => x.min);
    const cierrePozo = Math.max.apply(null, pozosV.cierre.map((x) => x.min));
    /* ningún plato más largo que su parada, los cinco días (el defecto de la primera versión) */
    const noCaben = [L, dia('2026-09-15'), X, J, V].flatMap((d) => d.m.items.filter((it) => it.platos).flatMap((it) => it.platos.filter((p) => p.min > it.dur).map((p) => p.name + ' ' + p.min + "' en " + it.dur + "'")));
    /* sábado: sin acento, el día es exactamente la regla sobre los pozos del tema */
    const plano = ritmoComponer('jornada', H, semanaPozos(ritmoPozos(getState(), '2026-09-19'), S.sem), {}, 8, null);
    const ids = (m) => m.items.flatMap((it) => (it.platos || []).map((p) => p.id));
    return { primeraEstira, primeraEstira39, primeraL: pausas(L.m)[0].platos[0].modulo, largasX, antesDeComer, cierreMin: cierreV.platos[0].min, cierreDur: cierreV.dur, cabeMax: Math.max.apply(null, cabenV), cierrePozo, noCaben,
             sabado: S.sem.acento.id, sabadoIgual: JSON.stringify(ids(S.m)) === JSON.stringify(ids(plano)), diaSemana: S.sem.diaSemana };
  }, H);
  for (const tag of r.primeraEstira) expect(['HIP', 'LEG', 'GRND'], 'semana de la cadera: la primera de Estira es de cadera o pierna, los cinco días').toContain(tag);
  for (const tag of r.primeraEstira39) expect(['WRST', 'SIT'], 'semana de las manos: la primera de Estira es de muñecas o de silla').toContain(tag);
  expect(r.primeraL, 'lunes: la primera pausa activa el cuerpo').toBe('mueve');
  expect(r.largasX[0], 'miércoles: la larga es la segunda pausa').toBe(2);
  expect(r.antesDeComer, 'jueves: antes de comer se respira').toBe('respira');
  expect(r.cabeMax, 'GUARD: hay Respiras que caben en el cierre y son más largos que los del pozo del cierre').toBeGreaterThan(r.cierrePozo);
  expect(r.cierreMin, 'viernes: el cierre es el Respira más largo que cabe en su hueco').toBe(r.cabeMax);
  expect(r.cierreMin, 'y cabe').toBeLessThanOrEqual(r.cierreDur);
  expect(r.noCaben, 'cada plato cabe en su parada, los cinco días').toEqual([]);
  expect(r.diaSemana).toBe(6);
  expect(r.sabado, 'el sábado no lleva acento').toBe('libre');
  expect(r.sabadoIgual, 'el sábado es la regla de siempre sobre los pozos del tema').toBe(true);
});

test('los acentos respetan lo hecho, la semana varía y es determinista', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((H) => {
    const sem = semanaDe('2026-09-14');
    const pozos = ritmoPozos(getState(), '2026-09-14');
    /* recolocando a las 12:00 con TRES pausas hechas: la siguiente es la cuarta, corta y de Estira por
       la regla (con dos hechas sería la larga, y con una la de Mueve: ahí «arrancar» no tendría nada
       que pisar y el aserto sería vacío). «Arrancar» no puede tocarla. */
    const previos = { bloques: 3, pausas: 3, foco: 135, comidaHecha: false, usados: [], vasos: 0, ultimoVaso: null, claves: 3, primerBloque: 45, pausaPendiente: false, bloque: null };
    const recolocado = semanaComponer('jornada', Object.assign({}, H, { ahora: 720 }), pozos, {}, 8, sem, previos);
    const sinAcento = ritmoComponer('jornada', Object.assign({}, H, { ahora: 720 }), semanaPozos(pozos, sem), {}, 8, previos);
    const primeraRecolocada = recolocado.items.find((it) => it.tipo === 'pausa');
    const ids = (m) => m.items.flatMap((it) => (it.platos || []).map((p) => p.id));
    const primeros = (iso) => { const s = semanaDe(iso); return ids(semanaComponer('jornada', H, ritmoPozos(getState(), iso), {}, 8, s, null)); };
    return { recolocadoIgual: JSON.stringify(ids(recolocado)) === JSON.stringify(ids(sinAcento)),
             guardia: { larga: !!primeraRecolocada.larga, modulo: primeraRecolocada.platos[0].modulo },
             l38: primeros('2026-09-14'), l39: primeros('2026-09-21'), m38: primeros('2026-09-15'), l38bis: primeros('2026-09-14') };
  }, H);
  expect(r.guardia, 'GUARD: la primera pausa de la recomposición tiene que ser corta y de Estira, o «arrancar» no tendría nada que pisar').toEqual({ larga: false, modulo: 'estira' });
  expect(r.recolocadoIgual, 'con pausas hechas, «arrancar» no toca la primera pausa de la recomposición').toBe(true);
  expect(r.l38, 'dos lunes seguidos no sirven lo mismo').not.toEqual(r.l39);
  expect(r.l38, 'el lunes y el martes de la misma semana no sirven lo mismo').not.toEqual(r.m38);
  expect(r.l38, 'la misma fecha sirve el mismo día').toEqual(r.l38bis);
});

test('la app compone por la semana y no pinta ni una palabra nueva', async ({ page, context }) => {
  /* miércoles 16: la larga tiene que ser la segunda parada del panel */
  await abrir(page, context, { ritmo: { dia: { fecha: '2026-09-16', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } }, new Date('2026-09-16T09:00:00+02:00'));
  const linea = vis(page, '[data-pace-ritmo-linea]');
  await expect(linea.locator('[data-pace-ritmo-parada]').nth(1)).toHaveClass(/pace-rt-larga/);
  await expect(linea.locator('[data-pace-ritmo-parada]').nth(0)).not.toHaveClass(/pace-rt-larga/);
  const p = await page.evaluate(() => { const p = ritmoPlan(getState()); return { larga2: p.m.items.filter((it) => it.tipo === 'pausa')[1].larga, semana: semanaDe('2026-09-16').n }; });
  expect(p.larga2).toBe(true);
  expect(p.semana).toBe(38);
  const texto = (await vis(page, '[data-pace-ritmo-estado="menu"]').textContent()).toLowerCase();
  for (const palabra of ['esta semana', 'abrir la cadera', 'arrancar', 'la mitad', 'cerrar suave']) expect(texto, 'el panel no anuncia la semana («' + palabra + '»)').not.toContain(palabra);
});
