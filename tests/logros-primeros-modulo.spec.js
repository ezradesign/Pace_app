/* PACE · E2E · «PRIMERA CALISTENIA» ES DE MUEVE Y «PRIMER ESTIRÓN» DE ESTIRA
 * =========================================================================
 * Hasta v0.142 iban al revés: la primera rutina de Mueve daba «Primer estirón»
 * y la de Estira daba «Primera calistenia». Los ids no se renombran (cruzarían
 * los datos de la gente); lo que cambia es qué sesión desbloquea cada uno, y a
 * quien ya los tenía se le cruzan una vez al cargar.
 *
 * Contra la versión anterior fallan las dos.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

test('la primera rutina de Mueve da «Primera calistenia» y la de Estira «Primer estirón»', async ({ page, context }) => {
  await sembrar(context);
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  const tras = await page.evaluate(() => {
    window.completeMoveSession('extra.push.wall', 1);
    const mueve = Object.keys(window.getState().achievements);
    window.completeExtraSession('move.hips.5', 1);
    const estira = Object.keys(window.getState().achievements);
    return { mueve, estira };
  });
  expect(tras.mueve).toContain('first.extra');
  expect(tras.mueve).not.toContain('first.stretch');
  expect(tras.estira).toContain('first.stretch');

  /* Ganado ya con el reparto bueno, la corrección del arranque no lo cruza. */
  await page.evaluate(() => {
    const s = window.getState();
    const { 'first.stretch': _fuera, ...resto } = s.achievements;
    window.setState({ achievements: resto });
  });
  await page.reload();
  const otra = await page.evaluate(() => Object.keys(window.getState().achievements));
  expect(otra).toContain('first.extra');
  expect(otra).not.toContain('first.stretch');
  expect(errores).toEqual([]);
});

test('quien ganó el logro cruzado con una versión anterior lo recupera en su módulo, con su fecha', async ({ page, context }) => {
  /* Hizo Mueve con la versión vieja: tiene `first.stretch` y no `first.extra`. */
  await sembrar(context, { achievements: { 'first.stretch': { unlockedAt: 1234 } } });
  await irAlArtefacto(page);
  const s = await page.evaluate(() => {
    const st = window.getState();
    return { logros: st.achievements, marca: st.logrosPrimerosCruzados };
  });
  expect(s.logros['first.extra']).toEqual(expect.objectContaining({ unlockedAt: 1234 }));
  expect(s.logros['first.stretch']).toBeUndefined();
  expect(s.marca).toBe(true);

  /* Al recargar no se vuelve a cruzar. */
  await page.reload();
  const otra = await page.evaluate(() => Object.keys(window.getState().achievements));
  expect(otra).toContain('first.extra');
  expect(otra).not.toContain('first.stretch');
});
