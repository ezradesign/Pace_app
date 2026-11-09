/* PACE · E2E · EL RUNNER EN INGLÉS NO PIDE CLAVES QUE NO EXISTEN (caza de lo nuevo, 8 nov. 2026)
 * ==========================================================================================
 * En inglés, `v1Instr` (MoveSessionV1.support.jsx) pedía la traducción de cada campo de cada
 * paso por su posición, también donde no hay nada que traducir: los pasos sin colocación (un
 * descanso, la segunda serie, ya colocado) y las rutinas propias, cuyo texto ya va en el idioma
 * de la app (`_moveFichaPaso`). En la app no se veía nada, pero en `localhost` la consola se
 * llenaba de `[i18n] missing key` (153 con «Levántate y sube», 592 con una rutina propia) y
 * tapaba los errores de verdad de cualquier banco o prueba en inglés.
 *
 * Se cuentan los avisos al abrir el runner, que pinta todos los textos de la rutina de una vez
 * (las «pilas» de `v1Reservas`). Y, para que callar no sea perder: cada campo con su inglés en
 * las cadenas sale en inglés. Contra la 0.194.0 caen las dos primeras.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const PROPIA = { id: 'custom.1761900300000', name: 'My afternoon one',
  steps: [{ name: 'Encogimiento de hombros', dur: 20, cue: '' }, { name: 'Descanso', dur: 15, cue: '' },
    { name: 'Giro sentado', dur: 20, cue: '' }, { name: 'Giro sentado', dur: 20, cue: '' }],
  createdAt: 1761900300000, updatedAt: 1761900300000 };

async function avisosAlAbrir(page, context, abrir) {
  await sembrar(context, { lang: 'en', customRoutines: [PROPIA] });
  await irAlArtefacto(page);
  const avisos = [];
  page.on('console', (m) => { if (/\[i18n\] missing/.test(m.text())) avisos.push(m.text()); });
  await page.evaluate(abrir);
  await page.locator('[data-pace-session-root]').waitFor({ state: 'visible' });
  /* «Prepárate» primero; el runner pinta sus textos al empezar. */
  await page.getByRole('button', { name: /^Start now/ }).click();
  await page.locator('[data-pace-v1-pila]').first().waitFor({ state: 'attached' });
  await page.waitForTimeout(800);
  return avisos;
}

test('«Levántate y sube» en inglés: ningún `[i18n] missing` al abrir el runner', async ({ page, context }) => {
  const avisos = await avisosAlAbrir(page, context, () => {
    const r = window.resolveBodyRoutine('extra.chair.squats');
    window.dispatchEvent(new CustomEvent('pace:hacerla', { detail: { routine: r.routine, kind: r.source } }));
  });
  expect(avisos.length, 'avisos de claves que no existen:\n' + avisos.slice(0, 5).join('\n')).toBe(0);
});

test('una rutina propia en inglés: ningún `[i18n] missing` al abrir el runner', async ({ page, context }) => {
  const avisos = await avisosAlAbrir(page, context, () => {
    const r = window.getCustomRoutine('custom.1761900300000');
    window.dispatchEvent(new CustomEvent('pace:hacerla', { detail: { routine: r, kind: 'move' } }));
  });
  expect(avisos.length, 'avisos de claves que no existen:\n' + avisos.slice(0, 5).join('\n')).toBe(0);
  /* Su texto, en inglés: la colocación de «Shoulder shrugs» no sale en castellano. */
  await expect(page.locator('[data-pace-session-root]')).not.toContainText('Hombros');
});

test('callar no es perder: todo campo de paso con su inglés en las cadenas sale en inglés', async ({ page, context }) => {
  await sembrar(context, { lang: 'en' });
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const en = window.PACE_STRINGS.en;
    const tR = (k, fb) => (en[k] === undefined ? fb : en[k]);
    const rutinas = [];
    [window.MOVE_ROUTINES, window.EXTRA_ROUTINES].forEach((g) => Object.keys(g || {}).forEach((k) => (g[k].items || []).forEach((x) => rutinas.push(x))));
    let mirados = 0; const perdidos = [];
    rutinas.forEach((rt) => (rt.steps || []).forEach((st, i) => ['setup', 'action', 'care'].forEach((campo) => {
      const clave = window.v1Clave(rt, i, 'instruction.' + campo);
      if (en[clave] === undefined) return;
      mirados++;
      if (window.v1Instr(tR, rt, i, campo) !== en[clave]) perdidos.push(clave);
    })));
    return { rutinas: rutinas.length, mirados, perdidos };
  });
  expect(r.rutinas, 'GUARD: no se leyó el catálogo').toBeGreaterThan(20);
  expect(r.mirados, 'GUARD: ningún campo con inglés').toBeGreaterThan(100);
  expect(r.perdidos, 'campos con inglés que ya no salen en inglés').toEqual([]);
});
