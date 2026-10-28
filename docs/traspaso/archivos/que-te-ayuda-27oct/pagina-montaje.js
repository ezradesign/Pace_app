// La página con las fotos de «Qué te ayuda» ya montado (v0.183.0), para el sí de Ez.
// Uso: node pagina-montaje.js <carpeta-de-fotos> <salida.html>, tras fotos-montaje.js.
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const sharp = require(R + '/node_modules/sharp');
const F = require('path').resolve(process.argv[2]) + '/';
const SALIDA = process.argv[3];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function webp(archivo, ancho) {
  const b = await sharp(F + archivo + '.png').resize({ width: ancho }).webp({ quality: ancho > 600 ? 74 : 72 }).toBuffer();
  return 'data:image/webp;base64,' + b.toString('base64');
}
/* Cada foto en claro y en oscuro (y en inglés, si la hay): la de claro en español va en el src. */
const MAPA = {};
async function img(base, w, alt) {
  const k = base + '@' + w;
  const vars = {};
  for (const v of ['crema-es', 'oscuro-es', 'crema-en', 'oscuro-en']) {
    const a = base + '_' + w + '-' + v;
    if (fs.existsSync(F + a + '.png')) vars[v] = await webp(a, w === 360 ? 460 : 1100);
  }
  if (!vars['crema-es']) throw new Error('falta ' + base + '_' + w + '-crema-es');
  MAPA[k] = vars;
  return '<img data-k="' + k + '" src="' + vars['crema-es'] + '" alt="' + esc(alt + (w === 360 ? ', en el móvil' : ', en el ordenador')) + '" loading="lazy"'
    + (w === 360 ? ' width="460" height="946"' : ' width="1100" height="619"') + '>';
}
async function par(base, pie, alt) {
  return '<figure class="par"><div class="m">' + await img(base, 360, alt) + '</div><div class="d">' + await img(base, 1280, alt)
    + '</div><figcaption>' + pie + '</figcaption></figure>';
}

