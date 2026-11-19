/* PACE · las cuentas que empiezan en 5 van sin voz (Ez, 1A del 19 nov. 2026)
 * ==========================================================================
 * La pantalla de la entrada, de colocarse (5 s) y del cambio de lado (5 s) cuenta 5, 4, 3, 2, 1, y la voz
 * solo tenía «tres, dos, uno»: el 5 y el 4 callaban y el 3 hablaba, una cuenta a medias. Ez eligió la 1A:
 * esas cuentas suenan a madera en el 3, el 2 y el 1, sin voz. Las que empiezan en 3 o menos (la vuelta de
 * la pausa) y las largas (el final de un paso con reloj o de un descanso, 2A) siguen diciendo
 * «tres, dos, uno».
 *
 * Se mira qué pide el runner a `playSound` con el reloj acelerado: la palabra (o `null`, que es madera).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

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
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
}

/* Cada sonido que pide el runner, con su palabra; la voz de verdad se cambia por una que dice que suena. */
const apuntar = (page) => page.evaluate(() => {
  window.__sonidos = [];
  const orig = window.playSound;
  window.playSound = function (nombre, op) { window.__sonidos.push({ s: nombre, v: op && op.voz ? op.voz : null }); return orig.apply(this, arguments); };
  window.paceVozCuerpoIntenta = () => true;
});
const sonidos = (page) => page.evaluate(() => window.__sonidos.slice());
const cuentaMadera = [{ s: 'move.warn', v: null }, { s: 'move.warn', v: null }, { s: 'move.warn', v: null }];

test('cinco-1 · «Manos y muñecas»: la entrada, colocarse y el cambio de lado (5 s) suenan a madera en 3, 2, 1; el final del lado, con voz', async ({ page, context }) => {
  test.setTimeout(120000);
  await sembrar(context, { soundOn: true, voiceOn: true, voice: 'sulafat' });
  await page.clock.install({ time: new Date('2026-11-19T10:00:00+01:00') });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await apuntar(page);
  await abrirRutina(page, 'Estira', 'move.wrists');
  for (let i = 0; i < 150; i++) {
    await page.clock.runFor(1000);
    if ((await sonidos(page)).some((x) => x.v === 'derecha')) break;
  }
  const s = await sonidos(page);
  const palabras = s.map((x) => x.v).filter(Boolean);
  expect(palabras, 'no llegó al segundo lado: ' + palabras.join(' ')).toContain('derecha');

  /* La entrada: tres maderas antes de la primera palabra, que es «Colócate». */
  const primera = s.findIndex((x) => x.v);
  expect(s.slice(0, primera)).toEqual(cuentaMadera);
  expect(s[primera].v).toBe('colocate');

  /* Cada cuenta de colocarse (5 s): de su palabra a «Ya» o al lado, tres maderas y nada más. */
  const tras = (i) => { let j = i + 1; while (j < s.length && !s[j].v) j++; return s.slice(i + 1, j); };
  const colocarse = s.map((x, i) => (['colocate', 'ultimo'].includes(x.v) ? i : -1)).filter((i) => i >= 0);
  expect(colocarse.length, 'las tres colocaciones de la rutina').toBe(3);
  for (const i of colocarse) expect(tras(i), 'la colocación tras «' + s[i].v + '»').toEqual(cuentaMadera);

  /* El cambio de lado (5 s): «Cambia», tres maderas, «Derecha». */
  const cambia = s.findIndex((x) => x.v === 'cambia');
  expect(tras(cambia)).toEqual(cuentaMadera);
  expect(s.slice(cambia + 4).find((x) => x.v).v).toBe('derecha');

  /* El final del primer lado (20 s, cuenta larga): sigue diciendo «tres, dos, uno», justo antes de «Cambia». */
  expect(palabras.filter((p) => /^c\d$/.test(p))).toEqual(['c3', 'c2', 'c1']);
  expect(palabras.slice(palabras.indexOf('cambia') - 3, palabras.indexOf('cambia'))).toEqual(['c3', 'c2', 'c1']);
  expect(errores).toEqual([]);
});

test('cinco-2 · `v1VozCuenta`: sin voz si la cuenta empieza en 4 o 5; con voz si empieza en 3 o menos, o en 6 o más', async ({ page, context }) => {
  await sembrar(context, { soundOn: true, voiceOn: true });
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const dice = (desde) => [3, 2, 1].map((n) => { const op = window.v1VozCuenta(n, desde); return op ? op.voz : null; });
    return { cinco: dice(5), cuatro: dice(4), tres: dice(3), seis: dice(6), diez: dice(10), vuelta: dice(undefined) };
  });
  expect(r.cinco).toEqual([null, null, null]);
  expect(r.cuatro).toEqual([null, null, null]);
  for (const k of ['tres', 'seis', 'diez', 'vuelta']) expect(r[k], k).toEqual(['c3', 'c2', 'c1']);
});
