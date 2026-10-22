/* PACE · E2E · «TUS RUTINAS» Y EL CIERRE DE MUEVE Y ESTIRA (auditoría externa del 21-22 oct. 2026)
 * ==============================================================================================
 * Seis casos que la coordinadora comprobó en el código y que se vieron en rojo contra v0.174.2:
 *   R1 · el constructor no apuntaba qué pide cada ejercicio, y «Antes de empezar» leía esa
 *        ausencia como «Nada. Solo tú y donde estás»: Fondos en silla y Superman sin silla ni suelo.
 *   R2 · una rutina con un único «Descanso» se guardaba y, hecha, contaba como Mueve.
 *   R3 · los pasos propios se corrían todos con un reloj, nunca por lados: la plancha lateral
 *        se hacía de un lado.
 *   R4 · «Continúa» guarda el número del paso: tras reordenar la rutina, seguía por otro ejercicio.
 *   R5 · «Terminar antes» en un paso que no es el último se olvidaba, y el evento salía «natural»;
 *        cortar un paso con reloj tampoco contaba como terminar antes.
 *   R6 · el cierre contaba las series de la rutina, no las hechas: una hecha y dos saltadas, «3».
 *
 * TRAMPAS HEREDADAS (caza-sesiones.spec.js): `clock.install()` va antes de `goto` y el reloj se
 * avanza de segundo en segundo con `runFor`; la semilla lleva las marcas de las migraciones.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior } = require('./helpers');

const MARCAS = { _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true };
const sesion = (page) => page.locator('[data-pace-session-root]');
const mando = (page) => page.locator('[data-pace-v1-mando]');
const fase = (page) => page.locator('[data-pace-v1-raiz]').first().getAttribute('data-pace-v1-fase');
const nombrePaso = (page) => page.locator('[data-pace-v1-name]').first();
const siguiente = async (page) => { await sesion(page).locator('[data-pace-v1-btn="next"]').click(); await page.waitForTimeout(30); };
const leerEstado = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2') || '{}'));
const hoy = (lista) => (lista || [])[(new Date().getDay() + 6) % 7] || 0;
const tarjeta = (p) => p.locator('[data-pace-sidebar-accion]');

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.runFor(1000); await page.waitForTimeout(8); }
}
async function sesiones(page) {
  await page.waitForFunction(() => typeof window.eventsWebReadRaw === 'function');
  return page.evaluate(async () => {
    const raw = await window.eventsWebReadRaw();
    return (raw ? JSON.parse(raw).events : []).filter(e => e.type === 'session.completed').map(e => e.payload);
  });
}

const CUE = { 'Fondos en silla': 'Baja con control, codos atrás.', 'Superman': 'Boca abajo: eleva pecho y brazos, lento.',
  'Descanso': 'Respira. Suelta.', 'Plancha lateral': 'Cadera alta, cuerpo en línea.',
  'Encogimiento de hombros': 'Hombros arriba, luego relaja.', 'Giro sentado': 'Rota hacia el respaldo, suave.',
  'Círculos de hombro': 'Círculos lentos y amplios, brazo estirado.' };
function propia(id, nombre, pasos) {
  return { id, name: nombre, steps: pasos.map(([name, dur]) => ({ name, dur, cue: CUE[name] || 'Despacio.' })),
    min: 1, createdAt: 1760000000000, updatedAt: 1760000000000 };
}
async function abrirPropia(page, nombre) {
  await page.getByRole('button', { name: 'Mueve' }).first().click();
  await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
  await page.locator('h4:visible', { hasText: nombre }).first().click();
  return overlaySuperior(page);
}
async function empezar(page, preview) {
  await preview.getByRole('button', { name: 'Empezar', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(mando(page)).toBeVisible();
}
async function abrirCatalogo(page, id) {
  await page.getByRole('button', { name: /^Mueve/ }).first().click();
  await page.locator(`[data-pace-lib-card="${id}"]`).getByRole('button').first().click();
  await empezar(page, overlaySuperior(page));
}
const cifrasDelCierre = (page) => page.evaluate(() => Object.fromEntries(
  [...document.querySelectorAll('[data-pace-session-stat]')].map(s =>
    [s.lastElementChild.textContent.trim(), s.querySelector('[data-pace-session-stat-num]').textContent.trim()])));

/* ------------------------------------------------------------------- R1 · lo que pide */
test('R1 · Fondos en silla y Superman: «Antes de empezar» pide la silla y el suelo', async ({ page, context }) => {
  await sembrar(context, { premiumUnlocked: true,
    customRoutines: [propia('custom.1', 'Brazos y espalda', [['Fondos en silla', 40], ['Superman', 40]])] });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  const preview = await abrirPropia(page, 'Brazos y espalda');
  await expect(preview, 'no avisa de la silla').toContainText('Una silla estable, sin ruedas');
  await expect(preview, 'no avisa del suelo').toContainText('Sitio para tumbarte en el suelo');
  await expect(preview).not.toContainText('Nada. Solo tú y donde estás.');
  await expect(preview, 'no dice en qué posición').toContainText('Sentado · En el suelo');
  expect(errores).toEqual([]);
});

