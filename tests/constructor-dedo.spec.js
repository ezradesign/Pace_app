/* PACE · E2E · LOS BOTONES DEL CONSTRUCTOR, PARA EL DEDO (Ez, 1A del 16 nov. 2026)
 * ===============================================================================
 * Auditoría fable-9nov, fila 25: los seis botones de cada paso de «Tus rutinas» medían 24 × 24 con
 * 2 px entre «↓» y «×»: al ordenar con el dedo se borraba un paso sin querer. Ez eligió la A de la
 * maqueta (docs/proposals/maquetas-4-16nov/): en el móvil, 40 × 40 con aire entre ellos, la «×» en
 * la línea del nombre y el tiempo y el orden debajo. Con ratón y pantalla ancha, como antes.
 *
 * QUÉ DEFIENDE, a 360 px:
 *  · los cinco botones de cada paso miden 40 × 40 y entre dos de la misma línea hay 8 px o más;
 *  · la «×» va en la línea del nombre y por encima del tiempo y las flechas;
 *  · ningún botón tapa a otro (se toca su centro y responde él);
 *  y a 1280 px, todos en una línea y del tamaño de antes.
 * Contra la 0.207.0 cae la primera: los botones medían 24 y la «×» iba junto a «↓».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

test.use({ serviceWorkers: 'block' });

async function abrirConstructor(page) {
  const boton = page.locator('aside[data-pace-sidebar]').getByRole('button', { name: /^Tus rutinas/ });
  if (!(await boton.filter({ visible: true }).count())) await page.getByRole('button', { name: /Abrir panel/ }).filter({ visible: true }).first().click();
  await boton.filter({ visible: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Nueva rutina' })).toBeVisible();
  for (let k = 0; k < 3; k++) {
    await page.getByRole('button', { name: /Añadir ejercicio/ }).filter({ visible: true }).first().click();
    const filas = page.locator('[data-pace-modal-backdrop]').last().getByRole('button').filter({ hasText: /\d+\s*s$/ });
    await filas.nth(k * 3).click();
    const volver = page.getByRole('button', { name: /Volver/ }).filter({ visible: true });
    if (await volver.count()) await volver.first().click();
  }
  await expect(page.locator('[data-pace-cb-paso]')).toHaveCount(3);
}

/* Cada paso: sus botones, el nombre y si alguno tapa a otro. */
const medir = (page) => page.evaluate(() => [...document.querySelectorAll('[data-pace-cb-paso]')].map((fila) => {
  const caja = (el) => { const r = el.getBoundingClientRect(); return { x0: r.left, x1: r.right, y0: r.top, y1: r.bottom, w: r.width, h: r.height }; };
  const botones = [...fila.querySelectorAll('button')].map((b) => Object.assign(caja(b), { n: b.getAttribute('aria-label') || b.textContent.trim() }));
  const nombre = caja(fila.querySelector('.pace-cb-nombre'));
  fila.scrollIntoView({ block: 'center' });
  const tapado = [...fila.querySelectorAll('button')].filter((b) => {
    const r = b.getBoundingClientRect();
    const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !(e && (e === b || b.contains(e)));
  }).map((b) => b.getAttribute('aria-label'));
  let hueco = Infinity;
  botones.forEach((a) => botones.forEach((b) => {
    if (a === b || Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) < 4 || b.x0 < a.x1 - 0.5) return;
    hueco = Math.min(hueco, b.x0 - a.x1);
  }));
  return { botones, nombre, tapado, hueco: Math.round(hueco) };
}));

test('a 360 px, botones de 40 con aire, y la «×» en la línea del nombre, lejos de las flechas', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirConstructor(page);
  for (const p of await medir(page)) {
    for (const b of p.botones) {
      expect(Math.round(b.w), `«${b.n}» mide ${Math.round(b.w)} de ancho`).toBeGreaterThanOrEqual(40);
      expect(Math.round(b.h), `«${b.n}» mide ${Math.round(b.h)} de alto`).toBeGreaterThanOrEqual(40);
    }
    expect(p.hueco, 'dos botones de la misma línea, demasiado juntos').toBeGreaterThanOrEqual(8);
    expect(p.tapado, 'algún botón tapa a otro').toEqual([]);
    const quitar = p.botones.find((b) => b.n === 'Quitar');
    const menos = p.botones.find((b) => b.n === '−5 s');
    const bajar = p.botones.find((b) => b.n === 'Bajar');
    const medio = (c) => (c.y0 + c.y1) / 2;
    expect(Math.abs(medio(quitar) - medio(p.nombre)), 'la «×» no va en la línea del nombre').toBeLessThan(20);
    expect(quitar.y1, 'la «×» no va por encima del tiempo').toBeLessThanOrEqual(menos.y0);
    expect(bajar.y0 - quitar.y1, 'la «×» sigue pegada a «↓»').toBeGreaterThanOrEqual(6);
  }
  expect(errores).toEqual([]);
});

test('a 1280 px con ratón, como antes: los seis en una línea y de 24', async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirConstructor(page);
  for (const p of await medir(page)) {
    const altos = new Set(p.botones.map((b) => Math.round(b.y0)));
    expect(altos.size, 'los botones no van en una línea').toBe(1);
    for (const b of p.botones) expect(Math.round(b.w)).toBe(24);
    expect(p.tapado).toEqual([]);
  }
});
