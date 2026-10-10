/* Mide las variaciones, escribe medidas.js y brief-B-por-tecnica.md y, si se pide, arma una copia
   de la página con los audios dentro (para enviarla sola).

   Uso, desde la raíz del repo:
     node docs/traspaso/archivos/musica-respira/por-tecnica/construir.js
     node docs/traspaso/archivos/musica-respira/por-tecnica/construir.js --autocontenida SALIDA.html

   Mide en Chromium (Playwright del repo) con el mismo motor.js que suena en la página: 90 s de cada
   técnica con su respiración, sin la voz, antes de la ganancia de la app (0,158).
   El ajuste de cada variación iguala su volumen medio al de hoy en esa técnica, sin dejar que el
   momento más alto (pulmón lleno) pase de 1,5 dB por encima del de hoy. Puerto: PACE_PUERTO o 8783. */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const AQUI = __dirname;
const RAIZ = path.resolve(AQUI, '../../../../..');
const PUERTO = Number(process.env.PACE_PUERTO || 8783);
const REL = path.relative(RAIZ, AQUI).split(path.sep).join('/');

function servir() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(RAIZ, url);
      if (!f.startsWith(RAIZ)) { res.writeHead(403); res.end(); return; }
      fs.stat(f, (e, st) => {
        if (e || !st.isFile()) { res.writeHead(404); res.end(); return; }
        const tipo = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mp3': 'audio/mpeg' }[path.extname(f)] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': tipo, 'Cache-Control': 'no-store' });
        fs.createReadStream(f).pipe(res);
      });
    }).listen(PUERTO, () => ok(s));
  });
}

