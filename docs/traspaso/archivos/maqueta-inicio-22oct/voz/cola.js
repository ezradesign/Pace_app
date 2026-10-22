const path = require('path');
const WT = process.argv[2];
const { chromium } = require(path.join(WT, 'node_modules', 'playwright'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://localhost:8803/privacy.html');
  const out = await p.evaluate(async () => {
    const res = {};
    const files = ['bradford-exhala', 'bradford-inhala', 'bradford-manten', 'sulafat-exhala', 'sulafat-inhala', 'sulafat-manten', 'bradford-exhale', 'bradford-inhale', 'bradford-hold', 'sulafat-exhale', 'sulafat-inhale', 'sulafat-hold'];
    for (const f of files) {
      const ab = await (await fetch('/app/breathe/voz/' + f + '.mp3')).arrayBuffer();
      const buf = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(ab);
      const d = buf.getChannelData(0), sr = buf.sampleRate;
      const umbral = Math.pow(10, -50 / 20);
      // primer y ultimo sample sobre -50 dBFS (lo que hizo s176)
      let ini = -1, fin = -1;
      for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > umbral) { if (ini < 0) ini = i; fin = i; }
      // fin "de la palabra": ultimo sample sobre umbral antes de un silencio de >= 300 ms
      let finPal = -1, silencio = 0;
      for (let i = ini; i < d.length; i++) {
        if (Math.abs(d[i]) > umbral) { if (silencio >= sr * 0.3 && finPal >= 0) break; finPal = i; silencio = 0; }
        else silencio++;
      }
      // la cola: ventanas de 5 ms en los ultimos 150 ms
      const w = Math.round(sr * 0.005), tail = [];
      for (let i = d.length - Math.round(sr * 0.15); i < d.length; i += w) {
        let pk = 0; for (let j = i; j < Math.min(d.length, i + w); j++) pk = Math.max(pk, Math.abs(d[j]));
        tail.push(Math.round(20 * Math.log10(pk + 1e-9)));
      }
      res[f] = { dur: +buf.duration.toFixed(3), ini: +(ini / sr).toFixed(3), finUmbral: +(fin / sr).toFixed(3), finPalabra: +(finPal / sr).toFixed(3), palabra: +((finPal - ini) / sr).toFixed(3), cola150ms_pico_dB: tail.join(' ') };
    }
    return res;
  });
  for (const [k, v] of Object.entries(out)) console.log(k.padEnd(16), JSON.stringify(v));
  await b.close();
})();
