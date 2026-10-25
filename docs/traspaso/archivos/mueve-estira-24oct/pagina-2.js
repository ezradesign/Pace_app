// Página para Ez: Mueve y Estira en tres capas (2A 3A 4A), con fotos de la app real.
// Uso: node pagina-2.js <carpeta-de-fotos> <salida.html>. Las fotos las hace fotos-2.js.
'use strict';
const fs = require('fs');
const path = require('path');
const [, , FOTOS, SALIDA] = process.argv;
const foto = (n) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(FOTOS, n + '.jpg')).toString('base64');
const fig = (n, pie, alt) => `<figure><img src="${foto(n)}" alt="${alt}" loading="lazy"><figcaption>${pie}</figcaption></figure>`;
const par = (clave, alt) => `<div class="fotos movil">
  ${fig('es-360-hoja-' + clave, 'Hoja · español', alt + ', hoja, en español')}
  ${fig('es-360-runner-' + clave, 'Ejercicio · español', alt + ', pantalla de ejercicio, en español')}
  ${fig('en-360-hoja-' + clave, 'Hoja · inglés', alt + ', hoja, en inglés')}
  ${fig('en-360-runner-' + clave, 'Ejercicio · inglés', alt + ', pantalla de ejercicio, en inglés')}
</div>
<details><summary>A 1280 px</summary><div class="fotos ancho">
  ${fig('es-1280-hoja-' + clave, 'Hoja · español', alt + ', hoja a 1280, en español')}
  ${fig('es-1280-runner-' + clave, 'Ejercicio · español', alt + ', ejercicio a 1280, en español')}
  ${fig('en-1280-hoja-' + clave, 'Hoja · inglés', alt + ', hoja a 1280, en inglés')}
  ${fig('en-1280-runner-' + clave, 'Ejercicio · inglés', alt + ', ejercicio a 1280, en inglés')}
</div></details>`;
const lib = (n, titulo) => `<div class="fotos libs">
  ${fig('es-360-biblioteca-' + n, titulo + ' · 360 · español', titulo + ' entera a 360, en español')}
  ${fig('en-360-biblioteca-' + n, titulo + ' · 360 · inglés', titulo + ' entera a 360, en inglés')}
</div>
<details><summary>${titulo} a 1280 px</summary><div class="fotos anchas">
  ${fig('es-1280-biblioteca-' + n, titulo + ' · 1280 · español', titulo + ' entera a 1280, en español')}
  ${fig('en-1280-biblioteca-' + n, titulo + ' · 1280 · inglés', titulo + ' entera a 1280, en inglés')}
</div></details>`;