/* Corre dentro de la página. */
async function medirEnPagina(cfg) {
  const D = window.PACE_POR_TECNICA, M = window.PACE_MOTOR;
  const sr = 44100, dur = cfg.dur, desde = 3;
  const dec = new OfflineAudioContext(1, sr, sr);
  const bufs = {};
  for (const [k, n] of [['claro', 'sol-claro'], ['calido', 'sol-calido'], ['menor', 'sol-menor']]) {
    bufs[k] = await dec.decodeAudioData(await (await fetch('../bases/' + n + '.mp3')).arrayBuffer());
  }
  const rms = (d, a) => { let s = 0; for (let i = a; i < d.length; i++) s += d[i] * d[i]; return 10 * Math.log10(s / (d.length - a) + 1e-30); };
  const pico = (d, a) => { let p = 0; for (let i = a; i < d.length; i++) p = Math.max(p, Math.abs(d[i])); return 20 * Math.log10(p + 1e-30); };
  async function render(tec, rec, quieto, es432) {
    const ctx = new OfflineAudioContext(3, sr * dur, sr);
    const mg = ctx.createChannelMerger(3); mg.connect(ctx.destination);
    const out = ctx.createGain();
    out.gain.value = es432 ? 1 / 0.158 : 1;   // el drone de 432 suena a nivel absoluto; se expresa como la música
    out.connect(mg, 0, 0);
    const bq = (t, f) => { const b = ctx.createBiquadFilter(); b.type = t; b.frequency.value = f; b.Q.value = Math.SQRT1_2; return b; };
    const banda = [bq('highpass', 300), bq('highpass', 300), bq('lowpass', 4000), bq('lowpass', 4000)];
    const agudos = [bq('highpass', 2000), bq('highpass', 2000)];
    [banda, agudos].forEach((cad, k) => { let x = out; cad.forEach((b) => { x.connect(b); x = b; }); x.connect(mg, 0, k + 1); });
    const motor = es432 ? M.montar432(ctx, out, 0) : M.montar(ctx, rec, bufs, out, 0, quieto);
    const plan = { idx: 0, t: 1.5, m: quieto ? 1 : 0, fases: [] };
    M.programarHasta(plan, tec, motor, dur, null);
    const b = await ctx.startRendering();
    const a = Math.round(desde * sr);
    const r2 = (x) => Math.round(x * 100) / 100;
    return { ciclo: r2(rms(b.getChannelData(0), a)), banda: r2(rms(b.getChannelData(1), a)), agudos: r2(rms(b.getChannelData(2), a)), pico: r2(pico(b.getChannelData(0), a)) };
  }
  /* El ajuste de una receta: su volumen medio igual al de hoy, sin pasar de 1,5 dB por encima de hoy
     con el pulmón lleno. Lo mismo para la receta `a` y para la marcada `m`. */
  async function medirReceta(tec, receta, q, hC, hA) {
    const r0 = Object.assign({}, receta, { ajusteDb: 0 });
    const rC = await render(tec, r0, q), rA = await render(tec, r0, true);
    let aj = hC.ciclo - rC.ciclo;
    if (rA.ciclo + aj > hA.ciclo + 1.5) aj = hA.ciclo + 1.5 - rA.ciclo;
    aj = Math.round(aj * 100) / 100;
    const r1 = Object.assign({}, receta, { ajusteDb: aj });
    const rC1 = await render(tec, r1, q), rA1 = await render(tec, r1, true);
    return { aj, med: { ciclo: rC1.ciclo, abierto: rA1.ciclo, banda: rC1.banda, agudos: rC1.agudos, pico: rA1.pico } };
  }

  /* LO DISTINTA QUE ES: el color de cada técnica abierta y quieta (24 s), en tercios de octava de
     50 Hz a 8 kHz con el volumen igualado, y la distancia en dB (raíz cuadrática media de las
     diferencias) a la técnica más parecida. Entre el drone claro y el cálido hay 8,3. */
  const N = 8192;
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len;
      for (let i = 0; i < n; i += len) for (let k = 0; k < len / 2; k++) {
        const c = Math.cos(ang * k), s = Math.sin(ang * k), h = i + k + len / 2;
        const vr = re[h] * c - im[h] * s, vi = re[h] * s + im[h] * c;
        re[h] = re[i + k] - vr; im[h] = im[i + k] - vi; re[i + k] += vr; im[i + k] += vi;
      }
    }
  }
  const tercios = []; for (let f = 50; f < 8000; f *= Math.pow(2, 1 / 3)) tercios.push(f);
  async function color(receta) {
    const ctx = new OfflineAudioContext(1, sr * 24, sr);
    M.montar(ctx, Object.assign({}, receta, { ajusteDb: 0 }), bufs, ctx.destination, 0, true);
    const d = (await ctx.startRendering()).getChannelData(0);
    const pot = new Float64Array(N / 2);
    for (let a = sr * 4; a + N < d.length; a += N) {
      const re = new Float64Array(N), im = new Float64Array(N);
      for (let i = 0; i < N; i++) re[i] = d[a + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)));
      fft(re, im);
      for (let k = 0; k < N / 2; k++) pot[k] += re[k] * re[k] + im[k] * im[k];
    }
    const e = (lo, hi) => { let s = 0; for (let k = Math.ceil(lo * N / sr); k <= Math.min(N / 2 - 1, Math.floor(hi * N / sr)); k++) s += pot[k]; return s; };
    const tot = e(20, 11000);
    return tercios.map((f) => Math.max(10 * Math.log10(e(f / Math.pow(2, 1 / 6), f * Math.pow(2, 1 / 6)) / tot + 1e-20), -60));
  }
  const distancia = (a, b) => Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0) / a.length);
  function vecinas(colores) {
    const out = {};
    Object.keys(colores).forEach((id) => {
      let mejor = null;
      Object.keys(colores).forEach((j) => { if (j === id) return; const dd = distancia(colores[id], colores[j]); if (!mejor || dd < mejor.d) mejor = { id: j, d: dd }; });
      out[id] = { vecina: mejor.id, d: Math.round(mejor.d * 10) / 10 };
    });
    return out;
  }

  const res = {};
  const colA = {}, colM = {};
  for (const fa of D.FAMILIAS) for (const tec of fa.tecnicas) {
    if (tec.drone432) { res[tec.id] = { hoy: await render(tec, null, false, true) }; continue; }
    const q = !!tec.quieto;
    const hoy = M.recetaHoy(fa);
    const hC = await render(tec, hoy, q), hA = await render(tec, hoy, true);
    const a = await medirReceta(tec, tec.a, q, hC, hA);
    res[tec.id] = { ajusteDb: a.aj, hoy: { ciclo: hC.ciclo, abierto: hA.ciclo, banda: hC.banda, agudos: hC.agudos }, a: a.med };
    colA[tec.id] = await color(tec.a);
    if (tec.m) {
      const m = await medirReceta(tec, tec.m, q, hC, hA);
      res[tec.id].m = Object.assign({ ajusteDb: m.aj }, m.med);
      colM[tec.id] = await color(tec.m);
    }
  }
  const vA = vecinas(colA), vM = Object.keys(colM).length > 1 ? vecinas(colM) : {};
  Object.keys(vA).forEach((id) => { res[id].distinta = { a: vA[id] }; if (vM[id]) res[id].distinta.m = vM[id]; });
  return res;
}

function escribirMedidas(med) {
  const cuerpo = '/* Generado por construir.js: no se edita a mano. Medidas de cada técnica en dBFS antes de la\n' +
    '   ganancia de la app (0,158), y el ajuste de nivel de cada variación. */\n' +
    'window.PACE_MEDIDAS = ' + JSON.stringify(med, null, 1) + ';\n';
  fs.writeFileSync(path.join(AQUI, 'medidas.js'), cuerpo);
}

