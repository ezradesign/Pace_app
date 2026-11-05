/* PACE · E2E · UN «NO» APARTA LA RUTINA UNA SEMANA, Y LO DICE (Ez, 5 nov. 2026: 2A)
 * ====================================================================================
 * Q4 de las revisiones de ChatGPT del 28 oct.: un «No» a «¿Te ayudó esta pausa?», sin ningún
 * «Sí» ni «Un poco» de antes, sacaba la rutina de lo que PACE propone PARA SIEMPRE (la regla de
 * s189) y la pantalla solo decía «Gracias». Ez eligió la 2A de la maqueta, «pero durante una
 * semana»: el «No» la aparta siete días, la pantalla lo dice y «Deshacer» lo deja como estaba.
 * Y, en la misma letra, «Ahora no» baja a su propia línea, debajo de Sí · Un poco · No.
 *
 * QUÉ DEFIENDE:
 *  · la regla, en puro: siete días desde el último «No» (o, en lo guardado antes, desde la
 *    última vez que se preguntó); un «Sí» o un «Un poco» de antes la sigue protegiendo;
 *  · la pantalla: tras «No» lo dice, y «Deshacer» devuelve la pregunta y la entrada de antes;
 *  · el registro: un «No» deshecho no deja evento, y uno que se queda, sí, al salir;
 *  · si la rutina ya ayudó, o PACE no la propone nunca, la pantalla dice solo «Gracias».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { leerContenedor } = require('./eventos.helpers');

const JUEVES = new Date('2026-09-17T10:20:00+02:00');
const RUTINA = 'breathe.physiological';   /* Suspiro fisiológico: 2 min, sin aviso, gratis */

/* Hasta el cierre de una respiración corta, con el reloj (como `hoy.js` de la maqueta). */
async function hastaElCierre(page, context, extra) {
  await sembrar(context, Object.assign({ ritmo: { libre: '2026-09-17' } }, extra || {}));
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await page.evaluate((id) => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: id } })), RUTINA);
  const fb = page.locator('[data-pace-session-feedback]');
  for (let s = 0; s < 60 && !(await fb.count()); s++) { await page.clock.fastForward(5000); await page.waitForTimeout(20); }
  await expect(page.locator('[data-pace-fb-question]'), 'GUARD: el cierre no pregunta «¿Te ayudó?»').toBeVisible();
}
const entrada = (page) => page.evaluate((id) => (getState().routineFeedback || {})[id] || null, RUTINA);

test('la regla: el «No» aparta siete días y un «Sí» de antes la sigue protegiendo', async ({ page, context }) => {
  await sembrar(context, {});
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const v = (fb, hoy) => Object.keys(window.breakVetadas(fb, hoy));
    const no = { yes: 0, some: 0, no: 1, lastNoDay: '2026-09-17', lastPromptDay: '2026-09-17' };
    return {
      mismoDia: v({ a: no }, '2026-09-17'),
      seisDias: v({ a: no }, '2026-09-23'),
      sieteDias: v({ a: no }, '2026-09-24'),
      conSi: v({ a: Object.assign({}, no, { yes: 1 }) }, '2026-09-17'),
      conPoco: v({ a: Object.assign({}, no, { some: 1 }) }, '2026-09-17'),
      /* Lo guardado antes de hoy no tiene `lastNoDay`: cuenta la última vez que se preguntó. */
      viejoDentro: v({ a: { yes: 0, some: 0, no: 2, lastPromptDay: '2026-09-12' } }, '2026-09-17'),
      viejoFuera: v({ a: { yes: 0, some: 0, no: 2, lastPromptDay: '2026-09-10' } }, '2026-09-17'),
      sinFecha: v({ a: { no: 3 } }, '2026-09-17'),
      escribe: window.nextRoutineFeedback({}, 'x', 'no').x,
      siNoEscribe: window.nextRoutineFeedback({}, 'x', 'yes').x,
    };
  });
  expect(r.mismoDia, 'el día del «No» no la aparta').toEqual(['a']);
  expect(r.seisDias, 'a los seis días ya vuelve: la semana no llega a siete').toEqual(['a']);
  expect(r.sieteDias, 'a los siete días sigue apartada: el «No» no caduca').toEqual([]);
  expect(r.conSi, 'un «No» tumba una rutina que ya había ayudado').toEqual([]);
  expect(r.conPoco, '«Un poco» ha dejado de contar como ayuda').toEqual([]);
  expect(r.viejoDentro, 'un «No» de antes, de hace cinco días, ya no aparta').toEqual(['a']);
  expect(r.viejoFuera, 'un «No» de antes sigue apartando para siempre').toEqual([]);
  expect(r.sinFecha, 'un «No» sin ninguna fecha aparta para siempre').toEqual([]);
  expect(r.escribe.lastNoDay, 'el «No» no apunta su día').toBeTruthy();
  expect(r.siNoEscribe.lastNoDay, 'un «Sí» apunta un día de «No»').toBeUndefined();
});

