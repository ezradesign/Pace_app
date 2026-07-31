/* matriz.js — emite la matriz §19.2 en markdown cruzando inventario + glifos. */
const inv = require('./inventario.json');
const gl = require('./glifos.json');
const G = new Map(gl.map(g => [g.nombre, g]));
const alias = inv.alias || {};

const EN = /\b(ankle|atg|split|squat|band|pull|apart|calf|raises?|chest|opener|chin|tucks|cossack|couch|stretch|crawling|dead|hang|deep|breaths|hold|elephant|walk|external|rotation|finger|extension|ground|sitting|transitions|hollow|pigeon|scapular|squeeze|wall|slides|seated|twist|shrug|round|sissy|fist|superman|thoracic|tibialis|world|greatest|wrist|circles|plank|side)\b/i;

const info = new Map();
for (const r of inv.routines) {
  for (const s of r.steps) {
    if (s.mode === 'rest') continue;
    const e = info.get(s.name) || { mods: new Set(), rutinas: new Set(), zonas: new Set(), modos: new Set(), legacy: 0, v1: 0 };
    e.mods.add(r.modulo); e.rutinas.add(r.id); e.zonas.add(r.grupoLabel); e.modos.add(s.mode);
    s.mode === 'legacy' ? e.legacy++ : e.v1++;
    info.set(s.name, e);
  }
}

const filas = [...info.entries()].map(([n, e]) => {
  const g = G.get(n) || (alias[n] ? G.get(alias[n]) : null);
  return {
    n,
    existe: g ? 'sí' : '**NO**',
    via: G.get(n) ? '' : (g ? 'alias→' + alias[n] : ''),
    poses: g ? (g.poses === 2 ? '2' : '1') : '—',
    flecha: g ? (g.flecha ? 'sí' : '·') : '—',
    apoyo: g ? (g.apoyo ? 'sí' : '·') : '—',
    ver: g ? (g.version || 's60') : '—',
    zona: [...e.zonas].join(' / '),
    mods: [...e.mods].join('+'),
    rut: e.rutinas.size,
    contrato: e.legacy && e.v1 ? 'mixto' : (e.legacy ? 'legacy' : 'v1'),
    ingles: EN.test(n) ? 'sí' : '·',
  };
});
filas.sort((a, b) => (a.existe === b.existe ? a.n.localeCompare(b.n, 'es') : (a.existe === '**NO**' ? -1 : 1)));

const cab = '| Ejercicio | Glifo | Vía | Poses | Flecha | Apoyo | Iter | Inglés | Zona corporal | Módulo | Rut. | Contrato |';
const sep = '|---|---|---|---|---|---|---|---|---|---|---|---|';
const cuerpo = filas.map(f => `| ${f.n} | ${f.existe} | ${f.via} | ${f.poses} | ${f.flecha} | ${f.apoyo} | ${f.ver} | ${f.ingles} | ${f.zona} | ${f.mods} | ${f.rut} | ${f.contrato} |`);
console.log([cab, sep, ...cuerpo].join('\n'));

console.error('filas: ' + filas.length
  + ' | sin glifo: ' + filas.filter(f => f.existe !== 'sí').length
  + ' | ingles: ' + filas.filter(f => f.ingles === 'sí').length
  + ' | 2 poses: ' + filas.filter(f => f.poses === '2').length
  + ' | legacy: ' + filas.filter(f => f.contrato === 'legacy').length
  + ' | mixto: ' + filas.filter(f => f.contrato === 'mixto').length);
