'use strict';
// Fotos de los dibujos nuevos en la app de la rama, sin nada pintado encima: el runner en el paso de su
// rutina (360 y 1280 px) y la tarjeta de la biblioteca. Abre las rutinas como runner-claro/montado.js.
// Uso: node fotos.js <carpeta> [vecinos] [id,id…]. Levanta el servidor estático del worktree en el 8810 (si ya hay
// uno sirviendo este worktree, lo usa).
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const P = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const W = P + '/.claude/worktrees/elegant-pascal-d54e40';
const { chromium } = require(P + '/node_modules/playwright');
const OUT = path.resolve(process.argv[2]);
const VECINOS_ = process.argv[3] === 'vecinos';
const SOLO = (VECINOS_ ? process.argv[4] : process.argv[3]) || '';
fs.mkdirSync(OUT, { recursive: true });
const PORT = '8810';
const BASE = 'http://localhost:' + PORT;

const CASOS = [
  { s: 'bisagra-de-cadera', bib: 'Mueve', id: 'extra.legs.single', ej: 'Bisagra de cadera' },
  { s: 'gemelo-en-pared', bib: 'Estira', id: 'move.hamstrings', ej: 'Gemelo en pared' },
  { s: 'piernas-elevadas-sentado', bib: 'Mueve', id: 'extra.core.stealth', ej: 'Piernas elevadas sentado' },
  { s: 'desliza-el-talon', bib: 'Mueve', id: 'extra.pausa.suelo', ej: 'Desliza el talón' },
  { s: 'remo-con-banda', bib: 'Mueve', id: 'extra.banda.espalda', ej: 'Remo con banda' },
  { s: '90-90', bib: 'Estira', id: 'move.hips.5', ej: '90/90' },
  { s: 'rotacion-toracica-de-pie', bib: 'Estira', id: 'move.back.standing', ej: 'Rotación torácica de pie' },
  { s: 'inclinacion-de-tronco', bib: 'Estira', id: 'move.spine.waves', ej: 'Inclinación de tronco' },
  { s: 'gato-camello', bib: 'Estira', id: 'move.spine.waves', ej: 'Gato-camello' },
  { s: 'remo-con-tu-mano', bib: 'Mueve', id: 'extra.banda.espalda', ej: 'Remo con tu mano' },
  { s: 'pica-en-escritorio', bib: 'Mueve', id: 'extra.push.ladder', ej: 'Pica en escritorio' },
  { s: 'rodar-hacia-abajo', bib: 'Estira', id: 'move.back.standing', ej: 'Rodar hacia abajo' },
  { s: 'sentarse-y-levantarse-del-suelo', bib: 'Estira', id: 'move.hips.ground', ej: 'Sentarse y levantarse del suelo' },
  { s: 'apretar-gluteos', bib: 'Mueve', id: 'extra.glutes.stealth', ej: 'Apretar glúteos' },
];
/* Una pieza que ya está en la app al lado de cada nueva, de su rutina o de su módulo: con `vecinos`
   como segundo argumento se fotografían estas en vez de las nuevas. */
const VECINOS = [
  { s: 'zancada-profunda', bib: 'Mueve', id: 'extra.legs.single', ej: 'Zancada profunda' },
  { s: 'cuadriceps-en-pared', bib: 'Estira', id: 'move.couch.stretch', ej: 'Cuádriceps en pared' },
  { s: 'fondos-en-silla', bib: 'Mueve', id: 'extra.chair.dips', ej: 'Fondos en silla' },
  { s: 'hueco-abdominal', bib: 'Mueve', id: 'extra.core.plank', ej: 'Hueco abdominal' },
  { s: 'apertura-con-banda', bib: 'Mueve', id: 'extra.banda.espalda', ej: 'Apertura con banda' },
  { s: 'paloma', bib: 'Estira', id: 'move.hips.5', ej: 'Paloma' },
  { s: 'juntar-omoplatos', bib: 'Estira', id: 'move.back.standing', ej: 'Juntar omóplatos' },
  { s: 'rotacion-toracica', bib: 'Estira', id: 'move.spine.waves', ej: 'Rotación torácica' },
  { s: 'flexiones-inclinadas', bib: 'Mueve', id: 'extra.push.ladder', ej: 'Flexiones inclinadas' },
  { s: 'sentadilla-lateral', bib: 'Estira', id: 'move.hips.ground', ej: 'Sentadilla lateral' },
  { s: 'elevacion-de-talones', bib: 'Mueve', id: 'extra.glutes.stealth', ej: 'Elevación de talones' },
];

async function abrirBiblioteca(page, biblioteca) {
  await page.getByRole('button', { name: new RegExp('^' + biblioteca) }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
}
async function tarjeta(page, id) {
  const h = await page.evaluateHandle((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"]')]
    .find((e) => e.getBoundingClientRect().width > 0), id);
  const el = h.asElement();
  if (!el) throw new Error('sin tarjeta ' + id);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  return el;
}
async function empezar(page, id) {
  await page.evaluate((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click(), id);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar/i.test(x.textContent || '')).click();
  });
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
}
const nombre = async (page) => ((await page.locator('[data-pace-v1-name]').first().textContent()) || '').trim();
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');
const flecha = (page) => page.locator('[data-pace-v1-btn="next"]');

async function abrirApp(browser, w) {
  const movil = w < 700;
  const ctx = await browser.newContext({
    viewport: { width: w, height: movil ? 740 : 720 }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', paletteAuto: false, ritmo: { libre: true }, sidebarCollapsed: movil, cuerpoAuto: true });
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-29T10:00:00+01:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
  return { ctx, page };
}

async function esperarServidor() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(BASE + '/index.html'); if (r.ok) return; } catch (e) { /* aún no */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('el servidor no arranca en el ' + PORT);
}

(async () => {
  const srv = spawn(process.execPath, ['.claude/static-server.js'], { cwd: W, env: Object.assign({}, process.env, { PORT }), stdio: 'ignore' });
  try {
    await esperarServidor();
    const browser = await chromium.launch();
    for (const c of VECINOS_ ? VECINOS : CASOS) {
      if (SOLO && !SOLO.split(',').includes(c.s)) continue;
      for (const w of [360, 1280]) {
        const { ctx, page } = await abrirApp(browser, w);
        try {
          await abrirBiblioteca(page, c.bib);
          const t = await tarjeta(page, c.id);
          await t.screenshot({ path: OUT + '/' + c.s + '_tarjeta_' + w + '.png', animations: 'disabled' });
          await empezar(page, c.id);
          for (let i = 0; i < 40 && (await nombre(page)) !== c.ej; i++) { await flecha(page).click(); await page.clock.runFor(300); }
          if ((await nombre(page)) !== c.ej) throw new Error('no llega al paso: ' + (await nombre(page)));
          if ((await fase(page)) === 'place') { await flecha(page).click(); }
          await page.clock.runFor(1500);
          await page.screenshot({ path: OUT + '/' + c.s + '_runner_' + w + '.png', animations: 'disabled' });
          console.log(c.s, w, 'ok', await fase(page));
        } catch (e) { console.error(c.s, w, e.message); }
        await ctx.close();
      }
    }
    await browser.close();
  } finally { srv.kill(); }
})();
