// Fotos de v0.175.0 para Ez: el recorrido de verdad de «Ver ejercicio», sin nada pintado encima.
// La invitación en el aro → la hoja → la pantalla de ejercicio → el cierre → la vuelta al aro, con
// uno de Mueve (el primero del reparto) y uno de Estira (el segundo), a 360 y a 1280 px.
// Uso: node fotos-ver-ejercicio.js <worktree> <carpeta-de-salida>   (la app servida en el 8803)
'use strict';
const path = require('path');
const fs = require('fs');
const WT = process.argv[2];
const OUT = process.argv[3];
const { chromium } = require(path.join(WT, 'node_modules', 'playwright'));
const sharp = require(path.join(WT, 'node_modules', 'sharp'));
const { asentarGeometria } = require(path.join(WT, 'tests', 'home.helpers.js'));
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:8803/index.html';
const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const MOVIL = { width: 360, height: 730 }, ESC = { width: 1280, height: 879 };

async function abrir(b, { vp, lang, vez }) {
  const movil = vp.width < 700;
  const ctx = await b.newContext({ viewport: vp, isMobile: movil, hasTouch: movil, deviceScaleFactor: 1,
    locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript(([st]) => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {}
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(st));
  }, [{ firstSeen: 1, lang, langAuto: false, palette: 'crema', sidebarCollapsed: movil, focusMinutes: 10,
    hacerlaVez: vez, ritmo: { horario: H } }]);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-22T09:00:00+02:00') });
  await page.goto(BASE);
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(1, 1);
  await page.evaluate(() => ritmoElegir('jornada'));
  await page.evaluate(() => setState({ focusMinutes: 10 }));
  await page.waitForTimeout(200);
  /* dos bloques de 10 seguidos: al acabar el 2 (20 min), la invitación */
  for (let i = 0; i < 2; i++) {
    await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    await page.clock.fastForward(10 * 60 * 1000 + 2000);
    await page.waitForFunction(() => {
      const c = Array.from(document.querySelectorAll('[data-pace-cta]')).find((e) => e.getBoundingClientRect().width > 0);
      return c && !/Pausar|Pause/.test(c.textContent);
    });
    await page.waitForTimeout(300);
  }
  return { ctx, page };
}

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(30); }
}

async function foto(page, nombre, ancho) {
  const png = await page.screenshot();
  let img = sharp(png);
  if (ancho) img = img.resize({ width: ancho });
  await img.jpeg({ quality: 72, mozjpeg: true }).toFile(path.join(OUT, nombre + '.jpg'));
}

const SCROLL = () => {
  const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
  return body ? body.scrollHeight - body.clientHeight : null;
};

(async () => {
  const b = await chromium.launch();
  const medidas = [];
  try {
    for (const [lang, vp, vez, clave] of [['es', MOVIL, 0, 'mueve'], ['es', MOVIL, 1, 'estira'], ['es', ESC, 0, 'mueve'], ['en', MOVIL, 1, 'estira']]) {
      const pre = (vp.width < 700 ? 'm-' : 'e-') + (lang === 'en' ? 'en-' : '');
      const ancho = vp.width < 700 ? null : 900;
      const { ctx, page } = await abrir(b, { vp, lang, vez });
      await asentarGeometria(page);
      const m = { caso: clave, lang, vp: vp.width + '×' + vp.height, scroll: await page.evaluate(SCROLL) };
      await foto(page, pre + 'inv', ancho);
      await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
      await page.locator('[data-pace-hacerla]').waitFor();
      await page.waitForTimeout(400);
      m.hoja = await page.evaluate(() => {
        const d = document.querySelector('[data-pace-hacerla]').closest('[role=dialog]');
        return { alto: Math.round(d.getBoundingClientRect().height), scroll: d.scrollHeight - d.clientHeight,
          nombre: document.querySelector('[data-pace-hacerla] .pace-break-nombre').textContent };
      });
      await foto(page, pre + 'hoja-' + clave, ancho);
      const antes = await page.evaluate(() => getState().weeklyStats.moveMinutes.join(','));
      await page.locator('[data-pace-hacerla-empezar]').click();
      await page.waitForTimeout(300);
      await segundos(page, 14);
      await foto(page, pre + 'runner-' + clave, ancho);
      for (let s = 0; s < 120; s++) {
        if (await page.locator('[data-pace-session-done]').count()) break;
        await segundos(page, 1);
      }
      await page.waitForTimeout(400);
      m.feedback = await page.locator('[data-pace-session-feedback]').count();
      await foto(page, pre + 'cierre-' + clave, ancho);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      await asentarGeometria(page);
      m.vuelta = await page.evaluate(() => {
        const v = (s) => Array.from(document.querySelectorAll(s)).find((el) => el.getBoundingClientRect().width > 0);
        const cta = v('[data-pace-cta]');
        return (cta ? cta.textContent : '') + ' | invita ' + document.querySelectorAll('[data-pace-invita]').length;
      });
      m.minutos = antes + ' → ' + await page.evaluate(() => getState().weeklyStats.moveMinutes.join(','));
      m.scrollVuelta = await page.evaluate(SCROLL);
      await foto(page, pre + 'vuelta-' + clave, ancho);
      medidas.push(m);
      console.log(JSON.stringify(m));
      await ctx.close();
    }
  } finally {
    fs.writeFileSync(path.join(OUT, 'medidas.json'), JSON.stringify(medidas, null, 1));
    await b.close();
  }
})();
