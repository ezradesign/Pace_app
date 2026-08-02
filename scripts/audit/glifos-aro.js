/* glifos-aro.js — detectar la circunferencia del arte de forma FIABLE.

   Los dos intentos anteriores fallaron por la misma razon: buscaban el radio de
   MAXIMA DENSIDAD de tinta, y en los dibujos con motivo grande (el pergamino,
   la silla, el corazon) el pico es el motivo, no el marco. Resultado: el aro se
   detectaba en 3 de 10, y midiendo los 50 los radios salian dispersos entre
   0.60 y 0.88 — que no es que los aros varien, es que la mitad de las medidas
   eran del motivo.

   La propiedad que SI distingue un aro: **cubre todos los angulos**. Un motivo,
   por grande que sea, deja huecos al girar alrededor del centro; una
   circunferencia no. Asi que se mide COBERTURA ANGULAR por radio y se coge el
   radio mas exterior cuya cobertura pase del 90 %.

   uso: node scripts/audit/glifos-aro.js [carpeta]
*/
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = process.argv[2] || path.resolve(__dirname, '..', '..', '..', 'Glifos_logros');
const SUELO = 238;
const MUESTRA = 512;      // lado al que se reduce para medir (rapido y suficiente)
const ANGULOS = 360;
const COBERTURA_MIN = 0.90;

/* Devuelve { r, cobertura } del aro, o null si el dibujo no tiene marco. */
function detectarAro(data, w, h) {
  const cx = (w - 1) / 2, cy = (h - 1) / 2, R = Math.min(w, h) / 2;
  const tinta = (x, y) => {
    const xi = Math.round(x), yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= w || yi >= h) return false;
    return data[yi * w + xi] < SUELO;
  };
  let mejor = null;
  /* de fuera hacia dentro: interesa el marco MAS EXTERIOR */
  for (let k = 98; k >= 55; k--) {
    const r = (k / 100) * R;
    let vistos = 0;
    for (let a = 0; a < ANGULOS; a++) {
      const th = (a / ANGULOS) * Math.PI * 2;
      /* ventana radial de +-1.5 px: la linea es fina y el borde, irregular */
      let hay = false;
      for (let d = -1.5; d <= 1.5 && !hay; d += 0.5) {
        if (tinta(cx + (r + d) * Math.cos(th), cy + (r + d) * Math.sin(th))) hay = true;
      }
      if (hay) vistos++;
    }
    const cob = vistos / ANGULOS;
    if (cob >= COBERTURA_MIN) { mejor = { r: k / 100, cobertura: cob }; break; }
  }
  return mejor;
}

async function main() {
  const files = fs.readdirSync(DIR).filter(f => /\.png$/i.test(f)).sort();
  const vistos = new Map();
  for (const f of files) {
    const k = (f.match(/^asset_([a-z0-9]+)_/i) || [, f])[1];
    if (!vistos.has(k)) vistos.set(k, f);
  }
  const unicos = [...vistos.values()];

  const radios = [];
  let sinAro = [];
  for (let i = 0; i < unicos.length; i++) {
    const { data, info } = await sharp(path.join(DIR, unicos[i]))
      .greyscale().resize(MUESTRA, MUESTRA, { fit: 'inside' })
      .raw().toBuffer({ resolveWithObject: true });
    const aro = detectarAro(data, info.width, info.height);
    if (aro) radios.push({ n: i + 1, r: aro.r, cob: aro.cobertura });
    else sinAro.push(i + 1);
  }

  console.log('=== COBERTURA ANGULAR · ' + unicos.length + ' dibujos ===\n');
  console.log('con aro detectado: ' + radios.length + ' de ' + unicos.length);
  if (sinAro.length) console.log('SIN aro: #' + sinAro.join(', #'));
  const rs = radios.map(x => x.r).sort((a, b) => a - b);
  const q = p => rs[Math.floor(rs.length * p)];
  console.log('radio: min ' + q(0).toFixed(2) + '  p25 ' + q(.25).toFixed(2) +
    '  mediana ' + q(.5).toFixed(2) + '  p75 ' + q(.75).toFixed(2) + '  max ' + rs[rs.length - 1].toFixed(2));
  const med = q(.5);
  console.log('a menos de 0.03 de la mediana: ' + rs.filter(r => Math.abs(r - med) < 0.03).length + ' de ' + rs.length);
  console.log('cobertura media: ' + (radios.reduce((s, x) => s + x.cob, 0) / radios.length * 100).toFixed(1) + '%');
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { detectarAro, SUELO };
