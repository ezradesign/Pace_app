// La página para que Ez elija N5-N8, con las fotos de la app real (fm/ → pagina/).
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/beautiful-perlman-2b642c';
const sharp = require(R + '/node_modules/sharp');
const B = __dirname.replace(/\\/g, '/') + '/';
const F = B + 'fm/', O = B + 'pagina/', OF = O + 'fotos/';
fs.mkdirSync(OF, { recursive: true });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const usadas = [];

async function webp(nombre, ancho, q) {
  const dst = nombre + '.webp';
  await sharp(F + nombre + '.png').resize({ width: ancho, withoutEnlargement: true }).webp({ quality: q || 72 }).toFile(OF + dst);
  usadas.push(dst);
  return 'fotos/' + dst;
}
async function tira(pal) {
  const piezas = [];
  for (let n = 1; n <= 12; n++) piezas.push(F + `n6-tira-${pal}-${String(n).padStart(2, '0')}.png`);
  const metas = await Promise.all(piezas.map((p) => sharp(p).metadata()));
  const ancho = metas.reduce((a, m) => a + m.width, 0), alto = Math.max(...metas.map((m) => m.height));
  let x = 0;
  const comp = piezas.map((p, i) => { const c = { input: p, left: x, top: 0 }; x += metas[i].width; return c; });
  const dst = `n6-tira-${pal}.webp`;
  await sharp({ create: { width: ancho, height: alto, channels: 3, background: '#000' } }).composite(comp).webp({ quality: 80 }).toFile(OF + dst);
  usadas.push(dst);
  return 'fotos/' + dst;
}
const fig = (src, pie, clase) => `<figure${clase ? ' class="' + clase + '"' : ''}><img src="${src}" alt="${esc(pie.replace(/<[^>]+>/g, ''))}" loading="lazy"><figcaption>${pie}</figcaption></figure>`;
const opcion = (letra, titulo, texto, reco) => `<li class="opcion${reco ? ' reco' : ''}"><span class="letra">${letra}</span><div><p class="otit">${titulo}${reco ? ' <span class="pill">Recomendada</span>' : ''}</p><p>${texto}</p></div></li>`;

