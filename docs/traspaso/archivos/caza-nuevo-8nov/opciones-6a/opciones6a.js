/* Llena la plantilla de la página de opciones de la 6A con las medidas y las fotos de medir6a.js.
   node opciones6a.js <medidas.json> <plantilla> <salida> */
'use strict';
const fs = require('fs');
const [, , MED, PLANT, SALE] = process.argv;
const m = JSON.parse(fs.readFileSync(MED, 'utf8'));

const holgura = (x) => (x.scroll > 0 ? `falta ${x.scroll} px` : `sobra ${x.sobra} px`);
const fotos = (v) => ['es-640', 'en-640', 'es-800', 'en-800'].map((k) => {
  const x = m[v][k + '-and'];
  const [lang, alto] = k.split('-');
  return `<figure><img src="${x.foto}" alt="Ajustes a 360 × ${alto} en ${lang === 'es' ? 'castellano' : 'inglés'}" width="300" loading="lazy">`
    + `<figcaption><b>360 × ${alto} · ${lang}</b><br>${holgura(x)}</figcaption></figure>`;
}).join('\n');
const cifras = (v) => {
  const a640 = m[v]['es-640-and'], a730 = m[v]['es-730-and'], a800 = m[v]['es-800-and'];
  const ve = (x) => (x.escuchar ? '«Escuchar» se ve' : '«Escuchar» no se ve');
  return `En Android: a 640, <b>${holgura(a640)}</b> (${ve(a640)}); a 730, la hoja ocupa el <b>${a730.pct} %</b> (tope 79 %; ${ve(a730)}); a 800, ${holgura(a800)} (${ve(a800)}).`;
};

/* es y en tienen que medir igual para poder decirlo en la página */
for (const v of Object.keys(m)) for (const k of Object.keys(m[v])) if (k.startsWith('es-')) {
  const a = m[v][k], b = m[v]['en-' + k.slice(3)];
  if (a.scroll !== b.scroll || a.sobra !== b.sobra || a.pct !== b.pct || a.escuchar !== b.escuchar) throw new Error(`es y en no miden igual en ${v} ${k}`);
}

const NOMBRE = { A: 'A · en la línea de «Oír»', B: 'B · solo con altura', C: 'C · después (como hoy)', pintada: '6A tal como se pintó' };
const celda = (x) => `<td class="${x.scroll > 0 ? 'mal' : 'bien'}">${holgura(x)}</td>`;
const pctCelda = (x) => `<td class="${x.pct > 79 ? 'mal' : 'bien'}">${x.pct} %</td>`;
const tabla = '<table><thead><tr><th>Opción</th><th>640 web</th><th>640 Android</th><th>730 Android</th><th>800 Android</th><th>¿Se oye la voz desde Ajustes?</th></tr></thead><tbody>'
  + ['A', 'B', 'C', 'pintada'].map((v) => {
    const x = m[v];
    const oye = v === 'A' || v === 'pintada' ? 'Sí, en todos' : (v === 'B' ? 'Solo en móviles de 780 px o más, y en el ordenador' : 'No');
    return `<tr><td>${NOMBRE[v]}</td>${celda(x['es-640-web'])}${celda(x['es-640-and'])}${pctCelda(x['es-730-and'])}${celda(x['es-800-and'])}<td>${oye}</td></tr>`;
  }).join('') + '</tbody></table>';

let html = fs.readFileSync(PLANT, 'utf8');
const val = {
  SOBRA_C_640: m.C['es-640-and'].sobra, PCT_C_730: m.C['es-730-and'].pct,
  FALTA_P_640: m.pintada['es-640-and'].scroll, PCT_P_730: m.pintada['es-730-and'].pct,
  FOTOS_A: fotos('A'), FOTOS_B: fotos('B'), FOTOS_C: fotos('C'),
  FOTOS_P: fotos('pintada').split('\n').slice(0, 2).join('\n'),
  CIFRAS_A: cifras('A'), CIFRAS_B: cifras('B'), CIFRAS_C: cifras('C'),
  TABLA: tabla, WEB_EXTRA: m.C['es-640-web'].sobra - m.C['es-640-and'].sobra,
};
for (const [k, v] of Object.entries(val)) html = html.split('{{' + k + '}}').join(String(v));
if (/\{\{/.test(html)) throw new Error('queda un hueco sin llenar: ' + html.match(/\{\{\w+\}\}/)[0]);
fs.writeFileSync(SALE, html);
console.log(SALE, Math.round(Buffer.byteLength(html) / 1024) + ' KB');
