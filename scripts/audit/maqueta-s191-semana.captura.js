/* PACE · abrir la pestaña «Semana» de la app REAL en un viewport (s191)
 * =====================================================================
 * Lo comparten las rondas 2 y 3 de la maqueta de Semana: una semilla creible, el reloj
 * en DOMINGO (semana completa: el caso con mas cifras y mas solapes) y el camino hasta
 * el panel, que en movil pasa por el cajon.
 */
'use strict';

const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));

const DOMINGO = new Date(2026, 8, 20, 18, 0, 0);
const HOY = 6;

const SEMANA = (retencion) => ({
  focusMinutes: [75, 50, 25, 90, 45, 0, 60],
  breathMinutes: [10, 0, 5, 12, 0, 15, 8],
  moveMinutes: [8, 0, 0, 6, 4, 10, 5],
  waterGlasses: [6, 4, 3, 7, 5, 2, 6],
  holdSeconds: retencion ? [0, 0, 95, 0, 0, 150, 0] : [0, 0, 0, 0, 0, 0, 0],
});

/* La marca de la migracion de s69 va puesta: sin ella la app rota el array y el lunes
   aparece en domingo (paso al medir en s191). */
const semilla = (retencion) => ({
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
  _weeklyStatsReindexed_v0_28_8: true,
  lastActiveDay: DOMINGO.toDateString(),
  weeklyStats: SEMANA(retencion),
});

/* El corte que ya usa WeekView para su hoja de movil. */
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

module.exports = { chromium, ROOT, DOMINGO, HOY, SEMANA, semilla, esMovil, abrir };
