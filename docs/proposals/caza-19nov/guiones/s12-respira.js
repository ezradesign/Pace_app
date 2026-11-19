'use strict';
const { chromium, abrir, medir, foto, BASE } = require('./lib');
const rutina = process.argv[2] || 'Suspiro fisiológico';
const lang = process.argv[3] || 'es';
(async () => {
  const browser = await chromium.launch();
  const { ctx, page, errores } = await abrir(browser, { mobile: true, estado: { lang }, hora: new Date(2026, 10, 16, 11, 0) });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
  await page.getByRole('button', { name: lang === 'en' ? /^Breathe/ : /^Respira/ }).first().click(); await page.waitForTimeout(800);
  await page.getByRole('button', { name: rutina, exact: true }).first().click(); await page.waitForTimeout(1200);
  const tag = 'resp-' + rutina.replace(/\W+/g, '');
  await foto(page, tag + '-1');
  const vis = () => page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width && b.getBoundingClientRect().top < innerHeight).map(b => (b.getAttribute('aria-label') || b.textContent).trim().slice(0, 30)));
  console.log('1', JSON.stringify(await vis()), JSON.stringify((await medir(page)).scrollers));
  // empezar
  const emp = page.getByRole('button', { name: /^(Empezar|Comenzar|Start|Begin)/ }).last();
  try { await emp.click({ timeout: 3000 }); } catch (e) { console.log('sin empezar'); }
  await page.waitForTimeout(800); await foto(page, tag + '-2');
  console.log('2', JSON.stringify(await vis()));
  for (let k = 0; k < 6; k++) { await page.clock.runFor(60 * 1000); await page.waitForTimeout(300); }
  await page.waitForTimeout(1200);
  await foto(page, tag + '-3');
  console.log('3', JSON.stringify(await vis()), await page.evaluate(() => document.body.innerText.slice(0, 600).replace(/\n+/g, ' · ')));
  for (let k = 0; k < 10; k++) { await page.clock.runFor(60 * 1000); await page.waitForTimeout(200); }
  await page.waitForTimeout(1200); await foto(page, tag + '-4');
  console.log('4', JSON.stringify(await vis()), await page.evaluate(() => document.body.innerText.slice(0, 600).replace(/\n+/g, ' · ')));
  const errs = errores.filter(e => !/Service Worker/.test(e));
  if (errs.length) console.log('ERR', errs.join('\n  '));
  await ctx.close(); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
