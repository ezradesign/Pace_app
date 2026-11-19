'use strict';
// Foco de 15: empezar, pausar, cambiar de idioma a mitad, acabar, ver la pausa; y volver tras horas.
const { chromium, abrir, medir, foto, BASE } = require('./lib');
const desk = process.argv[2] === 'd';
(async () => {
  const browser = await chromium.launch();
  const { ctx, page, errores } = await abrir(browser, { mobile: !desk, vp: desk ? { width: 1280, height: 800 } : undefined, hora: new Date(2026, 10, 16, 10, 0) });
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
  const t = desk ? 'fd' : 'fm';
  await page.getByRole('button', { name: '15 minutos' }).click();
  await page.getByRole('button', { name: 'Empezar foco' }).click();
  await page.clock.runFor(60 * 1000); await page.waitForTimeout(500);
  await foto(page, t + '-1-corriendo');
  console.log('corriendo', JSON.stringify(await medir(page)));
  // cambiar idioma a mitad: Ajustes > English
  await page.getByRole('button', { name: 'Abrir ajustes' }).click(); await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'English' }).click(); await page.waitForTimeout(500);
  await foto(page, t + '-2-ajustes-en');
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await foto(page, t + '-3-corriendo-en');
  await page.clock.runFor(14 * 60 * 1000 + 5000); await page.waitForTimeout(1500);
  await foto(page, t + '-4-fin');
  console.log('fin', JSON.stringify(await medir(page)));
  const dlg = await page.evaluate(() => [...document.querySelectorAll('[role=dialog],[aria-modal=true]')].map(d => d.innerText.replace(/\n+/g, ' · ').slice(0, 400)));
  console.log('DIALOGOS', JSON.stringify(dlg));
  // volver tras 5 horas con la pestaña oculta
  await page.clock.runFor(5 * 3600 * 1000); await page.waitForTimeout(1500);
  await foto(page, t + '-5-tras-5h');
  const dlg2 = await page.evaluate(() => [...document.querySelectorAll('[role=dialog],[aria-modal=true]')].map(d => d.innerText.replace(/\n+/g, ' · ').slice(0, 400)));
  console.log('DIALOGOS tras 5h', JSON.stringify(dlg2));
  const errs = errores.filter(e => !/Service Worker/.test(e));
  if (errs.length) console.log('ERR', errs.join('\n  '));
  await ctx.close(); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
