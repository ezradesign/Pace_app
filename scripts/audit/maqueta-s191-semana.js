/* PACE · MAQUETA DE LA PESTAÑA «SEMANA» (s191)
 * ============================================
 * Genera `docs/proposals/stats-semana-r1.html`.
 *
 * LA LECCION QUE LA HACE ASI. La ronda de HOY de esta misma sesion dibujo la sidebar
 * como una lista (la real es una rejilla 2x2 con iconos) y se invento la cabecera del
 * panel. El usuario no reconocio nada: «no entiendo nada». Asi que esta maqueta NO
 * reconstruye el panel: lo CALCA. Abre la app de verdad, abre Estadisticas y se lleva
 * el HTML del modal (PACE escribe los estilos en linea) y todas las <style> que la app
 * inyecta. Lo unico que se sustituye es lo de dentro de `[data-pace-stats-vistas]`.
 * Si alguien cambia el panel, la siguiente maqueta sale ya con el cambio.
 *
 * S0 es la pestaña ACTUAL, capturada tal cual: la referencia contra la que se mira.
 *
 * La PAGINA (HTML, hoja y guion) vive en `maqueta-s191-semana.pagina.js`.
 *
 * Uso: node .claude/static-server.js   (aparte)
 *      node scripts/audit/maqueta-s191-semana.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'stats-semana-r1.html');

/* Una semana creible vista un MIERCOLES, lunes-primero. La marca de la migracion de
   s69 va puesta: sin ella la app rota el array y el lunes aparece en domingo (paso al
   medir esta misma sesion). */
const SEMILLA = {
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
  _weeklyStatsReindexed_v0_28_8: true,
  lastActiveDay: new Date().toDateString(),
  weeklyStats: {
    focusMinutes: [75, 50, 25, 0, 0, 0, 0],
    breathMinutes: [10, 0, 5, 0, 0, 0, 0],
    moveMinutes: [8, 0, 0, 0, 0, 0, 0],
    waterGlasses: [6, 4, 3, 0, 0, 0, 0],
    holdSeconds: [0, 0, 0, 0, 0, 0, 0],
  },
  water: { goal: 8, today: 3, lastReset: new Date().toDateString() },
};

async function abrirStats(page, movil) {
  if (movil) {
    const menu = page.getByRole('button', { name: /Men|Abrir|Panel/ }).first();
    if (await menu.count()) { await menu.click(); await page.waitForTimeout(500); }
  }
  const tiras = page.locator('[data-pace-semana]');
  const n = await tiras.count();
  for (let i = 0; i < n; i++) {
    if (await tiras.nth(i).isVisible()) { await tiras.nth(i).click(); break; }
  }
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
}

async function calcar(browser, ancho, alto, movil) {
  const ctx = await browser.newContext({
    viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil,
  });
  await ctx.addInitScript(s => localStorage.setItem('pace.state.v2', JSON.stringify(s)), SEMILLA);
  const page = await ctx.newPage();
  await page.goto('http://localhost:8765/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await abrirStats(page, movil);
  const r = await page.evaluate(() => {
    const vistas = document.querySelector('[data-pace-stats-vistas]');
    let modal = vistas.parentElement;
    while (modal && modal.getBoundingClientRect().height < 200) modal = modal.parentElement;
    const cs = getComputedStyle(modal);
    const v = vistas.getBoundingClientRect();
    return {
      modal: modal.outerHTML,
      semana: vistas.innerHTML,
      /* Sin @font-face: el index.html lleva su PROPIA copia de tokens.css con rutas
         «/fonts/…», y en la copia autocontenida esas reglas pisaban a las incrustadas
         -- 90 peticiones fallidas y una fuente de sustitucion que cambiaba las
         medidas (S1 movil: 292 px en vez de 340). Las fuentes ya llegan por
         tokens.css. */
      estilos: Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n')
        .replace(/@font-face\s*\{[^}]*\}/g, ''),
      ancho: Math.round(modal.getBoundingClientRect().width),
      maxAlto: cs.maxHeight,
      viewport: window.innerWidth,
      vistaAncho: Math.round(v.width),
      vistaAlto: Math.round(v.height * 10) / 10,
    };
  });
  await ctx.close();
  return r;
}

const { pagina } = require('./maqueta-s191-semana.pagina');

(async () => {
  const b = await chromium.launch();
  const esc = await calcar(b, 1280, 800, false);
  const mov = await calcar(b, 390, 844, true);
  await b.close();
  fs.writeFileSync(SALIDA, pagina(esc, mov));
  console.log('maqueta: ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
  console.log('calco escritorio: modal ' + esc.ancho + ' px · vista ' + esc.vistaAncho + 'x' + esc.vistaAlto);
  console.log('calco movil:      modal ' + mov.ancho + ' px · vista ' + mov.vistaAncho + 'x' + mov.vistaAlto);
})();
