/* PACE · E2E · EL ARO DE ESCRITORIO TIENE UN TAMAÑO FIJO (Ez, 10 nov. 2026)
 * =======================================================================
 * Ez: «en el escritorio el tamaño del aro del pomodoro cambia según la ventana y siempre
 * debería ser fijo». Medido sobre la 0.197.0: 372 px en su ventana (1536×710), 520 a
 * 1536×1080 y 650 a 1920×1080, porque el motor arrancaba del mayor aro que cupiera (hasta
 * 520 px CSS) y el lienzo, encima, lo agrandaba con todo lo demás. Ahora el aro mide
 * D_FIJO px de pantalla (home-geometry.js) y solo encoge cuando no cabe, porque la home no
 * hace scroll. El móvil no cambia: allí el aro sale por ancho.
 *
 * Lo que defiende:
 *   · el mismo diámetro en todas las ventanas de escritorio donde cabe, con la barra
 *     lateral abierta y cerrada, por libre y con el día en marcha;
 *   · en una ventana baja encoge, y sin scroll;
 *   · con el zoom del navegador alejado se ve como al 100 % (el lienzo sigue valiendo);
 *   · el móvil sale como antes (360×640 y 360×740).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const D_FIJO = 372;
const HOY = '2026-11-10';
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };

async function abrir(browser, w, h, extra, opciones) {
  const u = test.info().project.use;
  const context = await browser.newContext(Object.assign({
    viewport: { width: w, height: h },
    baseURL: u.baseURL, locale: u.locale, timezoneId: u.timezoneId, colorScheme: u.colorScheme,
  }, opciones || {}));
  await sembrar(context, extra);
  const page = await context.newPage();
  const errores = capturarErrores(page);
  return { context, page, errores };
}

/* El aro en px de pantalla, el scroll de la home (moviéndolo, no restando) y el de la página. */
const medir = (page) => page.evaluate(() => {
  const vis = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
  const dial = vis('[data-pace-dial-fit]');
  const body = vis('[data-pace-home-body]');
  if (!dial || !body) return null;
  const antes = body.scrollTop; body.scrollTop = 99999; const scroll = body.scrollTop; body.scrollTop = antes;
  const se = document.scrollingElement;
  return { d: dial.getBoundingClientRect().width, scroll, scrollPagina: se.scrollHeight - se.clientHeight };
});

async function asentar(page) {
  await page.waitForTimeout(500);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

const CABE = [[1280, 768], [1366, 768], [1440, 900], [1536, 710], [1536, 1080], [1920, 1080], [2560, 1440]];

for (const barra of ['abierta', 'cerrada']) {
  test('por libre, el aro mide lo mismo en todas las ventanas donde cabe · barra ' + barra, async ({ browser }) => {
    const fuera = [];
    for (const [w, h] of CABE) {
      const { context, page, errores } = await abrir(browser, w, h, { sidebarCollapsed: barra === 'cerrada' });
      await irAlArtefacto(page);
      await asentar(page);
      const m = await medir(page);
      expect(m, 'GUARD: no hay aro a ' + w + '×' + h).not.toBeNull();
      if (Math.abs(m.d - D_FIJO) > 1.5) fuera.push(w + '×' + h + ': ' + m.d.toFixed(1));
      expect(m.scroll + m.scrollPagina, 'scroll a ' + w + '×' + h).toBe(0);
      expect(errores).toEqual([]);
      await context.close();
    }
    expect(fuera, 'el aro no mide ' + D_FIJO + ' px').toEqual([]);
  });
}

test('con el día en marcha, el aro mide lo mismo donde cabe', async ({ browser }) => {
  const fuera = [];
  for (const [w, h] of [[1536, 900], [1920, 1080], [2560, 1440]]) {
    const { context, page } = await abrir(browser, w, h, { ritmo: { dia: JORNADA } });
    await page.clock.install({ time: new Date(HOY + 'T10:00:00+01:00') });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
    await asentar(page);
    const m = await medir(page);
    if (Math.abs(m.d - D_FIJO) > 1.5) fuera.push(w + '×' + h + ': ' + m.d.toFixed(1));
    expect(m.scroll + m.scrollPagina, 'scroll a ' + w + '×' + h).toBe(0);
    await context.close();
  }
  expect(fuera, 'con el día, el aro no mide ' + D_FIJO + ' px').toEqual([]);
});

test('en una ventana baja el aro encoge, y la home sigue sin scroll', async ({ browser }) => {
  for (const [w, h] of [[1280, 600], [1024, 600]]) {
    const { context, page } = await abrir(browser, w, h, {});
    await irAlArtefacto(page);
    await asentar(page);
    const m = await medir(page);
    expect(m.d, 'a ' + w + '×' + h + ' el aro no encogió').toBeLessThan(D_FIJO - 10);
    expect(m.scroll + m.scrollPagina, 'scroll a ' + w + '×' + h).toBe(0);
    await context.close();
  }
});

/* El zoom alejado se imita como lo ve la app en un navegador de verdad: la ventana mide tres
   veces más para ella, pero `outerWidth` sigue siendo el de la ventana. */
test('con el zoom del navegador al 33 % el aro se ve como al 100 %', async ({ browser }) => {
  const { context, page } = await abrir(browser, 4636, 2127, {});
  await context.addInitScript(() => { Object.defineProperty(window, 'outerWidth', { get: () => 1536 }); });
  await irAlArtefacto(page);
  await asentar(page);
  const m = await medir(page);
  const escala = await page.evaluate(() => window.paceLienzo.escala);
  expect(escala, 'GUARD: el lienzo no se puso').toBeGreaterThan(2.9);
  expect(Math.abs(m.d / escala - D_FIJO), 'al 33 % el aro no es el del 100 %').toBeLessThanOrEqual(2);
  await context.close();
});

/* El móvil no cambia: el aro sale por ancho. Medido sobre la 0.197.0. */
for (const [w, h, d] of [[360, 640, 307], [360, 740, 331]]) {
  test('el móvil no cambia · ' + w + '×' + h, async ({ browser }) => {
    const { context, page } = await abrir(browser, w, h, { sidebarCollapsed: true }, { isMobile: true, hasTouch: true });
    await irAlArtefacto(page);
    await asentar(page);
    const m = await medir(page);
    expect(Math.abs(m.d - d), 'el aro del móvil cambió: ' + m.d).toBeLessThanOrEqual(1);
    await context.close();
  });
}
