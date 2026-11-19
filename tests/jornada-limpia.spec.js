/* PACE · E2E · LA TARJETA DE LA JORNADA, LIMPIA, EN EL ORDENADOR (Ez, encargo 3, 19 nov. 2026)
 * ==========================================================================
 * Ez: la etiqueta «Sin material, a veces pared o mesa» («esta pill me sobra, no me aporta nada») y la
 * línea «4 H 45 MIN DE FOCO · 6 PAUSAS · 5 DE 8 VASOS» fuera, «para que la ventana de jornada sea mucho
 * más limpia»; y con ese sitio, la frase del día en una línea: «Jornada entera · de 9:30 a 20:00 ·
 * comida a las 14:00 durante 1 h · hoy de 13:16 a 20:00» partía «a 20:00» a la línea de abajo.
 * Quedan «Cambiar», «Al calendario» y «Hoy voy por libre». En el móvil, «Ver todo» los sigue diciendo
 * (tests/ritmo-ver-todo.spec.js y textos-honestos.spec.js).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const HORA = (() => { const d = new Date(); d.setHours(13, 16, 0, 0); return d; })();
const CLAVE = HORA.getFullYear() + '-' + String(HORA.getMonth() + 1).padStart(2, '0') + '-' + String(HORA.getDate()).padStart(2, '0');
const RITMO = { horario: { inicio: 570, comida: 840, comidaDur: 60, salida: 1200 },
  dia: { fecha: CLAVE, opcion: 'jornada', desde: 796, cicloBase: 0, cambios: {} } };

for (const [ancho, alto] of [[1280, 720], [1366, 768], [1920, 1080]]) {
  for (const lang of ['es', 'en']) {
    test(ancho + ' px, ' + lang + ': sin etiqueta ni resumen, y la frase del día en una línea', async ({ page, context }) => {
      await page.setViewportSize({ width: ancho, height: alto });
      await sembrar(context, { lang, ritmo: RITMO });
      await page.clock.install({ time: HORA });
      await irAlArtefacto(page);
      await page.evaluate(() => document.fonts.ready);
      const panel = page.locator('.pace-rt-esc[data-pace-ritmo-estado="menu"]').filter({ visible: true });
      const cab = panel.locator('.pace-rt-cab');
      await expect(cab, 'GUARD: no es el día de la captura de Ez').toContainText(lang === 'es' ? 'hoy de 13:16 a 20:00' : '13:16');
      const fuera = await page.evaluate(() => [window.PACE_STRINGS.es['ritmo.ctx.material'], window.PACE_STRINGS.en['ritmo.ctx.material']]);
      for (const f of fuera) await expect(cab).not.toContainText(f);
      await expect(cab).not.toContainText(/de foco|of focus|vasos|glasses/i);
      await expect(cab.locator('[data-pace-ritmo-libre]')).toBeVisible();
      await expect(cab.locator('[data-pace-ritmo-calendario]')).toBeVisible();
      await expect(cab.getByRole('button', { name: lang === 'es' ? 'Cambiar' : 'Change', exact: true })).toBeVisible();
      const lineas = await cab.locator('.pace-rt-titulo').evaluate((t) => {
        const r = document.createRange(); r.selectNodeContents(t);
        return ((cs) => Math.round((Math.max(...cs) - Math.min(...cs)) / 16) + 1)(Array.from(r.getClientRects()).filter((x) => x.width > 0 && x.height > 0).map((x) => (x.top + x.bottom) / 2));
      });
      expect(lineas, 'la frase del día se parte').toBe(1);
    });
  }
}
