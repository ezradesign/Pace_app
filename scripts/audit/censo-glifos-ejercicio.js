/* CENSO COMPLETO DE DIBUJOS DE EJERCICIO (s164)
 * ============================================
 * Para un rediseño DESDE CERO la unidad no es el ejercicio: es el DIBUJO. Varios
 * ejercicios comparten uno via `VISUAL_ALIAS` (identidad visual, s110), asi que
 * el censo se hace sobre `resolveVisualId()`.
 *
 * Y no basta con el registro del constructor: los pasos de las 28 rutinas de
 * Mueve y Estira tambien piden glifo, y hay nombres que solo viven ahi.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2] || process.cwd();
const babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));

const win = {};
function cargar(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const code = babel.transformSync(src, {
    configFile: false, babelrc: false, sourceType: 'script', filename: rel,
    presets: [[path.join(ROOT, 'node_modules', '@babel', 'preset-react'), {}]],
  }).code;
  new Function('window', 'React', '"use strict";(function(){' + code + '})();')(
    win, { createElement: () => null, Fragment: 'F' });
}

cargar('app/custom/exercise-registry.js');
cargar('app/custom/exercise-aliases.js');
cargar('app/glyphs/exercise-glyphs.jsx');
cargar('app/glyphs/exercise-glyphs.extra.jsx');

/* LOS PASOS DE LAS RUTINAS SE SACAN DEL FUENTE, no de `window`.
   Dos razones medidas: `MOVE_ROUTINES` es un OBJETO de grupos (no un array, mi
   primera version imprimio NaN) y `EXTRA_ROUTINES` **no se publica en window**
   -- ExtraModule.jsx solo exporta `ExtraLibrary`. Los pasos v1 se escriben todos
   como `{ name: '...', mode: ... }` en una linea (101 en los dos archivos), asi
   que ese patron los coge sin ambiguedad y sin confundirlos con el `name` de la
   rutina, que va con `id:` y `tag:`. */
const registro = win.EXERCISE_REGISTRY || {};
const glifos = win.EXERCISE_GLYPHS || {};
const alias = win.VISUAL_ALIAS || {};
const resolver = win.resolveVisualId || (n => n);

const PASOS = /name: '([^']+)', mode:/g;
function pasosDe(rel) {
  const txt = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const out = [];
  let m;
  while ((m = PASOS.exec(txt))) out.push(m[1]);
  return out;
}
const pasosMueve = pasosDe('app/move/move.data.js');
const pasosEstira = pasosDe('app/extra/ExtraModule.jsx');

const usos = new Map();   // visualId -> { nombres:Set, rutinas:Set, enRegistro:bool, grupo }

function anotar(nombre, origen, grupo) {
  if (!nombre || nombre === 'Descanso') return;
  const vid = resolver(nombre);
  if (!usos.has(vid)) usos.set(vid, { nombres: new Set(), rutinas: new Set(), enRegistro: false, grupo: '' });
  const u = usos.get(vid);
  u.nombres.add(nombre);
  if (origen) u.rutinas.add(origen);
  if (grupo) { u.enRegistro = true; u.grupo = grupo; }
}

Object.keys(registro).forEach(k => {
  const g = registro[k];
  (g.items || []).forEach(e => anotar(e.name, null, g.label || k));
});
pasosMueve.forEach(n => anotar(n, 'Mueve', null));
pasosEstira.forEach(n => anotar(n, 'Estira', null));

const filas = [...usos.entries()].map(([vid, u]) => ({
  vid,
  dibujo: !!glifos[vid],
  grupo: u.grupo || '(solo en rutinas)',
  nombres: [...u.nombres],
  rutinas: [...u.rutinas],
}));

console.log('dibujos DISTINTOS que la app necesita: %d', filas.length);
console.log('  con dibujo hoy: %d   ·   sin dibujo (DefaultGlyph): %d',
  filas.filter(f => f.dibujo).length, filas.filter(f => !f.dibujo).length);
console.log('glifos declarados en las dos hojas: %d', Object.keys(glifos).length);
const huerfanos = Object.keys(glifos).filter(k => !usos.has(k));
console.log('glifos DIBUJADOS que nadie usa: %d  %s', huerfanos.length,
  huerfanos.length ? '-> ' + huerfanos.join(', ') : '');
console.log('pasos leidos: Mueve %d · Estira %d', pasosMueve.length, pasosEstira.length);

const porGrupo = {};
filas.forEach(f => { (porGrupo[f.grupo] = porGrupo[f.grupo] || []).push(f); });
Object.keys(porGrupo).sort().forEach(g => {
  console.log('\n### %s (%d)', g, porGrupo[g].length);
  porGrupo[g].sort((a, b) => a.vid.localeCompare(b.vid)).forEach(f => {
    const otros = f.nombres.filter(n => n !== f.vid);
    console.log('%s | %s | alias: %s | rutinas: %s',
      (f.dibujo ? 'HAY' : '---'), f.vid.padEnd(34),
      (otros.length ? otros.join(' / ') : '-').padEnd(42),
      f.rutinas.length ? f.rutinas.slice(0, 3).join(', ') + (f.rutinas.length > 3 ? ' +' + (f.rutinas.length - 3) : '') : '(solo constructor)');
  });
});
