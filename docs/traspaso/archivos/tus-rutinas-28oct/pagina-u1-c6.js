// La página de la maqueta de U1 y C6 para Ez: lee las fotos de fotos-u1-c6.js, las pasa a webp más
// pequeñas (el visor de Ez no abre páginas de más de 512 KB) y escribe docs/proposals/tus-rutinas-u1-c6-29oct.html.
// Uso, desde la raíz del worktree: node docs/traspaso/archivos/tus-rutinas-28oct/pagina-u1-c6.js <carpeta-de-fotos>
'use strict';
const path = require('path');
const fs = require('fs');
const RAIZ = path.resolve(__dirname, '../../../..');
const { chromium } = require(path.join(RAIZ, 'node_modules/playwright'));
const FOTOS = path.resolve(process.argv[2] || path.join(__dirname, 'fotos'));
const SALIDA = path.join(RAIZ, 'docs/proposals/tus-rutinas-u1-c6-29oct.html');

async function webp(page, archivo, ancho) {
  const datos = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(FOTOS, archivo)).toString('base64');
  return page.evaluate(async ([src, ancho]) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = ancho; c.height = Math.round(img.height * ancho / img.width);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.72);
  }, [datos, ancho]);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const m = (n) => webp(page, n + '-360.jpg', 480);
  const d = (n) => webp(page, n + '-1280.jpg', 960);
  const F = {
    hoyM: await m('hoy-selector'), hoyD: await d('hoy-selector'),
    u1aM: await m('u1-a-pregunta'), u1aD: await d('u1-a-pregunta'),
    u1bM: await m('u1-b-editor'), u1bD: await d('u1-b-lista'),
    c6aM: await m('c6-a-tope'), c6aM2: await m('c6-a-borrada'),
    c6bM: await m('c6-b-ventana'),
  };
  await browser.close();
  const img = (src, alt) => '<img src="' + src + '" alt="' + alt + '" loading="lazy">';
  const html = `<title>Tus rutinas sin perder nada</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · maqueta de U1 y C6 (revisión de ChatGPT del 28 oct.), 29 oct. 2026. Fotos del index.html de la rama
     claude/tus-rutinas-c0cf03 con las opciones pintadas encima con los componentes de la app. La rehacen
     docs/traspaso/archivos/tus-rutinas-28oct/fotos-u1-c6.js y pagina-u1-c6.js. -->
<style>
  /* Una columna de lectura; cada opción, su foto del móvil y, si ayuda, la del ordenador. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --focus: #3E5A3A; --ok-bg: #E3E6D8; --move: #9A7B4F;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --ok-bg: #2a3025; --move: #C9A877; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --ok-bg: #2a3025; --move: #C9A877; color-scheme: dark; }
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
  section.caso { margin-top: 44px; padding-top: 34px; border-top: 1px solid var(--line); }
  .opcion { margin-top: 30px; }
  .letra { font: italic 500 18px/1 var(--display); color: var(--cta); margin-right: 6px; }
  .reco { display: inline-block; font: 600 10.5px/1 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--paper);
    background: var(--cta); border-radius: 999px; padding: 5px 9px; vertical-align: 4px; margin-left: 8px; }
  figure { margin: 14px 0 8px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2.4fr); gap: 14px; align-items: start; }
  figure.solo { grid-template-columns: minmax(0, 300px); }
  figure.dos { grid-template-columns: minmax(0, 300px) minmax(0, 300px); }
  figure > div { min-width: 0; }
  figure img { display: block; width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--line); background: var(--paper-2); }
  figcaption { grid-column: 1 / -1; font-size: 14.5px; line-height: 1.5; color: var(--ink-3); max-width: 46em; }
  ul.lista { padding-left: 1.1em; margin: 0 0 12px; max-width: 44em; color: var(--ink-2); }
  ul.lista li { margin: 0 0 6px; }
  .comun { border: 1px solid var(--line); border-radius: 14px; padding: 14px 18px 4px; max-width: 44em; background: var(--paper-2); margin-top: 16px; }
  .respuesta { margin-top: 44px; padding: 20px 18px 10px; border: 1px solid var(--cta); border-radius: 14px; max-width: 44em; background: var(--ok-bg); }
  .linea { font: italic 500 28px/1.25 var(--display); color: var(--ink); margin-bottom: 8px; }
  @media (max-width: 640px) {
    figure, figure.dos { grid-template-columns: minmax(0, 1fr); }
    figure > div.m { max-width: 300px; }
  }
</style>
<div class="banda">Maqueta para elegir · nada de esto está montado · fotos de la app de verdad con las opciones pintadas encima</div>
<main class="marco">
  <p class="kicker">PACE · Tus rutinas</p>
  <h1>Tus rutinas sin perder nada</h1>
  <p class="lede">Dos cosas de «Tus rutinas» que hoy pueden hacerte perder lo que has escrito. Para cada una hay dos o tres maneras de
  arreglarla, con una recomendada. <b>Elige una letra para cada una</b> y la monto tal cual.</p>
  <p>Lo demás de la revisión de ChatGPT sobre «Tus rutinas» ya está hecho en su rama, sin cambiar nada que se vea: la silla, la banda y la
  pared que faltaban, el constructor detrás de Estira, el inglés, los minutos, las tarjetas y el teclado.</p>

  <section class="caso">
    <p class="kicker">Primera · U1</p>
    <h2>Cerrar el constructor sin querer</h2>
    <p>Hoy, en «Elige un ejercicio», Escape, la × o tocar fuera cierran <b>todo</b> el constructor, no solo la lista. Y al cerrar, la
    rutina a medio hacer se pierde sin preguntar.</p>
    <figure>
      <div class="m">${img(F.hoyM, 'Hoy: la lista de ejercicios en el móvil, con su ×')}</div>
      <div>${img(F.hoyD, 'Hoy: la lista de ejercicios en el ordenador')}</div>
      <figcaption>Hoy. La × de arriba a la derecha cierra el constructor entero, no vuelve a la rutina.</figcaption>
    </figure>
    <div class="comun">
      <p><b>En las tres opciones</b>, Escape y la × de esta lista vuelven a tu rutina, como «← Volver». Lo que cambia es qué pasa al cerrar la rutina.</p>
    </div>

    <div class="opcion">
      <h3><span class="letra">A</span>PACE pregunta antes de cerrar</h3>
      <p>Si has cambiado algo y cierras (Cancelar, la ×, Escape o tocar fuera), sale esta pregunta. Si no has cambiado nada, se cierra sin más.</p>
      <figure>
        <div class="m">${img(F.u1aM, 'Opción A en el móvil: ¿Guardar «Media mañana»?')}</div>
        <div>${img(F.u1aD, 'Opción A en el ordenador')}</div>
        <figcaption>«Guardar» solo sale si la rutina ya tiene nombre y un ejercicio. Si se cierra la pestaña o la app, lo escrito se pierde igual que hoy.</figcaption>
      </figure>
    </div>

    <div class="opcion">
      <h3><span class="letra">B</span>Tu borrador te espera<span class="reco">Recomendada</span></h3>
      <p>Cierras cuando quieras y no pregunta nada: lo que llevas se guarda solo como borrador en este dispositivo. Al volver, «Tus rutinas»
      te lo ofrece y el constructor se abre donde lo dejaste.</p>
      <figure>
        <div class="m">${img(F.u1bM, 'Opción B: el constructor abre con tu borrador')}</div>
        <div>${img(F.u1bD, 'Opción B: en Tus rutinas, Seguir con tu borrador')}</div>
        <figcaption>Un solo borrador. Se borra al guardar la rutina o con «Empezar de cero». Si estabas cambiando una que ya existe, dice
        «Sigues con tus cambios en “Cuello de tarde”» y la tarjeta de esa rutina no cambia hasta que guardes.</figcaption>
      </figure>
      <p><b>Por qué la recomiendo</b>: no corta a nadie con una pregunta y también salva lo escrito si se cierra la pestaña, se acaba la
      batería o el móvil cierra la app, que la A no salva.</p>
    </div>

    <div class="opcion">
      <h3><span class="letra">C</span>Las dos</h3>
      <p>Pregunta como en la A al pulsar Cancelar o la ×, y si se cierra por otra vía (Escape, tocar fuera, la pestaña), el borrador espera como en la B.
      Más seguro, pero una pregunta más que casi siempre sobra.</p>
    </div>
  </section>

  <section class="caso">
    <p class="kicker">Segunda · C6</p>
    <h2>Guardar y que no pase nada</h2>
    <p>Hoy, si al pulsar Guardar ya tienes diez rutinas (el máximo, porque la décima se hizo en otra pestaña) o la rutina se borró en otra
    pestaña, el botón no hace nada y no dice por qué. El borrador no se pierde, pero no sabes qué hacer.</p>

    <div class="opcion">
      <h3><span class="letra">A</span>Una línea encima de Guardar<span class="reco">Recomendada</span></h3>
      <p>Dice qué ha pasado y qué puedes hacer, y la rutina sigue en pantalla.</p>
      <figure class="dos">
        <div class="m">${img(F.c6aM, 'Opción A: ya tienes 10 rutinas, el máximo')}</div>
        <div class="m">${img(F.c6aM2, 'Opción A: esta rutina se ha borrado en otra pestaña')}</div>
        <figcaption>Con el máximo, «Borra una para guardar esta». Si se borró en otra pestaña, «Guardarla como nueva» la guarda como una rutina nueva.</figcaption>
      </figure>
    </div>

    <div class="opcion">
      <h3><span class="letra">B</span>Una ventana</h3>
      <p>El mismo texto en una ventana que hay que cerrar con «Entendido». Se ve más, pero tapa la rutina justo cuando quieres arreglarla.</p>
      <figure class="solo">
        <div class="m">${img(F.c6bM, 'Opción B: No se ha podido guardar')}</div>
      </figure>
    </div>
  </section>

  <div class="respuesta">
    <p class="kicker" style="margin-bottom:8px">Tu respuesta</p>
    <p class="linea">U1 B · C6 A</p>
    <p>Es la recomendada. Contesta con tus letras, por ejemplo «U1 A · C6 A», o con lo que quieras cambiar de los textos.</p>
  </div>
</main>
`;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA + ': ' + Math.round(html.length / 1024) + ' KB');
})();
