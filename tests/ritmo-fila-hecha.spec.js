/* PACE · E2E · «HECHA» EN LA FILA DE LA PAUSA YA HECHA (Ez, 10A del 18 nov. 2026)
 * ================================================================================
 * En el móvil, la fila «Ahora» de la pausa abierta seguía con «Otra» después de hacerla
 * («Ahora · Empuje sencillo · OTRA»): parecía que aún tocaba. Ez eligió la A: «hecha», sin «Otra».
 * Sin hacer, la fila sigue igual. Jueves 15 oct. a las 13:16, cinco bloques y la pausa de las 13:15
 * abierta (como tests/ritmo-pausa-minutos-hechos.spec.js).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const JUEVES = new Date('2026-10-15T13:16:00+02:00');
const semilla = (estados, lang) => ({
  cycle: 5, lastActiveDay: 'Thu Oct 15 2026', soundOn: false, sidebarCollapsed: true, lang: lang || 'es',
  _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
  achievements: { 'first.step': { unlockedAt: 1 } },
  ritmo: { dia: { fecha: '2026-10-15', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pausa: 5, estados } },
});
const ahora = (page) => page.locator('.pace-rt-fila').filter({ visible: true }).first();

test.use({ viewport: { width: 360, height: 718 }, isMobile: true, hasTouch: true });

for (const [lang, rotulo, hecha] of [['es', 'Ahora', 'hecha'], ['en', 'Now', 'done']]) {
  test(`${lang}: la pausa de ahora ya hecha dice «${hecha}» y no ofrece «Otra»`, async ({ page, context }) => {
    await sembrar(context, semilla({ 1: 'hecha', 2: 'hecha', 3: 'hecha', 4: 'saltada', 5: 'hecha' }, lang));
    await page.clock.install({ time: JUEVES });
    await irAlArtefacto(page);
    const fila = ahora(page);
    await expect(fila).toContainText(rotulo);
    await expect(fila.locator('[data-pace-ritmo-hecha]')).toHaveText(hecha);
    await expect(fila.locator('[data-pace-ritmo-otra]')).toHaveCount(0);
  });
}

test('sin hacer, la fila de la pausa sigue con «Otra»', async ({ page, context }) => {
  await sembrar(context, semilla({ 1: 'hecha', 2: 'hecha', 3: 'hecha', 4: 'saltada' }));
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  const fila = ahora(page);
  await expect(fila).toContainText('Ahora');
  await expect(fila.locator('[data-pace-ritmo-otra]')).toHaveCount(1);
  await expect(fila.locator('[data-pace-ritmo-hecha]')).toHaveCount(0);
});
