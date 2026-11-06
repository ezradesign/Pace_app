/* PACE · E2E · cuando el navegador no deja guardar, PACE lo dice (caza del 10 oct., estado-5)
 * =========================================================================================
 * Con el almacenamiento lleno o bloqueado, cada escritura de `pace.state.v2` fallaba en silencio:
 * sumabas dos vasos, los veías, recargabas y había cero. Ez eligió el 12 oct. la opción A: la
 * primera vez que no se puede guardar sale abajo una barra, como la de «Hay una versión nueva»,
 * con «Exportar una copia» (de lo que hay en memoria, que es lo único al día) y «Entendido».
 * La primera cae contra v0.155.0; el CONTROL pasa en las dos.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, abrirTusDatos, CLAVE_ESTADO } = require('./helpers');

const aviso = (p) => p.locator('[data-pace-no-guarda]');
const unVaso = (p) => p.locator('[data-pace-sidebar]').getByRole('button', { name: /Añadir un vaso/ }).click();

test('estado-5 · si no se puede guardar, una barra lo dice una vez y deja exportar lo que hay', async ({ page, context }) => {
  await sembrar(context);
  /* Lleno: la semilla entra y, desde ahí, el estado ya no se puede escribir. */
  await context.addInitScript((clave) => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === clave && this.getItem(clave)) throw new DOMException('lleno', 'QuotaExceededError');
      return orig.call(this, k, v);
    };
  }, CLAVE_ESTADO);
  await irAlArtefacto(page);
  await expect(aviso(page)).toHaveCount(0);

  await unVaso(page);
  await unVaso(page);
  await expect(aviso(page)).toBeVisible();
  await expect(aviso(page)).toContainText('Este navegador no deja guardar: lo que hagas se perderá al cerrar PACE.');

  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    aviso(page).getByRole('button', { name: 'Exportar una copia' }).click(),
  ]);
  const copia = JSON.parse(require('fs').readFileSync(await descarga.path(), 'utf8'));
  expect(copia.state.water.today, 'la copia no lleva lo que hay en pantalla').toBe(2);

  await aviso(page).getByRole('button', { name: 'Entendido' }).click();
  await expect(aviso(page)).toHaveCount(0);
  /* Una vez por visita: otro vaso que tampoco se guarda no lo vuelve a sacar. */
  await unVaso(page);
  await page.waitForTimeout(300);
  await expect(aviso(page)).toHaveCount(0);
});

test('estado-5b · exportar desde Ajustes y desde el aviso da el mismo estado, el que se ve (revisión de ChatGPT del 5 nov.)', async ({ page, context }) => {
  await sembrar(context);
  await context.addInitScript((clave) => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === clave && this.getItem(clave)) throw new DOMException('lleno', 'QuotaExceededError');
      return orig.call(this, k, v);
    };
  }, CLAVE_ESTADO);
  await irAlArtefacto(page);
  await unVaso(page);
  await unVaso(page);
  await expect(aviso(page)).toBeVisible();
  const bajar = async (boton) => {
    const [d] = await Promise.all([page.waitForEvent('download'), boton.click()]);
    return JSON.parse(require('fs').readFileSync(await d.path(), 'utf8'));
  };
  const delAviso = await bajar(aviso(page).getByRole('button', { name: 'Exportar una copia' }));
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  const deAjustes = await bajar(page.locator('[data-pace-tweaks-panel]').getByRole('button', { name: 'Exportar una copia' }));
  expect(deAjustes.state.water.today, 'Ajustes exportó lo guardado y no lo que se ve').toBe(2);
  /* Abrir Ajustes gana un logro («explore.tweaks») entre una copia y otra; lo demás es lo mismo. */
  const sinLogros = ({ achievements, achievementQueue, ...resto }) => resto;
  expect(sinLogros(deAjustes.state)).toEqual(sinLogros(delAviso.state));
});

test('CONTROL · si se guarda bien, no sale ningún aviso', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await unVaso(page);
  await unVaso(page);
  await page.waitForTimeout(300);
  await expect(aviso(page)).toHaveCount(0);
  expect(await page.evaluate((c) => JSON.parse(localStorage.getItem(c)).water.today, CLAVE_ESTADO)).toBe(2);
});
