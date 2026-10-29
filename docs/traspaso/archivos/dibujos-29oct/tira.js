'use strict';
// Tiras de máscaras de ejercicio pintadas con la tinta de Mueve sobre su círculo, todas al mismo tamaño.
//   node tira.js set <salida.png> <lado> <filas> [nuevo,nuevo…]   el set entero de app/glyphs/assets/ejercicios,
//                                                                 con un aro terracota en los nuevos
//   node tira.js lista <salida.png> <lado> <columnas> <webp|->…   las máscaras dadas, en orden («-» deja hueco)
const fs = require('fs');
const path = require('path');
const W = path.resolve(__dirname, '..', '..', '..', '..');
const sharp = require(W + '/node_modules/sharp');
const DIR = W + '/app/glyphs/assets/ejercicios';
const G = 8;

async function pintar(salida, T, cols, archivos, nuevos) {
  const filas = Math.ceil(archivos.length / cols), comp = [];
  const disco = (aro) => Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="' + T + '" height="' + T + '"><circle cx="' + T / 2 +
    '" cy="' + T / 2 + '" r="' + (T / 2 - 2) + '" fill="#E4DAC6"' + (aro ? ' stroke="#B5643C" stroke-width="' + Math.max(2, T / 40) + '"' : '') + '/></svg>');
  for (let i = 0; i < archivos.length; i++) {
    const x = (i % cols) * (T + G), y = Math.floor(i / cols) * (T + G), f = archivos[i];
    comp.push({ input: disco(nuevos.includes(path.basename(f, '.webp'))), left: x, top: y });
    if (f === '-') continue;
    const L = Math.round(T * 0.9);
    const a = await sharp(f).ensureAlpha().extractChannel(3).resize(L, L).raw().toBuffer({ resolveWithObject: true });
    const n = a.info.width * a.info.height, rgba = Buffer.alloc(n * 4);
    for (let j = 0; j < n; j++) { rgba[j * 4] = 0x8a; rgba[j * 4 + 1] = 0x6d; rgba[j * 4 + 2] = 0x45; rgba[j * 4 + 3] = a.data[j]; }
    const pieza = await sharp(rgba, { raw: { width: a.info.width, height: a.info.height, channels: 4 } }).png().toBuffer();
    comp.push({ input: pieza, left: x + Math.round(T * 0.05), top: y + Math.round(T * 0.05) });
  }
  await sharp({ create: { width: cols * (T + G) - G, height: filas * (T + G) - G, channels: 3, background: '#F2EDE0' } })
    .composite(comp).png().toFile(salida);
}

(async () => {
  const [modo, salida, Ts, Ns, ...resto] = process.argv.slice(2);
  if (modo === 'set') {
    const todos = fs.readdirSync(DIR).filter((f) => /\.webp$/.test(f) && !/\.min\.webp$/.test(f)).sort().map((f) => DIR + '/' + f);
    const cols = Math.ceil(todos.length / +Ns);
    await pintar(salida, +Ts, cols, todos, resto[0] ? resto[0].split(',') : []);
    console.log(salida, todos.length + ' glifos en ' + Ns + ' filas de ' + cols);
  } else {
    await pintar(salida, +Ts, +Ns, resto, []);
  }
})();
