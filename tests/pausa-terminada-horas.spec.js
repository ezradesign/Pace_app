/* PACE · E2E · «PAUSA TERMINADA» UN RATO, Y LUEGO LO DE SIEMPRE (Ez, 4A del 18 nov. 2026)
 * =========================================================================================
 * La V1 A (7 nov.) dejó «Pausa terminada» en el aro al volver. En el recorrido de tester, quien cerró PACE a
 * media mañana lo leyó a las 16:10, cuatro horas y media después. Ahora lo dice los 15 minutos siguientes al
 * final de la pausa; después, la línea de siempre. La ventana de la pausa sigue sin salir (abierta-horas).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

/* Martes 24 nov.: el primer bloque, de 9:00 a 9:45, hecho; su pausa, de 9:45 a 9:50, abierta. */
const SEMILLA = {
  cycle: 1, lastActiveDay: 'Tue Nov 24 2026', soundOn: false,
  ritmo: { dia: { fecha: '2026-11-24', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pausa: 1 } },
};

async function aroA(page, context, hora, lang) {
  await sembrar(context, Object.assign({}, SEMILLA, { lang: lang || 'es' }));
  await page.clock.install({ time: new Date('2026-11-24T' + hora + ':00+01:00') });
  await irAlArtefacto(page);
  return page.locator('[data-pace-dial-subtitle]').filter({ visible: true }).first().innerText();
}

const finPausa = (page) => page.evaluate(() => { const a = ritmoPausaAbierta(getState()); return a && a.it.desde + a.it.dur; });

test('a los 3 minutos de acabar, el aro dice «Pausa terminada»', async ({ page, context }) => {
  expect(await aroA(page, context, '09:53')).toBe('Pausa terminada');
  expect(await finPausa(page), 'GUARD: la pausa abierta acaba a las 9:50').toBe(590);
});

test('cuatro horas y media después, la línea de siempre', async ({ page, context }) => {
  const sub = await aroA(page, context, '12:20');
  expect(await finPausa(page), 'GUARD: la pausa sigue abierta').not.toBeNull();
  expect(sub).not.toBe('Pausa terminada');
});

test('en inglés, tampoco «Break over» horas después', async ({ page, context }) => {
  expect(await aroA(page, context, '12:20', 'en')).not.toBe('Break over');
});
