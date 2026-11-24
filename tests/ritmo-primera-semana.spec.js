/* PACE · E2E · «HOY, LUNES» LA PRIMERA SEMANA (Ez, 10A del 18 nov. 2026)
 * =======================================================================
 * El tester guardó su semana un lunes y la tarjeta dijo enseguida «Hoy, como cada lunes»: aún no
 * había ningún lunes de antes. Ez eligió la A: la primera semana, «Hoy, lunes»; desde el mismo día
 * de la semana siguiente, «Hoy, como cada lunes». Igual en el aviso de entrada de las apps. La
 * semana se cuenta desde que se guardó por primera vez (`ritmo.semanaDesde`); quien la guardó antes
 * de esto no la tiene y sigue con «como cada».
 * El 8 de octubre de 2026 es jueves.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const JUEVES = new Date('2026-10-08T08:30:00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* En el ordenador: en el móvil el título va corto, «Hoy, jueves», con el esquema al lado (V8A, 24 nov.). */
test.use({ viewport: { width: 1280, height: 800 } });

async function abrir(page, context, ritmo, lang) {
  await sembrar(context, { sidebarCollapsed: true, lang: lang || 'es', ritmo });
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
}

test('la primera semana, «Hoy, jueves»; desde el jueves siguiente, «Hoy, como cada jueves»', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: LV, semanaDesde: '2026-10-06' });
  await expect(vis(page, '[data-pace-ritmo-tarjeta-titulo]')).toHaveText('Hoy, jueves');
  await page.clock.fastForward(7 * 24 * 60 * 60 * 1000);
  await expect(vis(page, '[data-pace-ritmo-tarjeta-titulo]')).toHaveText('Hoy, como cada jueves', { timeout: 3000 });
});

test('en inglés, «Today, Thursday»', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: LV, semanaDesde: '2026-10-08' }, 'en');
  await expect(vis(page, '[data-pace-ritmo-tarjeta-titulo]')).toHaveText('Today, Thursday');
});

test('guardar la semana apunta el día la primera vez, y no lo mueve después', async ({ page, context }) => {
  await abrir(page, context, {});
  const desde = () => page.evaluate(() => getState().ritmo.semanaDesde);
  await page.evaluate((lv) => ritmoGuardarSemana(lv, {}), LV);
  expect(await desde()).toBe('2026-10-08');
  await expect(vis(page, '[data-pace-ritmo-tarjeta-titulo]')).toHaveText('Hoy, jueves');
  await page.clock.fastForward(24 * 60 * 60 * 1000);
  await page.evaluate((lv) => ritmoGuardarSemana(lv, {}), LV);
  expect(await desde()).toBe('2026-10-08');
});

test('el aviso de entrada dice lo mismo: «Hoy, viernes» la primera semana y «como cada» después', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: LV, semanaDesde: '2026-10-08', avisoEntrada: true });
  const titulos = await page.evaluate(() => paceEntradaAvisos(getState(), Date.now()).map((a) => a.title));
  expect(titulos[0]).toBe('Hoy, viernes');
  expect(titulos).toContain('Hoy, como cada jueves');   /* el jueves 15, ya la segunda semana */
});

test('sin fecha (guardada antes), «Hoy, como cada jueves», como siempre', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: LV });
  await expect(vis(page, '[data-pace-ritmo-tarjeta-titulo]')).toHaveText('Hoy, como cada jueves');
});
