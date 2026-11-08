/* PACE · los botones de Hidrátate no parten su texto
 * ===================================================
 * A 360×718, el móvil de Ez, «Un vaso menos» y «Un vaso más» sumaban 308 px en una
 * fila de 286 con el relleno de `Button` md, y los dos textos salían en dos
 * líneas con el signo colgando a un lado (en inglés, igual). En el móvil el relleno
 * baja a 12 px y caben en una fila; más estrecho, el segundo baja entero. El
 * escritorio no cambia.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

/* Cuántas líneas ocupa el texto de cada botón, dónde empieza cada uno y su relleno. */
async function medirBotones(page) {
  await page.getByRole('button', { name: /Hidrátate|Hydrate/ }).first().click();
  /* Se buscan por su texto y no por `data-pace-hidr-acciones`, para que la prueba
     mida lo mismo contra la versión de antes del arreglo. */
  const menos = page.getByRole('button', { name: /Un vaso menos|One less glass/ });
  await menos.waitFor({ state: 'visible' });
  await page.waitForTimeout(400);   // la entrada del modal escala la caja
  return menos.evaluate(el => [...el.parentElement.querySelectorAll('button')].map(b => {
    const texto = [...b.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    const rango = document.createRange();
    rango.selectNodeContents(texto);
    return {
      texto: texto.textContent.trim(),
      lineas: new Set([...rango.getClientRects()].map(r => Math.round(r.top))).size,
      top: Math.round(b.getBoundingClientRect().top),
      relleno: getComputedStyle(b).paddingLeft,
    };
  }));
}

for (const lang of ['es', 'en']) {
  test(`a 360 px los dos botones van en una fila y su texto en una línea (${lang})`, async ({ page, context }) => {
    await page.setViewportSize({ width: 360, height: 718 });
    await sembrar(context, { lang });
    await irAlArtefacto(page);
    const [menos, mas] = await medirBotones(page);
    expect(menos.lineas, menos.texto).toBe(1);
    expect(mas.lineas, mas.texto).toBe(1);
    expect(mas.top, 'el segundo botón bajó de fila').toBe(menos.top);
  });
}

test('a 320 px el texto sigue entero: lo que baja es el botón', async ({ page, context }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await sembrar(context);
  await irAlArtefacto(page);
  const botones = await medirBotones(page);
  botones.forEach(b => expect(b.lineas, b.texto).toBe(1));
});

test('en escritorio el relleno sigue siendo el de Button md', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const botones = await medirBotones(page);
  botones.forEach(b => {
    expect(b.relleno).toBe('22px');
    expect(b.lineas, b.texto).toBe(1);
  });
});

/* Al apartar el ratón, «Un vaso más» vuelve a su azul. El botón pinta el fondo
   por `style` y, al salir, `Button` escribía el verde de Foco de su variante:
   se quedaba verde hasta reabrir Hidrátate (caza de bugs del 7 de octubre). */
test('«Un vaso más» recupera su color al apartar el ratón', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /Hidrátate/ }).first().click();
  const mas = page.getByRole('button', { name: /Un vaso más/ });
  await mas.waitFor({ state: 'visible' });
  await page.waitForTimeout(400);
  const fondo = () => mas.evaluate(el => getComputedStyle(el).backgroundColor);
  const antes = await fondo();
  await mas.hover();
  await page.mouse.move(2, 2);
  /* La transición del botón dura 180 ms. */
  await expect.poll(fondo, { timeout: 2000 }).toBe(antes);
});

/* LOS VASOS TIENEN NOMBRE (Ez, 5A del 7 nov. 2026): el lector de pantalla decía «1», «2»… Ahora
   «Vaso 3 de 8», y lo que se ve sigue siendo el número. */
for (const [lang, nombre] of [['es', 'Vaso 3 de 8'], ['en', 'Glass 3 of 8']]) {
  test(`cada vaso se anuncia con su nombre y se sigue viendo su número · ${lang}`, async ({ page, context }) => {
    await sembrar(context, { lang });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: /^(Hidrátate|Hydrate)/ }).first().click();
    const vaso = page.locator('[data-pace-modal-card]').getByRole('button', { name: nombre, exact: true });
    await expect(vaso).toHaveCount(1);
    await expect(vaso).toHaveText('3');
    await expect(page.locator('[data-pace-modal-card]').getByRole('button', { name: /^(Vaso|Glass) \d+ (de|of) 8$/ })).toHaveCount(8);
  });
}
