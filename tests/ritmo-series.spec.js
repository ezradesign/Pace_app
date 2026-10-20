/* PACE · E2E · LAS SERIES DE «A TU RITMO» (Ez, 15 oct. 2026)
 * ==========================================================
 * En «Dos horas», junto a la mesa, casi todas las pausas eran «Escritorio express» y una de
 * cada ocho te levantaba. Ez eligió mirando la app real (docs/traspaso/archivos/series-15oct/):
 * la forma 2, «series con lógica»; la frase B, «lo de hoy»; Piernas de pie, Espalda de pie y
 * la mesa en el catálogo, sin el paseo; y la capa 1 de «PACE que aprende», gratis.
 *
 * El 20 oct. Ez pidió que cada día mueva el cuerpo entero «de manera equilibrada y
 * diferente» con las rutinas que ya hay: el cuerpo entero, gratis; que cambien de un día a
 * otro, de PACE completo; y nada especial después de comer
 * (docs/traspaso/archivos/dias-disenados/).
 *
 * LO QUE DEFIENDE:
 *  · el catálogo: las dos rutinas nuevas, gratis y de pie, y la mesa y la pared en los pozos
 *    (lo de nivel accesible: «Empuje · progresión» no); todo lo que entra lleva zona y «de pie»;
 *  · la secuencia, en treinta laborables con la memoria de un día para otro: las seis zonas
 *    cada día en la jornada y, con «Dos horas» y dos pausas, en dos días seguidos; ninguna zona
 *    con más de dos pausas que otra; la primera pausa del día, Mueve de pie; la Estira de la
 *    larga, de pie; nunca dos sentadas seguidas (la comida corta la cuenta); nada repetido en
 *    el día; ni la misma primera ni el mismo cierre que la última vez; el cierre, un Respira
 *    lento de 5 min o menos; la mitad de las pausas o más, de pie;
 *  · gratis frente a PACE completo: el cuerpo entero en los dos; sin pagar se repite lo del
 *    día anterior, con PACE completo casi nada;
 *  · la capa 1: lo hecho fuera del plan no vuelve y su zona cuenta, pero solo para lo que va
 *    después; saltar una pausa levanta la siguiente con «Llevas N min sentado»;
 *  · en la app: la pausa y la línea dicen la frase, «Otra» da otra cosa, y lo servido se guarda
 *    siete días para no repetirlo mañana en la misma parada;
 *  · las frases caben en una línea a 360 px, en los dos idiomas.
 * Contra main cae entera: ni las series ni las rutinas existían.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

async function abrir(page, context, extra, hora) {
  await sembrar(context, extra || { ritmo: { libre: true } });
  if (hora) await page.clock.install({ time: hora });
  await irAlArtefacto(page);
}

test('Piernas de pie, Espalda de pie y la mesa entran en los pozos, gratis; todo lo que entra lleva zona', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate(() => {
    const ficha = (x) => x && { acceso: x.access || 'free', suelo: !!x.requiresFloor, pos: x.position };
    const pozos = (cerrado) => {
      const antes = window.canAccessRoutine;
      if (cerrado) window.canAccessRoutine = (id) => { const b = window.resolveBodyRoutine && window.resolveBodyRoutine(id); const br = window.getBreatheRoutine && window.getBreatheRoutine(id); return ((b && b.routine) || br || {}).access !== 'premium'; };
      try { return ritmoPozos(getState(), '2026-10-14'); } finally { window.canAccessRoutine = antes; }
    };
    const abierto = pozos(false), gratis = pozos(true);
    const sinMeta = [abierto, gratis].flatMap((p) => p.estira.concat(p.mueve)).filter((x) => !RITMO_SERIES_META[x.id]).map((x) => x.id);
    return {
      piernas: ficha(getMoveRoutine('extra.legs.standing')), espalda: ficha(getExtraRoutine('move.back.standing')),
      mueve: gratis.mueve.map((x) => x.id), estira: gratis.estira.map((x) => x.id), mueveAbierto: abierto.mueve.map((x) => x.id),
      cierre: abierto.cierre.map((x) => x.min), sinMeta,
      dePie: ['extra.legs.standing', 'move.back.standing', 'extra.desk.pushups'].map(ritmoSeriesDePie),
    };
  });
  expect(r.piernas).toEqual({ acceso: 'free', suelo: false, pos: ['standing'] });
  expect(r.espalda).toEqual({ acceso: 'free', suelo: false, pos: ['standing'] });
  expect(r.mueve, 'sin PACE completo').toEqual(expect.arrayContaining(['extra.legs.standing', 'extra.desk.pushups']));
  expect(r.estira).toContain('move.back.standing');
  expect(r.mueveAbierto, 'la mesa entra si es de nivel accesible: la pica no').not.toContain('extra.push.ladder');
  expect(r.sinMeta, 'todo lo que puede servir una pausa dice su zona y si te levanta').toEqual([]);
  expect(r.dePie).toEqual([true, true, true]);
  expect(r.cierre.length, 'el cierre rota entre varios').toBeGreaterThan(1);
  expect(Math.max(...r.cierre), 'Respira de 5 min o menos').toBeLessThanOrEqual(5);
});

test('treinta laborables: el cuerpo entero y equilibrado, de pie al empezar y en la larga, nunca dos sentadas, nada repetido y nada de la última vez', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((H) => {
    const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const dias = []; for (const d = new Date(2026, 9, 12); dias.length < 30; d.setDate(d.getDate() + 1)) if (d.getDay() >= 1 && d.getDay() <= 5) dias.push(iso(d));
    const fallos = []; const out = {}; let sentadaTrasComer = 0;
    const zonasDe = (it) => (it.platos || []).filter((p) => p.modulo !== 'respira').flatMap((p) => ritmoSeriesZonas(p.id));
    for (const op of ['2h', 'jornada']) {
      const serv = {}; let pausas = 0, dePie = 0, primeraAyer = null, cierreAyer = null, zonasAyer = null;
      for (const d of dias) {
        const mem = ritmoMemoria({ ritmo: { servidos: serv } }, d, null, null);
        const m = semanaComponer(op, H, ritmoPozos(getState(), d), {}, 8, semanaDe(d), null, mem);
        serv[d] = ritmoSeriesClaves(m.items);
        const fs = Object.keys(serv).sort(); while (fs.length > 7) delete serv[fs.shift()];
        const paradas = m.items.filter((it) => it.tipo === 'pausa' || it.tipo === 'cierre');
        const pie = (it) => (it.platos || []).some((p) => ritmoSeriesDePie(p.id));
        const ids = paradas.flatMap((it) => it.platos.map((p) => p.id));
        const mal = (q) => fallos.push(op + ' ' + d + ': ' + q);
        if (new Set(ids).size !== ids.length) mal('repite en el día');
        const ps = paradas.filter((it) => it.tipo === 'pausa');
        const p0 = ps[0].platos[0];
        if (p0.modulo !== 'mueve' || !ritmoSeriesDePie(p0.id)) mal('la primera no es Mueve de pie: ' + p0.name);
        if (p0.id === primeraAyer) mal('la misma primera que la última vez: ' + p0.name);
        primeraAyer = p0.id;
        /* después de comer, una pausa como cualquier otra (Ez, 20 oct.: «B · Se quita») */
        const iC = m.items.findIndex((it) => it.tipo === 'comida');
        const tras = iC >= 0 ? m.items.slice(iC).find((it) => it.tipo === 'pausa') : null;
        if (tras && !pie(tras)) sentadaTrasComer++;
        if (paradas.some((it) => it.frase && it.frase.k === 'comida')) mal('la frase de después de comer');
        ps.filter((it) => it.larga).forEach((it) => { if (it.platos.map((p) => p.modulo).join() !== 'respira,estira' || !ritmoSeriesDePie(it.platos[1].id)) mal('la larga no es Respira y Estira de pie'); });
        let seguidas = 0;
        m.items.forEach((it) => {
          if (it.tipo === 'comida') seguidas = 0;
          if (it.tipo !== 'pausa') return;
          pausas++; if (pie(it)) { dePie++; seguidas = 0; } else if (++seguidas > 1) mal('dos sentadas seguidas a las ' + ritmoHora(it.desde));
        });
        /* el cuerpo entero: cada día en la jornada; con dos pausas («Dos horas»), en dos días */
        const veces = {}; RITMO_ZONAS.forEach((z) => { veces[z] = 0; });
        ps.forEach((it) => zonasDe(it).forEach((z) => { veces[z]++; }));
        const sin = RITMO_ZONAS.filter((z) => !veces[z]);
        if (op === 'jornada' && sin.length) mal('sin mover: ' + sin.join(', '));
        if (op === '2h' && zonasAyer && sin.some((z) => zonasAyer.indexOf(z) === -1)) mal('ni ayer ni hoy: ' + sin.join(', '));
        zonasAyer = RITMO_ZONAS.filter((z) => veces[z]);
        const cuentas = RITMO_ZONAS.map((z) => veces[z]);
        if (Math.max(...cuentas) - Math.min(...cuentas) > 2) mal('desequilibrado: ' + JSON.stringify(veces));
        const c = paradas[paradas.length - 1].platos[0];
        if (c.modulo !== 'respira' || c.min > 5) mal('el cierre no es un Respira lento: ' + c.name);
        /* el de la última vez solo si lo demás del pozo del cierre ya salió hoy: no repetir en el día manda */
        const antesDelCierre = ids.slice(0, -1);
        const otroCierre = ritmoPozos(getState(), d).cierre.some((x) => x.id !== cierreAyer && antesDelCierre.indexOf(x.id) === -1);
        if (c.id === cierreAyer && otroCierre) mal('el mismo cierre que la última vez: ' + c.name);
        cierreAyer = c.id;
        paradas.forEach((it) => it.platos.forEach((p) => { if (p.min > it.dur) mal(p.name + ' no cabe en ' + it.dur); }));
      }
      out[op] = Math.round(100 * dePie / pausas);
    }
    return { fallos, pie: out, sentadaTrasComer };
  }, H);
  expect(r.fallos).toEqual([]);
  expect(r.sentadaTrasComer, 'después de comer ya no se obliga a ponerse de pie').toBeGreaterThan(0);
  expect(r.pie['2h'], '«Dos horas»: la mitad de las pausas de pie, o más').toBeGreaterThanOrEqual(50);
  expect(r.pie.jornada, 'la jornada: más de la mitad de pie').toBeGreaterThanOrEqual(55);
});

