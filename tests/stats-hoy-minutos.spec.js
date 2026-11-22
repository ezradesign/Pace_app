/* PACE · E2E · ESTADÍSTICAS › HOY DICE LOS MINUTOS DE LA RUTINA, COMO LA LÍNEA DEL DÍA (Ez, 2A del 22 nov. 2026)
 * ============================================================================================================
 * Caza web del 22 nov.: para la misma pausa, la línea del día decía «Empuje sencillo · 2 min · Mueve» y la
 * columna «Dos minutos de Mueve», y Estadísticas › Hoy, «12:05 · 5 min» (los del hueco). Ahora, las pausas por
 * llegar dicen los minutos de su rutina; la larga, los suyos (15). Contra main cae: «5 min».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const HOY = '2026-10-14';
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

test('las pausas por llegar dicen los minutos de la línea; la larga, los suyos', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: HORARIO, dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
  await page.clock.install({ time: new Date(HOY + 'T11:20:00+02:00') });
  await irAlArtefacto(page);
  /* Lo que dice la línea de cada pausa, por su hora: «12:05» → «2 min», y la larga «15 min». */
  const linea = await page.evaluate(() => {
    const p = ritmoPlan(getState());
    return p.m.items.filter((it) => it.tipo === 'pausa' && it.desde >= ritmoAhoraExacto())
      .map((it) => [ritmoHora(it.desde), (it.larga ? it.dur : it.platos[0].min) + ' min', it.dur]);
  });
  expect(linea.length, 'GUARD: sin pausas por llegar').toBeGreaterThan(3);
  expect(linea.some(([, m, dur]) => m !== dur + ' min'), 'GUARD: ninguna rutina dura menos que su hueco').toBe(true);
  await page.locator('[data-pace-topbar-stats]').click();
  const tarjetas = page.locator('[data-pace-hoy-view="menu"] [data-pace-hoy-parada="luego"]');
  await expect(tarjetas.first()).toBeVisible();
  const vistas = await tarjetas.locator('.pace-sh-m').allTextContents();
  for (const [hora, min] of linea) {
    expect(vistas, 'la pausa de las ' + hora + ' no dice «' + min + '»').toContain(hora + ' · ' + min);
  }
});
