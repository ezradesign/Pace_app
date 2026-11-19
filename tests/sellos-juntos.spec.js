/* PACE · E2E · LOS SELLOS, JUNTOS Y CON UNA CAMPANITA (Ez, 1A del 18 nov. 2026)
 * =============================================================================
 * El tester vio sonar cuatro sellos en diez segundos tras la primera pausa, uno detrás de otro
 * con su campanita, y alguno llegar horas tarde: «Curiosidad», ganado a las 9:43 al abrir los
 * Ajustes, salió a las 16:58, porque cada cierre de sesión anunciaba uno solo. Ez eligió la A:
 *   · los que salen a la vez, en un aviso: «3 sellos nuevos · Primer paso y dos más», con UNA campanita;
 *   · salen al ganarlos (en cuanto no hay nada abierto encima), salvo en un Foco: esos, al acabarlo;
 *   · si llevan más de 15 min esperando, salen sin sonido.
 * El sonido se mira envolviendo `playSound`, la puerta de todos (ToastHost lo llama por su nombre).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const aviso = (page) => page.locator('div[aria-live="polite"][aria-atomic="true"]');
const oir = (page) => page.evaluate(() => {
  window.__campanas = [];
  const original = window.playSound;
  window.playSound = function (k) { if (/^achievement/.test(String(k))) window.__campanas.push(k); try { return original.apply(this, arguments); } catch (e) {} };
});
const campanas = (page) => page.evaluate(() => window.__campanas.length);

test.use({ viewport: { width: 360, height: 718 }, isMobile: true, hasTouch: true });

test('tres sellos a la vez salen en un aviso, con una campanita', async ({ page, context }) => {
  await sembrar(context, { sidebarCollapsed: true });
  await irAlArtefacto(page);
  await oir(page);
  await page.evaluate(() => ['first.step', 'first.sip', 'secret.zen'].forEach((id) => showToast({ id, type: 'achievement' })));
  const sello = page.locator('[data-pace-sello-aro]');
  await expect(sello).toHaveCount(1);
  await expect(sello).toHaveText('3 sellos nuevos · Primer paso y dos más');
  /* Cabe entero: la letra encoge antes de cortar nada. */
  expect(await sello.locator('[data-pace-sello-texto]').evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
  /* Y no sale otro detrás. */
  await page.waitForTimeout(4500);
  await expect(sello).toHaveCount(0);
  expect(await campanas(page)).toBe(1);
});

test('en inglés: «3 new stamps · First step and two more»', async ({ page, context }) => {
  await sembrar(context, { sidebarCollapsed: true, lang: 'en' });
  await irAlArtefacto(page);
  await page.evaluate(() => ['first.step', 'first.sip', 'secret.zen'].forEach((id) => showToast({ id, type: 'achievement' })));
  await expect(page.locator('[data-pace-sello-aro]')).toHaveText('3 new stamps · First step and two more');
});

test('«Curiosidad» sale al cerrar los Ajustes, sin esperar a una sesión', async ({ page, context }) => {
  await sembrar(context, { sidebarCollapsed: true });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => !!getState().achievements['explore.tweaks'])).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-pace-tweaks-panel]')).toHaveCount(0);
  await expect(aviso(page)).toContainText('Curiosidad', { timeout: 3000 });
});

test('lo ganado en un Foco espera a que acabe, y sale junto con lo del Foco', async ({ page, context }) => {
  await sembrar(context, { sidebarCollapsed: true, focusMinutes: 15, ejercicioBloques: 'cada' });
  const aLasDiez = new Date(); aLasDiez.setHours(10, 0, 0, 0);
  await page.clock.install({ time: aLasDiez });
  await irAlArtefacto(page);
  await oir(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await page.waitForTimeout(250);
  await page.evaluate(() => addWaterGlass());
  await expect.poll(() => page.evaluate(() => !!getState().achievements['first.sip'])).toBe(true);
  await page.waitForTimeout(1500);
  expect(await aviso(page).textContent(), 'el sello sale en mitad del Foco').not.toContain('sello');
  for (let i = 0; i < 20; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  await page.getByRole('button', { name: 'Ahora no', exact: true }).click();
  await expect(aviso(page)).toContainText('2 sellos nuevos');
  await expect(aviso(page)).toContainText('y uno más');
  expect(await campanas(page)).toBe(1);
});

test('si llevan más de 15 min esperando, salen sin sonido; si no, con él', async ({ page, context }) => {
  const ahora = Date.now();
  await sembrar(context, { sidebarCollapsed: true,
    achievements: { 'first.sip': { unlockedAt: ahora - 20 * 60 * 1000 }, 'first.step': { unlockedAt: ahora - 5 * 60 * 1000 } },
    achievementQueue: ['first.sip'] });
  await irAlArtefacto(page);
  await oir(page);
  await page.evaluate(() => flushAchievementToast());
  await expect(page.locator('[data-pace-sello-aro]')).toHaveText('Nuevo sello · Primer sorbo');
  expect(await campanas(page), 'sonó un sello de hace 20 min').toBe(0);
  await expect(page.locator('[data-pace-sello-aro]')).toHaveCount(0, { timeout: 5000 });
  await page.evaluate(() => { setState({ achievementQueue: ['first.step'] }); flushAchievementToast(); });
  await expect(page.locator('[data-pace-sello-aro]')).toHaveText('Nuevo sello · Primer paso');
  expect(await campanas(page), 'no sonó un sello de hace 5 min').toBe(1);
});
