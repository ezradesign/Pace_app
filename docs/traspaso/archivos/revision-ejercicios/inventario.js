/* Inventario de Mueve (ids extra.*) y Estira (ids move.*), paso a paso, para la revisión
   del 16 oct. 2026. Uso: node docs/traspaso/archivos/revision-ejercicios/inventario.js > inventario.md */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const raiz = path.join(__dirname, '..', '..', '..', '..');
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ['app/move/move.data.js', 'app/extra/extra.data.js', 'app/extra/extra.data.piernas.js']) {
  vm.runInContext(fs.readFileSync(path.join(raiz, f), 'utf8'), ctx, { filename: f });
}
const libs = vm.runInContext('({ mueve: typeof MOVE_ROUTINES !== "undefined" ? MOVE_ROUTINES : window.MOVE_ROUTINES, estira: typeof EXTRA_ROUTINES !== "undefined" ? EXTRA_ROUTINES : window.EXTRA_ROUTINES })', ctx);
const out = [];
for (const [lib, grupos] of Object.entries(libs)) {
  out.push(`# ${lib}`);
  for (const [g, grupo] of Object.entries(grupos)) {
    out.push(`## ${g} · ${grupo.label}`);
    for (const r of grupo.items) {
      const meta = [r.min + ' min', (r.position || []).join('/'), (r.equipment || []).join('/') || '-', r.requiresFloor ? 'suelo' : '', r.intensity, r.level, r.access === 'premium' ? 'PREMIUM' : ''].filter(Boolean).join(' · ');
      out.push(`### ${r.id} · ${r.name} (${meta})`);
      out.push(`> ${r.desc || ''}`);
      r.steps.forEach((s, i) => {
        const ins = s.instruction || {};
        const t = s.tempo ? ` tempo ${s.tempo.down}/${s.tempo.hold}/${s.tempo.up}` : '';
        const cant = s.mode === 'reps' ? `${typeof s.reps === 'object' ? JSON.stringify(s.reps) : s.reps} reps${t}` : `${s.dur} s`;
        const tr = s.transition ? ` (+${s.transition.seconds} s cambio)` : '';
        out.push(`${i + 1}. **${s.name}** [${s.mode}${s.restKind ? ':' + s.restKind : ''}] ${cant}${tr}${s.setup && s.setup.mode ? ' ready' : ''}`);
        for (const k of ['setup', 'action', 'care']) if (ins[k]) out.push(`   - ${k}: ${ins[k]}`);
        if (s.cue && !ins.action) out.push(`   - cue: ${s.cue}`);
      });
    }
  }
}
process.stdout.write(out.join('\n') + '\n');