/* LOS AGUDOS SE MIDEN CONTRA UN TOPE, NO CONTRA LA DE HOY DE CADA TÉCNICA: el drone oscuro casi no
   tiene nada por encima de 2 kHz, así que cualquier segunda voz sale «+30 dB» sin acercarse a la
   voz. El tope es el drone más claro que suena hoy, que Ez ya oyó con la voz encima. */
function topeAgudos(med) {
  return Math.max(...Object.values(med).filter((m) => m.a).map((m) => m.hoy.agudos));
}

function comprobar(med, D) {
  const avisos = [];
  const filas = [];
  const tope = topeAgudos(med);
  const nombre = {};
  D.FAMILIAS.forEach((fa) => fa.tecnicas.forEach((t) => { nombre[t.id] = t.n; }));
  const revisa = (t, m, r, cual) => {
    const dv = r.ciclo - m.hoy.ciclo, dt = r.agudos - tope, db = r.banda - m.hoy.banda, dA = r.abierto - m.hoy.abierto;
    const aj = cual === 'a' ? m.ajusteDb : r.ajusteDb;
    filas.push([t.n + (cual === 'm' ? ' (marcada)' : ''), m.hoy.ciclo, r.ciclo, r.abierto, 'agudos/tope ' + dt.toFixed(1), 'banda ' + db.toFixed(1), 'ajuste ' + aj]);
    const n = t.n + (cual === 'm' ? ' (marcada)' : '');
    if (Math.abs(dv) > 0.5) avisos.push(n + ': volumen medio ' + dv.toFixed(2) + ' dB respecto a hoy');
    if (dA > 1.55) avisos.push(n + ': con el pulmón lleno ' + dA.toFixed(2) + ' dB por encima de hoy');
    if (dt > 0) avisos.push(n + ': ' + dt.toFixed(2) + ' dB más de agudos que el drone más claro de hoy');
    if (db < -3) avisos.push(n + ': ' + db.toFixed(2) + ' dB menos en la banda del móvil');
    if (r.pico > -1) avisos.push(n + ': pico ' + r.pico + ' dBFS');
  };
  D.FAMILIAS.forEach((fa) => fa.tecnicas.forEach((t) => {
    const m = med[t.id];
    if (t.drone432) { filas.push([t.n, m.hoy.ciclo, '', '', '', 'banda ' + m.hoy.banda]); return; }
    revisa(t, m, m.a, 'a');
    if (m.m) revisa(t, m, m.m, 'm');
  }));
  filas.forEach((f) => console.log(f.map((x) => String(x).padEnd(12)).join(' ')));

  /* Las marcadas existen para que ninguna se confunda con otra: menos de 6 puntos de su vecina
     es un aviso (con `a` había nueve por debajo de 4). */
  console.log('\nLo distinta que es cada una (distancia de color a la más parecida; claro↔cálido = 8,3):');
  D.FAMILIAS.forEach((fa) => fa.tecnicas.forEach((t) => {
    const d = med[t.id].distinta; if (!d) return;
    const txt = (x) => (x ? (x.d.toFixed(1) + ' (' + nombre[x.vecina] + ')').padEnd(34) : '');
    console.log(' ' + t.n.padEnd(24) + ' ahora ' + txt(d.a) + (d.m ? ' marcada ' + txt(d.m) : ''));
    if (d.m && d.m.d < 6) avisos.push(t.n + ' (marcada): a ' + d.m.d + ' de ' + nombre[d.m.vecina] + ', menos de 6');
  }));
  if (avisos.length) { console.log('\nAVISOS:'); avisos.forEach((a) => console.log(' - ' + a)); }
  else console.log('\nSin avisos: volumen medio igual que hoy, ninguna con más agudos que el drone más claro de hoy, ninguna pierde más de 3 dB en la banda del móvil y ninguna marcada a menos de 6 de su vecina.');
  return avisos;
}

