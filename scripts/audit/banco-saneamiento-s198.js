/* PACE · BANCO DE MUTANTES del saneamiento (s198 · v0.131.0)
 * ==========================================================
 * Cada mutante deshace UNA pieza de lo que arreglo s198 —el saneado al cargar,
 * cada reparacion anidada, el rescate, el import, el borrado total, la pila de
 * dialogos, el foco que entra, la trampa de Tab, el foco que vuelve, los atajos,
 * la sesion que toma el foco y la pantalla encendida—, recompila, corre la
 * prueba que deberia cazarlo y restaura byte a byte.
 *
 * Lo que NO se muta, dicho (precedente: transicion-biblioteca, s174):
 *  · `sessionKeyOnControl` solo cuenta controles DENTRO de la sesion. Es defensa
 *    en profundidad: desde que la sesion atrapa el foco (Dialogo.jsx) no hay forma
 *    de dejar el foco detras con el teclado, asi que su mutante VIVE con razon.
 *  · El retraso de 1,5 s al soltar la pantalla: el relevo preparacion -> ejercicio
 *    destruye y crea en la MISMA pasada de efectos y la cuenta ya lo absorbe. Se
 *    queda por si un relevo futuro pasa por un frame vacio.
 *  · `pantalla={false}` en PathFocusStep: el Camino no esta en esta suite; el
 *    aserto «el Foco no» mira el Foco de la home, que nunca paso por SessionShell.
 *  · La excepcion de la trampa de Tab para otro dialogo (el «¿Salir del Camino?»):
 *    misma razon, el Camino no esta en esta suite.
 *
 * v0.132.0 suma los de la red de error y la fila del rescate (`tests/red-de-error.spec.js`).
 * Lo que no se muta de ellos: la red SILENCIOSA de los avisos y del vigilante de
 * secretos (provocar que fallen exigiria romper el catalogo de logros a proposito).
 *
 * Uso (con el servidor estatico en 8765, el de la suite):
 *   node scripts/audit/banco-saneamiento-s198.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const ESTADO = 'tests/estado-saneado.spec.js';
const TECLADO = 'tests/teclado-foco.spec.js';
const RED = 'tests/red-de-error.spec.js';

const MUTANTES = [
  /* ---- el estado ---- */
  ['loadState deja de sanear', 'app/state-core.jsx',
    '    const saneado = paceSanearEstado(JSON.parse(raw), defaultState);',
    '    const saneado = { estado: JSON.parse(raw), reparados: [] };', ESTADO, 'weeklyStats roto'],
  ['el saneador no repara los objetos de arriba', 'app/state-core.sanea.js',
    '      if (!paceEsObjetoPlano(v)) reparar(k, paceCopiaDefecto(def));',
    '      if (false) reparar(k, paceCopiaDefecto(def));', ESTADO, 'weeklyStats roto'],
  ['una serie de la semana rota se queda', 'app/state-core.sanea.js',
    '      if (s in ws && !paceSerieValida(ws[s])) { ws[s] = [0, 0, 0, 0, 0, 0, 0]; tocada = true; }',
    '      if (false) { ws[s] = [0, 0, 0, 0, 0, 0, 0]; tocada = true; }', ESTADO, 'en puro'],
  ['el agua rota se queda', 'app/state-core.sanea.js',
    "    if (typeof w.today !== 'number' || !isFinite(w.today) || typeof w.goal !== 'number' || !isFinite(w.goal)) {",
    '    if (false) {', ESTADO, 'en puro'],
  ['la racha rota se queda', 'app/state-core.sanea.js',
    "    if (typeof st.current !== 'number' || typeof st.longest !== 'number') {",
    '    if (false) {', ESTADO, 'en puro'],
  ['los Caminos rotos se quedan', 'app/state-core.sanea.js',
    "    if (pt) reparar('paths', p);",
    "    if (false) reparar('paths', p);", ESTADO, 'en puro'],
  ['un dia caido no re-agrega meses ni años', 'app/state-core.sanea.js',
    '      if (diasTocados) e._historyRecalculated_v0_28_8 = false;',
    '', ESTADO, 'en puro'],
  ['un numero escrito como texto se tira', 'app/state-core.sanea.js',
    '        reparar(k, isFinite(n) ? n : def);',
    '        reparar(k, def);', ESTADO, 'en puro'],
  ['un `ritmo` que no es objeto se queda', 'app/state-core.sanea.js',
    "    if (FORMAS_AJENAS[k] === 'objeto' && k in e && e[k] !== undefined && !paceEsObjetoPlano(e[k])) {",
    '    if (false) {', ESTADO, 'en puro'],
  ['sin rescate', 'app/state-core.jsx',
    "    if (typeof paceGuardarRescate === 'function') paceGuardarRescate(raw, e);",
    '', ESTADO, 'rescate'],
  ['el export no lleva el rescate', 'app/tweaks/TweaksData.jsx',
    '    if (rescate) payload.rescate = rescate;',
    '    if (false) payload.rescate = rescate;', ESTADO, 'rescate'],
  ['el import escribe el backup tal cual', 'app/tweaks/TweaksData.jsx',
    '        const incoming = paceSanearEstado(bruto, defaultState).estado;',
    '        const incoming = bruto;', ESTADO, 'importa SANEADO'],
  ['borrar todo solo borra el estado', 'app/state-core.jsx',
    "      if (k && k.indexOf('pace.') === 0 && k.indexOf('pace.events.') !== 0) sobrantes.push(k);",
    '      if (false) sobrantes.push(k);', ESTADO, 'Borrar todos'],
  /* ---- dialogos y foco ---- */
  ['Escape lo atiende el primero que lo oye, no el de arriba', 'app/ui/Dialogo.jsx',
    '      if (e.__paceDialogoAtendido || !paceDialogoArriba(yo)) return;',
    '      if (e.__paceDialogoAtendido) return;', TECLADO, 'dialogo de ARRIBA'],
  ['el foco no entra al abrir', 'app/ui/Dialogo.jsx',
    '    if (cont && !cont.contains(document.activeElement)) {',
    '    if (false) {', TECLADO, 'un modal es un dialogo'],
  ['sin trampa de Tab', 'app/ui/Dialogo.jsx',
    "      if (e.key !== 'Tab' || !cont) return;",
    '      if (true) return;', TECLADO, 'un modal es un dialogo'],
  ['el foco no vuelve a quien abrio', 'app/ui/Dialogo.jsx',
    '      if (libre && paceFocoDevolvible(previo)) {',
    '      if (false) {', TECLADO, 'un modal es un dialogo'],
  ['el Modal sin rol de dialogo', 'app/ui/Primitives.jsx',
    '        role="dialog"\n        aria-modal="true"',
    '        aria-modal="true"', TECLADO, 'un modal es un dialogo'],
  ['el Modal sin nombre', 'app/ui/Primitives.jsx',
    '        aria-labelledby={title ? tituloId : undefined}',
    '        aria-labelledby={undefined}', TECLADO, 'un modal es un dialogo'],
  ['el onboarding sin la pieza de dialogo', 'app/onboarding/Onboarding.jsx',
    '  usePaceDialogo(raizRef, open);',
    '', TECLADO, 'onboarding atrapa'],
  /* ---- atajos ---- */
  ['los atajos responden con Ctrl', 'app/main.jsx',
    '      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.defaultPrevented) return;',
    '      if (e.isComposing || e.defaultPrevented) return;', TECLADO, 'no abre Estadisticas'],
  ['los atajos atraviesan sesiones y pantallas completas', 'app/main.jsx',
    "      if (document.querySelector('[data-pace-session-root], [aria-modal=\"true\"]:not([data-pace-modal-card])')) return;",
    '', TECLADO, 'Estadisticas|atraviesan'],
  ['Ajustes sin Escape', 'app/tweaks/TweaksPanel.jsx',
    "      if (e.key !== 'Escape' || e.__paceDialogoAtendido) return;",
    '      return;', TECLADO, 'Escape cierra Ajustes'],
  /* ---- sesiones ---- */
  ['la sesion no toma el foco ni lo atrapa', 'app/ui/SessionShell.jsx',
    '  usePaceDialogo(rootRef, true);',
    '', TECLADO, 'Continua'],
  ['la sesion no pide la pantalla', 'app/ui/SessionShell.jsx',
    '    return paceMantenerPantalla();',
    '    return undefined;', TECLADO, 'pantalla'],
  ['la pantalla no se suelta nunca', 'app/ui/pantalla.js',
    '    _paceLuz.cuenta = Math.max(0, _paceLuz.cuenta - 1);',
    '', TECLADO, 'pantalla'],
  /* ---- v0.132.0 · la red de error (A2) y la fila del rescate (B2) ---- */
  ['la red de una parte no pinta su aviso', 'app/ui/RedDeError.jsx',
    '    return <PaceRedParte nombre={this.props.nombre} onCerrar={this.cerrar} />;',
    '    return null;', RED, 'Estadisticas falla'],
  ['ninguna superficie lleva su red', 'app/main.jsx',
    '    <PaceRed modo="parte" nombre={nombre} abierto={abierto} onCerrar={cerrar}>{hijo}</PaceRed>',
    '    hijo', RED, 'Estadisticas falla'],
  ['una superficie cerrada que falla avisa igual', 'app/ui/RedDeError.jsx',
    '    if (this.props.abierto === false) return null;',
    '', RED, 'CERRADA'],
  ['la red no se reinicia al abrir', 'app/ui/RedDeError.jsx',
    '    if (this.state.error && prev.abierto !== this.props.abierto) this.setState({ error: null });',
    '', RED, 'CERRADA'],
  ['sin red global', 'PACE.html',
    '        root.render(<PaceRed modo="global"><PaceApp /></PaceRed>);',
    '        root.render(<PaceApp />);', RED, 'pantalla global'],
  ['la copia de la pantalla global no baja', 'app/ui/RedDeError.jsx',
    "if (typeof paceDescargarCopia === 'function') paceDescargarCopia();",
    '', RED, 'pantalla global'],
  ['sin fila del rescate', 'app/tweaks/TweaksData.jsx',
    '      {rescate && (',
    '      {false && (', RED, 'rescate'],
  ['DECLARADO · Espacio cuenta como control un boton de detras', 'app/ui/SessionShell.jsx',
    "  return !!(ctl && (ctl.closest('[data-pace-session-root]') || ctl.closest('[role=\"dialog\"]')));",
    '  return !!ctl;', TECLADO, 'Continua'],
];

