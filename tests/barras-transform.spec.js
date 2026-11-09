/* PACE · las barras que avanzan cada segundo se mueven con transform
 * ==================================================================
 * Una transición de `width` rehace la maqueta y la pintura en cada fotograma: en un móvil lento
 * (360 px, CPU 4×) Respira tenía 31 fotogramas lentos de cada 6 s, 13 sin ella. El relleno ahora
 * ocupa todo el ancho y se desplaza con `transform` (`rellenoDeBarra`, ui/Primitives.jsx), y el
 * padre recorta. Lo que defiende:
 *  1. Durante Respira no hay viva ninguna transición de `width`, y el relleno anima `transform`.
 *  2. La barra se VE igual: lo visible del relleno mide progreso × ancho del carril.
 *  3. Censo: ninguna barra del código vuelve a `width 1s linear` (Foco en barra, Mueve y los dos runners).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test('Respira · la barra avanza con transform y mide lo mismo que su progreso', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await page.getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).first().click();
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(page.locator('[data-pace-breathe-phase]')).toBeVisible();
  /* De 1 s en 1 s: la sesión necesita un render entre ticks (respira-progreso). */
  for (let i = 0; i < 12; i++) await page.clock.fastForward(1000);

  const m = await page.evaluate(() => {
    const barra = document.querySelector('[data-pace-breathe-progress]');
    const relleno = barra && barra.querySelector('[data-pace-relleno]');
    if (!relleno) return null;
    const anchos = document.getAnimations()
      .filter(a => a.transitionProperty === 'width').length;
    const enMarcha = document.getAnimations()
      .filter(a => a.effect && a.effect.target === relleno).map(a => a.transitionProperty);
    /* Al final de la transición, que es lo que se ve quieto. */
    document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} });
    const carril = relleno.parentElement.getBoundingClientRect();
    const r = relleno.getBoundingClientRect();
    const visible = Math.max(0, Math.min(r.right, carril.right) - Math.max(r.left, carril.left));
    return {
      anchos, enMarcha,
      transicion: getComputedStyle(relleno).transitionProperty,
      recorta: getComputedStyle(relleno.parentElement).overflow,
      progreso: Number(barra.getAttribute('data-pace-breathe-progress')),
      visible, carril: carril.width,
    };
  });
  expect(m, 'no hay barra continua en Suspiro fisiológico').not.toBeNull();
  expect(m.progreso, 'GUARD: la sesión no avanzó y la barra no mide nada').toBeGreaterThan(0.02);
  expect(m.anchos, 'una transición de width está viva durante Respira').toBe(0);
  expect(m.transicion, 'el relleno no anima transform').toBe('transform');
  expect(m.recorta, 'el carril no recorta: el relleno se vería entero').toBe('hidden');
  expect(Math.abs(m.visible - m.progreso * m.carril), 'la parte visible no es progreso × carril')
    .toBeLessThanOrEqual(0.6);
});

test('censo · ninguna barra de progreso vuelve a animar width cada segundo', () => {
  const raiz = path.join(__dirname, '..', 'app');
  const malos = [];
  const recorrer = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) recorrer(p);
      else if (/\.(jsx|js)$/.test(e.name) && /width 1s linear/.test(fs.readFileSync(p, 'utf8'))) malos.push(path.relative(raiz, p));
    }
  };
  recorrer(raiz);
  expect(malos, 'usa rellenoDeBarra (ui/Primitives.jsx): width rehace la página en cada fotograma').toEqual([]);
});
