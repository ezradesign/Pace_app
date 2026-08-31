/* PACE · scripts/audit/banco-musica-s177.js (sesión 177)
   ======================================================
   MIDE LAS PIEZAS DE MÚSICA DE FONDO CONTRA LO QUE PIDE EL BRIEF.
   `docs/product/MUSICA_RESPIRA_BRIEFS.md` fija seis condiciones y ninguna se
   puede comprobar escuchando: «rango medio despejado», «sin percusión con
   ataque», «dinámica plana», «bucle sin costura», la afinación en Sol a 432 y
   el ciclo exacto de las dos piezas de Balance.

   NO HAY ffmpeg EN ESTA MÁQUINA. Se usa el método que s176 estrenó para medir
   la palabra de las locuciones: se decodifica la onda en un Chromium de verdad
   con `decodeAudioData` y se hace la aritmética dentro de la página. El
   `OfflineAudioContext` se abre a 16 kHz, así que el propio decodificador
   remuestrea y el análisis baja de 10,5 M de muestras a 3,8 M.

   POR QUÉ UN SERVIDOR Y NO `file://`: `fetch()` sobre `file://` lo bloquea CORS
   en Chromium. Se levanta un http efímero sobre la carpeta y se apaga al salir.

   LAS LOCUCIONES ENTRAN EN LA MEDIDA. La condición real no es «que la música
   tenga poca energía entre 200 Hz y 3 kHz» —eso es un umbral inventado— sino
   que la voz siga por encima de ella ahí. Con las seis locuciones en la tabla,
   el margen se calcula en vez de suponerse (RELACIONAL sobre CENSO, s152).

   Uso: node scripts/audit/banco-musica-s177.js [carpeta]
        (por defecto «../Audio - Respira» junto al repo)
*/
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const ROOT = path.resolve(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright'));

const DIR = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(ROOT, '..', 'Audio - Respira');

/* El Sol del drone, calculado igual que `Sound.jsx`: BASE_A 432, note('G2').
   NO se escribe 96.22 a mano -- si alguien cambia la afinación de la app, este
   banco tiene que moverse con ella y no quedarse mintiendo. */
const BASE_A = 432;
const nota = (oct, semi) => BASE_A * Math.pow(2, ((oct - 4) * 12 + (semi - 9)) / 12);
const G2 = nota(2, 7);

/* El drone arranca con `linearRampToValueAtTime(0.02)` (Sound.jsx). Es el único
   precedente de «nivel de fondo» que la app tiene, y por eso es la referencia
   contra la que se dice a qué ganancia hay que poner cada pieza. */
const NIVEL_FONDO = 0.02;

const MUSICA = /^pace_/i;
const VOZ = /^voice_final_/i;

/* ── el servidor efímero ─────────────────────────────────────────────────── */
function servir(dir) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
      if (rel === '' || rel === 'index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<!doctype html><meta charset="utf-8"><title>banco</title>');
      }
      const f = path.join(dir, rel);
      if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); return res.end('no');
      }
      res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
      res.end(fs.readFileSync(f));
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

/* ── la medida, que corre DENTRO de la página ────────────────────────────── */
/* Va como función serializada a `page.evaluate`. Todo lo que necesite tiene que
   entrar por argumento: dentro no existe ni `require` ni el ámbito de Node. */
