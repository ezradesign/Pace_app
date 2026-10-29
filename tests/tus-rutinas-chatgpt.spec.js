/* PACE · E2E · «TUS RUTINAS» Y LAS TARJETAS (revisión de ChatGPT del 28 oct. 2026)
 * ==============================================================================
 * Cada caso se vio en rojo contra el `main` de la 0.185.0 antes de arreglarlo:
 *   C3 · lo que pide cada ejercicio callaba material: la banda, la silla (sin ruedas en
 *        «Piernas elevadas sentado») y la pared de «Elevación de puntas», que declaraba mesa.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior } = require('./helpers');

function propia(id, nombre, pasos) {
  return { id, name: nombre, steps: pasos.map(([name, dur]) => ({ name, dur, cue: 'Despacio.' })),
    min: 1, createdAt: 1760000000000, updatedAt: 1760000000000 };
}
async function abrirPropia(page, nombre, modulo) {
  await page.getByRole('button', { name: modulo || 'Mueve' }).first().click();
  await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
  await page.locator('h4:visible', { hasText: nombre }).first().click();
  return overlaySuperior(page);
}

/* ------------------------------------------------------------------- C3 · el material */
test('C3 · cada ejercicio dice el material que pide su texto', async ({ page, context }) => {
  const casos = [
    ['Solo banda', 'Apertura con banda', ['Una banda elástica'], []],
    ['Solo piernas', 'Piernas elevadas sentado', ['Una silla estable, sin ruedas'], []],
    ['Solo tórax', 'Extensión torácica', ['Una silla con respaldo'], []],
    ['Solo puntas', 'Elevación de puntas', ['Una pared libre'], ['Una mesa']],
  ];
  await sembrar(context, { customRoutines: casos.map(([nombre, ej], i) => propia('custom.' + (i + 1), nombre, [[ej, 40]])) });
  const errores = capturarErrores(page);
  for (const [nombre, ej, pide, noPide] of casos) {
    await irAlArtefacto(page);
    const preview = await abrirPropia(page, nombre);
    await expect(preview).toContainText('Qué necesitas');
    for (const p of pide) await expect(preview, ej + ' no dice «' + p + '»').toContainText(p);
    for (const p of noPide) await expect(preview, ej + ' dice «' + p + '»').not.toContainText(p);
    await expect(preview).not.toContainText('Nada. Solo tú y donde estás.');
  }
  expect(errores).toEqual([]);
});

/* ------------------------------------------------------------- C1 · el constructor delante */
/* Desde Estira el constructor se montaba DETRÁS de su biblioteca (los dos `Modal` en z 100, y
   Estira después en el árbol): crear o editar parecía no hacer nada. */
for (const modulo of ['Estira', 'Mueve']) {
  test('C1 · desde ' + modulo + ', crear una rutina deja solo el constructor y al cancelar vuelve «Tus rutinas»', async ({ page, context }) => {
    await sembrar(context, { customRoutines: [propia('custom.1', 'La de siempre', [['Plancha', 40]])] });
    const errores = capturarErrores(page);
    await irAlArtefacto(page);
    await page.getByRole('button', { name: new RegExp('^' + modulo) }).filter({ visible: true }).first().click();
    const biblio = page.locator('.pace-lib').filter({ visible: true }).first();
    await biblio.getByText(/^Tus rutinas/).filter({ visible: true }).first().click();
    await biblio.getByRole('button', { name: /Crear rutina/ }).click();

    const arriba = overlaySuperior(page);
    await expect(arriba, 'el constructor no queda delante').toContainText('Añadir ejercicio');
    await expect(page.locator('.pace-lib').filter({ visible: true }), 'la biblioteca se sigue viendo').toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(page.locator('.pace-lib').filter({ visible: true }).first().getByText('La de siempre').filter({ visible: true }),
      'al cerrar no vuelve «Tus rutinas»').toHaveCount(1);
    expect(errores).toEqual([]);
  });
}
