/* PACE · E2E · «TENERLO PARA SIEMPRE» DURANTE LA SEMANA DE PRUEBA (Ez, 3B del 16 nov. 2026)
 * =======================================================================================
 * S2 A del 11 nov. («enseñarlo con maqueta antes») y la maqueta de docs/proposals/maquetas-4-16nov/:
 * mientras dura la semana de prueba de v1, «Tus datos» decía solo «PACE completo · Prueba hasta el…»
 * y la compra no salía hasta que la semana acababa. Con la B, la fila de la prueba sigue diciendo
 * hasta cuándo y, en su línea pequeña, «Tenerlo para siempre · 19,99 € ›»; tocarla abre la
 * invitación con la compra y «Tengo un código».
 *
 * QUÉ DEFIENDE:
 *  · con la tienda abierta, la línea pequeña con el precio de la tienda, en es y en en, sin otra fila;
 *  · tocar la fila abre la invitación con «Comprar, 19,99 €» y «Tengo un código»;
 *  · con la tienda cerrada, como antes: sin línea, y la fila abre el campo del código;
 *  · nada pide scroll ni sale de la ventana a 360 × 640 y 740, y en el ordenador donde «Tus datos»
 *    va justa (1536 × 710 plegada, 1280 × 880 y 940).
 * Contra la 0.207.0 caen las dos primeras: la línea no existe.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, abrirTusDatos, fijarViewport, MEDIODIA } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const PANEL = '[data-pace-tweaks-panel]';
const HOJA = '[data-pace-premium-hoja]';
const DIA = 24 * 3600 * 1000;
const AHORA = MEDIODIA.getTime();

/* Quien ya usaba PACE, a mitad de su semana de prueba de v1 (una sola lectura del reloj: el tope de
   siete días del saneador recorta también un milisegundo). */
const EN_PRUEBA = {
  totalFocusMin: 300, routineCounts: { 'rutina.extra.hang.bar': 2 },
  pasoV1: { at: AHORA - 2 * DIA, previo: true, hasta: AHORA + 5 * DIA, rutinas: ['extra.hang.bar'], avisado: true },
};

async function enV1(context) {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
  });
}

async function abrirAjustes(page, enlaceVida) {
  await page.evaluate((e) => { window.PACE_TIENDA_WEB.enlaces = { vida: e, mes: null }; }, enlaceVida);
  await page.locator('[aria-label="Abrir ajustes"], [aria-label="Open settings"]').filter({ visible: true }).first().click();
  await abrirTusDatos(page);
}

const filaPrueba = (page) => page.locator(PANEL + ' button.pace-aj-accion').filter({ has: page.locator('[data-pace-licencia-prueba]') });

const sinScroll = (page) => page.evaluate((sel) => {
  const p = document.querySelector(sel);
  const scroll = [p, ...p.querySelectorAll('*')].filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1).length;
  const fuera = [...p.querySelectorAll('button')].filter((b) => { const c = b.getBoundingClientRect(); return c.height > 0 && (c.bottom > innerHeight + 0.5 || c.top < -0.5); })
    .map((b) => b.innerText.trim().slice(0, 30));
  return { scroll, fuera };
}, PANEL);

async function abrirPace(page, context, extra) {
  await enV1(context);
  await page.clock.install({ time: MEDIODIA });
  await sembrar(context, Object.assign({}, EN_PRUEBA, extra || {}));
  await irAlArtefacto(page);
}

test('con la tienda abierta, la fila de la prueba lleva «Tenerlo para siempre · 19,99 €» y abre la compra', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrirPace(page, context);
  await abrirAjustes(page, '/index.html#tienda-vida');
  const fila = filaPrueba(page);
  await expect(fila).toContainText('PACE completo');
  await expect(fila.locator('[data-pace-licencia-prueba]')).toContainText('Prueba hasta el');
  await expect(fila.locator('[data-pace-aj-comprar-prueba="vida"]')).toHaveText('Tenerlo para siempre · 19,99 € ›');
  /* Una sola fila: la de compra de después de la semana no sale todavía. */
  await expect(page.locator(PANEL + ' [data-pace-aj-comprar]')).toHaveCount(0);
  await fila.click();
  await expect(page.locator(HOJA + ' [data-pace-premium-vida]')).toHaveText('Comprar, 19,99 €');
  await expect(page.locator(HOJA + ' [data-pace-premium-tengo]')).toBeVisible();
  expect(errores).toEqual([]);
});

test('en inglés, «Get it for life · €19.99» bajo «PACE Complete»', async ({ page, context }) => {
  await abrirPace(page, context, { lang: 'en' });
  await abrirAjustes(page, '/index.html#tienda-vida');
  await expect(filaPrueba(page).locator('[data-pace-aj-comprar-prueba]')).toHaveText('Get it for life · €19.99 ›');
  await expect(filaPrueba(page).locator('[data-pace-licencia-prueba]')).toContainText('Trial until');
});

test('con la tienda cerrada, como antes: sin línea, y la fila abre el código', async ({ page, context }) => {
  await abrirPace(page, context);
  await abrirAjustes(page, null);
  await expect(filaPrueba(page).locator('[data-pace-aj-comprar-prueba]')).toHaveCount(0);
  await filaPrueba(page).click();
  await expect(page.locator(HOJA + ' [data-pace-premium-codigo]')).toBeVisible();
});

for (const [ancho, alto] of [[360, 640], [360, 740], [1536, 710], [1280, 880], [1280, 940]]) {
  test(`a ${ancho}×${alto}, con la línea de compra, «Tus datos» no pide scroll ni saca nada de la ventana`, async ({ page, context }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await abrirPace(page, context);
    await fijarViewport(page, ancho, alto);
    await abrirAjustes(page, '/index.html#tienda-vida');
    await expect(filaPrueba(page).locator('[data-pace-aj-comprar-prueba]')).toBeVisible();
    await page.waitForTimeout(400);
    expect(await sinScroll(page)).toEqual({ scroll: 0, fuera: [] });
  });
}
