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
 *  · Dentro, cada bloque con su pausa y, al final, lo que no da para otro bloque se suma
 *    al último. El bloque más corto que se sirve es el del aro si baja de 15 min, y una
 *    larga que ya no deja sitio a otro bloque se sirve corta: así el día llega a su reloj
 *    también con el aro a 10.
 *  · La larga pide 75 min de foco desde la anterior (Ez, 15 oct.): con el aro a 5 o 10, en
 *    dos horas todas las pausas son cortas; con bloques de 25 o más, nada cambia.
 *  · Fuera de tu horario (eligiendo a 20 min de la salida o después), las dos cortas no
 *    se topan con la salida; dentro, sí. Eso también se mira en el arranque del día.
 *  · Lo único que puede pasar del reloj es el bloque que YA corre en el aro (la regla de
 *    s195: dura lo que marca el aro, pase lo que pase), más su cierre.
 *  · Las reuniones cuentan en el reloj (Ez, 15 oct.): la que cae dentro sale del foco.
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
    const dia = (op, ahora, aro, extra, ocupado) => {
      const prev = aro ? Object.assign({ bloques: 0, pausas: 0, foco: 0, usados: [], vasos: 0, claves: 0, primerBloque: aro, bloque: aro }, extra || {}) : null;
      const m = ritmoComponer(op, Object.assign({}, H, { ahora, ocupado }), pozos, {}, 8, prev);
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
      '2h 17:51 recolocado a las 18:30': dia('2h', 1110, 5, { bloques: 4, pausas: 3, foco: 20, claves: 3, inicio: 1071, pausasLarga: 3, focoLarga: 20 }),
      /* y «fuera de hora» se mira en el arranque: empezado a las 16:30 (dentro), recompuesto
         a las 16:50 (ya a 10 min de la salida), sigue acabando a la salida */
      '2h 16:30 recolocado a las 16:50': dia('2h', 1010, 5, { bloques: 2, pausas: 2, foco: 10, claves: 2, inicio: 990, pausasLarga: 2, focoLarga: 10 }),
      /* LAS REUNIONES CUENTAN (Ez, 15 oct.): con una de 9:30 a 10:00, «Dos horas» sigue acabando
         a las 11:00 y la media hora sale del foco */
      '2h 9:00 plan, reunión 9:30-10:00': dia('2h', 540, null, null, [[570, 30]]),
      '2h 9:00 aro 5, reunión 9:30-10:00': dia('2h', 540, 5, null, [[570, 30]]),
    };
    /* la media y la entera, con aros cortos, siguen dentro de su salida (también
       recompuestas después de ella: solo queda el bloque que corre) */
    const salidas = [];
    [5, 10, 25].forEach((aro) => ['media', 'jornada'].forEach((op) => [540, 600, 720, 900].forEach((ahora) => {
      const prev = { bloques: 1, pausas: 1, foco: 30, usados: [], vasos: 0, claves: 1, primerBloque: aro, bloque: aro };
      const h = Object.assign({}, H, { ahora, media: { inicio: 540, salida: 780 } });
      const m = ritmoComponer(op, h, pozos, {}, 8, prev);
      const sal = op === 'media' ? h.media.salida : H.salida;
      /* lo único que puede pasar de la salida es el bloque que ya corre, y su cierre */
      if (m.hasta > Math.max(sal, ahora + aro + 5)) salidas.push(op + ' ' + ritmoHora(ahora) + ' aro ' + aro + ' acaba ' + ritmoHora(m.hasta));
    })));
    /* LA LARGA POR FOCO (Ez, 15 oct.): con el aro a 5 o 10, «Dos horas» no tiene larga; con
       bloques de 25 o más, la jornada tiene las de siempre */
    const largas = (op, aro, ahora) => {
      const prev = aro ? { bloques: 0, pausas: 0, foco: 0, usados: [], vasos: 0, claves: 0, primerBloque: aro, bloque: aro } : null;
      return ritmoComponer(op, Object.assign({}, H, { ahora: ahora || 540 }), pozos, {}, 8, prev).items.filter((it) => it.larga).length;
    };
    const cuantas = { '2h aro 5': largas('2h', 5), '2h aro 10': largas('2h', 10), 'jornada plan': largas('jornada', null),
      'jornada aro 25': largas('jornada', 25), 'jornada aro 10': largas('jornada', 10) };
    return { tabla, salidas, cuantas };
  }, HORARIO);
  expect(r.tabla).toEqual({
    '1h 9:00 plan': '10:00', '1h 9:00 aro 5': '10:00', '1h 9:00 aro 10': '10:00',
    '1h 9:00 aro 25': '10:00', '1h 9:00 aro 45': '9:50',
    '1h 9:00 aro 60': '10:05',
    '2h 17:51 plan': '19:51', '2h 17:51 aro 5': '19:51', '2h 17:51 aro 10': '19:51',
    '2h 17:51 aro 15': '19:51', '2h 17:51 aro 20': '19:51', '2h 17:51 aro 25': '19:51',
    '2h 17:51 aro 45': '19:46',
    '2h 16:00 plan': '17:00', '2h 16:00 aro 5': '17:00',
    '2h 17:51 recolocado a las 18:30': '19:51',
    '2h 16:30 recolocado a las 16:50': '17:00',
    '2h 9:00 plan, reunión 9:30-10:00': '11:00', '2h 9:00 aro 5, reunión 9:30-10:00': '11:00',
  });
  expect(r.salidas, 'la media o la entera pasan de su salida').toEqual([]);
  /* en main: 6 · 2 · 1 · 3 · 6 (con el aro a 10, una larga cada 30 min de foco) */
  expect(r.cuantas).toEqual({ '2h aro 5': 0, '2h aro 10': 0, 'jornada plan': 1, 'jornada aro 25': 3, 'jornada aro 10': 2 });
});

/* El día de Ez, vivido en la app: miércoles 14 a las 17:51, «Dos horas», el aro a 5 y
   cada bloque seguido del siguiente sin hacer la pausa (cada «Seguir» recoloca el día, que
   es justo lo que movía el final). En ningún momento el plan pasa de las 19:51. */
test('«Dos horas» a las 17:51 con el aro a 5: el plan acaba a las 19:51 bloque tras bloque', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { ritmo: { horario: HORARIO }, profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } });
  await page.clock.install({ time: new Date('2026-10-14T17:51:00+02:00') });
  await irAlArtefacto(page);
  /* al elegir, el día empieza en los 5 minutos de antes (17:50); al empezar el bloque, en
     su minuto exacto (17:51), y desde ahí se cuentan las dos horas */
  await page.locator('[data-pace-ritmo-opcion="2h"]').filter({ visible: true }).click();
  await expect(page.locator('[data-pace-ritmo-hasta]')).toHaveText('Hasta las 19:50');
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
