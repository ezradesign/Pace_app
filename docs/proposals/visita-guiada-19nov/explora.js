/* Los sitios que la visita de hoy no enseña, vistos por alguien que acaba de llegar.
   Uso: PUERTO=8955 node docs/proposals/visita-guiada-19nov/explora.js → hoy/sitio-*.png */
'use strict';
const { chromium } = require('@playwright/test');
const path = require('path');
const { abrirNueva, pasarBienvenida, vis } = require('./comun.js');
const OUT = path.join(__dirname, 'hoy');
(async () => {
  const browser = await chromium.launch();
  for (const [w, h] of [[360, 640], [1280, 800]]) {
    const { ctx, p } = await abrirNueva(browser, w, h, 'es');
    await pasarBienvenida(p);
    const foto = async (q) => { await p.waitForTimeout(600); await p.screenshot({ path: path.join(OUT, `sitio-${w}-${q}.png`) }); };
    const cerrar = async () => { await p.goto(p.url()); await p.waitForTimeout(1500); };
    await vis(p, '[aria-label="Ver estadísticas"]').click(); await foto('stats'); await cerrar();
    await vis(p, '[aria-label="Ver logros"]').click(); await foto('logros'); await cerrar();
    await vis(p, '[data-pace-topbar-ajustes]').click(); await foto('ajustes'); await cerrar();
    await vis(p, '[data-pace-activitybar-chip]').click(); await foto('respira'); await cerrar();
    await vis(p, '[data-pace-cta]').click(); await p.waitForTimeout(800); await foto('foco-corre');
    await p.clock.runFor(25 * 60 * 1000 + 2000); await foto('foco-fin'); await cerrar();
    await vis(p, '[data-pace-ritmo-comienza], [data-pace-ritmo-ajustar]').click(); await foto('preparar'); await cerrar();
    if (w === 360) { await cerrar(); await vis(p, '[data-pace-sidebar-open]').click(); await foto('cajon'); }
    await ctx.close();
  }
  await browser.close();
})();
