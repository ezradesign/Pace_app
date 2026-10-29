/* PACE · scripts/glifos/medir-trazo.js
   Mide lo que se pinta de cada máscara de ejercicio (su alfa) en las tres cosas en que Ez compara
   los dibujos, y lo pone contra los muñecos enteros del set:
     tinta    alfa medio sobre la silueta: lo oscuro que se ve el muñeco entero
     rayado   alfa medio de la tinta suave (α ≤ 128) sobre la silueta: el sombreado
     linea    alfa medio de la tinta fuerte (α > 128): lo oscuro del contorno
     grosor   2 · tinta fuerte / su perímetro, en px de la máscara de 768: lo gordo del contorno
   La silueta es la tinta engordada 4 px y rellena desde el borde: así el aire de dentro de un brazo
   doblado cuenta como muñeco y el papel de fuera no.
   Los primeros planos (manos, cabezas, torsos de cerca) no entran en la referencia: su rayado es de
   otra escala y movería la mediana.
   Uso: node scripts/glifos/medir-trazo.js [slug,slug…]   sin slugs, saca los que se salen del set. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DESTINO = path.join(ROOT, 'app', 'glyphs', 'assets', 'ejercicios');
const PRIMER_PLANO = ['abrir-y-cerrar-el-puno', 'barbilla-atras', 'circulos-de-muneca', 'circulos-de-tobillo', 'cuello-y-trapecios',
  'escalenos', 'estiramiento-de-muneca', 'extension-de-dedos', 'inclinacion-lateral', 'apertura-de-pecho', 'palmas-al-suelo'];
const METRICAS = ['tinta', 'rayado', 'linea', 'grosor'];

function medirAlfa(data, W, H) {
  const N = W * H, R = 4, tinta = new Uint8Array(N), tmp = new Uint8Array(N), gorda = new Uint8Array(N), fuera = new Uint8Array(N);
  for (let i = 0; i < N; i++) tinta[i] = data[i] > 48 ? 1 : 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let m = 0; for (let k = -R; k <= R && !m; k++) { const xx = x + k; if (xx >= 0 && xx < W && tinta[y * W + xx]) m = 1; } tmp[y * W + x] = m;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let m = 0; for (let k = -R; k <= R && !m; k++) { const yy = y + k; if (yy >= 0 && yy < H && tmp[yy * W + x]) m = 1; } gorda[y * W + x] = m;
  }
  const pila = [];
  for (let x = 0; x < W; x++) pila.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) pila.push(y * W, y * W + W - 1);
  while (pila.length) {
    const i = pila.pop(); if (fuera[i] || gorda[i]) continue; fuera[i] = 1; const x = i % W, y = (i / W) | 0;
    if (x > 0) pila.push(i - 1); if (x < W - 1) pila.push(i + 1); if (y > 0) pila.push(i - W); if (y < H - 1) pila.push(i + W);
  }
  let area = 0, fuerte = 0, perim = 0, sumFuerte = 0, sumSuave = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x, a = data[i];
    if (!fuera[i]) area++;
    if (a > 128) { fuerte++; sumFuerte += a; if (data[i - 1] <= 128 || data[i + 1] <= 128 || data[i - W] <= 128 || data[i + W] <= 128) perim++; }
    else if (!fuera[i]) sumSuave += a;
  }
  const a = Math.max(1, area);
  return { tinta: (sumFuerte + sumSuave) / a, rayado: sumSuave / a, linea: sumFuerte / Math.max(1, fuerte), grosor: 2 * fuerte / Math.max(1, perim) };
}

async function medirArchivo(sharp, ruta) {
  const { data, info } = await sharp(ruta).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  return medirAlfa(data, info.width, info.height);
}

/* Las máscaras grandes del set, menos `fuera` y los primeros planos, con su medida. */
async function referencia(sharp, fuera) {
  const filas = [];
  for (const f of fs.readdirSync(DESTINO).filter((x) => /\.webp$/.test(x) && !/\.min\.webp$/.test(x))) {
    const s = f.replace(/\.webp$/, '');
    if (PRIMER_PLANO.includes(s) || (fuera || []).includes(s)) continue;
    filas.push(Object.assign({ s }, await medirArchivo(sharp, path.join(DESTINO, f))));
  }
  const q = (k, p) => { const v = filas.map((r) => r[k]).sort((a, b) => a - b); return v[Math.round((v.length - 1) * p)]; };
  const est = {};
  for (const k of METRICAS) est[k] = { p25: q(k, 0.25), med: q(k, 0.5), p75: q(k, 0.75) };
  const pct = (k, v) => Math.round(filas.filter((r) => r[k] < v).length / filas.length * 100);
  /* Distancia a la mediana en rangos intercuartílicos: un 1 es «tan lejos como el cuartil». */
  const z = (k, v) => (v - est[k].med) / Math.max(1e-9, est[k].p75 - est[k].p25);
  return { filas, est, pct, z };
}

module.exports = { medirAlfa, medirArchivo, referencia, PRIMER_PLANO, METRICAS, DESTINO };

if (require.main === module) {
  (async () => {
    const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));
    const slugs = process.argv[2] ? process.argv[2].split(',') : null;
    const ref = await referencia(sharp, slugs);
    console.log('\n  muñecos enteros de referencia: ' + ref.filas.length);
    for (const k of METRICAS) console.log('    ' + k.padEnd(7) + 'p25 ' + ref.est[k].p25.toFixed(2) + ' · mediana ' + ref.est[k].med.toFixed(2) + ' · p75 ' + ref.est[k].p75.toFixed(2));
    const lista = slugs
      ? await Promise.all(slugs.map(async (s) => Object.assign({ s }, await medirArchivo(sharp, path.join(DESTINO, s + '.webp')))))
      : ref.filas.filter((r) => METRICAS.some((k) => Math.abs(ref.z(k, r[k])) > 1.5));
    if (!slugs) console.log('\n  los que se salen más de un rango y medio intercuartílico en algo:');
    for (const r of lista) {
      console.log('  ' + r.s.padEnd(34) + METRICAS.map((k) => k + ' ' + r[k].toFixed(2) + ' (p' + ref.pct(k, r[k]) + ')').join(' · '));
    }
    console.log('');
  })().catch((e) => { console.error(e); process.exit(1); });
}
