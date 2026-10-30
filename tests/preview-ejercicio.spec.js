/* PACE · E2E · MIRAR UN EJERCICIO ANTES DE DARLE A EMPEZAR (Ez, 30 oct. 2026: 4B)
 * ==============================================================================
 * P4 de las revisiones de ChatGPT del 28 oct.: «Antes de empezar» enseñaba los pasos con su dibujo
 * pequeño, pero para saber cómo se hacen había que empezar, con el reloj en marcha. Ez eligió la
 * 4B mirando la app real: cada paso es un botón con su «›», y al tocarlo la MISMA ventana enseña
 * ese ejercicio, con el dibujo grande y sus tres textos (Colócate, Qué haces, Cuidado), los mismos
 * que salen durante la rutina. «‹ Los pasos» vuelve. No cuenta ni empieza nada.
 *
 * Contra la 0.187.0 cae entera: los pasos no eran botones.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

async function abrir(page, context, lang, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  await sembrar(context, { lang: lang || 'es', langAuto: false });
  await irAlArtefacto(page);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: 'extra.legs.standing' } })));
  await expect(page.locator('[data-pace-modal-card] [data-pace-preview-paso]').first()).toBeVisible();
}

test('cada paso se puede mirar: la ventana enseña cómo se hace y «Los pasos» vuelve, sin empezar nada', async ({ page, context }) => {
  await abrir(page, context);
  const pasos = page.locator('[data-pace-preview-paso]');
  await expect(pasos).toHaveCount(2);
  await expect(pasos.first()).toHaveAccessibleName('Cómo se hace: Elevación de puntas');
  await pasos.first().click();

  const ej = page.locator('[data-pace-preview-ejercicio]');
  await expect(ej).toBeVisible();
  await expect(page.locator('[data-pace-modal-title]')).toHaveText('Elevación de puntas');
  await expect(ej.locator('[data-pace-preview-texto="setup"]')).toHaveText('Espalda y glúteos en la pared, pies al ancho de las caderas, talones a un palmo de ella.');
  await expect(ej.locator('[data-pace-preview-texto="action"]')).toHaveText('Sube las puntas de los pies hacia las espinillas. Bájalas despacio.');
  await expect(ej.locator('[data-pace-preview-texto="care"]')).toHaveText('Movimiento pequeño, sin balancearte hacia atrás.');
  await expect(ej).toContainText('Colócate');
  await expect(ej).toContainText('Qué haces');
  await expect(ej).toContainText('Cuidado');
  await expect(page.locator('[data-pace-modal-card] [data-pace-cta]'), 'sin «Empezar» al mirar').toHaveCount(0);
  await page.waitForTimeout(1200);
  await expect(page.locator('[data-pace-session-root]'), 'mirar no empieza nada').toHaveCount(0);

  const volver = page.locator('[data-pace-preview-volver]');
  await expect(volver).toBeFocused();
  await volver.click();
  await expect(ej).toHaveCount(0);
  await expect(page.locator('[data-pace-modal-title]')).toHaveText('Piernas sin pasos');
  await expect(pasos.first(), 'el foco vuelve al paso que se miró').toBeFocused();
  await expect(page.getByRole('button', { name: 'Empezar', exact: true })).toBeVisible();
});

test('con el teclado: Enter en un paso lo abre y Enter en «Los pasos» vuelve', async ({ page, context }) => {
  await abrir(page, context);
  await page.locator('[data-pace-preview-paso]').nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-pace-modal-title]')).toHaveText('Silla en la pared');
  await expect(page.locator('[data-pace-preview-texto="action"]')).toHaveText('Desliza un poco hacia abajo y quédate. Respira sin aguantar el aire.');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-pace-preview-ejercicio]')).toHaveCount(0);
  await expect(page.locator('[data-pace-preview-paso]').nth(1)).toBeFocused();
});

test('en inglés, los textos del ejercicio en inglés', async ({ page, context }) => {
  await abrir(page, context, 'en');
  await expect(page.locator('[data-pace-preview-paso]').first()).toHaveAccessibleName('How it’s done: Tibialis raise');
  await page.locator('[data-pace-preview-paso]').first().click();
  await expect(page.locator('[data-pace-modal-title]')).toHaveText('Tibialis raise');
  await expect(page.locator('[data-pace-preview-texto="setup"]')).toHaveText('Back and glutes against the wall, feet hip-width apart, heels about a hand span from it.');
  await expect(page.locator('[data-pace-preview-volver]')).toHaveText('The steps');
});

for (const lang of ['es', 'en']) {
  test('el ejercicio cabe sin scroll a 360 × 640 (' + lang + ')', async ({ page, context }) => {
    await abrir(page, context, lang, { width: 360, height: 640 });
    await page.locator('[data-pace-preview-paso]').first().click();
    await expect(page.locator('[data-pace-preview-ejercicio]')).toBeVisible();
    const m = await page.evaluate(() => {
      const c = document.querySelector('[data-pace-modal-card]');
      const r = c.getBoundingClientRect();
      return { scroll: c.scrollHeight - c.clientHeight, fuera: Math.max(0, Math.round(r.bottom - window.innerHeight), Math.round(-r.top)) };
    });
    expect(m).toEqual({ scroll: 0, fuera: 0 });
  });
}
