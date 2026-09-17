/* PACE · la PAGINA de «Semana», ronda 2 (s191)
 * ============================================
 * Recibe los calcos del panel real, la tabla del banco de viewports y la FUENTE de las
 * transformaciones (las mismas funciones que el banco inyecto en la app viva), y
 * escribe la maqueta. No sabe como se capturo nada.
 */
'use strict';

function tabla(filas) {
  const celda = (m, conAlto) => {
    const ok = m.scroll === 0 && m.solapes === 0;
    return '<td class="' + (ok ? 'ok' : 'ko') + '">'
      + (m.scroll ? 'scroll <b>' + m.scroll + ' px</b>' : 'sin scroll')
      + ' · ' + (m.solapes ? '<b>' + m.solapes + ' solapes</b>' : '0 solapes')
      + (conAlto ? ' · ' + m.alto + ' px' : '') + '</td>';
  };
  return '<table><thead><tr><th>Viewport</th><th>Qué se aplica</th><th>Retención</th><th>Antes (la app de hoy)</th><th>Después</th></tr></thead><tbody>'
    + filas.map(f => '<tr><td><b>' + f.w + '×' + f.h + '</b></td>'
      + '<td>' + (f.movil ? 'B · barras que miden' : 'tu diseño · pie en una fila') + '</td>'
      + '<td>' + (f.retencion ? 'con' : 'sin') + '</td>'
      + celda(f.antes, false) + celda(f.despues, true) + '</tr>').join('')
    + '</tbody></table>';
}

