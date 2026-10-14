/* PACE · tests/respira-fases.js
   La fase más corta de cada rutina de Respira, en total y por señal, leída de las fuentes.
   La usan respira-voz.spec.js (castellano) y respira-voz-ingles.spec.js. */
'use strict';

const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const sandbox = require(path.join(ROOT, 'scripts', 'verify.sandbox.js'));

/* El catálogo y su motor de fases, leídos de las FUENTES: `BREATHE_ROUTINES` es
   `const` y no cruza la IIFE del artefacto (trampa de s148), y además cruzar la
   pantalla contra un dato de esa misma pantalla no probaría nada. */
let _seq = null;
function fasesPorRutina() {
  if (_seq) return _seq;
  const ctx = { ROOT, babel: require(path.join(ROOT, 'node_modules', '@babel', 'core')) };
  const sb = sandbox.nuevoSandbox();
  const errs = [
    sandbox.cargar(ctx, sb, 'app/breathe/BreatheLibrary.jsx', { __B: 'BREATHE_ROUTINES' }),
    sandbox.cargar(ctx, sb, 'app/breathe/BreatheVisual.jsx', { __G: 'getSequence' }),
  ].filter(Boolean);
  if (errs.length) throw new Error('no se pudo leer Respira: ' + errs.join(' · '));
  /* LA ETIQUETA DICE LA SENAL: `getSequence` devuelve `{label, duration}` con
     el rotulo en espanol («Inhala», «Exhala oceanica», «Sosten»...), asi que la
     senal se deduce del PREFIJO. Es el mismo mapeo que usa
     `scripts/audit/censo-respira-fases.js`. */
  const senalDe = (label) => {
    const l = String(label || '');
    if (/^Inhala/.test(l)) return 'breathe.inhale';
    if (/^Exhala/.test(l)) return 'breathe.exhale';
    if (/^(Sost|Rete|Vac)/.test(l)) return 'breathe.hold';
    return null;
  };
  const out = [];
  Object.keys(sb.__B || {}).forEach(k => (sb.__B[k].items || []).forEach(r => {
    const seq = sb.__G(r) || [];
    if (!seq.length) return;
    /* DOS MEDIDAS, Y LA DIFERENCIA IMPORTA -- lo destapo bradford al entrar:
         `min`      = la fase mas corta de TODA la rutina
         `porSenal` = la fase mas corta DE CADA SENAL
       El producto decide senal por senal (`paceVozCabe(nombre, faseSeg)` recibe
       la duracion de ESA fase), asi que `porSenal` es el modelo fiel y `min` es
       una cota mas estricta. Para sulafat dan lo mismo (17 y 17) porque sus
       tres palabras miden casi igual; para bradford dan 14 y 12, y difieren en
       `breathe.yin` y `breathe.nadi.shodhana`. Medir con la cota habria dicho
       que la voz cabe en menos sitios de los que de verdad canta. */
    const porSenal = {};
    seq.forEach(p => {
      const s = senalDe(p.label);
      if (!s || !(p.duration > 0)) return;
      if (porSenal[s] == null || p.duration < porSenal[s]) porSenal[s] = p.duration;
    });
    out.push({ id: r.id, min: Math.min.apply(null, seq.map(p => p.duration)), porSenal });
  }));
  if (out.length < 20) throw new Error('catálogo de Respira incompleto: ' + out.length);
  _seq = out;
  return out;
}

module.exports = { fasesPorRutina };
