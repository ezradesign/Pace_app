/* PACE · E2E · EN EL MÓVIL, CÓMO SE EMPIEZA EL DÍA (Ez, 30 oct. 2026: 2A)
 * =====================================================================
 * U5 de las revisiones de ChatGPT del 28 oct.: en el escritorio, hasta que acaba el primer bloque,
 * el panel dice «Cada bloque es un pomodoro en el aro…» (RitmoComo); en el móvil esa frase no
 * cabía, y la fila «Ahora 9:05 · Foco · bloque 1 de 9» parecía un bloque que ya corre. Ez eligió
 * la 2A: hasta que empiezas el primer bloque, la fila «Ahora» dice «45 min · empieza en el aro,
 * arriba» en vez del descriptor, que ya está en el aro. Al empezarlo vuelve el de siempre. No
 * añade alto: la home sigue sin scroll (home-sin-scroll.spec.js).
 *
 * Contra la 0.187.0 caen las tres del móvil: la fila decía siempre el descriptor.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const MARTES = new Date(2026, 9, 20, 9, 5);
const visible = (page, sel) => page.locator(sel).filter({ visible: true });

async function abrir(page, context, lang, viewport) {
  await page.setViewportSize(viewport || { width: 360, height: 730 });
  await sembrar(context, { lang: lang || 'es', langAuto: false, ritmo: { horario: HORARIO } });
  await page.clock.install({ time: MARTES });
  await irAlArtefacto(page);
  await page.evaluate(() => ritmoElegir('jornada'));
}

const filaAhora = (page) => visible(page, '[data-pace-ritmo-estado="menu"] .pace-rt-fila').first().locator('.pace-rt-m');

test('en el móvil, antes del primer bloque la fila «Ahora» dice dónde se empieza; al empezarlo, lo de siempre', async ({ page, context }) => {
  await abrir(page, context);
  await expect(visible(page, '[data-pace-ritmo-estado="menu"] .pace-rt-fila').first()).toContainText('Ahora');
  await expect(filaAhora(page)).toHaveText('45 min · empieza en el aro, arriba');
  await visible(page, '[data-pace-cta]').first().click();
  await expect(visible(page, '[data-pace-cta]').first()).toHaveText('Pausar');
  await expect(filaAhora(page)).toHaveText('45 min · Trabajo en profundidad');
  /* En pausa el bloque sigue empezado. */
  await visible(page, '[data-pace-cta]').first().click();
  await expect(filaAhora(page)).toHaveText('45 min · Trabajo en profundidad');
});

test('en inglés, lo mismo', async ({ page, context }) => {
  await abrir(page, context, 'en');
  await expect(filaAhora(page)).toHaveText('45 min · start it on the ring above');
});

test('al volver a la home con el bloque ya empezado, la fila no lo dice', async ({ page, context }) => {
  await abrir(page, context);
  await visible(page, '[data-pace-cta]').first().click();
  await expect(visible(page, '[data-pace-cta]').first()).toHaveText('Pausar');
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await expect(filaAhora(page)).toHaveText('45 min · Trabajo en profundidad');
});

test('en el escritorio no cambia: la frase de siempre hasta que acaba el primer bloque', async ({ page, context }) => {
  await abrir(page, context, 'es', { width: 1280, height: 879 });
  await expect(visible(page, '[data-pace-ritmo-como]')).toHaveText('Cada bloque es un pomodoro en el aro; al acabar, te sirvo la pausa que toca.');
});