function pagina({ esc, mov, filas, FUENTE, semana, hoy }) {
  const escritorio = filas.filter(f => !f.movil);
  const arreglados = escritorio.filter(f => f.despues.scroll === 0).length;
  const movilesLimpios = filas.filter(f => f.movil && f.despues.solapes === 0).length;
  const moviles = filas.filter(f => f.movil).length;
  return `<!doctype html>
<html lang="es" data-font="cormorant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Stats · Semana · ronda 2</title>
<link rel="stylesheet" href="/app/tokens.css">
<link rel="stylesheet" href="/app/motion.css">
<style>/* estilos de la app, calcados */
${esc.estilos}
</style>
<style>
  body { padding: 26px 22px 70px; background: var(--paper-2); }
  .cab, .bloque { max-width: 1760px; margin: 0 auto 26px; }
  .bloque { margin-bottom: 44px; overflow-x: auto; }
  .cab h1 { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 30px; margin: 0 0 8px; }
  .cab p { font-size: 13px; color: var(--ink-2); line-height: 1.6; max-width: 980px; margin: 0 0 6px; }
  .cab b, .porque b, .medida b { color: var(--ink); }
  .mandos { display: flex; gap: 6px; margin-top: 14px; flex-wrap: wrap; }
  .mandos button { font-size: 11px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 8px; background: var(--paper); color: var(--ink-2); cursor: pointer; }
  .mandos button.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .rot { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 4px; }
  .rot b { color: var(--ink); }
  .porque { font-size: 12.5px; color: var(--ink-2); line-height: 1.55; max-width: 900px; margin: 0 0 14px; border-left: 2px solid var(--line-2); padding-left: 11px; }
  .etiq { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink); font-weight: 600; margin-bottom: 6px; }
  .medida { font-size: 11.5px; color: var(--ink-2); margin-top: 8px; line-height: 1.6; max-width: 520px; }
  .mal, .ko b { color: var(--breathe); font-weight: 600; }
  .bien { color: var(--focus); font-weight: 600; }
  .tablaCaja { overflow-x: auto; }
  table { border-collapse: collapse; font-size: 12px; color: var(--ink-2); margin-top: 6px; }
  th, td { text-align: left; padding: 6px 12px; border-bottom: 1px solid var(--line); white-space: nowrap; }
  th { font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
  td.ok { color: var(--focus); }
  td.ko { color: var(--ink-2); }
  .par { display: flex; gap: 30px; align-items: flex-start; width: max-content; }
  .par > * { flex: 0 0 auto; }
  .maq { position: relative !important; inset: auto !important; transform: none !important; animation: none !important; opacity: 1 !important; margin: 0 auto !important; max-height: none !important; }
</style>
</head>
<body>
<div class="cab">
  <h1>Stats · Semana · ronda 2</h1>
  <p><b>Lo que pediste:</b> el arreglo B —barras que miden, nombre a la izquierda, días una vez— <b>solo en móvil</b>
     (hasta 640 px, el corte que ya usa la pestaña); en los tamaños grandes, <b>tu diseño de siempre</b>, y que quepa sin
     scroll. El panel está calcado de la app, con el reloj en domingo (semana completa).</p>
  <p><b>Resultado, medido en la app real</b> (el banco le aplica el arreglo en vivo, sin tocar el código, con las mismas
     funciones que esta maqueta): sin scroll en <b>${arreglados} de ${escritorio.length}</b> pruebas de tamaños grandes, y
     <b>${movilesLimpios} de ${moviles}</b> pruebas de móvil sin ningún solape. En móvil el panel puede scrollear: ahí la
     condición es que no se pise nada.</p>
  <p style="color:var(--ink-3)">En escritorio las barras siguen siendo las rayas de 4 px de hoy, que no marcan el valor:
     así lo pediste, y se deja dicho.</p>
  <div class="mandos">
    <button data-tema="light" class="on">Crema</button><button data-tema="dark">Oscuro</button>
    <span style="width:14px"></span>
    <button data-ajuste="ajustar" class="on">Ajustar al ancho</button><button data-ajuste="real">Tamaño real</button>
  </div>
</div>

<div class="bloque">
  <div class="rot"><b>El banco</b> — cada tamaño, con y sin retención</div>
  <div class="tablaCaja">${tabla(filas)}</div>
</div>

<div class="bloque">
  <div class="rot"><b>Móvil · 390 px</b> — arreglo B</div>
  <p class="porque">Las barras miden de verdad, el nombre del módulo va a la izquierda de sus barras y los días se
     escriben una vez. Mismos colores, mismas tarjetas.</p>
  <div class="par">
    <div><div class="etiq">Antes</div><div data-caso="mov" data-fase="antes"></div><div class="medida" data-salida="mov-antes"></div></div>
    <div><div class="etiq">Después</div><div data-caso="mov" data-fase="despues"></div><div class="medida" data-salida="mov-despues"></div></div>
  </div>
</div>

<div class="bloque">
  <div class="rot"><b>Escritorio · 1536×714, con retención</b> — tu diseño, que quepa</div>
  <p class="porque">Todo igual salvo el pie: la nota y la retención comparten fila, y esa fila sube 2 px. Es lo que
     hace que la pestaña deje de pasarse de los 385 px que caben a esta altura.</p>
  <div class="par">
    <div><div class="etiq">Antes</div><div data-caso="esc" data-fase="antes"></div><div class="medida" data-salida="esc-antes"></div></div>
    <div><div class="etiq">Después</div><div data-caso="esc" data-fase="despues"></div><div class="medida" data-salida="esc-despues"></div></div>
  </div>
</div>

<template id="modal-mov">${mov.modal}</template>
<template id="modal-esc">${esc.modal}</template>

<script>
${FUENTE}
const SEMANA = ${JSON.stringify(semana)};
const HOY = ${hoy};
const VIEW = { mov: ${mov.viewport}, esc: ${esc.viewport} };

function montar() {
  document.querySelectorAll('[data-caso]').forEach(slot => {
    const caso = slot.getAttribute('data-caso'), fase = slot.getAttribute('data-fase');
    slot.innerHTML = '';
    const f = document.createElement('iframe');
    f.style.cssText = 'display:block;border:0;background:transparent;width:' + VIEW[caso] + 'px';
    slot.appendChild(f);
    const d = f.contentDocument;
    d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>'); d.close();
    document.querySelectorAll('head style, head link[rel=stylesheet]').forEach(h => d.head.appendChild(h.cloneNode(true)));
    d.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') || 'light');
    d.documentElement.setAttribute('data-font', 'cormorant');
    d.body.style.cssText = 'margin:0;padding:12px 0;background:transparent';
    const modal = document.getElementById('modal-' + caso).content.cloneNode(true).firstElementChild;
    modal.classList.add('maq');
    d.body.appendChild(modal);
    if (fase === 'despues') {
      if (caso === 'mov') filasQueMiden(d, SEMANA, HOY);
      pieEnUnaFila(d);
    }
  });
}

function medir() {
  document.querySelectorAll('[data-caso]').forEach(slot => {
    const caso = slot.getAttribute('data-caso'), fase = slot.getAttribute('data-fase');
    const f = slot.querySelector('iframe'); if (!f) return;
    const d = f.contentDocument;
    f.style.height = Math.ceil(d.body.scrollHeight) + 'px';
    const v = d.querySelector('[data-pace-week-view]'); if (!v) return;
    const pares = solapesSemana(d) || [];
    const alto = Math.round(v.getBoundingClientRect().height * 10) / 10;
    const out = document.querySelector('[data-salida="' + caso + '-' + fase + '"]');
    out.innerHTML = 'textos que se pisan: <span class="' + (pares.length ? 'mal' : 'bien') + '">' + pares.length + '</span>'
      + (pares.length ? ' <span style="color:var(--ink-3)">' + pares.slice(0, 8).join(' · ') + (pares.length > 8 ? ' …' : '') + '</span>' : '')
      + '<br>alto de la pestaña: <b>' + alto + ' px</b>'
      + (caso === 'mov' ? ' (en móvil el panel scrollea)'
         : ' · techo 385 → <span class="' + (alto <= 385 ? 'bien' : 'mal') + '">' + (alto <= 385 ? 'cabe' : 'se pasa ' + Math.round((alto - 385) * 10) / 10 + ' px') + '</span>');
  });
}

function ajustar() {
  const filas = Array.from(document.querySelectorAll('.par'));
  filas.forEach(p => { p.style.zoom = 1; });
  medir();
  if ((document.documentElement.getAttribute('data-ajuste') || 'ajustar') !== 'ajustar') return;
  filas.forEach(p => {
    const n = p.getBoundingClientRect().width, disp = p.parentElement.clientWidth;
    if (n > 0 && disp > 0) p.style.zoom = Math.min(1, disp / n);
  });
}

function grupo(attr, fn) {
  document.querySelectorAll('[' + attr + ']').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[' + attr + ']').forEach(o => o.classList.toggle('on', o === b));
    fn(b.getAttribute(attr));
  }));
}
grupo('data-tema', t => {
  document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('[data-caso] iframe').forEach(f => f.contentDocument.documentElement.setAttribute('data-theme', t));
  ajustar();
});
grupo('data-ajuste', a => { document.documentElement.setAttribute('data-ajuste', a); ajustar(); });
document.documentElement.setAttribute('data-theme', 'light');
document.documentElement.setAttribute('data-ajuste', 'ajustar');
window.addEventListener('resize', ajustar);
montar(); ajustar();
setTimeout(ajustar, 400); setTimeout(ajustar, 1200);
</script>
</body>
</html>
`;
}

module.exports = { pagina };
