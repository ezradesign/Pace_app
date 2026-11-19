/* PACE · E2E · lo común de las pruebas de la comida de la jornada (caza del 19 nov. 2026)
 * El día: jornada de 9:00 a 17:00, comida a las 14:00 durante una hora, el 14 oct. 2026. */
'use strict';

const { expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior, terminarBloque } = require('./helpers');

const HOY = '2026-10-14';
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* El día tal como lo compone la app: «f13:15+45 c14:00+60 …» (tipo, hora, minutos). */
const plan = (page) => page.evaluate(() => ritmoPlan(getState()).m.items.map((it) => it.tipo[0] + ritmoHora(it.desde) + '+' + it.dur).join(' '));
const pasado = (page) => page.evaluate(() => ((getState().ritmo.dia || {}).pasado || []).map((it) => it.tipo[0] + ritmoHora(it.desde) + '+' + it.dur).join(' '));

/* El día elegido a la hora `desde` (minutos) y el reloj de la página a `hora`. */
async function dia(page, context, desde, hora, extra) {
  await sembrar(context, Object.assign({ ritmo: { horario: HORARIO, dia: { fecha: HOY, opcion: 'jornada', desde: desde, cicloBase: 0, cambios: {} } } }, extra || {}));
  await page.clock.install({ time: a(hora) });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
}

/* El reloj hasta `hhmm`, de cinco en cinco minutos (el vigilante de cada minuto va viendo la hora). */
async function hasta(page, hhmm) {
  const fin = a(hhmm).getTime();
  for (let i = 0; i < 80; i++) {
    const ahora = await page.evaluate(() => Date.now());
    if (ahora >= fin) break;
    await page.clock.fastForward(Math.min(5 * 60 * 1000, fin - ahora));
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(300);
}

/* Elegido a las 13:15: un bloque hasta las 14:00 y detrás la comida. Al acabarlo, la ventana es la
   de la comida («Ir a comer», «Seguir con el bloque 2», «Ahora no»). */
async function enLaComida(page, context, boton) {
  await dia(page, context, 795, '13:15');
  await vis(page, '[data-pace-cta]').first().click();
  await terminarBloque(page);
  expect(await plan(page), 'GUARD: el día de la prueba').toMatch(/^f13:15\+45 c14:00\+60 f15:00\+45/);
  await overlaySuperior(page).getByRole('button', { name: boton || 'Ahora no', exact: true }).click();
  await page.waitForTimeout(200);
}

/* Cambiar una hora desde la frase del día servido, con «−» y «+» como lo haría la persona. */
async function cambiarHora(page, campo, pasos) {
  await vis(page, '[data-pace-ritmo-horario="' + campo + '"]').first().click();
  const boton = page.locator(pasos > 0 ? '[data-pace-ritmo-mas]' : '[data-pace-ritmo-menos]');
  for (let i = 0; i < Math.abs(pasos); i++) await boton.click();
  await page.locator('[data-pace-ritmo-cambiar]').click();
  await page.waitForTimeout(300);
}

module.exports = { HOY, HORARIO, a, vis, plan, pasado, dia, hasta, enLaComida, cambiarHora };
