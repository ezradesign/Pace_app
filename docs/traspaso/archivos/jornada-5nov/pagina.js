/* Monta docs/proposals/jornada-paso-actual.html con las fotos y las fuentes dentro. */
'use strict';
const C = require('./comun');
const fs = C.fs, path = C.path;
const sharp = require('C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/node_modules/sharp');
const SALIDA = path.join(C.RAIZ, 'docs/proposals/jornada-paso-actual.html');

const webp = async (archivo, o) => {
  let s = sharp(path.join(C.FOTOS, archivo));
  if (o.extract) s = s.extract(o.extract);
  const b = await s.resize({ width: o.w }).webp({ quality: 72, effort: 5 }).toBuffer();
  return 'data:image/webp;base64,' + b.toString('base64');
};
const movil = (a) => webp(a, { w: 540 });
/* Escritorio: sin la barra lateral, que no cambia. */
const esc = (a) => webp(a, { w: 1200, extract: { left: 560, top: 0, width: 2000, height: 1600 } });
const aroImg = (a) => webp(a, { w: 1100, extract: { left: 340, top: 0, width: 1577, height: 857 } });
const fuente = (f) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(C.RAIZ, 'fonts', f)).toString('base64');

const MOMENTOS = [
  { n: 1, t: 'Sin jornada preparada',
    a: 'En el móvil, «Comienza» pasa a decir qué hace: «Preparar jornada». En el escritorio no cambia nada: las cuatro losetas ya preparan el día de un toque.',
    b: 'Lo mismo, y además el botón verde es el de preparar. «Empezar foco» sigue en el aro, con contorno, para quien solo quiere el temporizador.' },
  { n: 2, t: 'Jornada preparada, antes de empezar',
    a: 'Hoy ya dice «Empezar jornada» y «Bloque 1 de 9», y elegir el día no arranca nada. En el escritorio se añade «Después: Mueve · 2 min» debajo del botón, en un hueco que ya estaba reservado. En el móvil no hace falta: la fila «Luego» lo dice justo debajo.',
    b: 'Además, Foco / Pausa / Larga deja sitio a «Jornada preparada», y los minutos a «Bloques de 45 min · Cambiar». En el móvil, el estado va junto a «Jornada entera».' },
  { n: 3, t: 'Primer foco en marcha',
    a: '«Pausar» pasa a «Pausar foco» (y «Continuar» a «Reanudar foco»). Así «pausa» queda para el descanso.',
    b: 'Además, arriba dice «Jornada en marcha».' },
  { n: 4, t: 'Foco terminado, pausa pendiente',
    a: 'La ventana sigue igual. Si la cierras con «Ahora no», el aro ya no te empuja al siguiente bloque: el botón verde es «Hacer la pausa» y «Empezar ya el bloque 2» baja a enlace. El reloj sigue contando la pausa.',
    b: 'La ventana desaparece: todo pasa en el aro, que dice «Toca una pausa» y «Mueve · 2 min». Se pierden el dibujo del ejercicio, la frase «Hombros: sin mover hoy» y la fila de Hidrátate.' },
  { n: 5, t: 'Pausa terminada, siguiente foco listo',
    a: 'Hoy ya vuelve solo a «Bloque 2 de 9» y espera a que pulses. Se añade «Pausa terminada» debajo del reloj y, en el escritorio, «Después: …».',
    b: 'Lo mismo, y arriba «Jornada en marcha».' },
];

const fig = (src, pie, clase) => `<figure class="${clase || ''}"><button type="button" class="foto" aria-label="Ampliar: ${pie}"><img src="${src}" alt="${pie}" loading="lazy"></button><figcaption>${pie}</figcaption></figure>`;

