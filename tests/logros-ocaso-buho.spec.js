/* PACE · E2E · OCASO Y BÚHO, CON LO QUE PREMIAN AHORA (Ez, D-6 D del 11 nov. 2026: «D adaptarlos»)
 * ===================================================================================
 * Mismo dibujo, mismo id y mismo nombre; cambia lo que premian (app/state-achievements.ocaso.js):
 *  · Ocaso: cinco jornadas cerradas a su hora, sin un Foco empezado después de la salida.
 *  · Búho (secreto): contestar «¿Te ayudó?» 25 veces; «Ahora no» no cuenta.
 * QUE DEFIENDE: las dos reglas nuevas; que trasnochar ya no da ninguno (las 21 h y las 2-4 de antes);
 * que quien ya los tenía los conserva, y sus frases en español y en inglés.
 * Con las reglas de antes caen las cuatro primeras.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const DIA = 24 * 3600 * 1000;
const LUNES = new Date('2026-11-16T11:00:00');

/* Un día de jornada con todos sus bloques hechos (el contador de Focos por encima del plan). */
const cerrarHoy = (page) => page.evaluate(() => {
  const s = window.getState();
  window.setState({ cycle: 20, ritmo: Object.assign({}, s.ritmo, { libre: false,
    dia: { fecha: window.todayISO(), opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } }) });
  const p = window.ritmoPlan(window.getState());
  if (!p || p.hechos < p.total || !p.total) throw new Error('el día no quedó cerrado: ' + JSON.stringify(p && { h: p.hechos, t: p.total }));
});
const mirar = (page) => page.evaluate(() => window.checkTimeOfDayAchievements());
const tiene = (page, id) => page.evaluate((x) => !!window.getState().achievements[x], id);

async function abrir(page, context, extra, hora) {
  await page.clock.install({ time: hora || LUNES });
  await sembrar(context, extra || {});
  await irAlArtefacto(page);
}

test.describe('Ocaso', () => {
  test('cinco jornadas cerradas a su hora lo dan; cuatro no', async ({ page, context }) => {
    await abrir(page, context);
    for (let d = 0; d < 5; d++) {
      if (d) await page.clock.fastForward(DIA);
      await cerrarHoy(page);
      await mirar(page);
      expect(await tiene(page, 'master.dusk'), 'día ' + (d + 1)).toBe(d === 4);
    }
    expect((await page.evaluate(() => window.getState().ocasoDias)).length).toBe(5);
  });

  test('un Foco empezado después de la salida deja ese día fuera', async ({ page, context }) => {
    await abrir(page, context);
    let adelantado = 0;
    for (let d = 0; d < 5; d++) {
      if (d) { await page.clock.fastForward(DIA - adelantado); adelantado = 0; }
      await cerrarHoy(page);
      await mirar(page);
      if (d === 2) {
        /* Cerrada a las 11:00, y a las 18:30 acaba un Foco de 25 min empezado a las 18:05 (salida, 17:00). */
        await page.clock.fastForward(7.5 * 3600 * 1000);
        await page.evaluate(() => { window.paceOcasoFoco(25); window.checkTimeOfDayAchievements(); });
        adelantado = 7.5 * 3600 * 1000;
      }
    }
    expect(await page.evaluate(() => window.getState().ocasoDias.length)).toBe(4);
    expect(await tiene(page, 'master.dusk')).toBe(false);
  });

  test('trasnochar ya no lo da: cinco días con sesión a las 22 h, por libre', async ({ page, context }) => {
    await abrir(page, context, {}, new Date('2026-11-16T22:00:00'));
    for (let d = 0; d < 5; d++) {
      if (d) await page.clock.fastForward(DIA);
      await mirar(page);
    }
    expect(await tiene(page, 'master.dusk')).toBe(false);
  });
});

test.describe('Búho', () => {
  test('25 respuestas a «¿Te ayudó?» lo dan; «Ahora no» no cuenta, y las 3 de la madrugada ya no', async ({ page, context }) => {
    await abrir(page, context, { routineFeedback: { 'breathe.box.4': { yes: 20, some: 2, no: 2, lastPromptDay: null } } },
      new Date('2026-11-16T03:00:00'));
    await mirar(page);
    expect(await tiene(page, 'secret.night.owl'), 'a las 3 con 24 respuestas').toBe(false);
    await page.evaluate(() => window.recordRoutineFeedback('breathe.478', 'later'));
    expect(await tiene(page, 'secret.night.owl'), '«Ahora no»').toBe(false);
    await page.evaluate(() => window.recordRoutineFeedback('breathe.478', 'some'));
    expect(await tiene(page, 'secret.night.owl'), 'la 25').toBe(true);
  });

  test('quien ya llevaba 25 respuestas lo recibe en su próxima sesión', async ({ page, context }) => {
    await abrir(page, context, { routineFeedback: { a: { yes: 10, some: 10, no: 5 } } });
    expect(await tiene(page, 'secret.night.owl')).toBe(false);
    await mirar(page);
    expect(await tiene(page, 'secret.night.owl')).toBe(true);
  });
});

test('quien ya los tenía los conserva, con su dibujo y la frase nueva en español y en inglés', async ({ page, context }) => {
  await abrir(page, context, { achievements: { 'master.dusk': { unlockedAt: 1 }, 'secret.night.owl': { unlockedAt: 1 } } });
  await mirar(page);
  expect(await tiene(page, 'master.dusk')).toBe(true);
  expect(await tiene(page, 'secret.night.owl')).toBe(true);
  await page.getByRole('button', { name: 'Ver logros' }).first().click();
  const ocaso = page.locator('[data-pace-ach="master.dusk"]');
  const buho = page.locator('[data-pace-ach="secret.night.owl"]');
  await expect(ocaso).toContainText('Ocaso');
  await expect(ocaso).toContainText('Cinco jornadas cerradas a su hora');
  await expect(buho).toContainText('Búho');
  await expect(buho).toContainText('Contestaste «¿Te ayudó?» 25 veces');
  await page.evaluate(() => window.setState({ lang: 'en' }));
  await expect(ocaso).toContainText('Five workdays closed on time');
  await expect(buho).toContainText('You answered “Did it help?” 25 times');
});
