/* PACE · E2E · «LA DE ANTES» EN LA VENTANA DE LA PAUSA (Ez, 5A del 15 nov. 2026)
 * ==========================================================================
 * La V2 de la revisión 8 de ChatGPT: «ponme aquella que ya sé hacer». La ventana de la pausa
 * propone una rutina distinta cada vez, a propósito; al lado, una fila con la última que
 * acabaste: el dibujo de su módulo, su nombre y «la de antes, N min». Por libre va debajo de
 * las otras puertas; con «A tu ritmo», debajo de Hidrátate. Maqueta elegida:
 * docs/proposals/maquetas-uso-15nov/ (https://claude.ai/artifact/U8L5AgXmWcbBrT8Tp7Zrx2).
 *
 * QUÉ DEFIENDE: que sale con la última rutina terminada y entra en ella por la puerta de
 * siempre; que una rutina con un «No» de esta semana no se ofrece (está apartada); que sin
 * nada hecho no hay fila; y que en un móvil de 360 × 640 la ventana cabe sin scroll con ella.
 * Mutantes: sin el veto en `breakLaDeAntes`, cae la segunda; con `breakLaDeAntes` devolviendo
 * null, caen la primera y la cuarta.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, terminarBloque, overlaySuperior } = require('./helpers');

const JUEVES = (hhmm) => new Date('2026-11-19T' + hhmm + ':00+01:00');
const SEMANA = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const modal = (page) => page.locator('[role="dialog"]').filter({ has: page.locator('[data-pace-break-shortcut]') });

/* Escritorio express (Estira) de principio a fin, contestando `respuesta` en «¿Te ayudó?», y de
   vuelta a la home. */
async function hacerEscritorioExpress(page, respuesta) {
  await page.getByRole('button', { name: /^Estira/ }).filter({ visible: true }).first().click();
  await overlaySuperior(page).getByRole('heading', { name: 'Escritorio express', exact: true }).filter({ visible: true }).first().click();
  const empezar = overlaySuperior(page).getByRole('button', { name: /^Empezar$/ });
  if (await empezar.count()) await empezar.first().click();
  const done = page.locator('[data-pace-session-done]');
  for (let s = 0; s < 500 && !(await done.count()); s++) { await page.clock.fastForward(1000); await page.waitForTimeout(8); }
  await expect(done, 'GUARD: la sesión no llegó al cierre').toHaveCount(1);
  await page.locator('[data-pace-session-feedback]').getByRole('button', { name: respuesta, exact: true }).click();
  await page.locator('[data-pace-session-footer] button').first().click();
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);
}

async function bloqueHastaLaPausa(page) {
  await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
  await page.waitForTimeout(600);
}

/* Lo que no se ve de la ventana (scroll) y qué parte de la fila tapa otra cosa. */
const medir = (page) => page.evaluate(() => {
  const m = [...document.querySelectorAll('[role="dialog"]')].find((d) => d.querySelector('[data-pace-break-shortcut]'));
  const fila = m.querySelector('[data-pace-break-antes]');
  const r = fila.getBoundingClientRect();
  let dentro = 0;
  for (let i = 1; i <= 9; i++) for (let j = 1; j <= 3; j++) {
    const e = document.elementFromPoint(r.left + r.width * i / 10, r.top + r.height * j / 4);
    if (e && (e === fila || fila.contains(e))) dentro++;
  }
  return { scroll: m.scrollHeight - m.clientHeight, visto: Math.round(100 * dentro / 27), fuera: r.bottom > innerHeight || r.top < 0 };
});

