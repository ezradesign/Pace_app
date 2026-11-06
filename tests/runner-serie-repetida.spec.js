/* PACE · E2E · REPETIR UNA SERIE CON «ANTERIOR» Y LAS CIFRAS DEL CIERRE (revisión de ChatGPT, 5 nov. 2026)
 * =========================================================================================================
 * Las repeticiones del cierre sumaban cada vez que se completaba una serie, pero las series se contaban
 * por pasos únicos: repetir una serie añadía ocho repeticiones y ninguna serie. El cierre mezclaba lo
 * hecho con los pasos del plan («2 series · 15 reps» cuando eran tres series de cinco).
 *
 * Ahora el cierre cuenta lo que hiciste, con la serie repetida incluida; y si la rutina cuenta como entera
 * sigue decidiéndolo el plan (cada paso de trabajo hecho al menos una vez), no las veces.
 *
 * «Empuje sencillo»: dos series de 5 flexiones (20 s guiados cada una) con un descanso de 30 s entre
 * ellas. La normal da «2 series · 10 reps». La que vuelve a la primera serie desde el descanso hace tres
 * series de cinco: «3 series · 15 reps», una sola sesión y la rutina entera.
 *
 * Solo el cierre cambia: la semana, los logros y el evento guardado salen de los pasos del plan y de los
 * minutos, no de estas cifras (se comprueba aquí con el total de sesiones de Mueve).
 *
 * El reloj va instalado: `runFor` hace correr los relojes del runner.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, CLAVE_ESTADO } = require('./helpers');

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
async function hasta(page, cond, maxSeg) {
  for (let i = 0; i < (maxSeg || 120); i++) { if (await cond()) return true; await page.clock.runFor(1000); }
  return cond();
}
/* Lo que enseña el cierre: { 'Series': '2', 'Reps': '10', 'Tiempo': ... } */
async function cierre(page) {
  await page.locator('[data-pace-session-stats]').waitFor({ timeout: 10000 });
  return page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-pace-session-stat]')]
    .map((e) => [e.lastElementChild.textContent.trim(), e.firstElementChild.textContent.trim()])));
}
const sesionesDeMueve = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)).moveSessionsTotal || 0, CLAVE_ESTADO);

/* Corre la rutina hasta el cierre; `repetirLaPrimera` vuelve atrás desde el primer descanso. */
async function correr(page, repetirLaPrimera) {
  expect(await hasta(page, async () => (await fase(page)) === 'rest', 90)).toBe(true);
  if (repetirLaPrimera) {
    await page.locator('[data-pace-v1-btn="prev"]').click();
    expect(await fase(page), '«Anterior» desde el descanso vuelve a la primera serie').not.toBe('rest');
    expect(await hasta(page, async () => (await fase(page)) === 'rest', 90)).toBe(true);
  }
  /* el descanso, la última serie y el cierre llegan solos */
  expect(await hasta(page, async () => (await page.locator('[data-pace-session-stats]').count()) > 0, 150)).toBe(true);
}

test('una ejecución normal: dos series de cinco', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await abrirRutina(page, 'extra.desk.pushups');
  await correr(page, false);
  const c = await cierre(page);
  expect(c['Series']).toBe('2');
  expect(c['Reps']).toBe('10');
  expect(await sesionesDeMueve(page)).toBe(1);
  expect(errores).toEqual([]);
});

test('repetir la primera serie con «Anterior» suma una serie y sus repeticiones, sin duplicar la sesión', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await abrirRutina(page, 'extra.desk.pushups');
  await correr(page, true);
  const c = await cierre(page);
  /* Lo hecho: tres series de cinco. Antes salía «2 series · 15 reps»: las reps sumaban y las series no. */
  expect(c['Reps'], 'las repeticiones de la serie repetida cuentan').toBe('15');
  expect(c['Series'], 'la serie repetida cuenta como una serie más').toBe('3');
  /* Y lo que decide si la rutina cuenta no cambia: una sola sesión y entera (suma 1, no 0 ni 2). */
  expect(await sesionesDeMueve(page), 'repetir una serie no duplica la sesión ni la quita').toBe(1);
  expect(errores).toEqual([]);
});
