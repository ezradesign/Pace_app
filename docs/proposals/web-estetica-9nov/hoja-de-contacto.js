/* Hoja de contacto: node hoja.js REPO salida.webp alturaMax archivo1 archivo2 ... (lado a lado, misma altura de escala) */
const path = require('path');
const [REPO, salida, anchoCelda, altoMax, ...archivos] = process.argv.slice(2);
const sharp = require(path.join(REPO, 'node_modules', 'sharp'));
(async () => {
  const W = +anchoCelda, H = +altoMax, G = 16;
  const piezas = [];
  let x = G, alto = 0;
  for (const a of archivos) {
    const m = await sharp(a).metadata();
    const h = Math.min(H, Math.round(m.height * W / m.width));
    const buf = await sharp(a).resize({ width: W }).extract({ left: 0, top: 0, width: W, height: h }).png().toBuffer();
    piezas.push({ input: buf, left: x, top: G }); x += W + G; alto = Math.max(alto, h);
  }
  await sharp({ create: { width: x, height: alto + 2 * G, channels: 3, background: '#888' } }).composite(piezas).webp({ quality: 80 }).toFile(salida);
  console.log(salida, x, alto + 2 * G);
})();
