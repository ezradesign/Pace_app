/* Las fotos de lo montado (1C 2A 3B 4B 5A de Ez): node docs/proposals/sidebar-23nov/banco/recortes-montado.js */
'use strict';
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const S = path.join(__dirname, 'salida');
const F = path.join(__dirname, '..', 'montado');
fs.mkdirSync(F, { recursive: true });
const barra = { left: 0, top: 0, width: 280, height: 720 };
const L = [
  ['barra-es-deshacer.jpg', 'montado', 'libre-es-crema-1280x720.jpg', barra],
  ['barra-en-oscuro-undo.jpg', 'montado', 'libre-en-oscuro-1280x720.jpg', barra],
  ['barra-es-jornada-1366.jpg', 'montado', 'jornada-es-crema-1366x768.jpg', { left: 0, top: 0, width: 280, height: 768 }],
  ['barra-es-libre.jpg', 'montado-sin', 'libre-es-crema-1280x720.jpg', barra],
  ['barra-es-primer-dia.jpg', 'montado-sin', 'primer-es-crema-1280x720.jpg', barra],
  ['cajon-es-deshacer.jpg', 'montado', 'libre-es-crema-360x640.jpg', null],
  ['cajon-en-oscuro-jornada.jpg', 'montado', 'jornada-en-oscuro-360x640.jpg', null],
  ['cajon-es-primer-dia.jpg', 'montado-sin', 'primer-es-crema-360x640.jpg', null],
  ['ventana-1280-es.jpg', 'montado-sin', 'libre-es-crema-1280x720.jpg', null],
];
(async () => {
  for (const [sal, dir, foto, rec] of L) {
    let img = sharp(path.join(S, dir, foto));
    if (rec) img = img.extract(rec);
    await img.jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(F, sal));
  }
  console.log(L.length + ' fotos en montado/');
})();
