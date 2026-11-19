const { chromium, abrir, BASE } = require('./lib');
(async () => { const b = await chromium.launch();
for (const lento of [false, true]) {
  const { ctx, page } = await abrir(b, { mobile: true, hora: undefined });
  const cdp = await ctx.newCDPSession(page);
  if (lento) { await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 }); }
  const t0 = Date.now();
  await page.goto(BASE + '/index.html', { waitUntil: 'commit' });
  await page.locator('[data-pace-dial-number]').waitFor({ timeout: 120000 });
  const t1 = Date.now() - t0;
  const nav = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const p = performance.getEntriesByType('paint').map(x => x.name + '=' + Math.round(x.startTime)); return { tam: n.transferSize, dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), p }; });
  console.log(lento ? 'lento(4G lenta, CPU x4)' : 'normal', 'aro visible en', t1, 'ms', JSON.stringify(nav));
  await ctx.close(); }
await b.close(); })();
