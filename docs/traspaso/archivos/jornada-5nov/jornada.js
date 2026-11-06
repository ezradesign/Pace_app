/* Con el día elegido: qué mide el aro hoy y sin la frase de ayuda, a varias ventanas. */
'use strict';
const C = require('./comun');
const OPC = { hoy: '', sinComo: '[data-pace-ritmo-como]{display:none!important}' };
(async () => {
  const srv = await C.servidor();
  const b = await C.chromium.launch();
  try {
    const { page } = await C.abrir(b, { ancho: 1917, alto: 857, dsf: 1 });
    await page.evaluate(() => ritmoElegir('jornada')); await page.waitForTimeout(600);
    for (const [n, css] of Object.entries(OPC)) {
      const st = css ? await page.addStyleTag({ content: css }) : null;
      for (const [w, h] of [[1917, 857], [1536, 710], [1280, 800]]) {
        await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(500);
        const x = await C.medir(page);
        const panel = await page.evaluate(() => { const e = Array.from(document.querySelectorAll('[data-pace-activitybar]')).find((q) => q.getBoundingClientRect().width > 0); return Math.round(e.offsetHeight); });
        console.log(n, w + 'x' + h, 'aro', x.dial, 'scroll', x.scroll, 'panel css', panel);
        if (w === 1917 && n === 'hoy') await page.screenshot({ path: C.path.join(C.FOTOS, 'prep-ahora.png') });
      }
      if (st) await st.evaluate((e) => e.remove());
    }
  } finally { await b.close(); if (srv) srv.kill(); }
})().catch((e) => { console.error(e); process.exit(1); });
