/* PACE · scripts/audit/maqueta-s177-runner.js (sesión 177)
   =========================================================
   LA COMPARACIÓN MIRABLE de las tres propuestas del runner. Coge las capturas
   que dejó `banco-runner-s177.js` y monta UN SOLO archivo autónomo (las imágenes
   van dentro) que se abre desde cualquier carpeta.

   Se pintan las DOS pantallas de la misma rutina una al lado de la otra, porque
   la mitad del defecto -- el salto de 26,4 px -- sólo se ve comparándolas: en
   una sola captura no hay nada que mirar.

   LAS CAPTURAS SE REDUCEN ANTES DE EMPOTRARLAS. En PNG a tamaño real el archivo
   salía de 10,4 MB y no había quien lo abriera. A 860 px de ancho y JPEG 82 se
   queda en décimas de MB, y lo que hay que mirar aquí son POSICIONES, no
   píxeles finos.

   Uso: node scripts/audit/maqueta-s177-runner.js
        (antes: node scripts/audit/banco-runner-s177.js)
*/
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));
const DIR = path.join(ROOT, '_maqueta-s177-runner');
const SALIDA = path.join(ROOT, '_maqueta-s177-runner.html');

/* Las cifras salen del banco y se escriben aquí a mano UNA vez; si el banco
   cambia, esta tabla miente. Por eso lleva el aviso delante y no se presenta
   como medida viva. */
const FILAS = [
  { k: 'hoy', t: 'HOY · v0.106.0', solape: '15,0', arr: '10,0', ab: '−15,0', salto: '51,2',
    nota: 'Lo que hay publicado. El «Cuídate» se mete 15 px dentro de la barra; y al pasar de una pantalla a otra se mueven el nombre y la descripción (26,4 px), el número (51,2) y su etiqueta (4,6) — además de que el número cambia de 56 a 104 px.' },
  { k: 'n96', t: 'N96 · el número grande manda', solape: '0,0', arr: '12,0', ab: '13,0', salto: '0',
    nota: 'Las dos pantallas usan 96 px. Es el tamaño del contador de hoy, así que el ejercicio no pierde presencia — pero la cuenta atrás de colocarse se vuelve igual de grande, y para que quepa el glifo baja un 25 % (204 → 153 px).' },
  { k: 'n76', t: 'N76 · un tamaño intermedio', solape: '0,0', arr: '10,0', ab: '10,9', salto: '0',
    nota: 'Las dos usan 76 px, que no es ninguno de los dos de hoy. El glifo sólo baja un 14 % (204 → 181 px), así que el dibujo conserva casi todo su tamaño.' },
  { k: 'n56', t: 'N56 · el número pequeño manda', solape: '0,0', arr: '20,0', ab: '19,9', salto: '0',
    nota: 'Las dos usan 56 px, el de colocarse. El glifo baja lo mismo que en N76 y sobra aire por todas partes — pero el contador del ejercicio pierde casi la mitad de su tamaño.' },
];

async function b64(f) {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) { console.error('GUARD: falta ' + f + ' -- corre antes el banco'); process.exit(2); }
  const buf = await sharp(p).resize({ width: 860 }).jpeg({ quality: 82 }).toBuffer();
  return 'data:image/jpeg;base64,' + buf.toString('base64');
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function bloque(f) {
  const izq = await b64('colocate-' + f.k + '.png');
  const der = await b64('trabajo-' + f.k + '.png');
  return [
    '<section class="v">',
    '  <h2>' + esc(f.t) + '</h2>',
    '  <p class="nota">' + esc(f.nota) + '</p>',
    '  <div class="cifras">',
    '    <span class="' + (f.solape === '0,0' ? 'ok' : 'mal') + '">solape ' + esc(f.solape) + ' px</span>',
    '    <span class="' + (f.salto === '0' ? 'ok' : 'mal') + '">salto ' + esc(f.salto) + ' px</span>',
    '    <span>hueco arriba ' + esc(f.arr) + '</span>',
    '    <span>hueco abajo ' + esc(f.ab) + '</span>',
    '  </div>',
    '  <div class="par">',
    '    <figure><img src="' + izq + '" alt=""><figcaption>colócate</figcaption></figure>',
    '    <figure><img src="' + der + '" alt=""><figcaption>ejercicio</figcaption></figure>',
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
  '.intro { max-width:70ch; color:var(--ink-3); margin:0 0 4px; }',
  '.intro b { color:var(--ink); }',
  '.v { margin-top:38px; border-top:1px solid var(--line); padding-top:18px; }',
  'h2 { font-size:16px; font-weight:600; margin:0 0 4px; }',
  '.nota { max-width:78ch; color:var(--ink-3); margin:0 0 10px; }',
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
    '<title>Runner s177 · las tres propuestas</title>',
    '<style>' + CSS + '</style></head><body>',
    '<h1>El runner de Mueve y Estira · las tres propuestas</h1>',
    '<p class="intro">Capturas de la <b>app de verdad</b> a <b>1536×714</b>, con el CSS de cada',
    'variante inyectado encima. Rutina: <b>Flexiones de escritorio</b>, una de las dos que fotografiaste.</p>',
    '<p class="intro">Las tres congelan <b>las siete piezas</b> — glifo, nombre, descripción, número,',
    'etiqueta, cola y barra quedan <b>en el mismo sitio y al mismo tamaño</b> al pasar de una pantalla a',
    'la otra— y ninguna solapa con la barra. Se diferencian en <b>qué tamaño de número gana</b>: hoy son',
    '<b>56 px</b> al colocarse y <b>104</b> al trabajar, y unificarlo es lo único que puede quitar ese salto.</p>',
    '<p class="intro">Para verlo: abre las dos imágenes de una fila y pasa de una a otra. En HOY bailan',
    'el nombre, la descripción y sobre todo el número; en las otras tres no se mueve nada.</p>',
    bloques.join('\n'),
    '</body></html>',
  ].join('\n');
  fs.writeFileSync(SALIDA, doc, 'utf8');
  console.log('escrito ' + path.basename(SALIDA) + ' (' + Math.round(doc.length / 1024) + ' KB, autónomo)');
})();
