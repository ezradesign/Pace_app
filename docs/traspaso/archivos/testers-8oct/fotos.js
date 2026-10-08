/* PACE · capturas para el mensaje a los testers (8 oct. 2026)
   Uso, desde la raíz del repo y con index.html construido:
     node docs/traspaso/archivos/testers-8oct/fotos.js [puerto]
   Levanta su propio servidor (8798 por defecto) y deja en esta carpeta, a 360×718 (el móvil de
   Ez): la pregunta de la semana en la bienvenida, la mañana con el día ya contestado y Mueve con
   su mando de tres botones. */
'use strict';

const path = require('path');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../..');
const { chromium } = require(path.join(RAIZ, 'node_modules', '@playwright', 'test'));
const PUERTO = Number(process.argv[2] || 8798);
const BASE = 'http://localhost:' + PUERTO;
const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];

async function pagina(browser, estado, hora) {
  const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 360, height: 718 }, isMobile: true, hasTouch: true,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', deviceScaleFactor: 3 });
  if (estado) await ctx.addInitScript((e) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); }, estado);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(hora) });
  await page.goto('/index.html');
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page };
}

(async () => {
  const srv = spawn(process.execPath, ['.claude/static-server.js'], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  try {
    /* 1 · la bienvenida pregunta la semana */
    let { ctx, page } = await pagina(browser, null, '2026-10-08T09:00:00+02:00');
    await page.locator('[data-pace-scene-card][role="dialog"]').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Comenzar' }).click();
    await page.locator('[data-pace-semana-editor]').waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(__dirname, '1-tu-semana.png') });
    await ctx.close();

    /* 2 · cada mañana, el día ya contestado */
    ({ ctx, page } = await pagina(browser, { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', sidebarCollapsed: true, ritmo: { semanaTipo: LV } }, '2026-10-09T08:30:00+02:00'));
    await page.locator('[data-pace-ritmo-estado="habitual"]').filter({ visible: true }).first().waitFor();
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(__dirname, '2-dia-contestado.png') });
    await ctx.close();

    /* 3 · Mueve con el mando de tres botones, al colocarse */
    ({ ctx, page } = await pagina(browser, { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', sidebarCollapsed: true, ritmo: { libre: true } }, '2026-10-09T10:00:00+02:00'));
    await page.getByRole('button', { name: /^Mueve/ }).first().click();
    await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const t = [...document.querySelectorAll('[data-pace-lib-card]')].filter((e) => e.getBoundingClientRect().width > 0)
        .find((e) => /Gemelos/.test((e.querySelector('h4') || e).textContent || ''));
      (t.querySelector('.pace-lib-hit') || t).click();
    });
    const capas = page.locator('[data-pace-modal-backdrop]');
    await capas.last().getByRole('button', { name: 'Empezar', exact: true }).click();
    await page.getByRole('button', { name: 'Empezar ahora' }).click();
    await page.locator('[data-pace-v1-body]').first().waitFor({ state: 'visible' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(__dirname, '3-mueve-mando.png') });
    await ctx.close();
  } finally {
    await browser.close();
    srv.kill();
  }
})().catch((e) => { console.error(e); process.exit(1); });
