/* CENSO s167 · LOS LOGROS SIN ARTE Y EL ARTE SIN LOGRO
 * ====================================================
 * Antes de tocar `ingest-glifos-logro.js` hay que saber tres cosas que NO son
 * obvias y que se contestan solo mirando el arbol:
 *
 *  1. QUE LOGROS siguen sin dibujo, con su nombre y su descripcion — sin eso no
 *     se puede decidir que dibujo va a cual.
 *  2. QUE ARTE hay disponible y NO esta mapeado, en las DOS carpetas. La
 *     original tiene mas archivos que filas el MAPEO, asi que parte del hueco
 *     puede taparse con arte que ya existe.
 *  3. Que la ingesta **BORRA TODAS las mascaras antes de regenerarlas**
 *     (`fs.unlinkSync` sobre el destino), asi que correrla con una carpeta que
 *     no contenga TODO el arte referenciado destruye lo que ya funcionaba. Este
 *     censo comprueba esa cobertura antes de que sea tarde.
 *
 * Uso:  node scripts/audit/censo-glifos-logro-huecos.js <repo>
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(process.argv[2] || process.cwd());
const babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));

/* s167: el arte fuente vive ya en UNA sola carpeta. Estaba repartido en dos
   —los 58 implementados aqui y los 19 nuevos en `../Glifos de logros`— y el
   script de ingesta acepta un solo origen, asi que apuntarlo a la de los nuevos
   habria borrado las 58 mascaras que funcionaban. Decision del usuario: juntar
   el archivo de disenos, que es suyo y vive FUERA del repo (lo que la app
   consume son las .webp de `app/glyphs/assets/logros/`, esas si versionadas).
   Los 19 del lote nuevo se reconocen por el prefijo `exlibris_handcraft`. */
const CARPETAS = [
  path.resolve(ROOT, '..', '.old', 'Glifos_logros'),
];

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
cargar('app/achievements/catalog.js');

const CAT = win.ACHIEVEMENT_CATALOG || [];

/* MAPEO: se lee del fuente del script de ingesta, que es donde vive. */
const src = fs.readFileSync(path.join(ROOT, 'scripts', 'ingest-glifos-logro.js'), 'utf8');
const ini = src.indexOf('const MAPEO = {');
const fin = src.indexOf('\n};', ini);
const MAPEO = {};
for (const m of src.slice(ini, fin).matchAll(/"([^"]+)":\s*"([^"]+)"/g)) MAPEO[m[1]] = m[2];

const archivos = [];
for (const dir of CARPETAS) {
  if (!fs.existsSync(dir)) { console.log('  [AVISO] no existe: ' + dir); continue; }
  for (const f of fs.readdirSync(dir)) {
    if (/\.png$/i.test(f)) archivos.push({ dir, f });
  }
}

/* SE DEDUPLICA POR ID DE ASSET, no por nombre de archivo, y no es un detalle:
   la carpeta original tiene 91 archivos para 58 dibujos -- el mismo asset
   exportado con varios timestamps. Contando por nombre salian 33 dibujos
   'libres' que en realidad YA estaban implementados, y el usuario lo cazo antes
   que yo. La unidad es el DIBUJO, no el fichero. */
const idDe = f => { const m = f.match(/^asset_([a-z0-9]+)_/); return m ? m[1] : f; };
const usados = new Set();
const noEncontrados = [];
for (const [logro, asset] of Object.entries(MAPEO)) {
  const hit = archivos.find(a => a.f === asset || idDe(a.f) === asset);
  if (hit) usados.add(idDe(hit.f)); else noEncontrados.push(logro + ' -> ' + asset);
}

const sinArte = CAT.filter(a => !MAPEO[a.id]);
const vistos = new Set();
const libres = archivos.filter(a => {
  const id = idDe(a.f);
  if (usados.has(id) || vistos.has(id)) return false;
  vistos.add(id); return true;
});

console.log('\n=== COBERTURA (lo que decide si la ingesta se puede correr) ===');
console.log('  logros en el catalogo: ' + CAT.length);
console.log('  filas en MAPEO:        ' + Object.keys(MAPEO).length);
console.log('  logros SIN arte:       ' + sinArte.length);
console.log('  assets del MAPEO que NO se encuentran en disco: ' + noEncontrados.length +
  (noEncontrados.length ? '\n    ' + noEncontrados.join('\n    ') : '   <- si esto no es 0, NO correr la ingesta'));

console.log('\n=== ARTE DISPONIBLE Y SIN ASIGNAR (' + libres.length + ') ===');
const porDir = {};
libres.forEach(a => { (porDir[a.dir] = porDir[a.dir] || []).push(a.f); });
for (const d of Object.keys(porDir)) {
  console.log('\n  ' + d + '  (' + porDir[d].length + ')');
  porDir[d].sort().forEach((f, i) => console.log('    ' + String(i + 1).padStart(2) + '. ' + f));
}

console.log('\n=== LOS ' + sinArte.length + ' LOGROS SIN ARTE ===');
const porCat = {};
sinArte.forEach(a => { (porCat[a.cat || a.category || '(sin categoria)'] = porCat[a.cat || a.category || '(sin categoria)'] || []).push(a); });
for (const c of Object.keys(porCat).sort()) {
  console.log('\n  ### ' + c + ' (' + porCat[c].length + ')');
  porCat[c].forEach(a => {
    console.log('    ' + String(a.id).padEnd(26) + ' | ' + String(a.title || a.name || '').padEnd(28) +
      ' | ' + String(a.desc || a.description || '').slice(0, 60));
  });
}

/* GUARD DE CERO: sin catalogo o sin MAPEO esto no ha medido nada. */
if (!CAT.length || !Object.keys(MAPEO).length) {
  console.error('\n  CENSO ROTO: catalogo o MAPEO vacios');
  process.exit(1);
}
process.exit(noEncontrados.length ? 1 : 0);
