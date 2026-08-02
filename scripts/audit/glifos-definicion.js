/* glifos-definicion.js — dos quejas del usuario, un solo arreglo:
     «el circulo central les sobra»  y  «pueden tener mejor definicion».

   Se resuelven juntas: si se DETECTA la circunferencia del arte y se recorta por
   dentro, el aro desaparece y el motivo pasa a ocupar el sello entero, o sea que
   se reduce mucho menos al bajar a 56 px. Mas tres ajustes de nitidez medidos.

   Escribe una hoja comparando v1 (lo ingestado) contra v2 (esto), al tamaño
   real y ya teñido, para decidir MIRANDO.

   uso: node scripts/audit/glifos-definicion.js [carpeta] [salida.png]
*/
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = process.argv[2] || path.resolve(__dirname, '..', '..', '..', 'Glifos_logros');
const OUT = process.argv[3] || path.resolve(__dirname, '..', '..', '..', 'glifos-definicion.png');

const SELLO = 56, DPR = 2, ZOOM = 6, LADO = SELLO * DPR;
const PAPEL = { r: 0xF2, g: 0xED, b: 0xE0 };
const ACENTO = { r: 0xB8, g: 0x93, b: 0x4A };
const SUELO = 238;

/* --- 1. detectar la circunferencia propia del arte ---------------------------
   Perfil radial de densidad de tinta. El aro es un pico ESTRECHO y ALTO en la
   mitad exterior; el motivo, algo ancho y difuso en el centro. Se busca el
   radio de maxima densidad con r > 0.55 y se comprueba que destaque de su
   entorno, para no confundir un motivo circular (la luna llena, el reloj de
   sol) con un marco. */
function detectarAro(data, w, h) {
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2;
  const PASOS = 160;
  const suma = new Float64Array(PASOS), cuenta = new Float64Array(PASOS);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot(x - cx, y - cy) / R;
      if (d > 1) continue;
      const k = Math.min(PASOS - 1, (d * PASOS) | 0);
      cuenta[k]++;
      if (data[y * w + x] < SUELO) suma[k]++;
    }
  }
  const dens = Array.from({ length: PASOS }, (_, k) => (cuenta[k] ? suma[k] / cuenta[k] : 0));

  let mejor = -1, mejorK = -1;
  for (let k = (0.55 * PASOS) | 0; k < PASOS - 2; k++) {
    if (dens[k] > mejor) { mejor = dens[k]; mejorK = k; }
  }
  /* fondo local: mediana de la zona 0.35-0.55, que es motivo o papel */
  const zona = dens.slice((0.35 * PASOS) | 0, (0.55 * PASOS) | 0).slice().sort((a, b) => a - b);
  const fondo = zona[(zona.length / 2) | 0] || 0.0001;
  const destaca = mejor / Math.max(fondo, 0.0005);
  return { r: mejorK / PASOS, densidad: mejor, destaca, esAro: destaca > 2.2 && mejor > 0.02 };
}

/* --- 2. recortar por DENTRO del aro y ajustar al motivo --------------------- */
function recorte(data, w, h, aro) {
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2;
  /* si hay aro, se ignora todo lo que este a partir de un pelo por dentro */
  const limite = aro.esAro ? (aro.r * R) - (0.012 * R) : R;
  let minX = w, maxX = -1, minY = h, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[y * w + x] >= SUELO) continue;
      if (Math.hypot(x - cx, y - cy) > limite) continue;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  /* cuadrar y dar un 4 % de aire, para que el motivo no toque el borde */
  const cxm = (minX + maxX) / 2, cym = (minY + maxY) / 2;
  let lado = Math.round(Math.min(Math.max(maxX - minX, maxY - minY) * 1.08, Math.min(w, h)));
  /* clamp de VERDAD: recortar left/top a >=0 no basta, hay que garantizar
     tambien left+lado <= w. Sin esto sharp responde «bad extract area» en
     cuanto el motivo esta descentrado. */
  const left = Math.max(0, Math.min(w - lado, Math.round(cxm - lado / 2)));
  const top = Math.max(0, Math.min(h - lado, Math.round(cym - lado / 2)));
  return { left, top, width: lado, height: lado };
}

/* --- 3. alfa con punto negro por PERCENTIL y curva ------------------------- */
function aAlfa(data, w, h) {
  /* Punto negro por percentil, no por minimo: un solo pixel muy oscuro (el
     lacre, un remate) hundia el rango y dejaba el resto del trazo translucido.
     El percentil 2 de la tinta es el negro «real» del dibujo. */
  const tinta = [];
  for (let i = 0; i < w * h; i++) if (data[i] < SUELO) tinta.push(data[i]);
  tinta.sort((a, b) => a - b);
  const negro = tinta.length ? tinta[Math.floor(tinta.length * 0.02)] : 0;
  const rango = Math.max(1, SUELO - negro);
  const out = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    const L = data[i];
    let a = L >= SUELO ? 0 : (SUELO - L) / rango;
    if (a > 1) a = 1;
    /* gamma < 1 levanta los medios: el lapiz fino deja de ser un fantasma */
    out[i] = Math.round(Math.pow(a, 0.72) * 255);
  }
  return out;
}

