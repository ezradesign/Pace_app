/* PACE · tests/biblioteca-ensanchar.spec.js
   =========================================
   «TUS RUTINAS» A POCO ANCHO Y LUEGO UNA VENTANA MÁS ANCHA (revisión de ChatGPT, 5 nov. 2026).
   En el móvil, «Tus rutinas» sustituye al catálogo por un bloque de solo móvil. Si la
   ventana se ensancha hasta la disposición de escritorio con esa vista puesta, el bloque se
   oculta, el enlace de volver también, y la columna principal se queda sin nada: las
   rutinas propias siguen en el lateral pero el catálogo ha desaparecido sin salida.

   Lo que se defiende, a 600, 1000 y otra vez 600 px:
     · en escritorio el catálogo se pinta SIEMPRE, con la vista que haya quedado puesta
     · los filtros puestos no se pierden al ensanchar
     · al volver a estrechar, la persona sigue donde estaba (en «Tus rutinas», con su
       enlace para volver) y no en una pantalla en blanco
   Las alturas van en horizontal a propósito: en vertical y hasta 1024 px de ancho la app
   usa la piel de móvil (pieles-corte.spec.js), y 1000×1000 sería móvil. */
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.beforeEach(async ({ context, page }) => {
  await sembrar(context);
  await page.clock.setFixedTime(new Date('2026-08-26T10:00:00'));
});

/* Cuántas tarjetas del catálogo se ven de verdad (las del lateral y las de «Para ahora»
   quedan fuera: se cuenta solo la rejilla del catálogo). */
function tarjetasDelCatalogo(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('.pace-lib-rejilla [data-pace-lib-card]'))
    .filter(e => e.getBoundingClientRect().width > 0).length);
}

/* El enlace de la cabecera («Tus rutinas» / «Volver») que se puede tocar. */
function enlaceVisible(page) {
  return page.locator('.pace-lib-hd .pace-lib-link').locator('visible=true');
}

/* «Tus rutinas» del bloque de móvil: el título que solo existe en esa vista. */
function tuyasEnLaColumna(page) {
  return page.locator('.pace-lib-main .pace-lib-solo-movil h3').locator('visible=true');
}

test('al ensanchar con «Tus rutinas» abierta, el catálogo sigue en la columna principal', async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 800 });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Mueve/ }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });

  /* control: en móvil arranca en el catálogo, con las tarjetas a la vista */
  const alInicio = await tarjetasDelCatalogo(page);
  expect(alInicio, 'a 600 px el catálogo tiene tarjetas').toBeGreaterThan(5);

  /* un filtro puesto, para comprobar que ensanchar no lo pierde */
  await page.locator('.pace-lib .pace-lib-chip').locator('visible=true').first().click();
  const conFiltro = await tarjetasDelCatalogo(page);
  expect(conFiltro, 'el filtro quita algo').toBeLessThan(alInicio);
  expect(conFiltro).toBeGreaterThan(0);

  /* «Tus rutinas» a 600 px: el catálogo da paso al bloque propio, con su camino de vuelta */
  await enlaceVisible(page).click();
  await expect(tuyasEnLaColumna(page).first()).toBeVisible();
  expect(await tarjetasDelCatalogo(page), 'a 600 px, en «Tus rutinas», el catálogo cede el sitio').toBe(0);
  await expect(enlaceVisible(page)).toHaveText('Volver');

  /* a 1000 px: el catálogo tiene que estar, con el mismo filtro, en la columna principal */
  await page.setViewportSize({ width: 1000, height: 700 });
  await expect.poll(() => tarjetasDelCatalogo(page), {
    message: 'a 1000 px el catálogo se pinta aunque se haya quedado «Tus rutinas» puesta',
  }).toBe(conFiltro);
  /* y «Tus rutinas» sigue donde tiene que estar en escritorio: el lateral */
  await expect(page.locator('.pace-lib-lateral h3').locator('visible=true').first()).toBeVisible();

  /* de vuelta a 600 px: la persona sigue en «Tus rutinas», con el enlace de volver */
  await page.setViewportSize({ width: 600, height: 800 });
  await expect(tuyasEnLaColumna(page).first()).toBeVisible();
  await expect(enlaceVisible(page)).toHaveText('Volver');
  expect(await tarjetasDelCatalogo(page)).toBe(0);

  /* y «Volver» devuelve el catálogo con el filtro que había */
  await enlaceVisible(page).click();
  expect(await tarjetasDelCatalogo(page)).toBe(conFiltro);
});
