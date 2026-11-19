'use strict';
const { chromium, medir, OUT } = require('./lib');
const path = require('path');
const B = 'http://localhost:8946';
(async () => {
  const browser = await chromium.launch();
  const rutas = ['/', '/premium/', '/beta/', '/recuperar/', '/gracias/', '/desistir/', '/privacy', '/safety', '/legal/', '/no-existe'];
  for (const r of rutas) for (const [vw, vh, tag] of [[360, 640, 'm'], [1280, 800, 'd']]) for (const sch of ['light', 'dark']) for (const loc of ['es-ES', 'en-US']) {
    if (sch === 'dark' && loc === 'en-US') continue;
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, colorScheme: sch, locale: loc, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    page.on('requestfailed', q => errs.push('FAIL ' + q.url().slice(0, 120)));
    page.on('response', q => { if (q.status() >= 400 && !q.url().includes('/no-existe')) errs.push(q.status() + ' ' + q.url().slice(0, 120)); });
    const t0 = Date.now();
    await page.goto(B + r, { waitUntil: 'load' }).catch(e => errs.push('goto ' + e.message));
    await page.waitForTimeout(1200);
    const n = 'web' + r.replace(/\W+/g, '_') + tag + '-' + sch + '-' + loc.slice(0, 2);
    await page.screenshot({ path: path.join(OUT, n + '.png'), fullPage: tag === 'm' && sch === 'light' && loc === 'es-ES' });
    const m = await medir(page);
    const lang = await page.evaluate(() => document.documentElement.lang + ' | ' + document.title);
    console.log('==', n, (Date.now() - t0) + 'ms', lang, 'docH', m.docH, 'docW', m.docW, 'peq', JSON.stringify(m.peq.slice(0, 8)), 'sinNombre', m.sinNombre.length);
    if (errs.length) console.log('  ERR', errs.join(' | '));
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
