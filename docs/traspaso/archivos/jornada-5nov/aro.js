/* El aro a 1917×857 con la barra lateral abierta: hoy, por opción del día, y las maneras de darle alto sin jornada. */
'use strict';
const C = require('./comun');
const SALIDA = C.path.join(C.FOTOS, 'aro');
const OPCIONES = {
  hoy: '',
  /* 2A · quitar el subtítulo y bajar las losetas: dos filas, más finas. */
  fina: `.pace-rt-tarjeta-s{display:none}
    .pace-rt-tarjeta{padding-top:12px!important;padding-bottom:12px!important}
    .pace-rt-losetas{margin-top:8px!important}
    .pace-rt-loseta{padding-top:8px!important;padding-bottom:7px!important}
    .pace-rt-loseta>span{margin-top:2px!important}`,
  /* 2B · la pregunta y las losetas en una sola fila. */
  fila: `.pace-rt-tj-esc{display:flex!important;align-items:center;gap:18px}
    .pace-rt-tarjeta-cab{display:block!important;flex:0 0 auto}
    .pace-rt-tarjeta-s{display:none}
    .pace-rt-tarjeta-enlaces{justify-content:flex-start;margin-top:5px;padding-bottom:0}
    .pace-rt-tarjeta{padding-top:10px!important;padding-bottom:10px!important}
    .pace-rt-tarjeta-t{font-size:21px!important;white-space:nowrap}
    .pace-rt-losetas{margin-top:0!important;flex:1 1 auto;min-width:0;grid-template-columns:repeat(4,minmax(0,1fr))!important}
    .pace-rt-loseta{padding:8px 12px 7px!important}
    .pace-rt-loseta b{font-size:17px!important}
    .pace-rt-loseta>span{margin-top:2px!important;font-size:12px!important;white-space:nowrap}`,
};
const TAM = [[1917, 857], [1536, 710], [1280, 800], [1280, 720], [1024, 700]];
(async () => {
  C.fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await C.servidor();
  const b = await C.chromium.launch();
  const med = {};
  try {
    const { page } = await C.abrir(b, { ancho: 1917, alto: 857, dsf: 1 });
    const pon = async (w, h, lang) => { await page.setViewportSize({ width: w, height: h }); await page.evaluate((l) => setState({ lang: l }), lang); await page.waitForTimeout(350); };
    for (const [nombre, css] of Object.entries(OPCIONES)) {
      const est = css ? await page.addStyleTag({ content: css }) : null;
      for (const lang of ['es', 'en']) for (const [w, h] of TAM) {
        await pon(w, h, lang);
        const x = await C.medir(page);
        med['sin ' + nombre + ' ' + lang + ' ' + w + 'x' + h] = { scroll: x.scroll, aro: x.dial };
        if (w === 1917 && lang === 'es') await page.screenshot({ path: C.path.join(SALIDA, 'sin-' + nombre + '.png') });
        if (w === 1280 && h === 800 && nombre !== 'hoy') await page.screenshot({ path: C.path.join(SALIDA, 'sin-' + nombre + '-1280-' + lang + '.png') });
      }
      if (est) await est.evaluate((n) => n.remove());
    }
    await pon(1917, 857, 'es');
    for (const op of ['1h', '2h', 'media', 'jornada']) {
      await page.evaluate((o) => ritmoElegir(o), op); await page.waitForTimeout(500);
      const x = await C.medir(page); med['dia ' + op] = { scroll: x.scroll, aro: x.dial };
    }
    await page.screenshot({ path: C.path.join(SALIDA, 'preparada.png') });
    await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    await page.clock.runFor(5 * 60000); await page.waitForTimeout(400);
    let x = await C.medir(page); med['foco'] = { scroll: x.scroll, aro: x.dial };
    await page.clock.runFor(41 * 60000); await page.waitForTimeout(700);
    await page.locator('.pace-break-saltar').filter({ visible: true }).first().click(); await page.waitForTimeout(500);
    x = await C.medir(page); med['pausa'] = { scroll: x.scroll, aro: x.dial };
    await page.screenshot({ path: C.path.join(SALIDA, 'tras-bloque.png') });
    await page.clock.runFor(6 * 60000); await page.waitForTimeout(700);
    x = await C.medir(page); med['bloque 2'] = { scroll: x.scroll, aro: x.dial };
  } finally {
    C.fs.writeFileSync(C.path.join(SALIDA, 'medidas.json'), JSON.stringify(med, null, 1));
    await b.close(); if (srv) srv.kill();
  }
  console.log(JSON.stringify(med));
})().catch((e) => { console.error(e); process.exit(1); });
