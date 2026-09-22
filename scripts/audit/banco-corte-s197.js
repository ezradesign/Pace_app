/* PACE · BANCO DE MUTANTES del corte entre pieles (s197 · v0.130.0)
 * ==================================================================
 * Cada mutante rompe UNA pieza del corte —el ancho, la orientación, la mitad de
 * escritorio, el origen único, la pill de la tableta, el acuerdo entre el JS y el
 * CSS—, recompila, corre la prueba que debería cazarlo y restaura byte a byte.
 *
 * Uso (con el servidor estático en 8765):
 *   node scripts/audit/banco-corte-s197.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');

const SPEC = 'tests/pieles-corte.spec.js';
const LADOS = 'cuatro lados';
const TABLETA = 'sin barra lateral';
const CAJON = 'se cierra al pulsarla';
const MUTANTES = [
  ['el corte se queda en 768 (nada cambia para las tabletas)', 'app/main/_responsive.corte.js',
    'var PACE_CORTE_MAX = 1024;', 'var PACE_CORTE_MAX = 768;', LADOS],
  ['el corte se pasa de ancho (1366 también sería móvil)', 'app/main/_responsive.corte.js',
    'var PACE_CORTE_MAX = 1024;', 'var PACE_CORTE_MAX = 1440;', LADOS],
  ['la orientación deja de contar: cualquier cosa ≤1024 es móvil', 'app/main/_responsive.corte.js',
    "var PACE_CORTE_MOVIL = '(max-width: 768px), (orientation: portrait) and (max-width: ' + PACE_CORTE_MAX + 'px)';",
    "var PACE_CORTE_MOVIL = '(max-width: ' + PACE_CORTE_MAX + 'px)';", LADOS],
  ['las dos mitades dejan de ser complementarias', 'app/main/_responsive.corte.js',
    "var PACE_CORTE_ESC = '(min-width: ' + (PACE_CORTE_MAX + 1) + 'px), (min-width: 769px) and (orientation: landscape)';",
    "var PACE_CORTE_ESC = '(min-width: 769px)';", LADOS],
  ['el JS deja de preguntar lo mismo que el CSS', 'app/main/_responsive.corte.js',
    '  try { return !!(window.matchMedia && window.matchMedia(PACE_CORTE_MOVIL).matches); } catch (e) { return false; }',
    "  try { return !!(window.matchMedia && window.matchMedia('(max-width: 768px)').matches); } catch (e) { return false; }", LADOS],
  ['la barra lateral sigue con su corte copiado', 'app/shell/Sidebar.jsx',
    "  return typeof paceEsMovil === 'function' ? paceEsMovil() : false;",
    "  return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;", CAJON],
  ['la pill de modos desaparece en tableta', 'app/main/_responsive.pieles.js',
    '      @media (min-width: 768px) and (orientation: portrait) and (max-width: ${PACE_CORTE_MAX}px) {',
    '      @media (min-width: 768px) and (orientation: portrait) and (max-width: 0px) {', TABLETA],
  ['la pill vuelve a pedir la fila de 42 px del teléfono', 'app/main/_responsive.pieles.js',
    '      @media (min-width: 390px) and (max-width: 767px) and (min-height: 760px) {',
    '      @media (min-width: 390px) and (max-width: ${PACE_CORTE_MAX}px) and (min-height: 760px) {', TABLETA],
];

const sh = (cmd) => {
  try { return { ok: true, out: execSync(cmd, { cwd: ROOT, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};

sh('node build-standalone.js');
if (!sh('npx playwright test ' + SPEC + ' --reporter=line').ok) {
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
    const t = sh('npx playwright test ' + SPEC + ' -g "' + grep + '" --reporter=line');
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
