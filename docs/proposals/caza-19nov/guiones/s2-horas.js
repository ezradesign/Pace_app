'use strict';
const { chromium, abrir, medir, foto, BASE } = require('./lib');
(async () => {
  const browser = await chromium.launch();
  const horas = [[3, 0], [7, 10], [16, 40], [18, 30], [22, 45], [23, 50]];
  for (const [h, mi] of horas) {
    const c = { vp: { width: 1280, height: 800 }, hora: new Date(2026, 10, 16, h, mi) };
    const { ctx, page, errores } = await abrir(browser, c);
    await page.goto(BASE + '/index.html');
    await page.waitForTimeout(2000);
    const n = 'hora-d-' + h + mi;
    await foto(page, n);
    const txt = await page.evaluate(() => { const el = [...document.querySelectorAll('h2,h3,section,div')].find(e => /trabajas hoy/.test(e.textContent) && e.textContent.length < 400); return el ? el.innerText.replace(/\n+/g, ' · ') : '(sin tarjeta)'; });
    console.log('==', n, txt);
    if (errores.filter(e => !/Service Worker/.test(e)).length) console.log('  ERR', errores.join(' | '));
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
