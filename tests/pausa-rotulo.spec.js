/* PACE · tests/pausa-rotulo.spec.js
   =================================
   LA VENTANA DE LA PAUSA DICE «BLOQUE TERMINADO» (Ez, 3A de la caza del móvil, 22 nov. 2026).
   Tras el primer bloque de Foco decía «Ciclo completado» mientras el aro seguía en «Ciclo 1 / 4» y la
   propia ventana decía que se había terminado un bloque. Se prueba con el bloque que terminó con PACE
   cerrado (la ventana sale al abrir), en los dos idiomas. Contra la 0.214.0 cae.
*/
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const RELOJ = new Date('2026-11-23T10:40:00+01:00');
const FIN = new Date('2026-11-23T10:35:00+01:00').getTime();

for (const [lang, bien, mal] of [['es', 'Bloque terminado', 'Ciclo completado'], ['en', 'Block done', 'Cycle complete']]) {
  test(`${lang}: tras el bloque 1, la ventana de la pausa dice «${bien}»`, async ({ page, context }) => {
    await sembrar(context, { lang });
    await context.addInitScript((fin) => {
      if (!localStorage.getItem('pace.timer.v1')) localStorage.setItem('pace.timer.v1', JSON.stringify({ endsAt: fin, mode: 'foco', minutes: 25, id: 'rotulo' }));
    }, FIN);
    await page.clock.install({ time: RELOJ });
    await irAlArtefacto(page);
    const ventana = page.locator('[data-pace-modal-backdrop]').filter({ has: page.locator('[data-pace-break-shortcut]') });
    await expect(ventana).toContainText(bien);
    await expect(ventana).not.toContainText(mal);
  });
}

/* Por libre, debajo del rótulo, solo «Elige tu pausa.» (Ez, 4A de la caza de huecos, 23 nov. 2026): decía
   «Bloque cerrado. Elige tu pausa.» bajo «Bloque terminado», dos veces lo mismo. Contra la 0.215.0 cae. */
for (const [lang, frase, mal] of [['es', 'Elige tu pausa.', /Bloque cerrado/], ['en', 'Choose your break.', /finished a Focus block/]]) {
  test(`${lang}: por libre, debajo del rótulo solo «${frase}»`, async ({ page, context }) => {
    await sembrar(context, { lang, ritmo: { libre: true } });
    await context.addInitScript((fin) => {
      if (!localStorage.getItem('pace.timer.v1')) localStorage.setItem('pace.timer.v1', JSON.stringify({ endsAt: fin, mode: 'foco', minutes: 25, id: 'rotulo' }));
    }, FIN);
    await page.clock.install({ time: RELOJ });
    await irAlArtefacto(page);
    const ventana = page.locator('[data-pace-modal-backdrop]').filter({ has: page.locator('[data-pace-break-shortcut]') });
    await expect(ventana.getByText(frase, { exact: true })).toBeVisible();
    await expect(ventana).not.toContainText(mal);
  });
}
