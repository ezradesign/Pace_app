const { test } = require('C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/beautiful-perlman-2b642c/node_modules/@playwright/test');
const { sembrar, irAlArtefacto } = require('C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/beautiful-perlman-2b642c/tests/helpers');
for (const [w, h, tactil] of [[1536, 710, false], [412, 915, true], [360, 730, true]]) {
  test(`n9b ${w}x${h}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: tactil, isMobile: tactil, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
    const page = await context.newPage();
    await sembrar(context, { palette: 'crema', sidebarCollapsed: true });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await page.waitForTimeout(1500);
    const log = [];
    /* ¿el asa es el mismo nodo de un segundo a otro? */
    log.push(await page.evaluate(async () => {
      const a = document.querySelector('[data-pace-sidebar-open]');
      const muta = []; const ob = new MutationObserver(ls => ls.forEach(l => { if ([...l.removedNodes].some(n => n.contains && (n === a || n.contains(a)))) muta.push('asa fuera'); }));
      ob.observe(document.body, { childList: true, subtree: true });
      await new Promise(r => setTimeout(r, 3200));
      ob.disconnect();
      return { mismoNodo: a === document.querySelector('[data-pace-sidebar-open]'), quitadas: muta.length };
    }));
    /* un toque largo que cruza el cambio de segundo */
    const box = await page.locator('[data-pace-sidebar-open]').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.waitForTimeout(1300); await page.mouse.up();
    await page.waitForTimeout(400);
    log.push({ trasToqueLargo: await page.evaluate(() => getState().sidebarCollapsed ? 'plegada' : 'abierta') });
    /* ¿se cierra sola con el Foco en marcha? */
    await page.waitForTimeout(6000);
    log.push({ seisSegundosDespues: await page.evaluate(() => getState().sidebarCollapsed ? 'plegada' : 'abierta') });
    /* plegarla otra vez y volver a abrir con un toque normal */
    await page.evaluate(() => setState({ sidebarCollapsed: true })); await page.waitForTimeout(300);
    if (tactil) await page.locator('[data-pace-sidebar-open]').tap(); else await page.locator('[data-pace-sidebar-open]').click();
    await page.waitForTimeout(400);
    log.push({ trasToque: await page.evaluate(() => getState().sidebarCollapsed ? 'plegada' : 'abierta') });
    console.log(w + 'x' + h, JSON.stringify(log));
    await context.close();
  });
}
