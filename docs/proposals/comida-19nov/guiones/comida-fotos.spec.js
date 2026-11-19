/* FOTOS de la caza de la comida (no es una prueba de la suite): FASE=antes|despues.
   Las deja en docs/proposals/comida-19nov/fotos/. */
'use strict';
const { test } = require('@playwright/test');
const path = require('path');
const { overlaySuperior, terminarBloque, fijarViewport, esperarModalAsentado } = require('./helpers');
const { vis, dia, hasta, enLaComida, cambiarHora } = require('./comida.helpers');

const FASE = process.env.FASE || 'antes';
const DIR = path.join(__dirname, '..', 'docs', 'proposals', 'comida-19nov', 'fotos');
const foto = (page, nombre) => page.screenshot({ path: path.join(DIR, nombre + '-' + FASE + '.png') });
const ANCHOS = [[1280, 720, 'es'], [360, 740, 'en']];
const seguir = async (page) => { if (await vis(page, '[data-pace-aro-seguir]').count()) await vis(page, '[data-pace-aro-seguir]').click(); else await vis(page, '[data-pace-cta]').first().click(); };

for (const [w, h, lang] of ANCHOS) {
  const sufijo = w + '-' + lang;
  test.describe(sufijo, () => {
    test.beforeEach(async ({ page, context }) => {
      await page.setViewportSize({ width: w, height: h });
    });
    const sembrarLang = { lang };

    test('1 · cambiar la hora con la comida por delante', async ({ page, context }) => {
      await dia(page, context, 795, '13:15', sembrarLang);
      await vis(page, '[data-pace-cta]').first().click();
      await terminarBloque(page);
      await overlaySuperior(page).getByRole('button', { name: lang === 'en' ? 'Not now' : 'Ahora no', exact: true }).click();
      await page.waitForTimeout(200);
      if (w >= 1280) await cambiarHora(page, 'comida', 1); else await page.evaluate(() => ritmoHorario('comida', 870));
      await page.waitForTimeout(300);
      await foto(page, '1-hora-' + sufijo);
    });

    test('2 · saltarse la comida a las 14:05', async ({ page, context }) => {
      await dia(page, context, 795, '13:15', sembrarLang);
      await vis(page, '[data-pace-cta]').first().click();
      await terminarBloque(page);
      await overlaySuperior(page).getByRole('button', { name: lang === 'en' ? 'Not now' : 'Ahora no', exact: true }).click();
      await hasta(page, '14:05');
      await vis(page, '[data-pace-cta]').first().click();
      await page.waitForTimeout(400);
      await foto(page, '2-saltada-' + sufijo);
    });

    test('3 · adelantar la comida con el primer bloque en marcha', async ({ page, context }) => {
      await dia(page, context, 750, '12:30', sembrarLang);
      await vis(page, '[data-pace-cta]').first().click();
      await hasta(page, '12:50');
      await page.evaluate(() => ritmoHorario('comida', 780));
      await hasta(page, '13:05');
      await foto(page, '3-primer-bloque-' + sufijo);
    });

    test('4 · la pausa de antes de comer, saltada en el mismo minuto', async ({ page, context }) => {
      await dia(page, context, 780, '13:00', sembrarLang);
      await vis(page, '[data-pace-cta]').first().click();
      await terminarBloque(page);
      await overlaySuperior(page).getByRole('button', { name: lang === 'en' ? 'Not now' : 'Ahora no', exact: true }).click();
      await seguir(page);
      await page.waitForTimeout(400);
      await foto(page, '4-pausa-linea-' + sufijo);
      await page.getByRole('button', { name: lang === 'en' ? 'View statistics' : 'Ver estadísticas' }).first().click();
      await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
      await esperarModalAsentado(page);
      await foto(page, '4-pausa-stats-' + sufijo);
    });

    test('5 · «Cambiar» a media mañana', async ({ page, context }) => {
      await dia(page, context, 540, '09:00', sembrarLang);
      await vis(page, '[data-pace-cta]').first().click();
      await terminarBloque(page);
      await overlaySuperior(page).getByRole('button', { name: lang === 'en' ? 'Not now' : 'Ahora no', exact: true }).click();
      await page.waitForTimeout(300);
      await seguir(page);
      await page.waitForTimeout(300);
      await terminarBloque(page);
      await overlaySuperior(page).getByRole('button', { name: lang === 'en' ? 'Not now' : 'Ahora no', exact: true }).click();
      await page.waitForTimeout(300);
      await foto(page, '5-cambiar-antes-de-pulsar-' + sufijo);
      await page.evaluate(() => { ritmoPreguntar(); ritmoHorario('comida', 780); ritmoElegir('jornada'); });
      await page.waitForTimeout(400);
      await foto(page, '5-cambiar-tras-elegir-' + sufijo);
    });
  });
}
