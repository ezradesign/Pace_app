/* PACE · sin «Auto», esperar a «›» no es hacer la rutina (B1 y B2 de ChatGPT, 28 oct. 2026)
 * ===========================================================================================
 * B1. Sin «Auto», una cuenta que llega a 0 espera a «›». Esa espera no suma a ningún reloj: ni
 *     al «Tiempo» del cierre ni a lo que va a la semana ni al tiempo activo. Las repeticiones a tu
 *     ritmo sí siguen contando: ahí se está haciendo el ejercicio.
 * B2. Con la rutina en pausa, encender «Auto» solo cambia la preferencia: nada avanza hasta
 *     reanudar, y al reanudar no se repite ningún sonido.
 *
 * El reloj va instalado (`runFor`), así que cinco minutos de espera no cuestan cinco minutos.
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
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar/i.test(x.textContent || '')).click();
  });
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
}
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');
const nombre = async (page) => (await page.locator('[data-pace-v1-name]').textContent()).trim();
const numero = async (page) => (await page.locator('[data-pace-v1-num]').textContent()).trim();
const siguiente = (page) => page.locator('[data-pace-v1-btn="next"]');
const pasoActual = async (page) => +(await page.getByText(/^Paso \d+ de \d+$/).first().textContent()).match(/Paso (\d+)/)[1] - 1;
async function irAlPaso(page, idx) {
  for (let i = 0; i < 40 && (await pasoActual(page)) < idx; i++) { await siguiente(page).click(); await page.clock.runFor(200); }
  expect(await pasoActual(page)).toBe(idx);
}
async function hasta(page, cond, maxSeg) {
  for (let i = 0; i < (maxSeg || 120); i++) { if (await cond()) return true; await page.clock.runFor(1000); }
  return cond();
}
/* Lo que dice el cierre: el «Tiempo» en segundos, el tiempo activo y los minutos de la semana. */
async function cierre(page) {
  const done = page.locator('[data-pace-session-done]');
  await done.waitFor({ timeout: 10000 });
  const [mm, ss] = (await done.getByText(/^\d+:\d\d$/).first().innerText()).split(':').map(Number);
  const activo = Number(await done.getAttribute('data-pace-active-sec'));
  const semana = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('pace.state.v2')).weeklyStats || {};
    return (s.moveMinutes || []).reduce((a, b) => a + b, 0);
  });
  return { tiempo: mm * 60 + ss, activo, semana };
}

/* Core silencioso hasta el final, sin Auto: el último aguante (paso 5) se coloca, llega a 0 y
   espera; luego trabaja sus 30 s, llega a 00 y espera. `espera` son los segundos de cada espera. */
