'use strict';
/* Solo mide (rama de diagnóstico): las filas de Ajustes y de la home, para comparar Linux con Windows. */
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const volcar = (root) => {
  const out = [];
  for (const e of root.querySelectorAll('*')) {
    const r = e.getBoundingClientRect();
    if (!r.width) continue;
    const propio = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join('').trim();
    if (!propio) continue;
    const lh = parseFloat(getComputedStyle(e).lineHeight) || parseFloat(getComputedStyle(e).fontSize) * 1.2;
    out.push([propio.slice(0, 32), +r.top.toFixed(1), +r.height.toFixed(1), Math.round(r.height / lh), +r.width.toFixed(1)]);
  }
  return out;
};

for (const lang of ['es', 'en']) {
  test('diag ajustes ' + lang, async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await sembrar(context, { lang });
    await context.addInitScript(() => { try { Object.defineProperty(Notification, 'permission', { get: () => 'denied' }); } catch (e) {} });
    await irAlArtefacto(page);
    await page.locator('button[aria-label="' + (lang === 'en' ? 'Open settings' : 'Abrir ajustes') + '"]').filter({ visible: true }).first().click();
    await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    const d = await page.locator('[data-pace-tweaks-panel]').evaluate((p, f) => ({ sobra: p.scrollHeight - p.clientHeight, alto: p.clientHeight, filas: (new Function('return ' + f))()(p) }), volcar.toString());
    console.log('DIAG ajustes ' + lang + ' ' + JSON.stringify(d));
  });
}

const FECHA = '2026-10-08';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
for (const lang of ['es', 'en']) {
  test('diag home pausa ' + lang, async ({ browser }) => {
    const baseURL = test.info().project.use.baseURL;
    const context = await browser.newContext({ baseURL, viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true,
      locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
    await sembrar(context, Object.assign({ lang, sidebarCollapsed: true }, { ritmo: { dia: Object.assign({}, JORNADA, { pausa: 1 }) }, cycle: 1, lastActiveDay: 'Thu Oct 08 2026', _historyMigrated: true }));
    const page = await context.newPage();
    await page.clock.install({ time: new Date(FECHA + 'T09:50:00+02:00') });
    await irAlArtefacto(page);
    await page.mouse.move(1, 1);
    await asentarGeometria(page);
    const d = await page.evaluate((f) => {
      const body = [...document.querySelectorAll('[data-pace-home-body]')].find((e) => e.getBoundingClientRect().width > 0);
      return { justa: document.querySelectorAll('[data-pace-home-justa]').length, sobra: body.scrollHeight - body.clientHeight, alto: body.clientHeight,
        filas: (new Function('return ' + f))()(body) };
    }, volcar.toString());
    console.log('DIAG home ' + lang + ' ' + JSON.stringify(d));
    await context.close();
  });
}
