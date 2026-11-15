#!/usr/bin/env node
/* PACE · scripts/voz-cuerpo-tomas.js — las tomas de la voz de Mueve y Estira, a palabras
   ======================================================================================
   Ez graba por tomas (Ez, 15 nov. 2026: «sí, todos los números seguidos»): cuatro audios por voz e
   idioma, cada uno con varias frases separadas por un silencio. Este guion los corta por los silencios,
   recorta los bordes, iguala el volumen de cada palabra con el de la misma voz en Respira y escribe la
   tabla que lee la app (`app/ui/Sound.voz.cuerpo.datos.js`). Las tomas se copian a `app/move/voz/` con
   su nombre final.

   POR QUÉ NO ESCRIBE UN MP3 POR PALABRA: no hay codificador MP3 en el proyecto, y la app ya sabe sonar un
   trozo de un archivo (lo hace con todas las voces de Respira: `ini`, `fin` y `vol` de Sound.voz.jsx).
   Cortar en la tabla no pierde calidad, no recodifica y deja cuatro descargas por voz e idioma en vez de
   36. Cada palabra queda con su nombre en la tabla, y una repetida es un archivo suelto que la sustituye.

   Uso:
     node scripts/voz-cuerpo-tomas.js "<carpeta con las tomas>" [--solo NOMBRE] [--salida DIR] [--datos ARCHIVO]

   Las tomas se llaman VOZ-IDIOMA-TOMA.mp3 (o .wav): sulafat-es-numeros.mp3, bradford-en-lados.wav…
   Una palabra repetida: VOZ-IDIOMA-repite-NOMBRE.mp3, con NOMBRE el de su archivo final (diecisiete,
   switch-sides, cuenta-dos…). Con --solo NOMBRE solo se rehace esa palabra.

   Se descodifica con el Chromium de Playwright (`decodeAudioData`), que lee MP3 y WAV igual que el móvil. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VOCES = ['sulafat', 'bradford'];
const IDIOMAS = ['es', 'en'];

/* Lo que dice cada toma, en orden: [clave de la app, nombre del archivo en es, en en]. La clave no
   depende del idioma; el nombre es el que se usa para repetir una palabra y en los avisos. */
const NUM_ES = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece',
  'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidos', 'veintitres',
  'veinticuatro', 'veinticinco'];
const NUM_EN = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
  'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two', 'twenty-three',
  'twenty-four', 'twenty-five'];
const TOMAS = {
  numeros: NUM_ES.map((n, i) => ['n' + (i + 1), n, NUM_EN[i]]),
  cuenta: [['c3', 'cuenta-tres', 'count-three'], ['c2', 'cuenta-dos', 'count-two'], ['c1', 'cuenta-uno', 'count-one']],
  avisos: [['colocate', 'colocate', 'get-set'], ['siguiente', 'siguiente', 'next'], ['ya', 'ya', 'go'], ['ultimo', 'ultimo-paso', 'last-step']],
  lados: [['izquierda', 'izquierda', 'left'], ['derecha', 'derecha', 'right'], ['cambia', 'cambia-de-lado', 'switch-sides'], ['descansa', 'descansa', 'rest']],
};
/* Lo más que puede durar la palabra (sin silencios). Pasarse no rompe nada (en ese momento la app
   suena el tono), pero se avisa: la cuenta va de segundo en segundo y la repetición más rápida, 2 s. */
const TOPE = { c3: 0.85, c2: 0.85, c1: 0.85, ya: 0.85, cambia: 2, defecto: 1.5 };

/* El corte: ventanas de 10 ms, y voz es lo que pasa de −50 dBFS (el umbral de Respira). Dos tramos de
   voz separados por menos de 350 ms son la misma frase («Cambia de lado», el «vein-ti-cin-co»); entre
   línea y línea la toma deja un segundo. Un tramo de menos de 80 ms es un chasquido. */
const CORTE = { umbralDb: -50, ventanaMs: 10, huecoMs: 350, minimoMs: 80 };
/* Lo que se oye alrededor de la palabra: 30 ms delante (no cortar el ataque de la consonante) y
   120 ms detrás (la cola de la última sílaba), sin pisar nunca a la vecina. */
