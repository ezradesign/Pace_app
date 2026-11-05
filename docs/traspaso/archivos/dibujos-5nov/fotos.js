'use strict';
// Fotos de Rana y Palmas en la mesa en la app de la rama, sin nada pintado encima, en claro y en oscuro: el círculo del
// runner en el paso de su rutina (360 px a DPR 2 y 1280 px a DPR 1) y la tarjeta de la biblioteca. Cada dibujo nuevo,
// con un vecino de su rutina o de su módulo. Abre las rutinas como docs/traspaso/archivos/dibujos-29oct/fotos.js.
// Uso: node fotos.js <carpeta> [slug,slug…]. Levanta el servidor estático del worktree en el 8856 (si ya hay uno
// sirviendo este worktree, lo usa). Antes: node build-standalone.js y git checkout -- PACE_standalone.html.
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const W = path.resolve(__dirname, '..', '..', '..', '..');
const P = path.resolve(W, '..', '..', '..');
const { chromium } = require(P + '/node_modules/playwright');
const OUT = path.resolve(process.argv[2]);
const SOLO = process.argv[3] || '';
fs.mkdirSync(OUT, { recursive: true });
const PORT = '8856';
const BASE = 'http://localhost:' + PORT;

const CASOS = [
  { s: 'rana', bib: 'Estira', id: 'move.hips.ground', ej: 'Rana' },
  { s: 'gato-camello', bib: 'Estira', id: 'move.spine.waves', ej: 'Gato-camello' },
  { s: 'palmas-en-la-mesa', bib: 'Estira', id: 'extra.grip.squeeze', ej: 'Palmas en la mesa' },
  { s: 'estiramiento-de-muneca', bib: 'Estira', id: 'extra.grip.squeeze', ej: 'Estiramiento de muñeca' },
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

/* La caja del círculo que lleva el dibujo: el elemento con la máscara y, si dentro de poco más grande hay un
   contenedor redondo, ese. */
async function cajaCirculo(page) {
  return page.evaluate(() => {
    const raiz = document.querySelector('[data-pace-v1-raiz]');
    let mejor = null;
    for (const el of raiz.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      const m = cs.webkitMaskImage || cs.maskImage || '';
      if (!/assets\/ejercicios\//.test(m)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 40) continue;
      if (!mejor || r.width > mejor.r.width) mejor = { el, r };
    }
    if (!mejor) return null;
    let el = mejor.el, r = mejor.r;
    for (let i = 0; i < 4 && el.parentElement; i++) {
      const p = el.parentElement, pr = p.getBoundingClientRect(), pc = getComputedStyle(p);
      if (pr.width > r.width * 1.6) break;
      el = p; r = pr;
      if (parseFloat(pc.borderRadius) >= pr.width / 2 - 1 || /50%/.test(pc.borderRadius)) break;
    }
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
}

async function abrirApp(browser, w, paleta) {
  const movil = w < 700;
  const ctx = await browser.newContext({
    viewport: { width: w, height: movil ? 740 : 720 }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: paleta === 'oscuro' ? 'dark' : 'light', serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    { firstSeen: 1, lang: 'es', langAuto: false, palette: paleta, paletteAuto: false, ritmo: { libre: true }, sidebarCollapsed: movil, cuerpoAuto: true });
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-11-05T10:00:00+01:00') });
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
  let srv = null;
  try { const r = await fetch(BASE + '/index.html'); if (!r.ok) throw new Error('no'); } catch (e) {
    srv = spawn(process.execPath, ['.claude/static-server.js'], { cwd: W, env: Object.assign({}, process.env, { PORT }), stdio: 'ignore' });
  }
  try {
    await esperarServidor();
    const browser = await chromium.launch();
    for (const c of CASOS) {
      if (SOLO && !SOLO.split(',').includes(c.s)) continue;
      for (const paleta of ['crema', 'oscuro']) for (const w of [360, 1280]) {
        const { ctx, page } = await abrirApp(browser, w, paleta);
        const base = OUT + '/' + c.s + '_' + (paleta === 'oscuro' ? 'oscuro' : 'claro') + '_' + w;
        try {
          await abrirBiblioteca(page, c.bib);
          const t = await tarjeta(page, c.id);
          await t.screenshot({ path: base + '_tarjeta.png', animations: 'disabled' });
          await empezar(page, c.id);
          for (let i = 0; i < 40 && (await nombre(page)) !== c.ej; i++) { await flecha(page).click(); await page.clock.runFor(300); }
          if ((await nombre(page)) !== c.ej) throw new Error('no llega al paso: ' + (await nombre(page)));
          if ((await fase(page)) === 'place') { await flecha(page).click(); }
          await page.clock.runFor(1500);
          const caja = await cajaCirculo(page);
          if (!caja) throw new Error('no encuentro el dibujo en el runner');
          const pad = 8;
          await page.screenshot({ path: base + '_circulo.png', animations: 'disabled',
            clip: { x: Math.max(0, caja.x - pad), y: Math.max(0, caja.y - pad), width: caja.width + pad * 2, height: caja.height + pad * 2 } });
          await page.screenshot({ path: base + '_runner.png', animations: 'disabled' });
          console.log(c.s, paleta, w, 'ok', await fase(page), Math.round(caja.width) + 'px');
        } catch (e) { console.error(c.s, paleta, w, e.message); }
        await ctx.close();
      }
    }
    await browser.close();
  } finally { if (srv) srv.kill(); }
})();
