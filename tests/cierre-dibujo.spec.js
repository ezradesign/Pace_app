/* PACE · E2E · EL DIBUJO DEL CIERRE DE MUEVE Y ESTIRA CRECE CON LA PANTALLA (v0.167.0)
 * ===================================================================================
 * Ez (14 oct. 2026): en el cierre de Estira el dibujo de la rutina salía a 72 px, unos
 * 90 en su pantalla de 1920×1080 al 125 %, con mucho aire alrededor. Eligió la B
 * viendo fotos de la app real: el dibujo usa el alto que sobra, de 120 a 216 px en
 * escritorio y de 72 a 140 en el móvil, y nunca pide scroll. Respira sigue a 72.
 *
 * Contra v0.166.0 cae: el dibujo mide 72 en todas las pantallas.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

async function hastaElCierre(page, context) {
  await sembrar(context);
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Estira/ }).first().click();
  await overlaySuperior(page).getByRole('heading', { name: 'Escritorio express', exact: true }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  const done = page.locator('[data-pace-session-done]');
  for (let s = 0; s < 400 && !(await done.count()); s++) { await page.clock.fastForward(1000); await page.waitForTimeout(8); }
  await expect(done, 'GUARD: la sesión no llegó al cierre').toHaveCount(1);
}

const medir = (page) => page.evaluate(() => {
  const g = document.querySelector('[data-pace-session-done-glifo]');
  const c = document.querySelector('[data-pace-session-center]');
  return { lado: g ? Math.round(paceCaja(g).height) : 0, sobra: c.scrollHeight - c.clientHeight };
});

/* [ancho, alto, tamaño esperado] */
for (const [w, h, lado] of [[1536, 864, 216], [1280, 720, 120], [360, 640, 140]]) {
  test('Estira · el dibujo del cierre mide ' + lado + ' px a ' + w + '×' + h + ' y no pide scroll', async ({ page, context }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await hastaElCierre(page, context);
    const m = await medir(page);
    expect(m.lado, 'el dibujo no crece con la pantalla').toBe(lado);
    expect(m.sobra, 'el cierre pide scroll').toBeLessThanOrEqual(1);
  });
}