test('por libre: la última rutina acabada sale en su fila y entra en ella', async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrar(context, { soundOn: false });
  await page.clock.install({ time: JUEVES('10:00') });
  await irAlArtefacto(page);
  await hacerEscritorioExpress(page, 'Sí');
  await bloqueHastaLaPausa(page);
  const fila = modal(page).locator('[data-pace-break-antes]');
  await expect(fila, 'no salió la de antes').toHaveCount(1);
  await expect(fila).toHaveAttribute('data-pace-break-antes', 'move.desk.quick');
  await expect(fila).toContainText('Escritorio express');
  /* Los mismos minutos que su tarjeta y su ficha (routineCifraMin; antes, el `min` del catálogo, «2»). */
  const cifra = await page.evaluate(() => routineCifraMin(getExtraRoutine('move.desk.quick'), getState().restBetweenSets));
  await expect(fila).toContainText('la de antes, ' + cifra + ' min');
  /* Debajo de las otras puertas, y la propuesta es otra rutina. */
  await expect(modal(page).locator('[data-pace-break-prop]')).not.toContainText('Escritorio express');
  const m = await medir(page);
  expect(m.scroll, 'la ventana pide scroll con la fila').toBeLessThanOrEqual(0);
  expect(m.visto, 'la fila no se ve entera').toBe(100);
  expect(m.fuera, 'la fila se sale de la pantalla').toBe(false);
  await fila.click();
  await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(0);
  await expect(overlaySuperior(page).getByRole('heading', { name: 'Escritorio express', exact: true }).filter({ visible: true }).first(),
    'la fila no entró en su rutina').toBeVisible();
});

test('una rutina con un «No» de esta semana no se ofrece: está apartada', async ({ page, context }) => {
  test.setTimeout(90_000);
  await sembrar(context, { soundOn: false });
  await page.clock.install({ time: JUEVES('10:00') });
  await irAlArtefacto(page);
  await hacerEscritorioExpress(page, 'No');
  await bloqueHastaLaPausa(page);
  await expect(modal(page), 'GUARD: no se abrió la ventana de la pausa').toHaveCount(1);
  await expect(modal(page).locator('[data-pace-break-antes]'), 'ofreció una rutina apartada por un «No»').toHaveCount(0);
});

test('sin nada hecho antes no hay fila', async ({ page, context }) => {
  await sembrar(context, { soundOn: false });
  await page.clock.install({ time: JUEVES('10:00') });
  await irAlArtefacto(page);
  await bloqueHastaLaPausa(page);
  await expect(modal(page), 'GUARD: no se abrió la ventana de la pausa').toHaveCount(1);
  await expect(modal(page).locator('[data-pace-break-antes]')).toHaveCount(0);
});

test('con «A tu ritmo»: debajo de Hidrátate, y la ventana cabe a 360 × 640', async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrar(context, { soundOn: false, sidebarCollapsed: true, ritmo: { semanaTipo: SEMANA, horario: HORARIO } });
  await page.clock.install({ time: JUEVES('08:50') });
  await irAlArtefacto(page);
  await hacerEscritorioExpress(page, 'Un poco');
  /* Con la semana guardada, «Preparar jornada» de la tarjeta corta sirve el día de un toque (Ez, 2A del 18 nov.). */
  await page.getByRole('button', { name: /Preparar jornada/ }).filter({ visible: true }).first().click();
  await expect(page.getByRole('button', { name: /Empezar jornada/ }).filter({ visible: true }).first()).toBeVisible();
  await bloqueHastaLaPausa(page);
  await expect(modal(page).locator('[data-pace-break-ritmo]'), 'GUARD: no es la ventana de «A tu ritmo»').toHaveCount(1);
  const fila = modal(page).locator('[data-pace-break-antes]');
  await expect(fila).toContainText('Escritorio express');
  const debajo = await page.evaluate(() => {
    const agua = document.querySelector('[data-pace-break-agua]').getBoundingClientRect();
    const antes = document.querySelector('[data-pace-break-antes]').getBoundingClientRect();
    return antes.top - agua.bottom;
  });
  expect(debajo, 'la fila no va debajo de Hidrátate').toBeGreaterThanOrEqual(-1);
  const m = await medir(page);
  expect(m.scroll, 'la ventana pide scroll con la fila').toBeLessThanOrEqual(0);
  expect(m.visto, 'la fila no se ve entera').toBe(100);
});
