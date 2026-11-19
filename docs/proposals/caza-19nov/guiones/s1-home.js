'use strict';
const { chromium, abrir, medir, foto, BASE } = require('./lib');
(async () => {
  const browser = await chromium.launch();
  const casos = [
    { n: 'nuevo-m-es', estado: null, mobile: true },
    { n: 'nuevo-m-en', estado: null, mobile: true, locale: 'en-US' },
    { n: 'home-m-es', mobile: true },
    { n: 'home-m-es-dark', mobile: true, dark: true, estado: { palette: 'oscuro' } },
    { n: 'home-m-en', mobile: true, estado: { lang: 'en' } },
    { n: 'home-d-es', vp: { width: 1280, height: 800 } },
    { n: 'home-d-en-dark', vp: { width: 1280, height: 800 }, estado: { lang: 'en', palette: 'oscuro' } },
    { n: 'home-m-0300', mobile: true, hora: new Date(2026, 10, 16, 3, 0) },
    { n: 'home-m-1400', mobile: true, hora: new Date(2026, 10, 16, 14, 0) },
  ];
  for (const c of casos) {
    const { ctx, page, errores } = await abrir(browser, c);
    await page.goto(BASE + '/index.html');
    await page.waitForTimeout(2500);
    await foto(page, c.n);
    const m = await medir(page);
    console.log('==', c.n, JSON.stringify(m));
    if (errores.length) console.log('  ERR', errores.join(' | '));
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
