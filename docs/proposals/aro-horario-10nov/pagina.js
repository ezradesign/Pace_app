/* Monta la página para Ez con lo que midió y fotografió pintar.js (opciones.json y fotos/).
   Uso: node docs/proposals/aro-horario-10nov/pagina.js  →  aro-horario.html (una sola hoja, fotos dentro).
   Cada foto va UNA vez, como fondo de una clase: las de hoy salen en las tres opciones sin pesar el triple. */
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const M = JSON.parse(fs.readFileSync(path.join(DIR, 'opciones.json'), 'utf8'));

const fila = (op, est, w, lang = 'es') => M[op].find((f) => f.estado === est && f.w === w && f.lang === lang);
const salto = (op, w, lang = 'es') => M[op].find((f) => f.estado === 'salto 3→1' && f.w === w && f.lang === lang).salto;
/* Nada tapado ni scroll: en las dos ventanas, los dos idiomas y los cuatro estados. */
const limpio = (op) => M[op].filter((f) => f.aro).every((f) => f.scroll === 0 && f.fondo <= f.ventana);
const peorScroll = (op) => Math.max(...M[op].filter((f) => f.aro).map((f) => f.scroll));
const movilIgual = (op) => op === 'hoy' || M.movil[op].every((f, i) => f.aro === M.movil.hoy[i].aro && f.scroll === M.movil.hoy[i].scroll);

const fotos = fs.readdirSync(path.join(DIR, 'fotos')).filter((f) => f.endsWith('.webp'));
const css = fotos.map((f) => `.f-${f.replace('.webp', '')} { background-image: url(data:image/webp;base64,${fs.readFileSync(path.join(DIR, 'fotos', f)).toString('base64')}); }`).join('\n');
const foto = (nombre, w, h, alt) => `<div class="foto f-${nombre}" style="aspect-ratio: ${w} / ${h}" role="img" aria-label="${alt}"></div>`;

const h3 = fila('hoy', '3', 1920), h1 = fila('hoy', '1', 1920), h2 = fila('hoy', '2', 1920);
const OPS = {
  A: { titulo: 'El aro no se mueve al abrir el horario',
    frase: 'Se queda del tamaño que tiene con las actividades y la tarjeta lo corta a la misma altura que ellas. La tarjeta no cambia.',
    pierde: 'Al elegir rutina el aro sigue creciendo, como hoy.' },
  B: { titulo: 'El aro ya del tamaño de la rutina elegida',
    frase: 'Al abrir el horario el aro crece a su tamaño de la rutina y ahí se queda al elegir. Para que quepa, la tarjeta pasa de cuatro líneas a dos, con el mismo texto.',
    pierde: 'Deshace lo que elegiste el 5 de noviembre: el horario de la jornada y el de la media jornada en dos líneas, para leer de un vistazo cuál es cuál.' },
  C: { titulo: 'El aro el mayor que cabe, sin tocar la tarjeta',
    frase: 'La tarjeta lo corta a la misma altura que en los otros dos y el aro toma el sitio que queda. Como la tarjeta del horario es alta, queda algo más pequeño que con las actividades.',
    pierde: 'Sigue cambiando de tamaño al abrir el horario, ahora encogiendo un poco, y luego crece al elegir rutina.' },
};
const RECO = 'A';

