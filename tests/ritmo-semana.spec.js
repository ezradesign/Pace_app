/* PACE · E2E · LA SEMANA DE «A TU RITMO» (s195c · v0.128.0)
 * ===========================================================
 * El norte, lectura A: el menú varía con la semana y con el día, todo desde la fecha
 * (semana ISO en ciclo de seis temas × acento del día × la regla de siempre), y
 * NADA lo anuncia (decisión del usuario: «2, nada», «menos es más»).
 *
 * QUE DEFIENDE, en puro (ritmo.semana.js es pura, como la regla) y por la app:
 *  · la semana ISO sin new Date("YYYY-MM-DD") y el ciclo de seis temas;
 *  · desde las series (Ez, 15 oct. 2026) el tema solo desempata; arrancar con Mueve y el
 *    cierre lento son de todos los días, el miércoles la primera larga es la segunda pausa (y
 *    el día no tiene más largas que otro), el jueves la última pausa antes de comer es de
 *    Respira, y el fin de semana no lleva acento (las series sobre los pozos del tema);
 *  · CADA PLATO CABE EN SU PARADA los cinco días: la pausa corta y el cierre duran 5' y los
 *    acentos son el primer Respira que entra ahí (la primera versión sirvió 10' en 5, medido);
 *  · las series respetan lo hecho: recolocando con pausas hechas, no hay «primera del día»;
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

/* DESDE LAS SERIES (Ez, 15 oct. 2026): el tema solo desempata (es el orden de los pozos), el
   arranque con Mueve del lunes y el cierre largo del viernes son de todos los días, y el
   miércoles y el jueves siguen con lo suyo. Antes esta prueba pedía que la primera Estira de
   la semana de la cadera fuera de cadera: con las series la elige la zona sin mover hoy. */
test('los acentos que quedan hacen lo que dicen y los de lunes y viernes son de todos los días; el fin de semana, las series sin acento', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((H) => {
    const dia = (iso) => { const sem = semanaDe(iso); return { sem, m: semanaComponer('jornada', H, ritmoPozos(getState(), iso), {}, 8, sem, null) }; };
    const pausas = (m) => m.items.filter((it) => it.tipo === 'pausa');
    const semana = ['2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18'].map(dia);
    const X = semana[2], J = semana[3], S = dia('2026-09-19');
    /* todos los días la primera pausa es de Mueve y de pie */
    const primeras = semana.map((d) => { const p = pausas(d.m)[0].platos[0]; return p.modulo + (ritmoSeriesDePie(p.id) ? ' de pie' : ''); });
    const largasX = pausas(X.m).map((p, i) => (p.larga ? i + 1 : 0)).filter(Boolean);
    const comidaJ = J.m.items.findIndex((it) => it.tipo === 'comida');
    let antesDeComer = null; for (let i = comidaJ - 1; i >= 0; i--) if (J.m.items[i].tipo === 'pausa' && !J.m.items[i].larga) { antesDeComer = J.m.items[i].platos[0].modulo; break; }
    /* el cierre, todos los días, un Respira lento del pozo del cierre (5 min o menos) */
    const cierres = semana.map((d) => { const c = d.m.items[d.m.items.length - 1]; return { min: c.platos[0].min, dur: c.dur }; });
    const pozoCierre = ritmoPozos(getState(), '2026-09-14').cierre.map((x) => x.min);
    /* ningún plato más largo que su parada, los cinco días (el defecto de la primera versión) */
    const noCaben = semana.flatMap((d) => d.m.items.filter((it) => it.platos).flatMap((it) => it.platos.filter((p) => p.min > it.dur).map((p) => p.name + ' ' + p.min + "' en " + it.dur + "'")));
    /* sábado: sin acento, el día es la regla sobre los pozos del tema con las series y nada más */
    const P = semanaPozos(ritmoPozos(getState(), '2026-09-19'), S.sem);
    const plano = ritmoServir(ritmoComponer('jornada', H, P, {}, 8, null), P, {}, null, null, { aire: false });
    const ids = (m) => m.items.flatMap((it) => (it.platos || []).map((p) => p.id));
    return { primeras, largasX, antesDeComer, cierres, pozoCierre, noCaben,
             sabado: S.sem.acento.id, sabadoIgual: JSON.stringify(ids(S.m)) === JSON.stringify(ids(plano)), diaSemana: S.sem.diaSemana };
  }, H);
  expect(r.primeras, 'la primera pausa activa el cuerpo, de pie, los cinco días').toEqual(Array(5).fill('mueve de pie'));
  expect(r.largasX[0], 'miércoles: la larga es la segunda pausa').toBe(2);
  expect(r.antesDeComer, 'jueves: antes de comer se respira').toBe('respira');
  expect(r.pozoCierre.length, 'GUARD: el cierre tiene entre qué rotar').toBeGreaterThan(1);
  expect(Math.max(...r.pozoCierre), 'el pozo del cierre: Respira de 5 min o menos').toBeLessThanOrEqual(5);
  for (const c of r.cierres) expect(c.min, 'el cierre cabe en su hueco').toBeLessThanOrEqual(c.dur);
  expect(r.noCaben, 'cada plato cabe en su parada, los cinco días').toEqual([]);
  expect(r.diaSemana).toBe(6);
  expect(r.sabado, 'el sábado no lleva acento').toBe('libre');
  expect(r.sabadoIgual, 'el sábado son las series sobre los pozos del tema, sin acento').toBe(true);
});

/* El miércoles salía con tres largas (2.ª, 5.ª y la 2.ª de la tarde) porque se corría toda la
   cuenta de la larga. Ez (15 oct.): una sola, como cualquier día, pero antes. Contra v0.167.0 cae. */
