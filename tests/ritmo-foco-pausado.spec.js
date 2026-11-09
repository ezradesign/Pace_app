/* PACE · E2E · UN FOCO PAUSADO SUMA DE FOCO LO QUE CONTÓ EL ARO (ChatGPT, 9 nov. 2026, punto 1)
 * ============================================================================================
 * Un bloque de 45 empezado a las 9:00, pausado de 9:10 a 9:30 y terminado a las 10:05 ocupa en la
 * línea de 9:00 a 10:05 (la línea dice la verdad), pero de foco son 45: los que contó el aro y los
 * que dice Estadísticas. Antes el tramo congelado solo llevaba `dur` (65) y las cuentas lo leían
 * como foco: el cierre decía «1 h 5 min de foco», la pausa larga podía llegar antes de tiempo y el
 * resto del día servía 20 minutos de foco menos. Ahora lleva aparte `foco` (`ritmoFocoMin`).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, terminarBloque } = require('./helpers');

const HOY = '2026-10-14';   // miércoles, horario de verano (+02:00)
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+02:00');
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const cta = (page) => vis(page, '[data-pace-cta]');

async function hastaLas(page, hhmm) {
  for (let i = 0; i < 200 && await page.evaluate(() => Date.now()) < a(hhmm).getTime(); i++) {
    await page.clock.fastForward(Math.min(5 * 60 * 1000, a(hhmm).getTime() - await page.evaluate(() => Date.now())));
    await page.waitForTimeout(20);
  }
}

test('45 de aro con 20 de pausa: el tramo ocupa 65 en la línea y suma 45 de foco en el día y al cerrarlo', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: { horario: HORARIO, dia: JORNADA } });
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => ritmoPlan(getState()).actual.dur), 'GUARD: el primer bloque es de 45').toBe(45);

  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(250);
  await page.clock.fastForward(10 * 60 * 1000);
  await page.waitForTimeout(100);
  await expect(cta(page)).toHaveText('Pausar foco');
  await cta(page).click();
  await expect(cta(page)).toHaveText('Reanudar foco');
  await page.clock.fastForward(20 * 60 * 1000);
  await page.waitForTimeout(100);
  await cta(page).click();
  await expect(cta(page)).toHaveText('Pausar foco');
  await terminarBloque(page);

  const r = await page.evaluate(() => {
    const s = getState(), p = ritmoPlan(s), dia = s.ritmo.dia;
    const tramo = (dia.pasado || []).filter((it) => it.tipo === 'foco').pop() || null;
    const previos = ritmoPrevios(dia.pasado, dia.primerBloque, dia.pausaPendiente, dia.bloque);
    return { minutos: s.totalFocusMin, desde: tramo && tramo.desde, dur: tramo && tramo.dur, focoTramo: tramo && tramo.foco,
             hecho: ritmoFocoHecho(p), foco: previos.foco, focoLarga: previos.focoLarga, seguidos: previos.seguidos,
             seguidosAro: bloquesSeguidos() };
  });
  expect(r.minutos, 'GUARD: Estadísticas cuenta los 45 del aro').toBe(45);
  expect(r.desde, 'el tramo empieza a las 9:00').toBe(540);
  expect(r.dur, 'en la línea ocupa de 9:00 a 10:05').toBe(65);
  expect(r.focoTramo, 'y lleva aparte sus minutos de foco').toBe(45);
  expect(r.hecho, 'el foco hecho del día').toBe(45);
  expect(r.foco, 'lo que el resto del día da por hecho').toBe(45);
  expect(r.focoLarga, 'la cuenta de la pausa larga').toBe(45);
  expect(r.seguidos, 'el foco seguido').toBe(45);
  expect(r.seguidosAro, '«Llevas … sentado» de los bloques cortos').toBe(45);

  /* Pasada la salida, el aro cierra el día con lo hecho: 45, no «1 h 5 min». */
  await hastaLas(page, '17:40');
  await page.waitForTimeout(300);
  await expect(vis(page, '[data-pace-dial-label]'), 'GUARD: el día está cerrado').toHaveText('Jornada cerrada');
  await expect(vis(page, '[data-pace-dial-hasta]')).toHaveText('45 min de foco');
  expect(errores).toEqual([]);
});

test('con bloques cortos, un bloque pausado no cuenta su pausa como foco seguido', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: HORARIO, libre: true } });
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  /* En puro: un pasado de dos bloques de 10, el segundo pausado 25 (ocupa 35, son 10 de foco). */
  const r = await page.evaluate(() => {
    const pasado = [{ tipo: 'foco', desde: 540, dur: 10 }, { tipo: 'foco', desde: 550, dur: 35, foco: 10 }];
    const viejo = [{ tipo: 'foco', desde: 540, dur: 10 }, { tipo: 'foco', desde: 550, dur: 35 }];
    const m = { items: pasado.concat([{ tipo: 'foco', desde: 600, dur: 10 }]) };
    return { previos: ritmoPrevios(pasado).seguidos, viejo: ritmoPrevios(viejo).seguidos, antes: bloquesSeguidoAntes(m, m.items[2]) };
  });
  expect(r.previos, 'dos bloques de 10 son 20 de foco seguido').toBe(20);
  expect(r.viejo, 'GUARD: un tramo sin `foco` (de antes) se lee por su `dur`').toBe(45);
  expect(r.antes, 'el bloque siguiente lleva 20 delante, no 45').toBe(20);
});
