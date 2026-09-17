/* PACE · «SEMANA», RONDA 3: TODOS LOS VIEWPORTS, SIN RETENCION (s191)
 * ===================================================================
 * Genera `docs/proposals/stats-semana-r3.html`.
 *
 * LO QUE PIDIO EL USUARIO: «no quiero la parte de retencion de momento, dame un html con
 * todos los viewports».
 *   · movil (<= 640 px): arreglo B -- barras que miden, nombre a la izquierda, dias una vez;
 *   · todos: sin la linea «Retencion esta semana» (el dato se sigue guardando).
 *
 * CADA VIEWPORT ES UNA PANTALLA ENTERA. El iframe mide exactamente el viewport y lleva la
 * CAPA del panel calcada (no solo la tarjeta): con su posicion fija, su centrado y su
 * alto maximo, que se resuelven contra el alto del iframe. Si la pestaña no cabe, el
 * scroll aparece DENTRO del panel, como en la app. En las rondas 1 y 2 el iframe medía
 * lo que su contenido, y eso no podia enseñar un scroll.
 *
 * Y la tabla sale, como en la ronda 2, de la APP REAL con el arreglo aplicado en vivo.
 *
 * Uso: node .claude/static-server.js   (aparte)
 *      node scripts/audit/maqueta-s191-semana-r3.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const C = require('./maqueta-s191-semana.captura');
const A = require('./maqueta-s191-semana.arreglos');
const { pagina } = require('./maqueta-s191-semana-r3.pagina');

const SALIDA = path.join(C.ROOT, 'docs', 'proposals', 'stats-semana-r3.html');
const FUENTE = [A.filasQueMiden, A.solapesSemana, A.sinRetencion, A.notaMasCerca].map(f => f.toString()).join('\n');

const VIEWPORTS = [
  { w: 1920, h: 1080, tipo: 'Escritorio' }, { w: 1536, h: 864, tipo: 'Escritorio' },
  { w: 1440, h: 900, tipo: 'Escritorio' }, { w: 1366, h: 768, tipo: 'Escritorio' },
  { w: 1280, h: 879, tipo: 'Escritorio', nota: 'el tuyo' }, { w: 1280, h: 800, tipo: 'Escritorio' },
  { w: 1280, h: 720, tipo: 'Escritorio' }, { w: 1536, h: 714, tipo: 'Escritorio', nota: 'el más bajo (s176)' },
  { w: 1024, h: 768, tipo: 'Tableta' }, { w: 768, h: 1024, tipo: 'Tableta' },
  { w: 412, h: 844, tipo: 'Móvil', nota: 'el tuyo' }, { w: 390, h: 844, tipo: 'Móvil' },
  { w: 360, h: 730, tipo: 'Móvil', nota: 'el tuyo' },
];

/* Lo mismo antes y despues: el mayor scroll de cualquier caja que pueda scrollear
   alrededor de la vista, los solapes, el alto de la pestaña y si queda la retencion. */
const MEDIR = `(() => {
  ${FUENTE}
  const vistas = document.querySelector('[data-pace-stats-vistas]');
  let scroll = 0, e = vistas;
  while (e && e !== document.body) {
    const oy = getComputedStyle(e).overflowY;
    /* ESTRICTO: la primera version exigia +1 y dio «sin scroll» donde la app tenia 1 px
       -- 606 de contenido en 605 de caja--, que en Windows ya pinta la barra. */
    if ((oy === 'auto' || oy === 'scroll') && e.scrollHeight > e.clientHeight)
      scroll = Math.max(scroll, Math.round(e.scrollHeight - e.clientHeight));
    e = e.parentElement;
  }
  const semana = document.querySelector('[data-pace-week-view]');
  return { scroll, solapes: solapesSemana(document).length,
           alto: Math.round(semana.getBoundingClientRect().height * 10) / 10,
           retencion: !!document.querySelector('[data-pace-week-hold]') };
})()`;

async function unViewport(browser, vp) {
  const { ctx, page, movil } = await C.abrir(browser, vp.w, vp.h, true);
  const antes = await page.evaluate(MEDIR);
  /* La CAPA entera: el primer antecesor con posicion fija. */
  const calco = await page.evaluate(() => {
    const vistas = document.querySelector('[data-pace-stats-vistas]');
    let capa = vistas.parentElement;
    while (capa && capa !== document.body && getComputedStyle(capa).position !== 'fixed') capa = capa.parentElement;
    return {
      capa: capa && capa !== document.body ? capa.outerHTML : null,
      estilos: Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n')
        .replace(/@font-face\s*\{[^}]*\}/g, ''),
    };
  });
  await page.evaluate(({ src, semana, hoy, mv }) => {
    const f = new Function(src + '; return { filasQueMiden, sinRetencion, notaMasCerca };')();
    f.sinRetencion(document);
    f.notaMasCerca(document);
    if (mv) f.filasQueMiden(document, semana, hoy);
  }, { src: FUENTE, semana: C.SEMANA(true), hoy: C.HOY, mv: movil });
  await page.waitForTimeout(150);
  const despues = await page.evaluate(MEDIR);
  await ctx.close();
  if (!calco.capa) throw new Error('sin capa fija a ' + vp.w + 'x' + vp.h);
  console.log((vp.w + 'x' + vp.h).padEnd(10)
    + ' antes: scroll ' + String(antes.scroll).padStart(3) + ' · solapes ' + antes.solapes
    + '   despues: scroll ' + String(despues.scroll).padStart(3) + ' · solapes ' + despues.solapes
    + ' · alto ' + despues.alto + (despues.retencion ? ' · QUEDA RETENCION' : ''));
  return Object.assign({}, vp, { movil, antes, despues, capa: calco.capa, estilos: calco.estilos });
}

(async () => {
  const b = await C.chromium.launch();
  console.log('RONDA 3 · la app real en cada viewport, antes y despues');
  const filas = [];
  for (const vp of VIEWPORTS) filas.push(await unViewport(b, vp));
  await b.close();
  fs.writeFileSync(SALIDA, pagina({ filas, FUENTE, semana: C.SEMANA(true), hoy: C.HOY }));
  console.log('maqueta: ' + path.relative(C.ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
})();
