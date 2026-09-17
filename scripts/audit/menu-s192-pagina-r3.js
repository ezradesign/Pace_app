/* PACE · la PÁGINA de la ronda 3: «A tu ritmo», HORARIO y COMIDA (s192)
 * ======================================================================
 * Lo que pidió el usuario tras la ronda 2: nombre de la familia «ritmo», glifos
 * solo en las paradas (decidido, sin mando), una sola salida («Hoy voy por libre»),
 * un glifo de cubiertos para la comida y —«en cada país se come a una hora
 * distinta»— la hora de inicio y la de comer.
 */
'use strict';

const { seguro } = require('./menu-s192-pagina');

const PRESETS = {
  A: [
    ['Antes de elegir', {}], ['Media jornada', { opcion: 'media' }], ['Jornada entera', { opcion: 'jornada' }],
    ['Jornada · lista abierta', { opcion: 'jornada', hoja: true }], ['Hoy voy por libre', { libre: true }],
  ],
};
/* Cada mando: [grupo, [[valor, etiqueta], …]]. El horario va como «inicio-comida». */
const MANDOS = [
  ['nombre', [['aturitmo', 'A tu ritmo'], ['turitmo', 'Tu ritmo']]],
  ['horario', [['540-840', 'Empiezas 9:00 · comes 14:00'], ['480-720', '8:00 · 12:00'],
               ['600-810', '10:00 · 13:30'], ['720-840', 'Empiezas 12:00 · comes 14:00']]],
  ['comida', [['cubiertos', 'Cubiertos'], ['plato', 'Cubiertos y plato']]],
];
const INICIAL = { preset: 2, nombre: 'aturitmo', horario: '540-840', comida: 'cubiertos' };

