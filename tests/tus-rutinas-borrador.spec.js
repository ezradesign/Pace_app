/* PACE · E2E · «TUS RUTINAS» SIN PERDER NADA (revisión de ChatGPT del 28 oct.; Ez, «U1 B · C6 A», 29 oct.)
 * =======================================================================================================
 * Cada caso se vio en rojo contra la rama antes de montarlo:
 *   U1 · en «Elige un ejercicio», Escape y la × cerraban el constructor entero, y al cerrarlo la rutina
 *        a medio hacer se perdía sin preguntar. Ahora lo que llevas espera como borrador, uno solo.
 *   C6 · con diez rutinas (la décima hecha en otra pestaña) o con la rutina borrada en otra pestaña,
 *        Guardar no hacía nada y no decía por qué. Ahora lo dice una línea encima de Guardar.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior } = require('./helpers');

test.use({ timezoneId: 'Europe/Madrid' });
const AHORA = new Date('2026-10-29T10:42:00+01:00');

function propia(id, nombre, pasos) {
  return { id, name: nombre, steps: pasos.map(([name, dur]) => ({ name, dur })),
    min: 1, createdAt: 1760000000000, updatedAt: 1760000000000 };
}
const CUELLO = propia('custom.1', 'Cuello de tarde', [['Barbilla atrás', 30], ['Cuello y trapecios', 40]]);

async function abrir(page) {
  await page.clock.install({ time: AHORA });
  await irAlArtefacto(page);
}
async function tusRutinas(page) {
  await page.getByRole('button', { name: /^Mueve/ }).filter({ visible: true }).first().click();
  const biblio = page.locator('.pace-lib').filter({ visible: true }).first();
  await biblio.getByText(/^Tus rutinas/).filter({ visible: true }).first().click();
  return biblio;
}
async function anadir(page, ejercicio) {
  await overlaySuperior(page).getByRole('button', { name: /Añadir ejercicio/ }).click();
  await overlaySuperior(page).getByRole('button').filter({ hasText: ejercicio }).first().click();
  await overlaySuperior(page).getByRole('button', { name: /Volver/ }).click();
}
async function empezarBorrador(page, biblio) {
  await biblio.getByRole('button', { name: /Crear rutina/ }).click();
  for (const ej of ['Barbilla atrás', 'Juntar omóplatos', 'Rotación torácica']) await anadir(page, ej);
  await overlaySuperior(page).getByPlaceholder('Mi rutina').fill('Media mañana');
}
const estado = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')));
const constructorAbierto = (page) => page.locator('[data-pace-modal-backdrop]').filter({ hasText: 'Añadir ejercicio' });

/* ------------------------------------------------------------- U1 · la lista vuelve a tu rutina */
test('U1 · en «Elige un ejercicio», Escape y la × vuelven a tu rutina, como «← Volver»', async ({ page, context }) => {
  await sembrar(context);
  const errores = capturarErrores(page);
  await abrir(page);
  const biblio = await tusRutinas(page);
  await biblio.getByRole('button', { name: /Crear rutina/ }).click();
  await overlaySuperior(page).getByPlaceholder('Mi rutina').fill('Media mañana');
  for (const salir of ['Escape', 'la ×']) {
    await overlaySuperior(page).getByRole('button', { name: /Añadir ejercicio/ }).click();
    await expect(overlaySuperior(page)).toContainText('Elige un ejercicio');
    if (salir === 'Escape') await page.keyboard.press('Escape');
    else await overlaySuperior(page).locator('[data-pace-modal-close]').click();
    await expect(constructorAbierto(page), salir + ' no vuelve a la rutina').toHaveCount(1);
    await expect(overlaySuperior(page).getByPlaceholder('Mi rutina')).toHaveValue('Media mañana');
  }
  expect(errores).toEqual([]);
});

