/* PACE · ANTES Y DESPUES DEL ARREGLO DE «SEMANA» (s191)
 * =====================================================
 * Genera `docs/proposals/stats-semana-arreglo.html`.
 *
 * El usuario rechazo los tres rediseños de la pestaña: «nuestro sistema actual es mas
 * colorido y mas armonico con PACE». Asi que esto NO cambia el diseño: arregla los
 * dos defectos que el banco midio sobre la app real, y nada mas.
 *
 *   1 · MOVIL -- la cifra de encima de cada barra sube hasta la linea del titulo:
 *       la del lunes pisa «Foco» y la del domingo pisa «min». 4 u 8 solapes en
 *       cualquier semana normal. En escritorio, 0: las columnas miden ~117 px y la
 *       cifra cae lejos del titulo.
 *       ARREGLO: una franja de 16 px sobre cada grafico, SOLO en movil. Las barras
 *       no se acortan (s176: «acortar la barra cambia lo que el grafico dice»).
 *   2 · ESCRITORIO BAJO -- con tiempo de retencion, la linea de apnea es una fila
 *       propia y la pestaña pasa de los 385 px que caben (a 1536x714).
 *       ARREGLO: la retencion comparte fila con la nota del pie.
 *
 *   3 · LAS BARRAS NO MIDEN NADA -- medido en la app: el grafico pide 83 %, 56 %,
 *       100 %... y TODAS se pintan a 4 px, el minHeight. El grafico alinea sus
 *       columnas abajo (align-items: flex-end), las columnas no se estiran, y la
 *       altura en % de la barra no tiene contra que resolverse. Hoy lo unico que
 *       dice el valor son las cifras de encima.
 *       ARREGLO B: el nombre del modulo pasa a una columna a la IZQUIERDA de sus
 *       barras (ya no hay un titulo encima con el que chocar), las barras miden en
 *       pixeles contra un alto fijo que ya descuenta la cifra, y la fila de dias se
 *       escribe UNA vez. Mismo color, mismas tarjetas, mismo pie.
 *
 * «Arreglo A» son solo los defectos 1 y 2; «Arreglo B» añade el 3.
 *
 * EL «DESPUES» SE CONSTRUYE CON EL MISMO CAMBIO QUE IRIA A LA APP: la misma regla CSS
 * y el mismo reagrupamiento del pie. Si se aprueba, se copia tal cual.
 *
 * EL RELOJ SE FIJA EN DOMINGO para que la semana este completa: es el caso con mas
 * solapes (lunes Y domingo con datos).
 *
 * Uso: node .claude/static-server.js   (aparte)
 *      node scripts/audit/maqueta-s191-semana-arreglo.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'stats-semana-arreglo.html');
const DOMINGO = new Date(2026, 8, 20, 18, 0, 0);

const semilla = (retencion) => ({
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
  _weeklyStatsReindexed_v0_28_8: true,
  lastActiveDay: DOMINGO.toDateString(),
  weeklyStats: {
    focusMinutes: [75, 50, 25, 90, 45, 0, 60],
    breathMinutes: [10, 0, 5, 12, 0, 15, 8],
    moveMinutes: [8, 0, 0, 6, 4, 10, 5],
    waterGlasses: [6, 4, 3, 7, 5, 2, 6],
    holdSeconds: retencion ? [0, 0, 95, 0, 0, 150, 0] : [0, 0, 0, 0, 0, 0, 0],
  },
});

/* EL ARREGLO 1, tal cual iria al <style> de WeekView. */
const CSS_ARREGLO = `
@media (max-width: 640px) {
  [data-pace-week-view] [data-pace-week-bar-row] [data-pace-bar-chart] { margin-top: 16px !important; }
}`;