const DELANTE = 0.03;
const DETRAS = 0.12;

function ventanasDb(x, rate, ventanaMs) {
  const n = Math.max(1, Math.round(rate * ventanaMs / 1000));
  const out = [];
  for (let i = 0; i < x.length; i += n) {
    let s = 0; const fin = Math.min(x.length, i + n);
    for (let j = i; j < fin; j++) s += x[j] * x[j];
    out.push(10 * Math.log10(s / Math.max(1, fin - i) + 1e-20));
  }
  return { db: out, paso: n / rate };
}

/* Los tramos de voz de una toma: [{ ini, fin }] en segundos, donde empieza y acaba la palabra. */
function segmentar(x, rate, opciones) {
  const o = Object.assign({}, CORTE, opciones || {});
  const { db, paso } = ventanasDb(x, rate, o.ventanaMs);
  const tramos = [];
  let empieza = -1;
  for (let i = 0; i <= db.length; i++) {
    const voz = i < db.length && db[i] > o.umbralDb;
    if (voz && empieza < 0) empieza = i;
    if (!voz && empieza >= 0) { tramos.push([empieza, i]); empieza = -1; }
  }
  const juntos = [];
  for (const t of tramos) {
    const ult = juntos[juntos.length - 1];
    if (ult && (t[0] - ult[1]) * paso * 1000 < o.huecoMs) ult[1] = t[1];
    else juntos.push(t.slice());
  }
  return juntos.filter(t => (t[1] - t[0]) * paso * 1000 >= o.minimoMs)
    .map(t => ({ ini: +(t[0] * paso).toFixed(3), fin: +(t[1] * paso).toFixed(3) }));
}

/* El nivel de la palabra: la media de energía de sus ventanas con voz, en dBFS (como se midió el «Más»). */
function nivelDb(x, rate, ini, fin) {
  const a = Math.floor(ini * rate), b = Math.min(x.length, Math.ceil(fin * rate));
  const { db } = ventanasDb(x.subarray(a, b), rate, CORTE.ventanaMs);
  const voz = db.filter(d => d > CORTE.umbralDb);
  if (!voz.length) return -Infinity;
  const e = voz.reduce((s, d) => s + Math.pow(10, d / 10), 0) / voz.length;
  return 10 * Math.log10(e);
}
function pico(x, rate, ini, fin) {
  let p = 0; const a = Math.floor(ini * rate), b = Math.min(x.length, Math.ceil(fin * rate));
  for (let i = a; i < b; i++) p = Math.max(p, Math.abs(x[i]));
  return p;
}

/* Corta una toma ya descodificada. Devuelve { entradas } o { error } si no salen tantas palabras como
   líneas: entonces no se escribe nada de esa toma, porque adivinar cuál falta sería peor. */
function cortarToma(x, rate, claves, objetivoDb, opciones) {
  const tramos = segmentar(x, rate, opciones);
  if (tramos.length !== claves.length) {
    return { error: 'salen ' + tramos.length + ' palabras y la toma tiene ' + claves.length + ' líneas', tramos };
  }
  const dur = x.length / rate;
  const entradas = {};
  tramos.forEach((t, i) => {
    const antes = i > 0 ? tramos[i - 1].fin : 0;
    const despues = i < tramos.length - 1 ? tramos[i + 1].ini : dur;
    entradas[claves[i]] = medirPalabra(x, rate, t, antes, despues, objetivoDb);
  });
  return { entradas };
}
function medirPalabra(x, rate, t, antes, despues, objetivoDb) {
  const a = Math.max(antes + 0.01, t.ini - DELANTE, 0);
  const b = Math.min(despues - 0.01, t.fin + DETRAS, x.length / rate);
  const nivel = nivelDb(x, rate, t.ini, t.fin);
  let vol = Math.pow(10, (objetivoDb - nivel) / 20);
  const p = pico(x, rate, a, b);
  if (p * vol > 0.98) vol = 0.98 / p;   // nunca por encima del techo: se oiría rota
  return { ini: t.ini, fin: t.fin, a: +a.toFixed(3), b: +b.toFixed(3), vol: +Math.min(vol, 4).toFixed(3), nivel: +nivel.toFixed(1) };
}

