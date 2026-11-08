/* Tab dentro de «Nueva rutina», tecla a tecla, dos veces. */
const L = require('./lib');
(async () => {
  await L.lanzar();
  for (const vuelta of [1, 2]) {
    const { ctx, page } = await L.abrir({ tam: 'escritorio', lang: 'es', estado: { ritmo: { libre: true } } });
    await page.getByRole('button', { name: /Tus rutinas/ }).first().click();
    await page.waitForTimeout(900);
    const seq = [];
    seq.push('inicio:' + JSON.stringify(await L.foco(page, '[data-pace-modal-card]')));
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const f = await L.foco(page, '[data-pace-modal-card]');
      seq.push(i + ':' + f.d + (f.dentro ? '' : ' [FUERA]'));
    }
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Shift+Tab');
      const f = await L.foco(page, '[data-pace-modal-card]');
      seq.push('S' + i + ':' + f.d + (f.dentro ? '' : ' [FUERA]'));
    }
    console.log('vuelta', vuelta, seq.join(' | '));
    await ctx.close();
  }
  await L.cerrar();
})();
