/* PACE · E2E · «VER TODO», PARA QUIEN NO CONOCE PACE (Ez, 10A del 18 nov. 2026)
 * ==============================================================================
 * En la hoja de «Ver todo» del día servido, «6 de 8 vasos» se leía como «te faltan dos» y el
 * contexto («Junto a la mesa», «Sin material…») iba en píldoras con borde, como botones que no
 * hacen nada. Ez eligió la A: «6 vasos en la jornada» y el contexto en una línea sin borde.
 * El resumen de la cabecera del escritorio sigue con «6 de 8»: lo cuenta frente a tu meta.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
test.use({ viewport: { width: 360, height: 718 }, isMobile: true, hasTouch: true });

for (const [lang, frase] of [['es', ' vasos en la jornada'], ['en', ' glasses over the day']]) {
  test(`${lang}: la hoja dice los vasos de la jornada y el contexto va sin borde`, async ({ page, context }) => {
    await sembrar(context, { sidebarCollapsed: true, lang,
      ritmo: { horario: H, dia: { fecha: '2026-10-14', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
    await page.clock.install({ time: new Date('2026-10-14T09:00:00+02:00') });
    await irAlArtefacto(page);
    const vasos = await page.evaluate(() => ritmoPlan(getState()).m.vasos);
    await page.locator('[data-pace-ritmo-ver]').filter({ visible: true }).first().click();
    const hoja = page.locator('[data-pace-modal-card]');
    await expect(hoja).toContainText(vasos + frase);
    await expect(hoja).not.toContainText(' de 8 vasos');
    const ctx = hoja.locator('[data-pace-ritmo-ctx]');
    await expect(ctx).toBeVisible();
    const bordes = await ctx.evaluate((el) => [el, ...el.querySelectorAll('*')].map((x) => parseFloat(getComputedStyle(x).borderTopWidth) || 0));
    expect(Math.max(...bordes), 'el contexto parece un botón').toBe(0);
  });
}
