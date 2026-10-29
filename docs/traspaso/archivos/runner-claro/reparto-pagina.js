// La página de fotos del reparto del runner ya montado (tercera vuelta, 29 oct. 2026): hoy y montado en cuatro
// pantallas, la pausa, y TODAS las pantallas del censo (Ez: «quiero ver todas las resoluciones del runner para
// móvil y pc para ver que no hay fallos»), con la tabla. Con «ligera», la versión de menos de 512 KB.
// Uso: node reparto-pagina.js <carpeta del censo> <carpeta de las fotos de la pausa> <salida.html> [ligera]
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const sharp = require(R + '/node_modules/sharp');
const path = require('path');
const [CENSO, PAUSA, SALIDA, MODO] = process.argv.slice(2);
const LIGERA = MODO === 'ligera';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function webp(archivo, ancho, calidad) {
  const b = await sharp(archivo).resize({ width: ancho, withoutEnlargement: true }).webp({ quality: calidad }).toBuffer();
  const m = await sharp(b).metadata();
  return { src: 'data:image/webp;base64,' + b.toString('base64'), w: m.width, h: m.height };
}
/* Una foto que se abre en grande al pulsarla (el diálogo de abajo). */
async function foto(archivo, ancho, alt, calidad) {
  if (!fs.existsSync(archivo)) return '<div class="falta">Sin foto</div>';
  const i = await webp(archivo, ancho, calidad || (LIGERA ? 50 : 64));
  return '<button type="button" class="ver" aria-label="' + esc('Ver en grande: ' + alt) + '"><img src="' + i.src + '" alt="' + esc(alt) +
    '" width="' + i.w + '" height="' + i.h + '" loading="lazy"></button>';
}
const movil = (w) => w < 700;
const ESCENAS = [
  ['colocate', 'Colocarse, con «+15 s»'], ['saltar', 'Con «Saltar este paso»'], ['core', 'Sin pastilla (Core silencioso)'],
  ['basta', 'Descanso, con «Con una basta»'], ['serie', 'Primera serie de «Levántate y sube»'],
];
const PANTALLAS = [[320, 568], [360, 640], [375, 667], [360, 740], [390, 844], [412, 915], [768, 1024], [1280, 720], [1536, 710], [1440, 900]];

