'use strict';
// Fotos de la app real (main) para que Ez elija: la pantalla de «Sesión completada» y la niebla de la línea del Pomodoro.
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const { chromium } = require(R + '/node_modules/@playwright/test');
const { spawn } = require('child_process');
const PORT = 8784, BASE = 'http://localhost:' + PORT;
const OUT = __dirname;
const SEMILLA = (extra) => Object.assign({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true } }, extra || {});

/* Pantalla final: dos vestidos inyectados encima de la de hoy. */
const CIERRE = {
  A: `
    [data-pace-fb-chip] { font-family: var(--font-display) !important; font-style: italic !important; font-weight: 500 !important;
      font-size: 17px !important; padding: 0 22px !important; min-height: 42px; border-radius: var(--r-pill) !important;
      background: var(--paper-2) !important; border: 1px solid var(--line-2) !important; color: var(--ink) !important; }
    [data-pace-fb-ghost] { font-family: var(--font-display) !important; font-style: italic !important; font-size: 15px !important;
      text-decoration: underline; text-underline-offset: 3px; color: var(--ink-3) !important; }
    [data-pace-fb-question] { font-size: 17px !important; }
    [data-pace-session-footer] button { font-family: var(--font-display) !important; font-style: italic !important; font-weight: 500 !important;
      font-size: 19px !important; letter-spacing: 0 !important; border-radius: var(--r-pill) !important; padding: 0 34px !important; min-height: 50px; }
    [data-pace-session-header] button { font-family: var(--font-display) !important; font-style: italic !important; font-size: 16px !important; }
  `,
  B: `
    [data-pace-fb-chips] { gap: 4px !important; }
    [data-pace-fb-chip] { font-family: var(--font-display) !important; font-style: italic !important; font-weight: 500 !important;
      font-size: 20px !important; padding: 6px 12px !important; background: none !important; border: 0 !important; color: var(--ink) !important; }
    [data-pace-fb-chip] + [data-pace-fb-chip]::before { content: '·'; margin-right: 16px; color: var(--ink-3); font-style: normal; }
    [data-pace-fb-ghost] { font-family: var(--font-display) !important; font-style: italic !important; font-size: 15px !important;
      text-decoration: underline; text-underline-offset: 3px; color: var(--ink-3) !important; }
    [data-pace-fb-question] { font-size: 17px !important; }
    [data-pace-session-footer] button { font-family: var(--font-display) !important; font-style: italic !important; font-weight: 500 !important;
      font-size: 19px !important; letter-spacing: 0 !important; border-radius: var(--r-pill) !important; padding: 0 34px !important; min-height: 50px; }
    [data-pace-session-header] button { font-family: var(--font-display) !important; font-style: italic !important; font-size: 16px !important; }
  `,
};

/* La niebla del arco, con la misma fórmula que _responsive.atmosfera.js (nieblaCon) y otro largo. */
const CURVA = [[1, 1], [0.72, 0.94], [0.46, 0.74], [0.26, 0.44], [0.12, 0.18], [0, 0]];
const niebla = (largo) => 'linear-gradient(180deg, #000 0px, ' + CURVA.map((p) =>
  'rgb(0 0 0 / ' + p[1] + ') calc(100% - var(--pace-corte) - calc(var(--pace-dial-d) * ' + (largo * p[0]).toFixed(4) + '))').join(', ') + ')';
const ARCO = { hoy: null, A: 0.08, B: 0.14 };

async function contexto(browser, vp, extra) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 2, isMobile: vp.w < 700, hasTouch: vp.w < 700, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript(([e]) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); }, [SEMILLA(extra)]);
  return ctx;
}
const segundos = async (page, n) => { for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); } };

(async () => {
  const srv = spawn(process.execPath, ['.claude/static-server.js'], { cwd: R, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
  const browser = await chromium.launch();
  try {
    /* 1 · LA PANTALLA FINAL, tras «Suspiro fisiológico» (2 min, sin aviso de seguridad). */
    for (const vp of [{ n: '360', w: 360, h: 718 }, { n: '1280', w: 1280, h: 800 }]) {
      const ctx = await contexto(browser, vp);
      const page = await ctx.newPage();
      await page.clock.install();
      await page.goto(BASE + '/index.html'); await page.locator('[data-pace-dial-number]').waitFor();
      await page.getByRole('button', { name: /^Respira/ }).first().click();
      await page.locator('[data-pace-modal-backdrop]').last().getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).click();
      const prev = page.locator('[data-pace-modal-backdrop]').last();
      const empezar = prev.getByRole('button', { name: 'Empezar', exact: true });
      if (await empezar.count()) await empezar.click();
      const sesion = page.locator('[data-pace-session-root]');
      await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
      const done = sesion.locator('[data-pace-session-done]');
      for (let s = 0; s < 300 && !(await done.count()); s++) await segundos(page, 1);
      await page.waitForTimeout(900);
      for (const v of ['hoy', 'A', 'B']) {
        await page.evaluate(([css]) => { let st = document.getElementById('foto-vestido'); if (!st) { st = document.createElement('style'); st.id = 'foto-vestido'; document.head.appendChild(st); } st.textContent = css; }, [CIERRE[v] || '']);
        await page.waitForTimeout(250);
        await page.screenshot({ path: OUT + '/cierre-' + vp.n + '-' + v + '.png' });
      }
      await ctx.close();
    }

    /* 2 · LA LÍNEA DEL POMODORO al minuto 1 y al 5, en el móvil de Ez. */
    for (const min of [1, 5]) {
      const ctx = await contexto(browser, { w: 360, h: 718 });
      const page = await ctx.newPage();
      await page.clock.install({ time: new Date('2026-10-10T10:00:00+02:00') });
      await page.goto(BASE + '/index.html'); await page.locator('[data-pace-dial-number]').waitFor();
      await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
      for (let i = 0; i < min * 6; i++) { await page.clock.fastForward(10000); await page.waitForTimeout(30); }
      await page.waitForTimeout(1500);
      for (const v of ['hoy', 'A', 'B']) {
        await page.evaluate(([m]) => { let st = document.getElementById('foto-niebla'); if (!st) { st = document.createElement('style'); st.id = 'foto-niebla'; document.head.appendChild(st); } st.textContent = m ? '[data-pace-dial-fit] [data-pace-dial-ring] { -webkit-mask-image: ' + m + ' !important; mask-image: ' + m + ' !important; }' : ''; }, [ARCO[v] ? niebla(ARCO[v]) : null]);
        await page.waitForTimeout(300);
        await page.screenshot({ path: OUT + '/arco-min' + min + '-' + v + '.png' });
        const b = await page.locator('[data-pace-dial-halo]').boundingBox();
        await page.screenshot({ path: OUT + '/arco-min' + min + '-' + v + '-cerca.png', clip: { x: 0, y: Math.max(0, b.y - 110), width: 220, height: 190 } });
      }
      await ctx.close();
    }
  } finally { await browser.close(); srv.kill(); }
  console.log('hecho');
})().catch(e => { console.error(e); process.exit(1); });
