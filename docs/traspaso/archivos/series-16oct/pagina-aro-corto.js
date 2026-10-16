/* PACE · la página para Ez: la pausa corta con el aro corto (16 oct. 2026)
   Uso, después de fotos-aro-corto.js:
     node docs/traspaso/archivos/series-16oct/pagina-aro-corto.js
   Escribe aro-corto.html con las fotos dentro (sin archivos al lado), para publicarla
   como Artifact y para el visor de Ez, que no abre HTML de más de 512 KB. */
'use strict';
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, 'fotos');
const img = (n) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(F, n + '.jpg')).toString('base64');
const aviso = JSON.parse(fs.readFileSync(path.join(F, 'aviso.json'), 'utf8')).mov[0];

const html = `<title>El aro corto</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<style>
/* Una columna de lectura, como una carta de PACE; las fotos van en pareja (móvil y escritorio)
   cuando hay ancho. Colores y letras, los de la app (DESIGN_SYSTEM.md). */
:root {
  --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F695B;
  --line: #D6CDB6; --focus: #3E5A3A; --breathe: #C97A5D; --mark: rgba(62, 90, 58, 0.10);
  --serif: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --sans: 'Inter Tight', system-ui, -apple-system, 'Segoe UI', sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
  --line: #4d4536; --focus: #98B58B; --breathe: #E8A98F; --mark: rgba(152, 181, 139, 0.14); color-scheme: dark; } }
:root[data-theme="dark"] {
  --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
  --line: #4d4536; --focus: #98B58B; --breathe: #E8A98F; --mark: rgba(152, 181, 139, 0.14); color-scheme: dark; }
* { box-sizing: border-box; }
body { background: var(--paper); color: var(--ink); font-family: var(--sans); font-size: 16px; line-height: 1.55; }
.hoja { max-width: 900px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 36px 64px; display: flex; flex-direction: column; gap: 40px; }
h1, h2 { font-family: var(--serif); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
h1 { font-size: clamp(36px, 7vw, 50px); line-height: 1.04; }
h2 { font-size: 28px; line-height: 1.1; }
p { margin: 0; max-width: 64ch; color: var(--ink-2); }
p b { color: var(--ink); font-weight: 600; }
.eyebrow { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); }
section { display: flex; flex-direction: column; gap: 14px; }
.par { display: grid; grid-template-columns: minmax(0, 360px) minmax(0, 1fr); gap: 20px; align-items: start; }
@media (max-width: 760px) { .par { grid-template-columns: minmax(0, 1fr); } }
figure { margin: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
figure img { width: 100%; height: auto; display: block; border: 1px solid var(--line); border-radius: 10px; }
figcaption { font-size: 13px; color: var(--ink-3); }
.mov img { max-width: 360px; }
.aviso { max-width: 380px; background: var(--paper-2); border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; display: grid; grid-template-columns: 28px 1fr; gap: 4px 10px; }
.aviso .ico { grid-row: span 2; width: 28px; height: 28px; border-radius: 7px; background: var(--focus); }
.aviso .t { font-weight: 600; font-size: 15px; }
.aviso .c { font-size: 14px; color: var(--ink-2); }
.tabla { border-collapse: collapse; font-size: 15px; font-variant-numeric: tabular-nums; }
.tabla td { padding: 4px 18px 4px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
.tabla td:first-child { color: var(--ink-3); }
.opciones { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
@media (max-width: 640px) { .opciones { grid-template-columns: minmax(0, 1fr); } }
.op { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.op h3 { margin: 0; font-family: var(--serif); font-style: italic; font-weight: 500; font-size: 22px; }
.op .rec { font-family: var(--sans); font-style: normal; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--focus); margin-left: 6px; }
.op img { max-width: 320px; }
.pregunta { background: var(--mark); border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; }
</style>
<main class="hoja">
  <header style="display:flex;flex-direction:column;gap:12px">
    <div class="eyebrow">PACE · «A tu ritmo» · 16 oct. 2026</div>
    <h1>Con el aro a 10, la pausa cada 30 minutos</h1>
    <p>Lo que elegiste el 15 de octubre ya está montado: <b>nunca más de 30 minutos seguidos</b> y, si detrás
      del bloque no toca pausa, <b>el aro espera a que le des</b>. Son fotos de la app real: martes 13,
      «Una hora» desde las 9:00, con el aro a 10. Al final te pregunto una cosa pequeña.</p>
  </header>

  <section>
    <h2>Cómo queda el día</h2>
    <table class="tabla">
      <tr><td>9:00 · 9:10 · 9:20</td><td>Tres bloques de 10, seguidos</td></tr>
      <tr><td>9:30</td><td>La pausa (5 min)</td></tr>
      <tr><td>9:35 · 9:45</td><td>Dos bloques de 10</td></tr>
      <tr><td>9:55</td><td>El cierre, y a las 10:00 has terminado</td></tr>
    </table>
    <p>Antes eran tres pausas en esa hora; ahora, una. Con el aro a 15 la pausa llega cada dos bloques, y
      de 20 minutos en adelante, tras cada bloque, así que el Pomodoro de 25 sigue igual.</p>
  </section>

  <section>
    <h2>El primer bloque acaba a las 9:10</h2>
    <p>Suena el final, pero <b>no se abre la ventana de la pausa</b>. El aro ya marca 10:00 y dice «Bloque 2
      de 5», con «Empezar bloque 2». En el escritorio, la barra de la izquierda dice cuándo es la pausa.</p>
    <div class="par">
      <figure class="mov"><img src="${img('mov-aro')}" alt="El móvil a las 9:10: el aro en 10:00, Bloque 2 de 5, botón Empezar bloque 2, sin ventana de pausa"><figcaption>Móvil, 360 px</figcaption></figure>
      <figure><img src="${img('esc-aro')}" alt="El escritorio a las 9:10: el aro esperando el bloque 2 y, a la izquierda, Siguiente pausa a las 9:30"><figcaption>Escritorio, 1280 px</figcaption></figure>
    </div>
  </section>

  <section>
    <h2>El aviso</h2>
    <p>Si tienes el aviso puesto en Ajustes y PACE está en segundo plano, te llega esto. Lo dibuja el móvil
      o Windows, así que aquí va solo su texto, tal cual sale de la app:</p>
    <div class="aviso" role="img" aria-label="Aviso: ${aviso.title}. ${aviso.body}">
      <span class="ico"></span><span class="t">${aviso.title}</span><span class="c">${aviso.body}</span>
    </div>
    <p>En inglés: «Block 1 of 5 done» y «Carry on when you like: your break is at 9:30.»</p>
  </section>

  <section>
    <h2>La línea del día</h2>
    <p>Los tres bloques van pegados y la pausa sale a las 9:30. En el móvil es la hoja de «Ver todo».</p>
    <div class="par">
      <figure class="mov"><img src="${img('mov-linea')}" alt="La hoja Ver todo en el móvil: 9:00, 9:10 y 9:20 foco de 10 min, 9:30 Escritorio express"><figcaption>Móvil, «Ver todo»</figcaption></figure>
      <figure><img src="${img('esc-linea')}" alt="La línea del día en el escritorio: tres tramos de foco seguidos y la pausa a las 9:30"><figcaption>Escritorio, la línea bajo el aro</figcaption></figure>
    </div>
  </section>

  <section class="pregunta">
    <h2>Lo que te pregunto</h2>
    <p>Debajo de 10:00, el aro dice «Ciclo completado», que es lo que pone siempre al acabar un bloque. Con
      el aro esperando, la pausa todavía no ha llegado, así que puede decir cuándo llega, como el aviso.</p>
  </section>
  <div class="opciones">
    <div class="op"><h3>La pausa, a las 9:30<span class="rec">Recomendada</span></h3>
      <p>Dice lo que viene, con la hora de verdad.</p>
      <img src="${img('mov-aro-b')}" alt="El aro con La pausa, a las 9:30 debajo de 10:00"></div>
    <div class="op"><h3>Como está: «Ciclo completado»</h3>
      <p>No cambia nada de lo que ya conoces.</p>
      <img src="${img('mov-aro')}" alt="El aro con Ciclo completado debajo de 10:00"></div>
  </div>
</main>
`;
const out = path.join(__dirname, 'aro-corto.html');
fs.writeFileSync(out, html);
console.log('aro-corto.html', Math.round(fs.statSync(out).size / 1024) + ' KB');
