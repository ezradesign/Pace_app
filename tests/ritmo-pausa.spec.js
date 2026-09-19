/* PACE · E2E · LA PAUSA CON MEMORIA (s195 · v0.126.0)
 * ====================================================
 * Cuatro decisiones del usuario, tomadas con `docs/proposals/ideas-s195.html` delante:
 *
 *  · LA PAUSA CON MENÚ: al acabar un bloque de «A tu ritmo» el modal pregunta una sola
 *    cosa —¿haces la pausa, o sigues?— con el plato, su GLIFO de ejercicio (el de las
 *    tarjetas de rutina), «Hacer la pausa», «Seguir con el bloque N+1» y «Otra cosa…»
 *    plegado. Sin menú, el modal de siempre (pausa-propone.spec.js lo vigila).
 *  · EL AGUA VA POR TIEMPO: un vaso en cada parada a la que se llega con >= 50 min desde
 *    el último; la comida siempre lleva vaso y reinicia; tope, la meta del día. Antes
 *    la meta se repartía entre las pausas y «Dos horas» daba 4 vasos.
 *  · RECOLOCAR TAMBIÉN AL TERMINAR: si el bloque acaba a una hora que no es la del plan
 *    (acortaste el pomodoro), la pausa se abre a la hora que ES y el resto se recompone.
 *  · LA LÍNEA TIENE MEMORIA: la parada pasada dice si se HIZO (una sesión terminada con
 *    la pausa abierta) o se SALTÓ (empezaste el bloque sin hacerla).
 *
 * TRAMPAS: `Button` no reenvía data-*: los botones del modal se buscan por su nombre. El
 * bloque se acaba minuto a minuto (un fastForward grande no abre la pausa, s187). La
 * sesión de cuerpo se acaba segundo a segundo (eventos-origen.spec.js).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior } = require('./helpers');

const NUEVE = new Date('2026-09-18T09:00:00+02:00');
const JORNADA = { fecha: '2026-09-18', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const PERFIL = { profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } };

async function abrir(page, context, extra, hora) {
  await sembrar(context, Object.assign({}, PERFIL, extra || {}));
  await page.clock.install({ time: hora || NUEVE });
  await irAlArtefacto(page);
  await page.waitForTimeout(400);
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
async function terminarBloque(page) {
  for (let i = 0; i < 60; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) return;
  }
  throw new Error('GUARD: el bloque no terminó');
}
async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); }
}

/* ------------------------------------------------------------------ el agua, en puro */
test('el agua va por tiempo: nunca dos vasos a menos de 50 min, la comida siempre, y una hora son 1-2', async ({ page, context }) => {
  await abrir(page, context, { ritmo: { libre: true } });
  const r = await page.evaluate(() => {
    const pozos = ritmoPozos(getState(), '2026-09-18');
    const h = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
    const agua = (m) => m.items.filter((it) => it.agua);
    const jornada = ritmoComponer('jornada', h, pozos, {}, 8);
    const una = ritmoComponer('1h', Object.assign({}, h, { ahora: 870 }), pozos, {}, 8);
    const dos = ritmoComponer('2h', Object.assign({}, h, { ahora: 623 }), pozos, {}, 8);
    const vasos = agua(jornada);
    let minSep = 9999;
    for (let i = 1; i < vasos.length; i++) {
      const prev = vasos[i - 1];
      if (vasos[i].tipo === 'comida') continue;   /* la comida siempre lleva vaso, esté donde esté */
      const fin = prev.tipo === 'comida' ? prev.desde + prev.dur : prev.desde;
      minSep = Math.min(minSep, vasos[i].desde - fin);
    }
    return { jornada: jornada.vasos, minSep, comida: !!jornada.items.find((it) => it.tipo === 'comida').agua,
             primera: jornada.items.find((it) => it.tipo === 'pausa').agua === true, una: una.vasos, dos: dos.vasos, meta: 8 };
  });
  expect(r.jornada, 'la jornada entera sirve entre 5 y 8 vasos').toBeGreaterThanOrEqual(5);
  expect(r.jornada).toBeLessThanOrEqual(r.meta);
  expect(r.minSep, 'dos vasos a menos de 50 min').toBeGreaterThanOrEqual(50);
  expect(r.comida, 'la comida siempre lleva vaso').toBe(true);
  expect(r.primera, 'la primera pausa (a los 45 min) no lleva vaso: hace menos de 50 desde el inicio').toBe(false);
  expect(r.una, 'una hora son 1-2 vasos').toBeGreaterThanOrEqual(1);
  expect(r.una).toBeLessThanOrEqual(2);
  expect(r.dos, 'dos horas son 2-3 vasos, no 4').toBeLessThanOrEqual(3);
});

