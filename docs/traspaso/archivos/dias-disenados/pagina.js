/* PACE · la página para Ez: los días diseñados (17 oct. 2026)
   Uso, después de medir/medir-dias.js json y de fotos.js (ahora, frase, nada, cabecera):
     node docs/traspaso/archivos/dias-disenados/pagina.js
   Escribe dias.html; las fotos van aparte (fotos/*.jpg) y se publican con la página. */
'use strict';
const fs = require('fs');
const path = require('path');
const M = require('./medir/medidas.json');
const css = fs.readFileSync(path.join(__dirname, '../series-16oct/aro-corto.html'), 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];

const med = (forma, conjunto, op, aro) => M.medidas.find((x) => x.forma === forma && x.conjunto === conjunto && x.op === op && x.aro === aro);
const CASOS = [['jornada', 45, 'Jornada, el aro de fábrica (45)'], ['jornada', 25, 'Jornada, aro a 25'], ['jornada', 10, 'Jornada, aro a 10'],
  ['2h', 25, '«Dos horas», aro a 25'], ['2h', 10, '«Dos horas», aro a 10']];
const FORMAS = [['hoy', null, 'Hoy'], ['intencion', 'pared', 'A · la intención'], ['momentos', 'pared', 'C · solo los momentos']];
const celda = (v, suf) => (v == null ? '—' : v + (suf || ''));
function tablaCasos() {
  const filas = [];
  CASOS.forEach(([op, aro, nombre]) => {
    FORMAS.forEach(([f, c, fn], i) => {
      const x = med(f, c, op, aro);
      const dia = op === 'jornada';
      filas.push(`<tr class="${i === 0 ? 'nuevo' : ''} ${f === 'intencion' ? 'rec' : ''}">${i === 0 ? `<th rowspan="3" scope="rowgroup">${nombre}</th>` : ''}<td>${fn}</td>`
        + `<td>${x.pie} %</td><td>${dia ? x.tardePie + ' %' : '—'}</td><td>${x.maxSentadas}</td><td>${x.distintas.split(',')[0]}</td>`
        + `<td>${f === 'momentos' ? '—' : x.delDia + ' %'}</td><td>${dia ? celda(x.paseo, ' %') : '—'}</td></tr>`);
    });
  });
  return `<div class="ancho"><table class="casos"><thead><tr><th>Caso</th><th>Forma</th><th>Pausas de pie</th><th>La tarde, de pie</th>
    <th>Sentadas seguidas, como mucho</th><th>Rutinas distintas por semana</th><th>Pausas en la zona del día</th><th>Paseo tras comer</th></tr></thead>
    <tbody>${filas.join('')}</tbody></table></div>`;
}
/* El miércoles 14, la misma jornada hoy y con la propuesta (A, con la pared). */
function miercoles(op, aro) {
  const a = M.ejemplos[['hoy', '', op, aro].join('|')][2].fila;
  const b = M.ejemplos[['intencion', 'pared', op, aro].join('|')][2].fila;
  const fr = (p) => {
    const k = p.frase.split(':');
    return { comida: 'Después de comer, de pie', sentado: 'Llevas ' + k[1] + ' min sentado', zona: k[1] + ': sin mover hoy', larga: 'Dos horas: sal de la silla',
      cierre: 'Para cerrar, despacio', dia: 'Miércoles: la espalda', tarde: 'La tarde, de pie' }[k[0]] || '';
  };
  const pinta = (p) => `<span class="pl ${p.pie ? 'pie' : ''}">${p.platos.join(' + ')}</span>${fr(p) ? `<span class="fr">${fr(p)}</span>` : ''}`;
  const n = Math.max(a.length, b.length);
  const filas = [];
  for (let i = 0; i < n; i++) {
    const x = a[i], y = b[i];
    filas.push(`<tr${(y || x).tarde ? ' class="tarde"' : ''}><td class="h">${(x || y).hora}</td><td>${x ? pinta(x) : ''}</td><td>${y ? pinta(y) : ''}</td></tr>`);
  }
  return `<div class="ancho"><table class="dia"><thead><tr><th>Hora</th><th>Hoy</th><th>Con el día diseñado (A)</th></tr></thead><tbody>${filas.join('')}</tbody></table></div>`;
}
const img = (n, alt, cap, cls) => `<figure${cls ? ` class="${cls}"` : ''}><img src="fotos/${n}.jpg" alt="${alt}" loading="lazy"><figcaption>${cap}</figcaption></figure>`;

