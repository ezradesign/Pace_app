/* PACE · el guion que corta las tomas de la voz de Mueve y Estira (scripts/voz-cuerpo-tomas.js)
 * ==========================================================================================
 * Ez graba por tomas (15 nov. 2026): los 25 números en un solo audio, la cuenta atrás en otro y los avisos
 * en dos más. El guion los corta por los silencios, mide cada palabra e iguala su volumen con Respira.
 * Aquí la toma es de mentira y se sabe dónde está cada palabra: 25 «palabras» de tono con ruido de fondo,
 * de largos distintos, y algunas en dos golpes separados por 120 ms, como «Cambia de lado» o «vein-ti-cinco».
 * Si el corte junta o parte palabras, o el volumen no sale igualado, cae.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { segmentar, procesar } = require('../scripts/voz-cuerpo-tomas.js');

const RATE = 44100;

/* Una toma de mentira: cada palabra es un tono con su subida y su bajada, a nivel distinto; entre palabra y
   palabra, de 0,7 a 1,1 s de ruido a unos −62 dBFS. Devuelve las muestras y dónde está cada palabra. */
function tomaFalsa(n, semilla) {
  let s = semilla || 7;
  const azar = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const trozos = []; const verdad = []; let t = 0;
  const silencio = (seg) => { const k = Math.round(seg * RATE); const a = new Float32Array(k); for (let i = 0; i < k; i++) a[i] = (azar() - 0.5) * 0.002; trozos.push(a); t += seg; };
  const golpe = (seg, amp, f) => { const k = Math.round(seg * RATE); const a = new Float32Array(k);
    for (let i = 0; i < k; i++) { const env = Math.min(1, i / (0.02 * RATE), (k - i) / (0.03 * RATE)); a[i] = amp * env * Math.sin(2 * Math.PI * f * i / RATE); }
    trozos.push(a); t += seg; };
  silencio(0.4);
  for (let w = 0; w < n; w++) {
    const ini = t; const amp = 0.05 + azar() * 0.25; const f = 160 + azar() * 160;
    if (w % 4 === 3) { golpe(0.25, amp, f); silencio(0.12); golpe(0.3, amp, f); }
    else golpe(0.3 + azar() * 0.55, amp, f);
    verdad.push({ ini, fin: t });
    silencio(0.7 + azar() * 0.4);
  }
  const x = new Float32Array(trozos.reduce((k, a) => k + a.length, 0));
  let o = 0; for (const a of trozos) { x.set(a, o); o += a.length; }
  return { x, verdad };
}
function wav(archivo, x) {
  const b = Buffer.alloc(44 + x.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + x.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(RATE, 24); b.writeUInt32LE(RATE * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(x.length * 2, 40);
  for (let i = 0; i < x.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2);
  fs.writeFileSync(archivo, b);
}

test('tomas-1 · los 25 números salen sueltos, sin juntar ni partir, donde están', () => {
  const { x, verdad } = tomaFalsa(25);
  const tramos = segmentar(x, RATE);
  expect(tramos.length, 'una palabra por línea').toBe(25);
  tramos.forEach((t, i) => {
    expect(Math.abs(t.ini - verdad[i].ini), 'empieza la palabra ' + (i + 1)).toBeLessThan(0.03);
    expect(Math.abs(t.fin - verdad[i].fin), 'acaba la palabra ' + (i + 1)).toBeLessThan(0.04);
  });
});

test('tomas-2 · el guion corta, iguala el volumen, rechaza la toma que no cuadra y usa la repetida', async () => {
  test.setTimeout(60000);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pace-tomas-'));
  const salida = path.join(dir, 'salida'); const datos = path.join(dir, 'datos.js');
  wav(path.join(dir, 'sulafat-es-numeros.wav'), tomaFalsa(25, 11).x);
  wav(path.join(dir, 'sulafat-es-cuenta.wav'), tomaFalsa(2, 5).x);           // dos palabras: le falta una
  wav(path.join(dir, 'sulafat-es-repite-diecisiete.wav'), tomaFalsa(1, 3).x);
  const objetivo = { sulafat: -22, bradford: -24 };
  const r = await procesar(dir, { salida, datos, objetivo });
  const juego = r.datos.es.sulafat;
  for (let i = 1; i <= 25; i++) expect(juego['n' + i], 'falta el ' + i).toBeTruthy();
  expect(juego.n17.archivo).toBe('sulafat-es-repite-diecisiete.wav');
  expect(juego.n16.archivo).toBe('sulafat-es-numeros.wav');
  expect(fs.existsSync(path.join(salida, 'sulafat-es-numeros.wav'))).toBe(true);
  /* Igualado: el nivel de cada palabra con su `vol` queda en el de Respira (salvo que lo frene el techo). */
  for (const k of ['n1', 'n5', 'n12', 'n25']) {
    const e = juego[k];
    expect(Math.abs(e.nivel + 20 * Math.log10(e.vol) - objetivo.sulafat), k).toBeLessThan(0.6);
    expect(e.a).toBeLessThanOrEqual(e.ini); expect(e.b).toBeGreaterThanOrEqual(e.fin);
  }
  /* La toma de la cuenta tiene dos palabras y tres líneas: no se escribe nada de ella, y se dice. */
  expect(juego.c3).toBeUndefined();
  expect(r.informe.join('\n')).toMatch(/NO · sulafat-es-cuenta\.wav: salen 2 palabras/);
  expect(fs.readFileSync(datos, 'utf8')).toMatch(/^\/\* PACE · app\/ui\/Sound\.voz\.cuerpo\.datos\.js — LO ESCRIBE/);

  /* --solo rehace una palabra y deja las demás como estaban. */
  const antes = JSON.stringify(juego.n3);
  wav(path.join(dir, 'sulafat-es-repite-diecisiete.wav'), tomaFalsa(1, 99).x);
  const r2 = await procesar(dir, { salida, datos, objetivo, solo: 'diecisiete' });
  expect(JSON.stringify(r2.datos.es.sulafat.n3)).toBe(antes);
  expect(r2.datos.es.sulafat.n17.fin).not.toBe(juego.n17.fin);
  fs.rmSync(dir, { recursive: true, force: true });
});
