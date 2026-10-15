/* PACE · E2E · «DOS HORAS» DURA DOS HORAS (14 oct. 2026)
 * ========================================================
 * Ez eligió «Dos horas» a las 17:51 con el aro a 5 y el día acababa a las 21:16, con
 * 13 pausas: la regla servía los 105 min de foco de la opción con bloques de lo que
 * marcaba el aro, y cada bloque llevaba su pausa detrás. Lo que eligió Ez: el día acaba
 * a las dos horas pase lo que pase; con bloques cortos hay menos foco, no más reloj.
 *
 * LA REGLA, COMO TABLA DE CASOS (opción × duración del aro × hora de inicio):
 *  · «Una hora» y «Dos horas» tienen un `reloj` (60 y 120 min) que se cuenta desde que
 *    EMPEZÓ el día, no desde la última recomposición: recolocar no mueve el final.
 *  · Dentro, la regla de siempre: cada bloque con su pausa, la tercera larga y, al final,
 *    lo que no da para otro bloque se suma al último. La única novedad del final: una
 *    larga que ya no deja sitio a otro bloque se sirve corta (si no, con el aro a 10 el
 *    día acababa a la 1 h 40).
 *  · Fuera de tu horario (eligiendo a 20 min de la salida o después), las dos cortas no
 *    se topan con la salida; dentro, sí. Eso también se mira en el arranque del día.
 *  · Lo único que puede pasar del reloj es el bloque que YA corre en el aro (la regla de
 *    s195: dura lo que marca el aro, pase lo que pase), más su cierre.
 *  · La media jornada y la entera ya acababan a su salida con cualquier aro: no cambian.
 *
 * TRAMPA: el reloj de la app se fija CON OFFSET (ver ritmo.spec.js) y el bloque se
 * acaba minuto a minuto (un fastForward grande no abre la pausa, s187).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

test('la tabla de casos: «Una hora» y «Dos horas» no pasan de su reloj, con cualquier aro', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: HORARIO, libre: true } });
  await page.clock.install({ time: new Date('2026-10-13T09:00:00+02:00') });
  await irAlArtefacto(page);
  const r = await page.evaluate((H) => {
    const pozos = ritmoPozos(getState(), '2026-10-13');
    /* `aro` = la duración con la que arranca el primer bloque (null: la del plan) */
    const dia = (op, ahora, aro, extra) => {
      const prev = aro ? Object.assign({ bloques: 0, pausas: 0, foco: 0, usados: [], vasos: 0, claves: 0, primerBloque: aro, bloque: aro }, extra || {}) : null;
      const m = ritmoComponer(op, Object.assign({}, H, { ahora }), pozos, {}, 8, prev);
      return ritmoHora(m.hasta);
    };
    const tabla = {
      /* Una hora: 60 min con el plan (25) y con cualquier aro que quepa */
      '1h 9:00 plan': dia('1h', 540, null), '1h 9:00 aro 5': dia('1h', 540, 5), '1h 9:00 aro 10': dia('1h', 540, 10),
      '1h 9:00 aro 25': dia('1h', 540, 25), '1h 9:00 aro 45': dia('1h', 540, 45),
      /* el bloque que ya corre manda: 60 min de aro en «Una hora» son 60 + el cierre */
      '1h 9:00 aro 60': dia('1h', 540, 60),
      /* Dos horas, el caso de Ez (17:51, fuera de su horario) */
      '2h 17:51 plan': dia('2h', 1071, null), '2h 17:51 aro 5': dia('2h', 1071, 5), '2h 17:51 aro 10': dia('2h', 1071, 10),
      '2h 17:51 aro 15': dia('2h', 1071, 15), '2h 17:51 aro 20': dia('2h', 1071, 20), '2h 17:51 aro 25': dia('2h', 1071, 25),
      '2h 17:51 aro 45': dia('2h', 1071, 45),
      /* dentro del horario, la salida sigue mandando */
      '2h 16:00 plan': dia('2h', 960, null), '2h 16:00 aro 5': dia('2h', 960, 5),
      /* RECOLOCAR NO MUEVE EL FINAL: el día empezó a las 17:51 y se recompone a las 18:30 */
      '2h 17:51 recolocado a las 18:30': dia('2h', 1110, 5, { bloques: 4, pausas: 3, foco: 20, claves: 3, inicio: 1071 }),
      /* y «fuera de hora» se mira en el arranque: empezado a las 16:30 (dentro), recompuesto
         a las 16:50 (ya a 10 min de la salida), sigue acabando a la salida */
      '2h 16:30 recolocado a las 16:50': dia('2h', 1010, 5, { bloques: 2, pausas: 2, foco: 10, claves: 2, inicio: 990 }),
    };
    /* la media y la entera, con aros cortos, siguen dentro de su salida */
    const salidas = [];
    [5, 10, 25].forEach((aro) => ['media', 'jornada'].forEach((op) => [540, 600, 900].forEach((ahora) => {
      const prev = { bloques: 1, pausas: 1, foco: 30, usados: [], vasos: 0, claves: 1, primerBloque: aro, bloque: aro };
      const h = Object.assign({}, H, { ahora });
      const m = ritmoComponer(op, h, pozos, {}, 8, prev);
      const sal = op === 'media' ? ritmoMedia(h).salida : H.salida;
      if (m.hasta > sal) salidas.push(op + ' ' + ritmoHora(ahora) + ' aro ' + aro + ' acaba ' + ritmoHora(m.hasta));
    })));
    return { tabla, salidas };
  }, HORARIO);
  expect(r.tabla).toEqual({
    '1h 9:00 plan': '10:00', '1h 9:00 aro 5': '9:50', '1h 9:00 aro 10': '10:00',
    '1h 9:00 aro 25': '10:00', '1h 9:00 aro 45': '9:50',
    '1h 9:00 aro 60': '10:05',
    '2h 17:51 plan': '19:51', '2h 17:51 aro 5': '19:51', '2h 17:51 aro 10': '19:51',
    '2h 17:51 aro 15': '19:51', '2h 17:51 aro 20': '19:51', '2h 17:51 aro 25': '19:51',
    '2h 17:51 aro 45': '19:46',
    '2h 16:00 plan': '17:00', '2h 16:00 aro 5': '16:50',
    '2h 17:51 recolocado a las 18:30': '19:51',
    '2h 16:30 recolocado a las 16:50': '17:00',
  });
  expect(r.salidas, 'la media o la entera pasan de su salida').toEqual([]);
});

