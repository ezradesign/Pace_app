/* PACE · scripts/audit/censo-respira-fases.js (sesión 175)
   =========================================================
   ¿CABE UNA VOZ GRABADA EN LAS FASES DE RESPIRA? Es la pregunta que decide si
   los audios del usuario se pueden usar tal cual, y no se puede contestar
   leyendo: hay que preguntarle a `getSequence()` cuánto dura cada fase de cada
   una de las 20 rutinas.

   POR QUÉ IMPORTA: el sonido de hoy es SINTETIZADO y recibe la duración de la
   fase (`playSound('breathe.inhale', phaseDur)`), así que se estira o se
   encoge con ella. Un archivo de voz NO puede: dura lo que dura. Si la fase es
   más corta que la locución, la señal siguiente le pisa encima.

   s165 ya midió que hay TRES familias de ritmo y que las de BOMBEO (Bhastrika,
   Kapalabhati) tienen fases de 1 s. Esto lo cruza con las duraciones reales de
   los seis MP3 y dice, rutina a rutina, cuáles admiten voz.

   Sólo lee. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const sandbox = require(path.join(ROOT, 'scripts', 'verify.sandbox.js'));

/* LO QUE MIDE ESTO ES LA PALABRA, NO EL ARCHIVO. Los MP3 llevan silencio a los
   dos lados y eso me hizo publicar DOS cifras falsas seguidas:

     1a) duracion calculada desde la cabecera MPEG  -> «cabe en 14 de 20». Falsa:
         la cabecera daba casi la mitad de la duracion real.
     2a) duracion real del archivo (`audio.duration`) -> «8 de 20». Tambien
         enganosa: el «exhala» ocupa 4,96 s de archivo pero la palabra acaba a
         los 2,12 — hay 2,84 s de COLA MUDA, que no puede pisar nada.

   Lo que colisiona con la senal siguiente es el tramo que SUENA. Estos extremos
   salen de decodificar la onda en el navegador y buscar la primera y la ultima
   muestra sobre el umbral (1 % del pico y -50 dBFS coinciden dentro de 12
   centesimas). El producto usa exactamente estos numeros:
   `PACE_VOZ_CLIPS` en `app/ui/Sound.voz.jsx`. */
var VOCES = {
  sulafat: { inhala: 1.404, manten: 1.320, exhala: 1.478, medido: true },
  /* `bradford` no esta medido: sus cifras serian de cabecera, que ya ha
     demostrado dos veces que no sirve. Se mide el dia que entre. */
};

/* El mismo margen que aplica el producto (`PACE_VOZ_MARGEN`). */
var MARGEN = 0.15;

function catalogo() {
  const ctx = { ROOT, babel: require(path.join(ROOT, 'node_modules', '@babel', 'core')) };
  const sb = sandbox.nuevoSandbox();
  const errs = [
    sandbox.cargar(ctx, sb, 'app/breathe/BreatheLibrary.jsx', { __B: 'BREATHE_ROUTINES' }),
    sandbox.cargar(ctx, sb, 'app/breathe/BreatheVisual.jsx', { __G: 'getSequence' }),
  ].filter(Boolean);
  if (errs.length) { console.error('GUARD: no se pudo leer Respira -> ' + errs.join(' · ')); process.exit(2); }
  const rutinas = [];
  Object.keys(sb.__B || {}).forEach(k => (sb.__B[k].items || []).forEach(r => rutinas.push(r)));
  if (!rutinas.length) { console.error('GUARD: catalogo de Respira vacio'); process.exit(2); }
  if (typeof sb.__G !== 'function') { console.error('GUARD: getSequence no cargo'); process.exit(2); }
  return { rutinas, getSequence: sb.__G };
}

const { rutinas, getSequence } = catalogo();

/* LA SECUENCIA DEVUELVE `{ label, duration, scale }` CON LA ETIQUETA EN
   ESPANOL -- no `phase`/`dur`, que es lo que supuse y por lo que el guard
   salto en la primera pasada. Las etiquetas reales del catalogo son «Inhala»,
   «Inhala mas», «Inhala oceanica», «Exhala», «Exhala oceanica» y «Sosten», asi
   que la senal se deduce del PREFIJO. */
function senalDe(label) {
  const l = String(label || '');
  if (/^Inhala/.test(l)) return 'inhala';
  if (/^Exhala/.test(l)) return 'exhala';
  if (/^(Sost|Rete|Vac)/.test(l)) return 'manten';
  return null;
}

const filas = rutinas.map(r => {
  let seq = null;
  try { seq = getSequence(r); } catch (e) { seq = null; }
  if (!seq || !seq.length) return { id: r.id, nombre: r.name, error: 'sin secuencia' };
  const fases = seq
    .map(p => ({ senal: senalDe(p.label), seg: p.duration }))
    .filter(p => p.senal && typeof p.seg === 'number' && p.seg > 0);
  if (!fases.length) return { id: r.id, nombre: r.name, error: 'fases sin duracion' };
  const minPorSenal = {};
  fases.forEach(f => {
    if (minPorSenal[f.senal] == null || f.seg < minPorSenal[f.senal]) minPorSenal[f.senal] = f.seg;
  });
  const cabe = voz => Object.keys(minPorSenal).every(s => (VOCES[voz][s] + MARGEN) <= minPorSenal[s]);
  return {
    id: r.id, nombre: r.name,
    faseMin: Math.min.apply(null, fases.map(f => f.seg)),
    minPorSenal,
    sulafat: cabe('sulafat'),
  };
});

const conError = filas.filter(f => f.error);
const ok = filas.filter(f => !f.error);
if (!ok.length) { console.error('GUARD: ninguna rutina dio fases medibles'); process.exit(2); }

console.log('RUTINAS DE RESPIRA: ' + filas.length + ' · con fases medibles: ' + ok.length +
            (conError.length ? ' · sin medir: ' + conError.length : ''));
console.log('');
console.log('DURACION DE LA PALABRA (s), sin los silencios del archivo:');
Object.keys(VOCES).forEach(v => console.log('  ' + v.padEnd(10) +
  'palabra: inhala ' + VOCES[v].inhala + ' · manten ' + VOCES[v].manten + ' · exhala ' + VOCES[v].exhala +
  (VOCES[v].medido ? '   [medido en navegador]' : '   [ESTIMADO de cabecera - NO fiable]')));
console.log('');
console.log('FASE MAS CORTA POR RUTINA, y si la voz cabe:');
ok.slice().sort((a, b) => a.faseMin - b.faseMin).forEach(f => {
  console.log('  ' + String(f.faseMin).padStart(5) + ' s  ' +
    (f.sulafat ? 'VOZ' : ' · ') + '  ' +
    (f.id || '').padEnd(26) + (f.nombre || ''));
});
conError.forEach(f => console.log('  ????? s  ··  ' + (f.id || '').padEnd(26) + f.error));
console.log('');
const ns = ok.filter(f => f.sulafat).length;
console.log('LA VOZ CABE ENTERA en ' + ns + ' de ' + ok.length + ' rutinas');
console.log('(VOZ = las tres senales caben · · = alguna palabra es MAS LARGA que su fase)');
