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

   EL SILENCIO DE MÁS SE QUITA: una toma MP3 (y una repetida) se escribe con unos 0,4 s entre palabra y
   palabra, quitando cuadros enteros sin recodificar (scripts/voz-cuerpo-mp3.js), y se mide ya recortada.
   Si al recortarla cambiara una palabra, se escribe sin recortar y se dice. Las tomas que quedan en la
   tabla se apuntan en el precache de sw.js, entre sus marcas: Mueve y Estira hablan sin conexión.

   Uso:
     node scripts/voz-cuerpo-tomas.js "<carpeta con las tomas>" [--solo NOMBRE] [--salida DIR] [--datos ARCHIVO]

   Las tomas se llaman VOZ-IDIOMA-TOMA.mp3 (o .wav): sulafat-es-numeros.mp3, bradford-en-lados.wav…
   Una palabra repetida: VOZ-IDIOMA-repite-NOMBRE.mp3, con NOMBRE el de su archivo final (diecisiete,
   switch-sides, cuenta-dos…). Con --solo NOMBRE solo se rehace esa palabra.

   Se descodifica con el Chromium de Playwright (`decodeAudioData`), que lee MP3 y WAV igual que el móvil. */
'use strict';
const fs = require('fs');
const path = require('path');
const mp3 = require('./voz-cuerpo-mp3.js');

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
  const leerBytes = async (bytes) => {
    const b64 = bytes.toString('base64');
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
  return { leerBytes, leer: (archivo) => leerBytes(fs.readFileSync(archivo)), cerrar: () => browser.close() };
}

const kb = (n) => Math.round(n / 1024) + ' KB';

/* Lee una toma y, si es MP3, le quita el silencio de más. Devuelve los bytes que se escriben y lo que
   suena en ellos, ya descodificado ({ bytes, x, rate, nota }), o { error, tramos } si no salen tantas
   palabras como líneas. Se escribe sin recortar si el recorte cambia el número de palabras o lo que dura
   alguna, o si callaría un cuadro dentro del trozo que suena. */
async function prepararToma(dec, bruto, ext, lineas, corte) {
  const cuadros = ext === '.mp3' ? mp3.cuadrosMp3(bruto) : [];
  const limpio = cuadros.length ? mp3.ensamblar(bruto, cuadros).bytes : bruto;
  const d1 = await dec.leerBytes(limpio);
  const t1 = segmentar(d1.x, d1.rate, corte);
  if (t1.length !== lineas) return { error: 'salen ' + t1.length + ' palabras y ' + (lineas === 1 ? 'tiene que ser una' : 'la toma tiene ' + lineas + ' líneas'), tramos: t1 };
  const tal = { bytes: limpio, x: d1.x, rate: d1.rate, nota: '' };
  const quitar = cuadros.length ? mp3.cuadrosDeMas(cuadros, t1) : new Set();
  if (!quitar.size) return tal;
  const r = mp3.ensamblar(bruto, cuadros, quitar);
  const d2 = await dec.leerBytes(r.bytes);
  const t2 = segmentar(d2.x, d2.rate, corte);
  const paso = cuadros[0].muestras / cuadros[0].hz;
  const motivo = t2.length !== lineas ? 'salen ' + t2.length + ' palabras'
    : t2.some((s, i) => Math.abs((s.fin - s.ini) - (t1[i].fin - t1[i].ini)) > 0.03) ? 'cambia lo que dura una palabra'
    : r.callados.some((k) => t2.some((s) => k * paso < s.fin + DETRAS && (k + 1) * paso > s.ini - DELANTE)) ? 'callaría un trozo de palabra' : '';
  if (motivo) return Object.assign(tal, { nota: ' · SIN RECORTAR (' + motivo + ')' });
  return { bytes: r.bytes, x: d2.x, rate: d2.rate, nota: ' · ' + kb(bruto.length) + ' → ' + kb(r.bytes.length) };
}

