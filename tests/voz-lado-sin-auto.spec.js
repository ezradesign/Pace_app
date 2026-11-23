/* PACE · sin «Auto», el lado derecho también se dice
 * ==================================================
 * Caza del 23 nov. 2026. Con «Auto», el cambio de lado suena «Cambia» y, al acabar su cuenta,
 * «Derecha». Sin «Auto», el lado izquierdo empieza con «Izquierda» al tocar «›», pero el derecho
 * empezaba en silencio: «›» pasa de lado sin la cuenta de cambio, la fase sigue siendo la de trabajo,
 * y el «¡ya!» solo sonaba al salir de colocarse o de cambiar. La pantalla dice «Derecha» y la voz, nada.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

async function abrirRutina(page, biblioteca, id) {
  await page.getByRole('button', { name: new RegExp('^' + biblioteca) }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click(), id);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar/i.test(x.textContent || '')).click();
  });
}

test('voz-lado · sin Auto, «›» al acabar el lado izquierdo dice «Derecha», una vez', async ({ page, context }) => {
  test.setTimeout(120000);
  await sembrar(context, { soundOn: true, voiceOn: true, voice: 'sulafat', lang: 'es', cuerpoAuto: false });
  await page.clock.install({ time: new Date('2026-11-23T10:00:00+01:00') });
  await irAlArtefacto(page);
  await page.evaluate(() => {
    window.__voz = [];
    const orig = window.playSound;
    window.playSound = function (nombre, op) { window.__voz.push((op && op.voz) || nombre); return orig.apply(this, arguments); };
  });
  // «Cuello suave» (Estira): dos pasos de repeticiones y uno por lados al final.
  await abrirRutina(page, 'Estira', 'move.neck.3');
  const siguiente = page.locator('[data-pace-v1-btn="next"]');
  let izquierda = -1;
  for (let i = 0; i < 200 && izquierda < 0; i++) {
    await page.clock.runFor(1000);
    if (await page.locator('[data-pace-v1-btn="next"][data-pace-v1-espera]').count()) await siguiente.click();
    izquierda = (await page.evaluate(() => window.__voz)).indexOf('izquierda');
  }
  expect(izquierda).toBeGreaterThan(-1);
  // El lado izquierdo corre hasta 0 y espera a «›».
  await expect.poll(async () => { await page.clock.runFor(1000); return page.locator('[data-pace-v1-btn="next"][data-pace-v1-espera]').count(); },
    { timeout: 60000 }).toBe(1);
  const antes = (await page.evaluate(() => window.__voz)).length;
  await siguiente.click();
  await page.clock.runFor(1500);
  const despues = (await page.evaluate(() => window.__voz)).slice(antes);
  expect(despues.filter((v) => v === 'derecha')).toHaveLength(1);
  await expect(page.locator('[data-pace-session-root]')).toContainText(/Derecha/);
});

test('voz-lado · con Auto, el lado derecho sigue diciéndose una sola vez (tras «Cambia»)', async ({ page, context }) => {
  test.setTimeout(120000);
  await sembrar(context, { soundOn: true, voiceOn: true, voice: 'sulafat', lang: 'es', cuerpoAuto: true });
  await page.clock.install({ time: new Date('2026-11-23T10:00:00+01:00') });
  await irAlArtefacto(page);
  await page.evaluate(() => {
    window.__voz = [];
    const orig = window.playSound;
    window.playSound = function (nombre, op) { window.__voz.push((op && op.voz) || nombre); return orig.apply(this, arguments); };
  });
  await abrirRutina(page, 'Estira', 'move.neck.3');
  await expect.poll(async () => { await page.clock.runFor(2000); return page.evaluate(() => window.__voz.includes('move.end')); },
    { timeout: 90000 }).toBe(true);
  const voz = await page.evaluate(() => window.__voz);
  expect(voz.filter((v) => v === 'derecha')).toHaveLength(1);
  expect(voz.indexOf('cambia')).toBeLessThan(voz.indexOf('derecha'));
});
