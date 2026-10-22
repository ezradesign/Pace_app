const path = require('path');
const { chromium } = require(path.join(process.argv[2], 'node_modules', 'playwright'));
(async () => {
  const b = await chromium.launch();
  for (const lang of ['es', 'en']) for (const vp of [{ width: 360, height: 730 }, { width: 360, height: 640 }]) {
    const ctx = await b.newContext({ viewport: vp, isMobile: true, hasTouch: true, deviceScaleFactor: 1, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
    await ctx.addInitScript((lang) => {
      try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {}
      if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify({ firstSeen: 1, lang, langAuto: false, palette: 'crema', sidebarCollapsed: true, ritmo: { libre: true } }));
    }, lang);
    const p = await ctx.newPage();
    await p.goto('http://localhost:8803/index.html');
    await p.locator('button[aria-label="' + (lang === 'es' ? 'Abrir ajustes' : 'Open settings') + '"]').first().click().catch(async () => {
      await p.locator('[aria-label*="ajustes" i], [aria-label*="settings" i]').first().click();
    });
    await p.locator('[data-pace-tweaks-panel]').waitFor({ state: 'visible' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(400);
    const m = await p.evaluate(() => {
      const pn = document.querySelector('[data-pace-tweaks-panel]');
      const cs = getComputedStyle(pn);
      const secs = Array.from(pn.querySelectorAll('[data-pace-aj-seccion]')).map(s => ({ t: s.dataset.paceAjSeccion, h: Math.round(s.getBoundingClientRect().height) }));
      const cab = pn.querySelector('.pace-aj-cab').getBoundingClientRect().height;
      return { contenido: pn.scrollHeight, hueco: pn.clientHeight, top: Math.round(pn.getBoundingClientRect().top), pad: cs.paddingTop + '/' + cs.paddingBottom, cab: Math.round(cab), secs };
    });
    console.log(lang, vp.width + 'x' + vp.height, JSON.stringify(m));
    await ctx.close();
  }
  await b.close();
})();
