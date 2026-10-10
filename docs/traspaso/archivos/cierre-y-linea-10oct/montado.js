'use strict';
// La pantalla final ya montada (rama) contra main: fotos y cuánto scroll pide el centro, en varias pantallas.
const pw = require('C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/node_modules/@playwright/test');
const { spawn } = require('child_process');
const RAICES = { main: 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app', rama: 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/una-linea' };
const VPS = [{ w: 360, h: 718 }, { w: 360, h: 640 }, { w: 360, h: 600 }, { w: 1280, h: 800 }, { w: 1280, h: 560 }, { w: 1280, h: 430 }];
const segundos = async (page, n) => { for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); } };

async function alCierre(browser, BASE, vp, paleta) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 2, isMobile: vp.w < 700, hasTouch: vp.w < 700, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript(([p]) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify({ firstSeen: 1, lang: 'es', langAuto: false, palette: p, ritmo: { libre: true } })); }, [paleta]);
  const page = await ctx.newPage();
  await page.clock.install();
  await page.goto(BASE + '/index.html'); await page.locator('[data-pace-dial-number]').waitFor();
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await page.locator('[data-pace-modal-backdrop]').last().getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).click();
  const empezar = page.locator('[data-pace-modal-backdrop]').last().getByRole('button', { name: 'Empezar', exact: true });
  if (await empezar.count()) await empezar.click();
  const sesion = page.locator('[data-pace-session-root]');
  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
  const done = sesion.locator('[data-pace-session-done]');
  for (let s = 0; s < 300 && !(await done.count()); s++) await segundos(page, 1);
  await page.waitForTimeout(900);
  return { ctx, page };
}

(async () => {
  let port = 8796;
  const browser = await pw.chromium.launch();
  for (const [nombre, R] of Object.entries(RAICES)) {
    const PORT = port++; const BASE = 'http://localhost:' + PORT;
    const srv = spawn(process.execPath, ['.claude/static-server.js'], { cwd: R, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 1200));
    for (const vp of VPS) {
      const { ctx, page } = await alCierre(browser, BASE, vp, 'crema');
      const m = await page.evaluate(() => {
        const c = document.querySelector('[data-pace-session-center]');
        const ahora = document.querySelector('[data-pace-fb-ghost]'), pie = document.querySelector('[data-pace-session-footer]');
        const tapa = ahora && pie ? Math.round(ahora.getBoundingClientRect().bottom - pie.getBoundingClientRect().top) : null;
        return { sobra: c ? c.scrollHeight - c.clientHeight : null, tapa };
      });
      console.log(nombre, vp.w + 'x' + vp.h, 'scroll del centro', m.sobra, 'px · «Ahora no» bajo el pie', m.tapa);
      if (nombre === 'rama' && (vp.h === 718 || vp.h === 800)) await page.screenshot({ path: __dirname + '/montado-' + vp.w + '-crema.png' });
      await ctx.close();
    }
    if (nombre === 'rama') {
      const { ctx, page } = await alCierre(browser, BASE, { w: 360, h: 718 }, 'oscuro');
      await page.screenshot({ path: __dirname + '/montado-360-oscuro.png' });
      await ctx.close();
    }
    srv.kill();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
