/* PACE · E2E · LA COPIA LLEVA EL LOGRO QUE GANA (caza de lo nuevo, 8 nov. 2026)
 * ====================================================================
 * «Cuaderno a salvo» (`secret.backup`) se gana al exportar, pero se daba DESPUÉS de armar la copia:
 * el archivo salía sin él. Quien borraba sus datos o cambiaba de móvil y traía esa copia perdía
 * justo el logro de haberla hecho. Se lee el ARCHIVO descargado y se importa en un PACE vacío.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, aceptarAvisosPace, abrirTusDatos } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

test('la copia que se descarga lleva «Cuaderno a salvo», y al traerla no se pierde', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await aceptarAvisosPace(page);
  expect(await page.evaluate(() => !!getState().achievements['secret.backup']), 'GUARD: ya lo tenía').toBe(false);

  await page.locator('button[aria-label="Abrir ajustes"]').click();
  await abrirTusDatos(page);
  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar una copia', exact: true }).click(),
  ]);
  const copia = JSON.parse(require('fs').readFileSync(await descarga.path(), 'utf8'));
  await expect.poll(() => page.evaluate(() => !!getState().achievements['secret.backup']), 'GUARD: exportar da el logro').toBe(true);
  expect(copia.state.achievements['secret.backup'], 'la copia sale sin el logro que gana').toBeTruthy();

  /* La misma copia, traída a un PACE sin ese logro. */
  await page.evaluate(() => { const s = getState(); const a = Object.assign({}, s.achievements); delete a['secret.backup']; setState({ achievements: a }); });
  await page.locator('input[type="file"][data-pace-traer-copia]').setInputFiles({
    name: 'pace-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(copia)),
  });
  await page.getByRole('button', { name: /^Importar/ }).last().click();
  await page.waitForFunction(() => document.readyState === 'complete' && typeof getState === 'function', null, { timeout: 15000 });
  await expect.poll(() => page.evaluate(() => !!getState().achievements['secret.backup']), 'al traer la copia se pierde «Cuaderno a salvo»').toBe(true);
  expect(errores, 'consola con errores').toEqual([]);
});
