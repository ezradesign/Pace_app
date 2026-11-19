'use strict';
const { chromium, abrir, medir, foto, BASE } = require('./lib');
const { sembrarVeterana } = require('./veterana');
const [, , dia, h, vpArg, lang] = process.argv;
(async () => {
  const browser = await chromium.launch();
  const hoy = new Date(2026, 10, +dia, +h, 5);
  const desk = vpArg === 'd';
  const { ctx, page, errores } = await abrir(browser, { estado: null, mobile: !desk, vp: desk ? { width: 1280, height: 800 } : undefined, hora: hoy });
  await sembrarVeterana(page, BASE, hoy);
  if (lang === 'en') await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('pace.state.v2')); s.lang = 'en'; localStorage.setItem('pace.state.v2', JSON.stringify(s)); });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(2500);
  const tag = 'vet-' + dia + '-' + h + '-' + (desk ? 'd' : 'm') + (lang === 'en' ? '-en' : '');
  await foto(page, tag + '-0home');
  const dlg = () => page.evaluate(() => [...document.querySelectorAll('[role=dialog],[aria-modal=true]')].map(d => d.innerText.replace(/\n+/g, ' · ').slice(0, 600)));
  console.log('HOME', JSON.stringify(await dlg()), JSON.stringify(await medir(page)));
  // cerrar lo que haya encima
  for (let i = 0; i < 2; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
  const col = page.getByRole('button', { name: /Colapsar panel|Collapse/ }); if (!desk && await col.count()) { await col.first().click(); await page.waitForTimeout(600); }
  await foto(page, tag + '-1home-limpia');
  const stats = lang === 'en' ? ['Today', 'Week', 'Month', 'Year', 'What helps'] : ['Hoy', 'Semana', 'Mes', 'Año', 'Qué te ayuda'];
  await page.getByRole('button', { name: lang === 'en' ? /stat/i : 'Ver estadísticas' }).first().click(); await page.waitForTimeout(1000);
  for (const s of stats) {
    try { await page.getByRole('dialog').getByRole('button', { name: s, exact: true }).first().click({ timeout: 3000 }); } catch (e) { try { await page.getByRole('tab', { name: s }).first().click({ timeout: 2000 }); } catch (e2) { console.log('NO', s); } }
    await page.waitForTimeout(900);
    await foto(page, tag + '-st-' + s.replace(/\W/g, ''));
    const m = await medir(page);
    console.log('STATS', s, JSON.stringify(m.scrollers), JSON.stringify(m.peq));
  }
  console.log(JSON.stringify(await dlg()).slice(0, 1500));
  const errs = errores.filter(e => !/Service Worker/.test(e));
  if (errs.length) console.log('ERR', errs.join('\n  '));
  await ctx.close(); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