(async () => {
  const filas = JSON.parse(fs.readFileSync(path.join(CENSO, 'censo.json'), 'utf8'));
  const por = new Map(filas.map((f) => [f.t, f]));
  const F = (cual, lang, e, w, h) => path.join(CENSO, cual + '_' + lang + '_' + e + '_' + w + 'x' + h + '.png');

  /* La tabla: una fila por pantalla e idioma. */
  const NOMBRE = Object.fromEntries(ESCENAS);
  let tabla = '<div class="tabla"><table><thead><tr><th>Pantalla</th><th>Círculo, hoy → montado (px)</th><th>«Auto»</th><th>Nada se pisa</th><th>Ningún texto cortado</th><th>Sin scroll</th></tr></thead><tbody>';
  const listas = [];
  for (const lang of ['es', 'en']) for (const [w, h] of PANTALLAS) {
    if (lang === 'en' && ![320, 360, 1280].includes(w)) continue;
    const xs = ESCENAS.map(([e]) => ({ e, f: por.get(lang + ' ' + e + ' ' + w + 'x' + h) })).filter((x) => x.f);
    if (!xs.length) continue;
    listas.push({ lang, w, h });
    const circ = [...new Set(xs.map((x) => (x.f.hoy.circulo || '?') + ' → ' + (x.f.montado.circulo || '?')))].join(', ');
    const encoge = xs.some((x) => (x.f.hoy.circulo || 0) > (x.f.montado.circulo || 0));
    const pisa = xs.filter((x) => (x.f.montado.pisa || []).length);
    const pisaHoy = xs.filter((x) => (x.f.hoy.pisa || []).length).map((x) => x.f.hoy.pisa.join(', '));
    const corta = xs.filter((x) => (x.f.montado.corta || []).length);
    const scroll = xs.some((x) => x.f.montado.scroll);
    const error = xs.filter((x) => x.f.montado.error || x.f.hoy.error);
    const auto = [...new Set(xs.map((x) => (x.f.montado.autoAbajo ? 'bajo el mando' : 'junto a «Siguiente»')))].join(', ');
    const justo = xs.some((x) => x.f.montado.justo);
    const celda = (t, mal) => '<td' + (mal ? ' class="mal"' : '') + '>' + t + '</td>';
    tabla += '<tr>' + celda(w + ' × ' + h + (lang === 'en' ? ' · inglés' : '') + (justo ? ' <span class="nota">(justo)</span>' : ''))
      + celda(circ, encoge) + celda(auto)
      + celda(pisa.length ? 'No: ' + pisa.map((x) => NOMBRE[x.e] + ' (' + x.f.montado.pisa.join(', ') + ')').join('; ') : 'Sí' + (pisaHoy.length ? ' <span class="nota">(hoy no: ' + esc(pisaHoy[0]) + ')</span>' : ''), pisa.length)
      + celda(corta.length ? 'No: ' + corta.map((x) => NOMBRE[x.e]).join(', ') : 'Sí', corta.length)
      + celda(scroll ? 'No' : 'Sí', scroll) + '</tr>';
    if (error.length) tabla += '<tr><td colspan="6" class="mal">Error al medir: ' + esc(error.map((x) => x.e + ' ' + (x.f.montado.error || x.f.hoy.error)).join(' | ')) + '</td></tr>';
  }
  tabla += '</tbody></table></div>';

  /* Hoy y montado, en las cuatro pantallas de siempre. */
  const pares = [];
  for (const [w, h, e, pie] of [[360, 740, 'colocate', 'Móvil, 360 × 740'], [412, 915, 'colocate', 'Móvil alto, 412 × 915'],
    [412, 915, 'basta', 'Móvil alto, 412 × 915, descanso de «Levántate y sube»'],
    [1280, 720, 'colocate', 'Ordenador, 1280 × 720'], [1536, 710, 'colocate', 'Tu pantalla, 1536 × 710'], [1536, 710, 'saltar', 'Tu pantalla, 1536 × 710, con «Saltar este paso»']]) {
    const t = por.get('es ' + e + ' ' + w + 'x' + h);
    const ancho = movil(w) ? (LIGERA ? 300 : 420) : (LIGERA ? 640 : 960);
    pares.push('<section class="par-caso"><h3>' + pie + '</h3><p class="nota">Círculo ' + (t ? t.hoy.circulo + ' → ' + t.montado.circulo + ' px' : '') + '</p><div class="par ' + (movil(w) ? 'movil' : 'escritorio') + '">'
      + '<figure>' + await foto(F('hoy', 'es', e, w, h), ancho, 'Hoy, ' + pie) + '<figcaption>Hoy</figcaption></figure>'
      + '<figure>' + await foto(F('montado', 'es', e, w, h), ancho, 'Montado, ' + pie) + '<figcaption><b>Montado</b></figcaption></figure></div></section>');
  }

  /* La pausa, montada. */
  let pausa = '';
  for (const [w, h, pie] of [[412, 915, 'Móvil alto'], [1536, 710, 'Tu pantalla']]) {
    const ancho = movil(w) ? (LIGERA ? 220 : 360) : (LIGERA ? 440 : 800);
    pausa += '<div class="par ' + (movil(w) ? 'movil' : 'escritorio') + '">'
      + '<figure>' + await foto(path.join(PAUSA, 'montado_es_pausa_' + w + 'x' + h + '.png'), ancho, pie + ', en pausa') + '<figcaption>' + pie + ', en pausa</figcaption></figure>'
      + '<figure>' + await foto(path.join(PAUSA, 'montado_es_vuelta_' + w + 'x' + h + '.png'), ancho, pie + ', al reanudar: 3') + '<figcaption>Al reanudar: 3, 2, 1, sin «Al reanudar…»</figcaption></figure></div>';
  }

  /* Todas las pantallas, montadas: cada una con sus cinco pasos (en la ligera, dos). */
  const escenasTodas = LIGERA ? ESCENAS.filter(([e]) => e === 'colocate' || e === 'basta') : ESCENAS;
  let todas = '';
  for (const { lang, w, h } of listas) {
    const ancho = movil(w) ? (LIGERA ? 200 : 300) : (LIGERA ? 400 : 640);
    todas += '<section class="pantalla"><h3>' + w + ' × ' + h + (lang === 'en' ? ' · inglés' : '') + '</h3><div class="tira ' + (movil(w) ? 'movil' : 'escritorio') + '">';
    for (const [e, nombre] of escenasTodas) {
      todas += '<figure>' + await foto(F('montado', lang, e, w, h), ancho, nombre + ', ' + w + ' × ' + h, LIGERA ? 48 : 60) + '<figcaption>' + nombre + '</figcaption></figure>';
    }
    todas += '</div></section>';
  }

  const html = `<title>El reparto, montado</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · la tercera vuelta del reparto del runner, montada en la rama claude/runner-claro-15db3c (29 oct. 2026).
     Fotos y tabla: docs/traspaso/archivos/runner-claro/censo-montado.js; esta página: reparto-pagina.js. -->
<style>
  /* Una columna de lectura; las fotos en pares (hoy, montado) y, abajo, una tira por pantalla. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --reco-bg: #E3E6D8; --duda-bg: #EFE6D6; --mal: #9E4F33; --velo: rgba(20, 18, 14, 0.86);
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --reco-bg: #2a3025; --duda-bg: #2c261c; --mal: #E8A98F; --velo: rgba(8, 7, 5, 0.9); color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --reco-bg: #2a3025; --duda-bg: #2c261c; --mal: #E8A98F; --velo: rgba(8, 7, 5, 0.9); color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .marco { max-width: 1000px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(38px, 8vw, 54px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(28px, 6vw, 34px); line-height: 1.1; margin-bottom: 12px; }
  h3 { font: 600 15px/1.3 var(--ui); margin: 0 0 4px; color: var(--ink); }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 44em; }
  b { color: var(--ink); font-weight: 600; }
  ol.leo, ul.leo { margin: 0 0 12px; padding-left: 1.3em; max-width: 44em; color: var(--ink-2); display: grid; gap: 6px; }
  section.caso { margin-top: 40px; padding-top: 30px; border-top: 1px solid var(--line); }
  .par-caso { margin-top: 22px; }
  .par { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 8px 0; }
  .par.movil { max-width: 620px; }
  figure { margin: 0; min-width: 0; }
  .ver { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; border-radius: 10px; }
  .ver:focus-visible { outline: 2px solid var(--cta); outline-offset: 3px; }
  img { display: block; width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--line); background: var(--paper-2); }
  figcaption { font-size: 13px; line-height: 1.4; color: var(--ink-3); margin-top: 6px; }
  figcaption b { color: var(--cta); }
  .nota { font-size: 14px; color: var(--ink-3); }
  .falta { padding: 24px; border: 1px dashed var(--line); border-radius: 10px; color: var(--ink-3); font-size: 13px; }
  @media (max-width: 560px) { .par.escritorio { grid-template-columns: minmax(0, 1fr); } }
  .pantalla { margin-top: 26px; }
  .tira { display: grid; gap: 12px; }
  .tira.movil { grid-template-columns: repeat(${LIGERA ? 2 : 5}, minmax(0, 1fr));${LIGERA ? ' max-width: 420px;' : ''} }
  .tira.escritorio { grid-template-columns: repeat(${LIGERA ? 2 : 3}, minmax(0, 1fr)); }
  @media (max-width: 700px) { .tira.movil { grid-template-columns: repeat(2, minmax(0, 1fr)); } .tira.escritorio { grid-template-columns: minmax(0, 1fr); } }
  .duda { margin: 22px 0 6px; padding: 14px 16px 4px; border-radius: 12px; background: var(--duda-bg); max-width: 46em; }
  .duda p { margin: 0 0 10px; }
  .otit { color: var(--ink) !important; font-weight: 600; }
  .respuesta { margin-top: 40px; padding: 18px 18px 8px; border: 1px solid var(--cta); border-radius: 14px; max-width: 46em; background: var(--reco-bg); }
  .linea { font: italic 500 26px/1.25 var(--display); color: var(--ink); margin-bottom: 8px; }
  /* La tabla se desplaza dentro de su caja en el móvil, nunca la página. */
  .tabla { overflow-x: auto; max-width: 100%; border: 1px solid var(--line); border-radius: 12px; margin-top: 12px; }
  table { border-collapse: collapse; width: 100%; min-width: 640px; font-size: 14px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--line); vertical-align: top; color: var(--ink-2); }
  th { font-weight: 600; color: var(--ink); background: var(--paper-2); }
  tr:last-child td { border-bottom: 0; }
  td:first-child { white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--ink); }
  td { font-variant-numeric: tabular-nums; }
  td.mal { color: var(--mal); font-weight: 600; }
  /* La foto en grande. */
  dialog.grande { padding: 0; border: 0; background: transparent; max-width: 100vw; max-height: 100vh; }
  dialog.grande::backdrop { background: var(--velo); }
  dialog.grande img { width: auto; height: auto; max-width: min(96vw, 1400px); max-height: 92vh; cursor: zoom-out; }
  @media (prefers-reduced-motion: no-preference) { .ver img { transition: opacity 160ms; } .ver:hover img { opacity: .92; } }
</style>
<div class="marco">
  <p class="kicker">Mueve y Estira · el runner · 29 oct. 2026 · montado en la rama, sin juntar</p>
  <h1>El reparto, montado</h1>
  <p>Tu tercera vuelta, ya en el código: vale para todas las rutinas de Mueve y Estira y para «Tus rutinas», que usan el mismo runner.
    Son fotos de la app de la rama, la de hoy (antes del cambio) y la montada. Toca una foto para verla en grande.</p>
  <ol class="leo">
    <li><b>Cada pastilla, centrada bajo su etiqueta</b> («+15 s», «Saltar este paso», «Con una basta»), en una sola fila y con su hueco siempre.</li>
    <li><b>«Auto», debajo de las palabras de los botones</b>, en el móvil y en el ordenador; bajo la barra queda solo «Siguiente: …». Por debajo de 700 px de alto se queda junto a «Siguiente», como hoy.</li>
    <li><b>El círculo crece donde sobra aire</b>, con tope, y nunca encoge: en ninguna de las pantallas de abajo es menor que hoy.</li>
    <li><b>En el ordenador, menos aire entre las piezas</b> y el número un poco menor, todo centrado.</li>
    <li><b>«Colócate sin prisa · pulsa «Empezar ya»»</b>; en inglés, «Get set, no rush · press Begin now».</li>
    <li><b>En la pausa, durante el 3, 2, 1</b>, ya no sale «Al reanudar, 3, 2, 1 y vuelve la cuenta».</li>
  </ol>

  <div class="duda">
    <p class="otit">Decidido al montarlo, a falta de que lo mires</p>
    <p><b>En el móvil más pequeño (320 × 568) la pastilla va junto a su etiqueta, no debajo.</b> Ahí no cabe todo ni con el círculo en su
      tamaño mínimo, y con la pastilla debajo «Cuídate» pisaba la barra de pasos 20 px (hoy, hasta 47). Es el mismo criterio que «Auto» bajo
      700 px de alto: donde debajo no cabe, va al lado. En la maqueta parecía que pisaba solo 10 px, pero era porque el bloque se salía
      también por arriba y el círculo quedaba cortado bajo la cabecera; montado, eso ya no pasa.</p>
    <p><b>El número queda a la misma distancia de la descripción que de la barra</b>, y la barra a 8 px del mando, como pedían dos reglas de
      antes. Frente a la maqueta, el número sube unos 5 px y el círculo gana esos píxeles.</p>
    <p><b>En la pausa, el texto del velo ya no sube al empezar el 3, 2, 1</b> (antes saltaba 9 px).</p>
  </div>

  <section class="caso">
    <h2>Hoy y montado</h2>
    ${pares.join('\n    ')}
  </section>

  <section class="caso">
    <h2>La pausa</h2>
    <p class="nota">Core silencioso a mitad del aguante. El velo empieza bajo el círculo, que ahora va centrado.</p>
    ${pausa}
  </section>

  <section class="caso">
    <h2>Todas las pantallas</h2>
    <p>Del móvil más pequeño al ordenador grande, en español y en inglés${LIGERA ? '' : ', en cinco pasos de tres rutinas'}. La tabla dice lo que se
      midió en cada foto: el círculo (hoy → montado), si algo se pisa (piezas que se tocan, «Auto» con las palabras de los botones o con la
      línea de atajos, el círculo bajo la cabecera), si algún texto sale cortado y si hay scroll. «Justo» es cuando no cabe todo ni con el
      círculo en su mínimo.</p>
    ${tabla}
    ${LIGERA ? '<p class="nota">Versión ligera: dos pasos por pantalla. La completa, con los cinco, va en el enlace.</p>' : ''}
    ${todas}
  </section>

  <div class="respuesta">
    <p class="kicker" style="margin-bottom:8px">Lo que espera tu respuesta</p>
    <p class="linea">«Júntalo», o qué cambiar</p>
    <p>Con tu «júntalo», la coordinadora junta las dos ramas en main: primero «Tus rutinas» y luego el runner.</p>
  </div>
</div>
<dialog class="grande" id="grande" aria-label="Foto en grande"><img id="grande-img" alt=""></dialog>
<script>
  (function () {
    var d = document.getElementById('grande'), g = document.getElementById('grande-img');
    if (!d || typeof d.showModal !== 'function') return;
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.ver') : null;
      if (b) { var i = b.querySelector('img'); g.src = i.src; g.alt = i.alt; d.showModal(); return; }
      if (d.open && (e.target === d || e.target === g)) d.close();
    });
  })();
</script>
`;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA, Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
})();
