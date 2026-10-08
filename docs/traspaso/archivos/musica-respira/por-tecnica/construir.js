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
  const res = {};
  for (const fa of D.FAMILIAS) for (const tec of fa.tecnicas) {
    if (tec.drone432) { res[tec.id] = { hoy: await render(tec, null, false, true) }; continue; }
    const q = !!tec.quieto;
    const hoy = M.recetaHoy(fa);
    const hC = await render(tec, hoy, q), hA = await render(tec, hoy, true);
    const a0 = Object.assign({}, tec.a, { ajusteDb: 0 });
    const aC = await render(tec, a0, q), aA = await render(tec, a0, true);
    let aj = hC.ciclo - aC.ciclo;
    if (aA.ciclo + aj > hA.ciclo + 1.5) aj = hA.ciclo + 1.5 - aA.ciclo;
    aj = Math.round(aj * 100) / 100;
    const a1 = Object.assign({}, tec.a, { ajusteDb: aj });
    const aC1 = await render(tec, a1, q), aA1 = await render(tec, a1, true);
    res[tec.id] = {
      ajusteDb: aj,
      hoy: { ciclo: hC.ciclo, abierto: hA.ciclo, banda: hC.banda, agudos: hC.agudos },
      a: { ciclo: aC1.ciclo, abierto: aA1.ciclo, banda: aC1.banda, agudos: aC1.agudos, pico: aA1.pico },
    };
  }
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
  D.FAMILIAS.forEach((fa) => fa.tecnicas.forEach((t) => {
    const m = med[t.id];
    if (t.drone432) { filas.push([t.n, m.hoy.ciclo, '', '', '', 'banda ' + m.hoy.banda]); return; }
    const dv = m.a.ciclo - m.hoy.ciclo, dt = m.a.agudos - tope, db = m.a.banda - m.hoy.banda, dA = m.a.abierto - m.hoy.abierto;
    filas.push([t.n, m.hoy.ciclo, m.a.ciclo, m.a.abierto, 'agudos/tope ' + dt.toFixed(1), 'banda ' + db.toFixed(1), 'ajuste ' + m.ajusteDb]);
    if (Math.abs(dv) > 0.5) avisos.push(t.n + ': volumen medio ' + dv.toFixed(2) + ' dB respecto a hoy');
    if (dA > 1.55) avisos.push(t.n + ': con el pulmón lleno ' + dA.toFixed(2) + ' dB por encima de hoy');
    if (dt > 0) avisos.push(t.n + ': ' + dt.toFixed(2) + ' dB más de agudos que el drone más claro de hoy');
    if (db < -3) avisos.push(t.n + ': ' + db.toFixed(2) + ' dB menos en la banda del móvil');
    if (m.a.pico > -1) avisos.push(t.n + ': pico ' + m.a.pico + ' dBFS');
  }));
  filas.forEach((f) => console.log(f.map((x) => String(x).padEnd(12)).join(' ')));
  if (avisos.length) { console.log('\nAVISOS:'); avisos.forEach((a) => console.log(' - ' + a)); }
  else console.log('\nSin avisos: volumen medio igual que hoy, ninguna con más agudos que el drone más claro de hoy y ninguna pierde más de 3 dB en la banda del móvil.');
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
