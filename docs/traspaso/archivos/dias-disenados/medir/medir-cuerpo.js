/* PACE · el cuerpo entero cada día, medido (20 oct. 2026)
   Uso, desde la raíz del repo:
     node docs/traspaso/archivos/dias-disenados/medir/medir-cuerpo.js [json] [<carpeta de main>]
   Veinte días laborables desde el lunes 19 de octubre, de 9:00 a 17:00 con comida a las 14:00
   (horario de fábrica), con la memoria de lo servido de un día para otro como la guarda la app.
   Compara el día de hoy (el código y el catálogo de main, sacados con
   `git archive origin/main app scripts/verify.sandbox.js | tar -x -C <carpeta>`) con la regla
   nueva, gratis y con PACE completo, y con lo que se añada dentro de casa: Hombros fuertes, que
   la pared cuente como la mesa, y una rutina nueva de piernas y caderas. */
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../../../../..');
const MODS = [path.join(ROOT, 'node_modules'), path.resolve(ROOT, '../../../node_modules')].find((p) => fs.existsSync(path.join(p, '@babel', 'core')));
const babel = require(path.join(MODS, '@babel', 'core'));
const { nuevoSandbox, cargar } = require(path.join(ROOT, 'scripts', 'verify.sandbox.js'));
const { PIERNAS } = require('./rutinas-nuevas.js');
const MAIN = process.argv[3] || null;

/* La media jornada, cuatro horas desde la entrada (ritmoMedia, state-ritmo.jsx). */
const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020, media: { inicio: 540, salida: 780 } };
const PIERNAS_META = { z: ['piernas', 'caderas'], pie: true };