function pagina({ css, cssMenu, calcos, vps, codigo, recursos }) {
  const datos = { css, cssMenu, codigo, calcos, recursos, vps: vps.map((p) => ({ id: p.id, w: p.w, h: p.h, movil: p.movil })),
                  presets: PRESETS, inicial: INICIAL };
  const pantallas = (movil) => vps.filter((p) => !!p.movil === movil).map((p) => `
      <figure>
        <figcaption><b>${p.w}×${p.h}</b> · ${p.movil ? 'móvil' : 'escritorio'}${p.nota ? ' · ' + p.nota : ''}</figcaption>
        <div class="marco"><iframe data-v="A" data-vp="${p.id}" width="${p.w}" height="${p.h}" title="${p.w}×${p.h}"></iframe></div>
        <div class="medida" data-medida="A-${p.id}">midiendo…</div>
      </figure>`).join('');
  const mandos = MANDOS.map(([g, vals]) => `<div class="mando"><span>${g === 'comida' ? 'Comida' : g[0].toUpperCase() + g.slice(1)}</span>`
    + vals.map(([v, et]) => `<button data-ajuste="${g}" data-valor="${v}"${v === INICIAL[g] ? ' class="on"' : ''}>${et}</button>`).join('') + '</div>').join('');
  return `<!doctype html>
<html lang="es" data-palette="crema">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>A tu ritmo · ronda 3</title>
<style>
  body { margin: 0; background: var(--paper, #F2EDE0); color: var(--ink, #1F1C17); font-family: 'Inter Tight', system-ui, sans-serif; font-size: 15px; line-height: 1.5; }
  main { max-width: 1320px; margin: 0 auto; padding: 40px 24px 80px; }
  h1, h2 { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-weight: 500; }
  h1 { font-size: 44px; margin: 6px 0 12px; line-height: 1.05; }
  h2 { font-size: 30px; margin: 48px 0 8px; }
  p, li { max-width: 80ch; color: var(--ink-2); }
  code { font-size: 12.5px; background: var(--paper-2); padding: 1px 5px; border-radius: 4px; }
  .ceja { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3); }
  .gris { color: var(--ink-3); }
  .mandos { position: sticky; top: 0; z-index: 5; background: var(--paper); padding: 12px 0 10px; border-bottom: 1px solid var(--paper-3); margin: 22px 0 18px; display: grid; gap: 8px; }
  .mando { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .mando > span { width: 74px; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); }
  .mando button { font: inherit; font-size: 13px; border: 1px solid var(--line); background: var(--paper); color: var(--ink-2); border-radius: 999px; padding: 5px 13px; cursor: pointer; }
  .mando button.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  figure { margin: 0 0 22px; }
  figcaption { font-size: 12px; color: var(--ink-3); margin-bottom: 6px; }
  .marco { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: 10px; background: var(--paper-2); }
  .marco iframe { border: 0; display: block; transform-origin: 0 0; background: var(--paper); }
  .fila-m { display: flex; gap: 28px; flex-wrap: wrap; align-items: flex-start; }
  .medida { font-size: 12px; margin-top: 6px; color: var(--ink-3); }
  .medida b.ko { color: #A0452B; } .medida b.ok { color: var(--focus); }
  .dos { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  @media (max-width: 900px) { .dos { grid-template-columns: 1fr; } }
  .muestras { display: flex; flex-wrap: wrap; gap: 14px; margin: 14px 0 6px; }
  .muestra { width: 108px; border: 1px solid var(--paper-3); border-radius: 12px; padding: 14px 8px 10px; text-align: center; background: var(--paper); }
  .muestra.nueva { border-color: var(--line-2); background: var(--paper-2); }
  .muestra .g26 { width: 26px; height: 26px; margin: 0 auto; }
  .muestra .anillo { width: 24px; height: 24px; margin: 12px auto 0; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--c) 45%, transparent); display: grid; place-items: center; background: var(--paper); }
  .muestra .anillo > span { width: 16px; height: 16px; }
  .muestra svg { width: 100%; height: 100%; display: block; }
  .muestra .n { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: 15px; margin-top: 8px; color: var(--ink); }
  .muestra .m { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
  .grande { display: flex; gap: 22px; align-items: center; margin-top: 10px; }
  .grande > div { width: 112px; height: 112px; border: 1px solid var(--paper-3); border-radius: 12px; display: grid; place-items: center; background: var(--paper); color: var(--ink-2); }
  .grande svg { width: 84px; height: 84px; }
  table { border-collapse: collapse; font-size: 13.5px; margin: 8px 0 0; }
  th, td { text-align: left; padding: 6px 16px 6px 0; border-bottom: 1px solid var(--paper-3); vertical-align: top; }
  th { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
</style>
</head>
<body>
<main>
  <div class="ceja">PACE · maqueta · s192 · ronda 3</div>
  <h1>A tu ritmo: horario y comida</h1>
  <p>Lo que pediste tras la ronda 2: el nombre, de la familia <b>ritmo</b>; los glifos <b>solo en las paradas</b> (ya sin mando);
  una sola salida, <b>«Hoy voy por libre»</b>; un glifo de <b>cubiertos</b> para la comida, y <b>tu horario</b>: la hora a la que
  empiezas y la hora a la que comes. Las horas se cambian con los mandos o <b>tocando la frase</b> dentro de cada pantalla.</p>

  <div class="mandos">
    ${mandos}
    <div class="mando"><span>Estado</span>${PRESETS.A.map(([et], i) => `<button data-preset="A" data-i="${i}"${i === INICIAL.preset ? ' class="on"' : ''}>${et}</button>`).join('')}</div>
  </div>

  <div class="fila-e">${pantallas(false)}</div>
  <div class="fila-m">${pantallas(true)}</div>

  <h2>«A tu ritmo» o «Tu ritmo»</h2>
  <div class="dos">
    <div>
      <p>Antes de pintarlos busqué la palabra en <code>app/i18n</code>. <b>«Ritmo» ya tiene dueño</b>:</p>
      <ul>
        <li>es el <b>título del panel de estadísticas</b> y el del icono de la barra de arriba («Ritmo (S)»);</li>
        <li>la barra lateral dice «<i>N días en ritmo</i>», y Stats, «<i>días con ritmo</i>»;</li>
        <li>la bienvenida promete «<i>Un ritmo para tu día</i>» y firma «<i>A tu ritmo.</i>».</li>
      </ul>
    </div>
    <div>
      <p><b>Mi recomendación es «A tu ritmo».</b> Se lee como una manera, no como una cosa: es justo la promesa de la bienvenida
      convertida en función, y en inglés es <i>At your pace</i>, el nombre de la app. <b>«Tu ritmo»</b>, como sustantivo, pondría dos
      cosas distintas con el mismo nombre en la misma pantalla: el plan de hoy abajo y las estadísticas en el icono de arriba.</p>
      <p class="gris">Por eso la cejilla de la barra lateral ya no lleva el nombre en ninguna de las dos: dice <b>«Siguiente pausa · 9:45»</b>,
      que es lo que es. El nombre vive en el rótulo del aro, en la cabecera de la lista y en el enlace de vuelta («Ponle ritmo al día»).</p>
    </div>
  </div>

  <h2>El glifo de la comida</h2>
  <p>Dibujado con las reglas de la familia de la barra de Actividades: lienzo de 28×28, trazo de 1,2, remates redondos, color heredado
  y un detalle secundario a opacidad baja (aquí, el mantel punteado, como el suelo de Estira). Va en <b>tinta</b> y no en un color de
  módulo, porque comer no es un plato del menú: en la línea no se toca para cambiarlo.</p>
  <div class="muestras" id="muestras"></div>
  <div class="grande" id="grande"></div>
  <p class="gris">Arriba, a 26 px (el tamaño de las Actividades) y a 16 px dentro del aro de la línea. Abajo, a 84 px, para ver el dibujo.</p>

  <h2>Tu horario</h2>
  <div class="dos">
    <div>
      <p><b>Cómo se pregunta.</b> Una vez, dentro de la propia pregunta: «<i>Empiezas a las 9:00 y comes a las 14:00</i>». Las horas son
      editables ahí mismo, se recuerdan, y al día siguiente solo queda contestar cuánto trabajas. En el menú servido siguen a mano en la
      cabecera («de 9:00 a 16:45 · comida a las 14:00»).</p>
      <p><b>La primera vez</b>, la hora de comer propuesta saldría de la región del navegador (en España, las 14:00; en Estados Unidos,
      hacia las 12:00) y se confirma con la persona: es una suposición, no un dato.</p>
      <p><b>Y el calendario, después.</b> Estas dos horas son exactamente lo que una sincronización rellenaría sola para quien la quiera.
      Si la gente las usa, el calendario automatiza algo que ya funciona.</p>
    </div>
    <div>
      <p><b>Cómo encaja la comida en el día.</b></p>
      <ul>
        <li>Empieza a <b>tu hora exacta</b>, si cae dentro de la jornada.</li>
        <li>El bloque que la cruzaría <b>se acorta</b> para acabar justo entonces (con 9:00 y 14:00, el sexto dura 40 min).</li>
        <li>Si al bloque le quedarían menos de 15 min, ese hueco es <b>margen libre</b> antes de comer.</li>
        <li>Lo que falta de foco se sirve <b>después de comer</b>; un resto de menos de 15 min lo absorbe el último bloque.</li>
        <li>Si empiezas después de tu hora de comer, o acabas antes, <b>no hay comida</b> en el menú.</li>
        <li>El agua: un vaso al comer y otro al cerrar; el resto de la meta (8) se <b>reparte</b> entre las pausas, sin pasarse.</li>
      </ul>
    </div>
  </div>

  <h2>Lo que queda para la siguiente ronda</h2>
  <ul>
    <li><b>Llegar tarde.</b> La maqueta supone que abres PACE a tu hora de inicio. La propuesta: si llegas tarde, el día se recoloca desde la hora real, sin marcar nada como perdido.</li>
    <li><b>La comida dura una hora</b> fija. Si hace falta, sería un tercer valor en la misma frase.</li>
    <li><b>Hora de salida.</b> Hoy se deduce de cuánto trabajas; hay quien piensa al revés («salgo a las 18:00»).</li>
    <li><b>No está pintado</b>: inglés, modo oscuro y la pantalla de pausa cuando la propuesta viene del menú.</li>
  </ul>
</main>

<script>
const PM = ${seguro(datos)};
(function () {
  const caras = (PM.css.match(/@font-face\\s*\\{[^}]*\\}/g) || []).join('\\n');
  const raiz = (PM.css.match(/:root\\s*\\{[^}]*--paper:[^}]*\\}/) || [''])[0];
  const st = document.createElement('style'); st.textContent = caras + '\\n' + raiz; document.head.appendChild(st);

  /* Muestrario: los glifos de la app salen del calco, igual que en las pantallas. */
  const doc = new DOMParser().parseFromString(PM.calcos.e1280.html, 'text/html');
  const chips = Array.from(doc.querySelectorAll('[data-pace-activitybar-chip] svg'));
  const limpio = (s) => s.replace(/^<svg[^>]*>/, (t) => t.replace(/\\s(width|height)="[^"]*"/g, ''));
  const familia = [
    ['Respira', 'var(--breathe)', chips[0] && limpio(chips[0].outerHTML), ''],
    ['Estira', 'var(--extra)', chips[1] && limpio(chips[1].outerHTML), ''],
    ['Mueve', 'var(--move)', chips[2] && limpio(chips[2].outerHTML), ''],
    ['Hidrátate', 'var(--hydrate)', chips[3] && limpio(chips[3].outerHTML), ''],
    ['Foco', 'var(--focus)', PM.recursos.FOCO, ''],
    ['Comida', 'var(--ink-2)', PM.recursos.COMIDA.cubiertos, 'nueva'],
    ['Comida', 'var(--ink-2)', PM.recursos.COMIDA.plato, 'nueva · con plato'],
  ];
  document.getElementById('muestras').innerHTML = familia.map(([n, c, svg, nota]) =>
    '<div class="muestra' + (nota ? ' nueva' : '') + '" style="--c:' + c + ';color:' + c + '"><div class="g26">' + svg + '</div>'
    + '<div class="anillo"><span>' + svg + '</span></div><div class="n">' + n + '</div><div class="m">' + (nota || 'de la app') + '</div></div>').join('');
  document.getElementById('grande').innerHTML = [PM.recursos.COMIDA.cubiertos, PM.recursos.COMIDA.plato, familia[1][2]]
    .map((s) => '<div>' + s + '</div>').join('');

  const inicio = () => PM.inicial.horario.split('-').map(Number);
  const attrs = (a) => a.map(([k, v]) => k + '="' + String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"').join(' ');
  const srcdoc = (vp) => {
    const c = PM.calcos[vp.id], h = inicio();
    const cfg = { id: 'A-' + vp.id, movil: vp.movil, inicio: h[0], comida: h[1], nombre: PM.inicial.nombre,
                  comidaGlifo: PM.inicial.comida, estado: PM.presets.A[PM.inicial.preset][1] };
    return '<!doctype html><html ' + attrs(c.htmlAttrs) + '><head><meta charset="utf-8"><style>' + PM.css + '</style><style>' + PM.cssMenu
      + '</style></head><body ' + attrs(c.bodyAttrs) + '>' + c.html + '<scr' + 'ipt>' + PM.codigo + '\\npmMontar(' + JSON.stringify(cfg) + ');</scr' + 'ipt></body></html>';
  };
  const marcos = Array.from(document.querySelectorAll('iframe[data-vp]'));
  const escalar = () => marcos.forEach((f) => {
    const vp = PM.vps.find((p) => p.id === f.dataset.vp);
    const disp = f.parentElement.parentElement.parentElement.clientWidth;
    const k = vp.movil ? 1 : Math.min(1, disp / vp.w);
    f.style.transform = 'scale(' + k + ')';
    f.parentElement.style.width = vp.w * k + 'px';
    f.parentElement.style.height = vp.h * k + 'px';
  });
  marcos.forEach((f) => { f.srcdoc = srcdoc(PM.vps.find((p) => p.id === f.dataset.vp)); });
  escalar();
  addEventListener('resize', escalar);
  const enviar = (msg) => marcos.forEach((f) => f.contentWindow.postMessage(msg, '*'));
  const marcar = (sel, b) => document.querySelectorAll(sel).forEach((x) => x.classList.toggle('on', x === b));

  document.querySelectorAll('[data-ajuste]').forEach((b) => b.onclick = () => {
    const g = b.dataset.ajuste, v = b.dataset.valor;
    marcar('[data-ajuste="' + g + '"]', b);
    if (g === 'horario') { const h = v.split('-').map(Number); enviar({ pmHorario: { inicio: h[0], comida: h[1] } }); }
    else if (g === 'nombre') enviar({ pmAjustes: { nombre: v } });
    else enviar({ pmAjustes: { comida: v } });
  });
  document.querySelectorAll('[data-preset]').forEach((b) => b.onclick = () => {
    marcar('[data-preset]', b);
    enviar({ pmEstado: PM.presets.A[+b.dataset.i][1] });
  });

  const bien = (ok, t) => '<b class="' + (ok ? 'ok' : 'ko') + '">' + t + '</b>';
  const hh = (m) => Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
  addEventListener('message', (ev) => {
    const m = ev.data;
    if (!m || !m.pm) return;
    const el = document.querySelector('[data-medida="' + m.pm + '"]');
    if (!el) return;
    const partes = [bien(m.scroll === 0, m.scroll === 0 ? 'la home cabe sin scroll' : 'la home pide ' + m.scroll + ' px de scroll')];
    if (m.alto !== null) partes.push('panel de ' + m.alto + ' px');
    if (m.solapes || m.fuera) partes.push(bien(false, m.solapes + ' etiquetas se pisan · ' + m.fuera + ' se salen'));
    if (m.desborde) partes.push(bien(false, 'el panel desborda ' + m.desborde + ' px'));
    if (m.glifos !== 4) partes.push(bien(false, 'solo ' + m.glifos + ' de 4 glifos calcados'));
    if (m.hojaScroll !== null) partes.push('lista: ' + (m.hojaScroll ? m.hojaScroll + ' px más con scroll' : 'cabe entera'));
    partes.push('<span class="gris">horario ' + hh(m.ajustes.inicio) + ' · ' + hh(m.ajustes.comida) + '</span>');
    el.innerHTML = partes.join(' · ');
    el.dataset.json = JSON.stringify(m);
  });
})();
</script>
</body>
</html>`;
}

module.exports = { pagina, PRESETS, MANDOS, INICIAL };
