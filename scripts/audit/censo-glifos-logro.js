/* INVENTARIO DE GLIFOS PENDIENTES (s164)
 * =====================================
 * Calcula del ARBOL, no de la documentacion:
 *   A) logros del catalogo SIN mascara de arte (sistema 3) -> con que se pintan hoy
 *   B) ejercicios del registro que caen a DefaultGlyph
 *
 * Cada archivo se evalua en SU PROPIA IIFE, como en el artefacto: `GLYPH_SVG` es
 * `const` en dos archivos y cargarlos en un ambito comun revienta (trampa de s152).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2] || process.cwd();
const babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));

function compilar(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  return babel.transformSync(src, {
    configFile: false, babelrc: false, sourceType: 'script', filename: rel,
    presets: [[path.join(ROOT, 'node_modules', '@babel', 'preset-react'), {}]],
  }).code;
}

const win = {};
function cargar(rel) {
  const code = compilar(rel);
  const fn = new Function('window', 'React', '"use strict";(function(){' + code + '})();');
  fn(win, { createElement: () => null, Fragment: 'F' });
}

/* Orden como en PACE.html: los glifos de logro, el catalogo, las mascaras, y
   luego el registro de ejercicios con sus alias y sus dos hojas de glifos. */
cargar('app/glyphs/achievement-glyphs.jsx');
cargar('app/achievements/catalog.js');
cargar('app/glyphs/achievement-masks.js');
cargar('app/custom/exercise-registry.js');
cargar('app/custom/exercise-aliases.js');
cargar('app/glyphs/exercise-glyphs.jsx');
cargar('app/glyphs/exercise-glyphs.extra.jsx');

const catalogo = win.ACHIEVEMENT_CATALOG || [];
const mascaras = win.ACHIEVEMENT_MASKS || {};
const heraldicos = win.GLYPH_SVG || {};

console.log('=== A · LOGROS ===');
console.log('catalogo: %d · con mascara de arte: %d · SIN arte: %d',
  catalogo.length, Object.keys(mascaras).length,
  catalogo.filter(a => !mascaras[a.id]).length);

const sinArte = catalogo.filter(a => !mascaras[a.id]);
const porCat = {};
sinArte.forEach(a => { (porCat[a.cat] = porCat[a.cat] || []).push(a); });
Object.keys(porCat).forEach(cat => {
  console.log('\n--- %s (%d) ---', cat, porCat[cat].length);
  porCat[cat].forEach(a => {
    const conHeraldico = !!(a.glyphSvg || heraldicos[a.id]);
    console.log('  %s | %s | %s | pinta hoy: %s | %s',
      a.id.padEnd(28), String(a.title).padEnd(24), String(a.desc || '').slice(0, 52).padEnd(52),
      conHeraldico ? 'SVG heraldico' : 'caracter «' + a.glyph + '»',
      a.secret ? 'SECRETO' : '');
  });
});

console.log('\n\n=== B · EJERCICIOS ===');
/* EXERCISE_REGISTRY es un OBJETO de grupos, cada uno con `items` -- no un
   array. Mi primera version supuso array y murio con «forEach is not a
   function»: los nombres de export se leen, no se adivinan. */
const registro = win.EXERCISE_REGISTRY || {};
const glifos = win.EXERCISE_GLYPHS || {};
const alias = win.VISUAL_ALIAS || {};
const resolver = win.resolveVisualId || (n => n);
console.log('glifos dibujados: %d · alias visuales: %d',
  Object.keys(glifos).length, Object.keys(alias).length);

const items = [];
Object.keys(registro).forEach(clave => {
  const g = registro[clave];
  (g.items || []).forEach(e => items.push({
    grupo: (g.label || clave), nombre: e.name, cue: e.cue || '', dur: e.dur,
  }));
});
console.log('grupos: %d', Object.keys(registro).length);
{
  const sinDibujo = items.filter(it => {
    const vid = resolver(it.nombre);
    return !glifos[vid];
  });
  console.log('items totales: %d · SIN dibujo (caen a DefaultGlyph): %d', items.length, sinDibujo.length);
  const porGrupo = {};
  sinDibujo.forEach(it => { (porGrupo[it.grupo] = porGrupo[it.grupo] || []).push(it); });
  Object.keys(porGrupo).forEach(gr => {
    console.log('\n--- %s (%d) ---', gr, porGrupo[gr].length);
    porGrupo[gr].forEach(it => console.log('  %s | %s',
      it.nombre.padEnd(30), String(it.cue).slice(0, 70)));
  });
}
