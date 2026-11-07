/* PACE · con «reducir movimiento», lo que se mueve en bucle se queda quieto (7 nov. 2026)
 * =======================================================================================
 * El kill de `prefers-reduced-motion` (app/motion.css) aplastaba la DURACIÓN de cada
 * animación a 0,01 ms y nada más. Una animación infinita no se para así: da cien mil vueltas
 * por segundo y cada fotograma pinta un punto cualquiera de ella. Medido en la auditoría de
 * accesibilidad del 7 nov. sobre la 0.192.0: en la retención de Rondas express, el círculo de
 * «Retén sin aire» saltaba entre 0,96 y 1,05 de tamaño de un fotograma a otro, justo a quien
 * pidió que nada se moviera. Ahora el kill también deja cada animación en UNA vuelta.
 *
 * El círculo que guía la respiración no entra aquí: va marcado como esencial
 * (`data-pace-essential`, WCAG 2.3.3) y sigue respirando a propósito.
 *
 * Trampas, las de respira-espacio.spec.js: el reloj se instala antes de `goto` y se avanza
 * de segundo en segundo, porque el ticker se resuscribe por fase.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(12); }
}

test('la retención de Respira no tiembla: ninguna animación sigue en bucle', async ({ page, context }) => {
  await sembrar(context, { soundOn: false });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await irAlArtefacto(page);
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), 'GUARD: reduced-motion no está activo').toBe(true);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Rondas express', exact: true }).click();
  const modal = overlaySuperior(page);
  await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
  await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  const sesion = page.locator('[data-pace-session-root]');
  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
  let enHold = false;
  for (let s = 0; s < 130 && !enHold; s++) {
    enHold = await page.evaluate(() => /RETÉN SIN AIRE/i.test(document.body.innerText || ''));
    if (!enHold) await segundos(page, 1);
  }
  expect(enHold, 'la sesión no llegó a la retención').toBe(true);

  /* GUARD: el círculo de la retención está y lleva su pulso; sin él, la prueba no mide nada. */
  const pulso = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-pace-session-root] *')].find((e) => (e.style.animation || '').includes('pace-hold-pulse'));
    return el ? getComputedStyle(el).animationIterationCount : null;
  });
  expect(pulso, 'GUARD: no se encontró el círculo de «Retén»').not.toBeNull();
  expect(pulso, 'el pulso de «Retén» sigue en bucle con reduced-motion').toBe('1');

  /* Y en la página entera: nada decorativo que siga dando vueltas. */
  const enBucle = await page.evaluate(() => document.getAnimations()
    .filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations === Infinity)
    .filter((a) => !(a.effect.target && a.effect.target.closest && a.effect.target.closest('[data-pace-essential]')))
    .map((a) => a.animationName || String(a)));
  expect(enBucle).toEqual([]);
});
