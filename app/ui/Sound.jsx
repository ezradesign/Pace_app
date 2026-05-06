/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Sonidos sutiles vía Web Audio API — refactor 432 Hz (sesión 38a · v0.20.0).

   Cambios respecto a v0.13.0 (sesión 28):
     - Afinación A=432 Hz (constante BASE_A) + helper note() para nota→Hz.
     - Primitivas componibles: tone, glide, chord, bell, breathNoise.
     - breathNoise: ruido blanco filtrado lowpass (200↔800 Hz) para
       respiración realista — no tonos puros. Parámetro dur sincroniza
       el sonido con la duración real de la fase visual.
     - Catálogo ampliado: pomodoro.start/end, breathe.inhale/exhale,
       breathe.session.start/end.
     - Hold de respiración = silencio intencional (decisión meditativa).
     - Alias legacy (tick, complete, sip, breath) conservados para
       compatibilidad con módulos no migrados.

   API pública (sin cambios):
     playSound(name, ...args) — función plana
     useSound()               → { play(name, ...args) }
*/

const { useCallback: useCallbackSound } = React;

/* === AFINACIÓN 432 Hz === */
const BASE_A = 432;

/* Convierte nombre de nota a Hz con A4=432. Temperamento igual 2^(1/12).
   Ejemplos: note('A4')===432, note('C5')≈513.7, note('G5')≈769.3. */
function note(name) {
  const MAP = {
    C:0, 'C#':1, Db:1, D:2, 'D#':3, Eb:3,
    E:4, F:5, 'F#':6, Gb:6, G:7, 'G#':8, Ab:8,
    A:9, 'A#':10, Bb:10, B:11,
  };
  const m = name.match(/^([A-G][#b]?)(\d)$/);
  if (!m) return BASE_A;
  const semi = MAP[m[1]] !== undefined ? MAP[m[1]] : 9;
  const oct  = parseInt(m[2]);
  return BASE_A * Math.pow(2, ((oct - 4) * 12 + (semi - 9)) / 12);
}

/* === SINGLETON AudioContext === */
let _audioCtx = null;
function getCtx() {
  if (_audioCtx) return _audioCtx;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    _audioCtx = new Ctx();
    return _audioCtx;
  } catch (e) { return null; }
}

function ensureRunning(ctx) {
  if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
}

/* === ENVOLVENTE ADSR mínima === */
function envelope(ctx, dest, t0, peak, attack, release) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + release);
  g.connect(dest);
  return g;
}

