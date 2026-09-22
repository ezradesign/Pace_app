/* PACE · BANCO DE MUTANTES de la media jornada y de lo contado (s197 · v0.129.0)
 * ==============================================================================
 * Misma mecánica que los bancos de s192-s195: cada mutante rompe UNA pieza de lo
 * decidido en s197 —la media jornada como horario, sus horas propias, la comida
 * solo en la entera, el tramo en el chip, la segunda frase, la hoja con estado, el
 * recuento de la barra lateral—, recompila, corre la prueba que debería cazarlo y
 * restaura el archivo byte a byte.
 *
 * Uso (con el servidor estático en 8765):
 *   node scripts/audit/banco-media-s197.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');

const MEDIA = 'tests/ritmo-media.spec.js';
const LLEVAS = 'tests/ritmo-llevas.spec.js';
const MUTANTES = [
  ['la media jornada vuelve a ser una duración', 'app/ritmo/ritmo.regla.js',
    "  'media':   { bloque: 45, foco: Infinity },", "  'media':   { bloque: 45, foco: 180 },", MEDIA, 'tramo con sus horas'],
  ['la media jornada usa las horas de la entera', 'app/ritmo/ritmo.regla.js',
    "  var med = (opcion === 'media' && horario.media) ? horario.media : null;", '  var med = null;', MEDIA, 'tramo con sus horas'],
  ['la comida vuelve a colarse en cualquier opción', 'app/ritmo/ritmo.regla.js',
    "  var comeA = (opcion === 'jornada' && !horario.sinComida) ? horario.comida : Infinity;",
    '  var comeA = horario.sinComida ? Infinity : horario.comida;', MEDIA, 'comida es solo'],
  ['las horas de la media jornada no siguen a la entrada', 'app/state-ritmo.jsx',
    '  return { inicio: h.inicio, salida: h.inicio + RITMO_MEDIA_DUR };', '  return { inicio: 540, salida: 780 };', MEDIA, 'tramo con sus horas'],
  ['tocar sus horas escribe en el horario de la entera', 'app/state-ritmo.jsx',
    "  if (campo.indexOf('media.') === 0) {", '  if (false) {', MEDIA, 'sus horas son suyas'],
  ['el chip no dice el tramo', 'app/ritmo/RitmoPanel.jsx',
    "  if (op === 'media' || op === 'jornada') return tn('ritmo.tramo', { a: ritmoHora(m.desde), b: ritmoHora(m.hasta) });", '  if (false) return null;', MEDIA, 'dicen su tramo'],
  ['«Ajustar el horario» pierde la segunda frase', 'app/ritmo/RitmoPanel.jsx',
    '  const fraseMedia = <RitmoFrase plantilla={t(\'ritmo.frase.media\')} huecos={huecos} />;', '  const fraseMedia = null;', MEDIA, 'segunda frase'],
  ['la cabecera de la media jornada no edita sus horas', 'app/ritmo/RitmoPanel.jsx',
    '  if (media) { huecos.inicio = huecos.mediaInicio; huecos.salida = huecos.mediaSalida; }', '  if (false) {}', MEDIA, 'sus horas son suyas'],
  ['la hoja vuelve a atenuar todo lo pasado por igual', 'app/ritmo/RitmoHoja.jsx',
    "        const estado = !comida && pasado ? (plan.estados || {})[ritmoOrdinal(m, it)] || null : null;", '        const estado = null;', LLEVAS, 'se hizo o se saltó'],
  ['la hoja no distingue la hecha de la saltada al pintarlas', 'app/ritmo/ritmo.css.jsx',
    '.pace-rt-li.pace-rt-saltada .pace-rt-eje i { border-style: dashed; }', '.pace-rt-li.pace-rt-saltada .pace-rt-eje i { border-style: solid; }', LLEVAS, 'conserva la tinta'],
  ['la barra lateral no cuenta nada', 'app/shell/Sidebar.parts.jsx',
    '      llevas: ritmoLlevas(rt.bloques || 0, rt.pausas || 0, t, tn),', '      llevas: null,', LLEVAS, 'cuenta lo que llevas'],
  ['el recuento suma también las pausas saltadas', 'app/state-ritmo.jsx',
    "      Object.keys(p.estados || {}).forEach(function (k) { if (p.estados[k] === 'hecha') hechas++; });",
    '      Object.keys(p.estados || {}).forEach(function () { hechas++; });', LLEVAS, 'cuenta lo que llevas'],
  ['el recuento aparece con el día recién empezado', 'app/ritmo/RitmoPiezas.jsx',
    '  if (!bloques) return null;', '  if (false) return null;', LLEVAS, 'sin un bloque hecho'],
];

const sh = (cmd) => {
  try { return { ok: true, out: execSync(cmd, { cwd: ROOT, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};

sh('node build-standalone.js');
const control = sh('npx playwright test ' + MEDIA + ' ' + LLEVAS + ' --reporter=line');
if (!control.ok) { sh('git checkout -- PACE_standalone.html'); throw new Error('CONTROL EN ROJO: el árbol sin mutar ya falla, el banco no puede medir nada'); }
console.log('control sin mutar → verde');

const resultados = [];
for (const [nombre, rel, antes, despues, spec, grep] of MUTANTES) {
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
    const t = sh('npx playwright test ' + spec + ' -g "' + grep + '" --reporter=line');
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