async function calcar(browser, ancho, alto, movil, retencion) {
  const ctx = await browser.newContext({
    viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil,
  });
  await ctx.addInitScript(s => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla(retencion));
  const page = await ctx.newPage();
  await page.clock.setFixedTime(DOMINGO);
  await page.goto('http://localhost:8765/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  if (movil) {
    const m = page.getByRole('button', { name: /Men|Abrir|Panel/ }).first();
    if (await m.count()) { await m.click(); await page.waitForTimeout(400); }
  }
  const t = page.locator('[data-pace-semana]');
  for (let i = 0; i < await t.count(); i++) if (await t.nth(i).isVisible()) { await t.nth(i).click(); break; }
  await page.locator('[data-pace-week-view]').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const vistas = document.querySelector('[data-pace-stats-vistas]');
    let modal = vistas.parentElement;
    while (modal && modal.getBoundingClientRect().height < 200) modal = modal.parentElement;
    return {
      modal: modal.outerHTML,
      /* Sin @font-face: el index.html trae su copia de tokens.css con rutas /fonts/,
         que en la copia autocontenida pisaban a las incrustadas. */
      estilos: Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n')
        .replace(/@font-face\s*\{[^}]*\}/g, ''),
      viewport: window.innerWidth,
      scrollReal: Math.max(0, Math.round(modal.scrollHeight - modal.clientHeight)),
    };
  });
  await ctx.close();
  return r;
}

