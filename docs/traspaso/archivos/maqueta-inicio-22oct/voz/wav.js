// PCM 16 bits → WAV, con la misma ganancia para todos (las diferencias de volumen se conservan),
// y mide el chasquido del final del «exhala» en Exhalación 4·6.
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out'), SR = 22050, GAN = 2.5;
function wav(i16) {
  const h = Buffer.alloc(44), n = i16.length * 2;
  h.write('RIFF', 0); h.writeUInt32LE(36 + n, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(n, 40);
  return Buffer.concat([h, Buffer.from(i16.buffer)]);
}
for (const f of fs.readdirSync(OUT).filter(x => x.endsWith('.pcm'))) {
  const raw = fs.readFileSync(path.join(OUT, f));
  const s = new Int16Array(raw.buffer, raw.byteOffset, raw.length / 2);
  const g = Int16Array.from(s, v => Math.max(-32767, Math.min(32767, Math.round(v * GAN))));
  fs.writeFileSync(path.join(OUT, f.replace('.pcm', '.wav')), wav(g));
  if (f.startsWith('exh46')) {
    // el final del archivo cae en 4,3 + (3,68 − 0,068) = 7,912 s
    const pico = (a, z) => { let m = 0; for (let i = Math.round(a * SR); i < Math.round(z * SR); i++) m = Math.max(m, Math.abs(s[i])); return (20 * Math.log10(m / 32767 + 1e-9)).toFixed(1); };
    console.log(f, 'palabra (4,4-5,5 s):', pico(4.4, 5.5), 'dBFS · silencio (6,0-7,8):', pico(6.0, 7.8), '· chasquido (7,85-7,93):', pico(7.85, 7.93));
  }
}
console.log(fs.readdirSync(OUT).filter(x => x.endsWith('.wav')).map(x => x + ' ' + fs.statSync(path.join(OUT, x)).size).join('\n'));
