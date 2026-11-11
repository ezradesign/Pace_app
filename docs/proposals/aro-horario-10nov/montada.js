/* La A montada: los tres estados medidos y fotografiados sobre el index.html de la rama.
   Uso: PUERTO=8953 node docs/proposals/aro-horario-10nov/montada.js
   Escribe montada.json y fotos/montada-*.webp (los tres estados a 1920×860 y a 1536×710, en español). */
'use strict';
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { medirTodo } = require('./medir.js');

(async () => {
  const browser = await chromium.launch();
  const conv = await (await browser.newContext()).newPage();
  const foto = async (page, w, h, lang, e) => {
    if (lang !== 'es' || e === '2b') return;
    const png = await page.screenshot({ type: 'png' });
    const b64 = await conv.evaluate(async ([src, ancho]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + src; await img.decode();
      const c = document.createElement('canvas'); c.width = ancho; c.height = Math.round(img.height * ancho / img.width);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.78).split(',')[1];
    }, [png.toString('base64'), w === 1920 ? 1440 : 1152]);
    fs.writeFileSync(path.join(__dirname, 'fotos', `montada-${e}-${w}x${h}.webp`), Buffer.from(b64, 'base64'));
  };
  const filas = await medirTodo(browser, { foto });
  const movil = await medirTodo(browser, { ventanas: [[360, 740]], estados: ['3', '1'], sinSalto: true });
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'montada.json'), JSON.stringify({ escritorio: filas, movil }, null, 1));
  for (const x of filas.concat(movil)) {
    console.log(x.w, x.lang, x.estado, x.salto ? JSON.stringify(x.salto)
      : `aro ${x.aro} vis ${x.aroVisible} scroll ${x.scroll} fondo ${x.fondo}/${x.ventana} caja ${x.cajaArriba} trazo ${x.trazoHasta}`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
