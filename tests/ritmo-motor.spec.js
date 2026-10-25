/* PACE · E2E · EL MOTOR DE LA SEMANA (Ez, 8 y 16 oct. 2026)
 * ======================================================
 * Lo de pago de «A tu ritmo»: cada lunes PACE mira la semana anterior, cambia una o dos cosas
 * de la que empieza y lo cuenta en una carta. Ez aceptó la página del motor
 * (docs/traspaso/archivos/motor-semana/) y el 16 oct. eligió montarlo ya.
 *
 * LO QUE DEFIENDE, con semanas sembradas sobre la función pura (`ritmoMotor`):
 *  · una semana sin nada que cambiar: hay carta, sin cambios, con lo que te ayudó y las barras;
 *  · cada una de las cuatro cosas que aprende, y cada una con su cambio: lo que te ayudó (y que
 *    un «Sí» o un «Un poco» no lo tumba «Otra»), la pausa que saltas (sin reunión alrededor),
 *    lo que cambias con «Otra» (una rutina, o casi todo Mueve) y tus horas (lo pregunta);
 *  · con más de dos cambios posibles se queda con dos, uno de rutinas y uno de la forma, y
 *    entre los dos no más de 10 paradas;
 *  · con dos días no hay carta, pero cuentan para la semana siguiente;
 *  · lo rechazado no vuelve en cuatro semanas y lo aprendido caduca a las cuatro;
 *  · lo aprendido llega a «A tu ritmo» por la memoria de las series, y solo con PACE completo.
 * Contra main cae entera: el motor no existía.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const HOY = '2026-10-12';   /* lunes: la carta repasa del 5 al 11 de octubre */
const S1 = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09'];
const S2 = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02'];
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

/* Un día de jornada como el de la página: siete pausas y el cierre, todas hechas. */
function dia(fecha, cambiar) {
  const p = (hora, tipo, platos) => ({ hora, tipo, estado: 'hecha', reunion: 0,
    platos: platos.map(([modulo, id]) => ({ modulo, id, otras: 0, antes: [] })) });
  const d = {
    fecha, opcion: 'jornada', habitual: 'jornada', inicio: 540, salida: 1020,
    paradas: [
      p(585, 'pausa', [['mueve', 'extra.legs.standing']]),
      p(635, 'pausa', [['estira', 'move.desk.quick']]),
      p(685, 'larga', [['respira', 'breathe.exhale.46'], ['estira', 'move.back.standing']]),
      p(745, 'pausa', [['estira', 'move.wrists']]),
      p(795, 'pausa', [['mueve', 'extra.glutes.stealth']]),
      p(945, 'pausa', [['estira', 'move.shoulder.circles']]),
      p(980, 'pausa', [['mueve', 'extra.grip.squeeze']]),
      p(1015, 'cierre', [['respira', 'breathe.physiological']]),
    ],
  };
  if (cambiar) cambiar(d);
  return d;
}
const semana = (fechas, cambiar) => fechas.map((f, i) => dia(f, cambiar && ((d) => cambiar(d, i))));
/* Lo descartado con «Otra» en la parada de las `hora`. */
const otra = (d, hora, ids) => { const pl = d.paradas.find((x) => x.hora === hora).platos[0]; pl.otras = ids.length; pl.antes = ids; };
const saltar = (d, hora, reunion) => { const x = d.paradas.find((y) => y.hora === hora); x.estado = 'saltada'; x.reunion = reunion || 0; };
const focos = (fechas, desde, hasta) => fechas.map((fecha) => ({ fecha, desde, hasta }));

async function abrir(page, context) {
  await sembrar(context, { ritmo: { libre: true } });
  await page.clock.install({ time: new Date(2026, 9, 12, 8, 0) });
  await irAlArtefacto(page);
}
const motor = (page, e) => page.evaluate((x) => ritmoMotor(x), Object.assign({ hoy: HOY, horario: HORARIO, feedback: [], focos: [] }, e));

