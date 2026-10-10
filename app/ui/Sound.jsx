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

/* === PRIMITIVA 6: cuenco — cuenco tibetano, el aviso del runner de Mueve y Estira ===
   Cuatro parciales inarmónicos (1 · 2,71 · 5,15 · 8,4 veces la fundamental), cada uno con dos
   osciladores separados ±0,45 Hz para que el sonido bata como un cuenco de verdad, una caída larga
   y un golpe de maza corto. Se oye desde la esterilla sin mirar la pantalla, que era el encargo
   (opción A del runner guiado, elegida por Ez). `largo` estira o acorta la caída.
   El pico por defecto es 0,065 porque los parciales SUMAN: 0,065 x 1,67 deja el cuenco en el
   0,06-0,10 del resto de sonidos de la app (con 0,11 sonaba unos 5 dB por encima). */
function cuenco(ctx, dest, freq, t0, peak, largo) {
  if (peak === undefined) peak = 0.065;
  if (largo === undefined) largo = 1;
  var lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3200;
  lp.connect(dest);
  [[1, 1, 4.2], [2.71, 0.42, 2.6], [5.15, 0.18, 1.5], [8.4, 0.07, 0.8]].forEach(function (p) {
    [-0.45, 0.45].forEach(function (det) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.frequency.value = freq * p[0] + det;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(peak * p[1] / 2, t0 + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + p[2] * largo);
      o.connect(g); g.connect(lp);
      o.start(t0); o.stop(t0 + p[2] * largo + 0.1);
    });
  });
  var n = Math.ceil(ctx.sampleRate * 0.03);
  var buf = ctx.createBuffer(1, n, ctx.sampleRate);
  var d = buf.getChannelData(0);
  for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  var src = ctx.createBufferSource();
  var bp = ctx.createBiquadFilter();
  var gn = ctx.createGain();
  src.buffer = buf;
  bp.type = 'bandpass'; bp.frequency.value = freq * 2; bp.Q.value = 3;
  gn.gain.value = peak * 0.25;
  src.connect(bp); bp.connect(gn); gn.connect(dest);
  src.start(t0);
}

