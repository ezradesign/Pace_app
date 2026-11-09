/* Caza de los seis anchos · junta los JSON de todo.js: cada hallazgo, una vez, con las combinaciones
 * (tamaño · idioma · tema) donde sale. Uso: node resumen.js <carpeta> [tipo] > resumen.txt */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib');

const dir = process.argv[2];
const solo = process.argv[3] || null;
const HOME = /^(jornada-(a|a2|b|d|g|h|i)-|home-)/;
const grupos = new Map();
const errores = [];
const apunta = (tipo, pantalla, que, combo) => {
  if (solo && tipo !== solo) return;
  const k = tipo + ' · ' + pantalla + ' · ' + que;
  if (!grupos.has(k)) grupos.set(k, { tipo, pantalla, que, combos: new Set() });
  grupos.get(k).combos.add(combo);
};

for (const f of fs.readdirSync(dir).filter((x) => /^(primera|jornada|carta|modulos|web)_/.test(x))) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { errores.push(f + ': JSON roto'); continue; }
  const [, tam, lang, tema] = f.replace('.json', '').split('_');
  const combo = tam + ' ' + lang + (tema === 'osc' ? ' osc' : '');
  const [w] = L.TAMANOS[tam];
  for (const p of j.pasos) {
    if (p.error) { errores.push(combo + ' · ' + p.error); continue; }
    if (p.errores) { for (const e of p.errores) if (!/Service Worker|404 \(Not Found\)/.test(e)) apunta('consola', f.split('_')[0], e.slice(0, 120), combo); continue; }
    if (p.nota) continue;
    if (p.tab) {
      for (const x of p.teclado.fuera) if (!/\(body\)$/.test(x)) apunta('foco se escapa', p.tab, x.replace(/^\d+:/, ''), combo);
      for (const x of p.teclado.tapado) apunta('foco tapado', p.tab, x.replace(/^\d+:/, ''), combo);
      for (const x of p.teclado.oculto) apunta('foco fuera de la vista', p.tab, x.replace(/^\d+:/, ''), combo);
      continue;
    }
    if (!p.nombre) continue;
    const pant = p.nombre.replace(/^[a-z0-9]+-(es|en)(-osc)?-/, '');
    const web = pant.startsWith('web');
    if (p.scroll.doc.h > 0) apunta('scroll de lado', pant, p.scroll.doc.h + ' px', combo);
    if (!web && HOME.test(pant) && w <= 768 && p.capa === 'página' && p.scroll.doc.v > 0) apunta('la home pide scroll', pant, p.scroll.doc.v + ' px', combo);
    for (const c of p.scroll.cajas) {
      if (c.h > 1) apunta('scroll de lado en una caja', pant, c.el, combo);
      if (/^ajustes-(a|c)/.test(pant) && w <= 768 && /Settings|Ajustes/.test(c.el) && c.v > 1) apunta('Ajustes del móvil piden scroll', pant, c.v + ' px', combo);
      if (HOME.test(pant) && w <= 768 && p.capa === 'página' && c.v > 1) apunta('la home pide scroll', pant, c.el + ' ' + c.v + ' px', combo);
    }
    for (const c of p.cortados) apunta('texto cortado (' + c.por + ')', pant, c.txt + (c.caja ? ' ⊂ ' + c.caja : ''), combo);
    for (const s of p.solapes) apunta('textos que se pisan', pant, s.a + ' ✕ ' + s.b, combo);
    for (const s of p.pisaBoton) apunta('texto encima de un botón', pant, s.boton + ' ✕ ' + s.texto, combo);
    for (const s of p.fuera) apunta('botón fuera de la pantalla (' + s.por + ')', pant, s.que, combo);
    for (const s of p.tapados) apunta('botón tapado', pant, s.que + ' bajo ' + s.encima, combo);
    for (const s of p.sale) if (!/v1-btn|ritmo-parada/.test(s.que)) apunta('texto que se sale de su botón', pant, s.que, combo);
    for (const s of p.sinTraducir || []) apunta('castellano en inglés', pant, s, combo);
  }
}

const orden = [...grupos.values()].sort((a, b) => a.tipo.localeCompare(b.tipo) || b.combos.size - a.combos.size);
let tipo = null;
for (const g of orden) {
  if (g.tipo !== tipo) { tipo = g.tipo; console.log('\n## ' + tipo); }
  const combos = [...g.combos].sort();
  console.log('- [' + combos.length + '] ' + g.pantalla + ' · ' + g.que + '\n    ' + combos.join(', '));
}
if (errores.length) { console.log('\n## no se llegó'); for (const e of errores) console.log('- ' + e); }
