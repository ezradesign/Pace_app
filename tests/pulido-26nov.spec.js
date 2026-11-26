/* PACE · E2E · EL PULIDO DEL FRONTEND DEL 26 NOV. 2026
 * ===================================================
 * La página «Pulido de PACE», con la elección de Ez: «1 Minutos: zona de 44 px · 1 Ajustes: zona
 * invisible de 34 px (A) · 2 Letra: mínimo 12 px (A) · 3 Foco: atenuar lo demás (B) · 4 Nombre:
 * Respira en el título (A) · 5 Vasos: sin número · 5 Semana: punto en los días vacíos · 6 Lema:
 * dejar en inglés (A) · 7 Textos: cambiar los dos». El 1 ya lo hacía app/ui/toques.css.jsx (lo
 * vigila toques-movil.spec.js) y el 6 se queda como está.
 *
 *   2   MIN, OTRO, «Bloque 1 de 4», «Foco manual», «Actividades», los subtítulos de las actividades
 *       y las píldoras y notas de Ajustes, a 12 px o más.
 *   3   Con un bloque de Foco en marcha, actividades, tarjeta del día y minutos bajan al 38 %; en
 *       una pausa, no (ahí las actividades son lo que toca).
 *   4   La biblioteca se llama «Respira» («Breathe»), como su botón.
 *   5   Los vasos no llevan número.
 *   7   «Calma en dos minutos» y «zumbido grave», no «Reset rápido» ni «drone».
 *
 * Contra la 0.220.0 falla cada una por su lado.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* La letra más pequeña con texto propio dentro de lo visible de `sel`. */
function letraMinima(page, sel) {
  return page.evaluate((s) => {
    let min = Infinity, cual = '';
    document.querySelectorAll(s).forEach((raiz) => {
      if (!raiz.getClientRects().length) return;
      [raiz, ...raiz.querySelectorAll('*')].forEach((el) => {
        if (!el.getClientRects().length) return;
        const propio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!propio) return;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < min) { min = fs; cual = el.textContent.trim().slice(0, 30); }
      });
    });
    return { min, cual };
  }, sel);
}

test.describe('2 · letra mínima de 12 px en el móvil', () => {
  test.use({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });

  test('la home y Ajustes no bajan de 12 px', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context);
    await irAlArtefacto(page);
    for (const sel of ['[data-pace-minutos]', '[data-pace-dial-fit]', '[data-pace-activitybar]']) {
      const r = await letraMinima(page, sel);
      expect(r.min, `${sel}: «${r.cual}» a ${r.min} px`).toBeGreaterThanOrEqual(12);
    }
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    await page.locator('[data-pace-tweaks-panel]').waitFor({ state: 'visible' });
    const r = await letraMinima(page, '[data-pace-tweaks-panel]');
    expect(r.min, `Ajustes: «${r.cual}» a ${r.min} px`).toBeGreaterThanOrEqual(12);
    expect(errores).toEqual([]);
  });
});

test.describe('3 · con el Foco en marcha, lo demás se calla', () => {
  const opacidades = (page) => page.evaluate(() => ['[data-pace-activitybar]', '[data-pace-spc]', '[data-pace-minutos]']
    .map((s) => { const e = document.querySelector(s); return e ? Number(getComputedStyle(e).opacity) : null; }));

  test('Foco en marcha: al 38 %; en pausa del reloj, entero', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    expect(await opacidades(page)).toEqual([1, 1, 1]);
    await page.getByRole('button', { name: 'Empezar foco' }).click();
    await expect.poll(() => opacidades(page), { timeout: 5000 }).toEqual([0.38, 0.38, 0.38]);
    await page.getByRole('button', { name: 'Pausar' }).click();
    await expect.poll(() => opacidades(page), { timeout: 5000 }).toEqual([1, 1, 1]);
  });

  test('una Pausa en marcha no atenúa las actividades', async ({ page, context }) => {
    await sembrar(context, { focusMode: 'pausa' });
    await irAlArtefacto(page);
    await page.locator('[data-pace-dial-fit] button').filter({ hasText: /Empezar/ }).first().click();
    await expect(page.locator('[data-pace-dial-running]')).toHaveCount(1);
    await page.waitForTimeout(700);
    const op = await page.locator('[data-pace-activitybar]').evaluate((e) => Number(getComputedStyle(e).opacity));
    expect(op).toBe(1);
  });
});

test('4 y 7 · la biblioteca se llama «Respira» y sus textos van sin «reset» ni «drone»', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Abrir Respira' }).click();
  const dialogo = page.getByRole('dialog', { name: 'Respira', exact: true });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByText('Doble inhalación y exhalación larga. Calma en dos minutos.')).toBeVisible();
  await expect(dialogo.getByText('Coherencia 6·6 sobre un zumbido grave de fondo.')).toBeVisible();
  await expect(dialogo).not.toContainText('Reset');
  await expect(dialogo).not.toContainText('drone');
});

test('5 · los vasos no llevan número', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await vis(page, '[data-pace-activitybar-chip]').filter({ hasText: 'Hidrátate' }).click();
  const vasos = page.getByRole('button', { name: /^Vaso \d+ de 8/ });
  await expect(vasos).toHaveCount(8);
  for (const t of await vasos.allTextContents()) expect(t.trim()).toBe('');
});
