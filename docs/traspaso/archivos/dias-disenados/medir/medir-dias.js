/* PACE · los días diseñados, medidos (17 oct. 2026)
   Uso, desde la raíz del repo:  node docs/traspaso/archivos/dias-disenados/medir/medir-dias.js [json]
   Treinta días laborables desde el lunes 12 de octubre, de 9:00 a 17:00 con comida a las 14:00
   (horario de fábrica), con la memoria de lo servido de un día para otro como la guarda la app.
   Compara la regla de hoy con las formas del día diseñado, con las rutinas nuevas o sin ellas.
   Las formas entran por `opts` de ritmoServir (ritmo.series.js); ritmoComponer no se toca. */
'use strict';
const path = require('path');
const fs = require('fs');
const { sandbox, ROOT } = require('../../series-15oct/medir/cargar.js');
const { anadir } = require('./rutinas-nuevas.js');
const MODS = [path.join(ROOT, 'node_modules'), path.resolve(ROOT, '../../../node_modules')].find((p) => fs.existsSync(path.join(p, '@babel', 'core')));
const babel = require(path.join(MODS, '@babel', 'core'));
const { cargar } = require(path.join(ROOT, 'scripts', 'verify.sandbox.js'));

const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
/* La intención de cada día (la forma A): la zona que se inclina y, el viernes, más Estira. */
const DIAS = {
  1: { id: 'arrancar', zonas: ['piernas'] },
  2: { id: 'hombros', zonas: ['hombros', 'cuello'] },
  3: { id: 'espalda', zonas: ['espalda'] },
  4: { id: 'aire', zonas: ['manos'] },
  5: { id: 'soltar', zonas: ['caderas'], estira: true },
};
const FORMAS = {
  hoy: () => ({ momentos: false, dia: null, frase: false }),
  momentos: () => ({ momentos: true, dia: null, frase: false }),
  intencion: (d) => ({ momentos: true, dia: DIAS[d] || null, frase: true }),
};
function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function laborables(desde, n) { const out = []; const d = new Date(desde.getTime()); while (out.length < n) { const w = d.getDay(); if (w >= 1 && w <= 5) out.push(iso(d)); d.setDate(d.getDate() + 1); } return out; }

