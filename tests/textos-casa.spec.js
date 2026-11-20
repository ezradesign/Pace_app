/* PACE · E2E · LOS TEXTOS DE LA CASA, DICHOS PARA QUIEN NO CONOCE PACE (Ez, 10A del 18 nov. 2026)
 * ==============================================================================================
 * En el recorrido de tester, frases que solo entendía quien hizo PACE: en la bienvenida, «la carta del lunes» y
 * «con el catálogo»; en Ajustes, las líneas pequeñas de «Marca la fase» y «Suena detrás». En los dos idiomas.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, MEDIODIA } = require('./helpers');

test('la bienvenida y Ajustes dicen lo que hacen (es y en)', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  const S = await page.evaluate(() => {
    const k = ['premium.inc.letter.d', 'premium.inc.custom.d', 'settings.signal.nota', 'settings.bg.music.nota'];
    return ['es', 'en'].map((l) => k.map((c) => window.PACE_STRINGS[l][c]));
  });
  expect(S).toEqual([
    ['cada lunes, tu semana ajustada', 'con los ejercicios de PACE', 'La voz que cuenta las fases', 'Lo que suena al respirar'],
    ['every Monday, your week adjusted', 'with the PACE exercises', 'The voice for each phase', 'While you breathe'],
  ]);
});
