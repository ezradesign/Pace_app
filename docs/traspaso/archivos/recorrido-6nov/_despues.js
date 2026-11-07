/* Las fotos del «después» de 1A, 2A y 3A (Ez, 7 nov.): node _despues.js <movil|escritorio> [es|en] */
const L = require('./lib'); const S = require('./siembra');
const fin = async (p) => {
  const f = await p.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
  await p.clock.fastForward(f - await p.evaluate(() => Date.now()) + 1000);
  await p.waitForTimeout(900);
};
const preparar = async (p, op) => {
  const c = p.locator('[data-pace-ritmo-comienza]').filter({ visible: true });
  if (await c.count()) { await c.first().click(); await p.waitForTimeout(500); }
  const hab = p.locator('[data-pace-ritmo-habitual-comienza]').filter({ visible: true });
  if (op === 'jornada' && await hab.count()) await hab.first().click();
  else await p.locator('[data-pace-ritmo-loseta="' + op + '"], button[data-pace-ritmo-opcion="' + op + '"]').filter({ visible: true }).first().click();
  await p.waitForTimeout(600);
};
const medida = (p) => p.evaluate(() => {
  const v = (s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | ');
  const d = document.scrollingElement;
  const lab = document.querySelector('[data-pace-dial-label]'), ring = document.querySelector('[data-pace-dial-ring]');
  const r = lab && lab.getBoundingClientRect(), a = ring && ring.getBoundingClientRect();
  return { label: v('[data-pace-dial-label]'), hasta: v('[data-pace-dial-hasta]'), cta: v('[data-pace-cta]'), panel: v('[data-pace-ritmo-estado]').slice(0, 90), scroll: d.scrollHeight - d.clientHeight,
    rotuloAncho: r ? Math.round(r.width) : null, aroAncho: a ? Math.round(a.width) : null, rotuloEnAro: r && a ? r.left >= a.left && r.right <= a.right : null };
});
(async () => {
  await L.lanzar();
  const [tam = 'escritorio', lang = 'es'] = process.argv.slice(2);
  const sufijo = tam + (lang === 'en' ? '-en' : '');
  { /* 1A */
    const J = new Date(2026, 10, 5, 8, 50);
    const { ctx, page: p } = await L.abrir({ tam, lang, estado: S.veterana(J, { lang }).estado, reloj: J, espera: 1200 });
    await preparar(p, 'jornada');
    await p.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    await fin(p); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    for (let i = 0; i < 100 && await p.evaluate(() => Date.now()) < new Date(2026, 10, 5, 17, 40).getTime(); i++) { await p.clock.fastForward(5 * 60 * 1000); await p.waitForTimeout(20); }
    await p.waitForTimeout(800);
    console.log('1A', JSON.stringify(await medida(p)));
    await L.foto(p, 'despues-1a-' + sufijo);
    await ctx.close();
  }
  { /* 2A */
    const J = new Date(2026, 10, 5, 12, 0);
    const MEDIA = { fecha: '2026-11-05', opcion: 'media', desde: 720, cicloBase: 0, cambios: {} };
    const est = S.veterana(J, { lang, cycle: 0 }).estado;
    est.ritmo = Object.assign({}, est.ritmo, { dia: MEDIA });
    const { ctx, page: p } = await L.abrir({ tam, lang, estado: est, reloj: J, espera: 1200 });
    await p.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    await fin(p); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.evaluate(() => setState({ focusMinutes: 5 }));
    await p.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    await fin(p);
    console.log('2A', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-pace-modal-card]')].pop().textContent.replace(/\s+/g, ' ').slice(0, 90))));
    await L.foto(p, 'despues-2a-' + sufijo);
    await ctx.close();
  }
  { /* 3A */
    const J = new Date(2026, 10, 5, 18, 0);
    const { ctx, page: p } = await L.abrir({ tam, lang, estado: { ritmo: { libre: true }, lastActiveDay: J.toDateString(), lang }, reloj: J, espera: 1200 });
    await p.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    await fin(p);
    for (let i = 0; i < 27; i++) { await p.clock.fastForward(30 * 60 * 1000); await p.waitForTimeout(30); }
    await p.clock.fastForward(new Date(2026, 10, 6, 8, 40).getTime() - await p.evaluate(() => Date.now()));
    await p.waitForTimeout(1200);
    console.log('3A ventanas', await p.locator('[data-pace-modal-card]').count());
    await L.foto(p, 'despues-3a-' + sufijo);
    await ctx.close();
  }
  await L.cerrar();
})();