/* ------------------------------------------------------------------ la pausa con menú */
test('al acabar el bloque, «Tu pausa» con el plato y su glifo; «Seguir» arranca el bloque 2 y deja la pausa saltada', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context, { ritmo: { dia: JORNADA } });
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
  const modal = page.locator('[data-pace-modal-backdrop]');
  await expect(modal).toContainText('Bloque 1 de 9 · hecho');
  await expect(modal).toContainText('Tu pausa');
  await expect(modal).toContainText('9:45 · lo que el menú tenía para ahora');
  await expect(modal.locator('[data-pace-break-ritmo]')).toContainText('A tu ritmo · antídoto a la silla');
  /* el glifo es una máscara CSS o un SVG según el arte que haya (s138): se mide que pinte algo */
  const glifo = modal.locator('[data-pace-break-glifo]');
  await expect(glifo, 'el plato lleva el glifo de su ejercicio').toHaveCount(1);
  expect(await glifo.evaluate((e) => { const r = e.firstElementChild && e.firstElementChild.getBoundingClientRect(); return r ? Math.round(r.width) : 0; }), 'el glifo no pinta').toBeGreaterThan(30);
  /* los cuatro módulos, plegados hasta «Otra cosa…» */
  await expect(modal.getByRole('button', { name: 'Respira', exact: true })).toHaveCount(0);
  await modal.getByRole('button', { name: 'Otra cosa…', exact: true }).click();
  await expect(modal.getByRole('button', { name: 'Respira', exact: true })).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Hidrátate', exact: true })).toBeVisible();
  /* seguir: el aro arranca el bloque 2 y la parada 1 queda saltada */
  await modal.getByRole('button', { name: 'Seguir con el bloque 2', exact: true }).click();
  await expect(modal).toHaveCount(0);
  await expect(page.locator('[data-pace-dial-fit]')).toHaveAttribute('data-pace-dial-running', '');
  await expect(page.locator('[data-pace-dial-label]').first()).toHaveText('Bloque 2 de 9');
  expect(await page.evaluate(() => getState().ritmo.dia.estados)).toEqual({ 1: 'saltada' });
  const parada = vis(page, '[data-pace-ritmo-linea]').locator('[data-pace-ritmo-parada]').first();
  await expect(parada).toHaveAttribute('data-pace-ritmo-estado-parada', 'saltada');
  await expect(parada).toHaveClass(/pace-rt-saltada/);
  await expect(parada).toContainText('saltada');
  expect(errores).toEqual([]);
});

test('«Hacer la pausa» entra en el plato, y al terminarlo la parada queda hecha', async ({ page, context }) => {
  await abrir(page, context, { ritmo: { dia: JORNADA } });
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
  await page.getByRole('button', { name: 'Hacer la pausa', exact: true }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(1);
  const done = page.locator('[data-pace-session-done]');
  for (let s = 0; s < 400 && (await done.count()) === 0; s++) await segundos(page, 1);
  expect(await done.count(), 'GUARD: la sesión no llegó al cierre').toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => (getState().ritmo.dia.estados || {})[1]), { timeout: 5000 }).toBe('hecha');
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Volver al inicio', exact: true }).click();
  /* la pausa sigue ABIERTA (se cierra al empezar el bloque 2) y su parada ya dice hecha */
  expect(await page.evaluate(() => getState().ritmo.dia.pausa)).toBe(1);
  const parada = vis(page, '[data-pace-ritmo-linea]').locator('[data-pace-ritmo-parada]').first();
  await expect(parada).toHaveClass(/pace-rt-ahora/);
  /* y al empezar el bloque 2, hecha se queda (no se pisa con saltada) */
  await page.getByRole('button', { name: 'Empezar bloque 2', exact: true }).click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => getState().ritmo.dia.estados)).toEqual({ 1: 'hecha' });
  await expect(vis(page, '[data-pace-ritmo-linea]').locator('[data-pace-ritmo-parada]').first()).toHaveAttribute('data-pace-ritmo-estado-parada', 'hecha');
});