const sh = (cmd) => {
  try { return { ok: true, out: execSync(cmd, { cwd: ROOT, stdio: 'pipe', maxBuffer: 1 << 26 }).toString() }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
};

sh('node build-standalone.js');
if (!sh('npx playwright test ' + ESTADO + ' ' + TECLADO + ' ' + RED + ' --reporter=line').ok) {
  sh('git checkout -- PACE_standalone.html');
  throw new Error('CONTROL EN ROJO: el arbol sin mutar ya falla, el banco no puede medir nada');
}
console.log('control sin mutar -> verde');

/* PACE_BANCO_SOLO=<regex> corre solo los mutantes cuyo nombre case (para repetir uno). */
const SOLO = process.env.PACE_BANCO_SOLO ? new RegExp(process.env.PACE_BANCO_SOLO) : null;
const resultados = [];
for (const [nombre, rel, antes, despues, spec, grep] of MUTANTES.filter((m) => !SOLO || SOLO.test(m[0]))) {
  const f = path.join(ROOT, rel);
  const original = fs.readFileSync(f);
  const texto = original.toString('utf8');
  const crlf = texto.includes('\r\n');
  const buscado = crlf ? antes.replace(/\n/g, '\r\n') : antes;
  const puesto = crlf ? despues.replace(/\n/g, '\r\n') : despues;
  if (texto.split(buscado).length !== 2) { resultados.push([nombre, 'NO APLICA (el texto no es unico)']); console.log(nombre + ' -> NO APLICA'); continue; }
  fs.writeFileSync(f, texto.replace(buscado, () => puesto));
  try {
    const b = sh('node build-standalone.js');
    if (!b.ok) { resultados.push([nombre, 'EL BUILD FALLA']); continue; }
    const t = sh('npx playwright test ' + spec + ' -g "' + grep + '" --reporter=line');
    resultados.push([nombre, t.ok ? 'VIVE (la prueba sigue en verde)' : 'muerde']);
  } finally {
    fs.writeFileSync(f, original);
    if (!fs.readFileSync(f).equals(original)) throw new Error('NO SE RESTAURO ' + rel);
  }
  console.log(resultados[resultados.length - 1].join(' -> '));
}
sh('node build-standalone.js');
sh('git checkout -- PACE_standalone.html');
const declarados = resultados.filter((r) => r[0].indexOf('DECLARADO') === 0);
const medidos = resultados.filter((r) => r[0].indexOf('DECLARADO') !== 0);
const vivos = medidos.filter((r) => r[1] !== 'muerde');
console.log('\n' + (medidos.length - vivos.length) + ' de ' + medidos.length + ' muerden'
  + (vivos.length ? ' · VIVOS: ' + vivos.map((r) => r[0]).join(' | ') : '')
  + (declarados.length ? ' · declarados: ' + declarados.map((r) => r[0] + ' = ' + r[1]).join(' | ') : ''));
