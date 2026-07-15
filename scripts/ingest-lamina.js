/* PACE · scripts/ingest-lamina.js (sesión 104)
   Ingesta de una lámina de Caminos (arte D-4):
     1. Normaliza: 1365x768, Lanczos3, WebP q82 effort 6 ->
        app/paths/illustrations/assets/<id>.webp
     2. Mide las bolas pintadas (clustering por croma + refinado por
        distancia de color + filtros de circularidad) y el papel del cielo.
     3. Emite el bloque JSON listo para paths.index.js.

   Uso: node scripts/ingest-lamina.js <archivo-origen> <id-corto> <n-bolas-esperadas>
   Ej.:  node scripts/ingest-lamina.js "C:/.../path_dusk.webp" dusk 3

   OJO: focusY y finish NO los mide el script — son juicio visual
   (franja del sendero / final del camino) y se calibran mirando el arte.
   Regla D-4: el arte se mide UNA vez, cuando es definitivo. */

'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'app', 'paths', 'illustrations', 'assets');
const TARGET_W = 1365, TARGET_H = 768;

function hex(rgb) {
  return '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

async function main() {
  const [src, id, expectedArg] = process.argv.slice(2);
  if (!src || !id) {
    console.error('Uso: node scripts/ingest-lamina.js <origen> <id-corto> <n-bolas>');
    process.exit(1);
  }
  const expected = parseInt(expectedArg || '3', 10);

  // 1. Normalizar
  const outFile = path.join(OUT_DIR, id + '.webp');
  const buf = await sharp(fs.readFileSync(src))
    .resize(TARGET_W, TARGET_H, { kernel: 'lanczos3', fit: 'cover' })
    .webp({ quality: 82, effort: 6 })
    .toBuffer();
  fs.writeFileSync(outFile, buf);

  // 2. Píxeles crudos
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const px = (x, y) => { const i = (y * W + x) * 3; return [data[i], data[i + 1], data[i + 2]]; };

  // 2a. Papel: color dominante entre los píxeles claros (moda de histograma
  //     cuantizado a pasos de 8). Robusto ante cielos sepia con croma.
  const histo = new Map();
  for (let y = 0; y < H; y += 4) {
    for (let x = 0; x < W; x += 4) {
      const [r, g, b] = px(x, y);
      if ((r + g + b) / 3 < 170) continue;
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      histo.set(key, (histo.get(key) || 0) + 1);
    }
  }
  let bestKey = 0, bestN = 0;
  for (const [k, n] of histo) if (n > bestN) { bestN = n; bestKey = k; }
  const P = [((bestKey >> 10) & 31) * 8 + 4, ((bestKey >> 5) & 31) * 8 + 4, (bestKey & 31) * 8 + 4];
  const paper = hex(P);

  // 2b. Candidatos: lejos del papel + LOCALMENTE UNIFORMES (las bolas son
  //     discos macizos; los trazos de tinta mezclan papel en su vecindad).
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const clusters = [];
  for (let y = 6; y < H - 6; y += 2) {
    for (let x = 6; x < W - 6; x += 2) {
      const p = px(x, y);
      const lum = (p[0] + p[1] + p[2]) / 3;
      if (lum < 60 || lum > 215) continue;
      if (dist(p, P) < 40) continue;
      // uniformidad: las 4 esquinas ±3px se parecen al centro
      if (dist(p, px(x - 3, y - 3)) > 25 || dist(p, px(x + 3, y - 3)) > 25 ||
          dist(p, px(x - 3, y + 3)) > 25 || dist(p, px(x + 3, y + 3)) > 25) continue;
      let cl = clusters.find(c => Math.abs(c.cx - x) < 40 && Math.abs(c.cy - y) < 40);
      if (!cl) { cl = { sx: 0, sy: 0, n: 0, cx: x, cy: y }; clusters.push(cl); }
      cl.sx += x; cl.sy += y; cl.n++; cl.cx = cl.sx / cl.n; cl.cy = cl.sy / cl.n;
    }
  }

  // 2c. Semillas: si el 4º argumento trae coordenadas aproximadas
  //     ("x1:y1,x2:y2,..." — modo híbrido: el humano mira, el script mide),
  //     se usan directas; si no, los centroides del clustering.
  const seedArg = process.argv[5];
  const seeds = seedArg
    ? seedArg.split(',').map(s => { const [x, y] = s.split(':').map(Number); return { cx: x, cy: y, n: 9999 }; })
    : clusters.filter(c => c.n >= 12).sort((a, b) => b.n - a.n).slice(0, 15);

  /* Con SEMILLAS: centroide local (±20, dist<40 al color del seed) para
     afinar el centro + CRECIMIENTO RADIAL para el radio (anillos cada 15°;
     se para cuando <70% del anillo es del color). Local e inmune a que el
     terreno comparta tono con la bola (el bbox global se inflaba). */
  const balls = [];
  if (seedArg) {
    for (const c of seeds) {
      let ax = Math.round(c.cx), ay = Math.round(c.cy);
      if (ax < 40 || ax > W - 40 || ay < 40 || ay > H - 40) continue;
      const patch = (x0, y0) => {
        let tr = 0, tg = 0, tb = 0, tn = 0;
        for (let y = y0 - 3; y <= y0 + 3; y++) for (let x = x0 - 3; x <= x0 + 3; x++) {
          const [r, g, b] = px(x, y); tr += r; tg += g; tb += b; tn++;
        }
        return [tr / tn, tg / tn, tb / tn];
      };
      let T = patch(ax, ay);
      // centro: centroide local de píxeles afines
      let sx = 0, sy = 0, n = 0;
      for (let y = ay - 20; y <= ay + 20; y++) {
        for (let x = ax - 20; x <= ax + 20; x++) {
          if (dist(px(x, y), T) < 40) { sx += x; sy += y; n++; }
        }
      }
      if (!n) { console.log('  [seed ' + ax + ':' + ay + '] sin afines'); continue; }
      const cx = Math.round(sx / n), cy = Math.round(sy / n);
      T = patch(cx, cy);
      // radio: crecimiento radial
      let rr = 0;
      for (let rad = 2; rad < 30; rad++) {
        let ok = 0, tot = 0;
        for (let a = 0; a < 360; a += 15) {
          const x = Math.round(cx + rad * Math.cos(a * Math.PI / 180));
          const y = Math.round(cy + rad * Math.sin(a * Math.PI / 180));
          tot++;
          if (dist(px(x, y), T) < 40) ok++;
        }
        if (ok / tot < 0.7) { rr = rad - 1; break; }
        rr = rad;
      }
      if (rr < 7 || rr > 26) {
        console.log('  [seed ' + ax + ':' + ay + '] radio implausible r=' + rr + ' color ' + hex(T));
        continue;
      }
      balls.push({ x: cx, y: cy, r: rr, color: hex(T) });
    }
    balls.sort((a, b) => a.x - b.x);
  }
  for (const c of (seedArg ? [] : seeds)) {
    const ax = Math.round(c.cx), ay = Math.round(c.cy);
    if (ax < 40 || ax > W - 40 || ay < 40 || ay > H - 40) continue;
    let tr = 0, tg = 0, tb = 0, tn = 0;
    for (let y = ay - 3; y <= ay + 3; y++) for (let x = ax - 3; x <= ax + 3; x++) {
      const [r, g, b] = px(x, y); tr += r; tg += g; tb += b; tn++;
    }
    const T = [tr / tn, tg / tn, tb / tn];
    const close = (p) => Math.hypot(p[0] - T[0], p[1] - T[1], p[2] - T[2]) < 55;
    let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1, sx = 0, sy = 0, n = 0;
    for (let y = ay - 35; y <= ay + 35; y++) {
      for (let x = ax - 35; x <= ax + 35; x++) {
        if (close(px(x, y))) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
          sx += x; sy += y; n++;
        }
      }
    }
    const diag = !!seedArg;
    if (!n) { if (diag) console.log('  [seed ' + ax + ':' + ay + '] 0 píxeles afines a ' + hex(T)); continue; }
    const bw = maxX - minX, bh = maxY - minY;
    const r = Math.round((bw + bh) / 4);
    const aspect = bw / Math.max(1, bh);
    const fill = n / (Math.PI * r * r || 1);
    const reject = (why) => { if (diag) console.log('  [seed ' + ax + ':' + ay + '] RECHAZADA (' + why + '): color ' + hex(T) + ' bbox ' + bw + 'x' + bh + ' r=' + r + ' aspect=' + aspect.toFixed(2) + ' fill=' + fill.toFixed(2)); };
    // bola = blob circular, macizo, de radio plausible
    if (r < 8 || r > 26) { reject('radio'); continue; }
    if (aspect < 0.7 || aspect > 1.4) { reject('aspecto'); continue; }
    if (fill < 0.5) { reject('relleno'); continue; }
    const cx = Math.round(sx / n), cy = Math.round(sy / n);
    if (balls.some(b => Math.hypot(b.x - cx, b.y - cy) < 30)) continue;
    balls.push({ x: cx, y: cy, r, color: hex(T), _n: c.n, _fill: +fill.toFixed(2) });
  }
  balls.sort((a, b) => a.x - b.x);

  // 3. Informe
  const kb = (buf.length / 1024).toFixed(1);
  console.log('=== ' + id + ' ===');
  console.log('normalizado: ' + path.relative(ROOT, outFile) + ' (' + W + 'x' + H + ', ' + kb + ' KB)');
  console.log('papel: ' + paper);
  console.log('bolas detectadas: ' + balls.length + ' (esperadas: ' + expected + ')' +
    (balls.length !== expected ? '  <<< REVISAR A MANO' : '  OK'));
  balls.forEach(b => console.log('  ' + JSON.stringify(b)));
  const avgY = balls.length ? balls.reduce((s, b) => s + b.y, 0) / balls.length : 0;
  console.log('focusY sugerido (media y de bolas / alto): ' + (avgY / H).toFixed(2));
  console.log('--- bloque para paths.index.js (falta calibrar focusY/finish a ojo): ---');
  console.log(JSON.stringify({
    src: 'app/paths/illustrations/assets/' + id + '.webp',
    w: W, h: H,
    paper,
    focusY: +(avgY / H).toFixed(2),
    finish: { x: 0 },
    dots: balls.map(b => ({ x: b.x, y: b.y, r: b.r, color: b.color })),
  }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
