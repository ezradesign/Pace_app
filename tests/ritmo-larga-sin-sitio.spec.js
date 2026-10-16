/* PACE · E2E · SI LA LARGA NO CABE, LA PAUSA ES CORTA (Ez, 16 oct. 2026)
 * ======================================================================
 * «Dos horas» con el aro a 25 servía 25 · pausa · 25 · pausa · 55 y el cierre: la tercera
 * pausa tocaba larga (75 min de foco), detrás de ella solo quedaban 15 min y la cola de
 * siempre («sin colas ridículas») juntaba el final en un bloque de 55 sin ninguna pausa.
 * Lo que eligió Ez: si la larga no cabe, la tercera pausa es corta, 25 · P · 25 · P · 25 ·
 * P · 25, y el día acaba a su hora. Y, con la tabla de casos delante, también en la tarde de
 * la jornada, que tenía el mismo fallo (aro 25: 25 · P · 25 · P · 55; aro 20: un 40).
 *
 * LA REGLA (`largaSinSitio` en ritmo.regla.js): la larga se sirve corta solo cuando la cola
 * juntaría lo que queda en UN bloque (no más de 60) por culpa de ella y una corta sí deja
 * detrás un bloque entero. Lo demás no cambia: una larga con sitio detrás se queda, y con el
 * aro a 45 «Dos horas» sigue en 45 · P · 60 (Ez, 16 oct.: «dejarlo así por ahora»).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
/* martes: sin el acento del miércoles, que adelanta la larga */
const NUEVE = '2026-10-13T09:00:00+02:00';

test('la tabla de casos: la larga que no cabe al final se sirve corta, y lo demás sigue igual', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: HORARIO, libre: true } });
  await page.clock.install({ time: new Date(NUEVE) });
  await irAlArtefacto(page);
  const r = await page.evaluate((H) => {
    const pozos = ritmoPozos(getState(), '2026-10-13');
    const forma = (items) => items.map((it) => it.tipo === 'foco' ? String(it.dur) : it.tipo === 'pausa' ? (it.larga ? 'L' : 'P') : it.tipo === 'comida' ? 'C' : it.tipo === 'cierre' ? 'fin' : '').filter(Boolean).join(' ');
    const componer = (op, aro, ahora, previos) => ritmoComponer(op, Object.assign({}, H, { ahora: ahora || 540, media: { inicio: 540, salida: 780 } }), pozos, {}, 8,
      previos || (aro ? ritmoPrevios([], aro, false, aro) : null));
    const dia = (op, aro, ahora) => { const m = componer(op, aro, ahora); return forma(m.items) + ' → ' + ritmoHora(m.hasta); };
    /* la tarde de la jornada: lo que va detrás de la comida */
    const tarde = (aro) => { const m = componer('jornada', aro); return forma(m.items.slice(m.items.findIndex((it) => it.tipo === 'comida') + 1)); };
    const largas = (op, aro) => componer(op, aro).items.filter((it) => it.larga).length;
    /* EL PLAN NO SE MUEVE AL RECOLOCAR: lo que queda, compuesto otra vez al empezar cada
       bloque (con su duración, como `ritmoBloqueEmpezado`) y al terminarlo (con su pausa por
       servir, como `ritmoBloqueTerminado`), es lo mismo que decía el plan */
    const movidos = [];
    [['2h', 25], ['2h', 20], ['jornada', 25], ['jornada', 20], ['media', 25]].forEach(([op, aro]) => {
      const m0 = componer(op, aro);
      m0.items.forEach((it, k) => {
        if (it.tipo !== 'foco') return;
        if (k > 0) {
          const m = componer(op, aro, it.desde, ritmoPrevios(m0.items.slice(0, k), it.dur, false, aro));
          if (forma(m.items) !== forma(m0.items.slice(k))) movidos.push(op + ' ' + aro + ' al empezar a las ' + ritmoHora(it.desde) + ': ' + forma(m.items));
        }
        if ((m0.items[k + 1] || {}).tipo === 'pausa') {
          const m = componer(op, aro, it.desde + it.dur, ritmoPrevios(m0.items.slice(0, k + 1), null, true, aro));
          if (forma(m.items) !== forma(m0.items.slice(k + 1))) movidos.push(op + ' ' + aro + ' al terminar a las ' + ritmoHora(it.desde + it.dur) + ': ' + forma(m.items));
        }
      });
    });
    return {
      dias: {
        '2h 25': dia('2h', 25), '2h plan': dia('2h', null), '2h 20': dia('2h', 20), '2h 30': dia('2h', 30),
        '2h 45': dia('2h', 45), '1h 25': dia('1h', 25),
        'jornada 14:00 plan': dia('jornada', null, 840), 'media plan': dia('media', null),
      },
      tardes: { 25: tarde(25), 20: tarde(20), plan: tarde(null) },
      largas: { 'jornada plan': largas('jornada', null), 'jornada 25': largas('jornada', 25), 'jornada 20': largas('jornada', 20), '2h 25': largas('2h', 25) },
      movidos,
    };
  }, HORARIO);

  /* el caso de Ez. En main: «25 P 25 P 55 fin → 11:00» */
  expect(r.dias['2h 25']).toBe('25 P 25 P 25 P 25 fin → 11:00');
  /* la tarde de la jornada (15:00 a 17:00), la misma regla. En main: «25 P 25 P 55 fin» y «20 P 20 P 20 P 40 fin» */
  expect(r.tardes[25]).toBe('25 P 25 P 25 P 25 fin');
  expect(r.tardes[20]).toBe('20 P 20 P 20 P 20 P 15 fin');
  /* lo que no cambia: sin tocar el aro, con la larga que cabe, y la cola de siempre con el aro largo */
  expect(r.dias).toEqual({
    '2h 25': '25 P 25 P 25 P 25 fin → 11:00',
    '2h plan': '35 P 35 P 35 fin → 11:00',
    '2h 20': '20 P 20 P 20 P 20 P 15 fin → 11:00',
    /* con una corta detrás solo quedarían 10 min, menos que un bloque */
    '2h 30': '30 P 30 P 45 fin → 11:00',
    /* Ez, 16 oct.: aquí no hay tercera pausa y se deja así por ahora */
    '2h 45': '45 P 60 fin → 10:55',
    '1h 25': '25 P 25 fin → 10:00',
    /* la larga con sitio detrás (30 min) se queda */
    'jornada 14:00 plan': '45 P 45 P 30 L 30 fin → 17:00',
    'media plan': '45 P 45 P 45 L 35 P 35 fin → 13:00',
  });
  expect(r.tardes.plan).toBe('45 P 30 P 30 fin');
  /* las largas de la mañana siguen donde estaban; «Dos horas» no tiene ninguna */
  expect(r.largas).toEqual({ 'jornada plan': 1, 'jornada 25': 3, 'jornada 20': 2, '2h 25': 0 });
  expect(r.movidos, 'el plan cambia al recolocar').toEqual([]);
});

