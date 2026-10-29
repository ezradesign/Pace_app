// La tabla de «Cabe en todas las pantallas» para la página de Ez, desde uno o varios censo.json.
// Uso: node tabla-censo.js <salida.html> <censo.json> [<censo.json que manda sobre el anterior>...]
'use strict';
const fs = require('fs');
const [salida, ...fuentes] = process.argv.slice(2);
const filas = new Map();
for (const f of fuentes) for (const r of JSON.parse(fs.readFileSync(f, 'utf8'))) filas.set(r.t, r);

const NOMBRE = { colocate: 'Colocarse (+15 s)', saltar: 'Con «Saltar este paso»', core: 'Sin pastilla (Core silencioso)', basta: 'Con «Con una basta»' };
const porPantalla = new Map();
for (const r of filas.values()) {
  const [lang, escena, pant] = r.t.split(' ');
  const k = pant + (lang === 'en' ? ' · inglés' : '');
  if (!porPantalla.has(k)) porPantalla.set(k, []);
  porPantalla.get(k).push({ escena, h: r.hoy || {}, p: r.propuesta || {} });
}
const orden = [...porPantalla.keys()].sort((a, b) => {
  const n = (s) => s.split(' ')[0].split('x').map(Number);
  const [wa, ha] = n(a), [wb, hb] = n(b);
  return (wa > 700) - (wb > 700) || wa * ha - wb * hb || a.localeCompare(b);
});

const celda = (txt, mal) => `<td${mal ? ' class="mal"' : ''}>${txt}</td>`;
let html = '<div class="tabla"><table><thead><tr><th>Pantalla</th><th>Círculo, hoy → propuesta</th><th>Nada se pisa</th><th>Ningún texto cortado</th><th>Sin scroll</th></tr></thead><tbody>';
for (const k of orden) {
  const xs = porPantalla.get(k);
  const circ = [...new Set(xs.map((x) => (x.h.circulo || '?') + ' → ' + (x.p.circulo || '?')))].join(', ');
  // Solo cuenta como defecto que encoja: que crezca hasta el de las demás rutinas es lo buscado.
  const cambia = xs.some((x) => (x.h.circulo || 0) - (x.p.circulo || 0) > 2);
  // Lo que ya se pisaba hoy no lo trae la propuesta: se cuenta aparte.
  const pisaNuevo = xs.filter((x) => (x.p.pisa || []).length && !(x.h.pisa || []).length).map((x) => NOMBRE[x.escena]);
  const px = (l) => Math.max(0, ...(l || []).map((t) => -parseInt(t.split(' ').pop(), 10)));
  const pisaP = Math.max(0, ...xs.map((x) => px(x.p.pisa))), pisaH = Math.max(0, ...xs.map((x) => px(x.h.pisa)));
  // «· Más tiempo» es el texto oculto para el lector de pantalla del +15 s: no se ve, no cuenta.
  const cortaNuevo = xs.filter((x) => (x.p.corta || []).filter((c) => !/Más tiempo|More time/.test(c)).length).map((x) => NOMBRE[x.escena]);
  const scroll = xs.some((x) => x.p.scroll);
  html += '<tr>' + celda(k) + celda(circ, cambia)
    + celda(pisaNuevo.length ? 'No: ' + pisaNuevo.join(', ') : (pisaP ? 'Se monta menos que hoy: ' + pisaP + ' px (hoy, ' + pisaH + ')' : 'Sí'), pisaNuevo.length)
    + celda(cortaNuevo.length ? 'No: ' + cortaNuevo.join(', ') : 'Sí', cortaNuevo.length)
    + celda(scroll ? 'No' : 'Sí', scroll) + '</tr>';
}
html += '</tbody></table></div>';
fs.writeFileSync(salida, html);
console.log(orden.length + ' pantallas');
