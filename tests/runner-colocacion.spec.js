/* PACE · la colocación escrita se ve (B4 de la revisión de ChatGPT del 28 oct. 2026)
 * ====================================================================================
 * Seis pasos tenían su colocación escrita y nunca salía: tres primeros pasos con reloj («Silla
 * sin ruedas…» de Core silencioso, el isquio de pie, los hombros y rodar hacia abajo) y dos
 * ejercicios NUEVOS que llegan tras un descanso (Elevación de talones y la Pica). Es de
 * seguridad: lo que dice la colocación es dónde y cómo apoyarse. Otra serie del MISMO ejercicio
 * tras el descanso no la repite.
 *
 * Se mira el texto que se VE en pantalla (`[data-pace-v1-cue]`), no el dato. «Auto» va apagado
 * para que cada cuenta espere y se pueda leer con calma; el reloj va instalado.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

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
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');
const cue = async (page) => (await page.locator('[data-pace-v1-cue]').textContent()).trim();
/* El paso en curso sale de «Paso n de N», en la cabecera. */
const pasoActual = async (page) => {
  const m = (await page.getByText(/^(Paso|Step) \d+ (de|of) \d+$/).first().textContent()).match(/(?:Paso|Step) (\d+)/);
  return +m[1] - 1;
};
async function irAlPaso(page, idx) {
  for (let i = 0; i < 40 && (await pasoActual(page)) < idx; i++) {
    await page.locator('[data-pace-v1-btn="next"]').click();
    await page.clock.runFor(200);
  }
  expect(await pasoActual(page)).toBe(idx);
}
/* La frase escrita del paso, en castellano, para compararla con la que se ve. */
const datoSetup = (page, id, idx) => page.evaluate(([id, idx]) => {
  const grupos = [window.MOVE_ROUTINES, window.EXTRA_ROUTINES];
  for (const g of grupos) for (const k of Object.keys(g)) for (const r of g[k].items) {
    if (r.id === id) return r.steps[idx].instruction.setup;
  }
  return null;
}, [id, idx]);

const CASOS = [
  ['Mueve', 'extra.core.stealth', 0, 'primer paso con reloj: «Silla sin ruedas»'],
  ['Estira', 'move.hamstrings.standing', 0, 'primer paso por lados'],
  ['Estira', 'move.desk.quick', 0, 'primer paso con reloj'],
  ['Estira', 'move.back.standing', 0, 'primer paso con reloj'],
  ['Mueve', 'extra.chair.squats', 4, 'ejercicio nuevo tras un descanso'],
  ['Mueve', 'extra.push.ladder', 2, 'la Pica, tras un descanso'],
];

for (const [biblio, id, idx, que] of CASOS) {
  test(`colocacion · ${id} paso ${idx + 1} (${que}): su colocación se ve antes de empezar`, async ({ page, context }) => {
    await sembrar(context, { cuerpoAuto: false });
    await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
    const errores = capturarErrores(page);
    await irAlArtefacto(page);
    await abrirRutina(page, biblio, id);
    await irAlPaso(page, idx);
    const esperado = await datoSetup(page, id, idx);
    expect(esperado, 'GUARD: el paso ya no tiene colocación escrita').toBeTruthy();
    expect(await fase(page), 'entra directo a trabajar, sin colocarse').toBe('place');
    expect(await cue(page)).toBe(esperado);
    /* Y se puede leer: sin Auto la cuenta espera en 0 con la frase a la vista. */
    await page.clock.runFor(30000);
    expect(await fase(page)).toBe('place');
    await expect(page.locator('[data-pace-v1-cue]')).toBeVisible();
    expect(await cue(page)).toBe(esperado);
    expect(errores).toEqual([]);
  });
}

test('colocacion · otra serie del mismo ejercicio tras el descanso no repite «colócate»', async ({ page, context }) => {
  await sembrar(context, { cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Mueve', 'extra.chair.squats');
  /* Paso 3: la segunda serie de Sentadilla a silla. Paso 7: la segunda de Elevación de talones. */
  await irAlPaso(page, 2);
  expect(await fase(page)).toBe('work');
  await irAlPaso(page, 4);
  expect(await fase(page), 'GUARD: el ejercicio nuevo no se coloca').toBe('place');
  await irAlPaso(page, 6);
  expect(await fase(page)).toBe('work');
});

test('colocacion · en inglés también se ve la suya', async ({ page, context }) => {
  await sembrar(context, { cuerpoAuto: false, lang: 'en' });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Move', 'extra.core.stealth');
  expect(await fase(page)).toBe('place');
  const esperado = await page.evaluate(() => window.PACE_STRINGS.en['extra.core.stealth.s0.instruction.setup']);
  expect(esperado, 'GUARD: falta la clave en inglés').toBeTruthy();
  expect(await cue(page)).toBe(esperado);
});

test('colocacion · «Antes de empezar» de Core silencioso pide la silla sin ruedas', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Mueve/ }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate(() => [...document.querySelectorAll('[data-pace-lib-card="extra.core.stealth"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click());
  const vista = page.locator('[data-pace-modal-card]').locator('visible=true').last();
  await expect(vista).toContainText('Una silla estable, sin ruedas');
});