/* El día vivido: «Dos horas» a las 9:00 con el aro a 25, cada bloque a su hora. Al acabar
   cada uno, el aro se pone en lo que dura el siguiente (`ritmoSincronizar`): en main, tras
   el segundo, marcaba 55, y el tercer bloque duraba 55 min sin pausa. */
test('«Dos horas» con el aro a 25: los cuatro bloques duran 25 y el día acaba a las 11:00', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: { horario: HORARIO }, focusMinutes: 25 });
  await page.clock.install({ time: new Date(NUEVE) });
  await irAlArtefacto(page);
  const a = (min) => new Date(Date.parse(NUEVE) + (min - 540) * 60 * 1000);
  await page.evaluate(() => { ritmoElegir('2h'); ritmoBloqueEmpezado(25); });
  const bloques = [], aros = [];
  for (let k = 1; k <= 8; k++) {
    const actual = await page.evaluate(() => { const p = ritmoPlan(getState()); return p.actual && { desde: p.actual.desde, dur: p.actual.dur, hasta: p.m.hasta }; });
    if (!actual) break;
    bloques.push(actual.dur);
    expect(actual.hasta, 'tras empezar el bloque ' + k).toBe(660);
    /* el bloque acaba a su hora: el ciclo sube, la pausa se abre y el aro se pone en el siguiente */
    await page.clock.setFixedTime(a(actual.desde + actual.dur));
    const sig = await page.evaluate(() => {
      setState((s) => Object.assign({}, s, { cycle: (Number(s.cycle) || 0) + 1 }));
      ritmoBloqueTerminado();
      ritmoSincronizar();
      const p = ritmoPlan(getState());
      return p.actual ? { desde: p.actual.desde, aro: getState().focusMinutes } : null;
    });
    if (!sig) break;
    aros.push(sig.aro);
    /* el siguiente empieza a su hora, con lo que marca el aro */
    await page.clock.setFixedTime(a(sig.desde));
    await page.evaluate(() => ritmoBloqueEmpezado(getState().focusMinutes));
  }
  expect(bloques, 'lo que duró cada bloque').toEqual([25, 25, 25, 25]);
  expect(aros, 'lo que marcó el aro al acabar cada bloque').toEqual([25, 25, 25]);
  const fin = await page.evaluate(() => { const p = ritmoPlan(getState()); return { hasta: p.m.hasta, pausas: p.m.items.filter((it) => it.tipo === 'pausa').map((it) => (it.larga ? 'L' : 'P') + ritmoHora(it.desde)) }; });
  expect(fin).toEqual({ hasta: 660, pausas: ['P9:25', 'P9:55', 'P10:25'] });
  expect(errores).toEqual([]);
});
