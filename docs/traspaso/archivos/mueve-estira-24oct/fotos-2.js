// Fotos de la parte 2 (2A 3A 4A): la app real con las capas, a 360 y 1280 px, en español e inglés.
// Uso: node fotos-2.js <worktree> <salida>. Sirve la carpeta en el 8806 y no deja nada en el repo.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const [, , W, OUT] = process.argv;
const { chromium } = require(path.join(W, 'node_modules/playwright'));
fs.mkdirSync(OUT, { recursive: true });
const PUERTO = 8806;

const T = {
  es: { estira: 'Estira', mueve: 'Mueve', empezar: /^Empezar$/, entrada: 'Levántate y sube', banda: 'Espalda con banda' },
  en: { estira: 'Stretch', mueve: 'Move', empezar: /^Start$/, entrada: 'Stand and Rise', banda: 'Back with a Band' },
};

async function abrir(browser, lang, ancho, alto) {
  const movil = ancho < 768;
  const ctx = await browser.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: movil ? 1.5 : 1,
    serviceWorkers: 'block', isMobile: movil, hasTouch: movil });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    { firstSeen: 1, lang, langAuto: false, palette: 'crema', ritmo: { libre: true }, sidebarCollapsed: movil });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PUERTO}/index.html`);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  return page;
}
const lib = (page) => page.locator('.pace-lib').locator('visible=true').first();
const arriba = (page) => page.locator('[data-pace-modal-card]').locator('visible=true').last();
async function biblioteca(page, modulo) {
  await page.getByRole('button', { name: new RegExp('^' + modulo) }).first().click();
  await page.waitForTimeout(1000);
}
async function hoja(page, t, modulo, rutina) {
  await biblioteca(page, modulo);
  await lib(page).getByText(rutina, { exact: true }).locator('visible=true').first().click();
  await page.waitForTimeout(1100);
}
async function runner(page, t) {
  await arriba(page).getByRole('button', { name: t.empezar }).first().click();
  await page.waitForTimeout(800);
  const ahora = page.getByRole('button', { name: /Empezar ahora|Start now/ });
  if (await ahora.count()) await ahora.first().click();
  await page.waitForTimeout(5600);
  const fase = () => page.locator('[data-pace-v1-raiz]').first().getAttribute('data-pace-v1-fase').catch(() => '');
  for (let i = 0; i < 4 && (await fase()) === 'place'; i++) {
    await page.locator('[data-pace-v1-btn="next"]').locator('visible=true').first().click(); await page.waitForTimeout(900);
  }
  await page.waitForTimeout(2200);
}
const foto = (page, n) => page.screenshot({ path: path.join(OUT, n + '.jpg'), type: 'jpeg', quality: 68 });

(async () => {
  const servidor = spawn(process.execPath, ['.claude/static-server.js'], { cwd: W, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 900));
  const browser = await chromium.launch();
  try {
    for (const lang of ['es', 'en']) {
      const t = T[lang];
      for (const [ancho, alto] of [[360, 740], [1280, 760]]) {
        const pre = lang + '-' + ancho + '-';
        /* Las bibliotecas enteras: una ventana alta y la caja de la biblioteca. */
        for (const [modulo, n] of [[t.mueve, 'mueve'], [t.estira, 'estira']]) {
          const p = await abrir(browser, lang, ancho, 6000);
          await biblioteca(p, modulo);
          const caja = await lib(p).boundingBox();
          await p.screenshot({ path: path.join(OUT, pre + 'biblioteca-' + n + '.jpg'), type: 'jpeg', quality: 62, clip: caja });
          console.log('  ' + pre + 'biblioteca-' + n, Math.round(caja.height) + ' px');
          await p.context().close();
        }
        for (const [rutina, n] of [[t.entrada, 'empezar'], [t.banda, 'material']]) {
          const p = await abrir(browser, lang, ancho, alto);
          await hoja(p, t, t.mueve, rutina); await foto(p, pre + 'hoja-' + n);
          await runner(p, t); await foto(p, pre + 'runner-' + n);
          console.log('  ' + pre + n);
          await p.context().close();
        }
      }
    }
  } finally {
    await browser.close();
    servidor.kill();
  }
})().catch((e) => { console.error(e); process.exit(1); });
