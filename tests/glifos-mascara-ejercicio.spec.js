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

/* s170 · ESTE ASERTO SE HA REESCRITO DOS VECES EN LA MISMA SESION, y la
   segunda es la leccion.
   v1 (s166) exigia que `EXERCISE_MASKS` estuviera VACIO — premisa que caduco en
   cuanto entro el primer dibujo. v2 la cambio por «estos dos pasos concretos no
   tienen mascara»... y caduco el mismo dia, al ingestar 47 piezas de golpe: una
   de ellas era justo «Flexiones inclinadas». El guard salto y lo dijo, que es
   para lo que estaba, pero el patron era el defectuoso: ATAR UN ASERTO A UN
   NOMBRE que el proyecto esta rellenando a proposito es firmar su caducidad.
   v3 no nombra a nadie. Le pregunta a la app que pasos tienen mascara, y exige
   que el DOM coincida: los que la tienen la pintan y los que no, pintan SVG.
   Vale con 0 masc/61 SVG y con 61/0, y no hay que volver a tocarlo. */
test('cada paso pinta mascara o SVG segun lo que diga el mapa, sin mezclas', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  const preview = await abrirPreview(page);

  /* La verdad la da la APP, fila a fila. Nada de nombres codificados aqui: se
     lee el nombre que el preview PINTA y se le pregunta al resolutor si esa
     identidad tiene mascara. La suite corre en español, asi que el texto de la
     fila es el nombre canonico (el fallback de `tR` devuelve el dato). */
  const filas = await preview.evaluate((raiz) => {
    const tieneMascara = (el) => {
      for (const n of [el, ...el.querySelectorAll('*')]) {
        const mi = getComputedStyle(n).maskImage || getComputedStyle(n).webkitMaskImage || 'none';
        if (mi !== 'none' && mi !== 'initial') return true;
      }
      return false;
    };
    const out = [];
    for (const svgOrSpan of raiz.querySelectorAll('svg')) {
      const fila = svgOrSpan.closest('div');
      if (fila) out.push({ texto: (fila.innerText || '').replace(/\s*×\s*\d+\s*$/, '').trim(), pinta: 'svg' });
    }
    for (const el of raiz.querySelectorAll('span')) {
      const mi = getComputedStyle(el).maskImage || getComputedStyle(el).webkitMaskImage || 'none';
      if (mi === 'none' || mi === 'initial') continue;
      const fila = el.parentElement && el.parentElement.closest('div');
      if (fila) out.push({ texto: (fila.innerText || '').replace(/\s*×\s*\d+\s*$/, '').trim(), pinta: 'mascara' });
    }
    return out.filter(f => f.texto);
  });

  /* GUARD DE CERO: sin filas no hay nada medido y el aserto pasaria en vacio. */
  expect(filas.length, 'GUARD: el preview no pinto ni un paso con glifo').toBeGreaterThan(0);

  /* RELACIONAL: lo que cada fila PINTA tiene que coincidir con lo que el mapa
     DICE de ella. Una discrepancia en cualquiera de los dos sentidos —arte que
     no se pinta, o SVG donde ya hay arte— sale aqui con el nombre delante. */
  const discrepancias = [];
  for (const f of filas) {
    const conMascara = await page.evaluate(
      n => !!(window.exerciseMaskUrl && window.exerciseMaskUrl(n)), f.texto);
    const esperado = conMascara ? 'mascara' : 'svg';
    if (f.pinta !== esperado) discrepancias.push(f.texto + ': mapa dice ' + esperado + ', pinta ' + f.pinta);
  }
  expect(discrepancias, 'la precedencia mascara/SVG no coincide con el mapa').toEqual([]);

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
  /* s170: se inyecta en LOS DOS mapas. Desde que `ExerciseGlyph` pasa el tamaño,
     `exerciseMaskUrl` consulta primero `EXERCISE_MASKS_MIN` por debajo de 40 px
     — y el preview pinta a 30 —, asi que sembrar solo el grande dejaba ganar al
     asset de miniatura REAL y este aserto media otra cosa. */
  const cuantas = await page.evaluate(ruta => {
    const ids = Object.keys(window.EXERCISE_GLYPHS || {});
    ids.forEach(id => {
      window.EXERCISE_MASKS[id] = ruta;
      if (window.EXERCISE_MASKS_MIN) window.EXERCISE_MASKS_MIN[id] = ruta;
    });
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
