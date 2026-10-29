// La página de fotos del runner ya montado (B3, P5, P6 y P8, lo que eligió Ez el 29 oct. 2026).
// Uso: node montado-pagina.js <carpeta-de-fotos> <salida.html>, tras montado.js.
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const sharp = require(R + '/node_modules/sharp');
const F = require('path').resolve(process.argv[2]) + '/';
const SALIDA = process.argv[3];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function webp(archivo, ancho) {
  const b = await sharp(F + archivo + '.png').resize({ width: ancho, withoutEnlargement: true }).webp({ quality: ancho > 600 ? 70 : 68 }).toBuffer();
  return 'data:image/webp;base64,' + b.toString('base64');
}
async function foto(base, w, alt) {
  const ancho = w === 360 ? 380 : 960;
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
const duda = (titulo, texto) => '<div class="duda"><p class="otit">' + titulo + '</p><p>' + texto + '</p></div>';

(async () => {
  const P = {};
  P.b3 = await par('b3', 'Espalda con banda, sin Auto: la flecha es «Hecho» y cuenta las 8 aperturas; «Saltar este paso», junto al número', 'La apertura con banda con Hecho bajo la flecha y Saltar este paso junto al número');
  P.p5 = await par('p5', 'Empuje sencillo con Auto: «Anterior», «Pausar» y «Terminar serie»', 'Las flexiones con Anterior, Pausar y Terminar serie bajo los botones');
  P.p5mas = await movil([
    ['p5-colocarse', 'Al colocarse: «Empezar ya»', 'La colocación con Empezar ya bajo la flecha'],
    ['p5-descanso', 'En un descanso: «Saltar descanso»', 'El descanso con Saltar descanso bajo la flecha'],
    ['p5-lado', 'En el primer lado: «Siguiente lado»', 'La sentadilla lateral con Siguiente lado bajo la flecha'],
    ['p5-aguante', 'En un paso con reloj: «Siguiente»', 'Un aguante con Siguiente bajo la flecha'],
    ['p5-ultimo', 'En el último paso: «Terminar»', 'El último aguante con Terminar bajo la flecha'],
  ]);
  P.p5otra = await movil([['p5-aguante-hecho', 'Pintada, no montada: «Hecho» también en los pasos con reloj', 'Un aguante con Hecho bajo la flecha']]);
  P.p6 = await par('p6', 'Levántate y sube, en el descanso tras la primera serie: «Con una basta», centrada bajo «SEGUNDOS»', 'El descanso con Con una basta bajo SEGUNDOS');
  P.p6mas = await movil([
    ['p6-serie', 'En la serie, el hueco de la pastilla ya está (vacío): por eso nada se mueve al llegar al descanso', 'La primera serie de sentadilla a silla'],
    ['p6-talones', 'Al pulsarla: la segunda serie se salta y sigues con los talones', 'La colocación de la elevación de talones'],
    ['p6-cierre', 'Con una de cada: el cierre dice 2 series y 11 reps, y la rutina cuenta entera', 'El cierre con 2 series y 11 reps'],
  ]);
  P.p6otra = await movil([['p6-cuadrada', 'Pintada, no montada: «cuadrada» leído como esquinas rectas', 'Con una basta con esquinas rectas']]);
  P.p8 = await par('p8', 'Core silencioso a mitad del aguante, en pausa: el círculo y su arco a la vista; debajo, la pausa', 'El aguante en pausa con Sesión en pausa y Descansa');
  P.p8vuelta = await par('p8-3', 'Al reanudar: 3, 2, 1 con sus maderas, y luego sigue lo que quedaba (el botón del centro vuelve a pausar)', 'Al reanudar, Sigues en 3');
  P.p8otra = await par('p8-otra', 'Pintada, no montada: el velo translúcido sobre todo, con la bola a través', 'El velo translúcido sobre el dibujo y el texto');

  const html = `<title>El runner, montado</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · el runner de Mueve y Estira, ya montado (B3, P5, P6 y P8 de la maqueta del 29 oct. 2026): fotos
     de la app real (index.html de la rama runner-claro) para que Ez lo mire antes de juntar. Guiones en
     docs/traspaso/archivos/runner-claro/ (montado.js y montado-pagina.js). -->
<style>
  /* Una columna de lectura con las fotos en pares (móvil y ordenador), como la maqueta que eligió Ez. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --reco-bg: #E3E6D8; --duda-bg: #EFE6D6;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --reco-bg: #2a3025; --duda-bg: #2c261c; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --reco-bg: #2a3025; --duda-bg: #2c261c; color-scheme: dark; }
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
  .resumen { margin: 26px 0 8px; border: 1px solid var(--cta); border-radius: 14px; padding: 16px 18px 6px; max-width: 46em; }
  .resumen ol { list-style: none; padding: 0; margin: 0 0 10px; }
  .resumen li { display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 10px; padding: 7px 0; border-bottom: 1px dashed var(--line); }
  .resumen li:last-child { border-bottom: 0; }
  .resumen .n { font: italic 500 21px/1.2 var(--display); color: var(--cta); }
  section.caso { margin-top: 44px; padding-top: 32px; border-top: 1px solid var(--line); }
  .num-caso { font: italic 500 17px/1 var(--display); color: var(--cta); display: block; margin-bottom: 6px; }
  figure { margin: 18px 0; }
  .par { display: grid; grid-template-columns: minmax(0, 200px) minmax(0, 1fr); gap: 14px; align-items: start; }
  .fila { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr)); gap: 14px; margin: 18px 0; }
  .fila figure { margin: 0; }
  img { display: block; width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--line); background: var(--paper-2); }
  figcaption { grid-column: 1 / -1; font-size: 14px; color: var(--ink-3); margin-top: 4px; }
  .fila figcaption { margin-top: 8px; }
  @media (max-width: 620px) { .par { grid-template-columns: minmax(0, 1fr); } .par .m { max-width: 260px; } }
  .duda { margin: 22px 0 6px; padding: 14px 16px 4px; border-radius: 12px; background: var(--duda-bg); max-width: 46em; }
  .duda p { margin: 0 0 10px; }
  .otit { color: var(--ink) !important; font-weight: 600; }
  .nota { font-size: 14px; color: var(--ink-3); }
</style>
<div class="marco">
  <p class="kicker">Mueve y Estira · 29 oct. 2026 · ya montado</p>
  <h1>El runner, montado</h1>
  <p>Lo que elegiste en la maqueta, ya en la app. Las fotos son de la app de verdad, en el móvil (360 px) y en el ordenador (1280 px). Está en la rama del runner, todavía sin juntar: la coordinadora lo junta cuando digas «júntalo».</p>
  <div class="resumen">
    <p class="kicker" style="margin-top:2px">Lo que hay montado</p>
    <ol>
      <li><span class="n">B3 A</span><span>En el paso con banda, la flecha cuenta lo que haces y «Saltar este paso» va junto al número.</span></li>
      <li><span class="n">P5 A</span><span>Una palabra bajo cada botón del mando; la de la flecha dice lo que hace en ese momento.</span></li>
      <li><span class="n">P6 A</span><span>«Con una basta» en el descanso entre dos series, centrada bajo «SEGUNDOS», y la rutina cuenta entera.</span></li>
      <li><span class="n">P8 B</span><span>Al pausar, «Sesión en pausa» debajo del círculo, que se sigue viendo; al volver, 3, 2, 1.</span></li>
    </ol>
    <p class="nota">Donde tu retoque se podía leer de dos formas, la otra va pintada en su apartado, sin montar. Si prefieres esa, dilo.</p>
  </div>

  <section class="caso">
    <span class="num-caso">B3 · A</span>
    <h2>Lo que haces con la banda cuenta</h2>
    <p>Sin «Auto», la flecha da las 8 aperturas por hechas, como en cualquier otro paso, y el cierre las cuenta. Si no tienes banda, «Saltar este paso» es la pastilla pequeña de al lado del número, como el «+15 s», y la rutina sigue contando entera. El mando no cambia de forma.</p>
    ${P.b3}
  </section>

  <section class="caso">
    <span class="num-caso">P5 · A</span>
    <h2>Cada botón dice lo que hace</h2>
    <p>Debajo de cada botón, su palabra: «Anterior», «Pausar» (o «Reanudar») y, bajo la flecha, lo que hace ahora. La línea de las palabras está siempre, así que cambiar de palabra no mueve nada. En inglés también.</p>
    ${P.p5}${P.p5mas}
    ${duda('Una que he decidido yo: los pasos con reloj', 'En la maqueta no salía un paso con reloj, como un aguante o un estiramiento. Bajo la flecha he puesto «Siguiente», porque lo pasa aunque quede tiempo. La otra opción es «Hecho», como en las reps a tu ritmo.')}
    ${P.p5otra}
  </section>

  <section class="caso">
    <span class="num-caso">P6 · A, con tu retoque</span>
    <h2>«Con una serie basta», de verdad</h2>
    <p>En «Levántate y sube», en cada descanso que separa dos series del mismo ejercicio sale «Con una basta», centrada debajo de «SEGUNDOS». Al pulsarla te saltas la serie que queda y sigues con el siguiente ejercicio. La rutina cuenta entera (con sus logros) y el cierre dice las series que hiciste. Si sales a mitad y sigues luego, también cuenta entera.</p>
    ${P.p6}${P.p6mas}
    ${duda('Tu retoque, leído de otra forma: «cuadrada»', 'He leído «queda mejor cuadrada debajo de segundos» como «bien colocada, centrada debajo». Si querías decir con esquinas rectas, así se vería. Recomiendo la pastilla redonda, que es la misma que el «+15 s».')}
    ${P.p6otra}
    ${duda('Otra que he decidido yo: en qué rutinas sale', 'Solo en «Levántate y sube», que es la única que dice «La primera vez, una serie basta». Las otras rutinas de «Para empezar» también tienen dos series de cada; si quieres que salga en todas, es una línea por rutina.')}
  </section>

  <section class="caso">
    <span class="num-caso">P8 · B, con tu retoque</span>
    <h2>La pausa se ve, y la bola también</h2>
    <p>Al pausar, lo de debajo del dibujo se apaga sin moverse y en su sitio sale «Sesión en pausa», «Descansa» y qué pasa al volver. El círculo del dibujo y su arco se quedan a la vista, para recordar la postura. Al reanudar cuenta 3, 2, 1 con sus maderas y luego sigue lo que quedaba. El mando sigue igual, y «‹» y «›» van al momento.</p>
    ${P.p8}${P.p8vuelta}
    ${duda('Tu retoque, leído de otra forma: la bola a través del velo', 'He leído «que se vea la bola del dibujo arriba» como el círculo fuera del velo, nítido. La otra lectura es un velo translúcido sobre todo, con la bola debajo. Recomiendo la montada: con el velo translúcido se leen el número y la instrucción de detrás.')}
    ${P.p8otra}
  </section>
</div>
`;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA, Math.round(html.length / 1024) + ' KB');
})();
