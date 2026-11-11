/* PACE · E2E · UNA FILA PARA COMPRAR, EN AJUSTES (Ez, 1A del 10 nov. 2026)
 * ========================================================================
 * Auditoría fable-9nov, propuesta 1: con la tienda abierta, «Tus datos» lleva «Tenerlo para
 * siempre · 19,99 €» y, debajo, «Tengo un código». No salta sola ni tapa nada: la primera abre la
 * invitación de siempre con su botón de compra; la segunda, la misma hoja con el campo del código.
 *
 * QUÉ DEFIENDE:
 *  · Con la tienda abierta, las dos filas, con el precio que da la tienda, en es y en en.
 *  · La primera abre la invitación con «Comprar, 19,99 €»; la segunda, el campo del código.
 *  · Con la tienda cerrada, como antes: «PACE completo · Introducir código», sin precio.
 *  · Nada pide scroll ni sale de la ventana: a 360×640 (el móvil más bajo que se mide) y en el
 *    escritorio, con «Tus datos» plegada (1536×710, 1280×880) y abierta (1280×940).
 * Contra la 0.197.0 caen las tres primeras: la fila no existe.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, abrirTusDatos, fijarViewport } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const PANEL = '[data-pace-tweaks-panel]';
const HOJA = '[data-pace-premium-hoja]';
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

async function abrirAjustes(page, enlaceVida) {
  await page.evaluate((e) => { window.PACE_TIENDA_WEB.enlaces = { vida: e, mes: null }; }, enlaceVida);
  await vis(page, '[aria-label="Abrir ajustes"], [aria-label="Open settings"]').first().click();
  await abrirTusDatos(page);
}

/* Lo que pide scroll dentro del panel y los botones que salen de la ventana. */
const sinScroll = (page) => page.evaluate((sel) => {
  const p = document.querySelector(sel);
  const scroll = [p, ...p.querySelectorAll('*')].filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1).length;
  const fuera = [...p.querySelectorAll('button')].filter((b) => { const c = b.getBoundingClientRect(); return c.height > 0 && (c.bottom > innerHeight + 0.5 || c.top < -0.5); })
    .map((b) => b.innerText.trim().slice(0, 30));
  return { scroll, fuera };
}, PANEL);

test('con la tienda abierta: «Tenerlo para siempre · 19,99 €» abre la invitación con su compra', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirAjustes(page, '/index.html#tienda-vida');
  const comprar = page.locator(PANEL + ' button.pace-aj-accion', { hasText: 'Tenerlo para siempre' });
  await expect(comprar).toBeVisible();
  await expect(comprar.locator('[data-pace-aj-comprar="vida"]')).toHaveText('19,99 €');
  const codigo = page.locator(PANEL + ' button.pace-aj-accion', { hasText: 'Tengo un código' });
  await expect(codigo).toContainText('Introducir código');
  /* La de comprar va justo encima de la del código. */
  const orden = await page.locator(PANEL + ' .pace-aj-accion').evaluateAll((els) => els.map((e) => e.innerText.split('\n')[0].trim()));
  expect(orden.indexOf('Tengo un código') - orden.indexOf('Tenerlo para siempre')).toBe(1);
  expect(orden, 'sin la fila de antes').not.toContain('PACE completo');

  await comprar.click();
  await expect(page.locator(HOJA)).toBeVisible();
  await expect(page.locator(HOJA + ' [data-pace-premium-vida]')).toHaveText('Comprar, 19,99 €');
  await expect(page.locator(HOJA + ' [data-pace-premium-codigo]')).toHaveCount(0);
  expect(errores).toEqual([]);
});

test('«Tengo un código» abre la hoja con el campo, y en inglés las dos filas', async ({ page, context }) => {
  await sembrar(context, { lang: 'en' });
  await irAlArtefacto(page);
  await abrirAjustes(page, '/index.html#tienda-vida');
  await expect(page.locator(PANEL + ' button.pace-aj-accion', { hasText: 'Get it for life' }).locator('[data-pace-aj-comprar]')).toHaveText('€19.99');
  await page.locator(PANEL + ' button.pace-aj-accion', { hasText: 'I have a code' }).click();
  await expect(page.locator(HOJA + ' [data-pace-premium-codigo]')).toBeVisible();
});

test('con la tienda cerrada, como antes: «PACE completo · Introducir código»', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirAjustes(page, null);
  await expect(page.locator(PANEL + ' button.pace-aj-accion', { hasText: 'PACE completo' })).toContainText('Introducir código');
  await expect(page.locator(PANEL + ' [data-pace-aj-comprar]')).toHaveCount(0);
  await expect(page.locator(PANEL)).not.toContainText('Tenerlo para siempre');
});

/* 1280×880 es donde «Tus datos» iba abierta sin scroll y ahora, con la fila, se pliega 34 px antes
   (TweaksPanel.jsx); a 1280×940 va abierta con la fila. 1920×1080 es el lienzo crecido a 864 de alto.
   De 860 a ~875 (y, con la fila, de 894 a ~909) el panel ya pedía hasta 15 px antes de esto. */
for (const [ancho, alto] of [[360, 640], [360, 740], [1536, 710], [1280, 880], [1280, 940], [1920, 1080]]) {
  test(`a ${ancho}×${alto}, con la fila nueva, «Tus datos» no pide scroll ni saca nada de la ventana`, async ({ page, context }) => {
    await sembrar(context);
    await page.setViewportSize({ width: ancho, height: alto });
    await irAlArtefacto(page);
    await fijarViewport(page, ancho, alto);
    await abrirAjustes(page, '/index.html#tienda-vida');
    await expect(page.locator(PANEL + ' [data-pace-aj-comprar]')).toBeVisible();
    await page.waitForTimeout(400);
    expect(await sinScroll(page)).toEqual({ scroll: 0, fuera: [] });
  });
}
