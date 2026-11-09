/* Hoja de contactos: node hoja.js salida.png ancho columnas foto1.png foto2.png ... */
'use strict';
const sharp = require('sharp');
const path = require('path');
(async () => {
  const [salida, anchoS, colsS, ...fotos] = process.argv.slice(2);
  const ancho = Number(anchoS), cols = Number(colsS);
  const celdas = [];
  for (const f of fotos) {
    const img = sharp(f);
    const m = await img.metadata();
    const alto = Math.round(m.height * ancho / m.width);
    const buf = await img.resize(ancho, alto).png().toBuffer();
    celdas.push({ buf, alto, nombre: path.basename(f, '.png') });
  }
  const filas = Math.ceil(celdas.length / cols);
  const altoFila = [];
  for (let r = 0; r < filas; r++) altoFila.push(Math.max(...celdas.slice(r * cols, r * cols + cols).map((c) => c.alto)) + 18);
  const total = altoFila.reduce((a, b) => a + b, 0);
  const comp = [];
  let y = 0;
  celdas.forEach((c, i) => {
    const r = Math.floor(i / cols), k = i % cols;
    if (k === 0 && r > 0) y += altoFila[r - 1];
    const x = k * (ancho + 6);
    const svg = Buffer.from('<svg width="' + ancho + '" height="18"><rect width="100%" height="100%" fill="#222"/><text x="4" y="13" font-size="12" fill="#fff" font-family="Arial">' + c.nombre.replace(/&/g, '&amp;') + '</text></svg>');
    comp.push({ input: svg, left: x, top: y });
    comp.push({ input: c.buf, left: x, top: y + 18 });
  });
  await sharp({ create: { width: cols * (ancho + 6), height: total, channels: 3, background: '#888' } }).composite(comp).png().toFile(salida);
  console.log(salida);
})();
