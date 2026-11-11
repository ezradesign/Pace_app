'use strict';
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/caza-rendimiento-9nov';
const { chromium } = require(WT + '/node_modules/@playwright/test');
const { SEMILLA, CLAVE_ESTADO } = require(WT + '/tests/helpers.js');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const v of ['antes', 'despues']) {
    await fetch('http://localhost:8910/__version?to=' + v);
    for (const ancho of [360, 1280]) {
      const context = await browser.newContext({ viewport: { width: ancho, height: ancho < 768 ? 640 : 720 }, deviceScaleFactor: 2, isMobile: ancho < 768, hasTouch: ancho < 768, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
      await context.addInitScript(([k, s]) => { localStorage.setItem(k, JSON.stringify(s)); }, [CLAVE_ESTADO, SEMILLA]);
      const p = await context.newPage();
      await p.clock.install({ time: new Date('2026-11-09T10:00:00') });
      await p.goto('http://localhost:8910/index.html');
      await p.locator('[data-pace-dial-number]').waitFor();
      await p.getByRole('button', { name: /^Respira/ }).first().click();
      await p.getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).first().click();
      const ya = p.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' });
      if (await ya.count()) await ya.click();
      await p.locator('[data-pace-breathe-phase]').waitFor();
      for (let i = 0; i < 17; i++) await p.clock.fastForward(1000);
      await p.evaluate(() => document.getAnimations().forEach((a) => { if (a.transitionProperty) a.finish(); }));
      const b = p.locator('[data-pace-breathe-progress]');
      const prog = await b.getAttribute('data-pace-breathe-progress');
      const png = await b.screenshot({ animations: 'disabled' });
      const f = `barra-${v}-${ancho}.png`; fs.writeFileSync('salida/' + f, png);
      out[f] = { prog, bytes: png.length };
      await context.close();
    }
  }
  console.log(JSON.stringify(out));
  // pixel compare with sharp
  const sharp = require(WT + '/node_modules/sharp');
  for (const ancho of [360, 1280]) {
    const a = await sharp(`salida/barra-antes-${ancho}.png`).raw().toBuffer({ resolveWithObject: true });
    const d = await sharp(`salida/barra-despues-${ancho}.png`).raw().toBuffer({ resolveWithObject: true });
    let dif = 0, max = 0;
    if (a.data.length === d.data.length) for (let i = 0; i < a.data.length; i++) { const x = Math.abs(a.data[i] - d.data[i]); if (x) dif++; if (x > max) max = x; }
    console.log(ancho, a.info.width + 'x' + a.info.height, d.info.width + 'x' + d.info.height, 'canales distintos', dif, 'de', a.data.length, 'max', max);
  }
  await browser.close();
})();
