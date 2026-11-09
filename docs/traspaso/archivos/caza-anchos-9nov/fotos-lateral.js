const L = require('./lib');
const path = require('path');
(async () => {
  await L.lanzar();
  for (const [nombre, css] of [['antes', '.pace-lib-lateral{top:0 !important}'], ['ahora', '']]) {
    const rut = [1, 2].map((i) => ({ id: 'custom.17600000000' + i, name: i === 1 ? 'Hombros tras la llamada' : 'Mañana', steps: [{ name: 'Encogimiento de hombros', dur: 20, cue: '' }], createdAt: 1760000000000 + i, updatedAt: 1760000000000 + i }));
    const { ctx, page } = await L.abrir({ tam: 'e1280', lang: 'es', estado: { ritmo: { libre: true }, customRoutines: rut }, espera: 1200 });
    await page.getByRole('button', { name: /^Mueve/ }).filter({ visible: true }).first().click();
    await page.waitForTimeout(900);
    if (css) await page.addStyleTag({ content: css });
    await page.evaluate(() => { const lat = [...document.querySelectorAll('.pace-lib-lateral')].find(e => e.getBoundingClientRect().width); let sc = lat.parentElement; while (!/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement; sc.scrollTop = 220; });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(L.FOTOS, 'lateral-' + nombre + '.jpg'), type: 'jpeg', quality: 60, clip: { x: 20, y: 40, width: 700, height: 680 } });
    await ctx.close();
  }
  await L.cerrar();
})();
