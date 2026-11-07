/* A las 17:40, con la pausa de las 9:35 abierta: ¿qué hace «Empezar bloque 2»? Y a las 12:00. */
const L = require('./lib'); const S = require('./siembra');
const J = new Date(2026, 10, 5, 8, 50);
const leer = (p) => p.evaluate(() => {
  const v = (s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | ');
  return { label: v('[data-pace-dial-label]'), sub: v('[data-pace-dial-subtitle]'), cta: v('[data-pace-cta]'), num: v('[data-pace-dial-number]'), side: v('[data-pace-sidebar-accion]').slice(0, 80), cab: v('[data-pace-ritmo-resumen]').slice(0, 120), linea: v('[data-pace-ritmo-linea]').slice(0, 160) };
});
(async () => {
  await L.lanzar();
  for (const [h, m] of [[12, 0], [16, 50], [17, 40]]) {
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
    await page.clock.fastForward(new Date(2026, 10, 5, h, m).getTime() - await page.evaluate(() => Date.now()));
    await page.waitForTimeout(800);
    console.log(h + ':' + m, 'antes', JSON.stringify(await leer(page)));
    await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    await page.waitForTimeout(800);
    console.log(h + ':' + m, 'tras Empezar', JSON.stringify(await leer(page)));
    await L.foto(page, '_tarde2-' + h + m);
    await ctx.close();
  }
  await L.cerrar();
})();
