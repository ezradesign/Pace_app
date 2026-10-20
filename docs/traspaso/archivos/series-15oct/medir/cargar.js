/* Carga el catálogo real y la regla de «A tu ritmo» en el sandbox del verify (un `window`
   de mentira y una IIFE por archivo), para medir sin abrir la app. Lo usan pozos.js y
   regla-nueva.js, desde la raíz del repo:
     node docs/traspaso/archivos/series-15oct/medir/pozos.js
     node docs/traspaso/archivos/series-15oct/medir/regla-nueva.js
   Escriben su resultado en esta carpeta (pozos.json, regla-nueva.json), que no se versiona. */
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../../../../..');
/* Un worktree no trae node_modules: se usan los de la carpeta principal. */
const MODS = [path.join(ROOT, 'node_modules'), path.resolve(ROOT, '../../../node_modules')].find((p) => fs.existsSync(path.join(p, '@babel', 'core')));
const babel = require(path.join(MODS, '@babel', 'core'));
const { nuevoSandbox, cargar } = require(path.join(ROOT, 'scripts', 'verify.sandbox.js'));

/* `opts.premium`: lo de pago abierto (true, como hasta v1) o cerrado (false, como desde v1
   sin PACE completo). `opts.vetadas`: { id: true } de lo que se dijo que no ayudó. */
function sandbox(opts) {
  opts = opts || {};
  const sb = nuevoSandbox();
  /* `cargar` busca preset-react en ROOT/node_modules; aquí se le da la ruta buena. */
  const ctx = { ROOT, babel: { transformSync: (src, o) => babel.transformSync(src, Object.assign({}, o, {
    presets: [[path.join(MODS, '@babel', 'preset-react'), {}]] })) } };
  const pares = [
    ['app/breathe/BreatheLibrary.jsx', { __B: 'BREATHE_ROUTINES' }],
    ['app/move/move.data.js', { __M: 'MOVE_ROUTINES' }],
    ['app/extra/extra.data.js', { __E1: 'EXTRA_ROUTINES' }],
    ['app/extra/extra.data.piernas.js', { __E: 'window.EXTRA_ROUTINES' }],
    ['app/ui/library-rules.js'],
    ['app/ritmo/ritmo.regla.js'],
    ['app/ritmo/ritmo.semana.js'],
  ];
  pares.forEach(([f, e]) => { const err = cargar(ctx, sb, f, e); if (err) console.error('ERR', err); });
  sb.MOVE_ROUTINES = sb.MOVE_ROUTINES || sb.__M;
  sb.EXTRA_ROUTINES = sb.EXTRA_ROUTINES || sb.__E;
  sb.BREATHE_ROUTINES = sb.BREATHE_ROUTINES || sb.__B;
  const todas = {};
  [sb.MOVE_ROUTINES, sb.EXTRA_ROUTINES, sb.BREATHE_ROUTINES].forEach((cat) => Object.keys(cat || {}).forEach((g) => ((cat[g] || {}).items || []).forEach((r) => { todas[r.id] = r; })));
  sb.__todas = todas;
  sb.canAccessRoutine = (id) => { const r = todas[id]; if (!r) return true; if (r.access !== 'premium') return true; return !!opts.premium; };
  sb.breakVetadas = () => opts.vetadas || {};
  sb.todayISO = () => opts.hoy || '2026-10-14';
  sb.getState = () => ({});
  /* ritmoPozos y ritmoMenu viven en state-ritmo.jsx */
  const err = cargar(ctx, sb, 'app/state-ritmo.jsx');
  if (err) console.error('ERR', err);
  return sb;
}
module.exports = { sandbox, ROOT };
