/* glifos-56px.js — la pregunta que decide todo: ¿que queda del dibujo cuando se
   pinta al tamaño real del sello (56 px CSS)?

   Hace tres cosas:
     1. detecta si el arte trae su propia CIRCUNFERENCIA (el sello ya pinta dos)
     2. mide cuanta tinta SOBREVIVE al bajar a 56 px, con y sin el circulo
     3. escribe una hoja de contactos para MIRARLA, no para fiarse del numero

   uso: node scripts/audit/glifos-56px.js [carpeta] [salida.png]
*/
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = process.argv[2] || path.resolve(__dirname, '..', '..', '..', 'Glifos_logros');
const OUT = process.argv[3] || path.resolve(__dirname, '..', '..', '..', 'glifos-56px.png');

const SELLO = 56;      // px CSS del sello en Achievements.jsx
const DPR = 2;         // pantallas densas
const ZOOM = 6;        // ampliacion SOLO para poder mirarlo en la hoja

/* densidad de tinta 0..1 de un buffer raw gris */
function tinta(data, w, h) {
  let n = 0;
  for (let i = 0; i < data.length; i++) if (data[i] < 240) n++;
  return n / (w * h);
}

/* ¿hay un anillo de tinta pegado al borde? Se compara la densidad del anillo
   exterior (radio 0.88-1.0) con la del interior. Un dibujo con circunferencia
   propia tiene el anillo MUCHO mas cargado que el resto. */
function tieneCircunferencia(data, w, h) {
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2;
  let anillo = 0, anilloPx = 0, dentro = 0, dentroPx = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot(x - cx, y - cy) / R;
      if (d > 1) continue;
      const oscuro = data[y * w + x] < 240 ? 1 : 0;
      if (d >= 0.88) { anillo += oscuro; anilloPx++; }
      else { dentro += oscuro; dentroPx++; }
    }
  }
  const dA = anilloPx ? anillo / anilloPx : 0;
  const dD = dentroPx ? dentro / dentroPx : 0;
  return { densidadAnillo: +dA.toFixed(4), densidadInterior: +dD.toFixed(4), ratio: dD ? +(dA / dD).toFixed(2) : 0 };
}

async function main() {
  const files = fs.readdirSync(DIR).filter(f => /\.png$/i.test(f)).sort();
  /* un archivo por asset distinto */
  const vistos = new Set(); const unicos = [];
  for (const f of files) {
    const k = (f.match(/^asset_([a-z0-9]+)_/i) || [, f])[1];
    if (vistos.has(k)) continue;
    vistos.add(k); unicos.push(f);
  }
  console.log('=== ¿QUE QUEDA A 56 px? · ' + unicos.length + ' dibujos distintos ===\n');

  const muestra = unicos.slice(0, 8);
  const tiras = [];
  console.log('archivo                        circunf.  tinta@2880   tinta@112   retiene   contraste');

  for (const f of muestra) {
    const src = path.join(DIR, f);
    const g = sharp(src).greyscale();
    const { data, info } = await g.raw().toBuffer({ resolveWithObject: true });
    const t0 = tinta(data, info.width, info.height);
    const circ = tieneCircunferencia(data, info.width, info.height);

    /* a tamaño real de pintado */
    const lado = SELLO * DPR;
    const chico = await sharp(src).greyscale().resize(lado, lado, { fit: 'inside' })
      .raw().toBuffer({ resolveWithObject: true });
    const t1 = tinta(chico.data, chico.info.width, chico.info.height);
    let min = 255, max = 0;
    for (const v of chico.data) { if (v < min) min = v; if (v > max) max = v; }

    console.log(
      f.slice(0, 28).padEnd(31) +
      (circ.ratio + 'x').padEnd(10) +
      ((t0 * 100).toFixed(2) + '%').padEnd(13) +
      ((t1 * 100).toFixed(2) + '%').padEnd(12) +
      ((t1 / t0 * 100).toFixed(0) + '%').padEnd(10) +
      ('L ' + min + '-' + max)
    );

    /* tira: original reducido | version a 56 px ampliada, para MIRAR */
    const grande = await sharp(src).resize(SELLO * ZOOM, SELLO * ZOOM, { fit: 'inside' }).png().toBuffer();
    const real = await sharp(src).resize(lado, lado, { fit: 'inside' })
      .resize(SELLO * ZOOM, SELLO * ZOOM, { kernel: 'nearest' }).png().toBuffer();
    tiras.push({ grande, real });
  }

  /* hoja de contactos: fila 1 = el arte, fila 2 = lo que se ve a 56 px */
  const C = SELLO * ZOOM;
  const w = C * tiras.length, h = C * 2;
  const lienzo = sharp({ create: { width: w, height: h, channels: 3, background: '#F2EDE0' } });
  const capas = [];
  tiras.forEach((t, i) => {
    capas.push({ input: t.grande, left: i * C, top: 0 });
    capas.push({ input: t.real, left: i * C, top: C });
  });
  await lienzo.composite(capas).png().toFile(OUT);
  console.log('\nhoja de contactos escrita en: ' + OUT);
  console.log('  fila de ARRIBA  = el arte tal cual');
  console.log('  fila de ABAJO   = lo que se ve realmente en el sello (56 px), ampliado ' + ZOOM + 'x');
}

main().catch(e => { console.error(e.message); process.exit(1); });
