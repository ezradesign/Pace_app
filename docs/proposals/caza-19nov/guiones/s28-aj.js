const { chromium, medir, foto, BASE, SEMILLA } = require('./lib');
(async () => { const b = await chromium.launch();
for (const [w, h, lang] of [[360, 640, 'es'], [360, 640, 'en'], [1280, 720, 'es'], [1366, 768, 'es'], [1440, 900, 'en']]) for (const perm of ['denied', 'default']) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 700, hasTouch: w < 700, locale: 'es-ES', timezoneId: 'Europe/Madrid', serviceWorkers: 'block' });
  await ctx.addInitScript(([s, p]) => { localStorage.setItem('pace-cara', 'app'); if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(s)); try { Object.defineProperty(Notification, 'permission', { get: () => p }); } catch (e) {} }, [Object.assign({}, SEMILLA, { lang }), perm]);
  const page = await ctx.newPage(); await page.clock.install({ time: new Date(2026, 10, 19, 10, 0) });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1300);
  await page.getByRole('button', { name: /Abrir ajustes|Open settings/ }).click(); await page.waitForTimeout(900);
  const sc = await page.evaluate(() => { return [...document.querySelectorAll('*')].filter(e => { const cs = getComputedStyle(e); return /auto|scroll/.test(cs.overflowY) && e.clientHeight > 100 && e.scrollHeight > e.clientHeight + 1; }).map(e => e.scrollHeight - e.clientHeight).join(',') || 0; });
  console.log(w + 'x' + h, lang, perm, 'sobra', sc, 'px');
  if (perm === 'denied') await foto(page, 'aj-bloq-' + w + 'x' + h + '-' + lang);
  await ctx.close(); }
await b.close(); })();
