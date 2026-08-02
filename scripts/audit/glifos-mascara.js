/* glifos-mascara.js — la prueba que decide el formato.

   El arte es lapiz palido: medido, el pixel mas oscuro de varios glifos se
   queda en L 171-187, y el papel de PACE es #F2EDE0 (L≈237). Puesto tal cual
   sobre el papel, eso es un susurro. Es EXACTAMENTE el problema que tuvo el
   loto en s138, y alli se resolvio usando el arte como MASCARA: la forma la
   pone el dibujo y el color lo pone el token, asi que el contraste queda
   garantizado en las tres paletas sin retocar el arte.

   Esta hoja compara, al tamaño real del sello y sobre el papel real:
     fila 1 — el arte tal cual (imagen)
     fila 2 — el arte como MASCARA teñida con --achievement (#B8934A)
     fila 3 — la mascara en estado BLOQUEADO (--ink-3 #8A8372)

   uso: node scripts/audit/glifos-mascara.js [carpeta] [salida.png]
*/
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = process.argv[2] || path.resolve(__dirname, '..', '..', '..', 'Glifos_logros');
const OUT = process.argv[3] || path.resolve(__dirname, '..', '..', '..', 'glifos-mascara.png');

const SELLO = 56, DPR = 2, ZOOM = 6;
const PAPEL = { r: 0xF2, g: 0xED, b: 0xE0 };          // --paper
const ACENTO = { r: 0xB8, g: 0x93, b: 0x4A };         // --achievement
const APAGADO = { r: 0x8A, g: 0x83, b: 0x72 };        // --ink-3

/* Suelo del papel: medido, el fondo del arte vive entre 240 y 255. Todo lo que
   este por encima es papel y va a alpha 0; por debajo, la tinta se estira hasta
   opacidad plena. Sin este suelo la mascara deja un VELO sobre todo el sello. */
const SUELO = 238;

async function mascaraTeñida(src, lado, color) {
  const { data, info } = await sharp(src).greyscale()
    .resize(lado, lado, { fit: 'inside' })
    .raw().toBuffer({ resolveWithObject: true });

  const w = info.width, h = info.height;
  const out = Buffer.alloc(w * h * 3);
  /* NORMALIZAR POR EL PIXEL MAS OSCURO — esto es lo que hacia el loto (s138) y
     lo que se me olvido en la primera version de este script: con
     `(SUELO - L) / SUELO` una linea palida de L 187 sale al 21 % de opacidad,
     o sea MAS tenue que el original, y la mascara parecia una mala idea.
     Normalizando, la tinta mas oscura de CADA dibujo llega a opacidad plena y
     el arte palido se levanta hasta el mismo peso que el oscuro. */
  let negro = 255;
  for (let i = 0; i < w * h; i++) if (data[i] < negro) negro = data[i];
  const rango = Math.max(1, SUELO - negro);
  for (let i = 0; i < w * h; i++) {
    const L = data[i];
    const a = L >= SUELO ? 0 : Math.min(1, (SUELO - L) / rango);
    out[i * 3]     = Math.round(PAPEL.r + (color.r - PAPEL.r) * a);
    out[i * 3 + 1] = Math.round(PAPEL.g + (color.g - PAPEL.g) * a);
    out[i * 3 + 2] = Math.round(PAPEL.b + (color.b - PAPEL.b) * a);
  }
  return { buf: await sharp(out, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer(), w, h, negro };
}

async function main() {
  const files = fs.readdirSync(DIR).filter(f => /\.png$/i.test(f)).sort();
  const vistos = new Set(); const unicos = [];
  for (const f of files) {
    const k = (f.match(/^asset_([a-z0-9]+)_/i) || [, f])[1];
    if (!vistos.has(k)) { vistos.add(k); unicos.push(f); }
  }
  const muestra = unicos.slice(0, 8);
  const lado = SELLO * DPR;

  console.log('=== ARTE TAL CUAL vs MASCARA TEÑIDA (56 px, sobre papel crema) ===\n');
  console.log('archivo                        L min tal cual   contraste vs papel   con mascara');

  const filas = [[], [], []];
  for (const f of muestra) {
    const src = path.join(DIR, f);

    /* fila 1 — imagen tal cual sobre papel */
    const plano = await sharp(src).resize(lado, lado, { fit: 'inside' })
      .flatten({ background: '#F2EDE0' }).png().toBuffer();

    const g = await sharp(plano).greyscale().raw().toBuffer();
    let negro = 255; for (const v of g) if (v < negro) negro = v;

    const m1 = await mascaraTeñida(src, lado, ACENTO);
    const m2 = await mascaraTeñida(src, lado, APAGADO);

    /* contraste = diferencia de luminancia contra el papel (L 237) */
    const cTal = 237 - negro;
    const cMasc = 237 - Math.round(0.299 * ACENTO.r + 0.587 * ACENTO.g + 0.114 * ACENTO.b);
    console.log(
      f.slice(0, 28).padEnd(31) +
      ('L ' + negro).padEnd(17) +
      (cTal + ' niveles').padEnd(21) +
      (cMasc + ' niveles  (x' + (cMasc / Math.max(1, cTal)).toFixed(1) + ')')
    );

    const amp = b => sharp(b).resize(SELLO * ZOOM, SELLO * ZOOM, { kernel: 'nearest' }).png().toBuffer();
    filas[0].push(await amp(plano));
    filas[1].push(await amp(m1.buf));
    filas[2].push(await amp(m2.buf));
  }

  const C = SELLO * ZOOM;
  const capas = [];
  filas.forEach((fila, r) => fila.forEach((b, i) => capas.push({ input: b, left: i * C, top: r * C })));
  await sharp({ create: { width: C * muestra.length, height: C * 3, channels: 3, background: '#F2EDE0' } })
    .composite(capas).png().toFile(OUT);

  console.log('\nhoja escrita en: ' + OUT);
  console.log('  fila 1 = arte tal cual sobre el papel de PACE');
  console.log('  fila 2 = mascara teñida con --achievement (logro CONSEGUIDO)');
  console.log('  fila 3 = mascara teñida con --ink-3 (logro BLOQUEADO)');
}

main().catch(e => { console.error(e.message); process.exit(1); });