/* ---------------------------------------------------- U1 · cerrar no pregunta y el borrador espera */
for (const via of ['Cancelar', 'la ×', 'Escape', 'tocar fuera']) {
  test('U1 · cerrar con ' + via + ' no pregunta, y «Tus rutinas» ofrece seguir donde lo dejaste', async ({ page, context }) => {
    await sembrar(context, { customRoutines: [CUELLO] });
    const errores = capturarErrores(page);
    await abrir(page);
    const biblio = await tusRutinas(page);
    await empezarBorrador(page, biblio);
    if (via === 'Cancelar') await overlaySuperior(page).getByRole('button', { name: 'Cancelar' }).click();
    else if (via === 'la ×') await overlaySuperior(page).locator('[data-pace-modal-close]').click();
    else if (via === 'Escape') await page.keyboard.press('Escape');
    else await overlaySuperior(page).click({ position: { x: 4, y: 4 } });
    await expect(constructorAbierto(page), 'el constructor no se cierra').toHaveCount(0);

    const seguir = biblio.locator('[data-pace-custom-borrador]').filter({ visible: true });
    await expect(seguir, '«Tus rutinas» no ofrece el borrador').toContainText('Seguir con tu borrador');
    await expect(seguir).toContainText('Media mañana · 3 ejercicios · de hoy, 10:42');
    await expect(biblio.getByRole('button', { name: /Crear rutina/ }), 'el borrador va en el sitio de «Crear rutina»').toHaveCount(0);

    await seguir.click();
    const arriba = overlaySuperior(page);
    await expect(arriba.locator('[data-pace-custom-aviso="borrador"]')).toContainText('Sigues con tu borrador de hoy, 10:42.');
    await expect(arriba.getByPlaceholder('Mi rutina')).toHaveValue('Media mañana');
    await expect(arriba).toContainText('3 ejercicios');
    expect(errores).toEqual([]);
  });
}

/* ------------------------------------------------- U1 · también si se cierra la pestaña o la app */
test('U1 · lo que llevas se salva aunque se cierre la pestaña nada más escribir', async ({ page, context }) => {
  await sembrar(context);
  const errores = capturarErrores(page);
  await abrir(page);
  const biblio = await tusRutinas(page);
  await biblio.getByRole('button', { name: /Crear rutina/ }).click();
  await anadir(page, 'Plancha');
  await overlaySuperior(page).getByPlaceholder('Mi rutina').fill('Antes de comer');
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  const otra = await tusRutinas(page);
  await expect(otra.locator('[data-pace-custom-borrador]').filter({ visible: true })).toContainText('Antes de comer · 1 ejercicio');
  expect(errores).toEqual([]);
});