/* El precache de sw.js: entre sus dos marcas, una fila por toma que la tabla usa. */
const SW_INICIO = '/* La voz de Mueve y Estira: ESTAS FILAS LAS ESCRIBE scripts/voz-cuerpo-tomas.js, no se tocan a mano. */';
const SW_FIN = '/* Fin de la voz de Mueve y Estira. */';
function escribirPrecache(archivo, datos) {
  const sw = fs.readFileSync(archivo, 'utf8');
  const a = sw.indexOf(SW_INICIO), z = sw.indexOf(SW_FIN);
  if (a < 0 || z < a) return 'NO · sw.js no tiene las marcas de la voz de Mueve y Estira: las tomas no se guardan para sin conexión';
  const nl = sw.includes('\r\n') ? '\r\n' : '\n';
  const sangria = sw.slice(sw.lastIndexOf('\n', a) + 1, a);
  const tomas = new Set();
  for (const voces of Object.values(datos)) for (const pal of Object.values(voces)) for (const e of Object.values(pal)) tomas.add(e.archivo);
  const filas = [...tomas].sort().map((t) => sangria + "'/app/move/voz/" + t + "'," + nl).join('');
  const nuevo = sw.slice(0, a + SW_INICIO.length) + nl + filas + sangria + sw.slice(z);
  if (nuevo !== sw) fs.writeFileSync(archivo, nuevo);
  return 'ok · sw.js guarda ' + tomas.size + ' tomas para sin conexión';
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
        const ext = path.extname(f).toLowerCase();
        const t = await prepararToma(dec, fs.readFileSync(path.join(carpeta, f)), ext, filas.length, op.corte);
        const r = t.error ? t : cortarToma(t.x, t.rate, filas.map(r => r[0]), objetivo[voz], op.corte);
        if (r.error) { informe.push('NO · ' + f + ': ' + r.error + ' (' + r.tramos.map(s => s.ini + '-' + s.fin).join(', ') + ')'); continue; }
        const final = voz + '-' + idioma + '-' + toma + ext;
        fs.writeFileSync(path.join(salida, final), t.bytes);
        datos[idioma] = datos[idioma] || {}; datos[idioma][voz] = datos[idioma][voz] || {};
        for (const fila of filas) {
          if (op.solo && fila[col] !== op.solo) continue;
          datos[idioma][voz][fila[0]] = Object.assign({ archivo: final }, r.entradas[fila[0]]);
        }
        informe.push('ok · ' + f + ' → ' + filas.length + ' palabras' + t.nota);
      }
      // Las repetidas sustituyen a la palabra cortada de su toma.
      for (const [, filas] of Object.entries(TOMAS)) for (const fila of filas) {
        const rep = archivos.find(a => new RegExp('^' + voz + '-' + idioma + '-repite-' + fila[col] + '\\.(mp3|wav)$', 'i').test(a));
        if (!rep || (op.solo && fila[col] !== op.solo)) continue;
        const ext = path.extname(rep).toLowerCase();
        const t = await prepararToma(dec, fs.readFileSync(path.join(carpeta, rep)), ext, 1, op.corte);
        if (t.error) { informe.push('NO · ' + rep + ': ' + t.error); continue; }
        const tramo = segmentar(t.x, t.rate, op.corte)[0];
        const final = voz + '-' + idioma + '-repite-' + fila[col] + ext;
        fs.writeFileSync(path.join(salida, final), t.bytes);
        datos[idioma] = datos[idioma] || {}; datos[idioma][voz] = datos[idioma][voz] || {};
        datos[idioma][voz][fila[0]] = Object.assign({ archivo: final }, medirPalabra(t.x, t.rate, tramo, 0, t.x.length / t.rate, objetivo[voz]));
        informe.push('ok · ' + rep + ' sustituye a «' + fila[col] + '»' + t.nota);
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
  // El precache solo se toca cuando se escribe en la app de verdad (no en las pruebas, que van a otra carpeta).
  const sw = op.sw !== undefined ? op.sw : (path.resolve(salida) === path.join(ROOT, 'app/move/voz') ? path.join(ROOT, 'sw.js') : null);
  if (sw) informe.push(escribirPrecache(sw, datos));
  return { informe, datos };
}

module.exports = { segmentar, nivelDb, cortarToma, procesar, abrirDescodificador, TOMAS, TOPE, CORTE, SW_INICIO, SW_FIN };

if (require.main === module) {
  const args = process.argv.slice(2);
  const carpeta = args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--solo' && args[args.indexOf(a) - 1] !== '--salida' && args[args.indexOf(a) - 1] !== '--datos');
  const val = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  if (!carpeta) { console.error('Uso: node scripts/voz-cuerpo-tomas.js "<carpeta con las tomas>" [--solo NOMBRE]'); process.exit(2); }
  procesar(path.resolve(carpeta), { solo: val('--solo'), salida: val('--salida'), datos: val('--datos') })
    .then(({ informe }) => { console.log(informe.join('\n') || 'No hay tomas con nombre conocido en esa carpeta.'); })
    .catch(e => { console.error(e); process.exit(1); });
}
