const { chromium, abrir, medir, foto, BASE } = require('./lib');
(async () => { const b = await chromium.launch();
for (const [w, h] of [[1280, 720], [1366, 768], [1024, 640], [768, 1024], [412, 915], [360, 640], [320, 568]]) for (const lang of ['es', 'en']) {
  const { ctx, page, errores } = await abrir(b, { vp: { width: w, height: h }, mobile: w < 700, estado: { lang }, hora: new Date(2026, 10, 19, 10, 0) });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
  const r = [];
  const m0 = await medir(page); r.push('home ' + m0.docH + '/' + m0.vh + ' ' + m0.scrollers.join(','));
  for (const nombre of [lang === 'en' ? 'Open settings' : 'Abrir ajustes', lang === 'en' ? /stat/i : 'Ver estadísticas', lang === 'en' ? /achiev/i : 'Ver logros']) {
    try { await page.getByRole('button', { name: nombre }).first().click({ timeout: 3000 }); await page.waitForTimeout(700); const m = await medir(page); r.push(String(nombre).slice(0, 12) + ' ' + m.scrollers.join(',')); if (String(nombre).includes('ajustes') || String(nombre).includes('settings')) await foto(page, 'anchos-aj-' + w + 'x' + h + '-' + lang); await page.keyboard.press('Escape'); await page.waitForTimeout(400); } catch (e) { r.push('NO ' + nombre); }
  }
  console.log(w + 'x' + h, lang, r.join(' | '));
  await ctx.close(); }
await b.close(); })();
