// La página para que Ez elija lo que se ve del runner (B3, P5, P6, P8), con las fotos de la app real.
// Uso: node pagina.js <carpeta-de-fotos> <salida.html>, tras fotos.js.
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const sharp = require(R + '/node_modules/sharp');
const F = require('path').resolve(process.argv[2]) + '/';
const SALIDA = process.argv[3];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function webp(archivo, ancho) {
  const b = await sharp(F + archivo + '.png').resize({ width: ancho, withoutEnlargement: true }).webp({ quality: ancho > 600 ? 72 : 70 }).toBuffer();
  return 'data:image/webp;base64,' + b.toString('base64');
}
async function foto(base, w, alt) {
  const ancho = w === 360 ? 400 : 1000;
  const src = await webp(base + '_' + w, ancho);
  const meta = await sharp(F + base + '_' + w + '.png').metadata();
  const alto = Math.round(meta.height * ancho / meta.width);
  return '<img src="' + src + '" alt="' + esc(alt + (w === 360 ? ', en el móvil' : ', en el ordenador')) + '" loading="lazy" width="' + ancho + '" height="' + alto + '">';
}
async function par(base, pie, alt) {
  return '<figure class="par"><div class="m">' + await foto(base, 360, alt) + '</div><div class="d">' + await foto(base, 1280, alt) +
    '</div><figcaption>' + pie + '</figcaption></figure>';
}
async function movil(bases) {
  let h = '<div class="fila">';
  for (const [b, pie, alt] of bases) h += '<figure class="solo"><div class="m">' + await foto(b, 360, alt) + '</div><figcaption>' + pie + '</figcaption></figure>';
  return h + '</div>';
}
const opcion = (letra, titulo, texto, reco) => '<li class="opcion' + (reco ? ' reco' : '') + '"><span class="letra">' + letra +
  '</span><div><p class="otit">' + titulo + (reco ? ' <span class="pill">La que recomiendo</span>' : '') + '</p><p>' + texto + '</p></div></li>';

