/* PACE · E2E · REANUDAR UNA SESIÓN DE RESPIRA (s186)
 * ==================================================
 * La primera prioridad del brief de la sidebar (s180), que llevaba desde
 * entonces pendiente POR ESCRITO en `Sidebar.selectors.js`: «el runner todavía
 * no persiste ronda ni fase; fingirlo sería prometer una reanudación que no
 * existe». Hoy la persiste, en `pace.breathe.v1`.
 *
 * QUÉ DEFIENDEN ESTOS ASERTOS, que es la decisión y no la implementación:
 *   1. mientras la sesión vive, existe un registro con la RONDA y el TIEMPO
 *      PRACTICADO — y no con la fase ni el segundo del ciclo, porque nadie se
 *      reengancha a mitad de una inhalación que no estaba haciendo;
 *   2. al TERMINAR desaparece: una sesión acabada no se reanuda;
 *   3. la sidebar lo ofrece diciendo por dónde ibas;
 *   4. reanudar entra por la MISMA puerta que empezar, así que una rutina con
 *      apnea vuelve a pedir su modal de seguridad;
 *   5. caduca — mismo día y dos horas—, porque una sesión de respiración es un
 *      estado en el que estabas, no una tarea pendiente.
 *
 * EL REPARTO PRODUCTOR/CONSUMIDOR ES DELIBERADO: los dos primeros asertos
 * CONDUCEN la app de verdad (son los que prueban que el registro se escribe y
 * se borra); los tres siguientes SIEMBRAN un registro conocido, porque llevar
 * la sesión hasta la ronda 2 cuesta 100 s de reloj virtual paso a paso y lo que
 * se está probando ahí es la otra mitad. El aserto 3 comprueba además que las
 * dos mitades se encuentran: siembra lo que el productor escribió.
 *
 * TRAMPAS HEREDADAS (retencion.spec.js, s166):
 *  · `clock.install()` va ANTES de `goto`.
 *  · Un `fastForward` grande NO avanza la sesión: el ticker se re-suscribe por
 *    fase. De 1 s en 1 s.
 *  · El modal de apnea nace con el botón DISABLED hasta marcar la casilla.
 *  · La técnica se abre por su HEADING: un botón por /Empezar/ caza el
 *    «Empezar foco» de la home que hay detrás.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

const CLAVE = 'pace.breathe.v1';

test.beforeEach(async ({ context }) => { await sembrar(context); });

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(12); }
}

async function abrirRondas(page) {
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Rondas express', exact: true }).click();
  const modal = overlaySuperior(page);
  if (await modal.getByRole('button', { name: 'Empezar sesión' }).count()) {
    await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(page.locator('[data-pace-breathe-phase]')).toBeVisible();
}

const leerRegistro = (page) => page.evaluate((k) => {
  try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; }
}, CLAVE);

/* Siembra un registro como el que deja el productor. `hace` en minutos. */
const sembrarRegistro = (page, extra, hace) => page.evaluate(({ k, extra, hace }) => {
  const ahora = Date.now();
  localStorage.setItem(k, JSON.stringify(Object.assign({
    v: 1, routineId: 'breathe.rounds.express', round: 2, breaths: 7,
    activeMs: 95000, holdSec: 20,
    startedAt: ahora - (hace + 3) * 60000, savedAt: ahora - hace * 60000,
  }, extra || {})));
}, { k: CLAVE, extra: extra, hace: hace || 1 });

