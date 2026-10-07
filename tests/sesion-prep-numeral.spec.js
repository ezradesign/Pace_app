/* PACE · E2E · LA CUENTA ATRÁS NO PISA SU FRASE
 * =============================================
 * Las cifras de Cormorant son de texto: el 3 y el 5 cuelgan por debajo de la
 * línea. Con el numeral a lineHeight 0.9, la cola del 3 tocaba «Siéntate
 * cómodo. Respira natural.» a 360×718 (un píxel de aire) y se montaba encima a
 * 1280×520. Se mide la TINTA del 3 con un canvas en la fuente real, no la caja
 * del numeral, que es justo lo que engañaba.
 *
 * Contra v0.143.2 fallan las de 360×718 y 1280×520.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const AIRE_MINIMO = 8;

for (const [ancho, alto] of [[360, 718], [1280, 720], [1280, 520]]) {
  test(`a ${ancho}×${alto} la cola del 3 deja aire sobre la frase de preparación`, async ({ page, context }) => {
    await sembrar(context);
    await page.setViewportSize({ width: ancho, height: alto });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: /^Respira/ }).first().click();
    await page.locator('[data-pace-lib-card="breathe.coherent.432"]').getByRole('button').first().click();
    const empezar = page.getByRole('button', { name: 'Empezar', exact: true });
    if (await empezar.count()) await empezar.last().click();
    await page.locator('[data-pace-session-prep-num]').waitFor();
    await page.evaluate(() => document.fonts.ready);

    const m = await page.evaluate(() => {
      const num = document.querySelector('[data-pace-session-prep-num]');
      const frase = document.querySelector('[data-pace-session-prep-copy]');
      const cs = getComputedStyle(num);
      const lienzo = document.createElement('canvas').getContext('2d');
      lienzo.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      /* La línea base sale de una sonda de altura cero alineada a ella. */
      const sonda = document.createElement('span');
      sonda.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
      num.appendChild(sonda);
      const base = sonda.getBoundingClientRect().top;
      sonda.remove();
      return {
        tinta: base + lienzo.measureText('3').actualBoundingBoxDescent,
        frase: frase.getBoundingClientRect().top,
      };
    });
    expect(m.frase - m.tinta).toBeGreaterThanOrEqual(AIRE_MINIMO);
  });
}