(async () => {
  const P = {};
  P.b3hoy = await par('b3-hoy', '<b>Hoy</b> · Espalda con banda, sin Auto: la flecha solo dice «Saltar este paso», y las 8 aperturas que hagas no cuentan', 'La apertura con banda hoy');
  P.b3a = await par('b3-a', '<b>B3 · A</b> · la flecha cuenta las reps («Hecho»); «Saltar este paso», junto al número, como el «+15 s»', 'La apertura con banda con Hecho en la flecha y Saltar este paso junto al número');
  P.b3b = await par('b3-b', '<b>B3 · B</b> · dos botones con texto en lugar del mando, solo en estos pasos', 'La apertura con banda con dos botones: Saltar este paso y Hecho');
  P.p5hoy = await par('p5-hoy', '<b>Hoy</b> · Empuje sencillo: la flecha no dice qué hace (aquí, terminar la serie antes)', 'Las flexiones hoy');
  P.p5a = await par('p5-a', '<b>P5 · A</b> · una palabra bajo cada botón; la de la flecha cambia con lo que hace', 'Las flexiones con Anterior, Pausar y Terminar serie bajo los botones');
  P.p5b = await par('p5-b', '<b>P5 · B</b> · lo dice la línea de abajo, en lugar de «Luego…»', 'Las flexiones con «› termina la serie» en la línea de abajo');
  P.p5c = await par('p5-c', '<b>P5 · C</b> · la flecha se hace píldora con su texto dentro', 'Las flexiones con la flecha convertida en Terminar serie');
  P.p5mas = await movil([
    ['p5-a-descanso', 'Con la A, en un descanso: «Saltar descanso»', 'El descanso con Saltar descanso bajo la flecha'],
    ['p5-a-lado', 'Con la A, en el primer lado: «Siguiente lado»', 'La sentadilla lateral con Siguiente lado bajo la flecha'],
  ]);
  P.p6serie = await movil([
    ['p6-hoy-serie', '<b>Hoy</b> · la primera serie dice «La primera vez, una serie basta»…', 'La primera serie de sentadilla a silla'],
    ['p6-hoy', '…y en el descanso ya viene la segunda; saltarla deja la rutina «no entera» (sin logros)', 'El descanso con la segunda serie anunciada'],
    ['p6-a', '<b>P6 · A</b> · en ese descanso, «Con una basta»', 'El descanso con el botón Con una basta'],
  ]);
  P.p8hoy = await par('p8-hoy', '<b>Hoy</b> · Core silencioso en pausa: la pantalla sigue diciendo «Levanta las piernas y aguanta»', 'El aguante en pausa hoy');
  P.p8a = await par('p8-a', '<b>P8 · A</b> · en el mismo sitio: «En pausa», qué hacer, y el número apagado', 'El aguante en pausa con En pausa y Suelta la postura');
  P.p8avuelta = await par('p8-a-vuelta', '<b>P8 · A</b>, al reanudar: 5 s de «Colócate» y luego lo que quedaba del aguante', 'Al reanudar: Colócate 5 y quedan 18 s');
  P.p8b = await par('p8-b', '<b>P8 · B</b> · un velo sobre el ejercicio con «Sesión en pausa»', 'El aguante en pausa con un velo y Descansa');

  const html = `<title>El runner, más claro</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · el runner de Mueve y Estira, más claro (B3, P5, P6 y P8 de las revisiones de ChatGPT del 28 oct. 2026):
     la página para que Ez elija (29 oct.). Fotos de la app real (index.html de la rama runner-claro) con cada opción
     pintada encima con CSS, sin montar. Guiones en docs/traspaso/archivos/runner-claro/. -->
<style>
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --focus: #3E5A3A; --reco-bg: #E3E6D8;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --reco-bg: #2a3025; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --reco-bg: #2a3025; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .marco { max-width: 1040px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(38px, 8vw, 54px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(28px, 6vw, 34px); line-height: 1.1; margin-bottom: 12px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  b { color: var(--ink); font-weight: 600; }
  .respuesta { margin: 26px 0 8px; border: 1px solid var(--cta); border-radius: 14px; padding: 16px 18px 6px; max-width: 44em; }
  .respuesta ol { list-style: none; padding: 0; margin: 0 0 10px; }
  .respuesta li { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 10px; padding: 7px 0; border-bottom: 1px dashed var(--line); }
  .respuesta li:last-child { border-bottom: 0; }
  .respuesta .n { font: italic 500 21px/1.2 var(--display); color: var(--cta); }
  section.decision { margin-top: 44px; padding-top: 32px; border-top: 1px solid var(--line); }
  .num-dec { font: italic 500 17px/1 var(--display); color: var(--cta); display: block; margin-bottom: 6px; }
  figure { margin: 18px 0; }
  .par { display: grid; grid-template-columns: minmax(0, 200px) minmax(0, 1fr); gap: 14px; align-items: start; }
  .fila { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr)); gap: 14px; }
  .fila figure { margin: 0; }
  img { display: block; width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--line); background: var(--paper-2); }
  figcaption { grid-column: 1 / -1; font-size: 14px; color: var(--ink-3); margin-top: 4px; }
  .fila figcaption { margin-top: 8px; }
  @media (max-width: 620px) { .par { grid-template-columns: minmax(0, 1fr); } .par .m { max-width: 260px; } }
  ul.opciones { list-style: none; padding: 0; margin: 18px 0 0; display: grid; gap: 10px; max-width: 46em; }
  .opcion { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 12px; padding: 14px 16px; border: 1px solid var(--line); border-radius: 12px; }
  .opcion.reco { background: var(--reco-bg); border-color: var(--cta); }
  .opcion p { margin: 0 0 6px; }
  .letra { font: italic 500 26px/1 var(--display); color: var(--cta); }
  .otit { color: var(--ink) !important; font-weight: 600; }
  .pill { display: inline-block; font: 600 11px/1 var(--ui); letter-spacing: .04em; color: var(--paper); background: var(--cta); border-radius: 999px; padding: 4px 8px; margin-left: 4px; vertical-align: 2px; }
  .nota { font-size: 14px; color: var(--ink-3); }
</style>
<div class="marco">
  <p class="kicker">Mueve y Estira · 29 oct. 2026 · para que elijas</p>
  <h1>El runner, más claro</h1>
  <p>Cuatro cosas de las revisiones de ChatGPT que cambian la pantalla de un ejercicio. Las fotos son de la app de verdad; las opciones van pintadas encima, todavía sin montar. Ya están arreglados, sin cambiar nada que se vea: la colocación que no salía («Silla sin ruedas»), el tiempo que contaba mientras esperabas a «›», «Auto» que avanzaba en pausa, los aguantes de Glúteos invisibles y la barra de 4·7·8.</p>
  <div class="respuesta">
    <p class="kicker" style="margin-top:2px">Lo que recomiendo, en una línea</p>
    <ol>
      <li><span class="n">B3 A</span><span>La flecha cuenta las reps de la banda y «Saltar este paso» va junto al número.</span></li>
      <li><span class="n">P5 A</span><span>Una palabra bajo cada botón: la de la flecha dice lo que hace.</span></li>
      <li><span class="n">P6 A</span><span>«Con una basta» en el descanso tras la primera serie, y la rutina cuenta entera.</span></li>
      <li><span class="n">P8 A</span><span>«En pausa» en el mismo sitio, y al volver 5 s para colocarte.</span></li>
    </ol>
    <p class="nota">Puedes contestar «B3 A, P5 A, P6 A, P8 A» o cambiar la letra que quieras.</p>
  </div>

  <section class="decision">
    <span class="num-dec">B3</span>
    <h2>Lo que haces con la banda no cuenta</h2>
    <p>Sin «Auto», un paso con banda (que se puede saltar) solo tiene «Saltar este paso». Si haces las 8 aperturas y pulsas la flecha, no cuentan: el cierre dice menos repeticiones de las que hiciste.</p>
    ${P.b3hoy}${P.b3a}${P.b3b}
    <ul class="opciones">
      ${opcion('A', 'La flecha cuenta, «Saltar este paso» al lado del número', 'Como en cualquier otro paso: la flecha es «Hecho» y suma las 8. Saltar, si no tienes banda, es la pastilla pequeña que ya usa el «+15 s». El mando no cambia de forma.', true)}
      ${opcion('B', 'Dos botones con texto en estos pasos', 'Muy claro, pero el pie cambia de forma solo aquí, y la regla del runner es que nada se mueva entre pasos.')}
    </ul>
  </section>

  <section class="decision">
    <span class="num-dec">P5</span>
    <h2>Que la flecha diga lo que hace</h2>
    <p>La flecha hace cosas distintas: empezar ya, terminar la serie, saltar el descanso, pasar al otro lado o terminar la rutina. Hoy solo lo dice un texto oculto que en el móvil no se ve.</p>
    ${P.p5hoy}${P.p5a}${P.p5mas}${P.p5b}${P.p5c}
    <ul class="opciones">
      ${opcion('A', 'Una palabra bajo cada botón', '«Anterior», «Pausar» y, bajo la flecha, lo que hace ahora: «Empezar ya», «Terminar serie», «Hecho», «Saltar descanso», «Siguiente lado», «Terminar». El mando sigue igual; gana una línea de letra pequeña.', true)}
      ${opcion('B', 'Lo dice la línea de abajo', 'No añade nada al mando, pero esa línea ya dice qué viene luego y se pierde la relación con el botón.')}
      ${opcion('C', 'La flecha con el texto dentro', 'Muy explícito, pero el botón cambia de ancho con cada texto y el mando deja de ser tres círculos iguales.')}
    </ul>
  </section>

  <section class="decision">
    <span class="num-dec">P6</span>
    <h2>«Con una serie basta», de verdad</h2>
    <p>En «Levántate y sube», la primera serie dice «La primera vez, una serie basta», pero luego viene la segunda, y si la saltas la rutina queda «no entera» y no da logros. Es la única rutina con esa frase.</p>
    ${P.p6serie}
    <ul class="opciones">
      ${opcion('A', '«Con una basta» en el descanso tras la primera serie', 'Salta las series que quedan de ese ejercicio y sigue con el siguiente. La rutina cuenta entera y el cierre dice las series que hiciste, sin inventar las otras. Va en la pastilla pequeña del «+15 s», solo en los descansos que separan dos series de lo mismo en las rutinas de «Para empezar».', true)}
      ${opcion('B', 'Elegirlo antes de empezar', '«Una serie de cada» o «Las dos», en la vista previa. Más limpio durante la rutina, pero la vista previa la está tocando la sesión de «Tus rutinas» y tendría que esperar a que acabe.')}
      ${opcion('C', 'Solo quitar la frase', 'Lo más pequeño: sin la frase, no hay promesa que cumplir. Pero quien empieza pierde ese permiso.')}
    </ul>
  </section>

  <section class="decision">
    <span class="num-dec">P8</span>
    <h2>Que la pausa se vea como pausa</h2>
    <p>Al pausar, el ejercicio sigue diciendo «Levanta las piernas y aguanta». Solo cambia el botón del centro. Y al volver, la cuenta sigue en el acto, aunque ya hayas soltado la postura.</p>
    ${P.p8hoy}${P.p8a}${P.p8avuelta}${P.p8b}
    <ul class="opciones">
      ${opcion('A', '«En pausa» en el mismo sitio, y 5 s para colocarte al volver', 'Arriba «En pausa»; la instrucción pasa a «Suelta la postura. Al volver, unos segundos para colocarte y sigues donde lo dejaste»; el número se apaga. Al reanudar un ejercicio (no un descanso), 5 s de «Colócate» y luego lo que quedaba. Nada se mueve de sitio.', true)}
      ${opcion('B', 'Un velo con «Sesión en pausa»', 'Imposible no verlo, pero tapa el dibujo justo cuando lo miras para recordar la postura, y al volver cuenta 3, 2, 1 sobre lo que quedaba.')}
    </ul>
  </section>
</div>
`;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA, Math.round(html.length / 1024) + ' KB');
})();
