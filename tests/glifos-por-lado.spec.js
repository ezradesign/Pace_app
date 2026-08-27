/* PACE · E2E · EL GLIFO POR LADOS (s172)
 * ======================================
 * 15 ejercicios del catálogo se ejecutan POR LADOS y la app los anuncia por su
 * nombre («Empiezas por: Izquierda» → «Ahora: Derecha»). Hasta hoy el dibujo era
 * el mismo en los dos, así que media ejecución enseñaba el lado contrario.
 *
 * LA DECISIÓN, y por qué no hacen falta 15 dibujos más: los 15 son espejo puro
 * (§3 del encargo) y el set entero comparte convención —«perfil mirando a la
 * derecha» (§1)—, así que el segundo lado es un `scaleX(-1)` sobre la pieza.
 * Una decisión global (el dibujo tal cual es «Izquierda») en vez de 15 encargos.
 *
 * LO QUE ESTO NO PRUEBA, y está dicho: que el lado dibujado sea el
 * anatómicamente correcto. En una figura de perfil eso no es legible ni con un
 * dibujo propio — el límite es la vista, no el número de piezas. Lo que se
 * defiende aquí es que CAMBIA, que cambia en el momento correcto y que no
 * cambia donde no toca.
 *
 * SÓLO 12 DE LOS 15 PUEDEN RECIBIR LADO, y también está medido: `90/90`,
 * `Elevación de talones` y `Sentadilla búlgara` no tienen ni un paso
 * `mode:'perSide'` en ningún catálogo (su lado vive en el cue), así que el
 * runner no tiene lado que pasarles. Eso es trabajo de contenido, no de arte.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

/* La matriz de `transform` computada: `matrix(-1, 0, 0, 1, 0, 0)` es el espejo.
   Se lee del COMPUTADO y no del atributo de estilo: lo que importa es lo que el
   navegador pinta (trampa de s159 con los tokens). */
async function espejado(sesion) {
  const glifo = sesion.locator('[data-pace-v1-glyph] > div > *').first();
  const t = await glifo.evaluate(el => getComputedStyle(el).transform);
  if (t === 'none') return false;
  return /^matrix\(-1,/.test(t.replace(/\s/g, ''));
}

test('el glifo se espeja al cambiar de lado, y sólo en los pasos por lados', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install();
  await irAlArtefacto(page);

  /* «Cuello» (s174: se le quitó la coletilla «· 3 min», que repetía lo que la
     tarjeta ya dice) empieza con un paso de reps y sigue con tres `perSide`, así
     que se llega al primero con un solo «Terminar antes». */
  await page.getByRole('button', { name: /^Estira/ }).click();
  await page.getByRole('heading', { name: 'Cuello', exact: true }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toHaveCount(1);
  const tic = async n => { for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(8); } };

  /* Paso 0 — reps, NO es por lados: aquí el glifo no puede estar espejado. */
  let enReps = false;
  for (let i = 0; i < 40 && !enReps; i++) {
    enReps = await sesion.getByRole('button', { name: /Terminar antes/ }).count() > 0;
    if (!enReps) await tic(1);
  }
  expect(enReps, 'GUARD: la sesión nunca entró en el primer paso').toBe(true);
  expect(await espejado(sesion), 'un paso que NO es por lados no debe espejarse').toBe(false);

  await sesion.getByRole('button', { name: /Terminar antes/ }).click();
  await page.waitForTimeout(200);

  /* Paso 1 — «Inclinación lateral», `perSide`. Primer lado: sin espejo. */
  let porLados = false;
  for (let i = 0; i < 30 && !porLados; i++) {
    const n = await sesion.locator('[data-pace-v1-name]').innerText().catch(() => '');
    porLados = /inclinaci/i.test(n);
    if (!porLados) await tic(1);
  }
  expect(porLados, 'GUARD: no se llegó al paso por lados').toBe(true);
  /* Se espera al TRABAJO: durante la colocación el paso ya es perSide y el lado
     sigue siendo el primero, pero el aserto que interesa es el del trabajo. */
  for (let i = 0; i < 15; i++) {
    if (await sesion.locator('[data-pace-v1-timer]').isVisible().catch(() => false)) break;
    await tic(1);
  }
  expect(await espejado(sesion), 'el primer lado es el dibujo tal cual, sin espejo').toBe(false);

  /* Los 25 s del primer lado llevan a la TRANSICIÓN, que ya anuncia el lado que
     entra: ahí el dibujo tiene que haberse dado la vuelta YA. */
  let enCambio = false;
  for (let i = 0; i < 60 && !enCambio; i++) {
    await tic(1);
    enCambio = await sesion.locator('[data-pace-v1-support-strong]').isVisible().catch(() => false)
      && /ahora/i.test(await sesion.locator('[data-pace-v1-support-strong]').innerText().catch(() => ''));
  }
  expect(enCambio, 'GUARD: no se llegó a la transición de lado').toBe(true);
  expect(await espejado(sesion),
    'la pantalla anuncia el otro lado y el dibujo sigue mirando al primero').toBe(true);

  /* Y el segundo lado, ya en trabajo, lo mantiene. */
  for (let i = 0; i < 20; i++) {
    await tic(1);
    if (await sesion.locator('[data-pace-v1-timer]').isVisible().catch(() => false)
        && !(await sesion.locator('[data-pace-v1-support-strong]').isVisible().catch(() => false))) break;
  }
  expect(await espejado(sesion), 'el segundo lado se pinta espejado').toBe(true);

  expect(errores).toEqual([]);
});

test('la política del lado, caso a caso', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  /* `v1LadoGlifo` es PURA y vive en el support justo para poder preguntarle esto
     sin montar una sesión: cada rama de la decisión tiene aquí su caso. No puede
     pasar en vacío — si la función no existiera, el evaluate reventaría. */
  const casos = await page.evaluate(() => {
    const f = window.v1LadoGlifo;
    return {
      ladoUno:        f({ mode: 'perSide' }, 'work', 0),
      ladoDos:        f({ mode: 'perSide' }, 'work', 1),
      transicion:     f({ mode: 'perSide' }, 'change', 0),
      colocandose:    f({ mode: 'perSide' }, 'place', 0),
      pasoNormal:     f({ mode: 'timed' }, 'work', 1),
      reps:           f({ mode: 'reps' }, 'work', 1),
      descanso:       f({ mode: 'rest' }, 'work', 1),
      sinPaso:        f(null, 'work', 1),
    };
  });
  /* La transición se ADELANTA al lado que entra: la pantalla ya lo anuncia. Y un
     paso que no es por lados nunca se espeja, aunque `side` traiga basura. */
  expect(casos).toEqual({
    ladoUno: 0, ladoDos: 1, transicion: 1, colocandose: 0,
    pasoNormal: 0, reps: 0, descanso: 0, sinPaso: 0,
  });
  expect(errores).toEqual([]);
});
