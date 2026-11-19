const { chromium, abrir, foto, BASE } = require('./lib');
(async () => { const b = await chromium.launch();
for (const [h, mi] of [[22, 45], [23, 30], [16, 40]]) {
  const { ctx, page } = await abrir(b, { mobile: true, hora: new Date(2026,10,19,h,mi) });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Preparar jornada' }).click(); await page.waitForTimeout(900);
  await foto(page, 'noche-' + h + mi);
  const card = page.locator('text=¿Cuánto trabajas hoy?').locator('xpath=ancestor::*[self::section or self::div][3]');
  console.log(h + ':' + mi, await page.evaluate(() => { const e = [...document.querySelectorAll('button')].filter(b => /Una hora|Dos horas|Media jornada|Jornada entera/.test(b.textContent)); return e.map(x => x.innerText.replace(/\n/g, ' · ') + (x.disabled ? ' [desactivado]' : '')).join(' | '); }));
  // elegir Dos horas
  const dos = page.getByRole('button', { name: /Dos horas/ }).first();
  if (await dos.isEnabled()) { await dos.click(); await page.waitForTimeout(1200); await foto(page, 'noche-' + h + mi + '-dos'); console.log('  tras elegir:', await page.evaluate(() => document.body.innerText.replace(/\n+/g, ' · ').slice(0, 400))); }
  await ctx.close(); }
await b.close(); })();
