/* PACE · la PÁGINA de la ronda 2 del «menú»: NOMBRE y GLIFOS (s192)
 * ==================================================================
 * El usuario eligió A («el menú manda») y pidió dos cosas: un nombre mejor que
 * «menú» (era solo el ejemplo) y los glifos de Respira, Mueve, Estira e Hidrátate,
 * «de manera elegante y discreta». Aquí se eligen MIRANDO: dos selectores cambian el
 * nombre y la intensidad de los glifos en todas las pantallas a la vez, sin tocar el
 * estado de cada una.
 */
'use strict';

const { seguro } = require('./menu-s192-pagina');

const PRESETS = {
  A: [
    ['Antes de elegir', {}], ['Media jornada', { opcion: 'media' }], ['Jornada entera', { opcion: 'jornada' }],
    ['Jornada · lista abierta', { opcion: 'jornada', hoja: true }], ['Por libre', { libre: true }],
  ],
};
const INICIAL = { preset: 2, nombre: 'compas', glifos: 'nodos' };

const NOMBRES = [
  ['compas', 'A tu compás', 'At your pace', 'Recomendado',
    '«Pace» es eso: el compás, tu ritmo. Es el nombre de la app dicho en español, y en inglés vuelve a ser <i>pace</i>. No choca con nada.',
    'No dice «jornada»: lo explica la pregunta que va justo debajo.'],
  ['jornada', 'Tu jornada', 'Your day', '',
    'La más clara: dice exactamente qué es.',
    'Suena a herramienta de trabajo, y «La jornada» ya es una categoría de logros.'],
  ['servido', 'El día servido', 'Your day, served', '',
    'Conserva la idea del menú completo sin decir «menú».',
    '«Servido» también se lee como «ya está hecho».'],
  ['prado', 'Tu prado', 'Your meadow', '',
    'La vaca que pace y el lema <i>Touch grass</i>: la más PACE de las cuatro.',
    'No dice qué hace, y «Sal al prado» suena a salir de casa.'],
  ['menu', 'Menú de hoy', 'Today’s menu', 'Ronda 1', 'Era el ejemplo.', ''],
];
const GLIFOS = [
  ['sin', 'Sin glifos', 'La ronda 1: puntos de color.'],
  ['nodos', 'En las paradas', 'Recomendado'],
  ['pregunta', 'También en la pregunta', 'Cada opción dice qué lleva antes de elegirla.'],
];

function botones(grupo, lista, activo) {
  return lista.map(([valor, etiqueta]) => `<button data-ajuste="${grupo}" data-valor="${valor}"${valor === activo ? ' class="on"' : ''}>${etiqueta}</button>`).join('');
}

