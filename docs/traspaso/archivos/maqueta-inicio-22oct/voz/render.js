// Renderiza trozos de Respira con el motor de sonido REAL de la app (index.html), en un
// OfflineAudioContext: la app decide voz o tono como en el móvil. Escribe WAV en voz/out.
const path = require('path');
const fs = require('fs');
const WT = process.argv[2];
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const { chromium } = require(path.join(WT, 'node_modules', 'playwright'));
const SR = 22050;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript(() => {
    localStorage.setItem('pace.state.v2', JSON.stringify({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
      soundOn: true, voice: 'bradford', voiceOn: true, ambientOn: false, ritmo: { libre: true } }));
    window.__T = 0;
    window.__off = new OfflineAudioContext(1, 22050, 22050);
    const handler = {
      get(_, k) {
        if (k === 'currentTime') return window.__T;
        if (k === 'state') return 'running';
        if (k === 'resume') return () => Promise.resolve();
        const v = window.__off[k];
        return typeof v === 'function' ? v.bind(window.__off) : v;
      },
    };
    const Falso = function () { return new Proxy({}, handler); };
    window.AudioContext = Falso; window.webkitAudioContext = Falso;
  });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8803/index.html');
  await p.waitForFunction(() => typeof window.paceVozInit === 'function' && typeof window.playSound === 'function');
  await p.waitForFunction(() => {
    const j = window.paceVozInit('bradford');
    return ['breathe.inhale', 'breathe.exhale', 'breathe.hold'].every(n => j[n] && j[n].listo && j[n].buffer);
  }, null, { timeout: 20000 });

  const trozos = {
    'rondas-hoy': { fases: Array(4).fill([['breathe.inhale', 2], ['breathe.exhale', 2]]).flat(), recorte: false },
    'rondas-recortado': { fases: Array(4).fill([['breathe.inhale', 2], ['breathe.exhale', 2]]).flat(), recorte: true },
    'exh46-hoy': { fases: [['breathe.inhale', 4], ['breathe.exhale', 6], ['breathe.inhale', 4]], recorte: false },
    'exh46-recortado': { fases: [['breathe.inhale', 4], ['breathe.exhale', 6], ['breathe.inhale', 4]], recorte: true },
  };
  for (const [nombre, tr] of Object.entries(trozos)) {
    const res = await p.evaluate(async ({ tr, SR }) => {
      const slot = window.paceVozInit('bradford')['breathe.exhale'];
      const orig = { buffer: slot.buffer, palabra: slot.palabra };
      if (tr.recorte) {
        // la misma palabra, cortada 60 ms después de su último sonido (1,309 s) con 40 ms de fundido
        const src = orig.buffer, corte = Math.round(1.369 * src.sampleRate), fade = Math.round(0.04 * src.sampleRate);
        const nb = new AudioBuffer({ length: corte, numberOfChannels: 1, sampleRate: src.sampleRate });
        const d = nb.getChannelData(0), s = src.getChannelData(0);
        for (let i = 0; i < corte; i++) d[i] = s[i] * (i > corte - fade ? (corte - i) / fade : 1);
        slot.buffer = nb; slot.palabra = 1.309 - 0.108;
      }
      const total = tr.fases.reduce((a, f) => a + f[1], 0) + 0.6;
      window.__off = new OfflineAudioContext(1, Math.ceil(total * SR), SR);
      let t = 0.3; const marcas = [];
      for (const [n, dur] of tr.fases) {
        window.__T = t;
        const voz = window.paceVozCabe(n, dur);
        window.playSound(n, dur);
        marcas.push({ n, t, voz });
        t += dur;
      }
      const buf = await window.__off.startRendering();
      slot.buffer = orig.buffer; slot.palabra = orig.palabra;
      const x = buf.getChannelData(0);
      // normalizar al pico -1 dBFS para que se oiga en el móvil, igual en todos los trozos
      let pk = 0; for (const v of x) pk = Math.max(pk, Math.abs(v));
      return { marcas, pk, data: Array.from(x, v => Math.round(Math.max(-1, Math.min(1, v)) * 32767)) };
    }, { tr, SR });
    fs.writeFileSync(path.join(OUT, nombre + '.json'), JSON.stringify({ marcas: res.marcas, pk: res.pk }));
    fs.writeFileSync(path.join(OUT, nombre + '.pcm'), Buffer.from(Int16Array.from(res.data).buffer));
    console.log(nombre, 'pico', res.pk.toFixed(3), res.marcas.map(m => m.n.split('.')[1] + '@' + m.t.toFixed(1) + (m.voz ? ':VOZ' : ':tono')).join(' '));
  }
  await b.close();
})();
