/* PACE · E2E · CON EL ARO CORTO, LOS BLOQUES SE JUNTAN (Ez, 15 oct. 2026)
 * =====================================================================
 * Ez hace focos de 10 min y cada uno llevaba su pausa detrás: «debería de ser al menos
 * cada 30 minutos, es decir 3 focos de 10». Eligió, mirando la tabla de casos, «nunca
 * más de 30»: no hay pausa mientras el bloque siguiente no te haga pasar de 30 min de
 * foco seguidos. Y cuando un bloque acaba sin pausa detrás, el aro espera a que le des.
 *
 * LA TABLA (aro → pausa cada): 10 → 3 bloques · 15 → 2 · 20, 25, 45, 50 → cada bloque.
 * El Pomodoro de 25 no cambia. La comida y la pausa ponen la cuenta a cero; el final del
 * día tampoco junta más de 30 (lo que no cabe se queda sin servir) y, con el aro corto, la
 * larga que ya no deja sitio al último bloque se sirve corta, como en «Dos horas».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

test('la tabla de casos: con el aro a 10 y a 15 la pausa llega cada 30 min; de 20 en adelante, tras cada bloque', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: HORARIO, libre: true } });
  await page.clock.install({ time: new Date('2026-10-13T09:00:00+02:00') });
  await irAlArtefacto(page);
  const r = await page.evaluate((H) => {
    const pozos = ritmoPozos(getState(), '2026-10-13');
    const dia = (op, aro) => {
      const prev = { bloques: 0, pausas: 0, foco: 0, usados: [], vasos: 0, claves: 0, primerBloque: aro, bloque: aro };
      const m = ritmoComponer(op, Object.assign({}, H, { ahora: 540 }), pozos, {}, 8, prev);
      /* foco seguido antes de cada pausa, comida o cierre */
      const tramos = []; let seguido = 0;
      m.items.forEach((it) => {
        if (it.tipo === 'foco') seguido += it.dur;
        else if (it.tipo === 'pausa' || it.tipo === 'comida' || it.tipo === 'cierre') { if (seguido) tramos.push(seguido); seguido = 0; }
      });
      return { tramos: tramos.join(' '), hasta: ritmoHora(m.hasta), pausas: m.pausas };
    };
    const out = {};
    ['1h', '2h', 'jornada'].forEach((op) => [10, 15, 20, 25, 45, 50].forEach((aro) => { out[op + ' ' + aro] = dia(op, aro); }));
    return out;
  }, HORARIO);

  /* «Una hora», el caso de la pregunta a Ez: tres de 10, pausa, dos de 10 y el cierre */
  expect(r['1h 10']).toEqual({ tramos: '30 20', hasta: '10:00', pausas: 1 });
  expect(r['1h 15']).toEqual({ tramos: '30 20', hasta: '10:00', pausas: 1 });
  /* de 20 en adelante, lo de siempre: el Pomodoro de 25 lleva su pausa tras cada bloque */
  expect(r['1h 25']).toEqual({ tramos: '25 25', hasta: '10:00', pausas: 1 });
  expect(r['2h 10']).toEqual({ tramos: '30 30 30 10', hasta: '11:00', pausas: 3 });
  expect(r['2h 20'].tramos.split(' ').slice(0, 4)).toEqual(['20', '20', '20', '20']);
  /* nunca más de 30 seguidos con el aro corto, tampoco al final del día */
  for (const op of ['1h', '2h', 'jornada']) for (const aro of [10, 15]) {
    const tr = r[op + ' ' + aro].tramos.split(' ').map(Number);
    expect(Math.max(...tr), op + ' aro ' + aro).toBeLessThanOrEqual(30);
  }
  /* con 20 o más, cada tramo es un solo bloque (salvo la cola de siempre, al final) */
  for (const op of ['jornada']) for (const aro of [20, 25, 45, 50]) {
    const tr = r[op + ' ' + aro].tramos.split(' ').map(Number);
    expect(tr.slice(0, 3).every((x) => x === aro), op + ' aro ' + aro).toBe(true);
  }
  /* la jornada con el aro a 10 sigue llegando a la salida */
  expect(r['jornada 10'].hasta).toBe('17:00');
});

test('un bloque de 10 que acaba sin pausa detrás no abre la ventana: el aro espera el siguiente y el aviso dice cuándo es la pausa', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: { horario: HORARIO }, focusMinutes: 10 });
  await page.clock.install({ time: new Date('2026-10-13T09:00:00+02:00') });
  await irAlArtefacto(page);
  await page.evaluate(() => { ritmoElegir('1h'); ritmoBloqueEmpezado(10); });
  /* el primer bloque de 10 se acaba (como en ritmo-pausa.spec.js: el ciclo sube y main.jsx avisa) */
  await page.evaluate(() => {
    setState((s) => Object.assign({}, s, { cycle: (Number(s.cycle) || 0) + 1 }));
  });
  await page.clock.setFixedTime(new Date('2026-10-13T09:10:00+02:00'));
  const r = await page.evaluate(() => {
    ritmoBloqueTerminado();
    const s = getState();
    const p = ritmoPlan(s);
    const aviso = ritmoAviso(s, (k) => k, (k, v) => k + ' ' + JSON.stringify(v), 'es');
    return { sinPausa: ritmoSinPausa(s), pausa: p.pausa, abierta: ritmoPausaAbierta(s), propuesta: ritmoPropuesta(s) && ritmoPropuesta(s).modulo, aviso };
  });
  expect(r.sinPausa).toBe(true);
  expect(r.pausa).toBeNull();
  expect(r.abierta).toBeNull();
  expect(r.aviso.title).toBe('notify.ritmo.seguido {"n":1,"total":5}');
  expect(r.aviso.body).toBe('notify.ritmo.seguido.cuerpo {"hora":"9:30"}');
  expect(errores).toEqual([]);
});
