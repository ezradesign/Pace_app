/* ¿Dónde sale «chair» sin traducir? Las tarjetas de Estira con `equipment: ['chair']`, en es y en. */
const L = require('./lib');
(async () => {
  await L.lanzar();
  for (const lang of ['es', 'en']) {
    const { ctx, page, errores } = await L.abrir({ tam: 'escritorio', lang, estado: { ritmo: { libre: true } } });
    await page.locator('[data-pace-activitybar-chip]').nth(1).click();
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => ['move.spine.chair', 'extra.posture.set', 'move.shoulders.5'].map((id) => {
      const c = [...document.querySelectorAll('[data-pace-lib-card="' + id + '"]')].find((e) => e.getBoundingClientRect().width > 0);
      return id + ' → ' + (c ? c.textContent.replace(/\s+/g, ' ').trim().slice(0, 140) : '(no está)');
    }));
    console.log(lang, r.join('\n   '));
    const c = page.locator('[data-pace-lib-card="move.spine.chair"]').filter({ visible: true }).first();
    await c.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
    await c.screenshot({ path: L.FOTOS + '/_silla-' + lang + '.png' });
    console.log(lang, errores.filter((e) => /i18n/.test(e)));
    await ctx.close();
  }
  await L.cerrar();
})();
