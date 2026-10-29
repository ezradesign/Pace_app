// La página «Tus rutinas, montado» para Ez: lee las fotos de fotos-montado.js, las pasa a webp más pequeñas
// (el visor de Ez no abre páginas de más de 512 KB) y escribe docs/proposals/tus-rutinas-montado-29oct.html.
// Uso, desde la raíz del worktree:
//   node docs/traspaso/archivos/tus-rutinas-28oct/pagina-montado.js <carpeta-de-fotos> "<cómo salió la suite>"
'use strict';
const path = require('path');
const fs = require('fs');
const RAIZ = path.resolve(__dirname, '../../../..');
const { chromium } = require(path.join(RAIZ, 'node_modules/playwright'));
const FOTOS = path.resolve(process.argv[2] || path.join(__dirname, 'fotos'));
const SUITE = process.argv[3] || 'la suite entera, en verde';
const NOTA = process.argv[4] ? process.argv[4] + ' ' : '';
const SALIDA = path.join(RAIZ, 'docs/proposals/tus-rutinas-montado-29oct.html');

async function webp(page, archivo, ancho) {
  const datos = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(FOTOS, archivo)).toString('base64');
  return page.evaluate(async ([src, ancho]) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = ancho; c.height = Math.round(img.height * ancho / img.width);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.7);
  }, [datos, ancho]);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const F = {};
  for (const n of ['u1-lista', 'u1-sigue', 'u1-edicion-lista', 'u1-edicion', 'c6-tope', 'c6-borrada']) {
    F[n] = { m: await webp(page, n + '-360.jpg', 420), d: await webp(page, n + '-1280.jpg', 900) };
  }
  await browser.close();
  const img = (src, alt) => '<img src="' + src + '" alt="' + alt + '" loading="lazy">';
  const par = (n, altM, altD, pie) => `<figure>
        <div class="m">${img(F[n].m, altM + ', en el móvil')}<span class="ancho">360 px</span></div>
        <div>${img(F[n].d, altD + ', en el ordenador')}<span class="ancho">1280 px</span></div>
        <figcaption>${pie}</figcaption>
      </figure>`;
  const html = `<title>Tus rutinas, montado</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · «Tus rutinas, montado»: U1 B y C6 A como los eligió Ez el 29 oct., en el index.html de la rama
     claude/tus-rutinas-c0cf03, sin nada pintado encima. La rehacen docs/traspaso/archivos/tus-rutinas-28oct/
     fotos-montado.js y pagina-montado.js. -->
<style>
  /* Una columna de lectura, como la maqueta: cada paso, su foto del móvil y la del ordenador. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --focus: #3E5A3A; --ok-bg: #E3E6D8; --move: #9A7B4F; --aviso: #B4654A;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --ok-bg: #2a3025; --move: #C9A877; --aviso: #D98E72; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --ok-bg: #2a3025; --move: #C9A877; --aviso: #D98E72; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .banda { background: var(--focus); color: var(--paper); font: 500 12px/1.5 var(--ui); letter-spacing: .04em; text-align: center;
    padding-block: 10px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .marco { max-width: 1000px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2, h3 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(38px, 8vw, 56px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(29px, 6vw, 36px); line-height: 1.1; margin-bottom: 12px; }
  h3 { font-size: 25px; line-height: 1.15; margin-bottom: 8px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  .lede { font-size: 17.5px; }
  b { color: var(--ink); font-weight: 600; }
  q { quotes: '«' '»'; }
  section.caso { margin-top: 44px; padding-top: 34px; border-top: 1px solid var(--line); }
  .paso { margin-top: 30px; }
  figure { margin: 14px 0 8px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2.4fr); gap: 14px; align-items: start; }
  figure > div { min-width: 0; }
  figure img { display: block; width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--line); background: var(--paper-2); }
  .ancho { display: block; margin-top: 6px; font: 500 11px/1.4 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); }
  figcaption { grid-column: 1 / -1; font-size: 14.5px; line-height: 1.5; color: var(--ink-3); max-width: 46em; }
  .caja { border: 1px solid var(--line); border-radius: 14px; padding: 14px 18px 4px; max-width: 44em; background: var(--paper-2); margin-top: 18px; }
  .caja.nueva { border-left: 3px solid var(--aviso); }
  ul.lista { padding-left: 1.1em; margin: 0 0 12px; max-width: 44em; color: var(--ink-2); }
  ul.lista li { margin: 0 0 6px; }
  .respuesta { margin-top: 44px; padding: 20px 18px 10px; border: 1px solid var(--cta); border-radius: 14px; max-width: 44em; background: var(--ok-bg); }
  .linea { font: italic 500 28px/1.25 var(--display); color: var(--ink); margin-bottom: 8px; }
  code { font-size: .92em; }
  @media (max-width: 640px) {
    figure { grid-template-columns: minmax(0, 1fr); }
    figure > div.m { max-width: 300px; }
  }
</style>
<div class="banda">Montado en su rama · fotos de la app de verdad, sin nada pintado encima · aún no está en main</div>
<main class="marco">
  <p class="kicker">PACE · Tus rutinas</p>
  <h1>Tus rutinas, montado</h1>
  <p class="lede">Lo que elegiste, <b>U1 B · C6 A</b>, ya está en la app de la rama, tal cual estaba en la maqueta. Estas fotos son de la
  app, a 360 px (el móvil) y a 1280 px (el ordenador), haciendo lo que haría una persona.</p>

  <section class="caso">
    <p class="kicker">U1 · B</p>
    <h2>Tu borrador te espera</h2>
    <p>Cerrar el constructor ya no pregunta nada y no pierde nada: Cancelar, la ×, Escape o tocar fuera dejan lo que llevas guardado como
    borrador en este dispositivo. También si se cierra la pestaña o la app.</p>

    <div class="paso">
      <h3>Al volver, «Tus rutinas» te lo ofrece</h3>
      ${par('u1-lista', '«Seguir con tu borrador», con su nombre, sus ejercicios y la hora', '«Seguir con tu borrador» en el lateral de Mueve',
        'Va en el sitio de «Crear rutina», con su nombre, cuántos ejercicios lleva y cuándo lo dejaste. Si es de otro día, dice «de ayer, 18:05» o la fecha.')}
    </div>

    <div class="paso">
      <h3>El constructor sigue donde lo dejaste</h3>
      ${par('u1-sigue', 'Sigues con tu borrador de hoy, 10:42', 'El constructor con el borrador y «Empezar de cero»',
        '«Empezar de cero» vacía el constructor y quita el borrador. Al guardar la rutina, el borrador se va solo.')}
    </div>

    <div class="paso">
      <h3>Cambiar una rutina que ya existe</h3>
      ${par('u1-edicion-lista', 'La tarjeta de «Cuello de tarde» sin cambiar y el borrador con «Cuello de noche»',
        'La tarjeta de «Cuello de tarde» sin cambiar, y el borrador debajo',
        'Le cambié el nombre a «Cuello de noche» y le quité un ejercicio. La tarjeta sigue como estaba hasta que guardes.')}
      ${par('u1-edicion', 'Sigues con tus cambios en “Cuello de tarde”', 'El constructor con los cambios a «Cuello de tarde»',
        'El lápiz de esa rutina, o «Seguir con tu borrador», abre con tus cambios.')}
      <div class="caja nueva">
        <p><b>Una cosa que no estaba en la maqueta.</b> Al cambiar una rutina que ya existe, el botón dice <q>Deshacer los cambios</q> en vez
        de <q>Empezar de cero</q>: la deja como estaba guardada. «Empezar de cero» la habría vaciado entera. Si prefieres otro texto, dímelo.</p>
      </div>
    </div>

    <div class="caja">
      <p><b>También montado:</b></p>
      <ul class="lista">
        <li>En «Elige un ejercicio», Escape, la × y tocar fuera vuelven a tu rutina, como «← Volver».</li>
        <li>Hay un solo borrador. Si tienes uno y cambias otra rutina con su lápiz, lo nuevo ocupa su sitio.</li>
        <li>Un borrador que llegue dañado se descarta solo, sin tocar tus rutinas ni nada más.</li>
      </ul>
    </div>
  </section>

  <section class="caso">
    <p class="kicker">C6 · A</p>
    <h2>Una línea encima de Guardar</h2>
    <p>Si algo no deja guardar, ahora lo dice, y la rutina sigue en pantalla y en el borrador.</p>

    <div class="paso">
      <h3>Ya tienes diez rutinas</h3>
      ${par('c6-tope', 'Ya tienes 10 rutinas, el máximo', 'La línea de las diez rutinas encima de Guardar',
        'La décima se hizo en otra pestaña mientras escribías esta. Cuando borres una, Guardar la guarda.')}
    </div>

    <div class="paso">
      <h3>La rutina se borró en otra pestaña</h3>
      ${par('c6-borrada', 'Esta rutina se ha borrado en otra pestaña, con «Guardarla como nueva»', 'La línea de la rutina borrada encima de Guardar',
        '«Guardarla como nueva» la guarda como una rutina nueva. Si ya tienes diez, lo dice la otra línea.')}
    </div>
  </section>

  <div class="respuesta">
    <p class="kicker" style="margin-bottom:8px">Cómo está probado</p>
    <p class="linea">13 pruebas nuevas, y ${SUITE}</p>
    <p>Cada prueba nueva se vio fallar antes de montarlo. Una comprueba que una rutina guardada antes sigue intacta. ${NOTA}Los textos van en
    español y en inglés. Está en la rama <code>claude/tus-rutinas-c0cf03</code>; a <code>main</code> va cuando digas «júntalo».</p>
  </div>
</main>
`;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA + ': ' + Math.round(html.length / 1024) + ' KB');
})();
