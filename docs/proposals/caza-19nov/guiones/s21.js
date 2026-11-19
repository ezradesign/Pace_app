const { chromium, abrir, foto, BASE } = require('./lib');
(async () => { const b = await chromium.launch();
for (const [h, mi] of [[23, 30], [15, 0]]) {
  const { ctx, page } = await abrir(b, { mobile: true, hora: new Date(2026,10,19,h,mi) });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Preparar jornada' }).click(); await page.waitForTimeout(900);
  console.log(h, await page.evaluate(() => { const t = [...document.querySelectorAll('*')].filter(e => e.children.length < 8 && /^Media jornada/.test(e.innerText || '')).map(e => e.tagName + ' ' + (e.getAttribute('role') || '') + ' dis=' + (e.disabled || e.getAttribute('aria-disabled')) + ' «' + e.innerText.replace(/\n/g, ' · ') + '»'); return t.slice(0, 6); }));
  await page.getByText('Media jornada', { exact: true }).first().click().catch(e => console.log('clic', e.message.split('\n')[0])); await page.waitForTimeout(1200);
  await foto(page, 'media-' + h);
  console.log('  tras clic:', await page.evaluate(() => document.body.innerText.replace(/\n+/g, ' · ').slice(0, 300)));
  await ctx.close(); }
await b.close(); })();
