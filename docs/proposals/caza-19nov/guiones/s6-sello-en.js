'use strict';
const { chromium, abrir, foto, BASE } = require('./lib');
(async () => {
  const browser = await chromium.launch();
  const lang = process.argv[2] || 'en';
  const { ctx, page } = await abrir(browser, { mobile: true, estado: { lang }, hora: new Date(2026, 10, 16, 10, 0) });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
  await page.locator('[aria-label="15 minutes"],[aria-label="15 minutos"]').first().click();
  await page.locator('[data-pace-dial-number]').waitFor();
  await page.getByRole('button', { name: /Start focus|Empezar foco/i }).click();
  await page.clock.runFor(15 * 60 * 1000 + 3000); await page.waitForTimeout(1500);
  await foto(page, 'sello-' + lang);
  console.log(await page.evaluate(() => document.body.innerText.match(/(New stamp|Nuevo sello)[^\n]*/)?.[0]));
  await ctx.close(); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
