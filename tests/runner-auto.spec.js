/* PACE · el «Auto» de Mueve y Estira y el número de las repeticiones (Ez, 1A y 2A del 25 oct.)
 * ============================================================================================
 * El runner ya avanzaba solo; el interruptor «Auto», junto a «Siguiente», lo deja a la vista y
 * permite apagarlo. Encendido, el «›» lleva un aro que se llena hasta que la pantalla pasa sola.
 * Apagado, cada cuenta espera a «›» y las repeticiones van a tu ritmo. El número de las reps
 * guiadas ya no late: va del terracota de la primera al oliva de la última, con cifras de caja
 * alta (las de estilo antiguo bajaban el 4, el 7 y el 9).
 *
 * El reloj va instalado para no esperar de verdad: `runFor` hace correr los relojes del runner.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, CLAVE_ESTADO } = require('./helpers');

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
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar/i.test(x.textContent || '')).click();
  });
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
}
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');
const nombre = (page) => page.locator('[data-pace-v1-name]').textContent();
const numero = (page) => page.locator('[data-pace-v1-num]').textContent();
const siguiente = () => '[data-pace-v1-btn="next"]';
async function hasta(page, cond, maxSeg) {
  for (let i = 0; i < (maxSeg || 120); i++) { if (await cond()) return true; await page.clock.runFor(1000); }
  return cond();
}

test('auto-1 · encendido de fábrica: el interruptor está junto a «Siguiente» y el aro del «›» se llena', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await abrirRutina(page, 'Mueve', 'extra.desk.pushups');
  const auto = page.locator('.pace-v1-siguiente [data-pace-v1-auto]');
  await expect(auto).toHaveAttribute('aria-pressed', 'true');
  await expect(auto).toHaveText('Auto');
  expect(await hasta(page, async () => (await fase(page)) === 'work')).toBe(true);
  const aro = page.locator(siguiente() + ' [data-pace-v1-anillo]');
  const antes = +(await aro.getAttribute('data-pace-v1-anillo'));
  await page.clock.runFor(8000);
  const despues = +(await aro.getAttribute('data-pace-v1-anillo'));
  expect(despues, 'el aro del «›» no avanza').toBeGreaterThan(antes);
  await expect(page.locator(siguiente())).not.toHaveAttribute('data-pace-v1-espera', '');
  /* Y sigue sola: las reps acaban y llega el descanso sin tocar nada. */
  expect(await hasta(page, async () => (await fase(page)) === 'rest', 90)).toBe(true);
  expect(errores).toEqual([]);
});

test('auto-2 · apagado: las reps van a tu ritmo y el descanso espera a «›» al llegar a 0', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Mueve', 'extra.desk.pushups');
  await page.locator('[data-pace-v1-auto]').click();
  await expect(page.locator('[data-pace-v1-auto]')).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).cuerpoAuto, CLAVE_ESTADO), 'no se guarda').toBe(false);
  /* Colocarse: la cuenta llega a 0 y se queda ahí. */
  expect(await hasta(page, async () => (await numero(page)).trim() === '0', 40)).toBe(true);
  await page.clock.runFor(5000);
  expect(await fase(page)).toBe('place');
  await expect(page.locator('[data-pace-v1-siguiente]')).toHaveText('Pulsa › para seguir');
  await page.locator(siguiente()).click();
  expect(await fase(page)).toBe('work');
  /* Reps a tu ritmo: el número es el objetivo, no hay aro y el «›» espera. */
  await expect(page.locator('[data-pace-v1-numlabel]')).toHaveText('reps · a tu ritmo');
  const objetivo = (await numero(page)).trim();
  await page.clock.runFor(90000);
  expect(await fase(page), 'pasó solo sin Auto').toBe('work');
  expect((await numero(page)).trim()).toBe(objetivo);
  await expect(page.locator(siguiente() + ' [data-pace-v1-anillo]')).toHaveCount(0);
  await expect(page.locator(siguiente())).toHaveAttribute('data-pace-v1-espera', '');
  await expect(page.locator('[data-pace-v1-siguiente]')).toHaveText('Pulsa › al acabar');
  await page.locator(siguiente()).click();
  /* El descanso cuenta, llega a 0 y espera. */
  expect(await fase(page)).toBe('rest');
  expect(await hasta(page, async () => (await numero(page)).trim() === '00', 60)).toBe(true);
  await page.clock.runFor(10000);
  expect(await fase(page), 'el descanso pasó solo sin Auto').toBe('rest');
  await expect(page.locator('[data-pace-v1-siguiente]')).toHaveText('Pulsa › para seguir');
  /* Encender Auto ahí lo deja seguir. */
  await page.locator('[data-pace-v1-auto]').click();
  expect(await hasta(page, async () => (await fase(page)) !== 'rest', 3)).toBe(true);
});