const opcion = (op) => {
  const o = OPS[op], a = fila(op, '1', 1920), b = fila(op, '1', 1536), s = salto(op, 1920);
  return `<section class="opcion${op === RECO ? ' reco' : ''}" id="op-${op}">
  <div class="cab"><span class="letra">${op}</span><h2>${o.titulo}</h2>${op === RECO ? '<span class="sello">La que recomiendo</span>' : ''}</div>
  <p>${o.frase}</p>
  ${foto(op + '-1-1920x860', 1920, 860, 'Opción ' + op + ', horario abierto, a 1920 por 860')}
  <p class="datos">Aro de <b>${a.aro} px</b> (hoy ${h1.aro}) y se ve el <b>${a.aroVisible} %</b> del círculo (hoy ${h1.aroVisible} %). Al abrir el horario pasa de ${s[0]} a ${s[1]} px. ${limpio(op) ? 'Sin scroll y sin nada tapado' : 'Ojo: ' + peorScroll(op) + ' px de scroll'} a 1920×860 y a 1536×710, en español y en inglés. ${movilIgual(op) ? 'El móvil no cambia.' : 'Ojo: el móvil cambia.'}</p>
  <p class="pierde"><b>Lo que no te da:</b> ${o.pierde}</p>
  <div class="tres">
    <figure>${foto('hoy-3-1920x860', 1920, 860, 'Con actividades, como hoy')}<figcaption>Con actividades · ${h3.aro} px · como hoy</figcaption></figure>
    <figure>${foto(op + '-1-1920x860', 1920, 860, 'Horario abierto, opción ' + op)}<figcaption><b>Horario abierto · ${a.aro} px</b></figcaption></figure>
    <figure>${foto('hoy-2-1920x860', 1920, 860, 'Rutina elegida, como hoy')}<figcaption>Rutina elegida · ${h2.aro} px · como hoy</figcaption></figure>
  </div>
  <figure class="otra">${foto(op + '-1-1536x710', 1536, 710, 'Opción ' + op + ' en la ventana de 1536 por 710')}<figcaption>En tu otra ventana, 1536×710: aro de ${b.aro} px (hoy ${fila('hoy', '1', 1536).aro}), se ve el ${b.aroVisible} %.</figcaption></figure>
</section>`;
};

const tabla = () => {
  const linea = (op, w) => {
    const c = (e) => fila(op, e, w).aro;
    return `<tr${op === RECO ? ' class="tuya"' : ''}><td>${op === 'hoy' ? 'Hoy' : op}</td><td class="n">${c('3')}</td><td class="n">${c('1')}</td><td class="n">${c('2')}</td><td class="n">${fila(op, '1', w).aroVisible} %</td></tr>`;
  };
  return ['1920', '1536'].map((w) => `<div class="tabla"><table><caption>${w === '1920' ? '1920×860' : '1536×710'}, en español</caption>
<thead><tr><th></th><th class="n">Con actividades</th><th class="n">Horario abierto</th><th class="n">Rutina elegida</th><th class="n">Se ve del aro, horario abierto</th></tr></thead>
<tbody>${['hoy', 'A', 'B', 'C'].map((op) => linea(op, +w)).join('')}</tbody></table></div>`).join('\n');
};

