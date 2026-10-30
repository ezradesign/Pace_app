/* Fotos de la app tal como está hoy (0.187.0): de dónde parte cada pregunta. */
'use strict';
const path = require('path');
const fs = require('fs');
const C = require('./comun');
const SALIDA = path.join(C.FOTOS, 'fotos-hoy');

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await C.servidor();
  const browser = await C.chromium.launch();
  const medidas = {};
  const foto = async (page, n) => { medidas[n] = await C.scrollHome(page); await page.screenshot({ path: path.join(SALIDA, n + '.png') }); };
  try {
    for (const [ancho, alto, s] of [[360, 730, 'm'], [1280, 879, 'e']]) {
      for (const oscuro of [false, true]) {
        const t = s + (oscuro ? '-osc' : '');
        /* Martes 9:05: el día servido antes del primer bloque. */
        let { context, page } = await C.abrir(C.chromium && browser, { ancho, alto, oscuro, hora: new Date('2026-11-03T09:05:00+01:00') });
        await foto(page, 'pregunta-' + t);
        await page.evaluate(() => ritmoElegir('jornada'));
        await page.waitForTimeout(700);
        await foto(page, 'dia-' + t);
        await context.close();
        /* Lunes 9:00: la carta. */
        ({ context, page } = await C.abrir(browser, { ancho, alto, oscuro, hora: new Date('2026-11-02T09:00:00+01:00') }));
        await page.evaluate(() => ritmoElegir('jornada'));
        await C.ponerCarta(page, '2026-11-02', '2026-10-26', '2026-11-01');
        await page.waitForSelector('[data-pace-carta]', { state: 'visible', timeout: 15000 });
        await page.waitForTimeout(500);
        await foto(page, 'carta-' + t);
        await context.close();
        /* La vista previa de una rutina. */
        ({ context, page } = await C.abrir(browser, { ancho, alto, oscuro, hora: new Date('2026-11-03T09:05:00+01:00'), estado: { ritmo: { libre: true } } }));
        await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: 'extra.legs.standing' } })));
        await page.waitForSelector('[data-pace-cta]', { state: 'visible' });
        await page.waitForTimeout(600);
        await foto(page, 'preview-' + t);
        await context.close();
      }
    }
    /* «Tu semana», en el móvil. */
    const { context, page } = await C.abrir(browser, { ancho: 360, alto: 730, hora: new Date('2026-11-03T09:05:00+01:00') });
    await page.evaluate(() => { ritmoElegir('jornada'); ritmoSemanaAbrir(); });
    await page.waitForTimeout(900);
    await foto(page, 'semana-m');
    await context.close();
  } finally {
    await browser.close();
    if (srv) srv.kill();
    fs.writeFileSync(path.join(SALIDA, 'medidas.json'), JSON.stringify(medidas, null, 1));
    console.log(JSON.stringify(medidas));
  }
})().catch((e) => { console.error(e); process.exit(1); });
