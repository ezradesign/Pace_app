/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Sonidos sutiles vía Web Audio API.

   Decisión sesión 28 (v0.13.0): sintetizar en lugar de descargar WAVs
   CC0 evita 4 binarios extra (~50-100 KB) que habría que inlinearse en
   el standalone vía base64. Cuatro tonos cortos en envolventes suaves
   (attack 5-15 ms, decay 80-300 ms) coherentes con la filosofía
   artesanal: notas de campana de campo, no clicks digitales.

   Toggle: `state.soundOn` (boolean, ya existe en defaultState v0.10.x).
   Si false, `play()` es noop. Si el usuario tiene
   `prefers-reduced-motion` o el navegador no soporta Web Audio,
   también es noop silencioso (degradación elegante por la regla de
   CLAUDE.md).

   Catálogo:
   - `tick`        → click muy corto, 800 Hz, 30 ms. Cada minuto del timer
                     o segundos finales (uso futuro, no cableado por
                     defecto para no agobiar).
   - `complete`    → fin de Pomodoro: do (523) + sol (784) en ~600 ms,
                     campana de transición.
   - `sip`         → +1 vaso de agua: gota corta, 600→400 Hz, 220 ms.
   - `breath`      → cambio de fase de respiración: senoidal muy suave,
                     440 Hz, 250 ms. Pensado para no interferir con el
                     ritmo de la sesión.

   API:
     useSound() → { play(name) }
     o función plana: playSound(name) — ambas respetan state.soundOn.
*/

const { useCallback: useCallbackSound } = React;

let _audioCtx = null;
function getCtx() {
  if (_audioCtx) return _audioCtx;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    _audioCtx = new Ctx();
    return _audioCtx;
  } catch (e) {
    return null;
  }
}

/* Resume del contexto: los navegadores modernos suspenden AudioContext
   hasta la primera interacción del usuario. Si está suspendido, intentamos
   reanudar — si falla (caso raro) caemos en silencio en lugar de tirar
   warnings. */
function ensureRunning(ctx) {
  if (ctx.state === 'suspended') {
    try { ctx.resume(); } catch (e) {}
  }
}

/* Envolvente ADSR mínima (attack + release exponencial).
   `gain` peak suave (0.06-0.15) — la app no debe asustar al usuario. */
function envelope(ctx, dest, t0, peak, attack, release) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + release);
  g.connect(dest);
  return g;
}

function tone(ctx, dest, freq, t0, dur, peak = 0.08, type = 'sine') {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  const g = envelope(ctx, dest, t0, peak, 0.012, dur);
  o.connect(g);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

const SOUND_RECIPES = {
  tick(ctx, t0) {
    tone(ctx, ctx.destination, 800, t0, 0.03, 0.05, 'sine');
  },
  complete(ctx, t0) {
    /* Campana de cierre: dos notas armónicas (do + sol) decayendo
       juntas, con un tercer overtone muy bajo (do octava arriba) para
       darle cuerpo sin ser estridente. */
    tone(ctx, ctx.destination, 523.25, t0,        0.55, 0.10, 'sine'); // do5
    tone(ctx, ctx.destination, 783.99, t0 + 0.04, 0.50, 0.07, 'sine'); // sol5
    tone(ctx, ctx.destination, 1046.5, t0 + 0.10, 0.35, 0.03, 'sine'); // do6
  },
  sip(ctx, t0) {
    /* Gota: senoidal con glide de 600 → 380 Hz en 200 ms. */
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(600, t0);
    o.frequency.exponentialRampToValueAtTime(380, t0 + 0.20);
    const g = envelope(ctx, ctx.destination, t0, 0.09, 0.008, 0.22);
    o.connect(g);
    o.start(t0);
    o.stop(t0 + 0.28);
  },
  breath(ctx, t0) {
    /* Marca de fase muy discreta: la (440 Hz) suave, 250 ms.
       Pensado para sonar al cambio inhala/sostén/exhala sin romper
       el ritmo. */
    tone(ctx, ctx.destination, 440, t0, 0.25, 0.045, 'sine');
  },
};

function playSound(name) {
  try {
    const s = (typeof getState === 'function') ? getState() : null;
    if (!s || !s.soundOn) return;
    const ctx = getCtx();
    if (!ctx) return;
    ensureRunning(ctx);
    const recipe = SOUND_RECIPES[name];
    if (!recipe) return;
    recipe(ctx, ctx.currentTime);
  } catch (e) {
    /* Silencio total: el sonido nunca debe romper la app. */
  }
}

/* Hook idéntico en API a `playSound` plano, pero memoizado por
   conveniencia React. Útil dentro de useEffect para listas de deps
   estables. */
function useSound() {
  const play = useCallbackSound((name) => playSound(name), []);
  return { play };
}

Object.assign(window, { playSound, useSound });
