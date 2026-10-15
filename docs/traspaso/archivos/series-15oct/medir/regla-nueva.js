/* Prototipo PURO de la regla B («series con lógica») sobre el esqueleto real del día.
   No toca la app: compone el día con ritmoMenu (horas, larga, comida, cierre) y vuelve
   a elegir los platos con la regla B, con memoria de lo servido los días anteriores. */
'use strict';
const fs = require('fs');
const { sandbox } = require('./cargar.js');

/* Zona y si te levanta, por rutina (leído de sus pasos y su `position`). */
const META = {
  'move.neck.3': { z: ['cuello'], pie: false },
  'move.desk.quick': { z: ['cuello', 'manos', 'espalda'], pie: false },
  'move.wrists': { z: ['manos'], pie: false },
  'move.shoulder.circles': { z: ['hombros'], pie: false },
  'move.hips.standing': { z: ['caderas'], pie: true },
  'move.hamstrings.standing': { z: ['piernas'], pie: true },
  'extra.calves': { z: ['piernas'], pie: false },
  'extra.grip.squeeze': { z: ['manos'], pie: false },
  'extra.glutes.stealth': { z: ['caderas'], pie: false },
  'extra.posture.set': { z: ['espalda'], pie: false },
  'extra.core.stealth': { z: ['espalda'], pie: false },
  'extra.desk.pushups': { z: ['hombros'], pie: true },
  'nuevo.paseo': { z: ['piernas'], pie: true },
  'nuevo.piernas': { z: ['piernas'], pie: true },
  'nuevo.espalda': { z: ['espalda'], pie: true },
};
const NUEVAS = {
  mueve: [{ id: 'nuevo.paseo', name: 'Paseo corto', min: 2 }, { id: 'nuevo.piernas', name: 'Piernas de pie', min: 2 }],
  estira: [{ id: 'nuevo.espalda', name: 'Espalda de pie', min: 3 }],
};

function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function laborables(desde, n) { const out = []; const d = new Date(desde.getTime()); while (out.length < n) { const w = d.getDay(); if (w >= 1 && w <= 5) out.push(iso(d)); d.setDate(d.getDate() + 1); } return out; }

/* LA REGLA B. Devuelve el plato de una parada.
   ctx = { modulo, momento, previa: {zonas, pie, saltada}, hechasHoy:{zona:ordinal}, usadosHoy:{id}, ultimoDia:{id:diaIdx}, hoy, ordinal, ayerEnEsta:{id} } */
function puntuar(r, ctx) {
  const m = META[r.id] || { z: [], pie: false };
  let p = 0; const porque = [];
  const zonaNueva = m.z.some((z) => !(z in ctx.hechasHoy));
  if (zonaNueva) { p += 3; porque.push('zona'); }
  if (ctx.previa && m.z.some((z) => ctx.previa.zonas.indexOf(z) !== -1)) p -= 3;
  if (ctx.levantar && m.pie) { p += 2; porque.push('pie'); }
  if (ctx.levantar && !m.pie) p -= 2;
  if (ctx.ayerEnEsta[r.id]) p -= 2;
  const hace = ctx.ultimoDia[r.id] == null ? 99 : ctx.hoy - ctx.ultimoDia[r.id];
  if (hace <= 1) p -= 1;
  return { r, p, hace, porque, m };
}
function elegir(pozo, ctx) {
  let libres = pozo.filter((r) => !ctx.usadosHoy[r.id]);
  if (!libres.length) libres = pozo.slice();
  /* lo de ayer en esta misma parada no vuelve si hay otra cosa */
  const sinAyer = libres.filter((r) => !ctx.ayerEnEsta[r.id]);
  if (sinAyer.length) libres = sinAyer;
  /* si toca levantarse y hay algo de pie, solo lo de pie */
  if (ctx.levantar) { const dePie = libres.filter((r) => (META[r.id] || {}).pie); if (dePie.length) libres = dePie; }
  const pts = libres.map((r) => puntuar(r, ctx));
  pts.sort((a, b) => (b.p - a.p) || (b.hace - a.hace) || (pozo.indexOf(a.r) - pozo.indexOf(b.r)));
  return pts[0];
}

