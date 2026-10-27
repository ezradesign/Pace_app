/* PACE · E2E · LA HORA Y LA MEDIANOCHE (auditoría externa del 21-22 oct. 2026 · v0.181.0)
 * ======================================================================================
 * El huso es el de playwright.config.js (Europe/Madrid). En 2026 el reloj se atrasa el
 * domingo 25 de octubre (a las 3:00 vuelven a ser las 2:00: esa hora pasa dos veces) y se
 * adelanta el domingo 29 de marzo (a las 2:00 pasan a ser las 3:00: esa hora no existe).
 * Cada caso se prueba con los dos cambios; el que no fallaba con uno queda como control.
 *
 *  · H1 · terminar un bloque de «A tu ritmo» al otro lado del cambio. En octubre el reloj
 *    marca una hora ANTERIOR a la de empezar y el resto del día se recolocaba hacia atrás,
 *    delante del bloque recién hecho; en marzo el bloque de 25 min quedaba como uno de 85.
 *  · H2 · empezar un bloque en la hora repetida, con lo de antes hecho en la primera
 *    pasada: el día se recolocaba hacia atrás, delante de lo ya hecho.
 *  · H3 · las horas que salen del registro: Estadísticas «Hoy» ordenaba las sesiones por la
 *    hora del reloj (la de la segunda pasada salía antes que la de la primera) y el motor
 *    de la semana sacaba la hora de empezar un foco restando minutos a una hora de reloj.
 *  · H4 · un código con fecha de fin vale hasta el final de ese día: el 25 de octubre (25 h)
 *    caducaba a las 23:00 y el 29 de marzo (23 h) duraba hasta la 1:00 del día siguiente.
 *  · H5 · un Foco que acaba antes de medianoche. La regla es la A de Ez del 12 oct.
 *    (mantenida el 27 oct.): cuenta si PACE se entera de su final el mismo día, despierto o
 *    al volver, y si te enteras al día siguiente no cuenta. Con el portátil dormido hasta
 *    la mañana, en cambio, se apuntaba al día siguiente: eso era lo que fallaba.
 * Calibrado en ROJO contra el `index.html` de v0.179.0.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');
const { firmar, conLlaveDePrueba } = require('./licencia.helpers');

const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

/* El día de «A tu ritmo» como lista [tipo, desde, dur] y lo que no casa: un tramo que
   empieza antes de que acabe el de delante, salvo el margen libre. */
async function elDia(page) {
  return page.evaluate(() => {
    const p = ritmoPlan(getState());
    const items = p.m.items.map((it) => [it.tipo, it.desde, it.dur]);
    const atras = [];
    for (let i = 1; i < items.length; i++) {
      const [, d0, u0] = items[i - 1];
      if (items[i][1] < d0 + u0) atras.push(items[i - 1].join(' ') + ' → ' + items[i].join(' '));
    }
    return { items, atras, hechos: p.hechos, desde: getState().ritmo.dia.desde };
  });
}

/* Elegir «Una hora» y empezar el bloque con el aro, como desde la home. */
async function unaHoraYEmpezar(page, cuando) {
  await page.clock.install({ time: new Date(cuando) });
  await irAlArtefacto(page);
  await page.evaluate(() => ritmoElegir('1h'));
  await page.locator('[data-pace-cta]').click();
  await expect(page.locator('[data-pace-cta]')).toHaveText('Pausar');
}