/* El día de Ez, vivido en la app: miércoles 14 a las 17:51, «Dos horas», el aro a 5 y
   cada bloque seguido del siguiente sin hacer la pausa (cada «Seguir» recoloca el día, que
   es justo lo que movía el final). En ningún momento el plan pasa de las 19:51. */
test('«Dos horas» a las 17:51 con el aro a 5: el plan acaba a las 19:51 bloque tras bloque', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: { horario: HORARIO }, profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } });
  await page.clock.install({ time: new Date('2026-10-14T17:51:00+02:00') });
  await irAlArtefacto(page);
  await page.locator('[data-pace-ritmo-opcion="2h"]').filter({ visible: true }).click();
  await expect(page.locator('[data-pace-ritmo-hasta]')).toHaveText('Hasta las 19:51');
  await page.getByRole('button', { name: 'Otro', exact: true }).click();
  const minutos = page.locator('input[type="number"]');
  await minutos.fill('5');
  await minutos.press('Enter');
  await page.getByRole('button', { name: 'Empezar', exact: true }).or(page.getByRole('button', { name: /^Empezar/ })).first().click();
  await page.waitForTimeout(250);
  const plan = () => page.evaluate(() => { const p = ritmoPlan(getState()); return { hasta: p.m.hasta, hechos: p.hechos, total: p.total, dur: p.actual && p.actual.dur }; });
  const vistos = [];
  for (let k = 1; k <= 12; k++) {
    const p = await plan();
    vistos.push(p.hasta);
    expect(p.hasta, 'tras empezar el bloque ' + k + ', el plan acaba a las ' + p.hasta).toBeLessThanOrEqual(1071 + 120);
    if (!p.dur) break;
    for (let i = 0; i < 20; i++) {
      await page.clock.fastForward(60 * 1000);
      await page.waitForTimeout(60);
      if (await page.locator('[data-pace-break-shortcut]').count()) break;
    }
    const seguir = page.getByRole('button', { name: 'Seguir con el bloque ' + (k + 1), exact: true });
    if (!(await seguir.count())) break;
    await seguir.click();
    await page.waitForTimeout(250);
  }
  expect(vistos.length, 'GUARD: el día no llegó a recolocarse').toBeGreaterThan(3);
  expect(Math.max(...vistos), 'el plan pasó de las dos horas').toBeLessThanOrEqual(1191);
  expect(errores).toEqual([]);
});
