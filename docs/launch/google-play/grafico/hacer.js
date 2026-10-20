/* PACE · fotografía las opciones del gráfico destacado de Play (1024 × 500)
 * Uso: node docs/launch/google-play/grafico/hacer.js [archivo.html]
 * Saca un PNG por cada .lienzo con id, al lado del HTML: A.png, B.png, C.png...
 */
'use strict';

const path = require('path');
const { chromium } = require('@playwright/test');

(async () => {
  const html = path.resolve(process.argv[2] || path.join(__dirname, 'opciones.html'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 1700 }, deviceScaleFactor: 1 });
  await page.goto('file:///' + html.replace(/\\/g, '/'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  const ids = await page.$$eval('.lienzo[id]', (els) => els.map((e) => e.id));
  for (const id of ids) {
    const out = path.join(path.dirname(html), id + '.png');
    await page.locator('#' + id).screenshot({ path: out });
    console.log(out);
  }
  await browser.close();
})();