test.describe('H1 · terminar un bloque al otro lado del cambio de hora', () => {
  test('octubre: el bloque de 2:40 acaba a las 2:05 de la hora nueva y el día no vuelve atrás', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context, { ritmo: { horario: HORARIO } });
    await unaHoraYEmpezar(page, '2026-10-25T02:40:00+02:00');
    await page.clock.fastForward(25 * 60 * 1000);   // 2:05 de la hora nueva
    await expect.poll(() => page.evaluate(() => ritmoPlan(getState()).hechos)).toBe(1);
    const d = await elDia(page);
    expect(d.atras, 'el día se recolocó hacia atrás, delante del bloque hecho').toEqual([]);
    expect(d.items[0], 'el bloque hecho no dura lo que duró').toEqual(['foco', 160, 25]);
    expect(errores).toEqual([]);
  });

  test('marzo: el bloque de 1:50 acaba a las 3:15 y cuenta 25 minutos, no 85', async ({ page, context }) => {
    await sembrar(context, { ritmo: { horario: HORARIO } });
    await unaHoraYEmpezar(page, '2026-03-29T01:50:00+01:00');
    await page.clock.fastForward(25 * 60 * 1000);   // 3:15 de la hora nueva
    await expect.poll(() => page.evaluate(() => ritmoPlan(getState()).hechos)).toBe(1);
    const d = await elDia(page);
    expect(d.items[0], 'el bloque cuenta la hora que no existió').toEqual(['foco', 110, 25]);
    expect(d.atras).toEqual([]);
    /* el día sigue desde las 3:15: la hora que no existió queda como margen */
    expect(d.desde).toBe(195);
  });

  test('CONTROL: un domingo cualquiera, el bloque que acaba a su hora no mueve nada', async ({ page, context }) => {
    await sembrar(context, { ritmo: { horario: HORARIO } });
    await unaHoraYEmpezar(page, '2026-10-18T02:40:00+02:00');
    await page.clock.fastForward(25 * 60 * 1000);
    await expect.poll(() => page.evaluate(() => ritmoPlan(getState()).hechos)).toBe(1);
    const d = await elDia(page);
    expect(d.items[0]).toEqual(['foco', 160, 25]);
    expect(d.atras).toEqual([]);
    expect(d.desde).toBe(160);
  });
});

test.describe('H2 · empezar un bloque en la hora repetida', () => {
  /* El primer bloque, de 2:20 a 2:45 en la primera pasada, y la pausa abierta. */
  async function primerBloque(page, context, cuando) {
    await sembrar(context, { ritmo: { horario: HORARIO } });
    await unaHoraYEmpezar(page, cuando);
    await page.clock.fastForward(25 * 60 * 1000);
    await expect.poll(() => page.evaluate(() => ritmoPlan(getState()).hechos)).toBe(1);
  }

  test('octubre: el segundo bloque empieza a las 2:10 de la hora nueva y el día no vuelve atrás', async ({ page, context }) => {
    await primerBloque(page, context, '2026-10-25T02:20:00+02:00');
    await page.clock.setSystemTime(new Date('2026-10-25T02:10:00+01:00'));
    await page.evaluate(() => ritmoBloqueEmpezado(25));
    const d = await elDia(page);
    expect(d.atras, 'el día se recolocó hacia atrás, delante de lo ya hecho').toEqual([]);
    expect(d.items[0]).toEqual(['foco', 140, 25]);
  });

  test('CONTROL marzo: el segundo bloque empieza a las 3:10 y el día sigue desde ahí', async ({ page, context }) => {
    await primerBloque(page, context, '2026-03-29T01:20:00+01:00');
    await page.clock.setSystemTime(new Date('2026-03-29T03:10:00+02:00'));
    await page.evaluate(() => ritmoBloqueEmpezado(25));
    const d = await elDia(page);
    expect(d.atras).toEqual([]);
    expect(d.desde).toBe(190);
  });
});

