'use strict';
const path = require('path');
const fs = require('fs');
const C = require('./comun');
const sharp = require(path.join(C.RAIZ, 'node_modules', 'sharp'));
const OUT = path.join(C.FOTOS, 'pagina-montado', 'fotos');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  let total = 0, n = 0;
  for (const f of fs.readdirSync(path.join(C.FOTOS, 'montado')).filter((x) => x.endsWith('.jpg'))) {
    let s = sharp(path.join(C.FOTOS, 'montado', f));
    const m = await s.metadata();
    if (/zoom/.test(f)) s = s; else if (m.width > 1400) s = s.resize(1920); else s = s.resize(720);
    const o = path.join(OUT, f);
    await s.jpeg({ quality: 80, mozjpeg: true }).toFile(o);
    total += fs.statSync(o).size; n++;
  }
  console.log(n, 'fotos', Math.round(total / 1024) + ' KB');
})();