test('el miércoles adelanta la primera larga y no añade más: las mismas que el martes', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((h) => {
    const largas = (op, iso, extra) => {
      const m = semanaComponer(op, Object.assign({}, h, { ahora: h.inicio }, extra || {}), ritmoPozos(getState(), iso), {}, 8, semanaDe(iso));
      return m.items.filter((it) => it.tipo === 'pausa' && it.larga).map((it) => ritmoHora(it.desde));
    };
    return {
      martes: largas('jornada', '2026-10-13'), miercoles: largas('jornada', '2026-10-14'),
      martesSin: largas('jornada', '2026-10-13', { sinComida: true, salida: 1080 }).length,
      miercolesSin: largas('jornada', '2026-10-14', { sinComida: true, salida: 1080 }).length,
      dosHoras: largas('2h', '2026-10-14'),
    };
  }, H);
  expect(r.martes).toEqual(['11:25']);
  expect(r.miercoles, 'el miércoles, una larga y antes').toEqual(['10:35']);
  expect(r.miercolesSin, 'sin comida, tantas largas como el martes').toBe(r.martesSin);
  expect(r.dosHoras, '«Dos horas» no tiene larga ningún día').toEqual([]);
});

test('las series respetan lo hecho, la semana varía y es determinista', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((H) => {
    const sem = semanaDe('2026-09-14');
    const pozos = ritmoPozos(getState(), '2026-09-14');
    /* recolocando a las 12:00 con TRES pausas hechas: la siguiente es la cuarta, corta y de
       Estira por la cadencia. No es «la primera del día», así que no tiene por qué ser de Mueve
       ni de pie (con una sola hecha sería la de Mueve, y el aserto sería vacío). */
    const previos = { bloques: 3, pausas: 3, foco: 135, comidaHecha: false, usados: [], vasos: 0, ultimoVaso: null, claves: 3, primerBloque: 45, pausaPendiente: false, bloque: null };
    const recolocado = semanaComponer('jornada', Object.assign({}, H, { ahora: 720 }), pozos, {}, 8, sem, previos);
    const primeraRecolocada = recolocado.items.find((it) => it.tipo === 'pausa');
    const ids = (m) => m.items.flatMap((it) => (it.platos || []).map((p) => p.id));
    /* `servidos`: lo que la app guarda de cada día (state-ritmo.series.jsx); el martes lo lee */
    const componer = (iso, servidos) => { const s = semanaDe(iso); return semanaComponer('jornada', H, ritmoPozos(getState(), iso), {}, 8, s, null, ritmoMemoria({ ritmo: { servidos: servidos || {} } }, iso, null, null)); };
    const lunes = componer('2026-09-14');
    const primeros = (iso, servidos) => ids(componer(iso, servidos));
    return { recolocada: { larga: !!primeraRecolocada.larga, n: primeraRecolocada.n, modulo: primeraRecolocada.platos[0].modulo },
             l38: ids(lunes), l39: primeros('2026-09-21'), m38: primeros('2026-09-15', { '2026-09-14': ritmoSeriesClaves(lunes.items) }), l38bis: primeros('2026-09-14') };
  }, H);
  expect(r.recolocada, 'con pausas hechas, la primera de la recomposición sigue la cadencia: corta y de Estira').toEqual({ larga: false, n: 4, modulo: 'estira' });
  expect(r.l38, 'dos lunes seguidos no sirven lo mismo').not.toEqual(r.l39);
  expect(r.l38, 'el martes, con lo que sirvió el lunes, no sirve lo mismo').not.toEqual(r.m38);
  expect(r.m38[0], 'ni la misma primera pausa').not.toBe(r.l38[0]);
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

/* EL MOTIVO DE CADA PARADA TIENE TEXTO (v0.146.0). El acento «aire» (y la regla, cuando el
   primer plato de una pausa es de Respira) pone `motivo: 'respira'`, y esa clave no existía:
   la hoja de «Ver todo» pintaba «ritmo.motivo.respira» y la pausa habría dicho
   «break.prop.ritmo.respira». Ez eligió «Bajar revoluciones» · «Slow down». Se componen seis
   semanas con las cuatro opciones y se mira que todo motivo que salga tenga sus dos textos en
   los dos idiomas (la pausa larga lleva el suyo en `ritmo.larga.lista`). Contra v0.145.0 falla. */
test('todo motivo que compone la semana tiene su texto en la línea y en la pausa, en los dos idiomas', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((H) => {
    const motivos = new Set();
    for (let d = 0; d < 42; d++) {
      const f = new Date(Date.UTC(2026, 8, 14 + d));
      const iso = f.getUTCFullYear() + '-' + String(f.getUTCMonth() + 1).padStart(2, '0') + '-' + String(f.getUTCDate()).padStart(2, '0');
      for (const op of ['1h', '2h', 'media', 'jornada']) {
        const m = semanaComponer(op, H, ritmoPozos(getState(), iso), {}, 8, semanaDe(iso), null);
        (m ? m.items : []).forEach((it) => { if (it.motivo) motivos.add(it.motivo); });
      }
    }
    const faltan = [];
    for (const lang of ['es', 'en']) {
      motivos.forEach((mo) => {
        if (mo !== 'larga' && PACE_STRINGS[lang]['ritmo.motivo.' + mo] === undefined) faltan.push(lang + ': ritmo.motivo.' + mo);
        if (PACE_STRINGS[lang]['break.prop.ritmo.' + mo] === undefined) faltan.push(lang + ': break.prop.ritmo.' + mo);
      });
    }
    return { motivos: Array.from(motivos).sort(), faltan };
  }, H);
  expect(r.motivos, 'GUARD: en seis semanas tiene que salir alguna pausa con motivo «respira»').toContain('respira');
  expect(r.faltan).toEqual([]);
});