test('auto-3 · apagado: al acabar el primer lado espera, y «›» empieza el segundo sin la cuenta de cambio', async ({ page, context }) => {
  await sembrar(context, { cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Estira', 'move.hips.standing');
  /* Hasta el primer paso por lados («Sentadilla lateral»), pulsando «›» cuando espera. */
  for (let i = 0; i < 12 && !/lateral/i.test(await nombre(page)); i++) { await page.locator(siguiente()).click(); await page.clock.runFor(300); }
  expect(await nombre(page)).toMatch(/lateral/i);
  if ((await fase(page)) === 'place') await page.locator(siguiente()).click();
  expect(await fase(page)).toBe('work');
  await expect(page.locator('[data-pace-v1-cue] strong')).toHaveText(/Izquierda|Left/);
  expect(await hasta(page, async () => (await numero(page)).trim() === '00', 90)).toBe(true);
  await page.clock.runFor(15000);
  expect(await fase(page), 'cambió de lado solo sin Auto').toBe('work');
  await page.locator(siguiente()).click();
  expect(await fase(page)).toBe('work');
  await expect(page.locator('[data-pace-v1-cue] strong')).toHaveText(/Derecha|Right/);
});

test('auto-4 · el número de las reps no late, va del terracota al oliva y usa cifras de caja alta', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Mueve', 'extra.desk.pushups');
  expect(await hasta(page, async () => (await fase(page)) === 'work')).toBe(true);
  /* El color que tendría cada extremo, resuelto por el navegador con los tokens de la paleta. */
  const color = (p) => page.evaluate((p) => {
    const e = document.createElement('i');
    e.style.color = 'color-mix(in oklab, var(--focus) ' + p + '%, var(--breathe))';
    document.querySelector('[data-pace-v1-raiz]').appendChild(e);
    const c = getComputedStyle(e).color; e.remove(); return c;
  }, p);
  const delNumero = () => page.locator('[data-pace-v1-num]').evaluate((e) => getComputedStyle(e).color);
  const estilo = await page.locator('[data-pace-v1-num]').evaluate((e) => ({ anim: getComputedStyle(e).animationName, cifras: getComputedStyle(e).fontVariantNumeric }));
  expect(estilo.anim, 'el número sigue latiendo').toBe('none');
  expect(estilo.cifras).toContain('lining-nums');
  expect((await numero(page)).trim()).toBe('1');
  expect(await delNumero()).toBe(await color(0));
  /* La última rep (el objetivo sale de «de N reps»), todavía en el paso de trabajo. */
  const objetivo = (await page.locator('[data-pace-v1-numlabel]').textContent()).match(/\d+/)[0];
  expect(await hasta(page, async () => (await fase(page)) === 'work' && (await numero(page)).trim() === objetivo, 70)).toBe(true);
  expect(await delNumero()).toBe(await color(100));
  expect(await color(0), 'GUARD: los dos extremos no se distinguen').not.toBe(await color(100));
});
