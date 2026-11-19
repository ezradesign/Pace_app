const { chromium, abrir, foto, BASE } = require('./lib');
(async () => { const b = await chromium.launch(); const { ctx, page, errores } = await abrir(b, { vp: { width: 1280, height: 800 } });
await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
const p2 = await ctx.newPage(); await p2.goto(BASE + '/index.html'); await p2.waitForTimeout(1500);
await page.getByRole('button', { name: '15 minutos' }).click(); await page.getByRole('button', { name: 'Empezar foco' }).click(); await page.waitForTimeout(3000);
console.log('A', await page.locator('[data-pace-dial-number]').innerText(), '| B', await p2.locator('[data-pace-dial-number]').innerText());
await p2.getByRole('button', { name: /Añadir un vaso/ }).first().click(); await page.waitForTimeout(1500);
console.log('agua A', await page.evaluate(() => document.querySelector('[data-pace-sidebar]').innerText.match(/[^\n]*vaso[^\n]*/i)?.[0]), '| B', await p2.evaluate(() => document.querySelector('[data-pace-sidebar]').innerText.match(/[^\n]*vaso[^\n]*/i)?.[0]));
// B cambia a inglés
await p2.getByRole('button', { name: 'Abrir ajustes' }).click(); await p2.waitForTimeout(400); await p2.getByRole('button', { name: 'English' }).click(); await p2.waitForTimeout(1500);
console.log('idioma A tras cambiar B:', await page.evaluate(() => document.documentElement.lang), await page.locator('[data-pace-dial-label]').innerText().catch(() => '?'));
await page.reload(); await page.waitForTimeout(1500);
console.log('A tras recargar', await page.locator('[data-pace-dial-number]').innerText(), await page.evaluate(() => document.documentElement.lang));
await foto(page, 'pest-A'); await foto(p2, 'pest-B');
console.log('ERR', errores.filter(e => !/Service Worker/.test(e)).join(' | '));
await b.close(); })();
