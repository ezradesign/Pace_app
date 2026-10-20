/* Las rutinas que caben en las pausas, gratis y con PACE completo, con su zona y si son de pie.
   Uso, desde la raíz del repo:  node docs/traspaso/archivos/dias-disenados/medir/pozos-zonas.js */
'use strict';
const path = require('path');
const fs = require('fs');
const { sandbox, ROOT } = require('../../series-15oct/medir/cargar.js');
const MODS = [path.join(ROOT, 'node_modules'), path.resolve(ROOT, '../../../node_modules')].find((p) => fs.existsSync(path.join(p, '@babel', 'core')));
const babel = require(path.join(MODS, '@babel', 'core'));
const { cargar } = require(path.join(ROOT, 'scripts', 'verify.sandbox.js'));
const ctx = { ROOT, babel: { transformSync: (src, o) => babel.transformSync(src, Object.assign({}, o, { presets: [[path.join(MODS, '@babel', 'preset-react'), {}]] })) } };
for (const premium of [false, true]) {
  const sb = sandbox({ premium });
  cargar(ctx, sb, 'app/ritmo/ritmo.series.js');
  const P = sb.ritmoPozos({}, '2026-10-14');
  console.log(premium ? '\n== CON PACE COMPLETO' : '== GRATIS');
  for (const k of ['estira', 'mueve', 'respira', 'cierre']) {
    console.log(k, P[k].length);
    P[k].forEach((r) => { const m = sb.RITMO_SERIES_META[r.id]; console.log('  ', r.id.padEnd(28), (r.name || '').padEnd(26), r.min + 'min', r.tag, m ? m.z.join('+') + (m.pie ? ' PIE' : '') : '(sin meta)', r.access || '', JSON.stringify(r.equipment || [])); });
  }
}