function pagina(casos) {
  const bloques = casos.map((c, i) => `
<div class="bloque">
  <div class="rot"><b>${c.titulo}</b> — ${c.sub}</div>
  <p class="porque">${c.porque}</p>
  <div class="par">
    <div><div class="etiq">Antes</div><div data-caso="${i}" data-fase="antes"></div><div class="medida" data-salida="${i}-antes"></div></div>
    <div><div class="etiq">Arreglo A · solo los solapes y el alto</div><div data-caso="${i}" data-fase="despues"></div><div class="medida" data-salida="${i}-despues"></div></div>
    <div><div class="etiq">Arreglo B · y las barras miden</div><div data-caso="${i}" data-fase="barras"></div><div class="medida" data-salida="${i}-barras"></div></div>
  </div>
</div>
<template id="modal-${i}">${c.calco.modal}</template>`).join('\n');

  return `<!doctype html>
<html lang="es" data-font="cormorant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Stats · Semana · el arreglo</title>
<link rel="stylesheet" href="/app/tokens.css">
<link rel="stylesheet" href="/app/motion.css">
<style>/* estilos de la app, calcados */
${casos[0].calco.estilos}
</style>
<style>
  body { padding: 26px 22px 70px; background: var(--paper-2); }
  .cab, .bloque { max-width: 1760px; margin: 0 auto 26px; }
  .bloque { margin-bottom: 44px; overflow-x: auto; }
  .cab h1 { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 30px; margin: 0 0 8px; }
  .cab p { font-size: 13px; color: var(--ink-2); line-height: 1.6; max-width: 940px; margin: 0 0 6px; }
  .cab b, .porque b, .medida b { color: var(--ink); }
  .mandos { display: flex; gap: 6px; margin-top: 14px; flex-wrap: wrap; }
  .mandos button { font-size: 11px; padding: 6px 11px; border: 1px solid var(--line); border-radius: 8px; background: var(--paper); color: var(--ink-2); cursor: pointer; }
  .mandos button.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .rot { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 4px; }
  .rot b { color: var(--ink); }
  .porque { font-size: 12.5px; color: var(--ink-2); line-height: 1.55; max-width: 900px; margin: 0 0 14px; border-left: 2px solid var(--line-2); padding-left: 11px; }
  .etiq { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink); font-weight: 600; margin-bottom: 6px; }
  .medida { font-size: 11.5px; color: var(--ink-2); margin-top: 8px; line-height: 1.6; max-width: 520px; }
  .mal { color: var(--breathe); font-weight: 600; }
  .bien { color: var(--focus); font-weight: 600; }
  .par { display: flex; gap: 30px; align-items: flex-start; width: max-content; }
  .par > * { flex: 0 0 auto; }
  .maq { position: relative !important; inset: auto !important; transform: none !important; animation: none !important; opacity: 1 !important; margin: 0 auto !important; max-height: none !important; }
</style>
</head>
<body>
<div class="cab">
  <h1>Stats · Semana · el arreglo</h1>
  <p><b>El diseño no cambia.</b> Mismos colores, mismas tarjetas, mismas barras. Solo se arreglan los dos defectos
     medidos sobre la app real. El panel está <b>calcado</b> del <code>index.html</code>, con el reloj en
     <b>domingo</b> para que la semana esté completa: es el caso con más solapes.</p>
  <p>El «después» lleva <b>exactamente el mismo cambio</b> que iría a la app. Debajo de cada panel, lo que la
     página mide: textos que se pisan y, en escritorio, el alto contra los <b>385 px</b> que caben a 1536×714.</p>
  <div class="mandos">
    <button data-tema="light" class="on">Crema</button><button data-tema="dark">Oscuro</button>
    <span style="width:14px"></span>
    <button data-ajuste="ajustar" class="on">Ajustar al ancho</button><button data-ajuste="real">Tamaño real</button>
  </div>
</div>
${bloques}
<script>
const CASOS = ${JSON.stringify(casos.map(c => ({ viewport: c.calco.viewport, movil: c.movil })))};
const CSS_ARREGLO = ${JSON.stringify(CSS_ARREGLO)};
const SEMANA = ${JSON.stringify(semilla(true).weeklyStats)};
const HOY = 6;   // el reloj de la captura esta fijado en domingo

/* ARREGLO B, con el mismo vocabulario que WeekBarRow (color de modulo, opacidad 0,8
   salvo hoy, raya de 2 px en los dias a cero, cifra de 10 px en tinta 3). Lo unico
   que cambia es la GEOMETRIA: nombre a la izquierda, barras en pixeles contra un
   alto que ya descuenta la cifra, y los dias una sola vez. */
function filasQueMiden(d, movil) {
  const vista = d.querySelector('[data-pace-week-view]');
  const filas = Array.from(vista.querySelectorAll('[data-pace-week-bar-row]'));
  if (!filas.length) return;
  const claves = ['focusMinutes', 'breathMinutes', 'moveMinutes', 'waterGlasses'];
  const colores = ['var(--focus)', 'var(--breathe)', 'var(--move)', 'var(--hydrate)'];
  const COL = movil ? 58 : 84, ALTO = movil ? 40 : 44, CIFRA = 14;
  const dias = Array.from(filas[0].querySelectorAll('[data-pace-bar-chart] > div > span')).map(x => x.textContent);
  filas.forEach((fila, k) => {
    const nombre = fila.firstElementChild.firstElementChild.textContent;
    const unidad = fila.firstElementChild.lastElementChild.textContent;
    const datos = SEMANA[claves[k]];
    const max = Math.max(1, ...datos);
    const util = ALTO - CIFRA;
    const nueva = d.createElement('div');
    nueva.setAttribute('data-pace-week-bar-row', '');
    nueva.style.cssText = 'display:grid;grid-template-columns:' + COL + 'px 1fr;gap:10px;align-items:end;margin-bottom:6px';
    nueva.innerHTML = '<div style="padding-bottom:1px;line-height:1.15">'
      + '<div style="font-family:var(--font-display);font-style:italic;font-size:13px;font-weight:500;color:var(--ink-2)">' + nombre + '</div>'
      + '<div style="font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);font-weight:500;margin-top:2px">' + unidad + '</div></div>'
      + '<div data-pace-bar-chart style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;align-items:end;height:' + ALTO + 'px">'
      + datos.map((v, i) => {
          const h = v > 0 ? Math.max(4, Math.round(v / max * util)) : 2;
          return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">'
            + (v > 0 ? '<span style="font-size:10px;line-height:11px;color:var(--ink-3);margin-bottom:3px;font-variant-numeric:tabular-nums">' + v + '</span>' : '')
            + '<div style="width:100%;height:' + h + 'px;background:' + (v > 0 ? colores[k] : 'var(--line)')
            + ';opacity:' + (i === HOY ? 1 : (v > 0 ? 0.8 : 0.4)) + ';border-radius:3px 3px 0 0"></div></div>';
        }).join('')
      + '</div>';
    /* La hoja de WeekView fuerza en movil «height: 28px !important» sobre el grafico, y
       aplastaba estos 40 px: las cifras se montaban en la fila de arriba y los dias,
       encima de las barras. En la app esa regla CAMBIA con este arreglo; aqui se
       neutraliza con la misma fuerza. */
    nueva.querySelector('[data-pace-bar-chart]').style.setProperty('height', ALTO + 'px', 'important');
    fila.replaceWith(nueva);
  });
  /* Los dias, UNA vez, alineados con las columnas de las barras. */
  const ultima = vista.querySelectorAll('[data-pace-week-bar-row]');
  const pieDias = d.createElement('div');
  pieDias.style.cssText = 'display:grid;grid-template-columns:' + COL + 'px 1fr;gap:10px;margin-top:-2px';
  pieDias.innerHTML = '<span></span><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">'
    + dias.map((x, i) => '<span style="text-align:center;font-size:10px;letter-spacing:.3px;color:' + (i === HOY ? 'var(--ink)' : 'var(--ink-3)') + ';font-weight:' + (i === HOY ? 600 : 400) + '">' + x + '</span>').join('')
    + '</div>';
  ultima[ultima.length - 1].after(pieDias);
}

/* EL ARREGLO 2, tal cual iria al JSX: la retencion y la nota comparten FILA al pie.
   Aqui se emula moviendo los dos nodos a un envoltorio con los mismos estilos. */
function pieEnUnaFila(d) {
  const nota = d.querySelector('[data-pace-week-note]');
  const ret = d.querySelector('[data-pace-week-hold]');
  if (!nota || !ret) return;
  const pie = d.createElement('div');
  pie.setAttribute('data-pace-week-foot', '');
  pie.style.cssText = 'display:flex;gap:14px;align-items:center;margin-top:10px';
  nota.parentNode.insertBefore(pie, nota);
  pie.appendChild(nota);
  pie.appendChild(ret);
  nota.style.marginTop = '0';
  nota.style.flex = '1 1 auto';
  ret.style.marginTop = '0';
  ret.style.flex = '0 0 auto';
  ret.style.gap = '10px';
}

function montar() {
  document.querySelectorAll('[data-caso]').forEach(slot => {
    const i = +slot.getAttribute('data-caso'), fase = slot.getAttribute('data-fase');
    slot.innerHTML = '';
    const f = document.createElement('iframe');
    f.style.cssText = 'display:block;border:0;background:transparent;width:' + CASOS[i].viewport + 'px';
    slot.appendChild(f);
    const d = f.contentDocument;
    d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>'); d.close();
    document.querySelectorAll('head style, head link[rel=stylesheet]').forEach(h => d.head.appendChild(h.cloneNode(true)));
    d.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') || 'light');
    d.documentElement.setAttribute('data-font', 'cormorant');
    d.body.style.cssText = 'margin:0;padding:12px 0;background:transparent';
    const modal = document.getElementById('modal-' + i).content.cloneNode(true).firstElementChild;
    modal.classList.add('maq');
    d.body.appendChild(modal);
    if (fase === 'despues') {
      const st = d.createElement('style'); st.textContent = CSS_ARREGLO; d.head.appendChild(st);
      pieEnUnaFila(d);
    }
    if (fase === 'barras') {
      filasQueMiden(d, CASOS[i].movil);
      pieEnUnaFila(d);
    }
  });
}

function medir() {
  document.querySelectorAll('[data-caso]').forEach(slot => {
    const i = +slot.getAttribute('data-caso'), fase = slot.getAttribute('data-fase');
    const f = slot.querySelector('iframe'); if (!f) return;
    const d = f.contentDocument;
    f.style.height = Math.ceil(d.body.scrollHeight) + 'px';
    const v = d.querySelector('[data-pace-week-view]');
    if (!v) return;
    const hojas = Array.from(v.querySelectorAll('span, div, strong')).filter(e => e.children.length === 0 && e.textContent.trim() && e.getBoundingClientRect().width > 0);
    const pares = [];
    const choca = (p, q) => Math.min(p.right, q.right) - Math.max(p.left, q.left) > 1 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 1;
    for (let a = 0; a < hojas.length; a++) for (let b = a + 1; b < hojas.length; b++) {
      if (choca(hojas[a].getBoundingClientRect(), hojas[b].getBoundingClientRect()))
        pares.push('«' + hojas[a].textContent.trim() + '»/«' + hojas[b].textContent.trim() + '»');
    }
    /* TEXTO CONTRA BARRA. La primera version solo comparaba textos entre si y dio 0
       solapes en un movil donde los dias se pintaban encima de las barras: una barra
       no tiene texto, asi que el detector no la veia. Una barra es un div VACIO con
       fondo en linea (las tarjetas y la nota tienen fondo pero tambien hijos). */
    const barrasCaja = Array.from(v.querySelectorAll('div')).filter(x => x.style.background && !x.children.length && !x.textContent.trim() && x.getBoundingClientRect().height > 0);
    hojas.forEach(t => barrasCaja.forEach(bx => {
      if (choca(t.getBoundingClientRect(), bx.getBoundingClientRect())) pares.push('«' + t.textContent.trim() + '»/barra');
    }));
    const alto = Math.round(v.getBoundingClientRect().height * 10) / 10;
    /* La BARRA de cada columna es su div con fondo en linea, sea cual sea el marcado:
       en la app va dentro de un envoltorio, en el arreglo B va suelta. */
    const barras = Array.from(v.querySelector('[data-pace-bar-chart]').children).map(c => {
      const conFondo = Array.from(c.querySelectorAll('div')).filter(x => x.style.background);
      const b = conFondo[conFondo.length - 1];
      return b ? Math.round(b.getBoundingClientRect().height) : 0;
    });
    const out = document.querySelector('[data-salida="' + i + '-' + fase + '"]');
    out.innerHTML = 'textos que se pisan: <span class="' + (pares.length ? 'mal' : 'bien') + '">' + pares.length + '</span>'
      + (pares.length ? ' <span style="color:var(--ink-3)">' + pares.join(' · ') + '</span>' : '')
      + '<br>barras de «Foco» pintadas (px): <b>' + barras.join(' · ') + '</b>'
      + '<br>alto de la pestaña: <b>' + alto + ' px</b>'
      + (CASOS[i].movil ? ' (en móvil el panel scrollea)'
         : ' · techo 385 → <span class="' + (alto <= 385 ? 'bien' : 'mal') + '">'
           + (alto <= 385 ? 'cabe' : 'se pasa ' + Math.round((alto - 385) * 10) / 10 + ' px') + '</span>');
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

(async () => {
  const b = await chromium.launch();
  const movil = await calcar(b, 390, 844, true, true);
  const bajo = await calcar(b, 1536, 714, false, true);
  await b.close();
  const casos = [
    { titulo: 'Móvil · 390 px', sub: 'las cifras que pisan el título', movil: true, calco: movil,
      porque: 'La cifra de cada barra va colgada <b>encima</b> de la barra. Con columnas de ~40 px, la del lunes cae sobre «Foco» y la del domingo sobre «min». El arreglo reserva una franja de 16 px encima de cada gráfico, <b>solo en móvil</b>: las cifras suben ahí y el título queda libre. Las barras no se acortan.' },
    { titulo: 'Escritorio · 1536×714, con retención', sub: 'la pestaña que se pasa de alto', movil: false, calco: bajo,
      porque: 'Con tiempo de retención, la línea de apnea ocupa una <b>fila propia</b> al pie y la pestaña se pasa de los 385 px que caben: el panel scrollea ' + bajo.scrollReal + ' px en la app real. El arreglo la pone <b>en la misma fila que la nota</b>, a la derecha. La cifra y su rótulo no cambian.' },
  ];
  fs.writeFileSync(SALIDA, pagina(casos));
  console.log('maqueta: ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
  console.log('scroll real en la app: movil ' + movil.scrollReal + ' px · 1536x714 ' + bajo.scrollReal + ' px');
})();
