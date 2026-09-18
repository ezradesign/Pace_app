/* PACE · BANCO DE MUTANTES de «la línea sigue al aro» (s193)
 * ===========================================================
 * Misma mecánica que banco-ritmo-s192.js (regla de s154: un aserto que no se ha
 * visto fallar no prueba nada). Cada mutante rompe UNA cosa real de lo que entró
 * en s193 —la pausa abierta, el relleno del tramo, la frase, la barra lateral—,
 * recompila `index.html`, corre la prueba que debería cazarlo y restaura el
 * archivo comprobando que queda IDÉNTICO byte a byte.
 *
 * LO QUE NO MUTA, a propósito: los COLORES (verde entero en lo hecho, 35 % en lo
 * de ahora) y la guarda `R.dia.pausa === hechos` de state-ritmo.jsx. Del primero
 * no hay aserto —la suite no compara un píxel— y el segundo solo se nota si
 * `cycle` se mueve por otra vía con una pausa guardada vieja, que ninguna
 * prueba provoca. Se declaran, no se disimulan.
 *
 * Uso (con el servidor estático en 8765):
 *   node scripts/audit/banco-pausa-s193.js
 * Al acabar deja el árbol como estaba y `PACE_standalone.html` restaurado.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');

const SIGUE = 'la línea sigue al aro';
const MUTANTES = [
  ['terminar un bloque no abre la pausa', 'app/main.jsx',
    "if (typeof ritmoBloqueTerminado === 'function') ritmoBloqueTerminado();", 'void 0;', 'ritmo.spec.js', SIGUE],
  ['empezar el bloque siguiente no cierra la pausa', 'app/focus/FocusTimer.jsx',
    "if (state.focusMode === 'foco' && typeof ritmoBloqueEmpezado === 'function') ritmoBloqueEmpezado();", 'void 0;',
    'ritmo.spec.js', SIGUE],
  ['la línea ignora la pausa abierta', 'app/ritmo/RitmoLinea.jsx',
    'if (plan.pausa) return m.items.indexOf(plan.pausa);', 'if (false) return m.items.indexOf(plan.pausa);', 'ritmo.spec.js', SIGUE],
  ['el plan no ve la pausa guardada', 'app/state-ritmo.jsx',
    'var pausa = hechos > 0 && R.dia.pausa === hechos ? ritmoDetras(m, m.focos[hechos - 1]) : null;', 'var pausa = null;',
    'ritmo.spec.js', 'sobrevive a la recarga'],
  ['el aro no publica el avance del bloque', 'app/focus/FocusTimer.luz.jsx',
    "const paceBloque = haySesion ? (Math.round(progress * 96) / 96).toFixed(4) : '0';", "const paceBloque = '0';",
    'ritmo.spec.js', SIGUE],
  ['el tramo no se rellena', 'app/ritmo/ritmo.css.jsx',
    'width: calc(var(--pace-bloque, 0) * 100%);', 'width: 0;', 'ritmo.spec.js', SIGUE],
  ['la barra lateral no distingue la pausa abierta', 'app/shell/Sidebar.parts.jsx',
    "eyebrow: tn(rt.ahora ? 'ritmo.sidebar.ahora' : 'ritmo.sidebar', { h: ritmoHora(rt.hora) }),",
    "eyebrow: tn('ritmo.sidebar', { h: ritmoHora(rt.hora) }),", 'ritmo.spec.js', SIGUE],
  ['la barra lateral sigue anunciando la siguiente con una abierta', 'app/state-ritmo.jsx',
    'var it = p.pausa && p.pausa.platos && p.pausa.platos[0] ? p.pausa : p.actual;', 'var it = p.actual;',
    'ritmo.spec.js', SIGUE],
  ['tocar la parada abierta no la empieza', 'app/ritmo/RitmoLinea.jsx',
    'onClick={() => abierta ? ritmoEmpezarParada(it) : ritmoOtra(it.platos.map((p) => p.clave))}>',
    'onClick={() => ritmoOtra(it.platos.map((p) => p.clave))}>', 'ritmo.spec.js', 'tocar la parada empieza'],
  ['la frase no se va con el primer bloque', 'app/ritmo/RitmoPanel.jsx',
    'if (plan.hechos > 0) return null;', 'if (false) return null;', 'ritmo.spec.js', SIGUE],
  ['en móvil «Ahora» sigue siendo el bloque', 'app/ritmo/RitmoPanel.jsx',
    'const filas = plan.pausa\n', 'const filas = false\n', 'ritmo.spec.js', 'con la pausa abierta, «Ahora»'],
  ['la mini línea no marca la parada', 'app/ritmo/RitmoLinea.jsx',
    "(i === iActual ? ' pace-rt-ahora' : '')} style={{ '--c': RITMO_COLOR[it.platos[0].modulo] }} />",
    "''} style={{ '--c': RITMO_COLOR[it.platos[0].modulo] }} />", 'ritmo.spec.js', 'con la pausa abierta, «Ahora»'],
];

const sh = (cmd) => {
  try { return { ok: true, out: execSync(cmd, { cwd: ROOT, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};

/* CONTROL: sin mutar, todo verde. Si no, un «muerde» no significaría nada. */
sh('node build-standalone.js');
if (!sh('npx playwright test tests/ritmo.spec.js --reporter=line').ok) {
  sh('git checkout -- PACE_standalone.html');
  throw new Error('CONTROL EN ROJO: el árbol sin mutar ya falla, el banco no puede medir nada');
}
console.log('control sin mutar → verde');

const resultados = [];
for (const [nombre, rel, antes, despues, spec, grep] of MUTANTES) {
  const f = path.join(ROOT, rel);
  const original = fs.readFileSync(f);
  /* La copia de trabajo va con CRLF (autocrlf): el texto a buscar se normaliza. */
  const texto = original.toString('utf8');
  const buscado = texto.includes('\r\n') ? antes.replace(/\n/g, '\r\n') : antes;
  const puesto = texto.includes('\r\n') ? despues.replace(/\n/g, '\r\n') : despues;
  if (texto.split(buscado).length !== 2) { resultados.push([nombre, 'NO APLICA (el texto no es único)']); console.log(nombre + ' → NO APLICA'); continue; }
  fs.writeFileSync(f, texto.replace(buscado, () => puesto));
  try {
    const b = sh('node build-standalone.js');
    if (!b.ok) { resultados.push([nombre, 'EL BUILD FALLA']); continue; }
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
