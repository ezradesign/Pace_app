/* PACE · E2E · LA PRECEDENCIA DE MASCARA EN LOS GLIFOS DE EJERCICIO (s166)
 * ========================================================================
 * s166 monta el mecanismo por el que los 62 dibujos del rediseño entraran como
 * MASCARA CSS en vez de como SVG en codigo, y lo monta ANTES de que exista el
 * arte. Eso solo es seguro si se cumplen DOS cosas a la vez, y son las dos que
 * estos asertos miden:
 *
 *   1. CON EL MAPA VACIO la app pinta exactamente lo de ayer. Si la rama nueva
 *      se colara, los pasos se quedarian sin dibujo y no habria arte que lo
 *      tapara. Esto es lo que permite que el mecanismo viva en produccion
 *      mientras el usuario genera los PNG.
 *   2. CUANDO HAY MASCARA, GANA. Es lo que hace que el arte pueda llegar POR
 *      PARTES, un dibujo cada vez, sin dejar la app a medias — el mismo diseño
 *      que s146 uso para los sellos de logro.
 *
 * DONDE SE MIRA, y costo dos rojos averiguarlo: `ExerciseGlyph` NO se pinta en
 * la biblioteca —alli las tarjetas son de RUTINA— sino en el PREVIEW «antes de
 * empezar» (§18.3, s144), en el runner y en el constructor. El primer intento
 * contaba los <svg> de la biblioteca y pasaba EN VACIO, midiendo iconos que no
 * eran glifos de ejercicio.
 *
 * COMO SE PRUEBA LA SEGUNDA SIN ARTE: `EXERCISE_MASKS` es un objeto publicado en
 * `window`, asi que el test le mete filas en caliente. No se toca ni un archivo:
 * viven lo que vive la pestaña.
 *
 * SEGUNDA TRAMPA PAGADA: reabrir el preview NO puede pasar por `irAlArtefacto`.
 * Eso NAVEGA, y una navegacion vuelve a montar la app desde cero y se lleva por
 * delante las filas inyectadas. Reabrir es un click, no un viaje.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

const RUTINA = 'Flexiones de escritorio';

/* Abre biblioteca + preview SIN navegar. La navegacion se hace una sola vez. */
async function abrirPreview(page) {
  await page.getByRole('button', { name: /^Mueve/ }).click();
  await page.getByRole('heading', { name: RUTINA }).click();
  const preview = overlaySuperior(page);
  await expect(preview.getByText('LOS PASOS')).toBeVisible();
  return preview;
}

async function cerrarTodo(page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
}

/* Cuenta los nodos que pintan una mascara de ejercicio. El valor computado trae
   la URL ABSOLUTA, asi que se busca por el tramo de la carpeta. */
/* Se apunta a un .webp que EXISTE (uno de los sellos de logro) en vez de a un
   nombre inventado: una ruta falsa da 404 y `capturarErrores` lo cuenta como
   error de consola -- tres, la primera vez. Lo que se prueba es la RAMA de
   render, no de donde sale el archivo. */
const PRUEBA = 'app/glyphs/assets/logros/first.breath.webp';
const MARCA = 'first.breath.webp';

const mascarasEnPantalla = page => page.evaluate(MARCA => {
  let n = 0;
  for (const el of document.querySelectorAll('*')) {
    const st = getComputedStyle(el);
    const mi = st.maskImage || st.webkitMaskImage || 'none';
    if (mi !== 'none' && mi.indexOf(MARCA) !== -1) n++;
  }
  return n;
}, MARCA);

test('con el mapa VACIO los pasos se pintan en SVG y no hay ni una mascara', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  const vacio = await page.evaluate(() => Object.keys(window.EXERCISE_MASKS || {}).length);
  expect(vacio, 'el mapa de mascaras no esta vacio: este aserto mide otra cosa').toBe(0);

  const preview = await abrirPreview(page);

  /* GUARD DE CERO, y CONTADO SOBRE EL PREVIEW y no sobre la pagina: un «0
     mascaras» sin glifos delante no significa nada, y contar todos los <svg>
     del documento mide iconos que no son glifos de ejercicio. */
  /* GUARD: que el preview este mostrando pasos. Que esos pasos LLEVEN glifo lo
     demuestra el segundo test, que los convierte en mascara y los cuenta: si no
     hubiera glifos, aquel no encontraria ninguna. */
  const filas = await preview.locator('svg').count();
  expect(filas, 'GUARD: el preview no pinto nada, no hay nada medido').toBeGreaterThan(0);
  expect(await mascarasEnPantalla(page),
    'con el mapa vacio no puede haber ni una mascara de ejercicio').toBe(0);

  expect(errores).toEqual([]);
});

test('cuando hay mascara, GANA al SVG — y solo para quien la tiene', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await abrirPreview(page);
  expect(await mascarasEnPantalla(page), 'partia con mascaras ya puestas').toBe(0);
  await cerrarTodo(page);

  /* Se le da mascara a TODAS las identidades y no a una elegida a dedo: cual de
     ellas pinta este preview depende del catalogo, y atarlo a un nombre
     concreto seria apostar a que esa rutina no cambia nunca. */
  const cuantas = await page.evaluate(ruta => {
    const ids = Object.keys(window.EXERCISE_GLYPHS || {});
    ids.forEach(id => { window.EXERCISE_MASKS[id] = ruta; });
    return ids.length;
  }, PRUEBA);
  expect(cuantas, 'GUARD: no hay ni una identidad a la que darle mascara').toBeGreaterThan(10);

  await abrirPreview(page);
  expect(await mascarasEnPantalla(page),
    'el mapa tiene filas pero ExerciseGlyph sigue pintando el SVG: la precedencia no esta cableada')
    .toBeGreaterThan(0);

  /* ENTREGA POR PARTES: una identidad que NO esta en el mapa sigue devolviendo
     null, que es lo que deja su SVG en pie mientras no llegue su dibujo. */
  const sinFila = await page.evaluate(() =>
    window.exerciseMaskUrl('__identidad que no existe__'));
  expect(sinFila, 'el resolutor devuelve mascara para algo que no esta en el mapa').toBeNull();

  expect(errores).toEqual([]);
});
