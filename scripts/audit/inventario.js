/* inventario.js — extrae los datos REALES de Mueve/Estira/registro/glifos para la
   matriz §19.2, cargando los archivos del proyecto tal cual (compilados con el
   mismo Babel del build) sobre un `window` falso. Nada de leer a ojo: si el dato
   esta en el arbol, lo saca de ahi.

   uso: node inventario.js > inventario.json
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = require('path').resolve(__dirname, '..', '..');
const babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));

/* React de mentira: solo hace falta para que los modulos con JSX evaluen; de
   ellos se quieren los DATOS, no el arbol de componentes. */
const React = new Proxy({
  createElement: (t, p, ...c) => ({ __el: t, props: p, children: c }),
  Fragment: 'Fragment',
  memo: f => f,
  useState: v => [v, () => {}], useEffect: () => {}, useRef: () => ({ current: null }),
  useMemo: (f) => f(), useCallback: f => f,
}, { get: (t, k) => (k in t ? t[k] : () => {}) });

const sandbox = { React, console, JSON, Math, Date, Object, Array, String, Number, Boolean, RegExp, parseInt, parseFloat, isNaN, setTimeout, clearTimeout };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.document = { createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, getElementById: () => null, querySelector: () => null };
vm.createContext(sandbox);

const FILES = [
  'app/custom/exercise-aliases.js',
  'app/custom/exercise-registry.js',
  'app/glyphs/exercise-glyphs.jsx',
  'app/move/move.data.js',
  'app/extra/ExtraModule.jsx',
  'app/paths/registry.js',
];

for (const f of FILES) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const out = babel.transformSync(src, {
    presets: [[require(path.join(ROOT, 'node_modules', '@babel', 'preset-react')), {}]],
    filename: f, configFile: false, babelrc: false,
  }).code;
  try { vm.runInContext(out, sandbox, { filename: f }); }
  catch (e) { console.error('[aviso] ' + f + ': ' + e.message); }
}

/* --- recoleccion --- */
const routines = [];
const push = (modulo, groupKey, group) => {
  for (const r of (group.items || [])) {
    routines.push({
      modulo, grupo: groupKey, grupoLabel: group.label, id: r.id, nombre: r.name,
      /* OJO: el campo de pago es `access: 'premium'`, no un booleano `premium`
         (s143: un recuento anterior dio «todas free» por leer el que no era). */
      access: r.access || 'free', premium: r.access === 'premium',
      level: r.level || null, intensity: r.intensity || null,
      /* requisitos de §18.3 — declarados en la RUTINA, no en el paso */
      desc: r.desc || '', min: r.min ?? null, tag: r.tag || null, code: r.code || null,
      position: r.position || null, equipment: r.equipment || null,
      requiresFloor: r.requiresFloor ?? null, safety: !!r.safety,
      steps: (r.steps || []).map(s => ({
        name: s.name, mode: s.mode || 'legacy', dur: s.dur ?? null, reps: s.reps ?? null,
        level: s.level || null, intensity: s.intensity || null,
        position: s.position || null, equipment: s.equipment || null,
        requiresFloor: s.requiresFloor ?? null,
        tieneInstruction: !!s.instruction, tieneTempo: !!s.tempo,
      })),
    });
  }
};
/* `MOVE_ROUTINES` es `var` (a proposito, s110) y si cae en el objeto global;
   `EXTRA_ROUTINES` es `const` dentro de ExtraModule.jsx => vive en el ambito
   lexico del contexto y hay que pedirlo por EXPRESION, no por propiedad. */
const pick = expr => { try { return vm.runInContext(expr, sandbox); } catch (e) { return null; } };
const MOVE = sandbox.MOVE_ROUTINES || pick('MOVE_ROUTINES') || {};
const EXTRA = pick('EXTRA_ROUTINES') || {};
for (const [k, g] of Object.entries(MOVE)) push('Mueve', k, g);
for (const [k, g] of Object.entries(EXTRA)) push('Estira', k, g);

const glyphKeys = Object.keys(sandbox.EXERCISE_GLYPHS || pick('EXERCISE_GLYPHS') || {});
/* OJO: `window.APPROVED` NO existe en el arbol (verificado con grep). Era un
   concepto de las decisiones de s84 que nunca llego a codigo: hoy la unica
   frontera real es "tiene entrada en EXERCISE_GLYPHS" contra "cae a DefaultGlyph". */
const approved = sandbox.APPROVED ? Object.keys(sandbox.APPROVED) : null;
const alias = sandbox.VISUAL_ALIAS || pick('VISUAL_ALIAS') || {};
const registry = sandbox.EXERCISE_REGISTRY || pick('EXERCISE_REGISTRY') || null;

console.log(JSON.stringify({
  globalesVistas: Object.keys(sandbox).filter(k => /GLYPH|ROUTIN|ALIAS|REGISTR|APPROVED|CAT_/i.test(k)),
  rutinas: routines.length,
  glyphKeys, approved, alias, registry, aliasKeys: Object.keys(alias),
  registryTipo: registry ? (Array.isArray(registry) ? 'array:' + registry.length : 'obj:' + Object.keys(registry).length) : null,
  routines,
}, null, 1));
