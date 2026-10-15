/* PACE · E2E · ESTADÍSTICAS «HOY» (Fase 4 de «Camino a v1.0»)
 * ==========================================================
 * Ez, 8 oct. 2026: «Hoy» enseña el menú del día de «A tu ritmo» y es gratis; el mes y el año
 * son de PACE completo (abiertos para todos hasta v1). Ez, 15 oct., mirando fotos de la app
 * (`docs/proposals/stats-hoy-fase4-ligera.html`): 1A una tarjeta por parada, 2A por libre las
 * pausas de hoy con su hora, 3A Estadísticas se abre en «Hoy», 4A Mes y Año cerrados llevan
 * candado en la pestaña y abren la invitación.
 *
 * QUE DEFIENDE:
 *  · Al abrir, «Hoy» delante, con los totales de hoy (los de la barra lateral) y cada parada
 *    del menú con lo que pasó, en su orden: hecha, saltada, la de ahora y las que vienen.
 *  · «Hoy» mide lo mismo que Semana, Mes y Año y no pide scroll: en el escritorio a 1536 × 680
 *    (el Brave de Ez) también con una jornada de 5:00 a 23:30, la más larga que deja elegir;
 *    en el móvil a 360 × 718 con una jornada de 12 horas. La de 5:00 a 23:30 en el móvil SÍ
 *    pide scroll (unos 140 px): se acepta, como el scroll de la home a 320 × 568.
 *  · Por libre, las pausas de hoy salen del registro de eventos con su hora; sin ninguna, una
 *    frase, y nunca las de ayer.
 *  · Con PACE completo cerrado, Mes y Año llevan candado y abren la invitación sin cambiar de
 *    pestaña; con el código, nada se cierra.
 *
 * Contra main (v0.168.0) caen las siete: no hay pestaña «Hoy», el panel abre en «Semana» y
 * Mes y Año no se cierran nunca.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarModalAsentado } = require('./helpers');

/* Jueves 15 de octubre a las 13:16 en Madrid (la hora con offset: el runner del CI está en UTC
   pero el navegador va en Europe/Madrid). Jornada entera de 9:00 a 17:00: cinco bloques hechos
   y la pausa de detrás del quinto abierta; las cuatro anteriores, hecha, hecha, hecha y saltada. */
const JUEVES = new Date('2026-10-15T13:16:00+02:00');
const BASE = {
  cycle: 5, lastActiveDay: 'Thu Oct 15 2026',
  _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
  water: { goal: 8, today: 5, lastReset: null },
  weeklyStats: {
    focusMinutes: [210, 165, 240, 225, 0, 0, 0], breathMinutes: [9, 6, 12, 6, 0, 0, 0],
    moveMinutes: [14, 10, 8, 11, 0, 0, 0], waterGlasses: [7, 6, 8, 5, 0, 0, 0], holdSeconds: [0, 0, 0, 0, 0, 0, 0],
  },
};
const DIA = { fecha: '2026-10-15', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pausa: 5,
  estados: { 1: 'hecha', 2: 'hecha', 3: 'hecha', 4: 'saltada' } };
const MENU = Object.assign({}, BASE, { ritmo: { dia: DIA } });
const conHorario = (inicio, salida) => Object.assign({}, BASE, { cycle: 1, ritmo: {
  horario: { inicio, comida: 840, comidaDur: 60, salida },
  dia: { fecha: '2026-10-15', opcion: 'jornada', desde: inicio, cicloBase: 0, cambios: {}, estados: {} } } });

async function abrir(page, context, semilla, hora) {
  await sembrar(context, semilla);
  await page.clock.install({ time: hora || JUEVES });
  await irAlArtefacto(page);
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await esperarModalAsentado(page);
}

const medir = (page) => page.evaluate(() => {
  const el = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0).pop();
  return { alto: Math.round(el.getBoundingClientRect().height), corta: Math.max(0, el.scrollHeight - el.clientHeight) };
});

async function alturas(page) {
  const m = { today: await medir(page) };
  for (const k of ['week', 'month', 'year']) {
    await page.locator(`[data-pace-stats-tab="${k}"]`).click();
    await page.waitForTimeout(300);
    m[k] = await medir(page);
  }
  return m;
}

function igualesYSinScroll(m, donde) {
  const altos = Object.values(m).map((x) => x.alto);
  expect(Math.max(...altos) - Math.min(...altos), donde + ': «Hoy» no mide lo que las demás · ' + JSON.stringify(m)).toBeLessThanOrEqual(2);
  for (const k of Object.keys(m)) expect(m[k].corta, donde + ': ' + k + ' pide scroll').toBeLessThanOrEqual(1);
}

test('abre en «Hoy» con los totales de hoy y cada parada del menú con lo que pasó', async ({ page, context }) => {
  await abrir(page, context, MENU);
  const hoy = page.locator('[data-pace-hoy-view="menu"]');
  await expect(hoy, 'Estadísticas no abre en «Hoy» con el menú').toBeVisible();
  await expect(page.locator('[data-pace-stats-tab="today"]')).toHaveText('Hoy');

  const totales = hoy.locator('[data-pace-stats-tarjeta]');
  await expect(totales).toHaveCount(4);
  await expect(totales.nth(0)).toContainText('225');
  await expect(totales.nth(3)).toContainText('5');
  await expect(totales.nth(3)).toContainText('de 8 vasos');

  /* Las nueve paradas de la jornada en su orden, con el estado de la línea de la home. */
  const estados = await hoy.locator('[data-pace-hoy-parada]').evaluateAll((l) => l.map((e) => e.getAttribute('data-pace-hoy-parada')));
  expect(estados).toEqual(['hecha', 'hecha', 'hecha', 'saltada', 'ahora', 'comida', 'luego', 'luego', 'luego']);
  /* Cada tarjeta dice la hora de su parada, la misma que el plan. */
  const horas = await page.evaluate(() => statsHoyParadas(ritmoPlan(getState())).map((p) => ritmoHora(p.it.desde)));
  const textos = await hoy.locator('[data-pace-hoy-parada] .pace-sh-h').allTextContents();
  expect(textos).toEqual(horas);
  await expect(hoy.locator('[data-pace-hoy-parada="ahora"]')).toContainText('ahora');
  await expect(hoy.locator('[data-pace-hoy-parada="saltada"]')).toContainText('saltada');
});

