/* PACE · tests/runner-mando.spec.js
   ==================================
   EL RUNNER GUIADO DE MUEVE Y ESTIRA CON EL «MANDO DE TRES» (opción A, elegida por Ez).
   Lo pidió así: «más dinámico, con menos botones; el usuario debe sentir la facilidad de
   hacer los ejercicios de forma guiada sin tener que tocar demasiado el ordenador o el
   teléfono», y antes, a 1080p con escala 125 % (1530x702 útiles en Brave), que el colócate
   estaba demasiado cerca de los botones y que no hubiera saltos entre pantallas.

   Lo que defiende cada prueba:
     · el pie es UNA fila de tres botones, en escritorio y en móvil, y no cambia entre fases;
     · la pausa también para la cuenta de colocarse (antes seguía corriendo);
     · «+15 s» suma a esa cuenta;
     · la colocación con espera (pared, barra, suelo) ya no pide «Estoy listo»: cuenta sola;
     · las rutinas propias corren en este runner, con «Descanso» como descanso;
     · el runner abre sin errores a 1530x702 y en ventanas muy bajas. A 1530x702 el cuerpo
       entraba y salía sin parar del modo «justo» y React cortaba la sesión por bucle: lo
       encontró una captura antes de subir, no un usuario.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior } = require('./helpers');

/* Abre una rutina del catálogo y pasa la preparación. El click al «Empezar» va acotado al
   modal de arriba: buscando en todo el documento se encuentra antes el «Empezar foco» de la
   home (la trampa está contada en runner-congelado.spec.js). */
async function abrirRutina(page, modulo, nombre) {
  await page.getByRole('button', { name: modulo }).first().click();
  await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(400);
  await page.evaluate((n) => {
    const t = [...document.querySelectorAll('[data-pace-lib-card]')]
      .filter(e => e.getBoundingClientRect().width > 0)
      .find(e => ((e.querySelector('h4') || e).textContent || '').trim() === n);
    if (!t) throw new Error('no encuentro la rutina ' + n);
    (t.querySelector('.pace-lib-hit') || t).click();
  }, nombre);
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar ahora' }).click();
  await page.locator('[data-pace-v1-body]').first().waitFor({ state: 'visible' });
}

const mando = (page) => page.locator('[data-pace-v1-mando]');
const numero = async (page) => parseInt((await page.locator('[data-pace-v1-num]').first().textContent()).trim(), 10);

async function medirMando(page) {
  return page.evaluate(() => {
    const m = [...document.querySelectorAll('[data-pace-v1-mando]')].find(e => e.getBoundingClientRect().width > 0);
    if (!m) return null;
    const bs = [...m.querySelectorAll('button')].map(b => b.getBoundingClientRect());
    const pie = document.querySelector('[data-pace-session-footer]').getBoundingClientRect();
    const barra = document.querySelector('[data-pace-v1-progress]').getBoundingClientRect();
    return {
      n: bs.length,
      tops: bs.map(r => Math.round(r.top + r.height / 2)),
      anchos: bs.map(r => Math.round(r.width)),
      pieTop: Math.round(pie.top), pieAlto: Math.round(pie.height),
      hueco: Math.round(pie.top - barra.bottom),
    };
  });
}

for (const [ancho, alto] of [[1530, 702], [360, 640]]) {
  test(`el mando es una fila de tres botones que no cambia entre fases (${ancho}x${alto})`, async ({ page, context }) => {
    const errores = capturarErrores(page);
    await page.setViewportSize({ width: ancho, height: alto });
    await sembrar(context);
    await irAlArtefacto(page);
    await abrirRutina(page, 'Mueve', 'Flexiones de escritorio');

    /* Colocarse: el botón de la derecha es «Empezar ya». */
    await expect(mando(page).getByRole('button', { name: 'Empezar ya' })).toBeVisible();
    await expect(mando(page).getByRole('button', { name: 'Anterior' })).toBeDisabled();
    await expect(mando(page).getByRole('button', { name: 'Pausar' })).toBeVisible();
    const colocate = await medirMando(page);
    expect(colocate, 'no encuentro el mando').not.toBeNull();
    expect(colocate.n, 'el mando no tiene tres botones').toBe(3);
    /* UNA fila: los tres centros a la misma altura. */
    expect(Math.max(...colocate.tops) - Math.min(...colocate.tops), 'el mando pasa a dos filas').toBeLessThanOrEqual(1);
    /* El del centro manda: es mayor que los de los lados. */
    expect(colocate.anchos[1]).toBeGreaterThan(colocate.anchos[0]);
    /* La barra de pasos no toca el mando: tiene su aire (antes medía 0). */
    expect(colocate.hueco, 'la barra de pasos está pegada al mando').toBeGreaterThanOrEqual(8);

    /* Trabajo: el mismo mando, en el mismo sitio; la derecha pasa a «Terminar antes». */
    await mando(page).getByRole('button', { name: 'Empezar ya' }).click();
    await expect(page.locator('[data-pace-v1-timer]')).toBeVisible();
    await expect(mando(page).getByRole('button', { name: 'Terminar antes' })).toBeVisible();
    const trabajo = await medirMando(page);
    expect(trabajo.n).toBe(3);
    expect(trabajo.tops, 'el mando se mueve al pasar de colocarse a trabajar').toEqual(colocate.tops);
    expect(trabajo.pieAlto, 'el pie cambia de alto entre fases').toBe(colocate.pieAlto);

    /* Y el de la izquierda vuelve al paso anterior en cuanto hay uno. */
    await mando(page).getByRole('button', { name: 'Terminar antes' }).click();
    await expect(page.locator('[data-pace-v1-name]')).toHaveText('Descanso');
    await expect(mando(page).getByRole('button', { name: 'Anterior' })).toBeEnabled();
    expect(errores).toEqual([]);
  });
}

