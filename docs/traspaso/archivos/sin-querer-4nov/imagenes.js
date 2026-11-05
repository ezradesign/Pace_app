/* Tamaños y recortes para las páginas de Ez (cada página lee fotos/ a su lado).
   Uso: node imagenes.js             →   %TEMP%/pace-sin-querer-4nov/pagina/fotos/*.jpg (la maqueta)
        node imagenes.js montado     →   $PACE_PAGINA, o %TEMP%/pace-sin-querer-4nov/pagina-montado/fotos/*.jpg */
'use strict';
const path = require('path');
const fs = require('fs');
const C = require('./comun');
const sharp = require(path.join(C.RAIZ, 'node_modules', 'sharp'));
const MONTADO = process.argv[2] === 'montado';
const OUT = MONTADO ? (process.env.PACE_PAGINA || path.join(C.FOTOS, 'pagina-montado', 'fotos')) : path.join(C.FOTOS, 'pagina', 'fotos');
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

/* Lo montado: fotos-montado/ (montado.js) y fotos-ahora-no/ (ahora-no.js). */
if (MONTADO) {
  lista.length = 0;
  const M = (n) => [path.join(C.FOTOS, 'fotos-montado', n + '.jpg'), n.indexOf('-e') > 0 ? 1.5 : n.indexOf('-ez') > 0 ? 1.25 : 2];
  const A = (n) => [path.join(C.FOTOS, 'fotos-ahora-no', n + '.jpg'), /-ez/.test(n) ? 1.25 : /-(e|bajo)(-|$)/.test(n) ? 1.5 : 2];
  const PANEL_FICHA = { left: 315, top: 455, width: 930, height: 424 };
  const CENTRO_EZ = { left: 368, top: 60, width: 800, height: 648 };
  const CENTRO_BAJO = { left: 240, top: 0, width: 800, height: 600 };
  for (const t of ['', '-osc']) {
    lista.push(
      ['ficha-e' + t, M('q2-ficha-e' + t), PANEL_FICHA], ['ficha-otra-e' + t, M('q2-otra-e' + t), PANEL_FICHA], ['home-m' + t, M('q2-home-m' + t)],
      ['no-m' + t, M('q4-no-m' + t)], ['no-e' + t, M('q4-no-e' + t), FINAL],
      ['primera-m' + t, M('r1-primera-m' + t)], ['primera-e' + t, M('r1-primera-e' + t)],
    );
    for (const v of ['abajo', 'fila']) lista.push([v + '-m' + t, A(v + '-m' + t)], [v + '-e' + t, A(v + '-e' + t), FINAL]);
  }
  lista.push(['no-m-en', M('q4-no-m-en')], ['primera-m-en', M('r1-primera-m-en')], ['abajo-primera-m', M('r1-abajo-m')],
    ['despues-m', M('r1-despues-m')], ['despues-e', M('r1-despues-e')]);
  for (const v of ['abajo', 'fila']) {
    lista.push([v + '-ez-estira', A(v + '-ez-estira'), CENTRO_EZ], [v + '-ez', A(v + '-ez'), CENTRO_EZ], [v + '-bajo', A(v + '-bajo'), CENTRO_BAJO], [v + '-estrecho', A(v + '-estrecho')], [v + '-m-en', A(v + '-m-en')]);
  }
}

(async () => {
  let total = 0;
  for (const [n, [src, dsf], crop] of lista) {
    let s = sharp(src);
    if (crop) s = s.extract({ left: Math.round(crop.left * dsf), top: Math.round(crop.top * dsf), width: Math.round(crop.width * dsf), height: Math.round(crop.height * dsf) }).resize(1300);
    else s = s.resize(/-e(-|$)/.test(n) ? 1600 : 540);
    const o = path.join(OUT, n + '.jpg');
    await s.jpeg({ quality: 80, mozjpeg: true }).toFile(o);
    total += fs.statSync(o).size;
  }
  console.log(lista.length, 'fotos', Math.round(total / 1024) + ' KB');
})().catch((e) => { console.error(e); process.exit(1); });
