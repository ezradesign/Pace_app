// Fotos de la parte 1 (1A): la app real antes (index.html de HEAD) y después (el de la carpeta), a 360 px.
// Uso: node fotos-1a.js <worktree> <salida> <antes.html>
'use strict';
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const [, , W, OUT, ANTES] = process.argv;
const { chromium } = require(path.join(W, 'node_modules/playwright'));
fs.mkdirSync(OUT, { recursive: true });
const PUERTO = 8806;
const htmlAntes = fs.readFileSync(ANTES, 'utf8');

const T = {
  es: { estira: 'Estira', mueve: 'Mueve', empezar: /^Empezar$/, munecas: 'Muñecas y manos', hombros: 'Hombros · círculos', cuello: 'Cuello' },
  en: { estira: 'Stretch', mueve: 'Move', empezar: /^Start$/, munecas: 'Wrists & Hands', hombros: 'Shoulders · Circles', cuello: 'Neck' },
};

async function abrir(browser, version, lang) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 1.5, serviceWorkers: 'block' });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    { firstSeen: 1, lang, langAuto: false, palette: 'crema', ritmo: { libre: true }, premiumUnlocked: true });
  const page = await ctx.newPage();
  if (version === 'antes') await page.route('**/index.html', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: htmlAntes }));
  await page.goto(`http://localhost:${PUERTO}/index.html`);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  return page;
}
const lib = (page) => page.locator('.pace-lib').locator('visible=true').first();
async function biblioteca(page, modulo) {
  await page.getByRole('button', { name: new RegExp('^' + modulo) }).first().click();
  await page.waitForTimeout(900);
}
async function hoja(page, t, modulo, rutina) {
  await biblioteca(page, modulo);
  await lib(page).getByText(rutina, { exact: true }).locator('visible=true').first().click();
  await page.waitForTimeout(1100);
}
const nombre = (page) => page.locator('[data-pace-v1-name]').locator('visible=true').first().textContent().catch(() => '');
const fase = (page) => page.locator('[data-pace-v1-raiz]').first().getAttribute('data-pace-v1-fase').catch(() => '');
const siguiente = (page) => page.locator('[data-pace-v1-btn="next"]').locator('visible=true').first().click();
async function runner(page, t, objetivo) {
  await page.locator('[data-pace-modal-card]').locator('visible=true').last().getByRole('button', { name: t.empezar }).first().click();
  await page.waitForTimeout(800);
  const ahora = page.getByRole('button', { name: /Empezar ahora|Start now/ });
  if (await ahora.count()) await ahora.first().click();
  await page.waitForTimeout(5600);
  for (let i = 0; i < 12; i++) {
    const n = ((await nombre(page)) || '').trim();
    if (objetivo.test(n)) break;
    await siguiente(page); await page.waitForTimeout(900);
  }
  for (let i = 0; i < 4 && (await fase(page)) === 'place'; i++) { await siguiente(page); await page.waitForTimeout(900); }
  await page.waitForTimeout(2600);
}
async function foto(page, nombreFoto) {
  await page.screenshot({ path: path.join(OUT, nombreFoto + '.jpg'), type: 'jpeg', quality: 70 });
  console.log('  ' + nombreFoto, '·', ((await nombre(page)) || '').trim());
}

(async () => {
  const servidor = spawn(process.execPath, ['.claude/static-server.js'], { cwd: W, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 900));
  const browser = await chromium.launch();
  try {
    for (const version of ['antes', 'despues']) {
      for (const lang of ['es', 'en']) {
        const t = T[lang];
        const pre = version + '-' + lang + '-';
        let p = await abrir(browser, version, lang);
        await hoja(p, t, t.estira, t.munecas); await foto(p, pre + 'hoja-munecas'); await p.context().close();
        p = await abrir(browser, version, lang);
        await biblioteca(p, t.mueve);
        const card = p.locator('[data-pace-lib-card="extra.core.stealth"]').locator('visible=true').first();
        await card.scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
        await card.screenshot({ path: path.join(OUT, pre + 'tarjeta-core.jpg'), type: 'jpeg', quality: 70 });
        await card.getByRole('button').first().click(); await p.waitForTimeout(1100);
        await foto(p, pre + 'hoja-core'); await p.context().close();
        p = await abrir(browser, version, lang);
        await hoja(p, t, t.estira, t.hombros); await runner(p, t, /c[ií]rculos|circles/i); await foto(p, pre + 'runner-circulos'); await p.context().close();
        p = await abrir(browser, version, lang);
        await hoja(p, t, t.estira, t.cuello); await runner(p, t, /Rotaci[oó]n lenta|Slow rotation/i); await foto(p, pre + 'runner-rotacion'); await p.context().close();
      }
    }
  } finally {
    await browser.close();
    servidor.kill();
  }
})().catch((e) => { console.error(e); process.exit(1); });
