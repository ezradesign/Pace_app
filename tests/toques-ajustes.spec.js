/* PACE · en el móvil, los interruptores y los enlaces de Ajustes se pueden tocar (16 oct. 2026)
 * ==========================================================================================
 * La auditoría del 16 oct. midió los interruptores de Ajustes en 32×18 px y los enlaces
 * «Seguridad» y «Privacidad» en 15 px de alto: por debajo de los 24 que pide WCAG 2.5.8
 * para el dedo. La zona de toque crece con una capa invisible y el dibujo no cambia. Se
 * mide lo que de verdad recibe el toque: los píxeles de alto, en el centro de cada uno,
 * donde `elementFromPoint` devuelve ese mismo control.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.use({ viewport: { width: 360, height: 640 } });

function altoTocable(page, selector) {
  return page.evaluate((sel) => {
    const el = Array.from(document.querySelectorAll(sel)).find(e => e.getClientRects().length);
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2;
    let n = 0;
    for (let y = Math.floor(r.top) - 12; y <= Math.ceil(r.bottom) + 12; y++) {
      const e = document.elementFromPoint(x, y);
      if (e && (e === el || el.contains(e))) n++;
    }
    return { dibujo: Math.round(r.height), tocable: n };
  }, selector);
}

test('los interruptores y los enlaces del pie de Ajustes tienen al menos 24 px de toque', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await expect(page.locator('.pace-aj-sw').first()).toBeVisible();
  const sw = await altoTocable(page, '.pace-aj-sw');
  expect(sw.dibujo, 'el interruptor se dibuja igual').toBe(18);
  expect(sw.tocable).toBeGreaterThanOrEqual(24);
  const enlace = await altoTocable(page, '.pace-aj-pie a');
  expect(enlace.tocable).toBeGreaterThanOrEqual(24);
});