test('gratis, el cuerpo entero; con PACE completo, además, las rutinas cambian de un día a otro', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((H) => {
    const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const dias = []; for (const d = new Date(2026, 9, 19); dias.length < 10; d.setDate(d.getDate() + 1)) if (d.getDay() >= 1 && d.getDay() <= 5) dias.push(iso(d));
    const correr = (pago) => {
      const abierto = window.PREMIUM_ABIERTO_HASTA_V1, acceso = window.canAccessRoutine;
      if (!pago) {
        window.PREMIUM_ABIERTO_HASTA_V1 = false;
        window.canAccessRoutine = (id) => { const b = window.resolveBodyRoutine && window.resolveBodyRoutine(id); const br = window.getBreatheRoutine && window.getBreatheRoutine(id); return ((b && b.routine) || br || {}).access !== 'premium'; };
      }
      try {
        const serv = {}; let enteros = 0, repiten = 0, varia = null, ayer = null;
        for (const d of dias) {
          const mem = ritmoMemoria({ ritmo: { servidos: serv } }, d, null, null);
          varia = mem.varia;
          const m = semanaComponer('jornada', H, ritmoPozos(getState(), d), {}, 8, semanaDe(d), null, mem);
          serv[d] = ritmoSeriesClaves(m.items);
          const ids = m.items.filter((it) => it.tipo === 'pausa').flatMap((it) => it.platos.filter((p) => p.modulo !== 'respira').map((p) => p.id));
          const zonas = new Set(ids.flatMap((id) => ritmoSeriesZonas(id)));
          if (RITMO_ZONAS.every((z) => zonas.has(z))) enteros++;
          if (ayer) repiten += ids.filter((id) => ayer.indexOf(id) !== -1).length;
          ayer = ids;
        }
        return { varia, enteros, repiten: repiten / (dias.length - 1) };
      } finally { window.PREMIUM_ABIERTO_HASTA_V1 = abierto; window.canAccessRoutine = acceso; }
    };
    return { gratis: correr(false), pago: correr(true) };
  }, H);
  expect(r.gratis.varia, 'GUARD: sin PACE completo no hay variedad').toBe(false);
  expect(r.pago.varia, 'GUARD: hasta v1, abierta').toBe(true);
  expect(r.gratis.enteros, 'gratis: el cuerpo entero los diez días').toBe(10);
  expect(r.pago.enteros, 'PACE completo: también').toBe(10);
  /* medido al montarlo: 4,4 rutinas de 7 repiten del día anterior sin pagar, 0,2 pagando */
  expect(r.pago.repiten, 'PACE completo: casi nada del día anterior').toBeLessThanOrEqual(1);
  expect(r.gratis.repiten - r.pago.repiten, 'sin pagar se repite más').toBeGreaterThanOrEqual(2);
});