/* === PRIMITIVA 1: tone — oscilador puro === */
function tone(ctx, dest, freq, t0, dur, peak, type) {
  if (peak === undefined) peak = 0.06;
  if (type === undefined) type = 'sine';
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  const g = envelope(ctx, dest, t0, peak, 0.012, dur);
  o.connect(g);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

/* === PRIMITIVA 2: glide — barrido exponencial de frecuencia === */
function glide(ctx, dest, freqStart, freqEnd, t0, dur, peak, type) {
  if (peak === undefined) peak = 0.06;
  if (type === undefined) type = 'sine';
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freqStart, t0);
  o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
  const g = envelope(ctx, dest, t0, peak, 0.012, dur);
  o.connect(g);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

/* === PRIMITIVA 3: chord — varios osciladores simultáneos === */
function chord(ctx, dest, freqs, t0, dur, peak, type) {
  if (peak === undefined) peak = 0.08;
  if (type === undefined) type = 'sine';
  const perVoice = (peak / freqs.length) * 1.4;
  freqs.forEach(function(freq) { tone(ctx, dest, freq, t0, dur, perVoice, type); });
}

/* === PRIMITIVA 4: bell — campana con overtones (timbre metálico suave) === */
function bell(ctx, dest, freq, t0, dur, peak) {
  if (peak === undefined) peak = 0.10;
  tone(ctx, dest, freq,       t0,        dur,        peak * 0.70, 'sine');
  tone(ctx, dest, freq * 2.8, t0 + 0.01, dur * 0.60, peak * 0.20, 'sine');
  tone(ctx, dest, freq * 5.4, t0 + 0.02, dur * 0.35, peak * 0.10, 'sine');
}

/* === PRIMITIVA 5: breathNoise — ruido blanco filtrado para respiracion ===
   direction 'in':  filtro 200Hz→800Hz  (inhalar: tono sube)
   direction 'out': filtro 800Hz→200Hz  (exhalar: tono baja)
   ADSR: attack 15% + plateau hasta 65% + release 35% de dur.
   Resultado: shhhhh que sube (inhala) o haaaaa que baja (exhala). */
function breathNoise(ctx, dest, direction, t0, dur, peak) {
  if (!dur || dur <= 0) return; /* guard: createBuffer(1,0,sr) lanzaría NotSupportedError */
  if (peak === undefined) peak = 0.06;
  var sr     = ctx.sampleRate;
  var frames = Math.ceil(dur * sr);
  var buf    = ctx.createBuffer(1, frames, sr);
  var data   = buf.getChannelData(0);
  for (var i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

  var src = ctx.createBufferSource();
  src.buffer = buf;

  var filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.Q.value = 1.5;

  var fLow = 200, fHigh = 800;
  if (direction === 'in') {
    filt.frequency.setValueAtTime(fLow,  t0);
    filt.frequency.linearRampToValueAtTime(fHigh, t0 + dur);
  } else {
    filt.frequency.setValueAtTime(fHigh, t0);
    filt.frequency.linearRampToValueAtTime(fLow,  t0 + dur);
  }

  var g = ctx.createGain();
  g.gain.setValueAtTime(0,         t0);
  g.gain.linearRampToValueAtTime(peak, t0 + dur * 0.15);
  g.gain.setValueAtTime(peak,           t0 + dur * 0.65);
  g.gain.linearRampToValueAtTime(0.0001, t0 + dur);

  src.connect(filt);
  filt.connect(g);
  g.connect(dest);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

/* === CATÁLOGO DE SONIDOS === */
var SOUND_RECIPES = {

  /* --- LEGACY ALIASES (compat con módulos no migrados) --- */
  tick: function(ctx, t0) {
    tone(ctx, ctx.destination, 800, t0, 0.03, 0.05, 'sine');
  },
  complete: function(ctx, t0) {
    tone(ctx, ctx.destination, note('C5'), t0,        0.55, 0.10, 'sine');
    tone(ctx, ctx.destination, note('G5'), t0 + 0.04, 0.50, 0.07, 'sine');
    tone(ctx, ctx.destination, note('C6'), t0 + 0.10, 0.35, 0.03, 'sine');
  },
  sip: function(ctx, t0) {
    glide(ctx, ctx.destination, note('G5'), note('F#4'), t0, 0.22, 0.09, 'sine');
  },
  breath: function(ctx, t0) {
    breathNoise(ctx, ctx.destination, 'in', t0, 1.5, 0.05);
  },

  /* --- POMODORO --- */
  'pomodoro.start': function(ctx, t0) {
    glide(ctx, ctx.destination, note('C5'), note('G5'), t0, 0.20, 0.06, 'sine');
  },
  'pomodoro.end': function(ctx, t0) {
    SOUND_RECIPES.complete(ctx, t0);
  },

  /* --- RESPIRA (ruido filtrado real) ---
     dur se pasa desde BreatheSession para sincronizar con la fase visual.
     breathe.hold no se define: silencio intencional durante el sostén. */
  'breathe.inhale': function(ctx, t0, dur) {
    if (dur === undefined) dur = 4.0;
    breathNoise(ctx, ctx.destination, 'in', t0, dur, 0.06);
  },
  'breathe.exhale': function(ctx, t0, dur) {
    if (dur === undefined) dur = 6.0;
    breathNoise(ctx, ctx.destination, 'out', t0, dur, 0.07);
  },
  'breathe.session.start': function(ctx, t0) {
    glide(ctx, ctx.destination, note('G4'), note('C4'), t0, 0.28, 0.06, 'sine');
  },
  'breathe.session.end': function(ctx, t0) {
    chord(ctx, ctx.destination, [note('C5'), note('E5'), note('G5')], t0, 0.70, 0.10, 'sine');
  },
};

/* === API PÚBLICA ===
   playSound(name, ...args): args extra se pasan a la receta
   (ej. dur en breathe.inhale/exhale). */
function playSound(name) {
  var args = Array.prototype.slice.call(arguments, 1);
  try {
    var s = (typeof getState === 'function') ? getState() : null;
    if (!s || !s.soundOn) return;
    var ctx = getCtx();
    if (!ctx) return;
    ensureRunning(ctx);
    var recipe = SOUND_RECIPES[name];
    if (!recipe) return;
    recipe.apply(null, [ctx, ctx.currentTime].concat(args));
  } catch (e) {
    /* Silencio total: el sonido nunca debe romper la app. */
  }
}

function useSound() {
  var play = useCallbackSound(function(name) {
    var args = Array.prototype.slice.call(arguments);
    playSound.apply(null, args);
  }, []);
  return { play: play };
}

Object.assign(window, { playSound, useSound });
