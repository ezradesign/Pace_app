const { chromium, abrir, foto, BASE } = require('./lib');
const desk = process.argv[2] === 'd';
(async () => { const b = await chromium.launch(); const { ctx, page, errores } = await abrir(b, { mobile: !desk, vp: desk ? { width: 1280, height: 800 } : undefined, hora: new Date(2026,10,19,10,0) });
await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Abrir ajustes' }).click(); await page.waitForTimeout(600);
await page.getByRole('button', { name: /Visita guiada/ }).click(); await page.waitForTimeout(1500);
for (let i = 1; i <= 6; i++) {
  const txt = await page.evaluate(() => [...document.querySelectorAll('[role=dialog]')].map(d => d.innerText.replace(/\n+/g, ' · ').slice(0, 200)));
  console.log(i, JSON.stringify(txt));
  await foto(page, 'visita-' + (desk ? 'd' : 'm') + '-' + i);
  const s = page.getByRole('button', { name: /^(Siguiente|Terminar|Listo|Next|Done)/ });
  if (!(await s.count())) break;
  await s.first().click(); await page.waitForTimeout(2000);
}
console.log('ERR', errores.filter(e => !/Service Worker/.test(e)).join(' | '));
await b.close(); })();
