/* PACE · E2E · ENCENDER «AUTO» A MITAD DE UNA SERIE NO DA NADA POR HECHO (revisión de ChatGPT del 5 nov. 2026)
 * ============================================================================================================
 * Sin «Auto», el reloj del paso sigue corriendo aunque la pantalla enseñe el objetivo de repeticiones
 * («a tu ritmo»). Al encenderlo, el efecto de avance comparaba ese tiempo con el objetivo guiado y daba
 * la serie por hecha al instante, acreditando todas las repeticiones: «solo quería volver a activar la
 * guía; no decir que ya había acabado».
 *
 * Ahora, encender «Auto» dentro de una serie de repeticiones empieza la guía desde el principio de la
 * serie: no cambia de paso ni acredita nada, y la cuenta sale entera.
 *
 * «Empuje sencillo»: 5 flexiones a 4 s cada una (2 + 0 + 2), o sea 20 s guiados por serie. Sin «Auto»
 * se dejan pasar 30 s, más que la serie entera, y entonces se enciende.
 *
 * El reloj va instalado: `runFor` hace correr los relojes del runner.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

async function abrirRutina(page, id) {
  await page.getByRole('button', { name: /^Mueve/ }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click(), id);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar/i.test(x.textContent || '')).click();
  });
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
}
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');
const nombre = (page) => page.locator('[data-pace-v1-name]').textContent();
const numero = async (page) => (await page.locator('[data-pace-v1-num]').textContent()).trim();
const auto = (page) => page.locator('[data-pace-v1-auto]');
async function hasta(page, cond, maxSeg) {
  for (let i = 0; i < (maxSeg || 60); i++) { if (await cond()) return true; await page.clock.runFor(1000); }
  return cond();
}

test('encender «Auto» tras pasar de largo el objetivo no termina la serie: la guía empieza desde el principio', async ({ page, context }) => {
  await sembrar(context, { cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await abrirRutina(page, 'extra.desk.pushups');
  await expect(auto(page)).toHaveAttribute('aria-pressed', 'false');

  /* Sin Auto: colocarse espera a «›», y la serie corre a tu ritmo, más allá de sus 20 s guiados. */
  expect(await hasta(page, async () => (await numero(page)) === '0', 40)).toBe(true);
  await page.locator('[data-pace-v1-btn="next"]').click();
  expect(await fase(page)).toBe('work');
  expect(await nombre(page)).toBe('Flexiones inclinadas');
  await page.clock.runFor(30000);
  expect(await fase(page), 'sin Auto la serie no pasa sola').toBe('work');

  await auto(page).click();
  await expect(auto(page)).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(1000);
  expect(await fase(page), 'encender Auto dio la serie por hecha y pasó al descanso').toBe('work');
  expect(await nombre(page)).toBe('Flexiones inclinadas');
  expect(await numero(page), 'la guía no empezó desde la primera repetición').toBe('1');

  /* Y la guía corre entera: a los 10 s va por la tercera (4 s cada una) y sigue en su serie... */
  await page.clock.runFor(9000);
  expect(await fase(page)).toBe('work');
  expect(await numero(page)).toBe('3');
  /* ...hasta sus 20 s, cuando sí pasa sola al descanso. */
  expect(await hasta(page, async () => (await fase(page)) === 'rest', 15)).toBe(true);
  expect(errores).toEqual([]);
});

test('encender «Auto» con el paso en pausa tampoco acaba la serie: lo que toque, al reanudar y desde el principio', async ({ page, context }) => {
  await sembrar(context, { cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'extra.desk.pushups');
  expect(await hasta(page, async () => (await numero(page)) === '0', 40)).toBe(true);
  await page.locator('[data-pace-v1-btn="next"]').click();
  await page.clock.runFor(30000);
  expect(await fase(page)).toBe('work');

  await page.locator('[data-pace-v1-btn="pausa"]').click();
  await auto(page).click();
  await expect(auto(page)).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(2000);
  expect(await fase(page), 'Auto en pausa avanzó el paso').toBe('work');
  await page.locator('[data-pace-v1-btn="pausa"]').click();   // reanudar: 3, 2, 1
  await page.clock.runFor(4000);
  expect(await fase(page), 'al reanudar se dio la serie por hecha').toBe('work');
  expect(await nombre(page)).toBe('Flexiones inclinadas');
  expect(await numero(page)).toBe('1');
});
