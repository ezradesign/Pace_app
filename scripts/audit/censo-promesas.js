/* PACE · CENSO DE PROMESAS DE LAS RUTINAS (auditoría del 16 oct. 2026)
 * =====================================================================
 * Uso: node scripts/audit/censo-promesas.js
 *
 * Ez encontró que la 2.ª ronda de «Gemelos subrepticios» dice «Más lentas
 * ahora» con el mismo ritmo que la 1.ª y menos repeticiones. Este censo busca
 * lo mismo en todas las rutinas de Mueve y Estira, en castellano y en inglés:
 * lo que el TEXTO de cada paso promete frente a lo que hacen sus DATOS.
 *   - «más lento», «despacio», «slower»: el ritmo (tempo) tiene que ser más
 *     largo que el del paso anterior del mismo ejercicio;
 *   - «más rápido», «a buen ritmo», «faster»: más corto o igual;
 *   - «N segundos», «aguanta N s», «hold for N»: tiene que salir en sus datos
 *     (dur, tempo.hold, la transición);
 *   - «N veces / repeticiones / times»: tiene que ser `reps`;
 *   - «cada lado», «each side»: el paso tiene que ser perSide (o hablar de
 *     cambiar de lado en un paso con reloj);
 *   - un número en castellano que no está en inglés, o al revés.
 * Recuerda: Mueve vive en app/move/move.data.js con ids `extra.*` y Estira en
 * app/extra/extra.data*.js con ids `move.*` (CLAUDE.md). Apunta, no falla.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..', '..');
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ['app/move/move.data.js', 'app/extra/extra.data.js', 'app/extra/extra.data.piernas.js']) {
  vm.runInContext(fs.readFileSync(path.join(raiz, f), 'utf8'), ctx, { filename: f });
}
const en = {};
for (const f of fs.readdirSync(path.join(raiz, 'app/i18n/content'))) {
  const src = fs.readFileSync(path.join(raiz, 'app/i18n/content', f), 'utf8');
  for (const m of src.matchAll(/^\s*'([^']+)':\s*'((?:[^'\\]|\\.)*)'/gm)) en[m[1]] = m[2].replace(/\\'/g, "'");
}

const MODULOS = [['Mueve', ctx.window.MOVE_ROUTINES || ctx.MOVE_ROUTINES], ['Estira', ctx.window.EXTRA_ROUTINES || ctx.EXTRA_ROUTINES]];
const tempoDe = (st) => st.tempo ? (st.tempo.down || 0) + (st.tempo.hold || 0) + (st.tempo.up || 0) : null;
const segundosDe = (st) => {
  const s = new Set();
  if (st.dur) s.add(st.dur);
  if (st.tempo) { for (const k of ['down', 'hold', 'up']) if (st.tempo[k]) s.add(st.tempo[k]); }
  if (st.transition && st.transition.seconds) s.add(st.transition.seconds);
  if (typeof st.setup === 'number') s.add(st.setup);
  return s;
};
const textos = (id, i, st) => {
  const ins = st.instruction || {};
  const es = [st.name, ins.setup, ins.action, ins.care, st.cue].filter(Boolean).join(' · ');
  const k = id + '.s' + i;
  const ing = [en[k + '.name'], en[k + '.instruction.setup'], en[k + '.instruction.action'], en[k + '.instruction.care'], en[k + '.cue']].filter(Boolean).join(' · ');
  return { es, en: ing };
};

function censo() {
const hallazgos = [];
let pasos = 0, rutinas = 0;
for (const [modulo, cat] of MODULOS) {
  for (const grupo of Object.values(cat || {})) {
    for (const r of (grupo.items || [])) {
      if (!r.steps) continue;
      rutinas++;
      r.steps.forEach((st, i) => {
        pasos++;
        const t = textos(r.id, i, st);
        const dice = (re) => re.test(t.es) || re.test(t.en);
        const apunta = (que, detalle) => hallazgos.push({ modulo, id: r.id, rutina: r.name, paso: i + 1 + ' · ' + st.name, que, detalle, es: t.es, en: t.en });
        const previo = r.steps.slice(0, i).reverse().find(p => p.name === st.name && p.mode === st.mode) || null;
        // ritmo: más lento / más rápido
        if (dice(/m[aá]s lent|m[aá]s despacio|slower|more slowly/i)) {
          const ahora = tempoDe(st), antes = previo && tempoDe(previo);
          if (ahora == null) apunta('promete más lento y el paso no tiene ritmo', 'mode ' + st.mode + ', dur ' + st.dur);
          else if (antes != null && ahora <= antes) apunta('promete más lento y no lo es', 'ritmo ' + ahora + ' s por repetición; antes ' + antes + ' s' + (st.reps && previo.reps ? ' · reps ' + st.reps + ' frente a ' + previo.reps : ''));
        }
        if (dice(/m[aá]s r[aá]pid|faster|more quickly/i)) {
          const ahora = tempoDe(st), antes = previo && tempoDe(previo);
          if (ahora != null && antes != null && ahora >= antes) apunta('promete más rápido y no lo es', 'ritmo ' + ahora + ' s; antes ' + antes + ' s');
        }
        if (dice(/\b(despacio|lentamente|slowly|slow)\b/i) && st.mode === 'reps' && st.tempo && (st.tempo.down || 0) <= 1 && (st.tempo.up || 0) <= 1)
          apunta('pide despacio con un ritmo de 1 s', 'tempo ' + JSON.stringify(st.tempo));
        // segundos
        const seg = segundosDe(st);
        for (const lado of ['es', 'en']) {
          for (const m of t[lado].matchAll(/(\d+)\s*(?:-|a|to)?\s*(\d+)?\s*(s|seg|segundos|segundo|seconds|second|sec)\b/gi)) {
            const n = +m[1], n2 = m[2] ? +m[2] : null;
            if (!seg.has(n) && !(n2 && seg.has(n2))) apunta('dice ' + m[0].trim() + ' (' + lado + ') y los datos no', 'datos: ' + [...seg].join(', ') + ' s');
          }
          for (const m of t[lado].matchAll(/(\d+)\s*(veces|repeticiones|reps|times|repetitions)\b/gi)) {
            const n = +m[1];
            const reps = typeof st.reps === 'object' ? [st.reps.min, st.reps.target, st.reps.max] : [st.reps];
            if (!reps.includes(n)) apunta('dice ' + m[0] + ' (' + lado + ') y reps no', 'reps ' + JSON.stringify(st.reps));
          }
        }
        // lados
        if (dice(/cada lado|cada pierna|cada brazo|each side|each leg|each arm/i) && st.mode !== 'perSide')
          apunta('dice «cada lado» y el paso no cambia de lado', 'mode ' + st.mode);
        // números que no están en los dos idiomas
        const nums = (s) => (s.match(/\d+/g) || []).sort().join(',');
        if (t.en && nums(t.es) !== nums(t.en)) apunta('los números no coinciden entre idiomas', 'es [' + nums(t.es) + '] · en [' + nums(t.en) + ']');
        if (!t.en) apunta('sin texto en inglés', '');
      });
    }
  }
}
return { rutinas, pasos, hallazgos };
}

/* Lo que la suite no deja pasar (tests/rutinas-promesas.spec.js). Las cuentas
   dentro de un paso con reloj («10 reps» en 40 s) son una guía, no una promesa. */
const PROHIBIDO = ['promete más lento y no lo es', 'promete más lento y el paso no tiene ritmo',
  'promete más rápido y no lo es', 'pide despacio con un ritmo de 1 s', 'los números no coinciden entre idiomas',
  'sin texto en inglés'];
module.exports = { censo, PROHIBIDO };
if (require.main === module) {
  const salida = censo();
  const { rutinas, pasos, hallazgos } = salida;
  if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(salida, null, 1)); }
  else {
    console.log(rutinas + ' rutinas y ' + pasos + ' pasos mirados; ' + hallazgos.length + ' hallazgos.\n');
    for (const h of hallazgos) console.log('- ' + h.modulo + ' · ' + h.id + ' · paso ' + h.paso + ': ' + h.que + ' (' + h.detalle + ')\n    es: ' + h.es.slice(0, 160) + '\n    en: ' + h.en.slice(0, 160));
  }
}
