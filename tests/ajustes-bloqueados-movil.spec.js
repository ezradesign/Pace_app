/* PACE · E2E · EN EL MÓVIL, CON LOS AVISOS BLOQUEADOS, AJUSTES CABE Y DICE EL CÓMO EN LA FILA (Ez, 1C del 21 nov. 2026)
 * ====================================================================================================================
 * Caza de la 0.212.0 (docs/proposals/caza-0212-20nov/). Dos ramas del 19 nov., juntas: la caza quitó la nota de
 * «bloqueados» para que Ajustes cupiera, y el aviso del Foco en el PC trajo otra, de dos líneas, que dice cómo
 * quitar el bloqueo en cada navegador. En un móvil (con pantalla táctil sale la fila «Vibrar») Ajustes pedía 27 px
 * de scroll a 360 × 640, y 42 en Edge en castellano: la prueba de la unión medía sin pantalla táctil.
 * Ez eligió la C: en el móvil el cómo va en la línea pequeña de la fila («Bloqueados · permisos del sitio ›
 * Notificaciones») y la nota larga solo sale en el ordenador, donde cabe.
 * Contra la 0.212.0 cae: 27 px de scroll a 360 × 640.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const PANEL = '[data-pace-tweaks-panel]';
const ABRIR = { es: 'Abrir ajustes', en: 'Open settings' };
const LINEA = { es: 'Bloqueados · permisos del sitio › Notificaciones', en: 'Blocked · site settings › Notifications' };
const NAVEGADORES = {
  chrome: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
  firefox: 'Mozilla/5.0 (Android 14; Mobile; rv:151.0) Gecko/151.0 Firefox/151.0',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15',
};

async function abrirBloqueados(browser, { ancho, alto, lang, ua, tactil }) {
  const context = await browser.newContext({ viewport: { width: ancho, height: alto }, isMobile: tactil, hasTouch: tactil,
    userAgent: ua, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await sembrar(context, { lang, notifyFocusEnd: true });
  await context.addInitScript(() => {
    try { Object.defineProperty(Notification, 'permission', { configurable: true, get: () => 'denied' }); } catch (e) {}
  });
  const page = await context.newPage();
  await irAlArtefacto(page);
  await page.locator('button[aria-label="' + ABRIR[lang] + '"]').filter({ visible: true }).first().click();
  await expect(page.locator(PANEL)).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(450);   // la entrada de la hoja
  return { context, page };
}

for (const alto of [640, 730]) for (const lang of ['es', 'en']) {
  test(`móvil 360×${alto} ${lang}: con los avisos bloqueados, Ajustes cabe en los cuatro navegadores y la fila dice el cómo`, async ({ browser }) => {
    for (const [nav, ua] of Object.entries(NAVEGADORES)) {
      const { context, page } = await abrirBloqueados(browser, { ancho: 360, alto, lang, ua, tactil: true });
      await expect(page.locator(PANEL + ' [data-pace-aj-fila="vibrar"]'), 'GUARD: el móvil lleva la fila «Vibrar»').toBeVisible();
      const sobra = await page.locator(PANEL).evaluate((p) => p.scrollHeight - p.clientHeight);
      expect(sobra, `${nav}: Ajustes pide ${sobra} px de scroll`).toBeLessThanOrEqual(0);
      const linea = page.locator(PANEL + ' [data-pace-aj-bloqueo-movil]');
      await expect(linea, `${nav}: la fila no dice el cómo`).toBeVisible();
      await expect(linea).toHaveText(LINEA[lang]);
      expect(await linea.evaluate((e) => e.parentElement.scrollWidth <= e.parentElement.clientWidth + 1), `${nav}: la línea se corta`).toBe(true);
      await expect(page.locator(PANEL + ' [data-pace-aj-aviso-bloqueado]'), `${nav}: la nota larga sale en el móvil`).toBeHidden();
      await context.close();
    }
  });
}

for (const lang of ['es', 'en']) {
  test(`ordenador 1280×720 ${lang}: con los avisos bloqueados, la nota larga sigue y la fila, como antes`, async ({ browser }) => {
    for (const [nav, ua] of Object.entries(NAVEGADORES).filter(([n]) => n !== 'chrome')) {
      const { context, page } = await abrirBloqueados(browser, { ancho: 1280, alto: 720, lang, ua, tactil: false });
      const sobra = await page.locator(PANEL).evaluate((p) => p.scrollHeight - p.clientHeight);
      expect(sobra, `${nav}: Ajustes pide ${sobra} px de scroll`).toBeLessThanOrEqual(0);
      await expect(page.locator(PANEL + ' [data-pace-aj-aviso-bloqueado]'), `${nav}: sin la nota del navegador`).toBeVisible();
      await expect(page.locator(PANEL + ' [data-pace-aj-bloqueo-movil]')).toBeHidden();
      await expect(page.locator(PANEL + ' [data-pace-aj-fila="notify"]')).toContainText(lang === 'es' ? 'Foco · bloqueados en este navegador' : 'Focus · blocked in this browser');
      await context.close();
    }
  });
}
