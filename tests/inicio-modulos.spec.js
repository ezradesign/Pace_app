/* PACE · tests/inicio-modulos.spec.js
   ===================================
   LA APP ABRE SIEMPRE CON LOS MÓDULOS (Ez, 1A del 22 oct. 2026, sobre
   docs/proposals/maqueta-inicio-22oct.html). Sin contestar «¿Cuánto trabajas hoy?», la home
   enseñaba la pregunta entera en lugar de Respira, Estira, Mueve e Hidrátate, y para solo
   respirar había que declararse por libre (que además quita del calendario las pausas de
   hoy). Ahora sin contestar se ven los módulos y la tarjeta corta, y «Comienza» abre la
   pregunta. Con tu semana guardada, la tarjeta dice tu día de siempre y «Comienza» lo abre
   ya contestado.

   QUÉ DEFIENDE: los módulos y la tarjeta sin contestar (móvil y ordenador), que eso no es
   por libre, que «Comienza» abre la pregunta, que la tarjeta diga tu día de siempre y lo
   abra contestado, y que la loseta del ordenador sirva el día de un toque. Contra v0.174.4
   cae: sin contestar se veía la pregunta. Lo de no pedir scroll lo mide home-sin-scroll.spec.js.
*/
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, CLAVE_ESTADO } = require('./helpers');

const SEMANA = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const JUEVES = new Date('2026-10-22T08:30:00+02:00');

const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const leerRitmo = (page) => page.evaluate((c) => (JSON.parse(localStorage.getItem(c) || '{}').ritmo || {}), CLAVE_ESTADO);

for (const [nombre, vp] of [['móvil', { width: 360, height: 730 }], ['ordenador', { width: 1280, height: 800 }]]) {
  test(`${nombre}: sin contestar, la home abre con los cuatro módulos y la tarjeta corta, y no es por libre`, async ({ page, context }) => {
    await page.setViewportSize(vp);
    await sembrar(context, { ritmo: {} });
    await page.clock.install({ time: JUEVES });
    await irAlArtefacto(page);
    await expect(vis(page, '[data-pace-ritmo-tarjeta]')).toHaveCount(1);
    await expect(vis(page, '[data-pace-activitybar-chip]')).toHaveCount(4);
    await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]'), 'la pregunta entera ya no abre la home').toHaveCount(0);
    /* sin contestar no es por libre: nada se apunta ni se quita */
    const r = await leerRitmo(page);
    expect(r.libre == null, 'sin contestar se guardó como por libre').toBe(true);
    expect(await page.evaluate(() => ritmoDe(getState()).libre)).toBe(false);
  });
}

test('móvil: «Comienza» abre la pregunta entera, y «Hoy voy por libre» sigue ahí', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 730 });
  await sembrar(context, { ritmo: {} });
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await vis(page, '[data-pace-ritmo-comienza]').click();
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toHaveCount(1);
  await expect(vis(page, '[data-pace-ritmo-tarjeta]')).toHaveCount(0);
  await expect(vis(page, '[data-pace-ritmo-libre]')).toHaveCount(1);
  expect((await leerRitmo(page)).pregunta).toBe('2026-10-22');
});

test('móvil: con tu semana guardada, la tarjeta dice tu día de siempre y «Comienza» lo abre contestado', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 730 });
  await sembrar(context, { ritmo: { semanaTipo: SEMANA } });
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await expect(vis(page, '[data-pace-activitybar-chip]')).toHaveCount(4);
  await expect(vis(page, '[data-pace-ritmo-tarjeta-titulo]')).toHaveText('Hoy, como cada jueves');
  await expect(vis(page, '[data-pace-ritmo-tarjeta] .pace-rt-tm-nota')).toHaveText('Jornada entera, 9:00–17:00');
  await vis(page, '[data-pace-ritmo-comienza]').click();
  /* la pregunta llega con tu día de siempre ya contestado, listo para empezarlo */
  await expect(vis(page, '[data-pace-ritmo-habitual-comienza]')).toHaveCount(1);
  await vis(page, '[data-pace-ritmo-habitual-comienza]').click();
  await expect.poll(async () => ((await leerRitmo(page)).dia || {}).opcion).toBe('jornada');
});

test('ordenador: sin contestar, la loseta «Una hora» sirve el día de un toque', async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await sembrar(context, { ritmo: {} });
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await vis(page, '[data-pace-ritmo-loseta="1h"]').click();
  await expect.poll(async () => ((await leerRitmo(page)).dia || {}).opcion).toBe('1h');
  await expect(vis(page, '[data-pace-ritmo-tarjeta]')).toHaveCount(0);
});

test('en inglés, con tu semana guardada, la tarjeta dice «Today, like every Thursday»', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrar(context, { lang: 'en', ritmo: { semanaTipo: SEMANA } });
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await expect(vis(page, '[data-pace-ritmo-tarjeta-titulo]')).toHaveText('Today, like every Thursday');
  await expect(vis(page, '[data-pace-ritmo-tarjeta] .pace-rt-tm-nota')).toHaveText('Full day, 9:00–17:00');
});
