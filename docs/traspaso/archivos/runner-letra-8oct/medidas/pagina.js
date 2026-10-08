const fs = require('fs');
const med = require('./fotos/medidas.json');
const VPS = ['360x640', '375x667', '412x844', '1280x720', '1530x702'];
const OPS = [
  ['antes', 'Hoy', 'La explicación en letra de interfaz (sans) a 15 px en el móvil y 16 en el ordenador.'],
  ['A', 'A · Serif itálica', 'La explicación en la serif itálica de la app (la de «Concentración profunda»), a 17 px en el móvil y 18 en el ordenador, en el color secundario. No se corta nada.'],
  ['B', 'B · Serif itálica con tope de dos líneas', 'Como A, pero la explicación no pasa nunca de dos líneas: lo que no cabe se corta con «…». Hoy la frase entera no está en ningún otro sitio (la vista previa solo enseña los nombres de los pasos).'],
  ['C', 'C · Solo más pequeña', 'La misma letra de hoy, un punto más pequeña: 13,5 px en el móvil y 15 en el ordenador.'],
  ['At', 'A con explicaciones cortas (la recomendada)', 'A, y además ninguna explicación pasa de dos líneas porque el texto es corto. Aquí la de Flexiones está acortada a mano solo para la foto («Manos al borde de la mesa, algo más abiertas que los hombros. Pasos atrás, cuerpo recto.»); la de verdad la escribirá la sesión que reescribe las explicaciones.'],
];
const censo = {};
for (const o of ['antes', 'A', 'B', 'C']) censo[o] = require('./' + o + '.json');
function resumen(o, vp) {
  const r = (mod) => censo[o].filter(x => x.vp === vp && x.mod === mod && !x.error).map(x => x.aro).sort((a, b) => a - b);
  const m = r('Mueve'), e = r('Estira');
  return { mMin: m[0], mMed: m[m.length >> 1], eMin: e[0], eMed: e[e.length >> 1] };
}
const img = (f) => 'data:image/jpeg;base64,' + fs.readFileSync('fotos/' + f).toString('base64');
const aro = (op, slug, vp) => (med.find(x => x.op === op && x.slug === slug && x.vp === vp) || {}).aro;

let fotos = '';
for (const vp of VPS) {
  const movil = +vp.split('x')[0] <= 640;
  fotos += `<section class="vp" data-vp="${vp}"${vp === '360x640' ? '' : ' hidden'}>`;
  for (const [op, tit, txt] of OPS) {
    fotos += `<div class="opc"><h3>${tit}</h3><p class="nota">${txt}</p><div class="par ${movil ? 'movil' : 'pc'}">`;
    for (const [slug, nom] of [['mueve', 'Mueve · Flexiones de escritorio'], ['estira', 'Estira · Cadena posterior']]) {
      fotos += `<figure><img loading="lazy" src="${img(`${op}_${slug}_${vp}.jpg`)}" alt="${nom}, ${tit}, ${vp}"><figcaption>${nom}<b>${aro(op, slug, vp)} px</b></figcaption></figure>`;
    }
    fotos += `</div></div>`;
  }
  fotos += `</section>`;
}
let tabla = '<table><thead><tr><th>Pantalla</th>' + ['antes', 'A', 'B', 'C'].map(o => `<th>${o === 'antes' ? 'Hoy' : o}</th>`).join('') + '</tr></thead><tbody>';
for (const vp of VPS) {
  tabla += `<tr><td>${vp.replace('x', '×')}</td>` + ['antes', 'A', 'B', 'C'].map(o => { const s = resumen(o, vp); return `<td><span class="m">${s.mMin}</span> · <span class="e">${s.eMed}</span></td>`; }).join('') + '</tr>';
}
tabla += '</tbody></table>';
const html = fs.readFileSync('plantilla.html', 'utf8').replace('<!--TABLA-->', tabla).replace('<!--FOTOS-->', fotos);
fs.writeFileSync(process.argv[2], html);
console.log((html.length / 1e6).toFixed(2) + ' MB');