test('escritorio a 1536 × 680: «Hoy» mide lo que las demás, sin scroll, también con el día más largo', async ({ page, context }) => {
  await page.setViewportSize({ width: 1536, height: 680 });
  await abrir(page, context, conHorario(300, 1410), new Date('2026-10-15T07:40:00+02:00'));
  const n = Number(await page.locator('[data-pace-hoy-rejilla]').getAttribute('data-pace-hoy-rejilla'));
  expect(n, 'GUARD: el día de 5:00 a 23:30 tiene que traer más de quince paradas').toBeGreaterThan(15);
  igualesYSinScroll(await alturas(page), '1536 × 680, de 5:00 a 23:30');
});

test('móvil a 360 × 718: «Hoy» mide lo que las demás y no pide scroll con el menú de hoy', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 718 });
  await abrir(page, context, MENU);
  igualesYSinScroll(await alturas(page), '360 × 718, jornada de 9:00 a 17:00');
});

test('móvil a 360 × 718: tampoco con una jornada de 12 horas, que pasa a dos columnas', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 718 });
  await abrir(page, context, conHorario(420, 1140), new Date('2026-10-15T07:40:00+02:00'));
  const n = Number(await page.locator('[data-pace-hoy-rejilla]').getAttribute('data-pace-hoy-rejilla'));
  expect(n, 'GUARD: la jornada de 7:00 a 19:00 tiene que pasar de diez paradas').toBeGreaterThan(10);
  igualesYSinScroll(await alturas(page), '360 × 718, jornada de 7:00 a 19:00');
});

test('por libre: las pausas de hoy con su hora, del registro; sin ninguna, la frase', async ({ page, context }) => {
  await sembrar(context, BASE);
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await page.waitForFunction(() => typeof window.eventsWebAppend === 'function' && typeof window.makeEvent === 'function');
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  await expect(page.locator('[data-pace-hoy-view="libre"]')).toBeVisible();
  await expect(page.locator('[data-pace-hoy-vacio]')).toHaveText('Todavía no has hecho ninguna pausa hoy.');
  await page.keyboard.press('Escape');

  /* Dos de hoy y una de ayer, por el contrato del registro. La de ayer no puede salir. */
  await page.evaluate(async () => {
    const sesiones = [
      ['breathe', 'breathe.box.4', '2026-10-15T09:52:00+02:00', 300],
      ['stretch', 'move.neck.3', '2026-10-15T11:05:00+02:00', 180],
      ['move', 'extra.calves', '2026-10-14T12:40:00+02:00', 120],
    ];
    for (const [module, routineId, cuando, s] of sesiones) {
      const e = window.makeEvent({ type: 'session.completed', runId: 'run-' + routineId, occurredAt: new Date(cuando).toISOString(),
        payload: { module, routineId, completionReason: 'natural', elapsedSeconds: s, activeSeconds: s, plannedSeconds: s, plannedSecondsSource: 'derived' } });
      if (!e) throw new Error('makeEvent devolvió null');
      await window.eventsWebAppend(e);
    }
  });
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  const tarjetas = page.locator('[data-pace-hoy-view="libre"] [data-pace-hoy-parada]');
  await expect(tarjetas).toHaveCount(2);
  await expect(tarjetas.nth(0)).toContainText('9:52 · 5 min');
  await expect(tarjetas.nth(1)).toContainText('11:05 · 3 min');
  await expect(page.locator('[data-pace-hoy-volver]')).toHaveText('Ponle ritmo al día');
});

test('sin PACE completo, Mes y Año llevan candado y abren la invitación sin cambiar de pestaña', async ({ page, context }) => {
  await sembrar(context, MENU);
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  /* Lo que verá quien no tenga el código cuando llegue la v1. */
  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  for (const k of ['month', 'year']) {
    const tab = page.locator(`[data-pace-stats-tab="${k}"]`);
    await expect(tab, k + ' no lleva candado').toHaveAttribute('data-pace-stats-cerrada', '');
    await expect(tab.locator('[data-pace-candado]')).toHaveCount(1);
  }
  await expect(page.locator('[data-pace-stats-tab="week"] [data-pace-candado]')).toHaveCount(0);
  await page.locator('[data-pace-stats-tab="month"]').click();
  const hoja = page.locator('[data-pace-premium-hoja]');
  await expect(hoja, 'tocar «Mes» no abre la invitación').toBeVisible();
  await expect(hoja).toContainText('Mes');
  await expect(page.locator('[data-pace-hoy-view]'), 'tocar «Mes» cambió de pestaña').toHaveCount(1);
  await expect(page.locator('[data-pace-month-view]')).toHaveCount(0);
});

test('con PACE completo, Mes y Año se abren aunque ya no estén abiertos para todos', async ({ page, context }) => {
  await sembrar(context, Object.assign({}, MENU, { premiumUnlocked: true }));
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  await expect(page.locator('[data-pace-stats-cerrada]')).toHaveCount(0);
  await page.locator('[data-pace-stats-tab="month"]').click();
  await expect(page.locator('[data-pace-month-view]')).toBeVisible();
});
