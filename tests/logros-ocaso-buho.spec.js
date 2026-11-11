/* PACE · E2E · OCASO Y BÚHO, CON LO QUE PREMIAN AHORA (Ez, D-6 D del 11 nov. 2026: «D adaptarlos»)
 * ===================================================================================
 * Mismo dibujo, mismo id y mismo nombre; cambia lo que premian (app/state-achievements.ocaso.js):
 *  · Ocaso: cinco jornadas cerradas a su hora, sin un Foco empezado después de la salida.
 *  · Búho (secreto): contestar «¿Te ayudó?» 25 veces; «Ahora no» no cuenta.
 * QUE DEFIENDE: las dos reglas nuevas; que trasnochar ya no da ninguno (las 21 h y las 2-4 de antes);
 * que quien ya los tenía los conserva, y sus frases en español y en inglés.
 * Con las reglas de antes caen las cuatro primeras.
 * Y, desde la séptima pasada de Fable (n.º 7, 10, 15 y 16), con bloques de verdad: el Foco se mide desde
 * la hora a la que empezó (pausado, o visto al volver con PACE cerrado, no sale «tarde»), el que cruza la
 * medianoche saca de la cuenta su día, y una jornada que se cierra sola por la hora no cuenta aunque haya
 * sesiones a las 22 h. Con «ahora menos lo que dura» caen las dos primeras de «Ocaso con bloques de verdad».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, terminarBloque } = require('./helpers');

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

/* Ocaso con bloques de verdad: el Foco se empieza, se pausa y acaba en el aro, como en la app. */
const JORNADA = (fecha) => ({ ritmo: { dia: { fecha, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } }, soundOn: false,
  achievements: { 'first.step': { unlockedAt: 1 } } });
const cta = (page) => page.locator('[data-pace-cta]').filter({ visible: true }).first();
const ocaso = (page) => page.evaluate(() => { const s = window.getState(); return { tarde: s.ocasoTarde, dias: s.ocasoDias }; });
async function empezarFoco(page) {
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await cta(page).click();
  await expect(cta(page)).toHaveText(/Pausar/);
}

