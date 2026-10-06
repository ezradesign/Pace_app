/* PACE · E2E · LA TARJETA POR LIBRE DEL MÓVIL
 * ===========================================
 * Por libre, en el móvil, la tarjeta del ritmo con sus cuatro losetas en dos
 * filas hacía que la home pidiera scroll (85 px a 360×718, el móvil de Ez; 124 a
 * 375×667). Ez eligió en la maqueta otra tarjeta solo para el móvil: «A TU
 * RITMO», la pregunta, el esquema de la línea del día SIN HORAS, «Tú eliges las
 * horas» y la píldora «Comienza», que abre la pregunta entera. En escritorio
 * sigue la de las losetas.
 *
 * Contra la versión anterior fallan todas menos la de escritorio, que es el
 * control de que allí no cambia nada.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const vis = (page, sel) => page.locator(sel).filter({ visible: true });

function scrollDeLaHome(page) {
  return page.evaluate(() => {
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
    return body.scrollHeight - body.clientHeight;
  });
}

test.describe('360×718, el móvil de Ez', () => {
  test.use({ viewport: { width: 360, height: 718 }, isMobile: true, hasTouch: true });

  test('la tarjeta del móvil: sin horas, con su esquema, y la home no pide scroll', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context, { sidebarCollapsed: true });
    await irAlArtefacto(page);
    const tarjeta = vis(page, '[data-pace-ritmo-tarjeta-movil]');
    await expect(tarjeta).toBeVisible();
    await expect(tarjeta).toContainText('A tu ritmo');
    await expect(tarjeta).toContainText('¿Cuánto trabajas hoy?');
    await expect(tarjeta).toContainText('Tú eliges las horas');
    /* Las horas se eligen después: en la tarjeta no puede salir ninguna. */
    expect(await tarjeta.textContent()).not.toMatch(/\d{1,2}:\d{2}/);
    /* El esquema es un dibujo: ocho paradas, dos de ellas largas, y la comida. */
    const esquema = tarjeta.locator('[data-pace-ritmo-esquema]');
    await expect(esquema).toHaveAttribute('aria-hidden', 'true');
    await expect(esquema.locator('.pace-rt-esq-punto')).toHaveCount(8);
    await expect(esquema.locator('.pace-rt-esq-punto.pace-rt-larga')).toHaveCount(2);
    await expect(esquema.locator('.pace-rt-esq-comida')).toHaveCount(1);
    /* La de escritorio está en el DOM pero no se ve. */
    await expect(vis(page, '[data-pace-ritmo-loseta]')).toHaveCount(0);
    await expect(page.locator('[data-pace-spc]')).toHaveCount(1);

    await asentarGeometria(page);
    expect(await scrollDeLaHome(page), 'la home pide scroll').toBeLessThanOrEqual(1);
    expect(errores).toEqual([]);
  });

  test('«Comienza» se toca bien con el dedo y abre la pregunta entera', async ({ page, context }) => {
    await sembrar(context, { sidebarCollapsed: true });
    await irAlArtefacto(page);
    const boton = vis(page, '[data-pace-ritmo-comienza]');
    await expect(boton).toHaveText('Comienza');
    const caja = await boton.boundingBox();
    expect(caja.height, 'la zona de toque').toBeGreaterThanOrEqual(44);
    await boton.click();
    await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toBeVisible();
    await expect(page.locator('[data-pace-ritmo-tarjeta]')).toHaveCount(0);
  });

  test('en inglés', async ({ page, context }) => {
    await sembrar(context, { sidebarCollapsed: true, lang: 'en' });
    await irAlArtefacto(page);
    const tarjeta = vis(page, '[data-pace-ritmo-tarjeta-movil]');
    await expect(tarjeta).toContainText('You choose the hours');
    await expect(tarjeta.locator('[data-pace-ritmo-comienza]')).toHaveText('Start');
  });
});

test.describe('375×667, un móvil bajo', () => {
  test.use({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });

  test('la tarjeta se aprieta y la home tampoco pide scroll', async ({ page, context }) => {
    await sembrar(context, { sidebarCollapsed: true });
    await irAlArtefacto(page);
    await expect(vis(page, '[data-pace-ritmo-tarjeta-movil]')).toBeVisible();
    await asentarGeometria(page);
    expect(await scrollDeLaHome(page), 'la home pide scroll').toBeLessThanOrEqual(1);
  });
});

test('escritorio: sigue la tarjeta de las losetas y la del móvil no se ve', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await expect(vis(page, '[data-pace-ritmo-loseta]')).toHaveCount(4);
  await expect(vis(page, '[data-pace-ritmo-ajustar]')).toHaveCount(1);
  await expect(vis(page, '[data-pace-ritmo-tarjeta-movil]')).toHaveCount(0);
  await expect(vis(page, '[data-pace-ritmo-comienza]')).toHaveCount(0);
});
