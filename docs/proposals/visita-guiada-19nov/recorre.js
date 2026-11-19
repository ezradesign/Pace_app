/* La bienvenida y la visita guiada de hoy, recorridas como una persona nueva sobre el index.html
   compilado. Uso: PUERTO=8955 node docs/proposals/visita-guiada-19nov/recorre.js
   Escribe hoy/<idioma>-<ancho>-<nn>-<qué>.png y hoy/recorrido.json (los textos de cada pantalla). */
'use strict';
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const BASE = 'http://localhost:' + (process.env.PUERTO || 8955);
const OUT = path.join(__dirname, 'hoy');
const TAMANOS = [[360, 640], [1280, 800]];

async function abrirNueva(browser, w, h, lang) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: lang === 'es' ? 'es-ES' : 'en-GB',
    timezoneId: 'Europe/Madrid', serviceWorkers: 'block', colorScheme: 'light', deviceScaleFactor: 1,
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] } });
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date('2026-11-19T10:00:00+01:00') });
  await p.goto(BASE + '/index.html');
  await p.waitForTimeout(1500);
  return { ctx, p };
}
const texto = (p) => p.evaluate(() => {
  const r = document.querySelector('[data-pace-visita]') || document.querySelector('[role="dialog"]') || document.body;
  return r.innerText.replace(/\n+/g, ' · ').slice(0, 600);
});

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const log = [];
  for (const lang of ['es', 'en']) for (const [w, h] of TAMANOS) {
    const { ctx, p } = await abrirNueva(browser, w, h, lang);
    let n = 0;
    const foto = async (que) => {
      const f = `${lang}-${w}-${String(++n).padStart(2, '0')}-${que}.png`;
      await p.screenshot({ path: path.join(OUT, f) });
      log.push({ lang, w, n, que, f, texto: await texto(p) });
    };
    if (lang === 'en') { await p.locator('button[title*="English"]').first().click().catch(() => {}); await p.waitForTimeout(400); }
    await foto('bienvenida');
    await p.locator('[data-pace-cta]:visible').last().click(); await p.waitForTimeout(700);
    for (let i = 0; i < 6; i++) {
      if (await p.locator('[data-pace-onb-comenzar]').isVisible().catch(() => false)) break;
      if (await p.locator('[data-pace-visita]').count()) break;
      await foto('paso' + i);
      // Elige la primera opción si hay y sigue.
      const op = p.locator('[role="dialog"] [aria-pressed], [role="dialog"] [role="radio"]').first();
      if (await op.count()) await op.click().catch(() => {});
      await p.waitForTimeout(300);
      const sig = p.locator('[role="dialog"] [data-pace-cta]:visible').last();
      if (await sig.count()) await sig.click(); else break;
      await p.waitForTimeout(700);
    }
    if (await p.locator('[data-pace-onb-comenzar]').isVisible().catch(() => false)) {
      await foto('completo');
      await p.locator('[data-pace-onb-comenzar]').click();
    }
    await p.locator('[data-pace-visita]').waitFor({ timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(700);
    for (let i = 0; i < 6 && await p.locator('[data-pace-visita]').count(); i++) {
      const id = await p.locator('[data-pace-visita]').getAttribute('data-pace-visita');
      await foto('visita-' + id);
      await p.locator('[data-pace-visita-siguiente]').click(); await p.waitForTimeout(600);
    }
    await p.waitForTimeout(500);
    await foto('home');
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'recorrido.json'), JSON.stringify(log, null, 1));
  for (const l of log) console.log(l.f, '::', l.texto.slice(0, 260));
  await browser.close();
})();
