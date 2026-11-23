/* PACE · tests/sidebar-nombres.spec.js (23 nov. 2026, caza de la barra lateral)
   ==================================================
   Lo que la barra dice a quien no la ve, o a quien pasa el ratón:

   · El bloque de la semana es UN botón, y su nombre accesible era solo «Ver la semana en
     Estadísticas»: el lector de pantalla y el control por voz no oían la racha («3 días seguidos · tu mejor, 9»), que es lo
     único escrito del bloque. El nombre lleva ahora lo que se ve (WCAG 2.5.3).
   · El botón de plegar decía «Colapsar (⌘\)» y ese atajo no existe: nadie escucha esa tecla,
     y en Windows ni siquiera hay ⌘. El título ya no promete nada.

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

test('plegar la barra no promete un atajo que no existe', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const plegar = page.locator('[data-pace-sidebar-toggle]');
  const titulos = [await plegar.getAttribute('title')];
  await page.evaluate(() => window.setState({ lang: 'en' }));
  await expect(page.locator('[data-pace-semana]')).toHaveAttribute('title', 'See the week in Stats');
  titulos.push(await plegar.getAttribute('title'));
  expect(titulos).toEqual(['Colapsar', 'Collapse']);
  /* Y la tecla que prometía, de verdad, no hace nada: si un día se monta el atajo, esta prueba
     cambia con él y el título vuelve a decirlo. */
  await page.keyboard.press('Control+Backslash');
  await page.keyboard.press('Meta+Backslash');
  await expect(page.locator('[data-pace-sidebar]')).toBeVisible();
});
