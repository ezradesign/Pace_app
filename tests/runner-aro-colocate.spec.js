/* PACE · tests/runner-aro-colocate.spec.js
   ========================================
   EL ARO DEL DIBUJO SE QUEDA VACÍO MIENTRAS TE COLOCAS Y AL CAMBIAR DE LADO.
   Ez lo vio en «Escritorio express», paso 2 de 6: durante «Colócate» el aro se iba dibujando
   como si el ejercicio ya corriera, y al empezar se vaciaba de golpe y volvía a empezar. Pidió
   (8 de octubre, opción A): «mejor es vacío ya que no ha empezado el ejercicio», y lo mismo en la
   pausa de «Cambia de lado».

   Lo que defiende cada prueba:
     · en «Colócate» el arco mide 0 y no se pinta, también después de «+15 s»; al empezar el
       ejercicio el aro vuelve a avanzar (que el arreglo no apague el aro para siempre);
     · en «Cambia de lado» el arco mide 0 y no se pinta.
   Se mide pasado más de un segundo de cuenta: con el código de antes el arco ya iba por el 20 %
   (colocarse, 5 s) o el 10 % (cambio de lado, 10 s).
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior } = require('./helpers');

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

const fase = (page) => page.locator('[data-pace-v1-raiz]').first().getAttribute('data-pace-v1-fase');
const siguiente = (page) => page.locator('[data-pace-v1-mando] button').nth(2).click();

/* Lo que el aro enseña: el largo pedido al arco (0-100) y su opacidad computada. */
function leerArco(page) {
  return page.evaluate(() => {
    const arco = [...document.querySelectorAll('[data-pace-v1-aro] .pace-v1-aro-arco')]
      .find(e => e.getBoundingClientRect().width > 0);
    if (!arco) return null;
    return {
      largo: parseFloat(arco.style.strokeDasharray) || 0,
      opacidad: parseFloat(getComputedStyle(arco).opacity),
    };
  });
}

test('en «Colócate» el aro se queda vacío, y avanza cuando empieza el ejercicio', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirRutina(page, 'Estira', 'Escritorio express');
  await siguiente(page);                       // paso 2, «Círculos de muñeca», con colocación de 5 s
  await expect.poll(() => fase(page)).toBe('place');
  await page.waitForTimeout(2200);
  expect(await fase(page), 'sigue colocándose').toBe('place');
  expect(await leerArco(page)).toEqual({ largo: 0, opacidad: 0 });

  await page.getByRole('button', { name: '+15 s' }).click();
  await page.waitForTimeout(1200);
  expect(await leerArco(page), 'con +15 s tampoco se dibuja').toEqual({ largo: 0, opacidad: 0 });

  await siguiente(page);                       // «Empezar ya»: arranca el ejercicio
  await expect.poll(() => fase(page)).toBe('work');
  await expect.poll(async () => (await leerArco(page)).largo, { timeout: 5000 }).toBeGreaterThan(0);
  expect((await leerArco(page)).opacidad, 'en el ejercicio el aro se ve').toBe(1);
  expect(errores).toEqual([]);
});

test('en «Cambia de lado» el aro se queda vacío', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirRutina(page, 'Estira', 'Antídoto silla');
  await siguiente(page);                       // paso 2, «Rotación torácica», por lados
  await expect.poll(() => fase(page)).toBe('place');
  await siguiente(page);                       // empieza el primer lado
  await expect.poll(() => fase(page)).toBe('work');
  await siguiente(page);                       // fin del primer lado → cambio de lado (10 s)
  await expect.poll(() => fase(page)).toBe('change');
  await page.waitForTimeout(2200);
  expect(await fase(page)).toBe('change');
  expect(await leerArco(page)).toEqual({ largo: 0, opacidad: 0 });
  expect(errores).toEqual([]);
});
