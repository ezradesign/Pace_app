/* PACE · E2E · LOS NOMBRES QUE UN TESTER NO ENTENDÍA (recorrido de tester, la 11 de Ez, 19 nov. 2026)
 * ==========================================================================
 * Ez: «11.1 b + 11.2 A + 11.3 dejar foco manual + 11.4 A + 11.5 A + 11.6 A».
 *   · «Coherente 432»: el 432 son hercios, no un ritmo como «5·5». Pasa a «Coherente 432 Hz».
 *   · «Gemelos subrepticios» y el grupo «Sigilo» eran una broma; lo que importa es que se hace sentado.
 *   · «Antídoto silla» y «Postura reset» se leían a medias.
 *   · «FOCO MANUAL» se queda.
 * Solo cambia lo que se ve: los ids (y lo que la gente tiene guardado con ellos) son los de siempre.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, MEDIODIA } = require('./helpers');

async function abrir(page, context) {
  await sembrar(context, {});
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
}

test('la 11 de Ez: los nombres nuevos en es y en, con los ids de siempre', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate(() => {
    const en = window.PACE_STRINGS.en;
    const es = window.PACE_STRINGS.es;
    const rutina = (id) => {
      for (const lib of [window.MOVE_ROUTINES, window.EXTRA_ROUTINES, window.BREATHE_ROUTINES]) {
        for (const g of Object.values(lib || {})) for (const x of (g.items || [])) if (x.id === id) return x;
      }
      return null;
    };
    const fila = (id) => ({ es: (rutina(id) || {}).name, en: en[id + '.name'] });
    return {
      coherente: fila('breathe.coherent.432'),
      gemelos: fila('extra.calves'),
      antidoto: fila('move.chair.antidote'),
      postura: fila('extra.posture.set'),
      grupo: { es: window.MOVE_ROUTINES.sigilo && window.MOVE_ROUTINES.sigilo.label, en: en['mueve.cat.sigilo.label'] },
      foco: { es: es['focus.manual.label'], en: en['focus.manual.label'] },
    };
  });
  expect(r.coherente).toEqual({ es: 'Coherente 432 Hz', en: 'Coherent 432 Hz' });
  expect(r.gemelos).toEqual({ es: 'Gemelos bajo la mesa', en: 'Under-Desk Calf Raises' });
  expect(r.grupo).toEqual({ es: 'Sin levantarte', en: 'Without standing up' });
  expect(r.antidoto).toEqual({ es: 'Antídoto a la silla', en: 'Chair Antidote' });
  expect(r.postura).toEqual({ es: 'Recolocar la postura', en: 'Posture Reset' });
  expect(r.foco, '«FOCO MANUAL» se queda').toEqual({ es: 'Foco manual', en: 'Manual Focus' });
});

test('en Mueve, el grupo se llama «Sin levantarte» y empieza por «Gemelos bajo la mesa»', async ({ page, context }) => {
  await abrir(page, context);
  await page.getByRole('button', { name: 'Mueve' }).first().click();
  await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
  const lib = page.locator('.pace-lib').first();
  await expect(lib).toContainText('Sin levantarte');
  await expect(lib).toContainText('Gemelos bajo la mesa');
  await expect(lib).not.toContainText(/Sigilo|subrepticios/);
});
