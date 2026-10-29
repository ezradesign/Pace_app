/* PACE · lo que dice un paso cabe en su tiempo (R4 y R6 de ChatGPT, 28 oct. 2026)
 * =================================================================================
 * R4. «Glúteos invisibles», paso 3: «aguanta unos diez segundos y suelta. Tres veces» en 30 s no
 *     cabe con un respiro entre aguantes. Se lee la frase que SE VE en el runner, en los dos
 *     idiomas, y la cuenta con la que empieza el paso.
 * R6. «4·7·8» dice 1 min y son cuatro ciclos de 19 s: acaba a los 76 s, y la barra estaba llena
 *     desde los 60. La barra se mide contra el final de verdad.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior, capturarErrores } = require('./helpers');

async function abrirRutina(page, biblioteca, id) {
  await page.getByRole('button', { name: new RegExp('^' + biblioteca) }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click(), id);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar|^\s*Start/i.test(x.textContent || '')).click();
  });
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
}
const pasoActual = async (page) => +(await page.getByText(/^(Paso|Step) \d+ (de|of) \d+$/).first().textContent()).match(/(?:Paso|Step) (\d+)/)[1] - 1;

const NUMEROS = { cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, doce: 12, quince: 15,
  five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, fifteen: 15 };
const VECES = { dos: 2, tres: 3, cuatro: 4, two: 2, three: 3, four: 4 };

for (const [lang, biblio] of [['es', 'Mueve'], ['en', 'Move']]) {
  test(`cabe-1 · Glúteos invisibles (${lang}): los aguantes y sus respiros caben en la cuenta del paso`, async ({ page, context }) => {
    await sembrar(context, { cuerpoAuto: false, lang });
    await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
    await irAlArtefacto(page);
    await abrirRutina(page, biblio, 'extra.glutes.stealth');
    for (let i = 0; i < 10 && (await pasoActual(page)) < 2; i++) {
      await page.locator('[data-pace-v1-btn="next"]').click();
      await page.clock.runFor(200);
    }
    expect(await pasoActual(page)).toBe(2);
    if ((await page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase')) === 'place') {
      await page.locator('[data-pace-v1-btn="next"]').click();
    }
    const frase = (await page.locator('[data-pace-v1-cue]').textContent()).trim().toLowerCase();
    const cuenta = +(await page.locator('[data-pace-v1-num]').textContent()).trim();
    const seg = frase.match(/(\d+|[a-z]+) (?:segundos|seconds)/);
    const veces = frase.match(/(dos|tres|cuatro|two|three|four) (?:veces|times)/);
    expect(seg && veces, `GUARD: la frase ya no dice cuánto ni cuántas veces: «${frase}»`).toBeTruthy();
    const s = /^\d+$/.test(seg[1]) ? +seg[1] : NUMEROS[seg[1]];
    const n = VECES[veces[1]];
    /* Al menos 2 s entre aguantes para soltar y respirar. */
    const necesita = n * s + (n - 1) * 2;
    expect(necesita, `«${frase}» pide ${necesita} s y el paso cuenta ${cuenta}`).toBeLessThanOrEqual(cuenta);
  });
}

test('cabe-2 · 4·7·8: la barra no se llena antes de acabar', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install();
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: '4·7·8', exact: true }).click();
  const modal = overlaySuperior(page);
  if (await modal.getByRole('button', { name: 'Empezar sesión' }).count()) {
    await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  const sesion = page.locator('[data-pace-session-root]');
  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(page.locator('[data-pace-breathe-phase]')).toBeVisible();
  /* De segundo en segundo (un salto grande deja la sesión quieta), y la barra en cada uno. */
  const muestras = [];
  for (let s = 0; s < 100; s++) {
    const m = await page.evaluate(() => {
      const b = document.querySelector('[data-pace-breathe-progress]');
      return { p: b ? +b.getAttribute('data-pace-breathe-progress') : null, done: !!document.querySelector('[data-pace-session-done]') };
    });
    if (m.done) break;
    muestras.push(m.p);
    await page.clock.fastForward(1000);
  }
  const llenas = muestras.filter((p) => p >= 0.999).length;
  expect(muestras.length, 'GUARD: no acabó en 100 s').toBeLessThan(100);
  expect(muestras.length, 'GUARD: acabó antes de cuatro ciclos').toBeGreaterThanOrEqual(70);
  /* Llena como mucho el último segundo, no los 16 últimos. */
  expect(llenas, `la barra estuvo llena ${llenas} s antes de acabar`).toBeLessThanOrEqual(2);
  expect(errores).toEqual([]);
});
