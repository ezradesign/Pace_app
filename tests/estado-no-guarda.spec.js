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
const { sembrar, irAlArtefacto, abrirTusDatos, capturarErrores, CLAVE_ESTADO } = require('./helpers');

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

/* LA OCTAVA, PRUEBA 2 (12 nov. 2026): un navegador lleno no falla solo para `pace.state.v2`, falla
   para TODAS las claves (el reloj del Foco, el motor del aro, el calendario, los avisos, la sesión
   de otra pestaña…), y también `sessionStorage`. Cada escritura de `app/` va dentro de un `try`, y
   aquí se comprueba de una vez: la home monta sin errores y un Foco empieza, acaba, abre la pausa y se
   cuenta en lo que hay en memoria. Mutante: con el `try` quitado de la escritura del reloj del Foco
   (`persistFocusTimer`), «Empezar foco» rompe la app y la prueba cae.
   Y LA BARRA SALE AL EMPEZAR EL FOCO (Ez, 2 B de la octava): con la primera escritura que falla, sea la
   que sea (`paceAvisarNoGuarda`, state-core.support.jsx); antes salía al acabarlo, con el estado. Sale
   una vez: tras «Entendido» no vuelve al acabar el bloque, y en toda la visita se pinta una sola vez.
   En el ordenador la primera que falla es el tamaño del aro, al abrir: la barra sale ya ahí. La que
   aísla el reloj del Foco es la 5d. */
test('estado-5c · con el almacenamiento lleno para todas las claves, la app sigue y un Foco empieza y acaba', async ({ page, context }) => {
  await sembrar(context);
  await context.addInitScript(() => {
    Storage.prototype.setItem = function () { throw new DOMException('lleno', 'QuotaExceededError'); };
  });
  /* Cuántas veces entra la barra en la página: una sola, sin parpadeo. */
  await context.addInitScript(() => {
    window.__barras = 0;
    new MutationObserver((cambios) => cambios.forEach((c) => c.addedNodes.forEach((n) => {
      if (n.nodeType === 1 && (n.matches('[data-pace-no-guarda]') || n.querySelector('[data-pace-no-guarda]'))) window.__barras++;
    }))).observe(document, { childList: true, subtree: true });
  });
  const errores = capturarErrores(page);
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await expect(page.getByRole('button', { name: 'Empezar foco', exact: true })).toBeVisible();

  /* Empezar solo guarda el reloj del Foco (`pace.timer.v1`), y ya no se puede: sale la barra. */
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible();
  await expect(aviso(page), 'la barra no salió al empezar el Foco').toBeVisible();
  await aviso(page).getByRole('button', { name: 'Entendido' }).click();
  await expect(aviso(page)).toHaveCount(0);

  /* Se salta al final del bloque por su duración (su reloj no se guardó). Al acabar falla también el
     estado, y la barra no vuelve: una vez por visita. */
  await page.clock.fastForward(25 * 60 * 1000 + 1000);
  await expect(page.locator('[data-pace-break-shortcut]').first()).toBeAttached({ timeout: 15000 });
  await page.clock.runFor(2000);
  await expect(aviso(page), 'la barra volvió a salir').toHaveCount(0);
  expect(await page.evaluate(() => window.__barras), 'veces que entró la barra').toBe(1);
  expect(await page.evaluate(() => getState().totalFocusMin), 'el Foco se cuenta en memoria').toBe(25);
  expect(errores, 'errores con el almacenamiento lleno').toEqual([]);
});

/* LA 2 B, AISLADA: solo falla el reloj del Foco. Antes de la 2 B, `persistFocusTimer` se tragaba el error
   y la barra no salía hasta que fallara el estado; si se cerraba PACE a mitad, el bloque se perdía sin
   aviso. Mutante: ese catch sin `paceAvisarNoGuarda` (como en la 0.201.0), y la prueba cae. */
test('estado-5d · si solo falla el reloj del Foco, la barra sale al empezarlo', async ({ page, context }) => {
  await sembrar(context);
  await context.addInitScript(() => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'pace.timer.v1') throw new DOMException('lleno', 'QuotaExceededError');
      return orig.call(this, k, v);
    };
  });
  await page.clock.install({ time: new Date('2026-10-08T10:00:00+02:00') });
  await irAlArtefacto(page);
  await page.clock.runFor(2000);
  await expect(aviso(page), 'GUARD: sin fallar nada aún, no hay barra').toHaveCount(0);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible();
  await expect(aviso(page), 'empezar un Foco que no se puede guardar no avisó').toBeVisible();
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
