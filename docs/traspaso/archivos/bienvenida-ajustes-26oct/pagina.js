// La página para que Ez elija la bienvenida, PACE completo al final y los Ajustes, con fotos de la app real (fm/ → pagina/).
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/mueve-estira-capas-e9ab74';
const sharp = require(R + '/node_modules/sharp');
const B = __dirname.replace(/\\/g, '/') + '/';
const F = B + 'fm/', O = B + 'pagina/', OF = O + 'fotos/';
fs.mkdirSync(OF, { recursive: true });
const usadas = [];
const med = (n) => JSON.parse(fs.readFileSync(F + n + '.json', 'utf8'));

async function webp(nombre, ancho, q) {
  const dst = nombre + '.webp';
  await sharp(F + nombre + '.png').resize({ width: ancho, withoutEnlargement: true }).webp({ quality: q || 74 }).toFile(OF + dst);
  usadas.push(dst);
  return 'fotos/' + dst;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const P = {};
const tel = async (n) => (P[n] = await webp(n, 360, 72));
const pc = async (n) => (P[n] = await webp(n, 960, 70));
const cerca = async (n, w) => (P[n] = await webp(n, w || 520, 82));
const fig = (n, pie) => `<figure><img src="${P[n]}" alt="${esc(pie.replace(/<[^>]+>/g, ''))}" loading="lazy"><figcaption>${pie}</figcaption></figure>`;
const fila = (clase, figs) => `<div class="fila ${clase}">${figs.join('')}</div>`;
const opcion = (letra, titulo, texto, reco) => `<li class="opcion${reco ? ' reco' : ''}"><span class="letra">${letra}</span><div><p class="otit">${titulo}${reco ? ' <span class="pill">Recomendada</span>' : ''}</p>${texto}</div></li>`;

(async () => {
  for (const n of ['ob0-360-crema-es', 'obsemana-360-crema-es', 'home-360-crema-es', 'obsemana-360-oscuro-en',
    'q1A-360-crema-es', 'q1A-360-oscuro-en', 'q1A-360x640-crema-es', 'q1B-360-crema-es', 'q1B-360-oscuro-en', 'q1C-360-crema-es', 'q1C-360-oscuro-en',
    'q2A-360-crema-es', 'q2A-360-oscuro-en', 'q2A-360x640-crema-en', 'q2B-360-crema-es', 'q2B-360-oscuro-en', 'q2B-360x640-crema-es',
    'aj-360-crema-esx740', 'aj-360-crema-esx740-datos', 'aj-360-oscuro-enx740', 'q3A-360-crema-esx740', 'q3A-360-oscuro-enx740', 'q3dlg-360-crema-esx740', 'q3dlg-360-oscuro-enx740']) await tel(n);
  for (const n of ['ob0-1280-crema-es', 'home-1280-oscuro-en', 'q1A-1280-crema-es', 'q1A-1280-oscuro-en', 'q1B-1280-crema-es', 'q1B-1280-oscuro-en',
    'q1C-1280-crema-es', 'q1C-1280-oscuro-en', 'q2A-1280-crema-es', 'q2A-1280-oscuro-en', 'q2B-1280-crema-es', 'q2B-1280-oscuro-en',
    'aj-1536-crema-esx710', 'aj-1366-crema-enx768', 'q3A-1536-crema-esx710', 'q3A-1536-oscuro-enx710', 'q3A-1280-crema-enx800', 'q3B-1536-crema-esx710']) await pc(n);
  for (const n of ['q3A-360-crema-esx740-cerca', 'q3B-360-crema-esx740-cerca', 'q3A-360-oscuro-enx740-cerca', 'q3B-360-oscuro-enx740-cerca']) await cerca(n, 520);
  for (const n of ['q3A-1536-oscuro-enx710-cerca', 'q3B-1536-oscuro-enx710-cerca']) await cerca(n, 600);

  /* La tabla de los Ajustes en el ordenador, de los JSON del guion (con el permiso de avisos de una instalación nueva). */
  const hoy = (n) => med(n).m.sobra, prop = (n) => med(n).A.sobra;
  const c = (v, justo) => v > 0 ? `<td class="mal num">${v} px</td>` : `<td class="bien">sin scroll${justo ? ' (justo)' : ''}</td>`;
  const tablaAj = `<div class="tabla"><table><thead><tr><th>Ventana</th><th>Hoy, español</th><th>Hoy, inglés</th><th>Con 3A o 3B</th></tr></thead><tbody>
    <tr><td class="num">360 × 740 (móvil)</td>${c(hoy('aj-360-crema-esx740'))}${c(hoy('aj-360-oscuro-enx740'))}${c(Math.max(prop('q3-360-crema-esx740'), prop('q3-360-oscuro-enx740')))}</tr>
    <tr><td class="num">1280 × 800</td>${c(hoy('aj-1280-crema-esx800'), true)}${c(hoy('aj-1280-oscuro-enx800'))}${c(Math.max(prop('q3-1280-crema-esx800'), prop('q3-1280-crema-enx800')))}</tr>
    <tr><td class="num">1366 × 768</td>${c(hoy('aj-1366-crema-esx768'))}${c(hoy('aj-1366-crema-enx768'))}${c(Math.max(prop('q3-1366-oscuro-esx768'), prop('q3-1366-crema-enx768')))}</tr>
    <tr><td class="num"><b>1536 × 710</b> (tu ventana)</td>${c(hoy('aj-1536-crema-esx710'))}${c(hoy('aj-1536-crema-enx710'))}${c(Math.max(prop('q3-1536-crema-esx710'), prop('q3-1536-oscuro-enx710')))}</tr>
  </tbody></table></div>`;
  const s640 = [med('q12-640-es'), med('q12-640-en')];
  const cabe640 = s640.every((m) => m['1A'].sobra <= 0 && m['2A'].sobra <= 0 && m['2B'].sobra <= 0);

  const html = `<title>Bienvenida y Ajustes</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · la bienvenida, PACE completo al final y los Ajustes (26 oct. 2026): la página para que Ez elija, con fotos de
     la app real (index.html de la rama claude/bienvenida-ajustes-6e6e31) y cada propuesta metida encima. Guiones en
     docs/traspaso/archivos/bienvenida-ajustes-26oct/. -->
<style>
  /* Una columna de lectura; cada pregunta con «hoy» primero y sus opciones debajo, la recomendada la primera. Los colores son los de PACE. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --line-2: #B8AD8E; --cta: #50624D; --focus: #3E5A3A; --reco-bg: #E3E6D8; --mal: #A4412D;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --line-2: #5f5544; --cta: #8E9D88; --focus: #A3BC96; --reco-bg: #2a3025; --mal: #E38B74; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --line-2: #5f5544; --cta: #8E9D88; --focus: #A3BC96; --reco-bg: #2a3025; --mal: #E38B74; color-scheme: dark; }
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
  .fila.tres { grid-template-columns: repeat(3, minmax(0, 1fr)); max-width: 760px; }
  .fila.dos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fila.cerca { grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 700px; }
  @media (max-width: 640px) { .fila, .fila.tres { grid-template-columns: repeat(2, minmax(0, 1fr)); } .fila.dos, .fila.cerca { grid-template-columns: minmax(0, 1fr); } }
  figure { margin: 0; min-width: 0; }
  figure img { display: block; width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--line); background: var(--paper-2); }
  figcaption { font: 500 11.5px/1.4 var(--ui); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); margin-top: 7px; }
  .rotulo-fila { font: 600 11px/1.3 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); margin: 18px 0 2px; }
  .opciones { list-style: none; padding: 0; margin: 20px 0 6px; display: grid; gap: 10px; max-width: 48em; }
  .opcion { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 12px; align-items: start; padding: 14px 16px 6px; border: 1px solid var(--line); border-radius: 12px; }
  .opcion.reco { border-color: var(--cta); background: var(--reco-bg); }
  .letra { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--cta); display: grid; place-items: center; font: italic 500 21px/1 var(--display); color: var(--cta); }
  .opcion.reco .letra { background: var(--cta); color: var(--paper); }
  .otit { font: italic 500 21px/1.35 var(--display); color: var(--ink); margin: 2px 0 6px; }
  .pill { font: 600 10.5px/1 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--cta); border: 1px solid var(--cta); border-radius: 999px; padding: 4px 8px; display: inline-block; vertical-align: 4px; margin: 2px 0 2px 4px; font-style: normal; white-space: nowrap; }
  .tabla { overflow-x: auto; margin: 12px 0 14px; max-width: 100%; }
  table { border-collapse: collapse; font-size: 14px; min-width: 520px; width: 100%; max-width: 760px; }
  th { text-align: left; font: 600 10.5px/1.3 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); padding: 8px 10px 6px 0; border-bottom: 1px solid var(--line-2); }
  td { padding: 8px 10px 8px 0; border-bottom: 1px dashed var(--line); vertical-align: top; color: var(--ink-2); }
  td.num { font-variant-numeric: tabular-nums; }
  td.bien { color: var(--cta); } td.mal { color: var(--mal); font-weight: 600; }
  .aviso { border-left: 3px solid var(--cta); padding: 4px 0 4px 14px; margin: 18px 0; max-width: 46em; }
  .aviso p { margin: 0 0 6px; }
  ul.llano { margin: 6px 0 12px; padding-left: 20px; color: var(--ink-2); max-width: 44em; }
  ul.llano li { margin: 4px 0; }
  ol.defectos { margin: 8px 0 14px; padding-left: 22px; color: var(--ink-2); max-width: 46em; }
  ol.defectos li { margin: 6px 0; padding-left: 4px; }
  ol.defectos li::marker { font: italic 500 18px var(--display); color: var(--cta); }
  .respuesta { margin: 48px 0 8px; border: 1px solid var(--cta); border-radius: 14px; padding: 20px 18px 10px; max-width: 46em; }
  .respuesta ol { list-style: none; padding: 0; margin: 0 0 10px; display: grid; gap: 4px; }
  .respuesta li { display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; gap: 10px; align-items: baseline; padding: 7px 0; border-bottom: 1px dashed var(--line); }
  .respuesta li:last-child { border-bottom: 0; }
  .respuesta .n { font: italic 500 22px/1 var(--display); color: var(--cta); }
  .respuesta .rl { font: 600 13px/1 var(--ui); color: var(--cta); white-space: nowrap; }
  .linea { font: italic 500 24px/1.3 var(--display); color: var(--ink); }
</style>
<div class="marco">
  <p class="kicker">PACE · 26 de octubre · para elegir</p>
  <h1>La bienvenida y los Ajustes</h1>
  <p class="lede">Tres preguntas. Todas las fotos son de la app de verdad, con cada propuesta pintada encima, en el móvil (360) y en el ordenador (1280, y tu ventana de 1536 × 710), en claro y en oscuro, en español y en inglés. En cada pregunta va primero cómo está hoy y luego las opciones, con la recomendada la primera. La línea para contestar está al final: <b>recomiendo 1A 2A 3A</b>.</p>

  <div class="aviso">
    <p><b>Ya arreglado, sin nada nuevo que se vea</b> (lo que encontró la auditoría, cada uno con su prueba):</p>
    <ul class="llano">
      <li>El idioma que eliges en la bienvenida se queda. Antes, al volver a abrir PACE, volvía al del móvil.</li>
      <li>En Android, el botón Atrás vuelve un paso en la bienvenida. Antes no hacía nada.</li>
      <li>Volver atrás ya no borra lo que habías tocado en «¿Cómo es tu semana?».</li>
      <li>Con el sonido apagado, la voz y el fondo ya no se pueden cambiar con el teclado.</li>
      <li>Al pasar de una pantalla a otra, quien usa el teclado o un lector de pantalla no se pierde.</li>
      <li>Los interruptores de Ajustes se cambian tocando la fila entera, no solo el botón pequeño.</li>
    </ul>
  </div>

  <section class="decision">
    <span class="num-dec">Pregunta 1</span>
    <h2>Enseñar PACE a quien llega</h2>
    <p>Hoy la bienvenida son dos pantallas: qué es PACE, con sus tres promesas, y «¿Cómo es tu semana?». Después llega la home sin más. <b>No cuenta tres cosas</b>: que el aro se toca para empezar un Foco, que al acabar PACE te propone una pausa (moverte, estirar o respirar) y qué hace «A tu ritmo» con tu semana.</p>
    <p class="rotulo-fila">Hoy</p>
    ${fila('', [fig('ob0-360-crema-es', 'Hoy · la primera pantalla'), fig('obsemana-360-crema-es', 'Hoy · tu semana'), fig('home-360-crema-es', 'Hoy · y luego, la home'), fig('obsemana-360-oscuro-en', 'Hoy · en oscuro e inglés')])}
    ${fila('dos', [fig('ob0-1280-crema-es', 'Hoy · ordenador'), fig('home-1280-oscuro-en', 'Hoy · la home, oscuro e inglés')])}
    <p>La bienvenida se ve siempre en claro, también con PACE en oscuro: es la regla de las pantallas con dibujo («sobre el arte, siempre de día»). Las tres opciones la respetan.</p>

    <ol class="opciones">
      ${opcion('A', 'Una pantalla «Así funciona PACE», al final', `<p>Tres líneas con sus dibujos: <b>Foco</b> (toca el aro: 25 minutos de trabajo), <b>la pausa</b> (al acabar, PACE te propone moverte, estirar o respirar) y <b>A tu ritmo</b> (cada mañana, tu día con sus pausas, según tu semana). El botón grande es «Empezar mi primer Foco» y lo empieza ya. «Ahora no» lleva a la home, y «← Atrás» sigue arriba.</p><p>El primer Foco llega con los mismos toques que hoy: hoy son bienvenida, semana, home y «Empezar foco»; con esto, bienvenida, semana y «Empezar mi primer Foco». Enseña lo esencial de un vistazo y no tapa la app.</p>`, true)}
      ${opcion('B', 'Una pista en la home, una sola vez', `<p>La bienvenida queda como hoy. Al llegar a la home, una nota bajo «Empezar foco» cuenta qué pasa (25 minutos y luego una pausa) y se cierra con «Entendido». La primera vez que llega una pausa, otra nota igual. Es la más ligera, pero si cierras rápido no se ve nada más.</p>`)}
      ${opcion('C', 'Una visita guiada por la home', `<p>Cuatro paradas sobre la home de verdad: el aro, las actividades, tu día y los Ajustes, con «Siguiente» y «Saltar la visita». Es la más completa, pero pide cuatro toques si la ves entera, tapa la home mientras dura y, en oscuro, apenas destaca lo que enseña (mira la foto).</p>`)}
    </ol>
    <p>De la más ligera a la más completa: B, A y C. En las tres, saltar es un toque.</p>

    <p class="rotulo-fila">A · «Así funciona PACE»</p>
    ${fila('tres', [fig('q1A-360-crema-es', 'A · móvil'), fig('q1A-360-oscuro-en', 'A · oscuro e inglés'), fig('q1A-360x640-crema-es', 'A · móvil pequeño, 360 × 640')])}
    ${fila('dos', [fig('q1A-1280-crema-es', 'A · ordenador'), fig('q1A-1280-oscuro-en', 'A · ordenador, oscuro e inglés')])}
    <p class="rotulo-fila">B y C · en el móvil</p>
    ${fila('', [fig('q1B-360-crema-es', 'B · móvil'), fig('q1B-360-oscuro-en', 'B · oscuro e inglés'), fig('q1C-360-crema-es', 'C · móvil'), fig('q1C-360-oscuro-en', 'C · oscuro e inglés')])}
    <p class="rotulo-fila">B · la pista, en el ordenador</p>
    ${fila('dos', [fig('q1B-1280-crema-es', 'B · ordenador'), fig('q1B-1280-oscuro-en', 'B · ordenador, oscuro e inglés')])}
    <p class="rotulo-fila">C · la visita, en el ordenador</p>
    ${fila('dos', [fig('q1C-1280-crema-es', 'C · ordenador'), fig('q1C-1280-oscuro-en', 'C · ordenador, oscuro e inglés')])}
  </section>

  <section class="decision">
    <span class="num-dec">Pregunta 2</span>
    <h2>PACE completo al final de la bienvenida</h2>
    <p><b>La pantalla ya está hecha</b>: es la A que elegiste el 16 de octubre, con los dos precios, «Probar 7 días gratis» y «Ahora no» igual de grandes, y «Prefiero pagarlo una vez» debajo. Pero solo sale donde ya se puede comprar, y hoy no se puede en ningún sitio: en la web Stripe está apagado hasta que tengas la cuenta, y en Android y en el iPhone aún no hay compra. Así que hoy nadie la ve y la bienvenida acaba en tu semana. La pregunta es qué enseña mientras tanto.</p>
    <ol class="opciones">
      ${opcion('A', 'Ya, con «abierto hasta v1», y la de comprar cuando se pueda', `<p>La misma pantalla, con lo que es verdad hoy: PACE completo está abierto para todos hasta v1, lo que costará después (2,99 € al mes con 7 días gratis, o 19,99 € una vez) y que al llegar v1 tendrás tu semana de prueba y las rutinas que ya hayas hecho se te quedan, como decidiste el 15 de octubre. Un solo botón, «Comenzar», porque no hay nada que comprar. El día que se pueda comprar en ese sitio, pasa sola a la del 16 de octubre.</p><p>Quien llega ahora sabe desde el principio qué es gratis y qué costará, y el día de v1 no se lleva un susto. Quitar lo que uno ya tenía es lo que más castigan las reseñas.</p>`, true)}
      ${opcion('B', 'Solo cuando se pueda comprar, como hoy', `<p>Nadie ve precios hasta que pueda pagar. Hasta entonces la bienvenida acaba en tu semana. Ese día sale la pantalla del 16 de octubre, tal cual (fotos de abajo).</p>`)}
    </ol>
    <p>${cabe640 ? 'Las dos caben sin scroll en un móvil pequeño (360 × 640), en español y en inglés.' : 'Ojo: alguna no cabe sin scroll a 360 × 640.'} Si eliges 1A, el botón de esta última pantalla será «Empezar mi primer Foco», y el de «Así funciona», «Continuar».</p>
    <p class="rotulo-fila">A · abierto hasta v1</p>
    ${fila('tres', [fig('q2A-360-crema-es', 'A · móvil'), fig('q2A-360-oscuro-en', 'A · oscuro e inglés'), fig('q2A-360x640-crema-en', 'A · móvil pequeño, inglés')])}
    ${fila('dos', [fig('q2A-1280-crema-es', 'A · ordenador'), fig('q2A-1280-oscuro-en', 'A · ordenador, oscuro e inglés')])}
    <p class="rotulo-fila">B · la del 16 de octubre, cuando se pueda comprar</p>
    ${fila('tres', [fig('q2B-360-crema-es', 'B · móvil'), fig('q2B-360-oscuro-en', 'B · oscuro e inglés'), fig('q2B-360x640-crema-es', 'B · móvil pequeño')])}
    ${fila('dos', [fig('q2B-1280-crema-es', 'B · ordenador'), fig('q2B-1280-oscuro-en', 'B · ordenador, oscuro e inglés')])}
  </section>

  <section class="decision">
    <span class="num-dec">Pregunta 3</span>
    <h2>Los Ajustes</h2>
    <p>En el móvil caben sin scroll desde la 0.174.6. Lo que he encontrado, todo comprobable:</p>
    <ol class="defectos">
      <li><b>En el ordenador piden scroll.</b> En tu ventana, 83 px en español y 123 en inglés; «Tus datos» queda debajo del borde. En inglés, también a 1280 × 800, porque dos filas no caben en una línea. La prueba que lo vigila solo mira el español a 1280 × 800.</li>
      <li><b>«Copias, borrar y código» esconde PACE completo.</b> En el móvil, ahí dentro están tu PACE completo y, cuando haya mensual, «Gestionar la suscripción». El nombre no lo dice, y quien busque cómo cancelar no lo va a encontrar.</li>
      <li><b>El interruptor es más pequeño que todo lo de al lado</b>: 32 × 18, junto a píldoras de 24 de alto. Ya se cambia tocando la fila entera. Queda decidir si también se ve más grande.</li>
      <li><b>Palabras de programador.</b> El logro «Curiosidad» dice «Abre los Tweaks», cuando el panel se llama Ajustes. Al exportar sale «Backup descargado», cuando las filas dicen «copia». Y hay un «JSON inválido» y un «Descarga un JSON con tu estado».</li>
      <li><b>Borrar todo e importar preguntan con la ventanita del navegador</b> («pacegrass.app dice…»). Son los dos únicos sitios de PACE con un aviso que no es de PACE.</li>
    </ol>
    <p>No toco el orden de las secciones (Ver, Oír, Sesiones, Tus datos) porque no hay ningún dato que diga que otro orden es mejor. Y no veo nada que sobre. Lo único que falta es una manera de volver a ver «Así funciona PACE» si eliges 1A: iría como un enlace más junto a Seguridad y Privacidad, sin alto nuevo.</p>
    <p class="rotulo-fila">Hoy</p>
    ${fila('tres', [fig('aj-360-crema-esx740', 'Hoy · móvil'), fig('aj-360-crema-esx740-datos', 'Hoy · «Copias, borrar y código»'), fig('aj-360-oscuro-enx740', 'Hoy · oscuro e inglés')])}
    ${fila('dos', [fig('aj-1536-crema-esx710', 'Hoy · tu ventana: Tus datos queda debajo'), fig('aj-1366-crema-enx768', 'Hoy · 1366 × 768 en inglés')])}
    ${tablaAj}

    <ol class="opciones">
      ${opcion('A', 'Los cinco arreglos, con el interruptor de 40 × 24', `<ul class="llano">
        <li>En las pantallas bajas del ordenador, «Tus datos» se pliega en su línea, como en el móvil, y se abre con un toque. Sin scroll en ninguna ventana de la tabla, en los dos idiomas.</li>
        <li>La entrada se llama «Copias, borrar y PACE completo».</li>
        <li>El interruptor pasa a 40 × 24, la altura de las píldoras.</li>
        <li>Las palabras: «copia» en todas partes, «Abre los Ajustes» en el logro y nada de JSON.</li>
        <li>Borrar todo e importar preguntan con un aviso de PACE, que además recuerda exportar antes una copia.</li></ul>`, true)}
      ${opcion('B', 'Lo mismo, con el interruptor como hoy', `<p>Los mismos arreglos, pero el interruptor se queda en 32 × 18. Ya se cambia tocando la fila entera, así que el dedo no es el problema. Solo cambia cómo se ve.</p>`)}
    </ol>
    <p class="rotulo-fila">A</p>
    ${fila('tres', [fig('q3A-360-crema-esx740', 'A · móvil'), fig('q3A-360-oscuro-enx740', 'A · oscuro e inglés'), fig('q3dlg-360-crema-esx740', 'A y B · el aviso de borrar')])}
    ${fila('dos', [fig('q3A-1536-crema-esx710', 'A · tu ventana, sin scroll'), fig('q3A-1536-oscuro-enx710', 'A · tu ventana, oscuro e inglés')])}
    <p class="rotulo-fila">El interruptor de cerca: A arriba, B (como hoy) abajo</p>
    ${fila('cerca', [fig('q3A-360-crema-esx740-cerca', 'A · 40 × 24'), fig('q3A-360-oscuro-enx740-cerca', 'A · oscuro')])}
    ${fila('cerca', [fig('q3B-360-crema-esx740-cerca', 'B · 32 × 18, como hoy'), fig('q3B-360-oscuro-enx740-cerca', 'B · oscuro')])}
    ${fila('dos', [fig('q3B-1536-crema-esx710', 'B · tu ventana'), fig('q3dlg-360-oscuro-enx740', 'El aviso de borrar, oscuro e inglés')])}
  </section>

  <div class="respuesta">
    <p class="kicker">Para contestar</p>
    <ol>
      <li><span class="n">1</span><span>Enseñar PACE a quien llega</span><span class="rl">A · B · C</span></li>
      <li><span class="n">2</span><span>PACE completo al final de la bienvenida</span><span class="rl">A · B</span></li>
      <li><span class="n">3</span><span>Los Ajustes</span><span class="rl">A · B</span></li>
    </ol>
    <p>Contesta con una línea, como esta, que es la recomendada:</p>
    <p class="linea">1A 2A 3A</p>
  </div>
</div>
`;
  fs.writeFileSync(O + 'index.html', html);
  fs.writeFileSync(O + 'fotos.json', JSON.stringify(usadas));
  console.log('fotos', usadas.length, 'html', html.length);
})();
