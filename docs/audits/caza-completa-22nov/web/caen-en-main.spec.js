/* PACE · caza web del 22 nov. 2026 · las pruebas de lo que espera a Ez
 * Caen en main (0.214.0) y describen la opción recomendada de cada hallazgo. No están en tests/ a
 * propósito: lo que muestran depende de una decisión de Ez. Para correrlas, copiar a tests/. */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const HOY = '2026-10-14';
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+02:00');
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

/* H1 · Elegida la jornada a las 14:20, en plena comida (la B de Ez del 22 oct.: «la comida hasta
   las 15:00 y el foco desde entonces»), la línea pone «AHORA» detrás de la comida y el aro ofrece
   «Empezar jornada» de 45 min, que se come la comida (queda c14:20+0). */
test('H1 · en plena comida, «Ahora» va en la comida y el botón del aro no se la come', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: HORARIO, dia: { fecha: HOY, opcion: 'jornada', desde: 860, cicloBase: 0, cambios: {} } } });
  await page.clock.install({ time: a('14:20') });
  await irAlArtefacto(page);
  await page.waitForTimeout(400);
  const texto = await page.locator('[data-pace-ritmo-linea]').filter({ visible: true }).first().innerText();
  expect(texto.indexOf('AHORA'), '«AHORA» va detrás de la comida: ' + texto.replace(/\s+/g, ' ').slice(0, 80))
    .toBeLessThan(texto.indexOf('Comida'));
  await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
  await page.waitForTimeout(400);
  const comida = await page.evaluate(() => ritmoPlan(getState()).m.items.find((it) => it.tipo === 'comida'));
  expect(comida && comida.dur, 'el botón del aro se comió la comida').toBeGreaterThan(0);
});

/* H2 · Estadísticas › Hoy pone los minutos del hueco (5 min) y la línea del día y la columna, los de la
   rutina (2 min) para la misma pausa. */
test('H2 · Estadísticas › Hoy dice los mismos minutos que la línea del día', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: HORARIO, dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
  await page.clock.install({ time: a('11:20') });
  await irAlArtefacto(page);
  const enLinea = await page.locator('[data-pace-ritmo-linea]').filter({ visible: true }).first().innerText();
  const min = (enLinea.match(/(\d+)\s*MIN/i) || [])[1];   // la primera pausa de la línea: «2 MIN · MUEVE»
  expect(min, 'GUARD: la parada no dice sus minutos: ' + enLinea).toBeTruthy();
  await page.locator('[data-pace-topbar-stats]').click();
  const tarjeta = page.locator('[data-pace-hoy-parada]').first();
  await expect(tarjeta).toContainText(min + ' min');
});
