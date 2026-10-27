// La página para que Ez elija cómo es «Qué te ayuda», con las fotos de la app real.
// Uso: node pagina.js <carpeta-de-fotos> <salida.html>, tras fotos.js.
// Cada foto va a 360 y a 1280 px; los botones de arriba cambian todas a oscuro o a inglés.
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const sharp = require(R + '/node_modules/sharp');
const F = require('path').resolve(process.argv[2]) + '/';
const SALIDA = process.argv[3];
const M = JSON.parse(fs.readFileSync(F + 'medidas.json', 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const VARS = ['crema-es', 'crema-en', 'oscuro-es', 'oscuro-en'];

async function webp(archivo, ancho) {
  const b = await sharp(F + archivo + '.png').resize({ width: ancho }).webp({ quality: ancho > 600 ? 74 : 72 }).toBuffer();
  return 'data:image/webp;base64,' + b.toString('base64');
}
/* Las cuatro variantes de una foto: la de claro en español va en el src; las otras, en el mapa. */
const MAPA = {};
async function variantes(clave, base, w) {
  const out = {};
  for (const v of VARS) {
    const archivo = base + '_' + w + '-' + v;
    if (!fs.existsSync(F + archivo + '.png')) throw new Error('falta ' + archivo);
    out[v] = await webp(archivo, w === 360 ? 460 : 1100);
  }
  const k = clave + '@' + w;
  MAPA[k] = { 'crema-en': out['crema-en'], 'oscuro-es': out['oscuro-es'], 'oscuro-en': out['oscuro-en'] };
  return { k, src: out['crema-es'] };
}
async function par(clave, base, pie, alt, solo) {
  const movil = solo === 1280 ? null : await variantes(clave, base, 360);
  const ord = solo === 360 ? null : await variantes(clave, base, 1280);
  const img = (x, w) => '<img data-k="' + x.k + '" src="' + x.src + '" alt="' + esc(alt + (w === 360 ? ', en el móvil' : ', en el ordenador')) + '" loading="lazy"' + (w === 360 ? ' width="460" height="946"' : ' width="1100" height="619"') + '>';
  return '<figure class="par' + (solo ? ' solo' : '') + '">' + (movil ? '<div class="m">' + img(movil, 360) + '</div>' : '')
    + (ord ? '<div class="d">' + img(ord, 1280) + '</div>' : '') + '<figcaption>' + pie + '</figcaption></figure>';
}
const opcion = (letra, titulo, texto, recomendada) => '<li class="opcion' + (recomendada ? ' reco' : '') + '"><span class="letra">' + letra +
  '</span><div><p class="otit">' + titulo + (recomendada ? ' <span class="pill">Recomendada</span>' : '') + '</p><p>' + texto + '</p></div></li>';

/* Lo que mide cada escena: el scroll que pide en el móvil y en el ordenador (el mayor de sus cuatro variantes). */
const scroll = (escena, w) => Math.max(...VARS.map((v) => (M[escena + '_' + w + '-' + v] || {}).scroll || 0));
const cortaTab = Object.entries(M).some(([k, m]) => k.startsWith('1a_') && m.tabs.some((x) => x.corta));

(async () => {
  const P = {};
  P.a = await par('1a', '1a', '<b>1A</b> · Tres ideas, en su pestaña', 'Qué te ayuda con tres ideas: lo que te sienta bien, tu hora de Foco y después del Foco');
  P.b = await par('1b', '1b', '<b>1B</b> · Cinco ideas', 'Qué te ayuda con cinco ideas');
  P.c = await par('1c', '1c', '<b>1C</b> · Solo lo que dices', 'Qué te ayuda solo con las respuestas a ¿Te ayudó?');
  P['2a'] = await par('2a', '2a', '<b>2A</b> · Sin datos todavía', 'Qué te ayuda sin datos: Todavía es pronto');
  P['2am'] = await par('2am', '2a-medio', '<b>2A</b> · Con la primera idea ya fuera', 'Qué te ayuda con una sola idea y Lo demás saldrá cuando haya bastante');
  P['2b'] = await par('2b', '2b', '<b>2B</b> · Lo que vendrá', 'Qué te ayuda sin datos, con las tres ideas en tenue y Aún no');
  P['2c'] = await par('2c', '2c', '<b>2C</b> · Lo que hay', 'Qué te ayuda sin datos, con lo que llevas contado');
  P['3ac'] = await par('3ac', '3a-cerrada', '<b>3A</b> sin PACE completo · las pestañas, con candado', 'Estadísticas sin PACE completo: Mes, Año y Qué te ayuda con candado');
  P['3ai'] = await par('3ai', '3a-cerrada-invitacion', '<b>3A</b> sin PACE completo · al tocar «Qué te ayuda»', 'La invitación a PACE completo al tocar Qué te ayuda');
  P['3bs'] = await par('3bs', '3b-semana', '<b>3B</b> · la línea al pie de la Semana', 'La Semana con una línea de Qué te ayuda al pie');
  P['3bm'] = await par('3bm', '3b-mes', '<b>3B</b> · la línea al pie del Mes', 'El Mes con una línea de Qué te ayuda al pie');
  P['3bc'] = await par('3bc', '3b-cerrada', '<b>3B</b> sin PACE completo · la Semana, como hoy', 'La Semana sin PACE completo, sin la línea');
  const abajo1b = fs.existsSync(F + '1b_360-crema-es_abajo.png');
  if (abajo1b) {
    const x = {};
    for (const v of VARS) x[v] = await webp('1b_360-' + v + '_abajo', 460);
    MAPA['1bab@360'] = { 'crema-en': x['crema-en'], 'oscuro-es': x['oscuro-es'], 'oscuro-en': x['oscuro-en'] };
    P.bab = '<figure class="par solo"><div class="m"><img data-k="1bab@360" src="' + x['crema-es'] + '" alt="Qué te ayuda con cinco ideas, al bajar en el móvil" loading="lazy" width="460" height="946"></div><figcaption><b>1B</b> · al bajar, en el móvil</figcaption></figure>';
  }
  const s1b = scroll('1b', 360), s1bd = scroll('1b', 1280), s1c = scroll('1c', 360), s3bs = scroll('3b-semana', 360), s3bm = scroll('3b-mes', 360);
  const s3bmd = scroll('3b-mes', 1280), s3bsd = scroll('3b-semana', 1280);
  const sin = (n) => n ? 'pide ' + n + ' px de scroll' : 'cabe sin scroll';

  const html = `<title>Qué te ayuda</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · «Qué te ayuda»: la página para que Ez elija (27 oct. 2026).
     Las fotos son de la app real (index.html de v0.181.1) con la propuesta metida por dentro antes de montarse;
     los datos son de ejemplo. Guiones en docs/traspaso/archivos/que-te-ayuda-27oct/ (propuesta.js, fotos.js, pagina.js). -->
<style>
  /* Página de decisión: una columna de lectura; cada decisión, sus fotos (móvil y ordenador lado a lado) y sus opciones. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --line-2: #B8AD8E; --cta: #50624D; --focus: #3E5A3A; --move: #9A7B4F; --extra: #6B7A8F; --breathe: #A85E43;
    --reco-bg: #E3E6D8;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --line-2: #5f5544; --cta: #8E9D88; --focus: #A3BC96; --move: #C29F6E; --extra: #95A4BA; --breathe: #D99477; --reco-bg: #2a3025; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --line-2: #5f5544; --cta: #8E9D88; --focus: #A3BC96; --move: #C29F6E; --extra: #95A4BA; --breathe: #D99477; --reco-bg: #2a3025; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .banda { background: var(--focus); color: var(--paper); font: 500 12px/1.5 var(--ui); letter-spacing: .04em; text-align: center;
    padding-block: 10px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .marco { max-width: 1040px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2, h3 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(40px, 8vw, 58px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(29px, 6vw, 36px); line-height: 1.1; margin-bottom: 12px; }
  h3 { font-size: 22px; line-height: 1.2; margin: 26px 0 8px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  .lede { font-size: 17.5px; }
  b { color: var(--ink); font-weight: 600; }
  code { font: 500 13px/1.4 ui-monospace, 'Cascadia Mono', Consolas, monospace; color: var(--ink); background: var(--paper-2); border-radius: 4px; padding: 1px 4px; overflow-wrap: anywhere; }
  .respuesta { margin: 26px 0 8px; border: 1px solid var(--cta); border-radius: 14px; padding: 18px 18px 8px; background: var(--paper); max-width: 44em; }
  .respuesta ol { list-style: none; padding: 0; margin: 0 0 10px; display: grid; gap: 6px; }
  .respuesta li { display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; gap: 10px; align-items: baseline; padding: 6px 0; border-bottom: 1px dashed var(--line); }
  .respuesta li:last-child { border-bottom: 0; }
  .respuesta .n { font: italic 500 22px/1 var(--display); color: var(--cta); }
  .respuesta .rl { font: 600 13px/1 var(--ui); color: var(--cta); white-space: nowrap; }
  .linea { font: italic 500 22px/1.3 var(--display); color: var(--ink); }
  .combos { list-style: none; padding: 0; margin: 14px 0 6px; display: grid; gap: 8px; max-width: 44em; }
  .combos li { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 12px; align-items: baseline; }
  .combos .cl { font: italic 500 21px/1.2 var(--display); color: var(--cta); white-space: nowrap; }
  .combos p { margin: 0; }
  .ver { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--paper); margin: 26px 0 0; padding: 10px 0;
    border-bottom: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; }
  body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--paper); }
  .ver .rot { font: 500 11px/1 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); }
  .seg { display: inline-flex; background: var(--paper-2); border-radius: 8px; padding: 3px; gap: 2px; }
  .seg button { font: 500 13px/1 var(--ui); color: var(--ink-3); background: transparent; border: 0; border-radius: 6px; padding: 8px 12px; cursor: pointer; }
  .seg button[aria-pressed="true"] { background: var(--paper); color: var(--ink); box-shadow: 0 1px 3px rgba(0,0,0,.1); }
  .seg button:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  section.decision { margin-top: 44px; padding-top: 34px; border-top: 1px solid var(--line); scroll-margin-top: 64px; }
  .num-dec { font: italic 500 17px/1 var(--display); color: var(--cta); display: block; margin-bottom: 6px; }
  figure { margin: 18px 0 14px; min-width: 0; }
  .par { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2.6fr); gap: 14px; align-items: start; }
  .par.solo { grid-template-columns: minmax(0, 260px); }
  .par .m, .par .d { min-width: 0; }
  .par img { display: block; width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--line); background: var(--paper-2); }
  .par figcaption { grid-column: 1 / -1; font: 500 12px/1.4 var(--ui); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); margin-top: -4px; }
  figcaption b { color: var(--cta); }
  .opciones { list-style: none; padding: 0; margin: 18px 0 6px; display: grid; gap: 10px; max-width: 46em; }
  .opcion { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 12px; align-items: start; padding: 14px 16px 6px; border: 1px solid var(--line); border-radius: 12px; }
  .opcion.reco { border-color: var(--cta); background: var(--reco-bg); }
  .letra { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--cta); display: grid; place-items: center; font: italic 500 21px/1 var(--display); color: var(--cta); }
  .opcion.reco .letra { background: var(--cta); color: var(--paper); }
  .otit { font: italic 500 21px/1.35 var(--display); color: var(--ink); margin: 2px 0 6px; }
  .pill { font: 600 10.5px/1 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--cta); border: 1px solid var(--cta); border-radius: 999px; padding: 4px 8px; display: inline-block; vertical-align: 4px; margin: 2px 0 2px 4px; font-style: normal; white-space: nowrap; }
  .tabla { overflow-x: auto; margin: 10px 0 14px; max-width: 100%; }
  table { border-collapse: collapse; font-size: 14px; min-width: 760px; width: 100%; }
  th { text-align: left; font: 600 11px/1.3 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); padding: 8px 12px 6px 0; border-bottom: 1px solid var(--line-2); }
  td { padding: 9px 12px 9px 0; border-bottom: 1px dashed var(--line); vertical-align: top; color: var(--ink-2); line-height: 1.5; }
  td:first-child { color: var(--ink); font: italic 500 17px/1.3 var(--display); min-width: 130px; }
  td .en { display: block; font: 600 10.5px/1.4 var(--ui); letter-spacing: .08em; text-transform: uppercase; color: var(--cta); margin-top: 4px; font-style: normal; }
  td.si::before { content: 'Sí. '; font-weight: 600; color: var(--ink); }
  td.aun::before { content: 'Solo en parte. '; font-weight: 600; color: var(--ink); }
  .fuera { margin: 8px 0 0; padding: 12px 14px; border-left: 2px solid var(--line-2); max-width: 46em; }
  .fuera p { margin: 0 0 6px; font-size: 14.5px; }
  .nota { font-size: 14px; color: var(--ink-3); }
  ul.lisa { margin: 6px 0 12px; padding-left: 20px; color: var(--ink-2); max-width: 44em; }
  ul.lisa li { margin-bottom: 6px; }
  .despues { list-style: none; padding: 0; margin: 12px 0 0; counter-reset: paso; display: grid; gap: 12px; max-width: 44em; }
  .despues li { counter-increment: paso; display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 10px; color: var(--ink-2); }
  .despues li::before { content: counter(paso); font: italic 500 22px/1.2 var(--display); color: var(--cta); }
  @media (max-width: 640px) {
    .par { grid-template-columns: minmax(0, 1fr); }
    .par .m { max-width: 300px; }
    .par.solo { grid-template-columns: minmax(0, 1fr); }
    .opcion { grid-template-columns: 30px minmax(0, 1fr); padding: 12px 12px 4px; }
    .letra { width: 28px; height: 28px; font-size: 18px; }
    .combos li { grid-template-columns: minmax(0, 1fr); gap: 2px; }
  }
</style>

<div class="banda">MAQUETA · Las fotos son de la app de verdad (v0.181.1) con la propuesta metida dentro. Los datos son de ejemplo. Nada de esto está todavía en PACE.</div>
<main class="marco">
  <p class="kicker">PACE · Estadísticas · 27 de octubre</p>
  <h1>Qué te ayuda</h1>
  <p class="lede">Es lo último de pago que falta en Estadísticas: lo que se repite en tus pausas y tus Focos, dicho en una frase y con de dónde sale. Sin notas, sin porcentajes y sin rachas: cuenta veces, como la carta del lunes. Quedan <b>tres decisiones</b>. En cada una, la recomendada va primero, con fotos en el móvil (360 px) y en el ordenador (1280 px).</p>

  <div class="respuesta">
    <p class="kicker">Tu respuesta</p>
    <ol>
      <li><span class="n">1</span><span>Qué dice</span><span class="rl">A · tres ideas</span></li>
      <li><span class="n">2</span><span>Qué dice antes de tener bastante</span><span class="rl">A · callado</span></li>
      <li><span class="n">3</span><span>Dónde va</span><span class="rl">A · su pestaña</span></li>
    </ol>
    <p>Basta con una línea, por ejemplo: <span class="linea">1A 2A 3A</span></p>
    <p class="kicker" style="margin-top:14px">O una de estas tres, completas</p>
    <ul class="combos">
      <li><span class="cl">1A 2A 3A</span><p><b>La recomendada.</b> Tres ideas en su propia pestaña. Hasta que haya algo que decir, una frase y nada más.</p></li>
      <li><span class="cl">1B 2B 3A</span><p><b>La más completa.</b> Cinco ideas, y antes de tener datos, cuáles van a salir. En el móvil pide scroll.</p></li>
      <li><span class="cl">1A 2A 3B</span><p><b>La más ligera.</b> Sin pestaña nueva: una línea al pie de la Semana y otra al pie del Mes.</p></li>
    </ul>
  </div>

  <div class="ver" role="group" aria-label="Cómo ver las fotos">
    <span class="rot">Ver las fotos</span>
    <span class="seg"><button type="button" id="ver-claro" data-pal="crema" aria-pressed="true">Claro</button><button type="button" id="ver-oscuro" data-pal="oscuro" aria-pressed="false">Oscuro</button></span>
    <span class="seg"><button type="button" id="ver-es" data-lang="es" aria-pressed="true">Español</button><button type="button" id="ver-en" data-lang="en" aria-pressed="false">English</button></span>
  </div>

  <section class="decision" id="qd1">
    <span class="num-dec">Decisión 1</span>
    <h2>Qué dice</h2>
    <p>Cada idea es una tarjeta con el lenguaje de Estadísticas de hoy: la franja de color de su módulo, el título en versalitas, la frase en cursiva y, debajo, de dónde sale. Todo se dice con «de»: «5 de 6», nunca «83 %». Al pie, siempre: <i>«Sale de lo que contestas y lo que haces, guardado en este dispositivo. No es un consejo médico.»</i></p>
    ${P.a}
    <h3>Cada idea, de dónde sale y desde cuándo se puede decir</h3>
    <p>Los números son el umbral de cada una: por debajo, esa idea no sale (decisión 2). Miran tus últimos 120 días, que es lo que guarda el registro, y cada tarjeta dice cuántas semanas abarca.</p>
    <div class="tabla"><table>
      <thead><tr><th>Idea</th><th>Lo que dice (ejemplo)</th><th>De dónde sale</th><th>¿Existe hoy el dato?</th><th>Sale desde</th></tr></thead>
      <tbody>
        <tr><td>Lo que te sienta bien<span class="en">1A · 1B · 1C</span></td><td>«Cuello suave, 5 de 6». Las veces que contestaste «Sí» o «Un poco»; «Ahora no» no cuenta.</td><td>Cada «¿Te ayudó?» con su fecha (<code>feedback.answered</code>).</td><td class="si">Desde v0.88.0. Lo de antes queda en <code>routineFeedback</code>, sin fecha, y no entra.</td><td>Una rutina, con 3 respuestas en 2 días distintos. La tarjeta, con 2 rutinas así.</td></tr>
        <tr><td>Tu hora de Foco<span class="en">1A · 1B</span></td><td>«Sobre todo por la mañana, de 9 a 12. Casi todos, de 25 minutos.»</td><td>Cada Foco terminado, con su hora y su duración (<code>session.completed</code>).</td><td class="aun">Solo están los Focos terminados: salir antes no deja rastro. Por eso dice cuándo los terminas y no con qué duración «te cunde» más.</td><td>12 Focos en 5 días. Una franja se nombra si tiene la mitad o más; si no, «repartidos por el día».</td></tr>
        <tr><td>Después del Foco<span class="en">1A · 1B</span></td><td>«Tras 21 de tus 35 Focos, una pausa. Por la mañana, 17 de 25. Por la tarde, 4 de 10.»</td><td>Un Foco terminado y una pausa de Respira, Mueve o Estira que empieza en los 15 minutos siguientes.</td><td class="si">Los dos son <code>session.completed</code>, con su hora.</td><td>10 Focos en 4 días. Mañana y tarde por separado, cuando cada una llega a 10.</td></tr>
        <tr><td>Las pausas de tu día<span class="en">1B</span></td><td>«La de media mañana es la que más haces. La de después de comer, la que más saltas: 6 de 16.»</td><td>Cada día de «A tu ritmo», parada a parada, hecha o saltada (<code>ritmo.day.closed</code>), y lo que ya cambió la carta (<code>ritmo.aprendido</code>).</td><td class="aun">Solo con «A tu ritmo»: por libre no hay paradas.</td><td>10 días con «A tu ritmo». Una hora se nombra con 5 paradas.</td></tr>
        <tr><td>Lo que no te convenció<span class="en">1B · 1C</span></td><td>«Brazos libres: "No", 2 veces. La pausa ya no te la propone.»</td><td>La misma regla que ya usa la pausa para apartar una rutina.</td><td class="si">Es <code>routineFeedback</code>, el de hoy.</td><td>Un «No» y ningún «Sí» ni «Un poco», como la pausa.</td></tr>
        <tr><td>Por módulo<span class="en">1C</span></td><td>«Estira, 11 de 13. Respira, 7 de 8. Mueve, 5 de 9.»</td><td>Los «¿Te ayudó?» de cada módulo.</td><td class="si">Con <code>feedback.answered</code>.</td><td>8 respuestas en cada módulo.</td></tr>
      </tbody>
    </table></div>
    <div class="fuera">
      <p><b>Lo que se queda fuera, y por qué.</b> El agua: no hay un registro por vaso, solo el total del día. La retención de Respira: es una marca personal y medirla invita a perseguirla. Con qué duración de Foco te concentras más: haría falta apuntar también los Focos que dejas a medias, que hoy no se apuntan; si lo quieres, es una pieza aparte.</p>
      <p><b>Lo que ya hace PACE con esto.</b> Con PACE completo, la carta del lunes de «A tu ritmo» ya trae antes lo que te ayudó, y la pausa ya aparta lo que no. «Qué te ayuda» no cambia nada de tu día: lo cuenta.</p>
    </div>
    <h3>Las otras dos</h3>
    ${P.b}
    ${P.bab || ''}
    ${P.c}
    <ol class="opciones">
      ${opcion('A', 'Tres ideas', 'Lo que te sienta bien, tu hora de Foco y después del Foco. Las tres salen de datos que PACE ya guarda, sirven tanto con «A tu ritmo» como por libre y caben sin scroll en el móvil y en el ordenador (medido en las ocho fotos).', true)}
      ${opcion('B', 'Cinco ideas', 'Las tres de A, más las pausas de tu día y lo que no te convenció. Es lo más completo, pero en el móvil ' + sin(s1b) + (s1bd ? ' y en el ordenador ' + sin(s1bd) : '') + ', y dos de las cinco solo existen para quien usa «A tu ritmo».')}
      ${opcion('C', 'Solo lo que dices', 'Una lista más larga de lo que te sienta bien, por módulo y lo que no te convenció. Es lo más literal («te ayuda» es lo que contestaste), pero no dice nada del Foco, y comparar módulos con pocas respuestas invita a sacar conclusiones que no se sostienen. En el móvil ' + sin(s1c) + '.')}
    </ol>
  </section>

  <section class="decision" id="qd2">
    <span class="num-dec">Decisión 2</span>
    <h2>Qué dice antes de tener bastante</h2>
    <p>Cada idea sale sola cuando llega a su umbral, sin avisos ni celebración. La pregunta es qué se ve antes: el primer día de PACE, y mientras solo hay datos para una o dos.</p>
    ${P['2a']}
    ${P['2am']}
    <h3>Las otras dos</h3>
    ${P['2b']}
    ${P['2c']}
    <ol class="opciones">
      ${opcion('A', 'Callado', '«Todavía es pronto» y una frase que dice que se llena solo, sin contadores ni barras. Cuando sale la primera idea, las que faltan no se nombran: «Lo demás saldrá cuando haya bastante para decirlo». No promete nada ni pide que hagas más.', true)}
      ${opcion('B', 'Lo que vendrá', 'Las tres ideas en tenue, cada una con lo que dirá y «Aún no». Explica la pestaña a quien la abre por primera vez, pero ya es una promesa, y una tarjeta vacía se lee como algo pendiente.')}
      ${opcion('C', 'Lo que hay', '«Llevas 3 respuestas y 5 Focos terminados.» Es verdad y es transparente, pero un contador así se lee como una barra por llenar: empuja a contestar o a hacer Focos para que salga algo.')}
    </ol>
  </section>

  <section class="decision" id="qd3">
    <span class="num-dec">Decisión 3</span>
    <h2>Dónde va</h2>
    <p>Hasta v1, PACE completo está abierto para todos, así que lo verá todo el mundo. Las fotos sin PACE completo son de cómo quedará después, cuando acabe lo abierto.</p>
    <h3>A · Una pestaña más</h3>
    <p>«Hoy · Semana · Mes · Año · Qué te ayuda». Para que quepa, cada pestaña toma el ancho de su nombre en vez de cinco iguales; a 360 px ninguna se corta${cortaTab ? ' (salvo la que marca la medida: revisar)' : ''}. Las fotos de la decisión 1 son esta opción. Sin PACE completo, lleva el candado como Mes y Año y al tocarla se abre la invitación de siempre, sin cambiar de pestaña. En ella, «Tu mes y tu año» pasaría a decir «Tu mes, tu año y qué te ayuda».</p>
    ${P['3ac']}
    ${P['3ai']}
    <h3>B · Dentro de la Semana y del Mes</h3>
    <p>Sin pestaña nueva: una línea al pie de cada vista. La Semana ${sin(s3bs)} en el móvil y ${sin(s3bsd)} en el ordenador; el Mes ${sin(s3bm)} en el móvil y ${sin(s3bmd)} en el ordenador. Solo cabe una frase, así que se pierde de dónde sale cada cosa y no hay sitio para lo de antes (decisión 2). Sin PACE completo, la Semana, que es gratis, queda como hoy, y el Mes ya está cerrado.</p>
    ${P['3bs']}
    ${P['3bm']}
    ${P['3bc']}
    <ol class="opciones">
      ${opcion('A', 'Una pestaña más', 'Un sitio con espacio para cada idea y su porqué, sin tocar lo que ya cabe en Hoy, Semana, Mes y Año. Cerrada, funciona igual que Mes y Año: candado e invitación, y tus datos siguen siendo tuyos en la copia de «Tus datos».', true)}
      ${opcion('B', 'Dentro de la Semana y del Mes', 'Más discreto y sin pestaña nueva, pero cada idea queda en una frase sin su porqué, y añade alto a dos vistas que hoy caben justas.')}
    </ol>
  </section>

  <section class="decision" id="despues">
    <span class="num-dec">Después</span>
    <h2>Cuando elijas</h2>
    <ol class="despues">
      <li><span>Se monta en una versión nueva, en su rama: las ideas que elijas, leídas del registro de verdad con los umbrales de la tabla, en español y en inglés.</span></li>
      <li><span>Pruebas de cada umbral por los dos lados (una respuesta menos no sale, la que falta sí) y de que nada pide scroll a 360 ni a 1280 px.</span></li>
      <li><span>Fotos con tus datos de verdad antes de juntarlo, para tu sí.</span></li>
    </ol>
    <p class="nota" style="margin-top:18px">Las fotos se sacaron sobre el index.html de v0.181.1 con la propuesta metida antes de montar la app; nada de <code>app/</code> ha cambiado. Guiones: <code>docs/traspaso/archivos/que-te-ayuda-27oct/</code>.</p>
  </section>
</main>
<script>
  /* Las otras tres variantes de cada foto; la de claro en español es la del src. */
  var FOTOS = ${JSON.stringify(MAPA)};
  var ver = { pal: 'crema', lang: 'es' };
  document.querySelectorAll('img[data-k]').forEach(function (img) {
    var m = FOTOS[img.getAttribute('data-k')];
    if (m) m['crema-es'] = img.getAttribute('src');
  });
  function pintar() {
    document.querySelectorAll('img[data-k]').forEach(function (img) {
      var m = FOTOS[img.getAttribute('data-k')];
      var src = m && m[ver.pal + '-' + ver.lang];
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
  console.log(SALIDA, Math.round(html.length / 1024) + ' KB', 'scroll 1b:', s1b, s1bd, '3b semana:', s3bs, s3bsd, 'mes:', s3bm, s3bmd, 'tab corta:', cortaTab);
})().catch((e) => { console.error(e); process.exit(1); });