test.describe('H3 · las horas que salen del registro', () => {
  /* Dos sesiones de hoy en el registro, sin pasar por el almacén. */
  async function conSesiones(page, sesiones) {
    await page.evaluate((lista) => {
      const hoy = todayISO();
      window.paceEventsSnapshot = () => ({ events: lista.map(([module, routineId, occurredAt, elapsed]) => ({
        type: 'session.completed', localDay: hoy, occurredAt,
        payload: { module, routineId, elapsedSeconds: elapsed, activeSeconds: elapsed, creditedMinutes: Math.round(elapsed / 60) },
      })) });
    }, sesiones);
  }

  test('octubre: «Hoy» pone primero lo que se hizo primero, aunque el reloj marque una hora anterior', async ({ page, context }) => {
    await sembrar(context);
    await page.clock.install({ time: new Date('2026-10-25T10:00:00+01:00') });
    await irAlArtefacto(page);
    await conSesiones(page, [
      ['breathe', 'breathe.box', '2026-10-25T00:40:00.000Z', 300],   // 2:40 de la primera pasada
      ['move', 'extra.desk', '2026-10-25T01:10:00.000Z', 300],       // 2:10 de la segunda
    ]);
    const orden = await page.evaluate(() => statsHoySesiones().map((s) => s.modulo + ' ' + ritmoHora(s.desde)));
    expect(orden).toEqual(['respira 2:40', 'mueve 2:10']);
  });

  test('octubre y marzo: el motor saca la hora de empezar un foco del instante, no restando a la hora de reloj', async ({ page, context }) => {
    await sembrar(context);
    await page.clock.install({ time: new Date('2026-10-26T10:00:00+01:00') });
    await irAlArtefacto(page);
    await conSesiones(page, [
      ['focus', 'focus.pomodoro', '2026-10-25T01:05:00.000Z', 1500],  // de 2:40 (primera pasada) a 2:05 (segunda)
      ['focus', 'focus.pomodoro', '2026-03-29T01:15:00.000Z', 1500],  // de 1:50 a 3:15
      ['focus', 'focus.pomodoro', '2026-10-21T08:25:00.000Z', 1500],  // CONTROL: de 10:00 a 10:25
    ]);
    const focos = await page.evaluate(() => ritmoMotorEntrada(getState(), todayISO()).focos.map((f) => ritmoHora(f.desde) + '-' + ritmoHora(f.hasta)));
    expect(focos).toEqual(['2:40-2:05', '1:50-3:15', '10:00-10:25']);
  });
});

test.describe('H4 · un código con fecha de fin vale hasta el final de ese día', () => {
  test.use({ serviceWorkers: 'block' });

  async function motivo(page, codigo) {
    return page.evaluate((c) => paceLicenciaComprobar(c).then((r) => r.ok ? 'vale' : r.motivo), codigo);
  }

  test('octubre: el que acaba el 25 vale a las 23:30 de ese día y caduca a medianoche', async ({ page, context }) => {
    await conLlaveDePrueba(context);
    await sembrar(context);
    await page.clock.install({ time: new Date('2026-10-25T23:30:00+01:00') });
    await irAlArtefacto(page);
    const codigo = firmar({ tester: 4, expiresAt: '2026-10-25' });
    expect(await motivo(page, codigo), 'caduca una hora antes').toBe('vale');
    await page.clock.setSystemTime(new Date('2026-10-26T00:00:30+01:00'));
    expect(await motivo(page, codigo)).toBe('caducada');
  });

  test('marzo: el que acaba el 29 ya no vale a las 0:30 del 30', async ({ page, context }) => {
    await conLlaveDePrueba(context);
    await sembrar(context);
    await page.clock.install({ time: new Date('2026-03-29T23:30:00+02:00') });
    await irAlArtefacto(page);
    const codigo = firmar({ tester: 4, expiresAt: '2026-03-29' });
    expect(await motivo(page, codigo)).toBe('vale');
    await page.clock.setSystemTime(new Date('2026-03-30T00:30:00+02:00'));
    expect(await motivo(page, codigo), 'dura una hora de más').toBe('caducada');
  });
});

