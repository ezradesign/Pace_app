/* PACE · BANCO DE MUTANTES de «A tu ritmo» (s192)
 * ================================================
 * Regla de s154: un aserto que no se ha visto fallar no prueba nada. Cada mutante
 * rompe UNA cosa real del módulo, recompila `index.html`, corre la prueba que
 * debería cazarlo y restaura el archivo comprobando que queda IDÉNTICO byte a byte
 * (los archivos nuevos no están en git: `git checkout` no los devolvería).
 *
 * Uso (con el servidor estático en 8765):
 *   node scripts/audit/banco-ritmo-s192.js
 * Al acabar deja el árbol como estaba y `PACE_standalone.html` restaurado.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');

const MUTANTES = [
  ['la pausa ignora el menú', 'app/breakmenu/BreakMenu.support.jsx',
    'if (delDia) return delDia;', 'if (false) return delDia;', 'ritmo.spec.js', 'al terminar un bloque'],
  ['el aro no dice el bloque', 'app/focus/FocusTimer.jsx',
    'const modeLabel = aro ? aro.label :', 'const modeLabel = false ? aro.label :', 'ritmo.spec.js', 'elegir la jornada'],
  ['la barra lateral ignora el menú', 'app/shell/Sidebar.selectors.js',
    'if (c.ritmo && c.ritmo.targetId) {', 'if (false) {', 'ritmo.spec.js', 'elegir la jornada'],
  ['la comida no se ancla a su hora', 'app/ritmo/ritmo.regla.js',
    '        dur = comeA - t;\n', '        dur = dur;\n', 'ritmo.spec.js', 'la regla'],
  ['el rótulo no compensa «Hasta las»', 'app/ritmo/ritmo.css.jsx',
    '.pace-rt-rotulo.pace-rt-con-hasta { margin-top: -15px; }', '.pace-rt-rotulo.pace-rt-con-hasta { margin-top: 0; }',
    'ritmo.spec.js', 'elegir la jornada'],
  ['el motor no mide el panel', 'app/main/home-geometry.js',
    "'[data-pace-activitybar-chip], [data-pace-ritmo-panel]'", "'[data-pace-activitybar-chip]'",
    'ritmo.spec.js', 'no pide scroll'],
  ['el pozo deja pasar lo que pide aviso o suelo', 'app/state-ritmo.jsx',
    'if (!r || r.safety || r.requiresFloor) return false;', 'if (!r) return false;', 'ritmo.spec.js', 'la regla'],
  ['el aro no mide el bloque', 'app/state-ritmo.jsx',
    'setState({ focusMinutes: p.actual.dur });', 'void 0;', 'ritmo.spec.js', 'elegir la jornada'],
  ['«por libre» no devuelve la carta', 'app/ritmo/RitmoHome.jsx',
    '  if (R.libre) {', '  if (false) {', 'ritmo.spec.js', 'por libre'],
  ['el progreso no avanza', 'app/state-ritmo.jsx',
    "(Number((s || {}).cycle) || 0) - (R.dia.cicloBase || 0)", '0', 'ritmo.spec.js', 'al terminar un bloque'],
  /* El estilo del botón NO es lo que alinea: el primer banco lo mutó y siguió verde.
     La causa es el envoltorio en inline-flex (aislado a mano en s192). */
  ['el enlace de vuelta cae 1-2 px bajo «Ver caminos»', 'app/ritmo/RitmoHome.jsx',
    "<span data-pace-ritmo style={{ display: 'inline-flex' }}>", '<span data-pace-ritmo>',
    'home-a11y.spec.js', 'escritorio'],
];

const sh = (cmd) => {
  try { return { ok: true, out: execSync(cmd, { cwd: ROOT, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};

/* CONTROL: sin mutar, todo verde. Si no, un «muerde» no significaría nada. */
sh('node build-standalone.js');
if (!sh('npx playwright test tests/ritmo.spec.js tests/home-a11y.spec.js --reporter=line').ok) {
  sh('git checkout -- PACE_standalone.html');
  throw new Error('CONTROL EN ROJO: el árbol sin mutar ya falla, el banco no puede medir nada');
}
console.log('control sin mutar → verde');

const resultados = [];
for (const [nombre, rel, antes, despues, spec, grep] of MUTANTES) {
  const f = path.join(ROOT, rel);
  const original = fs.readFileSync(f);
  const texto = original.toString('utf8');
  if (texto.split(antes).length !== 2) { resultados.push([nombre, 'NO APLICA (el texto no es único)']); continue; }
  fs.writeFileSync(f, texto.replace(antes, despues));
  try {
    const b = sh('node build-standalone.js');
    if (!b.ok) { resultados.push([nombre, 'EL BUILD FALLA']); continue; }
    /* Con la barra de la semilla de la suite (helpers) la carta va siempre; la
       prueba de a11y siembra así, y por eso ve el enlace de vuelta. */
    const t = sh('npx playwright test tests/' + spec + ' -g "' + grep + '" --reporter=line');
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
