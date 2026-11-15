/* PACE · E2E · EL «NO» CON SU PORQUÉ (Ez, 4A del 15 nov. 2026)
 * ========================================================
 * La forma de la B con lo que hace la A (docs/proposals/maquetas-uso-15nov/, «4, otra vuelta»):
 * tras el «No», arriba lo que pasa si no dices más, como condición, y debajo, en una línea,
 * «¿Por qué? Aquí no podía · Difícil · Me molestó». Cada porqué hace lo suyo:
 *   · «Aquí no podía»: no la aparta ni cuenta como «No», y no deja evento;
 *   · «Difícil»: la aparta una semana, como el «No» de siempre;
 *   · «Me molestó»: la aparta y enlaza la página de Seguridad;
 *   · salir sin elegir: la aparta, como hasta ahora (feedback-una-semana.spec.js).
 * Y en un móvil de 360 × 640 la línea no pisa «Volver al inicio».
 *
 * Mutantes: si «Aquí no podía» no devuelve la entrada, cae la segunda; sin la línea de los
 * porqués, caen todas las que la tocan.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { leerContenedor } = require('./eventos.helpers');

const JUEVES = new Date('2026-09-17T10:20:00+02:00');
const RUTINA = 'breathe.physiological';   /* Suspiro fisiológico: 2 min, sin aviso, gratis */

/* Hasta el cierre de una respiración corta (como feedback-una-semana.spec.js), y el «No». */
async function hastaElNo(page, context, extra) {
  await sembrar(context, Object.assign({ ritmo: { libre: '2026-09-17' } }, extra || {}));
  await page.clock.install({ time: JUEVES });
  await irAlArtefacto(page);
  await page.evaluate((id) => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: id } })), RUTINA);
  const fb = page.locator('[data-pace-session-feedback]');
  for (let s = 0; s < 60 && !(await fb.count()); s++) { await page.clock.fastForward(5000); await page.waitForTimeout(20); }
  await expect(page.locator('[data-pace-fb-question]'), 'GUARD: el cierre no pregunta «¿Te ayudó?»').toBeVisible();
  await page.locator('[data-pace-fb-chip]').nth(2).click();
}
const entrada = (page) => page.evaluate((id) => (getState().routineFeedback || {})[id] || null, RUTINA);
const apartada = (page) => page.evaluate((id) => !!window.breakVetadas(getState().routineFeedback)[id], RUTINA);
const acuse = (page) => page.locator('[data-pace-fb-thanks]');
const razon = (page, k) => page.locator('[data-pace-fb-porque] [data-pace-fb-razon="' + k + '"]');

async function eventosNo(page) {
  await page.locator('[data-pace-session-footer] button').first().click();
  await page.locator('[data-pace-session-root]').waitFor({ state: 'detached' });
  await page.waitForTimeout(600);
  return ((await leerContenedor(page)) || { events: [] }).events.filter((e) => e.type === 'feedback.answered').map((e) => e.payload.response);
}

test('tras «No», lo de arriba es una condición y debajo van los tres porqués; «Difícil» la aparta una semana', async ({ page, context }) => {
  await hastaElNo(page, context);
  await expect(acuse(page)).toContainText('Gracias. Si no me dices por qué, no te la propondré durante una semana.');
  await expect(page.locator('[data-pace-fb-porque]')).toHaveText('¿Por qué? Aquí no podía · Difícil · Me molestó');
  await razon(page, 'dificil').click();
  await expect(acuse(page)).toContainText('Gracias. Durante una semana no te la propondré en las pausas.');
  await expect(page.locator('[data-pace-fb-porque]'), 'la línea de los porqués sigue tras elegir uno').toHaveCount(0);
  expect((await entrada(page)).no).toBe(1);
  expect(await apartada(page), '«Difícil» no la aparta').toBe(true);
  expect(await eventosNo(page), '«Difícil» no dejó su «No» en el registro').toEqual(['no']);
});

test('«Aquí no podía» no la aparta, no cuenta como «No» y no deja evento', async ({ page, context }) => {
  await hastaElNo(page, context);
  await razon(page, 'aqui').click();
  await expect(acuse(page)).toContainText('Gracias. No la aparto: otro día puede encajar.');
  const e = await entrada(page);
  expect(e && e.no, '«Aquí no podía» contó como «No»').toBe(0);
  expect(e && e.lastPromptDay, 'GUARD: hoy ya se preguntó').toBe('2026-09-17');
  expect(await apartada(page), '«Aquí no podía» la apartó').toBe(false);
  expect(await eventosNo(page), '«Aquí no podía» dejó un «No» en el registro').toEqual([]);
});

test('«Me molestó» la aparta y enlaza Seguridad; «Deshacer» vuelve a la pregunta', async ({ page, context }) => {
  await hastaElNo(page, context);
  await razon(page, 'molesto').click();
  await expect(acuse(page)).toContainText('Gracias. Durante una semana no te la propondré. Si notas dolor, para y lee Seguridad.');
  await expect(page.locator('[data-pace-fb-seguridad]')).toHaveAttribute('href', /\/safety$/);
  expect(await apartada(page)).toBe(true);
  await acuse(page).getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.locator('[data-pace-fb-question]')).toBeVisible();
  expect(await entrada(page), '«Deshacer» no deja la rutina como estaba').toBeNull();
});

test('si ya te ayudó (no se aparta), «Me molestó» dice «Gracias» y lleva igual a Seguridad', async ({ page, context }) => {
  await hastaElNo(page, context, { routineFeedback: { [RUTINA]: { yes: 1, some: 0, no: 0, lastPromptDay: '2026-09-10' } } });
  await expect(acuse(page)).toHaveText('Gracias');
  await razon(page, 'molesto').click();
  await expect(acuse(page)).toHaveText('Gracias. Si notas dolor, para y lee Seguridad.');
});

test('a 360 × 640 la línea de los porqués no pisa «Volver al inicio» ni se corta', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await hastaElNo(page, context);
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => {
    const botones = [...document.querySelectorAll('[data-pace-fb-razon], [data-pace-fb-deshacer], [data-pace-session-footer] button')];
    return botones.map((el) => {
      const r = el.getBoundingClientRect();
      let dentro = 0;
      for (let i = 1; i <= 9; i++) for (let j = 1; j <= 3; j++) {
        const e = document.elementFromPoint(r.left + r.width * i / 10, r.top + r.height * j / 4);
        if (e && (e === el || el.contains(e))) dentro++;
      }
      return el.textContent.trim() + ' ' + Math.round(100 * dentro / 27);
    });
  });
  expect(m.length, 'GUARD: faltan botones').toBe(5);
  expect(m.filter((x) => !/ 100$/.test(x)), 'algún botón del cierre se ve tapado o cortado').toEqual([]);
});
