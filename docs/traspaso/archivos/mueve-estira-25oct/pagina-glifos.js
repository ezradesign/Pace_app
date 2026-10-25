// La página con los prompts de los dibujos de Mueve y Estira, cada uno con su botón «Copiar».
// Uso: node pagina-glifos.js <tanda.md> <salida.html>; tanda.md es «La tanda de Mueve y Estira» de docs/product/GLIFOS_A_DIBUJAR.md.
'use strict';
const fs = require('fs');
const [, , ENTRADA, SALIDA] = process.argv;
const md = fs.readFileSync(ENTRADA, 'utf8').replace(/\r\n/g, '\n');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const preambulo = md.match(/```\n([\s\S]*?)\n```/)[1].trim();

const filas = [];
for (const l of md.split('\n')) {
  const m = l.match(/^\| `([^`]+)\.png` \| ([^|]+) \| (.+) \|$/);
  if (m) filas.push({ archivo: m[1] + '.png', donde: m[2].trim(), lamina: m[3].trim() });
}
if (filas.length !== 13) throw new Error('filas: ' + filas.length);

const NOMBRE = {
  'remo-con-banda': 'Remo con banda', 'remo-con-tu-mano': 'Remo con tu mano', 'bisagra-de-cadera': 'Bisagra de cadera',
  'desliza-el-talon': 'Desliza el talón', 'inclinacion-de-tronco': 'Inclinación de tronco', 'gemelo-en-pared': 'Gemelo en pared',
  'piernas-elevadas-sentado': 'Piernas elevadas sentado', 'rodar-hacia-abajo': 'Rodar hacia abajo', 'gato-camello': 'Gato-camello',
  '90-90': '90/90', 'sentarse-y-levantarse-del-suelo': 'Sentarse y levantarse del suelo',
  'sentadilla-de-cuadriceps': 'Sentadilla de cuádriceps', 'puente-toracico': 'Puente torácico',
};
const PARA_DESPUES = ['sentadilla-de-cuadriceps', 'puente-toracico'];

/* La lámina de las dos que esperan decisión lleva delante «Antes de dibujarla…»: el prompt es solo la propuesta. */
const limpia = (s) => s.replace(/\*\*[^*]+\*\*:[^.]*\.\s*Propuesta:\s*/, '').replace(/\*\*/g, '');
const tarjeta = (f, i, nueva) => {
  const base = f.archivo.replace(/\.png$/, '');
  const prompt = preambulo + '\n\nExercise plate: ' + limpia(f.lamina);
  const nota = base === 'rodar-hacia-abajo'
    ? '<p class="nota">Dijiste que tienes uno que sí casa: si es así, déjalo en la carpeta con este nombre y no hace falta dibujarlo.</p>' : '';
  return `<li class="tarjeta${nueva ? ' nueva' : ''}">
      <div class="cab"><span class="n">${i}</span><div><p class="t">${esc(NOMBRE[base] || base)}</p>
        <p class="donde">${esc(nueva ? f.donde : 'Lo que viste: ' + f.donde.replace(/\*\*/g, ''))}</p></div></div>
      <p class="archivo">Guárdalo como <code>${esc(f.archivo)}</code></p>${nota}
      <details><summary>Ver el prompt</summary><pre id="p-${base}">${esc(prompt)}</pre></details>
      <button type="button" class="copiar" data-copia="p-${base}" id="b-${base}">Copiar el prompt</button>
    </li>`;
};

const nuevas = filas.slice(0, 6);
const noCasan = filas.slice(6).filter((f) => PARA_DESPUES.indexOf(f.archivo.replace(/\.png$/, '')) === -1);
const despues = filas.filter((f) => PARA_DESPUES.indexOf(f.archivo.replace(/\.png$/, '')) !== -1);

const html = `<title>Dibujos de Mueve y Estira</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · Los prompts de los dibujos de Mueve y Estira (3A de Ez), sacados de docs/product/GLIFOS_A_DIBUJAR.md
     («La tanda de Mueve y Estira») de la rama de la sesión mueve-estira, 25 oct. 2026. Cada botón copia el
     preámbulo + «Exercise plate», como en encargos-14oct/PROMPTS_IMAGENES.md. -->