test('una semana sin nada que cambiar: hay carta, sin cambios, con lo que te ayudó y las barras', async ({ page, context }) => {
  await abrir(page, context);
  const r = await motor(page, {
    dias: semana(S1),
    feedback: [{ fecha: S1[0], id: 'move.wrists', r: 'yes' }, { fecha: S1[2], id: 'move.wrists', r: 'yes' },
               { fecha: S1[1], id: 'breathe.exhale.46', r: 'yes' }, { fecha: S1[3], id: 'move.desk.quick', r: 'no' }],
    focos: focos(S1, 540, 1010),
  });
  expect(r.semana).toEqual({ lunes: HOY, desde: '2026-10-05', hasta: '2026-10-11' });
  expect(r.carta).toBe(true);
  expect(r.dias).toBe(5);
  expect(r.cambios).toEqual([]);
  expect(r.ayudo, 'lo que más veces te ayudó, primero').toEqual(['move.wrists', 'breathe.exhale.46']);
  expect([r.hechas, r.total], 'el cierre no es una pausa: 7 por día').toEqual([35, 35]);
  expect(r.barras.slice(0, 5).map((b) => b.hechas)).toEqual([7, 7, 7, 7, 7]);
  expect(r.barras.slice(5).map((b) => b.total)).toEqual([0, 0]);
});

test('qué te sienta bien: lo que te ayudó entra en la carta y «Otra» no lo aparta', async ({ page, context }) => {
  await abrir(page, context);
  const dias = semana(S1, (d, i) => { if (i < 4) otra(d, 795, ['extra.calves']); });
  const sin = await motor(page, { dias });
  expect(sin.cambios.map((c) => c.tipo + ':' + c.id), 'cuatro veces cambiada: descansa').toEqual(['descansa:extra.calves']);
  const con = await motor(page, { dias, feedback: [{ fecha: S2[2], id: 'extra.calves', r: 'some' }] });
  expect(con.cambios, 'con un «Un poco» de estas cuatro semanas, «Otra» no la tumba').toEqual([]);
  const viejo = await motor(page, { dias, feedback: [{ fecha: '2026-09-01', id: 'extra.calves', r: 'yes' }] });
  expect(viejo.cambios.length, 'un «Sí» de hace más de cuatro semanas ya no protege').toBe(1);
});

test('qué pausas saltas: la de la misma hora, saltada tres días sin reunión, pasa a ser de 2 minutos', async ({ page, context }) => {
  await abrir(page, context);
  const tres = await motor(page, { dias: semana(S1, (d, i) => { if ([0, 1, 3].includes(i)) saltar(d, 945); }) });
  expect(tres.cambios).toEqual([expect.objectContaining({ tipo: 'corta', clase: 'forma', hora: 945, min: 2, veces: 3, paradas: 5 })]);
  const reunion = await motor(page, { dias: semana(S1, (d, i) => { if ([0, 1, 3].includes(i)) saltar(d, 945, i ? 20 : 0); }) });
  expect(reunion.cambios, 'con una reunión alrededor no cuenta como saltada').toEqual([]);
  const sinTocar = await motor(page, { dias: semana(S1, (d, i) => { if (i < 4) d.paradas.find((x) => x.hora === 945).estado = null; }) });
  expect(sinTocar.cambios, '«sin tocar» puede ser la pausa a la que no llegaste: no cuenta').toEqual([]);
  const a = (d, hora) => { d.paradas[5].hora = hora; saltar(d, hora); };
  const dos = await motor(page, { dias: semana(S2, (d, i) => { if (i < 2) a(d, 950); }).concat(semana(S1, (d, i) => { if (!i) a(d, 940); })) });
  expect(dos.cambios.map((c) => c.tipo), 'dos semanas seguidas y tres entre las dos, a ±15 min').toEqual(['corta']);
  const larga = await motor(page, { dias: semana(S1, (d) => saltar(d, 685)) });
  expect(larga.cambios, 'la larga no se acorta').toEqual([]);
});

