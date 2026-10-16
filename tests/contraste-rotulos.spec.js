/* PACE · el gris de los rótulos se lee (16 oct. 2026)
 * ====================================================
 * La auditoría del 16 oct. midió que `--ink-3`, el color de casi todos los rótulos
 * de 9 a 12 px («BIBLIOTECAS», «HOY», «3 SERIES · 12·10·8 REPS», la versión del
 * pie), daba 3,2:1 sobre el crema y 3,0:1 en la barra lateral. Ez eligió, viendo
 * fotos, un punto intermedio (#77705F): 4,2 y 3,9. En oscuro ya daba 7,4. Esta
 * prueba lee los colores que pinta la app y cae si el gris vuelve a aclararse.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

function contraste(page) {
  return page.evaluate(() => {
    const raiz = getComputedStyle(document.documentElement);
    const rgb = (v) => {
      const c = document.createElement('i'); c.style.color = v; document.body.appendChild(c);
      const m = getComputedStyle(c).color.match(/[\d.]+/g).slice(0, 3).map(Number); c.remove(); return m;
    };
    const L = (c) => c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
      .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    const r = (a, b) => { const x = L(rgb(a)), y = L(rgb(b)); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const t = (n) => raiz.getPropertyValue(n).trim();
    return { papel: r(t('--ink-3'), t('--paper')), lateral: r(t('--ink-3'), t('--paper-2')) };
  });
}

test('en claro, el gris de los rótulos da al menos 4,2:1 en el crema y 3,85:1 en la barra lateral', async ({ page, context }) => {
  await sembrar(context, { palette: 'crema' });
  await irAlArtefacto(page);
  const c = await contraste(page);
  expect(c.papel).toBeGreaterThanOrEqual(4.2);
  expect(c.lateral).toBeGreaterThanOrEqual(3.85);
});

test('en oscuro, el gris de los rótulos sigue por encima de 4,5:1', async ({ page, context }) => {
  await sembrar(context, { palette: 'oscuro' });
  await irAlArtefacto(page);
  const c = await contraste(page);
  expect(c.papel).toBeGreaterThanOrEqual(4.5);
  expect(c.lateral).toBeGreaterThanOrEqual(4.5);
});
