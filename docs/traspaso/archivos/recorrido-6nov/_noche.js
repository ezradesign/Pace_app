/* La ventana de la pausa que se queda abierta toda la noche: ¿qué ve quien vuelve por la mañana? */
const L = require('./lib');
(async () => {
  await L.lanzar();
  for (const vuelta of [1, 2]) {
    const J = new Date(2026, 10, 5, 18, 0);
    const { ctx, page: p } = await L.abrir({ tam: 'escritorio', lang: 'es', estado: { ritmo: { libre: true }, lastActiveDay: J.toDateString() }, reloj: J, espera: 1200 });
    await p.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    const f = await p.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
    await p.clock.fastForward(f - await p.evaluate(() => Date.now()) + 1000);
    await p.waitForTimeout(800);
    const v = () => p.evaluate(() => { const m = [...document.querySelectorAll('[data-pace-modal-card]')].pop(); return m ? m.textContent.replace(/\s+/g, ' ').slice(0, 110) : '(sin ventana)'; });
    console.log(vuelta, '18:25', await v());
    for (let i = 0; i < 27; i++) { await p.clock.fastForward(30 * 60 * 1000); await p.waitForTimeout(40); }
    await p.clock.fastForward(new Date(2026, 10, 6, 8, 40).getTime() - await p.evaluate(() => Date.now()));
    await p.waitForTimeout(1200);
    console.log(vuelta, 'vie 8:40', await v(), '| hoy:', await p.evaluate(() => getState().lastActiveDay));
    if (vuelta === 1) await L.foto(p, '_noche');
    await ctx.close();
  }
  await L.cerrar();
})();