test('«Ahora no» va en su línea, debajo de Sí · Un poco · No', async ({ page, context }) => {
  for (const [w, h] of [[1280, 879], [360, 730]]) {
    await page.setViewportSize({ width: w, height: h });
    if (w === 1280) await hastaElCierre(page, context);
    else await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const caja = (el) => el.getBoundingClientRect();
      const chips = [...document.querySelectorAll('[data-pace-fb-chip]')].map(caja);
      const g = caja(document.querySelector('[data-pace-fb-ghost]'));
      const centroChips = (Math.min(...chips.map((c) => c.left)) + Math.max(...chips.map((c) => c.right))) / 2;
      return { debajo: g.top - Math.max(...chips.map((c) => c.bottom)), centrado: Math.abs((g.left + g.right) / 2 - centroChips), fila: new Set(chips.map((c) => Math.round(c.top))).size };
    });
    expect(m.fila, 'GUARD: a ' + w + ' px las tres respuestas no van en una fila').toBe(1);
    expect(m.debajo, 'a ' + w + ' px «Ahora no» no va debajo de las respuestas').toBeGreaterThanOrEqual(0);
    expect(m.centrado, 'a ' + w + ' px «Ahora no» no va centrado bajo las respuestas').toBeLessThan(3);
  }
});

test('tras «No» dice que la aparta una semana, y «Deshacer» lo deja como estaba', async ({ page, context }) => {
  await hastaElCierre(page, context);
  expect(await entrada(page), 'GUARD: la rutina ya traía respuestas').toBeNull();
  await page.locator('[data-pace-fb-chip]').nth(2).click();
  const acuse = page.locator('[data-pace-fb-thanks]');
  await expect(acuse).toContainText('Durante una semana no te la propondré en las pausas.');
  expect((await entrada(page)).no, 'el «No» no se ha guardado').toBe(1);
  expect(await page.evaluate((id) => !!window.breakVetadas(getState().routineFeedback)[id], RUTINA), 'el «No» no la aparta').toBe(true);

  await acuse.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.locator('[data-pace-fb-question]'), '«Deshacer» no devuelve la pregunta').toBeVisible();
  expect(await entrada(page), '«Deshacer» no deja la rutina como estaba').toBeNull();
  /* Y se puede volver a contestar. */
  await page.locator('[data-pace-fb-chip]').first().click();
  await expect(acuse).toHaveText('Gracias');
  expect((await entrada(page)).yes).toBe(1);
});

test('un «No» deshecho no deja evento; uno que se queda, sí, al salir', async ({ page, context }) => {
  await hastaElCierre(page, context);
  await page.locator('[data-pace-fb-chip]').nth(2).click();
  await page.locator('[data-pace-fb-thanks]').getByRole('button', { name: 'Deshacer' }).click();
  await page.locator('[data-pace-fb-chip]').nth(2).click();
  await page.locator('[data-pace-session-footer] button').first().click();
  await page.locator('[data-pace-session-root]').waitFor({ state: 'detached' });
  await page.waitForTimeout(600);
  const fb = ((await leerContenedor(page)) || { events: [] }).events.filter((e) => e.type === 'feedback.answered');
  expect(fb.map((e) => e.payload.response), 'el registro no tiene justo un «No»: el deshecho se coló o el bueno se perdió').toEqual(['no']);
});

test('si la rutina ya te ayudó, un «No» dice solo «Gracias»', async ({ page, context }) => {
  await hastaElCierre(page, context, { routineFeedback: { [RUTINA]: { yes: 1, some: 0, no: 0, lastPromptDay: '2026-09-10' } } });
  await page.locator('[data-pace-fb-chip]').nth(2).click();
  await expect(page.locator('[data-pace-fb-thanks]')).toHaveText('Gracias');
});

test('lo que PACE no propone nunca no promete apartarlo', async ({ page, context }) => {
  await sembrar(context, {});
  await irAlArtefacto(page);
  const r = await page.evaluate(() => ({
    suspiro: window.breakProponible('breathe.physiological'),
    rondas: window.breakProponible('breathe.rounds.express'),   /* con aviso de seguridad */
    propia: window.breakProponible('custom.algo'),
  }));
  expect(r.suspiro, 'GUARD: el suspiro debería poder proponerse').toBe(true);
  expect(r.rondas, 'promete apartar una rutina con aviso, que nunca se propone').toBe(false);
  expect(r.propia, 'promete apartar una rutina propia, que nunca se propone').toBe(false);
});
