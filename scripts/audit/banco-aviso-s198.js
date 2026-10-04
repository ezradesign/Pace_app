/* PACE · BANCO DE MUTANTES del aviso con nombre (s198 · v0.133.0)
 * ===============================================================
 * Cada mutante rompe UNA pieza de «la pausa te llama por su nombre» —el cableado
 * en FocusTimer, el momento del calculo, el plato, la hora, la larga, la comida,
 * el cierre, el ultimo bloque y el nombre en ingles—, recompila, corre la prueba
 * que deberia cazarlo y restaura byte a byte.
 *
 * Lo que NO se muta, dicho:
 *  · el `finally` de FocusTimer (avisar aunque `onFinish` falle): provocar que
 *    falle exige romper la pausa a proposito y no hay prueba que lo haga.
 *  · «por libre, nada cambia»: es un CONTROL, pasa igual contra v0.132.0.
 *
 * Uso (con el servidor estatico en 8765, el de la suite):
 *   node scripts/audit/banco-aviso-s198.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');
const SPEC = 'tests/ritmo-aviso.spec.js';
const SERVIDO = 'con el dia servido';
const PARADAS = 'la larga con todos';
const INGLES = 'en ingles';

const MUTANTES = [
  ['FocusTimer no pregunta al dia', 'app/focus/FocusTimer.jsx',
    "const aviso = typeof ritmoAviso === 'function' ? ritmoAviso(getState(), t, tn, lang) : null;",
    'const aviso = null;', SERVIDO],
  ['el aviso se calcula con el estado de ANTES de cerrar el bloque', 'app/focus/FocusTimer.jsx',
    'ritmoAviso(getState(), t, tn, lang)', 'ritmoAviso(state, t, tn, lang)', SERVIDO],
  ['nombra la pausa equivocada (la de despues)', 'app/ritmo/ritmo.aviso.js',
    '  var it = ritmoDetras(p.m, p.m.focos[p.hechos - 1]);', '  var it = ritmoDetras(p.m, p.m.focos[p.hechos]);', SERVIDO],
  ['no dice a que hora vuelves', 'app/ritmo/ritmo.aviso.js',
    "      ? tn('notify.ritmo.cuerpo', { n: p.hechos, total: p.total, hora: hora(sig.desde) })",
    "      ? tn('notify.ritmo.cuerpo', { n: p.hechos, total: p.total, hora: '' })", SERVIDO],
  ['la larga dura lo que su primera rutina', 'app/ritmo/ritmo.aviso.js',
    'min: it.larga ? it.dur : platos[0].min', 'min: platos[0].min', PARADAS],
  ['la larga se anuncia como una pausa mas', 'app/ritmo/ritmo.aviso.js',
    "var clave = it.larga ? 'notify.ritmo.larga' : ", "var clave = false ? 'notify.ritmo.larga' : ", PARADAS],
  ['la comida no se anuncia', 'app/ritmo/ritmo.aviso.js',
    "  if (it.tipo === 'comida') {", '  if (false) {', PARADAS],
  ['el cierre se anuncia como una pausa mas', 'app/ritmo/ritmo.aviso.js',
    "(it.tipo === 'cierre' ? 'notify.ritmo.cierre' : 'notify.ritmo.titulo')", "'notify.ritmo.titulo'", PARADAS],
  ['el ultimo bloque no cierra el dia', 'app/ritmo/ritmo.aviso.js',
    "      : tn('notify.ritmo.ultimo', { n: p.hechos, total: p.total }),", "      : '',", PARADAS],
  ['el nombre va siempre en español', 'app/ritmo/ritmo.aviso.js',
    "return typeof ritmoNombre === 'function' ? ritmoNombre(pl.rutina || pl, t, lang) : (pl.name || pl.id || '');",
    "return pl.name || pl.id || '';", INGLES],
];

const sh = (cmd) => {
  try { return { ok: true, out: execSync(cmd, { cwd: ROOT, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};

sh('node build-standalone.js');
if (!sh('npx playwright test ' + SPEC + ' --reporter=line').ok) {
  sh('git checkout -- PACE_standalone.html');
  throw new Error('CONTROL EN ROJO: el arbol sin mutar ya falla, el banco no puede medir nada');
}
console.log('control sin mutar -> verde');
const resultados = [];
for (const [nombre, rel, antes, despues, grep] of MUTANTES) {
  const f = path.join(ROOT, rel);
  const original = fs.readFileSync(f);
  const texto = original.toString('utf8');
  if (texto.split(antes).length !== 2) { resultados.push([nombre, 'NO APLICA (el texto no es unico)']); console.log(nombre + ' -> NO APLICA'); continue; }
  fs.writeFileSync(f, texto.replace(antes, () => despues));
  try {
    const b = sh('node build-standalone.js');
    if (!b.ok) { resultados.push([nombre, 'EL BUILD FALLA']); continue; }
    const t = sh('npx playwright test ' + SPEC + ' -g "' + grep + '" --reporter=line');
    resultados.push([nombre, t.ok ? 'VIVE (la prueba sigue en verde)' : 'muerde']);
  } finally {
    fs.writeFileSync(f, original);
    if (!fs.readFileSync(f).equals(original)) throw new Error('NO SE RESTAURO ' + rel);
  }
  console.log(resultados[resultados.length - 1].join(' -> '));
}
sh('node build-standalone.js');
sh('git checkout -- PACE_standalone.html');
const vivos = resultados.filter((r) => r[1] !== 'muerde');
console.log('\n' + (resultados.length - vivos.length) + ' de ' + resultados.length + ' muerden' + (vivos.length ? ' · VIVOS: ' + vivos.map((r) => r[0]).join(' | ') : ''));
