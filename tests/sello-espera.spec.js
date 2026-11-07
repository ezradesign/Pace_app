/* PACE · E2E · UN SELLO NO PISA NADA (9 oct. 2026)
 * ================================================
 * Ez: «los sellos no deben pisar los elementos». El aviso de un sello nuevo salía en el
 * acto, abajo y por encima de todo: con el primer Pomodoro tapaba el pie de la pausa,
 * «Ahora no» incluido. Ahora espera mientras haya una ventana, una sesión o un
 * Camino abierto (state-core.toast.jsx) y sale al volver a la home.
 *
 * LO QUE NO CAMBIA, y se aserta: el sello se GANA al instante (s145; lo que espera es el
 * aviso) y el aplazamiento de los Caminos (s105) sigue funcionando por la misma cola.
 *
 * El aviso es el `div[aria-live]` de ToastHost (lo mismo que miran checklist-estado y
 * logros-i18n). Se espera 1,5 s antes de mirar que NO está: el buzón deja 0,4 s de respiro y
 * reintenta cada 0,5, así que en 1,5 s un aviso que no esperase ya habría salido. Y ese «no
 * está» se mira UNA vez (`sinAviso`): la negación de `toContainText` reintenta hasta que se
 * cumple, y un aviso que sí salió se va a los 3 s y lo daba por bueno.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, leerUltimoLogro, capturarErrores } = require('./helpers');

const aviso = (page) => page.locator('div[aria-live="polite"][aria-atomic="true"]');
const sinAviso = async (page, porque) => {
  await page.waitForTimeout(1500);
  expect(await aviso(page).textContent(), porque).not.toContain('Nuevo sello');
};

test('el primer Pomodoro: el sello no sale encima de la pausa, se gana igual y sale al cerrarla', async ({ page, context }) => {
  const errores = capturarErrores(page);
  /* «después de cada bloque»: sin día y con «a mi ritmo», el bloque de 15 invita y la ventana
     de la pausa, que es lo que aquí se mira, espera a la media hora (22 oct.) */
  await sembrar(context, { focusMinutes: 15, ejercicioBloques: 'cada' });
  /* A las 10 de hoy, y no a la hora que sea: el bloque adelanta el reloj 15 min y, si acaba
     entre las 14:00 y las 14:59, gana también «Pausa de mediodía» (secret.lunch), que pasa a
     ser el último sello. Así cayó la suite empezada a las 13:28. Hoy, porque `sembrar` siembra
     las fechas de hoy; por eso un día señalado (primer lunes del mes, solsticio) aún puede
     sumar su sello secreto y caer. */
  const aLasDiez = new Date(); aLasDiez.setHours(10, 0, 0, 0);
  await page.clock.install({ time: aLasDiez });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await page.waitForTimeout(250);
  for (let i = 0; i < 20; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  await expect(page.locator('[data-pace-break-shortcut]'), 'GUARD: no se abrió la pausa').toHaveCount(1);
  /* se ha ganado (s145), pero el aviso espera */
  await expect.poll(() => leerUltimoLogro(page), { message: 'GUARD: el primer Pomodoro no ganó su sello' }).toBe('first.step');
  await sinAviso(page, 'el sello sale encima de la pausa');
  await page.getByRole('button', { name: 'Ahora no', exact: true }).click();
  await expect(aviso(page), 'al cerrar la pausa el sello no sale').toContainText('Primer paso');
  /* y en la home sale DENTRO del aro, en el sitio de su línea en cursiva, que se esconde (Ez) */
  await expect(page.locator('[data-pace-sello-aro]'), 'el sello no sale dentro del aro').toBeVisible();
  expect(await page.locator('[data-pace-dial-subtitle]').evaluate((e) => getComputedStyle(e).visibility),
    'la línea del aro sigue a la vista debajo del sello').toBe('hidden');
  expect(errores).toEqual([]);
});

test('durante una sesión el sello espera, y sale al volver a la home', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Box 4·4·4·4', exact: true }).click();
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion, 'GUARD: no se abrió la sesión').toHaveCount(1);
  await page.evaluate(() => showToast({ id: 'first.step', type: 'achievement' }));
  await sinAviso(page, 'el sello sale encima de la sesión');
  await page.keyboard.press('Escape');
  await expect(sesion, 'GUARD: la sesión no se cerró').toHaveCount(0);
  await expect(aviso(page), 'de vuelta en la home el sello no sale').toContainText('Primer paso');
});

test('el aplazamiento de los Caminos sigue: el sello espera a que se cierre su pantalla', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.evaluate(() => { setCaminoUiActive(true); showToast({ id: 'first.step', type: 'achievement' }); });
  await sinAviso(page, 'el sello sale encima de un Camino');
  await page.evaluate(() => setCaminoUiActive(false));
  await expect(aviso(page), 'al salir del Camino el sello no sale').toContainText('Primer paso');
});

/* UNA VENTANA QUE SE ABRE CON EL SELLO YA A LA VISTA (recorrido del 6 nov. 2026). El aviso esperaba
   a que no hubiera nada abierto para SALIR, pero una vez fuera se quedaba sus tres segundos por
   encima de todo (z 200): quien volvía de una sesión y tocaba enseguida «Hacer la pausa» o un
   módulo leía «Nuevo sello · 50 horas de foco» encima del título de «Antes de empezar» y luego
   encima del runner. Y el siguiente sello de la fila salía igual, con la ventana abierta. */
test('el sello del aro se esconde si se abre una ventana encima, y el siguiente espera a que se cierre', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.evaluate(() => ['first.step', 'first.sip'].forEach((id) => showToast({ id, type: 'achievement' })));
  const sello = page.locator('[data-pace-sello-aro]');
  await expect(sello, 'GUARD: el primer sello no sale en el aro').toContainText('Primer paso');
  await page.getByRole('button', { name: /^Mueve/ }).click();
  await expect(page.locator('[data-pace-modal-backdrop]'), 'GUARD: no se abrió la biblioteca').toHaveCount(1);
  /* Una lectura, no `toBeHidden`: esa reintenta y acaba en verde cuando el sello se va solo. */
  await page.waitForTimeout(300);
  expect(await sello.isVisible(), 'el sello se pinta encima de la biblioteca').toBe(false);
  /* El primero se acaba (3 s y su fundido): el segundo no sale mientras la biblioteca siga abierta. */
  await page.waitForTimeout(4200);
  expect(await aviso(page).textContent(), 'el segundo sello sale encima de la biblioteca').not.toContain('Primer sorbo');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-pace-modal-backdrop]'), 'GUARD: la biblioteca no se cerró').toHaveCount(0);
  await expect(aviso(page), 'al cerrar la biblioteca el segundo sello no sale').toContainText('Primer sorbo');
  await expect(sello).toBeVisible();
});
