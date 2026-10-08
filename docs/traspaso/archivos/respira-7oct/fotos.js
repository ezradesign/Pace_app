// Fotos reales de la app, antes / después / variante B, para la página de Ez.
'use strict';
const path = require('path');
const fs = require('fs');
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/respira-bugs-graves-31faf7';
const { chromium } = require(WT + '/node_modules/@playwright/test');
const OUT = path.join(__dirname, 'fotos');
fs.mkdirSync(OUT, { recursive: true });
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true } };
const MOVIL = { width: 360, height: 718 };
const PC = { width: 1280, height: 720 };

async function contexto(browser, vp) {
  const ctx = await browser.newContext({ locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', viewport: vp, deviceScaleFactor: 2 });
  await ctx.addInitScript((s) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(s)); }, SEMILLA);
  return ctx;
}
async function segundos(page, n) { for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(12); } }
async function abrirRespira(page) {
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
  await page.waitForTimeout(700);
}
async function aceptar(page) {
  const b = page.getByRole('button', { name: 'Empezar sesión' });
  if (await b.count()) { await page.getByText('Lo he leído y asumo mi responsabilidad').click(); await b.click(); }
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
  await page.locator('[data-pace-breathe-phase]').waitFor();
}
async function recorte(page, sel, file, pad) {
  const el = page.locator(sel).locator('visible=true').first();
  const bb = await el.boundingBox();
  const p = pad || 10;
  await page.screenshot({ path: file, clip: { x: Math.max(0, bb.x - p), y: Math.max(0, bb.y - p), width: bb.width + 2 * p, height: bb.height + 2 * p } });
}
async function sinAvisoDeLogro(page) {
  // El aviso de «Nuevo sello» tapa el pie unos segundos (es otro hallazgo, respira-5): se deja pasar.
  await page.clock.fastForward(9000); await page.waitForTimeout(400);
}

async function escenas(browser, pagina, tag) {
  const url = 'http://localhost:8791/' + pagina;
  const f = (n) => path.join(OUT, tag + '-' + n + '.png');

  // 1 · la tarjeta y el filtro, en el PC
  { const ctx = await contexto(browser, PC); const page = await ctx.newPage();
    await page.goto(url); await page.locator('[data-pace-dial-number]').waitFor();
    await abrirRespira(page);
    await page.locator('[data-pace-lib-card="breathe.bellows"]').locator('visible=true').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await recorte(page, '[data-pace-lib-card="breathe.bellows"]', f('tarjeta'), 8);
    await recorte(page, '[data-pace-lib-card="breathe.kapalabhati"]', f('tarjeta-kapalabhati'), 8);
    await recorte(page, '.pace-lib-lateral .pace-lib-chip >> nth=1', f('chip'), 6);
    // al pulsarla
    await page.getByRole('heading', { name: 'Bhastrika · Fuelle', exact: true }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: f('toque-pc') });
    await ctx.close(); }

  // 2 · al pulsarla, en el móvil
  { const ctx = await contexto(browser, MOVIL); const page = await ctx.newPage();
    await page.goto(url); await page.locator('[data-pace-dial-number]').waitFor();
    await abrirRespira(page);
    await page.getByRole('heading', { name: 'Bhastrika · Fuelle', exact: true }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: f('toque-movil') });
    await ctx.close(); }

  // 3 · Terminar en la ronda 1 (Rondas express, respiración 7 de 25)
  { const ctx = await contexto(browser, MOVIL); const page = await ctx.newPage();
    await page.clock.install();
    await page.goto(url); await page.locator('[data-pace-dial-number]').waitFor();
    await abrirRespira(page);
    await page.getByRole('heading', { name: 'Rondas express', exact: true }).click();
    await aceptar(page);
    await segundos(page, 24);
    await page.screenshot({ path: f('ronda1-activa') });
    await page.getByRole('button', { name: /Terminar/ }).click();
    await page.locator('[data-pace-session-stats]').waitFor();
    await sinAvisoDeLogro(page);
    await page.screenshot({ path: f('ronda1-cierre') });
    await ctx.close(); }

  // 4 · reanudada en la ronda 2 y Terminar
  for (const [nombre, breaths, terminar] of [['reanudada', 7, true], ['completa', 24, false]]) {
    const ctx = await contexto(browser, PC); const page = await ctx.newPage();
    await page.clock.install();
    await page.goto(url); await page.locator('[data-pace-dial-number]').waitFor();
    await page.evaluate((b) => { const a = Date.now(); localStorage.setItem('pace.breathe.v1', JSON.stringify({ v: 1, routineId: 'breathe.rounds.express', round: 2, breaths: b, activeMs: 120000, holdSec: 20, startedAt: a - 240000, savedAt: a - 60000 })); }, breaths);
    await page.reload(); await page.locator('[data-pace-dial-number]').waitFor();
    await page.locator('[data-pace-sidebar-accion]').getByRole('button').click();
    await aceptar(page);
    await page.setViewportSize(MOVIL); await page.waitForTimeout(300);
    if (terminar) {
      await page.screenshot({ path: f(nombre + '-activa') });
      await page.getByRole('button', { name: /Terminar/ }).click();
    } else {
      for (let s = 0; s < 20; s++) { if (await page.getByRole('button', { name: 'Respirar de nuevo' }).count()) break; await segundos(page, 1); }
      await page.getByRole('button', { name: 'Respirar de nuevo' }).click();
    }
    await page.locator('[data-pace-session-stats]').waitFor();
    await sinAvisoDeLogro(page);
    await page.screenshot({ path: f(nombre + '-cierre') });
    await ctx.close();
  }
}

(async () => {
  const browser = await chromium.launch();
  const solo = process.argv[2];
  for (const [pagina, tag] of [['_antes.html', 'antes'], ['index.html', 'despues'], ['_variante-b.html', 'varb']]) {
    if (solo && solo !== tag) continue;
    await escenas(browser, pagina, tag);
    console.log('hecho', tag);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