function pagina({ css, cssMenu, calcos, vps, codigo }) {
  const datos = { css, cssMenu, codigo, calcos, vps: vps.map((p) => ({ id: p.id, w: p.w, h: p.h, movil: p.movil })), presets: PRESETS, inicial: INICIAL };
  const pantallas = (movil) => vps.filter((p) => !!p.movil === movil).map((p) => `
      <figure class="${p.movil ? 'movil' : 'escritorio'}">
        <figcaption><b>${p.w}×${p.h}</b> · ${p.movil ? 'móvil' : 'escritorio'}${p.nota ? ' · ' + p.nota : ''}</figcaption>
        <div class="marco"><iframe data-v="A" data-vp="${p.id}" width="${p.w}" height="${p.h}" title="A · ${p.w}×${p.h}"></iframe></div>
        <div class="medida" data-medida="A-${p.id}">midiendo…</div>
      </figure>`).join('');
  return `<!doctype html>
<html lang="es" data-palette="crema">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Menú · nombre y glifos</title>
<style>
  body { margin: 0; background: var(--paper, #F2EDE0); color: var(--ink, #1F1C17); font-family: 'Inter Tight', system-ui, sans-serif; font-size: 15px; line-height: 1.5; }
  main { max-width: 1320px; margin: 0 auto; padding: 40px 24px 80px; }
  h1, h2 { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-weight: 500; }
  h1 { font-size: 44px; margin: 6px 0 12px; line-height: 1.05; }
  h2 { font-size: 30px; margin: 48px 0 8px; }
  p, li { max-width: 80ch; color: var(--ink-2); }
  .ceja { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3); }
  .gris { color: var(--ink-3); }
  .mandos { position: sticky; top: 0; z-index: 5; background: var(--paper); padding: 12px 0 10px; border-bottom: 1px solid var(--paper-3); margin: 22px 0 18px; display: grid; gap: 8px; }
  .mando { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .mando > span { width: 74px; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); }
  .mando button { font: inherit; font-size: 13px; border: 1px solid var(--line); background: var(--paper); color: var(--ink-2); border-radius: 999px; padding: 5px 13px; cursor: pointer; }
  .mando button.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .mando button[data-valor="menu"], .mando button[data-valor="sin"] { border-style: dashed; }
  figure { margin: 0 0 22px; }
  figcaption { font-size: 12px; color: var(--ink-3); margin-bottom: 6px; }
  .marco { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: 10px; background: var(--paper-2); }
  .marco iframe { border: 0; display: block; transform-origin: 0 0; background: var(--paper); }
  .fila-m { display: flex; gap: 28px; flex-wrap: wrap; align-items: flex-start; }
  .medida { font-size: 12px; margin-top: 6px; color: var(--ink-3); }
  .medida b.ko { color: #A0452B; } .medida b.ok { color: var(--focus); }
  table { border-collapse: collapse; font-size: 13.5px; margin: 8px 0 0; width: 100%; }
  th, td { text-align: left; padding: 8px 16px 8px 0; border-bottom: 1px solid var(--paper-3); vertical-align: top; }
  th { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
  td.nom { font-family: 'EB Garamond', Georgia, serif; font-style: italic; font-size: 20px; color: var(--ink); white-space: nowrap; }
  .sello { display: inline-block; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--focus-cta); border: 1px solid var(--focus-cta); border-radius: 999px; padding: 1px 8px; margin-left: 6px; vertical-align: 3px; font-family: 'Inter Tight', sans-serif; font-style: normal; }
  .dos { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
  @media (max-width: 900px) { .dos { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<main>
  <div class="ceja">PACE · maqueta · s192 · ronda 2</div>
  <h1>El menú manda: nombre y glifos</h1>
  <p>Elegiste <b>A</b>. Esta ronda decide dos cosas, mirándolas: <b>el nombre</b> («menú» era el ejemplo) y
  <b>los glifos</b> de Respira, Mueve, Estira e Hidrátate. Los mandos de abajo cambian todas las pantallas a la vez;
  las pantallas siguen siendo la app calcada y se pueden pulsar.</p>

  <div class="mandos">
    <div class="mando"><span>Nombre</span>${botones('nombre', NOMBRES, INICIAL.nombre)}</div>
    <div class="mando"><span>Glifos</span>${botones('glifos', GLIFOS, INICIAL.glifos)}</div>
    <div class="mando"><span>Estado</span>${PRESETS.A.map(([et], i) => `<button data-preset="A" data-i="${i}"${i === INICIAL.preset ? ' class="on"' : ''}>${et}</button>`).join('')}</div>
  </div>

  <div class="fila-e">${pantallas(false)}</div>
  <div class="fila-m">${pantallas(true)}</div>

  <h2>Los cuatro nombres</h2>
  <p>Cada nombre se lee en cuatro sitios: el rótulo del corte del aro, la cejilla de la barra lateral
  («Tu compás · 9:45»), el enlace para volver desde la carta y la cabecera de la lista. Lo he buscado en
  <code>app/i18n</code> antes de proponerlo: <b>«A tu ritmo»</b> ya es el subtítulo de la bienvenida, <b>«La jornada»</b>
  es una categoría de logros y <b>«Ritmo»</b> nombra una vista de Stats.</p>
  <table>
    <thead><tr><th>Nombre</th><th>En inglés</th><th>A favor</th><th>En contra</th></tr></thead>
    <tbody>${NOMBRES.filter((n) => n[0] !== 'menu').map(([, nom, en, sello, pro, contra]) =>
      `<tr><td class="nom">${nom}${sello ? `<span class="sello">${sello}</span>` : ''}</td><td class="gris">${en}</td><td>${pro}</td><td class="gris">${contra}</td></tr>`).join('')}</tbody>
  </table>

  <h2>Dónde van los glifos</h2>
  <div class="dos">
    <div>
      <p><b>Son los de la barra de Actividades</b>, calcados de la app: el menú es el cuarto sitio que los usa, después de la home,
      la pausa y la barra lateral. Van a trazo fino y en el color de su módulo, y <b>nunca se suman a un punto: lo sustituyen</b>.</p>
      <ul>
        <li><b>La línea del día</b>: cada parada es su glifo dentro de un aro fino. La pausa larga lleva los dos; la comida, la gota sobre el tramo.</li>
        <li><b>El vaso</b> de cada pausa es una gota pequeña al lado de los minutos, no un dibujo más en la línea.</li>
        <li><b>Móvil</b>: el glifo ocupa el sitio del punto en «Ahora» y «Luego». La línea pequeña sigue con puntos: a 8 px un dibujo no se lee.</li>
        <li><b>La lista entera</b>: el glifo va en el eje, donde estaba el círculo.</li>
      </ul>
    </div>
    <div>
      <p><b>«También en la pregunta»</b> añade a cada opción lo que lleva antes de elegirla: cuántas pausas de cada módulo
      y cuántos vasos, contado sobre el mismo menú que se serviría.</p>
      <p class="gris">Mi recomendación es «En las paradas»: los glifos dicen algo que el color solo no decía, porque hay que
      aprenderse que el azul pizarra es Estira. En la pregunta informan, pero son cuatro filas de iconos más antes de haber
      decidido nada, y eso va contra lo que dijeron las entrevistas.</p>
    </div>
  </div>
</main>

<script>
const PM = ${seguro(datos)};
(function () {
  const caras = (PM.css.match(/@font-face\\s*\\{[^}]*\\}/g) || []).join('\\n');
  const raiz = (PM.css.match(/:root\\s*\\{[^}]*--paper:[^}]*\\}/) || [''])[0];
  const st = document.createElement('style'); st.textContent = caras + '\\n' + raiz; document.head.appendChild(st);

  const aj = { nombre: PM.inicial.nombre, glifos: PM.inicial.glifos };
  const attrs = (a) => a.map(([k, v]) => k + '="' + String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"').join(' ');
  const srcdoc = (vp) => {
    const c = PM.calcos[vp.id];
    const cfg = { id: 'A-' + vp.id, variante: 'A', movil: vp.movil, inicio: 540, nombre: aj.nombre, glifos: aj.glifos,
                  estado: PM.presets.A[PM.inicial.preset][1] };
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
    aj[b.dataset.ajuste] = b.dataset.valor;
    marcar('[data-ajuste="' + b.dataset.ajuste + '"]', b);
    enviar({ pmAjustes: { [b.dataset.ajuste]: b.dataset.valor } });
  });
  document.querySelectorAll('[data-preset]').forEach((b) => b.onclick = () => {
    marcar('[data-preset]', b);
    enviar({ pmEstado: PM.presets.A[+b.dataset.i][1] });
  });

  const bien = (ok, t) => '<b class="' + (ok ? 'ok' : 'ko') + '">' + t + '</b>';
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
    el.innerHTML = partes.join(' · ');
    el.dataset.json = JSON.stringify(m);
  });
})();
</script>
</body>
</html>`;
}

module.exports = { pagina, PRESETS, NOMBRES, GLIFOS, INICIAL };
