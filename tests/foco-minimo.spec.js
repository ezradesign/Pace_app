/* PACE · el Foco personalizado dura al menos 5 minutos
 * =====================================================
 * El selector «Otro» aceptaba de 1 a 180, y con bloques de menos de 5 minutos
 * «A tu ritmo» no puede repartir un día (Ez). Un 1–4 escrito se queda en 5, y un
 * valor viejo guardado por debajo sube a 5 al cargar.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, CLAVE_ESTADO } = require('./helpers');

const minutosGuardados = (page) => page.evaluate((clave) =>
  JSON.parse(localStorage.getItem(clave) || '{}').focusMinutes, CLAVE_ESTADO);

async function escribirOtro(page, valor) {
  await page.getByTitle(/Minutos personalizados/).click();
  const campo = page.locator('input[type=number]');
  await campo.fill(String(valor));
  await campo.press('Enter');
}

test('«Otro» con menos de 5 se queda en 5, y con 5 o más guarda lo escrito', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);

  await escribirOtro(page, 2);
  await expect.poll(() => minutosGuardados(page)).toBe(5);
  await expect(page.locator('[data-pace-dial-number]')).toContainText('05:00');

  await escribirOtro(page, 7);
  await expect.poll(() => minutosGuardados(page)).toBe(7);
});

test('un Foco guardado de menos de 5 minutos sube a 5 al cargar', async ({ page, context }) => {
  await sembrar(context, { focusMinutes: 3 });
  await irAlArtefacto(page);
  await expect(page.locator('[data-pace-dial-number]')).toContainText('05:00');
});