const html = `<title>Mueve y Estira en capas</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<style>
  /* Una columna de lectura, fotos en rejilla; la paleta de PACE. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --focus: #3E5A3A; --move: #9A7B4F; --extra: #6B7A8F;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --move: #C29F6E; --extra: #95A4BA; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --move: #C29F6E; --extra: #95A4BA; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .banda { background: var(--focus); color: var(--paper); font: 500 12px/1.5 var(--ui); letter-spacing: .04em; text-align: center;
    padding-block: 10px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .marco { max-width: 1000px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2, h3 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(38px, 8vw, 54px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(27px, 6vw, 34px); line-height: 1.1; margin-bottom: 10px; }
  h3 { font-size: 21px; margin: 18px 0 6px; }
  p, li { color: var(--ink-2); max-width: 44em; }
  p { margin: 0 0 12px; }
  .lede { font-size: 17.5px; }
  b { color: var(--ink); font-weight: 600; }
  section { margin-top: 40px; padding-top: 30px; border-top: 1px solid var(--line); }
  .fotos { display: grid; gap: 14px; margin: 16px 0 6px; align-items: start; }
  .movil { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .ancho, .anchas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .libs { grid-template-columns: repeat(2, minmax(0, 260px)); }
  figure { margin: 0; min-width: 0; }
  figure img { display: block; width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--line); background: var(--paper-2); }
  figcaption { font: 500 11.5px/1.4 var(--ui); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); margin-top: 8px; }
  .capas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 28px; }
  .capas div { min-width: 0; border-left: 2px solid var(--move); padding-left: 12px; }
  .capas div.estira { border-left-color: var(--extra); }
  .capas ul { margin: 4px 0 0; padding-left: 18px; font-size: 14.5px; }
  .capas h4 { font: 600 11px/1.4 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); margin: 12px 0 2px; }
  details { margin: 10px 0; border-top: 1px dashed var(--line); padding-top: 10px; }
  summary { cursor: pointer; font: italic 500 19px/1.3 var(--display); color: var(--ink); list-style: none; display: flex; gap: 12px; align-items: baseline; }
  summary::-webkit-details-marker { display: none; }
  summary::before { content: '+'; flex: 0 0 14px; font: 400 20px/1 var(--ui); color: var(--cta); }
  details[open] > summary::before { content: '–'; }
  summary:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; border-radius: 4px; }
  .mio li { margin-bottom: 6px; }
  @media (max-width: 640px) {
    .movil, .ancho, .anchas, .capas { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .capas { grid-template-columns: minmax(0, 1fr); }
    figcaption { font-size: 10.5px; }
  }
</style>

<div class="banda">Fotos de la app de verdad (v0.176.0), en su rama. Aún no está en PACE: lo junto cuando digas «júntalo».</div>
<main class="marco">
  <p class="kicker">PACE · Mueve y Estira · 2A 3A 4A</p>
  <h1>Mueve y Estira en tres capas</h1>
  <p class="lede">Lo que elegiste: «Para empezar» arriba, gratis entera y lo que propone «A tu ritmo» sin pagar; debajo, el resto ordenado, con la banda y la barra aparte y lo exigente en «Para ir a más», que solo sale si lo eliges. Seis ejercicios nuevos, con el dibujo del módulo hasta que llegue el tuyo.</p>
  <p>Ninguna rutina ni ejercicio se borra: las que rehacen otra de antes guardan su historial, sus logros y «Continúa».</p>

  <section>
    <h2>Las dos bibliotecas, enteras</h2>
    ${lib('mueve', 'Mueve')}
    ${lib('estira', 'Estira')}
  </section>

  <section>
    <h2>Para empezar · Levántate y sube</h2>
    <p>Sentarte del todo y levantarte, 2 × 5, y subir talones, 2 × 6. Unos tres minutos.</p>
    ${par('empezar', 'Levántate y sube')}
  </section>

  <section>
    <h2>Con material · Espalda con banda</h2>
    <p>Abrir y tirar de la banda. Los dos pasos de banda dicen «se puede saltar»: sin banda, pulsas «Saltar este paso», haces el remo con tu mano y la rutina cuenta entera. De pago.</p>
    ${par('material', 'Espalda con banda')}
  </section>

  <section>
    <h2>Qué hay en cada capa</h2>
    <div class="capas">
      <div><h4>Mueve · Para empezar (gratis)</h4><ul><li>Levántate y sube</li><li>Empuje sencillo</li><li>Piernas sin pasos</li><li>Fuerza en suelo (nueva)</li></ul>
        <h4>Sigilo</h4><ul><li>Gemelos subrepticios · Glúteos invisibles · Core silencioso</li></ul>
        <h4>Con material</h4><ul><li>Espalda con banda (nueva, de pago) · Colgarse</li></ul>
        <h4>Para ir a más</h4><ul><li>Empuje · progresión · Fondos en silla · Sentadilla en pared · Piernas · a una · Core · plancha</li></ul></div>
      <div class="estira"><h4>Estira · Para empezar (gratis)</h4><ul><li>Cuello suave · Brazos libres · Manos y muñecas</li><li>Tronco sentado · Piernas en pausa · Movilidad en suelo</li></ul>
        <h4>Oficina</h4><ul><li>Escritorio express · Antídoto silla · Postura reset · Manos y antebrazos</li></ul>
        <h4>Hombros y columna</h4><ul><li>Hombros · Espalda de oficina · Espalda de pie · Columna · ondas</li></ul>
        <h4>Caderas y piernas</h4><ul><li>Caderas de pie · Caderas · Cadena posterior</li></ul>
        <h4>Para ir a más</h4><ul><li>Estiramiento del sofá · Caderas · suelo</li></ul></div>
    </div>
    <p style="margin-top:14px">ATG y Ancestral ya no salen en la lista. Sus cuatro logros, como elegiste: quien los tenga los conserva; a los demás dejan de salirles, y «Cuerpo de campo» pide los otros cuatro.</p>
  </section>

  <section>
    <h2>Lo que he decidido yo, para que lo mires</h2>
    <ul class="mio">
      <li><b>Dónde van cuatro de los ejercicios nuevos:</b> desliza el talón en «Fuerza en suelo», la bisagra de cadera en «Piernas · a una», la inclinación de tronco en «Columna · ondas» y el gemelo en pared en «Cadena posterior».</li>
      <li><b>Para no borrar ninguno:</b> los escalenos pasan a «Antídoto silla», y las palmas en la mesa y el rezo invertido, a «Manos y antebrazos». El puente con marcha va a «Core · plancha».</li>
      <li><b>«A tu ritmo» sin pagar sirve 7 rutinas</b> de «Para empezar»: «Levántate y sube» no entra porque pide una silla sin ruedas (como antes «Sentadillas de silla»), y las de suelo tampoco. Para que cada día mueva el cuerpo entero, «Tronco sentado» vale con cualquier silla y «Piernas en pausa» se apoya en la mesa.</li>
      <li><b>«Fuerte en la oficina»</b> (todas las de Mueve) ya no pide «Colgarse»: sin barra era imposible.</li>
      <li><b>«Ver ejercicio»</b> reparte 27 en vez de 31: lo que era estirar pasó a Estira, y de Mueve quedan tres.</li>
      <li><b>«Columna · ondas»</b> conserva su nombre aunque ya no lleve la onda: dime si prefieres otro.</li>
    </ul>
  </section>
</main>
`;
fs.writeFileSync(SALIDA, html);
console.log(SALIDA, Math.round(html.length / 1024) + ' KB');