test('R1 · con un paso que el registro no conoce, no afirma que no hace falta nada', async ({ page, context }) => {
  await sembrar(context, { premiumUnlocked: true,
    customRoutines: [propia('custom.1', 'De antes', [['Un ejercicio que ya no existe', 30], ['Giro sentado', 30]])] });
  await irAlArtefacto(page);
  const preview = await abrirPropia(page, 'De antes');
  await expect(preview.getByText('Qué necesitas')).toBeVisible();
  await expect(preview, 'sin datos de un paso, afirma que no hace falta nada').not.toContainText('Nada. Solo tú y donde estás.');
  await expect(preview.locator('[data-pace-preview-sin-datos]')).toHaveText('De algún paso no sabemos qué pide: míralo antes.');
});

/* ------------------------------------------------------------------- R2 · solo descanso */
test('R2 · una rutina solo con «Descanso» no se guarda, ni nueva ni al editarla', async ({ page, context }) => {
  await sembrar(context, { premiumUnlocked: true,
    customRoutines: [propia('custom.1', 'Con trabajo', [['Giro sentado', 30]])] });
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const soloAire = { name: 'Solo aire', steps: [{ name: 'Descanso', dur: 60, cue: '' }] };
    return { nueva: addCustomRoutine(soloAire), editada: updateCustomRoutine('custom.1', soloAire),
      lista: getCustomRoutines().map(x => x.steps.map(s => s.name).join('+')) };
  });
  expect(r.nueva, 'se guardó una rutina nueva sin ningún ejercicio').toBeNull();
  expect(r.editada, 'se guardó una edición sin ningún ejercicio').toBeNull();
  expect(r.lista).toEqual(['Giro sentado']);

  /* En el constructor, con solo «Descanso», «Guardar» no se puede pulsar. */
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-custom-builder', { detail: { id: null } })));
  await page.getByRole('button', { name: /Añadir ejercicio/ }).filter({ visible: true }).first().click();
  await overlaySuperior(page).getByRole('button').filter({ hasText: /^Descanso/ }).first().click();
  const volver = page.getByRole('button', { name: /Volver/ }).filter({ visible: true });
  if (await volver.count()) await volver.first().click();
  await page.getByPlaceholder('Mi rutina').fill('Solo aire');
  await expect(page.getByRole('button', { name: 'Guardar', exact: true }), 'se puede guardar sin ningún ejercicio').toBeDisabled();
  await expect(page.locator('[data-pace-custom-sin-trabajo]'), 'no dice por qué no se puede guardar')
    .toHaveText('Añade al menos un ejercicio: solo con descansos no hay rutina.');
});