async function coreHastaElFinal(page, context, espera) {
  await sembrar(context, { cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Mueve', 'extra.core.stealth');
  await irAlPaso(page, 4);
  expect(await fase(page)).toBe('place');
  expect(await hasta(page, async () => (await numero(page)) === '0', 30)).toBe(true);
  await page.clock.runFor(espera * 1000);
  expect(await fase(page), 'se puso a trabajar solo sin Auto').toBe('place');
  await siguiente(page).click();
  expect(await fase(page)).toBe('work');
  expect(await hasta(page, async () => (await numero(page)) === '00', 40)).toBe(true);
  await page.clock.runFor(espera * 1000);
  expect(await fase(page)).toBe('work');
  await siguiente(page).click();
  return cierre(page);
}

test('espera-1 · sin Auto, cinco minutos esperando a «›» (al colocarse y en 00) no suman a ningún reloj', async ({ browser, baseURL, viewport, locale, timezoneId }) => {
  test.setTimeout(120000);
  const opciones = { baseURL, viewport, locale, timezoneId, colorScheme: 'light' };
  const ctxA = await browser.newContext(opciones);
  const a = await coreHastaElFinal(await ctxA.newPage(), ctxA, 0);
  await ctxA.close();
  const ctxB = await browser.newContext(opciones);
  const pageB = await ctxB.newPage();
  const errores = capturarErrores(pageB);
  const b = await coreHastaElFinal(pageB, ctxB, 300);
  await ctxB.close();
  expect(a.activo, 'GUARD: no se hizo el último aguante').toBeGreaterThanOrEqual(28);
  expect(Math.abs(b.tiempo - a.tiempo), `«Tiempo» del cierre: ${a.tiempo} s sin esperar, ${b.tiempo} s esperando`).toBeLessThanOrEqual(2);
  expect(Math.abs(b.activo - a.activo), `tiempo activo: ${a.activo} s y ${b.activo} s`).toBeLessThanOrEqual(2);
  expect(b.semana, 'la semana se llevó la espera').toBe(a.semana);
  expect(errores).toEqual([]);
});

test('espera-2 · sin Auto, las repeticiones a tu ritmo sí cuentan su tiempo', async ({ page, context }) => {
  await sembrar(context, { cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Mueve', 'extra.desk.pushups');
  await siguiente(page).click();                  // colocarse → a trabajar
  expect(await fase(page)).toBe('work');
  await expect(page.locator('[data-pace-v1-numlabel]')).toHaveText('reps · a tu ritmo');
  await page.clock.runFor(60000);                 // un minuto haciendo las flexiones
  await siguiente(page).click();                  // hechas
  expect(await fase(page)).toBe('rest');
  await siguiente(page).click();                  // saltar el descanso: segunda serie, ya colocado
  expect(await nombre(page)).toMatch(/Flexiones/);
  expect(await fase(page)).toBe('work');
  await siguiente(page).click();                  // hechas: fin
  const c = await cierre(page);
  expect(c.activo, 'el minuto de reps no contó como activo').toBeGreaterThanOrEqual(58);
  expect(c.tiempo, 'el minuto de reps no contó en el «Tiempo»').toBeGreaterThanOrEqual(58);
});

/* Tres sitios donde una cuenta en 0 espera a «›»: al colocarse, en 00 y al cambiar de lado. */
async function espiarSonidos(page) {
  await page.evaluate(() => {
    window.__sonidos = [];
    const orig = window.playSound;
    window.playSound = function (n) { window.__sonidos.push(n); return orig && orig.apply(this, arguments); };
  });
}
const sonidos = (page) => page.evaluate(() => window.__sonidos.slice());
async function pausarEncenderAutoYEsperar(page) {
  await page.locator('[data-pace-v1-btn="pausa"]').click();
  await expect(page.locator('[data-pace-v1-btn="pausa"]')).toHaveText(/Reanudar/);
  const antes = { fase: await fase(page), paso: await pasoActual(page), nombre: await nombre(page), cue: await page.locator('[data-pace-v1-cue]').textContent() };
  await espiarSonidos(page);
  await page.locator('[data-pace-v1-auto]').click();
  await expect(page.locator('[data-pace-v1-auto]')).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(15000);
  expect(await fase(page), 'Auto en pausa cambió de fase').toBe(antes.fase);
  expect(await pasoActual(page), 'Auto en pausa cambió de paso').toBe(antes.paso);
  expect(await page.locator('[data-pace-v1-cue]').textContent(), 'Auto en pausa cambió de lado o de paso').toBe(antes.cue);
  await expect(page.locator('[data-pace-session-done]')).toHaveCount(0);
  await expect(page.locator('[data-pace-v1-btn="pausa"]')).toHaveText(/Reanudar/);
  expect(await sonidos(page), 'sonó algo con la rutina en pausa').toEqual([]);
  return antes;
}

test('espera-3 · en pausa, encender Auto con la colocación en 0 no empieza el ejercicio', async ({ page, context }) => {
  await sembrar(context, { cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Mueve', 'extra.desk.pushups');
  expect(await hasta(page, async () => (await fase(page)) === 'place' && (await numero(page)) === '0', 40)).toBe(true);
  await pausarEncenderAutoYEsperar(page);
  /* Al reanudar, con Auto ya encendido, sigue: al ejercicio, con su «¡ya!» una sola vez. */
  await page.locator('[data-pace-v1-btn="pausa"]').click();
  await page.clock.runFor(1500);
  expect(await fase(page)).toBe('work');
  expect((await sonidos(page)).filter((s) => s === 'move.go').length, 'el «¡ya!» sonó de más').toBeLessThanOrEqual(1);
});

test('espera-4 · en pausa, encender Auto con el último aguante en 00 no acaba la rutina', async ({ page, context }) => {
  await sembrar(context, { cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Mueve', 'extra.core.stealth');
  await irAlPaso(page, 4);
  await siguiente(page).click();
  expect(await fase(page)).toBe('work');
  expect(await hasta(page, async () => (await numero(page)) === '00', 40)).toBe(true);
  await page.clock.runFor(2000);
  await pausarEncenderAutoYEsperar(page);
  /* Al reanudar acaba, y el aviso de 00 no se repite. */
  await page.locator('[data-pace-v1-btn="pausa"]').click();
  await page.clock.runFor(1500);
  await expect(page.locator('[data-pace-session-done]')).toHaveCount(1);
  const s = await sonidos(page);
  expect(s.filter((x) => x === 'move.go'), 'el aviso de 00 sonó otra vez').toEqual([]);
  expect(s.filter((x) => x === 'move.warn'), 'las maderas sonaron otra vez').toEqual([]);
});

test('espera-5 · en pausa, encender Auto con el primer lado en 00 no cambia de lado', async ({ page, context }) => {
  await sembrar(context, { cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Estira', 'move.hips.standing');
  for (let i = 0; i < 12 && !/lateral/i.test(await nombre(page)); i++) { await siguiente(page).click(); await page.clock.runFor(300); }
  expect(await nombre(page)).toMatch(/lateral/i);
  if ((await fase(page)) === 'place') await siguiente(page).click();
  await expect(page.locator('[data-pace-v1-cue] strong')).toHaveText(/Izquierda/);
  expect(await hasta(page, async () => (await numero(page)) === '00', 90)).toBe(true);
  await pausarEncenderAutoYEsperar(page);
  await expect(page.locator('[data-pace-v1-cue] strong')).toHaveText(/Izquierda/);
  /* Al reanudar, con Auto: el cambio de lado, que es lo que haría Auto en 00. */
  await page.locator('[data-pace-v1-btn="pausa"]').click();
  await page.clock.runFor(1500);
  expect(await fase(page)).toBe('change');
});
