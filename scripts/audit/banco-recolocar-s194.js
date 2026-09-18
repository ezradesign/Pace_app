/* PACE · BANCO DE MUTANTES de «recolocar a mitad de día» (s194)
 * ==============================================================
 * Misma mecánica que los bancos de s192/s193/s194-origen. Cada mutante rompe UNA
 * pieza de la recolocación —el disparo al empezar el bloque, el «desde ahora», el
 * bloque forzado, la historia congelada, el hueco punteado, la cadencia, la
 * numeración, el presupuesto, los platos servidos, las claves, el agua, la
 * comida hecha y el cruce de la comida— recompila y corre la prueba que debería
 * cazarlo, y restaura el archivo byte a byte. LA PRIMERA PASADA DIO 13 DE 14: el
 * vivo era `it.de` (el total del día en cada bloque), que nadie leía desde s192.
 * Se quitó el campo, no se añadió un aserto (lección de s190).
 *
 * NO MUTA, declarado: `cambios.primerBloque = Number(minutos) || p.actual.dur`
 * (en la suite el aro y el plan coinciden, 45 y 45: ninguna prueba lo distingue)
 * y la rehidratación de la rutina de un plato congelado (la prueba solo pide que
 * haya nombre).
 *
 * Uso (con el servidor estático en 8765):
 *   node scripts/audit/banco-recolocar-s194.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');

const RECOLOCA = 'recoloca el resto del día';
const ANTES = 'llegar antes es empezar';
const REGLA = 'la regla con previos';
const MUTANTES = [
  ['empezar el bloque no recoloca', 'app/state-ritmo.jsx',
    'if (p && p.actual && t !== p.actual.desde) {', 'if (false) {', 'ritmo.spec.js', RECOLOCA],
  ['recolocando, el día sigue esperando a tu hora de inicio', 'app/ritmo/ritmo.regla.js',
    'var desde = P0 ? ahora : Math.max(inicio, ahora);', 'var desde = Math.max(inicio, ahora);', 'ritmo.spec.js', ANTES],
  ['el bloque que acaba de empezar no respeta al aro', 'app/ritmo/ritmo.regla.js',
    'if (P0 && P0.primerBloque && n === primeros) {', 'if (false) {', 'ritmo.spec.js', REGLA],
  ['lo hecho no se congela', 'app/state-ritmo.jsx',
    'cambios.pasado = ritmoCongelar(p.m.items.slice(0, p.m.items.indexOf(p.actual)));', 'cambios.pasado = [];', 'ritmo.spec.js', RECOLOCA],
  ['el retraso no se pinta', 'app/state-ritmo.jsx',
    "var hueco = m.desde > finPasado ? [{ tipo: 'libre', desde: finPasado, dur: m.desde - finPasado }] : [];", 'var hueco = [];',
    'ritmo.spec.js', RECOLOCA],
  ['la cadencia de la pausa larga vuelve a empezar', 'app/ritmo/ritmo.regla.js',
    'enMitad = P0 ? P0.pausas || 0 : 0', 'enMitad = 0', 'ritmo.spec.js', REGLA],
  ['los bloques se numeran desde uno', 'app/ritmo/ritmo.regla.js',
    'n = P0 ? P0.bloques || 0 : 0;', 'n = 0;', 'ritmo.spec.js', REGLA],
  ['el presupuesto de foco olvida lo hecho', 'app/ritmo/ritmo.regla.js',
    'hecho = P0 ? P0.foco || 0 : 0,', 'hecho = 0,', 'ritmo.spec.js', REGLA],
  ['se repiten los platos ya servidos', 'app/ritmo/ritmo.regla.js',
    "if (P0) (P0.usados || []).forEach(function (id) { usados[id] = true; });", '', 'ritmo.spec.js', REGLA],
  ['las claves de «otra» vuelven a empezar', 'app/ritmo/ritmo.regla.js',
    'var i = P0 ? P0.claves || 0 : 0;', 'var i = 0;', 'ritmo.spec.js', REGLA],
  ['el agua olvida los vasos servidos', 'app/ritmo/ritmo.regla.js',
    'meta - (P0 ? P0.vasos || 0 : 0) - comidas.length - 1', 'meta - comidas.length - 1', 'ritmo.spec.js', REGLA],
  ['la comida hecha se sirve otra vez', 'app/ritmo/ritmo.regla.js',
    'var falta = !(P0 && P0.comidaHecha) && desde < comeA && comeA < finTrabajo;', 'var falta = desde < comeA && comeA < finTrabajo;',
    'ritmo.spec.js', REGLA],
  ['comer retrocede el reloj tras un bloque que cruza la hora', 'app/ritmo/ritmo.regla.js',
    't = Math.max(t, comeA);', 't = comeA;', 'ritmo.spec.js', REGLA],
];

const sh = (cmd) => {
  try { return { ok: true, out: execSync(cmd, { cwd: ROOT, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};

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
