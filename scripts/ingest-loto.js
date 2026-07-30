/* PACE · scripts/ingest-loto.js (sesión 138)
   Ingesta del loto de Respira: convierte el PNG del usuario
   (`app/breathe/Loto_png.png`, 1024x1024, 959 KB) en la MÁSCARA CSS
   `app/breathe/assets/loto.webp`.

   Uso:  node scripts/ingest-loto.js

   POR QUÉ UNA MÁSCARA Y NO UNA IMAGEN
   -----------------------------------
   El original es línea crema sobre transparente. Puesto tal cual sobre el papel
   crema (`--paper #F2EDE0`) era prácticamente invisible: ese era el problema de
   contraste. Medido con sharp:

     - el ALFA del PNG es solo la SILUETA — histograma bimodal (112.985 px a ~0
       y 146.964 px a 224+), así que enmascarar por alfa daba una MANCHA sólida
       y perdía todo el dibujo;
     - el DIBUJO (capas de pétalos, semilla de la vida del centro) vive en la
       LUMINANCIA: L de 76 a 255, media 219.

   Por eso la máscara se reconstruye desde la DENSIDAD DE TINTA —
   `(255 - L) / (255 - 76)`, acotada por el alfa original para no pintar fuera de
   la flor— y el RGB se aplana a blanco. El color lo pone el token `--breathe`
   vía `mask-image`, así que el contraste queda garantizado en las tres paletas
   sin tocar el arte: en crema se lee como tinta terracota, en oscuro como línea
   encendida.

   Parámetros elegidos (medidos, no a ojo):
     - recorte cuadrado 864 px centrado en (511, 502) — bbox del contenido
       x 113..909 / y 83..922, es decir 797x840 con el margen simétrico mínimo;
     - salida 640 px: el loto se pinta como mucho a ~275 px CSS (wrap 400 x 0.51
       x 1.35), así que 640 cubre holgadamente DPR 2;
     - quality 60 / **alphaQuality 100**. Esto último NO es un lujo: el dibujo
       ENTERO viaja en el alfa, y comprimirlo con pérdida lo motea por bloques
       justo en las venas de los pétalos (comparado a 3x: con alphaQuality 65 el
       relleno sale granulado; con 100 queda limpio). Fue el «se ve pixelado»
       reportado por el usuario, y no era resolución sino compresión del alfa.
       Cuesta 146 KB frente a 59 KB, dentro del rango de las láminas (74-234 KB).

   Regla D-4: el arte se mide UNA vez. Si el usuario aporta un loto nuevo, se
   vuelve a correr este script — nunca se sustituye el .webp a mano. */

'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'app', 'breathe', 'Loto_png.png');
const OUT_DIR = path.join(ROOT, 'app', 'breathe', 'assets');
const OUT = path.join(OUT_DIR, 'loto.webp');

const CENTRO_X = 511, CENTRO_Y = 502;   // centro del bbox medido
const LADO = 864;                        // 840 de contenido + margen simétrico
const SALIDA = 640;
const L_MIN = 76;                        // luminancia de la línea más oscura
const Q = 60, ALPHA_Q = 100;   // alfa SIN pérdida: es donde vive el dibujo

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error('No encuentro el original:', SRC);
    process.exit(1);
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const { data, info } = await sharp(SRC)
    .extract({
      left: Math.round(CENTRO_X - LADO / 2),
      top: Math.round(CENTRO_Y - LADO / 2),
      width: LADO, height: LADO,
    })
    .resize(SALIDA, SALIDA, { kernel: 'lanczos3' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // RGB plano a blanco; el ALFA pasa a ser la densidad de tinta del dibujo.
  const mask = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    const L = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    const tinta = Math.max(0, Math.min(1, (255 - L) / (255 - L_MIN)));
    mask[i] = 255; mask[i + 1] = 255; mask[i + 2] = 255;
    mask[i + 3] = Math.round(255 * tinta * a);
  }

  const webp = await sharp(mask, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: Q, alphaQuality: ALPHA_Q, effort: 6 })
    .toBuffer();
  fs.writeFileSync(OUT, webp);

  const origKB = fs.statSync(SRC).size / 1024;
  const outKB = webp.length / 1024;
  console.log(`  origen : ${path.relative(ROOT, SRC)}  ${origKB.toFixed(0)} KB  1024x1024`);
  console.log(`  salida : ${path.relative(ROOT, OUT)}  ${outKB.toFixed(1)} KB  ${SALIDA}x${SALIDA}  (mascara, alfa = tinta)`);
  console.log(`  peso   : -${(100 * (1 - outKB / origKB)).toFixed(1)} %`);
}

main().catch(e => { console.error(e); process.exit(1); });
