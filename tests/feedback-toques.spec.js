/* PACE · E2E · LOS PORQUÉS DEL «NO» SE PUEDEN TOCAR (recorrido de tester, 18 nov. 2026)
 * =====================================================================================
 * En el móvil, tras contestar «No», «Aquí no podía · Difícil · Me molestó» y «Deshacer» medían 22 y
 * 20 px de alto (Difícil, 37 × 22): por debajo de los 24 × 24 px que pide WCAG 2.5.8 para tocar sin
 * acertar al vecino. Siguen pareciendo enlaces de texto; solo crece la zona que se toca.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const JUEVES = new Date('2026-09-17T10:20:00+02:00');
const RUTINA = 'breathe.physiological';

test('a 360 px, cada porqué y «Deshacer» miden 24 px o más de alto y de ancho', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await sembrar(context, { ritmo: { libre: '2026-09-17' } });
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await page.evaluate((id) => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: id } })), RUTINA);
  const fb = page.locator('[data-pace-session-feedback]');
  for (let s = 0; s < 60 && !(await fb.count()); s++) { await page.clock.fastForward(5000); await page.waitForTimeout(20); }
  await expect(page.locator('[data-pace-fb-question]'), 'GUARD: el cierre pregunta «¿Te ayudó?»').toBeVisible();
  await page.locator('[data-pace-fb-chip]').nth(2).click();
  await expect(page.locator('[data-pace-fb-porque]'), 'GUARD: salen los porqués').toBeVisible();
  const medidas = await page.evaluate(() => [...document.querySelectorAll('[data-pace-fb-razon], [data-pace-fb-deshacer]')]
    .map((b) => { const r = b.getBoundingClientRect(); return { que: b.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height) }; }));
  expect(medidas.length, 'GUARD: tres porqués y «Deshacer»').toBe(4);
  expect(medidas.filter((m) => m.w < 24 || m.h < 24)).toEqual([]);
});
