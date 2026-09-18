/* PACE · BANCO DE MUTANTES del ORIGEN de cada sesión (s194)
 * ===========================================================
 * Misma mecánica que banco-pausa-s193.js. Cada mutante apaga UNA puerta —o el
 * consumo de la anotación, o la lista permitida— recompila `index.html`, corre la
 * prueba que debería cazarlo y restaura el archivo byte a byte.
 *
 * LO QUE NO MUTA, declarado: el documento del esquema (un texto no se prueba) y
 * `fromMenu` en la puerta `biblioteca` (siempre false: no hay mutación posible
 * que la prueba distinga de «no anotada», porque null !== false sí, pero un
 * mutante que ponga true lo caza el mismo aserto que la puerta).
 *
 * Uso (con el servidor estático en 8765):
 *   node scripts/audit/banco-origen-s194.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');

const ARO_PAUSA = 'el aro con plan';
const PARADA = 'tocar la parada abierta';
const BIBLIO = 'una biblioteca es';
const UNIDAD = 'la puerta se CONSUME';
const MUTANTES = [
  ['el aro no anota su puerta', 'app/focus/FocusTimer.jsx',
    "if (state.focusMode === 'foco' && typeof paceOrigenSesion === 'function') paceOrigenSesion('aro', !!aro);", 'void 0;',
    'eventos-origen.spec.js', ARO_PAUSA],
  ['el aro no distingue si hay plan', 'app/focus/FocusTimer.jsx',
    "paceOrigenSesion('aro', !!aro);", "paceOrigenSesion('aro', false);", 'eventos-origen.spec.js', ARO_PAUSA],
  ['la pausa no anota su puerta', 'app/main.jsx',
    "if (choice === 'breathe' || choice === 'extra' || choice === 'move') anotarPuerta('pausa', !!desdeMenu);", 'void 0;',
    'eventos-origen.spec.js', ARO_PAUSA],
  ['la pausa no sabe si el plato era del menú', 'app/breakmenu/BreakMenu.jsx',
    'onChoose(key, rutina || null, desdeMenu);', 'onChoose(key, rutina || null, false);', 'eventos-origen.spec.js', ARO_PAUSA],
  ['la parada se anota como barra lateral', 'app/ritmo/RitmoLinea.jsx',
    "detail: { kind: 'suggest', targetId: plato.id, parada: true }", "detail: { kind: 'suggest', targetId: plato.id }",
    'eventos-origen.spec.js', PARADA],
  ['la barra lateral no dice si su tarjeta es la pausa del menú', 'app/shell/Sidebar.jsx',
    'emitir(a.kind, { targetId: a.targetId, ritmo: !!a.ritmo })', 'emitir(a.kind, { targetId: a.targetId })',
    'eventos-origen.spec.js', PARADA],
  ['las tarjetas de la barra lateral no anotan puerta', 'app/main/main.eventos.jsx',
    "paceOrigenSesion(d.parada ? 'parada' : 'sidebar', d.parada ? true : !!d.ritmo);", 'void 0;', 'eventos-origen.spec.js', PARADA],
  ['abrir una biblioteca no es una puerta', 'app/main.jsx',
    "const abrirBiblioteca = (kind) => { anotarPuerta('biblioteca', false); setOpenLibrary(kind); };",
    'const abrirBiblioteca = (kind) => { setOpenLibrary(kind); };', 'eventos-origen.spec.js', BIBLIO],
  ['la puerta no se consume', 'app/state-events.jsx',
    '  paceOrigenPendiente = null;\n  const evento = window.makeEvent && window.makeEvent({\n    type: \'session.completed\',',
    '  const evento = window.makeEvent && window.makeEvent({\n    type: \'session.completed\',', 'eventos-origen.spec.js', UNIDAD],
  ['dentro de un Camino no manda «camino»', 'app/state-events.jsx',
    "const origen = d.inPath ? { origin: 'camino', fromMenu: false } : paceOrigenPendiente;", 'const origen = paceOrigenPendiente;',
    'eventos-origen.spec.js', UNIDAD],
  ['el esquema deja pasar cualquier origen', 'app/events/events-payloads.js',
    'origin: eventEnum(p.origin, EVENT_ORIGINS),', 'origin: typeof p.origin === \'string\' ? p.origin : null,',
    'eventos-origen.spec.js', UNIDAD],
  ['el esquema no lleva el origen', 'app/events/events-payloads.js',
    '      origin: eventEnum(p.origin, EVENT_ORIGINS),\n      fromMenu: p.fromMenu === true ? true : (p.fromMenu === false ? false : null),\n', '',
    'eventos-origen.spec.js', ARO_PAUSA],
];

const sh = (cmd) => {
  try { return { ok: true, out: execSync(cmd, { cwd: ROOT, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};

/* CONTROL: sin mutar, todo verde. Si no, un «muerde» no significaría nada. */
sh('node build-standalone.js');
if (!sh('npx playwright test tests/eventos-origen.spec.js --reporter=line').ok) {
  sh('git checkout -- PACE_standalone.html');
  throw new Error('CONTROL EN ROJO: el árbol sin mutar ya falla, el banco no puede medir nada');
}
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