function montar(premium, conjunto, forma) {
  const sb = sandbox({ premium });
  const ctx = { ROOT, babel: { transformSync: (src, o) => babel.transformSync(src, Object.assign({}, o, { presets: [[path.join(MODS, '@babel', 'preset-react'), {}]] })) } };
  sb.parseLocalDateKey = (k) => { const p = String(k).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  ['app/ritmo/ritmo.series.js', 'app/state-ritmo.series.jsx'].forEach((f) => { const e = cargar(ctx, sb, f); if (e) console.error('ERR', f, e); });
  anadir(sb, conjunto);
  const servir = sb.ritmoServir;
  sb.ritmoServir = (m, P, c, pr, mem, opts) => servir(m, P, c, pr, mem, Object.assign({}, opts, FORMAS[forma](sb.semanaISO(sb.todayISO()).diaSemana)));
  return sb;
}

function correr(op, premium, conjunto, forma, aro) {
  const sb = montar(premium, conjunto, forma);
  const serv = {};
  return laborables(new Date(2026, 9, 12), 30).map((d) => {
    sb.todayISO = () => d;
    const s = { ritmo: { horario: H, servidos: JSON.parse(JSON.stringify(serv)) } };
    const prev = { bloques: 0, pausas: 0, foco: 0, usados: [], vasos: 0, claves: 0, primerBloque: aro, bloque: aro };
    const m = sb.semanaComponer(op, Object.assign({}, H, { ahora: 540 }), sb.ritmoPozos(s, d), {}, 8, sb.semanaDe(d), prev, sb.ritmoMemoria(s, d, null, null));
    serv[d] = sb.ritmoSeriesClaves(m.items);
    const fs7 = Object.keys(serv).sort(); while (fs7.length > 7) delete serv[fs7.shift()];
    const dia = DIAS[sb.semanaISO(d).diaSemana];
    let trasComida = false;
    const fila = [];
    m.items.forEach((it) => {
      if (it.tipo === 'comida') { trasComida = true; return; }
      if (it.tipo !== 'pausa' && it.tipo !== 'cierre') return;
      const zonas = [].concat(...(it.platos || []).map((p) => sb.ritmoSeriesZonas(p.id)));
      fila.push({ hora: sb.ritmoHora(it.desde), tipo: it.tipo, larga: !!it.larga, tarde: trasComida,
        pie: (it.platos || []).some((p) => sb.ritmoSeriesDePie(p.id)),
        delDia: !!(dia && zonas.some((z) => dia.zonas.includes(z))),
        platos: (it.platos || []).map((p) => p.name), ids: (it.platos || []).map((p) => p.id),
        frase: it.frase ? it.frase.k + (it.frase.zona ? ':' + it.frase.zona : '') + (it.frase.dia ? ':' + it.frase.dia : '') + (it.frase.n ? ':' + it.frase.n : '') : '-' });
    });
    return { d, dow: sb.semanaISO(d).diaSemana, fila };
  });
}

function medir(dias) {
  const x = { pausas: 0, dePie: 0, tarde: 0, tardePie: 0, maxSentadas: 0, repDia: 0, delDia: 0, paseoTrasComer: 0, comidas: 0, distintas: [] };
  dias.forEach((dd, i) => {
    const w = Math.floor(i / 5); x.distintas[w] = x.distintas[w] || new Set();
    let racha = 0, primeraTarde = true; const vistos = {};
    dd.fila.forEach((p) => {
      p.platos.forEach((n) => { x.distintas[w].add(n); if (vistos[n]) x.repDia++; vistos[n] = 1; });
      if (p.tipo === 'cierre') return;
      x.pausas++; if (p.delDia) x.delDia++;
      if (p.pie) { x.dePie++; racha = 0; } else { racha++; x.maxSentadas = Math.max(x.maxSentadas, racha); }
      if (p.tarde) { x.tarde++; if (p.pie) x.tardePie++; if (primeraTarde) { x.comidas++; if (p.ids.includes('extra.walk.short')) x.paseoTrasComer++; primeraTarde = false; } }
    });
  });
  const pct = (a, b) => (b ? Math.round(100 * a / b) : 0);
  return { pausas: x.pausas, pie: pct(x.dePie, x.pausas), tardePie: pct(x.tardePie, x.tarde), maxSentadas: x.maxSentadas, repDia: x.repDia,
    delDia: pct(x.delDia, x.pausas), paseo: x.comidas ? pct(x.paseoTrasComer, x.comidas) : null, distintas: x.distintas.map((s) => s.size).join(',') };
}

const salida = { medidas: [], ejemplos: {} };
const OPCIONES = [['hoy', null], ['momentos', 'dos'], ['momentos', 'pared'], ['intencion', 'dos'], ['intencion', 'pared'], ['intencion', 'tres']];
for (const [forma, conjunto] of OPCIONES) {
  for (const [op, aro] of [['jornada', 45], ['jornada', 25], ['jornada', 10], ['2h', 45], ['2h', 25], ['2h', 10]]) {
    for (const premium of [false]) {
      const r = correr(op, premium, conjunto, forma, aro);
      const m = medir(r);
      salida.medidas.push(Object.assign({ forma, conjunto, op, aro, premium }, m));
      console.log((forma + '/' + (conjunto || '-')).padEnd(18), (op + ' aro ' + aro).padEnd(14), JSON.stringify(m));
      salida.ejemplos[[forma, conjunto, op, aro].join('|')] = r.slice(0, 5);
    }
  }
}
if (process.argv[2] === 'json') fs.writeFileSync(path.join(__dirname, 'medidas.json'), JSON.stringify(salida, null, 1));
if (process.argv[2] === 'ver') {
  const k = process.argv.slice(3).join('|');
  (salida.ejemplos[k] || []).forEach((dd) => console.log(dd.d, dd.fila.map((p) => p.hora + (p.larga ? '(L)' : '') + (p.pie ? '↑' : '') + ' ' + p.platos.join('+') + ' [' + p.frase + ']').join(' | ')));
}