test('qué cambias con «Otra»: la rutina cambiada tres veces descansa; casi todo Mueve, menos Mueve', async ({ page, context }) => {
  await abrir(page, context);
  const una = await motor(page, { dias: semana(S1, (d, i) => { if (i < 3) otra(d, 745, ['move.neck.3']); }) });
  expect(una.cambios).toEqual([expect.objectContaining({ tipo: 'descansa', clase: 'rutinas', id: 'move.neck.3', veces: 3 })]);
  const dos = await motor(page, { dias: semana(S1, (d, i) => { if (i < 2) otra(d, 745, ['move.neck.3']); }) });
  expect(dos.cambios, 'dos veces en la semana no son pruebas').toEqual([]);
  /* Mueve sale tres veces al día: diez de quince cambiadas, y ninguna rutina tres veces. La
     cadencia son las de las 13:15 y las 16:20 (la primera, no). */
  const mueve = await motor(page, { dias: semana(S1, (d, i) => { otra(d, 585, ['extra.a' + i]); otra(d, 795, ['extra.b' + i]); }) });
  expect(mueve.cambios).toEqual([expect.objectContaining({ tipo: 'menos', modulo: 'mueve', mas: 'estira', veces: 10, de: 15, paradas: 10 })]);
  const pocas = await motor(page, { dias: semana(S1, (d, i) => { otra(d, 585, ['extra.a' + i]); if (i < 4) otra(d, 795, ['extra.b' + i]); }) });
  expect(pocas.cambios, 'nueve de quince no es casi todo').toEqual([]);
});

test('a qué horas trabajas: lo pregunta, por la semana o por el mismo día dos semanas seguidas', async ({ page, context }) => {
  await abrir(page, context);
  const dias = semana(S2).concat(semana(S1));
  const tarde = await motor(page, { dias, focos: focos(S1.slice(0, 3), 580, 1010).concat(focos(S1.slice(3), 540, 1010)) });
  expect(tarde.cambios).toEqual([expect.objectContaining({ tipo: 'hora', pregunta: true, campo: 'inicio', dia: null, hora: 580, paradas: 0 })]);
  const lunes = await motor(page, { dias, focos: [{ fecha: S2[0], desde: 625, hasta: 1010 }, { fecha: S1[0], desde: 635, hasta: 1010 }].concat(focos(S1.slice(1), 540, 1010)) });
  expect(lunes.cambios).toEqual([expect.objectContaining({ tipo: 'hora', campo: 'inicio', dia: 1, hora: 630 })]);
  const viernes = await motor(page, { dias, focos: focos([S2[4], S1[4]], 540, 920).concat(focos(S1.slice(0, 4), 540, 1010)) });
  expect(viernes.cambios, 'terminas: el último bloque y el cierre').toEqual([expect.objectContaining({ campo: 'salida', dia: 5, hora: 925 })]);
  const ya = await motor(page, { dias, focos: focos(S1.slice(0, 3), 580, 1010), horario: Object.assign({}, HORARIO, { inicio: 575 }) });
  expect(ya.cambios, 'si tu entrada ya es esa, no pregunta').toEqual([]);
});

test('con más de dos cambios posibles se queda con dos, uno de rutinas y uno de la forma, y no más de 10 paradas', async ({ page, context }) => {
  await abrir(page, context);
  const todo = (d, i) => { if (i < 4) otra(d, 795, ['extra.calves']); if (i < 3) saltar(d, 945); };
  const r = await motor(page, { dias: semana(S1, todo), focos: focos(S1.slice(0, 3), 580, 1010) });
  expect(r.cambios.map((c) => c.tipo), 'tus horas van antes que la pausa que saltas').toEqual(['descansa', 'hora']);
  const sinHoras = await motor(page, { dias: semana(S1, todo) });
  expect(sinHoras.cambios.map((c) => c.clase)).toEqual(['rutinas', 'forma']);
  expect(sinHoras.cambios.reduce((n, c) => n + c.paradas, 0)).toBeLessThanOrEqual(10);
  /* Grip, cambiada cinco veces, sale a las 9:45 y a las 16:20 toda la semana: toca 10
     paradas y la pausa corta (otras 5) ya no cabe. */
  const tope = await motor(page, { dias: semana(S1, (d, i) => { todo(d, i); otra(d, 980, ['extra.grip.squeeze']); d.paradas[0].platos[0].id = 'extra.grip.squeeze'; }) });
  expect(tope.cambios.map((c) => c.tipo + ':' + c.paradas), 'Grip toca 10: la pausa corta ya no cabe').toEqual(['descansa:10']);
});

