/* PACE · BANCO DE MUTANTES de «la semana» (s195c · v0.128.0)
 * ============================================================
 * Misma mecánica que los bancos de s192-s194: cada mutante rompe UNA pieza de la
 * semana —la semana ISO, el ciclo de temas, el orden de los pozos, cada acento,
 * el respeto a lo hecho, el fin de semana, el enganche en la app— recompila,
 * corre la prueba que debería cazarlo y restaura el archivo byte a byte.
 *
 * Uso (con el servidor estático en 8765):
 *   node scripts/audit/banco-semana-s195.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');

const ISO = 'la semana ISO';
const ACENTOS = 'el tema lidera';
const HECHO = 'respetan lo hecho';
const APP = 'la app compone';
const MUTANTES = [
  ['la semana ISO va una por delante', 'app/ritmo/ritmo.semana.js',
    "return { n: Math.ceil(((d - inicioAno) / 86400000 + 1) / 7),", "return { n: Math.ceil(((d - inicioAno) / 86400000 + 1) / 7) + 1,", ISO],
  ['el tema no cicla: siempre el primero', 'app/ritmo/ritmo.semana.js',
    'tema: SEMANA_TEMAS[(s.n - 1) % SEMANA_TEMAS.length]', 'tema: SEMANA_TEMAS[0]', ISO],
  ['el tema no reordena los pozos', 'app/ritmo/ritmo.semana.js',
    'return { estira: semanaOrdenar(pozos.estira, t.estira, t.corta),', 'return { estira: (pozos.estira || []).slice(),', ACENTOS],
  ['el lunes no arranca con Mueve', 'app/ritmo/ritmo.semana.js',
    "if (a === 'arranque' && !(previos && previos.pausas > 0) &&", "if (false &&", ACENTOS],
  ['el miércoles la larga sigue siendo la tercera', 'app/ritmo/ritmo.semana.js',
    "var h = a === 'mitad' ? Object.assign({}, horario, { desfaseLarga: 1 }) : horario;", 'var h = horario;', ACENTOS],
  ['el jueves no se respira antes de comer', 'app/ritmo/ritmo.semana.js',
    "if (a === 'aire') {", 'if (false) {', ACENTOS],
  ['el viernes el cierre no es el Respira largo', 'app/ritmo/ritmo.semana.js',
    "if (a === 'cierre' && m.items.length) {", 'if (false) {', ACENTOS],
  ['el fin de semana lleva acento', 'app/ritmo/ritmo.semana.js',
    "  6: { id: 'libre' },\n  7: { id: 'libre' },", "  6: { id: 'arranque' },\n  7: { id: 'arranque' },", ACENTOS],
  ['«arrancar» pisa la primera pausa aunque haya pausas hechas', 'app/ritmo/ritmo.semana.js',
    "if (a === 'arranque' && !(previos && previos.pausas > 0) &&", "if (a === 'arranque' &&", HECHO],
  ['la app no compone por la semana', 'app/state-ritmo.jsx',
    "  var m = typeof semanaComponer === 'function'\n    ? semanaComponer(opcion, h, ritmoPozos(s, hoy), cambios, agua, semanaDe(hoy), previos)\n    : ritmoComponer(opcion, h, ritmoPozos(s, hoy), cambios, agua, previos);",
    '  var m = ritmoComponer(opcion, h, ritmoPozos(s, hoy), cambios, agua, previos);', APP],
  ['la regla ignora el desfase de la larga', 'app/ritmo/ritmo.regla.js',
    'var desfase = Number(horario.desfaseLarga) || 0;', 'var desfase = 0;', ACENTOS],
];

const sh = (cmd) => {
  try { return { ok: true, out: execSync(cmd, { cwd: ROOT, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};

sh('node build-standalone.js');
if (!sh('npx playwright test tests/ritmo-semana.spec.js --reporter=line').ok) {
  sh('git checkout -- PACE_standalone.html');
  throw new Error('CONTROL EN ROJO: el árbol sin mutar ya falla, el banco no puede medir nada');
}
console.log('control sin mutar → verde');

const resultados = [];
for (const [nombre, rel, antes, despues, grep] of MUTANTES) {
  const f = path.join(ROOT, rel);
  const original = fs.readFileSync(f);
  const texto = original.toString('utf8');
  const crlf = texto.includes('\r\n');
  const buscado = crlf ? antes.replace(/\n/g, '\r\n') : antes;
  const puesto = crlf ? despues.replace(/\n/g, '\r\n') : despues;
  if (texto.split(buscado).length !== 2) { resultados.push([nombre, 'NO APLICA (el texto no es único)']); console.log(nombre + ' → NO APLICA'); continue; }
  fs.writeFileSync(f, texto.replace(buscado, () => puesto));
  try {
    const b = sh('node build-standalone.js');
    if (!b.ok) { resultados.push([nombre, 'EL BUILD FALLA']); continue; }
    const t = sh('npx playwright test tests/ritmo-semana.spec.js -g "' + grep + '" --reporter=line');
    resultados.push([nombre, t.ok ? 'VIVE (la prueba sigue en verde)' : 'muerde']);
  } finally {
    fs.writeFileSync(f, original);
    if (!fs.readFileSync(f).equals(original)) throw new Error('NO SE RESTAURÓ ' + rel);
  }
  console.log(resultados[resultados.length - 1].join(' → '));
}
sh('node build-standalone.js');
sh('git checkout -- PACE_standalone.html');
const vivos = resultados.filter((r) => r[1] !== 'muerde');
console.log('\n' + (resultados.length - vivos.length) + ' de ' + resultados.length + ' muerden' + (vivos.length ? ' · VIVOS: ' + vivos.map((r) => r[0]).join(' | ') : ''));