test.describe('Ocaso con bloques de verdad', () => {
  test('un bloque empezado a las 16:30 y pausado 40 min acaba a las 17:35: empezó antes de la salida y el día sigue contando', async ({ page, context }) => {
    await abrir(page, context, JORNADA('2026-11-16'), new Date('2026-11-16T16:30:00'));
    await empezarFoco(page);
    await page.clock.fastForward(10 * 60 * 1000);
    await cta(page).click();
    await expect(cta(page)).not.toHaveText(/Pausar/);
    await page.clock.fastForward(40 * 60 * 1000);
    await cta(page).click();
    await expect(cta(page)).toHaveText(/Pausar/);
    await terminarBloque(page);
    await expect.poll(() => page.evaluate(() => window.getState().cycle), 'GUARD: el bloque contó').toBe(1);
    expect(await ocaso(page), 'cuenta: su único bloque cabía antes de la salida; «ahora menos 25» daba las 17:10, «tarde»').toEqual({ tarde: null, dias: ['2026-11-16'] });
  });

  test('con PACE cerrado (el móvil bloqueado) de 16:40 a 18:00, el bloque de 16:30 tampoco es tarde', async ({ page, context }) => {
    await abrir(page, context, JORNADA('2026-11-16'), new Date('2026-11-16T16:30:00'));
    await empezarFoco(page);
    await page.clock.fastForward(10 * 60 * 1000);
    await page.goto('about:blank');
    await page.clock.fastForward(80 * 60 * 1000);
    await irAlArtefacto(page);
    await expect.poll(() => page.evaluate(() => window.getState().cycle), 'GUARD: el bloque contó al volver').toBe(1);
    expect(await ocaso(page), 'cuenta; «ahora menos 25» daba las 17:35, «tarde»').toEqual({ tarde: null, dias: ['2026-11-16'] });
  });

  test('CONTROL: un bloque empezado a las 17:05, después de la salida, deja el día fuera', async ({ page, context }) => {
    await abrir(page, context, JORNADA('2026-11-16'), new Date('2026-11-16T17:05:00'));
    await empezarFoco(page);
    await terminarBloque(page);
    await expect.poll(() => ocaso(page)).toEqual({ tarde: '2026-11-16', dias: [] });
  });

  test('un Foco empezado a las 23:50, tras una jornada cerrada a su hora, saca ese día al acabar a las 00:15', async ({ page, context }) => {
    await abrir(page, context, { soundOn: false, achievements: { 'first.step': { unlockedAt: 1 } },
      ocasoDias: ['2026-11-15', '2026-11-16'], ocasoSalida: { fecha: '2026-11-16', fin: 1020, finDesde: null } },
      new Date('2026-11-16T23:50:00'));
    await empezarFoco(page);
    await terminarBloque(page);
    await expect.poll(() => page.evaluate(() => window.todayISO()), 'GUARD: ya es el día siguiente').toBe('2026-11-17');
    /* Con la fecha de ahora, el día nuevo salía «tarde» y el de ayer seguía contando. */
    await expect.poll(() => ocaso(page)).toEqual({ tarde: '2026-11-16', dias: ['2026-11-15'] });
  });

  test('una jornada que se cierra sola por la hora, sin sus bloques, no cuenta aunque haya sesiones a las 22 h', async ({ page, context }) => {
    await abrir(page, context, {}, new Date('2026-11-16T22:00:00'));
    for (let d = 0; d < 5; d++) {
      if (d) await page.clock.fastForward(DIA);
      const p = await page.evaluate(() => {
        const s = window.getState();
        window.setState({ cycle: 0, ritmo: Object.assign({}, s.ritmo, { libre: false,
          dia: { fecha: window.todayISO(), opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } }) });
        const x = window.ritmoPlan(window.getState());
        return { cerrado: !!x.cerrado, hechos: x.hechos, total: x.total };
      });
      expect(p.cerrado && p.hechos < p.total, 'GUARD: «Jornada cerrada» por la hora, con bloques sin hacer').toBe(true);
      await mirar(page);
    }
    expect(await tiene(page, 'master.dusk'), 'la regla de antes (sesión pasadas las 21 h) lo daba').toBe(false);
    expect(await page.evaluate(() => window.getState().ocasoDias)).toEqual([]);
  });

  test('con todos sus bloques hechos, una sesión a las 22 h no saca el día: lo saca un Foco empezado tarde', async ({ page, context }) => {
    await abrir(page, context, {}, new Date('2026-11-16T22:00:00'));
    for (let d = 0; d < 5; d++) {
      if (d) await page.clock.fastForward(DIA);
      await cerrarHoy(page);
      await mirar(page);
    }
    expect(await tiene(page, 'master.dusk')).toBe(true);
  });

  /* Solo la jornada y la media jornada (Ez, «S1 ocaso: A», 11 nov.; séptima pasada de Fable, n.º 8).
     «Una hora» y «Dos horas» se cierran con uno o dos bloques: cinco así daban «Cinco jornadas
     cerradas a su hora». La media jornada sí cuenta. */
  for (const [opcion, desde, hora, cuenta] of [['1h', 600, '11:00', false], ['2h', 600, '12:00', false], ['media', 540, '13:30', true]]) {
    test(`cinco días de «${opcion}» con sus bloques ${cuenta ? 'dan' : 'no dan'} Ocaso`, async ({ page, context }) => {
      await abrir(page, context, {}, new Date('2026-11-16T' + hora + ':00'));
      for (let d = 0; d < 5; d++) {
        if (d) await page.clock.fastForward(DIA);
        const p = await page.evaluate(([o, de]) => {
          const s = window.getState();
          window.setState({ cycle: 20, ritmo: Object.assign({}, s.ritmo, { libre: false,
            dia: { fecha: window.todayISO(), opcion: o, desde: de, cicloBase: 0, cambios: {} } }) });
          const x = window.ritmoPlan(window.getState());
          return { total: x.total, hechos: x.hechos, opcion: x.m.opcion };
        }, [opcion, desde]);
        expect(p.opcion === opcion && p.total > 0 && p.hechos >= p.total, 'GUARD: el día queda con todos sus bloques').toBe(true);
        await mirar(page);
      }
      expect(await tiene(page, 'master.dusk')).toBe(cuenta);
      expect((await page.evaluate(() => window.getState().ocasoDias)).length).toBe(cuenta ? 5 : 0);
    });
  }

  test('quien ya tenía Ocaso por días de «Una hora» lo conserva', async ({ page, context }) => {
    await abrir(page, context, { achievements: { 'master.dusk': { unlockedAt: 1 } } }, new Date('2026-11-16T11:00:00'));
    await page.evaluate(() => {
      const s = window.getState();
      window.setState({ cycle: 20, ritmo: Object.assign({}, s.ritmo, { libre: false,
        dia: { fecha: window.todayISO(), opcion: '1h', desde: 600, cicloBase: 0, cambios: {} } }) });
    });
    await mirar(page);
    expect(await tiene(page, 'master.dusk')).toBe(true);
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