test('con dos días no hay carta, pero cuentan para la semana siguiente', async ({ page, context }) => {
  await abrir(page, context);
  const dos = semana(S1.slice(0, 2), (d) => otra(d, 745, ['move.neck.3']));
  const r = await motor(page, { dias: dos });
  expect([r.carta, r.dias]).toEqual([false, 2]);
  const luego = await page.evaluate((x) => ritmoMotor(x), { hoy: '2026-10-19', horario: HORARIO, feedback: [], focos: [],
    dias: dos.concat(semana(['2026-10-12', '2026-10-13', '2026-10-14'], (d, i) => { if (!i) otra(d, 745, ['move.neck.3']); })) });
  expect(luego.carta).toBe(true);
  expect(luego.cambios.map((c) => c.id + ':' + c.veces + ':' + c.semanas)).toEqual(['move.neck.3:3:2']);
});

test('lo rechazado no vuelve en cuatro semanas; lo aprendido vale cuatro y luego vuelve a probarse', async ({ page, context }) => {
  await abrir(page, context);
  const dias = semana(S1, (d, i) => { if (i < 3) otra(d, 745, ['move.neck.3']); if (i < 3) saltar(d, 945); });
  const r = await page.evaluate(({ dias, HOY, HORARIO }) => {
    const e = { hoy: HOY, horario: HORARIO, feedback: [], focos: [], dias };
    const res = ritmoMotor(e);
    const rechazado = ritmoMotorRechazar({}, res.cambios, HOY);
    const aplicado = ritmoMotorAplicar({}, Object.assign({}, res, { ayudo: ['move.wrists'] }), HOY);
    return {
      cambios: res.cambios.map((c) => c.tipo),
      tras: ritmoMotor(Object.assign({}, e, { aprendido: rechazado })).cambios,
      yaAplicado: ritmoMotor(Object.assign({}, e, { aprendido: aplicado })).cambios,
      hoy: ritmoMotorVigente(aplicado, '2026-11-08'),
      despues: ritmoMotorVigente(aplicado, '2026-11-09'),
      olvidado: ritmoMotorVigente(ritmoMotorOlvidar(aplicado, 'descansa:move.neck.3', HOY), HOY).descansa,
    };
  }, { dias, HOY, HORARIO });
  expect(r.cambios).toEqual(['descansa', 'corta']);
  expect(r.tras, 'rechazado: no se propone otra vez').toEqual([]);
  expect(r.yaAplicado, 'lo que ya descansa no se propone otra vez').toEqual([]);
  expect(r.hoy).toEqual({ descansa: { 'move.neck.3': true }, cortas: [{ hora: 945, min: 2, margen: 15 }], menos: null, ayuda: { 'move.wrists': true } });
  expect(r.despues, 'a las cuatro semanas vuelve todo').toEqual({ descansa: {}, cortas: [], menos: null, ayuda: {} });
  expect(r.olvidado).toEqual({});
});

/* El día que sirven las series para `iso`, con lo aprendido en la memoria (o sin nada). */
function servir(iso, ap) {
  const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020, ahora: 540, ocupado: [] };
  return semanaComponer('jornada', H, ritmoPozos(getState(), iso), {}, 8, semanaDe(iso), null, { aprendido: ap })
    .items.filter((it) => it.tipo === 'pausa' || it.tipo === 'cierre')
    .map((it) => ({ desde: it.desde, larga: !!it.larga, platos: (it.platos || []).map((p) => ({ id: p.id, min: p.min, modulo: p.modulo })) }));
}