test('R2 · una rutina de antes solo con «Descanso» no cuenta como Mueve', async ({ page, context }) => {
  await sembrar(context, Object.assign({ premiumUnlocked: true,
    customRoutines: [propia('custom.1', 'Solo aire', [['Descanso', 60]])] }, MARCAS));
  await page.clock.install();
  await irAlArtefacto(page);
  await empezar(page, await abrirPropia(page, 'Solo aire'));
  await segundos(page, 45);
  await siguiente(page);   // «Saltar» el resto del descanso
  await expect(sesion(page).locator('[data-pace-session-done]')).toHaveCount(1);
  await expect(page.locator('[data-pace-sin-contar]'), 'un rato sin ningún ejercicio se cuenta').toHaveCount(1);
  expect(hoy(((await leerEstado(page)).weeklyStats || {}).moveMinutes), 'sumó minutos de Mueve sin ejercicios').toBe(0);
  await expect(page.locator('[data-pace-session-done-copy]'), 'el cierre no dice por qué no cuenta')
    .toHaveText('Sin ningún ejercicio hecho no se cuenta. Vuelve cuando quieras.');
  expect(await sesiones(page), 'emitió una sesión sin trabajo').toEqual([]);
});

/* ------------------------------------------------------------------- R3 · por lados */
test('R3 · la plancha lateral de una rutina propia se guía por los dos lados', async ({ page, context }) => {
  await sembrar(context, Object.assign({ premiumUnlocked: true,
    customRoutines: [propia('custom.1', 'Costados', [['Plancha lateral', 30], ['Giro sentado', 30]])] }, MARCAS));
  await page.clock.install();
  await irAlArtefacto(page);
  expect(await page.evaluate(() => moveRutinaGuiada(getCustomRoutine('custom.1')).steps.map(s => s.mode)),
    'la plancha lateral no va por lados').toEqual(['perSide', 'timed']);
  await empezar(page, await abrirPropia(page, 'Costados'));
  await expect(nombrePaso(page)).toHaveText('Plancha lateral');
  await expect(page.locator('[data-pace-v1-cue]').first(), 'el primer lado no se nombra').toContainText('Izquierda');
  await segundos(page, 31);
  expect(await fase(page), 'al acabar el primer lado no pide cambiar').toBe('change');
});

/* El tiempo es POR LADO (opción 1A de la maqueta del 22 oct.): el constructor lo dice y el total lo cuenta. */
test('R3 · en el constructor, un paso por lados dice «por lado» y el total cuenta los dos', async ({ page, context }) => {
  await sembrar(context, { premiumUnlocked: true,
    customRoutines: [propia('custom.1', 'Costados', [['Plancha lateral', 60], ['Giro sentado', 60]])] });
  await irAlArtefacto(page);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-custom-builder', { detail: { id: 'custom.1' } })));
  const modal = overlaySuperior(page);
  await expect(modal.getByText('60 s por lado'), 'el paso por lados no dice «por lado»').toHaveCount(1);
  await expect(modal.getByText('60 s', { exact: true })).toHaveCount(1);
  /* 60 + 60 + 10 de cambio + 60 = 190 s: ≈ 4 min, no 2. */
  await expect(modal, 'el total no cuenta los dos lados').toContainText('≈ 4 min');
});

