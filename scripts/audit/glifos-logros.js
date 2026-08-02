/* glifos-logros.js — auditoria de la tanda de arte del usuario ANTES de tocar
   nada (s146b). Contesta con cifras, no a ojo:

     1. cuantos dibujos DISTINTOS hay de verdad (los nombres sugieren duplicados)
     2. si los duplicados son copias identicas o versiones distintas
     3. donde vive el dibujo — alfa o luminancia — que es lo que decidio todo en
        el loto de s138 y donde alli fallo la intuicion
     4. cuanto ocupa la silueta dentro del lienzo (margenes muertos)
     5. si el arte trae su propia circunferencia, que el sello ya pinta dos veces
     6. presupuesto real de la mascara al tamaño al que se pinta (56 px)

   uso: node scripts/audit/glifos-logros.js [carpeta]
*/
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const DIR = process.argv[2] || path.resolve(__dirname, '..', '..', '..', 'Glifos_logros');

const kb = n => (n / 1024).toFixed(0) + ' KB';
const mb = n => (n / 1048576).toFixed(1) + ' MB';

async function main() {
  const files = fs.readdirSync(DIR).filter(f => /\.png$/i.test(f)).sort();
  console.log('=== TANDA DE GLIFOS DE LOGRO · ' + DIR + ' ===\n');
  console.log('archivos PNG: ' + files.length);

  /* --- 1/2. duplicados por nombre y por contenido --- */
  const porAsset = new Map();
  let bytes = 0;
  for (const f of files) {
    const st = fs.statSync(path.join(DIR, f));
    bytes += st.size;
    const m = f.match(/^asset_([a-z0-9]+)_/i);
    const clave = m ? m[1] : f;
    if (!porAsset.has(clave)) porAsset.set(clave, []);
    porAsset.get(clave).push({ f, size: st.size });
  }
  console.log('peso total: ' + mb(bytes) + '  (media ' + kb(bytes / files.length) + ' por archivo)');
  console.log('ids de asset distintos: ' + porAsset.size);

  const hash = p => crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');
  let paresIdenticos = 0, paresDistintos = 0;
  const distintos = [];
  for (const [clave, lista] of porAsset) {
    if (lista.length < 2) continue;
    const hs = new Set(lista.map(x => hash(path.join(DIR, x.f))));
    if (hs.size === 1) paresIdenticos++;
    else { paresDistintos++; distintos.push({ clave, n: lista.length, tamaños: lista.map(x => kb(x.size)) }); }
  }
  console.log('  con MAS de un archivo: ' + [...porAsset.values()].filter(l => l.length > 1).length);
  console.log('    copias byte-identicas: ' + paresIdenticos);
  console.log('    versiones DISTINTAS:   ' + paresDistintos);
  for (const d of distintos.slice(0, 10)) {
    console.log('      ' + d.clave + '  x' + d.n + '  ' + d.tamaños.join(' / '));
  }

  /* --- 3/4/5/6. medicion de imagen sobre una MUESTRA --- */
  const muestra = [...porAsset.values()].map(l => l[l.length - 1].f).slice(0, 12);
  console.log('\n--- MEDICION DE IMAGEN (muestra de ' + muestra.length + ') ---');
  console.log('archivo                                  dim        alfa        luminancia    tinta≠0   bbox');

  const resumen = [];
  for (const f of muestra) {
    const img = sharp(path.join(DIR, f));
    const meta = await img.metadata();
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const px = info.width * info.height;
    let aCero = 0, aPleno = 0, lMin = 255, lMax = 0, lSum = 0, tinta = 0;
    let minX = info.width, maxX = -1, minY = info.height, maxY = -1;
    for (let i = 0, p = 0; i < data.length; i += info.channels, p++) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 8) { aCero++; continue; }
      if (a > 247) aPleno++;
      const L = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      if (L < lMin) lMin = L;
      if (L > lMax) lMax = L;
      lSum += L;
      /* «tinta» = pixel que se vera: opaco y no blanco */
      if (L < 240) {
        tinta++;
        const x = p % info.width, y = (p / info.width) | 0;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    const visibles = px - aCero;
    const r = {
      f, w: meta.width, h: meta.height,
      alfaCeroPct: Math.round(aCero * 100 / px),
      alfaPlenoPct: Math.round(aPleno * 100 / px),
      lMin, lMax, lMedia: visibles ? Math.round(lSum / visibles) : 0,
      tintaPct: +(tinta * 100 / px).toFixed(2),
      bbox: maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 },
    };
    resumen.push(r);
    console.log(
      f.slice(0, 38).padEnd(40) +
      (r.w + 'x' + r.h).padEnd(11) +
      ('0:' + r.alfaCeroPct + '% 255:' + r.alfaPlenoPct + '%').padEnd(12) +
      ('L ' + r.lMin + '-' + r.lMax + ' m' + r.lMedia).padEnd(14) +
      (r.tintaPct + '%').padEnd(10) +
      (r.bbox ? r.bbox.w + 'x' + r.bbox.h + ' @' + r.bbox.x + ',' + r.bbox.y : '-')
    );
  }

  /* --- veredicto sobre donde vive el dibujo --- */
  console.log('\n--- ¿DONDE VIVE EL DIBUJO? ---');
  const bimodal = resumen.filter(r => r.alfaCeroPct + r.alfaPlenoPct > 90).length;
  console.log('  alfa BIMODAL (silueta, no dibujo) en ' + bimodal + ' de ' + resumen.length);
  console.log('  => ' + (bimodal > resumen.length / 2
    ? 'enmascarar por ALFA daria una mancha: la mascara se reconstruye desde la TINTA (como el loto, s138)'
    : 'el alfa SI lleva el dibujo: se puede enmascarar directo por alfa'));

  const ocupacion = resumen.filter(r => r.bbox)
    .map(r => Math.round(Math.max(r.bbox.w, r.bbox.h) * 100 / Math.max(r.w, r.h)));
  console.log('  ocupacion de la silueta en el lienzo: ' +
    Math.min(...ocupacion) + '%-' + Math.max(...ocupacion) + '%  (margen muerto que hay que recortar)');

  /* --- presupuesto a tamaño de sello --- */
  console.log('\n--- PRESUPUESTO A TAMAÑO REAL (el sello son 56 px CSS) ---');
  const total = porAsset.size;
  for (const lado of [96, 128, 192]) {
    let suma = 0;
    for (const f of muestra) {
      const out = await sharp(path.join(DIR, f))
        .resize(lado, lado, { fit: 'inside' })
        .webp({ quality: 60, alphaQuality: 100 })
        .toBuffer();
      suma += out.length;
    }
    const media = suma / muestra.length;
    console.log('  ' + String(lado).padStart(4) + ' px  ->  ' + kb(media).padStart(7) + ' por glifo  ·  ' +
      mb(media * total).padStart(8) + ' los ' + total + '  ·  standalone +' + mb(media * total * 1.37) + ' (data URI)');
  }
  console.log('\n  (referencia: el sistema ACTUAL de 34 glifos SVG pesa 13 KB EN TOTAL)');
}

main().catch(e => { console.error(e.message); process.exit(1); });