/* ------------------------------------------------------------------ 1 */
test('mientras la sesion vive hay registro, y lleva la RONDA y el tiempo practicado', async ({ page }) => {
  const errores = capturarErrores(page);
  await abrirRondas(page);

  expect(await leerRegistro(page), 'hay registro antes de empezar a respirar').toBeTruthy();
  await segundos(page, 12);

  const g = await leerRegistro(page);
  expect(g, 'no se escribio el registro de la sesion viva').toBeTruthy();
  expect(g.routineId).toBe('breathe.rounds.express');
  expect(g.round, 'la ronda no viaja en el registro').toBe(1);
  expect(g.breaths, 'la respiracion en curso no viaja en el registro').toBeGreaterThan(1);
  /* LO QUE NO SE GUARDA es la mitad de la decisión: sin fase ni segundo del
     ciclo, nadie puede reanudar a mitad de una inhalación. */
  expect(Object.keys(g).sort(), 'el registro guarda mas de lo que se decidio')
    .toEqual(['activeMs', 'breaths', 'holdSec', 'round', 'routineId', 'savedAt', 'startedAt', 'v']);
  expect(errores).toEqual([]);
});

/* ------------------------------------------------------------------ 2 */
test('al TERMINAR la sesion el registro desaparece', async ({ page }) => {
  await abrirRondas(page);
  await segundos(page, 6);
  expect(await leerRegistro(page), 'GUARD: no hay registro que borrar').toBeTruthy();

  await page.getByRole('button', { name: /Terminar/ }).click();
  await expect(page.getByText(/Sesión completada|Session complete/i).first()).toBeVisible();

  expect(await leerRegistro(page), 'una sesion terminada se sigue ofreciendo para reanudar').toBeNull();
});

/* ------------------------------------------------------------------ 3 */
test('la sidebar ofrece continuar, y dice por que ronda ibas', async ({ page }) => {
  await irAlArtefacto(page);
  await sembrarRegistro(page, null, 1);
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  const accion = page.locator('[data-pace-sidebar-accion]');
  await expect(accion, 'la sidebar no ofrece la sesion interrumpida').toHaveAttribute('data-kind', 'resume');
  await expect(accion).toContainText('Continúa');
  await expect(accion, 'no dice por que ronda ibas').toContainText('Ronda 2 de 2');
  await expect(accion).toContainText('Rondas express');
});

/* ------------------------------------------------------------------ 4 */
test('reanudar vuelve a pasar por el modal de seguridad y entra en SU ronda', async ({ page }) => {
  await irAlArtefacto(page);
  await sembrarRegistro(page, null, 1);
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  await page.locator('[data-pace-sidebar-accion]').getByRole('button').click();

  /* LA MISMA PUERTA QUE EMPEZAR: `Rondas express` lleva `safety: true`, así que
     reanudarla tiene que volver a pedir la confirmación. Si algún día se
     reanudara por un camino propio, esto es lo que se pondría rojo. */
  const modal = overlaySuperior(page);
  await expect(modal.getByRole('button', { name: 'Empezar sesión' }),
    'reanudar se salta el modal de seguridad').toBeVisible();
  await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
  await modal.getByRole('button', { name: 'Empezar sesión' }).click();

  /* Se entra otra vez por la preparación —hay que re-entrar en la respiración,
     no reanudar un vídeo— y al respirar se sigue en la ronda guardada. */
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(page.locator('[data-pace-breathe-phase]')).toBeVisible();
  await expect(page.locator('[data-pace-breathe-round]'),
    'la sesion reanudada no arranca en la ronda guardada').toHaveAttribute('data-pace-breathe-round', '2');

  /* Y el tiempo practicado CONTINÚA: el registro nuevo no puede valer menos que
     el que se sembró, o los minutos ya practicados se habrían perdido. */
  const g = await leerRegistro(page);
  expect(g && g.activeMs, 'la reanudacion reinicio el tiempo practicado').toBeGreaterThanOrEqual(95000);
});

/* ------------------------------------------------------------------ 5 */
test('un registro de hace tres horas ya no se ofrece', async ({ page }) => {
  await irAlArtefacto(page);
  await sembrarRegistro(page, null, 180);
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  const accion = page.locator('[data-pace-sidebar-accion]');
  if (await accion.count()) {
    await expect(accion, 'se ofrece reanudar una sesion caducada').not.toHaveAttribute('data-kind', 'resume');
  }
});