/* ── Lo que necesita navegador: descodificar ───────────────────────────────────────────────────── */
async function abrirDescodificador() {
  const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const leer = async (archivo) => {
    const b64 = fs.readFileSync(archivo).toString('base64');
    const r = await page.evaluate(async (datos) => {
      const bin = atob(datos); const u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      const ctx = new OfflineAudioContext(1, 1, 44100);
      const buf = await ctx.decodeAudioData(u.buffer);
      const m = new Float32Array(buf.length);
      for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < m.length; i++) m[i] += d[i] / buf.numberOfChannels; }
      const bytes = new Uint8Array(m.buffer); let s = '';
      for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      return { rate: buf.sampleRate, b64: btoa(s) };
    }, b64);
    const raw = Buffer.from(r.b64, 'base64');
    return { rate: r.rate, x: new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4) };
  };
  return { leer, cerrar: () => browser.close() };
}

/* El volumen de Respira, por voz: la media de sus palabras en castellano con su `vol`. */
async function objetivoRespira(leer) {
  const vm = require('vm');
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'app/ui/Sound.voz.jsx'), 'utf8').replace(/Object\.assign\(window[\s\S]*$/, '') + ';this.C=PACE_VOZ_CLIPS;', ctx);
  const obj = {};
  for (const voz of VOCES) {
    const fichas = ctx.C.es[voz];
    const niveles = [];
    for (const k of ['breathe.inhale', 'breathe.hold', 'breathe.exhale']) {
      const f = fichas[k];
      const { x, rate } = await leer(path.join(ROOT, 'app/breathe/voz', voz + '-' + f.archivo + '.mp3'));
      niveles.push(nivelDb(x, rate, f.ini, f.fin) + 20 * Math.log10(typeof f.vol === 'number' ? f.vol : 1));
    }
    obj[voz] = +(niveles.reduce((s, n) => s + n, 0) / niveles.length).toFixed(1);
  }
  return obj;
}

function leerDatos(archivo) {
  if (!fs.existsSync(archivo)) return {};
  const vm = require('vm');
  const ctx = { window: {} }; vm.createContext(ctx);
  try { vm.runInContext(fs.readFileSync(archivo, 'utf8') + ';this.D=PACE_VOZ_CUERPO;', ctx); return ctx.D || {}; } catch (e) { return {}; }
}
function escribirDatos(archivo, datos) {
  const cuerpo = JSON.stringify(datos, null, 1).replace(/\n\s*/g, ' ');
  fs.writeFileSync(archivo, '/* PACE · app/ui/Sound.voz.cuerpo.datos.js — LO ESCRIBE scripts/voz-cuerpo-tomas.js: no se edita a mano.\n' +
    '   Cada palabra de la voz de Mueve y Estira: su toma (`archivo`, en app/move/voz/), dónde empieza y acaba la palabra\n' +
    '   (`ini`, `fin`), lo que se oye alrededor (`a`, `b`) y el volumen que la iguala con Respira (`vol`). */\n' +
    'var PACE_VOZ_CUERPO = ' + cuerpo + ';\n\nObject.assign(window, { PACE_VOZ_CUERPO: PACE_VOZ_CUERPO });\n');
}

