const { chromium, abrir, foto, BASE } = require('./lib');
(async () => { const b = await chromium.launch(); const { ctx, page, errores } = await abrir(b, { mobile: true, hora: new Date(2026,10,19,23,58) });
await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
await page.getByRole('button', { name: /^Hidrátate/ }).first().click(); await page.waitForTimeout(700);
for (let i = 0; i < 10; i++) { await page.getByRole('button', { name: /Un vaso más/ }).click(); await page.waitForTimeout(150); }
await page.waitForTimeout(800); await foto(page, 'agua-10');
console.log('10 clics:', await page.evaluate(() => document.querySelector('[role=dialog]').innerText.replace(/\n+/g, ' · ').slice(0, 200)));
await page.clock.runFor(4 * 60 * 1000); await page.waitForTimeout(1500);
await foto(page, 'agua-medianoche');
console.log('tras medianoche:', await page.evaluate(() => document.querySelector('[role=dialog]')?.innerText.replace(/\n+/g, ' · ').slice(0, 200)));
console.log('ERR', errores.filter(e => !/Service Worker/.test(e)).join(' | '));
await b.close(); })();
