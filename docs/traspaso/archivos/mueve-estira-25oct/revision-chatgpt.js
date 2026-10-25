// La revisión de ChatGPT de los textos nuevos de Mueve y Estira (v0.176.0): las diez pausas de «Para empezar» y
// los seis ejercicios nuevos, en español y en inglés, tal como están en el catálogo. Saca el texto para pegar y la
// página con el botón «Copiar».
// Uso: node revision-chatgpt.js <raíz del repo> <salida.md> <salida.html>
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const [, , RAIZ, MD, HTML] = process.argv;

const ctx = { console };
ctx.window = { PACE_STRINGS: { es: {}, en: {} } };
ctx.window.window = ctx.window;
vm.createContext(ctx);
for (const f of ['app/move/move.data.js', 'app/extra/extra.data.js', 'app/extra/extra.data.piernas.js',
  'app/i18n/content/move.js', 'app/i18n/content/extra.js']) {
  vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
}
const W = ctx.window;
const EN = W.PACE_STRINGS.en;
const NUEVOS = ['Remo con banda', 'Remo con tu mano', 'Bisagra de cadera', 'Desliza el talón', 'Inclinación de tronco', 'Gemelo en pared'];

function dosis(s, series) {
  const una = s.mode === 'reps' ? (typeof s.reps === 'object' ? s.reps.target : s.reps) + ' rep.'
    : s.mode === 'perSide' ? s.dur + ' s por lado' : s.dur + ' s';
  return (series > 1 ? series + ' × ' : '') + una;
}
/* Los pasos de una rutina, juntando las series del mismo ejercicio y sin los descansos. */
function pasos(r) {
  const out = [];
  r.steps.forEach((s, i) => {
    if (s.mode === 'rest' || s.name === 'Descanso') return;
    const previo = out[out.length - 1];
    if (previo && previo.nombre === s.name && previo.mode === s.mode) { previo.series += 1; return; }
    const ins = s.instruction || {};
    const en = (k) => EN[r.id + '.s' + i + '.' + k];
    out.push({ nombre: s.name, mode: s.mode, paso: s, series: 1,
      es: [ins.setup, ins.action || s.cue, ins.care],
      en: [en('instruction.setup'), en('instruction.action') || en('cue'), en('instruction.care')], nombreEn: en('name') });
  });
  return out;
}
const linea = (etq, t) => (t ? '   ' + etq + ': ' + t + '\n' : '');
function rutinaTexto(modulo, r) {
  let t = '\n### ' + modulo + ' · «' + r.name + '» (' + (EN[r.id + '.name'] || '') + ') · ' + r.min + ' min\n';
  for (const p of pasos(r)) {
    t += '- **' + p.nombre + '** (' + (p.nombreEn || '') + ') · ' + dosis(p.paso, p.series) + '\n';
    t += linea('Colócate', p.es[0]) + linea('Cómo', p.es[1]) + linea('Cuídate', p.es[2]);
    t += linea('Setup', p.en[0]) + linea('How', p.en[1]) + linea('Take care', p.en[2]);
  }
  return t;
}