/* ------------------------------------------------------------------ recolocar al terminar */
test('si acortas el pomodoro, el día va con esa duración; y si el bloque acaba tarde, la pausa se abre a la hora que es', async ({ page, context }) => {
  await abrir(page, context, { ritmo: { dia: JORNADA } });
  /* el plan dice 45; tú pones el aro a 25 y empiezas: el día se recompone con bloques de 25 */
  await page.getByRole('button', { name: '25', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => { const p = ritmoPlan(getState()); return { bloque: getState().ritmo.dia.bloque, dur: p.actual.dur, pausa1: p.m.items[1].desde }; }),
    'al empezar con 25, el bloque dura 25 y la primera pausa cae a las 9:25').toEqual({ bloque: 25, dur: 25, pausa1: 565 });
  /* a los 10 minutos lo pausas 3 y sigues: el bloque acaba a las 9:28, no a las 9:25 del plan */
  await page.clock.fastForward(10 * 60 * 1000);
  await page.waitForTimeout(100);
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.clock.fastForward(3 * 60 * 1000);
  await page.waitForTimeout(100);
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await terminarBloque(page);
  const d = await page.evaluate(() => {
    const p = ritmoPlan(getState()), dia = getState().ritmo.dia;
    return { pausa: p.pausa && p.pausa.desde, hechos: p.hechos, pasado: dia.pasado.map((it) => it.tipo + '@' + it.desde + '+' + it.dur), desde: dia.desde, pendiente: dia.pausaPendiente,
             siguiente: p.actual && p.actual.desde, primera: p.m.items.map((it) => it.tipo).slice(0, 3) };
  });
  expect(d.pasado, 'el bloque hecho duró lo que duró: 28, no 25').toEqual(['foco@540+28']);
  expect(d.pausa, 'la pausa abierta se abre a las 9:28 (el plan decía 9:25)').toBe(568);
  expect(d.pendiente).toBe(true);
  expect(d.primera, 'tras lo hecho, primero la pausa').toEqual(['foco', 'pausa', 'foco']);
  expect(d.siguiente, 'y el bloque 2 detrás de ella').toBe(573);
  await expect(page.locator('[data-pace-modal-backdrop]')).toContainText('9:28 · lo que el menú tenía para ahora');
  await expect(page.locator('[data-pace-sidebar]')).toContainText('Tu pausa · 9:28');
  /* y al empezar el bloque 2 a las 9:34, se recoloca otra vez (la pieza de s194) */
  await page.keyboard.press('Escape');
  await page.clock.fastForward(6 * 60 * 1000);
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: 'Empezar bloque 2', exact: true }).click();
  await page.waitForTimeout(300);
  const e = await page.evaluate(() => { const p = ritmoPlan(getState()); return { actual: p.actual.desde, dur: p.actual.dur, pendiente: getState().ritmo.dia.pausaPendiente, hechos: p.hechos, bloque: getState().ritmo.dia.bloque, siguientes: p.m.focos.slice(1, 4).map((f) => f.dur), aro: getState().focusMinutes }; });
  expect(e.actual).toBe(574);
  expect(e.bloque, 'la duración que pusiste manda el resto del día').toBe(25);
  expect(e.dur, 'y dura lo que marca el aro').toBe(25);
  expect(e.siguientes, 'los bloques que vienen también son de 25').toEqual([25, 25, 25]);
  expect(e.aro, 'y el aro no vuelve a 45').toBe(25);
  expect(e.pendiente).toBe(false);
  expect(e.hechos).toBe(1);
});
