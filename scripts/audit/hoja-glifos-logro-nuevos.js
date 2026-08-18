/* HOJA DE CONTACTOS s167 · LOS DIBUJOS DE LOGRO SIN ASIGNAR
 * =========================================================
 * Los PNG que entrega el usuario vienen con nombre de TIMESTAMP, asi que no hay
 * forma de hablar de ellos —ni de asignarlos a un logro— sin verlos a la vez.
 * Esto los monta en una rejilla NUMERADA para que la conversacion pueda ser
 * «el 7 va a streak.7» en vez de una cadena de 40 caracteres.
 *
 * EL NUMERO ES LA CLAVE DE LA CONVERSACION, NO DEL MAPEO. La asignacion final
 * se escribe en `MAPEO` por **nombre de archivo**, que es una clave estable;
 * indexar por posicion es exactamente lo que s146 demostro que reasigna los
 * glifos en silencio (0 de 50 posiciones seguian coincidiendo al añadir 8
 * dibujos). Por eso la hoja imprime tambien el nombre debajo de cada numero.
 *
 * Uso:  node scripts/audit/hoja-glifos-logro-nuevos.js <repo> <salida.png> [carpeta]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(process.argv[2] || process.cwd());
const SALIDA = process.argv[3] || path.join(ROOT, '_revision-glifos-nuevos.png');
const ORIGEN = process.argv[4] || path.resolve(ROOT, '..', 'Glifos de logros');
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const CELDA = 320;
const ETIQUETA = 46;
const COLS = 5;
const PAPEL = { r: 242, g: 237, b: 224 };   // --paper de PACE

(async () => {
  if (!fs.existsSync(ORIGEN)) { console.error('No existe: ' + ORIGEN); process.exit(1); }
  const pngs = fs.readdirSync(ORIGEN).filter(f => /\.png$/i.test(f)).sort();
  if (!pngs.length) { console.error('Cero PNG en ' + ORIGEN); process.exit(1); }

  const filas = Math.ceil(pngs.length / COLS);
  const W = COLS * CELDA;
  const H = filas * (CELDA + ETIQUETA);

  const capas = [];
  for (let i = 0; i < pngs.length; i++) {
    const col = i % COLS, fil = Math.floor(i / COLS);
    const x = col * CELDA, y = fil * (CELDA + ETIQUETA);
    const buf = await sharp(path.join(ORIGEN, pngs[i]))
      .resize(CELDA - 24, CELDA - 24, { fit: 'contain', background: { ...PAPEL, alpha: 1 } })
      .png().toBuffer();
    capas.push({ input: buf, left: x + 12, top: y + 12 });

    const etq = Buffer.from(
      '<svg width="' + CELDA + '" height="' + ETIQUETA + '">' +
      '<rect width="100%" height="100%" fill="rgb(242,237,224)"/>' +
      '<text x="' + (CELDA / 2) + '" y="24" font-family="Georgia,serif" font-size="22" ' +
      'font-weight="bold" fill="#1a1a1a" text-anchor="middle">' + (i + 1) + '</text>' +
      '<text x="' + (CELDA / 2) + '" y="40" font-family="monospace" font-size="9" ' +
      'fill="#6b6b6b" text-anchor="middle">' + pngs[i].slice(-18, -4) + '</text>' +
      '</svg>');
    capas.push({ input: etq, left: x, top: y + CELDA });
  }

  await sharp({ create: { width: W, height: H, channels: 3, background: PAPEL } })
    .composite(capas).png().toFile(SALIDA);

  console.log('\n  hoja: ' + pngs.length + ' dibujos en ' + COLS + 'x' + filas + ' -> ' + SALIDA + '\n');
  pngs.forEach((f, i) => console.log('  ' + String(i + 1).padStart(2) + '. ' + f));
  console.log('');
})().catch(e => { console.error('HOJA ROTA:', e.message); process.exit(1); });
