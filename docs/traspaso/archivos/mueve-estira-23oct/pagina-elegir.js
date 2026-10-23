// La página para que Ez elija cómo quedan Mueve y Estira, con las fotos de la app real.
// Uso: node pagina-elegir.js <salida.html>, tras fotos.js.
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const sharp = require(R + '/node_modules/sharp');
const F = __dirname + '/fotos/';
const SALIDA = process.argv[2];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function foto(nombre, ancho, q) {
  const b = await sharp(F + nombre + '.png').resize({ width: ancho }).webp({ quality: q }).toBuffer();
  return 'data:image/webp;base64,' + b.toString('base64');
}

/* Las 63 fichas: la columna de ChatGPT «Corrección o aclaración del texto», tal cual. */
function fichas() {
  const md = fs.readFileSync(R + '/docs/proposals/mueve-estira-chatgpt-respuesta-23oct.md', 'utf8');
  const tercera = md.slice(md.indexOf('## Tercera respuesta'));
  const filas = [];
  for (const l of tercera.split('\n')) {
    const m = l.match(/^\| \*\*(\d+) · ([^*]+)\*\* \| ([^|]+) \|.*\| ([^|]+) \|$/);
    if (m) filas.push({ n: +m[1], nombre: m[2].trim(), capa: m[3].trim(), texto: m[4].trim() });
  }
  if (filas.length !== 63) throw new Error('fichas: ' + filas.length);
  const md2html = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>');
  return filas.map((f) => '<tr><td class="num">' + f.n + '</td><td>' + esc(f.nombre) + '<span class="capa">' + md2html(f.capa) +
    '</span></td><td>' + md2html(f.texto) + '</td></tr>').join('');
}

const fig = (src, pie, alt) => '<figure><img src="' + src + '" alt="' + esc(alt || pie) + '" loading="lazy"><figcaption>' + pie + '</figcaption></figure>';
const opcion = (letra, titulo, texto, recomendada) => '<li class="opcion' + (recomendada ? ' reco' : '') + '"><span class="letra">' + letra +
  '</span><div><p class="otit">' + titulo + (recomendada ? ' <span class="pill">Recomendada</span>' : '') + '</p><p>' + texto + '</p></div></li>';

