const { chromium, abrir, foto, BASE } = require('./lib');
(async () => { const b = await chromium.launch();
for (const v of ['180', '181', '200', '999', '3', '60']) for (const modo of ['enter', 'blur']) {
  const { ctx, page } = await abrir(b, { mobile: true, hora: new Date(2026,10,19,10,0) });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Otro' }).click(); await page.waitForTimeout(500);
  const inp = page.locator('input[type=number]').first();
  await inp.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v);
  if (modo === 'enter') await page.keyboard.press('Enter'); else await page.mouse.click(180, 600);
  await page.waitForTimeout(600);
  console.log(v, modo, '→', await page.locator('[data-pace-dial-number]').innerText().catch(() => '?'), '| guardado:', await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).focusMinutes));
  if (v === '999' && modo === 'enter') await foto(page, 'otro-999');
  await ctx.close(); }
await b.close(); })();
