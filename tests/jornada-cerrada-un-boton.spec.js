/* PACE · E2E · LA JORNADA CERRADA, CON UN SOLO «POR LIBRE» (Ez, 5A del 18 nov. 2026)
 * ==================================================================================
 * En el recorrido de tester, con la jornada cerrada salían a la vez «Seguir por libre» en el aro y «HOY VOY POR
 * LIBRE» en la tarjeta: dos botones casi iguales. Se queda el del aro; la tarjeta, con «Cambiar».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const MARTES = new Date('2026-11-24T17:40:00+01:00');

for (const [ancho, alto] of [[360, 740], [1280, 800]]) {
  test('a ' + ancho + ' px, la tarjeta cerrada no lleva «Hoy voy por libre» y el aro sí lleva «Seguir por libre»', async ({ page, context }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await sembrar(context, { cycle: 2, lastActiveDay: 'Tue Nov 24 2026', soundOn: false,
      ritmo: { dia: { fecha: '2026-11-24', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, estados: { 1: 'hecha' } } } });
    await page.clock.install({ time: MARTES });
    await irAlArtefacto(page);
    const tarjeta = page.locator('[data-pace-ritmo-estado="hecho"]').filter({ visible: true });
    await expect(tarjeta, 'GUARD: la jornada está cerrada').toHaveCount(1);
    await expect(tarjeta.getByRole('button', { name: 'Cambiar' })).toBeVisible();
    await expect(tarjeta.getByRole('button', { name: /Hoy voy por libre/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Seguir por libre' }).filter({ visible: true })).toHaveCount(1);
  });
}
