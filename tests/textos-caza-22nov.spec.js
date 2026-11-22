/* PACE · E2E · DOS TEXTOS DE LA CAZA WEB DEL 22 NOV. 2026 (Ez, 4A y 5A)
 * ======================================================================
 * 4A · «Recolocar la postura» tiene cuatro pasos y decía «Tres gestos»; en inglés, «Chin tucks, scapular
 *      squeeze, thoracic ext.», con la abreviatura a medias. Ahora: «Barbilla, omóplatos y pecho. Cuatro
 *      gestos contra la silla.» y «Chin, shoulder blades and chest. Four moves against the chair.»
 * 5A · La bienvenida prometía «Sin gamificación» y PACE tiene sellos. Ahora dice solo «Sin rachas que
 *      castigan» («No streaks that punish you»), como la landing.
 * Contra main caen las cuatro.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, RUTA_ARTEFACTO } = require('./helpers');

const TXT = {
  es: { estira: 'Estira', ficha: 'Barbilla, omóplatos y pecho. Cuatro gestos contra la silla.', lede: 'Micro-pausas de foco, respiración, movilidad e hidratación. Sin rachas que castigan.' },
  en: { estira: 'Stretch', ficha: 'Chin, shoulder blades and chest. Four moves against the chair.', lede: 'Micro-breaks for focus, breathing, mobility and hydration. No streaks that punish you.' },
};

for (const lang of ['es', 'en']) {
  test(lang + ' · 4A · la ficha de «Recolocar la postura» dice cuatro gestos, sin abreviaturas', async ({ page, context }) => {
    await sembrar(context, { lang });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: new RegExp('^' + TXT[lang].estira) }).filter({ visible: true }).first().click();
    await page.locator('[data-pace-lib-card="extra.posture.set"]').filter({ visible: true }).first().waitFor();
    await page.evaluate(() => [...document.querySelectorAll('[data-pace-lib-card="extra.posture.set"] .pace-lib-hit')]
      .find((e) => e.getBoundingClientRect().width > 0).click());
    await expect(page.locator('[data-pace-modal-card]').filter({ hasText: TXT[lang].ficha }).last()).toBeVisible();
  });

  test(lang + ' · 5A · la bienvenida dice «Sin rachas que castigan» y nada de «gamificación»', async ({ page, context }) => {
    await context.addInitScript((l) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify({ lang: l, langAuto: false })); }, lang);
    await page.goto(RUTA_ARTEFACTO);
    const bienvenida = page.getByRole('dialog').first();
    await expect(bienvenida).toContainText(TXT[lang].lede);
    await expect(bienvenida).not.toContainText(/gamifica/i);
  });
}
