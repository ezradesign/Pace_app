/* PACE · E2E · LA PAUSA POR LIBRE NO REPITE LA PROPUESTA (v0.153.0)
 * ===============================================================
 * Ez (9 oct. 2026): «en el breakmenu a veces se repite la tarea: te recomienda
 * Hidrátate y abajo también sale la tarjeta de Hidrátate». Arriba iba la
 * propuesta y debajo, siempre, las cuatro puertas, también la del mismo módulo.
 * Eligió la opción B mirando fotos de la app real
 * (docs/traspaso/archivos/pausa-repetida-9oct/): con propuesta, las otras tres
 * en una sola línea, con su dibujo y sin caja; sin propuesta, las cuatro
 * tarjetas de siempre.
 *
 * Contra v0.152.0 caen las dos primeras: la puerta repetida sigue ahí. Contra
 * v0.166.0 caen siempre las de la home corrida de lado.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { irAlArtefacto } = require('./helpers');

/* `lastActiveDay` en el formato de `toDateString()` o el relevo de día pone el
   agua y el plan a cero (ver pausa-propone.spec.js). */
const sembrarEstado = (context, extra) => context.addInitScript((e) => {
  if (localStorage.getItem('pace.state.v2')) return;
  localStorage.setItem('pace.state.v2', JSON.stringify(Object.assign(
    { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', lastActiveDay: new Date().toDateString(), ritmo: { libre: true } }, e)));
}, extra);

async function hastaLaPausa(page, minutos, desde) {
  await page.clock.install({ time: desde });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await page.waitForTimeout(250);
  for (let i = 0; i < minutos + 4; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  await page.waitForTimeout(700);
  await expect(page.locator('[data-pace-break-shortcut]'), 'no se abrió el menú de pausa').toHaveCount(1);
}

/* El modal de la pausa: el ancestro del pie que contiene también la propuesta. */
const modal = (page) => page.locator('[role="dialog"]').filter({ has: page.locator('[data-pace-break-shortcut]') });

test('con el vaso propuesto, Hidrátate no sale otra vez abajo', async ({ page, context }) => {
  await sembrarEstado(context, { focusMinutes: 25, water: { today: 0, goal: 8 } });
  await hastaLaPausa(page, 25, new Date('2026-10-09T13:00:00+02:00'));
  const m = modal(page);
  await expect(m.locator('[data-pace-break-prop]')).toContainText('Hidrátate');
  await expect(m.getByRole('button', { name: 'Hidrátate', exact: true })).toHaveCount(0);
  for (const nombre of ['Respira', 'Estira', 'Muévete']) {
    await expect(m.getByRole('button', { name: nombre, exact: true }), nombre + ' tiene que seguir abajo').toHaveCount(1);
  }
});

test('con una rutina de Estira propuesta, su puerta no se repite y las otras tres van en una línea', async ({ page, context }) => {
  await sembrarEstado(context, { focusMinutes: 35, water: { today: 2, goal: 8 } });
  await hastaLaPausa(page, 35, new Date('2026-10-09T10:00:00+02:00'));
  const m = modal(page);
  await expect(m.locator('[data-pace-break-prop]')).toContainText('Estira');
  await expect(m.getByRole('button', { name: 'Estira', exact: true })).toHaveCount(0);
  const otras = [];
  for (const nombre of ['Hidrátate', 'Respira', 'Muévete']) {
    const b = m.getByRole('button', { name: nombre, exact: true });
    await expect(b, nombre + ' tiene que seguir abajo').toHaveCount(1);
    otras.push(await b.boundingBox());
  }
  /* Una sola línea: las tres a la misma altura, también a 1280. */
  const tops = otras.map((c) => Math.round(c.y));
  expect(Math.max(...tops) - Math.min(...tops), 'las tres no van en una línea: ' + tops.join(', ')).toBeLessThanOrEqual(2);
  /* Y la puerta sigue entrando donde siempre: Respira abre su biblioteca. */
  await m.getByRole('button', { name: 'Respira', exact: true }).click();
  await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(0);
});

/* LA HOME NO SE QUEDA CORRIDA DE LADO AL CERRAR LA PAUSA. A 360x640, 1 de cada muchas
   pasadas [data-pace-home-body] seguía 117 px corrida al cerrar la pausa. No era el
   anclaje de scroll (v0.155.0 lo apagó y siguió pasando): el bloom del sol asoma por
   los dos lados y deja a la región 158 px de ancho que no se ven, y cuando el botón
   «Empezar foco» aún se mueve al cargar, Playwright reintenta el clic llevándolo a la
   vista con `inline: 'start'` y la corre justo hasta él (117 px, su borde izquierdo).
   La causa se mira siempre: que no quede ancho que correr. */
const homeVisible = (page) => page.locator('[data-pace-home-body]').filter({ visible: true }).first();
const anchoQueSobra = (home) => home.evaluate((el) => el.scrollWidth - el.clientWidth);

test('al cerrar la pausa, la home no se queda corrida de lado', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrarEstado(context, { focusMinutes: 25, water: { today: 0, goal: 8 } });
  await hastaLaPausa(page, 25, new Date('2026-10-09T13:00:00+02:00'));
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(0);
  const home = homeVisible(page);
  expect(await anchoQueSobra(home), 'la home tiene ancho de sobra para correrse de lado').toBeLessThanOrEqual(0);
  expect(await home.evaluate((el) => el.scrollLeft), 'la home se ha quedado corrida de lado').toBe(0);
});

/* Lo que corría la home, provocado a propósito en cada botón: «llevar a la vista» con
   las alineaciones al borde que usa Playwright al reintentar un clic (y que puede usar
   cualquier ayuda de accesibilidad). Contra v0.166.0, «Empezar foco» la corre 117 px. */
for (const [ancho, alto] of [[320, 568], [360, 640], [390, 844], [768, 1024]]) {
  test('a ' + ancho + 'x' + alto + ', llevar un botón a la vista no corre la home de lado', async ({ page, context }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await sembrarEstado(context, { focusMinutes: 25, water: { today: 0, goal: 8 } });
    await irAlArtefacto(page);
    const home = homeVisible(page);
    expect.soft(await anchoQueSobra(home), 'la home tiene ancho de sobra para correrse de lado').toBeLessThanOrEqual(0);
    const corridas = await home.evaluate((el) => {
      const out = [];
      for (const b of el.querySelectorAll('button')) {
        for (const inline of ['start', 'center', 'end']) {
          b.scrollIntoView({ block: 'nearest', inline });
          if (el.scrollLeft !== 0) out.push((b.getAttribute('aria-label') || b.textContent.trim()).slice(0, 30) + ' (' + inline + '): ' + el.scrollLeft + ' px');
          el.scrollLeft = 0;
        }
      }
      return out;
    });
    expect(corridas, 'la home se corre de lado').toEqual([]);
  });
}

test('a 360×640 las tres caben en una línea', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrarEstado(context, { focusMinutes: 35, water: { today: 2, goal: 8 } });
  await hastaLaPausa(page, 35, new Date('2026-10-09T10:00:00+02:00'));
  const m = modal(page);
  const tops = [];
  for (const nombre of ['Hidrátate', 'Respira', 'Muévete']) {
    tops.push(Math.round((await m.getByRole('button', { name: nombre, exact: true }).boundingBox()).y));
  }
  expect(Math.max(...tops) - Math.min(...tops), 'a 360 px se parten en dos líneas: ' + tops.join(', ')).toBeLessThanOrEqual(2);
});
