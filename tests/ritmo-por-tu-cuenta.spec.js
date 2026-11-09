/* PACE · E2E · «YA LA HICE POR MI CUENTA» (Ez, 4A del 8 nov. 2026; Q5 de las revisiones de ChatGPT)
 * ============================================================================================
 * Quien hacía la pausa a su manera (agua, una vuelta) sin abrir la rutina solo podía pulsar «Seguir
 * con el bloque 2» o «Ahora no», y la pausa quedaba saltada: tres días a la misma hora y la carta
 * proponía acortarla. Ahora la ventana lleva un enlace a la izquierda de «Ahora no», con su mismo
 * estilo, que deja la parada «por tu cuenta»:
 *  · la ventana se cierra y el aro ya no propone «Hacer la pausa»;
 *  · al empezar el bloque no pasa a saltada, y la línea dice «por tu cuenta», sin minutos;
 *  · Estadísticas no le suma tiempo (no hubo sesión) y su tarjeta dice «por tu cuenta»;
 *  · sin «A tu ritmo» la ventana es la de siempre, sin el enlace.
 * Lo del motor (no cuenta como saltada) y el registro, en ritmo-motor.spec.js.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior, terminarBloque } = require('./helpers');

const HOY = '2026-10-14';
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const estado = (page) => page.evaluate(() => (getState().ritmo.dia.estados || {})[1] || null);

async function hastaLaVentana(page, context, extra) {
  await sembrar(context, Object.assign({ ritmo: { horario: HORARIO, dia: JORNADA } }, extra || {}));
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
  await vis(page, '[data-pace-cta]').first().click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
}

test('el enlace va a la izquierda de «Ahora no», con su estilo, y deja la pausa por tu cuenta sin saltarla', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await hastaLaVentana(page, context);
  const ventana = overlaySuperior(page);
  const enlace = ventana.locator('[data-pace-break-cuenta]');
  const ahoraNo = ventana.getByRole('button', { name: 'Ahora no', exact: true });
  await expect(enlace).toHaveText('Ya la hice por mi cuenta');
  const [e, n] = [await enlace.boundingBox(), await ahoraNo.boundingBox()];
  expect(Math.abs(e.y - n.y), 'en la misma fila').toBeLessThanOrEqual(2);
  expect(e.x + e.width, 'a la izquierda de «Ahora no»').toBeLessThan(n.x);
  expect(await enlace.getAttribute('class')).toBe(await ahoraNo.getAttribute('class'));

  await enlace.click();
  await expect(page.locator('[data-pace-break-shortcut]'), 'la ventana no se cierra').toHaveCount(0);
  expect(await estado(page)).toBe('cuenta');
  /* El aro ya no insiste en «Hacer la pausa»: el botón empieza el bloque. */
  await expect(vis(page, '[data-pace-cta]')).toHaveText('Empezar ya el bloque 2');
  await vis(page, '[data-pace-cta]').click();
  await page.waitForTimeout(400);
  expect(await estado(page), 'al empezar el bloque pasaba a saltada').toBe('cuenta');
  const parada = vis(page, '[data-pace-ritmo-estado-parada="cuenta"]');
  await expect(parada).toHaveCount(1);
  await expect(parada).toContainText('por tu cuenta');
  await expect(parada).not.toContainText('min');
  /* No hubo sesión: nada de minutos de cuerpo ni de Respira. */
  const hoy = await page.evaluate(() => { const h = selectSidebarToday(getState()); return [h.bodyMinutes, h.breatheMinutes]; });
  expect(hoy).toEqual([0, 0]);
  expect(errores).toEqual([]);
});

test('Estadísticas no le suma minutos y su tarjeta dice «por tu cuenta»', async ({ page, context }) => {
  await hastaLaVentana(page, context);
  await overlaySuperior(page).locator('[data-pace-break-cuenta]').click();
  await vis(page, '[data-pace-cta]').click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  const tarjeta = vis(page, '[data-pace-hoy-parada="cuenta"]');
  await expect(tarjeta).toHaveCount(1);
  await expect(tarjeta).toContainText('por tu cuenta');
  await expect(tarjeta, 'Estadísticas le ponía minutos').not.toContainText('min');
  await expect(vis(page, '[data-pace-hoy-parada="saltada"]')).toHaveCount(0);
});

test('en inglés, en el móvil: «I did it my own way» cabe junto a «Not now»', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await hastaLaVentana(page, context, { lang: 'en', sidebarCollapsed: true });
  const ventana = overlaySuperior(page);
  const enlace = ventana.locator('[data-pace-break-cuenta]');
  await expect(enlace).toHaveText('I did it my own way');
  const [e, n] = [await enlace.boundingBox(), await ventana.getByRole('button', { name: 'Not now', exact: true }).boundingBox()];
  expect(e.x + e.width, 'se pisan').toBeLessThan(n.x);
  expect(n.x + n.width, 'se sale de la pantalla').toBeLessThanOrEqual(360);
  await enlace.click();
  await vis(page, '[data-pace-cta]').click();
  await page.waitForTimeout(300);
  expect(await estado(page)).toBe('cuenta');
});

test('CONTROL · sin «A tu ritmo» la ventana es la de siempre, sin el enlace', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  await vis(page, '[data-pace-cta]').first().click();
  await terminarBloque(page);
  await expect(overlaySuperior(page).getByRole('button', { name: 'Ahora no', exact: true })).toBeVisible();
  await expect(page.locator('[data-pace-break-cuenta]')).toHaveCount(0);
});
