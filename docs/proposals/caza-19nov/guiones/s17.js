const { chromium, abrir, BASE } = require('./lib'); const c = require('./contraste');
(async () => { const b = await chromium.launch();
for (const dark of [false, true]) for (const [w, h] of [[360, 640], [1280, 800]]) {
  const { ctx, page } = await abrir(b, { vp: { width: w, height: h }, mobile: w < 700, dark, estado: { palette: dark ? 'oscuro' : 'crema' }, hora: new Date(2026, 10, 19, 10, 0) });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1800);
  const tag = (dark ? 'oscuro ' : 'crema ') + w;
  console.log('##', tag, 'home', JSON.stringify(await page.evaluate(`(${c.toString()})()`)));
  for (const nombre of ['Abrir ajustes', 'Ver estadísticas', 'Ver logros', /^Hidrátate/, /^Respira/]) {
    await page.getByRole('button', { name: nombre }).first().click(); await page.waitForTimeout(900);
    console.log('##', tag, String(nombre), JSON.stringify(await page.evaluate(`(${c.toString()})()`)));
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  }
  await ctx.close(); }
await b.close(); })();
