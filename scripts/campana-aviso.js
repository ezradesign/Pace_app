/* PACE · la campana de fin de Foco, en un archivo para el aviso del iPhone
 * =========================================================================
 * En el iPhone el aviso de fin de Foco suena con la campana de PACE (Ez, D-10 B del 11 nov.
 * 2026), la misma que se oye en la web y en Android con la app abierta. Esa campana no es un
 * archivo: la toca Web Audio con la receta `pomodoro.end` de `app/ui/Sound.jsx`. Un aviso de
 * iOS necesita un archivo, y no un .mp3: iOS solo suena avisos en PCM lineal dentro de .wav,
 * .aiff o .caf, y de menos de 30 segundos.
 *
 * Aqui se toca la receta DE VERDAD (se carga Sound.jsx tal cual) contra un AudioContext de
 * mentira que solo sabe de osciladores y ganancias, y se escribe `campana-aviso.wav` en la raiz:
 * PCM de 16 bits, mono, 44,1 kHz. Va en la raiz porque el complemento de avisos solo busca el
 * sonido en la primera altura de la carpeta web de la app (`public/` en el iPhone), y
 * `android-www.js` lo copia ahi. Subida de volumen (`PICO`): en la app suena a 0,1, debajo de la
 * musica; un aviso suena solo y con el volumen del timbre del iPhone.
 *
 * Si la receta cambia, `verify` (verify.ios.js) lo dice: vuelve a correr
 * `node scripts/campana-aviso.js`.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const ARCHIVO = 'campana-aviso.wav';
const RECETA = 'pomodoro.end';
const MUESTRAS = 44100;
const PICO = 0.7;
const COLA = 0.1;

/* Un parametro de Web Audio con sus tres automatizaciones, como dice la norma. */
function parametro(inicial) {
  const pasos = [];
  return {
    value: inicial,
    setValueAtTime(v, t) { pasos.push({ tipo: 'set', v, t }); },
    linearRampToValueAtTime(v, t) { pasos.push({ tipo: 'lin', v, t }); },
    exponentialRampToValueAtTime(v, t) { pasos.push({ tipo: 'exp', v, t }); },
    en(t) {
      let v = inicial, t0 = 0;
      for (const p of pasos) {
        if (p.tipo === 'set') {
          if (t < p.t) return v;
          v = p.v; t0 = p.t;
        } else if (t < p.t) {
          const k = (t - t0) / (p.t - t0);
          return p.tipo === 'lin' ? v + (p.v - v) * k : v * Math.pow(p.v / v, k);
        } else {
          v = p.v; t0 = p.t;
        }
      }
      return v;
    },
  };
}

function contextoDeMentira() {
  const nodos = [];
  const destino = { entradas: [] };
  const conectable = (n) => { n.entradas = []; n.connect = (d) => { d.entradas.push(n); }; nodos.push(n); return n; };
  return {
    sampleRate: MUESTRAS, currentTime: 0, destination: destino, nodos,
    createOscillator() {
      return conectable({
        tipo: 'osc', type: 'sine', frequency: parametro(440), inicio: Infinity, fin: Infinity,
        start(t) { this.inicio = t || 0; }, stop(t) { this.fin = t; },
      });
    },
    createGain() { return conectable({ tipo: 'gain', gain: parametro(1) }); },
  };
}

function valor(nodo, t, fases, dt) {
  if (nodo.tipo === 'osc') {
    if (nodo.type !== 'sine') throw new Error('campana-aviso: la receta usa un oscilador ' + nodo.type);
    if (t < nodo.inicio || t >= nodo.fin) return 0;
    const fase = (fases.get(nodo) || 0) + 2 * Math.PI * nodo.frequency.en(t) * dt;
    fases.set(nodo, fase);
    return Math.sin(fase - 2 * Math.PI * nodo.frequency.en(t) * dt);
  }
  let suma = 0;
  for (const e of nodo.entradas) suma += valor(e, t, fases, dt);
  return nodo.tipo === 'gain' ? suma * nodo.gain.en(t) : suma;
}

/* Las muestras de la receta, sin escalar (Float64Array). */
function tocar() {
  const fuente = fs.readFileSync(path.join(ROOT, 'app', 'ui', 'Sound.jsx'), 'utf8');
  const caja = { React: { useCallback: (f) => f }, window: {}, console };
  vm.runInNewContext(fuente, caja, { filename: 'Sound.jsx' });
  const ctx = contextoDeMentira();
  const receta = caja.SOUND_RECIPES && caja.SOUND_RECIPES[RECETA];
  if (typeof receta !== 'function') throw new Error('campana-aviso: Sound.jsx ya no tiene la receta ' + RECETA);
  receta(ctx, 0);
  const fin = Math.max.apply(null, ctx.nodos.filter((n) => n.tipo === 'osc').map((n) => n.fin));
  if (!isFinite(fin)) throw new Error('campana-aviso: un oscilador de la receta no para nunca');
  const n = Math.ceil((fin + COLA) * MUESTRAS), dt = 1 / MUESTRAS;
  const fases = new Map(), fuera = new Float64Array(n);
  for (let i = 0; i < n; i++) fuera[i] = valor(ctx.destination, i * dt, fases, dt);
  return fuera;
}

/* El .wav entero (Buffer): PCM de 16 bits, mono, con el pico en `PICO`. */
function campanaWav() {
  const s = tocar();
  let pico = 0;
  for (const x of s) pico = Math.max(pico, Math.abs(x));
  const escala = pico > 0 ? PICO / pico : 0;
  const datos = Buffer.alloc(s.length * 2);
  for (let i = 0; i < s.length; i++) datos.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s[i] * escala)) * 32767), i * 2);
  const cab = Buffer.alloc(44);
  cab.write('RIFF', 0); cab.writeUInt32LE(36 + datos.length, 4); cab.write('WAVE', 8);
  cab.write('fmt ', 12); cab.writeUInt32LE(16, 16); cab.writeUInt16LE(1, 20); cab.writeUInt16LE(1, 22);
  cab.writeUInt32LE(MUESTRAS, 24); cab.writeUInt32LE(MUESTRAS * 2, 28); cab.writeUInt16LE(2, 32); cab.writeUInt16LE(16, 34);
  cab.write('data', 36); cab.writeUInt32LE(datos.length, 40);
  return Buffer.concat([cab, datos]);
}

/* { formato, canales, muestras, bits, segundos, datos } de un .wav PCM, o null si no lo es. */
function leerWav(buf) {
  if (!buf || buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') return null;
  if (buf.toString('ascii', 12, 16) !== 'fmt ' || buf.toString('ascii', 36, 40) !== 'data') return null;
  const formato = buf.readUInt16LE(20), canales = buf.readUInt16LE(22), muestras = buf.readUInt32LE(24), bits = buf.readUInt16LE(34);
  const datos = buf.subarray(44, 44 + buf.readUInt32LE(40));
  return { formato, canales, muestras, bits, datos, segundos: datos.length / (muestras * canales * bits / 8) };
}

if (require.main === module) {
  const wav = campanaWav();
  fs.writeFileSync(path.join(ROOT, ARCHIVO), wav);
  const w = leerWav(wav);
  console.log(ARCHIVO + ': ' + w.segundos.toFixed(2) + ' s, ' + (wav.length / 1024).toFixed(0) + ' KB');
}

module.exports = { ARCHIVO, campanaWav, leerWav };