<style>
  /* Una lista de encargos: cada tarjeta, su nombre, dónde va, el archivo y un botón que copia el prompt entero. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --focus: #3E5A3A; --move: #9A7B4F; --extra: #6B7A8F;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
    --mono: ui-monospace, 'Cascadia Mono', Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --move: #C29F6E; --extra: #95A4BA; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --move: #C29F6E; --extra: #95A4BA; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .marco { max-width: 900px; margin: 0 auto; padding-block: 32px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0 0 12px; }
  h1 { font-size: clamp(34px, 7vw, 48px); line-height: 1.05; }
  h2 { font-size: 27px; line-height: 1.15; margin-top: 34px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  b { color: var(--ink); font-weight: 600; }
  code { font-family: var(--mono); font-size: .88em; background: var(--paper-2); border: 1px solid var(--line); border-radius: 5px; padding: 0 5px; overflow-wrap: anywhere; }
  ol.como { margin: 0 0 8px; padding-left: 20px; color: var(--ink-2); display: grid; gap: 4px; max-width: 42em; }
  .tarjetas { list-style: none; padding: 0; margin: 14px 0 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
  .tarjeta { border: 1px solid var(--line); border-left: 3px solid var(--line); border-radius: 12px; padding: 14px 14px 12px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .tarjeta.nueva { border-left-color: var(--move); }
  .cab { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 10px; align-items: start; }
  .n { font: italic 500 22px/1.1 var(--display); color: var(--cta); }
  .t { font: italic 500 21px/1.2 var(--display); color: var(--ink); margin: 0; }
  .donde { font-size: 13px; color: var(--ink-3); margin: 2px 0 0; }
  .archivo { font-size: 14px; margin: 0; }
  .nota { font-size: 13.5px; color: var(--ink-3); margin: 0; }
  details { margin: 2px 0; }
  summary { cursor: pointer; font-size: 13.5px; color: var(--ink-3); }
  pre { white-space: pre-wrap; font: 12px/1.5 var(--mono); background: var(--paper-2); border: 1px solid var(--line); border-radius: 8px; padding: 10px; margin: 8px 0 0; color: var(--ink-2); max-height: 220px; overflow: auto; }
  .copiar { margin-top: auto; align-self: flex-start; font: italic 500 17px/1.2 var(--display); color: var(--paper); background: var(--cta); border: 0; border-radius: 999px; padding: 8px 18px; cursor: pointer; min-height: 40px; }
  .copiar.hecho { background: var(--focus); }
  .copiar:focus-visible, summary:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
</style>

<main class="marco">
  <p class="kicker">PACE · Mueve y Estira · 25 de octubre</p>
  <h1>Los dibujos de Mueve y Estira</h1>
  <p>Los seis ejercicios nuevos que elegiste (3A) y los dibujos que no casaban. En la app, mientras no esté el tuyo, sale el
    dibujo del módulo. Empieza por los seis nuevos.</p>
  <ol class="como">
    <li>Un chat nuevo de GPT Image para cada dibujo, sin adjuntar nada. Pulsa «Copiar el prompt» y pégalo.</li>
    <li>Si lo bloquea, repítelo una vez en otro chat nuevo. Si vuelve a bloquear, dímelo y te paso la versión con referencias.</li>
    <li>PNG cuadrado y grande (2048 × 2048 o más), tinta negra sobre blanco y sin texto.</li>
    <li>Guárdalo en <code>Pace_app\\dibujos-22oct</code> con el nombre que dice cada tarjeta. Con ese nombre lo meto yo en la app.</li>
  </ol>

  <h2>Los seis nuevos</h2>
  <ol class="tarjetas">${nuevas.map((f, i) => tarjeta(f, i + 1, true)).join('')}</ol>

  <h2>Los que no casaban</h2>
  <ol class="tarjetas">${noCasan.map((f, i) => tarjeta(f, i + 7, false)).join('')}</ol>

  <h2>Para después: dos que ya no salen</h2>
  <p>«Sentadilla de cuádriceps» y «Puente torácico» ya no salen en ninguna rutina, porque con la 2A no se sabía qué movimiento
    eran. Si un día vuelven, antes decides qué son. Te dejo los prompts de la propuesta por si quieres adelantarlos, pero no hacen falta ahora.</p>
  <ol class="tarjetas">${despues.map((f, i) => tarjeta(f, i + 12, false)).join('')}</ol>
</main>

<script>
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.copiar'); if (!b) return;
    var pre = document.getElementById(b.getAttribute('data-copia')); if (!pre) return;
    var texto = pre.textContent;
    var hecho = function () { b.textContent = 'Copiado'; b.classList.add('hecho'); setTimeout(function () { b.textContent = 'Copiar el prompt'; b.classList.remove('hecho'); }, 2000); };
    var aMano = function () {
      var d = pre.closest('details'); if (d) d.open = true;
      var r = document.createRange(); r.selectNodeContents(pre); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      b.textContent = 'Seleccionado: cópialo'; };
    try { navigator.clipboard.writeText(texto).then(hecho, aMano); } catch (err) { aMano(); }
  });
</script>
`;
fs.writeFileSync(SALIDA, html);
console.log('escrita', SALIDA, nuevas.length, noCasan.length, despues.length);
