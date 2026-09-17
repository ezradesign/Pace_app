/* PACE · «SEMANA», RONDA 2: B EN MOVIL, EL DE SIEMPRE EN ESCRITORIO (s191)
 * ========================================================================
 * Genera `docs/proposals/stats-semana-r2.html`.
 *
 * LO QUE PIDIO EL USUARIO, literal: «Arreglo B y las barras miden, pero solo para el
 * movil, y que quepa sin scroll en los viewports mas grandes al menos».
 *   · movil (<= 640 px, el corte que ya usa WeekView): arreglo B;
 *   · el resto: su diseño de siempre + el pie en una fila, para que quepa.
 *
 * «QUE QUEPA» NO SE COMPRUEBA EN UN VIEWPORT, SE COMPRUEBA EN VARIOS, y en la APP REAL:
 * el banco abre index.html en cada tamaño, mide el scroll del panel, le aplica el
 * arreglo EN VIVO (las mismas funciones que la maqueta, de
 * `maqueta-s191-semana.arreglos.js`) y lo vuelve a medir. Sin tocar el codigo.
 * Con y sin retencion, porque la retencion es la que añade la fila que empujaba.
 *
 * EL RELOJ VA EN DOMINGO: semana completa, que es el caso con mas cifras y mas solapes.
 *
 * Uso: node .claude/static-server.js   (aparte)
 *      node scripts/audit/maqueta-s191-semana-r2.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const A = require('./maqueta-s191-semana.arreglos');
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'stats-semana-r2.html');
const DOMINGO = new Date(2026, 8, 20, 18, 0, 0);
const HOY = 6;
const FUENTE = [A.pieEnUnaFila, A.filasQueMiden, A.solapesSemana].map(f => f.toString()).join('\n');

const SEMANA = (retencion) => ({
  focusMinutes: [75, 50, 25, 90, 45, 0, 60],
  breathMinutes: [10, 0, 5, 12, 0, 15, 8],
  moveMinutes: [8, 0, 0, 6, 4, 10, 5],
  waterGlasses: [6, 4, 3, 7, 5, 2, 6],
  holdSeconds: retencion ? [0, 0, 95, 0, 0, 150, 0] : [0, 0, 0, 0, 0, 0, 0],
});
const semilla = (retencion) => ({
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
  _weeklyStatsReindexed_v0_28_8: true,
  lastActiveDay: DOMINGO.toDateString(),
  weeklyStats: SEMANA(retencion),
});

/* Los tamaños: los del usuario (1280x879, 360x730, 412x844, de su memoria de
   proyecto), el de s176 (1536x714, el mas bajo de los habituales) y los comunes. */
const VIEWPORTS = [
  [1920, 1080], [1536, 864], [1440, 900], [1366, 768], [1280, 879], [1280, 800],
  [1280, 720], [1536, 714], [1024, 768], [768, 1024], [412, 844], [390, 844], [360, 730],
];
const esMovil = w => w <= 640;

async function abrir(browser, w, h, retencion) {
  const movil = esMovil(w);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil });
  await ctx.addInitScript(s => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla(retencion));
  const page = await ctx.newPage();
  await page.clock.setFixedTime(DOMINGO);
  await page.goto('http://localhost:8765/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  const pulsarTira = async () => {
    const t = page.locator('[data-pace-semana]');
    for (let i = 0; i < await t.count(); i++) if (await t.nth(i).isVisible()) { await t.nth(i).click(); return true; }
    return false;
  };
  if (!await pulsarTira()) {
    const m = page.getByRole('button', { name: /Men|Abrir|Panel/ }).first();
    if (await m.count()) { await m.click(); await page.waitForTimeout(400); }
    if (!await pulsarTira()) throw new Error('no se encontro la tira de dias a ' + w + 'x' + h);
  }
  await page.locator('[data-pace-week-view]').waitFor({ state: 'visible' });
  await page.waitForTimeout(450);
  return { ctx, page, movil };
}

/* Lo que se mide, igual antes y despues: el mayor scroll de cualquier caja que
   pueda scrollear alrededor de la vista, los solapes y el alto de la pestaña. */
const MEDIR = `(() => {
  ${FUENTE}
  const vistas = document.querySelector('[data-pace-stats-vistas]');
  let scroll = 0, e = vistas;
  while (e && e !== document.body) {
    const oy = getComputedStyle(e).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && e.scrollHeight > e.clientHeight + 1)
      scroll = Math.max(scroll, Math.round(e.scrollHeight - e.clientHeight));
    e = e.parentElement;
  }
  const semana = document.querySelector('[data-pace-week-view]');
  return { scroll, solapes: solapesSemana(document).length,
           alto: Math.round(semana.getBoundingClientRect().height * 10) / 10 };
})()`;

async function banco(browser) {
  const filas = [];
  for (const [w, h] of VIEWPORTS) {
    for (const retencion of [false, true]) {
      const { ctx, page, movil } = await abrir(browser, w, h, retencion);
      const antes = await page.evaluate(MEDIR);
      await page.evaluate(({ src, semana, hoy, movil: mv }) => {
        const f = new Function(src + '; return { pieEnUnaFila, filasQueMiden };')();
        if (mv) f.filasQueMiden(document, semana, hoy);
        f.pieEnUnaFila(document);
      }, { src: FUENTE, semana: SEMANA(retencion), hoy: HOY, movil });
      await page.waitForTimeout(150);
      const despues = await page.evaluate(MEDIR);
      filas.push({ w, h, movil, retencion, antes, despues });
      console.log((w + 'x' + h).padEnd(10) + (retencion ? ' con ret.' : ' sin ret.')
        + '  antes: scroll ' + String(antes.scroll).padStart(3) + ' · solapes ' + antes.solapes
        + '   despues: scroll ' + String(despues.scroll).padStart(3) + ' · solapes ' + despues.solapes + ' · alto ' + despues.alto);
      await ctx.close();
    }
  }
  return filas;
}

async function calcar(browser, w, h) {
  const { ctx, page } = await abrir(browser, w, h, true);
  const r = await page.evaluate(() => {
    const vistas = document.querySelector('[data-pace-stats-vistas]');
    let modal = vistas.parentElement;
    while (modal && modal.getBoundingClientRect().height < 200) modal = modal.parentElement;
    return {
      modal: modal.outerHTML,
      estilos: Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n')
        .replace(/@font-face\s*\{[^}]*\}/g, ''),
      viewport: window.innerWidth,
    };
  });
  await ctx.close();
  return r;
}

const { pagina } = require('./maqueta-s191-semana-r2.pagina');

(async () => {
  const b = await chromium.launch();
  console.log('BANCO DE VIEWPORTS · la app real, antes y despues del arreglo');
  const filas = await banco(b);
  const esc = await calcar(b, 1536, 714);
  const mov = await calcar(b, 390, 844);
  await b.close();
  fs.writeFileSync(SALIDA, pagina({ esc, mov, filas, FUENTE, semana: SEMANA(true), hoy: HOY }));
  console.log('maqueta: ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
})();
