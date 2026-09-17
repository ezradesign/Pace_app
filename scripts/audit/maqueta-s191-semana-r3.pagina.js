/* PACE · la PAGINA de «Semana», ronda 3 (s191)
 * ============================================
 * Una fila por viewport, con dos PANTALLAS enteras (antes y despues). Cada pantalla es un
 * iframe del tamaño exacto del viewport con la capa del panel calcada dentro, asi que el
 * alto maximo y el centrado del panel se resuelven como en la app y un scroll se VE.
 */
'use strict';

function tabla(filas) {
  const celda = (m) => {
    const ok = m.scroll === 0 && m.solapes === 0;
    return '<td class="' + (ok ? 'ok' : 'ko') + '">'
      + (m.scroll ? '<b>scroll ' + m.scroll + ' px</b>' : 'sin scroll')
      + ' · ' + (m.solapes ? '<b>' + m.solapes + ' solapes</b>' : '0 solapes') + '</td>';
  };
  return '<table><thead><tr><th>Viewport</th><th>Tipo</th><th>Qué cambia</th><th>Antes (la app de hoy)</th><th>Después</th></tr></thead><tbody>'
    + filas.map(f => '<tr><td><b>' + f.w + '×' + f.h + '</b>' + (f.nota ? ' <span class="nota">' + f.nota + '</span>' : '') + '</td>'
      + '<td>' + f.tipo + '</td>'
      + '<td>' + (f.movil ? 'barras que miden · sin retención' : 'sin retención') + '</td>'
      + celda(f.antes) + celda(f.despues) + '</tr>').join('')
    + '</tbody></table>';
}

function filaVisual(f, i) {
  return '<div class="fila" data-fila="' + i + '">'
    + '<div class="rotfila"><b>' + f.w + '×' + f.h + '</b> · ' + f.tipo + (f.nota ? ' · ' + f.nota : '')
    + ' <span class="zoom" data-zoom="' + i + '"></span></div>'
    + '<div class="par">'
    + ['antes', 'despues'].map(fase => '<div><div class="etiq">' + (fase === 'antes' ? 'Antes' : 'Después') + '</div>'
      + '<div class="pantalla" data-vp="' + i + '" data-fase="' + fase + '"></div>'
      + '<div class="medida" data-salida="' + i + '-' + fase + '"></div></div>').join('')
    + '</div></div>';
}