async function medirEnPagina(arg) {
  const url = arg.url, G2hz = arg.G2;
  const RATE = 16000;
  const r = await fetch(url);
  /* GUARD: `page.evaluate` pasa UN argumento, y mandarle un array a una función
     de dos deja `url` valiendo "http://...,96.22". El fetch daba 404, el cuerpo
     del 404 no se decodifica y el error que salía era «Unable to decode audio
     data» -- que acusa al archivo. Sin este guard, el instrumento miente. */
  if (!r.ok) throw new Error('HTTP ' + r.status + ' al pedir ' + url);
  const buf = await r.arrayBuffer();
  const bytes = buf.byteLength;
  const ctx = new OfflineAudioContext(1, RATE, RATE);
  const audio = await ctx.decodeAudioData(buf.slice(0));
  const canales = audio.numberOfChannels;
  const dur = audio.duration;

  /* mono por promedio: el fondo va a ser mono de todos modos */
  const n = audio.length;
  const x = new Float32Array(n);
  for (let c = 0; c < canales; c++) {
    const d = audio.getChannelData(c);
    for (let i = 0; i < n; i++) x[i] += d[i] / canales;
  }

  /* --- FFT radix-2 in-place, la mínima que hace falta --- */
  function fft(re, im) {
    const N = re.length;
    for (let i = 1, j = 0; i < N; i++) {
      let bit = N >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= N; len <<= 1) {
      const ang = -2 * Math.PI / len;
      const wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < N; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const ur = re[i + k], ui = im[i + k];
          const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
          const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
          re[i + k] = ur + vr; im[i + k] = ui + vi;
          re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
          const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
  }

  /* --- espectro medio: 4096 puntos, salto 2048, Hann --- */
  const NF = 4096;
  const hann = new Float32Array(NF);
  for (let i = 0; i < NF; i++) hann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / NF);
  const esp = new Float64Array(NF / 2);
  let marcos = 0;
  for (let p = 0; p + NF <= n; p += NF / 2) {
    const re = new Float64Array(NF), im = new Float64Array(NF);
    for (let i = 0; i < NF; i++) re[i] = x[p + i] * hann[i];
    fft(re, im);
    for (let k = 0; k < NF / 2; k++) esp[k] += re[k] * re[k] + im[k] * im[k];
    marcos++;
  }
  for (let k = 0; k < NF / 2; k++) esp[k] /= Math.max(1, marcos);
  const hz = (k) => k * RATE / NF;
  const banda = (lo, hi) => {
    let s = 0;
    for (let k = 1; k < NF / 2; k++) { const f = hz(k); if (f >= lo && f < hi) s += esp[k]; }
    return s;
  };
  const total = banda(20, RATE / 2);
  const vozBanda = banda(200, 3000);
  const consonantes = banda(1000, 4000);

  /* --- nivel: pico y RMS --- */
  let pico = 0, sum2 = 0;
  for (let i = 0; i < n; i++) { const a = Math.abs(x[i]); if (a > pico) pico = a; sum2 += x[i] * x[i]; }
  const rms = Math.sqrt(sum2 / n);

  /* --- envolvente a 10 ms: sirve para ataques, planitud y ciclo --- */
  const H = Math.round(RATE * 0.01);
  const env = [];
  for (let p = 0; p + H <= n; p += H) {
    let s = 0; for (let i = 0; i < H; i++) s += x[p + i] * x[p + i];
    env.push(Math.sqrt(s / H));
  }
  const dB = (v) => 20 * Math.log10(Math.max(v, 1e-9));

  /* EL CUERPO DE LA PIEZA, y por qué existe este recorte.
     La primera versión de este banco midió el ataque sobre el archivo entero y
     devolvió «+150,8 dB en 50 ms», que no es un sonido: es el fundido de
     entrada subiendo desde el suelo de -180 dB del logaritmo. Contaminaba
     ataque, planitud Y ciclo a la vez. El cuerpo es todo lo que está a menos de
     12 dB por debajo de la mediana de la envolvente; el ataque y la planitud se
     miden ahí dentro, y los fundidos se declaran aparte como lo que son. */
  const ordenEnv = env.slice().sort((a, b) => a - b);
  const medianaEnv = ordenEnv.length ? ordenEnv[Math.floor(ordenEnv.length / 2)] : 0;
  const suelo = medianaEnv * Math.pow(10, -12 / 20);
  let ini = 0, fin = env.length - 1;
  while (ini < env.length && env[ini] < suelo) ini++;
  while (fin > ini && env[fin] < suelo) fin--;
  const cuerpoEnv = env.slice(ini, fin + 1);
  const recorteIni = ini * 0.01, recorteFin = (env.length - 1 - fin) * 0.01;

  /* ATAQUE = la subida más brusca en 50 ms DENTRO del cuerpo. Es lo que se
     confundiría con la señal de fase, que es un tono de 0,10 s. */
  let ataque = 0, ataqueEn = 0;
  const salto = 5;
  for (let i = salto; i < cuerpoEnv.length; i++) {
    const d = dB(cuerpoEnv[i]) - dB(cuerpoEnv[i - salto]);
    if (d > ataque) { ataque = d; ataqueEn = (ini + i) * 0.01; }
  }

  /* PLANITUD: recorrido entre el percentil 5 y el 95 de la envolvente por
     segundo. Con percentiles y no con min/max, que los fijaría un solo clic. */
  const porSeg = [];
  for (let p = 0; p + 100 <= cuerpoEnv.length; p += 100) {
    let s = 0; for (let i = 0; i < 100; i++) s += cuerpoEnv[p + i] * cuerpoEnv[p + i];
    porSeg.push(Math.sqrt(s / 100));
  }
  const orden = porSeg.slice().sort((a, b) => a - b);
  const pct = (q) => orden.length ? orden[Math.min(orden.length - 1, Math.floor(q * orden.length))] : 0;
  const planitud = dB(pct(0.95)) - dB(pct(0.05));

  /* CICLO: autocorrelación de la envolvente del CUERPO, sin media, entre 4 y
     20 s. Es lo que dice si la pieza de Balance respira a 10 o a 12 segundos.
     Se normaliza POR DESFASE (dividiendo entre los términos que solapan): sin
     eso los desfases largos suman menos y el máximo se va siempre al corto. */
  const med = cuerpoEnv.length ? cuerpoEnv.reduce((a, b) => a + b, 0) / cuerpoEnv.length : 0;
  const e0 = cuerpoEnv.map(v => v - med);
  const varE = e0.reduce((a, b) => a + b * b, 0) / (e0.length || 1) || 1e-12;
  /* SE BUSCA DESDE 1 s, NO DESDE 4. La primera versión empezaba en 4 s porque
     es lo mínimo que pide el brief, y `relajacion` devolvió 4,0 s con r=0,95 y
     `energia` 8,0 exactos: un máximo en el BORDE de la ventana, que es la señal
     de que el período de verdad está fuera y lo que se ve es el recorte. */
  let ciclo = 0, cicloR = 0;
  for (let lag = 100; lag <= 2000 && lag < e0.length / 2; lag++) {
    let s = 0, c = 0;
    for (let i = 0; i + lag < e0.length; i++) { s += e0[i] * e0[i + lag]; c++; }
    const r = c ? (s / c) / varE : 0;
    if (r > cicloR) { cicloR = r; ciclo = lag * 0.01; }
  }

  /* AFINACIÓN: FFT larga sobre el centro del archivo (65536 a 16 kHz = 4,1 s,
     bin de 0,244 Hz) con interpolación parabólica del pico. Sin la parábola no
     se puede separar 96,22 de 98,00, que distan 1,78 Hz. */
  const NL = 65536;
  let f0 = 0;
  if (n > NL) {
    const p0 = Math.floor((n - NL) / 2);
    const re = new Float64Array(NL), im = new Float64Array(NL);
    for (let i = 0; i < NL; i++) re[i] = x[p0 + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / NL));
    fft(re, im);
    const mag = new Float64Array(NL / 2);
    for (let k = 0; k < NL / 2; k++) mag[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
    /* se busca el pico entre 60 y 500 Hz: la tónica y sus dos primeros
       armónicos caen ahí en cualquiera de las piezas */
    const k0 = Math.ceil(60 * NL / RATE), k1 = Math.floor(500 * NL / RATE);
    let kp = k0;
    for (let k = k0; k <= k1; k++) if (mag[k] > mag[kp]) kp = k;
    const a = Math.log(Math.max(mag[kp - 1], 1e-12));
    const b = Math.log(Math.max(mag[kp], 1e-12));
    const c = Math.log(Math.max(mag[kp + 1], 1e-12));
    const d = 0.5 * (a - c) / (a - 2 * b + c || 1e-9);
    f0 = (kp + d) * RATE / NL;
  }

  /* COSTURA: qué pasa si el archivo se repite. Tres cosas distintas y las tres
     rompen un bucle -- el nivel de los extremos, el salto de muestra al empalmar
     y si la pieza entra o sale por un fundido. */
  const V = Math.round(RATE * 0.1);
  const rmsDe = (p, L) => { let s = 0; for (let i = 0; i < L; i++) s += x[p + i] * x[p + i]; return Math.sqrt(s / L); };
  const cabeza = rmsDe(0, V), cola = rmsDe(n - V, V);
  const costuraNivel = Math.abs(dB(cola) - dB(cabeza));
  const saltoMuestra = Math.abs(x[n - 1] - x[0]) / (rms || 1e-9);
  /* fundido: el primer y el último segundo contra el cuerpo de la pieza */
  const cuerpo = rmsDe(Math.floor(n / 2), Math.min(RATE, n - Math.floor(n / 2)));
  const entra = dB(rmsDe(0, Math.min(RATE, n))) - dB(cuerpo);
  const sale = dB(rmsDe(n - Math.min(RATE, n), Math.min(RATE, n))) - dB(cuerpo);

  return {
    bytes, dur, canales, rateOriginal: audio.sampleRate,
    pico, rms, picoDb: dB(pico), rmsDb: dB(rms),
    vozPct: 100 * vozBanda / (total || 1),
    consPct: 100 * consonantes / (total || 1),
    ataque, ataqueEn, planitud,
    recorteIni, recorteFin,
    ciclo, cicloR,
    f0, G2hz,
    costuraNivel, saltoMuestra, entra, sale,
  };
}