function correr(opts) {
  const sb = sandbox({ premium: opts.premium });
  const dias = laborables(new Date(2026, 9, 12), 30);
  const ultimoDia = {}; let ayer = {};
  const out = [];
  dias.forEach((d, di) => {
    sb.todayISO = () => d;
    const pz = sb.ritmoPozos({}, d);
    const P = { estira: pz.estira.slice(), mueve: pz.mueve.slice(), respira: pz.respira.slice(), cierre: pz.cierre.slice() };
    if (opts.mesa) P.mueve.push(sb.__todas['extra.desk.pushups']);
    if (opts.nuevas) { P.mueve = P.mueve.concat(NUEVAS.mueve); P.estira = P.estira.concat(NUEVAS.estira); }
    if (opts.cierreAmplio) P.cierre = P.cierre.concat(P.respira.filter((r) => r.min <= 5));
    const sem = sb.semanaDe(d);
    const m = sb.ritmoMenu({}, opts.op, {}, 540, null);
    const paradas = m.items.filter((it) => it.tipo === 'pausa' || it.tipo === 'cierre');
    const iComida = m.items.findIndex((it) => it.tipo === 'comida');
    const hechasHoy = {}; const usadosHoy = {}; const hoyEn = {};
    let previa = null; let sentadas = 0; let ord = 0;
    const fila = [];
    paradas.forEach((it, k) => {
      ord++;
      const trasComer = iComida >= 0 && m.items.indexOf(it) > iComida && !paradas.slice(0, k).some((q) => m.items.indexOf(q) > iComida);
      const platos = [];
      const ctxBase = () => ({ previa, hechasHoy, usadosHoy, ultimoDia, hoy: di, ayerEnEsta: ayer[ord] || {}, levantar: false });
      if (it.tipo === 'cierre') {
        const c = ctxBase(); const e = elegir(P.cierre, c); platos.push(['respira', e]);
      } else if (it.larga) {
        const c1 = ctxBase(); platos.push(['respira', elegir(P.respira, c1)]);
        const c2 = ctxBase(); c2.levantar = true; platos.push(['estira', elegir(P.estira, c2)]);
      } else {
        let modulo = (k === 0 || trasComer) ? 'mueve' : (it.n % 3 === 2 ? 'mueve' : 'estira');
        const c = ctxBase(); c.levantar = k === 0 || trasComer || sentadas >= 1;
        let e = elegir(P[modulo], c);
        /* si el módulo no tiene nada de pie y toca levantarse, se cambia de módulo */
        if (c.levantar && !e.m.pie) { const otro = modulo === 'mueve' ? 'estira' : 'mueve'; const e2 = elegir(P[otro], c); if (e2.m.pie) { e = e2; modulo = otro; } }
        platos.push([modulo, e]);
      }
      let pie = false; const zonas = [];
      platos.forEach(([mod, e]) => { usadosHoy[e.r.id] = true; ultimoDia[e.r.id] = di; hoyEn[ord] = hoyEn[ord] || {}; hoyEn[ord][e.r.id] = true;
        (e.m.z || []).forEach((z) => { hechasHoy[z] = ord; zonas.push(z); }); if (e.m.pie) pie = true; });
      sentadas = (it.tipo === 'cierre') ? sentadas : (pie ? 0 : sentadas + 1);
      previa = { zonas, pie };
      fila.push({ hora: sb.ritmoHora(it.desde), tipo: it.tipo, larga: !!it.larga, pie, platos: platos.map(([mod, e]) => mod + ':' + e.r.name) });
    });
    ayer = hoyEn;
    out.push({ d, tema: sem.tema.id, acento: sem.acento.id, fila });
  });
  return out;
}

