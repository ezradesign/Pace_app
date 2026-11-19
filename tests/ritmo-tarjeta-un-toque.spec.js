/* PACE · E2E · «PREPARAR JORNADA» EN UN TOQUE (Ez, 2A del 18 nov. 2026)
 * ======================================================================
 * Con tu semana guardada, la tarjeta corta del móvil dice tu día de siempre («Hoy, como cada
 * jueves»). Su «Preparar jornada» abría la pregunta con otro «Preparar jornada» igual: cada
 * mañana, dos toques para lo mismo. Ez eligió la A: el primer toque sirve el día, el horario se
 * cambia después con «Cambiar», y «Hoy es distinto» está ya en la tarjeta corta. Sin semana
 * guardada no cambia nada: el botón abre la pregunta, porque aún no hay nada que servir.
 * El 8 de octubre de 2026 es jueves; el huso, el de playwright.config.js.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const ritmo = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo);

test.use({ viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true });

async function abrir(page, context, extra) {
  await sembrar(context, Object.assign({ sidebarCollapsed: true }, extra || {}));
  await page.clock.install({ time: new Date('2026-10-08T08:30:00+02:00') });
  await irAlArtefacto(page);
}

test('con tu semana, «Preparar jornada» sirve el día de un toque', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context, { ritmo: { semanaTipo: LV } });
  const tarjeta = vis(page, '[data-pace-ritmo-tarjeta-movil]');
  await expect(tarjeta.locator('[data-pace-ritmo-tarjeta-titulo]')).toHaveText('Hoy, como cada jueves');
  await tarjeta.locator('[data-pace-ritmo-comienza]').click();
  await expect(vis(page, '[data-pace-ritmo-estado="menu"]')).toBeVisible();
  await expect(vis(page, '[data-pace-ritmo-estado="habitual"]')).toHaveCount(0);
  expect((await ritmo(page)).dia.opcion).toBe('jornada');
  expect(errores).toEqual([]);
});

test('«Hoy es distinto» está en la tarjeta corta y abre la pregunta solo por hoy', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context, { ritmo: { semanaTipo: LV } });
  const tarjeta = vis(page, '[data-pace-ritmo-tarjeta-movil]');
  await expect(tarjeta).toContainText('Jornada entera');
  const distinto = tarjeta.locator('[data-pace-ritmo-distinto]');
  await expect(distinto).toHaveText('Hoy es distinto');
  /* Que se toque con el dedo: 24 px de alto como mínimo (WCAG 2.5.8). */
  const caja = await distinto.boundingBox();
  expect(caja.height).toBeGreaterThanOrEqual(24);
  /* Y la home sigue sin scroll a 360 × 640, con el enlace de más. */
  await asentarGeometria(page);
  const sobra = await page.evaluate(() => {
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
    return body.scrollHeight - body.clientHeight;
  });
  expect(sobra, 'la home pide scroll').toBeLessThanOrEqual(1);

  await distinto.click();
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toBeVisible();
  await expect(vis(page, '[data-pace-ritmo-estado="habitual"]')).toHaveCount(0);
  const r = await ritmo(page);
  expect(r.distinto).toBe('2026-10-08');
  expect(r.dia == null).toBe(true);
  expect(errores).toEqual([]);
});

test('sin semana guardada, «Preparar jornada» abre la pregunta y no hay «Hoy es distinto»', async ({ page, context }) => {
  await abrir(page, context, { ritmo: {} });
  const tarjeta = vis(page, '[data-pace-ritmo-tarjeta-movil]');
  await expect(tarjeta.locator('[data-pace-ritmo-distinto]')).toHaveCount(0);
  await tarjeta.locator('[data-pace-ritmo-comienza]').click();
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toBeVisible();
  expect((await ritmo(page)).dia == null).toBe(true);
});

test('en inglés: «Today is different»', async ({ page, context }) => {
  await abrir(page, context, { lang: 'en', ritmo: { semanaTipo: LV } });
  const tarjeta = vis(page, '[data-pace-ritmo-tarjeta-movil]');
  await expect(tarjeta.locator('[data-pace-ritmo-distinto]')).toHaveText('Today is different');
  await asentarGeometria(page);
  const sobra = await page.evaluate(() => {
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
    return body.scrollHeight - body.clientHeight;
  });
  expect(sobra, 'la home pide scroll').toBeLessThanOrEqual(1);
});