test('la capa 1: lo hecho fuera del plan cuenta solo para después, y saltar una pausa levanta la siguiente', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((H) => {
    const d = '2026-10-13';
    const dia = (hechas) => semanaComponer('jornada', H, ritmoPozos(getState(), d), {}, 8, semanaDe(d), null,
      ritmoMemoria({ ritmo: { hechas: { fecha: d, ids: hechas } } }, d, null, null));
    const platos = (m) => m.items.filter((it) => it.platos).map((it) => it.platos.map((p) => p.id).join('+'));
    const base = dia([]);
    const primera = base.items.find((it) => it.tipo === 'pausa');
    /* lo que sirve la primera, hecho por libre a las 9:20: ni vuelve ni cuenta su zona como sin mover */
    const antes = dia([{ id: primera.platos[0].id, t: 560 }]);
    const p1 = antes.items.find((it) => it.tipo === 'pausa');
    /* lo mismo hecho a las 16:00: lo de antes de las 16:00 no cambia */
    const tarde = dia([{ id: primera.platos[0].id, t: 960 }]);
    const hasta16 = (m) => platos({ items: m.items.filter((it) => it.desde < 960) });
    /* SALTAR: la primera pausa (9:45) quedó saltada y el bloque 2 acabó a las 10:35 */
    const P = semanaPozos(ritmoPozos(getState(), d), semanaDe(d));
    const pasado = [{ tipo: 'foco', desde: 540, dur: 45, n: 1 }, { tipo: 'pausa', n: 1, desde: 585, dur: 5, platos: [{ modulo: 'estira', id: 'move.neck.3', name: 'Cuello', min: 3 }] }, { tipo: 'foco', desde: 590, dur: 45, n: 2 }];
    const prev = ritmoPrevios(pasado, null, true, null);
    const m = ritmoServir(ritmoComponer('jornada', Object.assign({}, H, { ahora: 635 }), P, {}, 8, prev), P, {}, prev,
      { pasado, estados: { 1: 'saltada' }, inicio: 540 }, {});
    const tras = m.items.find((it) => it.tipo === 'pausa');
    return { primera: primera.platos[0].id, zona: primera.frase, p1: p1.platos[0].id, p1frase: p1.frase,
             igualAntes: JSON.stringify(hasta16(tarde)) === JSON.stringify(hasta16(base)),
             tras: { desde: tras.desde, pie: ritmoSeriesDePie(tras.platos[0].id), frase: tras.frase } };
  }, H);
  expect(r.zona && r.zona.k, 'GUARD: la primera pausa dice su zona').toBe('zona');
  expect(r.p1, 'lo hecho por libre antes no vuelve').not.toBe(r.primera);
  expect(r.p1frase, 'y su zona ya no está «sin mover»').not.toEqual(r.zona);
  expect(r.igualAntes, 'lo hecho a las 16:00 no cambia lo que se sirvió antes').toBe(true);
  expect(r.tras, 'tras la pausa saltada, de pie y con los minutos de verdad desde las 9:00').toEqual({ desde: 635, pie: true, frase: { k: 'sentado', n: 95 } });
});