test('lo aprendido llega a «A tu ritmo» por la memoria de las series', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((fn) => {
    const servir = new Function('return ' + fn)();
    const dias = ['2026-10-13', '2026-10-14', '2026-10-15'];
    const ids = (d) => d.flatMap((p) => p.platos.map((x) => x.id));
    const hora = (d) => { const p = d.find((x) => x.platos.some((y) => y.id === 'move.wrists')); return p ? p.desde : 1440; };
    const cadencia = (d) => d.filter((p, i) => i > 0 && !p.larga && p.desde !== 945).filter((p) => p.platos.some((x) => x.modulo === 'mueve')).length;
    const base = dias.map((iso) => servir(iso, null));
    const neck = base[0].find((p) => p.platos.some((x) => x.id === 'move.neck.3'));
    /* Una corta que hoy sirva algo de más de 2 minutos: desde las capas (2A) casi todo «Para
       empezar» dura 2, así que la hora se busca y no se escribe. */
    const corta = base[0].find((p, i) => i > 0 && !p.larga && p.platos[0] && p.platos[0].modulo !== 'respira' && p.platos[0].min > 2);
    const en = corta ? corta.desde : 945;
    return {
      neck: !!neck,
      descansa: dias.map((iso) => ids(servir(iso, { descansa: { 'move.neck.3': true } })).includes('move.neck.3')),
      cortaAntes: corta ? corta.platos[0].min : 0,
      cortaDespues: servir('2026-10-13', { cortas: [{ hora: en, min: 2, margen: 15 }] }).find((p) => p.desde === en).platos[0].min,
      cortaLejos: servir('2026-10-13', { cortas: [{ hora: en - 90, min: 2, margen: 15 }] }).find((p) => p.desde === en).platos[0].min,
      mueveAntes: base.map(cadencia),
      mueveDespues: dias.map((iso) => cadencia(servir(iso, { menos: 'mueve' }))),
      primeraDespues: dias.map((iso) => servir(iso, { menos: 'mueve' })[0].platos[0].modulo),
      /* la hora a la que sale cada día (fuera del día, 24:00) */
      ayudaAntes: base.map(hora).reduce((a, b) => a + b, 0),
      ayudaDespues: dias.map((iso) => hora(servir(iso, { ayuda: { 'move.wrists': true } }))).reduce((a, b) => a + b, 0),
    };
  }, servir.toString());
  expect(r.neck, 'el día sin nada aprendido sirve Cuello').toBe(true);
  expect(r.descansa, 'lo que descansa no sale').toEqual([false, false, false]);
  expect(r.cortaAntes, 'GUARD: ninguna corta sirve más de 2 minutos; el aserto no mediría nada').toBeGreaterThan(2);
  expect(r.cortaDespues, 'la pausa que sueles saltar, de 2 minutos').toBeLessThanOrEqual(2);
  expect(r.cortaLejos, 'a otra hora, la de siempre').toBe(r.cortaAntes);
  expect(r.mueveAntes.every((n) => n > 0)).toBe(true);
  expect(r.mueveDespues, 'la cadencia trae Estira').toEqual([0, 0, 0]);
  expect(r.primeraDespues, 'la primera del día sigue siendo Mueve, de pie').toEqual(['mueve', 'mueve', 'mueve']);
  /* lo que te ayudó vuelve antes en el día; el cuerpo entero va primero (el jueves, la única
     pausa sentada para cuello y manos es «Escritorio express», que mueve las dos) */
  expect(r.ayudaDespues, 'lo que te ayudó vuelve antes').toBeLessThan(r.ayudaAntes);
});

test('sin PACE completo no aprende: el día es el de la capa 1 y no hay carta', async ({ page, context }) => {
  await sembrar(context, { ritmo: {
    horario: HORARIO, aprendido: { descansa: { 'move.neck.3': '2026-11-01' } },
    dia: { fecha: '2026-10-13', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pausa: null },
    carta: { lunes: HOY, res: { cambios: [], ayudo: [], barras: [] }, vista: null, hora: null },
  } });
  await page.clock.install({ time: new Date(2026, 9, 13, 8, 0) });
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const ids = () => ritmoPlan(getState()).m.items.flatMap((it) => (it.platos || []).map((p) => p.id));
    const abierto = { neck: ids().includes('move.neck.3'), carta: !!ritmoCartaPendiente(getState()) };
    window.PREMIUM_ABIERTO_HASTA_V1 = false;
    try {
      return { abierto, cerrado: { neck: ids().includes('move.neck.3'), carta: !!ritmoCartaPendiente(getState()), mem: ritmoMemoria(getState(), '2026-10-13', null, null).aprendido } };
    } finally { window.PREMIUM_ABIERTO_HASTA_V1 = true; }
  });
  expect(r.abierto, 'hasta v1, abierto: Cuello descansa y la carta espera').toEqual({ neck: false, carta: true });
  expect(r.cerrado, 'sin PACE completo').toEqual({ neck: true, carta: false, mem: null });
});
