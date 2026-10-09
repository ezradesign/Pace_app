/* PACE · E2E · «HAY UNA VERSIÓN NUEVA» SOLO CUANDO LA HAY (también en Safari)
 * =========================================================================
 * La primera vez que alguien abría PACE en Safari, de iPhone o de Mac, salía
 * enseguida «Hay una versión nueva de PACE» tapando el pie de la home. En
 * Chromium no pasaba. Safari avisa de que el worker está 'installed' cuando ya
 * se ha activado y ha reclamado la página: el registro de PACE.html miraba en
 * ese momento `navigator.serviceWorker.controller`, lo veía puesto y tomaba la
 * primera instalación por una actualización (con `reg.waiting` aún apuntando
 * al worker nuevo).
 *
 * Este archivo corre en los dos motores (`*.safari.spec.js`, ver
 * playwright.config.js). Es una carrera: contra v0.150.1 la primera prueba
 * falla en WebKit 5 de cada 8 veces; con el arreglo, 30 de 30 en verde.
 * La segunda es el control del otro lado: con la página ya controlada, un
 * worker nuevo que queda esperando SÍ tiene que anunciarse (s102: «NO
 * reintroducir el skipWaiting incondicional — mata el prompt»; un arreglo que
 * callara el aviso siempre también pasaría la primera). La versión nueva se
 * simula registrando el MISMO sw.js con otra dirección: el navegador lo trata
 * como un script distinto, lo instala y lo deja en espera. Cambiar sw.js con
 * `route` no sirve: Playwright no intercepta el script de un service worker.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

/* Espera a que el worker de la primera visita esté activado y controle la
   página. Lo que tuviera que anunciarse ya se habría anunciado: en WebKit el
   anuncio falso llegaba ANTES del `controllerchange`. */
async function workerAsentado(page) {
  await page.waitForFunction(async () => {
    if (!navigator.serviceWorker.controller) return false;
    const reg = await navigator.serviceWorker.getRegistration();
    return !!(reg && reg.active && reg.active.state === 'activated' && !reg.installing);
  }, null, { timeout: 20_000 });
  await page.waitForTimeout(500);
}

test('la primera visita no dice que haya una versión nueva', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await workerAsentado(page);
  expect(await page.evaluate(() => !!window.__paceSwWaitingReg)).toBe(false);
  await expect(page.locator('[data-pace-update-prompt]')).toHaveCount(0);
});

test('con la página ya controlada, un worker nuevo en espera sí se anuncia', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await workerAsentado(page);
  /* Segunda visita: la página carga ya controlada, como la de cualquiera que
     vuelve después de un despliegue. */
  await irAlArtefacto(page);
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await page.evaluate(() => navigator.serviceWorker.register('sw.js?prueba=version-nueva'));
  await expect(page.locator('[data-pace-update-prompt]')).toBeVisible({ timeout: 15_000 });
  expect(await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting)).toBe(true);
});