function escribirBrief(D) {
  const L = [];
  L.push('# Música de Respira · brief B: un drone grabado por técnica', '');
  L.push('Generado por `construir.js` desde `tecnicas.js` (no se edita a mano). Solo hace falta para las técnicas que Ez marque como «Grabada (B)» en `escucha-por-tecnica.html`; el resto suena con su variación en directo (camino A).', '');
  L.push('## Cómo pedirlo', '');
  L.push('1. Usa **ElevenLabs Music** con el interruptor de instrumental encendido: de las 20 pistas del encargo anterior, solo pasaron las suyas (las otras 16 eran canciones).');
  L.push('2. Para cada técnica, pega su bloque tal cual: lleva su carácter y detrás la firma de PACE, que es lo que hace que suenen a un mismo disco.');
  L.push('3. Si hay un campo de exclusiones (negative prompt), pega ahí la lista de abajo.');
  L.push('4. Genera **3 tomas** de cada una y escúchalas por el altavoz del portátil o del móvil, mejor con la voz de PACE encima. Descarta la toma si tiene una nota suelta, una melodía, un golpe, un cambio de volumen o si todo es un retumbe grave.');
  L.push('5. Todas se piden en Sol, aunque en A alguna cambie de nota: la nota se ajusta después, igual que la afinación a 432.');
  L.push('6. Descarga cada toma elegida en WAV si se puede (si no, el MP3 de más calidad), con el nombre de la técnica y la toma (`box-4-toma2`), y apunta el modelo y el día, con captura de los términos de uso.', '');
  L.push('Yo las afino a 432, les cierro el bucle con `../scripts/procesar.py`, las paso a mono de 64 kbps, compruebo con `../scripts/medir.py` que no son canciones y las igualo a -20 dBFS de RMS. La app les sigue poniendo la respiración en directo.', '');
  L.push('## Exclusiones', '', '```text', D.EXCLUSIONES_B, '```', '');
  L.push('## La firma de PACE', '', 'Ya va incluida al final de cada bloque de abajo. Por si la necesitas suelta:', '', '```text', D.FIRMA_B, '```', '');
  L.push('## Las 19 técnicas', '');
  L.push('Coherente 432 no está: suena con su propio drone y no lleva música.', '');
  D.FAMILIAS.forEach((fa) => fa.tecnicas.forEach((t) => {
    if (!t.b) return;
    L.push('### `' + t.slug + '` · ' + t.n + ' (' + fa.nombre + ')', '');
    L.push('Por qué: ' + t.porque, '');
    L.push('```text', t.b + ' ' + D.FIRMA_B, '```', '');
  }));
  fs.writeFileSync(path.join(AQUI, 'brief-B-por-tecnica.md'), L.join('\n'));
}

function autocontenida(salida) {
  let html = fs.readFileSync(path.join(AQUI, 'escucha-por-tecnica.html'), 'utf8');
  const b64 = (f) => fs.readFileSync(f).toString('base64');
  const audio = {};
  ['sol-claro', 'sol-calido', 'sol-menor'].forEach((n) => { audio[n] = b64(path.join(AQUI, '../bases', n + '.mp3')); });
  ['sulafat', 'bradford'].forEach((v) => ['inhala', 'exhala', 'manten'].forEach((a) => { audio[v + '-' + a] = b64(path.join(RAIZ, 'app/breathe/voz', v + '-' + a + '.mp3')); }));
  const inline = (n) => '<script>\n' + fs.readFileSync(path.join(AQUI, n), 'utf8') + '\n</script>';
  html = html.replace('<script src="tecnicas.js"></script>', () => '<script>window.PACE_AUDIO_B64 = ' + JSON.stringify(audio) + ';</script>\n' + inline('tecnicas.js'));
  html = html.replace('<script src="medidas.js"></script>', () => inline('medidas.js'));
  html = html.replace('<script src="motor.js"></script>', () => inline('motor.js'));
  if (/<script src=/.test(html)) throw new Error('Quedó un script sin meter dentro');
  fs.writeFileSync(salida, '<!doctype html>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + html);
  console.log('Copia autocontenida: ' + salida + ' (' + (fs.statSync(salida).size / 1048576).toFixed(1) + ' MB)');
}

(async () => {
  require(path.join(AQUI, 'tecnicas.js'));
  const D = globalThis.PACE_POR_TECNICA;
  const args = process.argv.slice(2);
  const i = args.indexOf('--autocontenida');
  if (!args.includes('--sin-medir')) {
    const { chromium } = require(path.join(RAIZ, 'node_modules/playwright'));
    const srv = await servir();
    const nav = await chromium.launch();
    try {
      const pag = await nav.newPage();
      await pag.goto('http://localhost:' + PUERTO + '/' + REL + '/escucha-por-tecnica.html');
      await pag.waitForFunction(() => window.PACE_MOTOR && window.PACE_POR_TECNICA);
      const med = await pag.evaluate(medirEnPagina, { dur: 90 });
      escribirMedidas(med);
      comprobar(med, D);
    } finally { await nav.close(); srv.close(); }
  }
  escribirBrief(D);
  if (i >= 0) autocontenida(path.resolve(args[i + 1]));
})().catch((e) => { console.error(e); process.exit(1); });
