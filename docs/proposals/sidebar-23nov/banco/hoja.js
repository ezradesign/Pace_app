/* Junta recortes de la barra en una hoja: node hoja.js salida.jpg ancho foto1 foto2 ... (ancho = px de la barra) */
'use strict';
const sharp = require('sharp');
const [salida, ancho, ...fotos] = process.argv.slice(2);
(async () => {
  const w = Number(ancho);
  const metas = await Promise.all(fotos.map((f) => sharp(f).metadata()));
  const alto = Math.max(...metas.map((m) => m.height));
  const piezas = await Promise.all(fotos.map((f, i) => sharp(f).extract({ left: 0, top: 0, width: Math.min(w, metas[i].width), height: metas[i].height }).toBuffer()));
  const sep = 12;
  await sharp({ create: { width: fotos.length * (w + sep), height: alto, channels: 3, background: '#888' } })
    .composite(piezas.map((p, i) => ({ input: p, left: i * (w + sep), top: 0 })))
    .jpeg({ quality: 84 }).toFile(salida);
})();