/* Medidas comunes para la regla de hoy y la B */
function medir(dias) {
  let pausas = 0, dePie = 0, maxSentadas = 0, repDia = 0;
  const freq = {}; const primeras = {};
  const porSemana = [];
  dias.forEach((dd, i) => {
    const w = Math.floor(i / 5); porSemana[w] = porSemana[w] || new Set();
    let racha = 0; const vistos = {};
    dd.fila.forEach((p) => {
      p.platos.forEach((x) => { freq[x] = (freq[x] || 0) + 1; porSemana[w].add(x); if (vistos[x]) repDia++; vistos[x] = 1; });
      if (p.tipo !== 'cierre') { pausas++; if (p.pie) { dePie++; racha = 0; } else { racha++; maxSentadas = Math.max(maxSentadas, racha); } }
    });
    const pr = dd.fila[0] && dd.fila[0].platos[0]; if (pr) primeras[pr] = (primeras[pr] || 0) + 1;
  });
  return { pausas, dePie, pctPie: Math.round(100 * dePie / pausas), maxSentadas, repDia, distintasPorSemana: porSemana.map((s) => s.size), primeras, freq };
}

/* La regla de HOY, con la misma vara (pie = alguna rutina de pie en la parada). */
function hoy(op, premium) {
  const sb = sandbox({ premium });
  const dias = laborables(new Date(2026, 9, 12), 30);
  return dias.map((d) => {
    sb.todayISO = () => d;
    const m = sb.ritmoMenu({}, op, {}, 540, null);
    const fila = m.items.filter((it) => it.tipo === 'pausa' || it.tipo === 'cierre').map((it) => ({
      hora: sb.ritmoHora(it.desde), tipo: it.tipo, larga: !!it.larga,
      pie: (it.platos || []).some((p) => (META[p.id] || {}).pie),
      platos: (it.platos || []).map((p) => p.modulo + ':' + p.name) }));
    return { d, fila };
  });
}

const R = {};
for (const op of ['2h', 'jornada']) {
  R[op] = {
    hoy: hoy(op, false),
    b: correr({ op, premium: false, cierreAmplio: true }),
    bMesa: correr({ op, premium: false, cierreAmplio: true, mesa: true }),
    bNuevas: correr({ op, premium: false, cierreAmplio: true, mesa: true, nuevas: true }),
  };
}
const M = {};
Object.keys(R).forEach((op) => { M[op] = {}; Object.keys(R[op]).forEach((k) => { M[op][k] = medir(R[op][k]); }); });
fs.writeFileSync(__dirname + '/regla-nueva.json', JSON.stringify({ R, M }, null, 1));
Object.keys(M).forEach((op) => Object.keys(M[op]).forEach((k) => {
  const x = M[op][k];
  console.log(op.padEnd(8), k.padEnd(8), 'pausas', x.pausas, 'de pie', x.dePie, '(' + x.pctPie + '%)', 'max sentadas seguidas', x.maxSentadas, 'repetidas en el día', x.repDia, 'distintas/semana', x.distintasPorSemana.join(','));
  console.log('          primeras:', JSON.stringify(x.primeras));
}));
console.log('\n2h, semana del 12 oct, regla B con las nuevas:');
R['2h'].bNuevas.slice(0, 10).forEach((dd) => console.log(dd.d, dd.tema, '|', dd.fila.map((p) => p.hora + (p.larga ? '(L)' : '') + (p.pie ? '↑' : '') + ' ' + p.platos.join('+')).join(' | ')));
console.log('\n2h, semana del 12 oct, regla B sin contenido nuevo:');
R['2h'].b.slice(0, 10).forEach((dd) => console.log(dd.d, dd.tema, '|', dd.fila.map((p) => p.hora + (p.larga ? '(L)' : '') + (p.pie ? '↑' : '') + ' ' + p.platos.join('+')).join(' | ')));
console.log('\njornada, 14 oct, hoy vs B nuevas:');
[R.jornada.hoy[2], R.jornada.bNuevas[2]].forEach((dd) => console.log(dd.d, '|', dd.fila.map((p) => p.hora + (p.larga ? '(L)' : '') + (p.pie ? '↑' : '') + ' ' + p.platos.join('+')).join(' | ')));
