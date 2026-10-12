/* PACE · E2E · RESPIRA ENTRA EN LA CUENTA ATRÁS Y SALE DESPACIO (v0.156.0)
 * =======================================================================
 * Ez (12 oct. 2026): «en los ejercicios de Respira el drone y la voz a veces
 * entran una respiración después de empezar, y acaban de manera muy brusca».
 * Las causas, medidas en el código de v0.155.0:
 *   · la voz solo se precargaba al pedir su primera señal, en la primera
 *     respiración: esa sonaba con el sintetizador y la voz entraba en la segunda;
 *   · la música no arrancaba en la cuenta atrás: se descargaba, descodificaba y
 *     subía DESPUÉS de empezar la primera fase;
 *   · al terminar, música y drone se apagaban en 0,8 s mientras saltaba el cierre.
 * Ez eligió «el arreglo con entrada y salida» (como las sesiones guiadas que tomó
 * de referencia): en la cuenta atrás se piden las voces y la música entra despacio,
 * y al terminar se va en 6 s.
 *
 * Contra v0.155.0 caen las dos: en la cuenta atrás no se pide ninguna voz ni suena
 * la música, y al terminar se apaga en 800 ms.
 *
 * NO CUBRE si se OYE ni cómo: Playwright no escucha. Lo escuchó Ez en la app.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrarPisando, irAlArtefacto, overlaySuperior } = require('./helpers');

test.beforeEach(async ({ context }) => {
  await sembrarPisando(context, { soundOn: true, musicOn: true, ambientOn: false, voiceOn: true });
});

test('en la cuenta atrás ya se piden las voces y la música ya suena', async ({ page }) => {
  const voces = [];
  page.on('request', (r) => { if (r.url().indexOf('/app/breathe/voz/') !== -1) voces.push(r.url()); });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  /* Box 4·4·4·4: sin aviso de seguridad y con fases de 4 s, donde la voz cabe. */
  await overlaySuperior(page).getByRole('heading', { name: 'Box 4·4·4·4', exact: true }).click();
  const empezar = overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true });
  if (await empezar.count()) await empezar.click();
  const prep = page.locator('[data-pace-session-prep]');
  await expect(prep, 'GUARD: no se ve la cuenta atrás').toBeVisible();

  /* La cuenta atrás dura 3 s: todo esto tiene que pasar ANTES de la primera fase. */
  await expect.poll(() => page.evaluate(() => window.paceMusica.isActive()),
    { timeout: 2000, message: 'la música no arranca en la cuenta atrás' }).toBe(true);
  expect(voces.length, 'en la cuenta atrás no se ha pedido ninguna voz').toBeGreaterThan(0);
  await expect(prep, 'la cuenta atrás ya había terminado: lo de arriba no prueba la entrada').toBeVisible();
});

test('al terminar, la música se va despacio, no en un golpe', async ({ page }) => {
  await page.clock.install();
  await irAlArtefacto(page);
  /* Se apunta con qué fundido se apaga cada capa al llegar al cierre. */
  await page.evaluate(() => {
    window.__salidas = [];
    const envolver = (obj, nombre) => {
      const orig = obj.stop.bind(obj);
      obj.stop = (ms) => { window.__salidas.push({ capa: nombre, ms: ms, activa: obj.isActive() }); return orig(ms); };
    };
    envolver(window.paceMusica, 'música');
  });
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await overlaySuperior(page).getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).click();
  const empezar = overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true });
  if (await empezar.count()) await empezar.click();
  const sesion = page.locator('[data-pace-session-root]');
  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
  await expect.poll(() => page.evaluate(() => window.paceMusica.ultimo.motivo), { timeout: 10_000 }).toBe('sonando');
  const done = sesion.locator('[data-pace-session-done]');
  for (let s = 0; s < 300 && !(await done.count()); s++) {
    await page.clock.fastForward(1000); await page.waitForTimeout(10);
  }
  await expect(done, 'GUARD: la sesión no llegó al cierre').toHaveCount(1);
  const salidas = await page.evaluate(() => window.__salidas);
  const alCierre = salidas.find((x) => x.activa);
  expect(alCierre, 'GUARD: la música no se apagó al llegar al cierre').toBeTruthy();
  expect(alCierre.ms, 'la música se apaga de golpe al terminar').toBeGreaterThanOrEqual(5000);
});
