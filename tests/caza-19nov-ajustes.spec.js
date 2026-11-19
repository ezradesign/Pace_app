/* PACE · tests/caza-19nov-ajustes.spec.js
   =======================================
   4 · Ajustes no pide scroll con los avisos bloqueados (4A de Ez, caza del 19 nov. 2026). La nota
       «El navegador tiene las notificaciones bloqueadas…» sumaba 12 px a 360 × 640, en los dos
       idiomas, y 6 a 1280 × 720, y cortaba «Tus datos». Ahora lo dice la línea pequeña de la fila
       («Foco · bloqueados en este navegador»), que ya estaba y no suma altura. En las apps la nota
       sigue como era (la miden sus pruebas: android-avisos, android-nativo, ios-*).
*/
'use strict';
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const PANEL = '[data-pace-tweaks-panel]';
const ABRIR = { es: 'Abrir ajustes', en: 'Open settings' };
const SUB = { es: 'Foco · bloqueados en este navegador', en: 'Focus · blocked in this browser' };

async function bloqueados(context) {
  await context.addInitScript(() => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'denied' }); } catch (e) {}
  });
}
async function abrirAjustes(page, lang) {
  await page.locator('button[aria-label="' + ABRIR[lang] + '"]').filter({ visible: true }).first().click();
  await expect(page.locator(PANEL)).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(450);
}

for (const [ancho, alto] of [[360, 640], [360, 730], [1280, 720], [1280, 800]]) {
  for (const lang of ['es', 'en']) {
    test(`4 · ${ancho}×${alto} ${lang}: con los avisos bloqueados, Ajustes cabe sin scroll y lo dice en la fila`, async ({ page, context }) => {
      await page.setViewportSize({ width: ancho, height: alto });
      await sembrar(context, { lang });
      await bloqueados(context);
      await irAlArtefacto(page);
      await abrirAjustes(page, lang);
      const sobra = await page.locator(PANEL).evaluate((p) => p.scrollHeight - p.clientHeight);
      expect(sobra, `Ajustes pide ${sobra} px de scroll`).toBeLessThanOrEqual(0);
      const fila = page.locator(PANEL + ' [data-pace-aj-fila="notify"]');
      await expect(fila).toContainText(SUB[lang]);
      await expect(fila.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
      await expect(page.locator(PANEL + ' .pace-aj-nota')).toHaveCount(0);
    });
  }
}

test('4 · sin bloquear, la línea pequeña es la de siempre', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrar(context, {});
  await context.addInitScript(() => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {}
  });
  await irAlArtefacto(page);
  await abrirAjustes(page, 'es');
  await expect(page.locator(PANEL + ' [data-pace-aj-fila="notify"]')).toContainText('Foco · si la pestaña está detrás');
});