(async () => {
  const P = {};
  for (const n of ['d1-hoy-runner', 'd1-a-runner', 'd2-hoy-mueve', 'd2-a-mueve', 'd2-hoy-estira', 'd2-a-estira', 'd2-a-hoja', 'd2-a-runner', 'd3-hoja', 'd3-runner']) P[n] = await foto(n, 540, 72);
  for (const n of ['d2-hoy-mueve-entera', 'd2-a-mueve-entera', 'd2-b-mueve-entera', 'd2-hoy-estira-entera', 'd2-a-estira-entera', 'd2-b-estira-entera']) P[n] = await foto(n, 310, 68);

  const html = `<title>Ordenar Mueve y Estira</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · Mueve y Estira: la página para que Ez elija (23 oct. 2026).
     Las fotos son de la app real (index.html de v0.175.1) con la propuesta metida por dentro antes de montarse:
     scripts en docs/traspaso/archivos/mueve-estira-23oct/ (propuesta.js, fotos.js, pagina-elegir.js). -->
<style>
  /* Página de decisión: una columna de lectura; cada decisión, sus fotos en pareja y sus opciones debajo. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --line-2: #B8AD8E; --cta: #50624D; --focus: #3E5A3A; --move: #9A7B4F; --extra: #6B7A8F;
    --reco-bg: #E3E6D8;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --line-2: #5f5544; --cta: #8E9D88; --focus: #A3BC96; --move: #C29F6E; --extra: #95A4BA; --reco-bg: #2a3025; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --line-2: #5f5544; --cta: #8E9D88; --focus: #A3BC96; --move: #C29F6E; --extra: #95A4BA; --reco-bg: #2a3025; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .banda { background: var(--focus); color: var(--paper); font: 500 12px/1.5 var(--ui); letter-spacing: .04em; text-align: center;
    padding-block: 10px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .marco { max-width: 980px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2, h3 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(38px, 8vw, 54px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(29px, 6vw, 36px); line-height: 1.1; margin-bottom: 12px; }
  h3 { font-size: 22px; line-height: 1.2; margin: 26px 0 8px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 40em; }
  .lede { font-size: 17.5px; }
  b { color: var(--ink); font-weight: 600; }
  .respuesta { margin: 26px 0 8px; border: 1px solid var(--cta); border-radius: 14px; padding: 18px 18px 8px; background: var(--paper); max-width: 40em; }
  .respuesta ol { list-style: none; padding: 0; margin: 0 0 10px; display: grid; gap: 6px; }
  .respuesta li { display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; gap: 10px; align-items: baseline; padding: 6px 0; border-bottom: 1px dashed var(--line); }
  .respuesta li:last-child { border-bottom: 0; }
  .respuesta .n { font: italic 500 22px/1 var(--display); color: var(--cta); }
  .respuesta .rl { font: 600 13px/1 var(--ui); color: var(--cta); white-space: nowrap; }
  .linea { font: italic 500 22px/1.3 var(--display); color: var(--ink); }
  section.decision { margin-top: 44px; padding-top: 34px; border-top: 1px solid var(--line); }
  .num-dec { font: italic 500 17px/1 var(--display); color: var(--cta); display: block; margin-bottom: 6px; }
  .fotos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 18px 0 10px; max-width: 640px; }
  .fotos.tres { grid-template-columns: repeat(3, minmax(0, 1fr)); max-width: 980px; align-items: start; }
  figure { margin: 0; min-width: 0; }
  figure img { display: block; width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--line); background: var(--paper-2); }
  figcaption { font: 500 12px/1.4 var(--ui); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); margin-top: 8px; }
  figcaption b { color: var(--cta); }
  .opciones { list-style: none; padding: 0; margin: 18px 0 6px; display: grid; gap: 10px; max-width: 46em; }
  .opcion { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 12px; align-items: start; padding: 14px 16px 6px; border: 1px solid var(--line); border-radius: 12px; }
  .opcion.reco { border-color: var(--cta); background: var(--reco-bg); }
  .letra { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--cta); display: grid; place-items: center; font: italic 500 21px/1 var(--display); color: var(--cta); }
  .opcion.reco .letra { background: var(--cta); color: var(--paper); }
  .otit { font: italic 500 21px/1.35 var(--display); color: var(--ink); margin: 2px 0 6px; }
  .pill { font: 600 10.5px/1 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--cta); border: 1px solid var(--cta); border-radius: 999px; padding: 4px 8px; display: inline-block; vertical-align: 4px; margin: 2px 0 2px 4px; font-style: normal; white-space: nowrap; }
  .tabla { overflow-x: auto; margin: 10px 0 14px; max-width: 100%; }
  table { border-collapse: collapse; font-size: 14.5px; min-width: 520px; width: 100%; }
  th { text-align: left; font: 600 11px/1.3 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); padding: 8px 10px 6px 0; border-bottom: 1px solid var(--line-2); }
  td { padding: 8px 10px 8px 0; border-bottom: 1px dashed var(--line); vertical-align: top; color: var(--ink-2); }
  td.num { font-variant-numeric: tabular-nums; color: var(--ink-3); width: 30px; }
  td .capa { display: block; font-size: 12.5px; color: var(--ink-3); }
  td.nuevo { color: var(--ink); font-weight: 500; }
  details { margin: 10px 0; border-top: 1px dashed var(--line); padding-top: 10px; max-width: 980px; }
  summary { cursor: pointer; font: italic 500 20px/1.3 var(--display); color: var(--ink); list-style: none; display: flex; gap: 12px; align-items: baseline; }
  summary::-webkit-details-marker { display: none; }
  summary::before { content: '+'; flex: 0 0 14px; font: 400 20px/1 var(--ui); color: var(--cta); }
  details[open] > summary::before { content: '–'; }
  summary:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; border-radius: 4px; }
  .nota { font-size: 14px; color: var(--ink-3); }
  .grupos { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 8px 28px; margin: 10px 0; }
  .grupos div { min-width: 0; }
  .grupos h4 { font: 600 11px/1.4 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); margin: 10px 0 4px; }
  .grupos ul { margin: 0; padding-left: 18px; color: var(--ink-2); font-size: 14.5px; }
  .seis { list-style: none; padding: 0; margin: 12px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px 26px; max-width: 980px; }
  .seis li { border-left: 2px solid var(--move); padding: 2px 0 2px 12px; min-width: 0; }
  .seis li.estira { border-left-color: var(--extra); }
  .seis .t { font: italic 500 19px/1.25 var(--display); color: var(--ink); display: block; }
  .seis .d { font-size: 14px; color: var(--ink-2); }
  .despues { list-style: none; padding: 0; margin: 12px 0 0; counter-reset: paso; display: grid; gap: 12px; max-width: 42em; }
  .despues li { counter-increment: paso; display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 10px; color: var(--ink-2); }
  .despues li::before { content: counter(paso); font: italic 500 22px/1.2 var(--display); color: var(--cta); }
  @media (max-width: 520px) {
    .fotos.tres { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    figcaption { font-size: 10.5px; }
    .opcion { grid-template-columns: 30px minmax(0, 1fr); padding: 12px 12px 4px; }
    .letra { width: 28px; height: 28px; font-size: 18px; }
  }
</style>

<div class="banda">MAQUETA · Las fotos son de la app de verdad, con la propuesta metida dentro. Nada de esto está todavía en PACE.</div>
<main class="marco">
  <p class="kicker">PACE · Mueve y Estira · 23 de octubre</p>
  <h1>Ordenar Mueve y Estira</h1>
  <p class="lede">ChatGPT revisó las 63 fichas de ejercicio leyendo su texto de verdad, y lo comprobé en el código. Tres textos que decían otra cosa ya están arreglados en la app (v0.175.1). Quedan <b>cuatro decisiones</b>. En cada una, la recomendada va primero y con fotos de cómo queda en el móvil.</p>

  <div class="respuesta">
    <p class="kicker">Tu respuesta</p>
    <ol>
      <li><span class="n">1</span><span>Los nombres y textos que no dicen lo que enseñan</span><span class="rl">A</span></li>
      <li><span class="n">2</span><span>Cómo se ordenan las dos bibliotecas</span><span class="rl">A</span></li>
      <li><span class="n">3</span><span>Los ejercicios nuevos que hacen falta</span><span class="rl">A</span></li>
      <li><span class="n">4</span><span>Qué es gratis y qué es de pago</span><span class="rl">A</span></li>
    </ol>
    <p>Basta con una línea, por ejemplo: <span class="linea">1A 2A 3A 4A</span></p>
  </div>

  <section class="decision" id="d1">
    <span class="num-dec">Decisión 1</span>
    <h2>Los nombres y textos que no dicen lo que enseñan</h2>
    <p>Seis ejercicios se llaman de una forma y enseñan otra cosa, y en tres la cuenta no casa con el movimiento. Además, ChatGPT marca unos cuarenta avisos que conviene aclarar: no tirar de la cabeza, mesa que no se mueva, empezar alto en la pared… El dibujo no cambia y lo que tengas guardado sigue funcionando.</p>
    <div class="fotos">
      ${fig(P['d1-hoy-runner'], 'Hoy · 60 segundos', 'Pantalla de ejercicio hoy: Círculos de hombro, 60 segundos')}
      ${fig(P['d1-a-runner'], '<b>Con A</b> · 8 veces, 4 y 4', 'Pantalla de ejercicio con A: Círculos de brazos, 1 de 8')}
    </div>
    <div class="tabla"><table>
      <thead><tr><th>Hoy</th><th>Con A</th><th>Por qué</th></tr></thead>
      <tbody>
        <tr><td>Círculos de hombro</td><td class="nuevo">Círculos de brazos</td><td>El texto y el dibujo son el brazo estirado dibujando círculos.</td></tr>
        <tr><td>Inclinación lateral</td><td class="nuevo">Inclinación de cuello</td><td>Es de cuello, también en «Columna en la silla», que la contaba como columna.</td></tr>
        <tr><td>Hueco en silla</td><td class="nuevo">Piernas elevadas sentado</td><td>Es levantar las piernas sentado, no un hueco abdominal.</td></tr>
        <tr><td>Puente isquio a una pierna</td><td class="nuevo">Puente a una pierna</td><td>El texto no dice dónde va el talón, que es lo que lo haría «de isquio».</td></tr>
        <tr><td>Palmas al suelo</td><td class="nuevo">Palmas en la mesa</td><td>Se hace de pie, con las manos en la mesa.</td></tr>
        <tr><td>Apertura de costillas + respiración</td><td class="nuevo">Respirar a cuatro apoyos</td><td>Es respirar a cuatro patas, sin abrir los brazos.</td></tr>
        <tr><td>Rana · 70 s quieta</td><td class="nuevo">Balanceo suave, 8 veces</td><td>El texto es un balanceo, no una postura quieta.</td></tr>
        <tr><td>Rotación lenta · 25 s por lado</td><td class="nuevo">3 por lado, 2 s arriba</td><td>Es girar y volver, no 25 segundos mirando al lado.</td></tr>
        <tr><td>Círculos de muñeca · 10 y 10 en 20 s</td><td class="nuevo">4 por sentido, despacio</td><td>Diez por sentido no caben en 20 s si se hacen despacio.</td></tr>
      </tbody>
    </table></div>
    <details><summary>Los avisos de las 63 fichas, una línea cada una</summary>
      <p class="nota">Lo que ChatGPT corrige o aclara de cada ficha, tal cual lo escribió. Debajo del nombre, dónde la pondría y lo difícil que es (1 fácil, 3 exigente). Con A, se escriben en español y en inglés.</p>
      <div class="tabla"><table><thead><tr><th></th><th>Ejercicio</th><th>Qué corrige</th></tr></thead><tbody>${fichas()}</tbody></table></div>
    </details>
    <ol class="opciones">
      ${opcion('A', 'Todo de una vez, ya', 'Los seis nombres, las tres cuentas y los cuarenta avisos, en español y en inglés, en una versión pequeña. No cambia qué rutinas hay ni ningún dibujo.', true)}
      ${opcion('B', 'Solo nombres y cuentas', 'Los seis nombres y las tres cuentas ahora. Los avisos, más tarde, con la decisión 2.')}
      ${opcion('C', 'Nada suelto', 'Todo junto con la decisión 2, en la misma versión.')}
    </ol>
  </section>

  <section class="decision" id="d2">
    <span class="num-dec">Decisión 2</span>
    <h2>Cómo se ordenan las dos bibliotecas</h2>
    <p>Lo que viste en tu móvil: estiramientos dentro de Mueve, la banda y la barra mezcladas con lo de escritorio y rutinas con títulos distintos y casi los mismos ejercicios. La propuesta las ordena en tres capas: <b>«Para empezar»</b> arriba, con pausas de 2 a 3 minutos y pocas repeticiones; debajo, el resto; y al final <b>«Para ir a más»</b>, lo exigente. «Para ahora», las dos que te encajan en este momento, sigue encima de todo, como hoy.</p>
    <div class="fotos">
      ${fig(P['d2-hoy-mueve'], 'Mueve · hoy', 'Biblioteca de Mueve hoy')}
      ${fig(P['d2-a-mueve'], '<b>Mueve · con A</b>', 'Biblioteca de Mueve con A: Para empezar arriba')}
      ${fig(P['d2-hoy-estira'], 'Estira · hoy', 'Biblioteca de Estira hoy')}
      ${fig(P['d2-a-estira'], '<b>Estira · con A</b>', 'Biblioteca de Estira con A: Para empezar arriba')}
    </div>
    <h3>Una pausa de «Para empezar», por dentro</h3>
    <p>«Levántate y sube»: sentarte del todo y levantarte, 2 series de 5, y subir talones, 2 de 6. La primera vez, con una serie basta.</p>
    <div class="fotos">
      ${fig(P['d2-a-hoja'], '<b>Con A</b> · antes de empezar', 'Hoja Antes de empezar de Levántate y sube')}
      ${fig(P['d2-a-runner'], '<b>Con A</b> · el ejercicio', 'Pantalla de ejercicio: Sentadilla a silla, 1 de 5')}
    </div>
    <details><summary>Las listas enteras: hoy, con A y con B</summary>
      <p class="nota">Las tres, de arriba abajo y tal como salen en el móvil. Con B, «Para empezar» se añade encima y todo lo de hoy sigue debajo, así que hay dos de cuello, dos de muñecas y dos de hombros casi iguales.</p>
      <div class="fotos tres">
        ${fig(P['d2-hoy-mueve-entera'], 'Mueve · hoy', 'Lista entera de Mueve hoy')}
        ${fig(P['d2-a-mueve-entera'], '<b>Mueve · A</b>', 'Lista entera de Mueve con A')}
        ${fig(P['d2-b-mueve-entera'], 'Mueve · B', 'Lista entera de Mueve con B')}
      </div>
      <div class="fotos tres">
        ${fig(P['d2-hoy-estira-entera'], 'Estira · hoy', 'Lista entera de Estira hoy')}
        ${fig(P['d2-a-estira-entera'], '<b>Estira · A</b>', 'Lista entera de Estira con A')}
        ${fig(P['d2-b-estira-entera'], 'Estira · B', 'Lista entera de Estira con B')}
      </div>
    </details>
    <details><summary>Con A, rutina por rutina</summary>
      <div class="grupos">
        <div><h4>Mueve · Para empezar</h4><ul>
          <li>«Sentadillas de silla» pasa a ser <b>Levántate y sube</b></li>
          <li>«Flexiones de escritorio», <b>Empuje sencillo</b> (2 de 5, contra la mesa o la pared)</li>
          <li>«Piernas de pie», <b>Piernas sin pasos</b> (puntas y la silla en la pared, alta)</li>
          <li><b>Fuerza en suelo</b>, nueva: el puente con los dos pies y un gateo corto</li></ul></div>
        <div><h4>Mueve · el resto</h4><ul>
          <li>Sigilo: Gemelos subrepticios, Glúteos invisibles, Core silencioso</li>
          <li>Con material: <b>Espalda con banda</b> (nueva) y Colgarse</li>
          <li>Para ir a más: Empuje · progresión, Fondos en silla, Sentadilla en pared, Piernas · a una, Core · plancha</li>
          <li>Pasan a Estira: Postura reset, «Grip + antebrazos» (que se llama <b>Manos y antebrazos</b>) y Espalda de oficina, sin la banda</li></ul></div>
        <div><h4>Estira · Para empezar</h4><ul>
          <li>«Cuello» pasa a ser <b>Cuello suave</b></li>
          <li>«Hombros · círculos», <b>Brazos libres</b></li>
          <li>«Muñecas y manos», <b>Manos y muñecas</b></li>
          <li>«Columna en la silla», <b>Tronco sentado</b></li>
          <li>«Cadena posterior de pie», <b>Piernas en pausa</b></li>
          <li>«Despertar matinal», <b>Movilidad en suelo</b></li></ul></div>
        <div><h4>Estira · el resto</h4><ul>
          <li>Oficina: Escritorio express, Antídoto silla, Postura reset, Manos y antebrazos</li>
          <li>Hombros y columna: Hombros (sin banda ni barra), Espalda de oficina, Espalda de pie, Columna · ondas</li>
          <li>Caderas y piernas: Caderas de pie, Caderas, Cadena posterior</li>
          <li>Para ir a más: Estiramiento del sofá, Caderas · suelo</li>
          <li>Dejan de salir en la lista: ATG · Rodillas profundas y Ancestral. Siguen en tu historial y sus ejercicios, en «Tus rutinas»</li></ul></div>
      </div>
      <p class="nota">El puente sale de Estira y va a Mueve, porque es fuerza. Los cuatro ejercicios que no se sabe bien qué son (sentadilla de cuádriceps, puente torácico, onda espinal y marcha del elefante) salen de sus rutinas hasta tener texto y dibujo claros. Las rutinas que cambian de nombre guardan su sitio por dentro, así que el historial, los logros y «Continúa» las siguen reconociendo. Los nombres nuevos son de ChatGPT y se pueden cambiar.</p>
    </details>
    <ol class="opciones">
      ${opcion('A', 'Tres capas, con lo de hoy ordenado', 'Las diez pausas de «Para empezar» (4 en Mueve y 6 en Estira) se hacen con ejercicios que ya existen, rehaciendo las rutinas de hoy que se parecen: así no quedan dos casi iguales. Son las que te propone «A tu ritmo». Lo que es estirar pasa a Estira; la banda y la barra, a «Con material», y se pueden saltar sin perder la rutina. Lo exigente baja a «Para ir a más» y solo sale si lo eliges. Ningún ejercicio se borra.', true)}
      ${opcion('B', 'Solo añadir las diez arriba', 'Las diez pausas se añaden encima y lo de hoy se queda como está. Es más rápido, pero siguen los estiramientos dentro de Mueve, la banda mezclada y las rutinas que se pisan, ahora con más parecidas.')}
    </ol>
  </section>

  <section class="decision" id="d3">
    <span class="num-dec">Decisión 3</span>
    <h2>Los ejercicios nuevos que hacen falta</h2>
    <p>ChatGPT retiró su lista de 22: con los textos de verdad, la mayoría ya existe en otra forma. Quedan seis que cubren un hueco real. Cada uno necesita un dibujo tuyo; mientras no esté, sale el dibujo del módulo, como en la foto.</p>
    <ul class="seis">
      <li><span class="t">Remo con banda</span><span class="d">Tirar hacia ti con la banda pisada. Hoy no hay ningún ejercicio de tirar con resistencia. Va en «Espalda con banda».</span></li>
      <li><span class="t">Remo con tu mano</span><span class="d">El mismo gesto, frenando con la otra mano: lo que hace quien no tiene banda.</span></li>
      <li><span class="t">Bisagra de cadera</span><span class="d">Llevar la cadera atrás de pie, sin que sea una sentadilla. Para Mueve.</span></li>
      <li><span class="t">Desliza el talón</span><span class="d">Tumbado, alejar un talón con la pelvis quieta. La entrada a los abdominales.</span></li>
      <li class="estira"><span class="t">Inclinación de tronco</span><span class="d">De pie, inclinarse a un lado. Hoy el único «lateral» es de cuello. Para Estira.</span></li>
      <li class="estira"><span class="t">Gemelo en pared</span><span class="d">Estirar la pantorrilla con las manos en la pared. Para Estira.</span></li>
    </ul>
    <div class="fotos">
      ${fig(P['d3-hoja'], '<b>Con A</b> · antes de empezar', 'Hoja Antes de empezar de Espalda con banda')}
      ${fig(P['d3-runner'], '<b>Con A</b> · sin dibujo todavía', 'Pantalla de ejercicio: Remo con banda con el dibujo del módulo')}
    </div>
    <p><b>Abdominales</b>, que los pediste: con esto son la plancha con las rodillas apoyadas, «Desliza el talón» y, para ir a más, la plancha lateral y el hueco. ChatGPT no pone los encogimientos de toda la vida. Si los quieres, dilo junto a tu respuesta y entran como séptimo.</p>
    <p class="nota">Los dibujos que marcaste porque no casan (Core silencioso, Rodar hacia abajo, Gato-camello, 90/90, Puente torácico, Sentadilla de cuádriceps y Sentarse y levantarse del suelo) se rehacen elijas lo que elijas. Te paso los prompts de todos juntos.</p>
    <ol class="opciones">
      ${opcion('A', 'Los seis', 'Seis dibujos tuyos. «Espalda con banda» tiene alternativa de fuerza para quien no tiene banda.', true)}
      ${opcion('B', 'Cinco, sin «Remo con tu mano»', 'Sin banda, esa rutina solo puede saltarse entera, o cambiarse por juntar omóplatos, que no es fuerza.')}
      ${opcion('C', 'Ninguno por ahora', 'Primero se ordena lo que hay. Mueve sigue sin ningún ejercicio de tirar.')}
    </ol>
  </section>

  <section class="decision" id="d4">
    <span class="num-dec">Decisión 4</span>
    <h2>Qué es gratis y qué es de pago</h2>
    <p>Hoy son 21 rutinas gratis y 12 de pago. /premium promete que <b>lo que hoy es gratis sigue gratis</b>, así que eso no se toca. Lo que hay que decidir es lo nuevo. La dificultad y el precio van aparte: hay rutinas exigentes gratis, como «Fondos en silla», y suaves de pago.</p>
    <div class="tabla"><table>
      <thead><tr><th>Qué</th><th>Con A</th><th>Con B</th></tr></thead>
      <tbody>
        <tr><td>Lo que hoy es gratis</td><td>Gratis</td><td>Gratis</td></tr>
        <tr><td>Las diez de «Para empezar»</td><td class="nuevo">Gratis, también «Fuerza en suelo», que es nueva</td><td>Gratis las nueve rehechas; «Fuerza en suelo», de pago</td></tr>
        <tr><td>«Espalda con banda», nueva</td><td>De pago</td><td>De pago</td></tr>
        <tr><td>Lo que hoy es de pago</td><td>De pago</td><td>De pago</td></tr>
        <tr><td>Que las rutinas cambien de un día a otro</td><td>De pago (ya lo decidiste)</td><td>De pago</td></tr>
        <tr><td>«Tus rutinas», con todos los ejercicios</td><td>De pago (abierto hasta v1)</td><td>De pago</td></tr>
      </tbody>
    </table></div>
    <ol class="opciones">
      ${opcion('A', '«Para empezar», entera gratis', 'Las diez son el día de «A tu ritmo» sin pagar: cuerpo entero, con suelo incluido. Lo nuevo de pago es «Espalda con banda».', true)}
      ${opcion('B', 'Todo lo nuevo, de pago', '«Fuerza en suelo» y «Espalda con banda», de pago. Gratis, en Mueve, quedan tres pausas de «Para empezar».')}
    </ol>
  </section>

  <section class="decision" id="despues">
    <h2>Lo que pasa cuando contestes</h2>
    <ol class="despues">
      <li><span>Con la 1, una versión pequeña con los nombres, las cuentas y los avisos, en una sesión aparte. Te enseño el antes y el después antes de juntarla.</span></li>
      <li><span>Con la 2 y la 4, otra sesión monta las capas. Con esto se rehacen también los 31 ejercicios de «Ver ejercicio» en las pausas y lo que propone «A tu ritmo». Fotos antes de juntar.</span></li>
      <li><span>Con la 3, te paso los prompts de los dibujos. Cada ejercicio nuevo entra cuando llegue el suyo.</span></li>
    </ol>
  </section>
</main>
`;
  fs.writeFileSync(SALIDA, html);
  console.log('escrita', SALIDA, Math.round(html.length / 1024) + ' KB');
})().catch((e) => { console.error(e); process.exit(1); });
