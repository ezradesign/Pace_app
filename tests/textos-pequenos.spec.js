/* PACE · E2E · LOS TEXTOS QUE NO DECÍAN LA VERDAD Y EL INGLÉS QUE FALTABA
 * ======================================================================
 * De la cola de las auditorías de Fable (filas 10, 20, 23 y 24):
 *  · /beta, la landing y la captura 6 de Play decían «sin rachas» y hay siete logros de días
 *    seguidos (2.T1). Ahora dicen lo de la ficha de Play: «sin rachas que castigan».
 *  · La ventana de la pausa se titulaba «Pausa bien hecha» ANTES de hacerla (F3): ahora «Tu pausa»,
 *    como con jornada. Y decía «3 MIN» donde la ficha, un toque después, decía «2–3 MIN» (F4): las
 *    dos sacan la cifra de `routineCifraMin`.
 *  · En inglés, una rutina propia sin nombre se guardaba como «Rutina propia», el manifiesto era
 *    solo castellano, el atajo de Mueve decía «movilidad» y Estira no tenía atajo (2.T5). Y el
 *    manifiesto no traía capturas para la instalación (T12; las vigila la tanda web de `verify`).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, terminarBloque, overlaySuperior, MEDIODIA } = require('./helpers');

const ROOT = path.join(__dirname, '..');

test('textos-1 · nadie promete «sin rachas» mientras haya logros de días seguidos', async () => {
  const catalogo = fs.readFileSync(path.join(ROOT, 'app/achievements/catalog.js'), 'utf8');
  expect(catalogo, 'ya no hay logros de días seguidos: esta prueba sobra').toMatch(/días seguidos/);
  for (const f of ['beta/index.html', 'landing/landing.html', 'scripts/play/capturas.js']) {
    const txt = fs.readFileSync(path.join(ROOT, f), 'utf8');
    expect(txt.match(/sin rachas(?! que castigan)/g), f + ' dice «sin rachas»').toBeNull();
    expect(txt.match(/no streaks(?! that punish)/g), f + ' dice «no streaks»').toBeNull();
  }
});

test('textos-2 · la pausa se titula «Tu pausa» y su propuesta dice los mismos minutos que la ficha', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, focusMinutes: 25, water: { today: 3, goal: 8 }, plan: { respira: true, muevete: true },
    lastActiveDay: MEDIODIA.toDateString() });
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await terminarBloque(page);
  const menu = page.locator('[data-pace-modal-backdrop]').last();
  await expect(menu.getByText('Tu pausa', { exact: true })).toBeVisible();
  await expect(menu.getByText('Pausa bien hecha')).toHaveCount(0);
  const prop = menu.locator('[data-pace-break-prop]');
  await expect(prop).toContainText('Estira');
  const enPausa = ((await prop.locator('b').first().textContent()) || '').trim();
  await prop.getByRole('button', { name: 'Empezar', exact: true }).click();
  const ficha = overlaySuperior(page);
  const enFicha = ((await ficha.getByText(/^\d+(–\d+)? min$/).first().textContent()) || '').trim();
  expect(enPausa + ' min', 'la pausa y la ficha dicen minutos distintos').toBe(enFicha);
});

test('textos-3 · en inglés, la rutina sin nombre, el manifiesto y sus atajos hablan inglés', async ({ page, context }) => {
  await sembrar(context, { lang: 'en' });
  await irAlArtefacto(page);
  const nombre = await page.evaluate(() => {
    const r = addCustomRoutine({ name: '', steps: [{ name: 'Rotación de cuello', dur: 30 }] });
    return (r && r.name) || (getState().customRoutines || []).slice(-1)[0].name;
  });
  expect(nombre, 'una rutina sin nombre se guardó en castellano').toBe('Your routine');

  const leer = () => page.evaluate(async () => {
    const href = document.querySelector('link[rel="manifest"]').getAttribute('href');
    return { href, m: await fetch(href).then((r) => r.json()) };
  });
  const en = await leer();
  expect(en.href).toBe('/manifest.en.webmanifest');
  expect(en.m.lang).toBe('en');
  expect(en.m.shortcuts.map((a) => a.name)).toEqual(['Focus', 'Breathe', 'Move', 'Stretch', 'Hydrate']);
  expect(en.m.shortcuts.find((a) => a.name === 'Move').description).not.toMatch(/mobility/i);

  await page.evaluate(() => setState({ lang: 'es' }));
  await expect.poll(async () => (await leer()).href).toBe('/manifest.webmanifest');
  const es = await leer();
  expect(es.m.shortcuts.map((a) => a.name)).toEqual(['Foco', 'Respira', 'Mueve', 'Estira', 'Hidrátate']);
  expect(es.m.shortcuts.find((a) => a.name === 'Mueve').description, 'Mueve es fuerza, no movilidad').not.toMatch(/movilidad/i);
});

test('textos-4 · el atajo de Estira (?go=stretch) abre su biblioteca', async ({ page, context }) => {
  await sembrar(context);
  await page.goto('/index.html?go=stretch');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  const lib = page.locator('.pace-lib').first();
  await expect(lib).toBeVisible();
  await expect(lib.locator('[data-pace-lib-card]').first()).toBeVisible();
  const ids = await lib.locator('[data-pace-lib-card]').evaluateAll((els) => els.map((e) => e.getAttribute('data-pace-lib-card')));
  /* Estira lleva los ids `move.*` (ids cruzados, CLAUDE.md). */
  expect(ids.some((id) => /^move\./.test(id || '')), 'no abrió la biblioteca de Estira: ' + ids.slice(0, 3).join(', ')).toBe(true);
});
