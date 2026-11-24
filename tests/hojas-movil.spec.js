/* PACE · E2E · EN EL MÓVIL, TODAS LAS VENTANAS SON LA MISMA HOJA DESDE ABAJO (M5A y M12A, 24 nov. 2026)
 * =====================================================================================================
 * Revisión visual: cada ventana del móvil se abría a su manera (tarjeta flotante a 12 px de los bordes, y
 * Ajustes sin velo). Ez eligió M5A: pegadas abajo y a los lados, esquinas de arriba de 20 px, el asa y el
 * mismo velo, que en Ajustes cierra al tocarlo. Y M12A: «Pausar» y «Terminar» de Respira con iconos de
 * trazo, no con los signos de texto ❚❚ y ▶|.
 *
 * Contra la 0.220.0 cae: Estadísticas y Logros quedaban a 12 px del borde de abajo con radio de 12, Ajustes
 * no tenía velo y el reproductor pintaba los signos.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.use({ viewport: { width: 360, height: 718 } });

const hoja = (page, sel) => page.evaluate((s) => {
  const c = [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().height > 0).pop();
  if (!c) return null;
  const r = c.getBoundingClientRect(); const cs = getComputedStyle(c);
  const asa = getComputedStyle(c, '::before');
  return {
    abajo: Math.round(window.innerHeight - r.bottom), izq: Math.round(r.left), der: Math.round(window.innerWidth - r.right),
    radio: cs.borderTopLeftRadius, radioAbajo: cs.borderBottomLeftRadius, asa: asa.content !== 'none' && asa.width === '36px',
  };
}, sel);

async function esperarQuieta(page) { await page.waitForTimeout(450); }

test('Estadísticas, Logros y Ajustes: pegadas abajo, radio de 20 arriba, asa; Ajustes con velo que cierra', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  for (const tecla of ['s', 'l']) {
    await page.keyboard.press(tecla);
    await expect(page.locator('[data-pace-modal-card]')).toBeVisible();
    await esperarQuieta(page);
    expect(await hoja(page, '[data-pace-modal-card]'), 'la ventana de «' + tecla + '»')
      .toEqual({ abajo: 0, izq: 0, der: 0, radio: '20px', radioAbajo: '0px', asa: true });
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-pace-modal-card]')).toHaveCount(0);
  }
  await page.keyboard.press('t');
  await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
  await esperarQuieta(page);
  expect(await hoja(page, '[data-pace-tweaks-panel]'))
    .toEqual({ abajo: 0, izq: 0, der: 0, radio: '20px', radioAbajo: '0px', asa: true });
  const velo = page.locator('[data-pace-tweaks-velo]');
  await expect(velo).toBeVisible();
  await page.mouse.click(180, 20);
  await expect(page.locator('[data-pace-tweaks-panel]')).toHaveCount(0);
});

test('en el ordenador, Ajustes sigue sin velo y las ventanas centradas', async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await sembrar(context);
  await irAlArtefacto(page);
  await page.keyboard.press('t');
  await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
  await expect(page.locator('[data-pace-tweaks-velo]')).toBeHidden();
  await page.keyboard.press('t');
  await page.keyboard.press('s');
  await esperarQuieta(page);
  const h = await hoja(page, '[data-pace-modal-card]');
  expect(h.abajo).toBeGreaterThan(20);
  expect(h.asa).toBe(false);
});

test('Respira: «Pausar», «Reanudar» y «Terminar» con iconos de trazo y su nombre sin signos', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.locator('button:visible', { hasText: 'ritmo, calma' }).first().click();
  await page.locator('button:visible, [role=button]:visible', { hasText: /^Coherente 5·5/ }).first().click();
  await page.locator('button:visible', { hasText: /^Empezar ahora/ }).last().click();
  const pausar = page.getByRole('button', { name: 'Pausar' });
  await expect(pausar).toBeVisible({ timeout: 8000 });
  await expect(pausar.locator('svg[data-pace-icono-trazo="❚❚"]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Terminar' }).locator('svg[data-pace-icono-trazo="▶|"]')).toHaveCount(1);
  expect(await pausar.innerText()).not.toMatch(/[❚▶]/);
  await pausar.click();
  const seguir = page.getByRole('button', { name: 'Reanudar' });
  await expect(seguir.locator('svg[data-pace-icono-trazo="▶"]')).toHaveCount(1);
  await expect(seguir).toHaveAttribute('title', 'Reanudar');
});
