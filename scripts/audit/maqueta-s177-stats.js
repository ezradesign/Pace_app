/* PACE · scripts/audit/maqueta-s177-stats.js (sesión 177)
   ========================================================
   LA COMPARACIÓN MIRABLE del calendario de Stats. Coge las capturas de
   `banco-stats-s177.js` y monta un archivo autónomo.

   Se enseñan «Año» y «Mes» de cada opción, que son las dos pestañas que
   cambian: el año es el que el usuario reportó, y el mes es el que PAGA cada
   decisión -- si el modal se ensancha, el mes se queda pequeño en una caja
   grande, y no puede crecer para acompañarlo porque rompería la caja común.

   Uso: node scripts/audit/maqueta-s177-stats.js
        (antes: node scripts/audit/banco-stats-s177.js 8765 1536 714 hoy,d,c,h)
*/
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));
const DIR = path.join(ROOT, '_maqueta-s177-stats');
const SALIDA = path.join(ROOT, '_maqueta-s177-stats.html');

const FILAS = [
  { k: 'hoy', t: 'HOY · v0.106.0', modal: '820', celda: '11,0', muerto: '163,7',
    nota: 'El modal usa 820 px de una ventana de 1536, y la rejilla del año lleva celdas de 11×11 px cableadas. La pestaña «Año» desperdicia 163,7 px de sus 385: el 42 % de su caja.' },
  { k: 'd', t: 'D · el modal no se toca', modal: '820', celda: '12,6', muerto: '74,0',
    nota: 'Sólo crece el calendario dentro del modal de siempre, y la vista se centra. Gana poco —la celda pasa de 11,0 a 12,6— porque el ancho no da para más. A cambio no cambia nada más de la app.' },
  { k: 'c', t: 'C · el modal se ensancha a 1240', modal: '1240', celda: '18,1', muerto: '47,4',
    nota: 'El mismo ancho que usan Mueve, Estira y Respira desde s176. El año gana de verdad: celda 18,1 px, un 65 % más, y el hueco muerto baja de 163,7 a 47,4. El precio se ve en «Mes»: la rejilla se queda pequeña y sola en una caja de 1174 px.' },
  { k: 'h', t: 'H · modal ancho, pero cada vista con su ancho', modal: '1240', celda: '18,1',
    muerto: '47,4',
    nota: 'Igual que C para el año, y las vistas que NO son el año se acotan a una columna de 820 px y se centran, así que no se quedan perdidas. Es la única que resuelve las dos cosas a la vez.' },
];

async function b64(f) {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) { console.error('GUARD: falta ' + f + ' -- corre antes el banco'); process.exit(2); }
  const buf = await sharp(p).resize({ width: 900 }).jpeg({ quality: 84 }).toBuffer();
  return 'data:image/jpeg;base64,' + buf.toString('base64');
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function bloque(f) {
  const ano = await b64('ano-' + f.k + '.png');
  const mes = await b64('mes-' + f.k + '.png');
  return [
    '<section class="v">',
    '  <h2>' + esc(f.t) + '</h2>',
    '  <p class="nota">' + esc(f.nota) + '</p>',
    '  <div class="cifras">',
    '    <span>modal ' + esc(f.modal) + ' px</span>',
    '    <span>celda del año ' + esc(f.celda) + ' px</span>',
    '    <span class="' + (parseFloat(f.muerto.replace(',', '.')) < 60 ? 'ok' : 'mal') + '">hueco muerto ' + esc(f.muerto) + ' px</span>',
    '    <span class="ok">sin scroll · las 4 pestañas a 385</span>',
    '  </div>',
    '  <div class="par">',
    '    <figure><img src="' + ano + '" alt=""><figcaption>Año — la pestaña que reportaste</figcaption></figure>',
    '    <figure><img src="' + mes + '" alt=""><figcaption>Mes — la que paga la decisión</figcaption></figure>',
    '  </div>',
    '</section>',
  ].join('\n');
}

const CSS = [
  ':root { --paper:#F4F1EA; --ink:#2B2A26; --ink-3:#7A7568; --line:#DAD3C4; --ok:#4F6B3E; --mal:#A4553C; }',
  '* { box-sizing: border-box; }',
  'body { margin:0; padding:28px 22px 60px; background:var(--paper); color:var(--ink);',
  "       font:14px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }",
  'h1 { font-size:22px; font-weight:500; margin:0 0 6px; }',
  '.intro { max-width:74ch; color:var(--ink-3); margin:0 0 4px; }',
  '.intro b { color:var(--ink); }',
  '.v { margin-top:38px; border-top:1px solid var(--line); padding-top:18px; }',
  'h2 { font-size:16px; font-weight:600; margin:0 0 4px; }',
  '.nota { max-width:80ch; color:var(--ink-3); margin:0 0 10px; }',
  '.cifras { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }',
  '.cifras span { font-size:12px; padding:3px 9px; border:1px solid var(--line); border-radius:999px; background:#fff9; }',
  '.cifras .ok { color:var(--ok); border-color:var(--ok); }',
  '.cifras .mal { color:var(--mal); border-color:var(--mal); font-weight:600; }',
  '.par { display:grid; grid-template-columns:1fr 1fr; gap:16px; }',
  'figure { margin:0; }',
  'img { width:100%; display:block; border:1px solid var(--line); border-radius:6px; background:#fff; }',
  'figcaption { font-size:11.5px; color:var(--ink-3); margin-top:5px; letter-spacing:.04em; text-transform:uppercase; }',
  '@media (max-width: 900px) { .par { grid-template-columns:1fr; } }',
].join('\n');

(async () => {
  const bloques = [];
  for (const f of FILAS) bloques.push(await bloque(f));
  const doc = [
    '<!doctype html><html lang="es"><head><meta charset="utf-8">',
    '<title>Stats s177 · el calendario</title>',
    '<style>' + CSS + '</style></head><body>',
    '<h1>El calendario de Stats · cuatro opciones</h1>',
    '<p class="intro">Capturas de la <b>app de verdad</b> a <b>1536×714</b>, con el CSS de cada opción',
    'inyectado encima.</p>',
    '<p class="intro">Lo medido hoy: el modal usa <b>820 px de 1536</b> y la rejilla del año lleva',
    'celdas de <b>11×11 px cableadas</b>, así que la pestaña «Año» deja <b>163,7 px muertos</b> de sus 385.',
    'Las otras tres pestañas dejan 0.</p>',
    '<p class="intro"><b>Lo que NO se puede hacer, y está medido</b>: agrandar la rejilla del <b>mes</b>.',
    'Con celda 64 la vista se va a <b>527,4 px</b>, con 56 a <b>474,4</b> y hasta con 48 a <b>421,4</b>,',
    'contra los 385 de las demás — o sea, vuelve el salto entre pestañas que s176 quitó a petición tuya.',
    'Los 42 px de hoy ya son su techo.</p>',
    bloques.join('\n'),
    '</body></html>',
  ].join('\n');
  fs.writeFileSync(SALIDA, doc, 'utf8');
  console.log('escrito ' + path.basename(SALIDA) + ' (' + Math.round(doc.length / 1024) + ' KB, autónomo)');
})();