(async () => {
  const P = {
    ideas: await par('ideas', 'Con seis semanas de uso', 'Qué te ayuda con las tres ideas'),
    pronto: await par('pronto', 'Antes de tener bastante', 'Qué te ayuda sin datos: Todavía es pronto'),
    cerrada: await par('cerrada', 'Sin PACE completo · las pestañas', 'Estadísticas sin PACE completo, con candado en Mes, Año y Qué te ayuda'),
    inv: await par('cerrada-invitacion', 'Sin PACE completo · al tocar «Qué te ayuda»', 'La invitación a PACE completo'),
  };
  const html = `<title>Qué te ayuda, montado</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · «Qué te ayuda» montado en v0.183.0, para el sí de Ez (27 oct. 2026). Fotos de la app tal cual, con seis
     semanas de ejemplo sembradas por el registro. Guiones: docs/traspaso/archivos/que-te-ayuda-27oct/ (fotos-montaje.js, pagina-montaje.js). -->
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
  body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--paper); }
  .banda { background: var(--focus); color: var(--paper); font: 500 12px/1.5 var(--ui); letter-spacing: .04em; text-align: center;
    padding-block: 10px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .marco { max-width: 1040px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(40px, 8vw, 58px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(27px, 5.5vw, 34px); line-height: 1.1; margin: 40px 0 10px; padding-top: 30px; border-top: 1px solid var(--line); }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  .lede { font-size: 17.5px; }
  b { color: var(--ink); font-weight: 600; }
  .respuesta { margin: 24px 0 8px; border: 1px solid var(--cta); border-radius: 14px; padding: 16px 18px 6px; background: var(--reco-bg); max-width: 44em; }
  .linea { font: italic 500 22px/1.3 var(--display); color: var(--ink); }
  .ver { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--paper); margin: 22px 0 0; padding: 10px 0;
    border-bottom: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; }
  .ver .rot { font: 500 11px/1 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); }
  .seg { display: inline-flex; background: var(--paper-2); border-radius: 8px; padding: 3px; gap: 2px; }
  .seg button { font: 500 13px/1 var(--ui); color: var(--ink-3); background: transparent; border: 0; border-radius: 6px; padding: 8px 12px; cursor: pointer; }
  .seg button[aria-pressed="true"] { background: var(--paper); color: var(--ink); box-shadow: 0 1px 3px rgba(0,0,0,.1); }
  .seg button:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  figure { margin: 16px 0 14px; min-width: 0; }
  .par { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2.6fr); gap: 14px; align-items: start; }
  .par .m, .par .d { min-width: 0; }
  .par img { display: block; width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--line); background: var(--paper-2); }
  .par figcaption { grid-column: 1 / -1; font: 500 12px/1.4 var(--ui); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); margin-top: -4px; }
  ul.lisa { margin: 6px 0 12px; padding-left: 20px; color: var(--ink-2); max-width: 44em; }
  ul.lisa li { margin-bottom: 6px; }
  .nota { font-size: 14px; color: var(--ink-3); }
  code { font: 500 13px/1.4 ui-monospace, 'Cascadia Mono', Consolas, monospace; color: var(--ink); background: var(--paper-2); border-radius: 4px; padding: 1px 4px; overflow-wrap: anywhere; }
  @media (max-width: 640px) { .par { grid-template-columns: minmax(0, 1fr); } .par .m { max-width: 300px; } }
</style>

<div class="banda">v0.183.0 · Montado en su rama, sin juntar en main. Fotos de la app tal cual; los datos son de ejemplo, sembrados en el registro.</div>
<main class="marco">
  <p class="kicker">PACE · Estadísticas · 27 de octubre</p>
  <h1>Qué te ayuda, montado</h1>
  <p class="lede">Lo que elegiste, <b>1A 2A 3A</b>, ya está en la app: tres ideas que salen solas cuando hay bastante para decirlas, «Todavía es pronto» antes, y una pestaña más en Estadísticas, con candado sin PACE completo. Las fotos son de la versión 0.183.0, con seis semanas de ejemplo: 35 Focos y 17 respuestas a «¿Te ayudó esta pausa?».</p>
  <div class="respuesta">
    <p>Si te vale tal cual, basta con: <span class="linea">Sí</span></p>
    <p>Si algo no, dime qué foto y qué cambiarías.</p>
  </div>

  <div class="ver" role="group" aria-label="Cómo ver las fotos">
    <span class="rot">Ver las fotos</span>
    <span class="seg"><button type="button" id="ver-claro" data-pal="crema" aria-pressed="true">Claro</button><button type="button" id="ver-oscuro" data-pal="oscuro" aria-pressed="false">Oscuro</button></span>
    <span class="seg"><button type="button" id="ver-es" data-lang="es" aria-pressed="true">Español</button><button type="button" id="ver-en" data-lang="en" aria-pressed="false">English</button></span>
  </div>

  <h2>Con seis semanas de uso</h2>
  <p>Las tres ideas, con «de» y sin porcentajes. Cada tarjeta dice de dónde sale y cuántas semanas abarca; al pie, que no es un consejo médico. En inglés, con el botón de arriba (solo esta foto).</p>
  ${P.ideas}
  <ul class="lisa">
    <li><b>Lo que te sienta bien</b> sale con dos rutinas que tengan 3 respuestas en 2 días distintos y te hayan ayudado más de la mitad de las veces. Brazos libres, con dos «No», no sale.</li>
    <li><b>Tu hora de Foco</b> sale con 12 Focos terminados en 5 días; <b>Después del Foco</b>, con 10 en 4 días. Los Focos que dejas a medias no cuentan.</li>
    <li>Cambia una cosa respecto a la maqueta: en el móvil las tarjetas van un poco más apretadas, para que la pestaña mida lo mismo que Hoy, Semana, Mes y Año y no pida scroll, en los dos idiomas.</li>
  </ul>

  <h2>Antes de tener bastante</h2>
  <p>Sin una cifra ni nada que llenar. Cuando sale la primera idea, debajo dice «Lo demás saldrá cuando haya bastante para decirlo».</p>
  ${P.pronto}

  <h2>Sin PACE completo, después de v1</h2>
  <p>Hasta v1 está abierta para todos. Después, la pestaña lleva candado como Mes y Año, y al tocarla se abre la invitación sin cambiar de pestaña. La invitación dice ahora «Tu mes, tu año y qué te ayuda».</p>
  ${P.cerrada}
  ${P.inv}
  <p class="nota" style="margin-top:24px">Pruebas: <code>tests/stats-ayuda.spec.js</code>, rojas contra v0.181.1 (cada umbral por los dos lados, los Focos a medias, el candado y sin scroll a 360 y 1280 px en los dos idiomas). Lo de /premium (su lista dice aún «Tu mes y tu año») no se ha tocado.</p>
</main>
<script>
  var FOTOS = ${JSON.stringify(MAPA)};
  var ver = { pal: 'crema', lang: 'es' };
  function pintar() {
    document.querySelectorAll('img[data-k]').forEach(function (img) {
      var m = FOTOS[img.getAttribute('data-k')];
      var src = m && (m[ver.pal + '-' + ver.lang] || m[ver.pal + '-es']);
      if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
    });
    document.querySelectorAll('.seg button').forEach(function (b) {
      var on = b.dataset.pal ? b.dataset.pal === ver.pal : b.dataset.lang === ver.lang;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.seg button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.pal) ver.pal = b.dataset.pal; else ver.lang = b.dataset.lang;
      pintar();
    });
  });
</script>
`;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA, Math.round(html.length / 1024) + ' KB');
})().catch((e) => { console.error(e); process.exit(1); });
