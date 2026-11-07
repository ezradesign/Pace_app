const L = require('./lib');
(async () => {
  await L.lanzar();
  const { ctx, page } = await L.abrir({ tam: 'escritorio', lang: 'es', estado: { ritmo: { libre: true } }, espera: 1200 });
  await page.evaluate(() => ['first.step', 'first.sip'].forEach((id) => showToast({ id, type: 'achievement' })));
  await page.locator('[data-pace-sello-aro]').waitFor();
  const t0 = Date.now();
  await page.getByRole('button', { name: /^Mueve/ }).click();
  for (let i = 0; i < 30; i++) {
    const r = await page.evaluate(() => { const s = document.querySelector('[data-pace-sello-aro]'); const a = document.querySelector('div[aria-live="polite"][aria-atomic="true"]'); return (s ? 'sello:' + getComputedStyle(s).visibility + ':' + s.textContent : 'sin sello') + ' | aviso:' + (a ? a.textContent : '-') + ' | modal:' + document.querySelectorAll('[data-pace-modal-backdrop]').length; });
    console.log(Date.now() - t0, r);
    if (i === 3) await L.foto(page, '_sello-sobre-biblioteca');
    await page.waitForTimeout(250);
  }
  await ctx.close(); await L.cerrar();
})();
