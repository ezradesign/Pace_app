// La página de lo montado en 0.176.2 (antes y después), con las fotos de fa/ → montado/.
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/beautiful-perlman-2b642c';
const sharp = require(R + '/node_modules/sharp');
const B = __dirname.replace(/\\/g, '/') + '/';
const F = B + 'fa/', O = B + 'montado/', OF = O + 'fotos/';
fs.mkdirSync(OF, { recursive: true });
const usadas = [];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
async function webp(n, ancho, q) {
  await sharp(F + n + '.png').resize({ width: ancho, withoutEnlargement: true }).webp({ quality: q || 74 }).toFile(OF + n + '.webp');
  usadas.push(n + '.webp'); return 'fotos/' + n + '.webp';
}
async function tira(ver) {
  const piezas = [...Array(10).keys()].map((d) => F + `cifra-${ver}-${d}.png`);
  const metas = await Promise.all(piezas.map((p) => sharp(p).metadata()));
  let x = 0; const comp = piezas.map((p, i) => { const c = { input: p, left: x, top: 0 }; x += metas[i].width; return c; });
  const n = `cifras-${ver}`;
  await sharp({ create: { width: x, height: metas[0].height, channels: 3, background: '#000' } }).composite(comp).webp({ quality: 82 }).toFile(OF + n + '.webp');
  usadas.push(n + '.webp'); return 'fotos/' + n + '.webp';
}
const fig = (src, pie) => `<figure><img src="${src}" alt="${esc(pie.replace(/<[^>]+>/g, ''))}" loading="lazy"><figcaption>${pie}</figcaption></figure>`;

