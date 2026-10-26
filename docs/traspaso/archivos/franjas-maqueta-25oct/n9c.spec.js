const { test } = require('C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/beautiful-perlman-2b642c/node_modules/@playwright/test');
const { sembrar, irAlArtefacto } = require('C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/beautiful-perlman-2b642c/tests/helpers');
for (const [w, h, tactil] of [[1536, 710, false], [412, 915, true]]) for (const foco of [false, true]) {
  test(`n9c ${w}x${h} foco=${foco}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: tactil, isMobile: tactil, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
    const page = await context.newPage();
    await sembrar(context, { palette: 'crema', sidebarCollapsed: true });
    await irAlArtefacto(page);
    if (foco) { await page.getByRole('button', { name: 'Empezar foco', exact: true }).click(); await page.waitForTimeout(2500); }
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    await page.waitForTimeout(800);
    const r = await page.evaluate(async () => {
      const frames = []; let t0 = performance.now(), ult = t0, vivo = true;
      const bucle = (t) => { frames.push(t - ult); ult = t; if (vivo) requestAnimationFrame(bucle); };
      requestAnimationFrame(bucle);
      await new Promise(r => setTimeout(r, 600));
      const antes = frames.splice(0);
      const ini = performance.now();
      document.querySelector('[data-pace-sidebar-open]').click();
      let visible = null;
      while (performance.now() - ini < 3000) {
        await new Promise(r => requestAnimationFrame(r));
        const sb = document.querySelector('[data-pace-sidebar]');
        if (sb && visible == null && sb.getBoundingClientRect().width > 0 && getComputedStyle(sb).visibility !== 'hidden') visible = performance.now() - ini;
      }
      vivo = false;
      const despues = frames;
      const p = (a) => { const s = a.slice().sort((x, y) => x - y); return { n: a.length, med: Math.round(s[Math.floor(s.length / 2)] || 0), max: Math.round(s[s.length - 1] || 0), largos: a.filter(x => x > 50).length }; };
      return { reposo: p(antes), alAbrir: p(despues.slice(0, 40)), msHastaVer: visible && Math.round(visible) };
    });
    console.log(`${w}x${h} foco=${foco}`, JSON.stringify(r));
    await context.close();
  });
}
