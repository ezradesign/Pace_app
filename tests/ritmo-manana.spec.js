/* PACE · E2E · EL DÍA YA CONTESTADO (Fase 3, maqueta R2-manana)
 * ==============================================================
 * Con la semana tipo guardada, cada mañana la pregunta llega ya contestada con lo
 * de ese día. Ez lo eligió para todos el 7 de octubre de 2026. La pregunta de la
 * semana en la bienvenida tiene su archivo (onboarding-semana.spec.js); aquí, lo
 * que pasa cada mañana:
 *
 *   · escritorio: «Hoy, como cada jueves», tu opción marcada y «Comienza» la sirve;
 *   · móvil: la tarjeta del día de siempre, y «Hoy es distinto» abre la pregunta
 *     solo por hoy;
 *   · un día libre de tu semana es «Hoy voy por libre»;
 *   · sin jornada por delante (a las 20:00) vuelve la pregunta de siempre;
 *   · mirar no escribe nada: el día se deriva al pintar;
 *   · «Tu semana» en Ajustes abre la misma pregunta y guarda.
 * El 8 de octubre de 2026 es jueves; el huso, el de playwright.config.js.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const hora = (hhmm) => new Date('2026-10-08T' + hhmm + ':00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const ritmo = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo);

async function abrir(page, context, semana, hhmm, extra) {
  await sembrar(context, Object.assign({ ritmo: semana === undefined ? {} : { semanaTipo: semana } }, extra || {}));
  await page.clock.install({ time: hora(hhmm || '08:30') });
  await irAlArtefacto(page);
}

async function movil(browser, semana, hhmm) {
  const baseURL = test.info().project.use.baseURL;
  const context = await browser.newContext({ baseURL, viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true,
    locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  const page = await context.newPage();
  await abrir(page, context, semana, hhmm, { sidebarCollapsed: true });
  return { context, page };
}

test('escritorio: el jueves llega como cada jueves, con tu opción marcada, y «Comienza» la sirve', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context, LV);
  const fila = vis(page, '[data-pace-ritmo-estado="habitual"]');
  await expect(fila).toHaveAttribute('data-pace-ritmo-habitual', 'jornada');
  await expect(vis(page, '.pace-rt-titulo').first()).toHaveText('Hoy, como cada jueves');
  await expect(fila.locator('.pace-rt-chip-tuyo')).toHaveAttribute('data-pace-ritmo-opcion', 'jornada');
  await expect(fila.locator('.pace-rt-chip-tuyo')).toHaveCount(1);

  await fila.locator('[data-pace-ritmo-habitual-comienza]').click();
  await expect(vis(page, '[data-pace-ritmo-estado="menu"]')).toBeVisible();
  expect((await ritmo(page)).dia.opcion).toBe('jornada');
  expect(errores).toEqual([]);
});

test('móvil: la tarjeta del día de siempre, y «Hoy es distinto» abre la pregunta solo por hoy', async ({ browser }) => {
  const { context, page } = await movil(browser, LV);
  const errores = capturarErrores(page);
  const tarjeta = vis(page, '[data-pace-ritmo-estado="habitual"]');
  await expect(tarjeta).toContainText('Jornada entera');
  await expect(tarjeta).toContainText('como cada jueves');
  await expect(tarjeta.locator('.pace-rt-mini')).toBeVisible();

  await tarjeta.locator('[data-pace-ritmo-distinto]').click();
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toBeVisible();
  await expect(vis(page, '[data-pace-ritmo-estado="habitual"]')).toHaveCount(0);
  const r = await ritmo(page);
  expect(r.distinto).toBe('2026-10-08');
  expect(r.semanaTipo).toEqual(LV);

  /* Al día siguiente la semana vuelve a contestar: «distinto» caduca con la fecha. */
  await page.clock.fastForward(24 * 60 * 60 * 1000);
  await expect(vis(page, '[data-pace-ritmo-estado="habitual"]')).toContainText('como cada viernes', { timeout: 3000 });
  expect(errores).toEqual([]);
  await context.close();
});

test('móvil: «Comienza» sirve la media jornada de un jueves de media', async ({ browser }) => {
  const media = ['jornada', 'jornada', 'jornada', 'media', 'jornada', 'libre', 'libre'];
  const { context, page } = await movil(browser, media);
  const tarjeta = vis(page, '[data-pace-ritmo-estado="habitual"]');
  await expect(tarjeta).toHaveAttribute('data-pace-ritmo-habitual', 'media');
  await expect(tarjeta).toContainText('Media jornada');
  await tarjeta.locator('[data-pace-ritmo-habitual-comienza]').click();
  await expect(vis(page, '[data-pace-ritmo-estado="menu"]')).toBeVisible();
  expect((await ritmo(page)).dia.opcion).toBe('media');
  await context.close();
});

test('un día libre de tu semana es «Hoy voy por libre»', async ({ page, context }) => {
  await abrir(page, context, ['jornada', 'jornada', 'jornada', 'libre', 'jornada', 'libre', 'libre']);
  await expect(page.locator('[data-pace-ritmo-tarjeta]')).toBeVisible();
  await expect(page.locator('[data-pace-ritmo-estado]')).toHaveCount(0);
});

test('a las 20:00, sin jornada por delante, vuelve la pregunta de siempre', async ({ page, context }) => {
  await abrir(page, context, LV, '20:00');
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toBeVisible();
  await expect(page.locator('[data-pace-ritmo-estado="habitual"]')).toHaveCount(0);
});

test('CONTROL: sin semana guardada, la pregunta de siempre', async ({ page, context }) => {
  await abrir(page, context, undefined);
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toBeVisible();
  await expect(page.locator('[data-pace-ritmo-estado="habitual"]')).toHaveCount(0);
});

test('mirar no escribe: la tarjeta del día se deriva de la semana sin guardar nada', async ({ page, context }) => {
  await abrir(page, context, LV);
  await expect(vis(page, '[data-pace-ritmo-estado="habitual"]')).toBeVisible();
  expect(await ritmo(page)).toEqual({ semanaTipo: LV });
});

test('«Tu semana» en Ajustes abre la pregunta encima y guarda lo tocado', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context, LV);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.locator('[data-pace-tweaks-panel]').getByRole('button', { name: /Tu semana/ }).click();
  const hoja = page.locator('[data-pace-semana-hoja]');
  await expect(hoja).toBeVisible();
  await hoja.locator('[data-pace-semana-dia="6"]').click();   // sábado: libre → jornada
  await hoja.locator('[data-pace-semana-guardar]').click();
  await expect(hoja).toHaveCount(0);
  await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
  expect((await ritmo(page)).semanaTipo).toEqual(['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre']);
  expect(errores).toEqual([]);
});
