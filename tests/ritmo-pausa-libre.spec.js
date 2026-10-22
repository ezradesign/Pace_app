/* PACE · E2E · «HOY VOY POR LIBRE» EN PLENA PAUSA DEL DÍA (auditoría del 21 oct. 2026)
 * ===================================================================================
 * Al acabar un bloque de «A tu ritmo», el aro cuenta su pausa en modo «Pausa» o «Larga»
 * (ritmo-pausa-entera.spec.js). «Hoy voy por libre» retiraba el día sin cerrarla: el aro
 * seguía en «Pausa» como si la hubieras elegido a mano y, al acabar, no volvía al foco.
 * «Cambiar», que también retira el día, igual. Ahora la pausa del día se cierra con él y
 * el aro vuelve al foco; una pausa elegida a mano en la barra sigue como estaba. Contra
 * v0.174.0 fallan las dos primeras.
 * TRAMPA: el bloque se acaba minuto a minuto (s187).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');
const { esperarInit } = require('./eventos.helpers');

const HOY = '2026-10-14';
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const PERFIL = { profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } };
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const corriendo = (page) => page.locator('[data-pace-dial-fit][data-pace-dial-running]');
const modo = (page) => page.evaluate(() => getState().focusMode);

async function abrir(page, context) {
  await sembrar(context, Object.assign({ soundOn: false, ritmo: { dia: JORNADA } }, PERFIL));
  await page.clock.install({ time: new Date(HOY + 'T09:00:00+02:00') });
  await irAlArtefacto(page);
  await esperarInit(page);
  await page.waitForTimeout(300);
}
/* El primer bloque, hasta que el aro cuenta su pausa (la ventana se salta). */
async function hastaLaPausa(page) {
  await vis(page, '[data-pace-cta]').click();
  await page.waitForTimeout(250);
  for (let i = 0; i < 60 && !(await page.locator('[data-pace-break-shortcut]').count()); i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
  }
  await overlaySuperior(page).getByRole('button', { name: 'Saltar esta pausa', exact: true }).click();
  expect(await modo(page), 'GUARD: el aro cuenta la pausa del día').toBe('pausa');
  await expect(corriendo(page)).toHaveCount(1);
}

for (const [boton, nombre] of [['[data-pace-ritmo-libre]', '«Hoy voy por libre»'], [null, '«Cambiar»']]) {
  test(nombre + ' con el aro en la pausa del día la cierra y el aro vuelve al foco', async ({ page, context }) => {
    await abrir(page, context);
    await hastaLaPausa(page);
    if (boton) await vis(page, boton).click();
    else await vis(page, '[data-pace-ritmo-estado="menu"]').getByRole('button', { name: 'Cambiar', exact: true }).click();
    await expect.poll(() => modo(page), 'el aro vuelve al foco').toBe('foco');
    await expect(corriendo(page), 'sin arrancar nada').toHaveCount(0);
    await expect(vis(page, '[data-pace-cta]')).toHaveText('Empezar foco');
    /* y pasado lo que quedaba de la pausa, nada cambia ni se cuenta */
    await page.clock.fastForward(6 * 60 * 1000);
    await page.waitForTimeout(200);
    expect(await modo(page)).toBe('foco');
    expect(await page.evaluate(() => getState().cycle)).toBe(1);
  });
}

test('CONTROL · una pausa elegida a mano en la barra sigue igual al irte por libre', async ({ page, context }) => {
  await abrir(page, context);
  await page.locator('[data-pace-tabs] button').filter({ hasText: 'Pausa' }).click();
  await vis(page, '[data-pace-cta]').click();
  await expect(corriendo(page)).toHaveCount(1);
  await vis(page, '[data-pace-ritmo-libre]').click();
  await page.waitForTimeout(200);
  expect(await modo(page)).toBe('pausa');
  await expect(corriendo(page)).toHaveCount(1);
});