(async () => {
  const P = {};
  const t = async (n) => (P[n] = await webp(n, 360));
  const e = async (n) => (P[n] = await webp(n, 960, 70));
  const c = async (n, w) => (P[n] = await webp(n, w || 420, 84));
  for (const v of ['antes', 'despues']) {
    await t(`run-${v}-360-crema-es`); await e(`run-${v}-1280-crema-es`);
    await t(`home-${v}-360x730-crema-es`); await t(`home-${v}-360x640-crema-en`); await e(`home-${v}-1280x879-crema-es`);
    await c(`num-3-${v}-360-crema-es`); await c(`num-3-${v}-360-oscuro-en`);
    await c(`semana-cerca-${v}-1280-crema-es`, 520); await c(`semana-cerca-${v}-360-oscuro-en`, 520);
  }
  for (const n of ['run-despues-360-oscuro-en', 'run-mano-despues-360-crema-es', 'home-despues-360x730-oscuro-en']) await t(n);
  for (const n of ['run-despues-1280-oscuro-en', 'run-mano-despues-1280-crema-es', 'home-despues-1280x879-oscuro-en']) await e(n);
  for (const n of ['semana-despues-1280-crema-es', 'semana-despues-1280-oscuro-en']) P[n] = await webp(n, 300, 78);
  for (const n of ['semana-despues-360-crema-es', 'semana-despues-360-oscuro-en']) await t(n);
  P.cifrasAntes = await tira('antes'); P.cifrasDespues = await tira('despues');

  /* La tinta de cada cifra: dónde empieza y acaba, en píxeles de la foto (×2). */
  const cif = {};
  for (const v of ['antes', 'despues']) cif[v] = JSON.parse(fs.readFileSync(F + `cifras-${v}.json`, 'utf8'));
  /* En píxeles de pantalla: las fotos de las cifras van a doble resolución. */
  const rango = (v, k) => { const xs = cif[v].filas.map((f) => f[k]); return (Math.max(...xs) - Math.min(...xs)) / 2; };
  const filaCifras = (v) => cif[v].filas.map((f) => `<td class="num">${f.arriba}–${f.abajo}</td>`).join('');
  const tablaCifras = `<div class="tabla"><table><thead><tr><th></th>${[...Array(10).keys()].map((d) => `<th>${d}</th>`).join('')}<th>diferencia (pantalla)</th></tr></thead><tbody>
    <tr><td>Antes</td>${filaCifras('antes')}<td class="mal">${rango('antes', 'arriba')} / ${rango('antes', 'abajo')} px</td></tr>
    <tr><td>Ahora</td>${filaCifras('despues')}<td class="bien">${rango('despues', 'arriba')} / ${rango('despues', 'abajo')} px</td></tr></tbody></table></div>`;
  const GEO = [['360 × 640', 313, 312, 0, 0, 36, 33], ['360 × 730', 331, 331, 0, 0, 45, 68], ['412 × 844', 379, 379, 0, 0, 68, 91], ['1280 × 879', 420, 420, 0, 0, 60, 89], ['1536 × 714', 337, 336, 0, 1, 41, 55]];
  const tablaGeo = `<div class="tabla"><table><thead><tr><th>Pantalla</th><th>Aro antes</th><th>Aro ahora</th><th>Scroll antes</th><th>Scroll ahora</th><th>Del aro a «Bloque» antes</th><th>Ahora</th></tr></thead><tbody>` +
    GEO.map((g) => `<tr><td>${g[0]}</td><td class="num">${g[1]} px</td><td class="num">${g[2]} px</td><td class="num">${g[3]}</td><td class="num">${g[4]}</td><td class="num">${g[5]} px</td><td class="num">${g[6]} px</td></tr>`).join('') + '</tbody></table></div>';

  const html = `<title>Lo montado en 0.176.2</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · 1A 2A 3C 4B de Ez montados como v0.176.2 (rama claude/franjas-maqueta-n5-n8-7312c7): fotos de la app real,
     antes (index.html de 0.176.0) y ahora. Guiones en docs/traspaso/archivos/franjas-maqueta-25oct/. -->
<style>
  /* Una columna de lectura; cada cambio con su antes y su ahora en pareja. Los colores son los de PACE. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --line-2: #B8AD8E; --cta: #50624D; --focus: #3E5A3A; --mal: #A4412D;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --line-2: #5f5544; --cta: #8E9D88; --focus: #A3BC96; --mal: #E38B74; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --line-2: #5f5544; --cta: #8E9D88; --focus: #A3BC96; --mal: #E38B74; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .marco { max-width: 1000px; margin: 0 auto; padding-block: 28px 64px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(36px, 7vw, 50px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(27px, 5.5vw, 34px); line-height: 1.1; margin-bottom: 12px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  b { color: var(--ink); font-weight: 600; }
  section { margin-top: 46px; padding-top: 32px; border-top: 1px solid var(--line); }
  .num-dec { font: italic 500 17px/1 var(--display); color: var(--cta); display: block; margin-bottom: 6px; }
  .fila { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 14px 0 10px; align-items: start; }
  .fila.tres { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .fila.dos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fila.una { grid-template-columns: minmax(0, 1fr); }
  @media (max-width: 640px) { .fila, .fila.tres { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  figure { margin: 0; min-width: 0; }
  figure img { display: block; width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--line); background: var(--paper-2); }
  figcaption { font: 500 11.5px/1.4 var(--ui); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); margin-top: 7px; }
  figcaption b { color: var(--cta); }
  .rot { font: 600 11px/1.3 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); margin: 18px 0 2px; }
  .aviso { border-left: 3px solid var(--cta); padding: 4px 0 4px 14px; margin: 14px 0; max-width: 46em; }
  .aviso p { margin: 0 0 6px; }
  .tabla { overflow-x: auto; margin: 12px 0 14px; max-width: 100%; }
  table { border-collapse: collapse; font-size: 13.5px; min-width: 560px; width: 100%; }
  th { text-align: left; font: 600 10.5px/1.3 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); padding: 8px 10px 6px 0; border-bottom: 1px solid var(--line-2); }
  td { padding: 8px 10px 8px 0; border-bottom: 1px dashed var(--line); color: var(--ink-2); }
  td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
  td.bien { color: var(--cta); font-weight: 600; } td.mal { color: var(--mal); font-weight: 600; }
</style>
<div class="marco">
  <p class="kicker">PACE · 0.176.2 · lo que elegiste el 25 de octubre: 1A 2A 3C 4B</p>
  <h1>Lo montado, antes y ahora</h1>
  <p>Fotos de la app de verdad: a la izquierda la de hoy (0.176.0) y a la derecha la nueva. A 360 y a 1280 de ancho, en claro y en oscuro.</p>

  <section id="auto">
    <span class="num-dec">1A · el «Auto» de Mueve y Estira</span>
    <h2>Junto a «Siguiente», encendido de fábrica</h2>
    <p>Encendido, todo sigue solo como hasta ahora y el «›» lleva un aro que se llena hasta que la pantalla pasa. Apagado, colocarse, el descanso y el primer lado se quedan en 0 hasta que pulsas «›», y las repeticiones van a tu ritmo: el número es el objetivo. Se queda como lo dejes para las siguientes sesiones.</p>
    <div class="fila">
      ${fig(P['run-antes-360-crema-es'], 'Antes')}
      ${fig(P['run-despues-360-crema-es'], '<b>Ahora</b> · Auto encendido')}
      ${fig(P['run-mano-despues-360-crema-es'], '<b>Ahora</b> · Auto apagado')}
      ${fig(P['run-despues-360-oscuro-en'], '<b>Ahora</b> · oscuro, inglés')}
    </div>
    <div class="fila tres">
      ${fig(P['run-antes-1280-crema-es'], 'Antes · ordenador')}
      ${fig(P['run-despues-1280-crema-es'], '<b>Ahora</b> · ordenador')}
      ${fig(P['run-despues-1280-oscuro-en'], '<b>Ahora</b> · ordenador, oscuro')}
    </div>
  </section>

  <section id="numero">
    <span class="num-dec">2A · el número de las repeticiones</span>
    <h2>Quieto, con color y bien centrado</h2>
    <p>Ya no late. Va del terracota de la primera repetición al oliva de la última. Y las cifras son de caja alta: las de antes eran de estilo antiguo, y el 3, el 4, el 5, el 7 y el 9 bajaban de la línea, y el 6 y el 8 subían. Lo medí con la tinta de cada cifra en la foto: antes, el borde de arriba y el de abajo cambiaban hasta ${rango('antes', 'arriba')} y ${rango('antes', 'abajo')} píxeles de una cifra a otra; ahora, ${rango('despues', 'arriba')} y ${rango('despues', 'abajo')}. Y la tinta queda centrada en la caja del número: en las diez cifras, entre 7,5 y 9 píxeles por arriba y entre 8,5 y 9,5 por abajo (antes, unos 22 arriba y 9 abajo, y las que bajaban se salían 6,5 por debajo).</p>
    <p class="rot">Del 0 al 9, antes</p>
    <div class="fila una">${fig(P.cifrasAntes, 'Antes: el 3, el 4, el 5, el 7 y el 9 bajan')}</div>
    <p class="rot">Del 0 al 9, ahora</p>
    <div class="fila una">${fig(P.cifrasDespues, '<b>Ahora</b>: todas en la misma línea')}</div>
    ${tablaCifras}
    <p class="rot">La tercera repetición, antes y ahora</p>
    <div class="fila">
      ${fig(P['num-3-antes-360-crema-es'], 'Antes · claro')}
      ${fig(P['num-3-despues-360-crema-es'], '<b>Ahora</b> · claro')}
      ${fig(P['num-3-antes-360-oscuro-en'], 'Antes · oscuro')}
      ${fig(P['num-3-despues-360-oscuro-en'], '<b>Ahora</b> · oscuro')}
    </div>
  </section>

  <section id="hasta">
    <span class="num-dec">3C · «Hasta las» en el aro</span>
    <h2>En cursiva, bajo «Bloque 1 de 9», y todo más abajo</h2>
    <p>«Hasta las 17:00» sube al aro, en cursiva, y todo el interior del aro baja, también el botón. El hueco que tenía debajo del aro ya no hace falta y se devuelve a la home.</p>
    <div class="aviso">
      <p><b>El 15 % entero no cabe en todas las pantallas.</b> Al bajar el botón, el aro tiene que crecer para que quepa dentro. A 360 × 640 eso eran 34 píxeles de scroll, y en tu ventana del ordenador (1536 × 714) el aro encogía de 337 a 311 píxeles. Así que baja el 15 % donde cabe (360 × 730, 412 × 844, 1280 × 879), algo menos en tu ventana (el aro se queda igual) y un 5 % en el móvil más bajo. Sin scroll en ninguna, en los dos idiomas (a 1536 × 714 queda un píxel de redondeo).</p>
    </div>
    <div class="fila">
      ${fig(P['home-antes-360x730-crema-es'], 'Antes · 360 × 730')}
      ${fig(P['home-despues-360x730-crema-es'], '<b>Ahora</b> · 360 × 730')}
      ${fig(P['home-despues-360x730-oscuro-en'], '<b>Ahora</b> · oscuro, inglés')}
      ${fig(P['home-despues-360x640-crema-en'], '<b>Ahora</b> · 360 × 640')}
    </div>
    <div class="fila tres">
      ${fig(P['home-antes-1280x879-crema-es'], 'Antes · ordenador')}
      ${fig(P['home-despues-1280x879-crema-es'], '<b>Ahora</b> · ordenador')}
      ${fig(P['home-despues-1280x879-oscuro-en'], '<b>Ahora</b> · ordenador, oscuro')}
    </div>
    ${tablaGeo}
  </section>

  <section id="semana">
    <span class="num-dec">4B · la semana de la barra lateral</span>
    <h2>Un color del degradado del logo en cada cápsula</h2>
    <p>Cada cápsula lleva un solo tono según lo llena que está: terracota un día corto, oliva uno lleno. Hoy, entero; los días pasados, más suaves. Las cápsulas miden lo mismo que antes.</p>
    <div class="fila">
      ${fig(P['semana-cerca-antes-1280-crema-es'], 'Antes · claro')}
      ${fig(P['semana-cerca-despues-1280-crema-es'], '<b>Ahora</b> · claro')}
      ${fig(P['semana-cerca-antes-360-oscuro-en'], 'Antes · oscuro')}
      ${fig(P['semana-cerca-despues-360-oscuro-en'], '<b>Ahora</b> · oscuro')}
    </div>
    <div class="fila">
      ${fig(P['semana-despues-1280-crema-es'], '<b>Ahora</b> · ordenador')}
      ${fig(P['semana-despues-1280-oscuro-en'], '<b>Ahora</b> · ordenador, oscuro')}
      ${fig(P['semana-despues-360-crema-es'], '<b>Ahora</b> · móvil')}
      ${fig(P['semana-despues-360-oscuro-en'], '<b>Ahora</b> · móvil, oscuro')}
    </div>
  </section>
</div>
`;
  fs.writeFileSync(O + 'montado.html', html);
  fs.writeFileSync(O + 'usadas.json', JSON.stringify(usadas.map((f) => ({ path: 'fotos/' + f }))));
  console.log('fotos', usadas.length, 'cifras antes', rango('antes', 'arriba'), rango('antes', 'abajo'), 'ahora', rango('despues', 'arriba'), rango('despues', 'abajo'), JSON.stringify(cif.despues.huecos), JSON.stringify(cif.antes.huecos));
})().catch((e) => { console.error(e); process.exit(1); });
