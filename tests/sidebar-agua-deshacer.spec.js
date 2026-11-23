/* PACE · tests/sidebar-agua-deshacer.spec.js (Ez, 2A del 23 nov. 2026)
   ==================================================
   Un vaso de más se deshace desde la barra. La fila del agua entera suma, así que un toque sin
   querer es fácil, y quitarlo pedía encontrar Hidrátate. Durante cinco segundos tras sumar, la
   frase dice «Un vaso más. Deshacer», en su sitio y sin partir la línea; «Deshacer» es su propio
   botón y quita ese vaso. Luego vuelve la frase de siempre. En la barra y en el cajón, en es y en.

   NO CUBRE: cómo se ve (las fotos de docs/proposals/sidebar-23nov/montado/). */
'use strict';
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, abrirCajon } = require('./helpers');

const AHORA = new Date('2026-11-26T12:20:00+01:00');
const ABIERTA = {
  sidebarCollapsed: false,
  lastActiveDay: AHORA.toDateString(),
  _historyMigrated: true,
  _weeklyStatsReindexed_v0_28_8: true,
  _historyRecalculated_v0_28_8: true,
  water: { goal: 8, today: 3, lastReset: null },
};
const vasos = (page) => page.evaluate(() => getState().water.today);

for (const [piel, ancho, alto, lang, otro, deshacer, antes, despues] of [
  ['barra', 1280, 720, 'es', 'Un vaso más.', 'Deshacer', 'Tres vasos de ocho', 'Cuatro vasos de ocho'],
  ['cajón', 360, 640, 'en', 'One more.', 'Undo', 'Three glasses of eight', 'Four glasses of eight'],
]) {
  test('sumar un vaso y deshacerlo desde la ' + piel + ' (' + lang + ')', async ({ page, context }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await sembrar(context, Object.assign({}, ABIERTA, { lang }));
    await page.clock.install({ time: AHORA });
    await irAlArtefacto(page);
    if (ancho <= 640) await abrirCajon(page);
    const sb = page.locator('[data-pace-sidebar]');
    const fila = sb.locator('[data-pace-hoy-celda][data-modulo="water"]');
    const boton = sb.locator('[data-pace-agua-deshacer]');
    await expect(fila).toContainText(antes);
    await expect(boton).toHaveCount(0);

    await fila.click();
    await expect.poll(() => vasos(page)).toBe(4);
    await expect(fila).toContainText(otro);
    await expect(boton).toHaveText(deshacer);
    await expect(page.getByRole('button', { name: deshacer, exact: true })).toHaveCount(1);
    /* En su sitio: encima del hueco de la frase, en la misma línea y sin partirla. */
    const geo = await page.evaluate(() => {
      const f = document.querySelector('[data-pace-sidebar] [data-pace-hoy-celda][data-modulo="water"]').getBoundingClientRect();
      const d = document.querySelector('[data-pace-agua-deshacer]').getBoundingClientRect();
      const v = document.querySelector('[data-pace-sidebar] [data-pace-hoy-vaso]').getBoundingClientRect();
      return { fila: f.height, dentro: d.top >= f.top - 1 && d.bottom <= f.bottom + 1, antesDelVaso: d.right <= v.left };
    });
    expect(geo.dentro, 'Deshacer va dentro de la fila').toBe(true);
    expect(geo.antesDelVaso, 'y no pisa «+ vaso»').toBe(true);
    expect(geo.fila, 'una sola línea').toBeLessThan(30);

    await boton.click();
    await expect.poll(() => vasos(page)).toBe(3);
    await expect(boton).toHaveCount(0);
    await expect(fila).toContainText(antes);
    await expect(sb, 'deshacer no cierra el cajón').toBeVisible();

    /* Sin tocar nada, a los cinco segundos vuelve la frase y el vaso se queda. */
    await fila.click();
    await expect.poll(() => vasos(page)).toBe(4);
    await expect(boton).toHaveCount(1);
    await page.clock.runFor(4000);
    await expect(boton, 'a los cuatro segundos sigue').toHaveCount(1);
    await page.clock.runFor(1500);
    await expect(boton).toHaveCount(0);
    await expect(fila).toContainText(despues);
    expect(await vasos(page)).toBe(4);
  });
}

test('cada vaso nuevo vuelve a contar los cinco segundos, y deshacer quita solo el último', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await page.clock.install({ time: AHORA });
  await irAlArtefacto(page);
  const fila = page.locator('[data-pace-sidebar] [data-pace-hoy-celda][data-modulo="water"]');
  const boton = page.locator('[data-pace-agua-deshacer]');
  await fila.click();
  await page.clock.runFor(4000);
  /* Con «Deshacer» a la vista, la fila suma por cualquier otro sitio: aquí, por la gota. */
  await fila.click({ position: { x: 6, y: 10 } });
  await expect.poll(() => vasos(page)).toBe(5);
  await page.clock.runFor(4000);
  await expect(boton, 'el segundo vaso reinicia el plazo').toHaveCount(1);
  await boton.click();
  await expect.poll(() => vasos(page)).toBe(4);
  await expect(boton).toHaveCount(0);
});
