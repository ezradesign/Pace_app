/* glifos-hoja50.js — hoja de contactos de los 50 dibujos DISTINTOS, numerados,
   para poder decir "el 12 es first.sip" sin abrir 50 archivos.

   Los nombres de origen (`asset_<id>_<timestamp>.png`) no llevan informacion:
   no hay forma de saber a que logro va cada uno mas que mirandolos. Esta hoja
   existe para eso. Escribe ademas `glifos-indice.json` con el numero -> archivo,
   que es lo que consumira la ingesta cuando el mapeo este decidido.

   uso: node scripts/audit/glifos-hoja50.js [carpeta] [salida.png]
*/
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = process.argv[2] || path.resolve(__dirname, '..', '..', '..', 'Glifos_logros');
const OUT = process.argv[3] || path.resolve(__dirname, '..', '..', '..', 'glifos-50.png');
const JSON_OUT = path.join(path.dirname(OUT), 'glifos-indice.json');

const CELDA = 200, COLS = 10, ETIQ = 26;

async function main() {
  const files = fs.readdirSync(DIR).filter(f => /\.png$/i.test(f)).sort();
  const vistos = new Map();
  for (const f of files) {
    const k = (f.match(/^asset_([a-z0-9]+)_/i) || [, f])[1];
    if (!vistos.has(k)) vistos.set(k, f);
  }
  const unicos = [...vistos.values()];
  console.log('dibujos distintos: ' + unicos.length + ' (de ' + files.length + ' archivos)');

  const filas = Math.ceil(unicos.length / COLS);
  const W = COLS * CELDA, H = filas * (CELDA + ETIQ);
  const capas = [];

  for (let i = 0; i < unicos.length; i++) {
    const col = i % COLS, fila = (i / COLS) | 0;
    const img = await sharp(path.join(DIR, unicos[i]))
      .resize(CELDA - 8, CELDA - 8, { fit: 'inside' })
      .flatten({ background: '#F2EDE0' })
      .png().toBuffer();
    capas.push({ input: img, left: col * CELDA + 4, top: fila * (CELDA + ETIQ) + 4 });

    const etiqueta = Buffer.from(
      `<svg width="${CELDA}" height="${ETIQ}" xmlns="http://www.w3.org/2000/svg">
         <text x="${CELDA / 2}" y="${ETIQ - 8}" text-anchor="middle"
               font-family="monospace" font-size="18" fill="#4A453C">${i + 1}</text>
       </svg>`);
    capas.push({ input: etiqueta, left: col * CELDA, top: fila * (CELDA + ETIQ) + CELDA });
  }

  await sharp({ create: { width: W, height: H, channels: 3, background: '#F2EDE0' } })
    .composite(capas).png().toFile(OUT);

  const indice = unicos.map((f, i) => ({ n: i + 1, archivo: f, logro: null }));
  fs.writeFileSync(JSON_OUT, JSON.stringify(indice, null, 1), 'utf8');

  console.log('hoja:   ' + OUT);
  console.log('indice: ' + JSON_OUT + '  (campo `logro` a null, pendiente de mapear)');
}

main().catch(e => { console.error(e.message); process.exit(1); });
