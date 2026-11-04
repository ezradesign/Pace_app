/* Tamaños y recortes para la página de la maqueta (maqueta.html lee fotos/ a su lado).
   Uso: node imagenes.js   →   %TEMP%/pace-sin-querer-4nov/pagina/fotos/*.jpg */
'use strict';
const path = require('path');
const fs = require('fs');
const C = require('./comun');
const sharp = require(path.join(C.RAIZ, 'node_modules', 'sharp'));
const OUT = path.join(C.FOTOS, 'pagina', 'fotos');
fs.mkdirSync(OUT, { recursive: true });
/* Las de hoy van a 2x; las de la maqueta, a 2x en el móvil y a 1,5x en el escritorio. */
const H = (n) => [path.join(C.FOTOS, 'fotos-hoy', n + '.png'), 2];
const F = (n) => [path.join(C.FOTOS, 'fotos', n + '.jpg'), n.indexOf('-e') > 0 ? 1.5 : 2];
/* Recortes en px CSS de una ventana de 1280×879: el panel del día y el centro de la pantalla final. */
const PANEL = { left: 315, top: 575, width: 930, height: 304 };
const FINAL = { left: 240, top: 150, width: 800, height: 729 };
const lista = [];
for (const t of ['', '-osc']) {
  lista.push(
    ['q2-hoy-m' + t, H('home-m' + t)], ['q2-jornada-m' + t, H('jornada-m' + t)],
    ['q2-hoy-e' + t, H('linea-e' + t), PANEL], ['q2-hoy-tocada-e' + t, H('linea-tocada-e' + t), PANEL],
    ['q2-hoy-entera-e' + t, H('linea-e' + t)],
    ['q2-A-e' + t, F('q2-A-e' + t), PANEL], ['q2-A-otra-e' + t, F('q2-A-otra-e' + t), PANEL], ['q2-B-e' + t, F('q2-B-e' + t), PANEL],
    ['q4-hoy-m' + t, H('final-m' + t)], ['q4-hoy-no-m' + t, H('final-no-m' + t)], ['q4-hoy-e' + t, H('final-e' + t), FINAL],
    ['q4-A-m' + t, F('q4-A-m' + t)], ['q4-A-e' + t, F('q4-A-e' + t), FINAL],
    ['q4-B-m' + t, F('q4-B-m' + t)], ['q4-B-aparta-m' + t, F('q4-B-aparta-m' + t)],
    ['q4-B-e' + t, F('q4-B-e' + t), FINAL], ['q4-B-aparta-e' + t, F('q4-B-aparta-e' + t), FINAL],
    ['r1-hoy-m' + t, H('respira-m' + t)], ['r1-hoy-e' + t, H('respira-e' + t)],
    ['r1-A-m' + t, F('r1-A-m' + t)], ['r1-A-e' + t, F('r1-A-e' + t)],
    ['r1-B-m' + t, F('r1-B-m' + t)], ['r1-B-e' + t, F('r1-B-e' + t)],
    ['r1-C-m' + t, F('r1-C-m' + t)], ['r1-C-e' + t, F('r1-C-e' + t)],
  );
}
lista.push(['r1-hoy-abajo-m', H('respira-abajo-m')], ['r1-A-abajo-m', F('r1-A-abajo-m')], ['r1-C-abajo-m', F('r1-C-abajo-m')],
  ['r1-A-despues-m', F('r1-A-despues-m')], ['r1-A-despues-e', F('r1-A-despues-e')]);

(async () => {
  let total = 0;
  for (const [n, [src, dsf], crop] of lista) {
    let s = sharp(src);
    if (crop) s = s.extract({ left: Math.round(crop.left * dsf), top: Math.round(crop.top * dsf), width: Math.round(crop.width * dsf), height: Math.round(crop.height * dsf) }).resize(1300);
    else s = s.resize(n.indexOf('-e') > 0 ? 1600 : 540);
    const o = path.join(OUT, n + '.jpg');
    await s.jpeg({ quality: 80, mozjpeg: true }).toFile(o);
    total += fs.statSync(o).size;
  }
  console.log(lista.length, 'fotos', Math.round(total / 1024) + ' KB');
})().catch((e) => { console.error(e); process.exit(1); });
