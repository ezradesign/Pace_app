/* PACE · E2E · «TUS RUTINAS» ABRE TUS RUTINAS (Ez, N2 A, 8 nov. 2026)
 * ===================================================================
 * La caza de lo nuevo (8 nov.) lo vio a 360 px: con PACE vacío, «Tus rutinas» del panel
 * abre el constructor, y al guardar la rutina se volvía al inicio sin ver dónde quedó.
 * Otra vez «Tus rutinas»: abría el catálogo de Mueve, y la rutina solo salía con un
 * segundo toque en «Tus rutinas ›». Ez eligió la A: «Tus rutinas» abre tus rutinas (en
 * el móvil, la vista del segundo toque) y al guardar se abre esa lista con la nueva dentro.
 * Vacía, sigue abriendo el constructor, como antes.
 *
 * Contra la 0.194.0 caen las dos primeras al guardar (no hay lista) y la tercera, que
 * crea la décima con nueve encima, porque la nueva quedaba debajo, fuera de la vista.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const TXT = {
  es: { tuyas: /^Tus rutinas/, panel: /Abrir panel/, nueva: 'Nueva rutina', anadir: /Añadir ejercicio/, volver: /^Volver$/, atras: /Volver/, guardar: 'Guardar', nombre: 'Mi rutina', crear: /Crear rutina/ },
  en: { tuyas: /^Your routines/, panel: /Open panel/, nueva: 'New routine', anadir: /Add exercise/, volver: /^Back$/, atras: /Back/, guardar: 'Save', nombre: 'My routine', crear: /Create routine/ },
};

/* «Tus rutinas» del panel: en el móvil, el panel se abre antes. */
async function tusRutinasDelPanel(page, x) {
  const boton = page.locator('aside[data-pace-sidebar]').getByRole('button', { name: x.tuyas });
  if (!(await boton.filter({ visible: true }).count())) await page.getByRole('button', { name: x.panel }).filter({ visible: true }).first().click();
  await boton.filter({ visible: true }).first().click();
}

/* La tarjeta de la rutina se ve de verdad: en la pantalla y no tapada. */
async function aLaVista(page, nombre) {
  return page.evaluate((n) => {
    const b = [...document.querySelectorAll('[data-pace-custom-empezar]')].find((el) => el.textContent.trim() === n && el.getClientRects().length);
    if (!b) return 'no está';
    const r = b.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) return 'fuera de la pantalla (' + Math.round(r.top) + ')';
    const encima = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return b.contains(encima) ? 'sí' : 'tapada';
  }, nombre);
}

async function crearEnElConstructor(page, x, nombre, pasos) {
  await expect(page.getByRole('heading', { name: x.nueva }), 'no se abrió el constructor').toBeVisible();
  for (let k = 0; k < pasos; k++) {
    await page.getByRole('button', { name: x.anadir }).filter({ visible: true }).first().click();
    const filas = page.locator('[data-pace-modal-backdrop]').last().getByRole('button').filter({ hasText: /\d+\s*s$/ });
    await filas.nth(k * 3).click();
    const volver = page.getByRole('button', { name: x.atras }).filter({ visible: true });
    if (await volver.count()) await volver.first().click();
  }
  await page.getByPlaceholder(x.nombre).fill(nombre);
  await page.getByRole('button', { name: x.guardar, exact: true }).click();
  await expect(page.getByRole('heading', { name: x.nueva }), 'el constructor sigue abierto tras guardar').toHaveCount(0);
}

for (const vp of [{ w: 360, h: 800, movil: true }, { w: 1280, h: 800, movil: false }]) {
  test(`${vp.w} px · vacía abre el constructor; al guardar, la lista con la nueva; y «Tus rutinas» vuelve a ella`, async ({ page, context }) => {
    const x = TXT.es;
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await sembrar(context);
    await irAlArtefacto(page);

    await tusRutinasDelPanel(page, x);
    await crearEnElConstructor(page, x, 'Mi pausa de la tarde', 3);

    /* Al guardar: la biblioteca, en «Tus rutinas», con la rutina nueva a la vista. */
    await expect.poll(() => aLaVista(page, 'Mi pausa de la tarde'), { message: 'al guardar no se ve la rutina nueva' }).toBe('sí');
    if (vp.movil) {
      /* La vista del segundo toque: el enlace de la cabecera dice «Volver» y el catálogo cede el sitio. */
      await expect(page.locator('.pace-lib-hd .pace-lib-link').filter({ visible: true })).toHaveText(x.volver);
      await expect(page.locator('.pace-lib-catalogo').filter({ visible: true }), 'en el móvil el catálogo sigue a la vista').toHaveCount(0);
    }

    /* Cerrar y volver por el mismo «Tus rutinas»: la lista a la primera, sin otro toque. */
    await page.keyboard.press('Escape');
    await expect(page.locator('.pace-lib')).toHaveCount(0);
    await tusRutinasDelPanel(page, x);
    await expect.poll(() => aLaVista(page, 'Mi pausa de la tarde'), { message: '«Tus rutinas» no abre tus rutinas' }).toBe('sí');
    await expect(page.getByRole('heading', { name: x.nueva }), 'con una rutina, «Tus rutinas» no abre el constructor').toHaveCount(0);

    /* «Mueve» de siempre sigue abriendo el catálogo: la vista no se queda pegada. */
    await page.keyboard.press('Escape');
    await expect(page.locator('.pace-lib')).toHaveCount(0);
    await page.getByRole('button', { name: /^Mueve/ }).filter({ visible: true }).first().click();
    await expect(page.locator('.pace-lib-main')).toHaveAttribute('data-vista', 'catalogo');
    /* Ni Estira, que estaba montada y cerrada mientras Mueve pedía «Tus rutinas». */
    await page.keyboard.press('Escape');
    await expect(page.locator('.pace-lib')).toHaveCount(0);
    await page.getByRole('button', { name: /^Estira/ }).filter({ visible: true }).first().click();
    await expect(page.locator('.pace-lib-main'), 'Estira se abre en «Tus rutinas» sin pedirlo').toHaveAttribute('data-vista', 'catalogo');
  });
}

/* Nueve rutinas y la décima, en inglés y en el móvil: la nueva va al final de la lista, y al
   guardar tiene que quedar a la vista aunque las otras nueve la empujen hacia abajo. */
test('360 px, en inglés · con nueve rutinas, la décima queda a la vista al guardarla', async ({ page, context }) => {
  const x = TXT.en;
  await page.setViewportSize({ width: 360, height: 800 });
  const nueve = Array.from({ length: 9 }, (_, i) => ({
    id: 'custom.17600000000' + i, name: 'Routine ' + (i + 1),
    steps: [{ name: 'Encogimiento de hombros', dur: 20, cue: '' }, { name: 'Giro sentado', dur: 20, cue: '' }],
    createdAt: 1760000000000 + i, updatedAt: 1760000000000 + i,
  }));
  await sembrar(context, { lang: 'en', customRoutines: nueve });
  await irAlArtefacto(page);

  await tusRutinasDelPanel(page, x);
  await expect.poll(() => aLaVista(page, 'Routine 1'), { message: '«Your routines» does not open your routines' }).toBe('sí');
  await page.getByRole('button', { name: x.crear }).filter({ visible: true }).first().click();
  await crearEnElConstructor(page, x, 'The tenth one', 2);
  await expect.poll(() => aLaVista(page, 'The tenth one'), { message: 'la décima no queda a la vista al guardarla' }).toBe('sí');
});
