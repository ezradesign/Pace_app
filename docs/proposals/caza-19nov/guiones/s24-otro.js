const { chromium, abrir, foto, BASE } = require('./lib');
(async () => { const b = await chromium.launch(); const { ctx, page, errores } = await abrir(b, { mobile: true, hora: new Date(2026,10,19,10,0) });
await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Otro' }).click(); await page.waitForTimeout(800);
await foto(page, 'otro-1');
const inp = page.locator('input').first();
console.log('inputs', await page.locator('input').count(), await inp.evaluate(e => e.outerHTML.slice(0, 250)).catch(() => '-'));
for (const v of ['3', '0', '999', '90', 'abc', '7.5']) {
  await inp.fill(v).catch(e => console.log('fill', v, e.message.slice(0, 60)));
  await inp.press('Enter').catch(() => {}); await page.waitForTimeout(600);
  console.log(v, '→', await page.locator('[data-pace-dial-number]').innerText().catch(() => '?'), '| foco:', await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).focusMinutes));
  await foto(page, 'otro-' + v.replace(/\W/g, '_'));
  if (!(await inp.isVisible().catch(() => false))) { await page.getByRole('button', { name: /^Otro|min/ }).last().click().catch(() => {}); await page.waitForTimeout(500); }
}
console.log('ERR', errores.filter(e => !/Service Worker/.test(e)).join(' | '));
await b.close(); })();