const html = `<title>El aro del horario</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Inter:wght@400;500;600&display=swap">
<style>
/* Una hoja de trabajo de PACE: columna de lectura, fotos de la app de verdad a lo ancho. */
:root {
  --papel: #f3ede2; --hoja: #faf6ee; --tinta: #2b2620; --suave: #6f665a;
  --oliva: #55654a; --terracota: #b5643f; --linea: #ddd3c3;
  --serif: "Cormorant Garamond", Georgia, serif;
  --texto: "Inter", system-ui, sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --papel: #1d1a14; --hoja: #26221b; --tinta: #eee6d8; --suave: #b3a895;
  --oliva: #a3b58f; --terracota: #e0906a; --linea: #3d372d; color-scheme: dark } }
:root[data-theme="dark"] {
  --papel: #1d1a14; --hoja: #26221b; --tinta: #eee6d8; --suave: #b3a895;
  --oliva: #a3b58f; --terracota: #e0906a; --linea: #3d372d; color-scheme: dark }
body { background: var(--papel); color: var(--tinta); font: 15px/1.6 var(--texto);
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 40px 64px; }
main { max-width: 1040px; margin: 0 auto; display: grid; gap: 44px; }
h1, h2 { font-family: var(--serif); font-style: italic; font-weight: 600; line-height: 1.1; text-wrap: balance; margin: 0; }
h1 { font-size: 46px; }
h2 { font-size: 28px; }
p { margin: 0; max-width: 68ch; }
section { display: grid; gap: 16px; }
.lead { font-size: 17px; }
.foto { width: 100%; max-width: 100%; background-size: cover; border: 1px solid var(--linea); border-radius: 4px; }
figure { margin: 0; display: grid; gap: 6px; min-width: 0; }
figcaption { font-size: 13px; color: var(--suave); }
figcaption b { color: var(--tinta); font-weight: 600; }
.tres { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.otra { max-width: 62%; }
.opcion { background: var(--hoja); border: 1px solid var(--linea); border-radius: 8px; padding: 22px; }
.opcion.reco { border-color: var(--oliva); border-width: 2px; }
.cab { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: baseline; }
.letra { font-family: var(--serif); font-style: italic; font-size: 38px; line-height: 1; color: var(--terracota); }
.sello { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--hoja); background: var(--oliva); padding: 3px 9px; border-radius: 99px; }
.datos { font-size: 14px; }
.pierde { color: var(--suave); }
.pierde b { color: var(--tinta); font-weight: 600; }
.tabla { overflow-x: auto; }
table { border-collapse: collapse; font-variant-numeric: tabular-nums; min-width: 560px; width: 100%; }
caption { text-align: left; font-size: 13px; color: var(--suave); padding-bottom: 6px; }
th, td { text-align: left; padding: 7px 12px; border-bottom: 1px solid var(--linea); }
th { font-weight: 500; color: var(--suave); font-size: 13px; }
.n { text-align: right; }
tr.tuya td { background: var(--hoja); font-weight: 600; }
.reco-txt { border-top: 2px solid var(--oliva); padding-top: 18px; }
.reco-txt h2 { color: var(--oliva); }
@media (max-width: 640px) {
  h1 { font-size: 36px; }
  .tres { grid-template-columns: 1fr; }
  .otra { max-width: 100%; }
  .opcion { padding: 16px; }
}
${css}
</style>

<main>
<header style="display:grid;gap:14px">
  <h1>El aro con el horario abierto</h1>
  <p class="lead">Dijiste que el aro de «¿Cuánto trabajas hoy?», con el horario abierto, queda raro, y que te gustan los otros dos. Aquí está por qué pasa y tres maneras de arreglarlo. En las tres, el aro con actividades y el de la rutina elegida se quedan exactamente como están.</p>
</header>

<section>
  <h2>Hoy, en tu ventana (1920×860)</h2>
  <div class="tres">
    <figure>${foto('hoy-3-1920x860', 1920, 860, 'Hoy, con actividades')}<figcaption>Con actividades · aro de ${h3.aro} px · se ve el ${h3.aroVisible} %</figcaption></figure>
    <figure>${foto('hoy-1-1920x860', 1920, 860, 'Hoy, horario abierto')}<figcaption><b>Horario abierto · ${h1.aro} px · se ve el ${h1.aroVisible} %</b></figcaption></figure>
    <figure>${foto('hoy-2-1920x860', 1920, 860, 'Hoy, rutina elegida')}<figcaption>Rutina elegida · ${h2.aro} px · se ve el ${h2.aroVisible} %</figcaption></figure>
  </div>
  <p><b>Por qué queda raro.</b> Con el horario abierto, la tarjeta se mete más dentro del aro que las actividades o que la rutina: le tapa la parte de abajo y solo se ve el ${h1.aroVisible} % del círculo, frente al ${h3.aroVisible} % de los otros dos. Por eso parece una herradura cortada. La causa: encima de las tarjetas de Respira, Estira y Mueve está el rótulo «Actividades», que deja aire entre el aro y las tarjetas; la tarjeta del horario no tiene rótulo, así que su borde sube hasta donde estaría.</p>
  <p>Además, el aro cambia de tamaño en cada paso: ${h3.aro} px con actividades, ${h1.aro} al abrir el horario y ${h2.aro} al elegir rutina. (En la ventana de 1536×710: ${fila('hoy', '3', 1536).aro}, ${fila('hoy', '1', 1536).aro} y ${fila('hoy', '2', 1536).aro}.)</p>
</section>

${['A', 'B', 'C'].map(opcion).join('\n\n')}

<section class="reco-txt">
  <h2>Recomiendo la A</h2>
  <p>Es la más tranquila: mientras ajustas el horario, el aro no se mueve, porque tiene el tamaño que ya te gusta con las actividades, y lo corta la tarjeta a la misma altura que en los otros dos estados. La tarjeta no se toca. La B te da el aro grande antes, pero obliga a apretar la tarjeta en dos líneas, justo lo que no elegiste el 5 de noviembre. La C arregla el corte pero hace que el aro encoja al abrir el horario y vuelva a crecer al elegir.</p>
  ${tabla()}
  <p class="pierde">Medido sobre la app de verdad (v0.197.0) a las 10:00, con la barra lateral abierta. Dime una letra y la monto.</p>
</section>
</main>
`;
fs.writeFileSync(path.join(DIR, 'aro-horario.html'), html);
console.log('aro-horario.html', Math.round(Buffer.byteLength(html) / 1024) + ' KB');
