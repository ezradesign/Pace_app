/* PACE · E2E · CON LA JORNADA CERRADA, «SEGUIR POR LIBRE» DEJA LA HOME NORMAL SIN ARRANCAR (Ez, A del 19 nov. 2026)
 * ==============================================================================================================
 * El botón del aro decía «Seguir por libre», pero hacía lo de siempre: arrancaba un Foco libre y la tarjeta
 * seguía en «Jornada cerrada». Ez eligió la A («home, sin arrancar»): hace lo mismo que «Hoy voy por libre»
 * de la tarjeta (`ritmoPorLibre`), retira el día y deja el aro listo en Foco manual, parado.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const HOY = '2026-10-14';
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const TEXTOS = {
  es: { libre: 'Seguir por libre', cerrada: 'Jornada cerrada', manual: 'Foco manual' },
  en: { libre: 'Keep going freestyle', cerrada: 'Day complete', manual: 'Manual Focus' },
};

for (const [w, h] of [[1280, 720], [360, 740]]) {
  for (const lang of ['es', 'en']) {
    test(`${w} px · ${lang}: pasada la salida, «Seguir por libre» vuelve a la home sin arrancar el Foco`, async ({ page, context }) => {
      const errores = capturarErrores(page);
      const T = TEXTOS[lang];
      await page.setViewportSize({ width: w, height: h });
      await sembrar(context, { lang, ritmo: { horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
        dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
      await page.clock.install({ time: a('17:40') });
      await irAlArtefacto(page);
      await page.waitForTimeout(300);
      await expect(vis(page, '[data-pace-dial-label]'), 'GUARD: el día cerrado').toHaveText(T.cerrada);
      await expect(vis(page, '[data-pace-cta]')).toHaveText(T.libre);
      await vis(page, '[data-pace-cta]').click();
      await page.waitForTimeout(400);
      const corre = await page.evaluate(() => { try { const v = JSON.parse(localStorage.getItem('pace.timer.v1')); return !!(v && v.endsAt && v.endsAt > Date.now()); } catch (e) { return false; } });
      expect(corre, 'arrancaba un Foco libre').toBe(false);
      expect(await page.evaluate(() => getState().ritmo.libre), 'el día no se retiraba').toBe(HOY);
      await expect(vis(page, '[data-pace-dial-label]')).toHaveText(T.manual);
      await expect(vis(page, '[data-pace-ritmo-estado="hecho"]'), 'la tarjeta seguía en «Jornada cerrada»').toHaveCount(0);
      expect(errores).toEqual([]);
    });
  }
}
