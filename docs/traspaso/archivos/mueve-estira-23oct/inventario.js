// Inventario de Mueve y Estira: cada rutina con sus ejercicios, su dibujo y lo que comparte con otras.
// Uso: node inventario.js <raíz del repo> <salida.json>
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = process.argv[2];
const SALIDA = process.argv[3];
const ctx = { window: {}, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);
for (const f of ['app/move/move.data.js', 'app/extra/extra.data.js', 'app/extra/extra.data.piernas.js',
  'app/glyphs/exercise-masks.js', 'app/custom/exercise-aliases.js']) {
  vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
}
const W = ctx.window;
const svg = new Set();
for (const f of ['app/glyphs/exercise-glyphs.jsx', 'app/glyphs/exercise-glyphs.extra.jsx']) {
  for (const m of fs.readFileSync(path.join(RAIZ, f), 'utf8').matchAll(/^\s*'([^']+)':\s*\(\{\s*size/gm)) svg.add(m[1]);
}
function dibujo(nombre) {
  const id = W.resolveVisualId ? W.resolveVisualId(nombre) : nombre;
  if (W.EXERCISE_MASKS[nombre] || W.EXERCISE_MASKS[id]) return { tipo: 'dibujo', id };
  if (svg.has(nombre) || svg.has(id)) return { tipo: 'svg', id };
  return { tipo: 'generico', id };
}

// Mueve vive en MOVE_ROUTINES (ids extra.*); Estira en EXTRA_ROUTINES (ids move.*). Los ids van cruzados.
const modulos = { Mueve: W.MOVE_ROUTINES, Estira: W.EXTRA_ROUTINES };
const rutinas = [];
for (const [modulo, cats] of Object.entries(modulos)) {
  for (const [catId, cat] of Object.entries(cats)) {
    for (const r of cat.items || []) {
      const pasos = (r.steps || []).filter((s) => s.mode !== 'rest' && s.name !== 'Descanso');
      const ejercicios = [];
      for (const s of pasos) {
        const previo = ejercicios.find((e) => e.nombre === s.name);
        if (previo) { previo.series += 1; continue; }
        const ins = s.instruction || {};
        ejercicios.push({
          nombre: s.name, modo: s.mode || 'legacy', reps: typeof s.reps === 'object' ? s.reps.target : s.reps,
          dur: s.dur, series: 1, dibujo: dibujo(s.name),
          texto: [ins.setup, ins.action || s.cue].filter(Boolean).join(' '),
          colocacion: ins.setup || '', como: ins.action || s.cue || '', cuidado: ins.care || '',
        });
      }
      rutinas.push({
        modulo, categoria: cat.label, catId, id: r.id, titulo: r.name, desc: r.desc, min: r.min,
        acceso: r.access || 'free', posicion: r.position || [], material: r.equipment || [],
        suelo: !!r.requiresFloor, ejercicios,
      });
    }
  }
}

// Lo que se repite: cuántas rutinas usan cada ejercicio, y parejas de rutinas que comparten la mitad o más.
const usos = {};
for (const r of rutinas) for (const e of r.ejercicios) (usos[e.nombre] = usos[e.nombre] || []).push(r.modulo + ' · ' + r.titulo);
const parejas = [];
for (let i = 0; i < rutinas.length; i++) for (let j = i + 1; j < rutinas.length; j++) {
  const a = new Set(rutinas[i].ejercicios.map((e) => e.nombre));
  const b = new Set(rutinas[j].ejercicios.map((e) => e.nombre));
  const comunes = [...a].filter((x) => b.has(x));
  const menor = Math.min(a.size, b.size);
  if (comunes.length && comunes.length / menor >= 0.5) {
    parejas.push({ a: rutinas[i].modulo + ' · ' + rutinas[i].titulo, b: rutinas[j].modulo + ' · ' + rutinas[j].titulo,
      comunes, parte: Math.round((100 * comunes.length) / menor) });
  }
}
parejas.sort((x, y) => y.parte - x.parte || y.comunes.length - x.comunes.length);
fs.writeFileSync(SALIDA, JSON.stringify({ rutinas, usos, parejas }, null, 1));
const n = (m) => rutinas.filter((r) => r.modulo === m).length;
const ej = new Set(rutinas.flatMap((r) => r.ejercicios.map((e) => e.nombre)));
console.log('Mueve', n('Mueve'), 'rutinas · Estira', n('Estira'), 'rutinas ·', ej.size, 'ejercicios distintos ·',
  parejas.length, 'parejas que comparten la mitad o más');
console.log('Dibujos:', JSON.stringify(rutinas.flatMap((r) => r.ejercicios).reduce((o, e) => (o[e.dibujo.tipo] = (o[e.dibujo.tipo] || 0) + 1, o), {})));
