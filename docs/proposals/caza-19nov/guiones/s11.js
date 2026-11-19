const { chromium, abrir, foto, BASE } = require('./lib');
(async () => { const b = await chromium.launch(); const { ctx, page } = await abrir(b, { mobile: true, hora: new Date(2026,10,16,11,0) });
await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Abrir panel' }).click(); await page.waitForTimeout(800);
await page.reload(); await page.waitForTimeout(2000);
await foto(page, 'cajon-tras-recargar');
console.log('abierto tras recargar:', await page.evaluate(() => document.querySelector('[data-pace-sidebar]').getBoundingClientRect().left >= 0 && getComputedStyle(document.querySelector('[data-pace-sidebar]')).visibility !== 'hidden'), await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).sidebarCollapsed));
await b.close(); })();
