'use strict';
const { chromium, abrir, foto, BASE } = require('./lib');
(async () => {
  const browser = await chromium.launch();
  const vp = process.argv[2] === 'tab' ? { width: 820, height: 1180 } : { width: 360, height: 640 };
  const { ctx, page } = await abrir(browser, { vp, hora: new Date(2026, 10, 16, 11, 0) });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
  const b = page.getByRole('button', { name: 'Abrir panel' });
  console.log('antes aria-expanded=', await b.getAttribute('aria-expanded'));
  await b.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  console.log('después', await page.evaluate(() => [...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width).slice(0,3).map(x=>x.getAttribute('aria-label')+' exp='+x.getAttribute('aria-expanded')).join(', ')));
  const info = await page.evaluate(() => { const a = document.querySelector('[data-pace-sidebar]'); return { role: a.getAttribute('role'), modal: a.getAttribute('aria-modal'), activo: (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent || '').slice(0, 40) }; });
  console.log(JSON.stringify(info));
  const seq = [];
  for (let i = 0; i < 22; i++) { await page.keyboard.press('Tab'); seq.push(await page.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); const enCajon = !!e.closest('[data-pace-sidebar]'); return (enCajon ? 'C:' : 'FUERA:') + (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 28) + (r.width ? '' : '(oculto)'); })); }
  console.log(seq.join(' | '));
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  console.log('tras Escape abierto=', await page.evaluate(() => getComputedStyle(document.querySelector('[data-pace-sidebar]')).transform + ' ' + document.querySelector('[data-pace-sidebar]').getBoundingClientRect().left));
  await foto(page, 'cajon-esc-' + (process.argv[2] || 'm'));
  await ctx.close(); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