test('en la app: la pausa dice la frase, «Otra» da otra cosa y lo servido se guarda para mañana', async ({ page, context }) => {
  const errores = capturarErrores(page);
  /* el martes la primera pausa fue Piernas de pie; el miércoles tiene que ser otra cosa */
  await abrir(page, context, {
    profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
    ritmo: { horario: H, servidos: { '2026-10-13': { 1: ['extra.legs.standing'] } },
      dia: { fecha: '2026-10-14', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } },
  }, new Date('2026-10-14T09:00:00+02:00'));
  const plan = await page.evaluate(() => { const p = ritmoPlan(getState()); const it = ritmoDetras(p.m, p.actual); return { id: it.platos[0].id, name: it.platos[0].name, frase: it.frase }; });
  expect(plan.id, 'no la misma primera que ayer').not.toBe('extra.legs.standing');
  /* Desde el 20 oct. la pared cuenta como la mesa, y Sentadilla en pared (PACE completo, abierto
     hasta v1) entra en el pozo: otra rutina de piernas que ayer no salió. Antes, Espalda de
     oficina; antes aún, Flexiones de escritorio. */
  expect(plan).toEqual({ id: 'extra.wall.sit', name: 'Sentadilla en pared', frase: { k: 'zona', zona: 'piernas' } });
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
  for (let i = 0; i < 60 && !(await page.locator('[data-pace-break-shortcut]').count()); i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
  }
  const plato = page.locator('[data-pace-break-ritmo]');
  await expect(plato.locator('.pace-break-motivo')).toHaveText('Piernas: sin mover hoy');
  await expect(plato).toContainText('Sentadilla en pared');
  await page.keyboard.press('Escape');
  const s = await page.evaluate(() => ({ serv: getState().ritmo.servidos, otra: (ritmoOtra(['p1']), ritmoPlan(getState()).pausa.platos[0].id) }));
  expect(Object.keys(s.serv).sort(), 'lo servido, día a día').toEqual(['2026-10-13', '2026-10-14']);
  expect(s.serv['2026-10-14']['1']).toEqual(['extra.wall.sit']);
  expect(s.otra, '«Otra» da otra cosa').not.toBe('extra.wall.sit');
  expect(errores).toEqual([]);
});