const grupos = [['Mueve', W.MOVE_ROUTINES], ['Estira', W.EXTRA_ROUTINES]];
let pausas = '';
for (const [modulo, cat] of grupos) for (const r of (cat.empezar || { items: [] }).items) pausas += rutinaTexto(modulo, r);
if ((pausas.match(/^### /gm) || []).length !== 10) throw new Error('no salen las diez pausas');

let nuevos = '';
const vistos = new Set();
for (const [modulo, cat] of grupos) for (const g of Object.values(cat)) for (const r of g.items) {
  for (const p of pasos(r)) {
    if (NUEVOS.indexOf(p.nombre) === -1 || vistos.has(p.nombre)) continue;
    vistos.add(p.nombre);
    nuevos += '\n- **' + p.nombre + '** (' + (p.nombreEn || '') + ') · en ' + modulo + ' «' + r.name + '» · ' + dosis(p.paso, p.series) + '\n' +
      linea('Colócate', p.es[0]) + linea('Cómo', p.es[1]) + linea('Cuídate', p.es[2]) +
      linea('Setup', p.en[0]) + linea('How', p.en[1]) + linea('Take care', p.en[2]);
  }
}
const faltan = NUEVOS.filter((n) => !vistos.has(n));

const texto = `Hola de nuevo. Con tu revisión de las 63 fichas rehicimos Mueve y Estira en PACE, la app de pausas activas para quien teletrabaja. Ya está en la app y te pido una última revisión de lo nuevo, ahora con su texto definitivo. Recuerda: es para personas que no entrenan y hacen 2-3 minutos entre bloques de trabajo, con silla, mesa y pared; banda solo en las rutinas «con material».

Lo que te pido, de cada ejercicio de abajo:
1. Técnica y seguridad: ¿la colocación, el gesto y el cuidado son correctos y suficientes para alguien que empieza? ¿Algo que pueda hacer daño o que esté mal dicho?
2. Dosis: ¿es una entrada razonable (repeticiones, segundos, series) para una pausa de 2-3 minutos?
3. El inglés: ¿dice lo mismo que el español y suena natural?
4. Si el texto describe bien el gesto para que se entienda sin vídeo.

Contesta en una tabla por ejercicio: «Bien» si no cambiarías nada; si cambiarías algo, la frase exacta nueva en español y en inglés, en una línea, y por qué. Solo lo que cambiarías de verdad, sin reescribir lo que está bien. Si citas una fuente, con su enlace.

## Las diez pausas de «Para empezar» (gratis; son las que propone la app entre bloques)
${pausas}
## Los seis ejercicios nuevos
${nuevos}`;

fs.writeFileSync(MD, '# Revisión de ChatGPT de los textos nuevos de Mueve y Estira (v0.176.0)\n\nEl texto que Ez pega en ChatGPT, sacado del catálogo con `docs/traspaso/archivos/mueve-estira-25oct/revision-chatgpt.js`.\n\n---\n\n' + texto + '\n');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = `<title>Revisión de Mueve y Estira</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · El texto para la revisión de ChatGPT de lo nuevo de Mueve y Estira (v0.176.0), sacado del catálogo con
     docs/traspaso/archivos/mueve-estira-25oct/revision-chatgpt.js. -->
<style>
  /* Un solo encargo: qué hacer en tres pasos, el botón y el texto entero debajo para quien quiera leerlo. */
  :root { --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858; --line: #C9C0A8;
    --cta: #50624D; --focus: #3E5A3A; --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
    --mono: ui-monospace, 'Cascadia Mono', Consolas, monospace; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e;
    --ink-3: #B2A995; --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; color-scheme: dark; } }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995; --line: #4d4536;
    --cta: #8E9D88; --focus: #A3BC96; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .marco { max-width: 820px; margin: 0 auto; padding-block: 32px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1 { font: italic 500 clamp(34px, 7vw, 46px)/1.05 var(--display); margin: 0 0 12px; text-wrap: balance; }
  p, li { color: var(--ink-2); max-width: 42em; }
  ol { padding-left: 20px; display: grid; gap: 4px; }
  .copiar { font: italic 500 19px/1.2 var(--display); color: var(--paper); background: var(--cta); border: 0; border-radius: 999px; padding: 10px 24px; cursor: pointer; min-height: 44px; margin: 8px 0 18px; }
  .copiar.hecho { background: var(--focus); }
  .copiar:focus-visible, summary:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
  summary { cursor: pointer; color: var(--ink-3); }
  pre { white-space: pre-wrap; font: 12.5px/1.55 var(--mono); background: var(--paper-2); border: 1px solid var(--line); border-radius: 10px; padding: 14px; color: var(--ink-2); overflow-x: auto; }
</style>
<main class="marco">
  <p class="kicker">PACE · Mueve y Estira · 25 de octubre</p>
  <h1>La revisión de lo nuevo, para ChatGPT</h1>
  <p>Ya está en la app la 0.176.0. Esto es lo que ChatGPT no ha visto todavía con su texto definitivo: las diez pausas de
    «Para empezar» y los seis ejercicios nuevos, en español y en inglés.</p>
  <ol>
    <li>Pulsa «Copiar el texto».</li>
    <li>Pégalo en la misma conversación de ChatGPT de Mueve y Estira (o en una nueva: el texto se explica solo).</li>
    <li>Tráeme su respuesta entera. La compruebo antes de cambiar nada.</li>
  </ol>
  <button type="button" class="copiar" id="copiar">Copiar el texto</button>
  <details><summary>Ver el texto entero</summary><pre id="texto">${esc(texto)}</pre></details>
</main>
<script>
  document.getElementById('copiar').addEventListener('click', function () {
    var b = this, pre = document.getElementById('texto');
    var hecho = function () { b.textContent = 'Copiado'; b.classList.add('hecho'); setTimeout(function () { b.textContent = 'Copiar el texto'; b.classList.remove('hecho'); }, 2000); };
    var aMano = function () { pre.closest('details').open = true; var r = document.createRange(); r.selectNodeContents(pre);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Seleccionado: cópialo'; };
    try { navigator.clipboard.writeText(pre.textContent).then(hecho, aMano); } catch (e) { aMano(); }
  });
</script>
`;
fs.writeFileSync(HTML, html);
console.log('pausas 10 · nuevos', vistos.size, faltan.length ? '· FALTAN ' + faltan.join(', ') : '', '·', texto.length, 'caracteres');
