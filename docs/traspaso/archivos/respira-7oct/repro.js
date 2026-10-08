// Reproduce respira-1 y respira-2 sobre la página indicada (por defecto _antes.html).
'use strict';
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/respira-bugs-graves-31faf7';
const { chromium } = require(WT + '/node_modules/@playwright/test');
const PAGINA = process.argv[2] || '_antes.html';
const BASE = 'http://localhost:8791/' + PAGINA;
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true } };

async function nueva(browser) {
  const ctx = await browser.newContext({ locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', viewport: { width: 1280, height: 720 } });
  await ctx.addInitScript((s) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(s)); }, SEMILLA);
  const page = await ctx.newPage();
  return { ctx, page };
}

(async () => {
  const browser = await chromium.launch();
  // respira-1
  {
    const { ctx, page } = await nueva(browser);
    await page.goto(BASE);
    await page.getByRole('button', { name: /^Respira/ }).first().click();
    await page.locator('.pace-lib').waitFor({ state: 'visible' });
    await page.getByRole('heading', { name: 'Bhastrika · Fuelle', exact: true }).click();
    await page.waitForTimeout(800);
    const modal = await page.getByRole('button', { name: 'Empezar sesión' }).count();
    const prep = await page.locator('[data-pace-session-root]').getByText('PREPÁRATE').count();
    console.log('respira-1 Bhastrika -> modal seguridad:', modal, '· prepárate:', prep);
    await ctx.close();
  }
  // respira-2
  for (const [nombre, segs] of [['Respiración en rondas', 24], ['Rondas express', 24]]) {
    const { ctx, page } = await nueva(browser);
    await page.clock.install();
    await page.goto(BASE);
    await page.getByRole('button', { name: /^Respira/ }).first().click();
    await page.getByRole('heading', { name: nombre, exact: true }).click();
    const b = page.getByRole('button', { name: 'Empezar sesión' });
    if (await b.count()) { await page.getByText('Lo he leído y asumo mi responsabilidad').click(); await b.click(); }
    await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
    await page.locator('[data-pace-breathe-phase]').waitFor();
    for (let i = 0; i < segs; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(12); }
    const antes = await page.locator('[data-pace-breathe-breath]').textContent();
    await page.getByRole('button', { name: /Terminar/ }).click();
    await page.locator('[data-pace-session-stats]').waitFor();
    const stats = await page.locator('[data-pace-session-stat]').allTextContents();
    console.log('respira-2', nombre, '· antes de Terminar:', antes, '-> cierre:', stats);
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
