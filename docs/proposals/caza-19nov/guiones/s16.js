const { chromium, abrir, medir, foto, BASE } = require('./lib');
(async () => { const b = await chromium.launch();
for (const [w, h] of [[1280, 720], [1024, 640], [360, 640], [1280, 800]]) {
  const { ctx, page } = await abrir(b, { vp: { width: w, height: h }, mobile: w < 700, hora: new Date(2026, 10, 19, 10, 0) });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
  console.log('perm', await page.evaluate(() => Notification.permission));
  await page.getByRole('button', { name: 'Abrir ajustes' }).click(); await page.waitForTimeout(800);
  const m = await medir(page); console.log(w + 'x' + h, m.scrollers.join(','));
  await foto(page, 'aj-perm-' + w + 'x' + h);
  await ctx.close(); }
await b.close(); })();
