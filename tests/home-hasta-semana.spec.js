/* PACE · «Hasta las» dentro del aro y la semana con el degradado del logo (Ez, 3C y 4B del 25 oct.)
 * ==================================================================================================
 * 3C: con el día de «A tu ritmo», «Hasta las 17:00» va bajo «Bloque 1 de 9», en cursiva, y todo el
 * interior del aro baja (hasta un 15 % de su alto; menos en las pantallas bajas, para que la home
 * no pida scroll: eso lo mide home-sin-scroll.spec.js). El hueco que tenía bajo el aro ya no está.
 * 4B: cada cápsula de la semana lleva un solo color del degradado del logo según lo llena que
 * está, del terracota al oliva; la de hoy entera y las pasadas más suaves.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const FECHA = '2026-10-08';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const hora = (hhmm) => new Date(FECHA + 'T' + hhmm + ':00+02:00');

/* Lo que baja el rótulo dentro del aro: de su borde de arriba al del aro. */
const rotuloArriba = (page) => page.evaluate(() => {
  const v = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
  return v('[data-pace-dial-label]').getBoundingClientRect().top - v('[data-pace-dial-ring]').getBoundingClientRect().top;
});

test.describe('3C · «Hasta las» en el aro', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });

  test('va bajo «Bloque 1 de 9», en cursiva, y el interior del aro baja', async ({ page, context }) => {
    await sembrar(context, { sidebarCollapsed: true, ritmo: { dia: JORNADA } });
    await page.clock.install({ time: hora('09:00') });
    const errores = capturarErrores(page);
    await irAlArtefacto(page);
    const hasta = page.locator('[data-pace-dial-label] + [data-pace-dial-hasta]');
    await expect(page.locator('[data-pace-dial-label]')).toHaveText('Bloque 1 de 9');
    await expect(hasta).toHaveText('Hasta las 17:00');
    expect(await hasta.evaluate((e) => getComputedStyle(e).fontStyle)).toBe('italic');
    await expect(page.locator('.pace-rt-rotulo'), 'el hueco vacío bajo el aro sigue ahí').toHaveCount(0);
    await page.waitForTimeout(600);
    const conDia = await rotuloArriba(page);
    /* Sin «Hasta las» (el bloque desplazado por la clase, quitado a mano) el rótulo queda más arriba. */
    await page.addStyleTag({ content: '[data-pace-dial-fit] div:has(> [data-pace-dial-hasta]) { transform: translateY(calc(var(--pace-dial-d, 360px) * -0.030)) !important; }' });
    await page.waitForTimeout(100);
    const sinBajar = await rotuloArriba(page);
    expect(conDia - sinBajar, 'el interior del aro no baja').toBeGreaterThanOrEqual(30);
    expect(errores).toEqual([]);
  });

  test('en inglés dice «Until 17:00»', async ({ page, context }) => {
    await sembrar(context, { lang: 'en', sidebarCollapsed: true, ritmo: { dia: JORNADA } });
    await page.clock.install({ time: hora('09:00') });
    await irAlArtefacto(page);
    await expect(page.locator('[data-pace-dial-label] + [data-pace-dial-hasta]')).toHaveText('Until 17:00');
  });
});

test('4B · cada cápsula de la semana lleva el color del degradado que toca a lo llena que está', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: hora('11:00') });
  await irAlArtefacto(page);
  /* Lunes 75 min, martes 30, miércoles 120 (el día más largo, la escala) y hoy, jueves, 120. */
  await page.evaluate(() => setState({ weeklyStats: Object.assign({}, getState().weeklyStats, {
    focusMinutes: [50, 25, 75, 100, 0, 0, 0], breathMinutes: [10, 5, 20, 10, 0, 0, 0], moveMinutes: [15, 0, 25, 10, 0, 0, 0] }) }));
  await page.waitForTimeout(300);
  const cap = await page.evaluate(() => {
    const sb = document.querySelector('[data-pace-sidebar]');
    const prueba = (fondo) => { const e = document.createElement('span'); e.style.background = fondo; sb.appendChild(e); const c = getComputedStyle(e).backgroundColor; e.remove(); return c; };
    return [...sb.querySelectorAll('[data-pace-capsula-relleno]')].map((e) => {
      const p = e.style.getPropertyValue('--pace-capsula-p');
      const tono = 'color-mix(in oklab, var(--focus) ' + p + ', var(--breathe))';
      const hoy = !!e.closest('[data-hoy="1"]');
      return { p, hoy, real: getComputedStyle(e).backgroundColor, esperado: prueba(hoy ? tono : 'color-mix(in oklab, ' + tono + ' 62%, var(--paper-2))') };
    });
  });
  expect(cap.map((c) => c.p)).toEqual(['63%', '25%', '100%', '100%']);
  for (const c of cap) expect(c.real, 'la cápsula al ' + c.p + (c.hoy ? ' (hoy)' : '')).toBe(c.esperado);
  expect(cap[1].real, 'GUARD: un día corto y uno largo salen del mismo color').not.toBe(cap[2].real);
});
