/* Tras el último bloque de la jornada: un Foco más «por libre». ¿Qué dice su ventana? Se llega al
   último bloque con el día sembrado a mano (todos los bloques menos uno hechos), dos veces. */
const L = require('./lib'); const S = require('./siembra');
const leer = (p) => p.evaluate(() => {
  const v = (s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | ');
  const h = new Date(Date.now());
  return { hora: h.getHours() + ':' + String(h.getMinutes()).padStart(2, '0'), label: v('[data-pace-dial-label]'), sub: v('[data-pace-dial-subtitle]'), cta: v('[data-pace-cta]'), ventana: v('[data-pace-modal-card]').slice(0, 160) };
});
async function fin(p) {
  const f = await p.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
  await p.clock.fastForward(f - await p.evaluate(() => Date.now()) + 1000);
  await p.waitForTimeout(900);
}
(async () => {
  await L.lanzar();
  for (const vuelta of [1, 2]) {
    /* Media jornada de 9:00 a 13:00 empezada a las 12:00: le queda uno o dos bloques. */
    const J = new Date(2026, 10, 5, 12, 0);
    const { estado } = S.veterana(J, {});
    const { ctx, page: p } = await L.abrir({ tam: 'escritorio', lang: 'es', estado, reloj: J, espera: 1200 });
    await p.locator('[data-pace-ritmo-loseta="media"]').filter({ visible: true }).first().click();
    await p.waitForTimeout(600);
    console.log(vuelta, 'preparado', JSON.stringify(await leer(p)));
    await p.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    for (let i = 0; i < 4; i++) {
      await fin(p);
      const r = await leer(p);
      console.log(vuelta, 'fin', i + 1, JSON.stringify(r));
      await p.keyboard.press('Escape'); await p.waitForTimeout(400);
      const r2 = await leer(p);
      console.log(vuelta, 'tras Esc', JSON.stringify(r2));
      if (/Foco manual/.test(r2.label)) {
        await p.locator('[data-pace-cta]').filter({ visible: true }).first().click();
        await p.waitForTimeout(400);
        console.log(vuelta, 'otro ciclo', JSON.stringify(await leer(p)));
        await fin(p);
        console.log(vuelta, 'fin del libre', JSON.stringify(await leer(p)));
        await L.foto(p, '_tras-la-jornada-' + vuelta);
        break;
      }
      const seguir = p.locator('[data-pace-aro-seguir]').filter({ visible: true });
      if (await seguir.count()) await seguir.first().click(); else await p.locator('[data-pace-cta]').filter({ visible: true }).first().click();
      await p.waitForTimeout(400);
    }
    await ctx.close();
  }
  await L.cerrar();
})();
