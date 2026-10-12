/* PACE · E2E · EL CIERRE DE UNA SESIÓN HABLA CON LA LETRA DE LA APP (v0.155.0)
 * ==========================================================================
 * Ez (10 oct. 2026), con una foto de su móvil: «el menú de finalización de
 * ejercicios es un poco cutre y mantiene la tipografía estándar». «Sí / Un poco /
 * No», «Ahora no», «Volver al inicio» y «Salir» iban en la letra de interfaz.
 * Eligió la A viendo fotos de la app real (docs/traspaso/archivos/cierre-y-linea-10oct/):
 * píldoras en la serif itálica, como las de la pausa, y «Ahora no» como enlace.
 *
 * Contra v0.154.0 cae: ninguno de los cuatro va en itálica.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); }
}

/* «Suspiro fisiológico»: 2 min y sin modal de seguridad (ver eventos-emisor.spec.js). */
async function hastaElCierre(page, context) {
  await sembrar(context);
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await overlaySuperior(page).getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).click();
  const empezar = overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true });
  if (await empezar.count()) await empezar.click();
  const sesion = page.locator('[data-pace-session-root]');
  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
  const done = sesion.locator('[data-pace-session-done]');
  for (let s = 0; s < 300 && !(await done.count()); s++) await segundos(page, 1);
  await expect(done, 'GUARD: la sesión no llegó al cierre').toHaveCount(1);
  return sesion;
}

const letra = (loc) => loc.evaluate((el) => {
  const c = getComputedStyle(el);
  return { estilo: c.fontStyle, familia: c.fontFamily, radio: parseFloat(c.borderTopLeftRadius), alto: el.getBoundingClientRect().height };
});

for (const vp of [{ w: 360, h: 640 }, { w: 1280, h: 800 }]) {
  test('el cierre va en la serif itálica · ' + vp.w + '×' + vp.h, async ({ page, context }) => {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    const sesion = await hastaElCierre(page, context);
    const display = (await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--font-display'))).split(',')[0].trim().replace(/['"]/g, '');
    expect(display, 'GUARD: no se lee la familia de los títulos').not.toBe('');

    for (const nombre of ['Sí', 'Un poco', 'No']) {
      const l = await letra(sesion.getByRole('button', { name: nombre, exact: true }));
      expect(l.estilo, '«' + nombre + '» no va en itálica').toBe('italic');
      expect(l.familia, '«' + nombre + '» no va en la letra de los títulos').toContain(display);
      /* Píldora: el radio llega a la mitad del alto. */
      expect(l.radio, '«' + nombre + '» no es una píldora').toBeGreaterThanOrEqual(l.alto / 2 - 1);
      expect(l.alto, '«' + nombre + '» es demasiado pequeño para el dedo').toBeGreaterThanOrEqual(34);
    }
    const ahoraNo = await letra(sesion.getByRole('button', { name: 'Ahora no', exact: true }));
    expect(ahoraNo.estilo, '«Ahora no» no va en itálica').toBe('italic');
    const volver = await letra(sesion.locator('[data-pace-session-footer]').getByRole('button', { name: 'Volver al inicio', exact: true }));
    expect(volver.estilo, '«Volver al inicio» no va en itálica').toBe('italic');
    expect(volver.radio, '«Volver al inicio» no es una píldora').toBeGreaterThanOrEqual(volver.alto / 2 - 1);
    const salir = await letra(sesion.locator('[data-pace-session-header] button').first());
    expect(salir.estilo, '«Salir» no va en itálica en el cierre').toBe('italic');

    /* Y nada de esto hace sitio a costa del centro: la pantalla final no pide scroll. */
    const sobra = await page.evaluate(() => { const c = document.querySelector('[data-pace-session-center]'); return c.scrollHeight - c.clientHeight; });
    expect(sobra, 'el cierre pide scroll').toBeLessThanOrEqual(1);
  });
}