(async () => {
  const f = {};
  for (const c of ['hoy', 'A', 'B']) for (const m of [1, 2, 3, 4, 5]) {
    f[c + m + 'm'] = await movil(`${c}/${m}-m.png`);
    f[c + m + 'e'] = await esc(`${c}/${m}-e.png`);
  }
  f.vm = await movil('hoy/4v-m.png'); f.ve = await esc('hoy/4v-e.png');
  const ar = {}; for (const n of ['sin-hoy', 'sin-fina', 'sin-fila']) ar[n] = await aroImg('aro/' + n + '.png');
  ar.tras = await aroImg('aro/tras-bloque.png');
  const M = JSON.parse(fs.readFileSync(path.join(C.FOTOS, 'aro/medidas.json'), 'utf8'));
  const mm = { hoy: JSON.parse(fs.readFileSync(path.join(C.FOTOS, 'hoy/medidas.json'))), A: JSON.parse(fs.readFileSync(path.join(C.FOTOS, 'A/medidas.json'))), B: JSON.parse(fs.readFileSync(path.join(C.FOTOS, 'B/medidas.json'))) };
  const hoyMalos = Object.entries(mm.hoy).filter(([, v]) => v.scroll > 0).length;
  const nuevos = (c) => Object.entries(mm[c]).filter(([k, v]) => v.scroll > ((mm.hoy[k] || {}).scroll || 0));
  console.log('nuevos A', nuevos('A'), 'B', nuevos('B'), 'hoy', hoyMalos);
  const aro = (op, l, t) => (M['sin ' + op + ' ' + l + ' ' + t] || {}).aro;
  const scr = (op, l, t) => (M['sin ' + op + ' ' + l + ' ' + t] || {}).scroll;
  const filaAro = (t, nombre) => `<tr><th scope="row">${nombre}</th><td>${aro('hoy', 'es', t)} px</td><td>${aro('fina', 'es', t)} px</td><td>${aro('fila', 'es', t)} px</td><td>${aro('fila', 'en', t)} px</td></tr>`;
  const scrollOpc = (op) => ['es', 'en'].flatMap((l) => ['1917x857', '1536x710', '1280x800', '1280x720', '1024x700'].map((t) => scr(op, l, t))).reduce((a, b) => Math.max(a, b || 0), 0);
  console.log('scroll opciones', scrollOpc('hoy'), scrollOpc('fina'), scrollOpc('fila'));

  const secciones = MOMENTOS.map((m) => `
<section class="momento" id="m${m.n}">
  <div class="mom-tex">
    <h3><span>${m.n}</span>${m.t}</h3>
    <p class="solo-A"><b>Camino A.</b> ${m.a}</p>
    <p class="solo-B"><b>Camino B.</b> ${m.b}</p>
  </div>
  <div class="par par-mov">
    ${fig(f['hoy' + m.n + 'm'], 'Hoy, a 360 px')}
    ${fig(f['A' + m.n + 'm'], 'Camino A, a 360 px', 'solo-A')}
    ${fig(f['B' + m.n + 'm'], 'Camino B, a 360 px', 'solo-B')}
  </div>
  ${m.n === 4 ? `<div class="ventana"><div class="ven-tex"><h4>Lo primero que sale al acabar el bloque</h4><p>Esta ventana es lo que ChatGPT no vio. Sale antes que el aro, con «Hacer la pausa» como botón principal. La foto de arriba es lo que queda detrás si pulsas «Ahora no» o la cierras. En el camino A se queda igual; en el B no sale.</p></div>${fig(f.vm, 'La ventana hoy, a 360 px', 'v-mov')}${fig(f.ve, 'La ventana hoy, a 1280 px')}</div>` : ''}
  <div class="par par-esc">
    ${fig(f['hoy' + m.n + 'e'], 'Hoy, a 1280 px')}
    ${fig(f['A' + m.n + 'e'], 'Camino A, a 1280 px', 'solo-A')}
    ${fig(f['B' + m.n + 'e'], 'Camino B, a 1280 px', 'solo-B')}
  </div>
</section>`).join('\n');

  const html = `<title>La jornada como paso actual</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Hoja de trabajo para decidir: la paleta y la letra de PACE, las fotos mandan. Una sola paleta clara, como las fotos. */
@font-face { font-family: "Cormorant Garamond"; font-style: italic; font-weight: 400 500; src: url("${fuente('cormorantgaramond-400-italic.woff2')}") format("woff2"); }
@font-face { font-family: "Cormorant Garamond"; font-style: normal; font-weight: 400 500; src: url("${fuente('cormorantgaramond-400-normal.woff2')}") format("woff2"); }
@font-face { font-family: "Inter Tight"; font-weight: 300 600; src: url("${fuente('intertight-400-normal.woff2')}") format("woff2"); }
:root {
  --paper: #F2EDE0; --paper-2: #EAE4D4; --paper-3: #DFD8C4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #77705F;
  --line: #C9C0A8; --focus: #3E5A3A; --focus-cta: #50624D; --breathe: #C97A5D; --move: #9A7B4F;
  --serif: "Cormorant Garamond", Georgia, "Times New Roman", serif; --sans: "Inter Tight", "Segoe UI", system-ui, sans-serif;
}
* { box-sizing: border-box; }
a { color: var(--focus); text-underline-offset: 3px; }
body { background: var(--paper); color: var(--ink); font-family: var(--sans); font-size: 15px; line-height: 1.55; margin: 0;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 64px; }
.hoja { max-width: 1120px; margin: 0 auto; display: grid; gap: 44px; min-width: 0; }
h1, h2, h3, h4 { font-family: var(--serif); font-style: italic; font-weight: 500; line-height: 1.12; margin: 0; text-wrap: balance; }
h1 { font-size: clamp(34px, 6vw, 50px); }
h2 { font-size: clamp(27px, 4vw, 34px); }
h3 { font-size: 25px; display: flex; gap: 12px; align-items: baseline; }
h3 span { font-family: var(--sans); font-style: normal; font-size: 12px; font-weight: 500; color: var(--ink-3); letter-spacing: .08em; }
h4 { font-size: 20px; }
p { margin: 0; max-width: 68ch; }
.bloque { display: grid; gap: 14px; min-width: 0; }
.entrada { display: grid; gap: 12px; }
.entrada .lead { font-family: var(--serif); font-size: 23px; line-height: 1.32; max-width: 40em; }
.reco { background: var(--paper-2); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; display: grid; gap: 8px; max-width: 760px; }
.reco b { font-weight: 600; }
.ceja { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
.tabla { overflow-x: auto; border-top: 1px solid var(--line); }
table { border-collapse: collapse; width: 100%; min-width: 640px; font-size: 14px; }
th, td { text-align: left; vertical-align: top; padding: 10px 14px 10px 0; border-bottom: 1px solid var(--line); }
thead th { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
tbody th { font-weight: 500; }
td { font-variant-numeric: tabular-nums; }
.v { display: inline-block; white-space: nowrap; font-size: 12px; font-weight: 500; padding: 1px 9px; border-radius: 999px; border: 1px solid var(--line); }
.v-si { color: var(--focus); border-color: var(--focus-cta); }
.v-medio { color: #7A5A2A; border-color: var(--move); }
.v-no { color: #A85E43; border-color: var(--breathe); }
.v-ya { color: var(--ink-2); background: var(--paper-2); }
.mando { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--paper); border-bottom: 1px solid var(--line); padding-block: 10px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--paper); }
.mando .sel { display: inline-flex; background: var(--paper-2); border: 1px solid var(--line); border-radius: 999px; padding: 3px; gap: 2px; }
.mando button { font: inherit; font-size: 14px; font-family: var(--serif); font-style: italic; background: transparent; color: var(--ink-2); border: 0; border-radius: 999px; padding: 6px 16px; cursor: pointer; min-height: 36px; }
.mando button[aria-pressed="true"] { background: var(--focus-cta); color: var(--paper); }
button:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.momentos { display: grid; gap: 48px; }
.momento { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: 20px 28px; }
.mom-tex { display: grid; gap: 10px; align-content: start; min-width: 0; }
.par { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; min-width: 0; align-items: start; }
.par-esc { grid-column: 1 / -1; }
.ventana { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .55fr) minmax(0, 1.5fr); gap: 16px; align-items: start; background: var(--paper-2); border-radius: 14px; padding: 16px; }
.ven-tex { display: grid; gap: 8px; }
figure { margin: 0; display: grid; gap: 6px; min-width: 0; }
figcaption { font-size: 12px; color: var(--ink-3); }
.foto { display: block; padding: 0; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: var(--paper); cursor: zoom-in; width: 100%; }
.foto img { display: block; width: 100%; height: auto; }
:root[data-camino="A"] .solo-B, :root[data-camino="B"] .solo-A { display: none; }
.grid-aro { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.lista { margin: 0; padding-left: 18px; display: grid; gap: 8px; max-width: 72ch; }
.pregunta { background: var(--paper-2); border: 1px solid var(--line-2, var(--line)); border-radius: 14px; padding: 20px; display: grid; gap: 14px; }
.op { display: grid; grid-template-columns: 3.2em minmax(0, 1fr); gap: 2px 8px; }
.op b { font-family: var(--serif); font-style: italic; font-size: 22px; font-weight: 500; line-height: 1.2; }
.reco-tag { color: var(--focus); font-weight: 500; }
dialog { border: 0; padding: 0; background: transparent; max-width: 96vw; max-height: 96vh; }
dialog::backdrop { background: rgba(31,28,23,.7); }
dialog img { display: block; max-width: 96vw; max-height: 96vh; border-radius: 10px; }
@media (max-width: 820px) {
  .momento { grid-template-columns: minmax(0, 1fr); }
  .ventana { grid-template-columns: minmax(0, 1fr); }
  .v-mov { max-width: 240px; }
  .grid-aro { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 560px) { .par-esc { grid-template-columns: minmax(0, 1fr); } }
@media (prefers-reduced-motion: no-preference) { .mando button { transition: background 160ms; } }
</style>

<div class="hoja">
  <header class="entrada">
    <div class="ceja">PACE · propuesta de ChatGPT del 5 nov. · para que elijas</div>
    <h1>La jornada como paso actual</h1>
    <p class="lead">Una jornada, un botón principal y un siguiente paso a la vista. Buena parte ya está en la app; lo que falla de verdad está en la pausa.</p>
    <div class="reco">
      <div class="ceja">Lo que te recomiendo</div>
      <p><b>1A y 2B.</b> El camino contenido arregla lo que falla con una o dos sesiones, y de lo que ya elegiste solo cambia la palabra «Comienza». El completo cuesta el triple y quita cosas que funcionan: la ventana de la pausa y los minutos a la vista. Y sin jornada, una tarjeta más fina le da al aro el tamaño que ya tiene después.</p>
      <p><a href="#decidir">Ir a lo que hay que decidir</a></p>
    </div>
  </header>

  <section class="bloque">
    <h2>Lo que dice ChatGPT, comprobado en el código</h2>
    <p>Leyó el código, pero no vio la app funcionando. Esto es lo que hay en la 0.189.1.</p>
    <div class="tabla"><table>
      <thead><tr><th style="width:38%">Lo que afirma</th><th style="width:13%">¿Es así?</th><th>Lo que hay</th></tr></thead>
      <tbody>
        <tr><th scope="row">«Comienza» en el móvil abre la configuración y no arranca el foco</th><td><span class="v v-si">Cierto</span></td><td>Abre «¿Cuánto trabajas hoy?». Es lo que elegiste el 22 oct. (1A). Lo confuso es la palabra, no el gesto.</td></tr>
        <tr><th scope="row">Durante la pausa, el botón principal del aro empieza el siguiente foco</th><td><span class="v v-medio">A medias</span></td><td>El botón dice «Empezar ya el bloque 2». Pero antes sale una ventana con «Hacer la pausa» como botón principal, que ChatGPT no vio. El empujón solo aparece si la cierras.</td></tr>
        <tr><th scope="row">Arriba se elige Foco / Pausa / Larga</th><td><span class="v v-medio">Solo escritorio</span></td><td>En el móvil esos botones ya no están.</td></tr>
        <tr><th scope="row">Hay que deducir que el aro y el plan van juntos</th><td><span class="v v-medio">Menos de lo que dice</span></td><td>El aro ya dice «Bloque 1 de 9» y «Hasta las 17:00», y el botón «Empezar jornada». En el escritorio hay una frase que lo explica; en el móvil, «empieza en el aro, arriba» (tu 2A del 30 oct.).</td></tr>
        <tr><th scope="row">Separar preparar la jornada de empezarla</th><td><span class="v v-ya">Ya es así</span></td><td>Elegir el día no arranca nada. Empieza con «Empezar jornada».</td></tr>
        <tr><th scope="row">No arrancar solo el siguiente foco</th><td><span class="v v-ya">Ya es así</span></td><td>Acabada la pausa, el aro espera a que pulses.</td></tr>
        <tr><th scope="row">El aro mide el paso y la línea mide el día</th><td><span class="v v-ya">Ya es así</span></td><td>El aro va por bloque y la línea, por jornada.</td></tr>
        <tr><th scope="row">Tiempo de pausa y rutina hecha son cosas distintas</th><td><span class="v v-ya">Ya es así</span></td><td>Que pasen los minutos no cuenta la rutina. Solo cuenta si la haces.</td></tr>
        <tr><th scope="row">Falta ver el siguiente paso</th><td><span class="v v-medio">Solo cerca del botón</span></td><td>El móvil ya tiene la fila «Luego». El escritorio lo dice en la barra lateral y en la línea, pero lejos del botón.</td></tr>
        <tr><th scope="row">«Foco 1 de 8 · 25:00»</th><td><span class="v v-no">No es la app</span></td><td>Son «bloques», y la jornada entera da 9 de 45 minutos. La maqueta usa lo de verdad.</td></tr>
      </tbody>
    </table></div>
    <p>Un detalle que ChatGPT tampoco vio, y que ningún camino resuelve: acabada la pausa, el aro dice «Bloque 2» mientras la fila de abajo sigue diciendo «Ahora: Empuje sencillo». Está así a propósito, para que aún puedas hacerla. Si te molesta al verlo, se ve aparte.</p>
  </section>

  <section class="bloque">
    <h2>Los cinco momentos</h2>
    <p>Todas las fotos son la app de verdad con los cambios puestos encima, sin tocar el código. Pulsa una para verla grande.</p>
    <div class="mando">
      <span class="ceja">Comparar hoy con</span>
      <div class="sel" role="group" aria-label="Camino que se compara con hoy">
        <button type="button" id="ver-A" data-c="A" aria-pressed="true">A · contenido</button>
        <button type="button" id="ver-B" data-c="B" aria-pressed="false">B · completo</button>
      </div>
    </div>
    <div class="momentos">${secciones}</div>
  </section>

  <section class="bloque">
    <h2>Los dos caminos</h2>
    <div class="tabla"><table>
      <thead><tr><th style="width:18%"></th><th>A · contenido</th><th>B · completo</th></tr></thead>
      <tbody>
        <tr><th scope="row">Qué cambia</th><td>Textos, el botón del aro durante la pausa y la línea «Después» en el escritorio.</td><td>Todo lo de A. Además quita Foco / Pausa / Larga y los minutos dentro de la jornada, y quita la ventana de la pausa.</td></tr>
        <tr><th scope="row">Una jornada</th><td>Sí, con los botones de arriba aún a la vista en el escritorio.</td><td>Sí, y sin nada que parezca salirse de ella.</td></tr>
        <tr><th scope="row">Un botón principal</th><td>Sí, en los cinco momentos.</td><td>Sí, en los cinco momentos.</td></tr>
        <tr><th scope="row">Siguiente paso a la vista</th><td>Sí.</td><td>Sí.</td></tr>
        <tr><th scope="row">Trabajo (estimado)</th><td>1 o 2 sesiones. Antes hay que trocear <code>FocusTimer.jsx</code>, que va por 496 líneas de 500.</td><td>3 o 4 sesiones.</td></tr>
        <tr><th scope="row">Riesgo</th><td>Bajo. No cambia cómo funciona nada, y hay que ajustar pocas pruebas.</td><td>Alto. Cambia cómo funciona la pausa: 18 archivos de pruebas la tocan, y hay casos que rehacer (comida, pausa larga con dos rutinas, pestaña en segundo plano).</td></tr>
        <tr><th scope="row">Scroll</th><td>Igual que hoy en las 100 medidas.</td><td>Añade 7 px en la pausa a 360×640 en español. Tendría solución, pero hay que encontrar esos 7 px.</td></tr>
        <tr><th scope="row">Marcha atrás</th><td>Fácil.</td><td>Difícil, una vez rehecha la pausa.</td></tr>
      </tbody>
    </table></div>
    <h3>Lo que choca con lo que ya decidiste</h3>
    <ul class="lista">
      <li><b>«Comienza»</b> lo elegiste tú, para que no se confundiera con «Empezar foco». Los dos caminos lo cambian por «Preparar jornada». Es el único choque de A.</li>
      <li><b>La ventana de la pausa</b> (la aprobaste mirándola, con el dibujo que pediste y solo Hidrátate debajo). B la quita.</li>
      <li><b>Los minutos dentro del día</b>: tu 4b del 22 oct. («A mi ritmo · Después de cada bloque») sale al elegir un bloque corto. B lo deja a un toque más, tras «Cambiar».</li>
      <li><b>El aro cuenta la pausa</b> (2A y 3A del 14 oct.). ChatGPT quitaba ese reloj. Los dos caminos lo dejan.</li>
      <li><b>«Hoy voy por libre» como única salida</b>. ChatGPT añadía «Terminar por hoy». No lo he puesto en ninguno.</li>
      <li><b>«Hacer la pausa»</b> es la palabra de tu ventana. La uso en lugar de «Empezar pausa» para que el mismo gesto se llame igual en los dos sitios.</li>
    </ul>
  </section>

  <section class="bloque">
    <h2>El aro que viste más pequeño</h2>
    <p>Lo que viste el 5 nov. es cierto. A 1917×857, sin jornada mide ${aro('hoy', 'es', '1917x857')} px, porque encoge por alto para que quepan debajo las Actividades y «¿Cuánto trabajas hoy?», que ocupan unos 345 de los 857 px. Al elegir el día depende de la opción: ${M['dia 1h'].aro} px con una o dos horas, ${M['dia media'].aro} con media jornada y ${M['dia jornada'].aro} con la jornada entera, que sube a ${mm.hoy['4 es 1917x857'].aro} tras el primer bloque.</p>
    <p>La tarjeta tiene dos pisos y es lo que más se puede recortar. Las Actividades se quedan: las elegiste siempre a la vista (1A del 22 oct.).</p>
    <div class="grid-aro">
      ${fig(ar['sin-hoy'], '2A · Hoy: ' + aro('hoy', 'es', '1917x857') + ' px')}
      ${fig(ar['sin-fina'], '2B · Sin subtítulo y losetas bajas: ' + aro('fina', 'es', '1917x857') + ' px')}
      ${fig(ar['sin-fila'], '2C · Todo en una fila: ' + aro('fila', 'es', '1917x857') + ' px')}
    </div>
    <div class="tabla"><table>
      <thead><tr><th>Ventana</th><th>2A · Hoy</th><th>2B · Más fina</th><th>2C · Una fila</th><th>2C en inglés</th></tr></thead>
      <tbody>
        ${filaAro('1917x857', '1917×857')}
        ${filaAro('1536x710', '1536×710 (tu portátil)')}
        ${filaAro('1280x800', '1280×800')}
        ${filaAro('1280x720', '1280×720')}
      </tbody>
    </table></div>
    <p>A qué se le quita alto: 2B quita el subtítulo «El tiempo incluye las pausas…». 2C quita eso mismo y pone «Ajustar el horario» bajo la pregunta. Con 2B, el aro sin jornada queda casi igual que después (${aro('fina', 'es', '1917x857')} y ${mm.hoy['4 es 1917x857'].aro} px). Con 2C pasa de largo y encogería al elegir el día. A 1280×800 ninguna gana nada: ahí el aro ya topa con su máximo por ancho, 420 px. El móvil no cambia: tiene su propia tarjeta corta. Scroll máximo medido: 2B ${scrollOpc('fina')} px y 2C ${scrollOpc('fila')} px, en los dos idiomas.</p>
  </section>

  <section class="bloque">
    <h2>Cómo lo he medido</h2>
    <p>Scroll de la home en los cinco momentos, en español y en inglés, a 360×640, 375×667, 360×718, 360×730, 390×844, 412×844, 1280×800, 1280×720, 1536×710 y 1917×857: 100 medidas por caso. Hoy, ${hoyMalos} dan 1 px, que es redondeo de la propia home y A deja igual. A no añade ninguno. B añade el de 7 px en la pausa a 360×640 y otro de 1 px en la pausa a 1280×800. La ventana de la pausa no entra en esas medidas. Lo propuesto no se ha probado en Android ni en iPhone: son fotos en Chromium.</p>
  </section>

  <section class="bloque pregunta" id="decidir">
    <h2>Lo que hay que decidir</h2>
    <div class="ceja">1 · Qué camino</div>
    <div class="op"><b>1A</b><span>Contenido: textos, botón del aro en la pausa y «Después». La ventana de la pausa se queda. <span class="reco-tag">Recomendada</span></span></div>
    <div class="op"><b>1B</b><span>Completo: lo anterior, sin Foco / Pausa / Larga ni minutos en la jornada, y sin la ventana.</span></div>
    <div class="ceja">2 · El aro sin jornada</div>
    <div class="op"><b>2A</b><span>Como está hoy.</span></div>
    <div class="op"><b>2B</b><span>Tarjeta más fina, sin subtítulo. <span class="reco-tag">Recomendada</span></span></div>
    <div class="op"><b>2C</b><span>La pregunta y las losetas en una fila: el aro más grande, y la tarjeta más apretada.</span></div>
    <p>Contesta con dos letras, por ejemplo «1A 2B». Y si quieres, antes de montar nada, se puede hacer la prueba que propone ChatGPT: pedirle a alguien que empiece el día sin explicarle nada.</p>
  </section>
</div>

<dialog id="grande" aria-label="Foto ampliada"><img id="grande-img" alt=""></dialog>
<script>
(function () {
  var raiz = document.documentElement;
  raiz.setAttribute('data-camino', 'A');
  var botones = document.querySelectorAll('.mando button');
  botones.forEach(function (b) {
    b.addEventListener('click', function () {
      raiz.setAttribute('data-camino', b.getAttribute('data-c'));
      botones.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    });
  });
  var d = document.getElementById('grande'), g = document.getElementById('grande-img');
  document.querySelectorAll('.foto').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = b.querySelector('img'); g.src = i.src; g.alt = i.alt; d.showModal();
    });
  });
  d.addEventListener('click', function () { d.close(); });
})();
</script>
`;
  fs.writeFileSync(SALIDA, html);
  console.log('escrito', Math.round(html.length / 1024), 'KB');
})().catch((e) => { console.error(e); process.exit(1); });