/* `cod`: 'main' o 'rama'. `que`: { hombros, pared, piernas }. */
function montar(cod, premium, que) {
  const raiz = cod === 'main' ? MAIN : ROOT;
  const sb = nuevoSandbox();
  const ctx = { ROOT: raiz, babel: { transformSync: (src, o) => babel.transformSync(src, Object.assign({}, o, {
    presets: [[path.join(MODS, '@babel', 'preset-react'), {}]] })) } };
  [['app/breathe/BreatheLibrary.jsx', { __B: 'BREATHE_ROUTINES' }], ['app/move/move.data.js', { __M: 'MOVE_ROUTINES' }],
    ['app/move/move.data.casa.js'], ['app/extra/extra.data.js', { __E1: 'EXTRA_ROUTINES' }],
    ['app/extra/extra.data.piernas.js', { __E: 'window.EXTRA_ROUTINES' }], ['app/ui/library-rules.js'],
    ['app/ritmo/ritmo.regla.js'], ['app/ritmo/ritmo.semana.js'], ['app/ritmo/ritmo.series.js']].forEach(([f, e]) => {
    const err = cargar(ctx, sb, f, e);
    if (err && !/no existe/.test(err)) console.error('ERR', err);
  });
  sb.MOVE_ROUTINES = sb.MOVE_ROUTINES || sb.__M;
  sb.EXTRA_ROUTINES = sb.EXTRA_ROUTINES || sb.__E;
  sb.BREATHE_ROUTINES = sb.BREATHE_ROUTINES || sb.__B;
  const M = sb.MOVE_ROUTINES;
  if (!que.hombros) Object.values(M).forEach((g) => { g.items = g.items.filter((r) => r.id !== 'extra.shoulders.strong'); });
  if (que.piernas) { M.piernas.items.push(PIERNAS); sb.RITMO_SERIES_META[PIERNAS.id] = PIERNAS_META; }
  /* «Caderas de pie» (sentadilla profunda, sentadilla lateral, zancada) contada también como piernas. */
  if (que.caderas) sb.RITMO_SERIES_META['move.hips.standing'] = { z: ['caderas', 'piernas'], pie: true };
  const todas = {};
  [M, sb.EXTRA_ROUTINES, sb.BREATHE_ROUTINES].forEach((cat) => Object.keys(cat || {}).forEach((g) => ((cat[g] || {}).items || []).forEach((r) => { todas[r.id] = r; })));
  /* La pared: en la rama ya cuenta (ritmoPozos); sin ella, se mide como si pidiera otra cosa. */
  if (!que.pared) Object.values(todas).forEach((r) => { if ((r.equipment || []).includes('wall')) r.equipment = r.equipment.map((e) => (e === 'wall' ? 'paredSola' : e)); });
  sb.canAccessRoutine = (id) => { const r = todas[id]; return !r || r.access !== 'premium' || premium; };
  sb.breakVetadas = () => ({});
  sb.getState = () => ({});
  sb.parseLocalDateKey = (k) => { const p = String(k).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  ['app/state-ritmo.jsx', 'app/state-ritmo.series.jsx'].forEach((f) => { const e = cargar(ctx, sb, f); if (e) console.error('ERR', e); });
  sb.__todas = todas;
  return sb;
}

function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function laborables(desde, n) { const out = []; const d = new Date(desde.getTime()); while (out.length < n) { const w = d.getDay(); if (w >= 1 && w <= 5) out.push(iso(d)); d.setDate(d.getDate() + 1); } return out; }

function correr(cod, premium, varia, que, op, aro, nDias) {
  const sb = montar(cod, premium, que);
  const serv = {};
  return laborables(new Date(2026, 9, 19), nDias || 20).map((d) => {
    sb.todayISO = () => d;
    const s = { ritmo: { horario: H, servidos: JSON.parse(JSON.stringify(serv)) } };
    const prev = { bloques: 0, pausas: 0, foco: 0, usados: [], vasos: 0, claves: 0, primerBloque: aro, bloque: aro };
    const mem = Object.assign(sb.ritmoMemoria(s, d, null, null), { varia });
    const m = sb.semanaComponer(op, Object.assign({}, H, { ahora: H.inicio }), sb.ritmoPozos(s, d), {}, 8, sb.semanaDe(d), prev, mem);
    serv[d] = sb.ritmoSeriesClaves(m.items);
    const fs7 = Object.keys(serv).sort(); while (fs7.length > 7) delete serv[fs7.shift()];
    const fila = [];
    m.items.forEach((it) => {
      if (it.tipo !== 'pausa' && it.tipo !== 'cierre') return;
      const cuerpo = (it.platos || []).filter((p) => p.modulo !== 'respira');
      fila.push({ hora: sb.ritmoHora(it.desde), tipo: it.tipo, larga: !!it.larga,
        pie: cuerpo.some((p) => sb.ritmoSeriesDePie(p.id)), mueve: cuerpo.length > 0,
        zonas: [].concat(...cuerpo.map((p) => sb.ritmoSeriesZonas(p.id))),
        platos: (it.platos || []).map((p) => ({ id: p.id, name: p.name, modulo: p.modulo, z: sb.ritmoSeriesZonas(p.id) })) });
    });
    return { d, dow: sb.semanaISO(d).diaSemana, fila };
  });
}

const ZONAS = ['piernas', 'caderas', 'espalda', 'hombros', 'cuello', 'manos'];
/* Por zona y día, las rutinas que la mueven. */
function porZona(dd) {
  const z = {}; ZONAS.forEach((x) => { z[x] = []; });
  dd.fila.forEach((p) => p.platos.forEach((pl) => { if (pl.modulo === 'respira') return; (pl.z || []).forEach((x) => { if (z[x] && !z[x].includes(pl.name)) z[x].push(pl.name); }); }));
  return z;
}

function medir(dias) {
  const x = { dias: dias.length, entero: 0, faltan: {}, huecos: 0, pausas: 0, pie: 0, maxSentadas: 0, zonaCambia: 0, zonaPares: 0, repAyer: 0, rutinasDia: 0, distintas: [] };
  let ayer = null, ayerZ = null, ayerMov = null; x.dos = 0;
  dias.forEach((dd, i) => {
    const w = Math.floor(i / 5); x.distintas[w] = x.distintas[w] || new Set();
    let racha = 0; const movidas = new Set(); const hoy = new Set();
    dd.fila.forEach((p) => {
      p.platos.forEach((pl) => { if (pl.modulo !== 'respira') { x.distintas[w].add(pl.name); hoy.add(pl.name); } });
      p.zonas.forEach((z) => movidas.add(z));
      if (p.tipo === 'cierre' || !p.mueve) return;
      x.huecos++; x.pausas++;
      if (p.pie) { x.pie++; racha = 0; } else { racha++; x.maxSentadas = Math.max(x.maxSentadas, racha); }
    });
    const falta = ZONAS.filter((z) => !movidas.has(z));
    if (!falta.length) x.entero++;
    if (ayerMov && ZONAS.every((z) => movidas.has(z) || ayerMov.has(z))) x.dos++;
    falta.forEach((z) => { x.faltan[z] = (x.faltan[z] || 0) + 1; });
    const zz = porZona(dd);
    if (ayerZ) ZONAS.forEach((z) => { if (!zz[z].length || !ayerZ[z].length) return; x.zonaPares++; if (!zz[z].some((n) => ayerZ[z].includes(n))) x.zonaCambia++; });
    if (ayer) hoy.forEach((n) => { if (ayer.has(n)) x.repAyer++; });
    x.rutinasDia += hoy.size;
    ayer = hoy; ayerZ = zz; ayerMov = movidas;
  });
  const pct = (a, b) => (b ? Math.round(100 * a / b) : 0);
  return { dias: x.dias, huecos: +(x.huecos / x.dias).toFixed(1), entero: pct(x.entero, x.dias), dosDias: pct(x.dos, x.dias - 1), faltan: x.faltan, pie: pct(x.pie, x.pausas),
    maxSentadas: x.maxSentadas, zonaCambia: pct(x.zonaCambia, x.zonaPares), repAyer: +(x.repAyer / (x.dias - 1)).toFixed(1),
    rutinasDia: +(x.rutinasDia / x.dias).toFixed(1), distintas: x.distintas.map((s) => s.size).join(',') };
}

module.exports = { montar, correr, medir, CONJUNTOS: null };
if (require.main === module) {
const salida = { medidas: [], semanas: {} };
const CASOS = [['jornada', 45], ['jornada', 25], ['jornada', 10], ['media', 45], ['media', 25], ['media', 10], ['2h', 35], ['2h', 25], ['2h', 10], ['1h', 25]];
const CONJUNTOS = {
  nada: {}, hombros: { hombros: true }, pared: { pared: true }, 'hombros+pared': { hombros: true, pared: true },
  piernas: { piernas: true }, todo: { hombros: true, pared: true, piernas: true },
  'hombros+pared+caderas': { hombros: true, pared: true, caderas: true },
};
const VARIANTES = [];
if (MAIN) VARIANTES.push(['hoy', 'main', false, false, 'nada']);
Object.keys(CONJUNTOS).forEach((k) => {
  VARIANTES.push(['gratis', 'rama', false, false, k]);
  VARIANTES.push(['completo', 'rama', true, true, k]);
});
for (const [nombre, cod, premium, varia, conj] of VARIANTES) {
  for (const [op, aro] of CASOS) {
    const r = correr(cod, premium, varia, CONJUNTOS[conj], op, aro);
    const m = medir(r);
    salida.medidas.push(Object.assign({ nombre, conj, op, aro }, m));
    console.log((nombre + '/' + conj).padEnd(24), (op + ' ' + aro).padEnd(11), JSON.stringify(m));
    salida.semanas[[nombre, conj, op, aro].join('|')] = r.slice(0, 10).map((dd) => ({ d: dd.d, dow: dd.dow, fila: dd.fila, zonas: porZona(dd) }));
  }
}
if (process.argv[2] === 'json') fs.writeFileSync(path.join(__dirname, 'cuerpo.json'), JSON.stringify(salida, null, 1));
}
