'use strict';
// Abre cada pantalla desde la home del móvil y la del escritorio: foto, medida y botones.
const { chromium, abrir, medir, foto, BASE } = require('./lib');
const lang = process.argv[2] || 'es';
const dark = process.argv[3] === 'dark';
const desk = process.argv[4] === 'd';
(async () => {
  const browser = await chromium.launch();
  const o = desk ? { vp: { width: 1280, height: 800 } } : { mobile: true };
  Object.assign(o, { dark, estado: { lang, palette: dark ? 'oscuro' : 'crema' }, hora: new Date(2026, 10, 16, 11, 0) });
  const { ctx, page, errores } = await abrir(browser, o);
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(2000);
  const tag = (desk ? 'd' : 'm') + '-' + lang + (dark ? '-dark' : '');
  const botones = await page.evaluate(() => [...document.querySelectorAll('button,[role=button],a')].filter(b => b.getBoundingClientRect().width).map(b => (b.getAttribute('aria-label') || b.textContent).trim().slice(0, 50)));
  console.log('BOTONES', JSON.stringify(botones));
  const pasos = process.argv.slice(5);
  let i = 0;
  for (const p of pasos) {
    i++;
    try {
      if (p === 'esc') await page.keyboard.press('Escape');
      else if (p.startsWith('wait')) await page.waitForTimeout(+p.slice(4));
      else if (p.startsWith('css:')) await page.locator(p.slice(4)).first().click({ timeout: 4000 });
      else if (p.startsWith('txt:')) await page.getByText(p.slice(4), { exact: false }).first().click({ timeout: 4000 });
      else if (p.startsWith('re:')) await page.getByRole('button', { name: new RegExp(p.slice(3)) }).first().click({ timeout: 4000 });
      else await page.getByRole('button', { name: p }).first().click({ timeout: 4000 });
    } catch (e) { console.log('NO CLIC', p, e.message.split('\n')[0]); }
    await page.waitForTimeout(900);
    const nombre = tag + '-' + i + '-' + p.replace(/[^a-z0-9]+/gi, '_').slice(0, 20);
    await foto(page, nombre);
    const m = await medir(page);
    console.log('==', nombre, JSON.stringify(m));
    const bts = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button,[role=dialog] a,[aria-modal] button')].filter(b => b.getBoundingClientRect().width).map(b => (b.getAttribute('aria-label') || b.textContent).trim().slice(0, 40)));
    if (bts.length) console.log('  DIALOGO', JSON.stringify(bts));
  }
  const errs = errores.filter(e => !/Service Worker/.test(e));
  if (errs.length) console.log('ERR', errs.join('\n  '));
  await ctx.close(); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