async function version(src, v2) {
  let img = sharp(src).greyscale();
  if (v2) {
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const aro = detectarAro(data, info.width, info.height);
    const rec = recorte(data, info.width, info.height, aro);
    img = sharp(src).greyscale();
    if (rec) img = img.extract(rec);
    /* nitidez DESPUES de reducir: el lanczos deja el trazo fino algodonoso */
    img = img.resize(LADO, LADO, { fit: 'inside', kernel: 'lanczos3' }).sharpen({ sigma: 0.6 });
    const r = await img.raw().toBuffer({ resolveWithObject: true });
    return { alfa: aAlfa(r.data, r.info.width, r.info.height), w: r.info.width, h: r.info.height, aro };
  }
  const r = await img.resize(LADO, LADO, { fit: 'inside' }).raw().toBuffer({ resolveWithObject: true });
  /* v1: minimo absoluto y sin curva, tal cual se ingesto */
  const d = r.data; let negro = 255; for (const v of d) if (v < negro) negro = v;
  const rango = Math.max(1, SUELO - negro);
  const alfa = Buffer.alloc(r.info.width * r.info.height);
  for (let i = 0; i < alfa.length; i++) alfa[i] = d[i] >= SUELO ? 0 : Math.round(Math.min(1, (SUELO - d[i]) / rango) * 255);
  return { alfa, w: r.info.width, h: r.info.height, aro: null };
}

async function teñir(v) {
  const rgb = Buffer.alloc(v.w * v.h * 3);
  for (let i = 0; i < v.w * v.h; i++) {
    const a = v.alfa[i] / 255;
    rgb[i * 3]     = Math.round(PAPEL.r + (ACENTO.r - PAPEL.r) * a);
    rgb[i * 3 + 1] = Math.round(PAPEL.g + (ACENTO.g - PAPEL.g) * a);
    rgb[i * 3 + 2] = Math.round(PAPEL.b + (ACENTO.b - PAPEL.b) * a);
  }
  return sharp(rgb, { raw: { width: v.w, height: v.h, channels: 3 } })
    .resize(SELLO * ZOOM, SELLO * ZOOM, { kernel: 'nearest' }).png().toBuffer();
}

async function main() {
  const files = fs.readdirSync(DIR).filter(f => /\.png$/i.test(f)).sort();
  const vistos = new Map();
  for (const f of files) {
    const k = (f.match(/^asset_([a-z0-9]+)_/i) || [, f])[1];
    if (!vistos.has(k)) vistos.set(k, f);
  }
  const unicos = [...vistos.values()];
  const muestra = [0, 4, 10, 12, 20, 21, 30, 34, 37, 44].map(i => unicos[i]).filter(Boolean);

  console.log('=== v1 (ingestado) vs v2 (sin aro + mas definicion) ===\n');
  console.log('#   aro detectado   destaca   recorte    tinta v1 -> v2');

  const filas = [[], []];
  for (let i = 0; i < muestra.length; i++) {
    const src = path.join(DIR, muestra[i]);
    const v1 = await version(src, false);
    const v2 = await version(src, true);
    const cob = v => (v.alfa.reduce((s, a) => s + (a > 20 ? 1 : 0), 0) * 100 / (v.w * v.h)).toFixed(1);
    console.log(
      String(unicos.indexOf(muestra[i]) + 1).padEnd(4) +
      (v2.aro.esAro ? ('si, r=' + v2.aro.r.toFixed(2)) : 'no').padEnd(16) +
      ('x' + v2.aro.destaca.toFixed(1)).padEnd(10) +
      (v2.aro.esAro ? 'por dentro' : 'al motivo').padEnd(11) +
      cob(v1) + '% -> ' + cob(v2) + '%'
    );
    filas[0].push(await teñir(v1));
    filas[1].push(await teñir(v2));
  }

  const C = SELLO * ZOOM;
  const capas = [];
  filas.forEach((fila, r) => fila.forEach((b, i) => capas.push({ input: b, left: i * C, top: r * C })));
  await sharp({ create: { width: C * muestra.length, height: C * 2, channels: 3, background: '#F2EDE0' } })
    .composite(capas).png().toFile(OUT);
  console.log('\nhoja: ' + OUT + '\n  ARRIBA = v1 (lo que hay hoy)\n  ABAJO  = v2 (sin aro, recortado, con curva y nitidez)');
}

main().catch(e => { console.error(e.message); process.exit(1); });
