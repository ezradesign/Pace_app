/* PACE · los Caminos, ocultos hasta después de v1
 * ================================================
 * Decisión de Ez: la app ya guía el día con «A tu ritmo», y los siete Caminos
 * quedan fuera de v1 sin borrarse. `SHOW_CAMINOS` (app/flags.js) los apaga en
 * las cuatro superficies que llevaban a ellos, y aquí se comprueba cada una.
 * Si los Caminos vuelven, la bandera pasa a `true` y este archivo se borra.
 *
 * Lo que NO se esconde, a propósito: un Camino que ya estuviera en curso. La
 * home lo sigue pintando para terminarlo o dejarlo.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, RUTA_ARTEFACTO } = require('./helpers');

const CARTOGRAFA = '[data-pace-ach="master.path.all7"]';

async function abrirLogros(page) {
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-achievements')));
  await page.locator('[data-pace-ach]').first().waitFor({ state: 'visible' });
}

test('la tarjeta del ritmo ya no ofrece «Ver caminos»', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  /* CONTROL: la tarjeta está y su otro enlace también; si no, el cero de abajo
     no diría nada. */
  await expect(page.locator('[data-pace-ritmo-ajustar]:visible')).toHaveCount(1);
  await expect(page.locator('[data-pace-ritmo-caminos]')).toHaveCount(0);
});

test('Estadísticas no tiene pestaña Caminos', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.keyboard.press('s');
  const modal = page.locator('[data-pace-modal-card]');
  await expect(modal.getByRole('button', { name: 'Año', exact: true })).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Caminos', exact: true })).toHaveCount(0);
});

test('«Cartógrafa» sale de la colección, salvo para quien ya la ganó', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirLogros(page);
  await expect(page.locator(CARTOGRAFA)).toHaveCount(0);

  /* Quien la ganó recorriendo los siete no la pierde. */
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('pace.state.v2') || '{}');
    s.achievements = Object.assign({}, s.achievements, { 'master.path.all7': { unlockedAt: Date.now() } });
    localStorage.setItem('pace.state.v2', JSON.stringify(s));
  });
  await page.reload();
  await abrirLogros(page);
  await expect(page.locator(CARTOGRAFA)).toContainText('Cartógrafa');
  expect(errores).toEqual([]);
});

test('la bienvenida no hace las tres preguntas: tras la semana, «Comenzar» lleva a la home', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.goto(RUTA_ARTEFACTO);   // sin sembrar: primera vez de la vida
  const bienvenida = page.locator('[data-pace-scene-card][role="dialog"]');
  await bienvenida.waitFor({ state: 'visible' });
  await expect(bienvenida).not.toContainText('Tres preguntas breves');
  await expect(page.getByRole('button', { name: 'prefiero saltarlo' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Comenzar' }).click();
  /* La semana sí se pregunta: es de «A tu ritmo», no de los Caminos
     (onboarding-semana.spec.js). Es la última pantalla y su botón dice «Comenzar». */
  await expect(bienvenida).toContainText('¿Cómo es tu semana?');
  await expect(bienvenida).not.toContainText('Tres preguntas breves');
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await expect(bienvenida).toHaveCount(0);

  /* Y no vuelve: la bienvenida se cierra para siempre, como al saltarla. */
  await page.reload();
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await expect(bienvenida).toHaveCount(0);
  expect(errores).toEqual([]);
});
