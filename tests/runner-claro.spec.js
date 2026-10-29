/* PACE · el runner de Mueve y Estira, más claro (B3, P5, P6 y P8 de ChatGPT; Ez, 29 oct. 2026)
 * =============================================================================================
 * Lo que Ez eligió en la maqueta (docs/proposals/runner-claro-29oct.html):
 *   B3 A · en un paso con banda que se puede saltar, la flecha cuenta las repeticiones y «Saltar
 *          este paso» es la pastilla pequeña junto al número, como el «+15 s».
 *
 * Se mira lo que se VE y lo que queda apuntado (el cierre y el estado), no el código. El reloj
 * va instalado (`runFor`).
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
const nombre = async (page) => (await page.locator('[data-pace-v1-name]').textContent()).trim();
const flecha = (page) => page.locator('[data-pace-v1-btn="next"]');
const pasoActual = async (page) => {
  const m = (await page.getByText(/^(Paso|Step) \d+ (de|of) \d+$/).first().textContent()).match(/(?:Paso|Step) (\d+)/);
  return +m[1] - 1;
};
async function hasta(page, cond, maxSeg) {
  for (let i = 0; i < (maxSeg || 120); i++) { if (await cond()) return true; await page.clock.runFor(1000); }
  return cond();
}
const cierre = (page) => page.locator('[data-pace-session-done]');
/* Las cifras del cierre por su rótulo («Reps», «Series», «Pasos»). */
async function cifra(page, rotulo) {
  return cierre(page).evaluate((raiz, r) => {
    const caja = [...raiz.querySelectorAll('[data-pace-session-stat]')]
      .find((x) => (x.lastElementChild.textContent || '').trim() === r);
    return caja ? Number(caja.querySelector('[data-pace-session-stat-num]').textContent.trim()) : null;
  }, rotulo);
}
const estado = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2') || '{}'));
/* Abre la rutina y llega al trabajo del primer paso (sin Auto, la colocación espera a «›»). */
async function empezar(page, context, id, extra) {
  await sembrar(context, Object.assign({ cuerpoAuto: false }, extra || {}));
  await page.clock.install({ time: new Date('2026-10-29T10:00:00+01:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, extra && extra.lang === 'en' ? 'Move' : 'Mueve', id);
}

/* Las palabras bajo los tres botones del mando, con su caja. */
async function rotulos(page) {
  return page.evaluate(() => ['prev', 'pausa', 'next'].map((b) => {
    const boton = document.querySelector('[data-pace-v1-btn="' + b + '"]');
    const r = boton && boton.querySelector('.pace-v1-rotulo');
    if (!r) return { texto: null };
    const c = r.getBoundingClientRect(), cb = boton.getBoundingClientRect();
    const st = getComputedStyle(r);
    return { texto: r.textContent.trim(), top: c.top, bottom: c.bottom, left: c.left, right: c.right,
      bajoElBoton: c.top >= cb.bottom - 1, visible: st.visibility !== 'hidden' && +st.opacity > 0 && c.width > 4 && c.height > 4 };
  }));
}
async function bajoLaFlecha(page) { return (await rotulos(page))[2].texto; }
/* Las tres palabras se ven, enteras, debajo de su botón, sin pisarse ni salirse de la pantalla. */
async function rotulosLimpios(page, cuando) {
  const rs = await rotulos(page);
  const ancho = page.viewportSize().width, alto = page.viewportSize().height;
  for (const r of rs) {
    expect(r.texto, cuando + ': falta una palabra bajo el mando').toBeTruthy();
    expect(r.visible && r.bajoElBoton, cuando + ': «' + r.texto + '» no se ve bajo su botón').toBe(true);
    expect(r.left >= 0 && r.right <= ancho && r.bottom <= alto, cuando + ': «' + r.texto + '» se sale').toBe(true);
  }
  expect(rs[0].right <= rs[1].left && rs[1].right <= rs[2].left, cuando + ': las palabras se pisan').toBe(true);
  return rs.map((r) => r.texto);
}

test.describe('P5 · lo que dice cada botón del mando', () => {
  test('p5-1 · sin Auto, en el móvil: Anterior, Pausar y lo que hace la flecha en cada momento', async ({ browser, baseURL }) => {
    test.setTimeout(120000);
    const context = await browser.newContext({ baseURL, viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
    const page = await context.newPage();
    const errores = capturarErrores(page);
    await empezar(page, context, 'extra.banda.espalda');
    const vistos = [];
    const mira = async (cuando, espera) => {
      const t = await rotulosLimpios(page, cuando);
      expect(t[2], cuando).toBe(espera);
      vistos.push(t);
    };
    await mira('al colocarse', 'Empezar ya');
    expect(vistos[0].slice(0, 2)).toEqual(['Anterior', 'Pausar']);
    await flecha(page).click(); await page.clock.runFor(300);
    await mira('las aperturas a tu ritmo', 'Hecho');
    await page.locator('[data-pace-v1-btn="pausa"]').click(); await page.clock.runFor(300);
    expect((await rotulos(page))[1].texto, 'en pausa').toBe('Reanudar');
    await page.locator('[data-pace-v1-btn="pausa"]').click(); await page.clock.runFor(4000);
    await flecha(page).click(); await page.clock.runFor(300);
    await mira('el descanso', 'Saltar descanso');
    /* La palabra es el nombre del botón: lo que lee un lector de pantalla. */
    await expect(page.getByRole('button', { name: 'Saltar descanso', exact: true })).toBeVisible();
    await flecha(page).click(); await page.clock.runFor(300);
    await mira('el remo con banda, al colocarse', 'Empezar ya');
    await flecha(page).click(); await page.clock.runFor(300);
    await flecha(page).click(); await page.clock.runFor(300);
    await flecha(page).click(); await page.clock.runFor(300);
    expect(await nombre(page)).toBe('Remo con tu mano');
    if ((await fase(page)) === 'place') await flecha(page).click();
    await page.clock.runFor(300);
    await mira('el primer lado', 'Siguiente lado');
    await flecha(page).click(); await page.clock.runFor(300);
    await mira('el segundo lado del último paso', 'Terminar');
    expect(errores).toEqual([]);
    await context.close();
  });

  test('p5-2 · con Auto: «Terminar serie» en las reps guiadas y «Siguiente» en un paso con reloj; y en inglés', async ({ page, context }) => {
    test.setTimeout(120000);
    const errores = capturarErrores(page);
    await empezar(page, context, 'extra.desk.pushups', { cuerpoAuto: true });
    if ((await fase(page)) === 'place') await flecha(page).click();
    await page.clock.runFor(300);
    expect(await rotulosLimpios(page, 'las flexiones guiadas')).toEqual(['Anterior', 'Pausar', 'Terminar serie']);
    await expect(page.getByRole('button', { name: 'Terminar serie', exact: true })).toBeVisible();
    await page.locator('[data-pace-session-header] button').last().click();
    await abrirRutina(page, 'Mueve', 'extra.core.stealth');
    if ((await fase(page)) === 'place') await flecha(page).click();
    await page.clock.runFor(300);
    expect(await bajoLaFlecha(page), 'un aguante que no es el último').toBe('Siguiente');
    expect(errores).toEqual([]);
  });

  test('p5-3 · en inglés, en el móvil', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
    const page = await context.newPage();
    await empezar(page, context, 'extra.desk.pushups', { cuerpoAuto: true, lang: 'en', langAuto: false });
    expect(await rotulosLimpios(page, 'placing')).toEqual(['Previous', 'Pause', 'Begin now']);
    await flecha(page).click(); await page.clock.runFor(300);
    expect(await bajoLaFlecha(page)).toBe('Finish set');
    await flecha(page).click(); await page.clock.runFor(300);
    expect(await rotulosLimpios(page, 'rest')).toEqual(['Previous', 'Pause', 'Skip rest']);
    await context.close();
  });
});

test.describe('B3 · el paso con banda', () => {
  test('b3-1 · sin Auto, la flecha cuenta las 8 aperturas y «Saltar este paso» va junto al número', async ({ page, context }) => {
    test.setTimeout(120000);
    const errores = capturarErrores(page);
    await empezar(page, context, 'extra.banda.espalda');
    if ((await fase(page)) === 'place') await flecha(page).click();
    expect(await fase(page)).toBe('work');
    expect(await nombre(page)).toBe('Apertura con banda');
    /* La pastilla vive en la fila del número, como el «+15 s», y no en el mando. */
    const saltar = page.locator('.pace-v1-numfila [data-pace-v1-saltar]');
    await expect(saltar, 'no hay «Saltar este paso» junto al número').toBeVisible();
    await expect(saltar).toHaveText('Saltar este paso');
    await expect(page.locator('[data-pace-v1-mando]')).not.toContainText('Saltar este paso');
    /* La flecha da las 8 por hechas. */
    await flecha(page).click();
    await page.clock.runFor(300);
    expect(await pasoActual(page)).toBe(1);
    /* El Remo con banda se salta con la pastilla: ni reps ni corte. */
    await flecha(page).click();   // salta el descanso
    await page.clock.runFor(300);
    expect(await nombre(page)).toBe('Remo con banda');
    if ((await fase(page)) === 'place') await flecha(page).click();
    await page.locator('[data-pace-v1-saltar]').click();
    await page.clock.runFor(300);
    expect(await pasoActual(page)).toBe(3);
    await flecha(page).click();   // salta el descanso
    await page.clock.runFor(300);
    /* El remo con tu mano, entero: se coloca, un lado, el otro. */
    expect(await nombre(page)).toBe('Remo con tu mano');
    if ((await fase(page)) === 'place') await flecha(page).click();
    for (let lado = 0; lado < 2; lado++) {
      expect(await hasta(page, async () => (await page.locator('[data-pace-v1-num]').textContent()).trim() === '00', 40)).toBe(true);
      await flecha(page).click();
      await page.clock.runFor(300);
    }
    await cierre(page).waitFor({ timeout: 10000 });
    expect(await cifra(page, 'Reps'), 'las 8 aperturas no cuentan en el cierre').toBe(8);
    expect(await cifra(page, 'Pasos'), 'el remo con banda saltado contó como paso').toBe(2);
    const s = await estado(page);
    expect(s.moveSessionsTotal || 0, 'con el remo con banda saltado, la rutina no contó entera').toBe(1);
    expect(errores).toEqual([]);
  });

  test('b3-2 · con Auto, terminar la serie de banda antes no corta la rutina: se podía saltar entera', async ({ page, context }) => {
    test.setTimeout(150000);
    const errores = capturarErrores(page);
    await empezar(page, context, 'extra.banda.espalda', { cuerpoAuto: true });
    if ((await fase(page)) === 'place') await flecha(page).click();
    expect(await nombre(page)).toBe('Apertura con banda');
    await expect(page.locator('.pace-v1-numfila [data-pace-v1-saltar]')).toBeVisible();
    /* Tres reps guiadas y la flecha: cuentan esas tres, y la rutina sigue entera. */
    await page.clock.runFor(12500);
    await flecha(page).click();
    await page.clock.runFor(300);
    expect(await pasoActual(page)).toBe(1);
    expect(await hasta(page, async () => !!(await cierre(page).count()), 200)).toBe(true);
    expect(await cifra(page, 'Reps')).toBe(3 + 8);
    expect((await estado(page)).moveSessionsTotal || 0, 'terminar antes un paso que se puede saltar cortó la rutina').toBe(1);
    expect(errores).toEqual([]);
  });
});
