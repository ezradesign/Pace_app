/* Resume la salida JSON de un script del recorrido: solo lo que salta. */
'use strict';
const r = require(require('path').resolve(process.argv[2]));
const ruido = /Service Worker registration blocked/;
for (const c of r) {
  const errs = (c.errores || []).filter((e) => !ruido.test(e));
  console.log('##', c.tag, errs.length ? 'ERRORES ' + JSON.stringify(errs) : '');
  for (const p of c.pasos || []) {
    if (p.error) { console.log('  ERROR', p.error); continue; }
    if (p.tab) { if (p.tab.length) console.log('  TAB fuera', p.tab.slice(0, 4)); continue; }
    if (p.nota) { console.log('  NOTA', JSON.stringify(p.nota)); continue; }
    if (!p.scroll) continue;
    const s = p.scroll, out = [];
    if (s.doc.v > 0 || s.doc.h > 0) out.push('docScroll v' + s.doc.v + ' h' + s.doc.h);
    if (s.cajas.length) out.push('cajas ' + JSON.stringify(s.cajas.slice(0, 3)));
    if (p.cortados.length) out.push('cort ' + JSON.stringify(p.cortados.slice(0, 4)));
    if (p.solapes.length) out.push('sol ' + JSON.stringify(p.solapes.slice(0, 3)));
    if (p.sinTraducir && p.sinTraducir.length) out.push('ES ' + JSON.stringify(p.sinTraducir.slice(0, 6)));
    if (out.length) console.log('  ', p.nombre, out.join(' | '));
  }
}