/* ── informe ─────────────────────────────────────────────────────────────── */
const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
const f2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
const mmss = (s) => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');

/* LA NOTA MÁS CERCANA, en la rejilla que se le pase (432 = la de la app,
   440 = la que da cualquier generador por defecto).

   POR QUÉ NO SE PREGUNTA «CUÁNTOS CENTS LE FALTAN PARA SER SOL»: esa pregunta
   da una respuesta con sentido sólo si la pieza YA está en Sol y desafinada.
   Si está en otra nota, «-171,5 cents del Sol» describe un intervalo, no un
   error de afinación, y leerlo como si fuera lo segundo es lo que convertiría
   un «está en Fa» en un «está casi en Sol». Se nombra la nota y ya. */
const NOMBRES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
function notaMasCercana(f, base) {
  if (!f) return null;
  /* semitonos desde La4 de esa rejilla */
  const s = Math.round(12 * Math.log2(f / base));
  const exacta = base * Math.pow(2, s / 12);
  const cents = 1200 * Math.log2(f / exacta);
  const midi = 69 + s;
  return { nombre: NOMBRES[((midi % 12) + 12) % 12], oct: Math.floor(midi / 12) - 1, cents, exacta };
}
const corto = (f) => f.replace(/^pace_/, '').replace(/_\d+\.mp3$/, '');

