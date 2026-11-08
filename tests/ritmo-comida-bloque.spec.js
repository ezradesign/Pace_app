/* PACE · E2E · EL BLOQUE EMPEZADO ANTES DE COMER ACABA A LA HORA DE COMER (Ez, S7 A del 8 nov. 2026)
 * ============================================================================================
 * Caza de la semana: en la pausa de antes de comer, «Ahora no» y «Empezar ya el bloque» a las 13:46.
 * El bloque (el de después de comer, 45 min) iba de 13:46 a 14:31, la línea dejaba la comida atrás
 * como si hubiera pasado y lo siguiente era una pausa a las 14:31. Ahora acaba a las 14:00, como
 * antes de una reunión, y la comida sigue a su hora, detrás.
 * El día: elegido a las 13:00, bloque de 13:00 a 13:45, pausa a las 13:45, comida de 14:00 a 15:00.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior, terminarBloque } = require('./helpers');

const HOY = '2026-10-14';
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const plan = (page) => page.evaluate(() => ritmoPlan(getState()).m.items.map((it) => it.tipo[0] + ritmoHora(it.desde) + '+' + it.dur).join(' '));

async function enLaPausa(page, context, lang) {
  await sembrar(context, { lang: lang || 'es', ritmo: { horario: HORARIO, dia: { fecha: HOY, opcion: 'jornada', desde: 780, cicloBase: 0, cambios: {} } } });
  await page.clock.install({ time: a('13:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
  await vis(page, '[data-pace-cta]').first().click();
  await terminarBloque(page);
  expect(await plan(page), 'GUARD: el día de la prueba').toMatch(/^f13:00\+45 p13:45\+5 l13:50\+10 c14:00\+60 f15:00\+45/);
  await overlaySuperior(page).getByRole('button', { name: lang === 'en' ? 'Not now' : 'Ahora no', exact: true }).click();
  await page.clock.fastForward(60 * 1000);
  await page.waitForTimeout(200);
}

test('empezado a las 13:46, el bloque acaba a las 14:00 y la comida sigue a su hora', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await enLaPausa(page, context);
  await vis(page, '[data-pace-aro-seguir]').click();
  await page.waitForTimeout(500);
  const g = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')));
  expect(g.minutes, 'el bloque duraba sus 45 min y se comía la comida').toBe(14);
  expect(new Date(g.endsAt).getHours() * 60 + new Date(g.endsAt).getMinutes()).toBe(840);
  const p = await plan(page);
  expect(p, 'detrás del bloque va la comida a las 14:00, no una pausa').toMatch(/f13:46\+14 c14:00\+60 f15:00\+45/);
  expect(await page.evaluate(() => getState().ritmo.dia.pasado.map((it) => it.tipo)), 'la comida no se ha hecho: no va a la historia').toEqual(['foco', 'pausa']);
  /* Al acabar, la parada abierta es la comida. */
  await terminarBloque(page);
  await expect(overlaySuperior(page)).toContainText('Ir a comer');
  expect(errores).toEqual([]);
});

test('CONTROL · empezado a su hora, después de comer, el bloque dura lo suyo', async ({ page, context }) => {
  await enLaPausa(page, context);
  /* Sin empezar nada hasta las 15:00: el bloque de después de comer, entero. */
  for (let i = 0; i < 40 && await page.evaluate(() => Date.now()) < a('15:00').getTime(); i++) {
    await page.clock.fastForward(Math.min(5 * 60 * 1000, a('15:00').getTime() - await page.evaluate(() => Date.now())));
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(300);
  await vis(page, '[data-pace-cta]').click();
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).minutes)).toBe(45);
});
