/* PACE · tests/sidebar-nombres.spec.js (23 nov. 2026, caza de la barra lateral)
   ==================================================
   Lo que la barra dice a quien no la ve, o a quien pasa el ratón:

   · El bloque de la semana es UN botón, y su nombre accesible era solo «Ver la semana en
     Estadísticas»: el lector de pantalla y el control por voz no oían la racha («3 días seguidos · tu mejor, 9»), que es lo
     único escrito del bloque. El nombre lleva ahora lo que se ve (WCAG 2.5.3).
   · El botón de plegar decía «Colapsar (⌘\)» y nadie escuchaba esa tecla. Con la 5A de Ez (23 nov.),
     Ctrl + \ (⌘ + \ en el Mac) pliega y despliega la barra, y los títulos lo dicen con la tecla de
     cada sistema; no salta mientras escribes, con una sesión delante ni en el cajón del móvil.

   NO CUBRE: cómo se ve, que no cambia. */
'use strict';
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const ABIERTA = {
  sidebarCollapsed: false,
  lastActiveDay: new Date().toDateString(),
  _historyMigrated: true,
  _weeklyStatsReindexed_v0_28_8: true,
  _historyRecalculated_v0_28_8: true,
  streak: { current: 3, longest: 9, lastDay: new Date().toDateString() },
};

for (const [lang, racha, abre] of [
  ['es', '3 días seguidos · tu mejor, 9', 'Ver la semana en Estadísticas'],
  ['en', '3 days in a row · your best, 9', 'See the week in Stats'],
]) {
  test('la semana se nombra con la racha que se ve (' + lang + ')', async ({ page, context }) => {
    await sembrar(context, Object.assign({}, ABIERTA, { lang }));
    await irAlArtefacto(page);
    const semana = page.locator('[data-pace-semana]');
    await expect(semana).toContainText(racha);
    await expect(semana).toHaveAttribute('aria-label', racha + '. ' + abre);
    await expect(page.getByRole('button', { name: racha + '. ' + abre })).toHaveCount(1);
  });
}

test('sin racha, la semana se nombra por lo que hace', async ({ page, context }) => {
  await sembrar(context, Object.assign({}, ABIERTA, { streak: { current: 0, longest: 0, lastDay: null } }));
  await irAlArtefacto(page);
  await expect(page.locator('[data-pace-semana]')).toHaveAttribute('aria-label', 'Ver la semana en Estadísticas');
});

/* 5A de Ez (23 nov. 2026): Ctrl + \ (⌘ + \ en el Mac) pliega y despliega la barra. */
test('Ctrl + \\ pliega y despliega la barra, y los títulos lo dicen', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const barra = page.locator('[data-pace-sidebar]');
  const asa = page.locator('[data-pace-sidebar-open]');
  await expect(page.locator('[data-pace-sidebar-toggle]')).toHaveAttribute('title', 'Colapsar (Ctrl + \\)');

  await page.keyboard.press('Control+Backslash');
  await expect(barra).toHaveCount(0);
  await expect(asa).toHaveAttribute('title', 'Abrir panel (Ctrl + \\)');
  await page.keyboard.press('Control+Backslash');
  await expect(barra).toBeVisible();
  /* ⌘ también, y con AltGr (Ctrl + Alt en Windows), que es como sale «\» en un teclado español. */
  await page.keyboard.press('Meta+Backslash');
  await expect(barra).toHaveCount(0);
  await page.keyboard.press('Control+Alt+Backslash');
  await expect(barra).toBeVisible();

  await page.evaluate(() => window.setState({ lang: 'en' }));
  await expect(page.locator('[data-pace-sidebar-toggle]')).toHaveAttribute('title', 'Collapse (Ctrl + \\)');
});

test('el atajo no salta mientras escribes ni con una sesión delante', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const barra = page.locator('[data-pace-sidebar]');
  await page.evaluate(() => {
    const i = document.createElement('input');
    i.setAttribute('data-prueba-campo', '');
    document.body.appendChild(i);
    i.focus();
  });
  await page.keyboard.press('Control+Backslash');
  await expect(barra, 'escribiendo').toBeVisible();
  await page.evaluate(() => { document.querySelector('[data-prueba-campo]').remove(); document.body.focus(); });

  /* Con una sesión delante: la marca que pone el centro de sesión (la misma guarda que T, S y L en main.jsx). */
  await page.evaluate(() => { const d = document.createElement('div'); d.setAttribute('data-pace-session-root', ''); document.body.appendChild(d); });
  await page.keyboard.press('Control+Backslash');
  await expect(barra, 'con una sesión delante').toBeVisible();
  await page.evaluate(() => document.querySelector('[data-pace-session-root]').remove());
  await page.keyboard.press('Control+Backslash');
  await expect(barra, 'sin ella, sí').toHaveCount(0);
});

test('en el Mac los títulos dicen ⌘ + \\', async ({ page, context }) => {
  await context.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'platform', { get: () => 'MacIntel', configurable: true });
    Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => undefined, configurable: true });
  });
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await expect(page.locator('[data-pace-sidebar-toggle]')).toHaveAttribute('title', 'Colapsar (⌘ + \\)');
});

test('en el cajón del móvil el atajo no hace nada', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await page.keyboard.press('Control+Backslash');
  await expect(page.locator('[data-pace-sidebar]')).toHaveCount(0);
  await expect(page.locator('[data-pace-sidebar-open]')).toBeVisible();
});