(async () => {
  if (!fs.existsSync(DIR)) { console.error('GUARD: no existe ' + DIR); process.exit(2); }
  const todos = fs.readdirSync(DIR).filter(f => /\.mp3$/i.test(f)).sort();
  const musica = todos.filter(f => MUSICA.test(f));
  const voces = todos.filter(f => VOZ.test(f));
  if (!musica.length) { console.error('GUARD: ni una pieza pace_*.mp3 en ' + DIR); process.exit(2); }
  /* GUARD DE CERO EN LOS DOS SENTIDOS (s169): sin locuciones el margen contra
     la voz no se calcula, y callarlo lo haría parecer «sin problema». */
  if (!voces.length) console.log('AVISO: sin locuciones en la carpeta -- no habrá margen contra la voz\n');

  const { srv, port } = await servir(DIR);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:' + port + '/');

  const med = {};
  for (const f of musica.concat(voces)) {
    process.stdout.write('midiendo ' + f + ' ... ');
    med[f] = await page.evaluate(medirEnPagina, {
      url: 'http://127.0.0.1:' + port + '/' + encodeURIComponent(f), G2,
    });
    console.log('ok');
  }
  await browser.close(); srv.close();

  console.log('\n============================================================');
  console.log('BANCO DE MÚSICA · ' + musica.length + ' piezas · análisis a 16 kHz mono');
  console.log('drone de la app: G2 = ' + f2(G2) + ' Hz (BASE_A ' + BASE_A + ', Sound.jsx)');
  console.log('============================================================\n');

  const W = 24;
  console.log('1 · LO QUE PESAN Y LO QUE DURAN   (tope del brief: 1,83 MB a 64 kbps mono)');
  for (const f of musica) {
    const m = med[f];
    const kbps = (m.bytes * 8) / m.dur / 1000;
    const mb = m.bytes / 1048576;
    /* peso que tendría a 64 kbps mono, que es el formato que fija el brief */
    const mb64 = (64000 * m.dur / 8) / 1048576;
    console.log('  ' + corto(f).padEnd(W) + mmss(m.dur).padStart(5) + ' · ' +
      (f2(mb) + ' MB').padStart(8) + ' a ' + String(Math.round(kbps)).padStart(3) +
      ' kbps ' + m.canales + 'ch · a 64 kbps mono: ' + f2(mb64) + ' MB' +
      (mb64 > 1.83 ? '  [PASA DEL TOPE]' : ''));
  }

  console.log('\n2 · EN QUÉ NOTA ESTÁN   (el brief pide Sol; el drone de la app es Sol2)');
  for (const f of musica) {
    const m = med[f];
    const n432 = notaMasCercana(m.f0, 432), n440 = notaMasCercana(m.f0, 440);
    /* El batido sólo se nombra si de verdad es un batido: por encima de ~20 Hz
       la diferencia se oye como otra nota, no como una pulsación, y llamarlo
       «batido de 34 Hz» sería describir mal lo que pasa. */
    let oct = m.f0; while (oct > G2 * 1.5) oct /= 2; while (oct < G2 / 1.5) oct *= 2;
    const dif = Math.abs(oct - G2);
    const enSol = n432 && n432.nombre === 'Sol';
    console.log('  ' + corto(f).padEnd(W) + f2(m.f0).padStart(7) + ' Hz · ' +
      (n432 ? (n432.nombre + n432.oct + ' @432 ' + (n432.cents >= 0 ? '+' : '') + f1(n432.cents) + 'c').padEnd(20) : '?') +
      ' · ' + (n440 ? (n440.nombre + n440.oct + ' @440 ' + (n440.cents >= 0 ? '+' : '') + f1(n440.cents) + 'c').padEnd(20) : '?') +
      ' · ' + (enSol
        ? (dif < 20 ? 'batido de ' + f2(dif) + ' Hz con el drone' : 'otra octava')
        : 'NO es Sol'));
  }

  console.log('\n3 · LO QUE EL BRIEF EXIGE Y NO SE OYE MIRANDO');
  console.log('  (ataque y planitud medidos SÓLO en el cuerpo: los fundidos van en §4)');
  console.log('  ' + 'pieza'.padEnd(W) + '200-3k    1-4k  ataque/50ms  planitud');
  for (const f of musica) {
    const m = med[f];
    console.log('  ' + corto(f).padEnd(W) +
      (f2(m.vozPct) + '%').padStart(7) + (f2(m.consPct) + '%').padStart(8) +
      ('+' + f1(m.ataque) + ' dB').padStart(12) + (f1(m.planitud) + ' dB').padStart(10));
  }
  if (voces.length) {
    console.log('  --- las locuciones, para ver dónde vive de verdad la voz ---');
    for (const f of voces) {
      const m = med[f];
      console.log('  ' + f.replace('voice_final_', '').replace(/_\d+\.mp3$/, '').padEnd(W) +
        (f2(m.vozPct) + '%').padStart(7) + (f2(m.consPct) + '%').padStart(8));
    }
  }

  console.log('\n4 · ¿SE PUEDE PONER EN BUCLE?');
  console.log('  («entra/sale» = el primer y el último segundo contra el cuerpo:');
  console.log('   un número muy negativo es un FUNDIDO, y un fundido no empalma)');
  for (const f of musica) {
    const m = med[f];
    const fundido = m.entra < -6 || m.sale < -6;
    console.log('  ' + corto(f).padEnd(W) + 'entra ' + (f1(m.entra) + ' dB').padStart(9) +
      ' · sale ' + (f1(m.sale) + ' dB').padStart(9) +
      ' · extremos ' + (f1(m.costuraNivel) + ' dB').padStart(8) +
      (fundido ? '  [FUNDIDO: no empalma]' : '  [empalma]'));
  }

  console.log('\n5 · EL CICLO   (autocorrelación de la envolvente del cuerpo, 1-20 s)');
  for (const f of musica) {
    const m = med[f];
    const pedido = /balance10/i.test(f) ? 10 : (/balance12/i.test(f) ? 12 : null);
    /* r por debajo de 0,3 no es un ciclo: es ruido de la envolvente */
    const hay = m.cicloR >= 0.3;
    let nota;
    if (pedido) {
      nota = ' · pedido ' + pedido + ' s → ' +
        (hay && Math.abs(m.ciclo - pedido) < 0.3 ? 'CUADRA'
          : hay ? 'NO cuadra' : 'NO hay ciclo medible');
    } else {
      nota = ' · sin ciclo pedido' + (hay ? ' — y aquí HAY uno' : ' — y no hay');
    }
    console.log('  ' + corto(f).padEnd(W) + (f1(m.ciclo) + ' s').padStart(7) +
      ' (r=' + f2(m.cicloR) + ')' + nota);
  }

  console.log('\n6 · A QUÉ GANANCIA PONERLAS');
  console.log('  el drone de la app arranca a pico ' + NIVEL_FONDO + ' (Sound.jsx), que es el');
  console.log('  único precedente de «nivel de fondo» que el proyecto tiene:');
  for (const f of musica) {
    const m = med[f];
    const g = NIVEL_FONDO / (m.pico || 1);
    console.log('  ' + corto(f).padEnd(W) + 'pico ' + (f2(m.picoDb) + ' dBFS').padStart(11) +
      ' · ganancia ' + f2(g).padStart(5) + ' (' + f1(20 * Math.log10(g)) + ' dB)');
  }

  console.log('\n--- lo que este banco NO cubre ---');
  console.log('  · si la pieza es BONITA, o si pega con la familia: eso es criterio y se escucha');
  console.log('  · el timbre: mide energía por banda, no si un handpan suena a handpan');
  console.log('  · los términos de uso comercial, que la FASE 5 pide por escrito');
  console.log('  · la costura se mide en los extremos del archivo: que el empalme no CHASQUE');
  console.log('    no garantiza que no se NOTE (una textura que evoluciona delata la vuelta)');
  console.log('  · el ciclo sale de la envolvente: un ciclo hecho sólo con filtro y sin tocar');
  console.log('    el volumen puede existir y no verse aquí');
})();
