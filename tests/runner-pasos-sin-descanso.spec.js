/* PACE · E2E · EL RUNNER CUENTA LOS PASOS COMO «PREPÁRATE» Y EL CIERRE (Ez, 6A del 18 nov. 2026)
 * ============================================================================================
 * «Prepárate» y el cierre cuentan los ejercicios, sin descansos (Espalda de pie, 4). El runner decía «Paso 1 de
 * 5», con el descanso como paso 2. Ahora «Paso 1 de 4», y en el descanso, «Descanso» sin número.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior, MEDIODIA } = require('./helpers');

const cabecera = (page) => page.evaluate(() => {
  const raiz = document.querySelector('[data-pace-session-root]');
  if (!raiz) return null;
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) { const v = n.nodeValue.trim(); if (/^(Paso \d+ de \d+|Descanso)$/.test(v)) return v; }
  return null;
});

test('Espalda de pie: «Paso 1 de 4» y, en el descanso, «Descanso»', async ({ page, context }) => {
  await sembrar(context, { soundOn: false });
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Estira' }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
  await page.getByRole('heading', { name: 'Espalda de pie' }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar ahora' }).click();
  await expect.poll(() => cabecera(page)).toBe('Paso 1 de 4');
  const pasos = await page.evaluate(() => Object.values(window.EXTRA_ROUTINES).flatMap((g) => g.items)
    .find((r) => r.name === 'Espalda de pie').steps.map((s) => s.mode));
  expect(pasos, 'GUARD: Espalda de pie lleva un descanso').toContain('rest');
  let vista = null;
  for (let s = 0; s < 400 && vista !== 'Descanso'; s++) { await page.clock.fastForward(1000); await page.waitForTimeout(15); vista = await cabecera(page); }
  expect(vista, 'en el descanso, sin número').toBe('Descanso');
});
