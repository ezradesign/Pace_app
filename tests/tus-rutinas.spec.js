/* PACE · E2E · «TUS RUTINAS» DE PUNTA A PUNTA EN EL MÓVIL (v0.158.0)
 * ===============================================================
 * Las pruebas de PACE completo (premium-codigo, premium-abierto) miran el candado
 * y el código, pero nadie recorría lo de después: con PACE completo, crear una
 * rutina en el constructor, guardarla y verla. Al recorrerlo el 13 oct. salieron
 * tres fallos, a 360 px:
 *   · el nombre del ejercicio se montaba encima del «−» (los controles fijos le
 *     dejaban unos 20 px);
 *   · al guardar, la biblioteca de Mueve volvía al catálogo y la rutina nueva no
 *     se veía (al abrirse el constructor, la biblioteca se cerraba y se reiniciaba);
 *   · «Crear rutina» era un div: con el teclado no se llegaba.
 * Contra v0.157.0 cae en los tres.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const solape = (a, b) => !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);

test('en el móvil se crea una rutina sin que nada se pise, y al guardar se ve', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrar(context, { premiumUnlocked: true });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Mueve/ }).filter({ visible: true }).first().click();
  const biblio = page.locator('[data-pace-modal-backdrop]').last();
  /* En el móvil «Tus rutinas» es un enlace de la cabecera. */
  await biblio.getByText(/^Tus rutinas/).filter({ visible: true }).first().click();

  /* «Crear rutina» es un BOTÓN (teclado y lector de pantalla). */
  const crear = biblio.getByRole('button', { name: /Crear rutina/ });
  await expect(crear, '«Crear rutina» no es un botón').toBeVisible();
  await crear.click();

  for (let k = 0; k < 2; k++) {
    await page.getByRole('button', { name: /Añadir ejercicio/ }).filter({ visible: true }).first().click();
    const filas = page.locator('[data-pace-modal-backdrop]').last().getByRole('button').filter({ hasText: /\d+\s*s$/ });
    await filas.nth(k * 3).click();
    const volver = page.getByRole('button', { name: /Volver/ }).filter({ visible: true });
    if (await volver.count()) await volver.first().click();
  }

  /* Ningún nombre pisa sus controles. */
  const menos = page.getByRole('button', { name: '−5 s' });
  await expect(menos).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    const fila = menos.nth(i).locator('xpath=ancestor::div[1]');
    const cajas = await fila.evaluate((el) => {
      const nombre = [...el.querySelectorAll(':scope > span')].find((s) => s.textContent.trim() && !s.querySelector('button'));
      const r = (n) => { const b = n.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; };
      /* Se mide el TEXTO pintado, no su caja: la caja encogía a ~20 px y el texto se salía por
         encima del «−» sin que la caja tocara nada. */
      const rango = document.createRange(); rango.selectNodeContents(nombre);
      return { nombre: [...rango.getClientRects()].map((b) => ({ x: b.x, y: b.y, width: b.width, height: b.height })), botones: [...el.querySelectorAll('button')].map(r) };
    });
    for (const t of cajas.nombre) for (const b of cajas.botones) expect(solape(t, b), 'el nombre del ejercicio pisa un botón').toBe(false);
  }

  await page.getByPlaceholder('Mi rutina').fill('Mi pausa de prueba');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();

  /* Al guardar, la biblioteca sigue en «Tus rutinas» y la rutina nueva se ve. */
  await expect(page.locator('[data-pace-modal-backdrop]').last().getByText('Mi pausa de prueba').filter({ visible: true }),
    'al guardar no se ve la rutina nueva').toHaveCount(1);
});