/* ------------------------------------------- U1 · se borra al guardar o con «Empezar de cero» */
test('U1 · el borrador se va al guardar, y una rutina guardada antes sigue intacta', async ({ page, context }) => {
  await sembrar(context, { customRoutines: [CUELLO] });
  const errores = capturarErrores(page);
  await abrir(page);
  let biblio = await tusRutinas(page);
  await empezarBorrador(page, biblio);
  await page.keyboard.press('Escape');
  await expect.poll(async () => ((await estado(page)).customDraft || {}).name).toBe('Media mañana');
  expect((await estado(page)).customRoutines, 'el borrador tocó una rutina guardada').toEqual([CUELLO]);

  await biblio.locator('[data-pace-custom-borrador]').filter({ visible: true }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(constructorAbierto(page)).toHaveCount(0);
  const s = await estado(page);
  expect(s.customDraft, 'el borrador sigue tras guardar').toBeUndefined();
  expect(s.customRoutines[0], 'la rutina de antes cambió').toEqual(CUELLO);
  expect(s.customRoutines.map(r => r.name)).toEqual(['Cuello de tarde', 'Media mañana']);
  await expect(biblio.getByRole('button', { name: /Crear rutina/ })).toHaveCount(1);
  expect(errores).toEqual([]);
});

test('U1 · «Empezar de cero» vacía el constructor y quita el borrador', async ({ page, context }) => {
  await sembrar(context);
  const errores = capturarErrores(page);
  await abrir(page);
  const biblio = await tusRutinas(page);
  await empezarBorrador(page, biblio);
  await overlaySuperior(page).getByRole('button', { name: 'Cancelar' }).click();
  await biblio.locator('[data-pace-custom-borrador]').filter({ visible: true }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar de cero' }).click();
  await expect(overlaySuperior(page).getByPlaceholder('Mi rutina')).toHaveValue('');
  await expect(overlaySuperior(page)).toContainText('Aún no hay ejercicios');
  await expect(overlaySuperior(page).locator('[data-pace-custom-aviso]')).toHaveCount(0);
  expect((await estado(page)).customDraft).toBeUndefined();
  await page.keyboard.press('Escape');
  await expect(biblio.getByRole('button', { name: /Crear rutina/ }), 'cerrar sin cambios dejó un borrador').toHaveCount(1);
  expect(errores).toEqual([]);
});

/* ---------------------------------------------------- U1 · cambiar una rutina que ya existe */
test('U1 · los cambios a una rutina que existe esperan aparte y su tarjeta no cambia hasta guardar', async ({ page, context }) => {
  await sembrar(context, { customRoutines: [CUELLO] });
  const errores = capturarErrores(page);
  await abrir(page);
  const biblio = await tusRutinas(page);
  const tarjeta = () => biblio.locator('h4:visible', { hasText: 'Cuello de' }).first().locator('xpath=..');
  await tarjeta().getByRole('button', { name: 'Editar' }).click();
  await overlaySuperior(page).getByPlaceholder('Mi rutina').fill('Cuello de noche');
  await overlaySuperior(page).getByRole('button', { name: 'Quitar' }).first().click();
  await page.keyboard.press('Escape');

  await expect(tarjeta()).toContainText('Cuello de tarde');
  await expect(tarjeta()).toContainText('2 ejercicios');
  await expect(biblio.locator('[data-pace-custom-borrador]').filter({ visible: true })).toContainText('Cuello de noche · 1 ejercicio · de hoy, 10:42');

  /* El lápiz de esa rutina sigue con los cambios, como el borrador. */
  await tarjeta().getByRole('button', { name: 'Editar' }).click();
  await expect(overlaySuperior(page).locator('[data-pace-custom-aviso="borrador"]')).toContainText('Sigues con tus cambios en «Cuello de tarde».');
  await expect(overlaySuperior(page).getByPlaceholder('Mi rutina')).toHaveValue('Cuello de noche');
  await overlaySuperior(page).getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(tarjeta()).toContainText('Cuello de noche');
  await expect(tarjeta()).toContainText('1 ejercicio');
  const s = await estado(page);
  expect(s.customDraft).toBeUndefined();
  expect(s.customRoutines.map(r => [r.id, r.name])).toEqual([['custom.1', 'Cuello de noche']]);
  expect(errores).toEqual([]);
});

/* --------------------------------------------------- U1 · lo guardado pasa por el saneador */
test('U1 · un borrador de ayer se ofrece con su día, y uno dañado se descarta sin tocar lo demás', async ({ page, context }) => {
  const ayer = new Date('2026-10-28T18:05:00+01:00').getTime();
  await sembrar(context, { customRoutines: [CUELLO],
    customDraft: { editId: null, name: 'Piernas', steps: [{ name: 'Sentadilla a silla', dur: 40 }], savedAt: ayer } });
  await abrir(page);
  const biblio = await tusRutinas(page);
  await expect(biblio.locator('[data-pace-custom-borrador]').filter({ visible: true })).toContainText('Piernas · 1 ejercicio · de ayer, 18:05');

  for (const roto of [{ editId: 7, name: 'x', steps: [], savedAt: 1 }, { name: 'x', steps: [null], savedAt: 1 }, 'borrador', [1]]) {
    const otra = await context.newPage();
    const errores = capturarErrores(otra);
    await otra.clock.install({ time: AHORA });
    await otra.addInitScript((r) => { const s = JSON.parse(localStorage.getItem('pace.state.v2')); s.customDraft = r;
      localStorage.setItem('pace.state.v2', JSON.stringify(s)); }, roto);
    await irAlArtefacto(otra);
    const s = await otra.evaluate(() => getState());
    expect(s.customDraft, JSON.stringify(roto) + ' no se descartó').toBeUndefined();
    expect(s.customRoutines, JSON.stringify(roto) + ' tocó las rutinas').toEqual([CUELLO]);
    const b = await tusRutinas(otra);
    await expect(b.getByRole('button', { name: /Crear rutina/ })).toHaveCount(1);
    expect(errores).toEqual([]);
    await otra.close();
  }
});

/* ------------------------------------------------- C6 · lo que no deja guardar, encima de Guardar */
async function otraPestana(context) {
  const b = await context.newPage();
  await b.clock.install({ time: AHORA });
  await irAlArtefacto(b);
  return b;
}

test('C6 · con diez rutinas (la décima, de otra pestaña) lo dice encima de Guardar y tu borrador sigue', async ({ page, context }) => {
  const nueve = Array.from({ length: 9 }, (_, i) => propia('custom.' + (i + 1), 'Rutina ' + (i + 1), [['Plancha', 30]]));
  await sembrar(context, { customRoutines: nueve });
  const errores = capturarErrores(page);
  await abrir(page);
  const biblio = await tusRutinas(page);
  await empezarBorrador(page, biblio);

  const b = await otraPestana(context);
  await b.evaluate(() => addCustomRoutine({ name: 'La décima', steps: [{ name: 'Plancha', dur: 30 }] }));
  await expect.poll(() => page.evaluate(() => getCustomRoutines().length), 'esta pestaña no ve la décima').toBe(10);

  const arriba = overlaySuperior(page);
  await arriba.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(arriba.locator('[data-pace-custom-aviso="tope"]')).toHaveText('Ya tienes 10 rutinas, el máximo. Borra una para guardar esta; tu borrador sigue aquí.');
  await expect(arriba.getByPlaceholder('Mi rutina'), 'la rutina no sigue en pantalla').toHaveValue('Media mañana');
  await expect(arriba).toContainText('3 ejercicios');
  const s = await estado(page);
  expect(s.customRoutines.length).toBe(10);
  expect(s.customDraft && s.customDraft.name, 'el borrador no sigue').toBe('Media mañana');

  /* La línea va encima de Guardar, entre la rutina y los botones. */
  const [linea, guardar] = await Promise.all([arriba.locator('[data-pace-custom-aviso="tope"]').boundingBox(),
    arriba.getByRole('button', { name: 'Guardar', exact: true }).boundingBox()]);
  expect(linea.y + linea.height, 'la línea no va encima de Guardar').toBeLessThanOrEqual(guardar.y);

  /* Con una borrada en la otra pestaña, se guarda. */
  await b.evaluate(() => deleteCustomRoutine('custom.1'));
  await expect.poll(() => page.evaluate(() => getCustomRoutines().length)).toBe(9);
  await arriba.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(constructorAbierto(page)).toHaveCount(0);
  expect((await estado(page)).customDraft).toBeUndefined();
  expect(errores).toEqual([]);
});

test('C6 · si la rutina se borró en otra pestaña lo dice, y «Guardarla como nueva» la guarda', async ({ page, context }) => {
  await sembrar(context, { customRoutines: [CUELLO] });
  const errores = capturarErrores(page);
  await abrir(page);
  const biblio = await tusRutinas(page);
  await biblio.locator('h4:visible', { hasText: 'Cuello de tarde' }).first().locator('xpath=..').getByRole('button', { name: 'Editar' }).click();
  await overlaySuperior(page).getByPlaceholder('Mi rutina').fill('Cuello de noche');

  const b = await otraPestana(context);
  await b.evaluate(() => deleteCustomRoutine('custom.1'));
  await expect.poll(() => page.evaluate(() => getCustomRoutines().length)).toBe(0);

  const arriba = overlaySuperior(page);
  await arriba.getByRole('button', { name: 'Guardar', exact: true }).click();
  const aviso = arriba.locator('[data-pace-custom-aviso="borrada"]');
  await expect(aviso).toContainText('Esta rutina se ha borrado en otra pestaña.');
  await expect(arriba.getByPlaceholder('Mi rutina'), 'la rutina no sigue en pantalla').toHaveValue('Cuello de noche');

  await aviso.getByRole('button', { name: 'Guardarla como nueva' }).click();
  await expect(constructorAbierto(page)).toHaveCount(0);
  const s = await estado(page);
  expect(s.customRoutines.map(r => [r.name, r.steps.length])).toEqual([['Cuello de noche', 2]]);
  expect(s.customRoutines[0].id, 'se guardó con el id de la borrada').not.toBe('custom.1');
  expect(s.customDraft).toBeUndefined();
  await expect(biblio.locator('h4:visible', { hasText: 'Cuello de noche' })).toHaveCount(1);
  expect(errores).toEqual([]);
});

test('C6 · en inglés, las dos líneas', async ({ page, context }) => {
  await sembrar(context, { lang: 'en', customRoutines: [CUELLO] });
  await abrir(page);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-custom-builder', { detail: { id: 'custom.1' } })));
  await overlaySuperior(page).getByPlaceholder('My routine').fill('Evening neck');
  await page.evaluate(() => deleteCustomRoutine('custom.1'));
  await overlaySuperior(page).getByRole('button', { name: 'Save', exact: true }).click();
  await expect(overlaySuperior(page).locator('[data-pace-custom-aviso="borrada"]')).toContainText('This routine was deleted in another tab.');
  await page.evaluate(() => { for (let i = 0; i < 10; i++) addCustomRoutine({ name: 'R' + i, steps: [{ name: 'Plancha', dur: 30 }] }); });
  await overlaySuperior(page).getByRole('button', { name: 'Save it as new' }).click();
  await expect(overlaySuperior(page).locator('[data-pace-custom-aviso="tope"]')).toHaveText('You already have 10 routines, the maximum. Delete one to save this one; your draft stays here.');
});
