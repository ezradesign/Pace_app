/* Fotos de lo MONTADO (5 nov. 2026, 1C y 3A): el index.html compilado de la rama, sin nada inyectado.
   Uso: PACE_RAIZ=<repo> PACE_FOTOS=<carpeta> MAQ_PORT=8864 node montado.js */
'use strict';
const path = require('path');
const fs = require('fs');
const C = require('../grupo2-30oct/comun');
const SALIDA = path.join(C.FOTOS, 'montado');

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await C.servidor();
  const browser = await C.chromium.launch();
  const medidas = {};
  try {
    for (const [ancho, alto, s] of [[360, 730, 'm'], [1280, 879, 'e']]) {
      for (const oscuro of [false, true]) {
        const n = s + (oscuro ? '-osc' : '');
        const { context, page } = await C.abrir(browser, { ancho, alto, oscuro, dsf: s === 'm' ? 2 : 1, hora: new Date('2026-11-05T11:00:00+01:00') });
        await page.evaluate(() => ritmoElegir('jornada'));
        await C.ponerCarta(page, '2026-11-02', '2026-10-26', '2026-11-01', { luego: true });
        await page.waitForSelector('[data-pace-sobre]');
        await page.waitForTimeout(400);
        const antes = await C.scrollHome(page);
        await page.locator('[data-pace-sobre]').filter({ visible: true }).click();
        await page.waitForSelector('[data-pace-sobre-hoja]');
        await page.waitForTimeout(500);
        const despues = await C.scrollHome(page);
        const hoja = await page.evaluate(() => { const d = document.querySelector('[data-pace-sobre-hoja]').closest('[data-pace-modal-card]'); return { alto: Math.round(d.getBoundingClientRect().height), sobra: d.scrollHeight - d.clientHeight }; });
        medidas[n] = Object.assign({ homeAntes: antes.scroll, homeDespues: despues.scroll }, hoja);
        await page.screenshot({ path: path.join(SALIDA, n + '.jpg'), type: 'jpeg', quality: 82 });
        if (s === 'm' && !oscuro) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          await page.screenshot({ path: path.join(SALIDA, 'barra-despues.jpg'), type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: ancho, height: 70 } });
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    if (srv) srv.kill();
    fs.writeFileSync(path.join(SALIDA, 'medidas.json'), JSON.stringify(medidas, null, 1));
    console.log(JSON.stringify(medidas));
  }
})().catch((e) => { console.error(e); process.exit(1); });
