'use strict';
/* Fotos del montaje, antes y después: `node montaje-fotos.js antes` sobre la 0.211.0 y
   `node montaje-fotos.js despues` con los arreglos y el build. Salen en ../fotos/montaje/. */
const path = require('path');
const fs = require('fs');
const { chromium, abrir, BASE, SEMILLA } = require('./lib');
const { sembrarVeterana } = require('./veterana');
const fase = process.argv[2] || 'antes';
const solo = process.argv[3] ? process.argv[3].split(',') : null;
const OUT = path.join(__dirname, '..', 'fotos', 'montaje');
fs.mkdirSync(OUT, { recursive: true });
const M = { width: 360, height: 640 }, D = { width: 1280, height: 720 };
const shot = (page, n) => page.screenshot({ path: path.join(OUT, fase + '-' + n + '.png') });
const espera = (page, ms) => page.waitForTimeout(ms);

const ESCENAS = {
  async c1(b) { // el panel guardado abierto, al abrir PACE en el móvil
    const { ctx, page } = await abrir(b, { vp: M, mobile: true, estado: { sidebarCollapsed: false }, hora: new Date(2026, 10, 19, 10, 0) });
    await page.goto(BASE + '/index.html'); await espera(page, 1500); await shot(page, '1-360'); await ctx.close();
  },
  async c2(b) { // abrir el cajón con el teclado y pulsar Escape
    for (const [n, vp] of [['360', M], ['820', { width: 820, height: 1180 }]]) {
      const { ctx, page } = await abrir(b, { vp, mobile: vp.width < 700, hora: new Date(2026, 10, 19, 10, 0) });
      await page.goto(BASE + '/index.html'); await espera(page, 1500);
      await page.locator('[data-pace-sidebar-open]').focus(); await page.keyboard.press('Enter'); await espera(page, 600);
      await page.keyboard.press('Escape'); await espera(page, 600); await shot(page, '2-' + n); await ctx.close();
    }
  },
  async c3(b) { // cambiar a inglés sin recargar y ganar un sello
    for (const [n, vp] of [['360', M], ['1280', D]]) {
      const { ctx, page } = await abrir(b, { vp, mobile: vp.width < 700, hora: new Date(2026, 10, 19, 10, 0) });
      await page.goto(BASE + '/index.html'); await espera(page, 1500);
      await page.evaluate(() => window.setState({ lang: 'en' })); await espera(page, 400);
      await page.evaluate(() => window.showToast({ id: 'first.step', type: 'achievement' })); await espera(page, 900);
      await shot(page, '3-' + n); await ctx.close();
    }
  },
  async c4(b) { // Ajustes con los avisos bloqueados
    for (const [n, vp, lang] of [['360-en', M, 'en'], ['360-es', M, 'es'], ['1280', D, 'es']]) {
      const ctx = await b.newContext({ viewport: vp, isMobile: vp.width < 700, hasTouch: vp.width < 700, locale: 'es-ES', timezoneId: 'Europe/Madrid', serviceWorkers: 'block' });
      await ctx.addInitScript(([s]) => { localStorage.setItem('pace-cara', 'app'); if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(s)); try { Object.defineProperty(Notification, 'permission', { get: () => 'denied' }); } catch (e) {} }, [Object.assign({}, SEMILLA, { lang })]);
      const page = await ctx.newPage(); await page.clock.install({ time: new Date(2026, 10, 19, 10, 0) });
      await page.goto(BASE + '/index.html'); await espera(page, 1300);
      await page.getByRole('button', { name: /Abrir ajustes|Open settings/ }).click(); await espera(page, 900);
      await shot(page, '4-' + n); await ctx.close();
    }
  },
  async c5(b) { // Privacidad abierta desde PACE en inglés
    for (const [n, vp] of [['360', M], ['1280', D]]) {
      const { ctx, page } = await abrir(b, { vp, mobile: vp.width < 700, estado: { lang: 'en' } });
      await page.goto(BASE + '/index.html'); await espera(page, 1300);
      await page.getByRole('button', { name: /Open settings/ }).click(); await espera(page, 700);
      const datos = page.locator('[data-pace-aj-plegada] .pace-aj-sec-accion');
      if (await datos.count()) { await datos.click(); await espera(page, 500); }
      const href = await page.getByRole('link', { name: 'Privacy' }).getAttribute('href');
      console.log('5', n, 'enlace', href);
      await page.goto(BASE + href.replace(/^\/privacy/, '/privacy.html')); await espera(page, 900);
      await shot(page, '5-' + n);
      if (n === '360') { await page.goto(BASE + '/privacy.html'); await espera(page, 600); await shot(page, '5-es-360'); }
      await ctx.close();
    }
  },
  async c6(b) { // las losetas a las 23:30 y a las 22:45
    for (const [h, mi] of [[23, 30], [22, 45]]) for (const [n, vp] of [['360', M], ['1280', D]]) {
      const { ctx, page } = await abrir(b, { vp, mobile: vp.width < 700, hora: new Date(2026, 10, 19, h, mi) });
      await page.goto(BASE + '/index.html'); await espera(page, 1500);
      const prep = page.locator('[data-pace-ritmo-comienza]').filter({ visible: true });   // en el ordenador, las losetas ya están en la home
      if (await prep.count()) { await prep.first().click(); await espera(page, 900); }
      await shot(page, '6-' + h + mi + '-' + n); await ctx.close();
    }
  },
  async c8(b) { // Qué te ayuda sin pausas después del Foco (el resultado, fijo: 60 Focos y ninguna pausa justo después)
    for (const [n, vp] of [['360', M], ['1280', { width: 1280, height: 800 }]]) {
      const { ctx, page } = await abrir(b, { vp, mobile: vp.width < 700, hora: new Date(2026, 10, 19, 18, 0) });
      await page.goto(BASE + '/index.html'); await espera(page, 1500);
      await page.evaluate(() => { window.statsAyuda = () => ({ bien: null, hora: null, tras: { a: 0, b: 60, manana: [0, 31], tarde: [0, 29] }, semanas: 3 }); });
      await page.getByRole('button', { name: 'Ver estadísticas' }).filter({ visible: true }).first().click(); await espera(page, 900);
      await page.getByRole('dialog').getByRole('button', { name: 'Qué te ayuda', exact: true }).first().click(); await espera(page, 900);
      await shot(page, '8-' + n); await ctx.close();
    }
  },
  async c9(b) { // «Otro» con 999
    for (const [n, vp] of [['360', M], ['1280', D]]) {
      const { ctx, page } = await abrir(b, { vp, mobile: vp.width < 700, hora: new Date(2026, 10, 19, 10, 0) });
      await page.goto(BASE + '/index.html'); await espera(page, 1500);
      await page.getByRole('button', { name: 'Otro' }).click(); await espera(page, 500);
      await page.locator('input').first().fill('999'); await page.locator('input').first().press('Enter'); await espera(page, 700);
      await shot(page, '9-' + n); await ctx.close();
    }
  },
  async c11(b) { // la línea del Mes, en el ordenador (en el móvil no sale)
    const hoy = new Date(2026, 10, 16, 18, 5);
    const { ctx, page } = await abrir(b, { estado: null, vp: { width: 1280, height: 800 }, hora: hoy });
    await sembrarVeterana(page, BASE, hoy);
    await page.goto(BASE + '/index.html'); await espera(page, 2000);
    for (let i = 0; i < 2; i++) { await page.keyboard.press('Escape'); await espera(page, 300); }
    await page.getByRole('button', { name: 'Ver estadísticas' }).first().click(); await espera(page, 900);
    await page.getByRole('dialog').getByRole('button', { name: 'Mes', exact: true }).first().click(); await espera(page, 900);
    await shot(page, '11-1280');
    const linea = page.locator('.pace-heatmap-totals').first();
    if (await linea.count()) { await linea.screenshot({ path: path.join(OUT, fase + '-11-linea.png') }); console.log('11', await linea.innerText()); }
    await ctx.close();
  },
};

(async () => {
  const b = await chromium.launch();
  for (const k of Object.keys(ESCENAS)) {
    if (solo && !solo.includes(k)) continue;
    try { await ESCENAS[k](b); console.log('ok', k); } catch (e) { console.log('FALLO', k, e.message.split('\n')[0]); }
  }
  await b.close();
})();
