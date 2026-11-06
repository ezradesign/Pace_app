/* ¿Qué ve a las 17:40 quien dejó la jornada en la pausa de las 9:35? Con la página abierta (a saltos
   de 5 min o de golpe) y recargando. */
const L = require('./lib'); const S = require('./siembra');
const J = new Date(2026, 10, 5, 8, 50);
const leer = (p) => p.evaluate(() => {
  const v = (s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | ');
  return { label: v('[data-pace-dial-label]'), sub: v('[data-pace-dial-subtitle]'), cta: v('[data-pace-cta]'), num: v('[data-pace-dial-number]'), side: v('[data-pace-sidebar-accion]').slice(0, 80), linea: v('[data-pace-ritmo-linea]').slice(0, 60) };
});
(async () => {
  await L.lanzar();
  for (const modo of ['saltos', 'golpe']) {
    const { estado } = S.veterana(J, {});
    const { ctx, page } = await L.abrir({ tam: 'escritorio', lang: 'es', estado, reloj: J, espera: 1500 });
    await page.locator('[data-pace-ritmo-loseta="jornada"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    const fin = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
    await page.clock.fastForward(fin - await page.evaluate(() => Date.now()) + 1000);
    await page.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached' });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const objetivo = new Date(2026, 10, 5, 17, 40).getTime();
    if (modo === 'saltos') {
      while (await page.evaluate(() => Date.now()) < objetivo) { await page.clock.fastForward(5 * 60 * 1000); await page.waitForTimeout(30); }
    } else await page.clock.fastForward(objetivo - await page.evaluate(() => Date.now()));
    await page.waitForTimeout(800);
    console.log(modo, 'abierta', JSON.stringify(await leer(page)));
    await page.reload(); await page.waitForTimeout(1500);
    console.log(modo, 'recargada', JSON.stringify(await leer(page)));
    await L.foto(page, '_tarde-' + modo + '-recargada');
    await ctx.close();
  }
  await L.cerrar();
})();
