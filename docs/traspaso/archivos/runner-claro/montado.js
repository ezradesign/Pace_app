// Fotos del runner de Mueve y Estira ya montado (B3, P5, P6 y P8, lo que eligió Ez el 29 oct. 2026): el
// index.html de esta rama tal cual. Donde un retoque de Ez se puede leer de dos formas, la otra lectura va
// pintada encima con CSS («otra»), sin tocar el código. Uso: node montado.js <carpeta-de-fotos> [escena],
// con la app servida en el 8808 (PORT=8808 node .claude/static-server.js, desde la raíz del worktree). Las
// fotos no se suben; la página la arma montado-pagina.js. Cada escena sale a 360 y a 1280 px, en claro.
'use strict';
const path = require('path');
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const { chromium } = require(R + '/node_modules/playwright');
const OUT = path.resolve(process.argv[2] || __dirname + '/fotos-montado');
const SOLO = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:' + (process.env.PACE_E2E_PORT || '8808');

async function abrirRutina(page, biblioteca, id) {
  await page.getByRole('button', { name: new RegExp('^' + biblioteca) }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
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
const paso = async (page) => +(await page.getByText(/^Paso \d+ de \d+$/).first().textContent()).match(/Paso (\d+)/)[1] - 1;
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');
const flecha = (page) => page.locator('[data-pace-v1-btn="next"]');
async function hasta(page, cond, maxSeg) {
  for (let i = 0; i < (maxSeg || 60); i++) { if (await cond()) return true; await page.clock.runFor(1000); }
  return cond();
}
async function irAlPaso(page, idx) {
  for (let i = 0; i < 40 && (await paso(page)) < idx; i++) { await flecha(page).click(); await page.clock.runFor(200); }
}

async function abrirApp(browser, w, extra) {
  const movil = w < 700;
  const ctx = await browser.newContext({
    viewport: { width: w, height: movil ? 740 : 720 }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    Object.assign({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', paletteAuto: false, ritmo: { libre: true }, sidebarCollapsed: movil }, extra || {}));
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-29T10:00:00+01:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
  return { ctx, page };
}

/* La otra lectura de un retoque, pintada encima: CSS que se quita antes de la foto siguiente. */
async function pintar(page, css) {
  await page.evaluate((c) => {
    document.querySelectorAll('[data-maq]').forEach((e) => e.remove());
    if (!c) return;
    const st = document.createElement('style'); st.setAttribute('data-maq', ''); st.textContent = c; document.head.appendChild(st);
  }, css || '');
  await page.waitForTimeout(100);
}

const ESCENAS = {
  /* B3 · la apertura con banda, sin Auto: la flecha es «Hecho» y «Saltar este paso» va junto al número. */
  async b3(page, w, foto) {
    await abrirRutina(page, 'Mueve', 'extra.banda.espalda');
    await flecha(page).click();
    await page.clock.runFor(300);
    await foto('b3');
  },
  /* P5 · con Auto: colocarse, la serie guiada y el descanso. */
  async p5(page, w, foto) {
    await abrirRutina(page, 'Mueve', 'extra.desk.pushups');
    await page.clock.runFor(1000);
    await foto('p5-colocarse');
    await flecha(page).click();
    await page.clock.runFor(300);
    await foto('p5');
    await flecha(page).click();
    await page.clock.runFor(4000);
    await foto('p5-descanso');
  },
  async p5lado(page, w, foto) {
    await abrirRutina(page, 'Estira', 'move.hips.standing');
    for (let i = 0; i < 12 && !/lateral/i.test(await page.locator('[data-pace-v1-name]').textContent()); i++) {
      await flecha(page).click(); await page.clock.runFor(300);
    }
    if ((await fase(page)) === 'place') await flecha(page).click();
    await page.clock.runFor(5000);
    await foto('p5-lado');
  },
  /* Un aguante que no es el último («Siguiente»; pintada, la otra lectura: «Hecho») y el último. */
  async p5aguante(page, w, foto) {
    await abrirRutina(page, 'Mueve', 'extra.core.stealth');
    await flecha(page).click();
    await page.clock.runFor(3000);
    await foto('p5-aguante');
    await page.evaluate(() => { document.querySelector('[data-pace-v1-btn="next"] .pace-v1-rotulo').textContent = 'Hecho'; });
    await foto('p5-aguante-hecho');
    await irAlPaso(page, 4);
    if ((await fase(page)) === 'place') await flecha(page).click();
    await page.clock.runFor(3000);
    await foto('p5-ultimo');
  },
  /* P6 · Levántate y sube con Auto: la serie (el hueco de la pastilla, vacío), el descanso, la otra
     lectura de «cuadrada» (esquinas rectas), el salto a los talones y el cierre. */
  async p6(page, w, foto) {
    await abrirRutina(page, 'Mueve', 'extra.chair.squats');
    await flecha(page).click();
    await page.clock.runFor(300);
    await foto('p6-serie');
    await hasta(page, async () => (await paso(page)) === 1, 40);
    await page.clock.runFor(4000);
    await foto('p6');
    await pintar(page, '.pace-v1-numbasta .pace-v1-mas { border-radius: 4px !important; padding: 3px 12px !important; }');
    await foto('p6-cuadrada');
    await pintar(page, '');
    await page.locator('[data-pace-v1-basta]').click();
    await page.clock.runFor(1000);
    await foto('p6-talones');
    await hasta(page, async () => (await paso(page)) === 5, 45);
    await page.locator('[data-pace-v1-basta]').click();
    await page.locator('[data-pace-session-done]').waitFor({ timeout: 10000 });
    await page.clock.runFor(1500);
    await foto('p6-cierre');
  },
  /* P8 · Core silencioso a mitad del aguante, en pausa; la otra lectura del retoque (el velo sobre
     todo, translúcido, con la bola a través); y el 3, 2, 1 al reanudar. */
  async p8(page, w, foto) {
    await abrirRutina(page, 'Mueve', 'extra.core.stealth');
    await flecha(page).click();
    await page.clock.runFor(12000);
    await foto('p8-antes');
    await page.locator('[data-pace-v1-btn="pausa"]').click();
    await page.clock.runFor(300);
    await foto('p8');
    await pintar(page, `
      .pace-v1[data-pace-v1-en-pausa] > * { opacity: 1 !important; }
      .pace-v1-velo { top: 0 !important; background: color-mix(in oklab, var(--paper) 82%, transparent);
        -webkit-backdrop-filter: blur(1.5px); backdrop-filter: blur(1.5px); }`);
    await foto('p8-otra');
    await pintar(page, '');
    await page.locator('[data-pace-v1-btn="pausa"]').click();
    await page.clock.runFor(100);
    await foto('p8-3');
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const [nombre, escena] of Object.entries(ESCENAS)) {
    if (SOLO && SOLO !== nombre) continue;
    for (const w of [360, 1280]) {
      const auto = nombre !== 'b3';
      const { ctx, page } = await abrirApp(browser, w, { cuerpoAuto: auto });
      const foto = async (n) => { await page.screenshot({ path: OUT + '/' + n + '_' + w + '.png', animations: 'disabled' }); console.log(n + '_' + w); };
      try { await escena(page, w, foto); } catch (e) { console.error(nombre, w, e.message); }
      await ctx.close();
    }
  }
  await browser.close();
})();