/* === PRIMITIVA 7: madera — toque seco de madera, para «quedan 3, 2, 1» y el pulso de las reps === */
function madera(ctx, dest, t0, peak) {
  if (peak === undefined) peak = 0.09;
  var o = ctx.createOscillator();
  var bp = ctx.createBiquadFilter();
  var g = ctx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(note('G5') * 1.5, t0);
  o.frequency.exponentialRampToValueAtTime(note('G5'), t0 + 0.05);
  bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 2;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
  o.connect(bp); bp.connect(g); g.connect(dest);
  o.start(t0); o.stop(t0 + 0.12);
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

  /* --- MUEVE ---
     El runner guiado se sigue por el oído: cada cambio de ejercicio suena a cuenco, y la cuenta
     de los últimos segundos a madera. Afinación 432, en Sol, como la música de Respira.
       move.start  un cuenco          → ejercicio nuevo (al entrar en el paso, se coloque o no)
       move.go     cuenco agudo corto → ¡ya! (acaba la cuenta de colocarse o de cambiar de lado)
       move.side   dos cuencos        → cambia de lado (agudo y grave, el gesto de «giro»)
       move.rest   cuenco grave largo → descanso
       move.warn   un toque de madera → suena en cada uno de los últimos 3 segundos de una cuenta
       move.rep    madera suave       → el pulso de cada repetición guiada
       move.end    tres cuencos       → rutina terminada
     Ningún cuenco baja de 200 Hz: por debajo, el altavoz de un portátil no lo reproduce (la
     regla de banda audible de la música de Respira). move.step es del runner antiguo. */
  'move.start': function(ctx, t0) {
    cuenco(ctx, ctx.destination, note('G4'), t0);
  },
  'move.go': function(ctx, t0) {
    cuenco(ctx, ctx.destination, note('D5'), t0, 0.05, 0.35);
  },
  'move.step': function(ctx, t0) {
    tone(ctx, ctx.destination, note('A4'), t0, 0.06, 0.04, 'triangle');
  },
  'move.warn': function(ctx, t0) {
    madera(ctx, ctx.destination, t0);
  },
  'move.rep': function(ctx, t0) {
    madera(ctx, ctx.destination, t0, 0.05);
  },
  'move.side': function(ctx, t0) {
    cuenco(ctx, ctx.destination, note('D5'), t0, 0.055, 0.7);
    cuenco(ctx, ctx.destination, note('G4'), t0 + 0.45, 0.05, 0.8);
  },
  'move.rest': function(ctx, t0) {
    cuenco(ctx, ctx.destination, note('D4'), t0, 0.075, 1.3);
  },
  'move.end': function(ctx, t0) {
    cuenco(ctx, ctx.destination, note('G4'), t0, 0.055, 1.1);
    cuenco(ctx, ctx.destination, note('B4'), t0 + 0.32, 0.055, 1.1);
    cuenco(ctx, ctx.destination, note('D5'), t0 + 0.64, 0.055, 1.1);
  },

  /* --- HIDRÁTATE --- */
  'hydrate.sip': function(ctx, t0) {
    glide(ctx, ctx.destination, note('G5'), note('D5'), t0, 0.18, 0.07, 'sine');
  },
  'hydrate.goal': function(ctx, t0) {
    tone(ctx, ctx.destination, note('C5'), t0,        0.65, 0.06, 'sine');
    tone(ctx, ctx.destination, note('E5'), t0 + 0.05, 0.55, 0.05, 'sine');
    tone(ctx, ctx.destination, note('G5'), t0 + 0.10, 0.45, 0.04, 'sine');
    tone(ctx, ctx.destination, note('C6'), t0 + 0.15, 0.35, 0.03, 'sine');
  },

  /* --- LOGROS --- */
  'achievement.unlock': function(ctx, t0) {
    bell(ctx, ctx.destination, note('A5'), t0, 0.90, 0.08);
  },
  'achievement.secret': function(ctx, t0) {
    glide(ctx, ctx.destination, note('C5'), note('F#3'), t0, 0.55, 0.05, 'sine');
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
    /* s175 · LA VOZ VA PRIMERO, y sólo si CABE en la fase. `paceVozIntenta`
       recibe los segundos de esta fase y contesta de forma SÍNCRONA: devuelve
       `true` únicamente cuando el clip está precargado y entra entero con su
       margen. Si dice que no —fase demasiado corta, archivo ausente (el
       standalone), navegador sin `Audio`— se sigue al sintetizador de siempre,
       que es lo que sonaba antes de esta sesión.
       Se lee de `window` en la llamada, no al definir, para no atarse al orden
       de carga: el artefacto son 109 scripts en tareas separadas (s162). */
    if (typeof window.paceVozIntenta === 'function' &&
        window.paceVozIntenta(name, args[0])) return;
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

/* === DRONE AMBIENTE (capa 2 opt-in) ===
   Singleton. G2 = 96.22 Hz · sine · peak 0.02.
   (s177: decía 96.7 y era falso. note('G2') con BASE_A=432 da 96.22; el LFO
   modula GANANCIA, no frecuencia, así que nada lo desafina. El 96.7 ya se
   había copiado a MUSICA_RESPIRA_BRIEFS.md, donde importa: la música de fondo
   se afina contra este drone en Coherente 432.)
   LFO senoidal 0.1 Hz · ±0.002 para movimiento orgánico.
   Arranca solo si soundOn && ambientOn en el momento de llamar start().
   start(force) — F4/s90, Coherente 432: fuerza el arranque aunque
   ambientOn esté apagado; soundOn (master) manda siempre. El flag se
   recuerda para que resume() tras una pausa no mate el drone forzado.
   Activar ambientOn mid-sesión NO arranca el drone retroactivamente;
   solo arranca al inicio de una sesión nueva (decisión de producto). */
const ambientDrone = (() => {
  let osc = null, gainNode = null, lfo = null, lfoGain = null;
  let isPaused = false;
  let forced = false;

  function shouldPlay() {
    try {
      const s = typeof getState === 'function' ? getState() : null;
      return !!(s && s.soundOn && (forced || s.ambientOn));
    } catch(e) { return false; }
  }

  function start(force) {
    if (osc) return;
    forced = !!force;
    if (!shouldPlay()) { forced = false; return; }
    const ctx = getCtx(); if (!ctx) return;
    ensureRunning(ctx);
    const t0 = ctx.currentTime;
    osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note('G2'), t0);
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, t0);
    gainNode.gain.linearRampToValueAtTime(0.02, t0 + 1.2);
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, t0);
    lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.002, t0);
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(t0); lfo.start(t0);
    isPaused = false;
  }

  function stop(fadeMs) {
    if (fadeMs === undefined) fadeMs = 800;
    if (!osc || !gainNode) return;
    const ctx = getCtx(); if (!ctx) return;
    const t0 = ctx.currentTime;
    const fade = Math.max(0.1, fadeMs / 1000);
    try {
      gainNode.gain.cancelScheduledValues(t0);
      gainNode.gain.setValueAtTime(gainNode.gain.value, t0);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + fade);
    } catch(e) {}
    const oscRef = osc, lfoRef = lfo;
    setTimeout(function() {
      try { oscRef && oscRef.stop(); } catch(e) {}
      try { lfoRef && lfoRef.stop(); } catch(e) {}
    }, (fade + 0.1) * 1000);
    osc = null; lfo = null; gainNode = null; lfoGain = null;
    isPaused = false;
    forced = false;
  }

  function pause() {
    if (!gainNode || isPaused) return;
    const ctx = getCtx(); if (!ctx) return;
    const t0 = ctx.currentTime;
    try {
      gainNode.gain.cancelScheduledValues(t0);
      gainNode.gain.setValueAtTime(gainNode.gain.value, t0);
      gainNode.gain.linearRampToValueAtTime(0, t0 + 0.4);
    } catch(e) {}
    isPaused = true;
  }

  function resume() {
    if (!gainNode || !isPaused) return;
    if (!shouldPlay()) { stop(400); return; }
    const ctx = getCtx(); if (!ctx) return;
    const t0 = ctx.currentTime;
    try {
      gainNode.gain.cancelScheduledValues(t0);
      gainNode.gain.setValueAtTime(gainNode.gain.value, t0);
      gainNode.gain.linearRampToValueAtTime(0.02, t0 + 0.6);
    } catch(e) {}
    isPaused = false;
  }

  function isActive() { return osc !== null; }
  return { start: start, stop: stop, pause: pause, resume: resume, isActive: isActive };
})();

/* `paceAudioCtx`: la música de Respira se cuelga del MISMO contexto, que el navegador
   ya ha desbloqueado con el primer toque; un segundo contexto podría nacer suspendido. */
Object.assign(window, { playSound, useSound, ambientDrone, paceAudioCtx: getCtx });