const html = `<title>Los días diseñados</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<style>${css}
.ancho { overflow-x: auto; max-width: 100%; }
table.casos, table.dia, table.semana { border-collapse: collapse; font-size: 14px; font-variant-numeric: tabular-nums; min-width: 640px; }
table.casos th, table.casos td, table.dia th, table.dia td, table.semana th, table.semana td { text-align: left; padding: 6px 12px 6px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
table thead th { font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
table.casos tbody th { font-weight: 600; color: var(--ink); padding-right: 16px; }
table.casos tr.nuevo td, table.casos tr.nuevo th { border-top: 2px solid var(--line); }
table.casos tr.rec td { background: var(--mark); }
table.dia td.h { color: var(--ink-3); white-space: nowrap; }
table.dia .pl { display: block; color: var(--ink-2); }
table.dia .pl.pie { color: var(--ink); font-weight: 600; }
table.dia .pl.pie::before { content: '↑ '; color: var(--focus); }
table.dia .fr { display: block; font-family: var(--serif); font-style: italic; font-size: 15px; color: var(--ink-3); }
table.dia tr.tarde td { background: var(--mark); }
ul.lista { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; max-width: 64ch; color: var(--ink-2); }
ul.lista b { color: var(--ink); }
.trio { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
@media (max-width: 760px) { .trio { grid-template-columns: minmax(0, 1fr); } }
.trio .op img { max-width: 100%; }
.nota { font-size: 14px; color: var(--ink-3); }
</style>
<main class="hoja">
  <header style="display:flex;flex-direction:column;gap:12px">
    <div class="eyebrow">PACE · «A tu ritmo» · 17 oct. 2026</div>
    <h1>Los días diseñados</h1>
    <p>Elegiste ofrecer <b>días con rutinas bien hechas y medidas</b>. Hoy cada día ya lleva un tema y las series eligen cada
      pausa, pero el día no tiene intención y <b>la tarde se queda sentada</b>. Esta página propone qué es un día diseñado,
      con los números de treinta días laborables y fotos de la app real del miércoles 14. Al final, cuatro preguntas.</p>
  </header>

  <section>
    <h2>Lo que pasa hoy por la tarde</h2>
    <p>Jornada de 9:00 a 17:00, comida a las 14:00, el aro a 25. Por la mañana las series van alternando de pie y sentado.
      Después de comer ya se han usado las seis rutinas de pie que caben junto a la mesa, así que las tres pausas de la tarde
      son <b>sentadas</b>: Gemelos subrepticios, Grip y Hombros · círculos. Con el aro a 10, dos de tres.</p>
    <div class="par">
      ${img('ahora-mov-dia-tarde', 'La tarde de hoy en la app: tres pausas sentadas tras comer', 'Hoy: la tarde, en «Ver todo»', 'mov')}
      ${img('frase-mov-dia-tarde', 'La tarde con el día diseñado: Paseo corto, Flexiones de escritorio y Cadena posterior de pie', 'Con el día diseñado: el paseo y dos de pie', 'mov')}
    </div>
  </section>

  <section>
    <h2>Qué es un día diseñado (la forma A)</h2>
    <p>Dos cosas que se suman a las series, sin quitarles nada.</p>
    <ul class="lista">
      <li><b>Los momentos, todos los días</b> (los de la revisión de los ejercicios): al empezar, algo de pie; <b>tras comer, el Paseo corto</b>;
        <b>la tarde, siempre de pie</b>; y el cierre, un Respira lento.</li>
      <li><b>Una intención por día</b>, de lunes a viernes: el día inclina las series hacia su zona (cuenta un poco más que «sin mover hoy»),
        y donde ya había una forma propia, se queda.</li>
    </ul>
    <div class="ancho"><table class="semana"><thead><tr><th>Día</th><th>Intención</th><th>Lo que inclina</th><th>Lo que ya tenía</th><th>La frase</th></tr></thead><tbody>
      <tr><td>Lunes</td><td>Arrancar</td><td>piernas</td><td>la primera pausa, de pie</td><td><i>Lunes: arrancar de pie</i></td></tr>
      <tr><td>Martes</td><td>Hombros y cuello</td><td>hombros, cuello</td><td>—</td><td><i>Martes: hombros y cuello</i></td></tr>
      <tr><td>Miércoles</td><td>La espalda</td><td>espalda</td><td>la larga llega antes</td><td><i>Miércoles: la espalda</i></td></tr>
      <tr><td>Jueves</td><td>Aire y manos</td><td>manos</td><td>antes de comer se respira</td><td><i>Jueves: aire y manos</i></td></tr>
      <tr><td>Viernes</td><td>Soltar</td><td>caderas, y más Estira que Mueve</td><td>—</td><td><i>Viernes: soltar caderas</i></td></tr>
    </tbody></table></div>
    <p class="nota">El sábado y el domingo siguen sin intención. El tema de la semana se queda como hasta ahora: solo desempata.</p>
    <p><b>Lo que aprende de ti manda.</b> Lo que el motor de la semana ha visto (lo que descansa, la pausa que sueles saltar, lo que te
      ayudó) sigue por encima de la intención, y «Otra» recorre la lista como siempre. La intención es lo que PACE propone cuando
      aún no te conoce.</p>
  </section>

  <section>
    <h2>Los casos, medidos</h2>
    <p>Treinta días laborables desde el lunes 12, sin PACE completo. «Pausas en la zona del día» cuenta las que mueven la zona de la
      intención (hoy sale por casualidad). La fila verde es la recomendada.</p>
    ${tablaCasos()}
    <p class="nota">Con «Dos horas» no hay comida ni tarde. «Sentadas seguidas» no cuenta el cierre. Todo con las rutinas nuevas y la pared (abajo).</p>
  </section>

  <section>
    <h2>Un miércoles, de principio a fin</h2>
    <p>La jornada con el aro a 25. La flecha marca las pausas de pie; en verde, la tarde.</p>
    ${miercoles('jornada', 25)}
    <p>Y «Dos horas» con el aro a 10, que es donde la intención se nota más: casi la mitad de las pausas de la semana mueven la zona de su día.</p>
    ${miercoles('2h', 10)}
  </section>

  <section>
    <h2>Las otras formas</h2>
    <ul class="lista">
      <li><b>B · El día escrito.</b> Cada día de la semana con su menú puesto a mano: el lunes, siempre Piernas de pie, Espalda de pie,
        el paseo… Se entiende muy bien, pero cada lunes es igual que el anterior, con el aro a 10 hay que inventar las pausas que
        faltan, y pelea con lo que aprende el motor. No se puede medir igual: es lo que se escriba.</li>
      <li><b>C · Solo los momentos.</b> El paseo tras comer y la tarde de pie, sin intención por día. Arregla la tarde igual que A
        (la tabla), pero los días siguen siendo todos iguales.</li>
    </ul>
  </section>

  <section>
    <h2>Las rutinas nuevas, todas dentro de casa</h2>
    <p>Las dos que propuso la revisión, rehechas para una habitación o el escritorio (tu regla del 17 de octubre). Gratis, de pie,
      3 minutos, ya escritas en los dos idiomas.</p>
    <ul class="lista">
      <li><b>Paseo corto</b> (Mueve): caminar por la habitación o marchar en el sitio, 1 min · paso vivo 1 min · caminar suave 45 s ·
        respiraciones. Caminar suave rompe el rato sentado mejor que ponerse de pie, y tras comer baja la glucosa
        (Buffey 2022, Duran 2023). Sin escaleras.</li>
      <li><b>Hombros fuertes</b> (Mueve): elevación lateral y remo con apoyo en la mesa, con una botella de agua o sin nada, un brazo
        y luego el otro · encogimientos con 2 s arriba · respiraciones. La elevación lateral, 2 min al día, bajó el dolor de cuello
        y hombro en oficinistas (Andersen 2011).</li>
      <li><b>La pared cuenta</b>, como ya contaba la mesa: en una habitación siempre hay una. Entran en las pausas <b>Hombros</b>
        (Estira) y <b>Sentadilla en pared</b> (PACE completo).</li>
    </ul>
    <p>Con eso la tarde ya es de pie en todos los casos y nada se repite en el día, así que no hace falta una tercera rutina.
      Medido con una más de piernas (sentadilla con apoyo, zancada atrás, elevación lateral de pierna): una rutina distinta más por
      semana y nada más. Los cinco dibujos nuevos van al encargo de imágenes; mientras, salen con el genérico.</p>
  </section>

  <section>
    <h2>Lo que se ve</h2>
    <p>La pausa del miércoles a las 9:25 y la hoja del día, en la app real. La frase va encima del nombre, donde ya va «Piernas: sin
      mover hoy», así que no hay línea nueva y la home sigue sin scroll.</p>
    <div class="trio">
      <div class="op"><h3>1 · La parada lo dice <span class="rec">Recomendada</span></h3>
        ${img('frase-mov-pausa-es', 'La pausa con Miércoles: la espalda encima de Espalda de oficina', 'La primera pausa que mueve la zona del día')}</div>
      <div class="op"><h3>2 · Nada</h3>
        ${img('nada-mov-pausa-es', 'La misma pausa con Espalda: sin mover hoy', 'La intención se nota, no se nombra')}</div>
      <div class="op"><h3>3 · También arriba</h3>
        ${img('cabecera-mov-dia', 'La hoja del día con Miércoles: la espalda bajo el título', 'Bajo el título del día (maqueta sobre la app)')}</div>
    </div>
    <div class="par">
      ${img('frase-mov-pausa-en', 'La pausa en inglés: Wednesday, your back', 'En inglés: «Wednesday: your back»', 'mov')}
      ${img('frase-esc-pausa-es', 'La pausa en el escritorio con Miércoles: la espalda', 'Escritorio, 1280 px')}
    </div>
    <p class="nota">En la línea del escritorio no hay frases (como hoy). La 3 no existe en el código: es la foto de la app con la línea escrita encima.
      Por la tarde, las pausas dicen «La tarde, de pie» cuando no hay otra razón.</p>
  </section>

  <section class="pregunta">
    <h2>Lo que te pregunto</h2>
    <ul class="lista">
      <li><b>La forma:</b> A, la intención (recomendada) · B, el día escrito · C, solo los momentos.</li>
      <li><b>Lo que se ve:</b> 1, la parada lo dice (recomendada) · 2, nada · 3, también arriba.</li>
      <li><b>Gratis o PACE completo:</b> recomiendo <b>gratis</b>: el día diseñado es lo que hace bueno a PACE para todos, y lo de pago es
        que aprenda de ti (el motor de la semana).</li>
      <li><b>Las rutinas:</b> las dos y la pared (recomendada) · y además una tercera de piernas · solo las dos.</li>
    </ul>
  </section>
</main>`;
fs.writeFileSync(path.join(__dirname, 'dias.html'), html);
console.log('dias.html', Math.round(html.length / 1024) + ' KB');
