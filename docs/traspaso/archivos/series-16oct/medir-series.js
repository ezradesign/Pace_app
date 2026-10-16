/* PACE · las series montadas, medidas (16 oct. 2026)
   Uso, desde la raíz del repo:
     node docs/traspaso/archivos/series-16oct/medir-series.js
   Lo mismo que medía la página de las series (series-15oct/medir/regla-nueva.js), pero con
   la regla MONTADA en la app: treinta días laborables desde el 12 de octubre, de 9:00 a
   17:00 con comida a las 14:00, con la memoria de lo servido de un día para otro (como la
   guarda la app en `ritmo.servidos`). Con lo de pago cerrado (desde v1 sin PACE completo) y
   abierto (hasta v1), y la jornada también con el aro a 10 y a 15. */
'use strict';
const path = require('path');
const { sandbox } = require('../series-15oct/medir/cargar.js');
const ROOT = path.resolve(__dirname, '../../../..');
const fs = require('fs');
const MODS = [path.join(ROOT, 'node_modules'), path.resolve(ROOT, '../../../node_modules')].find((p) => fs.existsSync(path.join(p, '@babel', 'core')));
const babel = require(path.join(MODS, '@babel', 'core'));
const { cargar } = require(path.join(ROOT, 'scripts', 'verify.sandbox.js'));

function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function laborables(desde, n) { const out = []; const d = new Date(desde.getTime()); while (out.length < n) { const w = d.getDay(); if (w >= 1 && w <= 5) out.push(iso(d)); d.setDate(d.getDate() + 1); } return out; }
const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

function conSeries(premium) {
  const sb = sandbox({ premium });
  const ctx = { ROOT, babel: { transformSync: (src, o) => babel.transformSync(src, Object.assign({}, o, { presets: [[path.join(MODS, '@babel', 'preset-react'), {}]] })) } };
  sb.parseLocalDateKey = (k) => { const p = String(k).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  ['app/ritmo/ritmo.series.js', 'app/state-ritmo.series.jsx'].forEach((f) => { const e = cargar(ctx, sb, f); if (e) console.error('ERR', f, e); });
  return sb;
}

function correr(op, premium, aro) {
  const sb = conSeries(premium);
  const serv = {};
  const dias = laborables(new Date(2026, 9, 12), 30);
  return dias.map((d) => {
    sb.todayISO = () => d;
    const s = { ritmo: { horario: H, servidos: JSON.parse(JSON.stringify(serv)) } };
    let m;
    if (aro) {
      const prev = { bloques: 0, pausas: 0, foco: 0, usados: [], vasos: 0, claves: 0, primerBloque: aro, bloque: aro };
      m = sb.semanaComponer(op, Object.assign({}, H, { ahora: 540 }), sb.ritmoPozos(s, d), {}, 8, sb.semanaDe(d), prev, sb.ritmoMemoria(s, d, null, null));
    } else m = sb.ritmoMenu(s, op, {}, 540, null);
    serv[d] = sb.ritmoSeriesClaves(m.items);
    const fs7 = Object.keys(serv).sort(); while (fs7.length > 7) delete serv[fs7.shift()];
    const fila = m.items.filter((it) => it.tipo === 'pausa' || it.tipo === 'cierre').map((it) => ({
      hora: sb.ritmoHora(it.desde), tipo: it.tipo, larga: !!it.larga,
      pie: (it.platos || []).some((p) => sb.ritmoSeriesDePie(p.id)),
      platos: (it.platos || []).map((p) => p.name), frase: it.frase ? it.frase.k + (it.frase.zona ? ':' + it.frase.zona : '') + (it.frase.n ? ':' + it.frase.n : '') : '-' }));
    return { d, fila };
  });
}

function medir(dias) {
  let pausas = 0, dePie = 0, maxSentadas = 0, repDia = 0, mismaPrimera = 0;
  const porSemana = [], primeras = {};
  let prevPrimera = null;
  dias.forEach((dd, i) => {
    const w = Math.floor(i / 5); porSemana[w] = porSemana[w] || new Set();
    let racha = 0; const vistos = {};
    dd.fila.forEach((p) => {
      p.platos.forEach((x) => { porSemana[w].add(x); if (vistos[x]) repDia++; vistos[x] = 1; });
      if (p.tipo !== 'cierre') { pausas++; if (p.pie) { dePie++; racha = 0; } else { racha++; maxSentadas = Math.max(maxSentadas, racha); } }
    });
    const pr = dd.fila[0] && dd.fila[0].platos[0];
    if (pr) { primeras[pr] = (primeras[pr] || 0) + 1; if (pr === prevPrimera) mismaPrimera++; prevPrimera = pr; }
  });
  return { pausas, dePie, pct: Math.round(100 * dePie / pausas), maxSentadas, repDia, mismaPrimera, distintas: porSemana.map((s) => s.size).join(','), primeras };
}

const casos = [['2h', false], ['jornada', false], ['2h', true], ['jornada', true], ['jornada', false, 10], ['jornada', false, 15], ['1h', false, 10]];
for (const [op, premium, aro] of casos) {
  const r = correr(op, premium, aro);
  const x = medir(r);
  console.log((op + (aro ? ' aro ' + aro : '')).padEnd(16), premium ? 'abierto' : 'gratis ', 'pausas', x.pausas, 'de pie', x.dePie, '(' + x.pct + '%)', 'max sentadas', x.maxSentadas,
    'repetidas en el día', x.repDia, 'misma 1.ª que ayer', x.mismaPrimera, 'distintas/semana', x.distintas);
  console.log('   primeras:', JSON.stringify(x.primeras));
  if (!aro && !premium) r.slice(0, 5).forEach((dd) => console.log('   ', dd.d, dd.fila.map((p) => p.hora + (p.larga ? '(L)' : '') + (p.pie ? '↑' : '') + ' ' + p.platos.join('+') + ' [' + p.frase + ']').join(' | ')));
}