test('la pausa también para la cuenta de colocarse, y «+15 s» le suma', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context);
  await irAlArtefacto(page);
  /* «Sentadilla en pared» empieza con una colocación de las que antes esperaban a «Estoy
     listo» (contra la pared): ahora cuenta sola, al menos 20 s. Así hay tiempo para mirar. */
  await abrirRutina(page, 'Mueve', 'Sentadilla en pared');
  await expect(page.locator('[data-pace-v1-num-gate]')).toBeVisible();
  await expect(page.getByRole('button', { name: /Estoy list/ }), 'vuelve a pedir «Estoy listo»').toHaveCount(0);

  await mando(page).getByRole('button', { name: 'Pausar' }).click();
  await expect(mando(page).getByRole('button', { name: 'Reanudar' })).toBeVisible();
  const parado = await numero(page);
  await page.waitForTimeout(2600);
  expect(await numero(page), 'la cuenta de colocarse sigue corriendo en pausa').toBe(parado);

  await page.getByRole('button', { name: /\+15 s/ }).click();
  expect(await numero(page), '«+15 s» no suma quince segundos').toBe(parado + 15);

  await mando(page).getByRole('button', { name: 'Reanudar' }).click();
  await page.waitForTimeout(2600);
  expect(await numero(page), 'al reanudar la cuenta no sigue').toBeLessThan(parado + 15);
  expect(errores).toEqual([]);
});

test('la colocación con espera arranca sola', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await page.clock.install();
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirRutina(page, 'Mueve', 'Sentadilla en pared');
  await expect(page.locator('[data-pace-v1-num-gate]')).toBeVisible();
  expect(await numero(page), 'la colocación con espera dura menos de 20 s').toBeGreaterThanOrEqual(19);
  await expect(page.locator('[data-pace-v1-timer]')).toHaveCount(0);
  await page.clock.runFor(22000);
  await expect(page.locator('[data-pace-v1-timer]'), 'la colocación no arrancó sola').toBeVisible();
  expect(errores).toEqual([]);
});

test('una rutina propia corre en el runner guiado, con «Descanso» como descanso', async ({ page, context }) => {
  const errores = capturarErrores(page);
  /* Las rutinas propias son de quien ha comprado premium: hasta v1 se abren las del catálogo,
     no el constructor (premium-abierto.spec.js). */
  await sembrar(context, {
    premiumUnlocked: true,
    customRoutines: [{
      id: 'custom.1760000000000', name: 'Mi pausa',
      steps: [
        { name: 'Encogimiento de hombros', dur: 20, cue: 'Hombros arriba, luego relaja.' },
        { name: 'Descanso', dur: 20, cue: 'Respira. Suelta.' },
        { name: 'Giro sentado', dur: 20, cue: 'Rota hacia el respaldo.' },
      ],
      createdAt: 1760000000000, updatedAt: 1760000000000,
    }],
  });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Mueve' }).first().click();
  await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
  await page.locator('h4:visible', { hasText: 'Mi pausa' }).first().click();
  /* La vista previa: con su duración estimada, no «undefined min» (las propias no guardan
     `min`; ahora se estima con la misma forma con la que las corre el runner). */
  const preview = overlaySuperior(page);
  await expect(preview).toContainText(/\d+(–\d+)? min/);
  await expect(preview).not.toContainText(/undefined/i);
  await preview.getByRole('button', { name: 'Empezar', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar ahora' }).click();

  /* El runner guiado: su mando, su barra de un segmento por paso y el texto del paso. */
  await expect(mando(page), 'la rutina propia no corre en el runner guiado').toBeVisible();
  await expect(page.locator('[data-pace-v1-name]')).toHaveText('Encogimiento de hombros');
  await expect(page.locator('[data-pace-v1-cue]')).toHaveText('Hombros arriba, luego relaja.');
  await expect(page.locator('[data-pace-v1-progress] > div:first-child > div')).toHaveCount(3);

  /* Un paso con tiempo: la derecha es «Siguiente» (el «Terminar antes» es de las reps). */
  await mando(page).getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.locator('[data-pace-v1-name]')).toHaveText('Descanso');
  /* Un descanso no lleva «Cuídate»: es la señal de que se pinta como descanso y no como un
     ejercicio que se llama así. */
  await expect(page.locator('[data-pace-v1-care]')).toHaveCount(0);
  await expect(page.locator('[data-pace-v1-timer]')).toBeVisible();
  expect(errores).toEqual([]);
});

/* EL BUCLE DE 1530x702. A 360x560 el cuerpo tiene que pasar a «justo», que es el camino que
   se había roto: el guard lo comprueba para que la prueba no salga verde sin recorrerlo. */
for (const [ancho, alto, justo] of [[1530, 702, null], [1280, 560, null], [360, 560, true]]) {
  test(`el runner abre sin errores a ${ancho}x${alto}`, async ({ page, context }) => {
    const errores = capturarErrores(page);
    await page.setViewportSize({ width: ancho, height: alto });
    await sembrar(context);
    await irAlArtefacto(page);
    await abrirRutina(page, 'Mueve', 'Flexiones de escritorio');
    await page.waitForTimeout(1200);
    await expect(page.locator('[data-pace-v1-body]')).toBeVisible();
    if (justo) {
      await expect(page.locator('[data-pace-v1-raiz][data-pace-v1-justo]'),
        'a esta altura el cuerpo no pasa a «justo»: la prueba no recorre el camino que se rompió').toHaveCount(1);
    }
    await mando(page).getByRole('button', { name: 'Empezar ya' }).click();
    await page.waitForTimeout(800);
    await expect(page.locator('[data-pace-v1-body]')).toBeVisible();
    expect(errores).toEqual([]);
  });
}
