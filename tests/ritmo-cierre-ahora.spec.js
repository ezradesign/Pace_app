/* PACE · E2E · EL CIERRE, COMO CUALQUIER PAUSA (Ez, 2.1 A del 16 nov. 2026)
 *
 * docs/proposals/menores-16nov/. Al acabar el último bloque la ventana proponía el cierre
 * («Para cerrar, despacio»), pero si se tocaba «Ahora no» la home ya decía «Jornada cerrada»
 * y el cierre no se podía hacer desde ella. Ahora el aro cuenta su pausa como cualquier otra:
 *   · «Para cerrar», «Luego, la jornada cerrada», «Hacer la pausa» y «Cerrar la jornada»;
 *   · la tarjeta del día dice «Ahora» con el plato del cierre, y no «Jornada cerrada»;
 *   · «Cerrar la jornada» la corta sin empezar ningún Foco, y pasados sus minutos se cierra sola;
 *   · el cierre del ejercicio no ofrece un bloque que no existe.
 * Contra la 0.207.0 caen las dos primeras: el aro decía «Jornada cerrada» nada más acabar el último
 * bloque. Las otras dos guardan lo que no cambia: el cierre se acaba solo, y sin bloque detrás.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior, terminarBloque } = require('./helpers');

const HOY = '2026-11-18';
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+01:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const ESTADO = { ritmo: { horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
  dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } };

/* De 15:10 a 17:00 caben dos bloques y el cierre: se hacen los dos y se cierra la ventana del último. */
async function hastaElCierre(page, context) {
  await sembrar(context, ESTADO);
  await page.clock.install({ time: a('15:10') });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
  await terminarBloque(page);
  await overlaySuperior(page).getByRole('button', { name: 'Ahora no', exact: true }).click();
  await vis(page, '[data-pace-aro-seguir]').click();
  await expect(vis(page, '[data-pace-dial-label]'), 'GUARD: el bloque 2 es el último').toHaveText('Bloque 2 de 2');
  await terminarBloque(page);
  await expect(overlaySuperior(page), 'GUARD: la ventana del último bloque propone el cierre').toContainText('Para cerrar');
  await overlaySuperior(page).getByRole('button', { name: 'Ahora no', exact: true }).click();
  await page.waitForTimeout(300);
  return page.evaluate(() => ritmoPlan(getState()).m.items.filter((it) => it.tipo === 'cierre').pop().platos[0].name);
}

test('tras el último bloque, el aro cuenta el cierre y la home lo propone como cualquier pausa', async ({ page, context }) => {
  const errores = capturarErrores(page);
  const plato = await hastaElCierre(page, context);
  await expect(vis(page, '[data-pace-dial-label]'), 'decía «Jornada cerrada»').toHaveText('Para cerrar');
  await expect(vis(page, '[data-pace-dial-subtitle]')).toHaveText('Luego, la jornada cerrada');
  await expect(vis(page, '[data-pace-cta]')).toHaveText('Hacer la pausa');
  await expect(vis(page, '[data-pace-aro-seguir]')).toHaveText('Cerrar la jornada');
  await expect(vis(page, '[data-pace-ritmo-estado="hecho"]'), 'la tarjeta no dice todavía «Jornada cerrada»').toHaveCount(0);
  await expect(vis(page, '[data-pace-ritmo-panel]')).toContainText(plato);
  expect(errores).toEqual([]);
});

test('«Cerrar la jornada» corta el cierre sin empezar ningún Foco', async ({ page, context }) => {
  await hastaElCierre(page, context);
  await vis(page, '[data-pace-aro-seguir]').click();
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Jornada cerrada');
  await expect(vis(page, '[data-pace-cta]')).toHaveText('Seguir por libre');
  await expect(vis(page, '[data-pace-ritmo-estado="hecho"]')).toContainText('Jornada cerrada');
  expect(await page.evaluate(() => localStorage.getItem('pace.timer.v1')), 'ningún bloque en marcha').toBeNull();
});

test('pasados sus minutos, el cierre se acaba solo y el día queda cerrado', async ({ page, context }) => {
  await hastaElCierre(page, context);
  await page.clock.fastForward(5 * 60 * 1000 + 2000);
  await page.waitForTimeout(500);
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Jornada cerrada');
  await expect(vis(page, '[data-pace-ritmo-estado="hecho"]')).toContainText('Jornada cerrada');
});

test('con el cierre contando, el fin de un ejercicio no ofrece un bloque que no existe', async ({ page, context }) => {
  await hastaElCierre(page, context);
  const sigue = await page.evaluate(() => paceCierreSigue());
  expect(sigue, 'sin bloque detrás, el cierre del ejercicio vuelve al inicio').toBeNull();
});
