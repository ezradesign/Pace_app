/* PACE · compara las fotos de lo montado con las de la maqueta de la B: por cada pareja, las franjas
   (en px de la foto) donde algo cambia. Uso: node docs/proposals/web-estetica-9nov/comparar.js */
'use strict';
const path = require('path'), fs = require('fs');
const AQUI = __dirname, REPO = path.join(AQUI, '..', '..', '..');
const sharp = require(path.join(REPO, 'node_modules', 'sharp'));
const FOTOS = path.join(AQUI, 'fotos');
(async () => {
  const salida = {};
  for (const f of fs.readdirSync(FOTOS).filter((x) => x.startsWith('montada-'))) {
    const otra = path.join(FOTOS, f.replace('montada-', 'b-'));
    if (!fs.existsSync(otra)) continue;
    const [a, b] = await Promise.all([f, path.basename(otra)].map((n) => sharp(path.join(FOTOS, n)).raw().toBuffer({ resolveWithObject: true })));
    const W = a.info.width, H = Math.min(a.info.height, b.info.height), C = a.info.channels;
    const franjas = []; let dentro = null;
    for (let y = 0; y < H; y++) {
      let d = 0;
      for (let x = 0; x < W; x++) { const i = (y * W + x) * C; d += Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]); }
      const cambia = d / W > 6;
      if (cambia && !dentro) dentro = [y, y]; else if (cambia) dentro[1] = y; else if (dentro && y - dentro[1] > 12) { franjas.push(dentro); dentro = null; }
    }
    if (dentro) franjas.push(dentro);
    salida[f.replace(/^montada-|\.webp$/g, '')] = { alto: [a.info.height, b.info.height], franjas: franjas.map((r) => r.join('-')) };
  }
  for (const [k, v] of Object.entries(salida)) console.log(k.padEnd(24), 'alto', v.alto.join(' / '), v.franjas.length ? 'cambia en ' + v.franjas.slice(0, 6).join(', ') : 'igual');
  fs.writeFileSync(path.join(AQUI, 'comparacion.json'), JSON.stringify(salida, null, 1));
})();