(async () => {
  const P = {};
  const tel = async (n) => (P[n] = await webp(n, 360, 72));
  const esc1280 = async (n) => (P[n] = await webp(n, 960, 70));
  const recorte = async (n, w) => (P[n] = await webp(n, w || 400, 82));

  for (const n of ['n5-hoy-360-crema-es', 'n5-A-360-crema-es', 'n5-B-360-crema-es', 'n5-C-360-crema-es', 'n5-Amano-360-crema-es', 'n5-A-360-oscuro-en', 'n5-Amano-360-oscuro-en', 'n5-C-ajustes-360-crema-es']) await tel(n);
  for (const n of ['n5-A-1280-crema-es', 'n5-A-1280-oscuro-en', 'n5-B-1280-oscuro-en', 'n5-C-ajustes-1280-oscuro-en']) await esc1280(n);
  for (const op of ['A', 'B', 'C']) for (const n of [1, 4, 8, 12]) for (const t of ['360-crema-es', '360-oscuro-en']) await recorte(`n6-${op}-${n}-${t}`, 400);
  for (const n of ['n6-A-entera-360-crema-es', 'n6-B-entera-360-crema-es', 'n6-A-entera-360-oscuro-en']) await tel(n);
  for (const n of ['n6-A-entera-1280-oscuro-en', 'n6-A-entera-1280-crema-es']) await esc1280(n);
  P.tiraCrema = await tira('crema'); P.tiraOscuro = await tira('oscuro');
  for (const n of ['n7-hoy-360x730-crema-es', 'n7-A-360x730-crema-es', 'n7-B-360x730-crema-es', 'n7-C-360x730-crema-es', 'n7-A-360x730-oscuro-en', 'n7-A-360x640-crema-en', 'n7-hoy-360x640-crema-en']) await tel(n);
  for (const n of ['n7-A-1280x879-crema-es', 'n7-A-1280x879-oscuro-en', 'n7-B-1280x879-oscuro-en', 'n7-C-1280x879-oscuro-en']) await esc1280(n);
  for (const n of ['n8-donde-1280-crema-es', 'n8-A-1280-oscuro-en', 'n8-B-1280-crema-es', 'n8-C-1280-crema-es']) P[n] = await webp(n, 300, 76);
  for (const n of ['n8-donde-360-crema-es', 'n8-A-360-crema-es', 'n8-A-360-oscuro-en']) await tel(n);
  for (const op of ['hoy', 'A', 'B', 'C']) for (const t of ['1280-crema-es', '360-oscuro-en']) await recorte(`n8-${op}-cerca-${t}`, 520);

  /* Las medidas de la home (N7), de los JSON que dejó el guion de fotos. */
  const filas = [];
  for (const lang of ['es', 'en']) for (const vp of ['360x640', '360x730', '1280x879']) filas.push(JSON.parse(fs.readFileSync(F + `medida-${lang}-${vp}.json`, 'utf8')));
  const celda = (m) => `<td class="${m.sobra > 1 || m.sobraAncha > 1 ? 'mal' : 'bien'}">${m.sobra > 1 || m.sobraAncha > 1 ? m.sobra + ' px' : 'sin scroll'}</td><td class="${m.margen < 0 ? 'mal' : ''}">${m.margen} px</td>`;
  const tablaN7 = `<div class="tabla"><table><thead><tr><th>Idioma</th><th>Pantalla</th><th>Hoy</th><th>margen</th><th>A</th><th>margen</th><th>B</th><th>margen</th><th>C</th><th>margen</th></tr></thead><tbody>` +
    filas.map((f) => `<tr><td>${f.lang === 'es' ? 'Español' : 'Inglés'}</td><td class="num">${f.vp}</td>${celda(f.hoy)}${celda(f.A)}${celda(f.B)}${celda(f.C)}</tr>`).join('') + '</tbody></table></div>';

  const filaN6 = (op, t) => [1, 4, 8, 12].map((n) => fig(P[`n6-${op}-${n}-${t}`], `Rep ${n} de 12`, 'mini')).join('');

  const html = `<title>Pantalla de ejercicio, home y semana</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · N5-N8 del Android de Ez (23 oct. 2026): la página para elegir, con fotos de la app real (index.html de la
     rama claude/franjas-maqueta-n5-n8-7312c7) y cada propuesta metida en el DOM. Guiones en
     docs/traspaso/archivos/franjas-maqueta-25oct/. -->
<style>
  /* Una columna de lectura; cada decisión con sus fotos de móvil en fila y las de escritorio debajo. Los colores son los de PACE. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --line-2: #B8AD8E; --cta: #50624D; --focus: #3E5A3A; --move: #9A7B4F; --breathe: #C97A5D;
    --reco-bg: #E3E6D8; --mal: #A4412D;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --line-2: #5f5544; --cta: #8E9D88; --focus: #A3BC96; --move: #C29F6E; --breathe: #D99477; --reco-bg: #2a3025; --mal: #E38B74; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --line-2: #5f5544; --cta: #8E9D88; --focus: #A3BC96; --move: #C29F6E; --breathe: #D99477; --reco-bg: #2a3025; --mal: #E38B74; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .marco { max-width: 1000px; margin: 0 auto; padding-block: 28px 64px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2, h3 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(36px, 7vw, 52px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(28px, 5.5vw, 36px); line-height: 1.1; margin-bottom: 12px; }
  h3 { font-size: 22px; line-height: 1.2; margin: 26px 0 8px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  .lede { font-size: 17.5px; }
  b { color: var(--ink); font-weight: 600; }
  section.decision { margin-top: 48px; padding-top: 34px; border-top: 1px solid var(--line); }
  .num-dec { font: italic 500 17px/1 var(--display); color: var(--cta); display: block; margin-bottom: 6px; }
  .fila { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 16px 0 10px; align-items: start; }
  .fila.tres { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .fila.dos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fila.ancha { grid-template-columns: minmax(0, 1fr); }
  .fila.minis { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 6px 0 4px; max-width: 760px; }
  .fila.lado { grid-template-columns: minmax(0, 300px) minmax(0, 1fr); }
  @media (max-width: 640px) { .fila, .fila.tres { grid-template-columns: repeat(2, minmax(0, 1fr)); } .fila.lado { grid-template-columns: minmax(0, 1fr); } }
  figure { margin: 0; min-width: 0; }
  figure img { display: block; width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--line); background: var(--paper-2); }
  figure.mini img { border-radius: 8px; }
  figcaption { font: 500 11.5px/1.4 var(--ui); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); margin-top: 7px; }
  figcaption b { color: var(--cta); }
  .rotulo-fila { font: 600 11px/1.3 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); margin: 18px 0 2px; }
  .tira img { border-radius: 8px; border: 1px solid var(--line); width: 100%; height: auto; display: block; }
  .opciones { list-style: none; padding: 0; margin: 20px 0 6px; display: grid; gap: 10px; max-width: 48em; }
  .opcion { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 12px; align-items: start; padding: 14px 16px 6px; border: 1px solid var(--line); border-radius: 12px; }
  .opcion.reco { border-color: var(--cta); background: var(--reco-bg); }
  .letra { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--cta); display: grid; place-items: center; font: italic 500 21px/1 var(--display); color: var(--cta); }
  .opcion.reco .letra { background: var(--cta); color: var(--paper); }
  .otit { font: italic 500 21px/1.35 var(--display); color: var(--ink); margin: 2px 0 6px; }
  .pill { font: 600 10.5px/1 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--cta); border: 1px solid var(--cta); border-radius: 999px; padding: 4px 8px; display: inline-block; vertical-align: 4px; margin: 2px 0 2px 4px; font-style: normal; white-space: nowrap; }
  .tabla { overflow-x: auto; margin: 12px 0 14px; max-width: 100%; }
  table { border-collapse: collapse; font-size: 14px; min-width: 560px; width: 100%; }
  th { text-align: left; font: 600 10.5px/1.3 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); padding: 8px 10px 6px 0; border-bottom: 1px solid var(--line-2); }
  td { padding: 8px 10px 8px 0; border-bottom: 1px dashed var(--line); vertical-align: top; color: var(--ink-2); }
  td.num { font-variant-numeric: tabular-nums; }
  td.bien { color: var(--cta); } td.mal { color: var(--mal); font-weight: 600; }
  .aviso { border-left: 3px solid var(--cta); padding: 4px 0 4px 14px; margin: 14px 0; max-width: 46em; }
  .aviso p { margin: 0 0 6px; }
  details { margin: 12px 0; border-top: 1px dashed var(--line); padding-top: 10px; }
  summary { cursor: pointer; font: italic 500 20px/1.3 var(--display); color: var(--ink); list-style: none; display: flex; gap: 12px; align-items: baseline; }
  summary::-webkit-details-marker { display: none; }
  summary::before { content: '+'; flex: 0 0 14px; font: 400 20px/1 var(--ui); color: var(--cta); }
  details[open] > summary::before { content: '–'; }
  summary:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; border-radius: 4px; }
  .respuesta { margin: 40px 0 8px; border: 1px solid var(--cta); border-radius: 14px; padding: 20px 18px 10px; max-width: 46em; }
  .respuesta ol { list-style: none; padding: 0; margin: 0 0 10px; display: grid; gap: 4px; }
  .respuesta li { display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; gap: 10px; align-items: baseline; padding: 7px 0; border-bottom: 1px dashed var(--line); }
  .respuesta li:last-child { border-bottom: 0; }
  .respuesta .n { font: italic 500 22px/1 var(--display); color: var(--cta); }
  .respuesta .rl { font: 600 13px/1 var(--ui); color: var(--cta); white-space: nowrap; }
  .linea { font: italic 500 24px/1.3 var(--display); color: var(--ink); }
  ul.llano { margin: 6px 0 12px; padding-left: 20px; color: var(--ink-2); max-width: 44em; }
  ul.llano li { margin: 3px 0; }
</style>
<div class="marco">
  <p class="kicker">PACE · lo que viste en tu Android · N5, N6, N7 y N8</p>
  <h1>La pantalla de ejercicio, la home y la semana</h1>
  <p class="lede">Cuatro cambios que pediste el 23 de octubre. Cada foto es la app de verdad con la propuesta puesta encima; nada está montado todavía. La recomendada va primero y la pregunta está al final.</p>

  <section class="decision" id="n5">
    <span class="num-dec">1 · N5</span>
    <h2>Un «Auto» en Mueve y Estira</h2>
    <div class="aviso">
      <p><b>Lo comprobé y hoy ya avanza solo.</b> Dejé correr «Flexiones de escritorio» y «Caderas de pie» sin tocar nada y las dos llegaron al final: cuenta las repeticiones a su ritmo, cambia de lado y sigue tras los descansos.</p>
      <p>El problema es que no se nota: el botón «›» parece que hay que pulsarlo. La propuesta es un interruptor «Auto», encendido de fábrica, que lo deja a la vista. Mientras está encendido, el «›» lleva un aro que se llena hasta que la pantalla pasa sola. Y quien prefiera su ritmo lo apaga.</p>
    </div>
    <div class="tabla"><table>
      <thead><tr><th></th><th>Auto encendido (como hoy)</th><th>Auto apagado</th></tr></thead>
      <tbody>
        <tr><td><b>Colocarse</b></td><td>Cuenta sola (5 s, o 20 s si hay suelo o pared) y empieza.</td><td>Espera a que pulses «›».</td></tr>
        <tr><td><b>Repeticiones</b></td><td>El número sube a su ritmo (unos 4 s cada una) y al llegar al objetivo pasa.</td><td>El número se queda en el objetivo («12 reps · a tu ritmo») y pasa cuando pulsas «›».</td></tr>
        <tr><td><b>Lados</b></td><td>Al acabar el primero, 10 s para cambiar y el segundo empieza solo.</td><td>Al acabar el primero, espera a «›».</td></tr>
        <tr><td><b>Descansos</b></td><td>Cuentan hacia atrás y siguen solos.</td><td>Cuentan hacia atrás, suenan y esperan a «›».</td></tr>
        <tr><td><b>Lo que cuenta</b></td><td>Las repeticiones hechas a su ritmo.</td><td>Las del objetivo, al pulsar «›».</td></tr>
      </tbody></table></div>
    <div class="fila">
      ${fig(P['n5-hoy-360-crema-es'], 'Hoy')}
      ${fig(P['n5-A-360-crema-es'], '<b>A</b> · junto a «Siguiente»')}
      ${fig(P['n5-B-360-crema-es'], '<b>B</b> · arriba, bajo el paso')}
      ${fig(P['n5-C-360-crema-es'], '<b>C</b> · solo el aro; Auto en Ajustes')}
    </div>
    <p class="rotulo-fila">La A con Auto apagado, y en oscuro e inglés</p>
    <div class="fila">
      ${fig(P['n5-Amano-360-crema-es'], '<b>A</b> · apagado')}
      ${fig(P['n5-A-360-oscuro-en'], '<b>A</b> · oscuro, inglés')}
      ${fig(P['n5-Amano-360-oscuro-en'], '<b>A</b> · apagado, inglés')}
      ${fig(P['n5-C-ajustes-360-crema-es'], '<b>C</b> · la fila en Ajustes')}
    </div>
    <p class="rotulo-fila">En el ordenador (1280 × 879)</p>
    <div class="fila dos">
      ${fig(P['n5-A-1280-crema-es'], '<b>A</b> · claro')}
      ${fig(P['n5-A-1280-oscuro-en'], '<b>A</b> · oscuro, inglés')}
    </div>
    <details><summary>La B y la C en el ordenador</summary>
      <div class="fila dos">${fig(P['n5-B-1280-oscuro-en'], '<b>B</b> · junto a «Paso 1 de 5»')}${fig(P['n5-C-ajustes-1280-oscuro-en'], '<b>C</b> · Ajustes')}</div>
    </details>
    <ol class="opciones">
      ${opcion('A', 'El interruptor junto a «Siguiente», encima de los botones', 'Está donde se decide lo que viene, al alcance del pulgar, y no estorba arriba. Se queda encendido o apagado para las siguientes sesiones.', true)}
      ${opcion('B', 'El interruptor arriba, bajo «Paso 1 de 5»', 'Junto a lo que dice en qué paso vas. En el móvil queda lejos del pulgar y cerca del dibujo.')}
      ${opcion('C', 'Sin interruptor en la pantalla: «Avanzar solo» en Ajustes', 'La pantalla solo enseña el aro del «›». Se cambia una vez y no se ve más. En el móvil, una fila más en Ajustes, que hoy caben sin scroll.')}
    </ol>
  </section>

  <section class="decision" id="n6">
    <span class="num-dec">2 · N6</span>
    <h2>El número de las repeticiones, quieto y con color</h2>
    <p>Hoy el número late al ritmo de cada repetición. La propuesta lo deja quieto y le cambia el color según se acerca al final: empieza en naranja y acaba en verde. Solo el número; el aro del dibujo no cambia. Aquí están las doce repeticiones de la A, tal como salen en la app:</p>
    <p class="rotulo-fila">A · las doce, en claro</p>
    <div class="tira">${fig(P.tiraCrema, 'De la 1 a la 12, en claro')}</div>
    <p class="rotulo-fila">A · las doce, en oscuro</p>
    <div class="tira">${fig(P.tiraOscuro, 'De la 1 a la 12, en oscuro')}</div>
    <p class="rotulo-fila">Las tres opciones en las repeticiones 1, 4, 8 y 12 · claro</p>
    <p class="rotulo-fila">A · terracota a oliva</p><div class="fila minis">${filaN6('A', '360-crema-es')}</div>
    <p class="rotulo-fila">B · rojo a verde vivo</p><div class="fila minis">${filaN6('B', '360-crema-es')}</div>
    <p class="rotulo-fila">C · tinta, y verde en las tres últimas</p><div class="fila minis">${filaN6('C', '360-crema-es')}</div>
    <details><summary>Las mismas, en oscuro y en inglés</summary>
      <p class="rotulo-fila">A</p><div class="fila minis">${filaN6('A', '360-oscuro-en')}</div>
      <p class="rotulo-fila">B</p><div class="fila minis">${filaN6('B', '360-oscuro-en')}</div>
      <p class="rotulo-fila">C</p><div class="fila minis">${filaN6('C', '360-oscuro-en')}</div>
    </details>
    <p class="rotulo-fila">La pantalla entera, en la repetición 8</p>
    <div class="fila">
      ${fig(P['n6-A-entera-360-crema-es'], '<b>A</b> · claro')}
      ${fig(P['n6-A-entera-360-oscuro-en'], '<b>A</b> · oscuro, inglés')}
      ${fig(P['n6-B-entera-360-crema-es'], '<b>B</b> · claro')}
    </div>
    <div class="fila dos">${fig(P['n6-A-entera-1280-crema-es'], '<b>A</b> · ordenador, claro')}${fig(P['n6-A-entera-1280-oscuro-en'], '<b>A</b> · ordenador, oscuro')}</div>
    <ol class="opciones">
      ${opcion('A', 'De terracota a oliva', 'Son los dos colores del logo y de la app (el de Respira y el de Foco), mezclados paso a paso. Se lee bien en las dos paletas y no parece una alarma.', true)}
      ${opcion('B', 'De rojo a verde vivo', 'Se entiende de un vistazo, como un semáforo, pero grita más que el resto de PACE y el rojo del principio parece un error.')}
      ${opcion('C', 'Tinta normal, y verde solo en las tres últimas', 'Lo más callado. El cambio solo avisa de que queda poco.')}
    </ol>
  </section>

  <section class="decision" id="n7">
    <span class="num-dec">3 · N7</span>
    <h2>«Hasta las 17:00» debajo de «Bloque 1 de 9»</h2>
    <p>Hoy «Hasta las» va abajo, fuera del aro. La propuesta lo sube debajo de «Bloque 1 de 9», y la cifra y «Empezar jornada» bajan con él. El hueco de abajo se queda, así que no se mueve nada más de la home.</p>
    <div class="fila">
      ${fig(P['n7-hoy-360x730-crema-es'], 'Hoy')}
      ${fig(P['n7-A-360x730-crema-es'], '<b>A</b> · línea pequeña')}
      ${fig(P['n7-B-360x730-crema-es'], '<b>B</b> · en la misma línea')}
      ${fig(P['n7-C-360x730-crema-es'], '<b>C</b> · en cursiva')}
    </div>
    <p class="rotulo-fila">La A en oscuro e inglés, y en el móvil más bajo (360 × 640)</p>
    <div class="fila">
      ${fig(P['n7-A-360x730-oscuro-en'], '<b>A</b> · oscuro, inglés')}
      ${fig(P['n7-hoy-360x640-crema-en'], 'Hoy · 360 × 640')}
      ${fig(P['n7-A-360x640-crema-en'], '<b>A</b> · 360 × 640')}
    </div>
    <div class="fila dos">${fig(P['n7-A-1280x879-crema-es'], '<b>A</b> · ordenador, claro')}${fig(P['n7-A-1280x879-oscuro-en'], '<b>A</b> · ordenador, oscuro')}</div>
    <details><summary>La B y la C en el ordenador</summary>
      <div class="fila dos">${fig(P['n7-B-1280x879-oscuro-en'], '<b>B</b>')}${fig(P['n7-C-1280x879-oscuro-en'], '<b>C</b>')}</div>
    </details>
    <h3>Medido: ninguna pide scroll</h3>
    <p>En las tres pantallas y en los dos idiomas, también con la letra un poco más ancha, como mide la app. El «margen» es lo que queda entre el texto más ancho de arriba y el borde del aro: <b>la B se sale del aro a 360 × 640</b>.</p>
    ${tablaN7}
    <ol class="opciones">
      ${opcion('A', 'Una línea pequeña debajo, con la misma letra de «Bloque 1 de 9»', 'Se lee como parte del rótulo, sin competir con la cifra. Cabe en todas las pantallas con margen.', true)}
      ${opcion('B', 'En la misma línea: «Bloque 1 de 9 · hasta las 17:00»', 'No baja la cifra, pero la línea se hace larga y en el móvil bajo se sale del aro.')}
      ${opcion('C', 'Debajo, en cursiva, como «Trabajo en profundidad»', 'Más cálida, pero se parece al subtítulo de abajo y el aro queda con dos cursivas.')}
    </ol>
  </section>

  <section class="decision" id="n8">
    <span class="num-dec">4 · N8</span>
    <h2>La semana de la barra lateral, con el degradado del logo</h2>
    <p><b>Las barras de progreso de la barra lateral son estas siete cápsulas</b>, una por día (L M X J V S D), que se llenan con los minutos de cada día. No hay otras en la barra. Con la propuesta pasan del oliva de hoy al degradado del logo: naranja abajo y verde arriba.</p>
    <div class="fila lado">
      ${fig(P['n8-donde-1280-crema-es'], 'Aquí viven · ordenador')}
      <div class="fila dos" style="margin:0">${fig(P['n8-donde-360-crema-es'], 'Aquí viven · móvil (el menú ≡)')}</div>
    </div>
    <p class="rotulo-fila">De cerca, con una semana de ejemplo (jueves, hoy)</p>
    <div class="fila">
      ${fig(P['n8-hoy-cerca-1280-crema-es'], 'Hoy')}
      ${fig(P['n8-A-cerca-1280-crema-es'], '<b>A</b> · se descubre al llenarse')}
      ${fig(P['n8-B-cerca-1280-crema-es'], '<b>B</b> · un color por nivel')}
      ${fig(P['n8-C-cerca-1280-crema-es'], '<b>C</b> · solo hoy')}
    </div>
    <div class="fila">
      ${fig(P['n8-hoy-cerca-360-oscuro-en'], 'Hoy · oscuro, inglés')}
      ${fig(P['n8-A-cerca-360-oscuro-en'], '<b>A</b> · oscuro')}
      ${fig(P['n8-B-cerca-360-oscuro-en'], '<b>B</b> · oscuro')}
      ${fig(P['n8-C-cerca-360-oscuro-en'], '<b>C</b> · oscuro')}
    </div>
    <p class="rotulo-fila">La A entera</p>
    <div class="fila">
      ${fig(P['n8-A-1280-oscuro-en'], '<b>A</b> · ordenador, oscuro')}
      ${fig(P['n8-A-360-crema-es'], '<b>A</b> · móvil, claro')}
      ${fig(P['n8-A-360-oscuro-en'], '<b>A</b> · móvil, oscuro')}
    </div>
    <ol class="opciones">
      ${opcion('A', 'El degradado entero, que se descubre al llenarse', 'Cada cápsula lleva el degradado de abajo arriba: un día corto se queda en naranja y uno lleno llega al verde. Hoy, más intenso; los días pasados, más suaves, como ahora.', true)}
      ${opcion('B', 'Un solo color por cápsula, según lo llena que esté', 'Más limpio a 7 px de ancho, pero se pierde la idea de degradado: cada día es un tono plano.')}
      ${opcion('C', 'Solo la cápsula de hoy con el degradado', 'Lo que menos cambia; los otros días siguen en oliva.')}
    </ol>
  </section>

  <section class="decision" id="lo-demas">
    <span class="num-dec">Y además, de tu Android</span>
    <h2>Las franjas y la barra lateral</h2>
    <p><b>N2 · las franjas de arriba y de abajo</b> ya siguen la paleta de PACE y no el modo del móvil, también en el iPhone. Llega con la siguiente versión. Para mirarlo: pon el móvil en claro y PACE en «Oscuro» (Ajustes). Las franjas deben salir oscuras con los iconos claros, también al girar el móvil. La vaca del arranque sigue el modo del móvil, porque la pinta el sistema antes de que PACE sepa tu paleta.</p>
    <p><b>N9 · «la barra lateral cuesta acoplarla durante un Foco»</b>: no lo consigo repetir. Con un Foco en marcha, en el ordenador y en el móvil, el botón ≡ responde a la primera y la barra no se cierra sola. Lo único distinto es que, con el Foco, abrirla tarda el doble en un móvil lento. ¿Me mandas un vídeo corto de la pantalla (Android lo graba desde los ajustes rápidos) y me dices si fue en el ordenador o en el móvil, y si no responde, tarda o no lo encuentras?</p>
  </section>

  <div class="respuesta" id="pregunta">
    <p class="kicker">Lo que hay que decidir</p>
    <ol>
      <li><span class="n">1</span><span>El «Auto» de Mueve y Estira (N5)</span><span class="rl">A · B · C</span></li>
      <li><span class="n">2</span><span>El color del número de las repeticiones (N6)</span><span class="rl">A · B · C</span></li>
      <li><span class="n">3</span><span>«Hasta las» en la home (N7)</span><span class="rl">A · B · C</span></li>
      <li><span class="n">4</span><span>Las cápsulas de la semana (N8)</span><span class="rl">A · B · C</span></li>
    </ol>
    <p>Contesta en una línea, por ejemplo la recomendada:</p>
    <p class="linea">1A 2A 3A 4A</p>
  </div>
</div>
`;
  fs.writeFileSync(O + 'franjas-maqueta.html', html);
  fs.writeFileSync(O + 'usadas.json', JSON.stringify(usadas));
  const peso = usadas.reduce((a, f) => a + fs.statSync(OF + f).size, 0);
  console.log('fotos', usadas.length, Math.round(peso / 1024) + ' KB', 'html', Math.round(html.length / 1024) + ' KB');
})().catch((e) => { console.error(e); process.exit(1); });
