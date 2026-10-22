/* PACE · E2E · EN EL MÓVIL, LOS BOTONES PEQUEÑOS SE TOCAN CON EL DEDO (v0.161.0)
 * ==============================================================================
 * El recorrido del 13 oct. encontró una treintena de botones del móvil por debajo de los
 * 32 px de alto. Ez pidió agrandar lo que se puede tocar sin cambiar cómo se ve
 * (app/ui/toques.css.jsx). Aquí se MIDE con el dedo, no con la caja: se recorre la columna
 * del centro del botón píxel a píxel y se cuenta cuánto alto responde a ese botón. Y se
 * comprueba que ningún botón le quita el centro a otro.
 *
 * Contra v0.160.0 cae: la zona tocable medía lo que la caja (18-29 px).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.use({ viewport: { width: 360, height: 718 }, hasTouch: true });

/* Alto que responde a `sel` (n-ésimo visible) en la columna de su centro, y si algún control
   visible de la pantalla tiene su centro tapado por otro. */
async function medir(page, sel, n) {
  return page.evaluate(([s, i]) => {
    const vis = (e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
    const el = [...document.querySelectorAll(s)].filter(vis)[i || 0];
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const b = el.getBoundingClientRect(); const x = b.left + b.width / 2;
    let alto = 0;
    for (let y = Math.max(0, b.top - 30); y <= Math.min(innerHeight - 1, b.bottom + 30); y++) {
      const t = document.elementFromPoint(x, y);
      if (t && (t === el || el.contains(t))) alto++;
    }
    /* Solo dentro de la pantalla del botón medido (una ventana, Ajustes, la barra…): lo que
       queda debajo de una ventana ya está tapado a propósito. */
    const raiz = el.closest('[data-pace-modal-card], [data-pace-tweaks-panel], aside, [data-pace-scene-card], [data-pace-session-root]') || document.body;
    const ctrl = (e) => e && e.closest('button, [role="button"], a[href]');
    const robados = [...raiz.querySelectorAll('button, [role="button"], a[href]')].filter(vis).filter((o) => {
      const c = o.getBoundingClientRect();
      const t = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2);
      const quien = ctrl(t);
      return quien && quien !== o && !o.contains(quien) && !quien.contains(o) && raiz.contains(quien);
    }).map((o) => (o.innerText || o.getAttribute('aria-label') || '').trim().slice(0, 20));
    return { caja: Math.round(b.height), alto, robados };
  }, [sel, n]);
}

async function exigir(page, sel, minimo, nombre, n) {
  const m = await medir(page, sel, n);
  expect(m, 'no encuentro ' + nombre).not.toBeNull();
  expect(m.alto, nombre + ': se toca en ' + m.alto + ' px (la caja mide ' + m.caja + ')').toBeGreaterThanOrEqual(minimo);
  expect(m.robados, 'botones a los que otro les tapa el centro').toEqual([]);
}

test('bienvenida, home, barra y biblioteca', async ({ page, context }) => {
  await irAlArtefacto(page);
  await exigir(page, '[data-pace-scene-card] button[title]', 40, '«ES · EN»');
  await page.getByRole('button', { name: /^Comenzar$/ }).click();
  await exigir(page, '[data-pace-scene-card] [data-pace-toque]', 40, '«← Atrás»');
  await exigir(page, '[data-pace-semana-saltar]', 34, '«Cada semana es distinta»');
  await page.getByRole('button', { name: /^Comenzar$/ }).click();
  await exigir(page, '[data-pace-toque]', 40, 'los minutos del foco');
  await page.getByRole('button', { name: /Abrir panel/ }).click();
  await exigir(page, '[data-pace-hoy-celda]', 40, '«+ vaso» de la barra');
  await page.locator('aside[data-pace-sidebar]').getByRole('button', { name: /Abrir Mueve/ }).click();
  await exigir(page, '.pace-lib-link', 28, '«Tus rutinas»');
});

test('ajustes, estadísticas y apoyo', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.keyboard.press('t');
  await expect(page.locator('.pace-aj-pild').first()).toBeVisible();
  await exigir(page, '.pace-aj-pild', 36, 'las píldoras de Ajustes', 4);
  await exigir(page, '.pace-aj-sw', 28, 'el interruptor de sonido');
  await exigir(page, '.pace-aj-cerrar', 40, 'la × de Ajustes');
  await exigir(page, '.pace-aj-paso > button', 36, 'el «−» de los vasos');
  /* Desde la 2A de Ez (22 oct. 2026), en el móvil «Tus datos» y su pie van en su propia hoja. */
  await exigir(page, '.pace-aj-sec-accion', 36, '«Copias, borrar y código ›»', 1);
  await page.locator('.pace-aj-sec-accion').filter({ visible: true }).nth(1).click();
  await exigir(page, '.pace-aj-volver', 36, 'la «‹» que vuelve de Tus datos');
  /* 16 oct. 2026 (auditoría): «Seguridad» y «Privacidad» medían 15 px de alto. */
  await exigir(page, '.pace-aj-pie a', 24, 'los enlaces del pie de Ajustes');
  await page.keyboard.press('Escape');
  await page.keyboard.press('s');
  await exigir(page, '[data-pace-stats-tabs] > button', 40, 'las pestañas de Estadísticas');
});