/* ------------------------------------------------------------------- R4 · seguir tras editar */
test('R4 · tras reordenar la rutina, «Continúa» no sigue por otro ejercicio', async ({ page, context }) => {
  await sembrar(context, Object.assign({ premiumUnlocked: true, customRoutines: [propia('custom.1', 'Tres gestos',
    [['Encogimiento de hombros', 30], ['Giro sentado', 30], ['Círculos de hombro', 30]])] }, MARCAS));
  await page.clock.install();
  await irAlArtefacto(page);
  await empezar(page, await abrirPropia(page, 'Tres gestos'));
  await segundos(page, 12);
  await siguiente(page);
  await expect(nombrePaso(page)).toHaveText('Giro sentado');
  await sesion(page).getByRole('button', { name: /Salir/ }).click();
  await expect(tarjeta(page), 'GUARD: al salir no se ofrece seguir').toHaveAttribute('data-kind', 'resume');
  await expect(tarjeta(page)).toContainText('Paso 2 de 3');

  /* A → B → C pasa a B → C → A: el paso 2 ya es otro ejercicio. */
  const ok = await page.evaluate(() => {
    const r = getCustomRoutine('custom.1');
    return !!updateCustomRoutine('custom.1', { name: r.name, steps: [r.steps[1], r.steps[2], r.steps[0]] });
  });
  expect(ok).toBe(true);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => leerCuerpoGuardada()), 'tras editar se ofrece seguir la versión vieja').toBeNull();
  expect(await tarjeta(page).getAttribute('data-kind')).not.toBe('resume');
});

/* ------------------------------------------------------------------- R5 · terminar antes */
test('R5 · cortar un paso con reloj que no es el último deja la sesión como «terminada antes»', async ({ page, context }) => {
  await sembrar(context, Object.assign({ premiumUnlocked: true, customRoutines: [propia('custom.1', 'Dos gestos',
    [['Encogimiento de hombros', 40], ['Círculos de hombro', 40]])] }, MARCAS));
  await page.clock.install();
  await irAlArtefacto(page);
  await empezar(page, await abrirPropia(page, 'Dos gestos'));
  await segundos(page, 3);
  await siguiente(page);   // corta el primero a los 3 s
  await expect(nombrePaso(page)).toHaveText('Círculos de hombro');
  await segundos(page, 5 + 41);   // el segundo, entero y solo
  await expect(sesion(page).locator('[data-pace-session-done]')).toHaveCount(1);
  const [ev] = await sesiones(page);
  expect(ev && ev.completionReason, 'cortar un paso con reloj no cuenta como terminar antes').toBe('early');
});

test('R5 · «Terminar antes» en la primera serie se conserva hasta el final', async ({ page, context }) => {
  await sembrar(context, MARCAS);
  await page.clock.install();
  await irAlArtefacto(page);
  await abrirCatalogo(page, 'extra.chair.dips');
  await siguiente(page);   // «Empezar ya»
  await segundos(page, 9);
  await siguiente(page);   // «Terminar antes» con 2 de 12
  await segundos(page, 31 + 41 + 31 + 33);   // el resto, solo
  await expect(sesion(page).locator('[data-pace-session-done]')).toHaveCount(1);
  const [ev] = await sesiones(page);
  expect(ev && ev.completionReason, '«Terminar antes» en un paso que no es el último se pierde').toBe('early');
});

/* ------------------------------------------------------------------- R6 · lo hecho */
test('R6 · una serie hecha y dos saltadas: el cierre dice 1 serie, no 3', async ({ page, context }) => {
  await sembrar(context, MARCAS);
  await page.clock.install();
  await irAlArtefacto(page);
  await abrirCatalogo(page, 'extra.chair.dips');
  await siguiente(page);   // «Empezar ya»
  await segundos(page, 49);   // 12 de 12, sola
  expect(await fase(page), 'GUARD: tras la primera serie no llega el descanso').toBe('rest');
  await siguiente(page);   // «Saltar» el descanso
  await siguiente(page);   // «Terminar antes» sin ninguna
  await siguiente(page);   // «Saltar»
  await siguiente(page);   // «Terminar antes» sin ninguna
  await expect(sesion(page).locator('[data-pace-session-done]')).toHaveCount(1);
  const cifras = await cifrasDelCierre(page);
  expect(cifras.Series, 'cuenta las series de la rutina, no las hechas').toBe('1');
  expect(cifras.Reps).toBe('12');
});
