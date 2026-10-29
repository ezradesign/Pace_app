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

/* ---------------------------------------------------------------- C5 · en inglés */
/* «Zancada con apertura» solo tenía sus claves con el nombre de antes («World's greatest
   stretch»): en inglés, el constructor y la vista previa la decían en castellano. */
test('C5 · en inglés, «Zancada con apertura» sale traducida en la vista previa', async ({ page, context }) => {
  await sembrar(context, { lang: 'en', customRoutines: [propia('custom.1', 'Hips', [['Zancada con apertura', 30]])] });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  const preview = await abrirPropia(page, 'Hips', 'Move');
  await expect(preview).toContainText("World's greatest stretch");
  await expect(preview).not.toContainText('Zancada');
  expect(errores).toEqual([]);
});

/* -------------------------------------------------------------- C2 · una sola duración */
/* La tarjeta y el constructor contaban solo el trabajo (`customSegundos`) y la vista previa
   le sumaba la preparación y las colocaciones (`estimateDuration`): 12 pasos de 40 s eran
   8 min en la tarjeta y 9 en la vista previa. */
test('C2 · la tarjeta, el constructor y la vista previa dicen los mismos minutos', async ({ page, context }) => {
  const doce = Array.from({ length: 12 }, () => ['Encogimiento de hombros', 40]);
  await sembrar(context, { customRoutines: [propia('custom.1', 'Doce pasos', doce), propia('custom.2', 'Uno', [['Plancha lateral', 30]])] });
  const errores = capturarErrores(page);
  for (const nombre of ['Doce pasos', 'Uno']) {
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Mueve' }).first().click();
    const biblio = page.locator('.pace-lib').filter({ visible: true }).first();
    await biblio.getByText(/^Tus rutinas/).filter({ visible: true }).first().click();
    const tarjeta = biblio.locator('h4:visible', { hasText: nombre }).first().locator('xpath=..');
    const enTarjeta = (await tarjeta.textContent()).match(/(\d+) min/)[1];

    await tarjeta.getByRole('button', { name: 'Editar' }).click();
    const enConstructor = (await overlaySuperior(page).textContent()).match(/≈ (\d+) min/)[1];
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await page.locator('.pace-lib').filter({ visible: true }).first().locator('h4:visible', { hasText: nombre }).first().click();
    const enPreview = (await overlaySuperior(page).textContent()).match(/(\d+(?:–\d+)?) min/)[1];
    expect([enTarjeta, enConstructor, enPreview], nombre + ': tarjeta, constructor y vista previa').toEqual([enPreview, enPreview, enPreview]);
  }
  expect(errores).toEqual([]);
});

/* ------------------------------------------------ R2 y R3 · lo que dice la tarjeta del catálogo */
/* R2: «Gemelos subrepticios» vale sentado o de pie y la tarjeta decía «de pie».
   R3: la línea de series sumaba las de ejercicios distintos: «Levántate y sube» salía
   «4 series · 5·6 reps» (son dos ejercicios, dos series de cada uno), y «Cuello suave»,
   «2 series» de dos ejercicios hechos una vez. */
const textoTarjeta = (page, id, parte) => page.evaluate(([i, p]) => {
  const c = [...document.querySelectorAll('.pace-lib [data-pace-lib-card="' + i + '"]')].find(e => e.getBoundingClientRect().width > 0)
    || document.querySelector('.pace-lib [data-pace-lib-card="' + i + '"]');
  const n = c && c.querySelector(p);
  return n ? n.textContent.trim() : null;
}, [id, parte]);

test('R2 y R3 · la tarjeta dice «sentado o de pie» y no suma las series de ejercicios distintos', async ({ page, context }) => {
  await sembrar(context);
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Mueve/ }).filter({ visible: true }).first().click();
  await page.locator('.pace-lib').filter({ visible: true }).first().waitFor();
  expect(await textoTarjeta(page, 'extra.calves', '.pace-lib-ctx'), 'R2').toMatch(/sentado o de pie/i);
  expect(await textoTarjeta(page, 'extra.grip.squeeze', '.pace-lib-ctx') || '', 'R2: lo que mezcla no es «o»').not.toMatch(/sentado o de pie/i);
  expect(await textoTarjeta(page, 'extra.chair.squats', '.pace-lib-pie'), 'R3').toBe('2 ejercicios · 2 series de cada');
  expect(await textoTarjeta(page, 'extra.chair.dips', '.pace-lib-pie'), 'R3: un ejercicio sigue igual').toBe('3 series · 12·10·8 reps');
  expect(await textoTarjeta(page, 'extra.pausa.suelo', '.pace-lib-pie'), 'R3: series distintas, sin línea').toBeNull();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /^Estira/ }).filter({ visible: true }).first().click();
  await page.locator('.pace-lib').filter({ visible: true }).first().waitFor();
  expect(await textoTarjeta(page, 'move.neck.3', '.pace-lib-pie'), 'R3: una vez cada uno, sin línea').toBeNull();
  expect(errores).toEqual([]);
});

/* -------------------------------------------------------------- U2 · con el teclado */
/* La tarjeta de una rutina propia era un `div` con `onClick`: con el teclado se llegaba al
   lápiz, pero no se podía empezar. */
test('U2 · una rutina propia se empieza con el teclado, y el lápiz va aparte', async ({ page, context }) => {
  await sembrar(context, { customRoutines: [propia('custom.1', 'La de siempre', [['Plancha', 40]])] });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Mueve' }).first().click();
  const biblio = page.locator('.pace-lib').filter({ visible: true }).first();
  await biblio.getByText(/^Tus rutinas/).filter({ visible: true }).first().click();
  const empezar = biblio.getByRole('button', { name: 'La de siempre', exact: true });
  await expect(empezar, 'la tarjeta no tiene un botón para empezar').toHaveCount(1);
  await empezar.focus();
  await page.keyboard.press('Enter');
  await expect(overlaySuperior(page)).toContainText('Antes de empezar');
  await page.keyboard.press('Escape');

  /* El lápiz abre el constructor, no la rutina. */
  await biblio.getByRole('button', { name: 'Editar' }).focus();
  await page.keyboard.press('Enter');
  await expect(overlaySuperior(page)).toContainText('Añadir ejercicio');
  expect(errores).toEqual([]);
});
