/* PACE · E2E · LA LÍNEA DE LOS LUNES (Ez: 3A de la auditoría del 10 nov.; el móvil, el 11 nov.)
 * ============================================================================================
 * Los lunes, desde v1 y sin PACE completo, «Los lunes, PACE completo te escribe tu semana ›» abre la
 * invitación (app/ritmo/ritmo.lunes.jsx). En el ordenador, en la fila del resumen del día; en el
 * móvil, en el sobre de arriba Y en una fila del cajón bajo «Tus rutinas» («Linea 2 en el sobre + 3
 * en la side bar»).
 *
 * QUE DEFIENDE:
 *  · El móvil: el sobre sale cerrado, su hoja lleva la carta del lunes y «Ver PACE completo» abre la
 *    invitación; al volver, el sobre está abierto. El cajón lleva la fila y tampoco desliza.
 *  · El ordenador: la línea en la fila del resumen, dentro del panel; ni sobre ni fila en la barra.
 *  · Un martes, o antes de v1, nada.
 * Sin ritmo.lunes.jsx caen las tres primeras (no hay sobre, ni fila, ni línea).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const LUNES = new Date('2026-11-23T10:00:00');
const MARTES = new Date('2026-11-24T10:00:00');
const HOY_L = '2026-11-23';
const HOY_M = '2026-11-24';
const dia = (fecha) => ({ ritmo: { dia: { fecha, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
/* Ya en v1, sin semana de prueba (instaló en v1) y sin código. */
const EN_V1 = { pasoV1: { at: 1, previo: false } };

async function comoEnV1(context) {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
  });
}

async function abrir(page, context, { ancho, alto, hora, v1 = true, extra }) {
  await page.setViewportSize({ width: ancho, height: alto });
  await page.clock.install({ time: hora });
  if (v1) await comoEnV1(context);
  await sembrar(context, Object.assign({}, v1 ? EN_V1 : {}, extra || {}));
  await irAlArtefacto(page);
  await page.clock.runFor(1500);
}

const sobreBoton = (page) => page.locator('button[aria-label="La carta del lunes"], button[title="La carta del lunes"]').first();

test.describe('la línea de los lunes', () => {
  test('en el móvil, un lunes: el sobre cerrado con la carta del lunes, que abre la invitación', async ({ page, context }) => {
    await abrir(page, context, { ancho: 360, alto: 740, hora: LUNES, extra: dia(HOY_L) });
    const boton = sobreBoton(page);
    await expect(boton).toBeVisible();
    expect(await page.evaluate(() => window.getState().lunesVisto)).toBeNull();
    await boton.click();
    const item = page.locator('[data-pace-sobre-item="lunes"]');
    await expect(item).toBeVisible();
    await expect(item).toContainText('Los lunes, PACE completo te escribe tu semana');
    expect(await page.evaluate(() => window.getState().lunesVisto)).toBe(HOY_L);
    await page.locator('[data-pace-sobre-abrir="lunes"]').click();
    await expect(page.getByText('La carta del lunes').first()).toBeVisible();
    await expect(page.getByText('Es parte de PACE completo.')).toBeVisible();
    /* Ni la home ni la barra se deslizan con el sobre puesto. */
    expect(await page.evaluate(() => document.scrollingElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(0);
    /* En el ordenador no hay línea que enseñar aquí: es la piel del móvil. */
    await expect(page.locator('[data-pace-lunes-linea]')).toBeHidden();
  });

  test('en el móvil, un lunes: la fila del cajón bajo «Tus rutinas», sin que el cajón deslice', async ({ page, context }) => {
    await abrir(page, context, { ancho: 360, alto: 740, hora: LUNES, extra: dia(HOY_L) });
    await page.getByRole('button', { name: 'Abrir panel' }).click();
    await page.clock.runFor(600);
    const fila = page.locator('[data-pace-lunes-fila]');
    await expect(fila).toBeVisible();
    const m = await page.evaluate(() => {
      const f = document.querySelector('[data-pace-lunes-fila]').getBoundingClientRect();
      const pie = document.querySelector('[data-pace-sidebar-pie]');
      const rutinas = pie.querySelector('button').getBoundingClientRect();
      const aside = document.querySelector('[data-pace-sidebar]');
      return { debajo: f.top >= rutinas.bottom - 1, fondo: f.bottom, alto: innerHeight, desliza: aside.scrollHeight - aside.clientHeight };
    });
    expect(m.debajo, 'va debajo de «Tus rutinas»').toBe(true);
    expect(m.fondo).toBeLessThanOrEqual(m.alto);
    expect(m.desliza).toBeLessThanOrEqual(0);
    await fila.click();
    await expect(page.getByText('Es parte de PACE completo.')).toBeVisible();
  });

  test('en el ordenador, un lunes: la línea en la fila del resumen, sin sobre ni fila en la barra', async ({ page, context }) => {
    for (const [ancho, alto] of [[1536, 710], [1920, 860], [1280, 720]]) {
      await page.setViewportSize({ width: ancho, height: alto });
      if (ancho === 1536) await abrir(page, context, { ancho, alto, hora: LUNES, extra: dia(HOY_L) });
      await page.clock.runFor(500);
      const linea = page.locator('[data-pace-lunes-linea]');
      await expect(linea, ancho + ' px').toBeVisible();
      const m = await page.evaluate(() => {
        const l = document.querySelector('[data-pace-lunes-linea]').getBoundingClientRect();
        const p = document.querySelector('.pace-rt-esc').getBoundingClientRect();
        const resumen = document.querySelector('[data-pace-ritmo-resumen]').getBoundingClientRect();
        return { dentro: l.left >= p.left && l.right <= p.right, enLaFila: l.top >= resumen.top - 1 && l.bottom <= resumen.bottom + 1,
          scroll: document.scrollingElement.scrollHeight - innerHeight };
      });
      expect(m, ancho + ' px').toEqual({ dentro: true, enLaFila: true, scroll: 0 });
      await expect(page.locator('[data-pace-lunes-fila]')).toHaveCount(0);
      await expect(sobreBoton(page)).toHaveCount(0);
    }
    await page.locator('[data-pace-lunes-linea]').click();
    await expect(page.getByText('Es parte de PACE completo.')).toBeVisible();
  });

  test('un martes no sale', async ({ page, context }) => {
    await abrir(page, context, { ancho: 360, alto: 740, hora: MARTES, extra: dia(HOY_M) });
    await expect(sobreBoton(page)).toHaveCount(0);
    await page.getByRole('button', { name: 'Abrir panel' }).click();
    await expect(page.locator('[data-pace-lunes-fila]')).toHaveCount(0);
  });

  test('antes de v1, un lunes, no sale', async ({ page, context }) => {
    await abrir(page, context, { ancho: 1536, alto: 710, hora: LUNES, v1: false, extra: dia(HOY_L) });
    await expect(page.locator('[data-pace-ritmo-resumen]')).toBeVisible();
    await expect(page.locator('[data-pace-lunes-linea]')).toHaveCount(0);
  });
});