async function procesar(carpeta, op) {
  const salida = op.salida || path.join(ROOT, 'app/move/voz');
  const datosArchivo = op.datos || path.join(ROOT, 'app/ui/Sound.voz.cuerpo.datos.js');
  const datos = leerDatos(datosArchivo);
  const informe = [];
  const archivos = fs.readdirSync(carpeta);
  const dec = await abrirDescodificador();
  try {
    const objetivo = op.objetivo || await objetivoRespira(dec.leer);
    fs.mkdirSync(salida, { recursive: true });
    for (const voz of VOCES) for (const idioma of IDIOMAS) {
      const col = idioma === 'es' ? 1 : 2;
      for (const [toma, filas] of Object.entries(TOMAS)) {
        const f = archivos.find(a => new RegExp('^' + voz + '-' + idioma + '-' + toma + '\\.(mp3|wav)$', 'i').test(a));
        if (!f) continue;
        if (op.solo && !filas.some(r => r[col] === op.solo)) continue;
        const { x, rate } = await dec.leer(path.join(carpeta, f));
        const r = cortarToma(x, rate, filas.map(r => r[0]), objetivo[voz], op.corte);
        if (r.error) { informe.push('NO · ' + f + ': ' + r.error + ' (' + r.tramos.map(t => t.ini + '-' + t.fin).join(', ') + ')'); continue; }
        const final = voz + '-' + idioma + '-' + toma + path.extname(f).toLowerCase();
        fs.copyFileSync(path.join(carpeta, f), path.join(salida, final));
        datos[idioma] = datos[idioma] || {}; datos[idioma][voz] = datos[idioma][voz] || {};
        for (const fila of filas) {
          if (op.solo && fila[col] !== op.solo) continue;
          datos[idioma][voz][fila[0]] = Object.assign({ archivo: final }, r.entradas[fila[0]]);
        }
        informe.push('ok · ' + f + ' → ' + filas.length + ' palabras');
      }
      // Las repetidas sustituyen a la palabra cortada de su toma.
      for (const [, filas] of Object.entries(TOMAS)) for (const fila of filas) {
        const rep = archivos.find(a => new RegExp('^' + voz + '-' + idioma + '-repite-' + fila[col] + '\\.(mp3|wav)$', 'i').test(a));
        if (!rep || (op.solo && fila[col] !== op.solo)) continue;
        const { x, rate } = await dec.leer(path.join(carpeta, rep));
        const tramos = segmentar(x, rate, op.corte);
        if (tramos.length !== 1) { informe.push('NO · ' + rep + ': salen ' + tramos.length + ' palabras y tiene que ser una'); continue; }
        const final = voz + '-' + idioma + '-repite-' + fila[col] + path.extname(rep).toLowerCase();
        fs.copyFileSync(path.join(carpeta, rep), path.join(salida, final));
        datos[idioma] = datos[idioma] || {}; datos[idioma][voz] = datos[idioma][voz] || {};
        datos[idioma][voz][fila[0]] = Object.assign({ archivo: final }, medirPalabra(x, rate, tramos[0], 0, x.length / rate, objetivo[voz]));
        informe.push('ok · ' + rep + ' sustituye a «' + fila[col] + '»');
      }
      // Lo que se pasa de largo, por voz e idioma.
      const juego = (datos[idioma] || {})[voz] || {};
      for (const [clave, e] of Object.entries(juego)) {
        const tope = TOPE[clave] || TOPE.defecto;
        if (e.fin - e.ini > tope) informe.push('LARGA · ' + voz + '-' + idioma + ' «' + clave + '» dura ' + (e.fin - e.ini).toFixed(2) + ' s (tope ' + tope + ')');
      }
    }
  } finally { await dec.cerrar(); }
  escribirDatos(datosArchivo, datos);
  return { informe, datos };
}

module.exports = { segmentar, nivelDb, cortarToma, procesar, TOMAS, CORTE };

if (require.main === module) {
  const args = process.argv.slice(2);
  const carpeta = args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--solo' && args[args.indexOf(a) - 1] !== '--salida' && args[args.indexOf(a) - 1] !== '--datos');
  const val = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  if (!carpeta) { console.error('Uso: node scripts/voz-cuerpo-tomas.js "<carpeta con las tomas>" [--solo NOMBRE]'); process.exit(2); }
  procesar(path.resolve(carpeta), { solo: val('--solo'), salida: val('--salida'), datos: val('--datos') })
    .then(({ informe }) => { console.log(informe.join('\n') || 'No hay tomas con nombre conocido en esa carpeta.'); })
    .catch(e => { console.error(e); process.exit(1); });
}
