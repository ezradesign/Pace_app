/* glifos-recorte.js — la hipotesis que sale de mirar la hoja de contactos:
   el motivo central ocupa menos de la mitad del lienzo porque el arte trae su
   propia CIRCUNFERENCIA y mucho aire. Si se recorta al motivo, a 56 px el
   dibujo se ve casi el doble de grande — y de paso desaparece el circulo, que
   el sello ya pinta DOS veces por su cuenta.

   Mide el antes y el despues y escribe una hoja para mirarlo.

   uso: node scripts/audit/glifos-recorte.js [carpeta] [salida.png]
*/
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = process.argv[2] || path.resolve(__dirname, '..', '..', '..', 'Glifos_logros');
const OUT = process.argv[3] || path.resolve(__dirname, '..', '..', '..', 'glifos-recorte.png');

const SELLO = 56, DPR = 2, ZOOM = 6;
/* El fondo NO es blanco puro: medido, vive entre 240 y 255. El umbral de tinta
   va por debajo de ese suelo o el "dibujo" incluiria el papel entero. */
const UMBRAL_TINTA = 236;
/* radio a partir del cual se considera que estamos en la circunferencia propia
   del arte, no en el motivo */
const R_ANILLO = 0.86;

/* bbox de la tinta IGNORANDO todo lo que caiga fuera de R_ANILLO */
function bboxMotivo(data, w, h) {
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2;
  let minX = w, maxX = -1, minY = h, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[y * w + x] >= UMBRAL_TINTA) continue;
      if (Math.hypot(x - cx, y - cy) / R >= R_ANILLO) continue;   // fuera: es el aro
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function main() {
  const files = fs.readdirSync(DIR).filter(f => /\.png$/i.test(f)).sort();
  const vistos = new Set(); const unicos = [];
  for (const f of files) {
    const k = (f.match(/^asset_([a-z0-9]+)_/i) || [, f])[1];
    if (!vistos.has(k)) { vistos.add(k); unicos.push(f); }
  }

  const muestra = unicos.slice(0, 8);
  console.log('=== RECORTE AL MOTIVO · ' + unicos.length + ' dibujos distintos ===\n');
  console.log('archivo                        motivo/lienzo   ganancia   contraste@112 antes -> despues');

  const tiras = [];
  for (const f of muestra) {
    const src = path.join(DIR, f);
    const { data, info } = await sharp(src).greyscale().raw().toBuffer({ resolveWithObject: true });
    const bb = bboxMotivo(data, info.width, info.height);
    const lado = SELLO * DPR;

    const contraste = async buf => {
      const r = await sharp(buf).greyscale().raw().toBuffer();
      let min = 255; for (const v of r) if (v < min) min = v;
      return min;
    };

    const sinRecorte = await sharp(src).resize(lado, lado, { fit: 'inside' }).png().toBuffer();
    const recortado = bb
      ? await sharp(src).extract(bb).resize(lado, lado, { fit: 'inside' }).png().toBuffer()
      : sinRecorte;

    const ocup = bb ? Math.max(bb.width, bb.height) / Math.max(info.width, info.height) : 1;
    const cAntes = await contraste(sinRecorte);
    const cDespues = await contraste(recortado);

    console.log(
      f.slice(0, 28).padEnd(31) +
      ((ocup * 100).toFixed(0) + '%').padEnd(16) +
      ('x' + (1 / ocup).toFixed(1)).padEnd(11) +
      ('L ' + cAntes + ' -> L ' + cDespues)
    );

    tiras.push({
      antes: await sharp(sinRecorte).resize(SELLO * ZOOM, SELLO * ZOOM, { kernel: 'nearest' }).png().toBuffer(),
      despues: await sharp(recortado).resize(SELLO * ZOOM, SELLO * ZOOM, { kernel: 'nearest' }).png().toBuffer(),
    });
  }

  const C = SELLO * ZOOM;
  const capas = [];
  tiras.forEach((t, i) => {
    capas.push({ input: t.antes, left: i * C, top: 0 });
    capas.push({ input: t.despues, left: i * C, top: C });
  });
  await sharp({ create: { width: C * tiras.length, height: C * 2, channels: 3, background: '#F2EDE0' } })
    .composite(capas).png().toFile(OUT);

  console.log('\nhoja escrita en: ' + OUT);
  console.log('  ARRIBA = el arte entero a 56 px (lo de ahora)');
  console.log('  ABAJO  = recortado al motivo, a 56 px (sin su circunferencia)');
}

main().catch(e => { console.error(e.message); process.exit(1); });
