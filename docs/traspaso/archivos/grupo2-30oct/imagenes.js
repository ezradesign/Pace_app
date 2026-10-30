'use strict';
const path = require('path');
const fs = require('fs');
const C = require('./comun');
const sharp = require(path.join(C.RAIZ, 'node_modules', 'sharp'));
const OUT = path.join(C.FOTOS, 'pagina', 'fotos');
fs.mkdirSync(OUT, { recursive: true });
const H = (n) => path.join(C.FOTOS, 'fotos-hoy', n + '.png');
const F = (n) => path.join(C.FOTOS, 'fotos', n + '.jpg');
const lista = [];
for (const t of ['', '-osc']) {
  lista.push(
    ['q1-hoy-m' + t, H('carta-m' + t)], ['q1-hoy-e' + t, H('carta-e' + t)],
    ['q1-x-m' + t, F('q1-carta-m' + t)], ['q1-x-e' + t, F('q1-carta-e' + t)],
    ['q1-sobre-m' + t, F('q1-sobre-m' + t)], ['q1-sobre-e' + t, F('q1-sobre-e' + t)],
    ['q1-sobre-zoom-e' + t, F('q1-sobre-e' + t), { left: 1320, top: 0, width: 600, height: 120 }],
    ['q2-hoy-m' + t, F('q2-hoy-m' + t)], ['q2-A-m' + t, F('q2-A-m' + t)], ['q2-B-m' + t, F('q2-B-m' + t)], ['q2-C-m' + t, F('q2-C-m' + t)],
    ['q2-esc' + t, H('dia-e' + t)],
    ['q3-B-m' + t, F('q3-B-m' + t)], ['q3-B-e' + t, F('q3-B-e' + t)],
    ['q4-hoy-m' + t, H('preview-m' + t)], ['q4-hoy-e' + t, H('preview-e' + t)],
    ['q4-A-m' + t, F('q4-A-m' + t)], ['q4-A-abajo-m' + t, F('q4-A-abajo-m' + t)], ['q4-A-e' + t, F('q4-A-e' + t)],
    ['q4-B-lista-m' + t, F('q4-B-lista-m' + t)], ['q4-B-m' + t, F('q4-B-m' + t)], ['q4-B-e' + t, F('q4-B-e' + t)],
  );
}
(async () => {
  let total = 0;
  for (const [n, src, crop] of lista) {
    let s = sharp(src);
    const m = await s.metadata();
    if (crop) s = s.extract(crop);
    else if (m.width > 1400) s = s.resize(1920);
    else s = s.resize(720);
    const o = path.join(OUT, n + '.jpg');
    await s.jpeg({ quality: 80, mozjpeg: true }).toFile(o);
    total += fs.statSync(o).size;
  }
  console.log(lista.length, 'fotos', Math.round(total / 1024) + ' KB');
})();
