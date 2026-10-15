/* Mide los pozos de «A tu ritmo» y cada cuánto se repite cada rutina, con el catálogo y la
   regla reales: treinta días laborables desde el 12 de octubre de 2026, las cuatro opciones,
   con lo de pago abierto y cerrado. */
'use strict';
const fs = require('fs');
const { sandbox } = require('./cargar.js');

function fecha(y, m, d) { const x = new Date(y, m - 1, d); return x; }
function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function laborables(desde, n) {
  const out = []; const d = new Date(desde.getTime());
  while (out.length < n) { const w = d.getDay(); if (w >= 1 && w <= 5) out.push(iso(d)); d.setDate(d.getDate() + 1); }
  return out;
}

const RES = {};
for (const premium of [true, false]) {
  const sb = sandbox({ premium });
  const clave = premium ? 'abierto' : 'gratis';
  const pozos = sb.ritmoPozos({}, '2026-10-14');
  RES[clave] = { pozos: {} };
  Object.keys(pozos).forEach((k) => { RES[clave].pozos[k] = pozos[k].map((r) => r.id + ' · ' + r.name + ' · ' + r.min + "'"); });
  // 6 semanas (un ciclo entero de temas) desde el lunes 12 oct.
  const dias = laborables(fecha(2026, 10, 12), 30);
  for (const op of ['1h', '2h', 'media', 'jornada']) {
    const filas = [];
    for (const d of dias) {
      sb.todayISO = () => d;
      const m = sb.ritmoMenu({}, op, {}, 540, null);
      const sem = sb.semanaDe(d);
      const paradas = m.items.filter((it) => it.tipo === 'pausa' || it.tipo === 'cierre').map((it) => ({
        tipo: it.tipo, larga: !!it.larga, hora: sb.ritmoHora(it.desde), dur: it.dur,
        platos: (it.platos || []).map((p) => p.modulo + ':' + p.name),
      }));
      filas.push({ d, tema: sem.tema.id, acento: sem.acento.id, bloques: m.focos.length, paradas });
    }
    // frecuencias por módulo
    const freq = {}; const porDia = {};
    filas.forEach((f, i) => f.paradas.forEach((p) => p.platos.forEach((x) => {
      freq[x] = (freq[x] || 0) + 1; (porDia[x] = porDia[x] || []).push(i);
    })));
    // repetición dentro del mismo día
    let repDia = 0; filas.forEach((f) => { const vistos = {}; f.paradas.forEach((p) => p.platos.forEach((x) => { if (vistos[x]) repDia++; vistos[x] = 1; })); });
    // primer plato de Estira del día
    const primeraEstira = {}; filas.forEach((f) => { for (const p of f.paradas) { const e = p.platos.find((x) => x.startsWith('estira:')); if (e) { primeraEstira[e] = (primeraEstira[e] || 0) + 1; break; } } });
    // racha: días seguidos con el mismo primer plato de pausa corta
    const huecos = {}; Object.keys(porDia).forEach((x) => { const ds = [...new Set(porDia[x])]; const g = []; for (let k = 1; k < ds.length; k++) g.push(ds[k] - ds[k - 1]); huecos[x] = g.length ? +(g.reduce((a, b) => a + b, 0) / g.length).toFixed(1) : null; });
    RES[clave][op] = { muestra: filas.slice(0, 10), freq, huecos, repDia, primeraEstira,
      platosPorDia: +(filas.reduce((a, f) => a + f.paradas.reduce((b, p) => b + p.platos.length, 0), 0) / filas.length).toFixed(1) };
  }
}
fs.writeFileSync(__dirname + '/pozos.json', JSON.stringify(RES, null, 1));
for (const c of ['abierto', 'gratis']) {
  console.log('\n=== ' + c + ' ===');
  Object.keys(RES[c].pozos).forEach((k) => console.log(k, RES[c].pozos[k].length, RES[c].pozos[k].join(' | ')));
  for (const op of ['1h', '2h', 'media', 'jornada']) {
    const r = RES[c][op];
    console.log('\n-- ' + op + ': platos/día ' + r.platosPorDia + ', repetidos dentro del día ' + r.repDia + ' en 30 días');
    console.log('  primera Estira del día:', JSON.stringify(r.primeraEstira));
    console.log('  frecuencias (30 días):', JSON.stringify(Object.entries(r.freq).sort((a, b) => b[1] - a[1])));
  }
}
