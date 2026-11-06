/* node fotos.js <hoy|A|B>: los cinco momentos, fotos a 360 y 1280 y scroll en todos los tamaños, en los dos idiomas. */
'use strict';
const C = require('./comun');
const P = require('./parches');
const camino = 'hoy';
const SALIDA = C.path.join(C.FOTOS, 'montado');
const TAM = [[360, 640], [375, 667], [360, 718], [360, 730], [390, 844], [412, 844], [1280, 800], [1280, 720], [1536, 710], [1917, 857]];
(async () => {
  C.fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await C.servidor();
  const b = await C.chromium.launch();
  const med = {};
  try {
    const { page } = await C.abrir(b, { ancho: 1280, alto: 800, dsf: 2 });
    
    if (camino !== 'hoy') await page.evaluate((e) => { (0, eval)(e); document.documentElement.dataset.maq = window.__MAQ.camino; }, P.ESTADO);
    const poner = async (w, h, lang) => {
      await page.setViewportSize({ width: w, height: h });
      await page.evaluate(([w, lang]) => setState({ sidebarCollapsed: w < 769, lang }), [w, lang]);
      await page.waitForTimeout(260);
    };
    const momento = async (n, solo) => {
      await poner(360, 730, 'es'); await page.waitForTimeout(250); await page.screenshot({ path: C.path.join(SALIDA, n + '-m.png') });
      await poner(1280, 800, 'es'); await page.waitForTimeout(250); await page.screenshot({ path: C.path.join(SALIDA, n + '-e.png') });
      if (solo) return;
      await poner(360, 730, 'en'); await page.waitForTimeout(250); await page.screenshot({ path: C.path.join(SALIDA, n + '-m-en.png') });
      await poner(1280, 800, 'en'); await page.waitForTimeout(250); await page.screenshot({ path: C.path.join(SALIDA, n + '-e-en.png') });
      for (const lang of ['es', 'en']) for (const [w, h] of TAM) {
        await poner(w, h, lang);
        const x = await C.medir(page);
        med[n + ' ' + lang + ' ' + w + 'x' + h] = { scroll: x.scroll, aro: x.dial };
      }
      await poner(1280, 800, 'es');
    };
    await momento('1');
    await page.evaluate(() => ritmoElegir('jornada')); await page.waitForTimeout(600);
    await momento('2');
    await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    await page.clock.runFor(6 * 60000); await page.waitForTimeout(300);
    await momento('3');
    await page.clock.runFor(39 * 60000 + 3000); await page.waitForTimeout(800);
    if (camino !== 'B') {
      await page.clock.runFor(1000);
      await momento('4v', true);
      await page.locator('.pace-break-saltar').filter({ visible: true }).first().click(); await page.waitForTimeout(400);
    }
    await page.clock.runFor(20000); await page.waitForTimeout(300);
    await momento('4');
    await page.clock.runFor(6 * 60000); await page.waitForTimeout(800);
    await momento('5');
    console.log(camino, 'etiqueta', await page.locator('[data-pace-dial-label]').first().innerText());
  } finally {
    C.fs.writeFileSync(C.path.join(SALIDA, 'medidas.json'), JSON.stringify(med, null, 0));
    await b.close(); if (srv) srv.kill();
  }
  const malos = Object.entries(med).filter(([k, v]) => v.scroll > 0);
  console.log(camino, Object.keys(med).length, 'medidas; con scroll:', JSON.stringify(malos));
})().catch((e) => { console.error(e); process.exit(1); });
