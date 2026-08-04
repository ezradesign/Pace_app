/* PACE · checklist de cierre · items 2 y 3 — RESPIRA y MUEVE (s154)
 * =================================================================
 * «Respira: libreria · modal seguridad (Rondas) · sesion animada»
 * «Mueve:   libreria · sesion con pasos y countdown»
 *
 * DOS COSAS QUE HAY QUE SABER PARA QUE LOS SELECTORES NO MIENTAN:
 *
 *  1. Las filas de rutina NO son `<button>`: son `<div>` con `cursor:pointer` y
 *     un `<h4>` con el nombre. Se pulsa el encabezado y el evento burbujea al
 *     `onClick` de la fila.
 *  2. La home sigue montada DEBAJO del overlay, con sus propios botones. Un
 *     nombre laxo como /Empezar/ engancha el «Empezar foco» de la home y
 *     Playwright se niega a pulsarlo por intercepcion — el fallo se lee como un
 *     timeout y no como lo que es. Los nombres van EXACTOS y, cuando hace falta,
 *     acotados al overlay de mas arriba.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

test('Respira: la biblioteca abre, la tecnica con aviso exige el modal de seguridad', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  await page.getByRole('button', { name: /^Respira/ }).click();
  const biblioteca = overlaySuperior(page);
  await expect(biblioteca.getByText('BIBLIOTECA')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Box 4·4·4·4' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Rondas express' })).toBeVisible();

  /* MODAL DE SEGURIDAD. La regla de producto de CLAUDE.md es que la apnea
     SIEMPRE lo lleva: sin esto, una tecnica con hiperventilacion arrancaria
     sola. Es el unico item del checklist que es una obligacion de seguridad. */
  await page.getByRole('heading', { name: 'Rondas express' }).click();
  const seguridad = overlaySuperior(page);
  await expect(seguridad.getByText('ANTES DE EMPEZAR')).toBeVisible();
  await expect(seguridad.getByText(/hiperventilación controlada y apnea/)).toBeVisible();
  await expect(seguridad.getByText('Lo he leído y asumo mi responsabilidad')).toBeVisible();
  await expect(seguridad.getByRole('button', { name: 'Cancelar' })).toBeVisible();
  await expect(seguridad.getByRole('button', { name: 'Empezar sesión' })).toBeVisible();

  /* Cancelar devuelve a la biblioteca y NO arranca nada. */
  await seguridad.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByText('ANTES DE EMPEZAR')).toHaveCount(0);
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);

  expect(errores).toEqual([]);
});

test('Respira: una tecnica sin aviso arranca su sesion y el visual respira', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Box 4·4·4·4' }).click();

  /* Preparacion, con su cuenta atras propia. */
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toBeVisible();
  await expect(sesion.getByText('PREPÁRATE')).toBeVisible();
  await expect(sesion.getByRole('button', { name: 'Empezar ahora' })).toBeVisible();

  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();

  /* SESION ANIMADA: el visual de respiracion existe y esta marcado como motion
     ESENCIAL — el kill global de `prefers-reduced-motion` lo exime a proposito
     (WCAG 2.3.3), porque la expansion ES la guia. */
  const visual = page.locator('[data-pace-breathe-visual]').first();
  await expect(visual).toBeVisible();
  await expect(page.locator('[data-pace-essential]').first()).toBeAttached();
  /* La fase se anuncia. */
  await expect(sesion.getByText('Inhala')).toBeVisible();

  expect(errores).toEqual([]);
});

test('Mueve: la biblioteca abre, el Preview precede a la sesion y los pasos corren', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  await page.getByRole('button', { name: /^Mueve/ }).click();
  await expect(page.getByRole('heading', { name: 'Flexiones de escritorio' })).toBeVisible();

  /* PREVIEW §18.3 (s144): sale desde la BIBLIOTECA y solo desde ahi. */
  await page.getByRole('heading', { name: 'Flexiones de escritorio' }).click();
  const preview = overlaySuperior(page);
  await expect(preview.getByText('ANTES DE EMPEZAR')).toBeVisible();
  await expect(preview.getByText('QUÉ NECESITAS')).toBeVisible();
  await expect(preview.getByText('LOS PASOS')).toBeVisible();
  await preview.getByRole('button', { name: 'Empezar', exact: true }).click();

  /* COUNTDOWN: la preparacion descuenta de verdad. Se mide dos veces y se exige
     que BAJE — un numero fijo pintado tambien pasaria un `toBeVisible`. */
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion.getByText('PREPÁRATE')).toBeVisible();
  const prep = sesion.locator('[data-pace-session-prep-num]');
  const antes = Number(await prep.innerText());
  expect(Number.isFinite(antes)).toBe(true);
  await expect.poll(async () => Number(await prep.innerText())).toBeLessThan(antes);

  /* PASOS: el runner v1 pinta nombre, indicacion y en que punto va. */
  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(page.locator('[data-pace-v1-name]')).toHaveText('Flexiones inclinadas');
  await expect(page.locator('[data-pace-v1-cue]')).not.toBeEmpty();
  await expect(page.locator('[data-pace-v1-kicker]')).toHaveText('Colócate');
  await expect(page.locator('[data-pace-v1-progress]')).toContainText('Siguiente');

  /* Y el paso de trabajo trae su propio temporizador. */
  await page.getByRole('button', { name: 'Empezar ya' }).click();
  await expect(page.locator('[data-pace-v1-timer]')).toBeVisible();

  expect(errores).toEqual([]);
});