function pagina({ filas, FUENTE, semana, hoy }) {
  const grandes = filas.filter(f => !f.movil);
  const sinScroll = grandes.filter(f => f.despues.scroll === 0).length;
  const moviles = filas.filter(f => f.movil);
  const limpios = moviles.filter(f => f.despues.solapes === 0).length;
  const antesConScroll = grandes.filter(f => f.antes.scroll > 0).map(f => f.w + '×' + f.h).join(' y ');
  const grupos = ['Escritorio', 'Tableta', 'Móvil'];
  return `<!doctype html>
<html lang="es" data-font="cormorant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Stats · Semana · todos los viewports</title>
<link rel="stylesheet" href="/app/tokens.css">
<link rel="stylesheet" href="/app/motion.css">
<style>/* estilos de la app, calcados */
${filas[0].estilos}
</style>
<style>
  body { padding: 26px 22px 70px; background: var(--paper-2); }
  .cab, .bloque { max-width: 1760px; margin: 0 auto 26px; }
  .cab h1 { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 30px; margin: 0 0 8px; }
  .cab p { font-size: 13px; color: var(--ink-2); line-height: 1.6; max-width: 980px; margin: 0 0 6px; }
  .cab b, .medida b, .rotfila b { color: var(--ink); }
  .mandos { display: flex; gap: 6px; margin-top: 14px; flex-wrap: wrap; }
  .mandos button { font-size: 11px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 8px; background: var(--paper); color: var(--ink-2); cursor: pointer; }
  .mandos button.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  h2 { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 24px; margin: 34px 0 10px; }
  .fila { margin: 0 0 30px; overflow-x: auto; }
  .rotfila { font-size: 12px; color: var(--ink-2); margin-bottom: 6px; }
  .zoom { color: var(--ink-3); font-size: 11px; margin-left: 6px; }
  .etiq { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink); font-weight: 600; margin-bottom: 6px; }
  .medida { font-size: 12px; color: var(--ink-2); margin-top: 8px; line-height: 1.6; }
  .mal, .ko b { color: var(--breathe); font-weight: 600; }
  .bien { color: var(--focus); font-weight: 600; }
  .par { display: flex; gap: 28px; align-items: flex-start; width: max-content; }
  .par > * { flex: 0 0 auto; }
  /* La PANTALLA: un marco fino alrededor del viewport, para que se vea donde acaba. */
  /* ESCALAR CON TRANSFORM, NO CON ZOOM. Con zoom, el iframe de 714 px pasaba a medir 709
     por dentro y el panel se calculaba para otra altura: la maqueta daba 2 px de scroll
     donde la app daba 1. Con transform el iframe conserva su viewport exacto; el marco
     exterior lleva el tamaño YA escalado para ocupar lo que se ve. */
  .pantalla { position: relative; overflow: hidden; border: 1px solid var(--line-2); border-radius: 6px; background: var(--paper); }
  .pantalla iframe { display: block; border: 0; background: var(--paper); transform-origin: 0 0; position: absolute; left: 0; top: 0; }
  .tablaCaja { overflow-x: auto; }
  table { border-collapse: collapse; font-size: 12px; color: var(--ink-2); }
  th, td { text-align: left; padding: 6px 12px; border-bottom: 1px solid var(--line); white-space: nowrap; }
  th { font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
  td.ok { color: var(--focus); }
  .nota { color: var(--ink-3); font-size: 11px; }
</style>
</head>
<body>
<div class="cab">
  <h1>Stats · Semana · todos los viewports</h1>
  <p><b>Lo que cambia:</b> en <b>móvil</b> (hasta 640 px) las barras miden de verdad, el nombre del módulo va a su
     izquierda y los días se escriben una vez. En <b>todos</b> los tamaños desaparece la línea «Retención esta
     semana» (el dato se sigue guardando: puede volver). En escritorio y tableta, el resto es tu diseño de siempre.</p>
  <p>En escritorio, además, <b>la nota del pie sube 4 px</b>: sin eso la pestaña quedaba 1 px por encima de su hueco
     a 1536×714, y en Windows 1 px ya pinta la barra de scroll.</p>
  <p><b>Cada recuadro es una pantalla entera</b> del tamaño que dice: el panel está calcado de la app con su capa,
     su centrado y su alto máximo, así que si algo no cabe <b>se ve el scroll dentro del panel</b>. Reloj en domingo
     (semana completa) y con tiempo de retención guardado, que es el caso que hoy scrollea.</p>
  <p><b>Medido en la app real con el cambio aplicado en vivo:</b> hoy scrollean ${antesConScroll || 'ninguno'};
     después, <b>${sinScroll} de ${grandes.length}</b> tamaños grandes sin scroll y <b>${limpios} de ${moviles.length}</b>
     móviles sin ningún solape.</p>
  <div class="mandos">
    <button data-tema="light" class="on">Crema</button><button data-tema="dark">Oscuro</button>
    <span style="width:14px"></span>
    <button data-ajuste="ajustar" class="on">Ajustar al ancho</button><button data-ajuste="real">Tamaño real</button>
  </div>
</div>

<div class="bloque">
  <div class="tablaCaja">${tabla(filas)}</div>
${grupos.map(g => {
  const idx = filas.map((f, i) => f.tipo === g ? i : -1).filter(i => i >= 0);
  return idx.length ? '<h2>' + g + '</h2>' + idx.map(i => filaVisual(filas[i], i)).join('\n') : '';
}).join('\n')}
</div>

${filas.map((f, i) => '<template id="capa-' + i + '">' + f.capa + '</template>').join('\n')}

<script>
${FUENTE}
const SEMANA = ${JSON.stringify(semana)};
const HOY = ${hoy};
const VPS = ${JSON.stringify(filas.map(f => ({ w: f.w, h: f.h, movil: f.movil })))};

function montar() {
  document.querySelectorAll('[data-vp]').forEach(slot => {
    const i = +slot.getAttribute('data-vp'), fase = slot.getAttribute('data-fase'), vp = VPS[i];
    slot.innerHTML = '';
    const f = document.createElement('iframe');
    f.width = vp.w; f.height = vp.h;
    f.style.width = vp.w + 'px'; f.style.height = vp.h + 'px';
    slot.appendChild(f);
    const d = f.contentDocument;
    d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>'); d.close();
    document.querySelectorAll('head style, head link[rel=stylesheet]').forEach(h => d.head.appendChild(h.cloneNode(true)));
    d.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') || 'light');
    d.documentElement.setAttribute('data-font', 'cormorant');
    d.body.style.cssText = 'margin:0;background:var(--paper)';
    d.body.appendChild(document.getElementById('capa-' + i).content.cloneNode(true));
    if (fase === 'despues') {
      sinRetencion(d);
      notaMasCerca(d);
      if (vp.movil) filasQueMiden(d, SEMANA, HOY);
    }
  });
}

function medir() {
  document.querySelectorAll('[data-vp]').forEach(slot => {
    const i = +slot.getAttribute('data-vp'), fase = slot.getAttribute('data-fase');
    const f = slot.querySelector('iframe'); if (!f) return;
    const d = f.contentDocument;
    const vistas = d.querySelector('[data-pace-stats-vistas]'); if (!vistas) return;
    let scroll = 0, e = vistas;
    const win = d.defaultView;
    while (e && e !== d.body) {
      const oy = win.getComputedStyle(e).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && e.scrollHeight > e.clientHeight) scroll = Math.max(scroll, Math.round(e.scrollHeight - e.clientHeight));
      e = e.parentElement;
    }
    const pares = solapesSemana(d) || [];
    const out = document.querySelector('[data-salida="' + i + '-' + fase + '"]');
    out.innerHTML = (scroll ? '<span class="mal">scroll ' + scroll + ' px</span>' : '<span class="bien">sin scroll</span>')
      + ' · textos que se pisan: <span class="' + (pares.length ? 'mal' : 'bien') + '">' + pares.length + '</span>'
      + (pares.length ? ' <span class="nota">' + pares.slice(0, 6).join(' · ') + (pares.length > 6 ? ' …' : '') + '</span>' : '');
  });
}

function ajustar() {
  const modo = document.documentElement.getAttribute('data-ajuste') || 'ajustar';
  document.querySelectorAll('.fila').forEach(fl => {
    const i = +fl.getAttribute('data-fila'), vp = VPS[i];
    const disp = fl.clientWidth;
    const natural = vp.w * 2 + 28 + 4;
    const z = modo === 'ajustar' && disp > 0 ? Math.min(1, disp / natural) : 1;
    fl.querySelectorAll('.pantalla').forEach(p => {
      p.style.width = Math.round(vp.w * z) + 'px';
      p.style.height = Math.round(vp.h * z) + 'px';
      const f = p.querySelector('iframe');
      if (f) f.style.transform = 'scale(' + z + ')';
    });
    const et = fl.querySelector('.zoom');
    if (et) et.textContent = z < 1 ? '(mostrado al ' + Math.round(z * 100) + ' %)' : '(a tamaño real)';
  });
  /* El transform no toca el viewport del iframe: se puede medir a cualquier escala. */
  medir();
}

function grupo(attr, fn) {
  document.querySelectorAll('[' + attr + ']').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[' + attr + ']').forEach(o => o.classList.toggle('on', o === b));
    fn(b.getAttribute(attr));
  }));
}
grupo('data-tema', t => {
  document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('[data-vp] iframe').forEach(f => f.contentDocument.documentElement.setAttribute('data-theme', t));
  ajustar();
});
grupo('data-ajuste', a => { document.documentElement.setAttribute('data-ajuste', a); ajustar(); });
document.documentElement.setAttribute('data-theme', 'light');
document.documentElement.setAttribute('data-ajuste', 'ajustar');
window.addEventListener('resize', ajustar);
montar(); ajustar();
setTimeout(ajustar, 500); setTimeout(ajustar, 1500);
</script>
</body>
</html>
`;
}

module.exports = { pagina };
