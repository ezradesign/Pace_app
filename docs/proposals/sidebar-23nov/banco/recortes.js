/* Las fotos de la página, recortadas del banco: node docs/proposals/sidebar-23nov/banco/recortes.js */
'use strict';
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const S = path.join(__dirname, 'salida');
const F = path.join(__dirname, '..', 'fotos');
fs.mkdirSync(F, { recursive: true });
const barra = (w) => ({ left: 0, top: 0, width: w >= 1900 ? 350 : 280 });
const L = [];
/* [salida, carpeta, foto, recorte] — sin recorte, la foto entera */
for (const v of ['hoy', '1a', '1b']) {
  L.push(['1-' + v + '-1092.jpg', v, 'jornada-es-crema-1092x496.jpg', null]);
  L.push(['1-' + v + '-1274-barra.jpg', v, 'libre-es-crema-1274x579.jpg', Object.assign(barra(1274), { height: 579 })]);
  L.push(['1-' + v + '-1092-barra.jpg', v, 'jornada-es-crema-1092x496.jpg', Object.assign(barra(1092), { height: 496 })]);
}
for (const v of ['hoy', '2a', '2b']) {
  L.push(['2-' + v + '-es.jpg', v, 'libre-es-crema-1280x720.jpg', { left: 0, top: 205, width: 280, height: 140 }]);
  L.push(['2-' + v + '-en-oscuro.jpg', v, 'libre-en-oscuro-1280x720.jpg', { left: 0, top: 205, width: 280, height: 140 }]);
  L.push(['2-' + v + '-movil.jpg', v, 'libre-es-crema-360x640.jpg', null]);
}
for (const v of ['hoy', '3b', '3c']) {
  L.push(['3-' + v + '-libre.jpg', v, 'libre-es-crema-1280x720.jpg', Object.assign(barra(1280), { height: 720 })]);
  L.push(['3-' + v + '-movil.jpg', v, 'libre-es-crema-360x640.jpg', null]);
}
for (const v of ['hoy', '3b']) L.push(['3-' + v + '-primer.jpg', v, 'primer-es-crema-1280x720.jpg', Object.assign(barra(1280), { height: 720 })]);
for (const v of ['hoy', '4b', '4c']) {
  for (const l of ['es', 'en']) {
    L.push(['4-' + v + '-' + l + '.jpg', v, 'libre-' + l + '-crema-1280x720.jpg', { left: 0, top: 110, width: 280, height: 100 }]);
    L.push(['4-' + v + '-' + l + '-movil.jpg', v, 'libre-' + l + '-crema-360x640.jpg', { left: 0, top: 95, width: 360, height: 100 }]);
  }
}
(async () => {
  for (const [sal, dir, foto, rec] of L) {
    const src = path.join(S, dir, foto);
    if (!fs.existsSync(src)) { console.log('falta', dir + '/' + foto); continue; }
    let img = sharp(src);
    if (rec) img = img.extract(rec);
    await img.jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(F, sal));
  }
  console.log(L.length + ' fotos');
})();
