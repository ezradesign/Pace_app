/* PACE · E2E · EL CIERRE DEL EJERCICIO DICE LO QUE SIGUE (Ez, 2A del 10 nov. 2026)
 * ================================================================================
 * Auditoría fable-9nov, propuesta 2 (app/ui/SessionDone.sigue.jsx). Solo cuando el ejercicio
 * venía de una pausa:
 *  · por libre, «Empezar el ciclo 2» arranca el Foco y «Volver al inicio» vuelve sin arrancar;
 *  · con jornada, «Volver · te quedan N min de pausa» (N, lo que de verdad queda) vuelve con la
 *    pausa corriendo y «Empezar ya el bloque 2» la corta y arranca el bloque;
 *  · cuando no venía de una pausa, como antes: solo «Volver al inicio».
 * Y nada pisa a nada ni sale de la ventana, del móvil más bajo (360×640) al escritorio de Ez.
 * Contra la 0.197.0 caen las tres primeras: el cierre solo decía «Volver al inicio».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior, terminarBloque, fijarViewport } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const HOY = '2026-10-14';
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const cta = (page) => vis(page, '[data-pace-cta]');
const SIGUE = '[data-pace-session-footer] [data-pace-cierre-sigue]';

async function hastaElCierre(page) {
  const done = page.locator('[data-pace-session-done]');
  for (let i = 0; i < 120 && (await done.count()) === 0; i++) { await page.clock.runFor(5000); await page.waitForTimeout(20); }
  await expect(done, 'GUARD: la sesión no llegó al cierre').toHaveCount(1);
}
async function empezarPreview(page) {
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(1);
}

/* Por libre: un Foco, la pausa propone, se hace y se acaba. */
async function cierreLibre(page, context) {
  await sembrar(context);
  await page.clock.install({ time: new Date(HOY + 'T09:00:00+02:00') });
  await irAlArtefacto(page);
  await cta(page).click();
  await page.clock.runFor(500);
  await terminarBloque(page);
  await page.locator('[data-pace-break-prop] button').first().click();
  await empezarPreview(page);
  await hastaElCierre(page);
}

/* Con jornada: el bloque 1 acaba, «Hacer la pausa», y el plato se acaba con la pausa contando. */
async function cierreJornada(page, context) {
  await sembrar(context, { ritmo: { dia: JORNADA } });
  await page.clock.install({ time: new Date(HOY + 'T09:00:00+02:00') });
  await irAlArtefacto(page);
  await vis(page, 'button').filter({ hasText: /^Empezar jornada$/ }).first().click();
  await page.clock.runFor(500);
  await terminarBloque(page);
  await overlaySuperior(page).getByRole('button', { name: 'Hacer la pausa', exact: true }).click();
  await empezarPreview(page);
  await hastaElCierre(page);
}

/* Las cajas de los botones del cierre: ninguna pisa a otra y todas se ven enteras. */
const sinPisar = (page) => page.evaluate(() => {
  const r = document.querySelector('[data-pace-session-root]');
  const bs = [...r.querySelectorAll('button')].map((b) => ({ t: b.innerText.trim(), c: b.getBoundingClientRect() })).filter((x) => x.c.height > 0);
  const mal = [];
  bs.forEach((a, i) => bs.slice(i + 1).forEach((b) => {
    if (Math.min(a.c.right, b.c.right) - Math.max(a.c.left, b.c.left) > 0.5 && Math.min(a.c.bottom, b.c.bottom) - Math.max(a.c.top, b.c.top) > 0.5) mal.push(a.t + ' / ' + b.t);
  }));
  bs.forEach((x) => { if (x.c.top < 0 || x.c.bottom > innerHeight + 0.5) mal.push(x.t + ' fuera'); });
  return mal;
});

test('por libre: «Empezar el ciclo 2» arranca el Foco siguiente', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await cierreLibre(page, context);
  const caja = page.locator(SIGUE);
  await expect(caja).toHaveAttribute('data-pace-cierre-sigue', 'libre');
  await expect(caja.locator('button').first()).toHaveText('Empezar el ciclo 2');
  await expect(caja.locator('[data-pace-cierre-otra]')).toHaveText('Volver al inicio');
  await caja.locator('button').first().click();
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);
  await expect(cta(page)).toHaveText('Pausar');
  expect(await page.evaluate(() => !!JSON.parse(localStorage.getItem('pace.timer.v1') || 'null')), 'el bloque está en marcha').toBe(true);
  expect(errores).toEqual([]);
});

test('por libre: «Volver al inicio» vuelve sin arrancar nada, y en inglés dice «Start cycle 2»', async ({ page, context }) => {
  await cierreLibre(page, context);
  await page.evaluate(() => window.setState({ lang: 'en' }));
  await expect(page.locator(SIGUE + ' button').first()).toHaveText('Start cycle 2');
  await expect(page.locator(SIGUE + ' [data-pace-cierre-otra]')).toHaveText('Back to Home');
  await page.evaluate(() => window.setState({ lang: 'es' }));
  await page.locator(SIGUE + ' [data-pace-cierre-otra]').click();
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);
  await expect(cta(page)).toHaveText('Empezar otro ciclo');
});

test('con jornada: «Volver · te quedan N min de pausa» con los minutos de verdad, y «Empezar ya el bloque 2» lo arranca', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await cierreJornada(page, context);
  const caja = page.locator(SIGUE);
  await expect(caja).toHaveAttribute('data-pace-cierre-sigue', 'jornada');
  const quedan = await page.evaluate(() => Math.ceil((getState().ritmo.dia.pausaHasta - Date.now()) / 60000));
  expect(quedan, 'GUARD: la pausa sigue contando').toBeGreaterThan(1);
  await expect(caja.locator('button').first()).toHaveText('Volver · te quedan ' + quedan + ' min de pausa');
  await expect(caja.locator('[data-pace-cierre-otra]')).toHaveText('Empezar ya el bloque 2');
  await caja.locator('[data-pace-cierre-otra]').click();
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Bloque 2 de 9');
  await expect(cta(page)).toHaveText('Pausar foco');
  expect(errores).toEqual([]);
});

test('con jornada: «Volver» vuelve a la home con la pausa corriendo', async ({ page, context }) => {
  await cierreJornada(page, context);
  await page.locator(SIGUE + ' button').first().click();
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Pausa corta');
});

test('cuando no venía de una pausa, como antes: solo «Volver al inicio»', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date(HOY + 'T09:00:00+02:00') });
  await irAlArtefacto(page);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'repeat', targetId: 'extra.back.desk' } })));
  await empezarPreview(page);
  await hastaElCierre(page);
  await expect(page.locator('[data-pace-cierre-sigue], [data-pace-cierre-otra]')).toHaveCount(0);
  await expect(page.locator('[data-pace-session-footer] button')).toHaveText(['Volver al inicio']);
});

test('nada pisa a nada ni sale de la ventana, de 360×640 a 1536×710', async ({ page, context }) => {
  await cierreJornada(page, context);
  for (const [w, h] of [[360, 640], [360, 740], [390, 844], [1280, 720], [1536, 710], [1536, 864]]) {
    await fijarViewport(page, w, h);
    await page.waitForTimeout(150);
    expect(await sinPisar(page), w + '×' + h).toEqual([]);
  }
});
