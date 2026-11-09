/* Llena la plantilla de la segunda vuelta de la 6A (A1, A2, A3) con las medidas y fotos de medir6a.js
   (DPR=2 FOTOS=1). node opciones6a-2.js <medidas.json> <plantilla> <salida> */
'use strict';
const fs = require('fs');
const [, , MED, PLANT, SALE] = process.argv;
const m = JSON.parse(fs.readFileSync(MED, 'utf8'));
const OPC = ['A1', 'A2', 'A3'];

const holgura = (x) => (x.scroll > 0 ? `falta ${x.scroll} px` : `sobra ${x.sobra} px`);
const LANG = { es: 'castellano', en: 'inglés' };
const fotos = (v) => ['640', '730', '800'].flatMap((alto) => ['es', 'en'].map((lang) => {
  const x = m[v][`${lang}-${alto}-and`];
  const pie = alto === '730' ? `${x.pct} % de la pantalla` : holgura(x);
  return `<figure><img src="${x.foto}" alt="Ajustes a 360 × ${alto} en ${LANG[lang]}" width="300" loading="lazy">`
    + `<figcaption><b>360 × ${alto} · ${lang}</b><br>${pie}</figcaption></figure>`;
})).join('\n');
const detalles = (v) => ['es', 'en'].map((lang) => {
  const x = m[v][`${lang}-640-and`];
  return `<figure><img src="${x.detalle}" alt="La sección Oír a tamaño real, en ${LANG[lang]}" width="324">`
    + `<figcaption><b>«Oír» a tamaño real · ${lang}</b></figcaption></figure>`;
}).join('\n');
const cifras = (v) => {
  const a = (k) => m[v][`es-${k}-and`];
  const ve = (x) => [x.escuchar ? '«Escuchar» se ve' : '«Escuchar» no se ve', v === 'A1' ? null : (x.nota ? 'la frase de la música se ve' : 'la frase de la música no se ve')].filter(Boolean).join(', ');
  return `En Android: a 640, <b>${holgura(a(640))}</b> (${ve(a(640))}); a 730, la hoja ocupa el <b>${a(730).pct} %</b> (tope 79 %; ${ve(a(730))}); a 800, ${holgura(a(800))} (${ve(a(800))}).`;
};

/* es y en tienen que medir igual para poder decirlo en la página, y nada puede pisar nada */
for (const v of [...OPC, 'C']) for (const k of Object.keys(m[v])) {
  if (m[v][k].tapa.length) throw new Error(`${v} ${k} pisa: ${m[v][k].tapa.join(' ; ')}`);
  if (m[v][k].scroll > 0) throw new Error(`${v} ${k} pide scroll`);
  if (k.startsWith('es-')) {
    const a = m[v][k], b = m[v]['en-' + k.slice(3)];
    if (a.scroll !== b.scroll || a.sobra !== b.sobra || a.pct !== b.pct || a.escuchar !== b.escuchar || a.nota !== b.nota) throw new Error(`es y en no miden igual en ${v} ${k}`);
  }
}
const avisoPisa = Object.values(m.aviso).filter((x) => x.tapa.length).length;
if (!avisoPisa) throw new Error('la comprobación de lo que tapa no vio el aviso de la A: no vale');

const NOMBRE = { A1: 'A1 · solo «Escuchar ›»', A2: 'A2 · la frase en la línea pequeña', A3: 'A3 · la frase solo en móviles altos', C: 'Hoy, sin la 6A' };
const MUSICA = { A1: 'En ningún sitio', A2: 'Sí, en todos', A3: 'Solo en móviles de 780 px o más, y en el ordenador', C: 'No' };
const celda = (x) => `<td class="${x.scroll > 0 ? 'mal' : 'bien'}">${holgura(x)}</td>`;
const pctCelda = (x) => `<td class="${x.pct > 79 ? 'mal' : 'bien'}">${x.pct} %</td>`;
const tabla = '<table><thead><tr><th>Opción</th><th>640 web</th><th>640 Android</th><th>730 Android</th><th>800 Android</th><th>¿Tapa algo?</th><th>¿Dice dónde suena la música?</th></tr></thead><tbody>'
  + [...OPC, 'C'].map((v) => {
    const x = m[v];
    return `<tr><td>${NOMBRE[v]}</td>${celda(x['es-640-web'])}${celda(x['es-640-and'])}${pctCelda(x['es-730-and'])}${celda(x['es-800-and'])}<td class="bien">No</td><td>${MUSICA[v]}</td></tr>`;
  }).join('') + '</tbody></table>';

let html = fs.readFileSync(PLANT, 'utf8');
const val = { TABLA: tabla, AVISO_PISA: `en ${avisoPisa} de sus ${Object.keys(m.aviso).length} medidas` };
for (const v of OPC) { val['FOTOS_' + v] = fotos(v); val['DETALLES_' + v] = detalles(v); val['CIFRAS_' + v] = cifras(v); }
for (const [k, v] of Object.entries(val)) html = html.split('{{' + k + '}}').join(String(v));
if (/\{\{/.test(html)) throw new Error('queda un hueco sin llenar: ' + html.match(/\{\{\w+\}\}/)[0]);
fs.writeFileSync(SALE, html);
console.log(SALE, Math.round(Buffer.byteLength(html) / 1024) + ' KB');