test.describe('H5 · un Foco cuenta si PACE se entera de su final el mismo día, y nunca al día siguiente', () => {
  /* Miércoles 21 de octubre. La semilla, con las guardas que evitan que `loadState` rehaga la semana. */
  const SEMILLA = {
    lastActiveDay: 'Wed Oct 21 2026',
    _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
  };
  const NADA = { miercoles: 0, jueves: 0, historia: 0, ciclo: 0, total: 0 };
  const cuenta = (page) => page.evaluate(() => {
    const s = getState();
    return { miercoles: s.weeklyStats.focusMinutes[2], jueves: s.weeklyStats.focusMinutes[3],
             historia: (s.history.days['2026-10-21'] || {}).focusMinutes || 0, ciclo: s.cycle, total: s.totalFocusMin };
  });
  const pausa = (page) => page.locator('[data-pace-modal-backdrop]').last().getByText('Pausa bien hecha', { exact: true });

  /* Un Foco de 25 empezado a `cuando`. */
  async function empezar(page, context, cuando) {
    await sembrar(context, SEMILLA);
    await page.clock.install({ time: new Date(cuando) });
    await irAlArtefacto(page);
    await page.locator('[data-pace-cta]').click();
    await expect(page.locator('[data-pace-cta]')).toHaveText('Pausar');
  }
  /* Se cierra PACE y se vuelve a abrir a `cuando`. */
  async function volverCerrado(page, context, cuando) {
    await page.close();
    const otra = await context.newPage();
    await otra.clock.install({ time: new Date(cuando) });
    await irAlArtefacto(otra);
    return otra;
  }

  test('1 · PACE despierto: el Foco que acaba a las 23:55 cuenta el miércoles', async ({ page, context }) => {
    await empezar(page, context, '2026-10-21T23:30:00+02:00');
    await page.clock.fastForward(26 * 60 * 1000);          // 23:56
    await expect.poll(() => cuenta(page)).toMatchObject({ miercoles: 25, ciclo: 1 });
    await page.clock.fastForward(15 * 60 * 1000);          // 0:11 del jueves
    await expect.poll(() => cuenta(page)).toEqual({ miercoles: 25, jueves: 0, historia: 25, ciclo: 0, total: 25 });
  });

  test('2 · con PACE cerrado, al volver el mismo día cuenta y se abre la pausa', async ({ page, context }) => {
    await empezar(page, context, '2026-10-21T23:00:00+02:00');
    const otra = await volverCerrado(page, context, '2026-10-21T23:40:00+02:00');
    await expect.poll(() => cuenta(otra)).toEqual({ miercoles: 25, jueves: 0, historia: 0, ciclo: 1, total: 25 });
    await expect(pausa(otra)).toBeVisible();
  });

  test('2 · con el portátil dormido, al despertar el mismo día cuenta y se abre la pausa', async ({ page, context }) => {
    await empezar(page, context, '2026-10-21T23:00:00+02:00');
    await page.clock.fastForward(40 * 60 * 1000);          // 23:40, de golpe
    await expect.poll(() => cuenta(page)).toEqual({ miercoles: 25, jueves: 0, historia: 0, ciclo: 1, total: 25 });
    await expect(pausa(page)).toBeVisible();
  });

  test('3 · con PACE cerrado, al volver al día siguiente no cuenta', async ({ page, context }) => {
    await empezar(page, context, '2026-10-21T23:30:00+02:00');
    const otra = await volverCerrado(page, context, '2026-10-22T00:10:00+02:00');
    await expect(otra.locator('[data-pace-dial-number]')).toHaveText('25:00');
    expect(await cuenta(otra)).toEqual(NADA);
    await expect(otra.locator('[data-pace-modal-backdrop]')).toHaveCount(0);
  });

  test('4 · con el portátil dormido hasta la mañana, no cuenta, y menos el jueves', async ({ page, context }) => {
    await empezar(page, context, '2026-10-21T23:30:00+02:00');
    await page.clock.fastForward(8 * 60 * 60 * 1000);      // 7:30 del jueves, de golpe
    await expect(page.locator('[data-pace-dial-number]')).toHaveText('25:00');
    expect(await cuenta(page), 'el Foco del miércoles se apuntó el jueves').toEqual(NADA);
    await expect(page.locator('[data-pace-modal-backdrop]')).toHaveCount(0);
  });

  test('CONTROL: el Foco que empieza antes de medianoche y acaba después cuenta el jueves', async ({ page, context }) => {
    await empezar(page, context, '2026-10-21T23:50:00+02:00');
    const otra = await volverCerrado(page, context, '2026-10-22T00:30:00+02:00');
    await expect.poll(() => cuenta(otra)).toEqual({ miercoles: 0, jueves: 25, historia: 0, ciclo: 1, total: 25 });
  });
});
