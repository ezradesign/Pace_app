const { chromium, abrir, medir, foto, BASE } = require('./lib');
const loc = process.argv[2] || 'es-ES';
(async () => { const b = await chromium.launch(); const { ctx, page, errores } = await abrir(b, { mobile: true, estado: null, locale: loc, hora: new Date(2026,10,19,10,0) });
await page.goto(BASE + '/index.html'); await page.waitForTimeout(1800);
for (let i = 1; i <= 9; i++) {
  const bts = await page.evaluate(() => [...(document.querySelector('[role=dialog]') || document).querySelectorAll('button,a')].filter(b => { const r = b.getBoundingClientRect(); return r.width && r.top < innerHeight && r.bottom > 0 && !b.closest('[aria-hidden=true]'); }).map(b => (b.getAttribute('aria-label') || b.innerText).trim().replace(/\n/g, ' ').slice(0, 30)));
  const m = await medir(page);
  console.log(i, JSON.stringify(bts), 'scroll', JSON.stringify(m.scrollers), 'peq', JSON.stringify(m.peq));
  await foto(page, 'onb-' + loc.slice(0, 2) + '-' + i);
  const sig = bts.find(t => /^(Comenzar|Siguiente|Continuar|Empezar|Saltar|Start|Next|Continue|Begin|Listo|Done|Vamos)/i.test(t));
  if (!sig) break;
  await page.locator('[role=dialog]').getByRole('button', { name: sig }).first().click({ timeout: 5000 }).catch(e => console.log('clic', e.message.slice(0, 80)));
  await page.waitForTimeout(1000);
}
console.log('ERR', errores.filter(e => !/Service Worker/.test(e)).join(' | '));
await b.close(); })();
