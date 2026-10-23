// Fotos para la página de Mueve y Estira: la app real, hoy y con la propuesta metida por dentro.
// Uso: node fotos.js [solo-esta-foto], con la app servida en el 8812 (PORT=8812 node .claude/static-server.js .). Deja las fotos en ./fotos: no se suben.
'use strict';
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const { chromium } = require(R + '/node_modules/playwright');
const aplicar = require('./propuesta.js');
const OUT = __dirname + '/fotos';
require('fs').mkdirSync(OUT, { recursive: true });
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true } };
const SOLO = process.argv[2];

async function abrirApp(browser, nivel, alto) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: alto || 730 }, deviceScaleFactor: alto ? 1 : 2 });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); }, SEMILLA);
  const page = await ctx.newPage();
  /* La propuesta entra en el index antes de montar la app: así los filtros y «Para ahora» cuentan con ella. */
  if (nivel) {
    await page.route('**/index.html', async (route) => {
      const res = await route.fetch();
      const html = await res.text();
      const ancla = "if (typeof document !== 'undefined' && document.getElementById('pace-root')) {";
      if (html.indexOf(ancla) === -1) throw new Error('sin ancla en index.html');
      await route.fulfill({ response: res, body: html.replace(ancla, () => 'window.__propuesta = (' + aplicar.toString() + ')(' + JSON.stringify(nivel) + ');\n' + ancla) });
    });
  }
  await page.goto('http://localhost:8812/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  if (nivel) console.log('  propuesta:', await page.evaluate(() => window.__propuesta));
  await page.waitForTimeout(400);
  return page;
}
const lib = (page) => page.locator('.pace-lib').locator('visible=true').first();
async function biblioteca(page, modulo) {
  await page.getByRole('button', { name: new RegExp('^' + modulo) }).first().click();
  await page.waitForTimeout(900);
}
async function hoja(page, modulo, rutina) {
  await biblioteca(page, modulo);
  await lib(page).getByText(rutina, { exact: true }).first().click();
  await page.waitForTimeout(1200);
}
async function runner(page, saltos, nombre) {
  await page.getByRole('button', { name: /^Empezar$/ }).locator('visible=true').first().click();
  await page.waitForTimeout(4200);
  const titulo = () => page.evaluate(() => [...document.querySelectorAll('[data-pace-session-root] h2, [data-pace-session-root] h1')]
    .map((e) => e.textContent.trim()).join(' | '));
  for (let i = 0; i < 12 && saltos && (await titulo()).split(' | ').pop() !== saltos; i++) {
    await page.locator('[data-pace-v1-btn="next"]').locator('visible=true').first().click();
    await page.waitForTimeout(1000);
  }
  const colocate = () => page.evaluate(() => [...document.querySelectorAll('body *')].some((e) => e.childElementCount === 0
    && /^colócate$/i.test(e.textContent.trim()) && e.offsetParent));
  let col = false;
  for (let i = 0; i < 16 && !col; i++) { col = await page.evaluate(() => document.body.innerText.includes('arranca solo')); if (!col) await page.waitForTimeout(500); }
  if (col) {
    await page.locator('[data-pace-v1-btn="next"]').locator('visible=true').first().click();
  }
  await page.waitForTimeout(1300);
  console.log('  ' + nombre + ':', await titulo());
  await page.screenshot({ path: OUT + '/' + nombre + '.png' });
}
async function entera(page, nombre) {
  const caja = await lib(page).boundingBox();
  await page.screenshot({ path: OUT + '/' + nombre + '.png', clip: caja });
  console.log('  ' + nombre, Math.round(caja.height), 'px');
}

const FOTOS = {
  async 'd1-hoy'(b) { const p = await abrirApp(b, null); await hoja(p, 'Estira', 'Hombros · círculos'); await runner(p, 0, 'd1-hoy-runner'); },
  async 'd1-a'(b) { const p = await abrirApp(b, 'textos'); await hoja(p, 'Estira', 'Hombros · círculos'); await runner(p, 0, 'd1-a-runner'); },
  async 'd2-hoy'(b) {
    let p = await abrirApp(b, null); await biblioteca(p, 'Mueve'); await p.screenshot({ path: OUT + '/d2-hoy-mueve.png' });
    p = await abrirApp(b, null); await biblioteca(p, 'Estira'); await p.screenshot({ path: OUT + '/d2-hoy-estira.png' });
  },
  async 'd2-a'(b) {
    let p = await abrirApp(b, 'capas'); await biblioteca(p, 'Mueve'); await p.screenshot({ path: OUT + '/d2-a-mueve.png' });
    p = await abrirApp(b, 'capas'); await biblioteca(p, 'Estira'); await p.screenshot({ path: OUT + '/d2-a-estira.png' });
  },
  async 'd2-a-hoja'(b) { const p = await abrirApp(b, 'capas'); await hoja(p, 'Mueve', 'Levántate y sube'); await p.screenshot({ path: OUT + '/d2-a-hoja.png' }); await runner(p, 0, 'd2-a-runner'); },
  async 'enteras'(b) {
    for (const [nivel, modulo, nombre] of [[null, 'Mueve', 'd2-hoy-mueve-entera'], [null, 'Estira', 'd2-hoy-estira-entera'],
      ['capas', 'Mueve', 'd2-a-mueve-entera'], ['capas', 'Estira', 'd2-a-estira-entera'],
      ['solo', 'Mueve', 'd2-b-mueve-entera'], ['solo', 'Estira', 'd2-b-estira-entera']]) {
      const p = await abrirApp(b, nivel, 9000); await biblioteca(p, modulo); await entera(p, nombre); await p.context().close();
    }
  },
  async 'd3'(b) {
    const p = await abrirApp(b, 'capas'); await hoja(p, 'Mueve', 'Espalda con banda');
        await p.screenshot({ path: OUT + '/d3-hoja.png' });
    await runner(p, 'Remo con banda', 'd3-runner');
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const [n, f] of Object.entries(FOTOS)) {
    if (SOLO && SOLO !== n) continue;
    console.log(n);
    try { await f(browser); } catch (e) { console.log('  FALLO', n, e.message.split('\n')[0]); }
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