test('lo terminado hoy se apunta con su minuto, y lo servido no pasa de siete días', async ({ page, context }) => {
  const servidos = {};
  for (let d = 1; d <= 9; d++) servidos['2026-10-0' + d] = { 1: ['move.neck.3'] };
  await abrir(page, context, { ritmo: { horario: H, servidos, dia: { fecha: '2026-10-14', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } },
    new Date('2026-10-14T11:07:00+02:00'));
  const r = await page.evaluate(() => {
    ritmoAnotarHecha('move.hips.standing');
    ritmoAnotarHecha('custom.123');
    const st = getState().ritmo;
    return { hechas: st.hechas, fechas: Object.keys(st.servidos).sort() };
  });
  expect(r.hechas).toEqual({ fecha: '2026-10-14', ids: [{ id: 'move.hips.standing', t: 667 }] });
  expect(r.fechas, 'los siete últimos').toEqual(['2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-14']);
});

test.describe('a 360 px', () => {
  test.use({ viewport: { width: 360, height: 718 } });
  test('la ventana y la fila de «Ahora» dicen la frase, y todas caben en una línea en castellano y en inglés', async ({ page, context }) => {
    await abrir(page, context, {
      ritmo: { horario: H, dia: { fecha: '2026-10-14', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } },
    }, new Date('2026-10-14T09:00:00+02:00'));
    await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
    for (let i = 0; i < 60 && !(await page.locator('[data-pace-break-shortcut]').count()); i++) {
      await page.clock.fastForward(60 * 1000);
      await page.waitForTimeout(60);
    }
    await expect(page.locator('[data-pace-break-ritmo] .pace-break-motivo')).toHaveText('Piernas: sin mover hoy');
    /* se miden todas las frases en el motivo de la ventana, que es el hueco más estrecho */
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => {
      const el = document.querySelector('[data-pace-break-ritmo] .pace-break-motivo');
      const alto = parseFloat(getComputedStyle(el).lineHeight);
      const frases = (lang) => {
        const S = window.PACE_STRINGS[lang];
        const zonas = ['cuello', 'hombros', 'espalda', 'caderas', 'piernas', 'manos'].map((z) => S['ritmo.frase.zona'].replace('{zona}', S['ritmo.zona.' + z]));
        return zonas.concat([S['ritmo.frase.sentado'].replace('{n}', '125'), S['ritmo.frase.larga'], S['ritmo.frase.cierre']]);
      };
      const out = [];
      ['es', 'en'].forEach((l) => frases(l).forEach((f) => { el.textContent = f; if (Math.round(el.getBoundingClientRect().height / alto) > 1) out.push(l + ': ' + f); }));
      return { out, alto };
    });
    expect(r.alto, 'GUARD: el motivo tiene alto de línea').toBeGreaterThan(8);
    expect(r.out, 'frases que se parten en dos líneas').toEqual([]);
    /* la línea dice lo mismo: la fila de «Ahora» del móvil, que es la pausa abierta */
    await page.keyboard.press('Escape');
    await expect(page.locator('.pace-rt-fila').filter({ visible: true }).first()).toContainText('Piernas: sin mover hoy');
  });
});
